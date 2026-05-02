const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const dotenv    = require('dotenv');
dotenv.config();

const connectDB       = require('./config/db');
const { seedIfEmpty } = require('./config/store');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/stats',      require('./routes/stats'));
app.use('/api/users',      require('./routes/users'));

app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbMode   = mongoose.connection.readyState === 1 ? 'mongodb' : 'json-store';
  res.json({ status:'ok', db:dbMode, uptime:Math.floor(process.uptime()), timestamp:new Date().toISOString(), version:'2.0.0' });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success:false, error: err.message });
});

// ── Boot: init DB/store THEN start listening ──────────────────────────────────
async function boot() {
  const connected = await connectDB();
  if (!connected) {
    await seedIfEmpty();   // seed JSON store (async bcrypt hashing)
  }
  const server = app.listen(PORT, () => {
    console.log(`🎓 Facial Attendance System → http://localhost:${PORT}`);
    console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   DB:   ${connected ? 'MongoDB Atlas' : 'JSON file store'}`);
  });
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT',  () => server.close(() => process.exit(0)));
}

boot().catch(e => { console.error('Boot failed:', e); process.exit(1); });
