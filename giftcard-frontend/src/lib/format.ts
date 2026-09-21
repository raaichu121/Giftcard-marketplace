export const CURRENCY = "NPR";
export const CURRENCY_SYMBOL = "Rs.";

/** API/Postgres DECIMAL fields often arrive as strings in JSON */
export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatNPR(amount: number | string): string {
  return `${CURRENCY_SYMBOL} ${toNumber(amount).toLocaleString("en-NP")}`;
}

export function formatUSD(value: unknown): string {
  return `$${toNumber(value).toFixed(2)}`;
}

export const NPR_PRESETS = [500, 1000, 2000, 5000, 10000, 25000];

export const PRICE_RANGES = [
  { id: "all", label: "All prices", min: 0, max: 100000 },
  { id: "under1k", label: "Under Rs. 1,000", min: 0, max: 1000 },
  { id: "1k-5k", label: "Rs. 1,000 - 5,000", min: 1000, max: 5000 },
  { id: "5k-10k", label: "Rs. 5,000 - 10,000", min: 5000, max: 10000 },
  { id: "10k+", label: "Rs. 10,000+", min: 10000, max: 100000 },
];