import React, { useState, useEffect, useRef } from 'react';
import { useSpatialWildlife } from './useSpatialWildlife';

/**
 * TigerStalker
 * Bengal tiger stalking through the bamboo grass near Tadoba's destination card.
 * State Machine:
 * - IDLE: Crouched stealthily behind swaying bamboo stalks, slow tail swish
 * - ALERT: Steps forward to the trail edge, amber eyes glow, tense stalk posture
 * - SCATTER / PROWL: Paces alongside the curve tracking the Jeep's movement
 * - SETTLE: Slowly recedes into bamboo cover
 */
export default function TigerStalker({
  id = 'tadoba-tiger',
  worldX = 850,
  worldY = 820,
  alertRadius = 450,
  scatterRadius = 240
}) {
  const { registerAnimal } = useSpatialWildlife();
  const [animalState, setAnimalState] = useState('IDLE');
  const containerRef = useRef(null);

  useEffect(() => {
    const unregister = registerAnimal(id, {
      x: worldX,
      y: worldY,
      type: 'TIGER',
      alertRadius,
      scatterRadius,
      onStateChange: (newState) => {
        setAnimalState(newState);
      }
    });

    return unregister;
  }, [id, worldX, worldY, alertRadius, scatterRadius, registerAnimal]);

  // Transform offsets based on state
  const isAlert = animalState === 'ALERT' || animalState === 'SCATTER';
  const isScatter = animalState === 'SCATTER';

  return (
    <div
      ref={containerRef}
      className="absolute pointer-events-none select-none transition-transform duration-700 ease-out z-25"
      style={{
        left: worldX,
        top: worldY,
        transform: `translate(-50%, -50%) translate3d(${isScatter ? '-35px' : isAlert ? '-15px' : '0px'}, ${isAlert ? '-10px' : '0px'}, 0)`
      }}
      aria-label="Bengal Tiger stalking in bamboo thickets"
    >
      {/* Awareness Glow Badge when in proximity */}
      <div
        className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-[9px] font-mono font-bold text-amber-300 transition-opacity duration-300 flex items-center gap-1.5 shadow-lg ${
          isAlert ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        <span>APEX SIGHTING // TIGER ALERT</span>
      </div>

      <div className="relative w-48 h-36">
        {/* Ambient Ground Shadow */}
        <div
          className={`absolute bottom-3 left-6 right-6 h-6 rounded-full bg-black/40 blur-md transition-all duration-700 ${
            isAlert ? 'scale-110 opacity-70' : 'scale-90 opacity-40'
          }`}
        />

        {/* Illustrated SVG Royal Bengal Tiger */}
        <svg
          viewBox="0 0 180 120"
          className="w-full h-full drop-shadow-xl overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Tiger Coat Gradient */}
            <linearGradient id="tigerCoat" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="60%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>

            {/* Amber Eye Glow */}
            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Sinuous Muscular Body */}
          <g className={`transition-all duration-700 ease-out origin-center ${isAlert ? 'scale-105' : 'scale-100'}`}>
            
            {/* Swishing Tail */}
            <path
              d="M 145 65 Q 165 45 170 30 Q 172 20 165 18"
              stroke="#EA580C"
              strokeWidth="6.5"
              strokeLinecap="round"
              className={isAlert ? 'animate-pulse' : ''}
            />
            {/* Tail Black Tip */}
            <circle cx="166" cy="19" r="4" fill="#18181B" />

            {/* Powerful Rear Hindquarters */}
            <ellipse cx="125" cy="62" rx="22" ry="18" fill="url(#tigerCoat)" />
            {/* Rear Leg Back */}
            <path d="M 125 72 Q 135 90 138 108" stroke="#C2410C" strokeWidth="9" strokeLinecap="round" />
            {/* Rear Leg Front */}
            <path d="M 112 72 Q 118 92 120 108" stroke="#EA580C" strokeWidth="8" strokeLinecap="round" />

            {/* Tiger Torso */}
            <path
              d="M 60 55 C 80 48, 110 50, 130 60 C 120 80, 85 82, 60 75 Z"
              fill="url(#tigerCoat)"
            />

            {/* Distinctive Tiger Black Stripes on Body */}
            <path d="M 75 53 Q 80 64 78 74" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
            <path d="M 88 51 Q 92 65 90 76" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 102 52 Q 106 65 104 75" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 116 55 Q 120 67 118 74" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />

            {/* Front Shoulders & Forelegs */}
            <ellipse cx="62" cy="62" rx="18" ry="16" fill="url(#tigerCoat)" />
            {/* Foreleg Right (Prowling forward on alert) */}
            <path
              d={isAlert ? "M 55 70 Q 45 88 38 106" : "M 55 70 Q 52 88 50 106"}
              stroke="#EA580C"
              strokeWidth="8.5"
              strokeLinecap="round"
              className="transition-all duration-700"
            />
            {/* Foreleg Left */}
            <path d="M 68 70 Q 72 88 74 106" stroke="#C2410C" strokeWidth="7.5" strokeLinecap="round" />

            {/* Tiger Head */}
            <g transform={isAlert ? "translate(30, 40) rotate(-6)" : "translate(34, 46)"} className="transition-transform duration-500">
              {/* Ears */}
              <circle cx="10" cy="-4" r="5.5" fill="#18181B" />
              <circle cx="10" cy="-4" r="3" fill="#FFFFFF" />
              <circle cx="28" cy="-4" r="5.5" fill="#18181B" />
              <circle cx="28" cy="-4" r="3" fill="#FFFFFF" />

              {/* Head Base */}
              <ellipse cx="19" cy="10" rx="15" ry="13" fill="#EA580C" />
              <ellipse cx="19" cy="15" rx="9" ry="7" fill="#FEF3C7" />
              {/* Nose */}
              <polygon points="17,14 21,14 19,17" fill="#F43F5E" />

              {/* Glowing Amber Eyes */}
              <circle
                cx="13"
                cy="8"
                r={isAlert ? "2.6" : "1.8"}
                fill="#FBBF24"
                filter={isAlert ? "url(#eyeGlow)" : "none"}
                className="transition-all duration-300"
              />
              <circle cx="13" cy="8" r="0.8" fill="#18181B" />

              <circle
                cx="25"
                cy="8"
                r={isAlert ? "2.6" : "1.8"}
                fill="#FBBF24"
                filter={isAlert ? "url(#eyeGlow)" : "none"}
                className="transition-all duration-300"
              />
              <circle cx="25" cy="8" r="0.8" fill="#18181B" />

              {/* Head Stripes & Whiskers */}
              <path d="M 12 0 L 14 5" stroke="#18181B" strokeWidth="2" />
              <path d="M 26 0 L 24 5" stroke="#18181B" strokeWidth="2" />
              <path d="M 19 -2 L 19 4" stroke="#18181B" strokeWidth="2" />
              <line x1="8" y1="15" x2="-2" y2="17" stroke="#FEF3C7" strokeWidth="1" />
              <line x1="30" y1="15" x2="40" y2="17" stroke="#FEF3C7" strokeWidth="1" />
            </g>
          </g>
        </svg>

        {/* Foreground Bamboo Stalks Overlapping the Tiger (Spatial Depth) */}
        <div className="absolute inset-0 pointer-events-none">
          <svg viewBox="0 0 180 120" className="w-full h-full">
            {/* Bamboo Stalk 1 */}
            <line x1="18" y1="0" x2="24" y2="120" stroke="#15803D" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="16" y1="35" x2="26" y2="35" stroke="#14532D" strokeWidth="2" />
            <line x1="18" y1="75" x2="28" y2="75" stroke="#14532D" strokeWidth="2" />
            {/* Bamboo Leaves */}
            <path d="M 22 35 Q 40 30 55 45 Q 38 42 22 35" fill="#16A34A" />
            <path d="M 25 75 Q 45 70 60 85 Q 42 80 25 75" fill="#15803D" />

            {/* Bamboo Stalk 2 (Foreground right) */}
            <line x1="140" y1="10" x2="135" y2="120" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 138 50 Q 115 45 95 60 Q 120 54 138 50" fill="#22C55E" />
          </svg>
        </div>
      </div>
    </div>
  );
}
