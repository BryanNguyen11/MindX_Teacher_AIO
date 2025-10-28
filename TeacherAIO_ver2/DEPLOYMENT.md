# Deployment guide (Vercel + Render)

This project is split into:
- Frontend: Vite React app (root)
- Backend: Node/Express API (./server)

We will deploy:
- Backend to Render (Web Service)
- Frontend to Vercel (with rewrites for /api)

## 1) Backend on Render

1. Push the repo to GitHub.
2. Create a Web Service on Render:
   - Connect GitHub repo
   - Root Directory: `server`
   - Runtime: Node 18+
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
3. Set Environment Variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a strong random string
   - `SHEET_ID` = Google Sheet ID (GViz public)
4. Deploy and get the base URL, e.g. `https://your-api.onrender.com`
5. Health check: `GET https://your-api.onrender.com/api/health` should return `{ ok: true }`.

## 2) Frontend on Vercel

1. Ensure the `vercel.json` file exists at the repo root (created by us):

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://RENDER_BACKEND_URL/api/:path*"
    }
  ]
}
```

2. Replace `RENDER_BACKEND_URL` with your actual Render URL (no trailing slash).
3. Import the repo into Vercel → Framework Preset: Vite
4. Because this project outputs to `build` (see `vite.config.ts`), ensure Vercel uses that:
  - If using `vercel.json` (provided), it already sets the static build with `distDir: build`.
  - Otherwise, set Build Command: `npm run build` and Output Directory: `build` in the Vercel UI.
5. Deploy → Your site URL will be like `https://your-app.vercel.app`.
6. Test front-to-back: Open the site and login/register; requests to `/api` are proxied to Render.

## 3) Optional: tighten CORS on backend

In `server/src/index.js`, `app.use(cors())` is permissive. Once you know your frontend origin, replace with:

```js
import cors from 'cors';
const allowed = [
  'https://your-app.vercel.app',
];
app.use(cors({ origin: allowed, credentials: true }));
```

## 4) Troubleshooting

- Vercel build succeeds but site 404s assets: Ensure Output Directory is `build` (not `dist`).
- 404 on /api calls: Check `vercel.json` rewrites and the Render URL has no trailing slash.
- CORS errors: Ensure backend allows your Vercel domain.
- Sheet errors: Make sure the Google Sheet is public and `SHEET_ID` is correct.
- Mongo connection: Verify `MONGO_URI` works from Render (allow IP 0.0.0.0/0 or Render egress IPs) and credentials are correct.
- Render build/runtime errors: Make sure Node 18+ is used (we added `engines` in `server/package.json`).
- Health check failing: The server must listen on `process.env.PORT` (it does) and expose `/api/health` (it does).
