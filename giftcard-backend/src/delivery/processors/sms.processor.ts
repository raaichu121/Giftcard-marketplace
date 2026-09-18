import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

interface SmsJobData {
  to: string;
  message: string;
}

@Processor("sms-queue")
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);
  private readonly scratchDir: string;
  private readonly mailboxPath: string;

  constructor() {
    super();
    // Scratch directory at backend root
    this.scratchDir = path.resolve(__dirname, "../../../scratch");
    this.mailboxPath = path.join(this.scratchDir, "sms_mailbox.json");
  }

  async process(job: Job<SmsJobData>) {
    const { to, message } = job.data;
    this.logger.debug(`Processing SMS job ${job.id} for recipient: ${to}`);

    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      // Production gateway mock placeholder or real Sparrow SMS call
      this.logger.log(`[PRODUCTION SMS GATEWAY] Sending SMS to ${to}: "${message}"`);
      // In production, we'd make a real HTTP request to Sparrow SMS/Aakash SMS/Twilio here
      // For now, we mock success.
      return { success: true, provider: "SparrowSMSMock", messageId: `prod-sms-${job.id}` };
    } else {
      // Local development mock sandbox
      this.logger.log(
        `\n` +
        `==================================================\n` +
        `📱 DEV SMS GATEWAY SANDBOX - OUTGOING MESSAGE\n` +
        `--------------------------------------------------\n` +
        `To: ${to}\n` +
        `Message: ${message}\n` +
        `==================================================`
      );

      try {
        // Ensure scratch directory exists
        if (!fs.existsSync(this.scratchDir)) {
          fs.mkdirSync(this.scratchDir, { recursive: true });
        }

        // Read existing mailbox or initialize
        let messages: any[] = [];
        if (fs.existsSync(this.mailboxPath)) {
          try {
            const data = fs.readFileSync(this.mailboxPath, "utf-8");
            messages = JSON.parse(data);
          } catch (e) {
            this.logger.error("Failed to parse existing SMS mailbox file, resetting.", e);
          }
        }

        // Append new message
        messages.push({
          id: job.id || `sms-${Date.now()}`,
          to,
          message,
          timestamp: new Date().toISOString(),
        });

        // Write back
        fs.writeFileSync(this.mailboxPath, JSON.stringify(messages, null, 2), "utf-8");
      } catch (err) {
        this.logger.error(
          `Failed to write SMS payload to sandbox mailbox file:`,
          err instanceof Error ? err.message : String(err)
        );
      }

      return { success: true, provider: "SandboxMock", messageId: `sandbox-sms-${job.id}` };
    }
  }
}
