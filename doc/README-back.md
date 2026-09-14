# Backend API Documentation

## Setup

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=giftnow_giftcard
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=3001
NODE_ENV=development
API_URL=http://localhost:3001

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Running the Server

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

## Database Schema

### GiftCard Model

| Field        | Type    | Description                        |
| ------------ | ------- | ---------------------------------- |
| id           | UUID    | Primary key                        |
| cardNumber   | String  | Unique card identifier             |
| pinCode      | String  | Hashed PIN code                    |
| amount       | Decimal | Original gift card amount          |
| balance      | Decimal | Current available balance          |
| currency     | String  | Currency code (USD, EUR, etc.)     |
| type         | ENUM    | DIGITAL or PHYSICAL                |
| status       | ENUM    | ACTIVE, INACTIVE, EXPIRED, BLOCKED |
| issueDate    | Date    | Date card was created              |
| expiryDate   | Date    | Card expiration date               |
| buyerId      | String  | ID of buyer                        |
| recipientId  | String  | ID of recipient                    |
| isRedeemed   | Boolean | Fully redeemed status              |
| redeemedDate | Date    | Date of final redemption           |
| qrCode       | String  | QR code data URL                   |
| barcode      | String  | Barcode data                       |

### Transaction Model

| Field           | Type    | Description                              |
| --------------- | ------- | ---------------------------------------- |
| id              | UUID    | Primary key                              |
| giftCardId      | UUID    | Reference to gift card                   |
| amount          | Decimal | Transaction amount                       |
| type            | ENUM    | PURCHASE, REDEMPTION, REFUND, ADJUSTMENT |
| previousBalance | Decimal | Balance before transaction               |
| newBalance      | Decimal | Balance after transaction                |
| status          | ENUM    | SUCCESS, PENDING, FAILED                 |
| orderId         | String  | Related order ID                         |
| userId          | String  | User who performed transaction           |
| timestamp       | Date    | Transaction time                         |

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Create Gift Card(s)

Create one or multiple gift cards.

```http
POST /api/v1/giftcards/create
Content-Type: application/json

{
  "amount": 50,
  "quantity": 1,
  "type": "DIGITAL",
  "expiryDate": "2025-12-31",
  "buyerName": "John Doe",
  "buyerEmail": "john@example.com",
  "recipientName": "Jane Smith",
  "recipientEmail": "jane@example.com",
  "message": "Happy Birthday!",
  "theme": "classic",
  "currency": "USD"
}
```

**Response (201):**

```json
{
  "message": "Gift card(s) created successfully",
  "data": {
    "giftCard": {...},
    "cardNumber": "GC1234567890ABCDEF",
    "pinCode": "1a2b3c4d5e6f7g8h"
  }
}
```

#### 2. Redeem Gift Card

Redeem a gift card for a purchase.

```http
POST /api/v1/giftcards/redeem
Content-Type: application/json

{
  "cardNumber": "GC1234567890ABCDEF",
  "pinCode": "1a2b3c4d5e6f7g8h",
  "amount": 25,
  "orderId": "ORDER123",
  "userId": "USER456"
}
```

**Response (200):**

```json
{
  "message": "Gift card redeemed successfully",
  "data": {
    "balance": 25,
    "amountRedeemed": 25,
    "isFullyRedeemed": false
  }
}
```

**Errors:**

- 404: Gift card not found
- 400: Invalid PIN code
- 400: Insufficient balance
- 400: Gift card expired
- 400: Gift card blocked

#### 3. Check Balance

Check gift card balance without redeeming.

```http
POST /api/v1/giftcards/check-balance
Content-Type: application/json

{
  "cardNumber": "GC1234567890ABCDEF",
  "pinCode": "1a2b3c4d5e6f7g8h"
}
```

**Response (200):**

```json
{
  "message": "Balance retrieved successfully",
  "data": {
    "cardNumber": "GC12 3456 7890 ABCD EF",
    "balance": 50,
    "currency": "USD",
    "status": "ACTIVE",
    "expiryDate": "2025-12-31",
    "isRedeemed": false
  }
}
```

### Admin Endpoints (Authentication Required)

All admin endpoints require JWT token in Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 1. Dashboard Statistics

Get overview statistics.

```http
GET /api/v1/admin/dashboard
```

**Response (200):**

```json
{
  "data": {
    "totalCards": 100,
    "activeCards": 75,
    "redeemedCards": 20,
    "totalValue": 5000,
    "remainingValue": 3250,
    "redemptionRate": "20.00%"
  }
}
```

#### 2. List Gift Cards

List all gift cards with filters and pagination.

```http
GET /api/v1/admin/giftcards?status=ACTIVE&type=DIGITAL&limit=50&offset=0
```

**Query Parameters:**

- `status`: ACTIVE, INACTIVE, EXPIRED, BLOCKED
- `type`: DIGITAL, PHYSICAL
- `buyerId`: Filter by buyer
- `recipientId`: Filter by recipient
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset (default: 0)

**Response (200):**

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

#### 3. Get Gift Card Details

Get detailed information about a specific gift card.

```http
GET /api/v1/admin/giftcards/{giftCardId}
```

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "cardNumber": "GC1234567890ABCDEF",
    "amount": 50,
    "balance": 25,
    "status": "ACTIVE",
    "type": "DIGITAL",
    "expiryDate": "2025-12-31",
    "buyerName": "John Doe",
    "recipientName": "Jane Smith",
    "isRedeemed": false,
    "qrCode": "data:image/png;base64,...",
    "transactions": [...]
  }
}
```

#### 4. Get Transaction History

Get all transactions for a gift card.

```http
GET /api/v1/admin/giftcards/{giftCardId}/transactions?limit=50&offset=0
```

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 25,
      "type": "REDEMPTION",
      "previousBalance": 50,
      "newBalance": 25,
      "status": "SUCCESS",
      "orderId": "ORDER123",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0
  }
}
```

#### 5. Block Gift Card

Block a gift card from further use.

```http
POST /api/v1/admin/giftcards/{giftCardId}/block
Content-Type: application/json

{
  "reason": "Suspicious activity detected"
}
```

**Response (200):**

```json
{
  "message": "Gift card blocked successfully",
  "data": {
    "id": "uuid",
    "status": "BLOCKED",
    "metadata": {
      "blockReason": "Suspicious activity detected"
    }
  }
}
```

#### 6. Process Refund

Refund a portion or full amount of a gift card.

```http
POST /api/v1/admin/giftcards/{giftCardId}/refund
Content-Type: application/json

{
  "refundAmount": 25,
  "reason": "Customer requested refund"
}
```

**Response (200):**

```json
{
  "message": "Refund processed successfully",
  "data": {
    "id": "uuid",
    "balance": 50,
    "metadata": {...}
  }
}
```

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Example Error Response

```json
{
  "error": "Gift card not found"
}
```

## Authentication

### JWT Token Structure

```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "userId": "123", "role": "ADMIN", "iat": 1234567890, "exp": 1234654290 }
Signature: (signed with JWT_SECRET)
```

### Token Usage

Include token in Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjEyMzQ1Njc4OTAsImV4cCI6MTIzNDY1NDI5MH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Token Refresh

Tokens expire after the time specified in `JWT_EXPIRY` (default: 7 days). Users should login again to get a new token.

## Rate Limiting

For production, consider implementing rate limiting:

- Public endpoints: 100 requests/minute per IP
- Admin endpoints: 50 requests/minute per user

---

For more information and examples, see the main [README.md](../README.md)
