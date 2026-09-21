// Default /api/v1 uses next.config.js rewrite → backend
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api/v1";

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

// ==========================================
// Extracting Sub-Interfaces for Clean Syntax
// ==========================================
export interface CardValueBox {
  top: string;
  right: string;
  width: string;
}

export interface OccasionCard {
  id: string;
  name: string;
  imagePath: string;
  isDefault: boolean;
  valueBox: CardValueBox;
  valueColor: string;
}

export interface Occasion {
  id: string;
  slug: string;
  name: string;
  nepali: string;
  emoji: string;
  color: string;
  isActive: boolean;
  order: number;
  cards: OccasionCard[]; // Complies with bracket syntax []
}

const ERROR_MESSAGES: Record<string, string> = {
  GIFT_CARD_NOT_FOUND: "Gift card not found. Please check the code and try again.",
  GIFT_CARD_ALREADY_REDEEMED: "This gift card has already been redeemed.",
  GIFT_CARD_CANCELLED: "This gift card has been cancelled and can no longer be used.",
  INVALID_AMOUNT: "The amount provided is invalid.",
  INSUFFICIENT_WALLET: "Insufficient wallet balance for this transaction.",
  INVALID_PIN: "Incorrect PIN.",
  CARD_PIN_LOCKED: "This card has been locked due to too many failed PIN attempts. Please contact support.",
  RATE_LIMIT_EXCEEDED: "Too many attempts. Please wait a while and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
};

export class GiftNowApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "GiftNowApiError";
    this.code = code;
  }
}

const getHeaders = (): Record<string, string> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiCall = async <T = unknown>(
  endpoint: string,
  method: string = "GET",
  data?: unknown,
): Promise<ApiResponse<T> & Record<string, unknown>> => {
  const options: RequestInit = {
    method,
    headers: getHeaders(),
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorCode: string = json.error || "";
    const backendMsg = json.message;
    const friendlyMsg = ERROR_MESSAGES[errorCode];
    let displayMsg: string;

    if (backendMsg && backendMsg !== errorCode) {
      displayMsg = backendMsg;
    } else if (friendlyMsg) {
      displayMsg = friendlyMsg;
    } else if (typeof backendMsg === "string" && backendMsg) {
      displayMsg = backendMsg;
    } else {
      displayMsg = `Something went wrong (HTTP ${response.status}). Please try again.`;
    }

    throw new GiftNowApiError(errorCode, displayMsg);
  }
  return json;
};

export const authAPI = {
  login: (email: string, password: string) =>
    apiCall<{ token: string; user: Record<string, unknown> }>(
      "/auth/login",
      "POST",
      { email, password },
    ),

  googleLogin: (credential: string) =>
    apiCall<{ token: string; user: Record<string, unknown> }>(
      "/auth/google",
      "POST",
      { credential },
    ),

  sendOtp: (email?: string, phone?: string) =>
    apiCall<{ success: boolean; message: string }>(
      "/auth/otp/send",
      "POST",
      { email, phone },
    ),

  verifyOtp: (
    email?: string,
    phone?: string,
    code?: string,
    firstName?: string,
    lastName?: string,
  ) =>
    apiCall<{ token: string; user: Record<string, unknown> }>(
      "/auth/otp/verify",
      "POST",
      { email, phone, code, firstName, lastName },
    ),

  me: () => apiCall<Record<string, unknown>>("/auth/me"),
};

/** GiftNow SRS — platform wallet gift cards */
export const giftnowAPI = {
  purchase: (data: {
    type: "DIGITAL" | "PHYSICAL" | "CORPORATE_BULK";
    amount: number;
    recipientEmail?: string;
    recipientPhone?: string;
    deliveryChannel?: string;
    personalMessage?: string;
    deliveryAddress?: Record<string, unknown>;
    quantity?: number;
    cardDesignId?: string;
  }) => apiCall("/gift-cards/purchase", "POST", data),

  purchaseGuest: (data: {
    type: "DIGITAL" | "PHYSICAL" | "CORPORATE_BULK";
    amount: number;
    recipientEmail?: string;
    recipientPhone?: string;
    deliveryChannel?: string;
    personalMessage?: string;
    deliveryAddress?: Record<string, unknown>;
    quantity?: number;
    purchaserName: string;
    purchaserEmail: string;
    cardDesignId?: string;
  }) => apiCall("/gift-cards/purchase-guest", "POST", data),

  // Fixed Array syntax violation by referencing the `Occasion[]` type expression
  getOccasions: () =>
    apiCall<Occasion[]>("/gift-cards/occasions"),

  // Fixed Boolean naming convention by prefixing with 'is' and mapping to request body
  sendRedeemOtp: (code: string, channel?: string) =>
    apiCall<{
      requiresOtp: boolean;
      recipientEmail?: string;
      recipientPhone?: string;
      requiresChannelSelection?: boolean;
    }>(
      "/gift-cards/redeem/send-otp",
      "POST",
      { code, channel },
    ),

  redeem: (code: string, pin?: string, otp?: string) =>
    apiCall<{ walletBalance: number; credited: number; giftCardId: string }>(
      "/gift-cards/redeem",
      "POST",
      { code, pin, otp },
    ),

  getWallet: () =>
    apiCall<{
      accountId: string;
      balance: number;
      totalCredited: number;
      totalDebited: number;
    }>("/gift-cards/wallet"),

  getWalletHistory: (limit = 50, offset = 0) =>
    apiCall(`/gift-cards/wallet/history?limit=${limit}&offset=${offset}`),

  getPurchased: (limit = 50, offset = 0) =>
    apiCall(`/gift-cards/purchased?limit=${limit}&offset=${offset}`),

  debitForOrder: (amount: number, orderId: string) =>
    apiCall("/gift-cards/wallet/debit", "POST", { amount, orderId }),

  checkoutCalculate: (data: {
    itemTotal: number;
    couponCode?: string;
    useWallet?: boolean;
  }) => apiCall("/gift-cards/checkout/calculate", "POST", data),

  checkoutProcess: (data: {
    orderId: string;
    itemTotal: number;
    couponCode?: string;
    walletAmount: number;
    paymentMethod: string;
  }) => apiCall("/gift-cards/checkout/process", "POST", data),

  adminCreate: (data: Record<string, unknown>) =>
    apiCall("/gift-cards/admin/create", "POST", data),

  adminCancel: (id: string) =>
    apiCall(`/gift-cards/admin/cancel/${id}`, "POST"),

  adminResetPin: (id: string) =>
    apiCall<{ pin: string }>(`/gift-cards/admin/reset-pin/${id}`, "POST"),

  adminList: (filters?: Record<string, string>) =>
    apiCall(
      "/gift-cards/admin/list?" + new URLSearchParams(filters || "").toString(),
    ),

  adminAnalytics: () => apiCall("/gift-cards/admin/analytics"),

  adminBatch: (batchId: string) =>
    apiCall(`/gift-cards/admin/batch/${batchId}`),

  adminExport: (filters?: Record<string, string>) =>
    fetch(
      `${API_BASE_URL}/gift-cards/admin/export?` +
        new URLSearchParams(filters || "").toString(),
      { headers: getHeaders() },
    ),

  adminSetBulkDiscounts: (discounts: Array<{ minQuantity: number; maxQuantity: number; discountPercent: number }>) =>
    apiCall("/gift-cards/admin/bulk-discounts", "PUT", { discounts }),

  adminListOccasions: () =>
    apiCall<any[]>("/gift-cards/occasions/admin/list"),

  adminCreateOccasion: (data: {
    slug: string;
    name: string;
    nepali?: string;
    color?: string;
    isActive?: boolean;
    order?: number;
  }) => apiCall("/gift-cards/occasions/admin", "POST", data),

  adminUpdateOccasion: (
    id: string,
    data: {
      slug?: string;
      name?: string;
      nepali?: string;
      color?: string;
      isActive?: boolean;
      order?: number;
    },
  ) => apiCall(`/gift-cards/occasions/admin/${id}`, "PATCH", data),

  adminDeleteOccasion: (id: string) =>
    apiCall(`/gift-cards/occasions/admin/${id}`, "DELETE"),

  adminAddCard: (
    occasionId: string,
    data: {
      name: string;
      imagePath: string;
      isDefault?: boolean;
      valueBox: CardValueBox; // Reused explicit interface block here
      valueColor?: string;
    },
  ) => apiCall(`/gift-cards/occasions/admin/${occasionId}/cards`, "POST", data),

  adminDeleteCard: (cardId: string) =>
    apiCall(`/gift-cards/occasions/admin/cards/${cardId}`, "DELETE"),

  setDefaultCard: (occasionId: string, cardId: string) =>
    apiCall(`/gift-cards/occasions/admin/${occasionId}/cards/${cardId}/default`, "PATCH"),

  adminUploadCardImage: async (file: File, occasionSlug?: string): Promise<{ imagePath: string }> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const formData = new FormData();
    formData.append("file", file);

    const slugParam = occasionSlug ? `?occasionSlug=${encodeURIComponent(occasionSlug)}` : "";
    const response = await fetch(`${API_BASE_URL}/gift-cards/occasions/admin/upload-card${slugParam}`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "Failed to upload image");
    }
    return json;
  },

  getPublicSettings: () =>
    apiCall<{ minAmount: number; maxAmount: number; enabledTypes: string[]; enabledChannels: string[] }>("/gift-cards/settings/public"),

  getAdminSettings: () =>
    apiCall<{ minAmount: number; maxAmount: number; enabledTypes: string[]; enabledChannels: string[] }>("/gift-cards/admin/settings"),

  updateAdminSettings: (data: { minAmount: number; maxAmount: number; enabledTypes: string[]; enabledChannels: string[] }) =>
    apiCall<{ minAmount: number; maxAmount: number; enabledTypes: string[]; enabledChannels: string[] }>("/gift-cards/admin/settings", "PUT", data),
};

export const saveAuth = (token: string, user: Record<string, unknown>) => {
  localStorage.setItem("authToken", token);
  localStorage.setItem("authUser", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
};

export const getStoredUser = (): Record<string, unknown> | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};