import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Compass, Navigation, Pause, Play, EyeOff } from 'lucide-react';

// Milestone definitions mapped to home page sections
const TRAIL_STATIONS = [
  {
    id: 'trail-hero',
    name: 'Sanctuary Gate',
    subtitle: 'Permit & Date Selection',
    km: '0.0 km',
    sightingRisk: 'Baseline',
    zone: 'Checkpost 01'
  },
  {
    id: 'trail-destinations',
    name: 'Prime Reserves',
    subtitle: 'Tiger Habitats',
    km: '14.2 km',
    sightingRisk: 'High (84%)',
    zone: 'Buffer Zone'
  },
  {
    id: 'trail-finder',
    name: 'Safari Matchmaker',
    subtitle: 'Route Recommendation',
    km: '31.8 km',
    sightingRisk: 'Optimal',
    zone: 'Core Junction'
  },
  {
    id: 'trail-wildlife',
    name: 'Sanctuary Species',
    subtitle: 'Apex Encounters',
    km: '46.5 km',
    sightingRisk: 'Active Trail',
    zone: 'Waterhole Deep'
  },
  {
    id: 'trail-pledge',
    name: 'Eco Sanctuary Camp',
    subtitle: 'Traveler Code',
    km: '60.0 km',
    sightingRisk: 'Sanctuary',
    zone: 'Rest House Outpost'
  }
];

export default function SafariTrailJourney({ containerRef }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStationIndex, setActiveStationIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [isVisible, setIsVisible] = useState(true);
  const [hudExpanded, setHudExpanded] = useState(false);
  const [pathDimensions, setPathDimensions] = useState({ width: 100, height: 2000, points: [] });

  const pathRef = useRef(null);
  const activeTrailRef = useRef(null);
  const carRef = useRef(null);
  const currentPosRef = useRef({ x: 0, y: 0, angle: 90, progress: 0 });
  const animFrameRef = useRef(null);
  const targetProgressRef = useRef(0);

  // Measure section centers dynamically to construct an organic road path
  const measureSections = useCallback(() => {
    if (!containerRef?.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerTop = window.scrollY + containerRect.top;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const isDesktop = window.innerWidth >= 1024;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    const points = TRAIL_STATIONS.map((station, index) => {
      const el = document.getElementById(station.id);
      let y = (containerHeight / (TRAIL_STATIONS.length - 1)) * index;
      if (el) {
        const elRect = el.getBoundingClientRect();
        y = (window.scrollY + elRect.top - containerTop) + (elRect.height * 0.35);
      }

      // Lateral coordinates:
      // Desktop: Winding along the left gutter and weaving gently around cards
      // Tablet/Mobile: Pinned clean vertical spine on the left to avoid text collision
      let x;
      if (isDesktop) {
        const gutterBase = 46;
        const wiggle = index % 2 === 0 ? -18 : 22;
        x = Math.max(26, Math.min(containerWidth * 0.08, gutterBase + wiggle));
      } else if (isTablet) {
        x = 28;
      } else {
        x = 18;
      }

      return { x, y };
    });

    setPathDimensions({
      width: containerWidth,
      height: Math.max(containerHeight, 1800),
      points
    });
  }, [containerRef]);

  // Recalculate on load, resize, and DOM mutations
  useEffect(() => {
    measureSections();

    const handleResize = () => {
      measureSections();
    };

    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver(() => measureSections());
    if (containerRef?.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [measureSections, containerRef]);

  // Initialize SVG path stroke lengths when path changes
  useEffect(() => {
    if (pathRef.current && activeTrailRef.current) {
      const totalLen = pathRef.current.getTotalLength();
      activeTrailRef.current.style.strokeDasharray = `${totalLen}`;
      activeTrailRef.current.style.strokeDashoffset = `${totalLen}`;
    }
  }, [pathDimensions]);

  // Smooth scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef?.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Start when container top enters viewport, end when container bottom reaches center
      const startOffset = window.scrollY + rect.top - (viewportHeight * 0.3);
      const totalScrollable = rect.height - (viewportHeight * 0.5);

      if (totalScrollable <= 0) return;

      const currentScrolled = window.scrollY - startOffset;
      const rawProgress = Math.max(0, Math.min(1, currentScrolled / totalScrollable));

      targetProgressRef.current = rawProgress;

      // Determine active station
      const stationIndex = Math.min(
        TRAIL_STATIONS.length - 1,
        Math.floor(rawProgress * TRAIL_STATIONS.length)
      );
      setActiveStationIndex(stationIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  // Animation loop with linear interpolation (damping) for realistic vehicle coasting
  useEffect(() => {
    const updateVehicle = () => {
      if (!isPaused && pathRef.current && carRef.current) {
        const path = pathRef.current;
        const totalLength = path.getTotalLength ? path.getTotalLength() : 0;

        if (totalLength > 0) {
          // Lerp factor
          const lerpFactor = 0.08;
          const currentT = currentPosRef.current.progress || 0;
          const nextT = currentT + (targetProgressRef.current - currentT) * lerpFactor;
          currentPosRef.current.progress = nextT;
          setScrollProgress(nextT);

          // Update active path fill
          if (activeTrailRef.current) {
            activeTrailRef.current.style.strokeDashoffset = `${totalLength * (1 - nextT)}`;
          }

          const distance = nextT * totalLength;
          const point = path.getPointAtLength(distance);

          // Calculate forward tangent angle for realistic vehicle orientation
          const forwardDelta = 3;
          const lookAhead = Math.min(distance + forwardDelta, totalLength);
          const nextPoint = path.getPointAtLength(lookAhead);

          let targetAngle = 90;
          if (nextPoint && point) {
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
          }

          // Smooth angle rotation
          let curAngle = currentPosRef.current.angle;
          let angleDiff = targetAngle - curAngle;
          while (angleDiff < -180) angleDiff += 360;
          while (angleDiff > 180) angleDiff -= 360;
          const newAngle = curAngle + angleDiff * 0.15;

          currentPosRef.current = {
            x: point.x,
            y: point.y,
            angle: newAngle,
            progress: nextT
          };

          // Apply hardware accelerated transform
          carRef.current.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) rotate(${newAngle}deg)`;
        }
      }

      animFrameRef.current = requestAnimationFrame(updateVehicle);
    };

    animFrameRef.current = requestAnimationFrame(updateVehicle);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused]);

  // Construct smooth bezier path through station points
  const generateRoadPath = () => {
    const pts = pathDimensions.points;
    if (pts.length < 2) return '';

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const midY = (p0.y + p1.y) / 2;
      d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const roadPathData = generateRoadPath();

  // Jump to specific station smoothly
  const handleJumpToStation = (stationId) => {
    const el = document.getElementById(stationId);
    if (el) {
      const yOffset = -90; // Navbar clearance
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const activeStation = TRAIL_STATIONS[activeStationIndex] || TRAIL_STATIONS[0];
  const kmTraveled = (scrollProgress * 60).toFixed(1);

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsVisible(true)}
        aria-label="Restore Safari Trail Expedition tracker"
        className="fixed bottom-6 left-6 z-40 p-3 rounded-2xl bg-[#0D2922] text-[#E9DFC9] border border-[#C99A4A]/40 shadow-xl hover:bg-[#173F35] transition flex items-center gap-2 text-xs font-bold cursor-pointer"
      >
        <Navigation className="w-4 h-4 text-[#C99A4A]" />
        <span className="hidden sm:inline">Show Trail</span>
      </button>
    );
  }

  return (
    <>
      {/* 1. SVG JUNGLE TRAIL & VEHICLE CANVAS (In-page narrative backbone) */}
      <div
        className="absolute inset-0 pointer-events-none z-20 overflow-visible"
        aria-hidden="true"
        style={{ height: pathDimensions.height }}
      >
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${pathDimensions.width} ${pathDimensions.height}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Earth track gradient */}
            <linearGradient id="trailEarthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C99A4A" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#173F35" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#C99A4A" stopOpacity="0.4" />
            </linearGradient>

            {/* Traveled trail blaze */}
            <linearGradient id="traveledBlazeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C99A4A" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#E5B25D" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
            </linearGradient>

            {/* Subtle dirt dust filter */}
            <filter id="dustShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0D2922" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Underlay: Earth road bed (dirt track) */}
          <path
            d={roadPathData}
            stroke="url(#trailEarthGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />

          {/* Double tire-track ruts */}
          <path
            d={roadPathData}
            stroke="#2C2621"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            strokeLinecap="round"
            opacity="0.35"
            transform="translate(-3.5, 0)"
          />
          <path
            d={roadPathData}
            stroke="#2C2621"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            strokeLinecap="round"
            opacity="0.35"
            transform="translate(3.5, 0)"
          />

          {/* Primary mathematical reference path for vehicle positioning */}
          <path
            ref={pathRef}
            d={roadPathData}
            stroke="transparent"
            strokeWidth="1"
            fill="none"
          />

          {/* Active traveled trail line (fills dynamically with vehicle progression) */}
          <path
            ref={activeTrailRef}
            d={roadPathData}
            stroke="url(#traveledBlazeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Station Milestone Rings along the trail */}
          {pathDimensions.points.map((pt, idx) => {
            const isPassed = scrollProgress >= (idx / (TRAIL_STATIONS.length - 1)) - 0.05;
            const isCurrent = activeStationIndex === idx;

            return (
              <g key={idx} transform={`translate(${pt.x}, ${pt.y})`} className="pointer-events-auto cursor-pointer">
                {/* Outer radar pulse on active station */}
                {isCurrent && (
                  <circle
                    r="16"
                    fill="none"
                    stroke="#C99A4A"
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Milestone base badge */}
                <circle
                  r="10"
                  fill={isPassed ? '#0D2922' : '#F8F7F2'}
                  stroke={isPassed ? '#C99A4A' : '#D4C5A9'}
                  strokeWidth="2.5"
                  filter="url(#dustShadow)"
                />

                {/* Inner status pip */}
                <circle
                  r="4"
                  fill={isPassed ? '#C99A4A' : '#A8A29E'}
                />

                {/* Kilometer tag (desktop only) */}
                <text
                  x="18"
                  y="4"
                  fill={isPassed ? '#0D2922' : '#78716C'}
                  fontSize="10"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight="700"
                  className="hidden md:inline select-none dark:fill-[#E9DFC9]"
                >
                  {TRAIL_STATIONS[idx].km}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 2. THE BESPOKE SAFARI 4x4 CRUISER VEHICLE */}
        <div
          ref={carRef}
          className="absolute top-0 left-0 will-change-transform pointer-events-none transition-opacity duration-300"
          style={{
            width: 48,
            height: 84,
            transformOrigin: 'center center'
          }}
        >
          {/* Headlight beam projection forward */}
          <div
            className="absolute left-1/2 -top-16 -translate-x-1/2 pointer-events-none"
            style={{
              width: 72,
              height: 70,
              clipPath: 'polygon(35% 100%, 65% 100%, 100% 0%, 0% 0%)',
              background: 'linear-gradient(to top, rgba(253, 230, 138, 0.45), rgba(251, 191, 36, 0.05))',
              filter: 'blur(1px)'
            }}
          />

          {/* SVG Vehicle Silhouette (Tactile 4x4 open-top Gypsy with safari gear) */}
          <svg
            viewBox="0 0 48 84"
            width="48"
            height="84"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            {/* Ground contact shadow */}
            <ellipse cx="24" cy="44" rx="19" ry="34" fill="#0D2922" fillOpacity="0.32" filter="blur(2px)" />

            {/* Heavy-duty all-terrain tires */}
            {/* Front Left */}
            <rect x="2" y="16" width="6" height="15" rx="2" fill="#1C1917" />
            <rect x="3" y="18" width="4" height="11" rx="1" fill="#44403C" />
            {/* Front Right */}
            <rect x="40" y="16" width="6" height="15" rx="2" fill="#1C1917" />
            <rect x="41" y="18" width="4" height="11" rx="1" fill="#44403C" />
            {/* Rear Left */}
            <rect x="2" y="55" width="6" height="15" rx="2" fill="#1C1917" />
            <rect x="3" y="57" width="4" height="11" rx="1" fill="#44403C" />
            {/* Rear Right */}
            <rect x="40" y="55" width="6" height="15" rx="2" fill="#1C1917" />
            <rect x="41" y="57" width="4" height="11" rx="1" fill="#44403C" />

            {/* Main Safari Vehicle Body (Expedition Olive Green & Sand) */}
            <rect x="7" y="12" width="34" height="60" rx="6" fill="#173F35" stroke="#0D2922" strokeWidth="1.5" />
            
            {/* Front Bull Bar / Bumper */}
            <rect x="11" y="8" width="26" height="5" rx="2" fill="#2C2621" />
            <circle cx="15" cy="11" r="2" fill="#FBBF24" />
            <circle cx="33" cy="11" r="2" fill="#FBBF24" />

            {/* Hood & Louvers */}
            <path d="M11 13 L37 13 L35 27 L13 27 Z" fill="#215448" />
            <line x1="18" y1="18" x2="30" y2="18" stroke="#0D2922" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="19" y1="22" x2="29" y2="22" stroke="#0D2922" strokeWidth="1.5" strokeLinecap="round" />

            {/* Windshield */}
            <polygon points="12,28 36,28 34,35 14,35" fill="#93C5FD" fillOpacity="0.45" stroke="#0D2922" strokeWidth="1" />

            {/* Open-top passenger compartment (Naturalist & Guide seating) */}
            <rect x="11" y="37" width="26" height="28" rx="3" fill="#E9DFC9" />
            
            {/* Front bucket seats */}
            <rect x="14" y="39" width="9" height="9" rx="2" fill="#78350F" />
            <rect x="25" y="39" width="9" height="9" rx="2" fill="#78350F" />
            {/* Naturalist hats (Driver & Spotter silhouettes) */}
            <circle cx="18.5" cy="43.5" r="3" fill="#D97706" />
            <circle cx="29.5" cy="43.5" r="3" fill="#D97706" />

            {/* Tiered rear safari bench seats */}
            <rect x="13" y="51" width="22" height="7" rx="2" fill="#92400E" />
            <circle cx="17" cy="54.5" r="2.5" fill="#F59E0B" />
            <circle cx="24" cy="54.5" r="2.5" fill="#F59E0B" />
            <circle cx="31" cy="54.5" r="2.5" fill="#F59E0B" />

            {/* Roll Cage Tubular Frame */}
            <rect x="10" y="36" width="28" height="30" rx="3" fill="none" stroke="#0D2922" strokeWidth="1.5" />
            <line x1="10" y1="50" x2="38" y2="50" stroke="#0D2922" strokeWidth="1.2" />

            {/* Rear Mounted Spare Tire */}
            <rect x="19" y="69" width="10" height="7" rx="2" fill="#1C1917" stroke="#44403C" strokeWidth="1" />
            <circle cx="24" cy="72.5" r="2.5" fill="#C99A4A" />

            {/* Rear Taillights */}
            <rect x="8" y="68" width="3" height="2" rx="0.5" fill="#EF4444" />
            <rect x="37" y="68" width="3" height="2" rx="0.5" fill="#EF4444" />
          </svg>
        </div>
      </div>

      {/* 3. EXPEDITION TELEMETRY HUD (Floating Controller & Milestone Compass) */}
      <aside
        aria-label="Expedition Trail Progress"
        className="fixed bottom-6 right-6 z-40 max-w-sm transition-all duration-300"
      >
        <div className="bg-[#0D2922]/95 dark:bg-[#071713]/95 backdrop-blur-xl border border-[#C99A4A]/40 rounded-3xl p-3.5 shadow-2xl text-white">
          {/* Top Bar: Live Sighting Status & Minimize */}
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C99A4A]">
                Expedition Trail
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? 'Resume vehicle motion' : 'Pause vehicle motion'}
                className="p-1.5 rounded-xl hover:bg-white/10 text-[#E9DFC9] transition cursor-pointer"
                title={isPaused ? 'Resume Motion' : 'Pause Motion'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              {/* Hide / Toggle HUD */}
              <button
                type="button"
                onClick={() => setHudExpanded(!hudExpanded)}
                aria-label={hudExpanded ? 'Collapse trail stations' : 'Expand trail stations'}
                className="p-1.5 rounded-xl hover:bg-white/10 text-[#E9DFC9] transition cursor-pointer"
                title={hudExpanded ? 'Collapse Details' : 'View Milestones'}
              >
                <Compass className={`w-3.5 h-3.5 text-[#C99A4A] transition-transform ${hudExpanded ? 'rotate-90' : ''}`} />
              </button>

              {/* Close Trail View entirely */}
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                aria-label="Dismiss trail overlay"
                className="p-1.5 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition cursor-pointer"
                title="Hide Trail"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Current Station & Distance Telemetry */}
          <div className="pt-2.5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                {activeStation.zone}
              </p>
              <h4 className="font-serif font-bold text-sm text-white truncate">
                {activeStation.name}
              </h4>
            </div>

            {/* Odometer readout */}
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-[#C99A4A] bg-black/40 px-2 py-1 rounded-lg border border-[#C99A4A]/20">
                {kmTraveled} / 60 km
              </span>
            </div>
          </div>

          {/* Expanded Milestone List (Interactive Section Anchors) */}
          {hudExpanded && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 max-h-56 overflow-y-auto">
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">
                Sanctuary Waypoints
              </p>
              {TRAIL_STATIONS.map((station, i) => {
                const isSelected = activeStationIndex === i;
                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => handleJumpToStation(station.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#C99A4A]/20 text-[#E9DFC9] font-bold border border-[#C99A4A]/40'
                        : 'text-stone-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-stone-500'}`} />
                      <span>{station.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">{station.km}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
