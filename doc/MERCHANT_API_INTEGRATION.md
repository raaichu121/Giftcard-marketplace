# Merchant API Integration Guide

## Overview

This document provides a complete guide for integrating GiftNow with external e-commerce platforms. E-commerce partners can programmatically create, purchase, and manage gift cards through secure API endpoints.

---

## 1. Architecture Overview

### Current System

- ✅ Customer purchase via GiftNow platform
- ✅ Admin card creation and management
- ✅ Card redemption system

### New Merchant System

- 🔧 E-commerce partner authentication
- 🔧 Programmatic card creation/purchase
- 🔧 Real-time webhook notifications
- 🔧 Settlement and payment tracking
- 🔧 API key management

---

## 2. API Endpoints (To Be Implemented)

### Authentication Endpoints

#### `POST /api/merchants/auth/authenticate`

**Purpose:** E-commerce platform gets API token

```
Headers:
  Content-Type: application/json

Body:
{
  "api_key": "mk_live_abc123xyz...",
  "api_secret": "sk_live_def456uvw..."
}

Response (200):
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "merchant_id": "merch_123abc"
}

Errors (401):
- Invalid credentials
- Merchant inactive
```

---

### Gift Card Management Endpoints

#### `POST /api/merchants/gift-cards/create`

**Purpose:** Create single or bulk gift cards

```
Headers:
  Authorization: Bearer {access_token}
  X-Merchant-ID: merch_123abc

Body:
{
  "type": "DIGITAL|PHYSICAL|CORPORATE_BULK",
  "amount": 1000,
  "quantity": 1,
  "recipient_email": "customer@example.com",
  "personal_message": "Happy Birthday!",
  "batch_name": "Q1 2026 Sales",
  "delivery_address": {
    "street": "123 Main St",
    "city": "Kathmandu",
    "postal_code": "44600",
    "country": "Nepal"
  },
  "webhook_url": "https://ecommerce.com/webhooks/giftnow"
}

Response (201):
{
  "batch_id": "batch_123abc",
  "transaction_id": "txn_456def",
  "cards": [
    {
      "id": "card_789ghi",
      "code": "GN-3942-DFC5-C839-VLMNKM4C",
      "amount": 1000,
      "type": "DIGITAL",
      "status": "ACTIVE"
    }
  ],
  "total_value": 1000,
  "created_at": "2026-06-01T10:30:00Z"
}

Errors (400, 401, 403, 429):
- Invalid amount
- Insufficient merchant balance
- Rate limit exceeded
```

#### `POST /api/merchants/gift-cards/purchase`

**Purpose:** Purchase and create cards in one request

```
Headers:
  Authorization: Bearer {access_token}
  X-Merchant-ID: merch_123abc

Body:
{
  "type": "DIGITAL",
  "amount": 5000,
  "quantity": 10,
  "currency": "NPR",
  "payment_method": "wallet|stripe|khalti",
  "webhook_url": "https://ecommerce.com/webhooks/giftnow",
  "metadata": {
    "order_id": "ord_12345",
    "customer_id": "cust_67890"
  }
}

Response (201):
{
  "purchase_id": "purch_abc123",
  "batch_id": "batch_def456",
  "cards": [...],
  "total_cost": 50000,
  "status": "COMPLETED",
  "created_at": "2026-06-01T10:30:00Z"
}
```

#### `GET /api/merchants/gift-cards/:card_id`

**Purpose:** Check gift card status and balance

```
Headers:
  Authorization: Bearer {access_token}
  X-Merchant-ID: merch_123abc

Response (200):
{
  "id": "card_789ghi",
  "code": "GN-3942-DFC5-C839-VLMNKM4C",
  "amount": 1000,
  "balance": 750,
  "type": "DIGITAL",
  "status": "ACTIVE",
  "created_at": "2026-06-01T10:30:00Z",
  "redeemed_amount": 250,
  "last_redemption": "2026-06-01T12:45:00Z"
}
```

#### `GET /api/merchants/gift-cards/batch/:batch_id`

**Purpose:** Get all cards in a batch with export option

```
Headers:
  Authorization: Bearer {access_token}
  X-Merchant-ID: merch_123abc

Query Params:
  ?format=json|csv

Response (200):
{
  "batch_id": "batch_123abc",
  "created_at": "2026-06-01T10:30:00Z",
  "total_cards": 50,
  "total_value": 50000,
  "cards": [...]
}
```

---

### Merchant Account Endpoints

#### `GET /api/merchants/account/balance`

**Purpose:** Check available balance and transaction history

```
Headers:
  Authorization: Bearer {access_token}
  X-Merchant-ID: merch_123abc

Response (200):
{
  "merchant_id": "merch_123abc",
  "available_balance": 100000,
  "pending_settlements": 25000,
  "total_cards_sold": 1250,
  "total_revenue": 1250000,
  "monthly_limit": 500000,
  "used_this_month": 125000
}
```

#### `GET /api/merchants/account/transactions`

**Purpose:** Get transaction history

```
Headers:
  Authorization: Bearer {access_token}
  X-Merchant-ID: merch_123abc

Query Params:
  ?limit=50&offset=0&type=purchase|redemption|settlement

Response (200):
{
  "transactions": [
    {
      "id": "txn_abc123",
      "type": "PURCHASE",
      "amount": 5000,
      "cards_count": 5,
      "status": "COMPLETED",
      "created_at": "2026-06-01T10:30:00Z"
    }
  ],
  "total": 1250,
  "limit": 50,
  "offset": 0
}
```

#### `POST /api/merchants/account/settlement`

**Purpose:** Request payment settlement

```
Headers:
  Authorization: Bearer {access_token}
  X-Merchant-ID: merch_123abc

Body:
{
  "amount": 50000,
  "payment_method": "bank_transfer",
  "bank_account_id": "ba_123abc"
}

Response (201):
{
  "settlement_id": "settle_123abc",
  "amount": 50000,
  "status": "PROCESSING",
  "estimated_completion": "2026-06-03T00:00:00Z"
}
```

---

## 3. Webhook Events

E-commerce platforms can subscribe to real-time events via webhook URL:

### Webhook Event Types

```typescript
enum WebhookEvent {
  CARD_CREATED = "card.created",
  CARD_ACTIVATED = "card.activated",
  CARD_REDEEMED = "card.redeemed",
  CARD_CANCELLED = "card.cancelled",
  BATCH_COMPLETED = "batch.completed",
  SETTLEMENT_COMPLETED = "settlement.completed",
}
```

### Example Webhook Payload

```json
{
  "event": "card.created",
  "timestamp": "2026-06-01T10:30:00Z",
  "data": {
    "card_id": "card_789ghi",
    "code": "GN-3942-DFC5-C839-VLMNKM4C",
    "amount": 1000,
    "type": "DIGITAL",
    "merchant_id": "merch_123abc",
    "batch_id": "batch_123abc",
    "metadata": {
      "order_id": "ord_12345"
    }
  },
  "signature": "sha256=abc123def456..."
}
```

### Webhook Security

- All webhooks include HMAC-SHA256 signature
- Signature header: `X-GiftNow-Signature`
- E-commerce must verify signature using API secret
- Webhook retry: 3 attempts with exponential backoff

---

## 4. Database Schema (To Be Created)

### Merchants Table

```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  api_secret VARCHAR(255) NOT NULL,
  webhook_url TEXT,
  webhook_secret VARCHAR(255),
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
  balance DECIMAL(12,2) DEFAULT 0,
  monthly_limit DECIMAL(12,2),
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  business_registration VARCHAR(255),
  bank_account_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_admin_id UUID REFERENCES admins(id)
);

-- Index for faster lookups
CREATE INDEX idx_merchants_api_key ON merchants(api_key);
```

### Link Gift Cards to Merchants

```sql
ALTER TABLE gift_cards ADD COLUMN merchant_id UUID REFERENCES merchants(id);
ALTER TABLE gift_cards ADD COLUMN merchant_batch_id VARCHAR(255);
ALTER TABLE gift_cards ADD COLUMN external_metadata JSONB;

CREATE INDEX idx_gift_cards_merchant ON gift_cards(merchant_id);
CREATE INDEX idx_gift_cards_merchant_batch ON gift_cards(merchant_batch_id);
```

### Webhook Events Log

```sql
CREATE TABLE merchant_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  event_type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  status ENUM('PENDING', 'DELIVERED', 'FAILED') DEFAULT 'PENDING',
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Access Logs

```sql
CREATE TABLE merchant_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT NOT NULL,
  request_body JSONB,
  response_body JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Security Implementation

### API Key Authentication Flow

```
1. E-commerce calls POST /merchants/auth/authenticate
2. Backend validates api_key and api_secret against merchants table
3. API secret is bcrypt hashed in database
4. Generate JWT token with merchant_id, scope, expiry
5. Return token to e-commerce
6. E-commerce uses Bearer token in Authorization header
```

### API Key Rotation

```
POST /api/merchants/auth/rotate-keys

Response:
{
  "new_api_key": "mk_live_new_key...",
  "old_api_key_expires_in": 86400  // 24 hours
}
```

### Rate Limiting

```
- Per merchant: 100 requests/minute
- Per endpoint: Configurable per merchant plan
- Rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining
```

### IP Whitelisting (Optional)

```
POST /api/merchants/account/ips

Body:
{
  "allowed_ips": ["203.0.113.1", "203.0.113.2"]
}
```

---

## 6. Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Amount must be between NPR 100 and NPR 100,000",
    "details": {
      "provided": 50,
      "min": 100,
      "max": 100000
    }
  },
  "request_id": "req_123abc",
  "timestamp": "2026-06-01T10:30:00Z"
}
```

### Error Codes

```
400 - BAD_REQUEST (validation error)
401 - UNAUTHORIZED (authentication failed)
403 - FORBIDDEN (insufficient permissions)
404 - NOT_FOUND (resource doesn't exist)
429 - RATE_LIMIT_EXCEEDED (too many requests)
500 - INTERNAL_SERVER_ERROR (server error)
```

---

## 7. E-Commerce Integration Flow

### Complete Purchase Flow

```
1. Customer selects gift card on e-commerce
2. E-commerce calls POST /merchants/auth/authenticate (gets token)
3. E-commerce processes payment (Stripe/Khalti/etc)
4. E-commerce calls POST /merchants/gift-cards/purchase
5. GiftNow creates cards and sends webhook
6. E-commerce receives webhook and confirms to customer
7. Customer receives email with code
8. Customer can redeem on GiftNow or partner stores

Timeline: ~2-3 seconds
```

### Monthly Settlement Flow

```
Day 1-30: Merchant sells cards
Day 31: All transactions settled
Day 32: Merchant calls POST /merchants/account/settlement
Day 34: Payment received in merchant bank account
```

---

## 8. Files to Create

### Backend Files

- `src/merchants/merchants.module.ts` - Module definition
- `src/merchants/merchants.controller.ts` - Public API endpoints
- `src/merchants/merchant-auth.controller.ts` - Authentication endpoints
- `src/merchants/merchant-auth.guard.ts` - API key validation
- `src/merchants/merchants.service.ts` - Business logic
- `src/merchants/dto/merchant-create.dto.ts` - Request/response DTOs
- `src/merchants/dto/merchant-authenticate.dto.ts`
- `src/merchants/merchants.repository.ts` - Database queries
- `src/webhooks/merchant-webhook.service.ts` - Webhook handling

### Migration Files

- `giftcard-backend/prisma/migrations/[timestamp]_add_merchants_table.sql`

---

## 9. Implementation Checklist

- [ ] Create merchants table and related schemas
- [ ] Implement MerchantsService
- [ ] Create API key authentication guard
- [ ] Build merchant authentication controller
- [ ] Create gift card purchase/create endpoints
- [ ] Implement merchant account endpoints
- [ ] Add webhook event system
- [ ] Set up API logging and monitoring
- [ ] Add rate limiting middleware
- [ ] Create API documentation (Swagger)
- [ ] Add merchant dashboard UI (optional)
- [ ] Set up payment processing integration
- [ ] Implement settlement system
- [ ] Add security audit logging

---

## 10. Testing Strategy

### Manual Testing

```bash
# 1. Create merchant account
curl -X POST http://localhost:3000/api/merchants/admin/create \
  -H "Authorization: Bearer admin_token" \
  -d "{ name: 'MyEcommerce', email: 'admin@myecommerce.com' }"

# 2. Authenticate
curl -X POST http://localhost:3000/api/merchants/auth/authenticate \
  -d "{ api_key: 'mk_...', api_secret: 'sk_...' }"

# 3. Create gift cards
curl -X POST http://localhost:3000/api/merchants/gift-cards/create \
  -H "Authorization: Bearer token" \
  -d "{ type: 'DIGITAL', amount: 1000, quantity: 5 }"
```

### Unit Tests

- Merchant authentication
- API key validation
- Rate limiting
- Webhook signing and retry logic

### Integration Tests

- End-to-end purchase flow
- Settlement calculations
- Error handling scenarios

---

## 11. Documentation for E-Commerce Partners

Create separate documentation:

- API Reference (Swagger/OpenAPI)
- Code examples (Python, JavaScript, PHP)
- Webhook signature verification
- Error handling guide
- Troubleshooting guide

---

## 12. Future Enhancements

- [ ] Multiple payment method support
- [ ] Advanced analytics dashboard
- [ ] Recurring batch orders
- [ ] White-label gift card templates
- [ ] Bulk merchant onboarding
- [ ] Developer sandbox environment
- [ ] Webhooks debugging UI
- [ ] Custom rate limiting per merchant

---

## Notes

- All timestamps in UTC
- All monetary values in NPR (smallest unit)
- API versioning: `/api/v1/merchants/...`
- Consider PCI compliance for payment data
- Implement CORS headers for browser-based requests
- Add request signing option for extra security

---

**Document Version:** 1.0  
**Last Updated:** June 1, 2026  
**Status:** READY FOR IMPLEMENTATION
