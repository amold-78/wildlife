import React, { useState, useEffect, useRef } from 'react';
import { useSpatialWildlife } from './useSpatialWildlife';

/**
 * RiverElephants
 * Wild Asian Elephant herd wading in the river shallows near Jim Corbett.
 * State Machine:
 * - IDLE: Standing in river shallows, gentle ear fanning, trunk drinking
 * - ALERT: Raises majestic trunk in trumpeting salute, river water ripples expand
 * - SCATTER / SPRAY: Sprays dynamic canvas water droplets that mist across the card layer
 */
export default function RiverElephants({
  id = 'corbett-elephants',
  worldX = 420,
  worldY = 4050,
  alertRadius = 460,
  scatterRadius = 260
}) {
  const { registerAnimal } = useSpatialWildlife();
  const [animalState, setAnimalState] = useState('IDLE');
  const sprayCanvasRef = useRef(null);
  const waterParticlesRef = useRef([]);

  useEffect(() => {
    const unregister = registerAnimal(id, {
      x: worldX,
      y: worldY,
      type: 'ASIAN_ELEPHANT',
      alertRadius,
      scatterRadius,
      onStateChange: (newState) => {
        setAnimalState(newState);
      }
    });

    return unregister;
  }, [id, worldX, worldY, alertRadius, scatterRadius, registerAnimal]);

  // Water Spray Particle System when Alert / Scatter
  useEffect(() => {
    const canvas = sprayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const renderWaterSpray = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Continuously spawn water droplets when alert
      if (animalState === 'ALERT' || animalState === 'SCATTER') {
        if (Math.random() < 0.45) {
          for (let k = 0; k < 4; k++) {
            waterParticlesRef.current.push({
              x: 105 + (Math.random() * 6 - 3),
              y: 40 + (Math.random() * 4 - 2),
              vx: 2.5 + Math.random() * 4,
              vy: -3.5 - Math.random() * 4,
              size: 2 + Math.random() * 3.5,
              alpha: 0.8,
              gravity: 0.15
            });
          }
        }
      }

      for (let i = waterParticlesRef.current.length - 1; i >= 0; i--) {
        const p = waterParticlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= 0.02;

        if (p.alpha <= 0 || p.y > canvas.height) {
          waterParticlesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(renderWaterSpray);
    };

    animId = requestAnimationFrame(renderWaterSpray);
    return () => cancelAnimationFrame(animId);
  }, [animalState]);

  const isAlert = animalState === 'ALERT' || animalState === 'SCATTER';

  return (
    <div
      className="absolute pointer-events-none select-none transition-transform duration-700 ease-out z-25"
      style={{
        left: worldX,
        top: worldY,
        transform: `translate(-50%, -50%) translate3d(${isAlert ? '20px' : '0px'}, ${isAlert ? '-15px' : '0px'}, 0)`
      }}
      aria-label="Wild Asian elephant herd in river"
    >
      {/* Alert Status Pill */}
      <div
        className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[9px] font-mono font-bold text-cyan-300 transition-opacity duration-300 flex items-center gap-1.5 shadow-lg whitespace-nowrap ${
          isAlert ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>ELEPHANT HERD // WATER CROSSING</span>
      </div>

      <div className="relative w-64 h-52">
        {/* Dynamic Water Spray Canvas Layer */}
        <canvas
          ref={sprayCanvasRef}
          width={260}
          height={210}
          className="absolute -top-12 -left-6 pointer-events-none z-10"
        />

        {/* SVG Wild Elephants (Mother Matriarch & Calf in River) */}
        <svg viewBox="0 0 240 180" className="w-full h-full overflow-visible drop-shadow-xl">
          <defs>
            {/* Elephant Slate Skin Gradient */}
            <linearGradient id="elephantSkin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4B5563" />
              <stop offset="60%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1F2937" />
            </linearGradient>

            {/* River Water Ripple Ring */}
            <radialGradient id="waterRipple" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Water Ripples Around Legs */}
          <ellipse cx="120" cy="145" rx="55" ry="16" fill="url(#waterRipple)" className="animate-pulse" />
          <ellipse cx="60" cy="150" rx="30" ry="10" fill="url(#waterRipple)" />

          {/* ========================================================
              MATRIARCH ELEPHANT (Center-Right)
             ======================================================== */}
          <g transform="translate(60, 20)">
            {/* Massive Back & Body */}
            <path
              d="M 40 50 C 45 25, 95 20, 120 45 C 135 60, 130 95, 120 120 L 35 120 C 30 95, 32 70, 40 50 Z"
              fill="url(#elephantSkin)"
            />

            {/* Submerged Pillar Legs in River */}
            <rect x="42" y="105" width="16" height="35" rx="5" fill="#374151" />
            <rect x="65" y="105" width="15" height="35" rx="5" fill="#1F2937" />
            <rect x="95" y="105" width="16" height="35" rx="5" fill="#374151" />
            <rect x="114" y="105" width="15" height="35" rx="5" fill="#1F2937" />

            {/* Tail */}
            <line x1="125" y1="65" x2="135" y2="105" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />

            {/* Massive Head & Fanning Ear */}
            <g transform="translate(15, 30)">
              {/* Head Base */}
              <circle cx="20" cy="25" r="22" fill="#4B5563" />

              {/* Fanning Ear */}
              <path
                d={isAlert ? "M 28 8 C 48 5, 50 45, 30 52 C 22 52, 24 20, 28 8 Z" : "M 28 12 C 42 12, 44 42, 28 46 C 22 46, 24 20, 28 12 Z"}
                fill="#374151"
                stroke="#1F2937"
                strokeWidth="1"
                className="transition-all duration-700"
              />

              {/* Eye */}
              <circle cx="12" cy="22" r="2" fill="#111827" />
              <circle cx="12" cy="21.5" r="0.6" fill="#FFFFFF" />

              {/* Tusks (Short female Asian tushes) */}
              <path d="M 6 36 Q -2 46 4 48" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Sinuous Trunk (Raises High in Trumpet on Alert) */}
              <path
                d={
                  isAlert
                    ? "M 10 32 C -5 45, -15 25, 0 10 C 15 -5, 35 15, 38 10" // Raised trumpeting trunk
                    : "M 10 32 C -2 55, 4 75, 12 95"                        // Drinking submerged trunk
                }
                stroke="#374151"
                strokeWidth="9"
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out"
              />
            </g>
          </g>

          {/* ========================================================
              BABY ELEPHANT CALF (Left, sheltered by mother)
             ======================================================== */}
          <g transform="translate(30, 80)">
            <ellipse cx="25" cy="40" rx="18" ry="14" fill="#6B7280" />
            <rect x="14" y="50" width="8" height="22" rx="3" fill="#4B5563" />
            <rect x="28" y="50" width="8" height="22" rx="3" fill="#374151" />

            {/* Calf Head & Little Trunk */}
            <circle cx="8" cy="30" r="11" fill="#6B7280" />
            <ellipse cx="14" cy="30" rx="6" ry="8" fill="#4B5563" />
            <circle cx="4" cy="28" r="1.5" fill="#111827" />
            <path d="M 2 36 Q -4 48 2 54" stroke="#4B5563" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </g>
        </svg>
      </div>
    </div>
  );
}
