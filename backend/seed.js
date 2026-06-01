require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("./models/User");
const Student  = require("./models/Student");
const Attendance = require("./models/Attendance");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  await Promise.all([User.deleteMany(), Student.deleteMany(), Attendance.deleteMany()]);
  const staff = await User.create([
    { name:"Super Admin",        email:"admin@college.edu",    password:"Admin@2024",    role:"admin",   department:"Administration",        employeeId:"ADM001", isVerified:true },
    { name:"Dr. Rahul Sharma",   email:"hod.cs@college.edu",   password:"HodCS@2024",    role:"hod",     department:"Computer Science",       employeeId:"HOD001", isVerified:true },
    { name:"Dr. Priya Patel",    email:"hod.ee@college.edu",   password:"HodEE@2024",    role:"hod",     department:"Electrical Engineering", employeeId:"HOD002", isVerified:true },
    { name:"Dr. Amit Kumar",     email:"hod.me@college.edu",   password:"HodME@2024",    role:"hod",     department:"Mechanical Engineering", employeeId:"HOD003", isVerified:true },
    { name:"Prof. Amit Verma",   email:"faculty1@college.edu", password:"Faculty@2024",  role:"faculty", department:"Computer Science",       employeeId:"FAC001", isVerified:true },
    { name:"Prof. Sneha Joshi",  email:"faculty2@college.edu", password:"Faculty@2024",  role:"faculty", department:"Electrical Engineering", employeeId:"FAC002", isVerified:true },
    { name:"Prof. Ravi Singh",   email:"faculty3@college.edu", password:"Faculty@2024",  role:"faculty", department:"Mechanical Engineering", employeeId:"FAC003", isVerified:true },
  ]);
  console.log(`Created ${staff.length} staff accounts`);
  console.log("\nLogin Credentials:");
  console.log("  Admin:     admin@college.edu      / Admin@2024");
  console.log("  HoD CS:    hod.cs@college.edu     / HodCS@2024");
  console.log("  HoD EE:    hod.ee@college.edu     / HodEE@2024");
  console.log("  HoD ME:    hod.me@college.edu     / HodME@2024");
  console.log("  Faculty 1: faculty1@college.edu   / Faculty@2024");
  console.log("  Faculty 2: faculty2@college.edu   / Faculty@2024");
  console.log("  Faculty 3: faculty3@college.edu   / Faculty@2024");
  console.log("\nStudents must register and be verified by Admin/HoD");
  await mongoose.disconnect(); process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });