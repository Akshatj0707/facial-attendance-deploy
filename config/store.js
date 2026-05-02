/**
 * Unified data store — MongoDB when available, JSON file as fallback.
 * Routes use these helpers instead of Mongoose directly, so the app
 * works with or without a DB connection.
 */
const fs   = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = process.env.DATA_PATH || path.join(__dirname, '..', 'app_data.json');

// ── JSON store ────────────────────────────────────────────────────────────────
let _store = null;

function loadStore() {
  if (_store) return _store;
  if (fs.existsSync(DATA_FILE)) {
    try { _store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); return _store; } catch(e) {}
  }
  _store = { users:[], students:[], attendance:[], _seq:{u:0,s:0,a:0} };
  return _store;
}

function saveStore() {
  if (!_store) return;
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(_store, null, 2)); } catch(e) {}
}

function nextId(t) {
  const s = loadStore();
  s._seq[t] = (s._seq[t]||0) + 1;
  return String(s._seq[t]);
}

function now() { return new Date().toISOString(); }

// ── Check if mongoose is connected ───────────────────────────────────────────
function isMongoConnected() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1;
  } catch(e) { return false; }
}

// ── Seed JSON store on first run ─────────────────────────────────────────────
async function seedIfEmpty() {
  const store = loadStore();
  if (store.users.length > 0) return;

  const hash = async (p) => bcrypt.hash(p, 10);

  store.users = [
    { _id:'u1', name:'Admin User',       email:'admin@college.edu',    password: await hash('Admin@123'),   role:'admin',   department:'Administration',       employeeId:'ADM001', avatar:'AU', isActive:true, createdAt:now() },
    { _id:'u2', name:'Dr. Rahul Sharma', email:'hod.cs@college.edu',   password: await hash('Hod@1234'),    role:'hod',     department:'Computer Science',       employeeId:'HOD001', avatar:'RS', isActive:true, createdAt:now() },
    { _id:'u3', name:'Dr. Priya Patel',  email:'hod.ee@college.edu',   password: await hash('Hod@1234'),    role:'hod',     department:'Electrical Engineering', employeeId:'HOD002', avatar:'PP', isActive:true, createdAt:now() },
    { _id:'u4', name:'Prof. Amit Verma', email:'faculty1@college.edu', password: await hash('Faculty@123'), role:'faculty', department:'Computer Science',       employeeId:'FAC001', avatar:'AV', isActive:true, createdAt:now() },
    { _id:'u5', name:'Prof. Sneha Joshi',email:'faculty2@college.edu', password: await hash('Faculty@123'), role:'faculty', department:'Electrical Engineering', employeeId:'FAC002', avatar:'SJ', isActive:true, createdAt:now() },
    { _id:'u6', name:'Ethan Smith',      email:'ethan@college.edu',    password: await hash('Student@123'), role:'student', department:'Computer Science',       studentId:'CS2401',  avatar:'ES', isActive:true, createdAt:now() },
    { _id:'u7', name:'Mia Wong',         email:'mia@college.edu',      password: await hash('Student@123'), role:'student', department:'Computer Science',       studentId:'CS2402',  avatar:'MW', isActive:true, createdAt:now() },
    { _id:'u8', name:'Liam Johnson',     email:'liam@college.edu',     password: await hash('Student@123'), role:'student', department:'Electrical Engineering', studentId:'EE2401',  avatar:'LJ', isActive:true, createdAt:now() },
  ];

  store.students = [
    { _id:'s1',  studentId:'CS2401', name:'Ethan Smith',    email:'ethan@college.edu', department:'Computer Science',       course:'CS-101', year:2, bioStatus:'Enrolled', avatar:'ES', userId:'u6' },
    { _id:'s2',  studentId:'CS2402', name:'Mia Wong',       email:'mia@college.edu',   department:'Computer Science',       course:'CS-102', year:2, bioStatus:'Enrolled', avatar:'MW', userId:'u7' },
    { _id:'s3',  studentId:'EE2401', name:'Liam Johnson',   email:'liam@college.edu',  department:'Electrical Engineering', course:'EE-201', year:3, bioStatus:'Enrolled', avatar:'LJ', userId:'u8' },
    { _id:'s4',  studentId:'EE2402', name:'Chloe Davis',    email:'chloe@college.edu', department:'Electrical Engineering', course:'EE-202', year:3, bioStatus:'Enrolled', avatar:'CD' },
    { _id:'s5',  studentId:'ME2401', name:'Noah Martinez',  email:'noah@college.edu',  department:'Mechanical Engineering', course:'ME-301', year:4, bioStatus:'Pending',  avatar:'NM' },
    { _id:'s6',  studentId:'ME2402', name:'Ava Thompson',   email:'ava@college.edu',   department:'Mechanical Engineering', course:'ME-302', year:4, bioStatus:'Enrolled', avatar:'AT' },
    { _id:'s7',  studentId:'CE2401', name:'Oliver Brown',   email:'oliver@college.edu',department:'Civil Engineering',      course:'CE-101', year:1, bioStatus:'Enrolled', avatar:'OB' },
    { _id:'s8',  studentId:'CE2402', name:'Emma Wilson',    email:'emma@college.edu',  department:'Civil Engineering',      course:'CE-102', year:1, bioStatus:'Failed',   avatar:'EW' },
    { _id:'s9',  studentId:'CS2403', name:'James Anderson', email:'james@college.edu', department:'Computer Science',       course:'CS-201', year:2, bioStatus:'Enrolled', avatar:'JA' },
    { _id:'s10', studentId:'CS2404', name:'Sophia Taylor',  email:'sophia@college.edu',department:'Computer Science',       course:'CS-301', year:3, bioStatus:'Pending',  avatar:'ST' },
    { _id:'s11', studentId:'EE2403', name:'Benjamin Lee',   email:'ben@college.edu',   department:'Electrical Engineering', course:'EE-301', year:4, bioStatus:'Enrolled', avatar:'BL' },
    { _id:'s12', studentId:'ME2403', name:'Isabella Harris',email:'isa@college.edu',   department:'Mechanical Engineering', course:'ME-201', year:2, bioStatus:'Enrolled', avatar:'IH' },
    { _id:'s13', studentId:'CE2403', name:'Lucas Clark',    email:'lucas@college.edu', department:'Civil Engineering',      course:'CE-201', year:2, bioStatus:'Enrolled', avatar:'LC' },
    { _id:'s14', studentId:'CS2405', name:'Charlotte Lewis',email:'char@college.edu',  department:'Computer Science',       course:'CS-101', year:1, bioStatus:'Pending',  avatar:'CL' },
    { _id:'s15', studentId:'EE2404', name:'Henry Walker',   email:'henry@college.edu', department:'Electrical Engineering', course:'EE-101', year:1, bioStatus:'Enrolled', avatar:'HW' },
  ];
  store._seq = { u:8, s:15, a:0 };

  // 7-day attendance history
  const enrolled = store.students.filter(s => s.bioStatus === 'Enrolled');
  const terminals= ['Terminal North-A','Terminal North-B','Terminal West-C','Terminal East-B','Terminal Lab-E'];
  let aid = 0;
  for (let day = 6; day >= 0; day--) {
    const d = new Date(); d.setDate(d.getDate() - day);
    const ds = d.toISOString().split('T')[0];
    enrolled.forEach((s, i) => {
      if (Math.random() > 0.15) {
        const h = 8 + Math.floor(Math.random() * 4);
        const m = String(Math.floor(Math.random() * 60)).padStart(2,'0');
        const status = h >= 9 && Math.random() > 0.7 ? 'Late' : 'Present';
        store.attendance.push({
          _id: `a${++aid}`,
          student: { _id:s._id, name:s.name, studentId:s.studentId, avatar:s.avatar, department:s.department, course:s.course },
          department: s.department,
          course: s.course,
          terminal: terminals[i % terminals.length],
          checkIn: `${ds}T${String(h).padStart(2,'0')}:${m}:00.000Z`,
          status,
          verified: true,
          confidence: +(0.87 + Math.random()*0.12).toFixed(2),
          markedBy: { _id:'u1', name:'Admin User', role:'admin' },
        });
      }
    });
  }
  store._seq.a = aid;
  saveStore();
  console.log(`✅ JSON store seeded — ${store.users.length} users, ${store.students.length} students, ${store.attendance.length} records`);
}

module.exports = { loadStore, saveStore, nextId, now, isMongoConnected, seedIfEmpty };
