import React, { useState, useEffect } from 'react';
import { useSpatialWildlife } from './useSpatialWildlife';

/**
 * KazirangaRhino
 * Greater One-Horned Rhinoceros (Rhinoceros unicornis) in the Brahmaputra elephant grass.
 * State Machine:
 * - IDLE: Massive armored tank standing in tall elephant grass, ears swiveling
 * - ALERT: Heavy head turns toward trail, raised horn, nostril breath steam
 * - SCATTER: Heavy defiant stomp and step forward onto the marsh edge
 */
export default function KazirangaRhino({
  id = 'kaziranga-rhino',
  worldX = 420,
  worldY = 4900,
  alertRadius = 440,
  scatterRadius = 240
}) {
  const { registerAnimal } = useSpatialWildlife();
  const [animalState, setAnimalState] = useState('IDLE');

  useEffect(() => {
    const unregister = registerAnimal(id, {
      x: worldX,
      y: worldY,
      type: 'ONE_HORNED_RHINO',
      alertRadius,
      scatterRadius,
      onStateChange: (newState) => {
        setAnimalState(newState);
      }
    });

    return unregister;
  }, [id, worldX, worldY, alertRadius, scatterRadius, registerAnimal]);

  const isAlert = animalState === 'ALERT' || animalState === 'SCATTER';

  return (
    <div
      className="absolute pointer-events-none select-none transition-all duration-700 ease-out z-25"
      style={{
        left: worldX,
        top: worldY,
        transform: `translate(-50%, -50%) translate3d(${isAlert ? '22px' : '0px'}, ${isAlert ? '-8px' : '0px'}, 0)`
      }}
      aria-label="Greater One-Horned Rhino in elephant grass"
    >
      {/* Alert Status Pill */}
      <div
        className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[9px] font-mono font-bold text-emerald-300 transition-opacity duration-300 flex items-center gap-1.5 shadow-lg whitespace-nowrap ${
          isAlert ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>ONE-HORNED RHINO // ELEPHANT GRASS</span>
      </div>

      <div className="relative w-64 h-48">
        <svg viewBox="0 0 220 160" className="w-full h-full overflow-visible drop-shadow-2xl">
          <defs>
            {/* Rhino Armor Plate Slate Skin */}
            <linearGradient id="rhinoArmor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#52525B" />
              <stop offset="50%" stopColor="#3F3F46" />
              <stop offset="100%" stopColor="#27272A" />
            </linearGradient>
          </defs>

          {/* ========================================================
              GREATER ONE-HORNED RHINOCEROS BODY & ARMOR FOLDS
             ======================================================== */}
          <g transform="translate(40, 20)">
            
            {/* Massive Rear Shield Armor Fold */}
            <path
              d="M 90 40 C 130 35, 145 75, 135 110 L 85 110 C 80 85, 82 55, 90 40 Z"
              fill="url(#rhinoArmor)"
              stroke="#18181B"
              strokeWidth="2"
            />
            {/* Armor Rivet Tubers */}
            <circle cx="105" cy="65" r="2" fill="#71717A" />
            <circle cx="118" cy="75" r="2" fill="#71717A" />
            <circle cx="112" cy="90" r="2" fill="#71717A" />

            {/* Rear Heavy Pillar Legs */}
            <rect x="100" y="100" width="22" height="32" rx="4" fill="#27272A" stroke="#18181B" strokeWidth="1" />
            <rect x="120" y="100" width="18" height="32" rx="4" fill="#18181B" />

            {/* Middle Saddle Armor Fold */}
            <path
              d="M 45 45 C 65 38, 88 40, 95 48 C 88 85, 85 105, 45 105 Z"
              fill="#3F3F46"
              stroke="#18181B"
              strokeWidth="1.5"
            />

            {/* Shoulder Plate Armor Fold */}
            <path
              d="M 15 50 C 35 42, 50 45, 52 58 C 45 95, 38 105, 12 105 Z"
              fill="url(#rhinoArmor)"
              stroke="#18181B"
              strokeWidth="2"
            />

            {/* Front Heavy Pillar Legs */}
            <rect x="22" y="100" width="22" height="32" rx="4" fill="#27272A" stroke="#18181B" strokeWidth="1" />
            <rect x="42" y="100" width="18" height="32" rx="4" fill="#18181B" />

            {/* Heavy Rhino Head with Single Keratin Horn */}
            <g
              transform={
                isAlert
                  ? "translate(-5, 40) rotate(-12)" // Head UP alert
                  : "translate(-2, 55) rotate(15)"   // Head down
              }
              className="transition-transform duration-700 ease-out origin-top-right"
            >
              {/* Massive Head */}
              <path
                d="M 15 -5 C -15 -8, -35 15, -28 35 C -15 45, 12 40, 18 20 Z"
                fill="#3F3F46"
                stroke="#18181B"
                strokeWidth="1.8"
              />

              {/* Large Prehensile Upper Lip & Muzzle */}
              <ellipse cx="-28" cy="28" rx="8" ry="10" fill="#27272A" />

              {/* Iconic Single Curved Horn (Black Keratin) */}
              <path
                d="M -26 12 C -32 -8, -26 -28, -20 -38 C -14 -22, -18 -6, -18 14 Z"
                fill="#18181B"
                stroke="#52525B"
                strokeWidth="1"
              />

              {/* Small Deep-Set Eye with Heavy Brow */}
              <circle cx="-5" cy="8" r="2.2" fill="#18181B" />
              <circle cx="-5" cy="7.5" r="0.6" fill="#FDE047" />

              {/* Tubular Furred Ears */}
              <ellipse cx="12" cy="-8" rx="6" ry="10" fill="#27272A" transform="rotate(-15 12 -8)" />
            </g>
          </g>

          {/* Foreground 4-Meter Tall Elephant Grass Blades (Spatial Masking) */}
          <g stroke="#15803D" strokeLinecap="round" fill="none">
            <path d="M 15 160 Q 25 80 18 20" strokeWidth="6" />
            <path d="M 32 160 Q 42 70 55 10" strokeWidth="5.5" stroke="#16A34A" />
            <path d="M 175 160 Q 165 75 180 15" strokeWidth="6.5" stroke="#15803D" />
            <path d="M 190 160 Q 185 85 205 25" strokeWidth="5" stroke="#14532D" />
          </g>
        </svg>
      </div>
    </div>
  );
}
