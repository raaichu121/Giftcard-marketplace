import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { GiftcardModule } from "../giftcard/giftcard.module";

@Module({
  imports: [GiftcardModule],
  controllers: [AdminController],
})
export class AdminModule {}