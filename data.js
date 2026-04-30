// ── Facial Attendance System — Client-side Data Store ────────────────────────
const DB = (() => {
  const KEYS = { students:'fas_students', terminals:'fas_terminals', attendance:'fas_attendance', seq:'fas_seq' };

  function load(k)    { try { return JSON.parse(localStorage.getItem(k)) || null; } catch(e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
  function now()      { return new Date().toISOString(); }
  function dateStr(d) { return d.toISOString().split('T')[0]; }
  function nextId(t)  { const s=load(KEYS.seq)||{s:0,t:0,a:0}; s[t]++; save(KEYS.seq,s); return s[t]; }

  function init() {
    if (load(KEYS.students)?.length > 0) return;
    const students = [
      {id:1,student_id:'CS2401',name:'Ethan Smith',   email:'ethan@college.edu', department:'Computer Science',       course:'CS-101',year:2,bio_status:'Enrolled',avatar:'ES'},
      {id:2,student_id:'CS2402',name:'Mia Wong',      email:'mia@college.edu',   department:'Computer Science',       course:'CS-102',year:2,bio_status:'Enrolled',avatar:'MW'},
      {id:3,student_id:'EE2401',name:'Liam Johnson',  email:'liam@college.edu',  department:'Electrical Engineering', course:'EE-201',year:3,bio_status:'Enrolled',avatar:'LJ'},
      {id:4,student_id:'EE2402',name:'Chloe Davis',   email:'chloe@college.edu', department:'Electrical Engineering', course:'EE-202',year:3,bio_status:'Enrolled',avatar:'CD'},
      {id:5,student_id:'ME2401',name:'Noah Martinez', email:'noah@college.edu',  department:'Mechanical Engineering', course:'ME-301',year:4,bio_status:'Pending', avatar:'NM'},
      {id:6,student_id:'ME2402',name:'Ava Thompson',  email:'ava@college.edu',   department:'Mechanical Engineering', course:'ME-302',year:4,bio_status:'Enrolled',avatar:'AT'},
      {id:7,student_id:'CE2401',name:'Oliver Brown',  email:'oliver@college.edu',department:'Civil Engineering',      course:'CE-101',year:1,bio_status:'Enrolled',avatar:'OB'},
      {id:8,student_id:'CE2402',name:'Emma Wilson',   email:'emma@college.edu',  department:'Civil Engineering',      course:'CE-102',year:1,bio_status:'Failed',  avatar:'EW'},
      {id:9,student_id:'CS2403',name:'James Anderson',email:'james@college.edu', department:'Computer Science',       course:'CS-201',year:2,bio_status:'Enrolled',avatar:'JA'},
      {id:10,student_id:'CS2404',name:'Sophia Taylor',email:'sophia@college.edu',department:'Computer Science',       course:'CS-301',year:3,bio_status:'Pending', avatar:'ST'},
      {id:11,student_id:'EE2403',name:'Benjamin Lee', email:'ben@college.edu',   department:'Electrical Engineering', course:'EE-301',year:4,bio_status:'Enrolled',avatar:'BL'},
      {id:12,student_id:'ME2403',name:'Isabella Harris',email:'isa@college.edu', department:'Mechanical Engineering', course:'ME-201',year:2,bio_status:'Enrolled',avatar:'IH'},
      {id:13,student_id:'CE2403',name:'Lucas Clark',  email:'lucas@college.edu', department:'Civil Engineering',      course:'CE-201',year:2,bio_status:'Enrolled',avatar:'LC'},
      {id:14,student_id:'CS2405',name:'Charlotte Lewis',email:'char@college.edu',department:'Computer Science',       course:'CS-101',year:1,bio_status:'Pending', avatar:'CL'},
      {id:15,student_id:'EE2404',name:'Henry Walker', email:'henry@college.edu', department:'Electrical Engineering', course:'EE-101',year:1,bio_status:'Enrolled',avatar:'HW'},
    ];
    save(KEYS.students, students);
    save(KEYS.seq, {s:15,t:6,a:0});

    save(KEYS.terminals, [
      {id:1,name:'Terminal North-A',location:'Main Building - North Entrance',status:'Online'},
      {id:2,name:'Terminal North-B',location:'Main Building - North Exit',    status:'Online'},
      {id:3,name:'Terminal West-C', location:'Science Block - West Wing',     status:'Online'},
      {id:4,name:'Terminal East-B', location:'Arts Block - East Entrance',    status:'Online'},
      {id:5,name:'Terminal South-D',location:'Sports Complex - South Gate',   status:'Offline'},
      {id:6,name:'Terminal Lab-E',  location:'Computer Lab - Block C',        status:'Online'},
    ]);

    // Seed 7 days of attendance
    const enrolled = students.filter(s=>s.bio_status==='Enrolled');
    const terminals= [1,2,3,4,6];
    const records  = [];
    let aid = 0;
    for (let day=6; day>=0; day--) {
      const d = new Date(); d.setDate(d.getDate()-day);
      const ds = dateStr(d);
      enrolled.forEach((s,i) => {
        if (Math.random() > 0.15) {
          const h = 8+Math.floor(Math.random()*4);
          const m = String(Math.floor(Math.random()*60)).padStart(2,'0');
          const status = h>=9 && Math.random()>0.7 ? 'Late':'Present';
          records.push({
            id:++aid, student_id:s.id, terminal_id:terminals[i%terminals.length],
            check_in:`${ds}T${String(h).padStart(2,'0')}:${m}:00`,
            status, verified:1, course:s.course, notes:null
          });
        }
      });
    }
    save(KEYS.attendance, records);
    const seq = load(KEYS.seq); seq.a=aid; save(KEYS.seq,seq);
    console.log('✅ DB seeded');
  }

  // ── Public API ──────────────────────────────────────────────────────────────
  return {
    init,

    getStudents({department,bio_status,search,limit=50,offset=0}={}) {
      let rows = load(KEYS.students)||[];
      if (department && department!=='all') rows=rows.filter(s=>s.department===department);
      if (bio_status  && bio_status !=='all') rows=rows.filter(s=>s.bio_status===bio_status);
      if (search) { const q=search.toLowerCase(); rows=rows.filter(s=>s.name.toLowerCase().includes(q)||s.student_id.toLowerCase().includes(q)); }
      rows.sort((a,b)=>a.name.localeCompare(b.name));
      return { total:rows.length, rows:rows.slice(+offset,+offset+(+limit)) };
    },

    addStudent({student_id,name,email,department,course,year,bio_status}) {
      const all = load(KEYS.students)||[];
      if (all.find(s=>s.student_id===student_id)) throw new Error('Student ID already exists');
      const avatar = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      const s = {id:nextId('s'),student_id,name,email:email||null,department,course:course||null,year:+year||1,bio_status:bio_status||'Pending',avatar};
      all.push(s); save(KEYS.students,all); return s;
    },

    updateStudent(id, fields) {
      const all = load(KEYS.students)||[];
      const i = all.findIndex(s=>s.id===+id);
      if (i===-1) return null;
      Object.assign(all[i], fields);
      save(KEYS.students, all); return all[i];
    },

    deleteStudent(id) {
      const all = load(KEYS.students)||[];
      const i = all.findIndex(s=>s.id===+id);
      if (i===-1) return false;
      all.splice(i,1); save(KEYS.students,all); return true;
    },

    getAttendance({department,status,date,search,limit=50,offset=0}={}) {
      const students  = load(KEYS.students)||[];
      const terminals = load(KEYS.terminals)||[];
      let rows = (load(KEYS.attendance)||[]).map(a=>{
        const s=students.find(s=>s.id===a.student_id)||{};
        const t=terminals.find(t=>t.id===a.terminal_id)||{};
        return {...a,name:s.name,student_id:s.student_id,avatar:s.avatar,department:s.department,terminal:t.name};
      });
      if (department && department!=='all') rows=rows.filter(r=>r.department===department);
      if (status     && status    !=='all') rows=rows.filter(r=>r.status===status);
      if (date) rows=rows.filter(r=>r.check_in.startsWith(date));
      if (search){const q=search.toLowerCase();rows=rows.filter(r=>(r.name||'').toLowerCase().includes(q)||(r.student_id||'').toLowerCase().includes(q));}
      rows.sort((a,b)=>b.check_in.localeCompare(a.check_in));
      return { total:rows.length, rows:rows.slice(+offset,+offset+(+limit)) };
    },

    addAttendance({student_id,terminal_id,status,course,notes}) {
      const students = load(KEYS.students)||[];
      const s = students.find(s=>s.id===+student_id||s.student_id===String(student_id));
      if (!s) return null;
      const all = load(KEYS.attendance)||[];
      const a = {id:nextId('a'),student_id:s.id,terminal_id:terminal_id||null,check_in:now(),status:status||'Present',verified:1,course:course||s.course||null,notes:notes||null};
      all.push(a); save(KEYS.attendance,all); return a;
    },

    deleteAttendance(id) {
      const all = load(KEYS.attendance)||[];
      const i = all.findIndex(a=>a.id===+id);
      if (i===-1) return false;
      all.splice(i,1); save(KEYS.attendance,all); return true;
    },

    getStats() {
      const today     = dateStr(new Date());
      const students  = load(KEYS.students)||[];
      const terminals = load(KEYS.terminals)||[];
      const records   = load(KEYS.attendance)||[];
      const todayRecs = records.filter(a=>a.check_in.startsWith(today));
      const presentIds= [...new Set(todayRecs.map(a=>a.student_id))];
      const lateToday = todayRecs.filter(a=>a.status==='Late').length;
      const onlineT   = terminals.filter(t=>t.status==='Online').length;

      const hourMap={};
      todayRecs.forEach(a=>{const h=a.check_in.slice(11,13);hourMap[h]=(hourMap[h]||0)+1;});
      const hourlyTrend=Object.entries(hourMap).sort().map(([hour,count])=>({hour,count}));

      const deptMap={};
      students.forEach(s=>{
        if(!deptMap[s.department])deptMap[s.department]={department:s.department,registered:0,present:0};
        deptMap[s.department].registered++;
        if(presentIds.includes(s.id))deptMap[s.department].present++;
      });

      const recentLogs = [...records]
        .sort((a,b)=>b.check_in.localeCompare(a.check_in)).slice(0,10)
        .map(a=>{
          const s=students.find(s=>s.id===a.student_id)||{};
          const t=terminals.find(t=>t.id===a.terminal_id)||{};
          return{...a,name:s.name,avatar:s.avatar,terminal:t.name};
        });

      return {totalStudents:students.length,presentToday:presentIds.length,lateToday,onlineTerminals:onlineT,hourlyTrend,departments:Object.values(deptMap).sort((a,b)=>a.department.localeCompare(b.department)),recentLogs};
    },

    recognize() {
      const students  = load(KEYS.students)||[];
      const terminals = load(KEYS.terminals)||[];
      const enrolled  = students.filter(s=>s.bio_status==='Enrolled');
      if (!enrolled.length) return null;
      const student    = enrolled[Math.floor(Math.random()*enrolled.length)];
      const confidence = +(0.87+Math.random()*0.12).toFixed(2);
      const hour       = new Date().getHours();
      const status     = hour>=9 && Math.random()>0.75 ? 'Late':'Present';
      const terminal   = terminals.find(t=>t.status==='Online');
      this.addAttendance({student_id:student.id,terminal_id:terminal?.id,status,course:student.course});
      return {student,confidence,status,timestamp:now()};
    },

    getTerminals() { return load(KEYS.terminals)||[]; }
  };
})();

DB.init();
