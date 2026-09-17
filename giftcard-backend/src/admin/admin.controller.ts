import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { GiftcardService } from "../giftcard/giftcard.service";
import { AdminCreateDto } from "./dto/admin-create.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { Prisma } from "@prisma/client";
import { GiftNowHttpException } from "../common/exceptions";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Admin")
@ApiBearerAuth()
@Controller("gift-cards/admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN", "ADMIN", "MODERATOR")
export class AdminController {
  constructor(private readonly giftcards: GiftcardService) {}

  @Post("create")
  @ApiOperation({ summary: "Admin action to create single or bulk gift cards" })
  @ApiResponse({ status: 201, description: "Successfully created card(s)" })
  async create(
    @Req() req: { user: JwtPayload },
    @Body() body: AdminCreateDto,
  ) {
    return this.giftcards.adminCreate({
      type: body.type,
      amount: body.amount,
      quantity: body.quantity,
      amounts: body.amounts,
      recipientEmail: body.recipientEmail,
      personalMessage: body.personalMessage,
      deliveryAddress: body.deliveryAddress as Prisma.InputJsonValue | undefined,
      batchName: body.batchName,
      createdByAdminId: req.user.userId,
      cardDesignId: body.cardDesignId,
    });
  }

  @Post("cancel/:id")
  @ApiOperation({ summary: "Cancel a gift card and trigger wallet refund if redeemed" })
  @ApiResponse({ status: 200, description: "Successfully cancelled gift card" })
  async cancel(@Req() req: { user: JwtPayload }, @Param("id") id: string) {
    const card = await this.giftcards.cancelCard(id, req.user.userId);
    return { data: card };
  }

  @Post("reset-pin/:id")
  @ApiOperation({ summary: "Reset a gift card's security PIN and clear lockout" })
  @ApiResponse({ status: 200, description: "Returns the new plain PIN" })
  async resetPin(@Param("id") id: string) {
    const result = await this.giftcards.resetPin(id);
    return { data: result };
  }

  @Get("list")
  @ApiOperation({ summary: "List all gift cards in the system with filters and pagination" })
  @ApiResponse({ status: 200, description: "Returns list of cards" })
  async list(
    @Query("status") status?: string,
    @Query("type") type?: string,
    @Query("createdBy") createdBy?: string,
    @Query("code") code?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const { rows, count } = await this.giftcards.listCards({
      status,
      type,
      createdBy,
      code,
      startDate,
      endDate,
      limit: parseInt(limit || "50", 10),
      offset: parseInt(offset || "0", 10),
    });
    return {
      data: rows,
      pagination: {
        total: count,
        limit: parseInt(limit || "50", 10),
        offset: parseInt(offset || "0", 10),
      },
    };
  }

  @Get("analytics")
  @ApiOperation({ summary: "Retrieve overview analytics metrics for the dashboard" })
  @ApiResponse({ status: 200, description: "Returns aggregate stats, volumes, counts" })
  async analytics() {
    const data = await this.giftcards.getAnalytics();
    return { data };
  }

  @Get("batch/:batchId")
  @ApiOperation({ summary: "Fetch cards belonging to a specific creation batch" })
  @ApiResponse({ status: 200, description: "Returns batch of cards" })
  async batch(@Param("batchId") batchId: string) {
    const data = await this.giftcards.getBatch(batchId);
    if (!data) throw new GiftNowHttpException("GIFT_CARD_NOT_FOUND", "Batch not found");
    return { data };
  }

  @Get("export")
  @Header("Content-Type", "text/csv")
  @ApiOperation({ summary: "Export filtered gift card list as a CSV file" })
  @ApiResponse({ status: 200, description: "Sends a CSV file attachment" })
  async export(
    @Res() res: Response,
    @Query("status") status?: string,
    @Query("type") type?: string,
    @Query("createdBy") createdBy?: string,
  ) {
    const csv = await this.giftcards.exportCsv({ status, type, createdBy });
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="giftnow-export.csv"',
    );
    res.send(csv);
  }
}