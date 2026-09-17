import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { GiftCardType } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AdminCreateDto {
  @ApiProperty({ enum: GiftCardType, description: "Type of the gift card (DIGITAL or PHYSICAL)" })
  @IsEnum(GiftCardType)
  type!: GiftCardType;

  @ApiProperty({ minimum: 100, maximum: 100000, description: "The face value of the gift card in NPR" })
  @IsInt()
  @Min(100)
  @Max(100000)
  amount!: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 1000, default: 1, description: "Quantity of cards to generate" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  quantity?: number;

  @ApiPropertyOptional({ type: [Number], description: "List of specific amounts for bulk card creation" })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(100, { each: true })
  @Max(100000, { each: true })
  amounts?: number[];

  @ApiPropertyOptional({ description: "Recipient's email address for DIGITAL delivery" })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: "Personal message included with the gift card" })
  @IsOptional()
  @IsString()
  personalMessage?: string;

  @ApiPropertyOptional({ type: Object, description: "Delivery address for PHYSICAL cards" })
  @IsOptional()
  @IsObject()
  deliveryAddress?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "Optional name to categorize the bulk card batch" })
  @IsOptional()
  @IsString()
  batchName?: string;

  @ApiPropertyOptional({ description: "UUID of the occasion card design to use" })
  @IsOptional()
  @IsString()
  cardDesignId?: string;
}