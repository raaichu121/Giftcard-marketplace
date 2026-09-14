# GiftNow — API Testing and Database Guide

This guide provides details on the database setup and step-by-step instructions on how to test the GiftNow API endpoints using Postman.

---

## 1. Database Configuration

The system uses **PostgreSQL** (version 16), which is a **Relational Database Management System (RDBMS)**. All tables are connected via relations (foreign keys) managed through the Prisma ORM.

### Connection Details (Development)
These connection values are configured in the backend's `.env` file:

* **Host:** `localhost`
* **Port:** `5433` *(mapped from container port 5432)*
* **Database Name:** `giftnow_giftcard`
* **Username:** `postgres`
* **Password:** `giftnow123`
* **Prisma Schema:** Configured in [schema.prisma](file:///e:/GIFTNOW/giftcard-backend/prisma/schema.prisma)

### Key Database Tables
* **`customers`**: Stores buyer/user accounts (Google login info, profiles).
* **`admins`**: Stores administrative credentials and roles.
* **`giftnow_cards`**: Manages individual gift cards (code, value, status, type).
* **`giftnow_wallets`**: Keeps track of active client balances.
* **`giftnow_audit_logs`**: Tracks financial events (credits, debits) for audit security.

### How to Visually Browse the Database
You can inspect the database structure and data visually using **Prisma Studio**:
1. Open a terminal in `giftcard-backend`.
2. Run the command:
   ```bash

   npx prisma studio
   
   ```
3. Open [http://localhost:5555](http://localhost:5555) in your web browser.

---

## 2. Setting Up Postman

The NestJS backend includes **Swagger (OpenAPI)** documentation out of the box, making importing all route shapes and schemas into Postman automated and fast.

### Option A: Import Swagger Specs (Recommended)
1. Run the backend server (`npm run dev`).
2. Open **Postman**.
3. Click the **Import** button in the top-left section.
4. In the URL/Input bar, enter the OpenAPI specifications JSON URL:
   ```text
   http://localhost:3001/api/v1/docs-json
   ```
5. Click **Next** and finalize the import. Postman will automatically structure folders for all endpoints (Auth, Gift Cards, Wallet, etc.) complete with request schemas.

### Option B: Interactive Web Swagger docs
If you want to quickly test endpoints directly in your browser without launching Postman, visit:
* [http://localhost:3001/api/v1/docs](http://localhost:3001/api/v1/docs)

---

## 3. Step-by-Step API Testing Workflow

Follow this sequence to test the core flows using Postman.

### Step 1: Obtain Admin Authentication Token
Most secure API requests require a JWT bearer token. Get the admin token first.
* **Method:** `POST`
* **URL:** `http://localhost:3001/api/v1/auth/login`
* **Headers:** 
  * `Content-Type: application/json`
* **Body (JSON):**
  ```json
  {
    "email": "admin@giftnow.com",
    "password": "Admin@123456"
  }
  ```
* **Response:** Extract the string from `data.token`.

### Step 2: Set Token in Postman
1. Select your imported **GiftNow API** collection in the Postman sidebar.
2. Open the **Authorization** tab.
3. Choose **Bearer Token** as the authorization type.
4. Paste the copied token value in the **Token** field.
5. Click **Save**. All requests under this collection will now inherit this token automatically.

### Step 3: Purchase a Gift Card (Guest Flow)
Purchase a digital gift card as a non-authenticated user.
* **Method:** `POST`
* **URL:** `http://localhost:3001/api/v1/gift-cards/purchase-guest`
* **Headers:**
  * `Content-Type: application/json`
* **Body (JSON):**
  ```json
  {
    "type": "DIGITAL",
    "amount": 1000,
    "recipientEmail": "recipient@example.com",
    "personalMessage": "Best wishes!",
    "quantity": 1,
    "purchaserName": "John Doe",
    "purchaserEmail": "johndoe@example.com"
  }
  ```
* **Response:** Note down the `"code"` generated (e.g. `GN-XXXX-XXXX-XXXX`).

### Step 4: Access Sent Emails (Mailhog)
For local SMTP testing, emails (containing OTPs and Gift Card details) are captured by Mailhog.
* Open your browser to [http://localhost:8025](http://localhost:8025)
* Look for the gift card delivery or verification emails here.

### Step 5: Log in as a Customer & Redeem Code to Wallet
To redeem the purchased card to a customer's wallet:

1. **Request dynamic OTP:**
   * **Method:** `POST`
   * **URL:** `http://localhost:3001/api/v1/auth/otp/send`
   * **Body (JSON):**
     ```json
     {
       "email": "customer@example.com"
     }
     ```

2. **Retrieve OTP:** Open Mailhog ([http://localhost:8025](http://localhost:8025)) and copy the 6-digit verification code.

3. **Verify OTP and authenticate:**
   * **Method:** `POST`
   * **URL:** `http://localhost:3001/api/v1/auth/otp/verify`
   * **Body (JSON):**
     ```json
     {
       "email": "customer@example.com",
       "code": "YOUR_OTP_CODE_HERE",
       "firstName": "Jane",
       "lastName": "Doe"
     }
     ```
   * **Response:** Copy the customer's JSON Web Token (`data.token`).

4. **Redeem code using Customer Token:**
   * Create/Select the redeem request.
   * **Method:** `POST`
   * **URL:** `http://localhost:3001/api/v1/gift-cards/redeem`
   * **Authorization Tab:** Set type to **Bearer Token** and paste the **Customer Token**.
   * **Body (JSON):**
     ```json
     {
       "code": "YOUR_GIFT_CARD_CODE"
     }
     ```
   * **Response:** Check the response payload to confirm that the wallet has been credited successfully.
