import { IsNumber, IsPositive, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DebitWalletDto {
  @ApiProperty({ description: "The amount in NPR to debit from the wallet" })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ description: "The corresponding merchant or client order ID" })
  @IsString()
  @MaxLength(64)
  orderId!: string;
}
