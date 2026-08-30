# Running Reflex Backend Locally

## 1. Start the database
From the repo root:
```bash
docker-compose up -d
```
This starts Postgres on `localhost:5432` and automatically runs `schema.sql` on first startup (via the `docker-entrypoint-initdb.d` mount). If you've run it before and change `schema.sql`, you'll need to reset the volume:
```bash
docker-compose down -v
docker-compose up -d
```

## 2. Configure the backend
```bash
cd backend
cp .env.example .env
```
Edit `.env` — for the Docker setup above, use:
```
DATABASE_URL=postgresql://reflex:reflex_dev_password@localhost:5432/reflex
```

## 3. Install dependencies & seed test accounts
```bash
npm install
node src/config/seed.js
```
This creates 4 test accounts (1 retailer staff, 1 dispatcher, 2 riders) — printed to the console with their phone numbers and PINs.

## 4. Start the server
```bash
npm run dev
```
Server runs on `http://localhost:4000`. Confirm it's up:
```bash
curl http://localhost:4000/health
```

## 5. Run the smoke test
In a separate terminal, with the server still running:
```bash
node scripts/smoke-test.js
```
This walks a request through the entire lifecycle — login, log request, assign, pick up, blocked mismatched scan, successful delivery — and prints each step. A clean run ends with `✅ Smoke test passed`.

## Troubleshooting
- **`ECONNREFUSED` on the database:** Postgres isn't running or `DATABASE_URL` is wrong — check `docker ps` and your `.env`.
- **Smoke test fails at step 5 (assign):** the `RIDER_ID` in `scripts/smoke-test.js` is hardcoded to `3` (Carol, per `seed.js`). If your seed data changes, update it.
- **Smoke test fails at login:** confirm you ran `node src/config/seed.js` after the database was up.
