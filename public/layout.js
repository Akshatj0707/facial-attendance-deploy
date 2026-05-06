// ── Shared Layout & Utilities ─────────────────────────────────────────────────
const App = {
  ROLE_CONFIG: {
    admin:   { label:'Administrator',    color:'#3b82f6', bg:'bg-blue-600',   light:'bg-blue-50',   text:'text-blue-600',   icon:'admin_panel_settings' },
    hod:     { label:'Head of Dept',     color:'#10b981', bg:'bg-emerald-600',light:'bg-emerald-50',text:'text-emerald-600',icon:'manage_accounts' },
    faculty: { label:'Faculty',          color:'#8b5cf6', bg:'bg-purple-600', light:'bg-purple-50', text:'text-purple-600', icon:'person_book' },
    student: { label:'Student',          color:'#f59e0b', bg:'bg-amber-500',  light:'bg-amber-50',  text:'text-amber-600',  icon:'school' },
  },

  NAV: {
    admin: [
      { href:'dashboard.html',  icon:'dashboard',           label:'Dashboard' },
      { href:'students.html',   icon:'group',               label:'Students' },
      { href:'enroll.html',     icon:'face_retouching_natural', label:'Face Enroll' },
      { href:'attendance.html', icon:'list_alt',             label:'Attendance' },
      { href:'recognition.html',icon:'face_unlock',          label:'Recognition' },
      { href:'reports.html',    icon:'bar_chart',            label:'Reports' },
      { href:'users.html',      icon:'manage_accounts',      label:'User Management' },
      { href:'announcements.html',icon:'campaign',           label:'Announcements' },
      { href:'settings.html',   icon:'settings',             label:'Settings' },
    ],
    hod: [
      { href:'dashboard.html',  icon:'dashboard',           label:'Dashboard' },
      { href:'students.html',   icon:'group',               label:'My Students' },
      { href:'enroll.html',     icon:'face_retouching_natural', label:'Face Enroll' },
      { href:'attendance.html', icon:'list_alt',             label:'Attendance' },
      { href:'recognition.html',icon:'face_unlock',          label:'Recognition' },
      { href:'reports.html',    icon:'bar_chart',            label:'Reports' },
      { href:'faculty.html',    icon:'person_book',          label:'My Faculty' },
      { href:'announcements.html',icon:'campaign',           label:'Announcements' },
    ],
    faculty: [
      { href:'dashboard.html',  icon:'dashboard',           label:'Dashboard' },
      { href:'students.html',   icon:'group',               label:'Students' },
      { href:'attendance.html', icon:'list_alt',             label:'Attendance' },
      { href:'recognition.html',icon:'face_unlock',          label:'Mark Attendance' },
      { href:'reports.html',    icon:'bar_chart',            label:'Reports' },
      { href:'announcements.html',icon:'campaign',           label:'Announcements' },
    ],
    student: [
      { href:'student.html',    icon:'dashboard',           label:'My Dashboard' },
      { href:'my-attendance.html',icon:'list_alt',          label:'My Attendance' },
      { href:'timetable.html',  icon:'calendar_month',      label:'Timetable' },
      { href:'profile.html',    icon:'person',              label:'My Profile' },
      { href:'announcements.html',icon:'campaign',          label:'Announcements' },
    ],
  },

  init(requiredRoles = []) {
    const sess = DB.getSession();
    if (!sess) { window.location.href = 'login.html'; return null; }
    if (requiredRoles.length && !requiredRoles.includes(sess.role)) {
      window.location.href = sess.role === 'student' ? 'student.html' : 'dashboard.html';
      return null;
    }
    this.renderShell(sess);
    return sess;
  },

  renderShell(user) {
    const rc  = this.ROLE_CONFIG[user.role] || this.ROLE_CONFIG.student;
    const nav = this.NAV[user.role] || this.NAV.student;
    const page= location.pathname.split('/').pop() || 'index.html';

    const navItems = nav.map(n => {
      const active = page === n.href;
      return `<a href="${n.href}" class="nav-item flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 transition-all text-sm font-medium
        ${active ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:bg-white/10 hover:text-white'}">
        <span class="material-symbols-outlined text-[20px]">${n.icon}</span>
        <span class="nav-label">${n.label}</span>
        ${active ? '<div class="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>' : ''}
      </a>`;
    }).join('');

    document.body.innerHTML = `
    <div class="app-layout flex h-screen overflow-hidden bg-slate-50">

      <!-- ── Sidebar ── -->
      <aside id="sidebar" class="sidebar flex-shrink-0 flex flex-col transition-all duration-300 z-30"
        style="width:260px;background:linear-gradient(160deg,#0f172a 0%,#1e293b 100%);min-height:100vh">

        <!-- Logo -->
        <div class="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background:${rc.color}">
            <span class="material-symbols-outlined text-white text-xl">school</span>
          </div>
          <div class="nav-label overflow-hidden">
            <p class="text-white font-bold text-sm leading-tight">College Attendance</p>
            <p class="text-slate-400 text-[11px]">Management System</p>
          </div>
          <button id="sidebar-toggle" onclick="App.toggleSidebar()" class="ml-auto text-slate-400 hover:text-white md:hidden">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- User Card -->
        <div class="mx-3 mt-4 mb-2 p-3 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm" style="background:${rc.color}">
              ${user.avatar || (user.name||'?').slice(0,2).toUpperCase()}
            </div>
            <div class="overflow-hidden nav-label">
              <p class="text-white text-sm font-semibold truncate">${user.name}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span class="text-[11px] text-slate-400">${rc.label}</span>
              </div>
            </div>
          </div>
          ${user.dept ? `<p class="text-[10px] text-slate-500 mt-2 truncate nav-label">${user.dept}</p>` : ''}
        </div>

        <!-- Nav -->
        <nav class="flex-1 py-2 overflow-y-auto scrollbar-hide space-y-0.5">${navItems}</nav>

        <!-- Logout -->
        <div class="p-3 border-t border-white/10">
          <button onclick="App.logout()" class="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium mx-0">
            <span class="material-symbols-outlined text-[20px]">logout</span>
            <span class="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- ── Overlay (mobile) ── -->
      <div id="overlay" onclick="App.closeSidebar()" class="fixed inset-0 bg-black/60 z-20 hidden md:hidden"></div>

      <!-- ── Main ── -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Topbar -->
        <header class="flex-shrink-0 bg-white border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm z-10">
          <div class="flex items-center gap-3">
            <button onclick="App.openSidebar()" class="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all md:hidden">
              <span class="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h1 id="page-title" class="font-bold text-slate-900 text-base sm:text-lg leading-tight"></h1>
              <p id="page-sub" class="text-slate-400 text-xs hidden sm:block"></p>
            </div>
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <div id="live-time" class="text-xs text-slate-500 font-mono hidden sm:block bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"></div>
            <button onclick="window.location.href='profile.html'" class="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style="background:${rc.color}">
                ${user.avatar || (user.name||'?').slice(0,2).toUpperCase()}
              </div>
              <span class="text-sm font-medium text-slate-700 hidden sm:block">${user.name.split(' ')[0]}</span>
            </button>
          </div>
        </header>

        <!-- Page content injected here -->
        <main id="main-content" class="flex-1 overflow-y-auto">
          <div id="page-content" class="p-4 sm:p-6"></div>
        </main>
      </div>
    </div>

    <style>
      *{font-family:'Inter',sans-serif;box-sizing:border-box;}
      .scrollbar-hide::-webkit-scrollbar{display:none}
      .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      @media(max-width:768px){
        #sidebar{position:fixed;left:-260px;top:0;bottom:0;transition:left .3s}
        #sidebar.open{left:0}
      }
      .card{background:white;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 1px 3px rgba(0,0,0,.06)}
      .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;transition:all .2s;cursor:pointer;border:none}
      .btn-primary{background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white}
      .btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 15px rgba(59,130,246,.35)}
      .btn-secondary{background:white;color:#374151;border:1.5px solid #e5e7eb}
      .btn-secondary:hover{background:#f9fafb}
      .btn-danger{background:linear-gradient(135deg,#ef4444,#dc2626);color:white}
      .btn-danger:hover{box-shadow:0 4px 15px rgba(239,68,68,.3)}
      .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600}
      .badge-green{background:#dcfce7;color:#166534}
      .badge-amber{background:#fef3c7;color:#92400e}
      .badge-red{background:#fee2e2;color:#991b1b}
      .badge-blue{background:#dbeafe;color:#1e40af}
      .badge-purple{background:#f3e8ff;color:#6b21a8}
      table{width:100%;border-collapse:collapse}
      th{background:#f8fafc;text-align:left;padding:12px 16px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0}
      td{padding:13px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151}
      tr:hover td{background:#fafbff}
      tr:last-child td{border-bottom:none}
      input,select,textarea{background:white;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 14px;font-size:13px;color:#1e293b;transition:all .2s;width:100%;font-family:inherit}
      input:focus,select:focus,textarea:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
      .stat-card{background:white;border-radius:16px;padding:20px;border:1px solid #f1f5f9;box-shadow:0 1px 3px rgba(0,0,0,.05);transition:all .2s}
      .stat-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08);transform:translateY(-1px)}
      .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
      .modal{background:white;border-radius:20px;padding:28px;width:100%;max-width:480px;box-shadow:0 25px 60px rgba(0,0,0,.2);animation:modalIn .2s ease}
      @keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
      .section-title{font-size:18px;font-weight:700;color:#0f172a;margin-bottom:4px}
      .section-sub{font-size:13px;color:#94a3b8;margin-bottom:20px}
      .tab-btn{padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;transition:all .2s;cursor:pointer;border:none;background:transparent;color:#64748b}
      .tab-btn.active{background:white;color:#1e293b;box-shadow:0 1px 3px rgba(0,0,0,.1)}
      .chip{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s}
    </style>`;

    // Set page title from meta or h1
    const titleEl = document.querySelector('meta[name="page-title"]');
    const subEl   = document.querySelector('meta[name="page-sub"]');
    if (titleEl) document.getElementById('page-title').textContent = titleEl.content;
    if (subEl)   document.getElementById('page-sub').textContent   = subEl.content;

    // Live clock
    const tick = () => {
      const el = document.getElementById('live-time');
      if (el) el.textContent = new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    };
    tick(); setInterval(tick, 1000);
  },

  toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('overlay');
    sb.classList.toggle('open');
    ov.classList.toggle('hidden');
  },
  openSidebar()  { document.getElementById('sidebar').classList.add('open');    document.getElementById('overlay').classList.remove('hidden'); },
  closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.add('hidden'); },
  logout() {
    if (confirm('Sign out?')) { DB.logout(); window.location.href = 'login.html'; }
  },

  // ── Helpers ─────────────────────────────────────────────────────────────────
  toast(msg, type='success') {
    const t = document.createElement('div');
    const colors = { success:'#10b981', error:'#ef4444', info:'#3b82f6', warning:'#f59e0b' };
    const icons  = { success:'check_circle', error:'cancel', info:'info', warning:'warning' };
    t.innerHTML = `<div style="position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:10px;background:white;border:1.5px solid ${colors[type]};color:#1e293b;padding:12px 20px;border-radius:14px;font-size:13px;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,.12);animation:slideUp .3s ease">
      <span class="material-symbols-outlined" style="color:${colors[type]};font-size:20px">${icons[type]}</span>${msg}
    </div><style>@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}</style>`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  },

  modal(title, content, onConfirm) {
    const el = document.createElement('div');
    el.className = 'modal-backdrop';
    el.id = 'app-modal';
    el.innerHTML = `<div class="modal">
      <div class="flex items-center justify-between mb-5">
        <h3 style="font-size:16px;font-weight:700;color:#0f172a">${title}</h3>
        <button onclick="document.getElementById('app-modal').remove()" class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
      <div id="modal-body">${content}</div>
      ${onConfirm ? `<div class="flex gap-3 mt-6">
        <button onclick="document.getElementById('app-modal').remove()" class="btn btn-secondary flex-1">Cancel</button>
        <button id="modal-confirm" class="btn btn-primary flex-1">Confirm</button>
      </div>` : ''}
    </div>`;
    document.body.appendChild(el);
    if (onConfirm) document.getElementById('modal-confirm').onclick = () => { onConfirm(); el.remove(); };
  },

  formatDate: d => new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
  formatTime: d => new Date(d).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}),
  formatDateTime: d => `${App.formatDate(d)} ${App.formatTime(d)}`,

  badgeHtml(status) {
    const m = { Present:'badge-green', Late:'badge-amber', Absent:'badge-red', Enrolled:'badge-green', Pending:'badge-amber', Failed:'badge-red', Online:'badge-green', Offline:'badge-red' };
    return `<span class="badge ${m[status]||'badge-blue'}">${status}</span>`;
  },

  avatar(name, color='#3b82f6', size=32) {
    const av = (name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:${Math.round(size*0.35)}px;flex-shrink:0">${av}</div>`;
  },

  roleColor: (role) => ({ admin:'#3b82f6', hod:'#10b981', faculty:'#8b5cf6', student:'#f59e0b' }[role] || '#64748b'),

  // Bar chart renderer
  barChart(containerId, data, color='#3b82f6') {
    const el = document.getElementById(containerId);
    if (!el || !data.length) { if(el) el.innerHTML='<p style="color:#94a3b8;font-size:12px;text-align:center;padding:20px">No data</p>'; return; }
    const max = Math.max(...data.map(d=>d.count), 1);
    el.innerHTML = `<div style="display:flex;align-items:flex-end;gap:6px;height:100%;padding:0 4px">
      ${data.map(d=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
        <span style="font-size:10px;color:#64748b;font-weight:600">${d.count||''}</span>
        <div style="width:100%;border-radius:6px 6px 0 0;background:${color};height:${Math.round(d.count/max*100)}%;min-height:${d.count?4:0}px;transition:height .5s ease" title="${d.count} at ${d.hour}:00"></div>
        <span style="font-size:9px;color:#94a3b8;font-weight:600">${d.hour}</span>
      </div>`).join('')}
    </div>`;
  },

  // Donut chart
  donut(pct, color='#3b82f6', size=80) {
    const r=32; const circ=2*Math.PI*r; const dash=pct/100*circ;
    return `<svg width="${size}" height="${size}" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="8"/>
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="${color}" stroke-width="8"
        stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ/4}" stroke-linecap="round"
        style="transition:stroke-dasharray .8s ease"/>
      <text x="40" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">${pct}%</text>
    </svg>`;
  },
};
