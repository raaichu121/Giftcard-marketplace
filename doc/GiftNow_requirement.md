# GiftNow — Requirements & Schema Reference

---

## Core Pillars

| Pillar | Requirement |
|---|---|
| **Lifetime validity** | Cards never expire. No expiry field stored. No enforcement logic ever runs. |
| **Platform-wide** | Works across all sellers and all categories. No seller-specific cards. |
| **Account wallet** | Balance stored in personal wallet, not a one-time code. Non-transferable post-redemption. |
| **Custom denomination** | NPR 100 – NPR 1,00,000. Any whole-rupee value. No fixed tiers. |
| **Private balance** | Balance visible only to authenticated account holder. No public API. `401` for unauth. |
| **Coupon stacking** | Coupon applies first to subtotal; gift card balance covers the remainder. |

---

## Delivery Types

### DIGITAL
Email delivery within 60 seconds of payment. Includes code, QR, sender name, message, and redemption instructions. Sender gets a confirmation email.

### PHYSICAL
Postal delivery with print job queue. Code activates immediately — recipient can redeem before physical card arrives. Tracked via logistics provider.

### CORPORATE BULK
Min 10 cards. Single or mixed denominations. CSV download. Bulk discounts configurable by admin. Redemption rate tracked per batch.

---

## API Endpoints

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/gift-cards/purchase` | Customer | Purchase digital / physical / corporate card |
| POST | `/gift-cards/redeem` | Customer | Redeem code into account wallet |
| GET | `/gift-cards/wallet` | Customer | Current wallet balance (auth required) |
| GET | `/gift-cards/wallet/history` | Customer | Paginated wallet audit history |
| GET | `/gift-cards/purchased` | Customer | List cards purchased by this account |
| POST | `/gift-cards/admin/create` | Admin | Single or bulk card creation |
| POST | `/gift-cards/admin/cancel/:id` | Admin | Cancel card with refund logic |
| GET | `/gift-cards/admin/list` | Admin | List all cards with filters |
| GET | `/gift-cards/admin/analytics` | Admin | Analytics dashboard data |
| GET | `/gift-cards/admin/batch/:id` | Admin | View corporate bulk batch details |
| GET | `/gift-cards/admin/export` | Admin | CSV export for reconciliation |

---

## Error Codes

| Error Code | HTTP | Meaning |
|---|---|---|
| `GIFT_CARD_NOT_FOUND` | 404 | Code does not exist |
| `GIFT_CARD_ALREADY_REDEEMED` | 409 | Code already redeemed into a wallet |
| `GIFT_CARD_CANCELLED` | 410 | Code invalidated by admin |
| `INVALID_AMOUNT` | 422 | Amount outside NPR 100–1,00,000 |
| `INSUFFICIENT_WALLET` | 422 | Wallet balance insufficient (deducts available only) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many redemption attempts from IP |
| `UNAUTHORIZED` | 401 | Unauthenticated request to wallet endpoint |

---

## Database Schema

### GiftCards — Master Table (one record per card code)

| Field | Type | Tags | Notes |
|---|---|---|---|
| id | String | PK | UUID — primary key |
| code | String | UNIQUE IDX | `GN-XXXX-XXXX-XXXX-RAND8` format. Primary lookup for redemption. |
| type | Enum | | `DIGITAL` \| `PHYSICAL` \| `CORPORATE_BULK` |
| amount | Float | | Face value in NPR (100–1,00,000). Locked at purchase. |
| status | Enum | | `ACTIVE` \| `FULLY_REDEEMED` \| `CANCELLED` |
| purchasedByAccountId | String | FK IDX | → Account (purchaser). Used for purchase history. |
| redeemedByAccountId | String? | FK IDX | nullable → Account (recipient). Null until redeemed. |
| recipientEmail | String? | nullable | Recipient email — DIGITAL delivery only. |
| personalMessage | String? | nullable | Optional message from purchaser. |
| deliveryAddress | Json? | nullable | Postal address — PHYSICAL cards only. |
| batchId | String? | FK IDX | nullable → GiftCardBatch. Set for CORPORATE_BULK cards. |
| redeemedAt | DateTime? | nullable | Timestamp when code was redeemed into wallet. |
| cancelledAt | DateTime? | nullable | Timestamp of admin cancellation. |
| createdAt | DateTime | | Record creation timestamp. |
| updatedAt | DateTime | | Last updated timestamp. |

### GiftCardWallet — One Wallet Per Account (single source of truth)

| Field | Type | Tags | Notes |
|---|---|---|---|
| id | String | PK | UUID |
| accountId | String | UNIQUE FK IDX | → Account. One wallet per account. Used at checkout. |
| balance | Float | | Current wallet balance in NPR. Never goes negative. |
| totalCredited | Float | | Lifetime total credited to this wallet. |
| totalDebited | Float | | Lifetime total debited from this wallet. |
| createdAt | DateTime | | Wallet creation timestamp. |
| updatedAt | DateTime | | Last balance change timestamp. |

### GiftCardAuditLog — Immutable (records NEVER deleted or updated)

| Field | Type | Tags | Notes |
|---|---|---|---|
| id | String | PK | UUID |
| accountId | String | FK IDX | → Account. For audit trail queries. |
| giftCardId | String? | FK | nullable → GiftCard. Set on CREDIT operations. |
| orderId | String? | FK | nullable → Order. Set on DEBIT operations. |
| operation | Enum | | `CREDIT` \| `DEBIT` \| `ADMIN_CANCEL_DEBIT` \| `REFUND_CREDIT` |
| amount | Float | | Amount involved in this operation. |
| balanceBefore | Float | | Wallet balance before this operation. |
| balanceAfter | Float | | Wallet balance after this operation. |
| performedBy | String | | accountId of actor (user or admin). |
| createdAt | DateTime | IDX | Immutable timestamp. For time-range queries. |

### GiftCardBatch — Corporate Bulk Orders Only

| Field | Type | Notes |
|---|---|---|
| id | String | UUID |
| name | String | Batch name or campaign label. |
| totalCards | Int | Number of cards in this batch. |
| totalAmount | Float | Sum of all card face values in the batch. |
| createdByAdminId | String | → Admin account. |
| createdAt | DateTime | Batch creation timestamp. |

---

## Code Format

```
GN-A3F2-9C41-E87B-3D2A1F4C
```

| Part | Detail |
|---|---|
| Prefix | `GN-` (platform identifier) |
| Total length | 22 chars (excl. hyphens) |
| Segments | 3 × 4 chars from UUID v4 |
| Suffix | 8 cryptographically random chars |
| Charset | A–Z and 0–9 (O, 0, I, 1 excluded) |
| States | `ACTIVE` → `FULLY_REDEEMED` \| `CANCELLED` |

---

## Security Requirements

- Gift card codes: UUID v4 + cryptographically random 8-char suffix
- Rate limiting: max 10 redemption attempts per IP/hour; 5 per account/hour
- All API endpoints require HTTPS — HTTP requests rejected with `301` redirect
- Wallet operations wrapped in DB-level transactions — no partial updates possible
- Admin endpoints require separate admin JWT with elevated permission scope
- Code enumeration protection: failed lookups introduce 100–300ms random jitter delay

---

## What GiftNow Is

A gift card platform that lives inside Su Indra Groups' e-commerce ecosystem. The core idea is that a gift card code gets redeemed **once** into an account wallet, and from then on the wallet balance automatically deducts at checkout — no re-entering codes every time.

---

## The 4 Database Tables You Need to Build

### 1. GiftCards
The master table. Every card ever created lives here.
- The `code` field has a unique index (it's the primary lookup during redemption)
- Status only has 3 states (`ACTIVE`, `FULLY_REDEEMED`, `CANCELLED`) — no partial redemption state
- `amount` is locked the moment the code is generated

### 2. GiftCardWallet
One row per user account. This is the **single source of truth** for balance.
- `accountId` is unique (one wallet per person)
- Balance can never go negative
- `totalCredited` and `totalDebited` are running lifetime totals separate from current balance

### 3. GiftCardAuditLog
This table is **immutable**. You write to it, you never update or delete from it.
- Every single wallet balance change (credit, debit, refund, admin cancel) gets a row here
- Stores `balanceBefore` and `balanceAfter` so you can reconstruct the full history at any point

### 4. GiftCardBatch
Only used for corporate/bulk orders. Groups multiple `GiftCard` records under one batch via the `batchId`.

---

## Critical Requirements for Developers

> ⚠️ **Wallet operations must use database transactions** — no partial credits/debits ever

> ⚠️ **The audit log's `createdAt` has an index for time-range queries** — make sure that index is created in the migration

> ⚠️ **Redemption service must be idempotent** — if the same code is redeemed twice, the second attempt returns `409` immediately, no double-credit

> ⚠️ **The code generation function excludes O, 0, I, 1 from the charset** to avoid visual confusion

---

## Functional Requirements

### Gift Card Purchase
Customer selects type (Digital/Physical/Corporate), enters a custom amount (NPR 100–1,00,000), fills in recipient info, and pays via Fonepay / eSewa / COD. On payment confirmation, card code is generated immediately. Amount is locked — cannot change post-generation.

### Code Redemption into Wallet
Recipient navigates to My Account → GiftNow Wallet → Redeem a Card.
Enters code (or scans QR on Flutter). System validates: correct format, status `ACTIVE`, not cancelled.
On success, full amount credited to wallet instantly. Card marked `FULLY_REDEEMED`. No partial redemption — wallet tracks usage.

### Checkout Wallet Deduction
If account has positive balance, checkout shows "Apply GiftNow Balance" toggle **ON by default**. Coupon discount applied first to subtotal. Then wallet balance covers remainder. Remaining amount charged to selected payment method. Wallet can never go negative. Partial use is fully supported.

### Email Delivery (Digital)
Email dispatched within 60 seconds of payment. Contains: card code, amount, sender name, personal message, QR code, and redemption instructions. Sender also receives a separate confirmation email. Delivered via SendGrid or AWS SES. Must hit 100% SLA — no missed emails.

### Physical Card (Postal)
System generates code + queues print job. Card displays: GiftNow brand, amount, unique code, QR/barcode. Code activates immediately — recipient can redeem from confirmation email before card arrives. Delivery tracked via logistics provider. Push notification + email sent to purchaser on dispatch.

### Corporate / Bulk Cards
Minimum 10 cards per batch. Single denomination or mixed amounts. All codes generated in one async job (BullMQ). CSV download of all codes. Admin configures bulk discounts (e.g. 2% off for 100+ cards). Dashboard shows batch status, redemption rate per batch, outstanding balance.

### Refund Handling
- Order cancelled: refunded amount returns to GiftNow wallet (not original payment method)
- Gift card purchase refunded: wallet credited with purchase amount
- Defective physical card: admin issues full replacement or wallet credit
- No refund to original card/bank

### Admin Operations
Create single or bulk cards. Cancel card: marks `CANCELLED`, deducts from wallet if already redeemed (with audit entry). View all cards: filter by status, type, date range, amount range. View redemption history per card. Export CSV for reconciliation. Analytics dashboard: issued count/value, redeemed vs outstanding, redemption rate by type, average denomination.

---

## Non-Functional Requirements

| Requirement | Category | Specification | Priority |
|---|---|---|---|
| System uptime | Reliability | 99.9% availability → <8.7 hours downtime/year | Critical |
| Code validation speed | Performance | <200ms at P99 | Critical |
| Wallet deduction speed | Performance | <300ms at P99 | Critical |
| Email delivery SLA | Reliability | 100% within 60 seconds | Critical |
| Balance inquiry speed | Performance | <150ms at P99 (Redis cache TTL 30s) | Critical |
| Bulk code generation (100) | Performance | <5 seconds at P95 (async BullMQ job) | High |
| Admin dashboard load | Performance | <2 seconds at P95 | High |
| Concurrent bulk generation | Scalability | Handle 1,000 concurrent bulk card requests | High |
| Wallet horizontal scaling | Scalability | Stateless NestJS instances + shared Postgres | High |
| Wallet idempotency | Reliability | Duplicate requests produce zero double-credits | Critical |
| DB write safety | Reliability | All wallet ops in Prisma transactions — no partial updates | Critical |
| Audit log coverage | Compliance | 100% of wallet balance changes captured | Critical |
| Balance privacy | Security | 401 for unauthenticated requests. No public API. | Critical |

---

## Security Requirements

### Code Generation Security
- UUID v4 + cryptographically random 8-char suffix (`crypto.randomBytes`)
- Charset excludes ambiguous chars: O, 0, I, 1 (prevents visual confusion + brute force surface)
- Non-sequential codes — randomized to make enumeration attacks infeasible
- Code stored hashed or with secure lookup — raw code never logged in plaintext

### Rate Limiting & Enumeration Protection
- Max 10 redemption attempts per IP per hour
- Max 5 redemption attempts per account per hour
- Failed lookups introduce 100–300ms random jitter (prevents timing attacks)
- CAPTCHA on high-frequency redemption attempts (industry best practice)
- Automated alerts for unusual patterns: high-value redemptions in quick succession

### Transport & Auth Security
- HTTPS enforced on all endpoints — HTTP rejected with `301`
- Admin endpoints require separate admin JWT with elevated scope
- All wallet balance checks require authentication — `401` for unauth
- Admin balance views logged to audit trail
- AES encryption for sensitive data at rest (industry standard)

### Fraud Monitoring Requirements
- Track lifecycle of every card: generation → activation → redemption → use
- Flag repeated balance checks without purchase (enumeration pattern)
- Monitor multiple bulk card purchases from one account in short window
- Incident response plan: investigate, notify affected parties, post-incident analysis
- Record-keeping: transaction date, purchaser ID, amount, card number — min 3 years

---

## Critical User Flows

### A. Purchase (Digital)

| Step | Action |
|---|---|
| 1. Navigate to GiftNow | User goes to 'Buy a Gift Card' page |
| 2. Enter amount | NPR 100–1,00,000 with real-time validation |
| 3. Enter recipient | Email address + optional personal message |
| 4. Pay | Fonepay / eSewa / COD — standard order flow |
| 5. Code generated | Email dispatched within 60 seconds |
| 6. Confirmation | Sender receives confirmation; recipient gets code + QR |

### B. Redeem Code → Wallet

| Step | Action |
|---|---|
| 1. Go to wallet | My Account → GiftNow Wallet → Redeem |
| 2. Enter / scan code | Manual entry or QR scan (Flutter camera) |
| 3. Validation | Check: format valid, status `ACTIVE`, not cancelled, rate limit not exceeded |
| 4. Credit wallet | Full amount credited instantly; card → `FULLY_REDEEMED` |
| 5. Confirmation | "Credited NPR X. New balance: NPR Y" — in-app + email |
| 6. Audit logged | Immutable `CREDIT` entry written to `GiftCardAuditLog` |

### C. Use Balance at Checkout

| Step | Action |
|---|---|
| 1. Checkout detected | System detects positive wallet balance |
| 2. Toggle shown | "Use GiftNow Balance (NPR X)" — ON by default |
| 3. Coupon first | Coupon discount applied to item subtotal |
| 4. Wallet applied | GiftNow balance covers post-coupon remainder |
| 5. Payment gateway | Any remaining amount charged to Fonepay/eSewa |
| 6. Atomic commit | Wallet debit + order creation in one DB transaction. Gateway failure → rollback. |

---

## Technical Stack Requirements

### Backend — NestJS + Prisma
- NestJS modular architecture — one `giftnow.module.ts` with sub-services
- Prisma ORM with PostgreSQL — all wallet ops in `prisma.$transaction()`
- PostgreSQL primary for all writes + read replica for analytics
- Redis cache for wallet balance reads (TTL: 30s) to reduce DB load at checkout
- BullMQ + Redis for email delivery queue, bulk code generation, physical print queue
- Idempotency: stable `jobId` in BullMQ prevents duplicate email sends

### Frontend — React/Next.js
- React/Next.js components: `GiftNowPurchase`, `GiftNowRedeem`, `GiftNowWallet`, `GiftNowHistory`, `GiftNowCheckoutToggle`
- Admin React components: `AdminDashboard`, `AdminBulkCreate`, `AdminCardList`, `AdminAnalytics`
- QR code scanning via Flutter camera plugin on mobile redeem screen
- Real-time checkout order summary: Subtotal → Coupon → GiftNow → Final payable

### Email & Notification System
- SendGrid or AWS SES for transactional email delivery
- BullMQ retry queue with exponential backoff for failed email jobs
- Dead Letter Queue (DLQ) for permanently failed email jobs — manual review
- QR code embedded in email as inline image (not attachment)
- Push notifications for: dispatch confirmation, redemption success, balance < NPR 100 alert

### Database Indexes Required

| Index | Type | Purpose |
|---|---|---|
| `GiftCards.code` | UNIQUE | Redemption lookup |
| `GiftCards.purchasedByAccountId` | Index | Purchase history |
| `GiftCards.redeemedByAccountId` | Index | Wallet history |
| `GiftCards.batchId` | Index | Batch management |
| `GiftCardWallet.accountId` | UNIQUE | Checkout lookup |
| `GiftCardAuditLog.accountId` | Index | Audit queries |
| `GiftCardAuditLog.createdAt` | Index | Time-range audit queries |

---

## Integration Requirements

| System | Integration Type | Key Requirement | Edge Case to Handle |
|---|---|---|---|
| Payment gateway (Fonepay/eSewa) | Bidirectional | Gift card purchase = standard order. Wallet deduction in same DB transaction as order. | Gateway failure after wallet deduction → rollback deduction atomically |
| Order service | Bidirectional | Order stores: `giftNowAmountUsed`, `walletBalanceBefore`, `walletBalanceAfter` | Order cancellation → refund to GiftNow wallet, not original payment |
| Coupon system | Sequential | Coupon runs first → gift card covers remainder. One coupon max (existing rule). | Two coupons + gift card = invalid combination. Must block at checkout. |
| Seller dashboard | Read-only attribution | GiftNow shown as payment method in order breakdown. Revenue attributed normally. | No seller-specific cards. Sellers cannot create their own GiftNow cards. |
| Email service (SendGrid/SES) | Async queue | Digital cards: email within 60s. Physical dispatch: email on dispatch. Redemption: email + in-app. | Email failure → BullMQ retry with exponential backoff → DLQ after N attempts |
| Logistics provider | Webhook/polling | Physical card dispatch tracking status pushed to purchaser via push + email. | Undelivered physical card → admin manual intervention + wallet credit option |
