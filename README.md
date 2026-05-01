# 🎓 College Facial Attendance System

Full-stack web app with MongoDB, Express, JWT auth, and live facial recognition.

## 🏗 Architecture

```
Browser (Tailwind + face-api.js)
    ↕ fetch() REST API + JWT
Express.js (server.js)
    ↕ Mongoose ODM
MongoDB (Atlas / Compass)
```

## 👥 Roles & Access

| Role | Access |
|------|--------|
| **Admin** | Full access — all pages, user management, all departments |
| **Head of Dept** | Dept-scoped — students, attendance, recognition for own dept |
| **Faculty** | View + mark attendance, camera recognition |
| **Student** | Own attendance history only |

## 🚀 Local Development

### 1. Install MongoDB
Download MongoDB Compass → [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
Or use MongoDB Atlas (free cloud) → [mongodb.com/atlas](https://www.mongodb.com/atlas)

### 2. Clone & Install
```bash
git clone https://github.com/Akshatj0707/facial-attendance-deploy.git
cd facial-attendance-deploy
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```
Edit `.env`:
```env
MONGO_URI=mongodb://localhost:27017/facial_attendance
JWT_SECRET=any_long_random_string_here
PORT=3000
```

### 4. Seed Database
```bash
npm run seed
```

### 5. Run
```bash
npm start
# Open http://localhost:3000
```

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | Admin@123 |
| HoD CS | hod.cs@college.edu | Hod@1234 |
| HoD EE | hod.ee@college.edu | Hod@1234 |
| Faculty | faculty1@college.edu | Faculty@123 |
| Student | ethan@college.edu | Student@123 |

## 📡 API Reference

All protected routes require: `Authorization: Bearer <token>`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login → JWT token |
| GET | /api/auth/me | All | Get profile |
| GET | /api/stats | Admin/HoD/Faculty | Dashboard KPIs |
| GET | /api/students | Admin/HoD/Faculty | List students |
| POST | /api/students | Admin/HoD | Add student |
| PUT | /api/students/:id | Admin/HoD | Update student |
| DELETE | /api/students/:id | Admin | Delete student |
| GET | /api/attendance | All | Attendance records |
| POST | /api/attendance | Admin/HoD/Faculty | Log attendance |
| POST | /api/attendance/recognize | Admin/HoD/Faculty | Camera recognition |
| DELETE | /api/attendance/:id | Admin/HoD | Delete record |
| GET | /api/users | Admin | All users |

## 🌐 Deploy to Render + MongoDB Atlas

See DEPLOY.md for step-by-step instructions.
