import { Test, TestingModule } from "@nestjs/testing";
import { WalletService } from "./wallet.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "./audit.service";
import { GiftNowHttpException } from "../common/exceptions";

describe("WalletService", () => {
  let service: WalletService;
  let prisma: PrismaService;
  let audit: AuditService;

  const mockPrismaService: any = {
    giftCardWallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    giftCardAuditLog: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
    $queryRaw: jest.fn(),
  };

  const mockAuditService = {
    write: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  describe("getOrCreateWallet", () => {
    it("should return existing wallet if found", async () => {
      const wallet = { id: "w-1", accountId: "acc-1", balance: 500 };
      mockPrismaService.giftCardWallet.findUnique.mockResolvedValue(wallet);

      const res = await service.getOrCreateWallet("acc-1");
      expect(res).toBe(wallet);
      expect(prisma.giftCardWallet.create).not.toHaveBeenCalled();
    });

    it("should create new wallet if not found", async () => {
      mockPrismaService.giftCardWallet.findUnique.mockResolvedValue(null);
      const newWallet = { id: "w-2", accountId: "acc-2", balance: 0 };
      mockPrismaService.giftCardWallet.create.mockResolvedValue(newWallet);

      const res = await service.getOrCreateWallet("acc-2");
      expect(res).toBe(newWallet);
      expect(prisma.giftCardWallet.create).toHaveBeenCalled();
    });
  });

  describe("creditWallet", () => {
    it("should add funds to the wallet balance and write audit log", async () => {
      const wallet = { id: "w-1", accountId: "acc-1", balance: 500, totalCredited: 500 };
      mockPrismaService.$queryRaw.mockResolvedValue([wallet]);

      const res = await service.creditWallet("acc-1", 200, "operator-1", null, "CREDIT");
      expect(prisma.giftCardWallet.update).toHaveBeenCalledWith({
        where: { id: "w-1" },
        data: { balance: 700, totalCredited: 700 },
      });
      expect(audit.write).toHaveBeenCalled();
      expect(res.balance).toBe(700);
    });
  });

  describe("debitWallet", () => {
    it("should throw exception if wallet does not exist", async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);
      await expect(service.debitWallet("acc-none", 100, "user-1")).rejects.toThrow(GiftNowHttpException);
    });

    it("should deduct funds up to available balance and write audit log", async () => {
      const wallet = { id: "w-1", accountId: "acc-1", balance: 500, totalDebited: 100 };
      mockPrismaService.$queryRaw.mockResolvedValue([wallet]);

      const res = await service.debitWallet("acc-1", 200, "user-1", "order-123");
      expect(prisma.giftCardWallet.update).toHaveBeenCalledWith({
        where: { id: "w-1" },
        data: { balance: 300, totalDebited: 300 },
      });
      expect(audit.write).toHaveBeenCalled();
      expect(res.debited).toBe(200);
      expect(res.balance).toBe(300);
    });
  });
});
