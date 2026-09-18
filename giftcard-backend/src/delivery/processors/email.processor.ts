import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import * as nodemailer from "nodemailer";
import { Logger } from "@nestjs/common";

interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

@Processor("email-queue")
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    super();
    // Use MailHog for local dev (nodemailer config)
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      // Production: SendGrid
      this.transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY || "",
        },
      });
    } else {
      // Development: MailHog
      this.transporter = nodemailer.createTransport({
        host: process.env.MAILHOG_HOST || "localhost",
        port: parseInt(process.env.MAILHOG_PORT || "1025", 10),
        secure: false,
      });
    }
  }

  async process(job: Job<EmailJobData>) {
    this.logger.debug(`Processing email job ${job.id}: ${job.data.to}`);

    try {
      const info = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || "noreply@giftnow.com",
        to: job.data.to,
        subject: job.data.subject,
        html: job.data.html,
        attachments: job.data.attachments || [],
      });

      this.logger.log(`Email sent to ${job.data.to}: ${info.messageId}`);
      return { messageId: info.messageId, timestamp: new Date() };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${job.data.to}:`,
        error instanceof Error ? error.message : String(error),
      );

      // Retry logic: exponential backoff
      const retries = job.attemptsMade;
      const maxRetries = 5;

      if (retries < maxRetries) {
        const delayMs = Math.pow(2, retries) * 1000; // 2^retries seconds
        this.logger.debug(
          `Retrying email in ${delayMs}ms (attempt ${retries + 1}/${maxRetries})`,
        );
        throw new Error(
          `Email delivery failed (will retry): ${error instanceof Error ? error.message : String(error)}`,
        );
      } else {
        this.logger.error(
          `Email delivery permanently failed after ${maxRetries} retries`,
        );
        throw error;
      }
    }
  }
}
