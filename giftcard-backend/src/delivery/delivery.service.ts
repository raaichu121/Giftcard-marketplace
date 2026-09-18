import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import * as QRCode from "qrcode";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue("email-queue") private readonly emailQueue: Queue,
    @InjectQueue("print-queue") private readonly printQueue: Queue,
    @InjectQueue("sms-queue") private readonly smsQueue: Queue,
  ) {}

  async attachQrCode(cardId: string, code: string): Promise<string> {
    const qr = await QRCode.toDataURL(code);
    await this.prisma.giftCard.update({
      where: { id: cardId },
      data: { qrCode: qr },
    });
    return qr;
  }

  async sendDigitalGiftEmail(params: {
    recipientEmail: string;
    code: string;
    pin: string;
    amount: number;
    senderName: string;
    personalMessage?: string;
    qrDataUrl?: string;
    isCustomerPurchase?: boolean;
  }) {
    const messageBlock = params.personalMessage
      ? `<p style="font-style:italic;color:#555;">"${params.personalMessage}"</p>`
      : "";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;padding:20px;border-radius:8px;">
        <h1 style="color:#1e3a5f;text-align:center;">🎁 You've received a GiftNow gift card!</h1>
        <p style="font-size:16px;"><strong>${params.senderName}</strong> sent you <strong style="color:#059669;font-size:18px;">NPR ${params.amount.toLocaleString("en-NP")}</strong>.</p>
        ${messageBlock}
        <div style="background:#f0f9ff;padding:20px;border-radius:8px;margin:20px 0;text-align:center;">
          <p style="color:#666;margin:0 0 10px 0;">Your gift card code:</p>
          <p style="font-family:monospace;font-size:20px;font-weight:bold;margin:10px 0;letter-spacing:2px;color:#1e3a5f;">${params.code}</p>
          ${!params.isCustomerPurchase ? `
          <p style="color:#666;margin:10px 0 0 0;font-size:13px;">Security PIN:</p>
          <p style="font-family:monospace;font-size:22px;font-weight:bold;margin:5px 0;letter-spacing:4px;color:#059669;">${params.pin}</p>
          ` : ""}
        </div>
        ${params.qrDataUrl ? `<div style="text-align:center;"><img src="${params.qrDataUrl}" width="160" height="160" alt="QR Code" /></div>` : ""}
        <div style="margin-top:30px;border-top:1px solid #ddd;padding-top:20px;">
          <h3 style="color:#1e3a5f;">How to redeem:</h3>
          <ol style="color:#555;">
            <li>Sign in to your account</li>
            <li>Go to <strong>My Account → BuyNow Wallet → Redeem a Card</strong></li>
            ${params.isCustomerPurchase ? `
            <li>Enter your code. You will receive an OTP code to verify your redemption.</li>
            ` : `
            <li>Enter your code and 6-digit security PIN above</li>
            `}
            <li>The amount will be added to your wallet instantly</li>
            <li>Use it at checkout — no expiry!</li>
          </ol>
          ${!params.isCustomerPurchase ? `
          <p style="color:#ef4444;font-size:13px;margin-top:15px;"><strong>Keep your PIN safe!</strong> You'll need both the code and PIN to redeem. Do not share these with anyone you don't trust.</p>
          ` : ""}
        </div>
        <footer style="text-align:center;color:#999;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:20px;">
          <p>Questions? Email us at support@giftnow.com</p>
          <p style="margin-top:10px;">© 2026 Su Indra Groups Pvt. Ltd.</p>
        </footer>
      </div>
    `;

    try {
      await this.emailQueue.add(
        "send-gift-email",
        {
          to: params.recipientEmail,
          subject: `You've been gifted NPR ${params.amount} on GiftNow!`,
          html,
        },
        {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
        },
      );

      this.logger.log(
        `Digital gift email queued for ${params.recipientEmail} (code ${params.code})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue email for ${params.recipientEmail}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async sendPurchaseConfirmation(params: {
    purchaserEmail: string;
    code: string;
    pin: string;
    amount: number;
    type: string;
    recipientEmail?: string;
    csvContent?: string;
    isCustomerPurchase?: boolean;
  }) {
    const typeLabel =
      {
        DIGITAL: "🔗 Digital",
        PHYSICAL: "📮 Physical",
        CORPORATE_BULK: "🏢 Corporate Bulk",
      }[params.type] || params.type;

    const recipientInfo = params.recipientEmail
      ? `<p><strong>Recipient:</strong> ${params.recipientEmail}</p>`
      : "";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;padding:20px;border-radius:8px;">
        <h1 style="color:#1e3a5f;text-align:center;">GiftNow Purchase Confirmation</h1>
        <p style="font-size:16px;">Thank you for your purchase!</p>
        
        <div style="background:#f0f9ff;padding:20px;border-radius:8px;margin:20px 0;">
          <p><strong>Type:</strong> ${typeLabel}</p>
          <p><strong>Amount:</strong> NPR ${params.amount.toLocaleString("en-NP")}</p>
          <p><strong>Code:</strong> <span style="font-family:monospace;font-weight:bold;">${params.code}</span></p>
          ${!params.isCustomerPurchase ? `
          <p><strong>Security PIN:</strong> <span style="font-family:monospace;font-weight:bold;color:#059669;letter-spacing:2px;">${params.pin}</span></p>
          ` : ""}
          ${recipientInfo}
        </div>

        <p style="color:#666;font-size:14px;">The recipient will receive delivery confirmation shortly.</p>
        <footer style="text-align:center;color:#999;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:20px;">
          <p>© 2026 Su Indra Groups Pvt. Ltd. — GiftNow</p>
        </footer>
      </div>
    `;

    try {
      const jobData: Record<string, unknown> = {
        to: params.purchaserEmail,
        subject: "Your GiftNow purchase confirmation",
        html,
      };

      if (params.csvContent) {
        jobData.attachments = [
          {
            filename: `giftnow_bulk_codes_${Date.now()}.csv`,
            content: Buffer.from(params.csvContent, "utf-8"),
            contentType: "text/csv",
          },
        ];
      }

      await this.emailQueue.add(
        "send-confirmation-email",
        jobData,
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
        },
      );

      this.logger.log(
        `Purchase confirmation queued for ${params.purchaserEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue confirmation email:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async sendPhysicalCardPrintJob(params: {
    giftCardId: string;
    code: string;
    amount: number;
    recipientEmail: string;
    deliveryAddress: {
      fullName: string;
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  }) {
    try {
      await this.printQueue.add("print-physical-card", params, {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
      });

      this.logger.log(
        `Physical card print job queued for ${params.deliveryAddress.fullName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue print job:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async sendBulkGiftCsvEmail(params: {
    recipientEmail: string;
    purchaserName: string;
    amount: number;
    quantity: number;
    csvContent: string;
  }) {
    const totalAmount = params.amount * params.quantity;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;padding:20px;border-radius:8px;">
        <h1 style="color:#1e3a5f;text-align:center;">Corporate Bulk Gift Cards Delivery</h1>
        <p style="font-size:16px;">Hello,</p>
        <p style="font-size:16px;">Thank you for your bulk purchase. We have generated your gift cards as requested by <strong>${params.purchaserName}</strong>.</p>
        
        <div style="background:#f0f9ff;padding:20px;border-radius:8px;margin:20px 0;">
          <p style="margin:0 0 8px 0;"><strong>Total Quantity:</strong> ${params.quantity} cards</p>
          <p style="margin:0 0 8px 0;"><strong>Face Value:</strong> NPR ${params.amount.toLocaleString("en-NP")} per card</p>
          <p style="margin:0;font-size:18px;color:#059669;"><strong>Total Batch Value:</strong> NPR ${totalAmount.toLocaleString("en-NP")}</p>
        </div>

        <p style="font-size:14px;color:#ef4444;font-weight:bold;">Security Notice:</p>
        <p style="font-size:14px;color:#555;">Please find the attached CSV file containing all the active gift card codes. Treat this file with high security, as these codes can be redeemed immediately on the platform.</p>

        <div style="margin-top:30px;border-top:1px solid #ddd;padding-top:20px;">
          <h3 style="color:#1e3a5f;">How to distribute:</h3>
          <ul style="color:#555;padding-left:20px;line-height:1.6;">
            <li>Open the attached <code>giftcards_bulk_batch.csv</code> using Microsoft Excel, Google Sheets, or any text editor.</li>
            <li>Each row contains a unique code and its 6-digit security PIN.</li>
            <li>Distribute individual codes <strong>and PINs</strong> to your employees, clients, or recipients.</li>
            <li>Recipients can redeem their codes and PINs directly into their GiftNow Wallet.</li>
          </ul>
        </div>

        <footer style="text-align:center;color:#999;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:20px;">
          <p>Questions? Contact us at corporate@giftnow.com</p>
          <p style="margin-top:10px;">© 2026 Su Indra Groups Pvt. Ltd. — GiftNow</p>
        </footer>
      </div>
    `;

    try {
      await this.emailQueue.add(
        "send-bulk-csv-email",
        {
          to: params.recipientEmail,
          subject: `Your GiftNow Bulk Gift Cards - ${params.quantity} Cards`,
          html,
          attachments: [
            {
              filename: `giftcards_bulk_batch_${Date.now()}.csv`,
              content: Buffer.from(params.csvContent, "utf-8"),
              contentType: "text/csv",
            },
          ],
        },
        {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
        },
      );

      this.logger.log(
        `Bulk CSV email queued for ${params.recipientEmail} (${params.quantity} cards)`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue bulk CSV email for ${params.recipientEmail}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async sendRedeemOtpEmail(params: {
    recipientEmail: string;
    code: string;
    otp: string;
    amount: number;
  }) {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;padding:20px;border-radius:8px;">
        <h1 style="color:#1e3a5f;text-align:center;">GiftNow Redemption OTP</h1>
        <p style="font-size:16px;">You requested to redeem your GiftNow gift card worth <strong style="color:#059669;">NPR ${params.amount.toLocaleString("en-NP")}</strong>.</p>
        <p style="font-size:14px;color:#555;">Gift Card Code: <span style="font-family:monospace;font-weight:bold;">${params.code}</span></p>
        <div style="background:#f0f9ff;padding:20px;border-radius:8px;margin:20px 0;text-align:center;border:1px dashed #1e3a5f;">
          <p style="color:#666;margin:0 0 10px 0;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Your One-Time Verification Passcode:</p>
          <p style="font-family:monospace;font-size:32px;font-weight:bold;margin:0;letter-spacing:6px;color:#1e3a5f;">${params.otp}</p>
        </div>
        <p style="color:#ef4444;font-size:13px;font-weight:bold;">Security Notice:</p>
        <p style="color:#666;font-size:13px;">This OTP is valid for 5 minutes. Do not share this OTP with anyone. If you did not initiate this request, please ignore this email.</p>
        <footer style="text-align:center;color:#999;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:20px;">
          <p>Questions? Contact us at support@giftnow.com</p>
          <p>© 2026 Su Indra Groups Pvt. Ltd. — GiftNow</p>
        </footer>
      </div>
    `;

    try {
      await this.emailQueue.add(
        "send-redeem-otp-email",
        {
          to: params.recipientEmail,
          subject: `${params.otp} is your GiftNow redemption verification code`,
          html,
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
          removeOnComplete: true,
        },
      );
      this.logger.log(`Redeem OTP email queued for ${params.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to queue redeem OTP email: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async sendResetPinEmail(params: {
    recipientEmail: string;
    code: string;
    pin: string;
  }) {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;padding:20px;border-radius:8px;">
        <h1 style="color:#1e3a5f;text-align:center;">GiftNow PIN Reset Confirmation</h1>
        <p style="font-size:16px;">The security PIN for your GiftNow gift card has been reset.</p>
        <p style="font-size:14px;color:#555;">Gift Card Code: <span style="font-family:monospace;font-weight:bold;">${params.code}</span></p>
        <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0;text-align:center;border:1px solid #eee;">
          <p style="color:#666;margin:0 0 10px 0;font-size:13px;text-transform:uppercase;letter-spacing:1px;">New Security PIN:</p>
          <p style="font-family:monospace;font-size:28px;font-weight:bold;margin:0;letter-spacing:4px;color:#059669;">${params.pin}</p>
        </div>
        <p style="color:#ef4444;font-size:13px;font-weight:bold;">Keep your PIN safe!</p>
        <p style="color:#666;font-size:13px;">Use this PIN along with the card code to redeem it. Do not share this PIN with anyone.</p>
        <footer style="text-align:center;color:#999;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:20px;">
          <p>Questions? Contact us at support@giftnow.com</p>
          <p>© 2026 Su Indra Groups Pvt. Ltd. — GiftNow</p>
        </footer>
      </div>
    `;

    try {
      await this.emailQueue.add(
        "send-reset-pin-email",
        {
          to: params.recipientEmail,
          subject: `Your GiftNow security PIN has been reset`,
          html,
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
          removeOnComplete: true,
        },
      );
      this.logger.log(`Reset PIN email queued for ${params.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to queue reset PIN email: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async sendSms(to: string, message: string) {
    try {
      await this.smsQueue.add(
        "send-sms",
        { to, message },
        {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
        },
      );
      this.logger.log(`SMS job queued for ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to queue SMS for ${to}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async sendRedeemOtpSms(params: {
    recipientPhone: string;
    otp: string;
    code: string;
    amount: number;
  }) {
    const message = `Your GiftNow verification OTP code is: ${params.otp}. Valid for 5 minutes. Card value: NPR ${params.amount.toLocaleString("en-NP")}. Code: ${params.code}`;
    await this.sendSms(params.recipientPhone, message);
  }

  async sendDigitalGiftSms(params: {
    recipientPhone: string;
    code: string;
    pin: string;
    amount: number;
    senderName: string;
    personalMessage?: string;
    isCustomerPurchase?: boolean;
  }) {
    let message = `🎁 You've received a GiftNow gift card of NPR ${params.amount.toLocaleString("en-NP")} from ${params.senderName}! Code: ${params.code}.`;
    if (!params.isCustomerPurchase) {
      message += ` PIN: ${params.pin}.`;
    }
    if (params.personalMessage) {
      message += ` Message: "${params.personalMessage}"`;
    }
    message += ` Redeem at: http://localhost:3000/giftnow/redeem`;
    await this.sendSms(params.recipientPhone, message);
  }
}