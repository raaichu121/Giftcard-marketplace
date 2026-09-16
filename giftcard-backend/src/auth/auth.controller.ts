import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { GoogleAuthDto } from "./dto/google-auth.dto";
import { SendOtpDto, VerifyOtpDto } from "./dto/otp.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtPayload } from "./jwt-payload.interface";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("google")
  @ApiOperation({ summary: "Login/Register with Google OAuth" })
  @ApiResponse({ status: 200, description: "Successfully authenticated with Google" })
  async google(@Body() body: GoogleAuthDto) {
    const { user, token } = await this.auth.loginWithGoogle(body.credential);
    return { message: "Signed in with Google", data: { token, user } };
  }

  @Post("otp/send")
  @ApiOperation({ summary: "Send dynamic OTP to email or phone" })
  @ApiResponse({ status: 200, description: "Successfully sent OTP code" })
  async sendOtp(@Body() body: SendOtpDto) {
    return this.auth.sendOtp(body.email, body.phone);
  }

  @Post("otp/verify")
  @ApiOperation({ summary: "Verify OTP code to log in or register" })
  @ApiResponse({ status: 200, description: "Successfully authenticated via OTP" })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const { user, token } = await this.auth.verifyOtp(
      body.email,
      body.phone,
      body.code,
      body.firstName,
      body.lastName,
    );
    return { message: "Authenticated via OTP", data: { token, user } };
  }

  @Post("login")
  @ApiOperation({ summary: "Login with standard credentials (email and password)" })
  @ApiResponse({ status: 200, description: "Successfully authenticated" })
  async login(@Body() body: LoginDto) {
    const { user, token } = await this.auth.login(body.email, body.password);
    return { message: "Login successful", data: { token, user } };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current authenticated user profile" })
  @ApiResponse({ status: 200, description: "Returns current profile" })
  async me(@Req() req: { user: JwtPayload }) {
    const data = await this.auth.getMe(req.user.userId, req.user.role);
    return { data };
  }
}