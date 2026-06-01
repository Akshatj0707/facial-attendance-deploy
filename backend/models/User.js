const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const s = new mongoose.Schema({
  name:       { type:String, required:true, trim:true },
  email:      { type:String, required:true, unique:true, lowercase:true },
  password:   { type:String, required:true, minlength:6, select:false },
  role:       { type:String, enum:["admin","hod","faculty","student"], required:true },
  department: { type:String, default:"" },
  studentId:  { type:String, default:"" },
  employeeId: { type:String, default:"" },
  phone:      { type:String, default:"" },
  avatar:     { type:String, default:"" },
  isActive:   { type:Boolean, default:true },
  isVerified: { type:Boolean, default:false },
  verifiedBy: { type:mongoose.Schema.Types.ObjectId, ref:"User" },
  verifiedAt: Date, lastLogin: Date,
}, { timestamps:true });
s.pre("save", async function(next) {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
  if (!this.avatar) this.avatar = this.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  next();
});
s.methods.matchPassword = function(p) { return require("bcryptjs").compare(p, this.password); };
module.exports = mongoose.model("User", s);