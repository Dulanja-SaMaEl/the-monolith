# Monolith LK — Enterprise Backend Service (Render)

Production-grade Node.js/TypeScript Express API supporting the **Monolith LK Client Portal** and **Monolith OS Admin Control Panel**, connecting to **Supabase PostgreSQL**.

---

### 1. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set the following variables:
- `PORT`: `10000` (or default port)
- `FRONTEND_URL`: URL of your Vercel deployment (e.g. `https://monolith-lk.vercel.app` or `http://localhost:5173`)
- `SUPABASE_URL`: Your Supabase Project URL (`https://xyzcompany.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Secret Key (from Project Settings -> API)

---

### 2. Local Development

```bash
cd server
npm install
npm run dev
```

The service will start at `http://localhost:10000`. Test telemetry:
```bash
curl http://localhost:10000/api/health
```

---

### 3. Deploying to Render

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`Dulanja-SaMaEl/the-monolith`).
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL`
   - `NODE_ENV`: `production`
6. Click **Create Web Service**.
