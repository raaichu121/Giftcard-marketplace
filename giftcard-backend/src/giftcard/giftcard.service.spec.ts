import { Test, TestingModule } from "@nestjs/testing";
import { GiftcardService } from "./giftcard.service";
import { PrismaService } from "../prisma/prisma.service";
import { RedemptionService } from "./redemption.service";
import { DeliveryService } from "../delivery/delivery.service";
import { WalletService } from "../wallet/wallet.service";
import { SettingsService } from "./settings.service";
import { GiftNowHttpException } from "../common/exceptions";
import * as bcrypt from "bcryptjs";

// Mock bcrypt to avoid slow hashing in tests
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("$2a$10$mockedHashValue"),
  compare: jest.fn().mockResolvedValue(true),
}));

describe("GiftcardService", () => {
  let service: GiftcardService;
  let prisma: PrismaService;
  let redemption: RedemptionService;
  let delivery: DeliveryService;
  let wallet: WalletService;

  const mockPrismaService: any = {
    giftCard: {
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      update: jest.fn(),
    },
    giftCardBatch: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    giftCardWallet: {
      aggregate: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockRedemptionService = {
    generateUniqueCode: jest.fn().mockResolvedValue("GN-ABCD-EFGH-IJKL-MNOP"),
  };

  const mockDeliveryService = {
    attachQrCode: jest.fn().mockResolvedValue("data:image/png;base64,mockqr"),
    sendDigitalGiftEmail: jest.fn(),
    sendDigitalGiftSms: jest.fn(),
    sendPurchaseConfirmation: jest.fn(),
    sendBulkGiftCsvEmail: jest.fn(),
  };

  const mockSettingsService = {
    getSettings: jest.fn().mockResolvedValue({
      minAmount: 100,
      maxAmount: 100000,
      enabledTypes: ["DIGITAL", "PHYSICAL", "CORPORATE_BULK"],
      enabledChannels: ["EMAIL", "SMS"],
    }),
  };

  // Mock generateSecurityPin for deterministic tests
  jest.mock("../common/utils/code-generator", () => ({
    ...jest.requireActual("../common/utils/code-generator"),
    generateSecurityPin: jest.fn().mockReturnValue("123456"),
  }));

  const mockWalletService = {
    adminCancelDebit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiftcardService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedemptionService, useValue: mockRedemptionService },
        { provide: DeliveryService, useValue: mockDeliveryService },
        { provide: WalletService, useValue: mockWalletService },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compile();

    service = module.get<GiftcardService>(GiftcardService);
    prisma = module.get<PrismaService>(PrismaService);
    redemption = module.get<RedemptionService>(RedemptionService);
    delivery = module.get<DeliveryService>(DeliveryService);
    wallet = module.get<WalletService>(WalletService);

    jest.clearAllMocks();
  });

  describe("purchase", () => {
    it("should throw error for invalid amount", async () => {
      await expect(
        service.purchase({
          type: "DIGITAL",
          amount: 50, // invalid, min is 100
          purchasedByAccountId: "user-1",
          purchaserName: "User",
          purchaserEmail: "user@test.com",
        }),
      ).rejects.toThrow(GiftNowHttpException);
    });

    it("should purchase and send digital email for DIGITAL gift card", async () => {
      const cardData = {
        id: "card-1",
        code: "GN-ABCD-EFGH-IJKL-MNOP",
        amount: 500,
        type: "DIGITAL",
        status: "ACTIVE",
        qrCode: "data:image/png;base64,mockqr",
        recipientEmail: "recipient@test.com",
        deliveryChannel: "EMAIL",
      };

      mockPrismaService.giftCard.create.mockResolvedValue(cardData);
      mockPrismaService.giftCard.findUniqueOrThrow.mockResolvedValue(cardData);

      const res = await service.purchase({
        type: "DIGITAL",
        amount: 500,
        recipientEmail: "recipient@test.com",
        personalMessage: "Happy Birthday",
        purchasedByAccountId: "user-1",
        purchaserName: "User",
        purchaserEmail: "user@test.com",
      });

      expect(prisma.giftCard.create).toHaveBeenCalled();
      expect(delivery.sendDigitalGiftEmail).toHaveBeenCalled();
      expect(delivery.sendPurchaseConfirmation).toHaveBeenCalled();
      expect(res.code).toBe(cardData.code);
    });

    it("should throw error for DIGITAL gift card missing recipientEmail", async () => {
      await expect(
        service.purchase({
          type: "DIGITAL",
          amount: 500,
          purchasedByAccountId: "user-1",
          purchaserName: "User",
          purchaserEmail: "user@test.com",
        }),
      ).rejects.toThrow("recipientEmail is required for digital gift cards delivered via email");
    });

    it("should purchase and send bulk CSV email for CORPORATE_BULK gift cards", async () => {
      const cardData = {
        id: "card-bulk-1",
        code: "GN-ABCD-EFGH-IJKL-MNOP",
        amount: 500,
        type: "CORPORATE_BULK",
        status: "ACTIVE",
        createdAt: new Date(),
      };

      mockPrismaService.giftCard.create.mockResolvedValue(cardData);
      mockPrismaService.giftCard.findUniqueOrThrow.mockResolvedValue(cardData);

      const res = await service.purchase({
        type: "CORPORATE_BULK",
        amount: 500,
        quantity: 10,
        recipientEmail: "corporate-delivery@test.com",
        purchasedByAccountId: "user-1",
        purchaserName: "Corporate Buyer",
        purchaserEmail: "buyer@test.com",
      });

      expect(prisma.giftCard.create).toHaveBeenCalledTimes(10);
      expect(delivery.sendBulkGiftCsvEmail).toHaveBeenCalled();
      expect(delivery.sendPurchaseConfirmation).toHaveBeenCalled();
      expect(res.cards).toHaveLength(10);
      expect(res.cards![0].amount).toBe(500);
    });
  });

  describe("cancelCard", () => {
    it("should throw if card is not found", async () => {
      mockPrismaService.giftCard.findUnique.mockResolvedValue(null);
      await expect(service.cancelCard("card-none", "admin-1")).rejects.toThrow(GiftNowHttpException);
    });

    it("should cancel card and refund wallet if status was FULLY_REDEEMED", async () => {
      const redeemedCard = {
        id: "card-red",
        status: "FULLY_REDEEMED",
        amount: 1000,
        redeemedByAccountId: "customer-1",
      };

      mockPrismaService.giftCard.findUnique.mockResolvedValue(redeemedCard);
      mockPrismaService.giftCard.update.mockResolvedValue({
        ...redeemedCard,
        status: "CANCELLED",
      });

      const res = await service.cancelCard("card-red", "admin-1");
      expect(wallet.adminCancelDebit).toHaveBeenCalledWith("customer-1", 1000, "admin-1", "card-red");
      expect(res.status).toBe("CANCELLED");
    });
  });

  describe("getAnalytics", () => {
    it("should compute and return analytics metrics", async () => {
      mockPrismaService.giftCard.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4) // redeemed
        .mockResolvedValueOnce(6); // active

      mockPrismaService.giftCard.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 5000 } }) // total sum
        .mockResolvedValueOnce({ _avg: { amount: 500 } }); // avg

      mockPrismaService.giftCardWallet.aggregate.mockResolvedValueOnce({
        _sum: { balance: 2500 },
      });

      const analytics = await service.getAnalytics();
      expect(analytics.totalCardsIssued).toBe(10);
      expect(analytics.totalValueIssued).toBe(5000);
      expect(analytics.totalRedeemedCount).toBe(4);
      expect(analytics.activeCardsCount).toBe(6);
      expect(analytics.outstandingWalletBalances).toBe(2500);
      expect(analytics.redemptionRate).toBe("40.0%");
    });
  });
});