// Requires api.js to be loaded first
const App = {
  ROLE_CONFIG: {
    admin:   { label:'Administrator',  color:'#3b82f6', icon:'admin_panel_settings' },
    hod:     { label:'Head of Dept',   color:'#10b981', icon:'manage_accounts' },
    faculty: { label:'Faculty',        color:'#8b5cf6', icon:'person_book' },
    student: { label:'Student',        color:'#f59e0b', icon:'school' },
  },
  NAV: {
    admin: [
      { href:'dashboard.html',  icon:'dashboard',              label:'Dashboard' },
      { href:'verify.html',     icon:'how_to_reg',             label:'Verify Students' },
      { href:'students.html',   icon:'group',                  label:'Students' },
      { href:'enroll.html',     icon:'face_retouching_natural',label:'Face Enroll' },
      { href:'recognition.html',icon:'face_unlock',            label:'Recognition' },
      { href:'attendance.html', icon:'list_alt',               label:'Attendance' },
      { href:'reports.html',    icon:'bar_chart',              label:'Reports' },
      { href:'users.html',      icon:'manage_accounts',        label:'User Mgmt' },
      { href:'announcements.html',icon:'campaign',             label:'Announcements' },
      { href:'database.html',   icon:'storage',                label:'DB Schema' },
      { href:'settings.html',   icon:'settings',               label:'Settings' },
    ],
    hod: [
      { href:'dashboard.html',  icon:'dashboard',              label:'Dashboard' },
      { href:'verify.html',     icon:'how_to_reg',             label:'Verify Students' },
      { href:'students.html',   icon:'group',                  label:'My Students' },
      { href:'enroll.html',     icon:'face_retouching_natural',label:'Face Enroll' },
      { href:'recognition.html',icon:'face_unlock',            label:'Recognition' },
      { href:'attendance.html', icon:'list_alt',               label:'Attendance' },
      { href:'reports.html',    icon:'bar_chart',              label:'Reports' },
      { href:'faculty.html',    icon:'person_book',            label:'My Faculty' },
      { href:'announcements.html',icon:'campaign',             label:'Announcements' },
    ],
    faculty: [
      { href:'dashboard.html',  icon:'dashboard',              label:'Dashboard' },
      { href:'students.html',   icon:'group',                  label:'Students' },
      { href:'recognition.html',icon:'face_unlock',            label:'Mark Attendance' },
      { href:'attendance.html', icon:'list_alt',               label:'Attendance' },
      { href:'reports.html',    icon:'bar_chart',              label:'Reports' },
      { href:'announcements.html',icon:'campaign',             label:'Announcements' },
    ],
    student: [
      { href:'student.html',      icon:'dashboard',            label:'My Dashboard' },
      { href:'my-attendance.html',icon:'list_alt',             label:'My Attendance' },
      { href:'timetable.html',    icon:'calendar_month',       label:'Timetable' },
      { href:'announcements.html',icon:'campaign',             label:'Announcements' },
      { href:'profile.html',      icon:'person',               label:'My Profile' },
    ],
  },

  init(roles=[]) {
    const sess = Api.getUser();
    if (!sess || !Api.getToken()) { window.location.href='login.html'; return null; }
    if (roles.length && !roles.includes(sess.role)) {
      window.location.href = sess.role==='student'?'student.html':'dashboard.html';
      return null;
    }
    this._renderShell(sess);
    return sess;
  },

  _renderShell(user) {
    const rc   = this.ROLE_CONFIG[user.role]||this.ROLE_CONFIG.student;
    const nav  = this.NAV[user.role]||this.NAV.student;
    const page = location.pathname.split('/').pop()||'index.html';

    const navHtml = nav.map(n=>{
      const active = page===n.href;
      return `<a href="${n.href}" class="nav-link${active?' nav-active':''}" title="${n.label}">
        <span class="material-symbols-outlined nav-icon">${n.icon}</span>
        <span class="nav-label">${n.label}</span>
        ${active?'<span class="nav-pip"></span>':''}
      </a>`;
    }).join('');

    document.body.innerHTML = `
<div class="app-wrap">
  <!-- Sidebar -->
  <aside id="sidebar" class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon" style="background:${rc.color}">
        <span class="material-symbols-outlined" style="font-size:20px;color:white">school</span>
      </div>
      <div class="logo-text">
        <p class="logo-name">Attendance System</p>
        <p class="logo-sub">Management Portal</p>
      </div>
      <button class="sidebar-close" onclick="App.closeSidebar()">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="user-chip">
      <div class="user-av" style="background:${rc.color}">${user.avatar||(user.name||'?').slice(0,2).toUpperCase()}</div>
      <div class="user-info">
        <p class="user-name">${user.name}</p>
        <div class="user-role">
          <span class="role-dot" style="background:${rc.color}"></span>
          <span>${rc.label}</span>
        </div>
      </div>
    </div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <button class="logout-btn" onclick="App.logout()">
      <span class="material-symbols-outlined" style="font-size:18px">logout</span>
      <span class="nav-label">Sign Out</span>
    </button>
  </aside>

  <!-- Overlay -->
  <div id="overlay" class="overlay" onclick="App.closeSidebar()"></div>

  <!-- Main -->
  <div class="main-wrap">
    <header class="topbar">
      <div class="topbar-left">
        <button class="menu-btn" onclick="App.openSidebar()">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="page-heading">
          <h1 id="page-title" class="page-title"></h1>
          <p id="page-sub" class="page-sub"></p>
        </div>
      </div>
      <div class="topbar-right">
        <div id="clock" class="clock"></div>
        <a href="profile.html" class="topbar-user">
          <div class="topbar-av" style="background:${rc.color}">${user.avatar||(user.name||'?').slice(0,2).toUpperCase()}</div>
          <span class="topbar-name">${user.name.split(' ')[0]}</span>
        </a>
        <button onclick="App.logout()" class="topbar-logout" title="Sign out">
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
    <main class="page-main">
      <div id="page-content" class="page-body"></div>
    </main>
  </div>
</div>

<style>
:root{
  --sidebar-w:240px;
  --topbar-h:58px;
  --radius:14px;
  --shadow:0 1px 4px rgba(0,0,0,.07);
}
*{font-family:'Inter',sans-serif;box-sizing:border-box;margin:0;padding:0}
body{background:#f1f5f9}

/* App layout */
.app-wrap{display:flex;height:100vh;overflow:hidden}
.main-wrap{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}

/* Sidebar */
.sidebar{
  width:var(--sidebar-w);flex-shrink:0;
  background:linear-gradient(160deg,#0f172a 0%,#1e293b 100%);
  display:flex;flex-direction:column;
  height:100vh;z-index:30;transition:transform .3s;overflow:hidden;
}
.sidebar-logo{display:flex;align-items:center;gap:10px;padding:16px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
.logo-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.logo-name{font-size:12px;font-weight:700;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.logo-sub{font-size:10px;color:rgba(255,255,255,.4);white-space:nowrap}
.logo-text{flex:1;min-width:0}
.sidebar-close{display:none;border:none;background:none;color:rgba(255,255,255,.4);cursor:pointer;padding:4px}

.user-chip{display:flex;align-items:center;gap:10px;margin:12px 10px;background:rgba(255,255,255,.06);border-radius:12px;padding:10px 12px;border:1px solid rgba(255,255,255,.08)}
.user-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:12px;flex-shrink:0}
.user-info{overflow:hidden;flex:1}
.user-name{font-size:12px;font-weight:700;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-role{display:flex;align-items:center;gap:4px;margin-top:2px}
.user-role span{font-size:10px;color:rgba(255,255,255,.5)}
.role-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

.sidebar-nav{flex:1;overflow-y:auto;padding:6px 8px;display:flex;flex-direction:column;gap:2px}
.sidebar-nav::-webkit-scrollbar{width:3px}
.sidebar-nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:99px}
.nav-link{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;text-decoration:none;color:rgba(255,255,255,.55);font-size:12px;font-weight:500;transition:all .18s;position:relative}
.nav-link:hover{background:rgba(255,255,255,.08);color:white}
.nav-active{background:rgba(255,255,255,.12)!important;color:white!important;font-weight:700}
.nav-icon{font-size:18px!important;flex-shrink:0}
.nav-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.nav-pip{position:absolute;right:10px;width:6px;height:6px;border-radius:50%;background:white}

.logout-btn{display:flex;align-items:center;gap:10px;padding:12px 20px;border:none;background:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:12px;font-weight:600;transition:all .2s;border-top:1px solid rgba(255,255,255,.08);text-align:left}
.logout-btn:hover{color:#ef4444;background:rgba(239,68,68,.08)}

/* Topbar */
.topbar{height:var(--topbar-h);background:white;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;padding:0 16px 0 14px;flex-shrink:0;box-shadow:var(--shadow)}
.topbar-left{display:flex;align-items:center;gap:10px;min-width:0;flex:1}
.menu-btn{display:none;border:none;background:none;cursor:pointer;padding:7px;border-radius:9px;color:#64748b;flex-shrink:0}
.menu-btn:hover{background:#f1f5f9}
.page-heading{min-width:0}
.page-title{font-size:15px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.page-sub{font-size:11px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.topbar-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.clock{font-size:11px;color:#64748b;font-family:monospace;background:#f8fafc;padding:5px 10px;border-radius:8px;border:1px solid #e2e8f0;white-space:nowrap}
.topbar-user{display:flex;align-items:center;gap:7px;text-decoration:none;padding:5px 10px;border-radius:9px;transition:background .15s;border:1px solid transparent}
.topbar-user:hover{background:#f8fafc;border-color:#e2e8f0}
.topbar-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:10px;flex-shrink:0}
.topbar-name{font-size:12px;font-weight:600;color:#374151}
.topbar-logout{border:none;background:none;cursor:pointer;color:#94a3b8;padding:7px;border-radius:9px;display:flex;align-items:center;transition:all .15s}
.topbar-logout:hover{background:#fee2e2;color:#ef4444}

/* Main content */
.page-main{flex:1;overflow-y:auto;background:#f1f5f9}
.page-body{padding:20px;min-height:calc(100vh - var(--topbar-h))}

/* Overlay */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:20;backdrop-filter:blur(2px)}

/* Cards & common */
.card{background:white;border-radius:var(--radius);border:1px solid #e8edf2;box-shadow:var(--shadow)}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .18s;text-decoration:none;white-space:nowrap}
.btn-primary{background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(59,130,246,.38)}
.btn-secondary{background:white;color:#374151;border:1.5px solid #e2e8f0}
.btn-secondary:hover{background:#f8fafc;border-color:#cbd5e1}
.btn-danger{background:linear-gradient(135deg,#ef4444,#dc2626);color:white}
.btn-danger:hover{box-shadow:0 4px 12px rgba(239,68,68,.3)}
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600}
.badge-green{background:#dcfce7;color:#166534}
.badge-amber{background:#fef3c7;color:#92400e}
.badge-red{background:#fee2e2;color:#991b1b}
.badge-blue{background:#dbeafe;color:#1e40af}
.badge-purple{background:#f3e8ff;color:#6b21a8}
table{width:100%;border-collapse:collapse}
th{background:#f8fafc;text-align:left;padding:11px 14px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1.5px solid #e2e8f0}
td{padding:12px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151}
tr:hover td{background:#fafbff}
tr:last-child td{border-bottom:none}
input,select,textarea{background:white;border:1.5px solid #e2e8f0;border-radius:10px;padding:9px 13px;font-size:13px;color:#1e293b;transition:all .2s;width:100%;font-family:inherit;outline:none}
input:focus,select:focus,textarea:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
.stat-card{background:white;border-radius:var(--radius);padding:18px;border:1px solid #e8edf2;box-shadow:var(--shadow);transition:all .2s}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.09)}
.modal-bd{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:white;border-radius:20px;padding:26px;width:100%;max-width:480px;box-shadow:0 25px 60px rgba(0,0,0,.2);animation:modalIn .2s ease;max-height:90vh;overflow-y:auto}
@keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}

/* Mobile */
@media(max-width:768px){
  .sidebar{position:fixed;left:0;top:0;bottom:0;transform:translateX(-100%);transition:transform .28s ease}
  .sidebar.open{transform:translateX(0)}
  .overlay.open{display:block}
  .menu-btn{display:flex}
  .sidebar-close{display:block}
  .clock{display:none}
  .topbar-name{display:none}
  .page-body{padding:14px}
  .logo-text{display:block}
}
@media(max-width:480px){
  .page-body{padding:10px}
  .topbar{padding:0 10px}
}

/* Utilities */
.scrollbar-hide::-webkit-scrollbar{display:none}
.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
</style>`;

    // Page title
    const t=document.querySelector('meta[name="page-title"]');
    const s=document.querySelector('meta[name="page-sub"]');
    if(t) document.getElementById('page-title').textContent=t.content;
    if(s) document.getElementById('page-sub').textContent=s.content;

    // Clock
    const tick=()=>{ const el=document.getElementById('clock'); if(el) el.textContent=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); };
    tick(); setInterval(tick,1000);
  },

  openSidebar(){
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').classList.add('open');
  },
  closeSidebar(){
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
  },
  logout(){
    if(confirm('Sign out of the system?')){DB.logout();window.location.href='login.html';}
  },

  toast(msg,type='success'){
    const colors={success:'#10b981',error:'#ef4444',info:'#3b82f6',warning:'#f59e0b'};
    const icons={success:'check_circle',error:'cancel',info:'info',warning:'warning'};
    const c=colors[type]||'#3b82f6', ic=icons[type]||'info';
    const el=document.createElement('div');
    el.innerHTML=`<div style="position:fixed;bottom:22px;right:22px;z-index:9999;display:flex;align-items:center;gap:10px;background:white;border:1.5px solid ${c}30;color:#1e293b;padding:11px 18px;border-radius:13px;font-size:13px;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,.12);animation:modalIn .25s ease;max-width:320px">
      <span class="material-symbols-outlined" style="color:${c};font-size:19px;flex-shrink:0">${ic}</span><span style="flex:1">${msg}</span>
    </div>`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),3500);
  },

  modal(title,content,onOk){
    const id='app-modal-'+Date.now();
    const el=document.createElement('div');
    el.className='modal-bd'; el.id=id;
    el.innerHTML=`<div class="modal">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <h3 style="font-size:15px;font-weight:800;color:#0f172a">${title}</h3>
        <button onclick="document.getElementById('${id}').remove()" style="border:none;background:#f1f5f9;border-radius:8px;width:30px;height:30px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748b">
          <span class="material-symbols-outlined" style="font-size:18px">close</span>
        </button>
      </div>
      <div id="${id}-body">${content}</div>
      ${onOk?`<div style="display:flex;gap:10px;margin-top:18px">
        <button onclick="document.getElementById('${id}').remove()" class="btn btn-secondary" style="flex:1;justify-content:center">Cancel</button>
        <button id="${id}-ok" class="btn btn-primary" style="flex:1;justify-content:center">Confirm</button>
      </div>`:''}
    </div>`;
    document.body.appendChild(el);
    if(onOk) document.getElementById(`${id}-ok`).onclick=()=>{onOk();el.remove();};
  },

  formatDate: d=>new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
  formatTime: d=>new Date(d).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}),
  formatDateTime: d=>`${App.formatDate(d)} ${App.formatTime(d)}`,

  badgeHtml(s){
    const m={Present:'badge-green',Late:'badge-amber',Absent:'badge-red',Enrolled:'badge-green',Pending:'badge-amber',Failed:'badge-red',Online:'badge-green',Offline:'badge-red',Active:'badge-green',Disabled:'badge-red'};
    return `<span class="badge ${m[s]||'badge-blue'}">${s}</span>`;
  },

  avatar(name,color='#3b82f6',size=32){
    const a=(name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:${Math.round(size*.35)}px;flex-shrink:0">${a}</div>`;
  },

  roleColor:r=>({admin:'#3b82f6',hod:'#10b981',faculty:'#8b5cf6',student:'#f59e0b'}[r]||'#64748b'),

  donut(pct,color='#3b82f6',size=90){
    const r=34,c=2*Math.PI*r,d=pct/100*c;
    return `<svg width="${size}" height="${size}" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="8"/>
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="${color}" stroke-width="8"
        stroke-dasharray="${d} ${c}" stroke-dashoffset="${c/4}" stroke-linecap="round"
        style="transition:stroke-dasharray .8s ease"/>
      <text x="40" y="45" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a">${pct}%</text>
    </svg>`;
  },

  barChart(id,data,color='#3b82f6'){
    const el=document.getElementById(id);
    if(!el||!data.length){if(el)el.innerHTML='<p style="color:#94a3b8;font-size:12px;text-align:center;padding:20px 0">No data</p>';return;}
    const max=Math.max(...data.map(d=>d.count),1);
    el.innerHTML=`<div style="display:flex;align-items:flex-end;gap:5px;height:100%;padding:4px 0">
      ${data.map(d=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end">
        <span style="font-size:9px;color:#64748b;font-weight:600">${d.count||''}</span>
        <div style="width:100%;border-radius:5px 5px 0 0;background:${color};height:${Math.round(d.count/max*100)}%;min-height:${d.count?3:0}px;transition:height .5s ease;opacity:.85"></div>
        <span style="font-size:9px;color:#94a3b8;font-weight:600">${d.hour}</span>
      </div>`).join('')}
    </div>`;
  },
};
