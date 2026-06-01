# 🎓 College Facial Attendance System

Full-stack attendance management with **MongoDB Atlas**, **Express.js**, **JWT Authentication**, and **face-api.js** facial recognition.

## 🌐 Live Frontend
**https://akshatj0707.github.io/facial-attendance-deploy/**

## 🏗️ Architecture
```
Frontend (GitHub Pages) ←→ Backend (Node.js + Express) ←→ MongoDB Atlas
     HTML + Tailwind          JWT Auth + REST API           Real Database
     face-api.js                                            3 Collections
```

## 👥 Roles & Access

| Feature | Admin | HoD CS | HoD Other | Faculty | Student |
|---------|-------|--------|-----------|---------|---------|
| Verify students | ✅ All depts | ✅ CS only | ✅ Own dept | ❌ | ❌ |
| Add students | ✅ | ✅ CS | ✅ Own dept | ❌ | ❌ |
| **Enroll face data** | ✅ | ✅ CS students | ❌ | ❌ | ❌ |
| Face recognition | ✅ | ✅ | ✅ | ✅ | ❌ |
| View attendance | ✅ All | ✅ CS | ✅ Own | ✅ Own dept | ✅ Own |
| Reports | ✅ | ✅ | ✅ | ✅ | ❌ |
| User management | ✅ | ❌ | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🚀 Local Setup (5 minutes)

### Step 1 — MongoDB Compass
1. Download: https://www.mongodb.com/products/compass
2. Install & Open → Connect to `mongodb://localhost:27017`
3. Database `college_attendance` will be created automatically

### Step 2 — Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env → set MONGO_URI and JWT_SECRET
npm run seed        # creates 7 staff accounts in MongoDB
npm start           # starts on http://localhost:5000
```

### Step 3 — Frontend
Open `public/login.html` in browser (or use Live Server on port 5500)

> **Important:** Frontend connects to `http://localhost:5000` by default.
> For production, set `window.API_BASE = 'https://your-backend.com'` in each page.

## 🔑 Default Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | Admin@2024 |
| HoD CS | hod.cs@college.edu | HodCS@2024 |
| HoD EE | hod.ee@college.edu | HodEE@2024 |
| HoD ME | hod.me@college.edu | HodME@2024 |
| Faculty 1 | faculty1@college.edu | Faculty@2024 |
| Faculty 2 | faculty2@college.edu | Faculty@2024 |
| Faculty 3 | faculty3@college.edu | Faculty@2024 |

> **Students:** must self-register → Admin/HoD verifies → then Admin/HoD CS enrolls face

## 🔄 Student Workflow
```
Student registers → Account pending
      ↓
Admin/HoD visits /verify.html → Clicks "Verify"
      ↓
Admin or HoD CS visits /enroll.html → Captures 5 face samples → Enrolls
      ↓
Student can now be recognized by camera at /recognition.html
```

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login → JWT |
| GET | /api/auth/pending-students | Admin/HoD | Unverified students |
| PUT | /api/auth/verify-student/:id | Admin/HoD | Verify student |
| DELETE | /api/auth/reject-student/:id | Admin | Reject student |
| GET | /api/students | Admin/HoD/Faculty | List students |
| POST | /api/students | Admin/HoD | Add student |
| POST | /api/students/:id/enroll-face | **Admin + HoD CS only** | Enroll face |
| DELETE | /api/students/:id/enroll-face | **Admin + HoD CS only** | Remove face |
| GET | /api/attendance | All (role-scoped) | Attendance records |
| POST | /api/attendance/recognize | Admin/HoD/Faculty | Camera recognition |
| GET | /api/stats | All | Dashboard data |

## 🗄️ MongoDB Collections

**users** — `name, email, password(bcrypt12), role, department, isVerified, verifiedBy, avatar`

**students** — `studentId(unique), name, email, department, bioStatus, isVerified, faceData{samples[], enrolledBy}`

**attendance** — `student(ref), markedBy(ref), checkIn(Date), status, method(face/manual), confidence`

## 📦 Deploy to Production

### Backend → Render.com
1. Go to render.com → New Web Service → Connect GitHub repo
2. Root directory: `backend`
3. Build: `npm install` | Start: `node server.js`
4. Add env vars: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`

### Frontend → GitHub Pages (already deployed)
Update `window.API_BASE` in each HTML file to point to your Render URL.
