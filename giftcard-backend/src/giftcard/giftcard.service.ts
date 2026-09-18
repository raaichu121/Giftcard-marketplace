import { Injectable } from "@nestjs/common";
import { GiftCardType, Prisma, GiftCard } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { RedemptionService } from "./redemption.service";
import { DeliveryService } from "../delivery/delivery.service";
import { WalletService } from "../wallet/wallet.service";
import { SettingsService } from "./settings.service";
import {
  BULK_MIN_QUANTITY,
  validateAmount,
  toNumber,
} from "../common/constants";
import { GiftNowHttpException } from "../common/exceptions";
import { generateSecurityPin } from "../common/utils/code-generator";

@Injectable()
export class GiftcardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redemption: RedemptionService,
    private readonly delivery: DeliveryService,
    private readonly wallet: WalletService,
    private readonly settings: SettingsService,
  ) {}

  private async validateDynamicAmountAndType(amount: number, type: GiftCardType) {
    const settings = await this.settings.getSettings();
    if (!settings.enabledTypes.includes(type)) {
      throw new GiftNowHttpException(
        "INVALID_AMOUNT",
        `Card type ${type} is currently disabled by administrator.`
      );
    }
    if (!Number.isFinite(amount) || amount < settings.minAmount || amount > settings.maxAmount) {
      throw new GiftNowHttpException(
        "INVALID_AMOUNT",
        `Amount must be between NPR ${settings.minAmount} and NPR ${settings.maxAmount.toLocaleString("en-NP")}`
      );
    }
    if (!Number.isInteger(amount)) {
      throw new GiftNowHttpException(
        "INVALID_AMOUNT",
        "Amount must be a whole rupee value"
      );
    }
  }

  async purchase(input: {
    type: GiftCardType;
    amount: number;
    recipientEmail?: string;
    recipientPhone?: string;
    deliveryChannel?: string;
    personalMessage?: string;
    deliveryAddress?: Prisma.InputJsonValue;
    quantity?: number;
    purchasedByAccountId: string | null;
    purchaserName: string;
    purchaserEmail: string;
    cardDesignId?: string;
  }) {
    await this.validateDynamicAmountAndType(input.amount, input.type);
    const settings = await this.settings.getSettings();
    if (input.type === "DIGITAL") {
      const channel = input.deliveryChannel || "EMAIL";
      if (!settings.enabledChannels.includes(channel)) {
        throw new Error(`${channel} delivery channel is currently disabled`);
      }
      if ((channel === "EMAIL" || channel === "BOTH") && !input.recipientEmail) {
        throw new Error("recipientEmail is required for digital gift cards delivered via email");
      }
      if ((channel === "SMS" || channel === "BOTH") && !input.recipientPhone) {
        throw new Error("recipientPhone is required for digital gift cards delivered via SMS");
      }
    }
    if (input.type === "PHYSICAL" && !input.deliveryAddress) {
      throw new Error("deliveryAddress is required for physical gift cards");
    }

    const qty =
      input.type === "CORPORATE_BULK"
        ? Math.max(input.quantity ?? BULK_MIN_QUANTITY, BULK_MIN_QUANTITY)
        : 1;

    const cards = [];
    for (let i = 0; i < qty; i++) {
      const { card, pin } = await this.createSingleCard({
        type: input.type,
        amount: input.amount,
        purchasedByAccountId: input.purchasedByAccountId,
        recipientEmail: input.recipientEmail,
        recipientPhone: input.recipientPhone,
        deliveryChannel: input.deliveryChannel,
        personalMessage: input.personalMessage,
        deliveryAddress: input.deliveryAddress,
        isCustomerPurchase: true,
        purchaserName: input.purchaserName,
        purchaserEmail: input.purchaserEmail,
        cardDesignId: input.cardDesignId,
      });
      cards.push({ ...card, pin });

      if (input.type === "DIGITAL") {
        const channel = card.deliveryChannel || "EMAIL";
        
        if ((channel === "EMAIL" || channel === "BOTH") && card.recipientEmail) {
          const qr =
            card.qrCode ?? (await this.delivery.attachQrCode(card.id, card.code));
          await this.delivery.sendDigitalGiftEmail({
            recipientEmail: card.recipientEmail,
            code: card.code,
            pin,
            amount: input.amount,
            senderName: input.purchaserName,
            personalMessage: input.personalMessage,
            qrDataUrl: qr,
            isCustomerPurchase: true,
          });
        }
        
        if ((channel === "SMS" || channel === "BOTH") && card.recipientPhone) {
          await this.delivery.sendDigitalGiftSms({
            recipientPhone: card.recipientPhone,
            code: card.code,
            pin,
            amount: input.amount,
            senderName: input.purchaserName,
            personalMessage: input.personalMessage,
            isCustomerPurchase: true,
          });
        }
      }
    }

    let csvContent: string | undefined;
    if (input.type === "CORPORATE_BULK" && cards.length > 1) {
      const csvHeader = "Code,Pin,Amount,Status,Type,CreatedAt";
      const csvRows = cards.map((c) =>
        [
          c.code,
          c.pin,
          toNumber(c.amount),
          c.status,
          c.type,
          c.createdAt.toISOString(),
        ].join(",")
      );
      csvContent = [csvHeader, ...csvRows].join("\n");
    }

    if (input.type === "CORPORATE_BULK" && input.recipientEmail && csvContent) {
      await this.delivery.sendBulkGiftCsvEmail({
        recipientEmail: input.recipientEmail,
        purchaserName: input.purchaserName,
        amount: input.amount,
        quantity: qty,
        csvContent,
      });
    }

    await this.delivery.sendPurchaseConfirmation({
      purchaserEmail: input.purchaserEmail,
      code: cards[0].code,
      pin: cards[0].pin,
      amount: input.amount,
      type: input.type,
      recipientEmail: input.recipientEmail,
      csvContent,
      isCustomerPurchase: true,
    });

    const primary = cards[0];
    return {
      giftCardId: primary.id,
      code: primary.code,
      amount: toNumber(primary.amount),
      type: primary.type,
      status: primary.status,
      cards:
        cards.length > 1
          ? cards.map((c) => ({ id: c.id, code: c.code, amount: toNumber(c.amount) }))
          : undefined,
    };
  }

  private async createSingleCard(params: {
    type: GiftCardType;
    amount: number;
    purchasedByAccountId?: string | null;
    recipientEmail?: string;
    recipientPhone?: string;
    deliveryChannel?: string;
    personalMessage?: string;
    deliveryAddress?: Prisma.InputJsonValue;
    batchId?: string;
    isCustomerPurchase?: boolean;
    purchaserName?: string;
    purchaserEmail?: string;
    cardDesignId?: string;
  }): Promise<{ card: GiftCard; pin: string }> {
    const code = await this.redemption.generateUniqueCode();
    const pin = generateSecurityPin();
    const pinHash = await bcrypt.hash(pin, 10);
    const card = await this.prisma.giftCard.create({
      data: {
        code,
        type: params.type,
        amount: params.amount,
        status: "ACTIVE",
        pinHash,
        purchasedByAccountId: params.purchasedByAccountId ?? null,
        recipientEmail: params.recipientEmail ?? null,
        recipientPhone: params.recipientPhone ?? null,
        deliveryChannel: params.deliveryChannel ?? "EMAIL",
        personalMessage: params.personalMessage ?? null,
        deliveryAddress: params.deliveryAddress ?? Prisma.JsonNull,
        batchId: params.batchId ?? null,
        isCustomerPurchase: params.isCustomerPurchase ?? false,
        purchaserName: params.purchaserName ?? null,
        purchaserEmail: params.purchaserEmail ?? null,
        cardDesignId: params.cardDesignId ?? null,
      },
    });
    await this.delivery.attachQrCode(card.id, card.code);
    const fullCard = await this.prisma.giftCard.findUniqueOrThrow({ where: { id: card.id } });
    return { card: fullCard, pin };
  }

  async adminCreate(input: {
    type: GiftCardType;
    amount: number;
    quantity?: number;
    amounts?: number[];
    recipientEmail?: string;
    personalMessage?: string;
    deliveryAddress?: Prisma.InputJsonValue;
    batchName?: string;
    createdByAdminId: string;
    cardDesignId?: string;
  }) {
    const amounts: number[] = input.amounts?.length
      ? input.amounts
      : Array(input.quantity ?? 1).fill(input.amount);

    for (const a of amounts) {
      await this.validateDynamicAmountAndType(a, input.type);
    }

    if (
      amounts.length >= BULK_MIN_QUANTITY ||
      input.type === "CORPORATE_BULK"
    ) {
      const batch = await this.prisma.giftCardBatch.create({
        data: {
          name:
            input.batchName || `Bulk ${new Date().toISOString().slice(0, 10)}`,
          totalCards: amounts.length,
          totalAmount: amounts.reduce((s, a) => s + a, 0),
          createdByAdminId: input.createdByAdminId,
        },
      });

      const cards = [];
      for (const amount of amounts) {
        const { card, pin } = await this.createSingleCard({
          type: input.type === "CORPORATE_BULK" ? "CORPORATE_BULK" : input.type,
          amount,
          batchId: batch.id,
          recipientEmail: input.recipientEmail,
          personalMessage: input.personalMessage,
          cardDesignId: input.cardDesignId,
        });
        cards.push({
          id: card.id,
          code: card.code,
          pin,
          amount: toNumber(card.amount),
        });
      }
      return { batchId: batch.id, cards };
    }

    const { card, pin } = await this.createSingleCard({
      type: input.type,
      amount: input.amount,
      recipientEmail: input.recipientEmail,
      personalMessage: input.personalMessage,
      deliveryAddress: input.deliveryAddress,
      cardDesignId: input.cardDesignId,
    });

    return {
      giftCardId: card.id,
      code: card.code,
      pin,
      amount: toNumber(card.amount),
      type: card.type,
      status: card.status,
    };
  }

  async cancelCard(cardId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const card = await tx.giftCard.findUnique({ where: { id: cardId } });
      if (!card) throw new GiftNowHttpException("GIFT_CARD_NOT_FOUND");
      if (card.status === "CANCELLED") return card;

      const amount = toNumber(card.amount);
      if (card.status === "FULLY_REDEEMED" && card.redeemedByAccountId) {
        await this.wallet.adminCancelDebit(
          card.redeemedByAccountId,
          amount,
          adminId,
          card.id,
        );
      }

      return tx.giftCard.update({
        where: { id: cardId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
    });
  }

  async listCards(filters: {
    status?: string;
    type?: string;
    createdBy?: string;
    code?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.GiftCardWhereInput = {};
    if (filters.status) where.status = filters.status as never;
    if (filters.type) where.type = filters.type as never;
    if (filters.createdBy === "ADMIN") where.isCustomerPurchase = false;
    if (filters.createdBy === "CUSTOMER") where.isCustomerPurchase = true;

    if (filters.code) {
      where.code = {
        contains: filters.code.trim(),
        mode: "insensitive",
      };
    }

    if (filters.startDate || filters.endDate) {
      const dateRange: any = {};
      if (filters.startDate) dateRange.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        dateRange.lte = end;
      }
      where.createdAt = dateRange;
    }

    const [rows, count] = await Promise.all([
      this.prisma.giftCard.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters.limit ?? 50,
        skip: filters.offset ?? 0,
      }),
      this.prisma.giftCard.count({ where }),
    ]);

    const uniqueAccountIds = new Set<string>();
    rows.forEach((r) => {
      if (r.purchasedByAccountId) uniqueAccountIds.add(r.purchasedByAccountId);
      if (r.redeemedByAccountId) uniqueAccountIds.add(r.redeemedByAccountId);
    });

    const customers = await this.prisma.customer.findMany({
      where: { id: { in: Array.from(uniqueAccountIds) } },
      select: { id: true, name: true, email: true },
    });

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    const mappedRows = rows.map((r) => ({
      ...r,
      purchasedByCustomer: r.purchasedByAccountId ? customerMap.get(r.purchasedByAccountId) || null : null,
      redeemedByCustomer: r.redeemedByAccountId ? customerMap.get(r.redeemedByAccountId) || null : null,
    }));

    return { rows: mappedRows, count };
  }

  async getPurchasedByAccount(accountId: string, limit = 50, offset = 0) {
    const [rows, count] = await Promise.all([
      this.prisma.giftCard.findMany({
        where: { purchasedByAccountId: accountId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.giftCard.count({
        where: { purchasedByAccountId: accountId },
      }),
    ]);
    return { rows, count };
  }

  async getBatch(batchId: string) {
    const batch = await this.prisma.giftCardBatch.findUnique({
      where: { id: batchId },
    });
    if (!batch) return null;
    const cards = await this.prisma.giftCard.findMany({ where: { batchId } });
    const redeemed = cards.filter((c) => c.status === "FULLY_REDEEMED").length;

    const uniqueRedeemIds = Array.from(
      new Set(cards.map((c) => c.redeemedByAccountId).filter(Boolean) as string[]),
    );

    const redeemers = await this.prisma.customer.findMany({
      where: { id: { in: uniqueRedeemIds } },
      select: { id: true, name: true, email: true },
    });

    const redeemerMap = new Map(redeemers.map((r) => [r.id, r]));

    const mappedCards = cards.map((c) => ({
      ...c,
      redeemedByCustomer: c.redeemedByAccountId ? redeemerMap.get(c.redeemedByAccountId) || null : null,
    }));

    return {
      batch,
      cards: mappedCards,
      redemptionRate: cards.length
        ? ((redeemed / cards.length) * 100).toFixed(1)
        : "0",
    };
  }

  async getAnalytics() {
    const totalCards = await this.prisma.giftCard.count();
    const totalValue = await this.prisma.giftCard.aggregate({
      _sum: { amount: true },
    });
    const redeemedCards = await this.prisma.giftCard.count({
      where: { status: "FULLY_REDEEMED" },
    });
    const activeCards = await this.prisma.giftCard.count({
      where: { status: "ACTIVE" },
    });
    const outstanding = await this.prisma.giftCardWallet.aggregate({
      _sum: { balance: true },
    });
    const avg = await this.prisma.giftCard.aggregate({
      _avg: { amount: true },
    });
    const adminCreatedCount = await this.prisma.giftCard.count({
      where: { isCustomerPurchase: false },
    });
    const customerPurchasedCount = await this.prisma.giftCard.count({
      where: { isCustomerPurchase: true },
    });

    return {
      totalCardsIssued: totalCards,
      totalValueIssued: toNumber(totalValue._sum.amount),
      totalRedeemedCount: redeemedCards,
      activeCardsCount: activeCards,
      outstandingWalletBalances: toNumber(outstanding._sum.balance),
      redemptionRate:
        totalCards > 0
          ? `${((redeemedCards / totalCards) * 100).toFixed(1)}%`
          : "0%",
      averageDenomination: toNumber(avg._avg.amount),
      adminCreatedCount,
      customerPurchasedCount,
    };
  }

  async resetPin(cardId: string) {
    const card = await this.prisma.giftCard.findUnique({ where: { id: cardId } });
    if (!card) throw new GiftNowHttpException("GIFT_CARD_NOT_FOUND");

    const pin = generateSecurityPin();
    const pinHash = await bcrypt.hash(pin, 10);

    await this.prisma.giftCard.update({
      where: { id: cardId },
      data: { pinHash, pinAttempts: 0 },
    });

    const recipient = card.recipientEmail || card.purchaserEmail;
    if (recipient) {
      await this.delivery.sendResetPinEmail({
        recipientEmail: recipient,
        code: card.code,
        pin,
      }).catch(err => {
        console.error(`Failed to send reset PIN email: ${err.message}`);
      });
    }

    return { pin };
  }

  async exportCsv(filters: { status?: string; type?: string; createdBy?: string }) {
    const { rows } = await this.listCards({
      ...filters,
      limit: 10000,
      offset: 0,
    });
    const header =
      "id,code,type,amount,status,pinProtected,pinLocked,issuedBy,purchaserName,purchaserEmail,purchasedByAccountId,redeemedByAccountId,createdAt,redeemedAt";
    const lines = rows.map((c) =>
      [
        c.id,
        c.code,
        c.type,
        c.amount,
        c.status,
        c.pinHash ? "Yes" : "No",
        c.pinAttempts >= 5 ? "LOCKED" : "No",
        c.isCustomerPurchase ? "Customer" : "Admin",
        c.purchaserName ?? "",
        c.purchaserEmail ?? "",
        c.purchasedByAccountId ?? "",
        c.redeemedByAccountId ?? "",
        c.createdAt.toISOString(),
        c.redeemedAt?.toISOString() ?? "",
      ].join(","),
    );
    return [header, ...lines].join("\n");
  }
}