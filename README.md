# 🎓 College Facial Attendance System

A complete, responsive, role-based attendance management system with face enrollment, live camera recognition, analytics and more.

## 🌐 Live Demo
**https://akshatj0707.github.io/facial-attendance-deploy/**

## 🔑 Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | Admin@123 |
| HoD CS | hod.cs@college.edu | Hod@1234 |
| HoD EE | hod.ee@college.edu | Hod@1234 |
| Faculty | faculty1@college.edu | Faculty@123 |
| Student | ethan@college.edu | Student@123 |

## 📋 Pages (16 total)
- `login.html` — Login & Register with role selector
- `dashboard.html` — Analytics, KPIs, live feed (Admin/HoD/Faculty)
- `students.html` — Student directory, table/grid view, add/edit
- `enroll.html` — **Face enrollment** with live camera + face-api.js
- `attendance.html` — Filterable attendance log, export CSV
- `recognition.html` — Live camera recognition → auto-mark attendance
- `reports.html` — Analytics, 7-day trend, low attendance alerts
- `users.html` — User management (Admin only)
- `faculty.html` — Faculty directory (HoD only)
- `announcements.html` — Post & view notices
- `settings.html` — System configuration (Admin only)
- `student.html` — Student personal dashboard
- `my-attendance.html` — Student own attendance history
- `timetable.html` — Weekly class schedule
- `profile.html` — Edit profile & change password
- `index.html` — Smart redirect

## 👥 Role-Based Access
| Feature | Admin | HoD | Faculty | Student |
|---------|-------|-----|---------|---------|
| All departments | ✅ | ❌ | ❌ | ❌ |
| Dept-scoped data | ✅ | ✅ | ✅ | ❌ |
| Add/delete students | ✅ | ✅ | ❌ | ❌ |
| Face enrollment | ✅ | ✅ | ✅ | ❌ |
| Mark attendance | ✅ | ✅ | ✅ | ❌ |
| View own attendance | ✅ | ✅ | ✅ | ✅ |
| User management | ✅ | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ |

## 🛠 Tech Stack
- Pure HTML + Tailwind CSS (CDN)
- face-api.js (TinyFaceDetector)
- localStorage client-side database
- GitHub Pages hosting
