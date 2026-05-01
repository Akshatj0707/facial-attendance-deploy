const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId:  { type: String, required: true, unique: true },
  name:       { type: String, required: true },
  email:      { type: String, required: true },
  department: { type: String, required: true },
  course:     { type: String, default: '' },
  year:       { type: Number, default: 1 },
  bioStatus:  { type: String, enum: ['Enrolled','Pending','Failed'], default: 'Pending' },
  avatar:     { type: String, default: '' },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone:      { type: String, default: '' },
  address:    { type: String, default: '' },
}, { timestamps: true });

studentSchema.pre('save', function(next) {
  if (!this.avatar) {
    this.avatar = this.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
