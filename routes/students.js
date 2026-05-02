const express  = require('express');
const { isMongoConnected, loadStore, saveStore, nextId, now } = require('../config/store');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

router.get('/', authorize('admin','hod','faculty'), async (req, res) => {
  try {
    const { department, bioStatus, search, limit=50, page=1 } = req.query;
    if (isMongoConnected()) {
      const Student = require('../models/Student');
      const q = {};
      if (department && department !== 'all') q.department = department;
      if (bioStatus  && bioStatus  !== 'all') q.bioStatus  = bioStatus;
      if (req.user.role === 'hod') q.department = req.user.department;
      if (search) q.$or = [{ name:{$regex:search,$options:'i'} },{ studentId:{$regex:search,$options:'i'} }];
      const total = await Student.countDocuments(q);
      const rows  = await Student.find(q).sort({name:1}).limit(+limit).skip((+page-1)*+limit);
      return res.json({ success:true, data:{ rows, total } });
    }
    // JSON path
    let rows = [...loadStore().students];
    if (department && department !== 'all') rows = rows.filter(s => s.department === department);
    if (bioStatus  && bioStatus  !== 'all') rows = rows.filter(s => s.bioStatus  === bioStatus);
    if (req.user.role === 'hod') rows = rows.filter(s => s.department === req.user.department);
    if (search) { const q=search.toLowerCase(); rows=rows.filter(s=>s.name.toLowerCase().includes(q)||s.studentId.toLowerCase().includes(q)); }
    rows.sort((a,b)=>a.name.localeCompare(b.name));
    res.json({ success:true, data:{ rows: rows.slice((+page-1)*+limit, +page*+limit), total:rows.length } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const Student = require('../models/Student');
      const s = await Student.findOne({ $or:[{_id:req.params.id},{studentId:req.params.id}] });
      if (!s) return res.status(404).json({ success:false, error:'Not found' });
      return res.json({ success:true, data:s });
    }
    const s = loadStore().students.find(s => s._id===req.params.id || s.studentId===req.params.id);
    if (!s) return res.status(404).json({ success:false, error:'Not found' });
    res.json({ success:true, data:s });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.post('/', authorize('admin','hod'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const Student = require('../models/Student');
      const s = await Student.create(req.body);
      return res.status(201).json({ success:true, data:s });
    }
    const store = loadStore();
    if (store.students.find(s=>s.studentId===req.body.studentId))
      return res.status(400).json({ success:false, error:'Student ID already exists' });
    const avatar = req.body.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'ST';
    const s = { _id:'s'+nextId('s'), avatar, ...req.body, createdAt:now() };
    store.students.push(s); saveStore();
    res.status(201).json({ success:true, data:s });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.put('/:id', authorize('admin','hod'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const Student = require('../models/Student');
      const s = await Student.findByIdAndUpdate(req.params.id, req.body, {new:true});
      if (!s) return res.status(404).json({ success:false, error:'Not found' });
      return res.json({ success:true, data:s });
    }
    const store = loadStore();
    const s = store.students.find(s=>s._id===req.params.id);
    if (!s) return res.status(404).json({ success:false, error:'Not found' });
    Object.assign(s, req.body); saveStore();
    res.json({ success:true, data:s });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const Student = require('../models/Student');
      const s = await Student.findByIdAndDelete(req.params.id);
      if (!s) return res.status(404).json({ success:false, error:'Not found' });
      return res.json({ success:true, data:{deleted:true} });
    }
    const store = loadStore();
    const i = store.students.findIndex(s=>s._id===req.params.id);
    if (i===-1) return res.status(404).json({ success:false, error:'Not found' });
    store.students.splice(i,1); saveStore();
    res.json({ success:true, data:{deleted:true} });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;
