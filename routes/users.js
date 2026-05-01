const express = require('express');
const User    = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.use(authorize('admin'));

// GET all users
router.get('/', async (req, res) => {
  try {
    const { role, department, search } = req.query;
    const query = {};
    if (role       && role       !== 'all') query.role       = role;
    if (department && department !== 'all') query.department = department;
    if (search) query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

// PUT toggle active
router.put('/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, data: { isActive: user.isActive } });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, error: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: { deleted: true } });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
