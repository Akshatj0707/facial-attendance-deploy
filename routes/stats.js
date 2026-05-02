const express  = require('express');
const { isMongoConnected, loadStore } = require('../config/store');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const deptFilter = (req.user.role==='hod'||req.user.role==='faculty') ? req.user.department : null;

    if (isMongoConnected()) {
      const Attendance=require('../models/Attendance'), Student=require('../models/Student');
      const today=new Date(); today.setHours(0,0,0,0);
      const tomorrow=new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
      const dq=deptFilter?{department:deptFilter}:{};
      const [totalStudents,presentToday,lateToday,departments,hourlyTrend,recentLogs]=await Promise.all([
        Student.countDocuments(dq),
        Attendance.distinct('student',{...dq,checkIn:{$gte:today,$lt:tomorrow},status:{$in:['Present','Late']}}).then(ids=>ids.length),
        Attendance.countDocuments({...dq,checkIn:{$gte:today,$lt:tomorrow},status:'Late'}),
        Student.aggregate([...(deptFilter?[{$match:{department:deptFilter}}]:[]),{$group:{_id:'$department',registered:{$sum:1}}},{$sort:{_id:1}}]),
        Attendance.aggregate([{$match:{...dq,checkIn:{$gte:today,$lt:tomorrow}}},{$group:{_id:{$hour:'$checkIn'},count:{$sum:1}}},{$sort:{_id:1}},{$project:{hour:'$_id',count:1,_id:0}}]),
        Attendance.find(dq).populate('student','name avatar studentId department course').sort({checkIn:-1}).limit(10),
      ]);
      const presentByDept=await Attendance.aggregate([{$match:{checkIn:{$gte:today,$lt:tomorrow},status:{$in:['Present','Late']}}},{$group:{_id:'$department',present:{$addToSet:'$student'}}},{$project:{department:'$_id',present:{$size:'$present'},_id:0}}]);
      const pMap=Object.fromEntries(presentByDept.map(d=>[d.department,d.present]));
      return res.json({success:true,data:{totalStudents,presentToday,lateToday,onlineTerminals:5,hourlyTrend,recentLogs,departments:departments.map(d=>({department:d._id,registered:d.registered,present:pMap[d._id]||0}))}});
    }

    // JSON path
    const store = loadStore();
    const today = new Date().toISOString().split('T')[0];
    let students   = store.students;
    let attendance = store.attendance;
    if (deptFilter) { students=students.filter(s=>s.department===deptFilter); attendance=attendance.filter(a=>a.department===deptFilter); }

    const todayRecs   = attendance.filter(a=>a.checkIn?.startsWith(today));
    const presentIds  = [...new Set(todayRecs.filter(a=>a.status!=='Absent').map(a=>a.student?._id))];
    const lateToday   = todayRecs.filter(a=>a.status==='Late').length;

    const hourMap={};
    todayRecs.forEach(a=>{const h=a.checkIn?.slice(11,13)||'00';hourMap[h]=(hourMap[h]||0)+1;});
    const hourlyTrend=Object.entries(hourMap).sort().map(([hour,count])=>({hour,count}));

    const deptMap={};
    students.forEach(s=>{
      if(!deptMap[s.department])deptMap[s.department]={department:s.department,registered:0,present:0};
      deptMap[s.department].registered++;
      if(presentIds.includes(s._id))deptMap[s.department].present++;
    });

    const recentLogs=[...attendance].sort((a,b)=>(b.checkIn||'').localeCompare(a.checkIn||'')).slice(0,10);

    res.json({success:true,data:{
      totalStudents:students.length, presentToday:presentIds.length,
      lateToday, onlineTerminals:5, hourlyTrend, recentLogs,
      departments:Object.values(deptMap).sort((a,b)=>a.department.localeCompare(b.department))
    }});
  } catch(e) { res.status(500).json({success:false,error:e.message}); }
});

module.exports = router;
