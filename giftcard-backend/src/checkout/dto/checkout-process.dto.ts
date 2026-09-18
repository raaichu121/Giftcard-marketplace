import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CheckoutProcessDto {
  @ApiProperty({ description: "Unique order/transaction ID" })
  @IsString()
  orderId!: string;

  @ApiProperty({ description: "Total cost of items in cart" })
  @IsNumber()
  @IsPositive()
  itemTotal!: number;

  @ApiPropertyOptional({ description: "Optional promo coupon code" })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ description: "Amount to deduct from the wallet" })
  @IsNumber()
  @IsPositive()
  walletAmount!: number;

  @ApiProperty({ description: "The chosen payment method (e.g. KHALTI, KHALTI_WALLET, WALLET)" })
  @IsString()
  paymentMethod!: string;
}