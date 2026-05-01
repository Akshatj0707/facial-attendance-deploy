const express    = require('express');
const Student    = require('../models/Student');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET all students (admin, hod, faculty)
router.get('/', authorize('admin','hod','faculty'), async (req, res) => {
  try {
    const { department, bioStatus, search, limit=50, page=1 } = req.query;
    const query = {};
    if (department && department !== 'all') query.department = department;
    if (bioStatus  && bioStatus  !== 'all') query.bioStatus  = bioStatus;
    if (search) query.$or = [
      { name:      { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
    ];
    // HoD can only see their department
    if (req.user.role === 'hod') query.department = req.user.department;

    const total   = await Student.countDocuments(query);
    const students= await Student.find(query)
      .sort({ name: 1 })
      .limit(+limit)
      .skip((+page - 1) * +limit);
    res.json({ success: true, data: { rows: students, total, page: +page } });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({ $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { studentId: req.params.id }] });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    // Student can only see own record
    if (req.user.role === 'student' && student.userId?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: 'Forbidden' });
    res.json({ success: true, data: student });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

// POST create student (admin, hod)
router.post('/', authorize('admin','hod'), async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch(e) {
    if (e.code === 11000) return res.status(400).json({ success: false, error: 'Student ID already exists' });
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT update student (admin, hod)
router.put('/:id', authorize('admin','hod'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    res.json({ success: true, data: student });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

// DELETE student (admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    res.json({ success: true, data: { deleted: true } });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
