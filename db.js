/**
 * Zero-dependency JSON database
 * Works everywhere — no WASM, no native binaries, no compilation
 */
const fs   = require('fs');
const path = require('path');

const DB_FILE = process.env.DB_PATH || path.join(__dirname, 'data.json');

// ── In-memory store ───────────────────────────────────────────────────────────
let store = { students: [], terminals: [], attendance: [], _seq: { s: 0, t: 0, a: 0 } };

function nextId(table) { store._seq[table] = (store._seq[table] || 0) + 1; return store._seq[table]; }

// ── Persist ───────────────────────────────────────────────────────────────────
function save() {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2)); } catch(e) {}
}
function load() {
  if (fs.existsSync(DB_FILE)) {
    try { store = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); return true; } catch(e) {}
  }
  return false;
}

setInterval(save, 30_000);
process.on('exit', save);
process.on('SIGTERM', () => { save(); });

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  if (load() && store.students.length > 0) {
    console.log(`✅ DB loaded — ${store.students.length} students, ${store.attendance.length} records`);
    return;
  }
  seed();
  save();
  console.log('✅ DB seeded with sample data');
}

function seed() {
  store.students = [
    { id:1,  student_id:'CS2401', name:'Ethan Smith',    email:'ethan@college.edu',   department:'Computer Science',       course:'CS-101', year:2, bio_status:'Enrolled', avatar:'ES', created_at: now() },
    { id:2,  student_id:'CS2402', name:'Mia Wong',       email:'mia@college.edu',     department:'Computer Science',       course:'CS-102', year:2, bio_status:'Enrolled', avatar:'MW', created_at: now() },
    { id:3,  student_id:'EE2401', name:'Liam Johnson',   email:'liam@college.edu',    department:'Electrical Engineering', course:'EE-201', year:3, bio_status:'Enrolled', avatar:'LJ', created_at: now() },
    { id:4,  student_id:'EE2402', name:'Chloe Davis',    email:'chloe@college.edu',   department:'Electrical Engineering', course:'EE-202', year:3, bio_status:'Enrolled', avatar:'CD', created_at: now() },
    { id:5,  student_id:'ME2401', name:'Noah Martinez',  email:'noah@college.edu',    department:'Mechanical Engineering', course:'ME-301', year:4, bio_status:'Pending',  avatar:'NM', created_at: now() },
    { id:6,  student_id:'ME2402', name:'Ava Thompson',   email:'ava@college.edu',     department:'Mechanical Engineering', course:'ME-302', year:4, bio_status:'Enrolled', avatar:'AT', created_at: now() },
    { id:7,  student_id:'CE2401', name:'Oliver Brown',   email:'oliver@college.edu',  department:'Civil Engineering',      course:'CE-101', year:1, bio_status:'Enrolled', avatar:'OB', created_at: now() },
    { id:8,  student_id:'CE2402', name:'Emma Wilson',    email:'emma@college.edu',    department:'Civil Engineering',      course:'CE-102', year:1, bio_status:'Failed',   avatar:'EW', created_at: now() },
    { id:9,  student_id:'CS2403', name:'James Anderson', email:'james@college.edu',   department:'Computer Science',       course:'CS-201', year:2, bio_status:'Enrolled', avatar:'JA', created_at: now() },
    { id:10, student_id:'CS2404', name:'Sophia Taylor',  email:'sophia@college.edu',  department:'Computer Science',       course:'CS-301', year:3, bio_status:'Pending',  avatar:'ST', created_at: now() },
    { id:11, student_id:'EE2403', name:'Benjamin Lee',   email:'ben@college.edu',     department:'Electrical Engineering', course:'EE-301', year:4, bio_status:'Enrolled', avatar:'BL', created_at: now() },
    { id:12, student_id:'ME2403', name:'Isabella Harris',email:'isa@college.edu',     department:'Mechanical Engineering', course:'ME-201', year:2, bio_status:'Enrolled', avatar:'IH', created_at: now() },
    { id:13, student_id:'CE2403', name:'Lucas Clark',    email:'lucas@college.edu',   department:'Civil Engineering',      course:'CE-201', year:2, bio_status:'Enrolled', avatar:'LC', created_at: now() },
    { id:14, student_id:'CS2405', name:'Charlotte Lewis',email:'char@college.edu',    department:'Computer Science',       course:'CS-101', year:1, bio_status:'Pending',  avatar:'CL', created_at: now() },
    { id:15, student_id:'EE2404', name:'Henry Walker',   email:'henry@college.edu',   department:'Electrical Engineering', course:'EE-101', year:1, bio_status:'Enrolled', avatar:'HW', created_at: now() },
  ];
  store._seq.s = 15;

  store.terminals = [
    { id:1, name:'Terminal North-A', location:'Main Building - North Entrance',  status:'Online'  },
    { id:2, name:'Terminal North-B', location:'Main Building - North Exit',       status:'Online'  },
    { id:3, name:'Terminal West-C',  location:'Science Block - West Wing',        status:'Online'  },
    { id:4, name:'Terminal East-B',  location:'Arts Block - East Entrance',       status:'Online'  },
    { id:5, name:'Terminal South-D', location:'Sports Complex - South Gate',      status:'Offline' },
    { id:6, name:'Terminal Lab-E',   location:'Computer Lab - Block C',           status:'Online'  },
  ];
  store._seq.t = 6;

  // 7-day attendance history
  const enrolled   = store.students.filter(s => s.bio_status === 'Enrolled');
  const onlineTerms= store.terminals.filter(t => t.status === 'Online');
  let aId = 0;
  for (let day = 6; day >= 0; day--) {
    const d = new Date(); d.setDate(d.getDate() - day);
    const ds = d.toISOString().split('T')[0];
    enrolled.forEach((s, i) => {
      if (Math.random() > 0.15) {
        const h   = 8 + Math.floor(Math.random() * 4);
        const m   = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        const tid = onlineTerms[i % onlineTerms.length].id;
        const status = (h >= 9 && Math.random() > 0.7) ? 'Late' : 'Present';
        store.attendance.push({
          id: ++aId,
          student_id: s.id, terminal_id: tid,
          check_in: `${ds}T${String(h).padStart(2,'0')}:${m}:00`,
          status, verified: 1, course: s.course, notes: null
        });
      }
    });
  }
  store._seq.a = aId;
}

function now() { return new Date().toISOString(); }

// ── Public API ────────────────────────────────────────────────────────────────
const db = {
  get students()   { return store.students; },
  get terminals()  { return store.terminals; },
  get attendance() { return store.attendance; },

  // Students
  getStudents({ department, bio_status, search, limit=50, offset=0 } = {}) {
    let rows = [...store.students];
    if (department && department !== 'all') rows = rows.filter(s => s.department === department);
    if (bio_status  && bio_status  !== 'all') rows = rows.filter(s => s.bio_status  === bio_status);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(s => s.name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q) || (s.email||'').toLowerCase().includes(q));
    }
    rows.sort((a,b) => a.name.localeCompare(b.name));
    return { total: rows.length, rows: rows.slice(+offset, +offset + +limit) };
  },

  getStudent(id) {
    return store.students.find(s => s.id === +id || s.student_id === String(id)) || null;
  },

  addStudent({ student_id, name, email, department, course, year, bio_status }) {
    if (store.students.find(s => s.student_id === student_id)) throw new Error('Student ID already exists');
    const avatar = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const s = { id: nextId('s'), student_id, name, email: email||null, department, course: course||null, year: +year||1, bio_status: bio_status||'Pending', avatar, created_at: now() };
    store.students.push(s);
    save(); return s;
  },

  updateStudent(id, fields) {
    const s = store.students.find(s => s.id === +id);
    if (!s) return null;
    Object.assign(s, Object.fromEntries(Object.entries(fields).filter(([,v]) => v !== undefined)));
    save(); return s;
  },

  deleteStudent(id) {
    const i = store.students.findIndex(s => s.id === +id);
    if (i === -1) return false;
    store.students.splice(i, 1);
    save(); return true;
  },

  // Attendance
  getAttendance({ department, status, date, search, limit=50, offset=0 } = {}) {
    let rows = store.attendance.map(a => {
      const s = store.students.find(s => s.id === a.student_id) || {};
      const t = store.terminals.find(t => t.id === a.terminal_id) || {};
      return { ...a, name: s.name, student_id: s.student_id, avatar: s.avatar, department: s.department, terminal: t.name };
    });
    if (department && department !== 'all') rows = rows.filter(r => r.department === department);
    if (status     && status     !== 'all') rows = rows.filter(r => r.status === status);
    if (date) rows = rows.filter(r => r.check_in.startsWith(date));
    if (search) { const q = search.toLowerCase(); rows = rows.filter(r => r.name?.toLowerCase().includes(q) || r.student_id?.toLowerCase().includes(q)); }
    rows.sort((a,b) => b.check_in.localeCompare(a.check_in));
    return { total: rows.length, rows: rows.slice(+offset, +offset + +limit) };
  },

  addAttendance({ student_id, terminal_id, status, course, notes }) {
    const s = store.students.find(s => s.id === +student_id || s.student_id === String(student_id));
    if (!s) return null;
    const a = { id: nextId('a'), student_id: s.id, terminal_id: terminal_id||null, check_in: now(), status: status||'Present', verified:1, course: course||s.course||null, notes: notes||null };
    store.attendance.push(a);
    save(); return a;
  },

  deleteAttendance(id) {
    const i = store.attendance.findIndex(a => a.id === +id);
    if (i === -1) return false;
    store.attendance.splice(i, 1);
    save(); return true;
  },

  // Stats
  getStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayRecs = store.attendance.filter(a => a.check_in.startsWith(today));
    const presentIds = [...new Set(todayRecs.map(a => a.student_id))];
    const lateToday  = todayRecs.filter(a => a.status === 'Late').length;
    const onlineTerms= store.terminals.filter(t => t.status === 'Online').length;

    // Hourly trend
    const hourMap = {};
    todayRecs.forEach(a => { const h = a.check_in.slice(11,13); hourMap[h] = (hourMap[h]||0)+1; });
    const hourlyTrend = Object.entries(hourMap).sort().map(([hour,count]) => ({ hour, count }));

    // Department breakdown
    const deptMap = {};
    store.students.forEach(s => {
      if (!deptMap[s.department]) deptMap[s.department] = { department: s.department, registered:0, present:0 };
      deptMap[s.department].registered++;
      if (presentIds.includes(s.id)) deptMap[s.department].present++;
    });
    const departments = Object.values(deptMap).sort((a,b) => a.department.localeCompare(b.department));

    // Recent logs
    const recentLogs = store.attendance
      .slice().sort((a,b) => b.check_in.localeCompare(a.check_in)).slice(0,10)
      .map(a => {
        const s = store.students.find(s => s.id === a.student_id)||{};
        const t = store.terminals.find(t => t.id === a.terminal_id)||{};
        return { id:a.id, name:s.name, avatar:s.avatar, terminal:t.name, check_in:a.check_in, status:a.status, course:a.course };
      });

    return { totalStudents: store.students.length, presentToday: presentIds.length, lateToday, onlineTerminals: onlineTerms, hourlyTrend, departments, recentLogs };
  },

  // Recognize
  recognize() {
    const enrolled = store.students.filter(s => s.bio_status === 'Enrolled');
    if (!enrolled.length) return null;
    const student    = enrolled[Math.floor(Math.random() * enrolled.length)];
    const confidence = +(0.87 + Math.random() * 0.12).toFixed(2);
    const hour       = new Date().getHours();
    const status     = hour >= 9 && Math.random() > 0.75 ? 'Late' : 'Present';
    const terminal   = store.terminals.find(t => t.status === 'Online');
    this.addAttendance({ student_id: student.id, terminal_id: terminal?.id, status, course: student.course });
    return { student, confidence, status, timestamp: now() };
  }
};

init();
module.exports = db;
