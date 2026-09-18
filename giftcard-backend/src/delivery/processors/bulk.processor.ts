import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { generateGiftNowCode } from "../../common/utils/code-generator";

interface BulkJobData {
  batchId: string;
  quantities: Array<{ amount: number; quantity: number }> | number;
  createdByAdminId: string;
}

@Processor("bulk-queue")
export class BulkProcessor extends WorkerHost {
  private readonly logger = new Logger(BulkProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<BulkJobData>) {
    this.logger.debug(
      `Processing bulk code generation for batch ${job.data.batchId}`,
    );

    try {
      const batch = await this.prisma.giftCardBatch.findUnique({
        where: { id: job.data.batchId },
      });

      if (!batch) {
        throw new Error(`Batch ${job.data.batchId} not found`);
      }

      const quantities = Array.isArray(job.data.quantities)
        ? job.data.quantities
        : [{ amount: job.data.quantities, quantity: batch.totalCards }];

      const cards: any[] = [];
      let totalAmount = 0;

      for (const { amount, quantity } of quantities) {
        for (let i = 0; i < quantity; i++) {
          const code = generateGiftNowCode();
          cards.push({
            code,
            type: "CORPORATE_BULK",
            amount,
            status: "ACTIVE",
            batchId: job.data.batchId,
            purchasedByAccountId: job.data.createdByAdminId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          totalAmount += amount;

          // Report progress every 10 cards
          if (cards.length % 10 === 0) {
            this.logger.debug(
              `Generated ${cards.length}/${batch.totalCards} codes`,
            );
          }
        }
      }

      // Bulk insert all cards
      await this.prisma.giftCard.createMany({
        data: cards,
      });

      // Update batch with total amount
      await this.prisma.giftCardBatch.update({
        where: { id: job.data.batchId },
        data: { totalAmount },
      });

      this.logger.log(
        `✅ Bulk generation complete: ${cards.length} cards created for batch ${job.data.batchId}`,
      );
      return { cardsGenerated: cards.length, totalAmount };
    } catch (error) {
      this.logger.error(
        `Bulk generation failed for batch ${job.data.batchId}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
