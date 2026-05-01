// ── Shared Auth Utility ───────────────────────────────────────────────────────
const Auth = {
  API: '',

  getToken() { return localStorage.getItem('fas_token'); },
  getUser()  { try { return JSON.parse(localStorage.getItem('fas_user')); } catch(e) { return null; } },

  isLoggedIn() { return !!this.getToken() && !!this.getUser(); },

  logout() {
    localStorage.removeItem('fas_token');
    localStorage.removeItem('fas_user');
    window.location.href = 'login.html';
  },

  // Redirect to login if not authenticated
  require(roles = []) {
    if (!this.isLoggedIn()) { window.location.href = 'login.html'; return false; }
    const user = this.getUser();
    if (roles.length && !roles.includes(user.role)) {
      alert(`Access denied. Required role: ${roles.join(' or ')}`);
      this.logout(); return false;
    }
    return true;
  },

  // Fetch with auth header
  async fetch(url, options = {}) {
    const token = this.getToken();
    const res = await fetch(this.API + url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) { this.logout(); return null; }
    return res;
  },

  // Fill navbar user info
  fillNavbar() {
    const user = this.getUser();
    if (!user) return;
    const roleColors = { admin:'bg-blue-500', hod:'bg-emerald-500', faculty:'bg-purple-500', student:'bg-amber-500' };
    const roleLabels = { admin:'Administrator', hod:'Head of Department', faculty:'Faculty', student:'Student' };

    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
    document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = roleLabels[user.role] || user.role);
    document.querySelectorAll('[data-user-avatar]').forEach(el => {
      el.textContent = user.avatar || user.name?.slice(0,2).toUpperCase();
    });
    document.querySelectorAll('[data-role-badge]').forEach(el => {
      el.className = el.className.replace(/bg-\w+-500/g, '') + ' ' + (roleColors[user.role] || 'bg-slate-500');
      el.textContent = (user.role || '').toUpperCase();
    });
    document.querySelectorAll('[data-user-dept]').forEach(el => el.textContent = user.department || '');
    // Show/hide role-specific nav items
    document.querySelectorAll('[data-show-role]').forEach(el => {
      const roles = el.dataset.showRole.split(',');
      el.style.display = roles.includes(user.role) ? '' : 'none';
    });
    // Logout buttons
    document.querySelectorAll('[data-logout]').forEach(el => {
      el.addEventListener('click', () => Auth.logout());
    });
  }
};
