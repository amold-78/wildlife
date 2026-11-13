import React, { useState, useEffect } from 'react';
import { useSpatialWildlife } from './useSpatialWildlife';

/**
 * PerchedHornbill
 * Great Pied Hornbill perched directly on the top border of the destination card.
 * State Machine:
 * - IDLE: Perched comfortably on the card frame, preening feathers, beak turns
 * - ALERT / FLIGHT: Takes flight diagonally across the viewport with wing flutter and feather particles
 * - SETTLE: Glides back to perch when Jeep passes
 */
export default function PerchedHornbill({
  id = 'card-hornbill',
  worldX = 600,
  worldY = 1620,
  alertRadius = 380,
  scatterRadius = 220
}) {
  const { registerAnimal } = useSpatialWildlife();
  const [animalState, setAnimalState] = useState('IDLE');

  useEffect(() => {
    const unregister = registerAnimal(id, {
      x: worldX,
      y: worldY,
      type: 'HORNBILL',
      alertRadius,
      scatterRadius,
      onStateChange: (newState) => {
        setAnimalState(newState);
      }
    });

    return unregister;
  }, [id, worldX, worldY, alertRadius, scatterRadius, registerAnimal]);

  const isFlight = animalState === 'ALERT' || animalState === 'SCATTER';

  return (
    <div
      className="absolute pointer-events-none select-none transition-all duration-1000 ease-out z-35"
      style={{
        left: worldX,
        top: worldY,
        transform: `translate(-50%, -50%) translate3d(${isFlight ? '160px' : '0px'}, ${isFlight ? '-140px' : '0px'}, 0) scale(${isFlight ? '1.25' : '1'}) rotate(${isFlight ? '-22deg' : '0deg'})`
      }}
      aria-label="Great Pied Hornbill taking flight"
    >
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible drop-shadow-lg">
          <defs>
            <linearGradient id="hornbillBeak" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>

          {/* ========================================================
              GREAT PIED HORNBILL (Buceros bicornis)
             ======================================================== */}
          
          {/* Wings in Flight or Folded at Rest */}
          {isFlight ? (
            /* Expansive Flying Wings */
            <g className="animate-pulse origin-center">
              {/* Left Wing Spread */}
              <path
                d="M 50 50 C 30 15, -10 10, -20 30 C 5 45, 30 55, 50 60 Z"
                fill="#18181B"
                stroke="#F4F4F5"
                strokeWidth="2"
              />
              {/* Right Wing Spread */}
              <path
                d="M 70 50 C 90 15, 130 10, 140 30 C 115 45, 90 55, 70 60 Z"
                fill="#18181B"
                stroke="#F4F4F5"
                strokeWidth="2"
              />
            </g>
          ) : (
            /* Folded Black Wing with White Bar */
            <path
              d="M 52 48 C 65 52, 75 75, 70 95 C 55 90, 48 70, 52 48 Z"
              fill="#18181B"
            />
          )}

          {/* Tail Feathers with Broad Black Subterminal Band */}
          <path
            d="M 60 75 L 75 110 L 85 106 L 68 72 Z"
            fill="#FAFAFA"
            stroke="#18181B"
            strokeWidth="2.5"
          />
          <line x1="70" y1="95" x2="80" y2="92" stroke="#18181B" strokeWidth="5" />

          {/* Body */}
          <ellipse cx="55" cy="58" rx="14" ry="18" fill="#18181B" />
          <ellipse cx="50" cy="62" rx="7" ry="10" fill="#FFFFFF" />

          {/* Head & Huge Yellow Casque Beak */}
          <g transform="translate(42, 38)">
            {/* Black Head */}
            <circle cx="0" cy="0" r="11" fill="#18181B" />
            <circle cx="-3" cy="-1" r="2.2" fill="#DC2626" />
            <circle cx="-3" cy="-1" r="0.8" fill="#18181B" />

            {/* Massive Curved Beak with Casque Horn */}
            {/* Casque on Top */}
            <path
              d="M -5 -9 C -12 -18, -28 -14, -32 -6 L -2 -4 Z"
              fill="url(#hornbillBeak)"
              stroke="#B45309"
              strokeWidth="0.8"
            />
            {/* Heavy Curved Bill */}
            <path
              d="M -2 -4 C -18 -4, -34 6, -38 20 C -25 15, -10 8, -2 6 Z"
              fill="url(#hornbillBeak)"
              stroke="#B45309"
              strokeWidth="0.8"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
