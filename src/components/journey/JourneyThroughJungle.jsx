import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Lenis from 'lenis';

import { SAFARIS } from '../../data/safaris';
import JungleTrailCanvas from './JungleTrailCanvas';
import SafariHeroJeep from './SafariHeroJeep';
import DestinationCheckpointCard from './DestinationCheckpointCard';
import ExpeditionHUD from './ExpeditionHUD';
import JungleAtmosphere from './JungleAtmosphere';

// Proximity Wildlife Ecosystem Components
import SpatialWildlifeProvider from './wildlife/SpatialWildlifeManager';
import { useSpatialWildlife } from './wildlife/useSpatialWildlife';
import TigerStalker from './wildlife/TigerStalker';
import ChitalDeerHerd from './wildlife/ChitalDeerHerd';
import CanopyMonkeys from './wildlife/CanopyMonkeys';
import RiverElephants from './wildlife/RiverElephants';
import RanthamboreLeopard from './wildlife/RanthamboreLeopard';
import KazirangaRhino from './wildlife/KazirangaRhino';

import {
  Compass,
  ArrowDown,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Radio,
  Flame,
  CheckCircle2,
  ChevronDown,
  Check
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Destination checkpoint elevation and coordinates metadata
const CHECKPOINT_META = [
  { coords: "20°14'N, 79°22'E", elevation: "280m ASL", river: true },
  { coords: "21°41'N, 79°18'E", elevation: "420m ASL", river: true },
  { coords: "22°20'N, 80°38'E", elevation: "640m ASL", river: false },
  { coords: "26°01'N, 76°30'E", elevation: "310m ASL", river: false },
  { coords: "29°32'N, 78°56'E", elevation: "780m ASL", river: true },
  { coords: "26°40'N, 93°21'E", elevation: "120m ASL", river: true }
];

function JourneyThroughJungleInner({ onSelectSafari, onNavigate }) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const jeepRef = useRef(null);
  const { updateProximity, nearestAlertAnimal } = useSpatialWildlife();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(90);
  const [isRiverCrossing, setIsRiverCrossing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Search Engine States (Hero Trailhead Gate)
  const [selectedDestination, setSelectedDestination] = useState("tadoba-andhari");
  const [selectedDate, setSelectedDate] = useState("2026-10-18");
  const [guestCount, setGuestCount] = useState(2);
  const [destOpen, setDestOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);

  // Dimensions & S-Curve Geometry State
  const [geometry, setGeometry] = useState({
    width: 1400,
    height: 5800,
    stations: [],
    riverCrossings: [],
    roadPathData: ''
  });

  // Calculate S-Curve geometry dynamically based on screen width
  const calculateGeometry = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth || window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const height = isMobile ? 6200 : 5800;

    // 6 Outer Curve Bends corresponding to the 6 safari reserves
    const stations = SAFARIS.slice(0, 6).map((safari, i) => {
      const meta = CHECKPOINT_META[i] || CHECKPOINT_META[0];
      const isEven = i % 2 === 0;

      const startY = isMobile ? 850 : 780;
      const stepY = isMobile ? 880 : 800;
      const y = startY + i * stepY;

      let x;
      if (isMobile) {
        x = isEven ? width * 0.68 : width * 0.32;
      } else if (isTablet) {
        x = isEven ? width * 0.70 : width * 0.30;
      } else {
        x = isEven ? width * 0.65 : width * 0.35;
      }

      return {
        id: safari.id,
        name: safari.name,
        safari,
        x,
        y,
        align: isEven ? 'left' : 'right',
        coords: meta.coords,
        elevation: meta.elevation,
        river: meta.river
      };
    });

    // Start at Hero Gate Top Center
    const startPt = { x: width * 0.5, y: 160 };
    // End at Fire-Lit Base Camp Bottom Center
    const endPt = { x: width * 0.5, y: height - 250 };

    let d = `M ${startPt.x} ${startPt.y}`;
    let prev = startPt;

    stations.forEach((st) => {
      const midY = (prev.y + st.y) / 2;
      d += ` C ${prev.x} ${midY}, ${st.x} ${midY}, ${st.x} ${st.y}`;
      prev = st;
    });

    const finalMidY = (prev.y + endPt.y) / 2;
    d += ` C ${prev.x} ${finalMidY}, ${endPt.x} ${finalMidY}, ${endPt.x} ${endPt.y}`;

    const riverCrossings = [
      { x: width * 0.48, y: height * 0.22 },
      { x: width * 0.52, y: height * 0.49 },
      { x: width * 0.46, y: height * 0.77 }
    ];

    setGeometry({
      width,
      height,
      stations,
      riverCrossings,
      roadPathData: d
    });
  }, []);

  // Window resize observer
  useEffect(() => {
    calculateGeometry();
    const handleResize = () => calculateGeometry();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateGeometry]);

  // Initialize Lenis Inertial Scrolling + GSAP ScrollTrigger Integration
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateLenis);
    };
  }, []);

  // Scroll tracking and physics loop
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const currentScrolled = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScrolled / totalScrollable));

      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dy = window.scrollY - lastScrollY;
      const vel = dy / dt;

      lastScrollY = window.scrollY;
      lastTime = now;

      setScrollVelocity(vel);
      setScrollProgress(rawProgress);

      const stationCount = geometry.stations.length;
      if (stationCount > 0) {
        const activeIdx = Math.min(
          stationCount - 1,
          Math.max(0, Math.round(rawProgress * (stationCount - 0.2)))
        );
        setActiveCheckpointIndex(activeIdx);
      }

      const isWater =
        (rawProgress > 0.19 && rawProgress < 0.24) ||
        (rawProgress > 0.46 && rawProgress < 0.52) ||
        (rawProgress > 0.74 && rawProgress < 0.79);
      setIsRiverCrossing(isWater);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [geometry.stations]);

  // Vehicle coordinate, tangent rotation, and spatial proximity broadcast loop
  useEffect(() => {
    let animId;

    const updateJeepPosition = () => {
      if (!isPaused && pathRef.current && jeepRef.current) {
        const path = pathRef.current;
        const totalLength = path.getTotalLength ? path.getTotalLength() : 0;

        if (totalLength > 0) {
          const distance = scrollProgress * totalLength;
          const point = path.getPointAtLength(distance);

          const forwardOffset = 4;
          const lookAhead = Math.min(distance + forwardOffset, totalLength);
          const nextPoint = path.getPointAtLength(lookAhead);

          let angle = 90;
          if (nextPoint && point) {
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          }

          setCurrentAngle(angle);

          // Update proximity engine with Jeep's instantaneous position
          updateProximity(point.x, point.y, scrollVelocity);

          // Apply hardware accelerated transform
          jeepRef.current.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-28px, -48px) rotate(${angle}deg)`;
        }
      }

      animId = requestAnimationFrame(updateJeepPosition);
    };

    animId = requestAnimationFrame(updateJeepPosition);
    return () => cancelAnimationFrame(animId);
  }, [scrollProgress, isPaused, updateProximity, scrollVelocity]);

  // Calculate passenger neck swivel angle relative to Jeep's orientation
  let targetPassengerAngle = 0;
  if (nearestAlertAnimal) {
    // Angle from Jeep to animal in world space
    const worldAngleToAnimal = (Math.atan2(nearestAlertAnimal.dy, nearestAlertAnimal.dx) * 180) / Math.PI;
    // Relative to Jeep heading
    targetPassengerAngle = worldAngleToAnimal - currentAngle;
    // Normalize to [-180, 180]
    while (targetPassengerAngle < -180) targetPassengerAngle += 360;
    while (targetPassengerAngle > 180) targetPassengerAngle -= 360;
  }

  // Jump to specific checkpoint smoothly
  const handleJumpToCheckpoint = (index) => {
    const station = geometry.stations[index];
    if (station) {
      const yOffset = -window.innerHeight * 0.35;
      const targetY = station.y + yOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (selectedDestination) {
      onSelectSafari(selectedDestination);
    } else {
      onNavigate('explore');
    }
  };

  const currentSafari = SAFARIS.find((s) => s.id === selectedDestination) || SAFARIS[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#081813] text-stone-100 overflow-x-hidden selection:bg-[#C99A4A] selection:text-[#0D2922]"
      style={{ minHeight: geometry.height }}
    >
      {/* 1. Dynamic Atmospheric Lighting & Embers Controller */}
      <JungleAtmosphere scrollProgress={scrollProgress} />

      {/* 2. Environmental Canvas (Background Map, Volumetric God Rays, S-Curve Dirt Road, Bridges, Foliage) */}
      <JungleTrailCanvas
        pathRef={pathRef}
        roadPathData={geometry.roadPathData}
        pathDimensions={{ width: geometry.width, height: geometry.height }}
        stations={geometry.stations}
        riverCrossings={geometry.riverCrossings}
        scrollProgress={scrollProgress}
        scrollVelocity={scrollVelocity}
        activeCheckpointIndex={activeCheckpointIndex}
      />

      {/* 3. PROXIMITY-REACTIVE WILDLIFE (Populating the Negative Space Around Cards) */}
      
      {/* Tadoba Bend 1 Wildlife: Bengal Tiger stalking in bamboo & Chital Deer herd in clearing */}
      <TigerStalker
        id="tadoba-tiger"
        worldX={geometry.width >= 1024 ? geometry.width * 0.82 : geometry.width * 0.88}
        worldY={geometry.stations[0]?.y || 820}
      />
      <ChitalDeerHerd
        id="tadoba-deer"
        worldX={geometry.width >= 1024 ? geometry.width * 0.22 : geometry.width * 0.16}
        worldY={(geometry.stations[0]?.y || 820) + 120}
      />

      {/* Pench Bend 2 Wildlife: Langur Monkeys swinging across canopy vines */}
      <CanopyMonkeys
        id="pench-monkeys"
        worldX={geometry.width >= 1024 ? geometry.width * 0.18 : geometry.width * 0.15}
        worldY={geometry.stations[1]?.y || 1620}
      />

      {/* Ranthambore Bend 4 Wildlife: Leopard lounging on ancient sandstone fort ruins */}
      <RanthamboreLeopard
        id="ranthambore-leopard"
        worldX={geometry.width >= 1024 ? geometry.width * 0.16 : geometry.width * 0.14}
        worldY={geometry.stations[3]?.y || 3220}
      />

      {/* Jim Corbett Bend 5 Wildlife: Asian Elephant herd wading in Ramganga rapids with water spray */}
      <RiverElephants
        id="corbett-elephants"
        worldX={geometry.width >= 1024 ? geometry.width * 0.84 : geometry.width * 0.86}
        worldY={geometry.stations[4]?.y || 4050}
      />

      {/* Kaziranga Bend 6 Wildlife: Greater One-Horned Rhino in tall elephant grass */}
      <KazirangaRhino
        id="kaziranga-rhino"
        worldX={geometry.width >= 1024 ? geometry.width * 0.18 : geometry.width * 0.15}
        worldY={geometry.stations[5]?.y || 4900}
      />

      {/* 4. The Hero Safari 4x4 Jeep with Family (With Dynamic Passenger Head Tracking) */}
      <SafariHeroJeep
        jeepRef={jeepRef}
        scrollVelocity={scrollVelocity}
        isRiverCrossing={isRiverCrossing}
        nightFactor={Math.max(0, (scrollProgress - 0.55) / 0.45)}
        targetPassengerAngle={targetPassengerAngle}
      />

      {/* 5. Collapsible Telemetry HUD (Magnetic Compass, Altimeter, Waypoint Jumps) */}
      <ExpeditionHUD
        currentAngle={currentAngle}
        scrollProgress={scrollProgress}
        activeCheckpointIndex={activeCheckpointIndex}
        destinations={geometry.stations}
        elevation={CHECKPOINT_META[activeCheckpointIndex]?.elevation || "340m ASL"}
        scrollVelocity={scrollVelocity}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onJumpToCheckpoint={handleJumpToCheckpoint}
      />

      {/* ========================================================
          6. THE HERO TRAILHEAD ENTRANCE GATE (Top of the Jungle)
         ======================================================== */}
      <header className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-24 text-center">
        
        {/* Live Forest Department Field Sighting Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-[#C99A4A]/50 text-[#E9DFC9] text-xs font-semibold mb-6 shadow-xl">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[#C99A4A] font-bold">LIVE SAFARI REPORT:</span>
          <span>Tadoba Telia Lake dawn patrol reports 2 Tigers & Leopard sightings</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08] drop-shadow-lg">
          Journey Through <span className="italic text-[#C99A4A]">the Jungle.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#E9DFC9]/90 font-light leading-relaxed mb-10 drop-shadow">
          Follow India's most extraordinary overland safari trail. Scroll to steer your open-top 4x4 Gypsy through premier tiger reserves, cross bamboo river bridges, and secure official forest permits.
        </p>

        {/* Tactile Trailhead Gate Search Console */}
        <div className="max-w-4xl mx-auto bg-[#0D2922]/95 backdrop-blur-2xl p-2.5 sm:p-3.5 rounded-3xl shadow-2xl border border-[#C99A4A]/40 mb-10">
          <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
            
            {/* Destination Selector */}
            <div
              className="sm:col-span-4 text-left px-3.5 py-2.5 rounded-2xl hover:bg-white/5 transition cursor-pointer relative"
              onClick={() => {
                setDestOpen(!destOpen);
                setTravelersOpen(false);
              }}
            >
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#C99A4A] mb-1">
                Sanctuary Trailhead
              </span>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-[#C99A4A] shrink-0" />
                  <span className="font-bold text-white text-xs sm:text-sm truncate">
                    {currentSafari.name.replace(" Tiger Reserve", "").replace(" National Park", "")}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${destOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Destination Dropdown Popover */}
              {destOpen && (
                <div className="absolute left-0 sm:left-auto sm:w-80 w-full top-full mt-2 bg-[#0A1F18] border border-[#C99A4A]/40 rounded-2xl shadow-2xl p-1.5 z-50 text-left max-h-72 overflow-y-auto">
                  {SAFARIS.map((s) => {
                    const isSelected = s.id === selectedDestination;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDestination(s.id);
                          setDestOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40'
                            : 'text-stone-200 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white text-xs">{s.name}</div>
                          <div className="text-[11px] text-stone-400">{s.state} · {s.highlight}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Expedition Date Picker */}
            <div className="sm:col-span-3 text-left px-3.5 py-2.5 rounded-2xl hover:bg-white/5 transition border-t sm:border-t-0 sm:border-l border-white/10">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#C99A4A] mb-1">
                Expedition Date
              </span>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#C99A4A] shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  min="2026-10-06"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-transparent font-bold text-white text-xs sm:text-sm focus:outline-none cursor-pointer border-none"
                />
              </div>
            </div>

            {/* Travelers Count */}
            <div
              className="sm:col-span-2 text-left px-3.5 py-2.5 rounded-2xl hover:bg-white/5 transition border-t sm:border-t-0 sm:border-l border-white/10 relative"
              onClick={() => {
                setTravelersOpen(!travelersOpen);
                setDestOpen(false);
              }}
            >
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#C99A4A] mb-1">
                Travelers
              </span>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C99A4A] shrink-0" />
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {guestCount === 6 ? '6 (Gypsy)' : `${guestCount} Guests`}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${travelersOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Travelers Dropdown Popover */}
              {travelersOpen && (
                <div className="absolute left-0 sm:left-auto sm:w-44 w-full top-full mt-2 bg-[#0A1F18] border border-[#C99A4A]/40 rounded-2xl shadow-2xl p-1.5 z-50 text-left">
                  {[
                    { count: 1, label: '1 Guest' },
                    { count: 2, label: '2 Guests' },
                    { count: 4, label: '4 Guests' },
                    { count: 6, label: '6 (Full Gypsy)' }
                  ].map((opt) => (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGuestCount(opt.count);
                        setTravelersOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                        guestCount === opt.count
                          ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40'
                          : 'text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {guestCount === opt.count && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Launch Expedition Search CTA */}
            <div className="sm:col-span-3 pt-2 sm:pt-0">
              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                <span>Launch Trail</span>
                <Compass className="w-4 h-4 text-[#0D2922]" />
              </button>
            </div>
          </form>
        </div>

        {/* Scroll Steer Indicator */}
        <div className="flex flex-col items-center justify-center gap-2 text-xs font-semibold text-[#E9DFC9]/80 animate-bounce">
          <span>Scroll to drive the Gypsy down the trail</span>
          <ArrowDown className="w-4 h-4 text-[#C99A4A]" />
        </div>
      </header>

      {/* ========================================================
          7. DESTINATION CHECKPOINTS (Placed Along the S-Curve Outer Bends)
         ======================================================== */}
      <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pointer-events-none">
        {geometry.stations.map((station, index) => {
          const isActive = activeCheckpointIndex === index;
          const isPassed = scrollProgress >= (index / (geometry.stations.length - 1)) - 0.04;

          const isDesktop = geometry.width >= 1024;
          let containerStyle = {
            position: 'absolute',
            top: `${station.y - 120}px`
          };

          if (isDesktop) {
            if (station.align === 'left') {
              containerStyle.left = '4%';
            } else {
              containerStyle.right = '4%';
            }
          } else {
            containerStyle.left = '50%';
            containerStyle.transform = 'translateX(-50%)';
            containerStyle.width = '92%';
          }

          // Kanha card carries perched Hornbill
          const hasHornbill = index === 2;

          return (
            <div
              key={station.id}
              style={containerStyle}
              className="pointer-events-auto"
            >
              <DestinationCheckpointCard
                safari={station.safari}
                index={index}
                isActive={isActive}
                isPassed={isPassed}
                coordinates={station.coords}
                elevation={station.elevation}
                hasHornbill={hasHornbill}
                hornbillCoords={{ x: station.align === 'left' ? 420 : 60, y: -20 }}
                onSelectSafari={onSelectSafari}
              />
            </div>
          );
        })}
      </main>

      {/* ========================================================
          8. FIRE-LIT NIGHT BASE CAMP (Bottom Outpost Destination)
         ======================================================== */}
      <footer
        className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white"
        style={{ marginTop: geometry.height - 700, paddingBottom: 120 }}
      >
        <div className="bg-[#091D17]/95 backdrop-blur-2xl border border-[#C99A4A]/50 rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          
          {/* Campfire Visual Backdrop */}
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mx-auto mb-5 shadow-inner animate-pulse">
            <Flame className="w-8 h-8 text-[#C99A4A]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C99A4A]/20 border border-[#C99A4A]/40 text-[#C99A4A] text-xs font-bold uppercase tracking-wider mb-4">
            <span>Destination Reach: Base Camp Hearth</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            The Safari Fireside Outpost
          </h2>

          <p className="max-w-2xl mx-auto text-[#E9DFC9]/90 text-sm sm:text-base leading-relaxed mb-8">
            You have traversed 66.0 kilometers across India's premier tiger sanctuaries. Gather around our evening hearth for naturalist debriefs, custom trail itineraries, and certified gate permits.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('finder')}
              className="px-7 py-3.5 rounded-2xl bg-[#C99A4A] hover:bg-[#B88939] text-[#0D2922] font-bold text-sm flex items-center gap-2.5 shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              <span>Launch Safari Finder Quiz</span>
              <Sparkles className="w-4 h-4 text-[#0D2922]" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm flex items-center gap-2.5 transition cursor-pointer"
            >
              <span>View All 6 Tiger Sanctuaries</span>
              <MapPin className="w-4 h-4 text-[#C99A4A]" />
            </button>
          </div>

          {/* Conservation Pledge Badge */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#E9DFC9]/80">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C99A4A]" />
              Official Forest Dept Gate Permits
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C99A4A]" />
              Zero Plastic Certified Expeditions
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C99A4A]" />
              Licensed Government Naturalists
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function JourneyThroughJungle({ onSelectSafari, onNavigate }) {
  return (
    <SpatialWildlifeProvider>
      <JourneyThroughJungleInner
        onSelectSafari={onSelectSafari}
        onNavigate={onNavigate}
      />
    </SpatialWildlifeProvider>
  );
}
