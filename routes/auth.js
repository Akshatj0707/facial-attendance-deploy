const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { isMongoConnected, loadStore, saveStore, nextId, now } = require('../config/store');
const { protect } = require('../middleware/auth');
const router   = express.Router();

const JWT_SECRET = () => process.env.JWT_SECRET || 'fas_dev_secret_change_in_prod';
const genToken   = (id) => jwt.sign({ id }, JWT_SECRET(), { expiresIn: '7d' });

// ── Helpers ───────────────────────────────────────────────────────────────────
function getUser(emailOrId) {
  if (isMongoConnected()) return null; // handled by mongoose route
  const store = loadStore();
  return store.users.find(u => u.email === emailOrId || u._id === emailOrId) || null;
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min:6 }),
  body('role').isIn(['admin','hod','faculty','student']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

  const { name, email, password, role, department='', studentId='', employeeId='', phone='' } = req.body;

  try {
    // MongoDB path
    if (isMongoConnected()) {
      const User    = require('../models/User');
      const Student = require('../models/Student');
      if (await User.findOne({ email }))
        return res.status(400).json({ success:false, error:'Email already registered' });
      const user = await User.create({ name, email, password, role, department, studentId, employeeId, phone });
      if (role === 'student' && studentId) {
        await Student.findOneAndUpdate({ studentId }, { name, email, department, userId:user._id, bioStatus:'Pending' }, { upsert:true, new:true });
      }
      return res.status(201).json({ success:true, data:{ _id:user._id, name:user.name, email:user.email, role:user.role, department:user.department, avatar:user.avatar, token:genToken(user._id) }});
    }

    // JSON path
    const store = loadStore();
    if (store.users.find(u => u.email === email))
      return res.status(400).json({ success:false, error:'Email already registered' });
    const avatar   = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const hashed   = await bcrypt.hash(password, 10);
    const id       = 'u' + nextId('u');
    const user     = { _id:id, name, email, password:hashed, role, department, studentId, employeeId, phone, avatar, isActive:true, createdAt:now() };
    store.users.push(user);
    if (role === 'student' && studentId) {
      const sId = 's' + nextId('s');
      store.students.push({ _id:sId, studentId, name, email, department, course:'', year:1, bioStatus:'Pending', avatar, userId:id });
    }
    saveStore();
    res.status(201).json({ success:true, data:{ _id:id, name, email, role, department, avatar, token:genToken(id) }});
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

  const { email, password } = req.body;
  try {
    // MongoDB path
    if (isMongoConnected()) {
      const User = require('../models/User');
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password)))
        return res.status(401).json({ success:false, error:'Invalid email or password' });
      if (!user.isActive) return res.status(401).json({ success:false, error:'Account disabled' });
      user.lastLogin = new Date(); await user.save({ validateBeforeSave:false });
      return res.json({ success:true, data:{ _id:user._id, name:user.name, email:user.email, role:user.role, department:user.department, avatar:user.avatar, studentId:user.studentId, employeeId:user.employeeId, token:genToken(user._id) }});
    }

    // JSON path
    const store = loadStore();
    const user  = store.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ success:false, error:'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success:false, error:'Invalid email or password' });
    if (!user.isActive) return res.status(401).json({ success:false, error:'Account disabled' });
    const { password:_, ...safe } = user;
    res.json({ success:true, data:{ ...safe, token:genToken(user._id) }});
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ success:true, data:req.user });
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const User = require('../models/User');
      const user = await User.findByIdAndUpdate(req.user._id, req.body, { new:true }).select('-password');
      return res.json({ success:true, data:user });
    }
    const store = loadStore();
    const u = store.users.find(u => u._id === req.user._id);
    if (u) { Object.assign(u, req.body); delete u.password; saveStore(); }
    res.json({ success:true, data:u });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;
