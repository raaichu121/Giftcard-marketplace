# Summary of Implementations - Gift Card PIN & OTP Flows

This document details all updates and enhancements made to the GiftNow platform today, spanning email notifications, API responses, the redemption process, admin dashboards, security adjustments, and design upload management.

---

## 1. Dynamic Redemption Flow (PIN vs. OTP)

We decoupled the redemption process for customer-issued gift cards and admin/bulk-issued ones:
- **Customer Purchased Cards**: Require a dynamic, transient 6-digit verification code (OTP) sent to the recipient's email upon request. No static PIN is ever exposed or requested.
- **Admin/Bulk Issued Cards**: Require the classic 6-digit static Security PIN generated at creation.

### Database updates
- Created an `Otp` table to store transient 6-digit codes with a 5-minute expiry timestamp.
- Verified and cleared old code verification states securely.

### Service updates
- Added `/gift-cards/redeem/send-otp` POST route which locates active cards, generates a secure 6-digit OTP code, saves it to the database, and dispatches the verification email.
- Updated `redeemCode` to conditionally perform an OTP lookup (for customer purchases) or a bcrypt static PIN comparison (for admin/bulk purchases).

---

## 2. Information Leakage & Security Controls

Ensured security PINs are never leaked to users before the point of redemption:
- **Emails**: Removed PIN displays from `sendDigitalGiftEmail` (Gift Delivery) and `sendPurchaseConfirmation` (Buyer Receipt) templates when the card is a customer purchase (`isCustomerPurchase: true`). Replaced it with clean copy informing the user that an OTP code will be sent to their email during redemption.
- **API Payload**: Updated the `purchase()` API return statement to conditionally omit the plain text `pin` parameter for customer purchases.
- **Tests**: Adjusted Jest assertions to verify that no PIN is returned in the API response or templates for customer cards.

---

## 3. Reset Security PIN Workflow

Adjusted the admin reset flow to prevent administrative leakage of customer PINs:
- **Email Delivery**: When the admin clicks **Reset PIN** on a customer-issued card, the system regenerates the PIN, sends it directly to the customer's email via a template, and omits the plain text PIN from the admin success banner.
- **Admin Message Display**:
  - **For Customer Cards**: Displays:
    > **Security PIN Reset Successful**
    > The security PIN for gift card **GN-XXXX-XXXX-XXXX-XXXXXXXX** has been sent to recipent mail.
    *(Hides the Copy PIN button and the plain text PIN)*.
  - **For Admin Cards**: Shows the generated PIN with the **Copy PIN** button as before.

---

## 4. UI Alignment & Form Cleanup (Wallet Page)

Optimized the redeem wizard styling and usability inside the client wallet page (`src/app/customer/wallet/page.tsx`):
- **Consistent Heights**: Set all input fields and action buttons to a uniform height of `h-[48px]` to ensure alignment.
- **"Change Code" Pill Button**: Transformed the naked link into a small, clickable `h-[30px]` pill button styled with `bg-white border hover:bg-gray-50`.
- **Dynamic Controls**:
  - **Step 1**: Entering the card code and clicking "Verify Code" is clean.
  - **Step 2**: The input changes dynamically between a numeric 6-digit OTP code (showing a masked email address hint) or a numeric 6-digit Security PIN (for admin-issued cards) depending on card type.

---

## 5. Inquiry & Audit Details Panel

Enabled deep inquiry capabilities for customer support/administrators in the admin dashboard:
- **Backend Mapping**: Enhanced `listCards()` and `getBatch()` to run in-memory queries resolving customer IDs to actual names and emails.
- **Inquire Panel**: Added an **"Inquire"** toggle button under each card row. Clicking it displays a comprehensive audit grid containing:
  - **Purchase & Issuance**: Created At, Issued By (Customer vs Admin), Purchaser Name & Email, Recipient Email, and Personal Message.
  - **Redemption & Status**: Redemption Status, Redeemed Date, Redeemed by Customer (Name & Email), and Security PIN lockout attempts (lockout threshold is 5 failed attempts).

---

## 6. Dashboard Code & Date Filters

Added robust search options to the gift cards admin directory:
- **Search by Code**: Added a case-insensitive query input matching codes partially or fully.
- **Date Pickers**: Added **From** and **To** date select boxes. The backend filters records within the `createdAt` range (normalizing the end date to `23:59:59.999` to capture the entire day).
- **Clear Filters**: Included a **Clear Filters** option that clears the filter state when any inputs are populated.

---

## 7. Self-Contained Occasion Card Upload Panel

Rebuilt the layout structure in the occasions management panel (`src/app/admin/giftnow/occasions/page.tsx`):
- **Occasion Folder Dropdown**: The upload form is now always visible. Administrators select the target occasion folder directly from a dropdown, mapping the design to the correct filesystem folder (e.g. `public/cards/tihar/`).
- **Side-by-Side Grid**: Arranged the **Occasion Selector** dropdown and the **Design Name** text input side-by-side in a responsive 2-column grid (`grid grid-cols-1 md:grid-cols-2 gap-4`), preserving page space.
- **Safe Validation**: Inputs remain disabled until a valid folder is selected.

---

## 8. Verification & Health Results

- **Backend compilation**: `npx tsc --noEmit` returns **0 errors**.
- **Frontend compilation**: `npx tsc --noEmit` returns **0 errors**.
- **Unit Tests**: Passed successfully in both Spec suites.