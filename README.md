# 🎓 College Facial Attendance System

A full-stack biometric attendance tracking system with live webcam facial recognition, real-time dashboard, and REST API backend.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Akshatj0707/facial-attendance-deploy)

---

## 🏗 Architecture

```
Browser (Client)
  dashboard.html · students.html · attendance.html · recognition.html
  └── fetch() REST API calls
        │
  Node.js + Express (server.js)
  ├── GET  /health              Health check
  ├── GET  /api/stats           Dashboard KPIs + trend
  ├── GET  /api/attendance      Attendance log
  ├── POST /api/attendance      Log manually
  ├── GET  /api/students        Student directory
  ├── POST /api/students        Add student
  ├── PUT  /api/students/:id    Update / toggle bio
  ├── GET  /api/terminals       Terminal list
  └── POST /api/recognize       Camera frame → recognize → log
        │
  sql.js SQLite (attendance.db)
  └── students · attendance · terminals (auto-seeded)
```

---

## 🎥 Camera System

- getUserMedia — front-facing webcam
- face-api.js TinyFaceDetector — real-time face detection at 30fps
- Canvas overlay — green corner brackets on detected face
- Space bar shortcut to capture
- JPEG frame sent as base64 to /api/recognize → attendance logged

---

## 🚀 Deploy to Render

1. Go to render.com → New+ → Web Service
2. Connect GitHub → select Akshatj0707/facial-attendance-deploy
3. render.yaml is auto-detected → click Create Web Service

Live at: https://facial-attendance-system.onrender.com

### Enable auto-deploy on every git push:
1. Render dashboard → Settings → Deploy Hook → copy URL
2. GitHub repo → Settings → Secrets → Actions → New secret
   Name: RENDER_DEPLOY_HOOK   Value: (paste URL)

---

## 💻 Local Development

```bash
git clone https://github.com/Akshatj0707/facial-attendance-deploy.git
cd facial-attendance-deploy
npm install
node server.js
# → http://localhost:3000
```

---

## 🔧 Tech Stack

- Frontend: HTML5 + Tailwind CSS + Material Symbols + face-api.js
- Backend: Node.js 20 + Express 4
- Database: SQLite via sql.js (pure JS)
- CI/CD: GitHub Actions → Render
- Hosting: Render (free tier, HTTPS included)
