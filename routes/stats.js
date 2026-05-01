const express    = require('express');
const Attendance = require('../models/Attendance');
const Student    = require('../models/Student');
const User       = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const deptFilter = {};
    if (req.user.role === 'hod' || req.user.role === 'faculty') {
      deptFilter.department = req.user.department;
    }

    const [totalStudents, presentToday, lateToday, departments, hourlyTrend, recentLogs, userCounts] = await Promise.all([
      Student.countDocuments(deptFilter),

      Attendance.distinct('student', { ...deptFilter, checkIn: { $gte: today, $lt: tomorrow }, status: { $in: ['Present','Late'] } })
        .then(ids => ids.length),

      Attendance.countDocuments({ ...deptFilter, checkIn: { $gte: today, $lt: tomorrow }, status: 'Late' }),

      Student.aggregate([
        ...(deptFilter.department ? [{ $match: { department: deptFilter.department } }] : []),
        { $group: { _id: '$department', registered: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),

      Attendance.aggregate([
        { $match: { ...deptFilter, checkIn: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: { $hour: '$checkIn' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { hour: '$_id', count: 1, _id: 0 } }
      ]),

      Attendance.find({ ...deptFilter })
        .populate('student', 'name avatar studentId department course')
        .sort({ checkIn: -1 })
        .limit(10),

      req.user.role === 'admin'
        ? User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
        : Promise.resolve([]),
    ]);

    // Department breakdown with present count
    const presentByDept = await Attendance.aggregate([
      { $match: { checkIn: { $gte: today, $lt: tomorrow }, status: { $in: ['Present','Late'] } } },
      { $group: { _id: '$department', present: { $addToSet: '$student' } } },
      { $project: { department: '$_id', present: { $size: '$present' }, _id: 0 } }
    ]);
    const presentMap = Object.fromEntries(presentByDept.map(d => [d.department, d.present]));

    const departmentsWithPresent = departments.map(d => ({
      department: d._id,
      registered: d.registered,
      present:    presentMap[d._id] || 0,
    }));

    res.json({
      success: true,
      data: {
        totalStudents,
        presentToday,
        lateToday,
        onlineTerminals: 5,
        hourlyTrend,
        departments: departmentsWithPresent,
        recentLogs,
        userCounts: Object.fromEntries(userCounts.map(u => [u._id, u.count])),
      }
    });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
