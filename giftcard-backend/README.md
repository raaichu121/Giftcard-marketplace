# Backend API Documentation

## Table of Contents

- [Setup](#setup)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Authentication](#authentication)

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

## Rate Limiting

For production, consider implementing rate limiting:

- Public endpoints: 100 requests/minute per IP
- Admin endpoints: 50 requests/minute per user

---

For more information and examples, see the main [README.md](../README.md)
