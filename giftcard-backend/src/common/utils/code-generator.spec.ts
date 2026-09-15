import { generateGiftNowCode, normalizeGiftNowCode, isValidGiftNowCodeFormat } from "./code-generator";

describe("code-generator", () => {
  describe("generateGiftNowCode", () => {
    it("should generate a code that matches the prefix and segment structure", () => {
      const code = generateGiftNowCode();
      expect(code).toMatch(/^GN-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{8}$/);
    });

    it("should not contain illegal characters in generated codes", () => {
      const code = generateGiftNowCode();
      // O, 0, I, 1 are not allowed in the alphabet
      expect(code).not.toContain("O");
      expect(code).not.toContain("0");
      expect(code).not.toContain("I");
      expect(code).not.toContain("1");
    });

    it("should generate unique codes", () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateGiftNowCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe("normalizeGiftNowCode", () => {
    it("should normalize code to correct formatting with dashes and uppercase", () => {
      expect(normalizeGiftNowCode("gn-abcd-efgh-ijkl-mnopqrst")).toBe("GN-ABCD-EFGH-JKLM-NPQRST");
      expect(normalizeGiftNowCode("gnabcdefghijklmnopqrst")).toBe("GN-ABCD-EFGH-JKLM-NPQRST");
      expect(normalizeGiftNowCode("GN-ABCD-EFGH-JKLM-NPQRST")).toBe("GN-ABCD-EFGH-JKLM-NPQRST");
    });
  });

  describe("isValidGiftNowCodeFormat", () => {
    it("should return true for correctly formatted codes", () => {
      const validCode = generateGiftNowCode();
      expect(isValidGiftNowCodeFormat(validCode)).toBe(true);
      expect(isValidGiftNowCodeFormat("GN-ABCD-EFGH-JKLM-NPQRSTVW")).toBe(true);
    });

    it("should return false for invalid codes", () => {
      expect(isValidGiftNowCodeFormat("")).toBe(false);
      expect(isValidGiftNowCodeFormat("GN-ABCD-EFGH-JKLM")).toBe(false);
      expect(isValidGiftNowCodeFormat("ABCD-EFGH-JKLM-NPQRSTVW")).toBe(false); // missing GN prefix
      expect(isValidGiftNowCodeFormat("GN-1BCD-EFGH-JKLM-NPQRSTVW")).toBe(false); // contains '1' (not in charset)
    });
  });
});