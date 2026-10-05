"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface OccasionCard {
  id: string;
  name: string;
  imagePath: string;
  isDefault: boolean;
  valueBox: {
    top: string;
    right: string;
    width: string;
  };
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
  cards: OccasionCard[];
}

interface CardPickerProps {
  occasions: Occasion[];
  selectedCard: OccasionCard | null;
  onSelectCard: (card: OccasionCard | null) => void;
}

export default function CardPicker({
  occasions,
  selectedCard,
  onSelectCard,
}: CardPickerProps) {
  // Filter active occasions only
  const activeOccasions = occasions.filter((o) => o.isActive);
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>("");

  React.useEffect(() => {
    if (activeOccasions.length > 0 && !selectedOccasionId) {
      const firstOcc = activeOccasions[0];
      setSelectedOccasionId(firstOcc.id);
      if (firstOcc.cards && firstOcc.cards.length > 0) {
        const defaultCard = firstOcc.cards.find((c) => c.isDefault) || firstOcc.cards[0];
        onSelectCard(defaultCard);
      }
    }
  }, [activeOccasions, selectedOccasionId, onSelectCard]);

  const currentOccasion = activeOccasions.find((o) => o.id === selectedOccasionId);
  const cards = currentOccasion ? currentOccasion.cards : [];

  return (
    <div className="space-y-4">
      {/* Occasion Selection Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-black uppercase tracking-wider block">
          Select Occasion / Festival
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">

          {activeOccasions.map((occ) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => {
                setSelectedOccasionId(occ.id);
                // Auto-select first/default design of this occasion if any exist
                if (occ.cards && occ.cards.length > 0) {
                  const defaultCard = occ.cards.find((c) => c.isDefault) || occ.cards[0];
                  onSelectCard(defaultCard);
                } else {
                  onSelectCard(null);
                }
              }}
              style={{
                borderColor: selectedOccasionId === occ.id ? occ.color : undefined,
                backgroundColor: selectedOccasionId === occ.id ? `${occ.color}22` : undefined,
                color: selectedOccasionId === occ.id ? "#000000" : undefined,
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-all duration-300 ${
                selectedOccasionId === occ.id
                  ? ""
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{occ.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card design selector grid for the selected occasion */}
      {selectedOccasionId !== "default" && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-black uppercase tracking-wider block">
            Choose Card Template
          </label>

          {cards.length === 0 ? (
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-xs text-slate-400">
                No custom card templates uploaded for this occasion yet.
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Standard gift card design will be used.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cards.map((card) => {
                const isSelected = selectedCard?.id === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => onSelectCard(card)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 aspect-[1.586/1] ${
                      isSelected
                        ? "border-gc-purple shadow-glow scale-[1.02]"
                        : "border-white/10 hover:border-white/20 hover:scale-[1.01]"
                    }`}
                  >
                    <Image
                      src={card.imagePath}
                      alt={card.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 200px"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />

                    {/* Selector overlay */}
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
                        isSelected ? "opacity-100" : "opacity-0 hover:opacity-20"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-8 h-8 rounded-full bg-gc-purple text-white flex items-center justify-center font-extrabold text-sm shadow-lg">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Name tag */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 px-2 py-1 text-[9px] text-white font-bold truncate">
                      {card.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}