import * as qrcode from "qrcode";

export async function generateQrCode(code: string): Promise<string> {
  try {
    const qrDataUrl = await qrcode.toDataURL(code, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error("QR Code generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
}

export async function generateQrCodeBuffer(code: string): Promise<Buffer> {
  try {
    const buffer = await qrcode.toBuffer(code);
    return buffer as Buffer;
  } catch (error) {
    console.error("QR Code buffer generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
}