import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CheckoutCalculateDto {
  @ApiProperty({ description: "Total cost of items in cart before discounts" })
  @IsNumber()
  @IsPositive()
  itemTotal!: number;

  @ApiPropertyOptional({ description: "Optional promo coupon code" })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ default: true, description: "Whether to apply user's wallet balance" })
  @IsOptional()
  useWallet?: boolean = true;
}