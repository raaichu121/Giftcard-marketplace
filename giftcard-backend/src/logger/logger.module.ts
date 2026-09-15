import { Module } from "@nestjs/common";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== "production"
            ? {
                target: "pino-pretty",
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
        level: process.env.NODE_ENV !== "production" ? "debug" : "info",
        redact: ["req.headers.authorization", "req.headers.cookie", "body.password", "body.credential"],
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}