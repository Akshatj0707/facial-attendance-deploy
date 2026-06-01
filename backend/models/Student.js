const mongoose = require("mongoose");
const s = new mongoose.Schema({
  studentId:  { type:String, required:true, unique:true, uppercase:true },
  name:       { type:String, required:true },
  email:      { type:String, required:true, unique:true, lowercase:true },
  department: { type:String, required:true },
  course:     { type:String, default:"" },
  year:       { type:Number, default:1 },
  phone:      { type:String, default:"" },
  address:    { type:String, default:"" },
  avatar:     { type:String, default:"" },
  userId:     { type:mongoose.Schema.Types.ObjectId, ref:"User" },
  isVerified: { type:Boolean, default:false },
  verifiedBy: { type:mongoose.Schema.Types.ObjectId, ref:"User" },
  verifiedAt: Date, addedBy: { type:mongoose.Schema.Types.ObjectId, ref:"User" },
  bioStatus:  { type:String, enum:["Pending","Enrolled","Failed"], default:"Pending" },
  faceData: {
    samples: [String], enrolledAt: Date,
    enrolledBy: { type:mongoose.Schema.Types.ObjectId, ref:"User" },
    sampleCount: { type:Number, default:0 }, descriptor: [Number],
  },
}, { timestamps:true });
s.pre("save", function(next) {
  if (!this.avatar) this.avatar = this.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  next();
});
module.exports = mongoose.model("Student", s);