import { GiftNowHttpException } from "../exceptions";

const MIN_AMOUNT = 100;
const MAX_AMOUNT = 100000;

export function validateAmount(amount: number): void {
  if (!Number.isInteger(amount)) {
    throw new GiftNowHttpException(
      "INVALID_AMOUNT",
      "Amount must be a whole number",
    );
  }

  if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    throw new GiftNowHttpException(
      "INVALID_AMOUNT",
      `Amount must be between NPR ${MIN_AMOUNT} and NPR ${MAX_AMOUNT}`,
    );
  }
}

export function isValidAmount(amount: number): boolean {
  return (
    Number.isInteger(amount) && amount >= MIN_AMOUNT && amount <= MAX_AMOUNT
  );
}

export function getAmountBoundary() {
  return { min: MIN_AMOUNT, max: MAX_AMOUNT };
}

export function formatAmount(amount: number): string {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}