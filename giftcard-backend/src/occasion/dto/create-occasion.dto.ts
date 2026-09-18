import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateOccasionDto {
  @ApiProperty({ description: "URL slug of the occasion", example: "dashain" })
  @IsNotEmpty()
  @IsString()
  slug!: string;

  @ApiProperty({ description: "English name of the occasion", example: "Dashain" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: "Nepali translation of the occasion name", example: "दशैं" })
  @IsOptional()
  @IsString()
  nepali?: string;

  @ApiPropertyOptional({ description: "Emoji icon", example: "🪁" })
  @IsOptional()
  @IsString()
  emoji?: string;

  @ApiPropertyOptional({ description: "Theme color hex code", example: "#dc2626" })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: "Is this occasion visible to customers?", default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Sort order in selections", default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}