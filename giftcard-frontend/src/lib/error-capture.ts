/**
 * Error tracking and recovery
 * Captures errors out-of-band so they can be recovered
 */

let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 5_000; // 5 second TTL

function recordError(error: unknown) {
  lastCapturedError = { error, at: Date.now() };
}

// Listen for global errors
if (typeof globalThis !== "undefined" && globalThis.addEventListener) {
  globalThis.addEventListener("error", (event) => {
    recordError((event as ErrorEvent).error ?? event);
  });

  globalThis.addEventListener("unhandledrejection", (event) => {
    recordError((event as PromiseRejectionEvent).reason);
  });
}

/**
 * Consume the last captured error (if not expired)
 */
export function consumeLastCapturedError(): unknown {
  if (!lastCapturedError) return undefined;

  // Check TTL
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }

  const { error } = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes("fetch") || error.message.includes("network");
  }
  return false;
}

/**
 * Check if error is a timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("timeout") || error.name === "TimeoutError";
  }
  return false;
}