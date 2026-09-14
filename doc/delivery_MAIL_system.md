# GiftNow — Local Email Delivery Guide

This guide explains how email delivery works when a customer purchases a digital gift card and enters a **Recipient Email**, including how to test and verify it locally using MailHog.

---

## 1. How Email Delivery Works (Under the Hood)

When a customer or guest purchases a digital gift card:

1. **Frontend Request:** In the [Buy Card page](file:///e:/GIFTNOW/giftcard-frontend/src/app/giftnow/buy/page.tsx), once a user fills in the form (with `recipientEmail`) and clicks submit, the frontend sends a POST request with the form data to the backend guest purchase API `/gift-cards/purchase-guest`.
2. **Backend Logic:** In the [GiftcardService](file:///e:/GIFTNOW/giftcard-backend/src/giftcard/giftcard.service.ts), if the gift card `type` is `"DIGITAL"` and a `recipientEmail` is provided, the backend generates a QR code and calls the `DeliveryService`:
   ```typescript
   if (input.type === "DIGITAL" && input.recipientEmail) {
     const qr = card.qrCode ?? (await this.delivery.attachQrCode(card.id, card.code));
     await this.delivery.sendDigitalGiftEmail({
       recipientEmail: input.recipientEmail,
       code: card.code,
       amount: input.amount,
       senderName: input.purchaserName,
       personalMessage: input.personalMessage,
       qrDataUrl: qr,
     });
   }
   ```
3. **Queue Processing:** The [DeliveryService](file:///e:/GIFTNOW/giftcard-backend/src/delivery/delivery.service.ts) logs the request and queues a `send-gift-email` job in the BullMQ `email-queue`.
4. **Sending via Transporter:** The [EmailProcessor](file:///e:/GIFTNOW/giftcard-backend/src/delivery/processors/email.processor.ts) processes the queue:
   * **Development:** MailHog (`localhost:1025`) captures SMTP traffic.
   * **Production:** SendGrid (`smtp.sendgrid.net`) sends to real mail servers.

---

## 2. Setting Up MailHog Locally

To prevent email sending errors during local development, MailHog must be running inside a Docker container:

1. **Storage Mode:** Ensure [docker-compose.yml](file:///e:/GIFTNOW/docker-compose.yml) configures MailHog to use `memory` storage (to avoid local path permission errors):
   ```yaml
     mailhog:
       image: mailhog/mailhog:latest
       container_name: giftnow-mailhog
       ports:
         - "1025:1025"
         - "8025:8025"
       environment:
         MH_STORAGE: memory
   ```
2. **Start Docker Containers:** Run the following command from the project root:
   ```bash
   docker compose up -d
   ```
3. **Verify Status:** Check that MailHog is active and listening on ports `1025` (SMTP) and `8025` (Web UI):
   ```bash
   docker compose ps
   ```

---

## 3. How to Test & Verify Delivery

To manually test that emails are successfully sent to the recipient:

1. **Submit Purchase:**
   * Open the frontend: [http://localhost:3000/giftnow/buy](http://localhost:3000/giftnow/buy)
   * Fill out the form with a **Recipient Email** (e.g., `recipient@example.com`).
   * Click the **Buy Gift Card** button.
2. **Open MailHog UI:**
   * Go to: [http://localhost:8025](http://localhost:8025)
3. **Verify Email:**
   * You will see the incoming gift card email sent to the recipient.
   * Open the email to view the claim code (e.g. `GN-XXXX-XXXX-XXXX`), face value, and QR code.

---

## 4. Production Configuration

In production (`NODE_ENV=production`), the system switches from local MailHog to **SendGrid** for sending real emails.

### Steps to Configure SendGrid

1. **Create a SendGrid Account:**
   * Sign up or log in to [SendGrid](https://sendgrid.com/).
2. **Setup Sender Authentication:**
   * Navigate to **Settings → Sender Authentication** in your SendGrid dashboard.
   * Authenticate your domain (e.g., `giftnow.com`) or set up a Single Sender verification. This is required; otherwise, SendGrid will reject emails.
3. **Generate an API Key:**
   * Go to **Settings → API Keys** and click **Create API Key**.
   * Give it a name and select **Restricted Access** with **Mail Send** permissions enabled.
   * Copy the generated API key.
4. **Configure Environment Variables:**
   * Set the following environment variables in your production environment (e.g., your cloud provider settings or production `.env` file):
     ```env
     NODE_ENV=production
     SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     FROM_EMAIL=noreply@yourdomain.com
     ```
   * Make sure `FROM_EMAIL` matches the verified sender/domain in your SendGrid dashboard.