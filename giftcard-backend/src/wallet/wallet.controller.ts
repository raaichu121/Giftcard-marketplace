import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { DebitWalletDto } from "./dto/debit-wallet.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Wallet")
@ApiBearerAuth()
@Controller("gift-cards/wallet")
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current customer wallet balance" })
  @ApiResponse({ status: 200, description: "Returns wallet details" })
  async getWallet(@Req() req: { user: JwtPayload }) {
    return this.wallet.getBalance(req.user.userId);
  }

  @Get("history")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get customer wallet transaction history logs" })
  @ApiResponse({ status: 200, description: "Returns paginated list of transactions" })
  async walletHistory(
    @Req() req: { user: JwtPayload },
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const { rows, count } = await this.wallet.getHistory(
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

  @Post("debit")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Debit from wallet balance to pay for purchases" })
  @ApiResponse({ status: 201, description: "Successfully debited wallet" })
  async debit(
    @Req() req: { user: JwtPayload },
    @Body() body: DebitWalletDto,
  ) {
    return this.wallet.debitWallet(
      req.user.userId,
      body.amount,
      req.user.userId,
      body.orderId,
    );
  }
}
