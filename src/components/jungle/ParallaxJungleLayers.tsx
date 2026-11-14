import React from 'react';
import type { SnakeTrailGeometry } from '../../utils/jungleTrailEngine';

interface ParallaxJungleLayersProps {
  geometry: SnakeTrailGeometry;
  activeCheckpointIndex: number;
  atmospherePhase: 'morning-mist' | 'emerald-canopy' | 'night-camp';
  backgroundOffsetRef: React.RefObject<SVGSVGElement | null>;
  topLeftFoliageRef: React.RefObject<HTMLDivElement | null>;
  topRightFoliageRef: React.RefObject<HTMLDivElement | null>;
  bottomLeftFoliageRef: React.RefObject<HTMLDivElement | null>;
  bottomRightFoliageRef: React.RefObject<HTMLDivElement | null>;
  roadPathRef: React.RefObject<SVGPathElement | null>;
  foliageParting?: number;
  foliageDriftY?: number;
}

/**
 * Three-plane jungle depth renderer:
 * 1. Background: Topographical elevation contours + river tributaries (parallax slower).
 * 2. Midground: Winding S-curve laterite safari trail, timber river bridge, and 6 spatial waypoints.
 * 3. Foreground: 4-corner overhanging jungle canopy leaves, ferns, and palm fronds that part while scrolling.
 */
export default function ParallaxJungleLayers({
  geometry,
  activeCheckpointIndex,
  atmospherePhase,
  backgroundOffsetRef,
  topLeftFoliageRef,
  topRightFoliageRef,
  bottomLeftFoliageRef,
  bottomRightFoliageRef,
  roadPathRef,
  foliageParting = 0,
  foliageDriftY = 0,
}: ParallaxJungleLayersProps) {
  const { width, height, isMobile, roadPath, checkpointCoords, riverCrossing } = geometry;
  const roadMainWidth = isMobile ? 16 : 24;
  const roadBermWidth = isMobile ? 24 : 36;
  const rutOffset = isMobile ? 3.5 : 5;
  const isNight = atmospherePhase === 'night-camp';
  const trailHeadX = Math.round(width * 0.5);
  const caveHalfWidth = isMobile ? 38 : 54;
  const cliffSpan = isMobile ? Math.max(160, width * 0.5) : Math.max(280, Math.min(460, width * 0.38));

  // Generate organic topographic elevation contours etched into the dark emerald reserve
  const contourBands = [
    { cx: width * 0.16, cy: height * 0.14, rx: width * 0.36, ry: 230, elev: '285M' },
    { cx: width * 0.85, cy: height * 0.33, rx: width * 0.38, ry: 270, elev: '415M' },
    { cx: width * 0.18, cy: height * 0.57, rx: width * 0.37, ry: 260, elev: '512M' },
    { cx: width * 0.84, cy: height * 0.78, rx: width * 0.38, ry: 280, elev: '610M' },
  ];

  return (
    <>
      {/* PLANE 1: TOPOGRAPHIC MAP LINES ETCHED SUBTLY INTO DARK EMERALD BACKGROUND */}
      <svg
        ref={backgroundOffsetRef}
        aria-hidden="true"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="pointer-events-none absolute inset-0 z-0 will-change-transform"
      >
        {/* Subtle Isometric Cartographic Grid */}
        <g stroke="#2C6B56" strokeOpacity={isNight ? '0.24' : '0.18'} strokeWidth="1">
          {Array.from({ length: 12 }).map((_, idx) => {
            const yPos = Math.round((height / 13) * (idx + 1));
            return (
              <line
                key={`h-${idx}`}
                x1={isMobile ? 8 : 28}
                y1={yPos}
                x2={width - (isMobile ? 8 : 28)}
                y2={yPos}
                strokeDasharray="3 14"
              />
            );
          })}
        </g>

        {/* Continuous Etched Topographic Ridge Lines */}
        <path
          d={`M 0 ${height * 0.08} C ${width * 0.32} ${height * 0.12}, ${width * 0.68} ${height * 0.05}, ${width} ${height * 0.11}
              M 0 ${height * 0.27} C ${width * 0.28} ${height * 0.22}, ${width * 0.72} ${height * 0.31}, ${width} ${height * 0.25}
              M 0 ${height * 0.48} C ${width * 0.35} ${height * 0.53}, ${width * 0.65} ${height * 0.44}, ${width} ${height * 0.51}
              M 0 ${height * 0.69} C ${width * 0.3} ${height * 0.64}, ${width * 0.74} ${height * 0.73}, ${width} ${height * 0.68}
              M 0 ${height * 0.88} C ${width * 0.36} ${height * 0.92}, ${width * 0.66} ${height * 0.85}, ${width} ${height * 0.9}`}
          fill="none"
          stroke="#3B866E"
          strokeOpacity="0.22"
          strokeWidth="1.15"
        />

        {contourBands.map((band, idx) => (
          <g key={idx} fill="none">
            <ellipse
              cx={band.cx}
              cy={band.cy}
              rx={band.rx * 1.18}
              ry={band.ry * 1.18}
              stroke="#2D6E59"
              strokeOpacity="0.2"
              strokeWidth="1"
            />
            <ellipse
              cx={band.cx}
              cy={band.cy}
              rx={band.rx}
              ry={band.ry}
              stroke="#46997E"
              strokeOpacity="0.28"
              strokeWidth="1.25"
            />
            <ellipse
              cx={band.cx}
              cy={band.cy}
              rx={band.rx * 0.74}
              ry={band.ry * 0.74}
              stroke="#C99A4A"
              strokeOpacity="0.22"
              strokeWidth="1.1"
              strokeDasharray="9 6"
            />
            <ellipse
              cx={band.cx}
              cy={band.cy}
              rx={band.rx * 0.48}
              ry={band.ry * 0.48}
              stroke="#46997E"
              strokeOpacity="0.26"
              strokeWidth="1.1"
            />
            <ellipse
              cx={band.cx}
              cy={band.cy}
              rx={band.rx * 0.24}
              ry={band.ry * 0.24}
              stroke="#C99A4A"
              strokeOpacity="0.2"
              strokeWidth="1"
            />
            {!isMobile && (
              <text
                x={band.cx + (idx % 2 === 0 ? 18 : -54)}
                y={band.cy - band.ry * 0.48 - 6}
                fill="#C99A4A"
                fillOpacity="0.42"
                fontSize="9"
                fontFamily="monospace"
                letterSpacing="0.08em"
              >
                {band.elev}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* PLANE 2: 3D ISOMETRIC WINDING DIRT ROAD, SHALLOW RIVER CROSSING, TIMBER BRIDGE & WAYPOINTS */}
      <svg
        aria-hidden="true"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="pointer-events-none absolute inset-0 z-10 overflow-visible"
      >
        <defs>
          <linearGradient id="ramgangaRiverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#12474A" stopOpacity="0.92" />
            <stop offset="50%" stopColor="#2A8C8C" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#12474A" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="lateriteRoadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9C6037" />
            <stop offset="50%" stopColor="#BE7E4E" />
            <stop offset="100%" stopColor="#8F552E" />
          </linearGradient>
          <radialGradient
            id="cavernVoidUnderGrad"
            cx="50%"
            cy="25%"
            r="60%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#010403" stopOpacity="1" />
            <stop offset="50%" stopColor="#030A07" stopOpacity="0.96" />
            <stop offset="85%" stopColor="#081810" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#0D241A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cavernWallBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0A1610" />
            <stop offset="60%" stopColor="#14241B" />
            <stop offset="100%" stopColor="#1D3326" />
          </linearGradient>
        </defs>

        {/* TRAILHEAD CAVERN FLOOR (PLANE 2: UNDER-JEEP INTERIOR VOID & BEDROCK FOUNDATION) */}
        <g id="trailhead-cavern-interior-plane2">
          {/* Deep Cavern Interior Chamber Silhouette (behind road and under Jeep) */}
          <path
            d={`M ${trailHeadX - caveHalfWidth - 18} -45
               Q ${trailHeadX - caveHalfWidth - 6} 20 ${trailHeadX - caveHalfWidth - 2} 55
               Q ${trailHeadX} 68 ${trailHeadX + caveHalfWidth + 2} 55
               Q ${trailHeadX + caveHalfWidth + 6} 20 ${trailHeadX + caveHalfWidth + 18} -45
               Z`}
            fill="#020704"
          />
          <ellipse
            cx={trailHeadX}
            cy={18}
            rx={caveHalfWidth + 20}
            ry={48}
            fill="url(#cavernVoidUnderGrad)"
          />

          {/* Left Bedrock Floor Footing */}
          <path
            d={`M ${trailHeadX - caveHalfWidth - 2} 50
               C ${trailHeadX - caveHalfWidth - 20} 58, ${trailHeadX - caveHalfWidth - 48} 62, ${trailHeadX - cliffSpan} 48
               L ${trailHeadX - cliffSpan} -45
               L ${trailHeadX - caveHalfWidth - 18} -45
               Q ${trailHeadX - caveHalfWidth - 6} 15 ${trailHeadX - caveHalfWidth - 2} 50
               Z`}
            fill="url(#cavernWallBaseGrad)"
            stroke="#08140E"
            strokeWidth="1.2"
          />

          {/* Right Bedrock Floor Footing */}
          <path
            d={`M ${trailHeadX + caveHalfWidth + 2} 50
               C ${trailHeadX + caveHalfWidth + 20} 58, ${trailHeadX + caveHalfWidth + 48} 62, ${trailHeadX + cliffSpan} 48
               L ${trailHeadX + cliffSpan} -45
               L ${trailHeadX + caveHalfWidth + 18} -45
               Q ${trailHeadX + caveHalfWidth + 6} 15 ${trailHeadX + caveHalfWidth + 2} 50
               Z`}
            fill="url(#cavernWallBaseGrad)"
            stroke="#08140E"
            strokeWidth="1.2"
          />
        </g>

        {/* Shallow River Crossing Flowing Under the Timber Bridge */}
        <g>
          {/* Riverbank Wet Sand & Pebble Margin */}
          <path
            d={riverCrossing.riverSvgPath}
            fill="none"
            stroke="#596E5C"
            strokeOpacity="0.38"
            strokeWidth={isMobile ? 60 : 94}
            strokeLinecap="round"
          />
          {/* Main Shallow Turquoise River Channel */}
          <path
            d={riverCrossing.riverSvgPath}
            fill="none"
            stroke="url(#ramgangaRiverGrad)"
            strokeWidth={isMobile ? 42 : 68}
            strokeLinecap="round"
          />
          {/* Shimmering Water Current Lines */}
          <path
            d={riverCrossing.riverSvgPath}
            fill="none"
            stroke="#A5F2EE"
            strokeOpacity="0.52"
            strokeWidth={isMobile ? 6 : 11}
            strokeDasharray="24 16"
            strokeLinecap="round"
          />
        </g>

        {/* Winding 3D Isometric Laterite Dirt Safari Road */}
        {/* Deep 3D Embankment Drop Shadow on Dark Emerald Floor */}
        <path
          d={roadPath}
          fill="none"
          stroke="#020A07"
          strokeOpacity="0.72"
          strokeWidth={roadBermWidth + 16}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lush Grassy Verge Cushion */}
        <path
          d={roadPath}
          fill="none"
          stroke="#194A39"
          strokeOpacity="0.85"
          strokeWidth={roadBermWidth + 6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bevelled Earth Embankment Verge */}
        <path
          d={roadPath}
          fill="none"
          stroke="#6A4328"
          strokeWidth={roadBermWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Warm Sunlit Laterite Roadbed (Primary MotionPath Target) */}
        <path
          ref={roadPathRef}
          id="wildtrail-snake-road-path"
          d={roadPath}
          fill="none"
          stroke="url(#lateriteRoadGrad)"
          strokeWidth={roadMainWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Twin Parallel Sunken 4x4 Tire Ruts */}
        <path
          d={roadPath}
          fill="none"
          stroke="#6E4022"
          strokeOpacity="0.65"
          strokeWidth={roadMainWidth - rutOffset * 2}
          strokeLinecap="round"
        />
        {/* Tactile Center Crown Highlight */}
        <path
          d={roadPath}
          fill="none"
          stroke="#E5B789"
          strokeOpacity="0.38"
          strokeWidth={isMobile ? 2.2 : 3.8}
          strokeDasharray="10 14"
          strokeLinecap="round"
        />

        {/* Cavern Ground Shading over roadbed inside cave */}
        <rect
          x={trailHeadX - caveHalfWidth}
          y="-45"
          width={caveHalfWidth * 2}
          height="80"
          fill="#010604"
          fillOpacity="0.52"
        />

        {/* Slatted Wooden Bridge Span over Ramganga River */}
        <g
          transform={`translate(${riverCrossing.bridgeX}, ${riverCrossing.bridgeY}) rotate(${riverCrossing.bridgeAngleDeg})`}
        >
          {/* Water foam curling past bridge pylons */}
          <ellipse cx="0" cy="-22" rx="24" ry="5" fill="#D5F4F4" fillOpacity="0.52" />
          <ellipse cx="0" cy="22" rx="24" ry="5" fill="#D5F4F4" fillOpacity="0.52" />

          {/* Timber Bridge Deck */}
          <rect
            x={isMobile ? -14 : -19}
            y="-36"
            width={isMobile ? 28 : 38}
            height="72"
            rx="4"
            fill="#5C3A21"
            stroke="#2D1A0E"
            strokeWidth="1.5"
          />

          {/* Individual Teak Planks */}
          {Array.from({ length: 9 }).map((_, plankIdx) => {
            const py = -31 + plankIdx * 7.6;
            return (
              <rect
                key={plankIdx}
                x={isMobile ? -12 : -16.5}
                y={py}
                width={isMobile ? 24 : 33}
                height="5"
                rx="1"
                fill={plankIdx % 2 === 0 ? '#855836' : '#734A2C'}
              />
            );
          })}

          {/* Side Timber Guardrails & Corner Posts */}
          <line
            x1={isMobile ? -13 : -18}
            y1="-36"
            x2={isMobile ? -13 : -18}
            y2="36"
            stroke="#D1AC7D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1={isMobile ? 13 : 18}
            y1="-36"
            x2={isMobile ? 13 : 18}
            y2="36"
            stroke="#D1AC7D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* 6 Spatial Waypoint Nodes at Each Bend Apex */}
        {checkpointCoords.map((cp) => {
          const isActive = cp.index === activeCheckpointIndex;
          return (
            <g key={cp.safariId} transform={`translate(${cp.x}, ${cp.y})`}>
              {/* Active Spatial Radar Ring */}
              {isActive && (
                <circle
                  cx="0"
                  cy="0"
                  r={isMobile ? 22 : 30}
                  fill="none"
                  stroke="#E4B865"
                  strokeWidth="2"
                  strokeOpacity="0.82"
                  className="animate-subtle-pulse"
                />
              )}
              {/* Waypoint Base Disk */}
              <circle
                cx="0"
                cy="0"
                r={isActive ? 13 : 9}
                fill={isActive ? '#0D2922' : '#3E2B1C'}
                stroke="#E4B865"
                strokeWidth={isActive ? 2.8 : 1.8}
              />
              {/* Inner Beacon */}
              <circle
                cx="0"
                cy="0"
                r={isActive ? 4.5 : 3}
                fill={isActive ? '#FFE08A' : '#E9DFC9'}
              />
            </g>
          );
        })}
      </svg>

      {/* PLANE 2.5: ROCK CAVE & JUNGLE CANOPY OVERPASS (LAYERED AT Z-30 OVER ROAD & JEEP) */}
      <svg
        aria-hidden="true"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="pointer-events-none absolute inset-0 z-30 overflow-visible"
      >
        <defs>
          {/* Deep Ambient Cave Shadow Mask projected onto underpass entrance */}
          <radialGradient
            id="cavePortalShadowGrad"
            cx="50%"
            cy="50%"
            r="50%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#020805" stopOpacity="0.88" />
            <stop offset="65%" stopColor="#05140E" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0B2117" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id="rockCaveOverpassGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#1E2E27" />
            <stop offset="45%" stopColor="#2A3D34" />
            <stop offset="100%" stopColor="#15221C" />
          </linearGradient>
          {/* Trailhead Cavern Gradients */}
          <radialGradient
            id="trailheadCaveMultiplyShadow"
            cx="50%"
            cy="25%"
            r="65%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#010503" stopOpacity="0.94" />
            <stop offset="45%" stopColor="#030E08" stopOpacity="0.78" />
            <stop offset="78%" stopColor="#081C12" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#081C12" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cliffRockGradLeft" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B2B22" />
            <stop offset="42%" stopColor="#253A2E" />
            <stop offset="78%" stopColor="#17271E" />
            <stop offset="100%" stopColor="#0F1B14" />
          </linearGradient>
          <linearGradient id="cliffRockGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1C2D24" />
            <stop offset="45%" stopColor="#273C30" />
            <stop offset="80%" stopColor="#192A20" />
            <stop offset="100%" stopColor="#101C15" />
          </linearGradient>
          <linearGradient id="caveArchSpanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#192820" />
            <stop offset="35%" stopColor="#263A2F" />
            <stop offset="75%" stopColor="#32493C" />
            <stop offset="100%" stopColor="#16231B" />
          </linearGradient>
          <linearGradient id="stalactiteCalciteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B2820" />
            <stop offset="72%" stopColor="#3A5243" />
            <stop offset="100%" stopColor="#D9C7A1" />
          </linearGradient>
          <linearGradient id="rockHighlightRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5E836D" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#3E5C4A" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* TRAILHEAD CAVERN ENTRANCE (PLANE 2.5: OVER-JEEP ROCK ARCH, STALACTITES & AMBIENT SHADOW) */}
        <g id="trailhead-cavern-overpass-plane25">
          {/* 1. Deep Cavern Portal Multiply Shadow Mask (z-30 over Jeep chassis at z-20) */}
          <ellipse
            cx={trailHeadX}
            cy={isMobile ? 32 : 40}
            rx={isMobile ? 54 : 76}
            ry={isMobile ? 44 : 58}
            fill="url(#trailheadCaveMultiplyShadow)"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* 2. Left Cliff Mountain Mass (Layered Rugged Rock Strata) */}
          {/* Base mass */}
          <path
            d={`M ${trailHeadX - cliffSpan} -45
               L ${trailHeadX - caveHalfWidth - 18} -45
               Q ${trailHeadX - caveHalfWidth - 10} 12 ${trailHeadX - caveHalfWidth - 4} 42
               L ${trailHeadX - caveHalfWidth - 14} 54
               Q ${trailHeadX - caveHalfWidth - 36} 66 ${trailHeadX - cliffSpan * 0.52} 58
               Q ${trailHeadX - cliffSpan * 0.78} 68 ${trailHeadX - cliffSpan} 54
               Z`}
            fill="url(#cliffRockGradLeft)"
            stroke="#0D1913"
            strokeWidth="1.8"
          />
          {/* Left Intermediate Rock Shelf / Facet */}
          <path
            d={`M ${trailHeadX - cliffSpan * 0.85} -25
               L ${trailHeadX - caveHalfWidth - 28} -18
               L ${trailHeadX - caveHalfWidth - 16} 28
               L ${trailHeadX - caveHalfWidth - 42} 48
               L ${trailHeadX - cliffSpan * 0.72} 42
               Z`}
            fill="#1E3026"
            stroke="#101C16"
            strokeWidth="1.2"
          />
          {/* Left Rock Sunlit Rim Highlight */}
          <path
            d={`M ${trailHeadX - cliffSpan} 54
               Q ${trailHeadX - cliffSpan * 0.78} 68 ${trailHeadX - cliffSpan * 0.52} 58
               Q ${trailHeadX - caveHalfWidth - 36} 66 ${trailHeadX - caveHalfWidth - 14} 54
               L ${trailHeadX - caveHalfWidth - 4} 42`}
            fill="none"
            stroke="url(#rockHighlightRim)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Left Rock Crevice Fissure */}
          <path
            d={`M ${trailHeadX - caveHalfWidth - 26} 12
               L ${trailHeadX - caveHalfWidth - 48} 28
               L ${trailHeadX - caveHalfWidth - 62} 48`}
            fill="none"
            stroke="#08100C"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* 3. Right Cliff Mountain Mass (Layered Rugged Rock Strata) */}
          {/* Base mass */}
          <path
            d={`M ${trailHeadX + cliffSpan} -45
               L ${trailHeadX + caveHalfWidth + 18} -45
               Q ${trailHeadX + caveHalfWidth + 10} 12 ${trailHeadX + caveHalfWidth + 4} 42
               L ${trailHeadX + caveHalfWidth + 14} 54
               Q ${trailHeadX + caveHalfWidth + 36} 66 ${trailHeadX + cliffSpan * 0.52} 58
               Q ${trailHeadX + cliffSpan * 0.78} 68 ${trailHeadX + cliffSpan} 54
               Z`}
            fill="url(#cliffRockGradRight)"
            stroke="#0D1913"
            strokeWidth="1.8"
          />
          {/* Right Intermediate Rock Shelf */}
          <path
            d={`M ${trailHeadX + cliffSpan * 0.85} -25
               L ${trailHeadX + caveHalfWidth + 28} -18
               L ${trailHeadX + caveHalfWidth + 16} 28
               L ${trailHeadX + caveHalfWidth + 42} 48
               L ${trailHeadX + cliffSpan * 0.72} 42
               Z`}
            fill="#1F3228"
            stroke="#101D17"
            strokeWidth="1.2"
          />
          {/* Right Rock Sunlit Rim Highlight */}
          <path
            d={`M ${trailHeadX + cliffSpan} 54
               Q ${trailHeadX + cliffSpan * 0.78} 68 ${trailHeadX + cliffSpan * 0.52} 58
               Q ${trailHeadX + caveHalfWidth + 36} 66 ${trailHeadX + caveHalfWidth + 14} 54
               L ${trailHeadX + caveHalfWidth + 4} 42`}
            fill="none"
            stroke="url(#rockHighlightRim)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Right Rock Crevice Fissure */}
          <path
            d={`M ${trailHeadX + caveHalfWidth + 24} 8
               L ${trailHeadX + caveHalfWidth + 46} 24
               L ${trailHeadX + caveHalfWidth + 68} 44`}
            fill="none"
            stroke="#08100C"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* 4. Natural Sculpted Stone Cave Arch / Cavern Vault (spanning across road) */}
          <path
            d={`M ${trailHeadX - caveHalfWidth - 14} -45
               L ${trailHeadX + caveHalfWidth + 14} -45
               L ${trailHeadX + caveHalfWidth + 16} 18
               Q ${trailHeadX + caveHalfWidth + 6} 36 ${trailHeadX + caveHalfWidth + 2} 44
               Q ${trailHeadX} ${isMobile ? 22 : 26} ${trailHeadX - caveHalfWidth - 2} 44
               Q ${trailHeadX - caveHalfWidth - 6} 36 ${trailHeadX - caveHalfWidth - 16} 18
               Z`}
            fill="url(#caveArchSpanGrad)"
            stroke="#0B1711"
            strokeWidth="2"
          />

          {/* Under-arch Inner Cavern Ceiling Lip */}
          <path
            d={`M ${trailHeadX - caveHalfWidth - 4} 44
               Q ${trailHeadX} ${isMobile ? 22 : 26} ${trailHeadX + caveHalfWidth + 4} 44
               L ${trailHeadX + caveHalfWidth} 38
               Q ${trailHeadX} ${isMobile ? 18 : 22} ${trailHeadX - caveHalfWidth} 38
               Z`}
            fill="#0F1B15"
            stroke="#08110D"
            strokeWidth="1.2"
          />

          {/* 5. Jagged Limestone Stalactites Hanging Down into Entrance */}
          {/* Stalactite 1 (Left flank) */}
          <polygon
            points={`${trailHeadX - (isMobile ? 24 : 36)},${isMobile ? 28 : 34} ${trailHeadX - (isMobile ? 20 : 30)},${isMobile ? 46 : 52} ${trailHeadX - (isMobile ? 18 : 26)},${isMobile ? 28 : 34}`}
            fill="url(#stalactiteCalciteGrad)"
            stroke="#09120D"
            strokeWidth="0.8"
          />
          {/* Stalactite 2 (Left center) */}
          <polygon
            points={`${trailHeadX - (isMobile ? 13 : 18)},${isMobile ? 25 : 30} ${trailHeadX - (isMobile ? 9 : 13)},${isMobile ? 48 : 56} ${trailHeadX - (isMobile ? 7 : 9)},${isMobile ? 25 : 30}`}
            fill="url(#stalactiteCalciteGrad)"
            stroke="#09120D"
            strokeWidth="0.8"
          />
          {/* Stalactite 3 (Center) */}
          <polygon
            points={`${trailHeadX - 4},${isMobile ? 23 : 27} ${trailHeadX},${isMobile ? 38 : 44} ${trailHeadX + 4},${isMobile ? 23 : 27}`}
            fill="url(#stalactiteCalciteGrad)"
            stroke="#09120D"
            strokeWidth="0.8"
          />
          {/* Stalactite 4 (Right center) */}
          <polygon
            points={`${trailHeadX + (isMobile ? 7 : 10)},${isMobile ? 25 : 30} ${trailHeadX + (isMobile ? 10 : 15)},${isMobile ? 47 : 54} ${trailHeadX + (isMobile ? 14 : 20)},${isMobile ? 25 : 30}`}
            fill="url(#stalactiteCalciteGrad)"
            stroke="#09120D"
            strokeWidth="0.8"
          />
          {/* Stalactite 5 (Right flank) */}
          <polygon
            points={`${trailHeadX + (isMobile ? 19 : 27)},${isMobile ? 28 : 34} ${trailHeadX + (isMobile ? 23 : 33)},${isMobile ? 44 : 50} ${trailHeadX + (isMobile ? 26 : 38)},${isMobile ? 28 : 34}`}
            fill="url(#stalactiteCalciteGrad)"
            stroke="#09120D"
            strokeWidth="0.8"
          />

          {/* 6. Wild Hanging Rainforest Vines & Creepers Drooping from Arch */}
          <path
            d={
              isMobile
                ? `M ${trailHeadX - 32} 24 Q ${trailHeadX - 36} 38 ${trailHeadX - 30} 54
                   M ${trailHeadX - 16} 20 Q ${trailHeadX - 22} 36 ${trailHeadX - 14} 58
                   M ${trailHeadX + 5} 18 Q ${trailHeadX + 2} 34 ${trailHeadX + 8} 52
                   M ${trailHeadX + 26} 24 Q ${trailHeadX + 32} 40 ${trailHeadX + 24} 60`
                : `M ${trailHeadX - 48} 28 Q ${trailHeadX - 56} 44 ${trailHeadX - 44} 66
                   M ${trailHeadX - 24} 22 Q ${trailHeadX - 32} 42 ${trailHeadX - 22} 68
                   M ${trailHeadX + 6} 20 Q ${trailHeadX + 2} 42 ${trailHeadX + 10} 64
                   M ${trailHeadX + 38} 26 Q ${trailHeadX + 46} 48 ${trailHeadX + 34} 70`
            }
            fill="none"
            stroke="#366347"
            strokeWidth={isMobile ? '2' : '2.6'}
            strokeLinecap="round"
          />
          {/* Vine Leaf Offshoots */}
          <circle cx={trailHeadX - (isMobile ? 30 : 44)} cy={isMobile ? 44 : 54} r={isMobile ? 2.5 : 3.5} fill="#467B59" />
          <circle cx={trailHeadX - (isMobile ? 15 : 23)} cy={isMobile ? 46 : 56} r={isMobile ? 2.5 : 3.5} fill="#518E67" />
          <circle cx={trailHeadX + (isMobile ? 7 : 9)} cy={isMobile ? 42 : 52} r={isMobile ? 2.5 : 3.5} fill="#467B59" />
          <circle cx={trailHeadX + (isMobile ? 26 : 36)} cy={isMobile ? 48 : 58} r={isMobile ? 2.5 : 3.5} fill="#518E67" />

          {/* Fern Clusters growing on Cliff Ledges */}
          {/* Left Fern */}
          <g transform={`translate(${trailHeadX - caveHalfWidth - 14}, 46)`}>
            <path d="M 0 0 C -8 -12 -16 -8 -22 -14" stroke="#48825C" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 0 0 C -12 -6 -20 -2 -26 -4" stroke="#366847" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M 0 0 C -8 4 -18 8 -24 6" stroke="#2A5438" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
          {/* Right Fern */}
          <g transform={`translate(${trailHeadX + caveHalfWidth + 14}, 46)`}>
            <path d="M 0 0 C 8 -12 16 -8 22 -14" stroke="#48825C" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 0 0 C 12 -6 20 -2 26 -4" stroke="#366847" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M 0 0 C 8 4 18 8 24 6" stroke="#2A5438" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>

          {/* 7. Authentic Reserve Outpost Plaque mounted on the Arch Lintel */}
          <g transform={`translate(${trailHeadX}, ${isMobile ? 4 : 8})`}>
            {/* Weathered Teak Backing */}
            <rect
              x={isMobile ? -54 : -74}
              y="-11"
              width={isMobile ? 108 : 148}
              height="20"
              rx="4"
              fill="#261A10"
              stroke="#C99A4A"
              strokeWidth="1.2"
              strokeOpacity="0.85"
            />
            {/* Brass Corner Fasteners */}
            <circle cx={isMobile ? -48 : -68} cy="-1" r="1.5" fill="#E4B865" />
            <circle cx={isMobile ? 48 : 68} cy="-1" r="1.5" fill="#E4B865" />
            {/* Plaque Typography */}
            <text
              x="0"
              y="2.5"
              textAnchor="middle"
              fill="#F4EBDA"
              fontSize={isMobile ? "7.5" : "9"}
              fontWeight="bold"
              fontFamily="monospace"
              letterSpacing="0.12em"
            >
              GATE 01 · CANYON CAVE
            </text>
          </g>
        </g>

        {/* Rock Cave / Jungle Canopy Overpass Arch centered on the Ramganga Bridge Crossing */}
        <g
          transform={`translate(${riverCrossing.bridgeX}, ${riverCrossing.bridgeY}) rotate(${riverCrossing.bridgeAngleDeg})`}
        >
          {/* Cave Entrance Shadow Mask (z-30 over Jeep at z-20) */}
          <ellipse
            cx="0"
            cy="0"
            rx={isMobile ? 36 : 56}
            ry={isMobile ? 48 : 72}
            fill="url(#cavePortalShadowGrad)"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* West Rock Abutment / Cave Wall */}
          <path
            d={
              isMobile
                ? 'M -28 -42 Q -38 -20 -32 0 Q -38 20 -28 42 L -18 38 Q -24 15 -20 0 Q -24 -15 -18 -38 Z'
                : 'M -44 -64 Q -60 -30 -52 0 Q -60 30 -44 64 L -28 58 Q -38 24 -32 0 Q -38 -24 -28 -58 Z'
            }
            fill="url(#rockCaveOverpassGrad)"
            stroke="#0D1A14"
            strokeWidth="1.5"
          />

          {/* East Rock Abutment / Cave Wall */}
          <path
            d={
              isMobile
                ? 'M 28 -42 Q 38 -20 32 0 Q 38 20 28 42 L 18 38 Q 24 15 20 0 Q 24 -15 18 -38 Z'
                : 'M 44 -64 Q 60 -30 52 0 Q 60 30 44 64 L 28 58 Q 38 24 32 0 Q 38 -24 28 -58 Z'
            }
            fill="url(#rockCaveOverpassGrad)"
            stroke="#0D1A14"
            strokeWidth="1.5"
          />

          {/* Elevated Carved Stone Cave Arch / Canopy Overpass Bridge */}
          <path
            d={
              isMobile
                ? 'M -32 -32 Q 0 -48 32 -32 L 28 -20 Q 0 -36 -28 -20 Z'
                : 'M -52 -50 Q 0 -76 52 -50 L 46 -32 Q 0 -58 -46 -32 Z'
            }
            fill="#23352C"
            stroke="#101C16"
            strokeWidth="1.8"
          />

          {/* Southern Rock Overpass Arch */}
          <path
            d={
              isMobile
                ? 'M -32 32 Q 0 48 32 32 L 28 20 Q 0 36 -28 20 Z'
                : 'M -52 50 Q 0 76 52 50 L 46 32 Q 0 58 -46 32 Z'
            }
            fill="#1E2E26"
            stroke="#0E1913"
            strokeWidth="1.8"
          />

          {/* Hanging Jungle Lianas & Spanish Moss Trailing from Overpass Arch */}
          <path
            d={
              isMobile
                ? 'M -18 -24 Q -22 -10 -16 5 M 0 -32 Q -4 -16 2 4 M 18 -24 Q 14 -10 20 6'
                : 'M -30 -38 Q -38 -15 -26 12 M 0 -52 Q -8 -25 4 8 M 30 -38 Q 22 -15 32 14'
            }
            stroke="#3B694D"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.88"
          />
        </g>
      </svg>

      {/* PLANE 3: FOREGROUND 4-CORNER JUNGLE CANOPY FRAMING */}
      {/* Top-Left Hanging Rainforest Vine & Monstera Leaf */}
      <div
        ref={topLeftFoliageRef}
        aria-hidden="true"
        data-corner-foliage="top-left"
        className="fixed top-0 left-0 w-16 h-18 sm:w-24 sm:h-26 lg:w-28 lg:h-30 pointer-events-none z-30 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${-foliageParting}px, ${foliageDriftY * 0.15}px, 0)`,
          filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))',
        }}
      >
        <svg viewBox="0 0 220 240" fill="none" className="w-full h-full">
          <path d="M -20 -20 Q 80 40 60 160 Q 50 210 20 240 Q 30 180 10 120 Z" fill="#09281E" opacity="0.9" />
          <path d="M 10 -20 Q 140 30 130 130 Q 120 180 80 210 Q 95 150 70 90 Z" fill="#0E3D2E" opacity="0.85" />
          <path d="M 40 -10 Q 180 20 180 90 Q 170 140 120 160 Z" fill="#174F3C" opacity="0.75" />
        </svg>
      </div>

      {/* Top-Right Lush Teak Canopy Branch */}
      <div
        ref={topRightFoliageRef}
        aria-hidden="true"
        data-corner-foliage="top-right"
        className="fixed top-0 right-0 w-18 h-16 sm:w-26 sm:h-24 lg:w-30 lg:h-28 pointer-events-none z-30 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${foliageParting}px, ${-foliageDriftY * 0.15}px, 0)`,
          filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))',
        }}
      >
        <svg viewBox="0 0 240 220" fill="none" className="w-full h-full">
          <path d="M 260 -20 Q 140 30 100 120 Q 80 170 120 210 Q 150 150 170 90 Z" fill="#0A2D22" opacity="0.9" />
          <path d="M 240 0 Q 120 50 70 110 Q 60 140 90 170 Z" fill="#124837" opacity="0.8" />
        </svg>
      </div>

      {/* Bottom-Left Savannah Fern */}
      <div
        ref={bottomLeftFoliageRef}
        aria-hidden="true"
        data-corner-foliage="bottom-left"
        className="fixed bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 pointer-events-none z-30 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${-foliageParting * 0.8}px, ${foliageDriftY * 0.1}px, 0)`,
          filter: 'drop-shadow(0 -6px 10px rgba(0,0,0,0.38))',
        }}
      >
        <svg viewBox="0 0 220 220" fill="none" className="w-full h-full">
          <path d="M -20 240 Q 60 170 50 70 Q 45 25 15 0 Q 25 60 10 120 Z" fill="#09281E" opacity="0.9" />
          <path d="M 10 240 Q 120 180 115 95 Q 110 50 75 25 Q 85 80 65 135 Z" fill="#0E3D2E" opacity="0.85" />
          <path d="M 35 230 Q 155 195 160 130 Q 150 85 105 70 Z" fill="#174F3C" opacity="0.75" />
        </svg>
      </div>

      {/* Bottom-Right Palm Frond */}
      <div
        ref={bottomRightFoliageRef}
        aria-hidden="true"
        data-corner-foliage="bottom-right"
        className="fixed bottom-0 right-0 w-18 h-16 sm:w-26 sm:h-24 lg:w-30 lg:h-28 pointer-events-none z-30 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${foliageParting * 0.8}px, ${-foliageDriftY * 0.1}px, 0)`,
          filter: 'drop-shadow(0 -6px 10px rgba(0,0,0,0.38))',
        }}
      >
        <svg viewBox="0 0 240 220" fill="none" className="w-full h-full">
          <path d="M 260 240 Q 150 180 110 95 Q 90 50 125 15 Q 155 70 175 130 Z" fill="#0A2D22" opacity="0.9" />
          <path d="M 240 220 Q 130 170 80 115 Q 65 85 95 55 Z" fill="#124837" opacity="0.8" />
        </svg>
      </div>
    </>
  );
}
