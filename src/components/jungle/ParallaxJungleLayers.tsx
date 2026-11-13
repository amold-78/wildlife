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
        </defs>

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
