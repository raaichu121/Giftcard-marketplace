# Error Handling, Validation, and Security Features

## 1) Purpose

This feature provides a structured error handling pipeline, input validation, rate limiting, and security controls that run across all business modules.

## 2) Backend error handling

### Custom exception system

Main file:

- `giftcard-backend/src/common/exceptions.ts`

`GiftNowHttpException` is a custom exception class extending NestJS `HttpException`. It maps a typed error code to an HTTP status, ensuring consistent API error responses.

Defined error codes and their HTTP status mapping:

| Error Code | HTTP Status | Meaning |
| --- | --- | --- |
| `GIFT_CARD_NOT_FOUND` | 404 Not Found | Card code does not exist |
| `GIFT_CARD_ALREADY_REDEEMED` | 409 Conflict | Card was already redeemed |
| `GIFT_CARD_CANCELLED` | 410 Gone | Card has been cancelled by admin |
| `INVALID_AMOUNT` | 422 Unprocessable Entity | Amount outside boundaries or not a whole number |
| `INSUFFICIENT_WALLET` | 422 Unprocessable Entity | Wallet balance too low for debit |
| `INVALID_PIN` | 403 Forbidden | Incorrect PIN or OTP |
| `CARD_PIN_LOCKED` | 423 Locked | Max failed attempts exceeded |
| `RATE_LIMIT_EXCEEDED` | 429 Too Many Requests | Rate limit hit on redeem endpoints |
| `UNAUTHORIZED` | 401 Unauthorized | Not authorized |

Error response JSON format:

```json
{
  "error": "GIFT_CARD_NOT_FOUND",
  "message": "Gift card not found"
}
```

### Validation utilities

Main files:

- `giftcard-backend/src/common/constants.ts`
- `giftcard-backend/src/common/utils/amount-validator.ts`
- `giftcard-backend/src/common/utils/code-generator.ts`

Key constants:

- `MIN_AMOUNT_NPR` = 100
- `MAX_AMOUNT_NPR` = 100,000
- `BULK_MIN_QUANTITY` = 10
- `MAX_PIN_ATTEMPTS` = 5

Validation functions:

- `validateAmount(amount)` — checks amount is a whole integer between NPR 100 and 100,000.
- `isValidGiftNowCodeFormat(code)` — regex check for `GN-XXXX-XXXX-XXXX-XXXXXXXX` format.
- `normalizeGiftNowCode(input)` — cleans and reformats raw user input into standard code format.

### Gift card code generation

- `generateGiftNowCode()` — generates unique gift card codes using `crypto.randomUUID` + `crypto.randomBytes`. Uses a restricted charset (no ambiguous chars `O`, `0`, `I`, `1`).
- `generateSecurityPin()` — generates a random 6-digit numeric PIN using `crypto.randomInt`.

### Rate limiting

Main file:

- `giftcard-backend/src/giftcard/redeem-rate-limit.guard.ts`

`RedeemRateLimitGuard` is a NestJS guard applied to redeem endpoints.

Behavior:

- Tracks attempts per IP (max 30/hour) and per account (max 20/hour) using in-memory Maps.
- Expired entries are pruned every 10 minutes via `setInterval`.
- Throws `RATE_LIMIT_EXCEEDED` when limits are exceeded.

Applied to:

- `POST /api/v1/gift-cards/redeem/send-otp`
- `POST /api/v1/gift-cards/redeem`

### Timing jitter

Main file:

- `giftcard-backend/src/common/utils/jitter.ts`

The redemption service injects random delay (100–300ms) on invalid code lookups to mitigate timing-based enumeration attacks.

## 3) Frontend error handling

Main file:

- `giftcard-frontend/src/lib/api.ts`

`GiftNowApiError` is a custom error class used in the frontend.

When an API response is non-2xx, the frontend:

1. Extracts the `error` code and `message` from the response JSON.
2. Looks up a user-friendly message from the `ERROR_MESSAGES` map keyed by error code.
3. Prefers the backend message if it is specific (differs from the code), otherwise falls back to the friendly mapped message.
4. Throws a `GiftNowApiError` with both `code` and display `message`.

Frontend components like `GiftNowRedeem` use the `errorCode` to apply different styling:

- `CARD_PIN_LOCKED` — red alert with lock icon
- `INVALID_PIN` — amber warning with remaining attempts
- Other errors — standard red alert

### Additional frontend utilities

- `giftcard-frontend/src/lib/error-capture.ts` — error capture utility
- `giftcard-frontend/src/lib/error-page.ts` — error page display helpers

## 4) Tech used in this feature

- NestJS `HttpException` extension for typed error codes
- NestJS guard (`CanActivate`) for rate limiting
- Node.js `crypto` module for secure code/PIN generation
- In-memory rate limiting with periodic pruning
- Frontend error class with user-friendly message mapping
- Global NestJS `ValidationPipe` with whitelist + transform enabled

## 5) Important design decisions

- Rate limiting is in-memory (per process). In a multi-instance deployment, a shared store (e.g., Redis) would be needed.
- Error codes are a union type (`GiftNowErrorCode`), providing compile-time safety on the backend.
- The restricted charset for gift card codes avoids ambiguous characters, reducing user errors during manual code entry.
