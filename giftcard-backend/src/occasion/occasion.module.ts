import { Module, OnModuleInit } from "@nestjs/common";
import { OccasionService } from "./occasion.service";
import { OccasionController } from "./occasion.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [OccasionController],
  providers: [OccasionService],
  exports: [OccasionService],
})
export class OccasionModule implements OnModuleInit {
  constructor(private readonly service: OccasionService) {}

  async onModuleInit() {
    await this.service.seedDefaultOccasions();
  }
}