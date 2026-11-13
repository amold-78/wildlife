import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  MapPin,
  Star,
} from 'lucide-react';
import type { CheckpointCoord } from '../../utils/jungleTrailEngine';
import type { ProximityPhase, WildlifeSpeciesId } from '../../utils/jeepProximityEngine';
import {
  computeSlideDeckTransform,
  stepSlideIndex,
  type SlideDirection,
} from '../../utils/cardDeckEngine';
import { getReserveGallery, type ReserveSlide } from '../../data/reserveGallery';

export interface SafariRecord {
  id: string;
  name: string;
  state: string;
  pricePerPerson: number;
  rating: number;
  reviewCount: number;
  duration: string;
  bestTime: string;
  highlight: string;
  heroImage: string;
  overview: string;
}

export interface CheckpointLiveSighting {
  species: WildlifeSpeciesId;
  name: string;
  phase: ProximityPhase;
  statusLabel: string;
  distanceMeters: number;
  proximityFactor: number;
  foliageShakeDeg: number;
}

interface FieldJournalCheckpointProps {
  safari: SafariRecord;
  checkpoint: CheckpointCoord;
  slides?: ReserveSlide[];
  liveSighting?: CheckpointLiveSighting;
  isActive: boolean;
  isSaved: boolean;
  isDarkTheme: boolean;
  onToggleWishlist: (id: string) => void;
  onSelectSafari: (id: string) => void;
  innerRef?: (node: HTMLElement | null) => void;
}

function SlideImageFrame({
  src,
  alt,
  fallbackTitle,
}: {
  src: string;
  alt: string;
  fallbackTitle: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#173F35] via-[#0D2922] to-[#081713] flex flex-col items-center justify-center p-4 text-center text-[#E9DFC9]">
        <span className="font-serif text-xs font-semibold">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => setFailed(true)}
      className="w-full h-full object-cover select-none"
    />
  );
}

/**
 * Tactile, glassmorphic "Field Journal" checkpoint card featuring:
 * - Multi-image 2.5D layered sliding-flip photo deck
 * - Overlapping jungle vine & fern botanical frame accents breaking the flat box edge
 * - Real-time proximity wildlife sighting telemetry & arrival camera scale (`1.035`)
 */
export default function FieldJournalCheckpoint({
  safari,
  checkpoint,
  slides: providedSlides,
  liveSighting,
  isActive,
  isSaved,
  isDarkTheme,
  onToggleWishlist,
  onSelectSafari,
  innerRef,
}: FieldJournalCheckpointProps) {
  const slides =
    providedSlides && providedSlides.length > 0
      ? providedSlides
      : getReserveGallery(safari.id, safari.heroImage, safari.name);

  const [deckState, setDeckState] = useState<{
    activeIndex: number;
    prevIndex: number | null;
    direction: SlideDirection;
  }>({
    activeIndex: 0,
    prevIndex: null,
    direction: 1,
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  const dragStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Auto-flip cadence every 2 seconds across all reserve cards
  useEffect(() => {
    if (prefersReducedMotion || slides.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setDeckState((prev) => {
        const stepped = stepSlideIndex(prev.activeIndex, 1, slides.length, 'delta');
        return {
          activeIndex: stepped.nextIndex,
          prevIndex: stepped.prevIndex,
          direction: stepped.direction,
        };
      });
    }, 2000);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, slides.length]);

  const handleStep = (delta: number) => {
    setDeckState((prev) => {
      const stepped = stepSlideIndex(prev.activeIndex, delta, slides.length, 'delta');
      return {
        activeIndex: stepped.nextIndex,
        prevIndex: stepped.prevIndex,
        direction: stepped.direction,
      };
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartXRef.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null) return;
    const dx = e.clientX - dragStartXRef.current;
    dragStartXRef.current = null;
    if (Math.abs(dx) >= 32) {
      handleStep(dx < 0 ? 1 : -1);
    }
  };

  const useDarkSurface = true;

  // Spatial Alignment:
  // Mobile: Centered card (w-[94%] max-w-[420px] mx-auto) over the centered trail path
  // Desktop: Left card sits at 4%..42%, Right card sits at 58%..96%, leaving the 42%..58% center corridor clear
  const alignmentClass =
    checkpoint.cardSide === 'left'
      ? 'w-[94%] max-w-[420px] mx-auto px-1 sm:px-2 md:px-0 md:mr-auto md:ml-[4%] md:w-[38%] md:max-w-[440px]'
      : 'w-[94%] max-w-[420px] mx-auto px-1 sm:px-2 md:px-0 md:ml-auto md:mr-[4%] md:w-[38%] md:max-w-[440px]';

  const cardSurfaceStyle = isDarkTheme
    ? 'bg-[#081C16] text-[#F5F1E8] border-[#2C614F] shadow-[0_24px_48px_-14px_rgba(0,0,0,0.82)]'
    : 'bg-[#0B221B] text-[#F6F2E9] border-[#336B58] shadow-[0_24px_48px_-14px_rgba(0,0,0,0.72)]';

  const activeBorderClass = isActive
    ? 'border-[#E4B865] shadow-[0_28px_60px_-12px_rgba(0,0,0,0.85)]'
    : '';
  const arrivalScaleClass =
    isActive && !prefersReducedMotion ? 'md:scale-[1.035]' : 'scale-100';

  const mutedTextClass = 'text-[#C6D8D0]';
  const dividerClass = 'border-[#214B3D]/85';

  const currentSlide = slides[deckState.activeIndex] || slides[0];
  const vineShake = liveSighting?.foliageShakeDeg || 0;
  const isAlertSighting = liveSighting?.phase === 'alert';

  return (
    <article
      ref={innerRef}
      data-checkpoint-id={safari.id}
      data-active={isActive ? 'true' : 'false'}
      data-active-slide={deckState.activeIndex}
      data-sighting-phase={liveSighting?.phase || 'idle'}
      className={`relative z-40 w-full transition-transform duration-500 ease-out ${alignmentClass} ${arrivalScaleClass}`}
    >
      <div className="relative">
        {/* CARVED STONE & JUNGLE VINE CAVE ARCH FRAME (Top Edge Elevated Overpass) */}
        <div
          aria-hidden="true"
          className="absolute -top-3.5 inset-x-2 h-6 pointer-events-none z-30 drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)] overflow-visible"
        >
          <svg viewBox="0 0 400 24" fill="none" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            {/* Weathered Stone Canopy Ridge */}
            <path
              d="M 4 22 C 40 6, 120 4, 200 4 C 280 4, 360 6, 396 22 L 392 24 C 356 10, 280 8, 200 8 C 120 8, 44 10, 8 24 Z"
              fill="#263A32"
              stroke="#13231D"
              strokeWidth="1.2"
            />
            {/* Moss & Lichen Texture Highlights */}
            <path
              d="M 60 10 Q 110 6 160 9 M 240 9 Q 290 6 340 10"
              stroke="#4A7558"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Stalactite Rock Teeth & Hanging Roots */}
            <path d="M 95 12 L 100 20 L 105 12 Z" fill="#1C2D26" />
            <path d="M 195 10 L 200 22 L 205 10 Z" fill="#182721" />
            <path d="M 305 12 L 310 19 L 315 12 Z" fill="#1C2D26" />
          </svg>
        </div>

        {/* Top-Right Hanging Liana Vine & Teak Leaves Overlapping Card Frame */}
        <div
          aria-hidden="true"
          data-card-foliage="top-right"
          style={vineShake ? { transform: `rotate(${vineShake}deg)` } : undefined}
          className="absolute -top-4 -right-3.5 w-12 h-12 sm:w-14 sm:h-14 pointer-events-none z-35 drop-shadow-lg transition-transform duration-200"
        >
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <path d="M 100 0 Q 60 20 50 65 Q 40 85 20 95" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 60 25 Q 35 15 20 35 Q 45 40 60 25" fill="#15803D" opacity="0.9" />
            <path d="M 45 65 Q 20 55 10 75 Q 35 80 45 65" fill="#16A34A" opacity="0.9" />
          </svg>
        </div>

        {/* Bottom-Left Tropical Fern Frond Overlapping Lower Edge */}
        <div
          aria-hidden="true"
          data-card-foliage="bottom-left"
          style={vineShake ? { transform: `rotate(${-vineShake * 0.8}deg)` } : undefined}
          className="absolute -bottom-4 -left-3.5 w-12 h-12 sm:w-14 sm:h-14 pointer-events-none z-35 drop-shadow-lg transition-transform duration-200"
        >
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <path d="M 0 100 Q 30 70 65 50 Q 85 40 95 20" stroke="#14532D" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 30 75 Q 15 55 5 65 Q 20 80 30 75" fill="#15803D" opacity="0.85" />
            <path d="M 60 55 Q 45 35 35 45 Q 50 60 60 55" fill="#22C55E" opacity="0.9" />
          </svg>
        </div>

        {/* CARVED STONE CAVE SILL / OVERPASS ARCH (Bottom Edge Rock Base) */}
        <div
          aria-hidden="true"
          className="absolute -bottom-3.5 inset-x-2 h-6 pointer-events-none z-30 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] overflow-visible"
        >
          <svg viewBox="0 0 400 24" fill="none" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            {/* Weathered Stone Foundation Arch */}
            <path
              d="M 4 2 C 44 14, 120 18, 200 18 C 280 18, 356 14, 396 2 L 392 0 C 356 10, 280 14, 200 14 C 120 14, 44 10, 8 0 Z"
              fill="#1C2D26"
              stroke="#0E1914"
              strokeWidth="1.2"
            />
            {/* Hanging Tendril Vines & Moss Droplets */}
            <path d="M 80 14 Q 85 22 90 15" stroke="#2D5A3F" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 180 16 Q 185 24 190 17" stroke="#2D5A3F" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 290 14 Q 295 23 300 16" stroke="#2D5A3F" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>

        <div
          className={`rounded-2xl border overflow-hidden transition-all duration-300 ${cardSurfaceStyle} ${activeBorderClass}`}
        >
        {/* Top Field Coordinates & Elevation Bar */}
        <div
          className={`px-3.5 sm:px-4 py-2 border-b flex items-center justify-between gap-2 text-xs font-mono tabular-nums ${dividerClass} ${mutedTextClass}`}
        >
          <span className="inline-flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#C99A4A] shrink-0" />
            <span className="truncate">{checkpoint.coordinates}</span>
          </span>
          <span className="shrink-0 font-semibold text-[#C99A4A]">
            {checkpoint.elevationMeters} m
          </span>
        </div>

        {/* Multi-Image 2.5D Layered Sliding-Flip Photo Deck */}
        <div
          className="relative aspect-[16/10] bg-[#081A14] p-2.5 sm:p-3 overflow-hidden touch-pan-y"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            dragStartXRef.current = null;
          }}
        >
          {/* Reserve 24px on right inside stage so stacked cards visibly peek behind front card */}
          <div className="relative w-[calc(100%-24px)] h-full">
            {slides.map((slide, idx) => {
              const xform = computeSlideDeckTransform({
                index: idx,
                activeIndex: deckState.activeIndex,
                prevIndex: deckState.prevIndex,
                total: slides.length,
                direction: deckState.direction,
                reducedMotion: prefersReducedMotion,
              });

              const isPeek = xform.role === 'peek-1';
              const transitionCss =
                xform.transitionMode === 'none'
                  ? 'none'
                  : xform.transitionMode === 'fade'
                    ? 'opacity 420ms ease-out'
                    : 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms ease-out';

              return (
                <div
                  key={`${safari.id}-slide-${idx}`}
                  data-slide-index={idx}
                  data-slide-role={xform.role}
                  aria-hidden={xform.role !== 'active'}
                  onClick={isPeek ? () => handleStep(1) : undefined}
                  className={`absolute inset-0 rounded-xl overflow-hidden border border-white/25 will-change-transform ${
                    isPeek ? 'cursor-pointer' : ''
                  }`}
                  style={{
                    transform: xform.transform,
                    transformOrigin: xform.transformOrigin,
                    opacity: xform.opacity,
                    zIndex: xform.zIndex,
                    pointerEvents: xform.pointerEvents,
                    transition: transitionCss,
                  }}
                >
                  <SlideImageFrame
                    src={slide.src}
                    alt={slide.alt}
                    fallbackTitle={safari.name}
                  />

                  {/* Per-card bottom gradient scrim */}
                  <div className="absolute inset-x-0 bottom-0 h-22 bg-gradient-to-t from-black/88 via-black/40 to-transparent pointer-events-none" />
                </div>
              );
            })}

            {/* Active Photo Caption & Clean Minimalist Progress Bars (Zero icons on images) */}
            <div className="absolute inset-x-3 bottom-2.5 z-40 space-y-1.5 pointer-events-none">
              <div className="text-xs text-[#F4EBDA] font-medium truncate drop-shadow-md">
                {currentSlide?.caption || safari.highlight}
              </div>

              {slides.length > 1 && (
                <div
                  className="flex items-center gap-1.5"
                  role="tablist"
                  aria-label={`${safari.name} photo deck`}
                >
                  {slides.map((slide, idx) => {
                    const activeSegment = idx === deckState.activeIndex;
                    return (
                      <div
                        key={slide.caption}
                        className="flex-1 py-0.5"
                      >
                        <span
                          className={`block h-1 w-full rounded-sm transition-all duration-300 ${
                            activeSegment
                              ? 'bg-[#C99A4A]'
                              : 'bg-white/35'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Distilled Expedition Header, Live Sighting Badge & Explore Reserve CTA */}
        <div className="p-3.5 sm:p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3
                className={`font-serif text-lg sm:text-xl font-bold leading-snug ${
                  useDarkSurface ? 'text-[#F8F5EE]' : 'text-[#0D2922]'
                }`}
              >
                {safari.name}
              </h3>
              <p className={`text-xs mt-0.5 truncate ${mutedTextClass}`}>
                {safari.state} · {checkpoint.zoneTag}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
              {/* Rating */}
              <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums font-semibold text-[#E4B865]">
                <Star className="w-3.5 h-3.5 text-[#C99A4A] fill-current" />
                <span>{safari.rating}</span>
              </span>

              {/* Wishlist toggle */}
              <button
                type="button"
                aria-label={isSaved ? `Remove ${safari.name} from saved reserves` : `Save ${safari.name}`}
                onClick={() => onToggleWishlist(safari.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A] ${
                  isSaved
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#143B2F] text-white hover:bg-[#1C4E3F] border border-white/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Live Proximity Wildlife Sighting Telemetry Row */}
          {liveSighting && (
            <div
              className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 text-xs font-mono tabular-nums transition-colors duration-300 ${
                isAlertSighting
                  ? 'bg-[#173F35] text-[#F4EBDA] border-[#C99A4A]'
                  : useDarkSurface
                    ? 'bg-[#081713] text-[#B9CEC5] border-[#1E4438]'
                    : 'bg-[#F0E9D8] text-[#284239] border-[#DECFA8]'
              }`}
            >
              <span className="inline-flex items-center gap-1.5 truncate">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isAlertSighting ? 'bg-[#F5C975]' : 'bg-[#3B9B78]'
                  }`}
                />
                <span className="font-sans font-semibold truncate">{liveSighting.name}</span>
                <span className="opacity-85 truncate">· {liveSighting.statusLabel}</span>
              </span>
              <span className="shrink-0 text-[#C99A4A] font-semibold">
                {liveSighting.distanceMeters}m
              </span>
            </div>
          )}

          <div className={`pt-2.5 border-t flex items-center justify-between gap-2.5 ${dividerClass}`}>
            <p
              className={`text-base sm:text-lg font-bold tabular-nums whitespace-nowrap ${
                useDarkSurface ? 'text-[#F8F5EE]' : 'text-[#0D2922]'
              }`}
            >
              ₹{safari.pricePerPerson.toLocaleString('en-IN')}{' '}
              <span className={`text-xs font-normal ${mutedTextClass}`}>/ guest</span>
            </p>

            <button
              type="button"
              onClick={() => onSelectSafari(safari.id)}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] text-xs font-bold inline-flex items-center gap-1.5 transition-colors active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A]"
            >
              <span>View Gate &amp; Permits</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </article>
  );
}
