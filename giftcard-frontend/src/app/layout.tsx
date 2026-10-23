import React, { ReactNode } from "react";
import "./globals.css";
import Providers from "@/components/providers/Providers";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Pacifico&display=swap"
          rel="stylesheet"
        />

        {/* Your responsive favicons and manifest are added right here */}
        <link rel="apple-touch-icon" sizes="180x180" href="/logo/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo/favicon-16x16.png" />
        <link rel="manifest" href="/logo/site.webmanifest" />

        <title>GiftNow | Premium Digital & Physical Gift Cards</title>
        <meta
          name="description"
          content="Experience the ultimate gifting platform. Instantly purchase, redeem, and manage digital and physical gift cards with high-grade security, instant wallet cashbacks, and 3D visualization."
        />
        <meta
          property="og:title"
          content="GiftNow - The Premium Gift Card Platform"
        />
        <meta
          property="og:description"
          content="Instantly purchase, send, and redeem digital or physical gift cards with real-time wallet credits."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body className="bg-[#0c0813] text-[#f1f5f9] antialiased selection:bg-gc-purple selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;