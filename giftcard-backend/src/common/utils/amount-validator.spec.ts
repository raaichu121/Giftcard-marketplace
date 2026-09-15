import { validateAmount, isValidAmount, getAmountBoundary, formatAmount } from "./amount-validator";
import { GiftNowHttpException } from "../exceptions";

describe("amount-validator", () => {
  describe("validateAmount", () => {
    it("should allow valid integer amounts within range", () => {
      expect(() => validateAmount(100)).not.toThrow();
      expect(() => validateAmount(5000)).not.toThrow();
      expect(() => validateAmount(100000)).not.toThrow();
    });

    it("should throw error for non-integer amounts", () => {
      expect(() => validateAmount(100.5)).toThrow(GiftNowHttpException);
      expect(() => validateAmount(100.5)).toThrow("Amount must be a whole number");
    });

    it("should throw error for amounts below the minimum limit", () => {
      expect(() => validateAmount(99)).toThrow(GiftNowHttpException);
      expect(() => validateAmount(99)).toThrow("Amount must be between NPR 100 and NPR 100000");
    });

    it("should throw error for amounts above the maximum limit", () => {
      expect(() => validateAmount(100001)).toThrow(GiftNowHttpException);
      expect(() => validateAmount(100001)).toThrow("Amount must be between NPR 100 and NPR 100000");
    });
  });

  describe("isValidAmount", () => {
    it("should return true for valid integer amounts within range", () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(50000)).toBe(true);
      expect(isValidAmount(100000)).toBe(true);
    });

    it("should return false for invalid amounts", () => {
      expect(isValidAmount(99)).toBe(false);
      expect(isValidAmount(100001)).toBe(false);
      expect(isValidAmount(150.5)).toBe(false);
    });
  });

  describe("getAmountBoundary", () => {
    it("should return minimum and maximum boundaries", () => {
      const boundary = getAmountBoundary();
      expect(boundary).toEqual({ min: 100, max: 100000 });
    });
  });

  describe("formatAmount", () => {
    it("should format the amount in NPR correctly with commas", () => {
      expect(formatAmount(100)).toBe("NPR 100");
      expect(formatAmount(1000)).toBe("NPR 1,000");
      expect(formatAmount(100000)).toBe("NPR 100,000");
    });
  });
});