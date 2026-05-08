// ── College Attendance System — Client-Side DB ────────────────────────────────
const DB = (() => {
  const K = {
    users:'fas_users', students:'fas_students', terminals:'fas_terminals',
    attendance:'fas_attendance', seq:'fas_seq', session:'fas_session',
    face:'fas_face_data', ann:'fas_announcements', settings:'fas_settings'
  };
  const load  = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const save  = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch(e) { console.warn('Storage full',e); } };
  const ts    = () => new Date().toISOString();
  const nid   = t  => { const s=load(K.seq)||{}; s[t]=(s[t]||0)+1; save(K.seq,s); return s[t]; };
  const av    = n  => (n||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  // ── Seed ──────────────────────────────────────────────────────────────────
  function seed() {
    if ((load(K.users)||[]).length > 0) return;
    const h = p => btoa(unescape(encodeURIComponent(p)));
    save(K.users, [
      {id:'u1',name:'Admin User',       email:'admin@college.edu',    pwd:h('Admin@123'),   role:'admin',   dept:'Administration',        empId:'ADM001', avatar:'AU', active:true, createdAt:ts()},
      {id:'u2',name:'Dr. Rahul Sharma', email:'hod.cs@college.edu',   pwd:h('Hod@1234'),    role:'hod',     dept:'Computer Science',       empId:'HOD001', avatar:'RS', active:true, createdAt:ts()},
      {id:'u3',name:'Dr. Priya Patel',  email:'hod.ee@college.edu',   pwd:h('Hod@1234'),    role:'hod',     dept:'Electrical Engineering', empId:'HOD002', avatar:'PP', active:true, createdAt:ts()},
      {id:'u4',name:'Prof. Amit Verma', email:'faculty1@college.edu', pwd:h('Faculty@123'), role:'faculty', dept:'Computer Science',       empId:'FAC001', avatar:'AV', active:true, createdAt:ts()},
      {id:'u5',name:'Prof. Sneha Joshi',email:'faculty2@college.edu', pwd:h('Faculty@123'), role:'faculty', dept:'Electrical Engineering', empId:'FAC002', avatar:'SJ', active:true, createdAt:ts()},
      {id:'u6',name:'Ethan Smith',      email:'ethan@college.edu',    pwd:h('Student@123'), role:'student', dept:'Computer Science',       stuId:'CS2401', avatar:'ES', active:true, createdAt:ts()},
      {id:'u7',name:'Mia Wong',         email:'mia@college.edu',      pwd:h('Student@123'), role:'student', dept:'Computer Science',       stuId:'CS2402', avatar:'MW', active:true, createdAt:ts()},
      {id:'u8',name:'Liam Johnson',     email:'liam@college.edu',     pwd:h('Student@123'), role:'student', dept:'Electrical Engineering', stuId:'EE2401', avatar:'LJ', active:true, createdAt:ts()},
    ]);
    save(K.students, [
      {id:'s1', stuId:'CS2401',name:'Ethan Smith',    email:'ethan@college.edu', dept:'Computer Science',       course:'CS-101',year:2,bio:'Enrolled',avatar:'ES',userId:'u6', phone:''},
      {id:'s2', stuId:'CS2402',name:'Mia Wong',       email:'mia@college.edu',   dept:'Computer Science',       course:'CS-102',year:2,bio:'Enrolled',avatar:'MW',userId:'u7', phone:''},
      {id:'s3', stuId:'EE2401',name:'Liam Johnson',   email:'liam@college.edu',  dept:'Electrical Engineering', course:'EE-201',year:3,bio:'Enrolled',avatar:'LJ',userId:'u8', phone:''},
      {id:'s4', stuId:'EE2402',name:'Chloe Davis',    email:'chloe@college.edu', dept:'Electrical Engineering', course:'EE-202',year:3,bio:'Enrolled',avatar:'CD', phone:''},
      {id:'s5', stuId:'ME2401',name:'Noah Martinez',  email:'noah@college.edu',  dept:'Mechanical Engineering', course:'ME-301',year:4,bio:'Pending', avatar:'NM', phone:''},
      {id:'s6', stuId:'ME2402',name:'Ava Thompson',   email:'ava@college.edu',   dept:'Mechanical Engineering', course:'ME-302',year:4,bio:'Enrolled',avatar:'AT', phone:''},
      {id:'s7', stuId:'CE2401',name:'Oliver Brown',   email:'oliver@college.edu',dept:'Civil Engineering',      course:'CE-101',year:1,bio:'Enrolled',avatar:'OB', phone:''},
      {id:'s8', stuId:'CE2402',name:'Emma Wilson',    email:'emma@college.edu',  dept:'Civil Engineering',      course:'CE-102',year:1,bio:'Failed',  avatar:'EW', phone:''},
      {id:'s9', stuId:'CS2403',name:'James Anderson', email:'james@college.edu', dept:'Computer Science',       course:'CS-201',year:2,bio:'Enrolled',avatar:'JA', phone:''},
      {id:'s10',stuId:'CS2404',name:'Sophia Taylor',  email:'sophia@college.edu',dept:'Computer Science',       course:'CS-301',year:3,bio:'Pending', avatar:'ST', phone:''},
      {id:'s11',stuId:'EE2403',name:'Benjamin Lee',   email:'ben@college.edu',   dept:'Electrical Engineering', course:'EE-301',year:4,bio:'Enrolled',avatar:'BL', phone:''},
      {id:'s12',stuId:'ME2403',name:'Isabella Harris',email:'isa@college.edu',   dept:'Mechanical Engineering', course:'ME-201',year:2,bio:'Enrolled',avatar:'IH', phone:''},
      {id:'s13',stuId:'CE2403',name:'Lucas Clark',    email:'lucas@college.edu', dept:'Civil Engineering',      course:'CE-201',year:2,bio:'Enrolled',avatar:'LC', phone:''},
      {id:'s14',stuId:'CS2405',name:'Charlotte Lewis',email:'char@college.edu',  dept:'Computer Science',       course:'CS-101',year:1,bio:'Pending', avatar:'CL', phone:''},
      {id:'s15',stuId:'EE2404',name:'Henry Walker',   email:'henry@college.edu', dept:'Electrical Engineering', course:'EE-101',year:1,bio:'Enrolled',avatar:'HW', phone:''},
    ]);
    save(K.terminals,[
      {id:'t1',name:'Terminal North-A',loc:'Main Building - North Entrance',  status:'Online'},
      {id:'t2',name:'Terminal North-B',loc:'Main Building - North Exit',       status:'Online'},
      {id:'t3',name:'Terminal West-C', loc:'Science Block - West Wing',        status:'Online'},
      {id:'t4',name:'Terminal East-B', loc:'Arts Block - East Entrance',       status:'Online'},
      {id:'t5',name:'Terminal South-D',loc:'Sports Complex - South Gate',      status:'Offline'},
      {id:'t6',name:'Terminal Lab-E',  loc:'Computer Lab - Block C',           status:'Online'},
    ]);
    // 7-day history
    const enrolled=load(K.students).filter(s=>s.bio==='Enrolled');
    const terms=load(K.terminals).filter(t=>t.status==='Online');
    const recs=[]; let aid=0;
    for(let d=6;d>=0;d--){
      const dt=new Date(); dt.setDate(dt.getDate()-d);
      const ds=dt.toISOString().split('T')[0];
      enrolled.forEach((s,i)=>{
        if(Math.random()>.15){
          const h=8+Math.floor(Math.random()*4);
          const m=String(Math.floor(Math.random()*60)).padStart(2,'0');
          recs.push({id:`a${++aid}`,stuRef:s.id,stuId:s.stuId,stuName:s.name,avatar:s.avatar,
            dept:s.dept,course:s.course,terminal:terms[i%terms.length].name,
            checkIn:`${ds}T${String(h).padStart(2,'0')}:${m}:00`,
            status:h>=9&&Math.random()>.7?'Late':'Present',verified:true,
            conf:+(0.87+Math.random()*.12).toFixed(2)});
        }
      });
    }
    save(K.attendance,recs);
    save(K.seq,{u:8,s:15,a:aid});
    console.log(`✅ DB seeded: ${load(K.users).length}u ${load(K.students).length}s ${recs.length}att`);
  }

  return {
    seed,
    // ── Auth ─────────────────────────────────────────────────────────────────
    login(email,pwd){
      const h=p=>btoa(unescape(encodeURIComponent(p)));
      const u=(load(K.users)||[]).find(u=>u.email===email);
      if(!u||u.active===false) return null;
      if(u.pwd!==h(pwd)) return null;
      const {pwd:_,...safe}=u; save(K.session,safe); return safe;
    },
    logout(){ localStorage.removeItem(K.session); },
    getSession(){ return load(K.session); },
    register(data){
      const h=p=>btoa(unescape(encodeURIComponent(p)));
      const users=load(K.users)||[];
      if(users.find(u=>u.email===data.email)) throw new Error('Email already registered');
      const id='u'+nid('u'), avatar=av(data.name);
      const u={id,avatar,active:true,createdAt:ts(),...data,pwd:h(data.pwd||'')};
      delete u.pwd_confirm;
      users.push(u); save(K.users,users);
      if(data.role==='student'&&data.stuId){
        const sts=load(K.students)||[];
        if(!sts.find(s=>s.stuId===data.stuId)){
          sts.push({id:'s'+nid('s'),stuId:data.stuId,name:data.name,email:data.email,
            dept:data.dept,course:'',year:1,bio:'Pending',avatar,userId:id,phone:''});
          save(K.students,sts);
        }
      }
      const {pwd:_,...safe}=u; save(K.session,safe); return safe;
    },
    // ── Students ─────────────────────────────────────────────────────────────
    getStudents({dept,bio,search,limit=50,offset=0}={}){
      let r=load(K.students)||[];
      if(dept&&dept!=='all') r=r.filter(s=>s.dept===dept);
      if(bio &&bio !=='all') r=r.filter(s=>s.bio===bio);
      if(search){const q=search.toLowerCase();r=r.filter(s=>s.name.toLowerCase().includes(q)||s.stuId.toLowerCase().includes(q)||(s.email||'').toLowerCase().includes(q));}
      r.sort((a,b)=>a.name.localeCompare(b.name));
      return {rows:r.slice(+offset,+offset+(+limit)),total:r.length};
    },
    getStudent(id){ return (load(K.students)||[]).find(s=>s.id===id||s.stuId===id)||null; },
    addStudent(d){
      const all=load(K.students)||[];
      if(all.find(s=>s.stuId===d.stuId)) throw new Error('Student ID already exists');
      const s={id:'s'+nid('s'),avatar:av(d.name),bio:'Pending',phone:'',...d};
      all.push(s); save(K.students,all); return s;
    },
    updateStudent(id,fields){
      const all=load(K.students)||[];
      const i=all.findIndex(s=>s.id===id||s.stuId===id);
      if(i===-1) return null;
      Object.assign(all[i],fields); save(K.students,all); return all[i];
    },
    deleteStudent(id){
      const all=load(K.students)||[];
      const i=all.findIndex(s=>s.id===id);
      if(i===-1) return false;
      all.splice(i,1); save(K.students,all); return true;
    },
    // ── Face Data ─────────────────────────────────────────────────────────────
    saveFaceData(stuId, samples){
      const fd=load(K.face)||{};
      fd[stuId]={samples,enrolledAt:ts(),count:samples.length};
      save(K.face,fd);
      this.updateStudent(stuId,{bio:'Enrolled'});
    },
    getFaceData(stuId){ return (load(K.face)||{})[stuId]||null; },
    getAllFaceData(){ return load(K.face)||{}; },
    deleteFaceData(stuId){
      const fd=load(K.face)||{}; delete fd[stuId]; save(K.face,fd);
      this.updateStudent(stuId,{bio:'Pending'});
    },
    hasFaceData(stuId){ return !!(load(K.face)||{})[stuId]; },
    // ── Attendance ────────────────────────────────────────────────────────────
    getAttendance({dept,status,date,search,stuRef,limit=60,offset=0}={}){
      let r=load(K.attendance)||[];
      if(dept  &&dept  !=='all') r=r.filter(x=>x.dept===dept);
      if(status&&status!=='all') r=r.filter(x=>x.status===status);
      if(date)  r=r.filter(x=>x.checkIn.startsWith(date));
      if(stuRef) r=r.filter(x=>x.stuRef===stuRef||x.stuId===stuRef);
      if(search){const q=search.toLowerCase();r=r.filter(x=>(x.stuName||'').toLowerCase().includes(q)||(x.stuId||'').toLowerCase().includes(q));}
      r.sort((a,b)=>b.checkIn.localeCompare(a.checkIn));
      return {rows:r.slice(+offset,+offset+(+limit)),total:r.length};
    },
    addAttendance({stuId,status,course,terminal,conf}){
      const all=load(K.attendance)||[];
      const s=(load(K.students)||[]).find(s=>s.id===stuId||s.stuId===stuId);
      if(!s) return null;
      const r={id:'a'+nid('a'),stuRef:s.id,stuId:s.stuId,stuName:s.name,avatar:s.avatar,
        dept:s.dept,course:course||s.course,terminal:terminal||'Main Terminal',
        checkIn:ts(),status:status||'Present',verified:true,conf:conf||0.95};
      all.push(r); save(K.attendance,all); return r;
    },
    deleteAttendance(id){
      const all=load(K.attendance)||[];
      const i=all.findIndex(a=>a.id===id);
      if(i===-1) return false;
      all.splice(i,1); save(K.attendance,all); return true;
    },
    // ── Face Recognition (match against enrolled students) ────────────────────
    recognize(deptFilter){
      const all=load(K.students)||[];
      const fd=load(K.face)||{};
      // Prefer students with actual face data enrolled
      let enrolled=all.filter(s=>s.bio==='Enrolled');
      if(deptFilter) enrolled=enrolled.filter(s=>s.dept===deptFilter);
      if(!enrolled.length) return null;
      // Simulate face matching: pick random enrolled student
      const s=enrolled[Math.floor(Math.random()*enrolled.length)];
      const hasData=!!fd[s.id];
      const conf=hasData ? +(0.91+Math.random()*.08).toFixed(2) : +(0.72+Math.random()*.12).toFixed(2);
      const h=new Date().getHours();
      const status=h>=9&&Math.random()>.75?'Late':'Present';
      const terms=(load(K.terminals)||[]).filter(t=>t.status==='Online');
      const term=terms[Math.floor(Math.random()*terms.length)]?.name||'Recognition Terminal';
      const rec=this.addAttendance({stuId:s.id,status,course:s.course,terminal:'Recognition Terminal',conf});
      return {student:s,conf,status,record:rec,timestamp:ts(),hasFaceData:hasData};
    },
    // ── Stats ─────────────────────────────────────────────────────────────────
    getStats(deptFilter){
      const today=new Date().toISOString().split('T')[0];
      let sts=load(K.students)||[], att=load(K.attendance)||[];
      if(deptFilter){sts=sts.filter(s=>s.dept===deptFilter);att=att.filter(a=>a.dept===deptFilter);}
      const todayRecs=att.filter(a=>a.checkIn.startsWith(today));
      const presentIds=[...new Set(todayRecs.filter(a=>a.status!=='Absent').map(a=>a.stuRef))];
      const hourMap={};
      todayRecs.forEach(a=>{const h=a.checkIn.slice(11,13);hourMap[h]=(hourMap[h]||0)+1;});
      const hourlyTrend=Object.entries(hourMap).sort().map(([hour,count])=>({hour,count}));
      const deptMap={};
      sts.forEach(s=>{
        if(!deptMap[s.dept])deptMap[s.dept]={dept:s.dept,total:0,present:0,faceEnrolled:0};
        deptMap[s.dept].total++;
        if(presentIds.includes(s.id))deptMap[s.dept].present++;
        if(this.hasFaceData(s.id))deptMap[s.dept].faceEnrolled++;
      });
      return {
        total:sts.length, present:presentIds.length,
        late:todayRecs.filter(a=>a.status==='Late').length,
        terminals:(load(K.terminals)||[]).filter(t=>t.status==='Online').length,
        faceEnrolled:Object.keys(load(K.face)||{}).length,
        hourlyTrend, recentLogs:[...att].sort((a,b)=>b.checkIn.localeCompare(a.checkIn)).slice(0,12),
        depts:Object.values(deptMap).sort((a,b)=>a.dept.localeCompare(b.dept))
      };
    },
    // ── Others ───────────────────────────────────────────────────────────────
    getTerminals(){ return load(K.terminals)||[]; },
    getUsers(){return (load(K.users)||[]).map(({pwd:_,...u})=>u);},
    getUser(id){const u=(load(K.users)||[]).find(u=>u.id===id);if(!u)return null;const{pwd:_,...s}=u;return s;},
    settings(){return {...{collegeName:'National Institute of Technology',attendanceThreshold:75,lateGraceMins:10},...(load(K.settings)||{})};},
  };
})();
DB.seed();
