const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

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
  res.json({ status:'ok', db: mongoose.connection.readyState===1?'connected':'disconnected', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`🎓 Facial Attendance System → http://localhost:${PORT}`);
  console.log(`   Env: ${process.env.NODE_ENV} | Health: http://localhost:${PORT}/health`);
});
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT',  () => { server.close(() => process.exit(0)); });
