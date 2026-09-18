import { Body, Controller, Post, Get, UseGuards, Req } from "@nestjs/common";
import { CheckoutService } from "./checkout.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { CheckoutCalculateDto } from "./dto/checkout-calculate.dto";
import { CheckoutProcessDto } from "./dto/checkout-process.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Checkout")
@ApiBearerAuth()
@Controller("gift-cards/checkout")
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Get("calculate")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get checkout hints/info" })
  @ApiResponse({ status: 200, description: "Returns instructions for calculations" })
  async calculate(@Req() req: { user: JwtPayload }) {
    // Extract query parameters from request
    // This endpoint returns wallet balance and checkout hints
    return {
      message: "Use POST /checkout for full calculation",
    };
  }

  @Post("calculate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER")
  @ApiOperation({ summary: "Calculate cart total, discounts, and wallet deductions" })
  @ApiResponse({ status: 200, description: "Returns checkout breakdown" })
  async calculateCheckout(
    @Req() req: { user: JwtPayload },
    @Body() body: CheckoutCalculateDto,
  ) {
    return this.checkout.calculateCheckout({
      accountId: req.user.userId,
      itemTotal: body.itemTotal,
      couponCode: body.couponCode,
      useWallet: body.useWallet !== false,
    });
  }

  @Post("process")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER")
  @ApiOperation({ summary: "Process final payment and complete checkout" })
  @ApiResponse({ status: 201, description: "Completes order and debiting" })
  async processCheckout(
    @Req() req: { user: JwtPayload },
    @Body() body: CheckoutProcessDto,
  ) {
    return this.checkout.processCheckout({
      accountId: req.user.userId,
      orderId: body.orderId,
      itemTotal: body.itemTotal,
      couponCode: body.couponCode,
      walletAmount: body.walletAmount,
      paymentMethod: body.paymentMethod,
    });
  }
}