# 🚀 Full Stack Deployment Guide

## Step 1 — MongoDB Atlas (Free Cloud Database)

1. Go to → https://www.mongodb.com/atlas/database
2. Click **"Try Free"** → sign up
3. Choose **Free (M0)** tier → Region: **AWS / Singapore or US East**
4. Cluster name: `facial-attendance`
5. Click **"Create"**
6. **Security → Database Access** → Add user:
   - Username: `fasadmin`
   - Password: generate a strong password (copy it!)
   - Role: **Atlas Admin**
7. **Security → Network Access** → Add IP:
   - Click **"Allow Access from Anywhere"** → `0.0.0.0/0`
8. **Deployment → Database** → click **Connect** → **Drivers**
   - Copy the connection string — looks like:
   ```
   mongodb+srv://fasadmin:<password>@facial-attendance.xxxxx.mongodb.net/facial_attendance?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password

---

## Step 2 — Render (Free Node.js Hosting)

1. Go to → https://render.com → sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → select **`Akshatj0707/facial-attendance-deploy`**
4. Settings (auto-filled from render.yaml):
   - Name: `facial-attendance-system`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Click **"Advanced"** → **"Add Environment Variable"**:
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = any random 32+ char string (e.g. `fas_super_secret_jwt_2024_xyz`)
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
6. Click **"Create Web Service"**
7. Wait ~4 minutes for build → your URL: `https://facial-attendance-system.onrender.com`

---

## Step 3 — Seed the Database

After deployment, seed the database from your local machine:
```bash
# Edit .env with your Atlas MONGO_URI
MONGO_URI=mongodb+srv://fasadmin:yourpassword@...

# Run seed
npm run seed
```

Or via Render Shell (Dashboard → your service → Shell):
```bash
node seed.js
```

---

## That's it! Your app is live. 🎉

- **URL:** https://facial-attendance-system.onrender.com
- **Login:** admin@college.edu / Admin@123
- **Camera:** Works on HTTPS (Render provides free SSL)

