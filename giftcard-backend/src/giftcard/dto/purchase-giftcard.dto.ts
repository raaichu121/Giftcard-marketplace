import {
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from "class-validator";
import { GiftCardType } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PurchaseGiftCardDto {
  @ApiProperty({ enum: GiftCardType, description: "Type of gift card: DIGITAL or PHYSICAL" })
  @IsEnum(GiftCardType)
  type!: GiftCardType;

  @ApiProperty({ minimum: 100, maximum: 100000, description: "The amount in NPR of the gift card" })
  @IsInt()
  @Min(100)
  @Max(100000)
  amount!: number;

  @ApiPropertyOptional({ description: "Recipient email address. Required when delivery channel is EMAIL or SMS, or for CORPORATE_BULK." })
  @ValidateIf((o) => o.type === "CORPORATE_BULK" || (o.type === "DIGITAL" && (!o.deliveryChannel || o.deliveryChannel === "EMAIL" || o.deliveryChannel === "BOTH")))
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: "Optional recipient phone number for SMS delivery." })
  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @ApiPropertyOptional({ description: "Delivery channel for digital gift cards: EMAIL, SMS, or BOTH", default: "EMAIL" })
  @IsOptional()
  @IsString()
  deliveryChannel?: string;

  @ApiPropertyOptional({ description: "A personal message to be included with the card delivery" })
  @IsOptional()
  @IsString()
  personalMessage?: string;

  @ApiPropertyOptional({ type: Object, description: "Required for PHYSICAL type. Delivery address details." })
  @ValidateIf((o) => o.type === "PHYSICAL")
  @IsObject()
  deliveryAddress?: Record<string, unknown>;

  @ApiPropertyOptional({ minimum: 1, maximum: 1000, default: 1, description: "Quantity of cards to purchase" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  quantity?: number;

  @ApiPropertyOptional({ description: "UUID of the occasion card design to use" })
  @IsOptional()
  @IsString()
  cardDesignId?: string;
}