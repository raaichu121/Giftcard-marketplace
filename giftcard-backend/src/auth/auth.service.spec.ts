import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

// Mock google-auth-library
jest.mock("google-auth-library", () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            email: "google-test@gmail.com",
            sub: "google-sub-id",
            name: "Google User",
            picture: "https://google.com/avatar.png",
          }),
        }),
      };
    }),
  };
});

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  const mockPrismaService = {
    customer: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    admin: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mocked-jwt-token"),
  };

  const mockConfigService: any = {
    get: jest.fn((key: string): any => {
      if (key === "GOOGLE_CLIENT_ID") return "mock-client-id";
      if (key === "ALLOWED_ADMIN_EMAILS") return "google-test@gmail.com";
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe("loginWithGoogle", () => {
    it("should throw exception if Google Client ID is not configured", async () => {
      mockConfigService.get.mockReturnValueOnce(undefined);
      await expect(service.loginWithGoogle("token")).rejects.toThrow(UnauthorizedException);
    });

    it("should create new admin if no admin exists with email", async () => {
      mockPrismaService.admin.findFirst.mockResolvedValue(null);
      mockPrismaService.admin.create.mockResolvedValue({
        id: "admin-new",
        email: "google-test@gmail.com",
        username: "google-test",
        role: "ADMIN",
      });

      const res = await service.loginWithGoogle("valid-token");
      expect(prisma.admin.create).toHaveBeenCalled();
      expect(res.user.id).toBe("admin-new");
      expect(res.token).toBe("mocked-jwt-token");
    });

    it("should update lastLogin of existing admin user", async () => {
      mockPrismaService.admin.findFirst.mockResolvedValue({
        id: "admin-existing",
        email: "google-test@gmail.com",
        username: "google-test",
        role: "ADMIN",
      });
      mockPrismaService.admin.update.mockResolvedValue({
        id: "admin-existing",
        email: "google-test@gmail.com",
        username: "google-test",
        role: "ADMIN",
      });

      const res = await service.loginWithGoogle("valid-token");
      expect(prisma.admin.update).toHaveBeenCalled();
      expect(res.user.id).toBe("admin-existing");
    });
  });

  describe("login", () => {
    it("should throw if admin is not found or inactive", async () => {
      mockPrismaService.admin.findFirst.mockResolvedValue(null);
      await expect(service.login("admin@test.com", "pass")).rejects.toThrow(UnauthorizedException);
    });

    it("should authenticate and update lastLogin if password is correct", async () => {
      const hashed = await bcrypt.hash("pass123", 10);
      mockPrismaService.admin.findFirst.mockResolvedValue({
        id: "admin-id",
        email: "admin@test.com",
        password: hashed,
        role: "ADMIN",
      });
      mockPrismaService.admin.update.mockResolvedValue({});

      const res = await service.login("admin@test.com", "pass123");
      expect(prisma.admin.update).toHaveBeenCalledWith({
        where: { id: "admin-id" },
        data: expect.any(Object),
      });
      expect(res.user.id).toBe("admin-id");
      expect(res.user.role).toBe("ADMIN");
    });

    it("should throw if password is incorrect", async () => {
      const hashed = await bcrypt.hash("pass123", 10);
      mockPrismaService.admin.findFirst.mockResolvedValue({
        id: "admin-id",
        email: "admin@test.com",
        password: hashed,
      });

      await expect(service.login("admin@test.com", "wrongpass")).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("getMe", () => {
    it("should fetch customer profile", async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({
        id: "cust-1",
        email: "cust@test.com",
        name: "Cust Name",
        avatarUrl: null,
      });

      const res = await service.getMe("cust-1", "CUSTOMER");
      expect(res.email).toBe("cust@test.com");
      expect(res.role).toBe("CUSTOMER");
    });

    it("should return fallback object if user is not found in admin or customer", async () => {
      mockPrismaService.admin.findUnique.mockResolvedValue(null);
      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      const res = await service.getMe("cust-none", "CUSTOMER");
      expect(res).toEqual({ id: "cust-none", role: "CUSTOMER" });
    });

    it("should fetch admin profile", async () => {
      mockPrismaService.admin.findUnique.mockResolvedValue({
        id: "admin-1",
        email: "admin@test.com",
        role: "ADMIN",
        username: "admin1",
      });

      const res = await service.getMe("admin-1", "ADMIN");
      expect(res.email).toBe("admin@test.com");
      expect(res.role).toBe("ADMIN");
    });
  });
});