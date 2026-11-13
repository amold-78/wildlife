import React, { useState, useEffect } from 'react';
import { useSpatialWildlife } from './useSpatialWildlife';

/**
 * ChitalDeerHerd
 * Herd of 3 spotted deer (Axis axis) grazing in the negative space clearing.
 * State Machine:
 * - IDLE: Heads down peacefully feeding on grasses
 * - ALERT: Heads snap upward, ears perk forward in alarm stance
 * - SCATTER: Startled herd bounds laterally away into forest margin with dust kicks
 * - SETTLE: Slowly step back into clearing
 */
export default function ChitalDeerHerd({
  id = 'pench-deer-herd',
  worldX = 400,
  worldY = 1600,
  alertRadius = 420,
  scatterRadius = 220
}) {
  const { registerAnimal } = useSpatialWildlife();
  const [animalState, setAnimalState] = useState('IDLE');

  useEffect(() => {
    const unregister = registerAnimal(id, {
      x: worldX,
      y: worldY,
      type: 'CHITAL_DEER',
      alertRadius,
      scatterRadius,
      onStateChange: (newState) => {
        setAnimalState(newState);
      }
    });

    return unregister;
  }, [id, worldX, worldY, alertRadius, scatterRadius, registerAnimal]);

  const isAlert = animalState === 'ALERT' || animalState === 'SCATTER';
  const isScatter = animalState === 'SCATTER';

  return (
    <div
      className="absolute pointer-events-none select-none transition-all duration-700 ease-out z-25"
      style={{
        left: worldX,
        top: worldY,
        transform: `translate(-50%, -50%) translate3d(${isScatter ? '-80px' : isAlert ? '-15px' : '0px'}, ${isScatter ? '-30px' : '0px'}, 0)`
      }}
      aria-label="Herd of spotted chital deer"
    >
      {/* Alert Status Pill */}
      <div
        className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[9px] font-mono font-bold text-emerald-300 transition-opacity duration-300 flex items-center gap-1.5 shadow-lg whitespace-nowrap ${
          isAlert ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>{isScatter ? 'HERD SCATTERING' : 'CHITAL HERD ALERT'}</span>
      </div>

      <div className="relative w-56 h-36">
        {/* SVG Herd: Stag with Antlers, Hind, and Yearling */}
        <svg viewBox="0 0 220 140" className="w-full h-full overflow-visible drop-shadow-md">
          <defs>
            <linearGradient id="deerCoat" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>

          {/* ========================================================
              DEER 1: THE MAJESTIC CHITAL STAG (Center-Left)
             ======================================================== */}
          <g transform="translate(60, 20)">
            {/* Body */}
            <ellipse cx="40" cy="55" rx="22" ry="14" fill="url(#deerCoat)" />
            {/* White Spots Pattern on Coat */}
            <circle cx="32" cy="50" r="1.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="42" cy="48" r="1.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="50" cy="52" r="1.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="36" cy="58" r="1.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="46" cy="58" r="1.5" fill="#FFFFFF" opacity="0.9" />

            {/* Legs */}
            <line x1="26" y1="65" x2="24" y2="95" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
            <line x1="32" y1="65" x2="33" y2="95" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="65" x2="52" y2="95" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
            <line x1="56" y1="65" x2="60" y2="95" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />

            {/* Tail (Raises on Alert) */}
            <path
              d={isAlert ? "M 60 50 Q 66 40 65 34" : "M 60 52 Q 65 58 64 64"}
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              className="transition-all duration-300"
            />

            {/* Neck & Head with Antlers */}
            <g
              transform={
                isScatter
                  ? "translate(15, 25) rotate(-28)"
                  : isAlert
                  ? "translate(18, 30) rotate(-12)" // Head UP alert
                  : "translate(12, 55) rotate(42)"   // Head DOWN grazing
              }
              className="transition-transform duration-500 origin-bottom-right"
            >
              {/* Neck */}
              <path d="M 0 0 C 4 -12, 12 -18, 16 -20 L 22 -14 C 18 -6, 12 6, 8 10 Z" fill="#D97706" />
              {/* Head */}
              <ellipse cx="6" cy="-22" rx="7" ry="5" fill="#D97706" />
              <circle cx="3" cy="-24" r="1.2" fill="#18181B" />
              {/* Large Ears */}
              <ellipse cx="11" cy="-27" rx="3.5" ry="1.8" fill="#FDE68A" transform="rotate(-30 11 -27)" />

              {/* 3-Tined Lyre-Shaped Antlers */}
              <path
                d="M 6 -26 C 4 -38, -4 -48, -2 -56 M 2 -40 C -8 -45, -12 -50, -14 -54 M 2 -46 C 4 -52, 2 -58, 0 -62"
                stroke="#FEF3C7"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </g>

          {/* ========================================================
              DEER 2: THE GRAZING HIND (Right)
             ======================================================== */}
          <g transform="translate(130, 35)">
            <ellipse cx="30" cy="50" rx="18" ry="11" fill="url(#deerCoat)" />
            {/* Spots */}
            <circle cx="24" cy="46" r="1.2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="32" cy="44" r="1.2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="38" cy="48" r="1.2" fill="#FFFFFF" opacity="0.9" />

            <line x1="18" y1="58" x2="16" y2="82" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="58" x2="42" y2="82" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />

            {/* Head */}
            <g
              transform={
                isAlert
                  ? "translate(8, 32) rotate(-10)"
                  : "translate(6, 52) rotate(45)"
              }
              className="transition-transform duration-500 origin-bottom-right"
            >
              <ellipse cx="0" cy="-14" rx="5.5" ry="4" fill="#D97706" />
              <ellipse cx="4" cy="-18" rx="3" ry="1.5" fill="#FEF3C7" transform="rotate(-25 4 -18)" />
            </g>
          </g>

          {/* ========================================================
              DEER 3: THE FAWN / YEARLING (Far Left Foreground)
             ======================================================== */}
          <g transform="translate(15, 50)">
            <ellipse cx="22" cy="42" rx="13" ry="8" fill="#F59E0B" />
            <circle cx="18" cy="39" r="1" fill="#FFFFFF" />
            <circle cx="24" cy="38" r="1" fill="#FFFFFF" />

            <line x1="14" y1="48" x2="12" y2="68" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="48" x2="30" y2="68" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />

            <g
              transform={isAlert ? "translate(6, 26) rotate(-8)" : "translate(4, 42) rotate(40)"}
              className="transition-transform duration-500"
            >
              <ellipse cx="0" cy="-10" rx="4" ry="3" fill="#F59E0B" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
