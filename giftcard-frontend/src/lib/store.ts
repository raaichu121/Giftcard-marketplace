import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Auth Store - Manages authentication state
 * Persists to localStorage for session recovery
 */
interface AuthStore {
  token: string | null;
  user: any | null;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token: string) => set({ token }),
      setUser: (user: any) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "giftnow-auth-store", // localStorage key
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }), // Only persist these fields
    },
  ),
);

/**
 * Gift Card Store - Manages gift card state
 * Persists card list and selected card
 */
interface GiftCardStore {
  giftCards: any[];
  selectedCard: any | null;
  loading: boolean;
  setGiftCards: (cards: any[]) => void;
  setSelectedCard: (card: any) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useGiftCardStore = create<GiftCardStore>()(
  persist(
    (set) => ({
      giftCards: [],
      selectedCard: null,
      loading: false,
      setGiftCards: (cards: any[]) => set({ giftCards: cards }),
      setSelectedCard: (card: any) => set({ selectedCard: card }),
      setLoading: (loading: boolean) => set({ loading }),
      reset: () => set({ giftCards: [], selectedCard: null, loading: false }),
    }),
    {
      name: "giftnow-card-store",
      partialize: (state) => ({
        giftCards: state.giftCards,
        selectedCard: state.selectedCard,
      }),
    },
  ),
);

/**
 * UI Store - Manages global UI state
 * Does NOT persist (resets on page reload)
 */
interface UIStore {
  isDrawerOpen: boolean;
  message: string;
  messageType: "success" | "error" | "info" | "warning";
  toggleDrawer: () => void;
  showMessage: (
    msg: string,
    type: "success" | "error" | "info" | "warning",
  ) => void;
  clearMessage: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isDrawerOpen: false,
  message: "",
  messageType: "info",
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  showMessage: (msg: string, type: "success" | "error" | "info" | "warning") =>
    set({ message: msg, messageType: type }),
  clearMessage: () => set({ message: "", messageType: "info" }),
}));