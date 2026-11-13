import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Compass } from 'lucide-react';
import type { AtmosphereState, CheckpointCoord } from '../../utils/jungleTrailEngine';

interface CompassMiniMapHudProps {
  atmosphere: AtmosphereState;
  bearingDeg: number;
  activeCheckpointIndex: number;
  checkpoints: CheckpointCoord[];
  onJumpToCheckpoint: (index: number) => void;
}

/**
 * Collapsible Mini-Map Compass & Vertical Trail Elevation HUD.
 * Displays live Jeep heading, reserve elevation, light phase,
 * and clickable checkpoint jump markers without blocking trail viewports.
 */
export default function CompassMiniMapHud({
  atmosphere,
  bearingDeg,
  activeCheckpointIndex,
  checkpoints,
  onJumpToCheckpoint,
}: CompassMiniMapHudProps) {
  const [expanded, setExpanded] = useState(false);
  const currentStop = checkpoints[activeCheckpointIndex] || checkpoints[0];

  return (
    <aside
      aria-label="Trail compass and checkpoint navigator"
      className={`fixed bottom-4 left-3 sm:bottom-6 sm:left-6 z-30 transition-all ${
        expanded ? 'w-[248px]' : 'max-w-[170px] sm:max-w-[248px]'
      }`}
    >
      <div className="rounded-xl bg-[#0B201A] text-[#F3EDE0] border border-[#285748] shadow-lg overflow-hidden">
        {/* Compact Always-Available Toggle Bar */}
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full px-2.5 sm:px-3.5 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 text-left hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Live Rotating Compass Dial */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#133329] border border-[#C99A4A]/50 flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="transition-transform duration-150"
                style={{ transform: `rotate(${bearingDeg - 90}deg)` }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9.5" fill="none" stroke="#E9DFC9" strokeOpacity="0.35" strokeWidth="1" />
                <polygon points="12,3 14.4,12 12,10.2 9.6,12" fill="#C99A4A" />
                <polygon points="12,21 14.4,12 12,13.8 9.6,12" fill="#6D9485" />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="text-xs sm:text-xs font-semibold text-white truncate">
                {currentStop?.shortName || 'Expedition Trail'}
              </p>
              <p className="text-xs sm:text-xs font-mono tabular-nums text-[#C99A4A] truncate">
                {atmosphere.elevationMeters} m · {Math.round(atmosphere.progress * 100)}%
              </p>
            </div>
          </div>

          {expanded ? (
            <ChevronDown className="w-4 h-4 text-[#C99A4A] shrink-0" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[#C99A4A] shrink-0" />
          )}
        </button>

        {/* Expanded Vertical Trail & Phase Details */}
        {expanded && (
          <div className="px-3.5 pb-3.5 pt-2 border-t border-[#1D4337] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#B8CCC3]">
              <span className="inline-flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#C99A4A]" />
                <span>{atmosphere.phaseLabel}</span>
              </span>
              <span className="font-mono tabular-nums">{Math.round(((bearingDeg % 360) + 360) % 360)}°</span>
            </div>

            {/* Vertical Trail Progress Spine */}
            <div className="relative pl-4 space-y-1.5">
              <div
                aria-hidden="true"
                className="absolute left-[6px] top-2 bottom-2 w-0.5 bg-[#1E473A]"
              />
              <div
                aria-hidden="true"
                className="absolute left-[6px] top-2 w-0.5 bg-[#C99A4A] transition-all duration-150"
                style={{ height: `${Math.max(4, Math.round(atmosphere.progress * 88))}%` }}
              />

              {checkpoints.map((cp) => {
                const isCurrent = cp.index === activeCheckpointIndex;
                return (
                  <button
                    key={cp.safariId}
                    type="button"
                    onClick={() => onJumpToCheckpoint(cp.index)}
                    className={`relative w-full text-left flex items-center justify-between gap-2 py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#173F35] text-white font-semibold'
                        : 'text-[#B8CCC3] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[13px] w-2.5 h-2.5 rounded-full border ${
                        isCurrent
                          ? 'bg-[#C99A4A] border-[#F6E0B5]'
                          : 'bg-[#0B201A] border-[#4A7869]'
                      }`}
                    />
                    <span className="truncate">{cp.shortName}</span>
                    <span className="text-xs font-mono tabular-nums text-[#C99A4A] shrink-0">
                      {cp.elevationMeters}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
