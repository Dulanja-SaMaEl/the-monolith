# Monolith LK — Enterprise Monorepo

Multidisciplinary architectural engineering studio web ecosystem, connecting an in-depth Haute Editorial frontend, VIP Client Portal, Studio OS Admin Panel, and a high-throughput Node.js backend.

---

## 📁 Repository Structure

```
The Monolith/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS (Deploy to Vercel)
│   ├── src/
│   │   ├── components/
│   │   │   ├── MedianStudio/   # Haute Editorial Brand Site & In-Depth /services
│   │   │   └── Portal/         # Client VIP Lounge & Company Admin OS
│   │   ├── lib/                # Supabase client, offline portal store, invoice downloader
│   │   └── context/            # AuthContext (Role-based auto-routing)
│   ├── public/
│   └── package.json
├── backend/              # Node.js + Express + TypeScript API Service (Deploy to Render)
│   ├── src/
│   │   ├── routes/             # Projects, clients, partners, billing, meetings, posts
│   │   ├── middleware/         # Supabase JWT & role verification
│   │   └── services/           # Supabase admin client
│   ├── render.yaml             # Render deployment blueprint
│   └── package.json
├── database/
│   └── supabase_schema.sql     # Supabase PostgreSQL schema with RLS and seed data
└── package.json                # Monorepo workspaces & root execution scripts
```

---

## 🚀 Deployment Instructions

### 1. Frontend on Vercel
1. In your **Vercel Dashboard**, click **Add New Project** and import `Dulanja-SaMaEl/the-monolith`.
2. Under **Root Directory**, click edit and select:
   ```
   frontend
   ```
3. Framework Preset: **Vite** (auto-detected).
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. (Optional) Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
7. Click **Deploy**.

---

### 2. Backend on Render
1. In your **Render Dashboard**, click **New +** -> **Web Service**.
2. Connect your GitHub repository `Dulanja-SaMaEl/the-monolith`.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `PORT`: `10000`
   - `FRONTEND_URL`: Your Vercel deployment URL (e.g. `https://monolith-lk.vercel.app`)
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
5. Click **Create Web Service**.

---

### 3. Database on Supabase
1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab.
3. Paste the contents of `database/supabase_schema.sql` and run.
4. Copy the Project URL and API Keys into your Vercel and Render environment variables.

---

## 💻 Local Development

Run from monorepo root:
```bash
# Install all dependencies across frontend and backend
npm install

# Run frontend in development mode (http://localhost:5173)
npm run dev

# Or run backend in development mode (http://localhost:10000)
npm run dev:backend

# Build both applications
npm run build
```
