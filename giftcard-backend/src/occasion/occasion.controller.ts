import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Req,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { OccasionService } from "./occasion.service";
import { CreateOccasionDto } from "./dto/create-occasion.dto";
import { UpdateOccasionDto } from "./dto/update-occasion.dto";
import { CreateCardDto } from "./dto/create-card.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { mkdirSync } from "fs";
import { extname, join } from "path";

const sanitizeOccasionSlug = (value: unknown): string => {
  if (typeof value !== "string" || !value.trim()) {
    return "general";
  }

  const safeSlug = value.replace(/[^a-z0-9-_]/gi, "").toLowerCase();
  return safeSlug || "general";
};

@ApiTags("Occasions")
@Controller("gift-cards/occasions")
export class OccasionController {
  constructor(private readonly service: OccasionService) {}

  @Get()
  @ApiOperation({ summary: "Get all active occasions with templates (for customers)" })
  @ApiResponse({ status: 200, description: "Successfully fetched active occasions" })
  async listActive() {
    const data = await this.service.listActive();
    return { data };
  }

  @Get("admin/list")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all occasions (for admins)" })
  @ApiResponse({ status: 200, description: "Successfully fetched all occasions for admin" })
  async adminList() {
    const data = await this.service.adminList();
    return { data };
  }

  @Post("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new occasion (for admins)" })
  @ApiResponse({ status: 201, description: "Successfully created occasion" })
  async createOccasion(@Body() body: CreateOccasionDto) {
    const data = await this.service.createOccasion(body);
    return { data };
  }

  @Patch("admin/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update an occasion (for admins)" })
  @ApiResponse({ status: 200, description: "Successfully updated occasion" })
  async updateOccasion(@Param("id") id: string, @Body() body: UpdateOccasionDto) {
    const data = await this.service.updateOccasion(id, body);
    return { data };
  }

  @Post("admin/:id/cards")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add a card template to an occasion (for admins)" })
  @ApiResponse({ status: 201, description: "Successfully added card template" })
  async addCard(@Param("id") id: string, @Body() body: CreateCardDto, @Req() req: any) {
    const data = await this.service.addCard(id, body, req.user?.role);
    return { data };
  }

  @Patch("admin/:id/cards/:cardId/default")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Set a card template as the occasion's default (for admins)" })
  @ApiResponse({ status: 200, description: "Successfully set template as default" })
  async setDefaultCard(
    @Param("id") id: string,
    @Param("cardId") cardId: string,
    @Req() req: any,
  ) {
    const data = await this.service.setDefaultCard(id, cardId, req.user?.role);
    return { data };
  }

  @Delete("admin/cards/:cardId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a card template (for admins)" })
  @ApiResponse({ status: 200, description: "Successfully deleted template" })
  async deleteCard(@Param("cardId") cardId: string) {
    const data = await this.service.deleteCard(cardId);
    return { data };
  }

  @Delete("admin/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete an occasion (for admins)" })
  @ApiResponse({ status: 200, description: "Successfully deleted occasion" })
  async deleteOccasion(@Param("id") id: string) {
    const data = await this.service.deleteOccasion(id);
    return { data };
  }

  @Post("admin/upload-card")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN", "MODERATOR")
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req: any, file: any, callback: (error: Error | null, destination: string) => void) => {
          const safeName = sanitizeOccasionSlug(req?.query?.occasionSlug);
          const destDir = join(process.cwd(), "..", "giftcard-frontend", "public", "cards", safeName);
          mkdirSync(destDir, { recursive: true });
          callback(null, destDir);
        },
        filename: (req: any, file: any, callback: (error: Error | null, filename: string) => void) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `uploaded-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: "Upload a card template image (for admins)" })
  @ApiResponse({ status: 201, description: "Successfully uploaded template image" })
  async uploadCard(@UploadedFile() file: any, @Query("occasionSlug") occasionSlug?: string) {
    if (!file) {
      throw new BadRequestException("Card image file is required");
    }

    const slug = sanitizeOccasionSlug(occasionSlug);
    return {
      imagePath: `/cards/${slug}/${file.filename}`,
    };
  }
}