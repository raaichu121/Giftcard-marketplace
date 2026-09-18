import { Module } from "@nestjs/common";
import { GiftcardController } from "./giftcard.controller";
import { GiftcardService } from "./giftcard.service";
import { RedemptionService } from "./redemption.service";
import { RedeemRateLimitGuard } from "./redeem-rate-limit.guard";
import { SettingsService } from "./settings.service";
import { WalletModule } from "../wallet/wallet.module";
import { DeliveryModule } from "../delivery/delivery.module";

@Module({
  imports: [WalletModule, DeliveryModule],
  controllers: [GiftcardController],
  providers: [
    GiftcardService,
    RedemptionService,
    RedeemRateLimitGuard,
    SettingsService,
  ],
  exports: [GiftcardService, SettingsService],
})
export class GiftcardModule {}
