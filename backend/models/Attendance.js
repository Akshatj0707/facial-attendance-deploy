const mongoose = require("mongoose");
const s = new mongoose.Schema({
  student:    { type:mongoose.Schema.Types.ObjectId, ref:"Student", required:true },
  markedBy:   { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  department: { type:String, required:true },
  course:     { type:String, default:"" },
  terminal:   { type:String, default:"Main Terminal" },
  checkIn:    { type:Date, default:Date.now },
  status:     { type:String, enum:["Present","Late","Absent"], default:"Present" },
  method:     { type:String, enum:["face","manual","auto"], default:"face" },
  confidence: { type:Number, default:0.95 },
  verified:   { type:Boolean, default:true },
  notes:      { type:String, default:"" },
}, { timestamps:true });
s.index({ student:1, checkIn:-1 });
s.index({ department:1, checkIn:-1 });
module.exports = mongoose.model("Attendance", s);