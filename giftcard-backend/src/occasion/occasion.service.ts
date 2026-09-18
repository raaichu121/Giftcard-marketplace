import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOccasionDto } from "./dto/create-occasion.dto";
import { UpdateOccasionDto } from "./dto/update-occasion.dto";
import { CreateCardDto } from "./dto/create-card.dto";
import { Prisma } from "@prisma/client";

const MANAGE_OCCASION_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "MODERATOR"]);

const assertCanManageOccasions = (role?: string) => {
  if (!role || !MANAGE_OCCASION_ROLES.has(role)) {
    throw new ForbiddenException("You do not have permission for this action");
  }
};

@Injectable()
export class OccasionService {
  constructor(private readonly prisma: PrismaService) {}

  async seedDefaultOccasions() {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      // Avoid seeding default occasions automatically in production to avoid conflicts with admin actions.
      return;
    }

    // Check if occasions already exist to avoid seeding again
    const count = await this.prisma.occasion.count();
    if (count > 0) {
      return;
    }

    const occasionsData = [
      {
        slug: "dashain",
        name: "Dashain",
        color: "#dc2626",
        isActive: true,
        order: 1,
        cards: [
          {
            id: "3e05a8f4-6cb2-4a0b-93ff-180b7e28b123",
            name: "Dashain Classic",
            imagePath: "/cards/dashain/dashain1.png",
            isDefault: true,
            valueBox: { top: "48%", right: "6%", width: "32%" },
            valueColor: "#000000",
          },
          {
            id: "3e05a8f4-6cb2-4a0b-93ff-180b7e28b124",
            name: "Dashain Mountains",
            imagePath: "/cards/dashain/dashain2.png",
            isDefault: false,
            valueBox: { top: "48%", right: "6%", width: "32%" },
            valueColor: "#000000",
          },
        ],
      },
      {
        slug: "tihar",
        name: "Tihar",
        color: "#d97706",
        isActive: true,
        order: 2,
        cards: [
          {
            id: "3e05a8f4-6cb2-4a0b-93ff-180b7e28b223",
            name: "Diwali Dark",
            imagePath: "/cards/tihar/diwali-dark.png",
            isDefault: true,
            valueBox: { top: "48%", right: "6%", width: "34%" },
            valueColor: "#000000",
          },
          {
            id: "3e05a8f4-6cb2-4a0b-93ff-180b7e28b224",
            name: "Diwali Light",
            imagePath: "/cards/tihar/diwali-light.png",
            isDefault: false,
            valueBox: { top: "48%", right: "6%", width: "34%" },
            valueColor: "#000000",
          },
          {
            id: "3e05a8f4-6cb2-4a0b-93ff-180b7e28b225",
            name: "Diwali Purple",
            imagePath: "/cards/tihar/diwali-purple.png",
            isDefault: false,
            valueBox: { top: "48%", right: "6%", width: "34%" },
            valueColor: "#000000",
          },
        ],
      },
      {
        slug: "teej",
        name: "Teej",
        color: "#9f1239",
        isActive: true,
        order: 3,
        cards: [
          {
            id: "3e05a8f4-6cb2-4a0b-93ff-180b7e28b323",
            name: "Teej Festival",
            imagePath: "/cards/teej/teej.png",
            isDefault: true,
            valueBox: { top: "48%", right: "6%", width: "32%" },
            valueColor: "#000000",
          },
        ],
      },
      {
        slug: "buddha",
        name: "Buddha Jayanti",
        color: "#16a34a",
        isActive: true,
        order: 4,
        cards: [
          {
            id: "3e05a8f4-6cb2-4a0b-93ff-180b7e28b423",
            name: "Buddha Lotus",
            imagePath: "/cards/buddha/buddha.png",
            isDefault: true,
            valueBox: { top: "48%", right: "6%", width: "32%" },
            valueColor: "#000000",
          },
        ],
      },
      {
        slug: "holi",
        name: "Holi",
        color: "#7c3aed",
        isActive: false,
        order: 5,
        cards: [],
      },
      {
        slug: "losar",
        name: "Losar",
        color: "#0284c7",
        isActive: true,
        order: 6,
        cards: [
          {
            id: "3e05a8f4-6cb2-4a0b-93ff-180b7e28b623",
            name: "Losar Flags",
            imagePath: "/cards/losar.png",
            isDefault: true,
            valueBox: { top: "48%", right: "6%", width: "34%" },
            valueColor: "#000000",
          },
        ],
      },
      {
        slug: "birthday",
        name: "Birthday",
        color: "#db2777",
        isActive: true,
        order: 7,
        cards: [],
      },
      {
        slug: "wedding",
        name: "Wedding",
        color: "#0369a1",
        isActive: true,
        order: 8,
        cards: [],
      },
    ];

    for (const occData of occasionsData) {
      const occasion = await this.prisma.occasion.upsert({
        where: { slug: occData.slug },
        update: {
          name: occData.name,
          color: occData.color,
          isActive: occData.isActive,
          order: occData.order,
        },
        create: {
          slug: occData.slug,
          name: occData.name,
          color: occData.color,
          isActive: occData.isActive,
          order: occData.order,
        },
      });

      for (const cardData of occData.cards) {
        await this.prisma.occasionCard.upsert({
          where: { id: cardData.id },
          update: {
            name: cardData.name,
            imagePath: cardData.imagePath,
            isDefault: cardData.isDefault,
            valueBox: cardData.valueBox as Prisma.InputJsonValue,
            valueColor: cardData.valueColor,
            occasionId: occasion.id,
          },
          create: {
            id: cardData.id,
            name: cardData.name,
            imagePath: cardData.imagePath,
            isDefault: cardData.isDefault,
            valueBox: cardData.valueBox as Prisma.InputJsonValue,
            valueColor: cardData.valueColor,
            occasionId: occasion.id,
          },
        });
      }
    }
  }

  async listActive() {
    return this.prisma.occasion.findMany({
      where: { isActive: true },
      include: {
        cards: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async adminList() {
    return this.prisma.occasion.findMany({
      include: {
        cards: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async createOccasion(data: CreateOccasionDto) {
    return this.prisma.occasion.create({
      data: {
        slug: data.slug.toLowerCase().trim(),
        name: data.name,
        nepali: data.nepali,
        emoji: data.emoji,
        color: data.color,
        isActive: data.isActive ?? true,
        order: data.order ?? 0,
      },
    });
  }

  async updateOccasion(id: string, data: UpdateOccasionDto) {
    const exists = await this.prisma.occasion.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Occasion not found");

    return this.prisma.occasion.update({
      where: { id },
      data: {
        slug: data.slug ? data.slug.toLowerCase().trim() : undefined,
        name: data.name,
        nepali: data.nepali,
        emoji: data.emoji,
        color: data.color,
        isActive: data.isActive,
        order: data.order,
      },
    });
  }

  async addCard(occasionId: string, data: CreateCardDto, actorRole?: string) {
    assertCanManageOccasions(actorRole);

    const occasion = await this.prisma.occasion.findUnique({ where: { id: occasionId } });
    if (!occasion) throw new NotFoundException("Occasion not found");

    const isDefault = data.isDefault ?? false;

    return this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.occasionCard.updateMany({
          where: { occasionId },
          data: { isDefault: false },
        });
      }

      return tx.occasionCard.create({
        data: {
          occasionId,
          name: data.name,
          imagePath: data.imagePath,
          isDefault,
          valueBox: data.valueBox as Prisma.InputJsonValue,
          valueColor: data.valueColor ?? "#1a1a2e",
        },
      });
    });
  }

  async setDefaultCard(occasionId: string, cardId: string, actorRole?: string) {
    assertCanManageOccasions(actorRole);

    const card = await this.prisma.occasionCard.findUnique({
      where: { id: cardId },
    });
    if (!card || card.occasionId !== occasionId) {
      throw new NotFoundException("Card not found for this occasion");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.occasionCard.updateMany({
        where: { occasionId },
        data: { isDefault: false },
      });

      return tx.occasionCard.update({
        where: { id: cardId },
        data: { isDefault: true },
      });
    });
  }

  async deleteCard(cardId: string) {
    const exists = await this.prisma.occasionCard.findUnique({ where: { id: cardId } });
    if (!exists) throw new NotFoundException("Card template not found");

    return this.prisma.occasionCard.delete({
      where: { id: cardId },
    });
  }

  async deleteOccasion(id: string) {
    const exists = await this.prisma.occasion.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Occasion not found");

    return this.prisma.occasion.delete({
      where: { id },
    });
  }
}