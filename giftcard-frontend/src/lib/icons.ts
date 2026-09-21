/** Icon keys map to PNG files in /public/assets/icons/ (Flaticon) */

export type IconKey =
  | "gift"
  | "shopping"
  | "food"
  | "grocery"
  | "travel"
  | "entertainment"
  | "gaming"
  | "fashion"
  | "electronics"
  | "wellness"
  | "wallet"
  | "birthday"
  | "wedding"
  | "graduation"
  | "anniversary"
  | "thankyou"
  | "home"
  | "festival"
  | "mountain"
  | "her"
  | "him"
  | "kids"
  | "parents"
  | "friends"
  | "colleagues"
  | "building"
  | "handshake"
  | "lightning"
  | "star"
  | "target"
  | "team"
  | "chart"
  | "fast"
  | "mobile"
  | "lock"
  | "money"
  | "store"
  | "tag"
  | "burger"
  | "scooter"
  | "cinema"
  | "popcorn"
  | "plane"
  | "hotel"
  | "laptop"
  | "gym"
  | "spa"
  | "controller"
  | "backpack"
  | "credit-card"
  | "esewa"
  | "khalti"
  | "fonepay"
  | "bank"
  | "professional"
  | "smartphone";

export function iconSrc(key: IconKey | string): string {
  return `/assets/icons/${key}.png`;
}

/** Occasion id → icon file key */
export const OCCASION_ICON: Record<string, IconKey> = {
  dashain: "festival",
  tihar: "festival",
  teej: "festival",
  losar: "mountain",
  birthday: "birthday",
  wedding: "wedding",
  graduation: "graduation",
  anniversary: "anniversary",
  thankyou: "thankyou",
  newhome: "home",
};

/** Category id → icon */
export const CATEGORY_ICON: Record<string, IconKey> = {
  all: "gift",
  shopping: "shopping",
  food: "food",
  grocery: "grocery",
  travel: "travel",
  entertainment: "entertainment",
  gaming: "gaming",
  fashion: "fashion",
  electronics: "electronics",
  wellness: "wellness",
  wallet: "wallet",
};

/** Brand id → icon (falls back to category) */
export const BRAND_ICON: Record<string, IconKey> = {
  daraz: "shopping",
  sastodeal: "tag",
  "hamrobazaar": "store",
  bhatbhateni: "grocery",
  foodmandu: "burger",
  "pathao-food": "scooter",
  bhoj: "food",
  qfx: "cinema",
  "civilbank-ent": "popcorn",
  "nepal-airlines": "plane",
  "buddha-air": "plane",
  "yeti-airlines": "mountain",
  esewa: "esewa",
  khalti: "khalti",
  "ime-pay": "mobile",
  fonepay: "fonepay",
  "samsung-np": "electronics",
  "it-store": "laptop",
  goldsgym: "gym",
  "nepal-spa": "spa",
  "pubg-np": "controller",
  "steam-np": "gaming",
  "zara-np": "fashion",
  "temple-tree": "hotel",
  "cg-hotels": "hotel",
  "thamel-com": "backpack",
  "giftnow-universal": "star",
  "visa-np": "credit-card",
};

export function getBrandIconKey(brandId: string, category: string): IconKey {
  return BRAND_ICON[brandId] ?? CATEGORY_ICON[category] ?? "gift";
}

export function getOccasionIconKey(occasionId: string): IconKey {
  return OCCASION_ICON[occasionId] ?? "gift";
}