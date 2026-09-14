# GiftNow — Software Requirements Specification

**Su Indra Groups Pvt. Ltd.**
Janakpurdham, Dhanusha, Nepal

| Field          | Value                     |
| -------------- | ------------------------- |
| Document Title | GiftNow SRS — v1.0        |
| Platform       | Su Indra Groups — GiftNow |
| Version        | 1.0                       |
| Status         | Draft                     |
| Author         | Ravi Pajiyar              |
| Date           | May 2026                  |
| Classification | Internal — Confidential   |

> info@suindragroups.com.np | https://www.suindragroups.com.np | +977 9844129557

---

## 1. Executive Summary

This Software Requirements Specification (SRS) defines the complete implementation of **GiftNow** — the official gift card platform of Su Indra Groups Pvt. Ltd. GiftNow is a standalone, production-ready gift card system designed to operate as an integrated module within Su Indra's digital commerce ecosystem.

GiftNow is built around the following non-negotiable pillars:

- **Lifetime validity** — gift cards never expire
- **Platform-wide redemption** — works across all sellers and categories
- **Account-linked balance** — stored in a personal wallet, not a standalone one-time code
- **Flexible custom denominations** — no fixed tiers
- **Three delivery types** — Digital (email), Physical (postal), Corporate bulk
- **Private balance API** — balance is visible only in the authenticated account wallet
- **Non-transferable** — cards are account-specific once redeemed
- **Coupon compatibility** — gift card balance and coupons can stack

---

## 2. Scope

### 2.1 In Scope

- Digital gift cards delivered via email (instant delivery)
- Physical gift cards with QR code / barcode (postal delivery)
- Corporate bulk gift card creation via admin dashboard
- Custom denomination: minimum NPR 100, maximum NPR 1,00,000
- Lifetime validity (no expiry date stored or enforced)
- Account wallet integration (balance auto-deducted at checkout)
- Platform-wide redemption across all sellers
- Coupon + gift card stacking at checkout (coupon applied first)
- Audit trail for every balance change
- Admin operations: create, cancel, view, bulk issue
- Seller dashboard: gift card revenue attribution only (no seller-specific cards)
- NestJS backend module with Prisma ORM
- Flutter mobile app components (purchase, wallet, redemption, history)
- React/Next.js web frontend components and admin dashboard

### 2.2 Out of Scope

- Fixed denomination tiers
- Seller-specific gift cards
- Public balance check API (balance is private and account-linked)
- Email transfer / re-gifting (cards are non-transferable post-redemption)
- Coin/credit exchange system
- Scheduled future delivery
- Category-restricted gift cards
- Expiry date enforcement

### 2.3 Phase Implementation Roadmap

This SRS defines the complete feature set. Implementation is split into two phases:

#### **Phase 1 (v1) — June 2026: Admin Dashboard + API Foundation**

**Backend (NestJS):**

- ✅ All core services (giftcard, wallet, redemption, audit, delivery, checkout)
- ✅ All admin controllers (create, list, cancel, analytics, batch, export)
- ✅ All customer APIs (purchase, redeem, wallet, wallet/history, purchased)
- ✅ All processors (email, bulk, print queues via BullMQ)
- ✅ Rate limiting, security, audit logging
- ✅ Database schema with indexes and immutable audit logs
- ✅ Checkout integration (wallet deduction in order flow)

**Frontend (React/Next.js):**

- ✅ Admin dashboard (`/admin/giftnow/*`)
  - Cards list with filters, cancel, export CSV
  - Create single or bulk cards
  - Analytics dashboard with charts
  - Batch details view
  - Bulk discount configuration
- ✅ Customer API mock pages (for testing)
- ✅ Header navigation (admin-only for v1)

**Ready for Integration:**

- Payment gateway (Fonepay, eSewa, COD) — awaiting gateway API keys
- Email service (SendGrid / SES) — email.processor ready
- Physical print service — print.processor ready

#### **Phase 2 (v2+) — July+ 2026: Customer UI + Full Integration**

**Frontend (React/Next.js):**

- Customer purchase flow (`/giftnow/buy`)
- Customer redeem flow (`/giftnow/redeem`)
- Customer wallet (`/giftnow/wallet`)
- Checkout GiftNow balance toggle integration
- Order history with gift card usage

**Frontend (Flutter Mobile):**

- Purchase screen
- Redeem screen
- Wallet screen
- History screen
- Checkout integration

**Backend (Complete Integration):**

- Payment gateway configuration + testing
- Email delivery service configuration + SendGrid/SES setup
- Physical card print partner integration
- Mobile app API authentication

---

## 3. GiftNow — Feature Reference

| Feature            | GiftNow Implementation Requirement                          |
| ------------------ | ----------------------------------------------------------- |
| Delivery Types     | Digital (email), Physical (postal), Corporate bulk          |
| Denominations      | Custom — NPR 100 to NPR 1,00,000 (no fixed tiers)           |
| Validity           | Lifetime — no expiration, ever                              |
| Redemption         | Automatic at checkout from account wallet balance           |
| Balance Visibility | Private — only in authenticated account wallet              |
| Transferability    | Non-transferable (account-specific post-redemption)         |
| Seller Coverage    | Platform-wide — all sellers, all categories                 |
| Coupon Stacking    | Yes — coupon applies first, then gift card balance deducted |
| Refunds            | Refunded to gift card wallet (not original payment method)  |
| Balance Tracking   | Account wallet — real-time deduction on purchase            |
| Audit Trail        | Full immutable history of every balance credit and debit    |
| Corporate / Bulk   | Admin bulk creation with dashboard management               |

---

## 4. Functional Requirements

### 4.1 Gift Card Types

GiftNow supports exactly three gift card types:

#### 4.1.1 Digital Gift Card (Email Delivery)

- Customer selects a custom amount between NPR 100 and NPR 1,00,000
- Customer enters recipient email address and an optional personal message
- System generates a unique gift card code immediately upon payment confirmation
- Email is dispatched within 60 seconds of payment
- Email contains: card code, amount, sender name, personal message, and redemption instructions
- A QR code representation of the card code is embedded in the email
- Sender receives a confirmation email with order details

#### 4.1.2 Physical Gift Card (Postal Delivery)

- Customer selects amount and enters a postal delivery address
- System generates the card code and queues a physical card print job
- Physical card displays: GiftNow brand name, card amount, unique code, QR code / barcode
- Delivery tracked via integrated logistics provider
- Digital confirmation email sent to purchaser upon dispatch
- Card code activates immediately — recipient can redeem via code from the confirmation email before physical card arrives

#### 4.1.3 Corporate / Bulk Gift Cards

- Admin or authorised corporate account creates bulk order (minimum 10 cards)
- Bulk orders support a single denomination applied to all cards, or a list of individual amounts
- All codes generated in one batch and downloadable as CSV
- Optional branded packaging configuration for physical bulk orders
- Admin dashboard shows bulk order status, redemption rate per batch, and outstanding balance
- Bulk discounts configurable by admin (e.g., 2% discount for 100+ cards)

### 4.2 Denomination Rules

- Minimum denomination: NPR 100
- Maximum denomination: NPR 1,00,000
- Custom amount — buyer enters any whole-rupee value within the range
- No fixed tiers — any amount is supported
- Amount is locked at purchase — cannot be changed after code generation

### 4.3 Lifetime Validity

- Gift cards do **NOT** expire — ever
- No expiry date field is stored in the primary record
- No expiry enforcement logic is implemented or scheduled
- Balance remains in the account wallet indefinitely until spent
- Applies to all three card types (digital, physical, corporate)

### 4.4 Account Wallet & Balance Management

The account wallet is the core of GiftNow. Gift card value is stored as a wallet balance, not as a one-time-use code.

#### 4.4.1 Redemption into Wallet

- Recipient enters the gift card code on the 'Redeem a GiftNow Card' page
- System validates the code: correct format, not previously redeemed, not cancelled
- On successful validation, the card's full amount is credited to the account wallet instantly
- The card code is marked `FULLY_REDEEMED` and cannot be reused
- Wallet balance is visible in 'My Account → GiftNow Wallet' section

#### 4.4.2 Automatic Deduction at Checkout

- If the account has a positive wallet balance, checkout displays 'Apply GiftNow Balance' toggle — enabled by default
- On order placement, wallet balance is deducted first (up to the order total)
- Remaining order amount (if any) is charged to the selected payment method (Fonepay, eSewa, COD)
- Partial use is fully supported — wallet retains unused balance
- Wallet balance cannot go negative

#### 4.4.3 Balance Privacy

- Wallet balance is visible only to the authenticated account holder
- There is NO public balance check API
- Admin can view any account's wallet balance via the admin panel with full audit logging
- Balance checks require authentication — unauthenticated requests return `401`

### 4.5 Coupon + Gift Card Stacking

- Both coupons and gift card balance can be applied to the same order
- Application order: coupon discount applied first to item total; gift card balance then covers the remaining amount
- Multiple coupons cannot be stacked (existing system rule — unchanged)
- One active gift card wallet per account — all redeemed cards add to the same balance pool
- The checkout UI clearly shows: original price → after coupon → after GiftNow balance → final payable

### 4.6 Refund Policy

- If an order using gift card balance is refunded, the refunded amount returns to the GiftNow wallet (not the original payment method)
- Refunds for gift card purchases themselves: the purchasing account's wallet is credited with the purchase amount
- Defective physical cards: full replacement or wallet credit issued by admin

### 4.7 Non-Transferability

- Once a gift card code is redeemed into an account wallet, the balance belongs to that account
- Wallet balance cannot be transferred to another account
- Gift card codes (before redemption) can be shared by the purchaser — the code itself is the bearer instrument
- After redemption, no transfer mechanism exists

### 4.8 Admin Operations

#### 4.8.1 Gift Card Management

- Create single or bulk gift cards with custom amounts
- Cancel a gift card: marks it `CANCELLED`; if already in a wallet, deducts the amount from that wallet with an audit entry
- View all gift cards: filterable by status, type, date range, amount range
- View redemption history per card
- Export gift card data as CSV for reconciliation

#### 4.8.2 Analytics Dashboard

- Total gift cards issued (count and value)
- Total redeemed value vs outstanding wallet balances
- Redemption rate by card type
- Revenue generated from gift card purchases
- Average gift card denomination

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Operation                           | Target       | Percentile     |
| ----------------------------------- | ------------ | -------------- |
| Code validation (redemption)        | < 200 ms     | P99            |
| Wallet balance deduction (checkout) | < 300 ms     | P99            |
| Digital email delivery              | < 60 seconds | 100% of orders |
| Balance inquiry (authenticated)     | < 150 ms     | P99            |
| Bulk code generation (100 cards)    | < 5 seconds  | P95            |
| Admin dashboard load                | < 2 seconds  | P95            |

### 5.2 Security

- Gift card codes use UUID v4 + cryptographically random 8-character suffix (e.g., `GN-XXXX-XXXX-XXXX-RAND8`)
- Rate limiting: maximum 10 redemption attempts per IP per hour; 5 per account per hour
- All API endpoints require HTTPS — HTTP requests rejected with `301`
- Wallet operations use database-level transactions — no partial updates possible
- Admin endpoints require separate admin JWT with elevated permission scope
- Code enumeration protection: failed lookups introduce jitter delay (100–300 ms random)

### 5.3 Reliability

- System availability: 99.9% uptime (< 8.7 hours downtime/year)
- Email delivery SLA: 100% within 60 seconds for digital cards
- Wallet operations are idempotent — duplicate requests produce no double-credits
- Database: PostgreSQL with read replica for analytics; primary for all writes
- Async job queue (BullMQ / Redis) for email delivery and bulk code generation

### 5.4 Scalability

- Code generation service must handle 1,000 concurrent bulk card generation requests
- Wallet service scales horizontally — stateless NestJS instances with shared Postgres
- Redis cache for wallet balance reads (TTL: 30 seconds) to reduce DB load at checkout

---

## 6. Gift Card Code Specification

### 6.1 Code Format

GiftNow codes follow the pattern: `GN-XXXX-XXXX-XXXX-RAND8`

- **Prefix:** `GN-` (identifies platform: GiftNow)
- **Segments:** 3 groups of 4 alphanumeric characters derived from UUID v4
- **Suffix:** 8 cryptographically random alphanumeric characters
- **Total length:** 22 characters (excluding hyphens)
- **Character set:** Uppercase A–Z and 0–9 (ambiguous characters O, 0, I, 1 excluded)
- **Example:** `GN-A3F2-9C41-E87B-3D2A1F4C`

### 6.2 Code Generation Algorithm

```typescript
function generateGiftNowCode(): string {
  const uuid = randomUUID().replace(/-/g, "").substring(0, 12).toUpperCase();
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `GN-${uuid.slice(0, 4)}-${uuid.slice(4, 8)}-${uuid.slice(8, 12)}-${suffix}`;
}
// Example output: GN-A3F2-9C41-E87B-3D2A1F4C
```

### 6.3 Code State Machine

| State            | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| `ACTIVE`         | Code generated, not yet redeemed into a wallet                  |
| `FULLY_REDEEMED` | Code redeemed; full amount credited to account wallet           |
| `CANCELLED`      | Invalidated by admin; refund logic applied if already in wallet |

> **Note:** `PARTIALLY_REDEEMED` state does not exist in GiftNow. A code is redeemed in full into the wallet — the wallet itself tracks partial usage.

---

## 7. Database Schema

### 7.1 GiftCards Table (Master)

Stores every gift card ever created. One record per card code.

| Field                | Type      | Description                                     |
| -------------------- | --------- | ----------------------------------------------- |
| id                   | String    | PRIMARY KEY — UUID                              |
| code                 | String    | UNIQUE — GiftNow redemption code (GN-format)    |
| type                 | Enum      | `DIGITAL` \| `PHYSICAL` \| `CORPORATE_BULK`     |
| amount               | Float     | Face value in NPR (100 – 1,00,000)              |
| status               | Enum      | `ACTIVE` \| `FULLY_REDEEMED` \| `CANCELLED`     |
| purchasedByAccountId | String    | FK → Account (purchaser)                        |
| redeemedByAccountId  | String?   | FK → Account (recipient, null until redeemed)   |
| recipientEmail       | String?   | Recipient email (digital delivery only)         |
| personalMessage      | String?   | Optional message from purchaser                 |
| deliveryAddress      | Json?     | Physical delivery address (physical cards only) |
| batchId              | String?   | FK → GiftCardBatch (corporate bulk orders)      |
| redeemedAt           | DateTime? | Timestamp of wallet redemption                  |
| cancelledAt          | DateTime? | Timestamp of admin cancellation                 |
| createdAt            | DateTime  | Record creation timestamp                       |
| updatedAt            | DateTime  | Last updated timestamp                          |

### 7.2 GiftCardWallet Table

One wallet per account. Balance is the single source of truth for available GiftNow funds.

| Field         | Type     | Description                                    |
| ------------- | -------- | ---------------------------------------------- |
| id            | String   | PRIMARY KEY — UUID                             |
| accountId     | String   | UNIQUE FK → Account (one wallet per account)   |
| balance       | Float    | Current wallet balance in NPR (never negative) |
| totalCredited | Float    | Lifetime total credited to this wallet         |
| totalDebited  | Float    | Lifetime total debited from this wallet        |
| createdAt     | DateTime | Wallet creation timestamp                      |
| updatedAt     | DateTime | Last balance change timestamp                  |

### 7.3 GiftCardAuditLog Table (Immutable)

Every wallet balance change writes one record here. Records are **NEVER** deleted or updated.

| Field         | Type     | Description                                                    |
| ------------- | -------- | -------------------------------------------------------------- |
| id            | String   | PRIMARY KEY — UUID                                             |
| accountId     | String   | FK → Account                                                   |
| giftCardId    | String?  | FK → GiftCard (if credit operation)                            |
| orderId       | String?  | FK → Order (if debit operation)                                |
| operation     | Enum     | `CREDIT` \| `DEBIT` \| `ADMIN_CANCEL_DEBIT` \| `REFUND_CREDIT` |
| amount        | Float    | Amount involved in this operation                              |
| balanceBefore | Float    | Wallet balance before this operation                           |
| balanceAfter  | Float    | Wallet balance after this operation                            |
| performedBy   | String   | accountId of actor (user or admin)                             |
| createdAt     | DateTime | Immutable timestamp — never updated                            |

### 7.4 GiftCardBatch Table (Corporate Bulk)

Groups corporate bulk orders. Each individual card in the batch has a `batchId` FK pointing here.

| Field            | Type     | Description                              |
| ---------------- | -------- | ---------------------------------------- |
| id               | String   | PRIMARY KEY — UUID                       |
| name             | String   | Batch name / campaign label              |
| totalCards       | Int      | Number of cards in this batch            |
| totalAmount      | Float    | Sum of all card face values in the batch |
| createdByAdminId | String   | FK → Admin account                       |
| createdAt        | DateTime | Batch creation timestamp                 |

### 7.5 Database Indexes

- `GiftCards.code` — UNIQUE index (primary lookup for redemption)
- `GiftCards.purchasedByAccountId` — index (account purchase history)
- `GiftCards.redeemedByAccountId` — index (account wallet history)
- `GiftCards.batchId` — index (batch management queries)
- `GiftCardWallet.accountId` — UNIQUE index (wallet lookup at checkout)
- `GiftCardAuditLog.accountId` — index (audit trail queries)
- `GiftCardAuditLog.createdAt` — index (time-range audit queries)

---

## 8. API Specification

### 8.1 Endpoints

| Method | Endpoint                           | Role     | Description                                           |
| ------ | ---------------------------------- | -------- | ----------------------------------------------------- |
| POST   | `/gift-cards/purchase`             | Customer | Purchase a new gift card (digital/physical/corporate) |
| POST   | `/gift-cards/redeem`               | Customer | Redeem a gift card code into account wallet           |
| GET    | `/gift-cards/wallet`               | Customer | Get current wallet balance (authenticated)            |
| GET    | `/gift-cards/wallet/history`       | Customer | Get wallet audit history (paginated)                  |
| GET    | `/gift-cards/purchased`            | Customer | List gift cards purchased by this account             |
| POST   | `/gift-cards/admin/create`         | Admin    | Admin single or bulk gift card creation               |
| POST   | `/gift-cards/admin/cancel/:id`     | Admin    | Cancel a gift card (with refund logic)                |
| GET    | `/gift-cards/admin/list`           | Admin    | List all gift cards with filters                      |
| GET    | `/gift-cards/admin/analytics`      | Admin    | Gift card system analytics dashboard                  |
| GET    | `/gift-cards/admin/batch/:batchId` | Admin    | View a corporate bulk batch                           |
| GET    | `/gift-cards/admin/export`         | Admin    | Export gift card data as CSV                          |

### 8.2 Key Request / Response Contracts

#### POST `/gift-cards/purchase`

**Request:**

```json
{
  "type": "DIGITAL | PHYSICAL | CORPORATE_BULK",
  "amount": 1000,
  "recipientEmail": "recipient@example.com",
  "personalMessage": "Happy Birthday!",
  "deliveryAddress": {},
  "quantity": 10
}
```

**Response:**

```json
{
  "giftCardId": "...",
  "code": "GN-...",
  "amount": 1000,
  "type": "DIGITAL",
  "status": "ACTIVE"
}
```

#### POST `/gift-cards/redeem`

**Request:**

```json
{ "code": "GN-A3F2-9C41-E87B-3D2A1F4C" }
```

**Response:**

```json
{ "walletBalance": 5000, "credited": 1000, "giftCardId": "..." }
```

#### GET `/gift-cards/wallet`

**Response:**

```json
{
  "accountId": "...",
  "balance": 5000,
  "totalCredited": 10000,
  "totalDebited": 5000
}
```

### 8.3 Error Codes

| Error Code                   | HTTP Status | Meaning                                                     |
| ---------------------------- | ----------- | ----------------------------------------------------------- |
| `GIFT_CARD_NOT_FOUND`        | 404         | Code does not exist                                         |
| `GIFT_CARD_ALREADY_REDEEMED` | 409         | Code already redeemed into a wallet                         |
| `GIFT_CARD_CANCELLED`        | 410         | Code has been cancelled by admin                            |
| `INVALID_AMOUNT`             | 422         | Amount outside NPR 100 – 1,00,000 range                     |
| `INSUFFICIENT_WALLET`        | 422         | Wallet balance insufficient (system deducts available only) |
| `RATE_LIMIT_EXCEEDED`        | 429         | Too many redemption attempts from this IP                   |
| `UNAUTHORIZED`               | 401         | Unauthenticated request to wallet endpoint                  |

---

## 9. Backend Implementation (NestJS + Prisma)

### 9.1 Module Structure

```
src/giftnow/
├── giftnow.module.ts
├── giftnow.controller.ts
├── dto/
│   ├── purchase-giftcard.dto.ts
│   ├── redeem-giftcard.dto.ts
│   ├── admin-create.dto.ts
│   └── admin-cancel.dto.ts
├── services/
│   ├── giftcard.service.ts       (purchase, code generation)
│   ├── wallet.service.ts         (balance credit, debit, inquiry)
│   ├── redemption.service.ts     (code → wallet logic)
│   ├── delivery.service.ts       (email dispatch, print queue)
│   └── audit.service.ts          (immutable audit writes)
├── admin/
│   ├── admin-giftcard.controller.ts
│   ├── admin-giftcard.service.ts
│   └── bulk.service.ts           (async batch generation)
└── utils/
    └── code-generator.ts         (UUID + random suffix)
```

### 9.2 Service Responsibilities

#### `giftcard.service.ts` — Purchase & Code Generation

- Validates purchase request (amount range, type-specific fields)
- Generates unique code: `GN-{UUID4_SEGMENT}-{RANDOM8}`
- Creates GiftCard record with status `ACTIVE`
- Triggers `delivery.service` for email or print queue

#### `wallet.service.ts` — Balance Operations

- `creditWallet(accountId, amount, giftCardId)`: atomically credits wallet, writes audit log
- `debitWallet(accountId, amount, orderId)`: atomically debits wallet, writes audit log
- `getBalance(accountId)`: returns current balance with authentication guard
- All operations wrapped in Prisma transactions — no partial updates possible

#### `redemption.service.ts` — Code Validation & Redemption

- `validateCode(code)`: checks existence, status (`ACTIVE` only), and rate limit
- On success: marks card `FULLY_REDEEMED`, calls `wallet.creditWallet`
- Idempotency: duplicate redemption attempts on same code return `409` immediately

#### `audit.service.ts` — Immutable Audit Trail

- `writeAuditEntry(data)`: inserts into `GiftCardAuditLog` — no updates ever
- Called by `wallet.service` on every credit and debit
- Stores `balanceBefore` and `balanceAfter` for full trail reconstruction

---

## 10. Frontend Implementation

> **📋 Phase 2+ (v2+)** — This section describes customer-facing UI components not included in Phase 1 (v1). The admin dashboard is fully implemented in Phase 1. The APIs below are production-ready; customer UI is deferred.

### 10.1 Component Structure (React / Next.js)

```
src/components/giftnow/
├── GiftNowPurchase.tsx           (Purchase flow — amount, type, recipient)
├── GiftNowRedeem.tsx             (Enter code → credit wallet)
├── GiftNowWallet.tsx             (Show balance + toggle at checkout)
├── GiftNowHistory.tsx            (Purchased cards + redemption status)
├── GiftNowCheckoutToggle.tsx     (Auto-deduct toggle in checkout)
└── admin/
    ├── AdminGiftNowDashboard.tsx
    ├── AdminBulkCreate.tsx
    ├── AdminCardList.tsx
    └── AdminAnalytics.tsx
```

### 10.2 Flutter Mobile Components

```
lib/features/giftnow/
├── screens/
│   ├── gift_now_purchase_screen.dart
│   ├── gift_now_redeem_screen.dart
│   ├── gift_now_wallet_screen.dart
│   └── gift_now_history_screen.dart
├── widgets/
│   ├── gift_card_tile.dart
│   ├── wallet_balance_card.dart
│   └── checkout_wallet_toggle.dart
└── services/
    └── gift_now_api_service.dart
```

### 10.3 Key User Flows

#### 10.3.1 Purchasing a Digital Gift Card

1. User navigates to 'GiftNow' → 'Buy a Gift Card'
2. Enters custom amount (NPR 100 – 1,00,000) with real-time validation
3. Enters recipient email and optional personal message
4. Proceeds to payment — gift card purchase is a standard order
5. On payment confirmation, email dispatched within 60 seconds
6. Sender receives confirmation; recipient receives the GiftNow email with code and redemption link

#### 10.3.2 Redeeming a Gift Card Code into Wallet

1. User goes to 'My Account → GiftNow Wallet → Redeem a Card'
2. Enters code (or scans QR code on mobile via Flutter camera plugin)
3. System validates and shows: 'Your account has been credited NPR X. New wallet balance: NPR Y'
4. Wallet balance immediately visible in account header

#### 10.3.3 Using Wallet Balance at Checkout

1. Checkout detects positive wallet balance and shows toggle: 'Use GiftNow Balance (NPR X available)'
2. Toggle is ON by default — user can opt out
3. Order summary updates in real-time: Subtotal → Coupon Discount → GiftNow Balance Applied → Final Amount
4. On order confirmation, wallet balance deducted atomically with order placement

---

## 11. Integration with Existing Systems

### 11.1 Payment System Integration

- Gift card purchase is processed as a standard payment (Fonepay / eSewa / COD)
- Gift card wallet deduction happens in the same DB transaction as order creation
- Remaining balance after wallet deduction is passed to the payment gateway
- If payment gateway fails after wallet deduction, the deduction is rolled back

### 11.2 Order Service Integration

- Order total calculation: subtotal → coupon → wallet deduction → payable amount
- Order record stores: `giftNowAmountUsed` (float), `walletBalanceBefore`, `walletBalanceAfter`
- Order cancellation triggers refund to GiftNow wallet (not original payment method)

### 11.3 Coupon System Integration

- Coupon validation runs first — discount applied to item subtotal
- GiftNow wallet then applied to the post-coupon amount
- One coupon + GiftNow wallet = valid combination
- Two coupons + GiftNow wallet = invalid (existing coupon stacking rule unchanged)

### 11.4 Seller Dashboard Integration

- GiftNow wallet deductions attributed to the seller(s) in the order normally
- Sellers see 'GiftNow' as a payment method in their order breakdown
- Revenue attribution is unchanged — GiftNow is a platform-level payment instrument
- No seller-specific gift cards — this is a platform-wide system

### 11.5 Notification System Integration

- Digital card delivery: email via integrated email service (SendGrid / SES)
- Physical card dispatch: push notification + email to purchaser
- Redemption confirmation: in-app notification + email
- Wallet balance alert: optional notification when balance falls below NPR 100

---

## 12. Implementation Roadmap

### Phase 1 (v1) — COMPLETE ✅

| Deliverable     | Timeline            | Status      | Notes                                                   |
| --------------- | ------------------- | ----------- | ------------------------------------------------------- |
| Database Schema | Week 1 (May 2026)   | ✅ Complete | Prisma migrations all applied                           |
| Core Services   | Week 2–3 (May 2026) | ✅ Complete | giftcard, wallet, redemption, audit, delivery, checkout |
| Admin Dashboard | Week 4–5 (May 2026) | ✅ Complete | List, create, analytics, batch, discounts, export CSV   |
| API Testing     | Week 6 (May 2026)   | ✅ Complete | All endpoints production-ready                          |
| Deployment      | June 1, 2026        | ✅ Ready    | Backend + Admin Frontend ready for deploy               |

### Phase 2 (v2+) — PLANNED 🚀

| Deliverable          | Timeline    | Focus Area  | Key Deliverables                                   |
| -------------------- | ----------- | ----------- | -------------------------------------------------- |
| Customer Purchase UI | July 2026   | Frontend    | React: Buy flow, Redeem flow, Wallet view          |
| Mobile App           | August 2026 | Frontend    | Flutter: Purchase, Redeem, Wallet, History screens |
| Payment Integration  | July 2026   | Integration | Fonepay, eSewa, COD gateway setup & testing        |
| Email Service        | July 2026   | Integration | SendGrid/SES configuration & testing               |
| Physical Print       | July 2026   | Integration | Print partner logistics integration                |
| Checkout UI          | July 2026   | Integration | GiftNow balance toggle in checkout                 |

---

## 13. Success Metrics

| Metric                               | Target                                        | Cadence    |
| ------------------------------------ | --------------------------------------------- | ---------- |
| Gift card purchase rate              | 5–10% of active customers                     | Monthly    |
| Average gift card denomination       | NPR 2,500 – NPR 3,500                         | Monthly    |
| Wallet redemption rate               | 70–80% of loaded balance used within 6 months | Bi-monthly |
| Customer retention — GiftNow buyers  | 40% higher repeat purchase vs non-buyers      | Quarterly  |
| New customer acquisition via GiftNow | 20% of redemptions from new accounts          | Monthly    |
| Code validation latency              | < 200 ms at P99                               | Continuous |
| Email delivery SLA                   | 100% within 60 seconds                        | Continuous |
| Audit log coverage                   | 100% of wallet balance changes captured       | Continuous |
| System availability                  | 99.9% uptime                                  | Monthly    |
