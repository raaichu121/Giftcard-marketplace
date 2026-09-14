# Authentication Features

## 1) Purpose

Authentication supports:

- Admin login
- Customer login/signup
- OTP-based verification flow
- Google sign-in

## 2) Backend logic

Main files:

- `giftcard-backend/src/auth/auth.controller.ts`
- `giftcard-backend/src/auth/auth.service.ts`

Auth endpoints:

- `POST /api/v1/auth/google`
  - Google ID token login.
  - Creates or updates admin/customer based on allowed admin email list.
- `POST /api/v1/auth/otp/send`
  - Sends OTP to email (phone flow blocked currently).
- `POST /api/v1/auth/otp/verify`
  - Verifies OTP.
  - Creates customer if needed (with first/last name on signup flow).
  - Returns JWT token.
- `POST /api/v1/auth/login`
  - Admin credential login (email/password).
  - Supports bcrypt and legacy sha256 hash check fallback.
- `GET /api/v1/auth/me`
  - Returns current profile from JWT.

Key behavior:

- Admin auto-detection is based on `ALLOWED_ADMIN_EMAILS` config.
- OTP entries are stored in `giftnow_otps`.
- JWT payload includes `userId`, `role`, `email`.

## 3) Frontend logic

Main pages:

- `giftcard-frontend/src/app/auth/login/page.tsx`
- `giftcard-frontend/src/app/auth/signup/page.tsx`

Shared auth components:

- `giftcard-frontend/src/components/AuthProvider.tsx`
- `giftcard-frontend/src/components/auth/SocialAuthButtons` (Google flow)

Flow summary:

- Login/signup pages use 2-step OTP pattern:
  1. send OTP
  2. verify OTP
- After successful login, user redirects by role:
  - Admin -> `/admin/giftnow`
  - Customer -> `/customer/wallet`

Session handling:

- Token and user are stored in localStorage via `saveAuth`.
- `AuthProvider` refreshes profile using `/auth/me`.

## 4) Tech used in this feature

- NestJS JWT module/guards/strategies
- Google auth library (`google-auth-library`)
- bcryptjs for password/PIN hashing and comparison
- Prisma for `Admin`, `Customer`, `Otp` models
- Next.js client pages + React context auth state

## 5) Current constraints and development tools

- Phone OTP is explicitly blocked in backend (`Phone login is not permitted.`).
- Admin role check in frontend `isAdmin` helper currently checks role `ADMIN` explicitly, while some pages also manually consider `SUPER_ADMIN` and `MODERATOR`.
- **Google Auth Mock Bypass (Development)**: Under development/test environments (`NODE_ENV` is set to `development` or `test`), if `GOOGLE_CLIENT_ID` is not configured and `ALLOW_INSECURE_MOCK_LOGIN` is set to `true`, the backend bypasses Google signature verification, parses the Google ID token's payload directly, and signs in/registers the user.

