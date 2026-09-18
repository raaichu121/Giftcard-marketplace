import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { GiftcardService } from "./giftcard.service";
import { RedemptionService } from "./redemption.service";
import { SettingsService } from "./settings.service";
import { PurchaseGiftCardDto } from "./dto/purchase-giftcard.dto";
import { PurchaseGuestGiftCardDto } from "./dto/purchase-guest-giftcard.dto";
import { RedeemGiftCardDto } from "./dto/redeem-giftcard.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RedeemRateLimitGuard } from "./redeem-rate-limit.guard";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Gift Cards")
@ApiBearerAuth()
@Controller("gift-cards")
export class GiftcardController {
  constructor(
    private readonly giftcards: GiftcardService,
    private readonly redemption: RedemptionService,
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  @Post("purchase-guest")
  @ApiOperation({ summary: "Guest purchase of a gift card (no login required)" })
  @ApiResponse({ status: 201, description: "Successfully purchased gift card(s) as guest" })
  async purchaseGuest(@Body() body: PurchaseGuestGiftCardDto) {
    return this.giftcards.purchase({
      type: body.type,
      amount: body.amount,
      recipientEmail: body.recipientEmail,
      recipientPhone: body.recipientPhone,
      deliveryChannel: body.deliveryChannel,
      personalMessage: body.personalMessage,
      deliveryAddress: body.deliveryAddress as Prisma.InputJsonValue | undefined,
      quantity: body.quantity,
      purchasedByAccountId: null,
      purchaserName: body.purchaserName,
      purchaserEmail: body.purchaserEmail,
      cardDesignId: body.cardDesignId,
    });
  }

  @Post("purchase")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER")
  @ApiOperation({ summary: "Purchase a digital or physical gift card" })
  @ApiResponse({ status: 201, description: "Successfully purchased gift card(s)" })
  async purchase(
    @Req() req: { user: JwtPayload },
    @Body() body: PurchaseGiftCardDto,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: req.user.userId },
    });
    if (!customer) throw new NotFoundException("Customer not found");

    return this.giftcards.purchase({
      type: body.type,
      amount: body.amount,
      recipientEmail: body.recipientEmail,
      recipientPhone: body.recipientPhone,
      deliveryChannel: body.deliveryChannel,
      personalMessage: body.personalMessage,
      deliveryAddress: body.deliveryAddress as Prisma.InputJsonValue | undefined,
      quantity: body.quantity,
      purchasedByAccountId: customer.id,
      purchaserName: customer.name,
      purchaserEmail: customer.email,
      cardDesignId: body.cardDesignId,
    });
  }

  @Post("redeem/send-otp")
  @UseGuards(JwtAuthGuard, RolesGuard, RedeemRateLimitGuard)
  @Roles("CUSTOMER")
  @ApiOperation({ summary: "Initiate redemption: send OTP to recipient of customer-issued gift card" })
  @ApiResponse({ status: 200, description: "OTP sent or not required" })
  async sendRedeemOtp(
    @Body() body: { code: string; channel?: string },
  ) {
    return this.redemption.sendRedeemOtp(body.code, body.channel);
  }

  @Post("redeem")
  @UseGuards(JwtAuthGuard, RolesGuard, RedeemRateLimitGuard)
  @Roles("CUSTOMER")
  @ApiOperation({ summary: "Redeem a gift card claim code to the customer wallet" })
  @ApiResponse({ status: 200, description: "Successfully redeemed gift card" })
  async redeem(
    @Req() req: { user: JwtPayload },
    @Body() body: RedeemGiftCardDto,
  ) {
    return this.redemption.redeemCode(body.code, body.pin, req.user.userId, body.otp);
  }

  @Get("purchased")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER")
  @ApiOperation({ summary: "Get list of gift cards purchased by current customer" })
  @ApiResponse({ status: 200, description: "Returns paginated list of purchased gift cards" })
  async purchased(
    @Req() req: { user: JwtPayload },
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const { rows, count } = await this.giftcards.getPurchasedByAccount(
      req.user.userId,
      parseInt(limit || "50", 10),
      parseInt(offset || "0", 10),
    );
    return {
      data: rows,
      pagination: {
        total: count,
        limit: parseInt(limit || "50", 10),
        offset: parseInt(offset || "0", 10),
      },
    };
  }

  @Get("settings/public")
  @ApiOperation({ summary: "Retrieve public platform settings (min/max amounts, enabled card types)" })
  async getPublicSettings() {
    const settings = await this.settings.getSettings();
    return { data: settings };
  }

  @Get("admin/settings")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN", "MODERATOR")
  @ApiOperation({ summary: "Retrieve full admin settings" })
  async getAdminSettings() {
    const settings = await this.settings.getSettings();
    return { data: settings };
  }

  @Put("admin/settings")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN")
  @ApiOperation({ summary: "Update admin settings" })
  async updateAdminSettings(@Body() body: any) {
    const settings = await this.settings.updateSettings(body);
    return { data: settings };
  }
}