import { Injectable } from "@nestjs/common";
import { AuditOperation, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async write(
    data: {
      accountId: string;
      operation: AuditOperation;
      amount: number;
      balanceBefore: number;
      balanceAfter: number;
      performedBy: string;
      giftCardId?: string | null;
      orderId?: string | null;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.giftCardAuditLog.create({
      data: {
        accountId: data.accountId,
        operation: data.operation,
        amount: data.amount,
        balanceBefore: data.balanceBefore,
        balanceAfter: data.balanceAfter,
        performedBy: data.performedBy,
        giftCardId: data.giftCardId ?? null,
        orderId: data.orderId ?? null,
      },
    });
  }
}
