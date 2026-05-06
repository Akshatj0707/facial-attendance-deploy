// ── College Attendance System — Client-Side Data Store ──────────────────────
const DB = (() => {
  const KEYS = {
    users:      'fas_users',
    students:   'fas_students',
    terminals:  'fas_terminals',
    attendance: 'fas_attendance',
    seq:        'fas_seq',
    session:    'fas_session',
  };

  const load  = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const ts    = () => new Date().toISOString();
  const today = () => new Date().toISOString().split('T')[0];
  const nid   = t  => { const s = load(KEYS.seq) || {}; s[t] = (s[t]||0)+1; store(KEYS.seq,s); return s[t]; };
  const initials = name => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  // ── Seed ────────────────────────────────────────────────────────────────────
  function seed() {
    if (load(KEYS.users)?.length) return;

    const hash = p => btoa(p); // simple reversible for demo — never use in production
    const check = (stored, entered) => stored === btoa(entered);

    const USERS = [
      {id:'u1',name:'Admin User',       email:'admin@college.edu',    pwd:hash('Admin@123'),   role:'admin',   dept:'Administration',        empId:'ADM001', avatar:'AU', active:true},
      {id:'u2',name:'Dr. Rahul Sharma', email:'hod.cs@college.edu',   pwd:hash('Hod@1234'),    role:'hod',     dept:'Computer Science',       empId:'HOD001', avatar:'RS', active:true},
      {id:'u3',name:'Dr. Priya Patel',  email:'hod.ee@college.edu',   pwd:hash('Hod@1234'),    role:'hod',     dept:'Electrical Engineering', empId:'HOD002', avatar:'PP', active:true},
      {id:'u4',name:'Prof. Amit Verma', email:'faculty1@college.edu', pwd:hash('Faculty@123'), role:'faculty', dept:'Computer Science',       empId:'FAC001', avatar:'AV', active:true},
      {id:'u5',name:'Prof. Sneha Joshi',email:'faculty2@college.edu', pwd:hash('Faculty@123'), role:'faculty', dept:'Electrical Engineering', empId:'FAC002', avatar:'SJ', active:true},
      {id:'u6',name:'Ethan Smith',      email:'ethan@college.edu',    pwd:hash('Student@123'), role:'student', dept:'Computer Science',       stuId:'CS2401', avatar:'ES', active:true},
      {id:'u7',name:'Mia Wong',         email:'mia@college.edu',      pwd:hash('Student@123'), role:'student', dept:'Computer Science',       stuId:'CS2402', avatar:'MW', active:true},
      {id:'u8',name:'Liam Johnson',     email:'liam@college.edu',     pwd:hash('Student@123'), role:'student', dept:'Electrical Engineering', stuId:'EE2401', avatar:'LJ', active:true},
    ];
    store(KEYS.users, USERS);

    const STUDENTS = [
      {id:'s1', stuId:'CS2401',name:'Ethan Smith',    email:'ethan@college.edu', dept:'Computer Science',       course:'CS-101',year:2,bio:'Enrolled',avatar:'ES',userId:'u6'},
      {id:'s2', stuId:'CS2402',name:'Mia Wong',       email:'mia@college.edu',   dept:'Computer Science',       course:'CS-102',year:2,bio:'Enrolled',avatar:'MW',userId:'u7'},
      {id:'s3', stuId:'EE2401',name:'Liam Johnson',   email:'liam@college.edu',  dept:'Electrical Engineering', course:'EE-201',year:3,bio:'Enrolled',avatar:'LJ',userId:'u8'},
      {id:'s4', stuId:'EE2402',name:'Chloe Davis',    email:'chloe@college.edu', dept:'Electrical Engineering', course:'EE-202',year:3,bio:'Enrolled',avatar:'CD'},
      {id:'s5', stuId:'ME2401',name:'Noah Martinez',  email:'noah@college.edu',  dept:'Mechanical Engineering', course:'ME-301',year:4,bio:'Pending', avatar:'NM'},
      {id:'s6', stuId:'ME2402',name:'Ava Thompson',   email:'ava@college.edu',   dept:'Mechanical Engineering', course:'ME-302',year:4,bio:'Enrolled',avatar:'AT'},
      {id:'s7', stuId:'CE2401',name:'Oliver Brown',   email:'oliver@college.edu',dept:'Civil Engineering',      course:'CE-101',year:1,bio:'Enrolled',avatar:'OB'},
      {id:'s8', stuId:'CE2402',name:'Emma Wilson',    email:'emma@college.edu',  dept:'Civil Engineering',      course:'CE-102',year:1,bio:'Failed',  avatar:'EW'},
      {id:'s9', stuId:'CS2403',name:'James Anderson', email:'james@college.edu', dept:'Computer Science',       course:'CS-201',year:2,bio:'Enrolled',avatar:'JA'},
      {id:'s10',stuId:'CS2404',name:'Sophia Taylor',  email:'sophia@college.edu',dept:'Computer Science',       course:'CS-301',year:3,bio:'Pending', avatar:'ST'},
      {id:'s11',stuId:'EE2403',name:'Benjamin Lee',   email:'ben@college.edu',   dept:'Electrical Engineering', course:'EE-301',year:4,bio:'Enrolled',avatar:'BL'},
      {id:'s12',stuId:'ME2403',name:'Isabella Harris',email:'isa@college.edu',   dept:'Mechanical Engineering', course:'ME-201',year:2,bio:'Enrolled',avatar:'IH'},
      {id:'s13',stuId:'CE2403',name:'Lucas Clark',    email:'lucas@college.edu', dept:'Civil Engineering',      course:'CE-201',year:2,bio:'Enrolled',avatar:'LC'},
      {id:'s14',stuId:'CS2405',name:'Charlotte Lewis',email:'char@college.edu',  dept:'Computer Science',       course:'CS-101',year:1,bio:'Pending', avatar:'CL'},
      {id:'s15',stuId:'EE2404',name:'Henry Walker',   email:'henry@college.edu', dept:'Electrical Engineering', course:'EE-101',year:1,bio:'Enrolled',avatar:'HW'},
    ];
    store(KEYS.students, STUDENTS);

    const TERMINALS = [
      {id:'t1',name:'Terminal North-A',loc:'Main Building - North Entrance',  status:'Online'},
      {id:'t2',name:'Terminal North-B',loc:'Main Building - North Exit',       status:'Online'},
      {id:'t3',name:'Terminal West-C', loc:'Science Block - West Wing',        status:'Online'},
      {id:'t4',name:'Terminal East-B', loc:'Arts Block - East Entrance',       status:'Online'},
      {id:'t5',name:'Terminal South-D',loc:'Sports Complex - South Gate',      status:'Offline'},
      {id:'t6',name:'Terminal Lab-E',  loc:'Computer Lab - Block C',           status:'Online'},
    ];
    store(KEYS.terminals, TERMINALS);

    // 7-day attendance history
    const enrolled   = STUDENTS.filter(s=>s.bio==='Enrolled');
    const termIds    = TERMINALS.filter(t=>t.status==='Online').map(t=>t.id);
    const records    = [];
    let aid = 0;
    for (let day=6; day>=0; day--) {
      const d = new Date(); d.setDate(d.getDate()-day);
      const ds = d.toISOString().split('T')[0];
      enrolled.forEach((s,i) => {
        if (Math.random()>0.15) {
          const h = 8+Math.floor(Math.random()*4);
          const m = String(Math.floor(Math.random()*60)).padStart(2,'0');
          const status = h>=9&&Math.random()>0.7?'Late':'Present';
          records.push({
            id:`a${++aid}`, stuRef:s.id, stuId:s.stuId, stuName:s.name,
            avatar:s.avatar, dept:s.dept, course:s.course,
            terminal:TERMINALS[i%termIds.length].name,
            checkIn:`${ds}T${String(h).padStart(2,'0')}:${m}:00`,
            status, verified:true, conf:+(0.87+Math.random()*0.12).toFixed(2),
          });
        }
      });
    }
    store(KEYS.attendance, records);
    store(KEYS.seq, {u:8,s:15,a:aid});
    console.log('✅ DB seeded');
  }

  return {
    seed,
    // Auth
    login(email, pwd) {
      const users = load(KEYS.users)||[];
      const u = users.find(u=>u.email===email);
      if (!u || !u.active) return null;
      const ok = u.pwd === btoa(pwd);
      if (!ok) return null;
      const {pwd:_,...safe} = u;
      store(KEYS.session, safe);
      return safe;
    },
    logout() { localStorage.removeItem(KEYS.session); },
    getSession() { return load(KEYS.session); },
    register(data) {
      const users = load(KEYS.users)||[];
      if (users.find(u=>u.email===data.email)) throw new Error('Email already registered');
      const id  = 'u'+nid('u');
      const av  = initials(data.name);
      const u   = {id, avatar:av, pwd:btoa(data.pwd), active:true, ...data};
      delete u.pwd_confirm;
      users.push(u); store(KEYS.users, users);
      if (data.role==='student' && data.stuId) {
        const students = load(KEYS.students)||[];
        if (!students.find(s=>s.stuId===data.stuId)) {
          students.push({id:'s'+nid('s'), stuId:data.stuId, name:data.name, email:data.email, dept:data.dept, course:'', year:1, bio:'Pending', avatar:av, userId:id});
          store(KEYS.students, students);
        }
      }
      const {pwd:_,...safe} = u;
      store(KEYS.session, safe);
      return safe;
    },

    // Stats
    getStats(deptFilter) {
      const today = new Date().toISOString().split('T')[0];
      let students   = load(KEYS.students)||[];
      let attendance = load(KEYS.attendance)||[];
      if (deptFilter) { students=students.filter(s=>s.dept===deptFilter); attendance=attendance.filter(a=>a.dept===deptFilter); }
      const todayRecs  = attendance.filter(a=>a.checkIn.startsWith(today));
      const presentIds = [...new Set(todayRecs.filter(a=>a.status!=='Absent').map(a=>a.stuRef))];
      const lateToday  = todayRecs.filter(a=>a.status==='Late').length;
      const hourMap    = {};
      todayRecs.forEach(a=>{const h=a.checkIn.slice(11,13);hourMap[h]=(hourMap[h]||0)+1;});
      const hourlyTrend = Object.entries(hourMap).sort().map(([h,c])=>({hour:h,count:c}));
      const deptMap = {};
      students.forEach(s=>{
        if(!deptMap[s.dept])deptMap[s.dept]={dept:s.dept,total:0,present:0};
        deptMap[s.dept].total++;
        if(presentIds.includes(s.id))deptMap[s.dept].present++;
      });
      const recentLogs = [...attendance].sort((a,b)=>b.checkIn.localeCompare(a.checkIn)).slice(0,12);
      return {total:students.length,present:presentIds.length,late:lateToday,terminals:5,hourlyTrend,depts:Object.values(deptMap).sort((a,b)=>a.dept.localeCompare(b.dept)),recentLogs};
    },

    // Students
    getStudents({dept,bio,search,limit=50,offset=0}={}) {
      let rows = load(KEYS.students)||[];
      if (dept   && dept!=='all') rows=rows.filter(s=>s.dept===dept);
      if (bio    && bio !=='all') rows=rows.filter(s=>s.bio ===bio);
      if (search) { const q=search.toLowerCase(); rows=rows.filter(s=>s.name.toLowerCase().includes(q)||s.stuId.toLowerCase().includes(q)||(s.email||'').toLowerCase().includes(q)); }
      rows.sort((a,b)=>a.name.localeCompare(b.name));
      return {rows:rows.slice(+offset,+offset+(+limit)),total:rows.length};
    },
    addStudent(data) {
      const all = load(KEYS.students)||[];
      if (all.find(s=>s.stuId===data.stuId)) throw new Error('Student ID already exists');
      const s = {id:'s'+nid('s'), avatar:initials(data.name), bio:'Pending', ...data};
      all.push(s); store(KEYS.students,all); return s;
    },
    updateStudent(id, fields) {
      const all = load(KEYS.students)||[];
      const i = all.findIndex(s=>s.id===id);
      if (i===-1) return null;
      Object.assign(all[i], fields); store(KEYS.students,all); return all[i];
    },
    deleteStudent(id) {
      const all = load(KEYS.students)||[];
      const i = all.findIndex(s=>s.id===id);
      if (i===-1) return false;
      all.splice(i,1); store(KEYS.students,all); return true;
    },

    // Attendance
    getAttendance({dept,status,date,search,stuRef,limit=60,offset=0}={}) {
      let rows = load(KEYS.attendance)||[];
      if (dept   && dept  !=='all') rows=rows.filter(r=>r.dept===dept);
      if (status && status!=='all') rows=rows.filter(r=>r.status===status);
      if (date)  rows=rows.filter(r=>r.checkIn.startsWith(date));
      if (stuRef) rows=rows.filter(r=>r.stuRef===stuRef);
      if (search) { const q=search.toLowerCase(); rows=rows.filter(r=>(r.stuName||'').toLowerCase().includes(q)||(r.stuId||'').toLowerCase().includes(q)); }
      rows.sort((a,b)=>b.checkIn.localeCompare(a.checkIn));
      return {rows:rows.slice(+offset,+offset+(+limit)),total:rows.length};
    },
    addAttendance({stuId,status,course,terminal}) {
      const all = load(KEYS.attendance)||[];
      const students = load(KEYS.students)||[];
      const s = students.find(s=>s.id===stuId||s.stuId===stuId);
      if (!s) return null;
      const r = {id:'a'+nid('a'), stuRef:s.id, stuId:s.stuId, stuName:s.name, avatar:s.avatar, dept:s.dept, course:course||s.course, terminal:terminal||'Main Terminal', checkIn:ts(), status:status||'Present', verified:true, conf:0.95};
      all.push(r); store(KEYS.attendance,all); return r;
    },
    deleteAttendance(id) {
      const all = load(KEYS.attendance)||[];
      const i = all.findIndex(a=>a.id===id);
      if (i===-1) return false;
      all.splice(i,1); store(KEYS.attendance,all); return true;
    },
    recognize(deptFilter) {
      const students = load(KEYS.students)||[];
      let enrolled = students.filter(s=>s.bio==='Enrolled');
      if (deptFilter) enrolled=enrolled.filter(s=>s.dept===deptFilter);
      if (!enrolled.length) return null;
      const s    = enrolled[Math.floor(Math.random()*enrolled.length)];
      const conf = +(0.87+Math.random()*0.12).toFixed(2);
      const h    = new Date().getHours();
      const status = h>=9&&Math.random()>0.75?'Late':'Present';
      this.addAttendance({stuId:s.id, status, course:s.course, terminal:'Recognition Terminal'});
      return {student:s, conf, status, ts:ts()};
    },

    // Terminals
    getTerminals() { return load(KEYS.terminals)||[]; },
    getUsers()     { return (load(KEYS.users)||[]).map(({pwd:_,...u})=>u); },
  };
})();

DB.seed();

// ── Extended DB API ──────────────────────────────────────────────────────────
Object.assign(DB, {
  // Face descriptors (base64 image + label per student)
  saveFaceData(stuId, imageData, descriptor) {
    const all = load('fas_faces') || {};
    all[stuId] = { imageData, descriptor, enrolledAt: ts() };
    store('fas_faces', all);
  },
  getFaceData(stuId) { return (load('fas_faces')||{})[stuId] || null; },
  getAllFaceData()    { return load('fas_faces') || {}; },
  deleteFaceData(stuId) {
    const all = load('fas_faces')||{};
    delete all[stuId]; store('fas_faces', all);
  },

  // Announcements
  getAnnouncements() { return load('fas_ann') || [
    {id:'ann1', title:'Biometric Enrollment Drive', body:'All students must enroll their face data by end of this month for automatic attendance.', role:'all', dept:'all', date:'2024-05-01', priority:'high'},
    {id:'ann2', title:'Semester Mid-Terms Schedule', body:'Mid-term examinations will be held from 15th to 20th May. Attendance is compulsory.', role:'all', dept:'all', date:'2024-04-28', priority:'medium'},
    {id:'ann3', title:'New Faculty Joined — CS Dept', body:'Prof. David Chen has joined as Assistant Professor in Computer Science. Welcome!', role:'all', dept:'Computer Science', date:'2024-04-25', priority:'low'},
    {id:'ann4', title:'HOD Meeting — All Departments', body:'Monthly HOD coordination meeting scheduled for Friday 3 PM in Conference Hall B.', role:'admin', dept:'all', date:'2024-04-24', priority:'medium'},
  ]; },
  addAnnouncement(data) {
    const all = load('fas_ann') || DB.getAnnouncements();
    const a = {id:'ann'+Date.now(), date:new Date().toISOString().split('T')[0], ...data};
    all.unshift(a); store('fas_ann', all); return a;
  },
  deleteAnnouncement(id) {
    const all = (load('fas_ann')||DB.getAnnouncements()).filter(a=>a.id!==id);
    store('fas_ann', all);
  },

  // Timetable
  getTimetable(dept) {
    const all = load('fas_tt') || {
      'Computer Science': [
        {day:'Mon',time:'09:00',subject:'Data Structures',faculty:'Prof. Amit Verma',room:'CS-101'},
        {day:'Mon',time:'11:00',subject:'Algorithms',faculty:'Prof. Amit Verma',room:'CS-102'},
        {day:'Tue',time:'09:00',subject:'DBMS',faculty:'Prof. Sneha Joshi',room:'CS-Lab1'},
        {day:'Wed',time:'10:00',subject:'OS Concepts',faculty:'Prof. Amit Verma',room:'CS-103'},
        {day:'Thu',time:'09:00',subject:'Web Tech',faculty:'Prof. Sneha Joshi',room:'CS-Lab2'},
        {day:'Fri',time:'11:00',subject:'Project Work',faculty:'Dr. Rahul Sharma',room:'CS-104'},
      ],
      'Electrical Engineering': [
        {day:'Mon',time:'09:00',subject:'Circuit Theory',faculty:'Prof. Sneha Joshi',room:'EE-101'},
        {day:'Tue',time:'10:00',subject:'Signals & Systems',faculty:'Prof. Sneha Joshi',room:'EE-102'},
        {day:'Wed',time:'09:00',subject:'Power Systems',faculty:'Dr. Priya Patel',room:'EE-Lab1'},
        {day:'Thu',time:'11:00',subject:'Control Systems',faculty:'Prof. Sneha Joshi',room:'EE-103'},
        {day:'Fri',time:'09:00',subject:'Electronics',faculty:'Dr. Priya Patel',room:'EE-104'},
      ],
    };
    return dept ? (all[dept]||[]) : all;
  },

  // Reports
  getAttendanceReport(dept, from, to) {
    let records = load('fas_attendance')||[];
    if (dept && dept!=='all') records = records.filter(r=>r.dept===dept);
    if (from) records = records.filter(r=>r.checkIn>=from);
    if (to)   records = records.filter(r=>r.checkIn<=to+'T23:59:59');
    const students = load('fas_students')||[];
    const report = {};
    (dept&&dept!=='all' ? students.filter(s=>s.dept===dept) : students).forEach(s=>{
      const recs = records.filter(r=>r.stuRef===s.id);
      report[s.id] = {
        student:s, total:recs.length,
        present:recs.filter(r=>r.status==='Present').length,
        late:recs.filter(r=>r.status==='Late').length,
        absent:0,
      };
    });
    return Object.values(report);
  },

  // Users management
  toggleUser(id) {
    const all = load('fas_users')||[];
    const u = all.find(u=>u.id===id);
    if (u) { u.active=!u.active; store('fas_users',all); }
    return u;
  },
  deleteUser(id) {
    const all = (load('fas_users')||[]).filter(u=>u.id!==id);
    store('fas_users', all);
  },
  addUser(data) {
    const all = load('fas_users')||[];
    if (all.find(u=>u.email===data.email)) throw new Error('Email already exists');
    const u = {id:'u'+nid('u'), avatar:initials(data.name), active:true, pwd:btoa(data.pwd||'Pass@1234'), ...data};
    all.push(u); store('fas_users',all); return u;
  },
});
