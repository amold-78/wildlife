import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Lenis from 'lenis';
import { SAFARIS } from '../data/safaris';
import { WILDLIFE_DATA } from '../data/wildlife';
import { useBooking } from '../context/BookingContext';
import heroTigerImg from '../assets/images/hero_tadoba_tiger_1794551605341.jpg';
import nightCampImg from '../assets/images/camp_night_firelight_1794552953124.jpg';
import SafariFamilyJeep from '../components/jungle/SafariFamilyJeep';
import ParallaxJungleLayers from '../components/jungle/ParallaxJungleLayers';
import LivingBiomeOverlay from '../components/jungle/LivingBiomeOverlay';
import FieldJournalCheckpoint from '../components/jungle/FieldJournalCheckpoint';
import CompassMiniMapHud from '../components/jungle/CompassMiniMapHud';
import { getReserveGallery } from '../data/reserveGallery';
import { useJeepProximity } from '../hooks/useJeepProximity';
import {
  TRAIL_CHECKPOINTS,
  buildResponsiveSnakeTrail,
  computeAtmospherePhase,
  computeVelocityDynamics,
  resolveActiveCheckpointIndex,
} from '../utils/jungleTrailEngine';
import {
  Calendar,
  Users,
  ArrowRight,
  MapPin,
  ChevronDown,
  Check,
  Compass,
  Flame,
  Waves,
  ShieldCheck,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const CONSERVATION_PRINCIPLES = [
  {
    title: 'Respect Safe Distance',
    desc: 'Never bait, tease, or call out to force tiger or leopard movement.',
  },
  {
    title: 'Acoustic Silence',
    desc: 'Mute phones on dirt tracks so langur and spotted-deer alarm calls remain audible.',
  },
  {
    title: 'Zero Plastic Waste',
    desc: 'Carry out every wrapper and bottle from core and buffer gates without exception.',
  },
  {
    title: 'Natural Light Only',
    desc: 'Disable camera flashes and harsh spotlights as evening settles over the camp.',
  },
  {
    title: 'Honor Forest Guides',
    desc: 'Remain inside your open-top 4x4 and follow licensed naturalists at every bend.',
  },
];

function WildlifePreviewThumb({ src, alt, fallback }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className="w-full h-full bg-[#133329] flex items-center justify-center text-[#E9DFC9] text-xs font-serif p-2 text-center">
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover"
    />
  );
}

export default function HomePage({ onSelectSafari, onNavigate }) {
  const { wishlist, toggleWishlist, darkMode } = useBooking();

  // Search Box States
  const [selectedDestination, setSelectedDestination] = useState('tadoba-andhari');
  const [selectedDate, setSelectedDate] = useState('2026-10-18');
  const [guestCount, setGuestCount] = useState(2);
  const [destOpen, setDestOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);
  const destRef = useRef(null);
  const travelersRef = useRef(null);

  // Journey DOM & Animation Refs
  const trailCanvasRef = useRef(null);
  const roadPathRef = useRef(null);
  const backgroundOffsetRef = useRef(null);
  const topLeftFoliageRef = useRef(null);
  const topRightFoliageRef = useRef(null);
  const bottomLeftFoliageRef = useRef(null);
  const bottomRightFoliageRef = useRef(null);
  const mistOverlayRef = useRef(null);
  const firelightOverlayRef = useRef(null);
  const checkpointRefs = useRef([]);
  const lenisRef = useRef(null);

  // Vehicle Sub-Refs (mutated at 60fps without React re-renders)
  const jeepContainerRef = useRef(null);
  const chassisRef = useRef(null);
  const headlightRef = useRef(null);
  const dustGroupRef = useRef(null);
  const splashGroupRef = useRef(null);
  const wheelTreadRefs = useRef([]);
  const coPilotCameraRef = useRef(null);
  const kidBinocularRef = useRef(null);
  const kidPointerRef = useRef(null);

  const passengerRefs = useMemo(
    () => ({
      coPilotCameraRef,
      kidBinocularRef,
      kidPointerRef,
    }),
    [],
  );

  // Smooth Scroll State Refs
  const progressRef = useRef(0);
  const velocityRef = useRef(0);
  const wheelPhaseRef = useRef(0);
  const bearingRef = useRef(180);

  // Discrete React States (only updated on breakpoint resize or checkpoint transitions)
  const [canvasMetrics, setCanvasMetrics] = useState({
    width: 1280,
    height: 3600,
    isMobile: false,
    checkpointYs: null,
  });
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState(0);
  const [hudState, setHudState] = useState(() => ({
    atmosphere: computeAtmospherePhase(0),
    bearingDeg: 180,
  }));

  const safariMap = useMemo(() => {
    const map = new Map();
    for (const s of SAFARIS) map.set(s.id, s);
    return map;
  }, []);

  const currentSafari = safariMap.get(selectedDestination) || SAFARIS[0];

  const registerCheckpointRef = useCallback((idx) => {
    return (node) => {
      checkpointRefs.current[idx] = node;
    };
  }, []);

  // Close hero dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (destRef.current && !destRef.current.contains(event.target)) {
        setDestOpen(false);
      }
      if (travelersRef.current && !travelersRef.current.contains(event.target)) {
        setTravelersOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Measure independent trail canvas & checkpoint card positions cleanly (zero circular height write-back)
  useEffect(() => {
    const canvasEl = trailCanvasRef.current;
    if (!canvasEl) return;

    const measure = () => {
      const rect = canvasEl.getBoundingClientRect();
      const width = Math.max(320, Math.round(rect.width));
      const height = Math.max(1600, Math.round(canvasEl.scrollHeight));
      const isMobile = window.innerWidth < 768;

      const measuredYs = TRAIL_CHECKPOINTS.map((_, idx) => {
        const cardEl = checkpointRefs.current[idx];
        if (!cardEl) return null;
        const cRect = cardEl.getBoundingClientRect();
        return Math.round(cRect.top - rect.top + cRect.height * 0.44);
      });

      const validYs = measuredYs.every((v) => typeof v === 'number' && v > 0)
        ? measuredYs
        : null;

      setCanvasMetrics((prev) => {
        const sameSize =
          Math.abs(prev.width - width) <= 2 &&
          Math.abs(prev.height - height) <= 4 &&
          prev.isMobile === isMobile;
        const sameYs =
          validYs &&
          prev.checkpointYs &&
          validYs.every((y, idx) => Math.abs(y - prev.checkpointYs[idx]) <= 4);
        if (sameSize && (sameYs || !validYs)) return prev;
        return { width, height, isMobile, checkpointYs: validYs };
      });
    };

    const rafId = requestAnimationFrame(measure);
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(canvasEl);
    }
    window.addEventListener('resize', measure, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Compute deterministic S-curve trail geometry from latest dimensions
  const trailGeometry = useMemo(
    () => buildResponsiveSnakeTrail(canvasMetrics),
    [canvasMetrics],
  );

  // Real-Time 60fps Euclidean Proximity Wildlife Tracker
  const {
    anchors: wildlifeAnchors,
    registerAnimalNode,
    registerParticleNode,
    registerGlowNode,
    updateProximityFrame,
    telemetry: proximityTelemetry,
  } = useJeepProximity(trailGeometry, passengerRefs);

  // Main Lenis + GSAP ScrollTrigger + MotionPathPlugin Choreography
  useEffect(() => {
    const canvasEl = trailCanvasRef.current;
    const pathEl = roadPathRef.current;
    const jeepEl = jeepContainerRef.current;
    if (!canvasEl || !pathEl || !jeepEl) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let lenis = null;
    if (!prefersReducedMotion) {
      lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.92,
      });
      lenisRef.current = lenis;
      lenis.on('scroll', (e) => {
        velocityRef.current = typeof e?.velocity === 'number' ? e.velocity : 0;
        ScrollTrigger.update();
      });
    }

    let lastHudSync = 0;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(jeepEl, {
          motionPath: {
            path: pathEl,
            align: pathEl,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
            start: 0.06,
            end: 0.06,
          },
        });
        return;
      }

      gsap.to(jeepEl, {
        ease: 'none',
        motionPath: {
          path: pathEl,
          align: pathEl,
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
        },
        scrollTrigger: {
          trigger: canvasEl,
          start: 'top 76%',
          end: 'bottom 84%',
          scrub: 0.55,
          onUpdate: (self) => {
            const p = self.progress;
            progressRef.current = p;

            // Compute rotation angle directly from element GSAP rotation transform
            const rot = Number(gsap.getProperty(jeepEl, 'rotation')) || 180;
            bearingRef.current = rot;

            // Update active checkpoint when crossing waypoint threshold
            const nearestIdx = resolveActiveCheckpointIndex(p, trailGeometry.checkpointCoords);
            setActiveCheckpointIndex((prev) => (prev === nearestIdx ? prev : nearestIdx));

            // Update atmosphere overlays (Morning Mist -> Deep Canopy -> Night Camp Firelight)
            const atm = computeAtmospherePhase(p);
            if (mistOverlayRef.current) {
              mistOverlayRef.current.style.opacity = String(atm.mistOpacity);
            }
            if (firelightOverlayRef.current) {
              firelightOverlayRef.current.style.opacity = String(atm.firelightOpacity);
            }
            if (headlightRef.current) {
              const targetHeadlight = darkMode ? Math.max(0.85, atm.headlightOpacity) : atm.headlightOpacity;
              headlightRef.current.style.opacity = String(targetHeadlight);
            }

            // Parallax Plane 1 (Topographical background shifts slower than trail)
            if (backgroundOffsetRef.current) {
              backgroundOffsetRef.current.style.transform = `translate3d(0, ${Math.round(p * -56)}px, 0)`;
            }

            // Parallax Plane 3 (4-corner foliage parts outward and drifts vertically while scrolling)
            const foliageParting = Math.round(Math.sin(p * Math.PI) * 24);
            const foliageDriftY = Math.round(p * -120);
            if (topLeftFoliageRef.current) {
              topLeftFoliageRef.current.style.transform = `translate3d(${-foliageParting}px, ${foliageDriftY * 0.15}px, 0)`;
            }
            if (topRightFoliageRef.current) {
              topRightFoliageRef.current.style.transform = `translate3d(${foliageParting}px, ${-foliageDriftY * 0.15}px, 0)`;
            }
            if (bottomLeftFoliageRef.current) {
              bottomLeftFoliageRef.current.style.transform = `translate3d(${-foliageParting * 0.8}px, ${foliageDriftY * 0.1}px, 0)`;
            }
            if (bottomRightFoliageRef.current) {
              bottomRightFoliageRef.current.style.transform = `translate3d(${foliageParting * 0.8}px, ${-foliageDriftY * 0.1}px, 0)`;
            }

            // Throttle React HUD state updates cleanly (~12fps max) so DOM text stays responsive without thrashing
            const now = performance.now();
            if (now - lastHudSync > 80) {
              lastHudSync = now;
              setHudState({ atmosphere: atm, bearingDeg: rot });
            }
          },
        },
      });
    }, canvasEl);

    const totalPathLength =
      typeof pathEl.getTotalLength === 'function' ? pathEl.getTotalLength() : trailGeometry.height;

    // Velocity-locked physics & Euclidean wildlife proximity loop (60fps)
    const onTicker = (time) => {
      if (lenis) {
        lenis.raf(time * 1000);
      }

      const p = progressRef.current;
      let jeepX = trailGeometry.width * 0.5;
      let jeepY = Math.max(80, p * trailGeometry.height);
      if (typeof pathEl.getPointAtLength === 'function' && totalPathLength > 0) {
        const pt = pathEl.getPointAtLength(p * totalPathLength);
        jeepX = pt.x;
        jeepY = pt.y;
      }

      updateProximityFrame(
        {
          x: jeepX,
          y: jeepY,
          headingDeg: bearingRef.current,
          progress: p,
          velocity: velocityRef.current,
        },
        time,
        prefersReducedMotion,
      );

      if (prefersReducedMotion) return;

      // Decay velocity smoothly when wheel stops
      velocityRef.current *= 0.9;
      const dyn = computeVelocityDynamics(velocityRef.current, p);

      if (chassisRef.current) {
        chassisRef.current.setAttribute(
          'transform',
          `translate(0, ${dyn.suspensionOffsetPx}) rotate(${dyn.suspensionTiltDeg}, 48, 29)`,
        );
      }

      wheelPhaseRef.current = (wheelPhaseRef.current + dyn.wheelSpinDeltaDeg * 0.08) % 6;
      for (const treadEl of wheelTreadRefs.current) {
        if (treadEl) {
          treadEl.setAttribute('transform', `translate(${wheelPhaseRef.current.toFixed(2)}, 0)`);
        }
      }

      if (dustGroupRef.current) {
        dustGroupRef.current.style.opacity = String(dyn.dustIntensity);
      }
      if (splashGroupRef.current) {
        splashGroupRef.current.style.opacity = String(dyn.splashIntensity);
      }
    };

    gsap.ticker.add(onTicker);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(onTicker);
      ctx.revert();
      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
      }
    };
  }, [trailGeometry, darkMode, updateProximityFrame]);

  const handleJumpToCheckpoint = useCallback((index) => {
    const target = checkpointRefs.current[index];
    if (!target) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -110, duration: 1.05 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const safari = safariMap.get(selectedDestination);
    if (safari) {
      onSelectSafari(safari.id);
    } else {
      onNavigate('explore');
    }
  };

  return (
    <div className="relative">
      {/* 1. DAWN TRAILHEAD HERO */}
      <section className="relative min-h-[580px] lg:min-h-[630px] flex items-center justify-center bg-[#0D2922] text-white overflow-hidden px-4 sm:px-6">
        <div className="absolute inset-0 z-0">
          <img
            src={heroTigerImg}
            alt="Royal Bengal Tiger walking along a misty golden-hour red-earth track in Tadoba"
            width="1600"
            height="900"
            fetchPriority="high"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#0D2922]/55 to-[#2A2218]/90" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center pt-10 pb-16">
          <h1 className="font-serif [text-wrap:balance] text-[clamp(2.6rem,5.4vw,4.6rem)] font-bold tracking-tight text-white mb-4 leading-[1.06]">
            Drive the <span className="italic text-[#E4B865]">WildTrail.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#F4EBDA]/92 font-light leading-relaxed mb-9">
            Official gate permits, live safari routes, and certified naturalist expeditions across India&apos;s six great reserves.
          </p>

          {/* Expedition Search Bar (Deep Canopy Emerald & Field Brass Command Bar) */}
          <div className="max-w-4xl mx-auto bg-[#0B221B]/92 dark:bg-[#081A14]/94 backdrop-blur-xl p-2 sm:p-3 rounded-2xl border border-[#C99A4A]/50 shadow-[0_24px_60px_-14px_rgba(3,12,9,0.85)]">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
              {/* Destination */}
              <div ref={destRef} className="sm:col-span-4 text-left relative">
                <button
                  type="button"
                  aria-expanded={destOpen}
                  aria-label="Select safari destination"
                  onClick={() => {
                    setDestOpen(!destOpen);
                    setTravelersOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/6 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A]"
                >
                  <span className="block text-[11px] uppercase tracking-wider font-mono font-semibold text-[#E4B865] mb-0.5">
                    Destination Reserve
                  </span>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-[#C99A4A] shrink-0" />
                      <span className="font-semibold text-[#F8F3E8] text-xs sm:text-sm truncate">
                        {currentSafari.name.replace(' Tiger Reserve', '').replace(' National Park', '')} · {currentSafari.state}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#9AB3A8] shrink-0 transition-transform duration-200 ${
                        destOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {destOpen && (
                  <div className="absolute left-0 sm:left-auto sm:w-80 w-full top-full mt-2 bg-[#0B221B] border border-[#265244] rounded-xl p-1.5 z-50 text-left max-h-72 overflow-y-auto shadow-[0_24px_48px_-12px_rgba(2,10,7,0.9)]">
                    {SAFARIS.map((s) => {
                      const isSelected = s.id === selectedDestination;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedDestination(s.id);
                            setDestOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#173F35] text-[#F8F3E8] font-bold border border-[#C99A4A]/40'
                              : 'text-[#D8E6DF] hover:bg-white/6 hover:text-white'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-[#F8F3E8] text-xs">
                              {s.name}
                            </div>
                            <div className="text-[11px] text-[#9AB3A8]">
                              {s.state} · {s.highlight}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#E4B865] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="sm:col-span-3 text-left px-3.5 py-2.5 rounded-xl hover:bg-white/6 transition border-t sm:border-t-0 sm:border-l border-[#265244]/80">
                <label htmlFor="hero-expedition-date" className="block text-[11px] uppercase tracking-wider font-mono font-semibold text-[#E4B865] mb-0.5">
                  Expedition Date
                </label>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#C99A4A] shrink-0" />
                  <input
                    id="hero-expedition-date"
                    type="date"
                    value={selectedDate}
                    min="2026-10-06"
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="dark-date-input w-full bg-transparent font-semibold text-[#F8F3E8] text-xs sm:text-sm focus:outline-none cursor-pointer border-none tabular-nums"
                  />
                </div>
              </div>

              {/* Travelers */}
              <div
                ref={travelersRef}
                className="sm:col-span-2 text-left border-t sm:border-t-0 sm:border-l border-[#265244]/80 relative"
              >
                <button
                  type="button"
                  aria-expanded={travelersOpen}
                  aria-label="Select traveler count"
                  onClick={() => {
                    setTravelersOpen(!travelersOpen);
                    setDestOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/6 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A4A]"
                >
                  <span className="block text-[11px] uppercase tracking-wider font-mono font-semibold text-[#E4B865] mb-0.5">
                    Travelers
                  </span>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#C99A4A] shrink-0" />
                      <span className="font-semibold text-[#F8F3E8] text-xs sm:text-sm whitespace-nowrap tabular-nums">
                        {guestCount === 1 ? '1 Guest' : guestCount === 6 ? '6 (Gypsy)' : `${guestCount} Guests`}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#9AB3A8] shrink-0 transition-transform duration-200 ${
                        travelersOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {travelersOpen && (
                  <div className="absolute left-0 sm:left-auto sm:w-44 w-full top-full mt-2 bg-[#0B221B] border border-[#265244] rounded-xl p-1.5 z-50 text-left shadow-[0_24px_48px_-12px_rgba(2,10,7,0.9)]">
                    {[
                      { count: 1, label: '1 Guest' },
                      { count: 2, label: '2 Guests' },
                      { count: 4, label: '4 Guests' },
                      { count: 6, label: '6 (Full Gypsy)' },
                    ].map((opt) => {
                      const isSelected = guestCount === opt.count;
                      return (
                        <button
                          key={opt.count}
                          type="button"
                          onClick={() => {
                            setGuestCount(opt.count);
                            setTravelersOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#173F35] text-[#F8F3E8] font-bold border border-[#C99A4A]/40'
                              : 'text-[#D8E6DF] hover:bg-white/6 hover:text-white'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#E4B865]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="sm:col-span-3 pt-1 sm:pt-0">
                <button
                  type="submit"
                  className="w-full h-12 px-5 rounded-xl bg-[#C99A4A] hover:bg-[#D8AA5B] text-[#0D2922] font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer shadow-md"
                >
                  <span>Check Gate Permits</span>
                  <ArrowRight className="w-4 h-4 text-[#0D2922]" />
                </button>
              </div>
            </form>
          </div>

          <p className="mt-7 text-xs text-[#F4EBDA]/85 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>Official Forest Dept Gate Permits</span>
            <span aria-hidden="true">·</span>
            <span>Govt-Licensed Naturalists</span>
            <span aria-hidden="true">·</span>
            <span>Scroll below to drive the 4x4 trail</span>
          </p>
        </div>
      </section>

      {/* 2. CONTINUOUS WINDING S-CURVE SAFARI TRAIL (DARK EMERALD 3D DIORAMA) */}
      <section
        ref={trailCanvasRef}
        aria-label="Scroll-driven jungle expedition trail"
        className={`relative w-full overflow-hidden transition-colors duration-300 ${
          darkMode
            ? 'bg-gradient-to-b from-[#071A14] via-[#061611] to-[#040E0A]'
            : 'bg-gradient-to-b from-[#0B281F] via-[#092119] via-55% to-[#061610]'
        }`}
      >
        {/* Dynamic Volumetric Golden Dawn Mist Layer (fades smoothly into deep emerald canopy) */}
        <div
          ref={mistOverlayRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[1100px] z-0"
          style={{
            opacity: darkMode ? 0.25 : 0.85,
            background:
              'radial-gradient(ellipse 90% 55% at 50% 0%, rgba(228, 184, 101, 0.22) 0%, rgba(26, 82, 63, 0.18) 52%, transparent 85%)',
          }}
        />

        {/* Dynamic Fire-Lit Campfire Glow near Lower Trail */}
        <div
          ref={firelightOverlayRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[960px] z-0"
          style={{
            opacity: 0,
            background:
              'radial-gradient(circle at 50% 82%, rgba(229, 140, 58, 0.28) 0%, rgba(13, 36, 29, 0.2) 48%, transparent 78%)',
          }}
        />

        {/* 3-Plane Parallax Jungle Topography, S-Curve Dirt Road, Timber Bridge & 4-Corner Canopy */}
        <ParallaxJungleLayers
          geometry={trailGeometry}
          activeCheckpointIndex={activeCheckpointIndex}
          atmospherePhase={hudState.atmosphere.phase}
          backgroundOffsetRef={backgroundOffsetRef}
          topLeftFoliageRef={topLeftFoliageRef}
          topRightFoliageRef={topRightFoliageRef}
          bottomLeftFoliageRef={bottomLeftFoliageRef}
          bottomRightFoliageRef={bottomRightFoliageRef}
          roadPathRef={roadPathRef}
        />

        {/* Living Negative-Space Diorama & Proximity-Reactive Wildlife Ecosystem */}
        <LivingBiomeOverlay
          geometry={trailGeometry}
          anchors={wildlifeAnchors}
          atmospherePhase={hudState.atmosphere.phase}
          registerAnimalNode={registerAnimalNode}
          registerParticleNode={registerParticleNode}
          registerGlowNode={registerGlowNode}
          checkpointSightings={proximityTelemetry.checkpointSightings}
        />

        {/* Scroll-Locked Top-Down 4x4 Family Safari Jeep */}
        <SafariFamilyJeep
          refs={{
            containerRef: jeepContainerRef,
            chassisRef,
            headlightRef,
            dustGroupRef,
            splashGroupRef,
            wheelTreadRefs,
            coPilotCameraRef,
            kidBinocularRef,
            kidPointerRef,
          }}
          forceHeadlights={darkMode}
        />

        {/* Trailhead Quick Orientation Sign (offset cleanly beside road entry) */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8 flex justify-end md:justify-start md:pl-12">
          <div className="inline-flex items-center gap-3 rounded-xl px-4 py-2 bg-[#0D2922]/90 text-[#F4EBDA] border border-[#C99A4A]/45 text-xs">
            <Compass className="w-3.5 h-3.5 text-[#C99A4A] shrink-0" />
            <span className="font-semibold">6 Reserve Stops · Dawn to Night Camp</span>
          </div>
        </div>

        {/* 6 Winding Checkpoint Field Journal Cards */}
        <div className="relative z-20 max-w-[1260px] mx-auto px-2 sm:px-6 lg:px-10 pt-4 pb-20 space-y-20 sm:space-y-28 lg:space-y-32">
          {trailGeometry.checkpointCoords.slice(0, 3).map((cp) => {
            const safari = safariMap.get(cp.safariId);
            if (!safari) return null;
            return (
              <FieldJournalCheckpoint
                key={cp.safariId}
                safari={safari}
                checkpoint={cp}
                slides={getReserveGallery(safari.id, safari.heroImage, safari.name)}
                liveSighting={proximityTelemetry.checkpointSightings[cp.index]}
                isActive={activeCheckpointIndex === cp.index}
                isSaved={wishlist.includes(safari.id)}
                isDarkTheme={darkMode}
                onToggleWishlist={toggleWishlist}
                onSelectSafari={onSelectSafari}
                innerRef={registerCheckpointRef(cp.index)}
              />
            );
          })}

          {/* Mid-Trail River Crossing Bank Sign (offset to bank so wooden bridge & splashes stay 100% unobstructed) */}
          <div className="relative py-10 sm:py-14 flex justify-end md:justify-start pl-[21%] md:pl-12 pr-2 md:pr-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B2A2C] text-[#E5F6F5] border border-[#56A8A6]/50 text-xs whitespace-nowrap">
              <Waves className="w-4 h-4 text-[#7CD6D3] shrink-0" />
              <span className="font-semibold">Ramganga Bridge</span>
              <span className="font-mono tabular-nums text-[#9AE3E0]">· 420 m ford</span>
            </div>
          </div>

          {trailGeometry.checkpointCoords.slice(3).map((cp) => {
            const safari = safariMap.get(cp.safariId);
            if (!safari) return null;
            return (
              <FieldJournalCheckpoint
                key={cp.safariId}
                safari={safari}
                checkpoint={cp}
                slides={getReserveGallery(safari.id, safari.heroImage, safari.name)}
                liveSighting={proximityTelemetry.checkpointSightings[cp.index]}
                isActive={activeCheckpointIndex === cp.index}
                isSaved={wishlist.includes(safari.id)}
                isDarkTheme={darkMode}
                onToggleWishlist={toggleWishlist}
                onSelectSafari={onSelectSafari}
                innerRef={registerCheckpointRef(cp.index)}
              />
            );
          })}
        </div>
      </section>

      {/* 3. FIRE-LIT NIGHT CAMP FINALE */}
      <section className="relative bg-[#071510] text-[#F4EBDA] overflow-hidden border-t border-[#1D3E33]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-16">
          {/* Night Camp Feature & Smart Safari Finder Bridge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#C99A4A]/35">
                <img
                  src={nightCampImg}
                  alt="WildTrail twilight safari base camp illuminated by a warm campfire with a 4x4 Jeep parked nearby"
                  width="1200"
                  height="750"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#071510]/90 to-transparent pointer-events-none" />
                <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-xs text-[#F4EBDA]">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Flame className="w-4 h-4 text-[#E58C3A]" />
                    <span>Twilight Camp Terminus</span>
                  </span>
                  <span className="font-mono tabular-nums text-[#C99A4A]">All 6 Reserves Linked</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <h2 className="font-serif [text-wrap:balance] text-3xl sm:text-4xl font-bold text-white leading-tight">
                Match your family to the ideal tiger corridor.
              </h2>
              <p className="text-sm sm:text-base text-[#C8D8D0] leading-relaxed">
                Unsure which gate fits your season or children&apos;s pace? Use the Safari Finder to cross-reference waterhole sighting indices, monsoon windows, and full-Gypsy permit fares.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('finder')}
                  className="px-6 py-3 rounded-xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] font-bold text-sm inline-flex items-center gap-2 transition-colors active:scale-[0.98] whitespace-nowrap cursor-pointer"
                >
                  <span>Launch Safari Finder</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('wildlife')}
                  className="px-5 py-3 rounded-xl border border-[#2C5C4C] hover:border-[#C99A4A] text-[#F4EBDA] text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Open Wildlife Species Guide</span>
                </button>
              </div>

              {/* Compact Subcontinent Species Preview */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WILDLIFE_DATA.slice(0, 4).map((animal) => (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => onNavigate('wildlife')}
                    className="group text-left rounded-xl overflow-hidden border border-[#1E4438] bg-[#0B201A] hover:border-[#C99A4A]/70 transition-colors cursor-pointer"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#133329]">
                      <WildlifePreviewThumb
                        src={animal.image}
                        alt={animal.name}
                        fallback={animal.name}
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-white truncate">{animal.name}</p>
                      <p className="text-xs text-[#9EB7AC] truncate">{animal.conservationStatus}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5 Ethical NTCA Trail Principles at Camp */}
          <div className="pt-10 border-t border-[#18382D]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
              <div>
                <h2 className="font-serif [text-wrap:balance] text-2xl sm:text-3xl font-bold text-white">
                  Leave only tire tracks on designated forest roads.
                </h2>
                <p className="text-xs sm:text-sm text-[#B8CCC3] mt-1.5">
                  Five non-negotiable NTCA ethics shared around every WildTrail evening campfire.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#C99A4A] font-medium shrink-0">
                <ShieldCheck className="w-4 h-4" />
                <span>NTCA Core &amp; Buffer Code</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {CONSERVATION_PRINCIPLES.map((rule, idx) => (
                <div
                  key={rule.title}
                  className="rounded-xl p-4 bg-[#0C211B] border border-[#1D4236] flex flex-col"
                >
                  <span className="font-mono text-xs font-bold tabular-nums text-[#E58C3A] mb-2">
                    0{idx + 1}
                  </span>
                  <h3 className="font-sans font-semibold text-sm text-white mb-1">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-[#B3C8BF] leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. COLLAPSIBLE COMPASS & TRAIL PROGRESS HUD */}
      <CompassMiniMapHud
        atmosphere={hudState.atmosphere}
        bearingDeg={hudState.bearingDeg}
        activeCheckpointIndex={activeCheckpointIndex}
        checkpoints={trailGeometry.checkpointCoords}
        onJumpToCheckpoint={handleJumpToCheckpoint}
      />
    </div>
  );
}
