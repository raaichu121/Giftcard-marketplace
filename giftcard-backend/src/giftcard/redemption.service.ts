import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { DeliveryService } from "../delivery/delivery.service";
import { SettingsService } from "./settings.service";
import {
  generateGiftNowCode,
  isValidGiftNowCodeFormat,
  normalizeGiftNowCode,
} from "../common/utils/code-generator";
import { GiftNowHttpException } from "../common/exceptions";
import { toNumber, MAX_PIN_ATTEMPTS } from "../common/constants";

@Injectable()
export class RedemptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly delivery: DeliveryService,
    private readonly settings: SettingsService,
  ) {}

  private jitter(): Promise<void> {
    const ms = 100 + Math.floor(Math.random() * 200);
    return new Promise((r) => setTimeout(r, ms));
  }

  async generateUniqueCode(maxAttempts = 5): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const code = generateGiftNowCode();
      const exists = await this.prisma.giftCard.findUnique({
        where: { code },
      });
      if (!exists) return code;
    }
    throw new Error("Failed to generate unique gift card code");
  }

  async sendRedeemOtp(
    code: string,
    channel?: string,
  ): Promise<{
    requiresOtp: boolean;
    recipientEmail?: string;
    recipientPhone?: string;
    requiresChannelSelection?: boolean;
  }> {
    const normalized = normalizeGiftNowCode(code);
    if (!isValidGiftNowCodeFormat(normalized)) {
      throw new GiftNowHttpException("GIFT_CARD_NOT_FOUND");
    }

    const card = await this.prisma.giftCard.findUnique({
      where: { code: normalized },
    });

    if (!card) {
      throw new GiftNowHttpException("GIFT_CARD_NOT_FOUND");
    }
    if (card.status === "FULLY_REDEEMED") {
      throw new GiftNowHttpException("GIFT_CARD_ALREADY_REDEEMED");
    }
    if (card.status === "CANCELLED") {
      throw new GiftNowHttpException("GIFT_CARD_CANCELLED");
    }

    // OTP is only required for customer-purchased gift cards
    if (!card.isCustomerPurchase) {
      return { requiresOtp: false };
    }

    // Use the card's delivery channel to determine which contact info is relevant for OTP.
    // For SMS-only cards, don't fall back to purchaserEmail — OTP should go to the phone.
    const cardDeliveryChannel = (card as any).deliveryChannel || "EMAIL";
    const recipientEmail =
      cardDeliveryChannel === "SMS"
        ? card.recipientEmail   // Only use explicit recipientEmail, no purchaserEmail fallback
        : card.recipientEmail || card.purchaserEmail;
    const recipientPhone = card.recipientPhone;

    if (!recipientEmail && !recipientPhone) {
      throw new GiftNowHttpException(
        "GIFT_CARD_NOT_FOUND",
        "This card does not have an associated email address or phone number to receive OTP.",
      );
    }

    // Helper functions for masking
    const maskEmail = (emailStr: string) => {
      const atIndex = emailStr.indexOf("@");
      if (atIndex > 1) {
        const parts = emailStr.split("@");
        const name = parts[0];
        const domain = parts[1];
        if (name.length > 2) {
          return `${name[0]}***${name[name.length - 1]}@${domain}`;
        } else {
          return `${name[0]}***@${domain}`;
        }
      }
      return emailStr;
    };

    const maskPhone = (ph: string) => {
      if (ph.length <= 5) return ph;
      const prefix = ph.substring(0, ph.startsWith("+") ? 7 : 5);
      const suffix = ph.substring(ph.length - 2);
      const maskLength = Math.max(3, ph.length - prefix.length - suffix.length);
      return `${prefix}${"*".repeat(maskLength)}${suffix}`;
    };

    const settings = await this.settings.getSettings();
    const enabledChannels = settings.enabledChannels || ["EMAIL", "SMS"];

    const emailAvailable = !!recipientEmail && enabledChannels.includes("EMAIL");
    const phoneAvailable = !!recipientPhone && enabledChannels.includes("SMS");

    if (!emailAvailable && !phoneAvailable) {
      throw new GiftNowHttpException(
        "CHANNEL_DISABLED",
        "Verification delivery channels are currently disabled by the administrator.",
      );
    }

    // If both channels are available and channel hasn't been chosen yet
    if (emailAvailable && phoneAvailable && !channel) {
      return {
        requiresOtp: true,
        requiresChannelSelection: true,
        recipientEmail: maskEmail(recipientEmail),
        recipientPhone: maskPhone(recipientPhone),
      };
    }

    // Determine target channel to send.
    // Default to the card's original delivery channel when no explicit choice is made.
    let chosenChannel: string;
    if (channel) {
      chosenChannel = channel;
    } else if (cardDeliveryChannel === "SMS" && phoneAvailable) {
      chosenChannel = "SMS";
    } else if (cardDeliveryChannel === "EMAIL" && emailAvailable) {
      chosenChannel = "EMAIL";
    } else {
      // Fallback: use whichever is available
      chosenChannel = phoneAvailable ? "SMS" : "EMAIL";
    }

    if (!enabledChannels.includes(chosenChannel)) {
      throw new GiftNowHttpException(
        "CHANNEL_DISABLED",
        `The chosen verification channel (${chosenChannel}) is currently disabled.`,
      );
    }

    // Generate a 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    if (chosenChannel === "SMS" && recipientPhone) {
      // Create OTP entry with phone
      await this.prisma.otp.create({
        data: {
          phone: recipientPhone,
          code: otpCode,
          expiresAt,
        },
      });

      // Send the OTP SMS
      await this.delivery.sendRedeemOtpSms({
        recipientPhone,
        otp: otpCode,
        code: card.code,
        amount: toNumber(card.amount),
      });

      return {
        requiresOtp: true,
        recipientPhone: maskPhone(recipientPhone),
      };
    } else {
      // Default to Email
      const emailTarget = recipientEmail || card.purchaserEmail || "";
      await this.prisma.otp.create({
        data: {
          email: emailTarget.toLowerCase(),
          code: otpCode,
          expiresAt,
        },
      });

      // Send the OTP email
      await this.delivery.sendRedeemOtpEmail({
        recipientEmail: emailTarget,
        code: card.code,
        otp: otpCode,
        amount: toNumber(card.amount),
      });

      return {
        requiresOtp: true,
        recipientEmail: maskEmail(emailTarget),
      };
    }
  }

  async redeemCode(code: string, pin: string | undefined, accountId: string, otp?: string) {
    const normalized = normalizeGiftNowCode(code);
    if (!isValidGiftNowCodeFormat(normalized)) {
      await this.jitter();
      throw new GiftNowHttpException("GIFT_CARD_NOT_FOUND");
    }

    // ── Step 1: Look up the card and validate PIN/OTP OUTSIDE the transaction ──
    // This ensures pinAttempts increments are committed even when we throw.
    const card = await this.prisma.giftCard.findUnique({
      where: { code: normalized },
    });

    if (!card) {
      await this.jitter();
      throw new GiftNowHttpException("GIFT_CARD_NOT_FOUND");
    }
    if (card.status === "FULLY_REDEEMED") {
      throw new GiftNowHttpException("GIFT_CARD_ALREADY_REDEEMED");
    }
    if (card.status === "CANCELLED") {
      throw new GiftNowHttpException("GIFT_CARD_CANCELLED");
    }

    if (card.isCustomerPurchase) {
      // Must use OTP verification flow
      if (!otp) {
        throw new GiftNowHttpException(
          "INVALID_PIN",
          "OTP code is required to redeem this card.",
        );
      }

      const recipient = card.recipientEmail || card.purchaserEmail;
      if (!recipient && !card.recipientPhone) {
        throw new GiftNowHttpException(
          "GIFT_CARD_NOT_FOUND",
          "No recipient contact info associated with this card.",
        );
      }

      if (card.pinAttempts >= MAX_PIN_ATTEMPTS) {
        throw new GiftNowHttpException(
          "CARD_PIN_LOCKED",
          "This card has been locked due to too many failed attempts. Please contact support.",
        );
      }

      const conditions: any[] = [];
      if (recipient) {
        conditions.push({ email: recipient.toLowerCase(), code: otp });
      }
      if (card.recipientPhone) {
        conditions.push({ phone: card.recipientPhone, code: otp });
      }

      const latestOtp = await this.prisma.otp.findFirst({
        where: {
          OR: conditions,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!latestOtp || new Date() > latestOtp.expiresAt) {
        // Increment attempts on incorrect/expired OTP
        const updated = await this.prisma.giftCard.update({
          where: { id: card.id },
          data: { pinAttempts: { increment: 1 } },
        });

        const remaining = MAX_PIN_ATTEMPTS - updated.pinAttempts;
        if (remaining <= 0) {
          throw new GiftNowHttpException(
            "CARD_PIN_LOCKED",
            "This card has been locked due to too many failed attempts. Please contact support.",
          );
        }

        throw new GiftNowHttpException(
          "INVALID_PIN",
          `Invalid or expired verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        );
      }

      // Valid OTP. Delete it so it cannot be reused.
      await this.prisma.otp.delete({ where: { id: latestOtp.id } }).catch(() => {});
    } else {
      // Legacy or Admin created card: verify static PIN
      if (card.pinHash) {
        if (card.pinAttempts >= MAX_PIN_ATTEMPTS) {
          throw new GiftNowHttpException(
            "CARD_PIN_LOCKED",
            "This card has been locked due to too many failed PIN attempts. Please contact support.",
          );
        }

        if (!pin) {
          throw new GiftNowHttpException(
            "INVALID_PIN",
            "Security PIN is required to redeem this card.",
          );
        }

        const pinValid = await bcrypt.compare(pin, card.pinHash);
        if (!pinValid) {
          // Increment OUTSIDE transaction so it persists even though we throw
          const updated = await this.prisma.giftCard.update({
            where: { id: card.id },
            data: { pinAttempts: { increment: 1 } },
          });

          const remaining = MAX_PIN_ATTEMPTS - updated.pinAttempts;
          if (remaining <= 0) {
            throw new GiftNowHttpException(
              "CARD_PIN_LOCKED",
              "This card has been locked due to too many failed PIN attempts. Please contact support.",
            );
          }

          throw new GiftNowHttpException(
            "INVALID_PIN",
            `Incorrect PIN. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
          );
        }
      }
    }

    // ── Step 2: PIN/OTP is valid (or no PIN needed) — redeem inside a transaction ──
    return this.prisma.$transaction(async (tx) => {
      // Re-check status under transaction to prevent race conditions
      const updateResult = await tx.giftCard.updateMany({
        where: { id: card.id, status: "ACTIVE" },
        data: {
          status: "FULLY_REDEEMED",
          redeemedByAccountId: accountId,
          redeemedAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        throw new GiftNowHttpException("GIFT_CARD_ALREADY_REDEEMED");
      }

      const amount = toNumber(card.amount);

      const result = await this.wallet.creditWallet(
        accountId,
        amount,
        accountId,
        card.id,
        "CREDIT",
        tx,
      );

      return {
        walletBalance: result.balance,
        credited: amount,
        giftCardId: card.id,
      };
    });
  }
}