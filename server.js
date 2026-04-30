const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ok  = (res, data)         => res.json({ success: true,  data });
const err = (res, msg, code=400) => res.status(code).json({ success: false, error: msg });

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status:'ok', uptime: Math.floor(process.uptime()), students: db.students.length, timestamp: new Date().toISOString() });
});

// ── Stats ─────────────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => { ok(res, db.getStats()); });

// ── Attendance ────────────────────────────────────────────────────────────────
app.get('/api/attendance', (req, res) => { ok(res, db.getAttendance(req.query)); });

app.post('/api/attendance', (req, res) => {
  const r = db.addAttendance(req.body);
  if (!r) return err(res, 'Student not found', 404);
  ok(res, { id: r.id });
});

app.delete('/api/attendance/:id', (req, res) => {
  if (!db.deleteAttendance(req.params.id)) return err(res, 'Not found', 404);
  ok(res, { deleted: true });
});

// ── Students ──────────────────────────────────────────────────────────────────
app.get('/api/students', (req, res) => { ok(res, db.getStudents(req.query)); });

app.get('/api/students/:id', (req, res) => {
  const s = db.getStudent(req.params.id);
  if (!s) return err(res, 'Not found', 404);
  ok(res, s);
});

app.post('/api/students', (req, res) => {
  const { student_id, name, department } = req.body;
  if (!student_id || !name || !department) return err(res, 'student_id, name, department required');
  try { ok(res, db.addStudent(req.body)); }
  catch(e) { err(res, e.message); }
});

app.put('/api/students/:id', (req, res) => {
  const s = db.updateStudent(req.params.id, req.body);
  if (!s) return err(res, 'Not found', 404);
  ok(res, { updated: true });
});

app.delete('/api/students/:id', (req, res) => {
  if (!db.deleteStudent(req.params.id)) return err(res, 'Not found', 404);
  ok(res, { deleted: true });
});

// ── Terminals ─────────────────────────────────────────────────────────────────
app.get('/api/terminals', (req, res) => { ok(res, db.terminals); });

// ── Recognize ─────────────────────────────────────────────────────────────────
app.post('/api/recognize', (req, res) => {
  const result = db.recognize();
  if (!result) return err(res, 'No enrolled students');
  ok(res, result);
});

// ── Catch-all → SPA ───────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`🎓 Facial Attendance System → http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Env:    ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => { server.close(() => { db.save?.(); process.exit(0); }); });
process.on('SIGINT',  () => { server.close(() => { db.save?.(); process.exit(0); }); });
