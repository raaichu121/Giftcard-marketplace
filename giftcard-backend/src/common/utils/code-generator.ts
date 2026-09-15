import { randomUUID, randomBytes, randomInt } from "crypto";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_RE = new RegExp(
  `^GN-[${CHARSET}]{4}-[${CHARSET}]{4}-[${CHARSET}]{4}-[${CHARSET}]{8}$`,
);

function randomSegment(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARSET[bytes[i] % CHARSET.length];
  }
  return out;
}

export function generateGiftNowCode(): string {
  const uuid = randomUUID().replace(/-/g, "").substring(0, 12).toUpperCase();
  const cleanUuid = uuid
    .split("")
    .map((c) => {
      if (c === "O") return "P";
      if (c === "0") return "2";
      if (c === "I") return "J";
      if (c === "1") return "3";
      return c;
    })
    .join("");
  const suffix = randomSegment(8);
  return `GN-${cleanUuid.slice(0, 4)}-${cleanUuid.slice(4, 8)}-${cleanUuid.slice(8, 12)}-${suffix}`;
}

export function normalizeGiftNowCode(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let body = cleaned.startsWith("GN") ? cleaned.slice(2) : cleaned;

  body = body
    .split("")
    .filter((c) => CHARSET.includes(c))
    .join("")
    .slice(0, 20);

  const seg1 = body.slice(0, 4);
  const seg2 = body.slice(4, 8);
  const seg3 = body.slice(8, 12);
  const seg4 = body.slice(12, 20);

  return ["GN", seg1, seg2, seg3, seg4].filter(Boolean).join("-");
}

export function isValidGiftNowCodeFormat(code: string): boolean {
  return CODE_RE.test(code.trim().toUpperCase());
}

export function generateSecurityPin(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}