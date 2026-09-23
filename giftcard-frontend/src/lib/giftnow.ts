export const GIFTNOW_MIN_NPR = 100;
export const GIFTNOW_MAX_NPR = 100_000;

// Excludes confusing characters: 0 (zero), O (oh), 1 (one), I (eye)
const SAFE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Strict format validator: GN-XXXX-XXXX-XXXX-XXXXXXXX (22 chars including dashes)
const CODE_RE = new RegExp(
  `^GN-[${SAFE_ALPHABET}]{4}-[${SAFE_ALPHABET}]{4}-[${SAFE_ALPHABET}]{4}-[${SAFE_ALPHABET}]{8}$`,
);

/**
 * Generates a random gift card code
 * Format: GN-XXXX-XXXX-XXXX-XXXXXXXX using safe alphabet
 */
export function generateGiftNowCode(): string {
  const randSegment = (len: number): string => {
    let out = "";
    const cryptoObj =
      typeof globalThis !== "undefined" &&
      (globalThis as { crypto?: Crypto }).crypto
        ? (globalThis as { crypto: Crypto }).crypto
        : null;

    if (cryptoObj && cryptoObj.getRandomValues) {
      const buf = new Uint32Array(len);
      cryptoObj.getRandomValues(buf);
      for (let i = 0; i < len; i++) {
        out += SAFE_ALPHABET[buf[i] % SAFE_ALPHABET.length];
      }
    } else {
      // Fallback for non-secure environments
      for (let i = 0; i < len; i++) {
        out += SAFE_ALPHABET[Math.floor(Math.random() * SAFE_ALPHABET.length)];
      }
    }
    return out;
  };

  return `GN-${randSegment(4)}-${randSegment(4)}-${randSegment(4)}-${randSegment(8)}`;
}

/**
 * Formats gift card code (alias for maskGiftNowCodeInput)
 */
export function formatGiftNowCode(value: string): string {
  return maskGiftNowCodeInput(value);
}

/**
 * Normalizes gift card code input (alias for maskGiftNowCodeInput)
 */
export function normalizeGiftNowCodeInput(code: string): string {
  return maskGiftNowCodeInput(code);
}

/**
 * Masks and formats raw user input to GiftNow code format
 * - Converts to uppercase
 * - Removes non-alphanumeric characters
 * - Filters to safe alphabet only
 * - Auto-formats with dashes
 */
export function maskGiftNowCodeInput(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let body = cleaned.startsWith("GN") ? cleaned.slice(2) : cleaned;

  body = body
    .split("")
    .filter((c) => SAFE_ALPHABET.includes(c))
    .join("")
    .slice(0, 20);

  const seg1 = body.slice(0, 4);
  const seg2 = body.slice(4, 8);
  const seg3 = body.slice(8, 12);
  const seg4 = body.slice(12, 20);

  return ["GN", seg1, seg2, seg3, seg4].filter(Boolean).join("-");
}

/**
 * Validates gift card code format strictly
 * Returns true only if code matches: GN-XXXX-XXXX-XXXX-XXXXXXXX
 */
export function isValidGiftNowCodeFormat(code: string): boolean {
  return CODE_RE.test(code.trim().toUpperCase());
}

/**
 * Validates gift card amount is within allowed range
 * Returns error message if invalid, null if valid
 */
export function validateGiftNowAmount(amount: number): string | null {
  if (
    !Number.isFinite(amount) ||
    amount < GIFTNOW_MIN_NPR ||
    amount > GIFTNOW_MAX_NPR
  ) {
    return `Amount must be between NPR ${GIFTNOW_MIN_NPR} and NPR ${GIFTNOW_MAX_NPR.toLocaleString(
      "en-NP",
    )}`;
  }
  if (!Number.isInteger(amount)) {
    return "Enter a whole rupee amount";
  }
  return null;
}

/**
 * Formats amount as Indian-style NPR currency
 * Uses comma grouping: 1,00,000 for 100000
 * @example
 * formatNPR(2500) // => "NPR 2,500"
 * formatNPR(100000) // => "NPR 1,00,000"
 */
export function formatNPR(n: number): string {
  const negative = n < 0;
  const abs = Math.abs(Math.round(n));
  const s = abs.toString();

  let result: string;
  if (s.length <= 3) {
    result = s;
  } else {
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    // Indian style: group by 2s for thousands, then 3s
    result = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }

  return (negative ? "-" : "") + "NPR " + result;
}

/**
 * Formats ISO date string as DD MMM YYYY
 * @example
 * formatDate("2026-05-27T10:30:00Z") // => "27 May 2026"
 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats ISO date and time as DD MMM YYYY, HH:MM
 * @example
 * formatDateTime("2026-05-27T10:30:00Z") // => "27 May 2026, 04:15 PM"
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace(" am", " AM").replace(" pm", " PM");
}