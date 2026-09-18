import { IsString, IsOptional, MaxLength, MinLength, Length } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RedeemGiftCardDto {
  @ApiProperty({ minLength: 10, maxLength: 40, description: "The unique 16-character gift card claim code (dash formatted or plain)" })
  @IsString()
  @MinLength(10)
  @MaxLength(40)
  code!: string;

  @ApiPropertyOptional({ minLength: 6, maxLength: 6, description: "The 6-digit security PIN associated with the gift card" })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  pin?: string;

  @ApiPropertyOptional({ minLength: 6, maxLength: 6, description: "The 6-digit OTP code for redemption verification" })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  otp?: string;
}