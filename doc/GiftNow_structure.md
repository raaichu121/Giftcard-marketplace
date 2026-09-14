# GiftNow — Project Structure Reference

---

## Frontend Structure (`giftnow-frontend/`)

```
giftnow-frontend/
└── src/
    ├── app/
    │   ├── (customer)/
    │   │   └── giftnow/
    │   │       ├── page.tsx                  — GiftNow landing / buy card page
    │   │       ├── buy/
    │   │       │   └── page.tsx              — Purchase flow (amount, type, recipient)
    │   │       ├── redeem/
    │   │       │   └── page.tsx              — Enter code → credit wallet
    │   │       ├── wallet/
    │   │       │   └── page.tsx              — My Account → GiftNow Wallet
    │   │       └── history/
    │   │           └── page.tsx              — Purchased cards + redemption status
    │   └── (admin)/
    │       └── giftnow/
    │           ├── page.tsx                  — Admin GiftNow dashboard
    │           ├── cards/
    │           │   └── page.tsx              — List all cards with filters
    │           ├── create/
    │           │   └── page.tsx              — Single or bulk card creation
    │           ├── bulk/
    │           │   └── page.tsx              — Corporate bulk order creation
    │           └── analytics/
    │               └── page.tsx              — Analytics dashboard
    ├── components/
    │   └── giftnow/
    │       ├── GiftNowPurchase.tsx           — Amount picker, type selector, recipient
    │       ├── GiftNowRedeem.tsx             — Code entry + validation UI
    │       ├── GiftNowWallet.tsx             — Balance display + wallet card
    │       ├── GiftNowHistory.tsx            — Purchased cards + statuses
    │       ├── GiftNowCheckoutToggle.tsx     — "Use GiftNow balance" toggle at checkout
    │       ├── GiftCardTile.tsx              — Single card display card
    │       ├── WalletBalanceCard.tsx         — Balance summary widget
    │       ├── AmountPicker.tsx              — NPR 100–1,00,000 input with validation
    │       ├── DeliveryTypeSelector.tsx      — Digital / Physical / Corporate tabs
    │       ├── QrCodeDisplay.tsx             — QR code renderer for email preview
    │       ├── AuditLogTable.tsx             — Wallet history table (paginated)
    │       └── admin/
    │           ├── AdminGiftNowDashboard.tsx
    │           ├── AdminBulkCreate.tsx       — Bulk order form + CSV download
    │           ├── AdminCardList.tsx         — Filterable cards table
    │           ├── AdminAnalytics.tsx        — Charts: issued, redeemed, avg denomination
    │           └── AdminCancelModal.tsx      — Cancel card with confirmation
    ├── lib/
    │   └── giftnow/
    │       ├── giftnow-api.ts                — All axios calls to gift card endpoints
    │       ├── giftnow-types.ts              — TypeScript types: GiftCard, Wallet, AuditLog
    │       └── giftnow-utils.ts              — Code formatter, amount validator, helpers
    ├── store/
    │   └── useGiftNowStore.ts                — Zustand store: wallet balance, cart toggle state
    └── hooks/
        ├── useGiftNowWallet.ts               — Hook: fetch balance, redeem code, history
        └── useGiftNowCheckout.ts             — Hook: apply/remove wallet at checkout
```

---

## Backend Structure (`giftnow-backend/`)

```
giftnow-backend/
└── src/
    └── giftnow/                              — entire module
        ├── giftnow.module.ts                 — registers all services, queues, controllers
        ├── giftnow.controller.ts             — customer-facing routes (purchase, redeem, wallet)
        ├── dto/                              — Data Transfer Objects (request/response shapes)
        │   ├── purchase-giftcard.dto.ts      — type, amount, email, message, address, qty
        │   ├── redeem-giftcard.dto.ts        — { code: string }
        │   ├── admin-create.dto.ts           — amount, type, quantity, batchName
        │   ├── admin-cancel.dto.ts           — cardId, reason
        │   └── wallet-history.dto.ts         — pagination: page, limit, dateRange
        ├── services/                         — core business logic
        │   ├── giftcard.service.ts           — purchase + code generation logic
        │   ├── wallet.service.ts             — creditWallet, debitWallet, getBalance (Redis cache)
        │   ├── redemption.service.ts         — validateCode, mark FULLY_REDEEMED, call wallet.credit
        │   ├── delivery.service.ts           — enqueue email job / print job to BullMQ
        │   └── audit.service.ts             — writeAuditEntry (immutable inserts only)
        ├── processors/                       — BullMQ job processors
        │   ├── email.processor.ts            — handles email queue jobs (SendGrid/SES)
        │   ├── bulk.processor.ts             — async batch code generation for corporate orders
        │   └── print.processor.ts            — physical card print job queue handler
        ├── admin/
        │   ├── admin-giftcard.controller.ts  — all /admin/* routes
        │   ├── admin-giftcard.service.ts     — create, cancel, list, analytics, export CSV
        │   └── bulk.service.ts               — batch creation, discount config, CSV export
        ├── guards/
        │   ├── giftnow-auth.guard.ts         — verifies JWT; returns 401 for unauthenticated wallet requests
        │   ├── admin-jwt.guard.ts            — elevated admin JWT scope check
        │   └── rate-limit.guard.ts           — 10/IP/hr, 5/account/hr for redemption
        └── utils/
            ├── code-generator.ts             — generateGiftNowCode() — UUID v4 + random 8 suffix
            ├── qr-generator.ts               — QR code image generation for email embed
            ├── amount-validator.ts           — validates NPR 100–1,00,000 range
            ├── csv-exporter.ts               — streams CSV of card data for admin export
            └── jitter.ts                     — 100–300ms random delay for failed code lookups
```

### Prisma

```
prisma/
├── schema.prisma                             — all 4 tables: GiftCards, GiftCardWallet, AuditLog, Batch
└── migrations/
    └── 001_giftnow_init.sql                  — initial tables + all 7 indexes
```

### Config files

```
.env.example                                  — template for team members
package.json
```

---

## Database

**PostgreSQL** (primary writes + read replica for analytics).
**Redis** (BullMQ queues + wallet balance cache TTL 30s).
All schemas map exactly to SRS Section 7.

### PostgreSQL Tables (`giftnow_db`)

| Table | Description |
|---|---|
| `GiftCards` | Master table (14 fields) |
| `GiftCardWallet` | One per account |
| `GiftCardAuditLog` | Immutable log |
| `GiftCardBatch` | Corporate batches |

### Redis Usage

| Key Pattern | Purpose |
|---|---|
| `wallet:balance:{accountId}` | TTL 30s wallet balance cache |
| `bull:email-queue` | Email delivery jobs |
| `bull:bulk-queue` | Code generation jobs |
| `bull:print-queue` | Physical print jobs |
| `ratelimit:{ip}:{hour}` | Rate limit counters |

---

## Docker Compose Services

| Service | Image | Port(s) |
|---|---|---|
| PostgreSQL (primary) | `postgres:16` | `5432` |
| PostgreSQL (replica) | `postgres:16` | `5433` — analytics read replica |
| Redis | `redis:7` | `6379` — BullMQ + cache |
| MailHog | `mailhog/mailhog` | `1025`, `8025` — local email testing (dev only) |

---

## Setup Steps

### Step 1 — Create Backend (NestJS)

```bash
# Install NestJS CLI globally
npm i -g @nestjs/cli

# Create project
nest new giftnow-backend
cd giftnow-backend

# Install all required packages
npm install @nestjs/config @nestjs/jwt @nestjs/throttler
npm install @prisma/client prisma
npm install @nestjs/bullmq bullmq ioredis
npm install @nestjs/cache-manager cache-manager
npm install qrcode nodemailer @sendgrid/mail
npm install csv-writer uuid crypto
npm install class-validator class-transformer
npm install --save-dev @types/uuid @types/qrcode
```

### Step 2 — Setup Prisma + Database

```bash
# Initialize Prisma
npx prisma init

# Edit prisma/schema.prisma — add all 4 GiftNow models
# (GiftCards, GiftCardWallet, GiftCardAuditLog, GiftCardBatch)

# Run first migration
npx prisma migrate dev --name giftnow_init

# Generate Prisma client
npx prisma generate

# Open Prisma Studio to inspect data
npx prisma studio
```

### Step 3 — Docker Compose (Local Dev)

```yaml
# docker-compose.yml in project root
version: '3.8'
services:
  postgres:
    image: postgres:16
    ports: ['5432:5432']
    environment:
      POSTGRES_DB: giftnow_db
      POSTGRES_USER: giftnow
      POSTGRES_PASSWORD: giftnow_secret
  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
  mailhog:
    image: mailhog/mailhog
    ports: ['1025:1025', '8025:8025']
```

```bash
# Start all services
docker compose up -d
```

### Step 4 — Create the NestJS GiftNow Module

```bash
# Generate the module, controller, service
nest g module giftnow
nest g controller giftnow
nest g service giftnow/services/giftcard
nest g service giftnow/services/wallet
nest g service giftnow/services/redemption
nest g service giftnow/services/delivery
nest g service giftnow/services/audit

# Create admin sub-controller
nest g controller giftnow/admin/admin-giftcard
nest g service giftnow/admin/admin-giftcard
nest g service giftnow/admin/bulk
```

### Step 5 — Create Frontend (Next.js)

```bash
# If starting fresh
npx create-next-app@latest giftnow-frontend --typescript --tailwind --app
cd giftnow-frontend

# Install dependencies
npm install axios zustand @tanstack/react-query
npm install qrcode.react react-qr-reader
npm install recharts               # for admin analytics charts
npm install react-hook-form zod @hookform/resolvers

# Create GiftNow folder structure
mkdir -p src/app/\(customer\)/giftnow/{buy,redeem,wallet,history}
mkdir -p src/app/\(admin\)/giftnow/{cards,create,bulk,analytics}
mkdir -p src/components/giftnow/admin
mkdir -p src/lib/giftnow
mkdir -p src/hooks
```

### Step 6 — Environment Variables

```bash
# giftnow-backend/.env
DATABASE_URL="postgresql://giftnow:giftnow_secret@localhost:5432/giftnow_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_jwt_secret_here"
ADMIN_JWT_SECRET="your_admin_jwt_secret_here"
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxx"
FROM_EMAIL="noreply@suindragroups.com.np"

# giftnow-frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="GiftNow"
```

### Step 7 — Build Order (Follow the SRS Roadmap)

| Week | Focus |
|---|---|
| Week 1 | `schema.prisma` + migrations + `code-generator.ts` + unit tests |
| Week 2 | `wallet.service.ts` + `redemption.service.ts` + `audit.service.ts` |
| Week 3 | `delivery.service.ts` + `email.processor.ts` + `qr-generator.ts` |
| Week 4 | Admin controller + `bulk.service.ts` + `csv-exporter.ts` |
| Week 5 | All React components + Flutter screens |
| Week 6 | Checkout integration + coupon stacking + E2E tests |
| Week 7 | Deploy to staging → production + monitoring setup |

---

## Getting Started — Key Priorities

### Most Important Files to Build First (Week 1)

**Backend — build in this order:**

1. `prisma/schema.prisma` (all 4 tables)
2. `utils/code-generator.ts` (`generateGiftNowCode()` function)
3. `wallet.service.ts`

These three are the foundation everything else depends on.

**Frontend — folder additions:**

Your existing project already has the `(customer)/`, `(admin)/`, `components/`, `lib/`, `store/`, and `hooks/` folders. You just need to add the `giftnow/` subfolder inside each of them — it fits perfectly into your existing pattern.

### Files Not in Your Existing Project

| File | Location | Priority |
|---|---|---|
| `useGiftNowStore.ts` | `store/` folder | Zustand state for wallet balance and checkout toggle |
| `GiftNowCheckoutToggle.tsx` | `components/giftnow/` | Most critical integration point — plugs into existing checkout page |
| `rate-limit.guard.ts` | Backend `guards/` | Must be in place before any redemption endpoint goes live |
| `audit.service.ts` | Backend `services/` | Must be called on every single wallet operation, no exceptions |

### Critical Build Order

> **Database schema → wallet service → redemption service → delivery queue → frontend components**

Don't build the UI until the wallet service is solid and tested, because the checkout toggle depends on it being reliable.
