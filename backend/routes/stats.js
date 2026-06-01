const express    = require("express");
const Attendance = require("../models/Attendance");
const Student    = require("../models/Student");
const User       = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const statsRouter = express.Router();
statsRouter.use(protect);

statsRouter.get("/", async (req, res) => {
  try {
    const today=new Date(); today.setHours(0,0,0,0);
    const tomorrow=new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const dq={};
    if (req.user.role==="hod"||req.user.role==="faculty") dq.department=req.user.department;
    const [totalStudents,faceEnrolled,pendingVerification,presentToday,lateToday,departments,hourlyTrend,recentLogs,userCounts]=await Promise.all([
      Student.countDocuments({ ...dq,isVerified:true }),
      Student.countDocuments({ ...dq,bioStatus:"Enrolled",isVerified:true }),
      Student.countDocuments({ ...dq,isVerified:false }),
      Attendance.distinct("student",{ ...dq,checkIn:{ $gte:today,$lt:tomorrow },status:{ $in:["Present","Late"] } }).then(ids=>ids.length),
      Attendance.countDocuments({ ...dq,checkIn:{ $gte:today,$lt:tomorrow },status:"Late" }),
      Student.aggregate([...(dq.department?[{ $match:{ department:dq.department } }]:[]),{ $match:{ isVerified:true } },{ $group:{ _id:"$department",total:{ $sum:1 },enrolled:{ $sum:{ $cond:[{ $eq:["$bioStatus","Enrolled"] },1,0] } } } },{ $sort:{ _id:1 } }]),
      Attendance.aggregate([{ $match:{ ...dq,checkIn:{ $gte:today,$lt:tomorrow } } },{ $group:{ _id:{ $hour:"$checkIn" },count:{ $sum:1 } } },{ $sort:{ _id:1 } },{ $project:{ hour:"$_id",count:1,_id:0 } }]),
      Attendance.find(dq).populate("student","name avatar studentId department course").populate("markedBy","name role").sort({ checkIn:-1 }).limit(12),
      req.user.role==="admin"?User.aggregate([{ $group:{ _id:"$role",count:{ $sum:1 } } }]):Promise.resolve([]),
    ]);
    const pbyd=await Attendance.aggregate([{ $match:{ checkIn:{ $gte:today,$lt:tomorrow },status:{ $in:["Present","Late"] } } },{ $group:{ _id:"$department",present:{ $addToSet:"$student" } } },{ $project:{ dept:"$_id",present:{ $size:"$present" },_id:0 } }]);
    const pmap=Object.fromEntries(pbyd.map(d=>[d.dept,d.present]));
    res.json({ success:true, data:{ totalStudents,faceEnrolled,pendingVerification,presentToday,lateToday,onlineTerminals:5,hourlyTrend,recentLogs,departments:departments.map(d=>({ department:d._id,total:d.total,enrolled:d.enrolled,present:pmap[d._id]||0 })),userCounts:Object.fromEntries(userCounts.map(u=>[u._id,u.count])) }});
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

const usersRouter = express.Router();
usersRouter.use(protect, authorize("admin"));
usersRouter.get("/", async (req, res) => {
  try {
    const { role, department, search } = req.query;
    const q={};
    if (role&&role!=="all") q.role=role;
    if (department&&department!=="all") q.department=department;
    if (search) q.$or=[{ name:{ $regex:search,$options:"i" }},{ email:{ $regex:search,$options:"i" }}];
    res.json({ success:true, data:await User.find(q).sort({ createdAt:-1 }) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});
usersRouter.put("/:id/toggle", async (req, res) => {
  try {
    const u=await User.findById(req.params.id); if(!u) return res.status(404).json({ success:false, error:"Not found" });
    u.isActive=!u.isActive; await u.save({ validateBeforeSave:false });
    res.json({ success:true, data:{ isActive:u.isActive } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});
usersRouter.delete("/:id", async (req, res) => {
  try {
    if (req.params.id===req.user._id.toString()) return res.status(400).json({ success:false, error:"Cannot delete yourself" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success:true, data:{ deleted:true } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});
module.exports = { statsRouter, usersRouter };