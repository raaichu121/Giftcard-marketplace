import { GiftCard } from "@prisma/client";

export function generateGiftCardCSV(cards: GiftCard[]): string {
  const headers = [
    "Code",
    "Type",
    "Amount",
    "Status",
    "Purchased By",
    "Redeemed By",
    "Recipient Email",
    "Personal Message",
    "Created At",
    "Redeemed At",
    "Cancelled At",
  ];

  const rows = cards.map((card) => [
    card.code,
    card.type,
    card.amount.toString(),
    card.status,
    card.purchasedByAccountId || "",
    card.redeemedByAccountId || "",
    card.recipientEmail || "",
    (card.personalMessage || "").replace(/"/g, '""'), // Escape quotes
    card.createdAt.toISOString(),
    card.redeemedAt ? card.redeemedAt.toISOString() : "",
    card.cancelledAt ? card.cancelledAt.toISOString() : "",
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          if (
            typeof cell === "string" &&
            (cell.includes(",") || cell.includes('"') || cell.includes("\n"))
          ) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return `"${cell}"`;
        })
        .join(","),
    ),
  ].join("\n");

  return csvContent;
}

export function streamGiftCardCSV(cards: GiftCard[]): NodeJS.ReadableStream {
  const { Readable } = require("stream");
  const csv = generateGiftCardCSV(cards);
  const readable = new Readable();
  readable.push(csv);
  readable.push(null);
  return readable;
}