import { Test, TestingModule } from "@nestjs/testing";
import { CheckoutService } from "./checkout.service";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { GiftNowHttpException } from "../common/exceptions";

describe("CheckoutService", () => {
  let service: CheckoutService;
  let wallet: WalletService;

  const mockPrismaService = {};

  const mockWalletService = {
    getBalance: jest.fn(),
    debitWallet: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WalletService, useValue: mockWalletService },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    wallet = module.get<WalletService>(WalletService);

    jest.clearAllMocks();
  });

  describe("calculateCheckout", () => {
    it("should throw exception if itemTotal is zero or negative", async () => {
      await expect(
        service.calculateCheckout({
          accountId: "user-1",
          itemTotal: 0,
        }),
      ).rejects.toThrow(GiftNowHttpException);
    });

    it("should calculate correctly without using wallet", async () => {
      mockWalletService.getBalance.mockResolvedValue({ balance: 500 });
      const res = await service.calculateCheckout({
        accountId: "user-1",
        itemTotal: 1000,
        useWallet: false,
      });

      expect(res.itemTotal).toBe(1000);
      expect(res.walletUsed).toBe(0);
      expect(res.amountToPay).toBe(1000);
    });

    it("should use wallet up to the cart subtotal", async () => {
      mockWalletService.getBalance.mockResolvedValue({ balance: 300 });
      const res = await service.calculateCheckout({
        accountId: "user-1",
        itemTotal: 1000,
        useWallet: true,
      });

      expect(res.itemTotal).toBe(1000);
      expect(res.walletUsed).toBe(300);
      expect(res.amountToPay).toBe(700);
      expect(res.walletRemaining).toBe(0);
    });

    it("should cover full cart subtotal if wallet balance is greater than subtotal", async () => {
      mockWalletService.getBalance.mockResolvedValue({ balance: 1500 });
      const res = await service.calculateCheckout({
        accountId: "user-1",
        itemTotal: 1000,
        useWallet: true,
      });

      expect(res.itemTotal).toBe(1000);
      expect(res.walletUsed).toBe(1000);
      expect(res.amountToPay).toBe(0);
      expect(res.walletRemaining).toBe(500);
    });
  });

  describe("processCheckout", () => {
    it("should process checkout and debit wallet when wallet was used", async () => {
      mockWalletService.getBalance.mockResolvedValue({ balance: 500 });
      mockWalletService.debitWallet.mockResolvedValue({ debited: 500, balance: 0 });

      const res = await service.processCheckout({
        accountId: "user-1",
        orderId: "ord-1",
        itemTotal: 1000,
        walletAmount: 500,
        paymentMethod: "KHALTI",
      });

      expect(wallet.debitWallet).toHaveBeenCalledWith("user-1", 500, "user-1", "ord-1");
      expect(res.success).toBe(true);
      expect(res.orderId).toBe("ord-1");
    });

    it("should throw error if walletAmount does not match calculation", async () => {
      mockWalletService.getBalance.mockResolvedValue({ balance: 500 });
      await expect(
        service.processCheckout({
          accountId: "user-1",
          orderId: "ord-1",
          itemTotal: 1000,
          walletAmount: 100, // should be 500
          paymentMethod: "KHALTI",
        }),
      ).rejects.toThrow(GiftNowHttpException);
    });
  });
});