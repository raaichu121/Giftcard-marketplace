import { Injectable } from "@nestjs/common";
import { AuditOperation, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "./audit.service";
import { toNumber } from "../common/constants";
import { GiftNowHttpException } from "../common/exceptions";

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getOrCreateWallet(accountId: string) {
    const existing = await this.prisma.giftCardWallet.findUnique({
      where: { accountId },
    });
    if (existing) return existing;
    return this.prisma.giftCardWallet.create({
      data: { accountId, balance: 0, totalCredited: 0, totalDebited: 0 },
    });
  }

  async getBalance(accountId: string) {
    const wallet = await this.getOrCreateWallet(accountId);
    return {
      accountId: wallet.accountId,
      balance: toNumber(wallet.balance),
      totalCredited: toNumber(wallet.totalCredited),
      totalDebited: toNumber(wallet.totalDebited),
    };
  }

  async creditWallet(
    accountId: string,
    amount: number,
    performedBy: string,
    giftCardId?: string | null,
    operation: AuditOperation = "CREDIT",
    tx?: Prisma.TransactionClient,
  ) {
    const run = async (client: Prisma.TransactionClient) => {
      let wallet: any;
      const wallets = await client.$queryRaw<any[]>`
        SELECT * FROM "giftnow_wallets" WHERE "accountId" = ${accountId}::uuid FOR UPDATE
      `;
      wallet = wallets[0];

      if (!wallet) {
        try {
          wallet = await client.giftCardWallet.create({
            data: { accountId, balance: 0, totalCredited: 0, totalDebited: 0 },
          });
          await client.$queryRaw`
            SELECT * FROM "giftnow_wallets" WHERE "id" = ${wallet.id}::uuid FOR UPDATE
          `;
        } catch {
          const retried = await client.$queryRaw<any[]>`
            SELECT * FROM "giftnow_wallets" WHERE "accountId" = ${accountId}::uuid FOR UPDATE
          `;
          wallet = retried[0];
        }
      }

      const balanceBefore = toNumber(wallet.balance);
      const balanceAfter = balanceBefore + amount;

      await client.giftCardWallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalCredited: toNumber(wallet.totalCredited) + amount,
        },
      });

      await this.audit.write(
        {
          accountId,
          operation,
          amount,
          balanceBefore,
          balanceAfter,
          performedBy,
          giftCardId,
        },
        client,
      );

      return { balance: balanceAfter, credited: amount };
    };

    if (tx) return run(tx);
    return this.prisma.$transaction(run);
  }

  async debitWallet(
    accountId: string,
    amount: number,
    performedBy: string,
    orderId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const wallets = await tx.$queryRaw<any[]>`
        SELECT * FROM "giftnow_wallets" WHERE "accountId" = ${accountId}::uuid FOR UPDATE
      `;
      const wallet = wallets[0];
      if (!wallet) throw new GiftNowHttpException("INSUFFICIENT_WALLET");

      const balanceBefore = toNumber(wallet.balance);
      if (balanceBefore < amount) {
        throw new GiftNowHttpException("INSUFFICIENT_WALLET");
      }

      const debitAmount = amount;
      const balanceAfter = balanceBefore - debitAmount;
      await tx.giftCardWallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalDebited: toNumber(wallet.totalDebited) + debitAmount,
        },
      });

      await this.audit.write(
        {
          accountId,
          operation: "DEBIT",
          amount: debitAmount,
          balanceBefore,
          balanceAfter,
          performedBy,
          orderId,
        },
        tx,
      );

      return { debited: debitAmount, balance: balanceAfter };
    });
  }

  async adminCancelDebit(
    accountId: string,
    amount: number,
    performedBy: string,
    giftCardId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const wallets = await tx.$queryRaw<any[]>`
        SELECT * FROM "giftnow_wallets" WHERE "accountId" = ${accountId}::uuid FOR UPDATE
      `;
      const wallet = wallets[0];
      if (!wallet) return { debited: 0, balance: 0 };

      const balanceBefore = toNumber(wallet.balance);
      const debitAmount = Math.min(amount, balanceBefore);
      if (debitAmount <= 0) return { debited: 0, balance: balanceBefore };

      const balanceAfter = balanceBefore - debitAmount;
      await tx.giftCardWallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalDebited: toNumber(wallet.totalDebited) + debitAmount,
        },
      });

      await this.audit.write(
        {
          accountId,
          operation: "ADMIN_CANCEL_DEBIT",
          amount: debitAmount,
          balanceBefore,
          balanceAfter,
          performedBy,
          giftCardId,
        },
        tx,
      );

      return { debited: debitAmount, balance: balanceAfter };
    });
  }

  async getHistory(accountId: string, limit = 50, offset = 0) {
    const [rows, count] = await Promise.all([
      this.prisma.giftCardAuditLog.findMany({
        where: { accountId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.giftCardAuditLog.count({ where: { accountId } }),
    ]);
    return { rows, count };
  }
}
