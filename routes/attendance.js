const express  = require('express');
const { isMongoConnected, loadStore, saveStore, nextId, now } = require('../config/store');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { department, status, date, search, limit=50, page=1 } = req.query;
    if (isMongoConnected()) {
      const Attendance = require('../models/Attendance');
      const Student    = require('../models/Student');
      const q = {};
      if (department && department!=='all') q.department = department;
      if (status     && status    !=='all') q.status     = status;
      if (date) { const s=new Date(date); s.setHours(0,0,0,0); const e=new Date(date); e.setHours(23,59,59,999); q.checkIn={$gte:s,$lte:e}; }
      if (req.user.role==='hod'||req.user.role==='faculty') q.department=req.user.department;
      if (req.user.role==='student') { const st=await Student.findOne({userId:req.user._id}); if(st) q.student=st._id; }
      const total=await Attendance.countDocuments(q);
      let rows=await Attendance.find(q).populate('student','name studentId avatar department course').sort({checkIn:-1}).limit(+limit).skip((+page-1)*+limit);
      if (search) { const q2=search.toLowerCase(); rows=rows.filter(r=>r.student?.name?.toLowerCase().includes(q2)||r.student?.studentId?.toLowerCase().includes(q2)); }
      return res.json({ success:true, data:{rows,total} });
    }
    // JSON path
    const store = loadStore();
    let rows = [...store.attendance];
    if (department && department!=='all') rows=rows.filter(r=>r.department===department);
    if (status     && status    !=='all') rows=rows.filter(r=>r.status===status);
    if (date) rows=rows.filter(r=>r.checkIn?.startsWith(date));
    if (req.user.role==='hod'||req.user.role==='faculty') rows=rows.filter(r=>r.department===req.user.department);
    if (req.user.role==='student') {
      const st=store.students.find(s=>s.userId===req.user._id);
      if (st) rows=rows.filter(r=>r.student?._id===st._id);
    }
    if (search) { const q=search.toLowerCase(); rows=rows.filter(r=>(r.student?.name||'').toLowerCase().includes(q)||(r.student?.studentId||'').toLowerCase().includes(q)); }
    rows.sort((a,b)=>b.checkIn?.localeCompare(a.checkIn||'')||0);
    res.json({ success:true, data:{ rows:rows.slice((+page-1)*+limit,+page*+limit), total:rows.length } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.post('/', authorize('admin','hod','faculty'), async (req, res) => {
  try {
    const { studentId, status, course, terminal } = req.body;
    if (isMongoConnected()) {
      const Attendance=require('../models/Attendance'), Student=require('../models/Student');
      const s=await Student.findOne({$or:[{_id:studentId},{studentId}]});
      if(!s) return res.status(404).json({success:false,error:'Student not found'});
      const r=await Attendance.create({student:s._id,department:s.department,course:course||s.course,terminal:terminal||'Main Terminal',status:status||'Present',markedBy:req.user._id});
      return res.status(201).json({success:true,data:r});
    }
    const store=loadStore();
    const s=store.students.find(s=>s._id===studentId||s.studentId===studentId);
    if(!s) return res.status(404).json({success:false,error:'Student not found'});
    const r={_id:'a'+nextId('a'),student:{_id:s._id,name:s.name,studentId:s.studentId,avatar:s.avatar,department:s.department,course:s.course},department:s.department,course:course||s.course,terminal:terminal||'Main Terminal',checkIn:now(),status:status||'Present',verified:true,confidence:0.95,markedBy:{_id:req.user._id,name:req.user.name,role:req.user.role}};
    store.attendance.push(r); saveStore();
    res.status(201).json({success:true,data:r});
  } catch(e) { res.status(500).json({success:false,error:e.message}); }
});

router.delete('/:id', authorize('admin','hod'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const Attendance=require('../models/Attendance');
      const r=await Attendance.findByIdAndDelete(req.params.id);
      if(!r) return res.status(404).json({success:false,error:'Not found'});
      return res.json({success:true,data:{deleted:true}});
    }
    const store=loadStore();
    const i=store.attendance.findIndex(a=>a._id===req.params.id);
    if(i===-1) return res.status(404).json({success:false,error:'Not found'});
    store.attendance.splice(i,1); saveStore();
    res.json({success:true,data:{deleted:true}});
  } catch(e) { res.status(500).json({success:false,error:e.message}); }
});

router.post('/recognize', authorize('admin','hod','faculty'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const Attendance=require('../models/Attendance'), Student=require('../models/Student');
      const q={bioStatus:'Enrolled'};
      if(req.user.role!=='admin') q.department=req.user.department;
      const enrolled=await Student.find(q);
      if(!enrolled.length) return res.status(404).json({success:false,error:'No enrolled students'});
      const s=enrolled[Math.floor(Math.random()*enrolled.length)];
      const confidence=+(0.87+Math.random()*0.12).toFixed(2);
      const hour=new Date().getHours();
      const status=hour>=9&&Math.random()>0.75?'Late':'Present';
      const r=await Attendance.create({student:s._id,department:s.department,course:s.course,terminal:'Recognition Terminal',status,confidence,verified:true,markedBy:req.user._id});
      return res.json({success:true,data:{student:s,confidence,status,record:r,timestamp:new Date()}});
    }
    const store=loadStore();
    let enrolled=store.students.filter(s=>s.bioStatus==='Enrolled');
    if(req.user.role!=='admin') enrolled=enrolled.filter(s=>s.department===req.user.department);
    if(!enrolled.length) return res.status(404).json({success:false,error:'No enrolled students'});
    const s=enrolled[Math.floor(Math.random()*enrolled.length)];
    const confidence=+(0.87+Math.random()*0.12).toFixed(2);
    const hour=new Date().getHours();
    const status=hour>=9&&Math.random()>0.75?'Late':'Present';
    const r={_id:'a'+nextId('a'),student:{_id:s._id,name:s.name,studentId:s.studentId,avatar:s.avatar,department:s.department,course:s.course},department:s.department,course:s.course,terminal:'Recognition Terminal',checkIn:now(),status,verified:true,confidence,markedBy:{_id:req.user._id,name:req.user.name}};
    store.attendance.push(r); saveStore();
    res.json({success:true,data:{student:s,confidence,status,record:r,timestamp:now()}});
  } catch(e) { res.status(500).json({success:false,error:e.message}); }
});

module.exports = router;
