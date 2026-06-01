const express = require("express");
const jwt     = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User    = require("../models/User");
const Student = require("../models/Student");
const { protect, authorize } = require("../middleware/auth");
const router   = express.Router();
const genToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn:"7d" });
const safe     = u => ({ _id:u._id, name:u.name, email:u.email, role:u.role,
  department:u.department, avatar:u.avatar, studentId:u.studentId,
  employeeId:u.employeeId, isVerified:u.isVerified, isActive:u.isActive });

router.post("/register", [
  body("name").trim().notEmpty(), body("email").isEmail(),
  body("password").isLength({ min:6 }), body("role").isIn(["admin","hod","faculty","student"]),
], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ success:false, errors:errs.array() });
  const { name, email, password, role, department="", studentId="", employeeId="", phone="" } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ success:false, error:"Email already registered" });
    const isVerified = role !== "student";
    const user = await User.create({ name, email, password, role, department, studentId, employeeId, phone, isVerified });
    if (role === "student" && studentId) {
      await Student.findOneAndUpdate({ studentId:studentId.toUpperCase() },
        { name, email, department, userId:user._id, isVerified:false, bioStatus:"Pending" },
        { upsert:true, new:true });
    }
    res.status(201).json({ success:true, data:{ ...safe(user), token:genToken(user._id) } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.post("/login", [ body("email").isEmail(), body("password").notEmpty() ], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ success:false, errors:errs.array() });
  try {
    const user = await User.findOne({ email:req.body.email }).select("+password");
    if (!user || !(await user.matchPassword(req.body.password)))
      return res.status(401).json({ success:false, error:"Invalid email or password" });
    if (!user.isActive) return res.status(401).json({ success:false, error:"Account disabled" });
    const warnings = [];
    if (user.role === "student" && !user.isVerified)
      warnings.push("Account pending verification by Admin or HoD");
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave:false });
    res.json({ success:true, data:{ ...safe(user), token:genToken(user._id) }, warnings });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.get("/me", protect, (req, res) => res.json({ success:true, data:req.user }));

router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new:true });
    res.json({ success:true, data:safe(user) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.put("/password", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(req.body.currentPassword)))
      return res.status(400).json({ success:false, error:"Current password incorrect" });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success:true, message:"Password updated" });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.get("/pending-students", protect, authorize("admin","hod"), async (req, res) => {
  try {
    const q = { role:"student", isVerified:false };
    if (req.user.role === "hod") q.department = req.user.department;
    res.json({ success:true, data:(await User.find(q).sort({ createdAt:-1 })).map(safe) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.put("/verify-student/:id", protect, authorize("admin","hod"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "student")
      return res.status(404).json({ success:false, error:"Student not found" });
    user.isVerified = true; user.verifiedBy = req.user._id; user.verifiedAt = new Date();
    await user.save({ validateBeforeSave:false });
    await Student.findOneAndUpdate(
      { $or:[{ userId:user._id },{ email:user.email }] },
      { isVerified:true, verifiedBy:req.user._id, verifiedAt:new Date() }
    );
    res.json({ success:true, message:`${user.name} verified successfully` });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.delete("/reject-student/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success:false, error:"Not found" });
    await Student.deleteOne({ $or:[{ userId:user._id },{ email:user.email }] });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:"Student rejected and removed" });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;