import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { PrismaService } from "../prisma/prisma.service";
import * as nodemailer from "nodemailer";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private sign(user: AuthUser) {
    return this.jwt.sign({
      userId: user.id,
      role: user.role,
      email: user.email,
    });
  }

  private getAllowedAdminEmails(): string[] {
    const list = this.config.get<string>("ALLOWED_ADMIN_EMAILS") || "admin@giftnow.com,suindragroups@gmail.com,testadmin@gmail.com,nepal.giftnow@gmail.com";
    return list.split(",").map(e => e.trim().toLowerCase());
  }

  async loginWithGoogle(credential: string) {
    const clientId = this.config.get<string>("GOOGLE_CLIENT_ID");
    if (!clientId || clientId.trim() === "") {
      const isDevOrTest = ["development", "test"].includes(this.config.get<string>("NODE_ENV") || "");
      const allowMock = this.config.get<string>("ALLOW_INSECURE_MOCK_LOGIN") === "true";

      if (!isDevOrTest || !allowMock) {
        throw new UnauthorizedException(
          "Google sign-in is not configured. Please set GOOGLE_CLIENT_ID in the backend .env file.",
        );
      }

      // Development Bypass: Decode JWT token directly without signature verification for seamless testing
      try {
        const parts = credential.split(".");
        if (parts.length !== 3) {
          throw new UnauthorizedException("Invalid Google token format");
        }
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64").toString("utf-8"),
        );
        if (!payload || !payload.email || !payload.sub) {
          throw new UnauthorizedException("Invalid Google token payload");
        }

        const email = payload.email.toLowerCase();
        const name = payload.name || email.split("@")[0];
        const avatarUrl = payload.picture || null;
        const sub = payload.sub;

        const allowed = this.getAllowedAdminEmails();
        const isAdmin = allowed.includes(email);

        if (isAdmin) {
          let admin = await this.prisma.admin.findFirst({
            where: { email, isActive: true },
          });

          if (!admin) {
            admin = await this.prisma.admin.create({
              data: {
                email,
                username: name,
                password: bcrypt.hashSync(Math.random().toString(), 10),
                role: "ADMIN",
                isActive: true,
                lastLogin: new Date(),
              },
            });
          } else {
            admin = await this.prisma.admin.update({
              where: { id: admin.id },
              data: {
                lastLogin: new Date(),
              },
            });
          }

          const user: AuthUser = {
            id: admin.id,
            email: admin.email,
            role: admin.role,
            name: admin.username,
          };
          return { user, token: this.sign(user) };
        } else {
          let customer = await this.prisma.customer.findFirst({
            where: { email, isActive: true },
          });

          if (!customer) {
            customer = await this.prisma.customer.create({
              data: {
                email,
                name,
                googleId: sub,
                avatarUrl,
                isActive: true,
                lastLogin: new Date(),
              },
            });
          } else {
            customer = await this.prisma.customer.update({
              where: { id: customer.id },
              data: {
                googleId: sub,
                avatarUrl: avatarUrl || customer.avatarUrl,
                lastLogin: new Date(),
              },
            });
          }

          const user: AuthUser = {
            id: customer.id,
            email: customer.email,
            role: "CUSTOMER",
            name: customer.name,
          };
          return { user, token: this.sign(user) };
        }
      } catch (err) {
        if (err instanceof UnauthorizedException) throw err;
        console.error("Mock Google Login failed:", err);
        throw new UnauthorizedException(
          "Google login failed in development mode. Check credential token or configure GOOGLE_CLIENT_ID.",
        );
      }
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new UnauthorizedException("Invalid Google token");
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split("@")[0];
    const avatarUrl = payload.picture || null;
    const sub = payload.sub;

    const allowed = this.getAllowedAdminEmails();
    const isAdmin = allowed.includes(email);

    if (isAdmin) {
      let admin = await this.prisma.admin.findFirst({
        where: { email, isActive: true },
      });

      if (!admin) {
        admin = await this.prisma.admin.create({
          data: {
            email,
            username: name,
            password: bcrypt.hashSync(Math.random().toString(), 10),
            role: "ADMIN",
            isActive: true,
            lastLogin: new Date(),
          },
        });
      } else {
        admin = await this.prisma.admin.update({
          where: { id: admin.id },
          data: {
            lastLogin: new Date(),
          },
        });
      }

      const user: AuthUser = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.username,
      };
      return { user, token: this.sign(user) };
    } else {
      let customer = await this.prisma.customer.findFirst({
        where: { email, isActive: true },
      });

      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            email,
            name,
            googleId: sub,
            avatarUrl,
            isActive: true,
            lastLogin: new Date(),
          },
        });
      } else {
        customer = await this.prisma.customer.update({
          where: { id: customer.id },
          data: {
            googleId: sub,
            avatarUrl: avatarUrl || customer.avatarUrl,
            lastLogin: new Date(),
          },
        });
      }

      const user: AuthUser = {
        id: customer.id,
        email: customer.email,
        role: "CUSTOMER",
        name: customer.name,
      };
      return { user, token: this.sign(user) };
    }
  }

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { email, isActive: true },
    });
    if (!admin) {
      throw new UnauthorizedException("Invalid email or password");
    }

    let valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      const crypto = await import("crypto");
      const legacy = crypto.createHash("sha256").update(password).digest("hex");
      valid = legacy === admin.password;
    }
    if (!valid) throw new UnauthorizedException("Invalid email or password");

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const user: AuthUser = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
    return { user, token: this.sign(user) };
  }

  async getMe(userId: string, role: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: userId } });
    if (admin) {
      return {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.username,
      };
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: userId },
    });
    if (customer) {
      return {
        id: customer.id,
        email: customer.email,
        role: "CUSTOMER",
        name: customer.name,
        avatarUrl: customer.avatarUrl,
      };
    }

    return { id: userId, role };
  }

  async sendOtp(email?: string, phone?: string) {
    if (phone) {
      throw new BadRequestException("Phone login is not permitted.");
    }
    if (!email) {
      throw new BadRequestException("Email is required for OTP verification.");
    }

    const emailLower = email.toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    await this.prisma.otp.create({
      data: {
        email: emailLower,
        phone: null,
        code,
        expiresAt,
      },
    });

    const isProduction = this.config.get<string>("NODE_ENV") === "production";
    let transporter: nodemailer.Transporter;

    if (isProduction) {
      transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: this.config.get<string>("SENDGRID_API_KEY") || "",
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: this.config.get<string>("MAILHOG_HOST") || "localhost",
        port: parseInt(this.config.get<string>("MAILHOG_PORT") || "1025", 10),
        secure: false,
      });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;padding:20px;border-radius:8px;">
        <h1 style="color:#000000;text-align:center;font-weight:900;letter-spacing:-1px;">GIFTNOW.</h1>
        <h2 style="color:#111;text-align:center;font-size:20px;text-transform:uppercase;letter-spacing:2px;">Verification Code</h2>
        <p style="font-size:16px;color:#333;text-align:center;">Your verification code for signing in to GiftNow:</p>
        <div style="background:#f4f4f5;padding:24px;border-radius:0;margin:24px 0;text-align:center;border:2px solid #000;">
          <p style="font-family:monospace;font-size:36px;font-weight:bold;margin:0;letter-spacing:6px;color:#000;">${code}</p>
        </div>
        <p style="color:#666;font-size:13px;text-align:center;">This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
        <footer style="text-align:center;color:#999;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:20px;">
          <p>© 2026 Su Indra Groups Pvt. Ltd. — GiftNow</p>
        </footer>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: this.config.get<string>("SMTP_FROM") || "noreply@giftnow.com",
        to: emailLower,
        subject: `🔑 ${code} is your GiftNow verification code`,
        html,
      });
    } catch (err) {
      console.error("Failed to send OTP email:", err);
      throw new BadRequestException("Failed to send verification email. Please verify SMTP settings.");
    }

    return { success: true, message: "OTP sent successfully" };
  }

  async verifyOtp(
    email?: string,
    phone?: string,
    code?: string,
    firstName?: string,
    lastName?: string,
  ) {
    if (phone) {
      throw new BadRequestException("Phone verification is not permitted.");
    }
    if (!email) {
      throw new BadRequestException("Email is required for OTP verification.");
    }
    if (!code) {
      throw new BadRequestException("OTP code is required");
    }

    const emailLower = email.toLowerCase();
    const latestOtp = await this.prisma.otp.findFirst({
      where: { email: emailLower },
      orderBy: { createdAt: "desc" },
    });

    if (!latestOtp) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    if (new Date() > latestOtp.expiresAt) {
      await this.prisma.otp.delete({ where: { id: latestOtp.id } }).catch(() => {});
      throw new BadRequestException("Verification code has expired");
    }

    if (latestOtp.attempts >= 5) {
      await this.prisma.otp.delete({ where: { id: latestOtp.id } }).catch(() => {});
      throw new BadRequestException("Too many failed attempts. Please request a new verification code.");
    }

    if (latestOtp.code !== code) {
      const updated = await this.prisma.otp.update({
        where: { id: latestOtp.id },
        data: { attempts: { increment: 1 } },
      });

      const remaining = 5 - updated.attempts;
      if (remaining <= 0) {
        await this.prisma.otp.delete({ where: { id: latestOtp.id } }).catch(() => {});
        throw new BadRequestException("Too many failed attempts. Please request a new verification code.");
      }

      throw new BadRequestException(`Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
    }

    await this.prisma.otp.delete({ where: { id: latestOtp.id } }).catch(() => {});

    const name =
      firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName || lastName || emailLower.split("@")[0];

    const allowed = this.getAllowedAdminEmails();
    const isAdmin = allowed.includes(emailLower);

    if (isAdmin) {
      let admin = await this.prisma.admin.findFirst({
        where: { email: emailLower, isActive: true },
      });

      if (!admin) {
        admin = await this.prisma.admin.create({
          data: {
            email: emailLower,
            username: name,
            password: bcrypt.hashSync(Math.random().toString(), 10),
            role: "ADMIN",
            isActive: true,
            lastLogin: new Date(),
          },
        });
      } else {
        admin = await this.prisma.admin.update({
          where: { id: admin.id },
          data: {
            lastLogin: new Date(),
            ...(firstName || lastName ? { username: name } : {}),
          },
        });
      }

      const user: AuthUser = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.username,
      };

      return { user, token: this.sign(user) };
    } else {
      let customer = await this.prisma.customer.findFirst({
        where: { email: emailLower, isActive: true },
      });

      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            email: emailLower,
            name: name,
            isActive: true,
            lastLogin: new Date(),
          },
        });
      } else {
        customer = await this.prisma.customer.update({
          where: { id: customer.id },
          data: {
            lastLogin: new Date(),
            ...(firstName || lastName ? { name } : {}),
          },
        });
      }

      const user: AuthUser = {
        id: customer.id,
        email: customer.email,
        role: "CUSTOMER",
        name: customer.name,
      };

      return { user, token: this.sign(user) };
    }
  }
}