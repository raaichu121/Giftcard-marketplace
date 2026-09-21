import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for safe Tailwind class merging
 * Prevents conflicting Tailwind classes from breaking styling
 * @example
 * cn("px-2 py-1", "px-4") // => "py-1 px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalizes first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncates string to specified length with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + "...";
}

/**
 * Checks if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Adds random jitter to a delay (useful for retries)
 */
export function jitterDelay(min = 100, max = 300): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Get query parameter from URL
 */
export function getQueryParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}