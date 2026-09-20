import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("GiftNow API")
    .setDescription("The GiftNow platform API documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/v1/docs", app, document);

  const port = parseInt(process.env.PORT || "3001", 10);
  await app.listen(port);
  app.get(Logger).log(`✅ GiftNow API (NestJS) http://localhost:${port}/api/v1`);
  app.get(Logger).log(`📖 Swagger docs available at http://localhost:${port}/api/v1/docs`);
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start:", err);
  process.exit(1);
});
