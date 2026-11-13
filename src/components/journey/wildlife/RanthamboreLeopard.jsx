import React, { useState, useEffect } from 'react';
import { useSpatialWildlife } from './useSpatialWildlife';

/**
 * RanthamboreLeopard
 * Indian Leopard (Panthera pardus fusca) draped along ancient sandstone fort ruins.
 * State Machine:
 * - IDLE: Relaxed draping on ruined sandstone wall, slow tail sway
 * - ALERT: Sits upright, muscular rosetted back tenses, golden eyes catch headlights
 * - SCATTER: Agile crouch and silent glide into sandstone archway shadow
 */
export default function RanthamboreLeopard({
  id = 'ranthambore-leopard',
  worldX = 400,
  worldY = 3200,
  alertRadius = 420,
  scatterRadius = 240
}) {
  const { registerAnimal } = useSpatialWildlife();
  const [animalState, setAnimalState] = useState('IDLE');

  useEffect(() => {
    const unregister = registerAnimal(id, {
      x: worldX,
      y: worldY,
      type: 'LEOPARD',
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
        transform: `translate(-50%, -50%) translate3d(${isAlert ? '20px' : '0px'}, ${isAlert ? '-12px' : '0px'}, 0)`
      }}
      aria-label="Indian leopard on ancient fort ruins"
    >
      {/* Alert Status Pill */}
      <div
        className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-[9px] font-mono font-bold text-amber-300 transition-opacity duration-300 flex items-center gap-1.5 shadow-lg whitespace-nowrap ${
          isAlert ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        <span>LEOPARD // RUINS AMBUSH</span>
      </div>

      <div className="relative w-52 h-44">
        {/* Ancient Sandstone Fort Ruins Base */}
        <div className="absolute bottom-0 left-0 right-0 h-16 rounded-2xl bg-gradient-to-t from-[#451A03] via-[#78350F] to-[#9A3412] border-t border-[#D97706]/40 shadow-2xl flex items-center justify-around px-4">
          <div className="w-1.5 h-8 bg-black/40 rounded-full" />
          <div className="w-1 h-6 bg-black/40 rounded-full" />
          <div className="w-1.5 h-7 bg-black/40 rounded-full" />
        </div>

        {/* Illustrated Leopard with Golden Rosette Coat */}
        <svg viewBox="0 0 180 140" className="w-full h-full overflow-visible drop-shadow-xl">
          <defs>
            <linearGradient id="leopardGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>

          {/* Long Rosette-Spotted Tail Hanging Down Stone Wall */}
          <path
            d={isAlert ? "M 135 68 Q 155 75 148 108 T 152 135" : "M 135 70 Q 150 85 142 110 T 140 135"}
            stroke="#D97706"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Black Rosettes on Tail */}
          <circle cx="145" cy="95" r="2.5" fill="#18181B" />
          <circle cx="146" cy="118" r="2.5" fill="#18181B" />
          <circle cx="140" cy="133" r="3" fill="#18181B" />

          {/* Leopard Body Draped on Wall or Sitting Up on Alert */}
          <g
            transform={
              isAlert
                ? "translate(20, 20) rotate(-14)" // Sits up on alertness
                : "translate(20, 35)"             // Draped flat on wall
            }
            className="transition-transform duration-700 ease-out origin-bottom-left"
          >
            {/* Hindquarters */}
            <ellipse cx="105" cy="45" rx="18" ry="14" fill="url(#leopardGold)" />
            {/* Torso */}
            <path d="M 45 42 C 65 35, 95 38, 115 48 C 105 65, 75 66, 45 60 Z" fill="url(#leopardGold)" />

            {/* Signature Rosette Markings (Rose-ring spots with golden centers) */}
            {[
              { x: 60, y: 44 },
              { x: 74, y: 42 },
              { x: 88, y: 46 },
              { x: 68, y: 54 },
              { x: 82, y: 55 },
              { x: 96, y: 53 },
              { x: 104, y: 43 }
            ].map((r, idx) => (
              <g key={idx} transform={`translate(${r.x}, ${r.y})`}>
                <circle cx="0" cy="0" r="3" fill="none" stroke="#18181B" strokeWidth="1.2" strokeDasharray="3 1" />
                <circle cx="0" cy="0" r="1.2" fill="#B45309" />
              </g>
            ))}

            {/* Forelimbs (Resting along stone ledge) */}
            <path d="M 42 52 Q 32 68 25 78" stroke="#D97706" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 54 52 Q 46 68 40 78" stroke="#B45309" strokeWidth="6" strokeLinecap="round" />

            {/* Leopard Head with Golden Alert Eyes */}
            <g transform={isAlert ? "translate(25, 26) rotate(-8)" : "translate(24, 38)"} className="transition-transform duration-500">
              <circle cx="0" cy="0" r="12" fill="#F59E0B" />
              <ellipse cx="0" cy="4" rx="7" ry="5" fill="#FEF3C7" />
              <polygon points="-2,3 2,3 0,5" fill="#F43F5E" />

              {/* Ears */}
              <circle cx="-7" cy="-10" r="4" fill="#18181B" />
              <circle cx="-7" cy="-10" r="2" fill="#FFFFFF" />
              <circle cx="7" cy="-10" r="4" fill="#18181B" />
              <circle cx="7" cy="-10" r="2" fill="#FFFFFF" />

              {/* Glowing Eyes */}
              <circle cx="-4" cy="-2" r="2" fill="#FDE047" />
              <circle cx="-4" cy="-2" r="0.8" fill="#18181B" />
              <circle cx="4" cy="-2" r="2" fill="#FDE047" />
              <circle cx="4" cy="-2" r="0.8" fill="#18181B" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
