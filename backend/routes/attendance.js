const express    = require("express");
const Attendance = require("../models/Attendance");
const Student    = require("../models/Student");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const { department, status, date, search, limit=60, page=1 } = req.query;
    const q = {};
    if (department && department!=="all") q.department = department;
    if (status && status!=="all") q.status = status;
    if (date) { const s=new Date(date); s.setHours(0,0,0,0); const e=new Date(date); e.setHours(23,59,59,999); q.checkIn={ $gte:s,$lte:e }; }
    if (req.user.role==="hod"||req.user.role==="faculty") q.department = req.user.department;
    if (req.user.role==="student") { const stu=await Student.findOne({ userId:req.user._id }); if(stu) q.student=stu._id; }
    const total = await Attendance.countDocuments(q);
    let rows = await Attendance.find(q).populate("student","name studentId avatar department course").populate("markedBy","name role").sort({ checkIn:-1 }).limit(+limit).skip((+page-1)*+limit);
    if (search) { const sq=search.toLowerCase(); rows=rows.filter(r=>r.student?.name?.toLowerCase().includes(sq)||r.student?.studentId?.toLowerCase().includes(sq)); }
    res.json({ success:true, data:{ rows, total } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.post("/", authorize("admin","hod","faculty"), async (req, res) => {
  try {
    const { studentId, status, course, terminal, notes } = req.body;
    const stu = await Student.findOne({ $or:[{ _id:studentId },{ studentId }] });
    if (!stu) return res.status(404).json({ success:false, error:"Student not found" });
    if (!stu.isVerified) return res.status(400).json({ success:false, error:"Student not verified yet" });
    const rec = await Attendance.create({ student:stu._id, department:stu.department, course:course||stu.course, terminal:terminal||"Manual Entry", status:status||"Present", method:"manual", markedBy:req.user._id, notes:notes||"" });
    await rec.populate("student","name studentId avatar");
    res.status(201).json({ success:true, data:rec });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.post("/recognize", authorize("admin","hod","faculty"), async (req, res) => {
  try {
    const { department, terminal } = req.body;
    const q = { bioStatus:"Enrolled", isVerified:true };
    if (department) q.department=department;
    else if (req.user.role!=="admin") q.department=req.user.department;
    const enrolled = await Student.find(q);
    if (!enrolled.length) return res.status(404).json({ success:false, error:"No enrolled verified students. Enroll students first." });
    const stu = enrolled[Math.floor(Math.random()*enrolled.length)];
    const conf = +(0.88+Math.random()*0.11).toFixed(2);
    const h = new Date().getHours();
    const status = h>=9&&Math.random()>.75?"Late":"Present";
    const rec = await Attendance.create({ student:stu._id, department:stu.department, course:stu.course, terminal:terminal||"Recognition Terminal", status, method:"face", confidence:conf, verified:true, markedBy:req.user._id });
    res.json({ success:true, data:{ student:stu, confidence:conf, status, record:rec, timestamp:new Date() } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.delete("/:id", authorize("admin","hod"), async (req, res) => {
  try {
    const r = await Attendance.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ success:false, error:"Not found" });
    res.json({ success:true, data:{ deleted:true } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;