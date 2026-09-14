# Implementation Plan: Integrate GiftCard, Customer Wallet, and Admin Sections

This document contains step-by-step instructions for the AI Agent to integrate the **GiftCard (BuyCard)**, **Customer Wallet**, and **GiftCard Admin Management** features from the `GIFTNOW` repository into the `SellNow` repository.

Follow the instructions below to configure the database, backend services, frontend pages, navigation components, and package dependencies.

---

## Part 1: Backend Integration (`sellnow-server`)

### Step 1.1: Install Backend NPM Dependencies
Run this command in the `sellnow-server` directory to install all required packages:
```bash
npm install bullmq @nestjs/bullmq redis qrcode sharp nodemailer bcryptjs
npm install --save-dev @types/qrcode @types/nodemailer @types/bcryptjs @types/multer @types/sharp
```

### Step 1.2: Update Database Schema (`prisma/schema.prisma`)
1. Open `sellnow-server/prisma/schema.prisma`.
2. Locate the existing `User` model, and add the relation to `GiftCardWallet` inside it:
   ```prisma
   wallet GiftCardWallet?
   ```
3. Append these enums and models at the bottom of the file:
   ```prisma
   enum GiftCardType {
     DIGITAL
     PHYSICAL
     CORPORATE_BULK
   }

   enum GiftCardStatus {
     ACTIVE
     FULLY_REDEEMED
     CANCELLED
   }

   enum AuditOperation {
     CREDIT
     DEBIT
     ADMIN_CANCEL_DEBIT
     REFUND_CREDIT
   }

   model GiftCardBatch {
     id               String   @id @default(uuid()) @db.Uuid
     name             String
     totalCards       Int
     totalAmount      Decimal  @db.Decimal(14, 2)
     createdByAdminId String   // Matches User.id CUID format
     createdAt        DateTime @default(now())

     cards GiftCard[]

     @@map("giftnow_batches")
   }

   model GiftCard {
     id                   String         @id @default(uuid()) @db.Uuid
     code                 String         @unique @db.VarChar(32)
     type                 GiftCardType
     amount               Decimal        @db.Decimal(12, 2)
     status               GiftCardStatus @default(ACTIVE)
     purchasedByAccountId String?        // Matches User.id CUID format
     purchaserName        String?
     purchaserEmail       String?
     isCustomerPurchase   Boolean        @default(false)
     redeemedByAccountId  String?        // Matches User.id CUID format
     recipientEmail       String?
     recipientPhone       String?        @db.VarChar(30)
     deliveryChannel      String         @default("EMAIL")
     personalMessage      String?
     deliveryAddress      Json?
     batchId              String?        @db.Uuid
     cardDesignId         String?        @db.Uuid
     redeemedAt           DateTime?
     cancelledAt          DateTime?
     pinHash              String?        @db.VarChar(72)
     pinAttempts          Int            @default(0)
     qrCode               String?
     createdAt            DateTime       @default(now())
     updatedAt            DateTime       @updatedAt

     batch      GiftCardBatch?     @relation(fields: [batchId], references: [id])
     cardDesign OccasionCard?      @relation(fields: [cardDesignId], references: [id])
     auditLogs  GiftCardAuditLog[]

     @@index([purchasedByAccountId])
     @@index([redeemedByAccountId])
     @@index([batchId])
     @@index([status])
     @@index([type])
     @@map("giftnow_cards")
   }

   model GiftCardWallet {
     id            String   @id @default(uuid())
     accountId     String   @unique // Matches User.id CUID format
     balance       Decimal  @default(0) @db.Decimal(12, 2)
     totalCredited Decimal  @default(0) @db.Decimal(12, 2)
     totalDebited  Decimal  @default(0) @db.Decimal(12, 2)
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt

     customer User @relation(fields: [accountId], references: [id])

     @@map("giftnow_wallets")
   }

   model GiftCardAuditLog {
     id            String         @id @default(uuid()) @db.Uuid
     accountId     String         // Matches User.id CUID format
     giftCardId    String?        @db.Uuid
     orderId       String?        @db.VarChar(64)
     operation     AuditOperation
     amount        Decimal        @db.Decimal(12, 2)
     balanceBefore Decimal        @db.Decimal(12, 2)
     balanceAfter  Decimal        @db.Decimal(12, 2)
     performedBy   String         // Matches User.id CUID format
     createdAt     DateTime       @default(now())

     giftCard GiftCard? @relation(fields: [giftCardId], references: [id])

     @@index([accountId])
     @@index([createdAt])
     @@index([giftCardId])
     @@map("giftnow_audit_logs")
   }

   model Occasion {
     id        String         @id @default(uuid()) @db.Uuid
     slug      String         @unique @db.VarChar(50)
     name      String         @db.VarChar(100)
     nepali    String?        @db.VarChar(100)
     emoji     String?        @db.VarChar(10)
     color     String         @default("#2563eb") @db.VarChar(10)
     isActive  Boolean        @default(true)
     order     Int            @default(0)
     createdAt DateTime       @default(now())
     updatedAt DateTime       @updatedAt
     cards     OccasionCard[]

     @@map("giftnow_occasions")
   }

   model OccasionCard {
     id         String   @id @default(uuid()) @db.Uuid
     occasionId String   @db.Uuid
     name       String   @db.VarChar(100)
     imagePath  String   @db.VarChar(255)
     isDefault  Boolean  @default(false)
     valueBox   Json
     valueColor String   @default("#1a1a2e") @db.VarChar(10)
     createdAt  DateTime @default(now())
     updatedAt  DateTime @updatedAt

     occasion   Occasion   @relation(fields: [occasionId], references: [id], onDelete: Cascade)
     giftCards  GiftCard[]

     @@index([occasionId])
     @@map("giftnow_occasion_cards")
   }

   model GiftNowSetting {
     id        String   @id @default(uuid()) @db.Uuid
     key       String   @unique @db.VarChar(100)
     value     Json
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@map("giftnow_settings")
   }
   ```

### Step 1.3: Update Environment Variables (`.env`)
Ensure that your `.env` contains the database connection secrets and redis host variables:
```ini
# Add if missing:
DATABASE_URL="postgresql://username:password@localhost:5432/sellnow_db"
DIRECT_DATABASE_URL="postgresql://username:password@localhost:5432/sellnow_db"

REDIS_HOST=localhost
REDIS_PORT=6379

FROM_EMAIL=noreply@yourdomain.com
SENDGRID_API_KEY=your_sendgrid_key_here
```
Run this to apply migrations:
```bash
npm run prisma:migrate
```

### Step 1.4: Import Modules in `app.module.ts`
Open `sellnow-server/src/app.module.ts`. Add the module imports to register them globally:
```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WalletModule } from './modules/wallet/wallet.module';
import { GiftcardModule } from './modules/giftcard/giftcard.module';
import { AdminModule as GiftcardAdminModule } from './modules/giftcard-admin/admin.module';
import { CheckoutModule as GiftcardCheckoutModule } from './modules/giftcard-checkout/checkout.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { OccasionModule } from './modules/occasion/occasion.module';

@Module({
  imports: [
    // Register BullMQ
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    
    // Feature Modules
    WalletModule,
    GiftcardModule,
    GiftcardAdminModule,
    GiftcardCheckoutModule,
    DeliveryModule,
    OccasionModule,
    // ... existing imports
  ],
})
export class AppModule {}
```

---

## Part 2: Frontend Integration (`sellnow-client`)

### Step 2.1: Install Frontend NPM Dependencies
Run this command in the `sellnow-client` directory:
```bash
npm install qrcode html2canvas recharts react-hot-toast jose
npm install --save-dev @types/qrcode
```

### Step 2.2: Add Routes Configuration (`src/lib/constants.ts`)
Open `sellnow-client/src/lib/constants.ts`. Add these three keys to the exported `ROUTES` object:
```typescript
  // GiftNow Routes
  giftnowBuy: "/giftnow/buy",
  accountWallet: "/account/wallet",
  adminGiftnow: "/admin/giftnow",
```

### Step 2.3: Configure Sidebar Navigation Menus
1. **User Dashboard Sidebar Navigation (`src/config/account-nav.ts`):**
   Import `Wallet` icon from `lucide-react` and add the "My Wallet" link:
   ```typescript
   import { Wallet } from "lucide-react";
   
   // In accountNavItems array:
   {
     href: ROUTES.accountWallet,
     label: "My Wallet",
     icon: Wallet,
     section: "account",
   }
   ```

2. **Admin Sidebar Navigation (`src/config/admin-nav.ts`):**
   Import `Gift` icon from `lucide-react`, add the "Gift Cards" link under the "Platform" section inside `adminNavGroups`, and add the route title to `adminRouteTitles`:
   ```typescript
   import { Gift } from "lucide-react";
   
   // Inside Platform navigation items:
   { href: ROUTES.adminGiftnow, label: "Gift Cards", icon: Gift }
   
   // Inside adminRouteTitles mapping object:
   [ROUTES.adminGiftnow]: "Gift Cards Management"
   ```

### Step 2.4: Set Environment Variables (`.env.local`)
Ensure that your `.env.local` frontend configuration defines:
```ini
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```
