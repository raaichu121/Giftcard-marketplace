import { Test, TestingModule } from "@nestjs/testing";
import { RedemptionService } from "./redemption.service";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { DeliveryService } from "../delivery/delivery.service";
import { GiftNowHttpException } from "../common/exceptions";
import { SettingsService } from "./settings.service";
import * as bcrypt from "bcryptjs";

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("$2a$10$mockedHashValue"),
  compare: jest.fn(),
}));

describe("RedemptionService", () => {
  let service: RedemptionService;
  let prisma: PrismaService;
  let wallet: WalletService;
  let delivery: DeliveryService;

  const mockPrismaService: any = {
    giftCard: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    otp: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockWalletService = {
    creditWallet: jest.fn(),
  };

  const mockDeliveryService = {
    sendRedeemOtpEmail: jest.fn(),
    sendRedeemOtpSms: jest.fn(),
    sendResetPinEmail: jest.fn(),
  };

  const mockSettingsService = {
    getSettings: jest.fn().mockResolvedValue({
      minAmount: 100,
      maxAmount: 100000,
      enabledTypes: ["DIGITAL", "PHYSICAL", "CORPORATE_BULK"],
      enabledChannels: ["EMAIL", "SMS"],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedemptionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WalletService, useValue: mockWalletService },
        { provide: DeliveryService, useValue: mockDeliveryService },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compile();

    service = module.get<RedemptionService>(RedemptionService);
    prisma = module.get<PrismaService>(PrismaService);
    wallet = module.get<WalletService>(WalletService);
    delivery = module.get<DeliveryService>(DeliveryService);

    jest.clearAllMocks();
  });

  describe("generateUniqueCode", () => {
    it("should generate a code that is unique", async () => {
      mockPrismaService.giftCard.findUnique.mockResolvedValueOnce(null);
      const code = await service.generateUniqueCode();
      expect(code).toMatch(/^GN-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{8}$/);
    });

    it("should retry if code already exists", async () => {
      mockPrismaService.giftCard.findUnique
        .mockResolvedValueOnce({ id: "existing-card" }) // collision
        .mockResolvedValueOnce(null); // success

      const code = await service.generateUniqueCode();
      expect(code).toBeDefined();
      expect(prisma.giftCard.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe("sendRedeemOtp", () => {
    it("should return requiresOtp false if card is not customer purchased", async () => {
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      mockPrismaService.giftCard.findUnique.mockResolvedValue({
        id: "card-1",
        code: validFormatCode,
        status: "ACTIVE",
        isCustomerPurchase: false,
      });

      const res = await service.sendRedeemOtp(validFormatCode);
      expect(res.requiresOtp).toBe(false);
    });

    it("should generate, save OTP, and send email if customer purchased", async () => {
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      mockPrismaService.giftCard.findUnique.mockResolvedValue({
        id: "card-1",
        code: validFormatCode,
        status: "ACTIVE",
        isCustomerPurchase: true,
        recipientEmail: "recipient@example.com",
        amount: 1000,
      });

      mockPrismaService.otp.create.mockResolvedValue({});
      mockDeliveryService.sendRedeemOtpEmail.mockResolvedValue({});

      const res = await service.sendRedeemOtp(validFormatCode);
      expect(res.requiresOtp).toBe(true);
      expect(res.recipientEmail).toBe("r***t@example.com");
      expect(prisma.otp.create).toHaveBeenCalled();
      expect(delivery.sendRedeemOtpEmail).toHaveBeenCalled();
    });
  });

  describe("redeemCode", () => {
    it("should throw exception for invalid claim code format", async () => {
      await expect(service.redeemCode("invalid-format", "123456", "user-1")).rejects.toThrow(GiftNowHttpException);
    });

    it("should throw exception if card does not exist", async () => {
      mockPrismaService.giftCard.findUnique.mockResolvedValue(null);
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      await expect(service.redeemCode(validFormatCode, "123456", "user-1")).rejects.toThrow(GiftNowHttpException);
    });

    it("should throw if card is already redeemed", async () => {
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      mockPrismaService.giftCard.findUnique.mockResolvedValue({
        id: "card-1",
        code: validFormatCode,
        status: "FULLY_REDEEMED",
      });

      await expect(service.redeemCode(validFormatCode, "123456", "user-1")).rejects.toThrow("GIFT_CARD_ALREADY_REDEEMED");
    });

    it("should throw if card is cancelled", async () => {
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      mockPrismaService.giftCard.findUnique.mockResolvedValue({
        id: "card-1",
        code: validFormatCode,
        status: "CANCELLED",
      });

      await expect(service.redeemCode(validFormatCode, "123456", "user-1")).rejects.toThrow("GIFT_CARD_CANCELLED");
    });

    it("should redeem admin card with valid PIN", async () => {
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      const card = {
        id: "card-1",
        code: validFormatCode,
        status: "ACTIVE",
        amount: 1000,
        pinHash: "$2a$10$hashedPin",
        pinAttempts: 0,
        isCustomerPurchase: false,
      };

      mockPrismaService.giftCard.findUnique.mockResolvedValue(card);
      mockPrismaService.giftCard.update.mockResolvedValue({ ...card, status: "FULLY_REDEEMED" });
      mockWalletService.creditWallet.mockResolvedValue({ balance: 1500 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await service.redeemCode(validFormatCode, "123456", "user-1");
      expect(prisma.giftCard.updateMany).toHaveBeenCalled();
      expect(wallet.creditWallet).toHaveBeenCalled();
      expect(res.walletBalance).toBe(1500);
      expect(res.credited).toBe(1000);
    });

    it("should throw INVALID_PIN for wrong PIN on admin card", async () => {
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      const card = {
        id: "card-1",
        code: validFormatCode,
        status: "ACTIVE",
        amount: 1000,
        pinHash: "$2a$10$hashedPin",
        pinAttempts: 0,
        isCustomerPurchase: false,
      };

      mockPrismaService.giftCard.findUnique.mockResolvedValue(card);
      mockPrismaService.giftCard.update.mockResolvedValue(card);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.redeemCode(validFormatCode, "000000", "user-1")).rejects.toThrow("Incorrect PIN");
      expect(prisma.giftCard.update).toHaveBeenCalledWith({
        where: { id: "card-1" },
        data: { pinAttempts: { increment: 1 } },
      });
    });

    it("should throw INVALID_PIN when no PIN provided for PIN-protected admin card", async () => {
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      const card = {
        id: "card-1",
        code: validFormatCode,
        status: "ACTIVE",
        amount: 1000,
        pinHash: "$2a$10$hashedPin",
        pinAttempts: 0,
        isCustomerPurchase: false,
      };

      mockPrismaService.giftCard.findUnique.mockResolvedValue(card);

      await expect(service.redeemCode(validFormatCode, undefined, "user-1")).rejects.toThrow("Security PIN is required");
    });

    it("should redeem customer card with valid OTP", async () => {
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      const card = {
        id: "card-1",
        code: validFormatCode,
        status: "ACTIVE",
        amount: 1000,
        pinAttempts: 0,
        isCustomerPurchase: true,
        recipientEmail: "recipient@example.com",
      };

      mockPrismaService.giftCard.findUnique.mockResolvedValue(card);
      mockPrismaService.giftCard.update.mockResolvedValue({ ...card, status: "FULLY_REDEEMED" });
      mockPrismaService.otp.findFirst.mockResolvedValue({
        id: "otp-1",
        code: "123456",
        expiresAt: new Date(Date.now() + 50000),
      });
      mockWalletService.creditWallet.mockResolvedValue({ balance: 2000 });

      const res = await service.redeemCode(validFormatCode, undefined, "user-1", "123456");
      expect(prisma.giftCard.updateMany).toHaveBeenCalled();
      expect(wallet.creditWallet).toHaveBeenCalled();
      expect(res.walletBalance).toBe(2000);
      expect(res.credited).toBe(1000);
    });

    it("should throw INVALID_PIN when OTP code is wrong or expired for customer card", async () => {
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      const card = {
        id: "card-1",
        code: validFormatCode,
        status: "ACTIVE",
        amount: 1000,
        pinAttempts: 0,
        isCustomerPurchase: true,
        recipientEmail: "recipient@example.com",
      };

      mockPrismaService.giftCard.findUnique.mockResolvedValue(card);
      mockPrismaService.giftCard.update.mockResolvedValue(card);
      mockPrismaService.otp.findFirst.mockResolvedValue(null);

      await expect(service.redeemCode(validFormatCode, undefined, "user-1", "wrong")).rejects.toThrow("Invalid or expired verification code");
    });

    it("should throw INVALID_PIN when OTP is missing for customer card", async () => {
      const validFormatCode = "GN-ABCD-EFGH-JKLM-NPQRSTVW";
      const card = {
        id: "card-1",
        code: validFormatCode,
        status: "ACTIVE",
        amount: 1000,
        pinAttempts: 0,
        isCustomerPurchase: true,
        recipientEmail: "recipient@example.com",
      };

      mockPrismaService.giftCard.findUnique.mockResolvedValue(card);

      await expect(service.redeemCode(validFormatCode, undefined, "user-1")).rejects.toThrow("OTP code is required");
    });
  });
});