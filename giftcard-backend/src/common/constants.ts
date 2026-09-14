export const MIN_AMOUNT_NPR = 100;
export const MAX_AMOUNT_NPR = 100_000;
export const BULK_MIN_QUANTITY = 10;
export const MAX_PIN_ATTEMPTS = 5;

export function validateAmount(amount: number): string | null {
  if (
    !Number.isFinite(amount) ||
    amount < MIN_AMOUNT_NPR ||
    amount > MAX_AMOUNT_NPR
  ) {
    return `Amount must be between NPR ${MIN_AMOUNT_NPR} and NPR ${MAX_AMOUNT_NPR.toLocaleString("en-NP")}`;
  }
  if (!Number.isInteger(amount)) {
    return "Amount must be a whole rupee value";
  }
  return null;
}

export function toNumber(value: { toString(): string } | number | null): number {
  if (value === null || value === undefined) return 0;
  return parseFloat(String(value));
}