# GiftNow — Platform Gift Card System

Official gift card platform (Nepal).

- **Lifetime validity** — gift cards never expire
- **Platform-wide redemption** — one wallet per account, all sellers
- **Custom denominations** — NPR 100 – 1,00,000
- **Delivery** — Digital (email), Physical (postal), Corporate bulk (admin)

## Architecture

```
giftcard-frontend/   Next.js 14 — customer + admin UI
giftcard-backend/    Express + Sequelize + PostgreSQL
```

## Quick start

### 1. PostgreSQL

```bash
docker compose up -d
```

Use `DB_PASSWORD=giftnow123` and `DB_PORT=5433` in `giftcard-backend/.env`.

### 2. Backend

```bash
cd giftcard-backend
npm install
copy .env.example .env

npm run migrate          # creates/updates GiftNow SRS tables
npm run seed             # optional bootstrap admin
npm run dev              # http://localhost:3001
```

If you see **EADDRINUSE :::3001**, another process is using the port:

```powershell
Get-NetTCPConnection -LocalPort 3001 | Select OwningProcess
Stop-Process -Id <PID> -Force
```

Set `DB_SYNC_ALTER=true` in `.env` only when you need Sequelize to alter columns (e.g. after model changes). Normal `npm run dev` does not alter tables.

### 3. Frontend

```bash
cd giftcard-frontend
npm install
copy .env.example .env.local

npm run dev              # http://localhost:3000
```

### Accounts

- **Customers:** Google sign-in (`GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID`)
- **Admin:** `BOOTSTRAP_ADMIN_EMAIL` + `BOOTSTRAP_ADMIN_PASSWORD` in backend `.env`, then `npm run seed`

## App routes

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/giftnow/buy` | Purchase gift card |
| `/customer/redeem` | Redeem GN code → wallet |
| `/customer/wallet` | Balance + history |
| `/auth/login` | Sign in |
| `/admin/giftnow` | Admin dashboard |

## API (`/api/v1`)

| Endpoint | Auth | Description |
|----------|------|-------------|
| POST `/auth/login` | — | Admin login |
| POST `/auth/google` | — | Customer Google login |
| GET `/auth/me` | JWT | Current user |
| POST `/gift-cards/purchase` | Customer | Buy card |
| POST `/gift-cards/redeem` | Customer | Redeem to wallet |
| GET `/gift-cards/wallet` | JWT | Wallet balance |
| GET `/gift-cards/wallet/history` | JWT | Audit history |
| GET `/gift-cards/purchased` | Customer | Purchased cards |
| POST `/gift-cards/wallet/debit` | JWT | Checkout debit |
| POST `/gift-cards/admin/*` | Admin | Create, cancel, list, analytics, export |

## License

Proprietary — Ashwani Kr. Chaudhary