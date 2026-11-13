import React, { useState } from 'react';
import {
  MapPin,
  Star,
  ArrowRight,
  Compass,
  Sparkles,
  X
} from 'lucide-react';
import PerchedHornbill from './wildlife/PerchedHornbill';

/**
 * DestinationCheckpointCard
 * Tactile glassmorphic "Field Journal" card that unfolds at each curve apex
 * as the expedition Jeep arrives.
 * Features:
 * - Subtle camera zoom-in (scale 1.04) on active arrival
 * - Physical environmental foliage overlapping the card border with soft shadows
 * - Top-frame perched hornbill bird anchor that takes flight on Jeep proximity
 */
export default function DestinationCheckpointCard({
  safari,
  index,
  isActive = false,
  isPassed = false,
  coordinates = '20°14\'N, 79°22\'E',
  elevation = '280m ASL',
  hasHornbill = false,
  hornbillCoords = { x: 0, y: 0 },
  onSelectSafari
}) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!safari) return null;

  return (
    <>
      <div
        className={`relative w-full max-w-md lg:max-w-lg transition-all duration-700 ease-out transform ${
          isActive
            ? 'opacity-100 scale-[1.04] translate-y-0 z-30'
            : isPassed
            ? 'opacity-85 scale-[0.98] translate-y-0 z-20'
            : 'opacity-40 scale-95 translate-y-6 pointer-events-none z-10'
        }`}
      >
        {/* ========================================================
            OVERLAPPING BIOME FOLIAGE (Breaks the Flat Web Box Illusion)
           ======================================================== */}
        
        {/* Top-Right Hanging Liana Vine & Teak Leaves Overlapping Card Frame */}
        <div className="absolute -top-6 -right-6 w-24 h-24 pointer-events-none z-30 drop-shadow-xl">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <path d="M 100 0 Q 60 20 50 65 Q 40 85 20 95" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 60 25 Q 35 15 20 35 Q 45 40 60 25" fill="#15803D" opacity="0.9" />
            <path d="M 45 65 Q 20 55 10 75 Q 35 80 45 65" fill="#16A34A" opacity="0.9" />
          </svg>
        </div>

        {/* Bottom-Left Tropical Fern Frond Overlapping Lower Edge */}
        <div className="absolute -bottom-6 -left-6 w-24 h-24 pointer-events-none z-30 drop-shadow-xl">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <path d="M 0 100 Q 30 70 65 50 Q 85 40 95 20" stroke="#14532D" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 30 75 Q 15 55 5 65 Q 20 80 30 75" fill="#15803D" opacity="0.85" />
            <path d="M 60 55 Q 45 35 35 45 Q 50 60 60 55" fill="#22C55E" opacity="0.9" />
          </svg>
        </div>

        {/* Optional Perched Hornbill on Card's Top Edge */}
        {hasHornbill && (
          <PerchedHornbill
            id={`card-hornbill-${safari.id}`}
            worldX={hornbillCoords.x}
            worldY={hornbillCoords.y}
          />
        )}

        {/* Main Glassmorphic Field Journal Container */}
        <article
          aria-label={`Field journal for ${safari.name}`}
          className={`relative rounded-3xl overflow-hidden border backdrop-blur-2xl shadow-2xl transition-all duration-500 ${
            isActive
              ? 'bg-[#0D2922]/94 dark:bg-[#071713]/94 border-[#C99A4A] ring-4 ring-[#C99A4A]/25 shadow-[#0D2922]/70'
              : 'bg-[#0D2922]/80 dark:bg-[#071713]/80 border-[#E9DFC9]/20 shadow-lg'
          } text-white p-5 sm:p-7 flex flex-col justify-between`}
        >
          {/* Top Specimen Header: GPS Coordinates & Station Marker */}
          <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] font-bold tracking-wider text-[#C99A4A]">
                STATION 0{index + 1} // {coordinates}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-stone-300 font-mono text-[10px]">
              <Compass className="w-3 h-3 text-[#C99A4A]" />
              <span>{elevation}</span>
            </div>
          </div>

          {/* High-Resolution Landscape Photography with Naturalist Badges */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 group bg-stone-900 border border-white/10">
            <img
              src={safari.heroImage}
              alt={safari.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Sighting Probability Pill */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#C99A4A]/40 text-xs font-semibold text-[#E9DFC9]">
              <span>🐅 Tiger Index:</span>
              <span className="font-bold text-emerald-400">
                {safari.wildlifeProbabilities[0]?.probability || "High (82%)"}
              </span>
            </div>

            {/* Star Rating Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-[#C99A4A] border border-white/10">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{safari.rating}</span>
              <span className="text-stone-300 font-normal">({safari.reviewCount})</span>
            </div>

            {/* Reserve State & Region */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C99A4A]" />
                <span className="font-semibold">{safari.state}, India</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#C99A4A]/30 border border-[#C99A4A]/50 text-[10px] font-bold text-[#E9DFC9] uppercase tracking-wider">
                {safari.highlight}
              </span>
            </div>
          </div>

          {/* Destination Narrative & Habitat Notes */}
          <div className="mb-5">
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
              {safari.name}
            </h3>
            <p className="text-xs sm:text-sm text-[#E9DFC9]/85 font-light leading-relaxed line-clamp-2">
              {safari.overview}
            </p>
          </div>

          {/* Key Wildlife Encounter Strip */}
          <div className="mb-5 p-3 rounded-2xl bg-black/30 border border-white/5">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#C99A4A] mb-2 flex items-center gap-1.5">
              <span>Prime Sighting Encounters:</span>
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {safari.wildlifeProbabilities.slice(0, 3).map((w, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] text-stone-200"
                >
                  <span>{w.icon}</span>
                  <span className="font-semibold">{w.animal}</span>
                  <span className="text-emerald-400 font-mono text-[10px]">({w.probability})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & Interactive Action Bar */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                Official Gate Permit
              </span>
              <p className="text-xl sm:text-2xl font-bold text-[#C99A4A]">
                ₹{safari.pricePerPerson.toLocaleString('en-IN')}{" "}
                <span className="text-xs font-normal text-stone-300">/ person</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Field Notes Modal Trigger */}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-[#E9DFC9] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="View Naturalist Field Notes"
                aria-label={`View field notes for ${safari.name}`}
              >
                <Compass className="w-4 h-4 text-[#C99A4A]" />
              </button>

              {/* Main Booking Expedition CTA */}
              <button
                type="button"
                onClick={() => onSelectSafari(safari.id)}
                className="px-5 py-3 rounded-2xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                <span>Book Permit</span>
                <ArrowRight className="w-4 h-4 text-[#0D2922]" />
              </button>
            </div>
          </div>
        </article>
      </div>

      {/* Naturalist Field Notes Popover Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Field notes for ${safari.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative w-full max-w-2xl bg-[#0D2922] border border-[#C99A4A] rounded-3xl p-6 sm:p-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-[#C99A4A] uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Official Reserve Field Notes</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {safari.name}
            </h3>

            <p className="text-sm text-[#E9DFC9]/90 font-light leading-relaxed mb-6">
              {safari.overview}
            </p>

            {/* Gate Zones */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C99A4A] mb-3">
                Authorized Forest Entry Gates
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safari.zones.map((zone, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{zone.name}</p>
                      <p className="text-stone-400 text-[11px]">{zone.entryGate}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
                      {zone.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sighting Seasons */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C99A4A] mb-3">
                Monthly Wildlife Activity Index
              </h4>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center">
                {safari.monthlySeason.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-1.5 rounded-lg border text-[10px] ${
                      m.status === 'peak'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold'
                        : m.status === 'excellent'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                        : m.status === 'limited'
                        ? 'bg-stone-500/20 border-stone-500/40 text-stone-400'
                        : 'bg-rose-950/30 border-rose-800/30 text-rose-300 opacity-60'
                    }`}
                  >
                    <p className="font-bold">{m.month}</p>
                    <p className="text-[8px] truncate">{m.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-white/20 text-stone-300 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Return to Trail
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  onSelectSafari(safari.id);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Reserve Permits for this Sanctuary</span>
                <ArrowRight className="w-4 h-4 text-[#0D2922]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
