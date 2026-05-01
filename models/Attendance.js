const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  markedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: String, required: true },
  course:     { type: String, default: '' },
  terminal:   { type: String, default: 'Main Terminal' },
  checkIn:    { type: Date, default: Date.now },
  status:     { type: String, enum: ['Present','Late','Absent'], default: 'Present' },
  verified:   { type: Boolean, default: true },
  confidence: { type: Number, default: 0.95 },
  notes:      { type: String, default: '' },
}, { timestamps: true });

// Index for fast queries
attendanceSchema.index({ student: 1, checkIn: -1 });
attendanceSchema.index({ department: 1, checkIn: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
