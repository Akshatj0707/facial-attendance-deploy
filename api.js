// ── API Client — connects frontend to real MongoDB backend ─────────────────
const API_BASE = window.API_BASE || 'http://localhost:5000';

const Api = {
  // ── Auth ─────────────────────────────────────────────────────────────────
  getToken:   () => localStorage.getItem('fas_token'),
  getUser:    () => { try { return JSON.parse(localStorage.getItem('fas_user')); } catch { return null; } },
  setSession: (data) => { localStorage.setItem('fas_token', data.token); localStorage.setItem('fas_user', JSON.stringify(data)); },
  clearSession: () => { localStorage.removeItem('fas_token'); localStorage.removeItem('fas_user'); },
  isLoggedIn: () => !!Api.getToken(),
  logout:     () => { Api.clearSession(); window.location.href = 'login.html'; },

  // ── Base fetch ────────────────────────────────────────────────────────────
  async fetch(path, opts = {}) {
    const token = Api.getToken();
    const res = await fetch(API_BASE + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    if (res.status === 401) { Api.logout(); return null; }
    return res;
  },

  async get(path)         { return Api.fetch(path); },
  async post(path, body)  { return Api.fetch(path, { method: 'POST',   body: JSON.stringify(body) }); },
  async put(path, body)   { return Api.fetch(path, { method: 'PUT',    body: JSON.stringify(body) }); },
  async del(path)         { return Api.fetch(path, { method: 'DELETE' }); },

  async json(res) {
    if (!res) return null;
    const data = await res.json();
    return data;
  },

  // ── Auth endpoints ────────────────────────────────────────────────────────
  async login(email, password) {
    const res = await Api.post('/api/auth/login', { email, password });
    const data = await Api.json(res);
    if (data?.success) Api.setSession(data.data);
    return data;
  },

  async register(body) {
    const res = await Api.post('/api/auth/register', body);
    const data = await Api.json(res);
    if (data?.success) Api.setSession(data.data);
    return data;
  },

  async getMe()         { return Api.json(await Api.get('/api/auth/me')); },
  async updateProfile(body) { return Api.json(await Api.put('/api/auth/profile', body)); },
  async changePassword(body){ return Api.json(await Api.put('/api/auth/password', body)); },

  // ── Student verification ──────────────────────────────────────────────────
  async getPendingStudents()     { return Api.json(await Api.get('/api/auth/pending-students')); },
  async verifyStudent(id)        { return Api.json(await Api.put(`/api/auth/verify-student/${id}`, {})); },
  async rejectStudent(id)        { return Api.json(await Api.del(`/api/auth/reject-student/${id}`)); },

  // ── Students ──────────────────────────────────────────────────────────────
  async getStudents(params = {}) {
    const q = new URLSearchParams(params);
    return Api.json(await Api.get(`/api/students?${q}`));
  },
  async getStudent(id)           { return Api.json(await Api.get(`/api/students/${id}`)); },
  async addStudent(body)         { return Api.json(await Api.post('/api/students', body)); },
  async updateStudent(id, body)  { return Api.json(await Api.put(`/api/students/${id}`, body)); },
  async deleteStudent(id)        { return Api.json(await Api.del(`/api/students/${id}`)); },

  // ── Face enrollment (Admin + HoD CS only) ────────────────────────────────
  async enrollFace(id, samples, descriptor = []) {
    return Api.json(await Api.post(`/api/students/${id}/enroll-face`, { samples, descriptor }));
  },
  async removeFace(id)           { return Api.json(await Api.del(`/api/students/${id}/enroll-face`)); },
  async getEnrolledList()        { return Api.json(await Api.get('/api/students/enrolled/list')); },

  // ── Attendance ────────────────────────────────────────────────────────────
  async getAttendance(params = {}) {
    const q = new URLSearchParams(params);
    return Api.json(await Api.get(`/api/attendance?${q}`));
  },
  async markAttendance(body)     { return Api.json(await Api.post('/api/attendance', body)); },
  async recognize(body = {})     { return Api.json(await Api.post('/api/attendance/recognize', body)); },
  async deleteAttendance(id)     { return Api.json(await Api.del(`/api/attendance/${id}`)); },

  // ── Stats / Dashboard ─────────────────────────────────────────────────────
  async getStats()               { return Api.json(await Api.get('/api/stats')); },

  // ── Users (admin only) ────────────────────────────────────────────────────
  async getUsers(params = {}) {
    const q = new URLSearchParams(params);
    return Api.json(await Api.get(`/api/users?${q}`));
  },
  async toggleUser(id)           { return Api.json(await Api.put(`/api/users/${id}/toggle`, {})); },
  async deleteUser(id)           { return Api.json(await Api.del(`/api/users/${id}`)); },

  // ── Auth guard ────────────────────────────────────────────────────────────
  requireAuth(roles = []) {
    if (!Api.isLoggedIn()) { window.location.href = 'login.html'; return null; }
    const user = Api.getUser();
    if (roles.length && !roles.includes(user?.role)) {
      window.location.href = user?.role === 'student' ? 'student.html' : 'dashboard.html';
      return null;
    }
    return user;
  },
};
