import type { IconKey } from "@/lib/icons";

export interface UserCustomCategory {
  id: string;
  name: string;
  nameNe?: string | null;
  icon: IconKey | string;
  description?: string | null;
  brandIds: string[];
  color?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const CATEGORY_ICON_OPTIONS: IconKey[] = [
  "gift",
  "shopping",
  "food",
  "grocery",
  "travel",
  "entertainment",
  "gaming",
  "fashion",
  "electronics",
  "wellness",
  "wallet",
  "birthday",
  "wedding",
  "festival",
  "star",
  "team",
  "money",
];

export const CATEGORY_COLOR_OPTIONS = [
  { id: "bg-purple-50", label: "Purple" },
  { id: "bg-red-50", label: "Red" },
  { id: "bg-blue-50", label: "Blue" },
  { id: "bg-amber-50", label: "Gold" },
  { id: "bg-emerald-50", label: "Green" },
  { id: "bg-pink-50", label: "Pink" },
];