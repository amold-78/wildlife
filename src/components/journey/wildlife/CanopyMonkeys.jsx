import React, { useState, useEffect } from 'react';
import { useSpatialWildlife } from './useSpatialWildlife';

/**
 * CanopyMonkeys
 * Indian Gray Langur monkeys (Semnopithecus) inhabiting the canopy vines near Pench.
 * State Machine:
 * - IDLE: Relaxed perching on vines, grooming, long tail hanging down over card border
 * - ALERT: Grips vine and swings dynamically across the open gap
 * - SCATTER: Agile vault upward into high teak branches, vigorously shaking foliage
 */
export default function CanopyMonkeys({
  id = 'pench-monkeys',
  worldX = 520,
  worldY = 1520,
  alertRadius = 400,
  scatterRadius = 230
}) {
  const { registerAnimal } = useSpatialWildlife();
  const [animalState, setAnimalState] = useState('IDLE');

  useEffect(() => {
    const unregister = registerAnimal(id, {
      x: worldX,
      y: worldY,
      type: 'LANGUR_MONKEY',
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
      className="absolute pointer-events-none select-none transition-transform duration-700 ease-out z-25"
      style={{
        left: worldX,
        top: worldY,
        transform: `translate(-50%, -50%) translate3d(${isScatter ? '25px' : isAlert ? '12px' : '0px'}, ${isAlert ? '-20px' : '0px'}, 0)`
      }}
      aria-label="Gray langur monkeys on canopy vine"
    >
      <div className="relative w-44 h-52">
        {/* Dynamic Hanging Vine with Physics Swing */}
        <svg
          viewBox="0 0 160 200"
          className={`w-full h-full overflow-visible transition-transform duration-700 origin-top ${
            isScatter ? 'animate-bounce' : isAlert ? 'rotate-6' : 'rotate-0'
          }`}
        >
          {/* Main Thick Hanging Jungle Liana Vine */}
          <path
            d={isAlert ? "M 80 0 Q 70 80 95 130 T 110 190" : "M 80 0 Q 75 70 80 140 T 78 200"}
            stroke="#451A03"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tendrils and Vine Bark Strands */}
          <path
            d="M 80 0 Q 86 60 78 120"
            stroke="#78350F"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Tropical Epiphyte Leaves on Vine */}
          <path d="M 76 45 Q 55 40 40 55 Q 60 55 76 45" fill="#15803D" />
          <path d="M 82 85 Q 105 80 120 95 Q 100 95 82 85" fill="#16A34A" />

          {/* ========================================================
              LANGUR MONKEY 1 (Swinging / Perched on Vine)
             ======================================================== */}
          <g
            transform={
              isScatter
                ? "translate(70, 70) rotate(-18)"
                : isAlert
                ? "translate(74, 85) rotate(-10)" // Leaning forward in swing
                : "translate(65, 100)"
            }
            className="transition-transform duration-500 origin-center"
          >
            {/* Long S-Shaped Gray Tail (Overlaps down onto card) */}
            <path
              d={isAlert ? "M 10 32 Q -5 65 15 95 Q 25 110 18 125" : "M 10 32 Q 5 65 18 90 T 12 120"}
              stroke="#D4D4D8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              className="drop-shadow"
            />
            {/* Black Tail Tip */}
            <circle cx="12" cy="120" r="2.5" fill="#27272A" />

            {/* Silver-Gray Body */}
            <ellipse cx="14" cy="22" rx="13" ry="16" fill="#E4E4E7" stroke="#A1A1AA" strokeWidth="1" />
            <ellipse cx="14" cy="22" rx="8" ry="12" fill="#F4F4F5" />

            {/* Limbs Gripping the Vine */}
            <path d="M 6 12 Q -4 4 12 -2" stroke="#D4D4D8" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 22 12 Q 32 6 22 -4" stroke="#D4D4D8" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 8 32 Q 2 44 14 48" stroke="#D4D4D8" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 20 32 Q 26 44 18 48" stroke="#D4D4D8" strokeWidth="4.5" strokeLinecap="round" />

            {/* Black Face with White Whisker Ruff */}
            <g transform="translate(14, 5)">
              {/* White Hair Fringe / Hood */}
              <circle cx="0" cy="0" r="10.5" fill="#FAFAFA" />
              {/* Jet Black Face */}
              <ellipse cx="0" cy="1" rx="7.5" ry="7" fill="#18181B" />
              {/* Intelligent Amber Eyes */}
              <circle cx="-3" cy="0" r="1.3" fill="#F59E0B" />
              <circle cx="3" cy="0" r="1.3" fill="#F59E0B" />
              {/* Nose & Muzzle */}
              <ellipse cx="0" cy="4" rx="3.5" ry="2" fill="#27272A" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
