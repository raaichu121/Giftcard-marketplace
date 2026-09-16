import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GoogleAuthDto {
  @ApiProperty({ description: "Google OAuth credential token (JWT)" })
  @IsString()
  credential!: string;
}