"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type Lang = "en" | "ne";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.browse": "Browse Cards",
    "nav.deals": "Deals",
    "nav.rewards": "Rewards",
    "nav.buy": "Buy Cards",
    "nav.redeem": "Redeem",
    "nav.balance": "Balance",
    "nav.dashboard": "Dashboard",
    "nav.integrations": "Integrations",
    "nav.signin": "Sign in",
    "nav.merchant": "For Merchants",
    "hero.badge": "Nepal's #1 Gift Card Marketplace",
    "hero.title": "Gift cards for every Nepali celebration",
    "hero.subtitle": "200+ local brands · Instant eGift · Pay with eSewa, Khalti & more",
    "hero.search": "Search brands — Daraz, Foodmandu, QFX…",
    "hero.cta.buy": "Shop Gift Cards",
    "hero.cta.merchant": "Sell on GiftNow",
    "section.categories": "Shop by category",
    "section.occasions": "Shop by occasion",
    "section.recipients": "Shop by recipient",
    "section.popular": "Popular in Nepal",
    "section.deals": "Today's deals",
    "trust.esewa": "eSewa & Khalti accepted",
    "trust.instant": "Instant digital delivery",
    "trust.local": "Made for Nepal",
    "from": "From",
    "buyNow": "Buy Now",
    "viewAll": "View all",
    "digital": "Digital",
    "physical": "Physical",
    "rewards.title": "GiftNow Rewards",
    "rewards.subtitle": "Earn points on every purchase — 100 points = Rs 10 off",
  },
  ne: {
    "nav.home": "गृहपृष्ठ",
    "nav.browse": "कार्डहरू हेर्नुहोस्",
    "nav.deals": "अफरहरू",
    "nav.rewards": "पुरस्कार",
    "nav.buy": "कार्ड किन्नुहोस्",
    "nav.redeem": "रिडिम",
    "nav.balance": "ब्यालेन्स",
    "nav.dashboard": "ड्यासबोर्ड",
    "nav.integrations": "इन्टिग्रेसन",
    "nav.signin": "लगइन",
    "nav.merchant": "व्यापारीहरूका लागि",
    "hero.badge": "नेपालको प्रमुख गिफ्ट कार्ड बजार",
    "hero.title": "हरेक नेपाली उत्सवका लागि उपहार कार्ड",
    "hero.subtitle": "२००+ स्थानीय ब्रान्ड · तुरुन्त eGift · eSewa, Khalti बाट भुक्तानी",
    "hero.search": "ब्रान्ड खोज्नुहोस् — Daraz, Foodmandu, QFX…",
    "hero.cta.buy": "गिफ्ट कार्ड किन्नुहोस्",
    "hero.cta.merchant": "GiftNow मा बेच्नुहोस्",
    "section.categories": "श्रेणी अनुसार",
    "section.occasions": "अवसर अनुसार",
    "section.recipients": "प्राप्तकर्ता अनुसार",
    "section.popular": "नेपालमा लोकप्रिय",
    "section.deals": "आजका अफरहरू",
    "trust.esewa": "eSewa र Khalti स्वीकार्य",
    "trust.instant": "तुरुन्त डिजिटल डेलिभरी",
    "trust.local": "नेपालका लागि बनाइएको",
    "from": "बाट",
    "buyNow": "अहिले किन्नुहोस्",
    "viewAll": "सबै हेर्नुहोस्",
    "digital": "डिजिटल",
    "physical": "भौतिक",
    "rewards.title": "GiftNow पुरस्कार",
    "rewards.subtitle": "हरेक खरिदमा अंक — १०० अंक = रु. १० छुट",
  },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("giftnow_lang", l);
    }
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem("giftnow_lang") as Lang | null;
    if (saved === "en" || saved === "ne") setLangState(saved);
  }, []);

  const t = useCallback(
    (key: string) => translations[lang][key] || translations.en[key] || key,
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n requires LanguageProvider");
  return ctx;
}