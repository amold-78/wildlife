import React from 'react';
import type { SnakeTrailGeometry } from '../../utils/jungleTrailEngine';
import type {
  ProximityFrameSnapshot,
  WildlifeAnchorConfig,
  WildlifeSpeciesId,
} from '../../utils/jeepProximityEngine';
import type { WildlifeCanvasController } from './wildlife/wildlifeTypes';
import ProceduralWildlifeHost from './wildlife/ProceduralWildlifeHost';

interface LivingBiomeOverlayProps {
  geometry: SnakeTrailGeometry;
  anchors: WildlifeAnchorConfig[];
  atmospherePhase: 'morning-mist' | 'emerald-canopy' | 'night-camp';
  registerAnimalNode: (id: string) => (node: HTMLElement | null) => void;
  registerParticleNode: (id: string) => (node: HTMLElement | null) => void;
  registerGlowNode: (id: string) => (node: HTMLElement | null) => void;
  registerAnimalController?: (id: string) => (controller: WildlifeCanvasController | null) => void;
  checkpointSightings: ProximityFrameSnapshot['checkpointSightings'];
}

function SpeciesParticles({ species }: { species: WildlifeSpeciesId }) {
  if (species === 'river-elephant') {
    // Rich multi-layered arc of glistening Ramganga river water spray & mist droplets
    return (
      <svg viewBox="0 0 160 96" className="w-36 h-24 overflow-visible">
        <g>
          <path
            d="M 126 34 C 114 8, 86 4, 64 20 M 130 30 C 142 6, 158 8, 166 24 M 122 36 C 102 18, 78 20, 58 34"
            stroke="#CCF7F7"
            strokeWidth="2.2"
            strokeDasharray="4 5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="118" cy="14" r="3.4" fill="#E3FFFF" />
          <circle cx="102" cy="10" r="2.8" fill="#A6EFEF" />
          <circle cx="84" cy="14" r="3.2" fill="#E3FFFF" />
          <circle cx="68" cy="22" r="2.4" fill="#8CE6E6" />
          <circle cx="138" cy="10" r="3" fill="#E3FFFF" />
          <circle cx="152" cy="16" r="2.5" fill="#A6EFEF" />
        </g>
      </svg>
    );
  }

  if (species === 'macaw-pair') {
    // Drifting vibrant scarlet, sunburst gold & cobalt macaw plumage feathers
    return (
      <svg viewBox="0 0 130 84" className="w-30 h-20 overflow-visible">
        <g>
          <path d="M 22 52 C 30 46, 40 48, 44 54 C 36 58, 26 56, 22 52 Z" fill="#F03E2F" />
          <path d="M 48 62 C 56 56, 66 58, 70 64 C 62 68, 52 66, 48 62 Z" fill="#F7C346" />
          <path d="M 76 50 C 82 44, 92 46, 94 52 C 86 56, 78 54, 76 50 Z" fill="#1B76D4" />
          <circle cx="38" cy="40" r="2.2" fill="#FFF3C4" />
          <circle cx="64" cy="44" r="1.8" fill="#FFD166" />
        </g>
      </svg>
    );
  }

  // Botanical leaf & golden pollen scatter for bounding deer, swinging langurs, and stalking cats
  return (
    <svg viewBox="0 0 130 84" className="w-30 h-20 overflow-visible">
      <g>
        <path d="M 24 54 C 32 44, 44 46, 46 56 C 36 60, 28 58, 24 54 Z" fill="#3B9B78" />
        <path d="M 82 48 C 90 38, 102 40, 104 50 C 94 54, 86 52, 82 48 Z" fill="#2D7A5E" />
        <circle cx="56" cy="40" r="2.4" fill="#F0C46C" />
        <circle cx="72" cy="52" r="2" fill="#FFE69A" />
      </g>
    </svg>
  );
}

/**
 * Renders the negative-space rainforest diorama and detailed, anatomically sculpted
 * proximity-reactive wildlife characters around every bend and destination card.
 */
export default function LivingBiomeOverlay({
  geometry,
  anchors,
  atmospherePhase,
  registerAnimalNode,
  registerParticleNode,
  registerGlowNode,
  registerAnimalController,
  checkpointSightings,
}: LivingBiomeOverlayProps) {
  const { width, height, isMobile, checkpointCoords } = geometry;
  const isNight = atmospherePhase === 'night-camp';

  // Generate negative-space fern & flora clusters opposite each card so there is zero dead space
  const negativeSpaceFlora = checkpointCoords.map((cp) => {
    const x = isMobile
      ? Math.round(width * 0.06)
      : cp.cardSide === 'left'
        ? Math.round(width * 0.82)
        : Math.round(width * 0.18);
    return {
      id: `flora-${cp.safariId}`,
      x,
      y: cp.y,
      side: cp.bendSide,
      index: cp.index,
    };
  });

  // Bioluminescent spores & fireflies distributed down the trail
  const fireflyNodes = Array.from({ length: 18 }).map((_, idx) => {
    const ratio = (idx + 1) / 19;
    const x = Math.round(width * (idx % 2 === 0 ? 0.18 + (idx % 3) * 0.07 : 0.82 - (idx % 3) * 0.07));
    const y = Math.round(height * ratio);
    const isLowerDusk = ratio > 0.55;
    return { id: `spore-${idx}`, x, y, isLowerDusk };
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-15 overflow-hidden select-none"
    >
      {/* 1. DAPPLED SUNLIGHT GOD-RAYS (Dawn & Mid-Canopy Negative Space) */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="canopyGodRay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE8A3" stopOpacity={isNight ? '0.06' : '0.26'} />
            <stop offset="55%" stopColor="#E4B865" stopOpacity={isNight ? '0.03' : '0.11'} />
            <stop offset="100%" stopColor="#E4B865" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="biolumGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9FFFCB" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#38B28B" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#071713" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Volumetric Golden Sunbeams Filtering Through the Dark Emerald Canopy */}
        <polygon
          points={`${width * 0.04},0 ${width * 0.31},0 ${width * 0.66},${height * 0.29} ${width * 0.34},${height * 0.29}`}
          fill="url(#canopyGodRay)"
        />
        <polygon
          points={`${width * 0.62},${height * 0.14} ${width * 0.92},${height * 0.14} ${width * 0.48},${height * 0.46} ${width * 0.22},${height * 0.46}`}
          fill="url(#canopyGodRay)"
        />
        <polygon
          points={`${width * 0.08},${height * 0.36} ${width * 0.36},${height * 0.36} ${width * 0.74},${height * 0.68} ${width * 0.44},${height * 0.68}`}
          fill="url(#canopyGodRay)"
        />

        {/* Subtle Negative-Space Ground Contour Halos */}
        {negativeSpaceFlora.map((cluster) => (
          <g key={cluster.id} transform={`translate(${cluster.x}, ${cluster.y})`}>
            <ellipse
              cx="0"
              cy="24"
              rx={isMobile ? 36 : 78}
              ry={isMobile ? 16 : 32}
              fill={cluster.index >= 4 || isNight ? '#11382C' : '#587A62'}
              fillOpacity="0.18"
            />
          </g>
        ))}

        {/* Drifting Golden Spores (Upper Trail) & Bioluminescent Fireflies (Lower Dusk/Night) */}
        {fireflyNodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            {node.isLowerDusk && (
              <circle cx="0" cy="0" r="18" fill="url(#biolumGlow)" />
            )}
            <circle
              cx="0"
              cy="0"
              r={node.isLowerDusk ? 3.2 : 2.4}
              fill={node.isLowerDusk ? '#A8FFCE' : '#FFE394'}
              fillOpacity={node.isLowerDusk ? 0.85 : 0.65}
            />
          </g>
        ))}
      </svg>

      {/* 2. PROXIMITY-REACTIVE DETAILED WILDLIFE CHARACTERS IN NEGATIVE SPACE */}
      {anchors.map((anchor) => {
        const sighting = checkpointSightings[anchor.checkpointIndex];
        const isAlert = sighting?.phase === 'alert';

        return (
          <div
            key={anchor.id}
            data-wildlife-id={anchor.id}
            data-wildlife-species={anchor.species}
            style={{
              left: `${anchor.anchorX}px`,
              top: `${anchor.anchorY}px`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            {/* Dynamic Headlight Rim-Glow Cone when Jeep illuminates animal in Dusk/Night */}
            <div
              ref={registerGlowNode(anchor.id)}
              style={{ opacity: 0 }}
              className="absolute -inset-10 rounded-full bg-radial from-[#FFE69A]/50 via-[#E58C3A]/18 to-transparent blur-md transition-opacity duration-150"
            />

            {/* Main Articulated 3D Wildlife Character Node (mutated at 60fps via useJeepProximity) */}
            <div
              ref={registerAnimalNode(anchor.id)}
              data-proximity-phase="idle"
              className="relative flex flex-col items-center will-change-transform drop-shadow-[0_12px_14px_rgba(0,0,0,0.62)]"
            >
              {/* Feather / Water Spray / Leaf Rustle Particle Emitter */}
              <div
                ref={registerParticleNode(anchor.id)}
                style={{ opacity: 0 }}
                className="absolute -top-8 -left-4 pointer-events-none will-change-transform"
              >
                <SpeciesParticles species={anchor.species} />
              </div>

              <ProceduralWildlifeHost
                species={anchor.species}
                side={anchor.side}
                registerController={registerAnimalController ? registerAnimalController(anchor.id) : undefined}
              />

              {/* Spatial Habitat Telemetry Tag on Desktop Negative Space */}
              {!anchor.perchedOnCard && (
                <div
                  className={`hidden md:inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg border text-xs font-mono tabular-nums whitespace-nowrap transition-colors duration-300 ${
                    isAlert
                      ? 'bg-[#0D2922] text-[#F5C975] border-[#C99A4A]'
                      : 'bg-[#09211A] text-[#E9DFC9] border-[#2C5C4C]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAlert ? 'bg-[#F5C975]' : 'bg-[#4FA38B]'
                    }`}
                  />
                  <span className="font-semibold">{anchor.name}</span>
                  {sighting && (
                    <span className="text-[#C99A4A]">· {sighting.distanceMeters}m</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
