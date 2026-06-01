const express  = require("express");
const Student  = require("../models/Student");
const User     = require("../models/User");
const { protect, authorize, faceEnrollAuth } = require("../middleware/auth");
const router = express.Router();
router.use(protect);

router.get("/", authorize("admin","hod","faculty"), async (req, res) => {
  try {
    const { department, bioStatus, search, verified, limit=50, page=1 } = req.query;
    const q = {};
    if (req.user.role==="hod") q.department = req.user.department;
    else if (department && department!=="all") q.department = department;
    if (bioStatus && bioStatus!=="all") q.bioStatus = bioStatus;
    if (verified !== undefined) q.isVerified = verified==="true";
    if (search) q.$or=[{ name:{ $regex:search,$options:"i" }},{ studentId:{ $regex:search,$options:"i" }}];
    const total = await Student.countDocuments(q);
    const rows  = await Student.find(q)
      .populate("verifiedBy","name role").populate("faceData.enrolledBy","name role")
      .sort({ name:1 }).limit(+limit).skip((+page-1)*+limit);
    res.json({ success:true, data:{ rows, total, page:+page } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const s = await Student.findOne({ $or:[{ _id:req.params.id },{ studentId:req.params.id }] })
      .populate("verifiedBy","name role").populate("faceData.enrolledBy","name role");
    if (!s) return res.status(404).json({ success:false, error:"Not found" });
    if (req.user.role==="student") {
      const mine = await Student.findOne({ userId:req.user._id });
      if (!mine || mine._id.toString()!==s._id.toString())
        return res.status(403).json({ success:false, error:"Access denied" });
    }
    res.json({ success:true, data:s });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.post("/", authorize("admin","hod"), async (req, res) => {
  try {
    const { studentId, name, email, department, course, year, phone, address } = req.body;
    if (!studentId||!name||!email||!department)
      return res.status(400).json({ success:false, error:"studentId, name, email, department required" });
    if (req.user.role==="hod" && department!==req.user.department)
      return res.status(403).json({ success:false, error:"HoD can only add students to their own department" });
    const s = await Student.create({
      studentId:studentId.toUpperCase(), name, email, department,
      course:course||"", year:year||1, phone:phone||"", address:address||"",
      isVerified:true, verifiedBy:req.user._id, verifiedAt:new Date(), addedBy:req.user._id,
    });
    let u = await User.findOne({ email });
    if (!u) {
      u = await User.create({ name, email, password:`Student@${studentId.toUpperCase()}`,
        role:"student", department, studentId:studentId.toUpperCase(),
        isVerified:true, verifiedBy:req.user._id, verifiedAt:new Date() });
    }
    await Student.findByIdAndUpdate(s._id, { userId:u._id });
    res.status(201).json({ success:true, data:s,
      message:`Student added. Login: ${email} / Student@${studentId.toUpperCase()}` });
  } catch(e) {
    if (e.code===11000) return res.status(400).json({ success:false, error:"Student ID or Email already exists" });
    res.status(500).json({ success:false, error:e.message });
  }
});

router.put("/:id", authorize("admin","hod"), async (req, res) => {
  try {
    const s = await Student.findById(req.params.id);
    if (!s) return res.status(404).json({ success:false, error:"Not found" });
    if (req.user.role==="hod" && s.department!==req.user.department)
      return res.status(403).json({ success:false, error:"Access denied" });
    ["name","course","year","phone","address","bioStatus"].forEach(f => { if (req.body[f]!==undefined) s[f]=req.body[f]; });
    await s.save();
    res.json({ success:true, data:s });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.delete("/:id", authorize("admin"), async (req, res) => {
  try {
    const s = await Student.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ success:false, error:"Not found" });
    await User.findOneAndUpdate({ email:s.email }, { isActive:false });
    res.json({ success:true, data:{ deleted:true } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// Face enrollment — Admin + HoD CS only
router.post("/:id/enroll-face", faceEnrollAuth, async (req, res) => {
  try {
    const s = await Student.findById(req.params.id);
    if (!s) return res.status(404).json({ success:false, error:"Student not found" });
    if (req.user.role==="hod" && s.department!==req.user.department)
      return res.status(403).json({ success:false, error:"HoD can only enroll students in their department" });
    if (!s.isVerified)
      return res.status(400).json({ success:false, error:"Student must be verified before face enrollment" });
    const { samples, descriptor } = req.body;
    if (!samples||samples.length<3)
      return res.status(400).json({ success:false, error:"Minimum 3 face samples required" });
    s.faceData = { samples, enrolledAt:new Date(), enrolledBy:req.user._id, sampleCount:samples.length, descriptor:descriptor||[] };
    s.bioStatus = "Enrolled";
    await s.save();
    res.json({ success:true, data:{ bioStatus:"Enrolled", sampleCount:samples.length,
      enrolledBy:req.user.name, enrolledAt:s.faceData.enrolledAt, message:`Face enrolled for ${s.name}` } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.delete("/:id/enroll-face", faceEnrollAuth, async (req, res) => {
  try {
    const s = await Student.findById(req.params.id);
    if (!s) return res.status(404).json({ success:false, error:"Not found" });
    s.faceData = { samples:[], sampleCount:0, descriptor:[] };
    s.bioStatus = "Pending";
    await s.save();
    res.json({ success:true, message:`Face data removed for ${s.name}` });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.get("/enrolled/list", authorize("admin","hod","faculty"), async (req, res) => {
  try {
    const q = { bioStatus:"Enrolled", isVerified:true };
    if (req.user.role!=="admin") q.department = req.user.department;
    const students = await Student.find(q)
      .select("studentId name avatar department course bioStatus faceData.enrolledAt faceData.sampleCount faceData.enrolledBy")
      .populate("faceData.enrolledBy","name role");
    res.json({ success:true, data:students });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;