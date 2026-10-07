# 🌱 SoilCare – Community Soil Fertility Management System

## 🌱 LIVE DEMO

**[Open SoilCare Project](https://kshitijchambhare-boop.github.io/kkk/)**

To publish the frontend, open **Actions → Deploy frontend to GitHub Pages → Run workflow**. The hosted frontend uses `https://kkk-gorx.onrender.com/api` for its backend.

## 🚀 Backend API

**[Backend API](https://kkk-gorx.onrender.com)**

> The frontend is hosted on **GitHub Pages** (static files only). The Node.js/Express backend cannot run on GitHub Pages, so it is hosted separately (Render) and uses **MongoDB Atlas**. The free Render service sleeps when idle — the first request after a pause can take ~1 minute.

**Demo logins** (created by `npm run seed`): farmer `farmer@soilcare.com` / `Farmer@123` · admin `admin@soilcare.com` / `Admin@123`. For a public deployment, set `SEED_ADMIN_PASSWORD` before seeding (see below).

---

## Features
- User registration / login (JWT) and logout
- Soil testing (pH, N, P, K, organic carbon, moisture)
- Soil fertility analysis with health score and deficiencies
- Crop recommendations and fertilizer recommendations
- Soil test history, charts and printable reports
- Dashboard for farmers; admin panel (user management, system statistics)

## Technology
**Frontend:** React, Vite, React Router, Axios, Recharts, Lucide React
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Helmet, CORS, rate limiting

## Project structure
```
backend/    Express API (controllers, models, routes, utils, seed.js)
frontend/   React + Vite app
.github/workflows/deploy.yml   builds and publishes the frontend to GitHub Pages
render.yaml                    optional Render blueprint for the backend
```

## Local setup
```bash
git clone https://github.com/USERNAME/REPOSITORY-NAME.git
cd REPOSITORY-NAME
```
**Backend** (needs MongoDB locally, or an Atlas URI)
```bash
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm install
npm run seed              # crops, fertilizers, demo users
npm run dev               # http://localhost:5000
```
**Frontend** (new terminal)
```bash
cd frontend
cp .env.example .env      # leave VITE_API_URL empty or http://localhost:5000/api
npm install
npm run dev               # http://localhost:5173
```
In development the API defaults to `http://localhost:5000/api`. In a production build it uses only `VITE_API_URL`.

## Environment variables
| Where | Variable | Purpose |
|---|---|---|
| backend | `MONGO_URI` | MongoDB / Atlas connection string |
| backend | `JWT_SECRET` | random string, 32+ chars (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| backend | `FRONTEND_URL` | `https://kshitijchambhare-boop.github.io` (origin only — no repository path) |
| backend | `NODE_ENV` | `production` on the host |
| backend | `PORT` | provided by the host automatically |
| backend | `SEED_ADMIN_PASSWORD` | optional, password for the seeded admin |
| frontend | `VITE_API_URL` | `https://kkk-gorx.onrender.com/api` (GitHub Actions variable) |

Never commit `.env` files — they are git-ignored.

## Production deployment

### 1. MongoDB Atlas
1. Create a free account and an **M0** cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a database user with a password.
3. **Network Access** → add IP `0.0.0.0/0` (Render's free tier has no fixed IP).
4. **Connect → Drivers** → copy the string and add the database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/soil_fertility?retryWrites=true&w=majority`
   (URL-encode special characters in the password.)

### 2. Seed the Atlas database (once, from your computer)
```bash
# put the Atlas string in .env as MONGO_URI (and optionally SEED_ADMIN_PASSWORD=...)
npm install
npm run seed
```

### 3. Deploy the backend (Render)
1. <https://render.com> → **New → Web Service** → connect the GitHub repo.
2. Leave Root Directory empty (the backend package is at the repository root), Build `npm install`, Start `npm start`, Health check path `/health`. (Or use **New → Blueprint** with `render.yaml`.)
3. Environment variables: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL=https://kshitijchambhare-boop.github.io`.
4. After deploy, open `https://kkk-gorx.onrender.com/` — it should show `{"status":"Soil Fertility API running"}`. That URL is your **Backend API** link.

### 4. Deploy the frontend (GitHub Pages)
1. Repo → **Settings → Secrets and variables → Actions → Variables → New repository variable**: name `VITE_API_URL`, value `https://kkk-gorx.onrender.com/api`.
2. Repo → **Settings → Pages → Source: GitHub Actions**.
3. Push to `main` (or **Actions → Deploy frontend to GitHub Pages → Run workflow**). The workflow installs Node, installs dependencies, builds with the correct base path (`/REPOSITORY-NAME/`) and deploys.
4. Your live URL: `https://kshitijchambhare-boop.github.io/kkk/`.

GitHub Pages cannot rewrite URLs, so the build also creates `404.html` (a copy of `index.html`); direct links like `/REPOSITORY-NAME/dashboard` and page refreshes load the app.

### 5. Test the live site
1. Open the Backend API URL → JSON status appears.
2. Open the LIVE DEMO link → register or log in with the demo farmer.
3. Add a soil test → check result, crops, fertilizers, History, report; log in as admin → Admin page.
4. Open `/REPOSITORY-NAME/dashboard` directly and refresh — it must not 404.

## Troubleshooting
- **"Cannot reach server"** – backend asleep (wait ~1 min) or `VITE_API_URL` wrong/missing. Redeploy the frontend after changing it.
- **CORS error in console** – `FRONTEND_URL` must equal the site origin exactly (`https://kshitijchambhare-boop.github.io`, no path, no trailing slash).
- **Backend exits on start** – missing `MONGO_URI`/`JWT_SECRET`, weak `JWT_SECRET`, or Atlas IP not allowed.
- **Blank page on Pages** – Pages source must be "GitHub Actions"; check the workflow log shows the right base path.
- **Local `npm run build` bakes `localhost`** – a local `frontend/.env` is read at build time; CI does not have it.

*All recommendations are advisory; verify fertilizer doses with a local agricultural expert.*
