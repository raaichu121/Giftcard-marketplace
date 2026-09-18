import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { DeliveryService } from "./delivery.service";
import { EmailProcessor } from "./processors/email.processor";
import { BulkProcessor } from "./processors/bulk.processor";
import { PrintProcessor } from "./processors/print.processor";
import { SmsProcessor } from "./processors/sms.processor";

@Module({
  imports: [
    BullModule.registerQueue(
      { name: "email-queue" },
      { name: "bulk-queue" },
      { name: "print-queue" },
      { name: "sms-queue" },
    ),
  ],
  providers: [DeliveryService, EmailProcessor, BulkProcessor, PrintProcessor, SmsProcessor],
  exports: [DeliveryService],
})
export class DeliveryModule {}
