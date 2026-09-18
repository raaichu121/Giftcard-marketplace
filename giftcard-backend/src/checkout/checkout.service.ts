import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { GiftNowHttpException } from "../common/exceptions";

export interface CheckoutCalculation {
  itemTotal: number;
  couponDiscount: number;
  subtotalAfterCoupon: number;
  walletUsed: number;
  walletRemaining: number;
  amountToPay: number;
  walletBalanceAfter: number;
}

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
  ) {}

  /**
   * Calculate checkout totals with coupon and wallet balance
   * Order: itemTotal → coupon applied → wallet applied
   */
  async calculateCheckout(params: {
    accountId: string;
    itemTotal: number;
    couponCode?: string;
    useWallet?: boolean;
  }): Promise<CheckoutCalculation> {
    // Validate input
    if (params.itemTotal <= 0) {
      throw new GiftNowHttpException(
        "INVALID_AMOUNT",
        "Item total must be positive",
      );
    }

    // Get coupon discount (if applicable)
    let couponDiscount = 0;
    if (params.couponCode) {
      // This would integrate with an existing coupon system
      // For now, placeholder for coupon logic
      couponDiscount = await this.getCouponDiscount(
        params.couponCode,
        params.itemTotal,
      );
    }

    const subtotalAfterCoupon = Math.max(0, params.itemTotal - couponDiscount);

    // Get wallet balance
    const walletBalance = await this.wallet.getBalance(params.accountId);
    const currentBalance = parseFloat(walletBalance.balance.toString());

    // Calculate wallet usage
    let walletUsed = 0;
    let amountToPay = subtotalAfterCoupon;
    let walletRemaining = currentBalance;

    if (params.useWallet !== false && currentBalance > 0) {
      walletUsed = Math.min(currentBalance, subtotalAfterCoupon);
      amountToPay = subtotalAfterCoupon - walletUsed;
      walletRemaining = currentBalance - walletUsed;
    }

    return {
      itemTotal: params.itemTotal,
      couponDiscount,
      subtotalAfterCoupon,
      walletUsed,
      walletRemaining,
      amountToPay,
      walletBalanceAfter: walletRemaining,
    };
  }

  /**
   * Process checkout: debit wallet and create order entry
   * This should be called after payment is confirmed
   */
  async processCheckout(params: {
    accountId: string;
    orderId: string;
    itemTotal: number;
    couponCode?: string;
    walletAmount: number;
    paymentMethod: string;
  }): Promise<{ success: boolean; orderId: string }> {
    const calculation = await this.calculateCheckout({
      accountId: params.accountId,
      itemTotal: params.itemTotal,
      couponCode: params.couponCode,
      useWallet: params.walletAmount > 0,
    });

    // Validate wallet amount matches calculation
    if (
      Math.abs(params.walletAmount - calculation.walletUsed) > 0.01
    ) {
      throw new GiftNowHttpException(
        "INVALID_AMOUNT",
        "Wallet amount does not match calculation",
      );
    }

    // Debit wallet if wallet was used
    if (params.walletAmount > 0) {
      try {
        await this.wallet.debitWallet(
          params.accountId,
          params.walletAmount,
          params.accountId,
          params.orderId,
        );

        this.logger.log(
          `✅ Checkout processed - Order: ${params.orderId}, Wallet used: NPR ${params.walletAmount}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to process wallet debit for order ${params.orderId}:`,
          error instanceof Error ? error.message : String(error),
        );
        throw error;
      }
    }

    return {
      success: true,
      orderId: params.orderId,
    };
  }

  /**
   * Placeholder for coupon discount calculation
   * This should integrate with your existing coupon system
   */
  private async getCouponDiscount(
    couponCode: string,
    itemTotal: number,
  ): Promise<number> {
    // TODO: Integrate with coupon service
    // For now, return 0 (no discount)
    this.logger.debug(`Coupon ${couponCode} not yet integrated`);
    return 0;
  }
}