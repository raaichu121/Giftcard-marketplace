import { HttpException, HttpStatus } from "@nestjs/common";

export type GiftNowErrorCode =
  | "GIFT_CARD_NOT_FOUND"
  | "GIFT_CARD_ALREADY_REDEEMED"
  | "GIFT_CARD_CANCELLED"
  | "INVALID_AMOUNT"
  | "INSUFFICIENT_WALLET"
  | "INVALID_PIN"
  | "CARD_PIN_LOCKED"
  | "RATE_LIMIT_EXCEEDED"
  | "CHANNEL_DISABLED"
  | "UNAUTHORIZED";

const STATUS: Record<GiftNowErrorCode, HttpStatus> = {
  GIFT_CARD_NOT_FOUND: HttpStatus.NOT_FOUND,
  GIFT_CARD_ALREADY_REDEEMED: HttpStatus.CONFLICT,
  GIFT_CARD_CANCELLED: HttpStatus.GONE,
  INVALID_AMOUNT: HttpStatus.UNPROCESSABLE_ENTITY,
  INSUFFICIENT_WALLET: HttpStatus.UNPROCESSABLE_ENTITY,
  INVALID_PIN: HttpStatus.FORBIDDEN,
  CARD_PIN_LOCKED: 423 as HttpStatus,
  RATE_LIMIT_EXCEEDED: HttpStatus.TOO_MANY_REQUESTS,
  CHANNEL_DISABLED: HttpStatus.FORBIDDEN,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
};

export class GiftNowHttpException extends HttpException {
  constructor(code: GiftNowErrorCode, message?: string) {
    super(
      { error: code, message: message ?? code },
      STATUS[code],
    );
  }
}