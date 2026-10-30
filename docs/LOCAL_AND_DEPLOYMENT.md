# Sticker Club — local setup and deployment readiness

## Current status

The React/Vite frontend remains in the repository root and the Express/Prisma server is in `backend/`. Local PostgreSQL is the development database. The database cart and order endpoints write **unpaid** orders; there is **no payment provider** and no production deployment authorization.

Custom sticker uploads, custom walls, custom packs, and poster variants **do not yet map to an orderable database SKU**. The authenticated checkout deliberately blocks those entries rather than charging an incorrect price. Product display data is still bundled into the frontend; seeding copies the initial catalog into PostgreSQL but does not keep both datasets synchronized automatically.

## Windows prerequisites

Install Node.js 22 or later, Git, and a local PostgreSQL server (PostgreSQL 16 is used in CI). Check them in PowerShell:

```powershell
node --version
npm --version
git --version
psql --version
```

### PowerShell — clone and configure

```powershell
git clone https://github.com/daradheekshith2-commits/sticker-club.git
cd sticker-club
git fetch origin
git switch design/category-cards-reference-20261030
npm ci
Copy-Item .env.example .env
```

Set `VITE_API_URL=http://localhost:5000` in root `.env`.

In PostgreSQL's `psql` shell as a local administrator (choose a strong private password and store it **only** in your local `backend/.env`):

```sql
CREATE ROLE stickerclub LOGIN PASSWORD 'CHOOSE_YOUR_OWN_PRIVATE_PASSWORD';
CREATE DATABASE stickerclub OWNER stickerclub;
```

Then:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env`: set a real `DATABASE_URL`, a cryptographically random `JWT_SECRET` (at least 32 characters), `FRONTEND_ORIGIN=http://localhost:5173`, and `PORT=5000`. For a **first-time administrator**, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` locally, seed once, then remove those bootstrap values.

```powershell
npm run db:generate
npx prisma migrate deploy
npm run db:seed
npm run build
npm run dev
```

In a second PowerShell terminal:

```powershell
cd sticker-club
npm run typecheck
npm test
npm run build
npm run dev
```

Local addresses: storefront `http://localhost:5173`, API health `http://localhost:5000/api/health`, API docs `http://localhost:5000/api/docs`.

### Command Prompt differences

Replace `Copy-Item .env.example .env` with `copy .env.example .env`; other npm, git, and psql commands are the same. Be sure to run frontend npm scripts from the repository root and backend npm scripts from the `backend` directory.

### Local backend integration tests

The tests use a temporary database and **must never run against a production database**. GitHub Actions creates an isolated PostgreSQL service and sets `TEST_DATABASE_IS_DISPOSABLE=yes`. Prefer the workflow for integration testing; never set that flag for a database containing real records. The test creates customer accounts and orders and modifies stock.

## Production deployment architecture (documentation only)

- **Vercel:** deploy the Vite frontend from the **existing repository root**, build command `npm run build`, output directory `dist`. Retain `vercel.json` SPA rewrites.
- **Express:** deploy `backend/` as a separately managed **persistent Node.js service**, rather than assuming the static Vercel deployment runs it.
- **PostgreSQL:** deploy to a separate server with restricted access, database backups, secret management and connection limits. Never use a development Windows database in production.
- **Environment:** configure `VITE_API_URL=https://api.<your-domain>` in the Vercel frontend build environment. The frontend intentionally has **no localhost fallback in production**.
- **Session cookies:** the current backend refresh cookie is HTTP-only, Secure in production, and SameSite=Strict. For cross-origin frontend and API, arrange them under compatible same-site domains or a same-origin reverse proxy; independent Vercel and unrelated backend hostnames will not automatically share strict refresh cookies. Enforce HTTPS and review CORS, CSRF, proxy trust and cookie domains before launch.
- **Uploads:** use authenticated persistent object storage. Browser `blob:` URLs are temporary and cannot serve a future printer or customer order history.
- **Payments:** there is no active payment gateway. Treat every server-created order as payment pending. A verified payment-provider callback and payment state machine are required before marking orders paid.
- **Checkout:** only standard, database-priced, inventory-configured SKUs are eligible. Poster variants and custom orders need server-side options and order storage first.
- **Catalogue:** decide whether PostgreSQL will be authoritative for product prices/availability across the storefront, or implement a controlled publish/sync pipeline. The current frontend can show bundled prices that differ from admin-updated database prices; the server always recalculates at checkout.

## Required release gates (not yet all satisfied)

- Full frontend unit and build checks, backend Prisma compilation, migration and disposable-db integration checks **must be green on the exact release SHA**.
- Verify cropped PNGs visually for portrait, landscape, rotated images and touch interactions.
- Conduct browser-level registration, login, reload, address management, inventory and checkout tests against a real nonproduction backend.
- Verify no payment can be marked paid by an unauthenticated API call and no customer can reach another customer's data.
- Confirm persistent custom-upload storage and inventory configuration before enabling custom-order checkout.
- Review founder-approved privacy, returns, shipping and terms policies; the existing policies are placeholders.
- Review the ownership/licensing status of all designs before selling them.
- Set staging/production secrets in their hosting systems, never commit real `.env` files.
- Do not merge into `main` or deploy production without explicit authorization.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Prisma P1001/P1000 | PostgreSQL service, database existence, role password, `DATABASE_URL`, port 5432 |
| Migration fails | Run `npx prisma migrate status`; inspect migration history; do **not** reset a populated production database |
| Prisma Client missing | Run `npm run db:generate` in `backend/` after `npm install` |
| Port 5000/5173 in use | Stop other local servers or update PORT and `VITE_API_URL` consistently |
| Browser CORS error | Match `FRONTEND_ORIGIN` to the exact Vite origin; reload backend after change |
| Session won't restore | Check local cookies, frontend API URL, HTTPS/strict SameSite compatibility in production |
| Invalid JWT configuration | Set a long random `JWT_SECRET` in local backend `.env` |
| Cart rejects product | Admin must configure real inventory; not all frontend product variants are supported |
| Login says backend missing | Set `VITE_API_URL` for the Vite build, or run local `http://localhost:5000` in development |

**No release has been published by this guide.**

## Compiled Node server (non-watch mode)

After `npm install`, `npm run db:generate`, migrations, and environment setup in `backend/`:

```bash
npm run build
npm start
```

This builds `backend/dist/index.js` using TypeScript and runs Node directly. `npm run dev` remains the recommended interactive local development command. Do not deploy to production before HTTPS, logging, database backups, credentials, and security reviews are in place.
