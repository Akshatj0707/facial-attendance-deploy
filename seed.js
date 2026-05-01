const mongoose   = require('mongoose');
const dotenv     = require('dotenv');
dotenv.config();

const User       = require('./models/User');
const Student    = require('./models/Student');
const Attendance = require('./models/Attendance');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Student.deleteMany(), Attendance.deleteMany()]);
  console.log('🗑  Cleared existing data');

  // Create users for all roles
  const users = await User.create([
    { name:'Admin User',       email:'admin@college.edu',    password:'Admin@123',  role:'admin',   department:'Administration',       employeeId:'ADM001' },
    { name:'Dr. Rahul Sharma', email:'hod.cs@college.edu',  password:'Hod@1234',   role:'hod',     department:'Computer Science',       employeeId:'HOD001' },
    { name:'Dr. Priya Patel',  email:'hod.ee@college.edu',  password:'Hod@1234',   role:'hod',     department:'Electrical Engineering', employeeId:'HOD002' },
    { name:'Prof. Amit Verma', email:'faculty1@college.edu',password:'Faculty@123', role:'faculty', department:'Computer Science',       employeeId:'FAC001' },
    { name:'Prof. Sneha Joshi',email:'faculty2@college.edu',password:'Faculty@123', role:'faculty', department:'Electrical Engineering', employeeId:'FAC002' },
    { name:'Ethan Smith',      email:'ethan@college.edu',   password:'Student@123', role:'student', department:'Computer Science',       studentId:'CS2401'  },
    { name:'Mia Wong',         email:'mia@college.edu',     password:'Student@123', role:'student', department:'Computer Science',       studentId:'CS2402'  },
    { name:'Liam Johnson',     email:'liam@college.edu',    password:'Student@123', role:'student', department:'Electrical Engineering', studentId:'EE2401'  },
  ]);
  console.log(`✅ Created ${users.length} users`);

  // Create students
  const studentData = [
    { studentId:'CS2401', name:'Ethan Smith',    email:'ethan@college.edu', department:'Computer Science',       course:'CS-101',year:2,bioStatus:'Enrolled', userId:users[5]._id },
    { studentId:'CS2402', name:'Mia Wong',       email:'mia@college.edu',   department:'Computer Science',       course:'CS-102',year:2,bioStatus:'Enrolled', userId:users[6]._id },
    { studentId:'EE2401', name:'Liam Johnson',   email:'liam@college.edu',  department:'Electrical Engineering', course:'EE-201',year:3,bioStatus:'Enrolled', userId:users[7]._id },
    { studentId:'EE2402', name:'Chloe Davis',    email:'chloe@college.edu', department:'Electrical Engineering', course:'EE-202',year:3,bioStatus:'Enrolled' },
    { studentId:'ME2401', name:'Noah Martinez',  email:'noah@college.edu',  department:'Mechanical Engineering', course:'ME-301',year:4,bioStatus:'Pending'  },
    { studentId:'ME2402', name:'Ava Thompson',   email:'ava@college.edu',   department:'Mechanical Engineering', course:'ME-302',year:4,bioStatus:'Enrolled' },
    { studentId:'CE2401', name:'Oliver Brown',   email:'oliver@college.edu',department:'Civil Engineering',      course:'CE-101',year:1,bioStatus:'Enrolled' },
    { studentId:'CE2402', name:'Emma Wilson',    email:'emma@college.edu',  department:'Civil Engineering',      course:'CE-102',year:1,bioStatus:'Failed'   },
    { studentId:'CS2403', name:'James Anderson', email:'james@college.edu', department:'Computer Science',       course:'CS-201',year:2,bioStatus:'Enrolled' },
    { studentId:'CS2404', name:'Sophia Taylor',  email:'sophia@college.edu',department:'Computer Science',       course:'CS-301',year:3,bioStatus:'Pending'  },
    { studentId:'EE2403', name:'Benjamin Lee',   email:'ben@college.edu',   department:'Electrical Engineering', course:'EE-301',year:4,bioStatus:'Enrolled' },
    { studentId:'ME2403', name:'Isabella Harris',email:'isa@college.edu',   department:'Mechanical Engineering', course:'ME-201',year:2,bioStatus:'Enrolled' },
    { studentId:'CE2403', name:'Lucas Clark',    email:'lucas@college.edu', department:'Civil Engineering',      course:'CE-201',year:2,bioStatus:'Enrolled' },
    { studentId:'CS2405', name:'Charlotte Lewis',email:'char@college.edu',  department:'Computer Science',       course:'CS-101',year:1,bioStatus:'Pending'  },
    { studentId:'EE2404', name:'Henry Walker',   email:'henry@college.edu', department:'Electrical Engineering', course:'EE-101',year:1,bioStatus:'Enrolled' },
  ];
  const students = await Student.create(studentData);
  console.log(`✅ Created ${students.length} students`);

  // Seed 7 days attendance
  const enrolled = students.filter(s => s.bioStatus === 'Enrolled');
  const adminUser= users[0];
  const records  = [];
  for (let day = 6; day >= 0; day--) {
    const d = new Date(); d.setDate(d.getDate() - day); d.setHours(0,0,0,0);
    enrolled.forEach(s => {
      if (Math.random() > 0.15) {
        const h = 8 + Math.floor(Math.random() * 4);
        const m = Math.floor(Math.random() * 60);
        const checkIn = new Date(d); checkIn.setHours(h, m, 0, 0);
        records.push({
          student: s._id, department: s.department, course: s.course,
          checkIn, status: h >= 9 && Math.random() > 0.7 ? 'Late' : 'Present',
          terminal: 'Terminal Auto-Seed', markedBy: adminUser._id,
          verified: true, confidence: +(0.87 + Math.random()*0.12).toFixed(2),
        });
      }
    });
  }
  await Attendance.create(records);
  console.log(`✅ Seeded ${records.length} attendance records`);

  console.log('\n📋 Login Credentials:');
  console.log('  Admin:   admin@college.edu     / Admin@123');
  console.log('  HoD CS:  hod.cs@college.edu    / Hod@1234');
  console.log('  HoD EE:  hod.ee@college.edu    / Hod@1234');
  console.log('  Faculty: faculty1@college.edu  / Faculty@123');
  console.log('  Student: ethan@college.edu     / Student@123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
