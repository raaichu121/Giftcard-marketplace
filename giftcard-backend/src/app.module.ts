import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { LoggerModule } from "./logger/logger.module";
import { WalletModule } from "./wallet/wallet.module";
import { DeliveryModule } from "./delivery/delivery.module";
import { GiftcardModule } from "./giftcard/giftcard.module";
import { CheckoutModule } from "./checkout/checkout.module";
import { AdminModule } from "./admin/admin.module";
import { OccasionModule } from "./occasion/occasion.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
      },
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    WalletModule,
    DeliveryModule,
    GiftcardModule,
    CheckoutModule,
    AdminModule,
    OccasionModule,
  ],
})
export class AppModule {}