import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsObject } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCardDto {
  @ApiProperty({ description: "Card template reference name", example: "Dashain Classic" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ description: "Image relative file path or URL", example: "/cards/dashain1.png" })
  @IsNotEmpty()
  @IsString()
  imagePath!: string;

  @ApiPropertyOptional({ description: "Set as the default design for the occasion", default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: "JSON coordinates of the value text overlay box (top, right, width in %)", example: { top: "38%", right: "6%", width: "32%" } })
  @IsObject()
  valueBox!: Record<string, unknown>;

  @ApiPropertyOptional({ description: "Card text color for value overlay", default: "#1a1a2e" })
  @IsOptional()
  @IsString()
  valueColor?: string;
}