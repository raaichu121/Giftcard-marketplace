import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { GiftNowHttpException } from "../common/exceptions";
import { JwtPayload } from "../auth/jwt-payload.interface";

const ipAttempts = new Map<string, { count: number; resetAt: number }>();
const accountAttempts = new Map<string, { count: number; resetAt: number }>();
const HOUR_MS = 60 * 60 * 1000;
const MAX_IP = 30;
const MAX_ACCOUNT = 20;

// Prune expired rate limit entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ipAttempts.entries()) {
    if (now > val.resetAt) ipAttempts.delete(key);
  }
  for (const [key, val] of accountAttempts.entries()) {
    if (now > val.resetAt) accountAttempts.delete(key);
  }
}, 10 * 60 * 1000).unref();

function bump(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  max: number,
): boolean {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + HOUR_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

@Injectable()
export class RedeemRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      ip?: string;
      user?: JwtPayload;
    }>();
    const ip = req.ip || "unknown";
    if (bump(ipAttempts, ip, MAX_IP)) {
      throw new GiftNowHttpException("RATE_LIMIT_EXCEEDED");
    }
    if (req.user?.userId && bump(accountAttempts, req.user.userId, MAX_ACCOUNT)) {
      throw new GiftNowHttpException("RATE_LIMIT_EXCEEDED");
    }
    return true;
  }
}