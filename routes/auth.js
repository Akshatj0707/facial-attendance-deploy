const express = require('express');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User    = require('../models/User');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

const router = express.Router();

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('role').isIn(['admin','hod','faculty','student']).withMessage('Invalid role'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password, role, department, studentId, employeeId, phone } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, error: 'Email already registered' });

    const user = await User.create({ name, email, password, role, department: department||'', studentId: studentId||'', employeeId: employeeId||'', phone: phone||'' });

    // If student role — also create Student record
    if (role === 'student' && studentId) {
      await Student.findOneAndUpdate(
        { studentId },
        { name, email, department: department||'', userId: user._id, bioStatus: 'Pending' },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, department: user.department, avatar: user.avatar,
        token: genToken(user._id)
      }
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, error: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(401).json({ success: false, error: 'Account disabled. Contact admin.' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, department: user.department,
        avatar: user.avatar, studentId: user.studentId,
        employeeId: user.employeeId,
        token: genToken(user._id)
      }
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  const { name, phone, department } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, department },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, data: user });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── PUT /api/auth/password ────────────────────────────────────────────────────
router.put('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ success: false, error: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
