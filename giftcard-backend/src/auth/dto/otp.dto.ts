import { IsEmail, IsOptional, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SendOtpDto {
  @ApiProperty({ required: false, description: "Email address to send OTP to" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, description: "Phone number to send OTP to" })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class VerifyOtpDto {
  @ApiProperty({ required: false, description: "Email address of the user" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, description: "Phone number of the user" })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: "6-digit verification code" })
  @IsString()
  @Length(6, 6)
  code!: string;

  @ApiProperty({ required: false, description: "First name for registration (optional)" })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false, description: "Last name for registration (optional)" })
  @IsString()
  @IsOptional()
  lastName?: string;
}