"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Loader2, Sparkles } from "lucide-react";
import { SPOT_CATEGORIES } from "@/lib/spot-categories";
import { suggestSpotByRunner } from "@/app/dashboard/spots/actions";

export default function SuggestSpotModal() {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState("cafe");
  const [adresse, setAdresse] = useState("");
  const [lienMaps, setLienMaps] = useState("");
  const [motDuFondateur, setMotDuFondateur] = useState("");
  const [avantage, setAvantage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) {
      setErr("Donne un nom à l'adresse.");
      return;
    }
    setLoading(true);
    setErr(null);

    const res = await suggestSpotByRunner({
      nom,
      categorie,
      adresse,
      lien_maps: lienMaps,
      mot_du_fondateur: motDuFondateur,
      avantage,
    });

    setLoading(false);

    if ("error" in res && res.error) {
      setErr(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        setNom("");
        setAdresse("");
        setLienMaps("");
        setMotDuFondateur("");
        setAvantage("");
      }, 2500);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] text-xs font-black uppercase tracking-wider hover:bg-[#FF5500] hover:text-white transition-all shadow-sm cursor-pointer active:scale-[0.98]"
      >
        <Plus size={15} />
        Proposer une bonne adresse ou un bon plan
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl overflow-hidden border border-[#E8E8E8] text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F4F4EE]">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500]">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-black uppercase tracking-tight text-[#111111]">
                      Proposer une pépite au crew
                    </h3>
                    <p className="text-[11px] text-[#9CA3AF]">Transmis à ton capitaine pour validation</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F4F4EE] flex items-center justify-center text-[#9CA3AF] hover:text-black transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {success ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#DCFCE7] text-[#22C55E] flex items-center justify-center mx-auto">
                    <Check size={28} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-base font-black text-[#111111]">Merci pour le partage ! 🙌</h4>
                  <p className="text-xs text-[#6B7280] max-w-xs mx-auto leading-relaxed">
                    Ton bon plan a été transmis à ton capitaine. Dès validation, il apparaîtra sur le carnet d&apos;adresses du crew avec ton nom !
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* Nom */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Nom du lieu *</label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Boulangerie Mamiche, Café Nuances, Distance Shop…"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E8E8E8] text-sm text-[#111111] focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Catégorie */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Catégorie</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {SPOT_CATEGORIES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCategorie(c.value)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-center ${
                            categorie === c.value
                              ? "bg-[#FF5500] border-[#FF5500] text-white"
                              : "bg-[#F9F9F8] border-transparent text-[#6B7280] hover:bg-[#F0F0EE]"
                          }`}
                        >
                          <c.Icon size={16} strokeWidth={2} />
                          <span className="text-[9px] font-bold leading-tight">{c.short}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bon plan / Promo */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">
                      Bon plan ou Promo (optionnel)
                    </label>
                    <input
                      type="text"
                      value={avantage}
                      onChange={(e) => setAvantage(e.target.value)}
                      placeholder="Ex : -10% avec le t-shirt du crew · Café offert · Roulé cannelle"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E8E8E8] text-sm text-[#111111] focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Pourquoi recommander */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">
                      Pourquoi tu recommandes cette adresse
                    </label>
                    <input
                      type="text"
                      value={motDuFondateur}
                      onChange={(e) => setMotDuFondateur(e.target.value)}
                      placeholder="Ex : Les meilleurs croissants du quartier, le spot parfait pour l'after-run…"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E8E8E8] text-sm text-[#111111] focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Adresse */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">
                      Adresse ou quartier (optionnel)
                    </label>
                    <input
                      type="text"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      placeholder="12 rue de la Paix, Paris"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E8E8E8] text-sm text-[#111111] focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all"
                    />
                  </div>

                  {err && <p className="text-xs text-red-500 font-medium">{err}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-[#FF5500] text-white font-black uppercase tracking-wider text-xs hover:bg-[#E04B00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Envoyer à mon capitaine
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
