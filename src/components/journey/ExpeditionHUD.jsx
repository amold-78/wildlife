import React, { useState } from 'react';
import {
  Compass,
  ChevronUp,
  ChevronDown,
  Pause,
  Play
} from 'lucide-react';

/**
 * ExpeditionHUD
 * Sleek, collapsible telemetry panel with real-time magnetic compass,
 * altimeter, speed indicator, and vertical clickable trail progress checkpoints.
 */
export default function ExpeditionHUD({
  currentAngle = 90,
  scrollProgress = 0,
  activeCheckpointIndex = 0,
  destinations = [],
  elevation = '340m ASL',
  scrollVelocity = 0,
  isPaused = false,
  onTogglePause,
  onJumpToCheckpoint
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Derive compass 8-point cardinal heading from vehicle angle
  const normalizedAngle = ((currentAngle % 360) + 360) % 360;
  const getCardinal = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(deg / 45) % 8;
    return directions[idx];
  };

  const cardinal = getCardinal(normalizedAngle);
  const kmTraveled = (scrollProgress * 66).toFixed(1);
  const currentSpeed = Math.round(Math.min(Math.abs(scrollVelocity) * 18, 48));
  const activeDest = destinations[activeCheckpointIndex] || destinations[0];

  return (
    <aside
      aria-label="Expedition telemetry HUD"
      className="fixed bottom-6 right-6 z-40 max-w-xs sm:max-w-sm transition-all duration-300 font-sans select-none"
    >
      <div className="bg-[#0D2922]/95 dark:bg-[#071713]/95 backdrop-blur-2xl border border-[#C99A4A]/50 rounded-3xl p-3 sm:p-4 shadow-2xl text-white">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#C99A4A] uppercase">
              Expedition Telemetry
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pause / Resume physics */}
            <button
              type="button"
              onClick={onTogglePause}
              aria-label={isPaused ? 'Resume vehicle motion' : 'Pause vehicle motion'}
              className="p-1.5 rounded-xl hover:bg-white/10 text-[#E9DFC9] transition cursor-pointer"
              title={isPaused ? 'Resume Motion' : 'Pause Motion'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Collapse / Expand toggle */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Expand telemetry' : 'Collapse telemetry'}
              className="p-1.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer"
            >
              {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Real-Time Magnetic Compass & Altimeter */}
        <div className="pt-3 pb-2 flex items-center justify-between gap-3">
          {/* Compass Instrument */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full bg-black/50 border border-[#C99A4A]/60 flex items-center justify-center shadow-inner">
              {/* Compass Dial Rim */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
                style={{ transform: `rotate(${-normalizedAngle}deg)` }}
              >
                <div className="w-0.5 h-full bg-gradient-to-b from-rose-500 via-transparent to-stone-400 opacity-80" />
                <span className="absolute top-0.5 text-[7px] font-bold text-rose-400 font-mono">N</span>
                <span className="absolute bottom-0.5 text-[7px] font-bold text-stone-400 font-mono">S</span>
              </div>
              <Compass className="w-4 h-4 text-[#C99A4A] z-10" />
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-sm font-bold text-white">
                  {Math.round(normalizedAngle)}°
                </span>
                <span className="text-xs font-bold text-[#C99A4A] font-mono">
                  {cardinal}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-mono tracking-wider">
                {elevation}
              </p>
            </div>
          </div>

          {/* Odometer and Speedometer */}
          <div className="text-right">
            <span className="inline-block px-2 py-0.5 rounded-lg bg-black/40 border border-[#C99A4A]/30 font-mono text-xs font-bold text-[#C99A4A]">
              {kmTraveled} / 66 km
            </span>
            <p className="text-[10px] text-stone-400 font-mono mt-0.5">
              {currentSpeed} km/h (cruise)
            </p>
          </div>
        </div>

        {/* Active Station Readout */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="min-w-0 pr-2">
            <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider truncate">
              Current Reserve Apex
            </p>
            <h5 className="font-serif font-bold text-xs text-[#E9DFC9] truncate">
              {activeDest?.name || 'Sanctuary Trailhead'}
            </h5>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 shrink-0">
            Node {activeCheckpointIndex + 1}/6
          </span>
        </div>

        {/* Collapsible Vertical Trail Progress Checklist (Skip Links) */}
        {!collapsed && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 max-h-52 overflow-y-auto">
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">
              Jungle Waypoints
            </p>
            {destinations.map((dest, i) => {
              const isSelected = activeCheckpointIndex === i;
              const isPassed = scrollProgress >= (i / (destinations.length - 1)) - 0.04;
              return (
                <button
                  key={dest.id || i}
                  type="button"
                  onClick={() => onJumpToCheckpoint(i)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#C99A4A]/25 text-[#E9DFC9] font-bold border border-[#C99A4A]/50'
                      : 'text-stone-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isSelected
                          ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                          : isPassed
                          ? 'bg-[#C99A4A]'
                          : 'bg-stone-600'
                      }`}
                    />
                    <span className="truncate">
                      {dest?.name ? dest.name.replace(" Tiger Reserve", "").replace(" National Park", "") : `Station 0${i + 1}`}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-400 shrink-0 ml-2">
                    KM {(i * 11 + 6).toFixed(0)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </aside>
  );
}
