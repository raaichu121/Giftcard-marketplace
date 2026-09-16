import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ description: "Customer or Admin email address", example: "admin@giftnow.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: "Account password" })
  @IsString()
  password!: string;
}