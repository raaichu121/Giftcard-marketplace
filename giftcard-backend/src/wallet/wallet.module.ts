import { Module } from "@nestjs/common";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { AuditService } from "./audit.service";

@Module({
  controllers: [WalletController],
  providers: [WalletService, AuditService],
  exports: [WalletService],
})
export class WalletModule {}
