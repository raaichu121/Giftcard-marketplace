"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import NepalFooter from "@/components/Footer";
import { giftnowAPI } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalContext";
import Image from "next/image";

interface OccasionCard {
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

interface Occasion {
  id: string;
  slug: string;
  name: string;
  nepali?: string;
  color: string;
  isActive: boolean;
  order: number;
  cards: OccasionCard[];
}

export default function AdminOccasionsPage() {
  const { user, isAdmin } = useAuth();
  const { openAuth } = useAuthModal();

  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Occasion form state
  const [occName, setOccName] = useState("");
  const [occSlug, setOccSlug] = useState("");
  const [occNepali, setOccNepali] = useState("");
  const [occColor, setOccColor] = useState("#2563eb");
  const [occActive, setOccActive] = useState(true);
  const [occOrder, setOccOrder] = useState("0");
  const [editingOccasionId, setEditingOccasionId] = useState<string | null>(null);

  // Card form state
  const [cardName, setCardName] = useState("");
  const [cardImagePath, setCardImagePath] = useState("");
  const [isDefaultCard, setIsDefaultCard] = useState(false);
  const [valueBoxTop, setValueBoxTop] = useState("48%");
  const [valueBoxRight, setValueBoxRight] = useState("6%");
  const [valueBoxWidth, setValueBoxWidth] = useState("34%");
  const [uploading, setUploading] = useState(false);

  // Fetch occasions list
  const loadOccasions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await giftnowAPI.adminListOccasions();
      if (res && res.data) {
        const sorted = (res.data as Occasion[]).sort((a, b) => a.order - b.order);
        setOccasions(sorted);
        
        // Refresh selected occasion reference if exists
        if (selectedOccasion) {
          const updated = sorted.find((o) => o.id === selectedOccasion.id);
          setSelectedOccasion(updated || null);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load occasions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadOccasions();
    }
  }, [user, isAdmin]);

  // Handle Occasion Submit (Create / Update)
  const handleOccasionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!occName.trim()) {
      setError("Name is required");
      return;
    }
    const slug = occSlug.trim() || occName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    try {
      if (editingOccasionId) {
        await giftnowAPI.adminUpdateOccasion(editingOccasionId, {
          name: occName.trim(),
          slug,
          nepali: occNepali.trim() || undefined,
          color: occColor,
          isActive: occActive,
          order: parseInt(occOrder, 10) || 0,
        });
        setSuccess("Occasion updated successfully!");
      } else {
        await giftnowAPI.adminCreateOccasion({
          name: occName.trim(),
          slug,
          nepali: occNepali.trim() || undefined,
          color: occColor,
          isActive: occActive,
          order: parseInt(occOrder, 10) || 0,
        });
        setSuccess("Occasion created successfully!");
      }
      resetOccasionForm();
      await loadOccasions();
    } catch (err: any) {
      setError(err.message || "Failed to save occasion");
    }
  };

  const handleEditOccasion = (occ: Occasion) => {
    setEditingOccasionId(occ.id);
    setOccName(occ.name);
    setOccSlug(occ.slug);
    setOccNepali(occ.nepali || "");
    setOccColor(occ.color);
    setOccActive(occ.isActive);
    setOccOrder(String(occ.order));
  };

  const handleDeleteOccasion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this occasion and all its card templates? This action cannot be undone.")) return;
    setError("");
    setSuccess("");
    try {
      await giftnowAPI.adminDeleteOccasion(id);
      setSuccess("Occasion deleted successfully!");
      if (selectedOccasion?.id === id) {
        setSelectedOccasion(null);
      }
      await loadOccasions();
    } catch (err: any) {
      setError(err.message || "Failed to delete occasion");
    }
  };

  const resetOccasionForm = () => {
    setEditingOccasionId(null);
    setOccName("");
    setOccSlug("");
    setOccNepali("");
    setOccColor("#2563eb");
    setOccActive(true);
    setOccOrder("0");
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setUploading(true);
    setError("");
    try {
      const res = await giftnowAPI.adminUploadCardImage(file, selectedOccasion?.slug);
      setCardImagePath(res.imagePath);
      // Auto-suggest name from filename if empty
      if (!cardName) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "") // remove extension
          .replace(/[-_]/g, " ")     // replace dashes/underscores with space
          .replace(/\b\w/g, c => c.toUpperCase()); // capitalize words
        setCardName(cleanName);
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Add Card Template handler
  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedOccasion) return;
    if (!cardName.trim()) {
      setError("Card template name is required");
      return;
    }
    if (!cardImagePath.trim()) {
      setError("Please upload or enter a card image path");
      return;
    }

    try {
      await giftnowAPI.adminAddCard(selectedOccasion.id, {
        name: cardName.trim(),
        imagePath: cardImagePath.trim(),
        isDefault: isDefaultCard,
        valueBox: {
          top: valueBoxTop,
          right: valueBoxRight,
          width: valueBoxWidth,
        },
        valueColor: "#000000",
      });
      setSuccess("Card template added successfully!");
      resetCardForm();
      await loadOccasions();
    } catch (err: any) {
      setError(err.message || "Failed to add card template");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Delete this card template?")) return;
    setError("");
    setSuccess("");
    try {
      await giftnowAPI.adminDeleteCard(cardId);
      setSuccess("Card template deleted.");
      await loadOccasions();
    } catch (err: any) {
      setError(err.message || "Failed to delete card template");
    }
  };

  const resetCardForm = () => {
    setCardName("");
    setCardImagePath("");
    setIsDefaultCard(false);
    setValueBoxTop("48%");
    setValueBoxRight("6%");
    setValueBoxWidth("34%");
  };

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-900">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("authRedirect", "/admin/giftnow/occasions");
                openAuth("signin");
              }}
              className="font-semibold text-blue-600 underline"
            >
              Sign in as admin
            </button>{" "}
            to manage occasions and templates.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePath="/admin/giftnow/occasions" showFooter={true}>
      <div className="bg-slate-50 text-slate-800 pb-12 flex-1">
        {/* Header Section */}
        <section className="py-6 border-b border-[#e5e5e5] bg-white">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16">
            <p className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-1">
              Create
            </p>
            <h1 className="text-[20px] md:text-[24px] font-bold text-black tracking-tight mb-1">
              Occasions & Card Designs
            </h1>
            <p className="text-[13px] text-[#666]">
              Manage occasions/festivals and configure value display overlays for gift card designs
            </p>
          </div>
        </section>

        {/* Alerts */}
        {(error || success) && (
          <div className="px-4 md:px-8 lg:px-12 xl:px-16 mt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm mb-4">
                {success}
              </div>
            )}
          </div>
        )}

        {/* Main Grid */}
        <div className="px-4 md:px-8 lg:px-12 xl:px-16 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Occasion List & Form */}
          <div className="lg:col-span-6 space-y-6">
            {/* Occasion Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-4">
                {editingOccasionId ? "Edit Occasion" : "Create Occasion"}
              </h2>
              <form onSubmit={handleOccasionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Occasion Name</label>
                  <input
                    type="text"
                    value={occName}
                    onChange={(e) => {
                      setOccName(e.target.value);
                      if (!editingOccasionId) {
                        setOccSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                      }
                    }}
                    placeholder="e.g. Dashain"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nepali translation (Optional)</label>
                    <input
                      type="text"
                      value={occNepali}
                      onChange={(e) => setOccNepali(e.target.value)}
                      placeholder="e.g. दशैं"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Theme Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={occColor}
                        onChange={(e) => setOccColor(e.target.value)}
                        className="w-10 h-9 p-0 border border-slate-200 rounded-lg cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={occColor}
                        onChange={(e) => setOccColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="occActive"
                    checked={occActive}
                    onChange={(e) => setOccActive(e.target.checked)}
                    className="w-4 h-4 accent-black rounded"
                  />
                  <label htmlFor="occActive" className="text-xs font-semibold text-slate-600 cursor-pointer">
                    Is Active (Visible to users)
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white hover:bg-neutral-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {editingOccasionId ? "Update Occasion" : "Create Occasion"}
                  </button>
                  {editingOccasionId && (
                    <button
                      type="button"
                      onClick={resetOccasionForm}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Occasions List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                  Occasions & Festivals
                </h2>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                  {occasions.length} Total
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {occasions.map((occ) => {
                  const isSelected = selectedOccasion?.id === occ.id;
                  return (
                    <div
                      key={occ.id}
                      onClick={() => setSelectedOccasion(occ)}
                      className={`relative p-4 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? "bg-slate-100/70" : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      {isSelected && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[4px]"
                          style={{ backgroundColor: occ.color }}
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{occ.name}</span>
                          {occ.nepali && (
                            <span className="text-xs text-slate-500 font-normal">({occ.nepali})</span>
                          )}
                          {!occ.isActive && (
                            <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold uppercase">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          slug: /{occ.slug} | Order: {occ.order}
                        </p>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md border">
                          {occ.cards.length} designs
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEditOccasion(occ)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                          title="Edit Occasion"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOccasion(occ.id)}
                          className="p-1 hover:bg-slate-200 rounded text-red-600 transition-colors"
                          title="Delete Occasion"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
                {occasions.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No occasions found. Create one above to start!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Cards Management */}
          <div className="lg:col-span-6 space-y-6">
            {/* Visual coordinate adjustment card templates form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                  {selectedOccasion ? `Upload Design to "${selectedOccasion.name}"` : "Upload Card Design"}
                </h2>
                <button
                  type="button"
                  onClick={resetCardForm}
                  className="text-xs text-gray-500 hover:text-black font-semibold"
                >
                  Clear Form
                </button>
              </div>

              <form onSubmit={handleAddCardSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Occasion / Festival Folder</label>
                    <select
                      value={selectedOccasion?.id || ""}
                      onChange={(e) => {
                        const occ = occasions.find((o) => o.id === e.target.value);
                        setSelectedOccasion(occ || null);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-black bg-white"
                      required
                    >
                      <option value="" disabled>Select Occasion</option>
                      {occasions.map((occ) => (
                        <option key={occ.id} value={occ.id}>
                          {occ.name} {occ.nepali ? `(${occ.nepali})` : `(/${occ.slug})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Design Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Dashain Classic"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-black"
                      disabled={!selectedOccasion}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Card Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                    disabled={!selectedOccasion}
                  />
                  {uploading && <p className="text-[10px] text-blue-600 mt-1 animate-pulse">Uploading...</p>}
                  {cardImagePath && (
                    <p className="text-[10px] text-emerald-600 mt-1">Uploaded path: {cardImagePath}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="cardDefault"
                    checked={isDefaultCard}
                    onChange={(e) => setIsDefaultCard(e.target.checked)}
                    className="w-4 h-4 accent-black rounded"
                    disabled={!selectedOccasion}
                  />
                  <label htmlFor="cardDefault" className={`text-xs font-semibold text-slate-600 cursor-pointer ${!selectedOccasion ? 'opacity-50' : ''}`}>
                    Set as Default Design for this occasion
                  </label>
                </div>

                {/* Visual Overlay coordinate sliders */}
                {cardImagePath && (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-4">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Visual Overlay Position Assistant
                    </p>

                    {/* Interactive Sliders */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between font-semibold mb-1 text-slate-600">
                          <span>Vertical Offset (Top): {valueBoxTop}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt(valueBoxTop, 10)}
                          onChange={(e) => setValueBoxTop(`${e.target.value}%`)}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold mb-1 text-slate-600">
                          <span>Right Margin Offset: {valueBoxRight}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt(valueBoxRight, 10)}
                          onChange={(e) => setValueBoxRight(`${e.target.value}%`)}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold mb-1 text-slate-600">
                          <span>Box Width: {valueBoxWidth}</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={parseInt(valueBoxWidth, 10)}
                          onChange={(e) => setValueBoxWidth(`${e.target.value}%`)}
                          className="w-full accent-black cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Live layout rendering card preview */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Live layout preview:</p>
                      <div className="relative rounded-xl overflow-hidden border border-slate-300 max-w-[320px] mx-auto shadow-md">
                        <Image
                          src={cardImagePath}
                          alt="live preview background"
                          width={400}
                          height={252}
                          style={{ width: "100%", height: "auto", display: "block" }}
                          unoptimized
                        />
                        {/* Value overlay box simulation */}
                        <div
                          style={{
                            position: "absolute",
                            top: valueBoxTop,
                            right: valueBoxRight,
                            width: valueBoxWidth,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            className="font-black text-center whitespace-nowrap text-black select-none"
                            style={{
                              fontSize: "clamp(8px, 4.5cqi, 20px)",
                              lineHeight: 1,
                            }}
                          >
                            Rs. 5,000
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedOccasion}
                  className="w-full bg-black text-white hover:bg-neutral-800 py-2 rounded-lg text-sm font-semibold transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Save Card Template
                </button>
              </form>
            </div>

            {selectedOccasion ? (
              /* Card designs list */
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-slate-100 pb-3">
                  Card Designs ({selectedOccasion.cards.length})
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {selectedOccasion.cards.map((card) => (
                    <div
                      key={card.id}
                      className={`relative rounded-xl border p-2 flex flex-col justify-between space-y-2 bg-slate-50 transition-all ${
                        card.isDefault ? "border-gc-purple shadow-sm bg-purple-50/20" : "border-slate-200"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <Image
                          src={card.imagePath}
                          alt={card.name}
                          width={300}
                          height={189}
                          style={{ width: "100%", height: "auto", display: "block" }}
                          unoptimized
                        />
                        {/* Simulated Price on existing thumbnail */}
                        <div
                          style={{
                            position: "absolute",
                            top: card.valueBox.top,
                            right: card.valueBox.right,
                            width: card.valueBox.width,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            className="font-black text-center text-black"
                            style={{
                              fontSize: "clamp(6px, 4cqi, 14px)",
                              lineHeight: 1,
                            }}
                          >
                            Rs. 1,000
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-xs text-slate-900 truncate block max-w-[80%]">
                            {card.name}
                          </span>
                          {card.isDefault && (
                            <span className="text-[8px] font-bold bg-gc-purple text-white px-1.5 py-0.5 rounded uppercase shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[8px] font-mono text-slate-400 truncate">
                          {card.imagePath}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 pt-1">
                        {!card.isDefault && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await giftnowAPI.setDefaultCard(selectedOccasion.id, card.id);
                                setSuccess("Set default card design.");
                                await loadOccasions();
                              } catch (err: any) {
                                setError(err.message || "Failed to set default");
                              }
                            }}
                            className="flex-1 border border-slate-200 bg-white hover:bg-slate-100 py-1 rounded text-[10px] font-semibold transition-colors text-slate-700"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="border border-red-200 hover:bg-red-50 py-1 px-2.5 rounded text-[10px] font-semibold transition-colors text-red-600"
                          title="Delete Template"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedOccasion.cards.length === 0 && (
                    <div className="col-span-2 p-8 text-center text-slate-500 text-xs">
                      No templates custom uploaded. Customers will see default fallback card design.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500 text-xs">
                Select an occasion/festival from the list below to view its existing card templates.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}