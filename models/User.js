const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true, minlength: 6 },
  role:       { type: String, enum: ['admin','hod','faculty','student'], default: 'student' },
  department: { type: String, default: '' },
  studentId:  { type: String, default: '' },   // for students
  employeeId: { type: String, default: '' },   // for faculty/hod
  phone:      { type: String, default: '' },
  avatar:     { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  lastLogin:  { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

// Auto-generate avatar initials
userSchema.pre('save', function(next) {
  if (!this.avatar) {
    this.avatar = this.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
