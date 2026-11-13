import React, { useMemo, useEffect, useRef } from 'react';

/**
 * JungleTrailCanvas
 * Renders the three environmental parallax depth planes:
 * 1. Background: Topographical contour lines, meandering jungle rivers, volumetric god rays, and elevation markers.
 * 2. Midground: Continuous S-curve dirt safari road, wooden bridge plank crossings, and waypoint radar nodes.
 * 3. Foreground: High-depth-of-field jungle foliage (ferns, canopy branches, lianas) that subtly part with scroll.
 */
export default function JungleTrailCanvas({
  pathRef,
  roadPathData = '',
  pathDimensions = { width: 1400, height: 5600 },
  stations = [],
  riverCrossings = [],
  scrollProgress = 0,
  scrollVelocity = 0,
  activeCheckpointIndex = 0
}) {
  const { width, height } = pathDimensions;
  const activeTrailRef = useRef(null);

  // Synchronize active trail blaze line stroke offset without reading refs during render
  useEffect(() => {
    if (pathRef.current && activeTrailRef.current) {
      const len = pathRef.current.getTotalLength();
      activeTrailRef.current.style.strokeDasharray = `${len}`;
      activeTrailRef.current.style.strokeDashoffset = `${len * (1 - scrollProgress)}`;
    }
  }, [scrollProgress, pathRef, roadPathData]);

  // Parallax offsets for foreground foliage parting
  const foliageParting = Math.min(Math.abs(scrollVelocity) * 12, 35);
  const foliageDriftY = (scrollProgress * 180) % 80;

  // Generate background rivers that weave across the landscape
  const riverPaths = useMemo(() => {
    if (!height || !width) return [];
    return [
      `M -50 ${height * 0.18} Q ${width * 0.35} ${height * 0.22}, ${width * 0.55} ${height * 0.20} T ${width + 50} ${height * 0.25}`,
      `M -50 ${height * 0.48} Q ${width * 0.4} ${height * 0.46}, ${width * 0.65} ${height * 0.52} T ${width + 50} ${height * 0.49}`,
      `M -50 ${height * 0.76} Q ${width * 0.3} ${height * 0.81}, ${width * 0.7} ${height * 0.74} T ${width + 50} ${height * 0.79}`
    ];
  }, [width, height]);

  // Generate topographic contour curves
  const topoContours = useMemo(() => {
    if (!height || !width) return [];
    const contours = [];
    for (let i = 1; i <= 15; i++) {
      const yBase = (height / 16) * i;
      const waveAmp = (i % 2 === 0 ? 1 : -1) * (width * 0.12);
      contours.push(
        `M -50 ${yBase} Q ${width * 0.3} ${yBase + waveAmp}, ${width * 0.7} ${yBase - waveAmp} T ${width + 50} ${yBase}`
      );
    }
    return contours;
  }, [width, height]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: '100%', height }}
    >
      {/* ========================================================
          PLANE 1: BACKGROUND (Topographical Map, Volumetric God Rays & Rivers)
         ======================================================== */}
      <svg
        className="w-full h-full absolute inset-0 overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Topographic line gradient */}
          <linearGradient id="topoLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C99A4A" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#1E4D40" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#C99A4A" stopOpacity="0.10" />
          </linearGradient>

          {/* Jungle River Gradient */}
          <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0E7490" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#0284C7" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0.45" />
          </linearGradient>

          {/* Volumetric Dappled Sunlight God Rays */}
          <linearGradient id="godRayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.15" />
            <stop offset="40%" stopColor="#FBBF24" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#173F35" stopOpacity="0" />
          </linearGradient>

          {/* Dirt Road Bed Shading */}
          <linearGradient id="roadEarthBed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A3423" />
            <stop offset="35%" stopColor="#2E1F14" />
            <stop offset="70%" stopColor="#3F2B1D" />
            <stop offset="100%" stopColor="#1C120B" />
          </linearGradient>

          {/* Traveled Gold/Emerald Trail Blaze */}
          <linearGradient id="activeBlazeLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#EAB308" stopOpacity="1" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.95" />
          </linearGradient>

          {/* Waypoint Radar Pulse Filter */}
          <filter id="glowPulse" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Volumetric God Rays (Dappled Canopy Sunlight Shafts in Dawn & Midground) */}
        <polygon
          points={`0,${height * 0.05} ${width * 0.45},0 ${width * 0.75},${height * 0.35} 0,${height * 0.28}`}
          fill="url(#godRayGrad)"
        />
        <polygon
          points={`${width * 0.35},${height * 0.32} ${width},${height * 0.22} ${width},${height * 0.58} ${width * 0.25},${height * 0.62}`}
          fill="url(#godRayGrad)"
          opacity="0.8"
        />

        {/* Topographic Elevation Contours */}
        {topoContours.map((d, idx) => (
          <path
            key={idx}
            d={d}
            stroke="url(#topoLineGrad)"
            strokeWidth="1.2"
            strokeDasharray={idx % 3 === 0 ? "8 6" : "none"}
            fill="none"
          />
        ))}

        {/* Meandering Jungle Rivers with Riverbank Shading */}
        {riverPaths.map((d, idx) => (
          <g key={idx}>
            {/* Riverbed Outer Bank */}
            <path
              d={d}
              stroke="#082F49"
              strokeWidth="56"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
            {/* Flowing Water Core */}
            <path
              d={d}
              stroke="url(#riverGrad)"
              strokeWidth="38"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Water Current Flow Lines */}
            <path
              d={d}
              stroke="#BAE6FD"
              strokeWidth="2"
              strokeDasharray="14 24"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>
        ))}

        {/* Explorer Compass Rose & Geographic Coordinates Watermarks */}
        <g opacity="0.12" fill="#E9DFC9" className="font-mono text-[11px] font-bold select-none">
          <text x="45" y={height * 0.12}>GEO-ZONE: 20°14'N // 79°22'E [TADOBA BASIN]</text>
          <text x="45" y={height * 0.35}>GEO-ZONE: 21°41'N // 79°18'E [PENCH CANOPY]</text>
          <text x="45" y={height * 0.58}>GEO-ZONE: 22°20'N // 80°38'E [KANHA SAL PLATEAU]</text>
          <text x="45" y={height * 0.82}>GEO-ZONE: 26°01'N // 76°30'E [RANTHAMBORE HERITAGE]</text>
        </g>

        {/* ========================================================
            PLANE 2: MIDGROUND (The Winding Dirt Trail & Bridge Crossings)
           ======================================================== */}
        
        {/* Road Bed: Packed Earth / Gravel Base Track */}
        <path
          d={roadPathData}
          stroke="url(#roadEarthBed)"
          strokeWidth="48"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-lg"
        />

        {/* Dust & Sand Crown Layer */}
        <path
          d={roadPathData}
          stroke="#8C6338"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />

        {/* Parallel Dark Tire Rut Tracks */}
        <path
          d={roadPathData}
          stroke="#1F140B"
          strokeWidth="2.5"
          strokeDasharray="10 12"
          strokeLinecap="round"
          transform="translate(-8, 0)"
          opacity="0.55"
        />
        <path
          d={roadPathData}
          stroke="#1F140B"
          strokeWidth="2.5"
          strokeDasharray="10 12"
          strokeLinecap="round"
          transform="translate(8, 0)"
          opacity="0.55"
        />

        {/* Center Trail Reference Path for GSAP / Vehicle coordinate sampling */}
        <path
          ref={pathRef}
          d={roadPathData}
          stroke="transparent"
          strokeWidth="1"
          fill="none"
        />

        {/* Active Traveled Trail Line (Illuminates in Gold/Emerald Behind the Jeep) */}
        <path
          ref={activeTrailRef}
          d={roadPathData}
          stroke="url(#activeBlazeLine)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glowPulse)"
        />

        {/* Wooden Bridge Planks Over River Intersections */}
        {riverCrossings.map((cross, idx) => (
          <g key={idx} transform={`translate(${cross.x}, ${cross.y})`}>
            {/* Bridge Support Beams */}
            <rect x="-30" y="-18" width="60" height="36" rx="4" fill="#3D210B" stroke="#1C0E04" strokeWidth="1.5" />
            {/* Wooden Planks */}
            {[-14, -7, 0, 7, 14].map((px) => (
              <rect
                key={px}
                x={px - 2.5}
                y="-17"
                width="5"
                height="34"
                rx="1"
                fill="#78350F"
                stroke="#451A03"
                strokeWidth="0.8"
              />
            ))}
            {/* Bridge Rope Guard Rails */}
            <line x1="-30" y1="-17" x2="30" y2="-17" stroke="#D4AF37" strokeWidth="1.8" strokeDasharray="3 3" />
            <line x1="-30" y1="17" x2="30" y2="17" stroke="#D4AF37" strokeWidth="1.8" strokeDasharray="3 3" />
          </g>
        ))}

        {/* Destination Curve Apex Waypoint Pulsing Rings */}
        {stations.map((st, idx) => {
          const isPassed = scrollProgress >= (idx / (stations.length - 1)) - 0.04;
          const isCurrent = activeCheckpointIndex === idx;

          return (
            <g key={idx} transform={`translate(${st.x}, ${st.y})`} className="pointer-events-auto">
              {/* Radar Wave Ping when Jeep is nearby */}
              {isCurrent && (
                <circle
                  r="26"
                  fill="none"
                  stroke="#C99A4A"
                  strokeWidth="2"
                  opacity="0.8"
                  className="animate-ping"
                />
              )}

              {/* Waypoint Base Ring */}
              <circle
                r="14"
                fill={isPassed ? "#0D2922" : "#24180E"}
                stroke={isPassed ? "#C99A4A" : "#8C6338"}
                strokeWidth="3.5"
                className="drop-shadow-md"
              />

              {/* Station Number Badge */}
              <circle
                r="7"
                fill={isPassed ? "#C99A4A" : "#57402C"}
              />

              {/* Text Tag (Station Label) */}
              <text
                x={st.align === 'left' ? -22 : 22}
                y="5"
                textAnchor={st.align === 'left' ? 'end' : 'start'}
                fill={isPassed ? "#E9DFC9" : "#A8A29E"}
                fontSize="12"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="800"
                className="select-none drop-shadow"
              >
                0{idx + 1} · {st?.name ? st.name.replace(" Tiger Reserve", "").replace(" National Park", "") : `Reserve 0${idx + 1}`}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ========================================================
          PLANE 3: FOREGROUND (Lush Jungle Foliage Framing the Edges)
         ======================================================== */}
      
      {/* Top-Left Hanging Rainforest Vine & Monstera Leaf */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-30 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${-foliageParting}px, ${foliageDriftY * 0.15}px, 0)`,
          filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.5))'
        }}
      >
        <svg width="220" height="240" viewBox="0 0 220 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M -20 -20 Q 80 40 60 160 Q 50 210 20 240 Q 30 180 10 120 Z"
            fill="#09281E"
            opacity="0.9"
          />
          <path
            d="M 10 -20 Q 140 30 130 130 Q 120 180 80 210 Q 95 150 70 90 Z"
            fill="#0E3D2E"
            opacity="0.85"
          />
          <path
            d="M 40 -10 Q 180 20 180 90 Q 170 140 120 160 Z"
            fill="#174F3C"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Top-Right Lush Teak Canopy Branch */}
      <div
        className="fixed top-0 right-0 pointer-events-none z-30 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${foliageParting}px, ${-foliageDriftY * 0.15}px, 0)`,
          filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.5))'
        }}
      >
        <svg width="240" height="220" viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 260 -20 Q 140 30 100 120 Q 80 170 120 210 Q 150 150 170 90 Z"
            fill="#0A2D22"
            opacity="0.9"
          />
          <path
            d="M 240 0 Q 120 50 70 110 Q 60 140 90 170 Z"
            fill="#124837"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Bottom-Left Wild Savannah Fern */}
      <div
        className="fixed bottom-0 left-0 pointer-events-none z-30 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${-foliageParting * 0.8}px, ${foliageDriftY * 0.1}px, 0)`,
          filter: 'drop-shadow(0 -10px 15px rgba(0,0,0,0.4))'
        }}
      >
        <svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M -30 200 Q 40 110 30 50 Q 50 100 60 150 Z"
            fill="#0B2B20"
            opacity="0.92"
          />
          <path
            d="M -10 200 Q 80 120 110 80 Q 90 130 70 180 Z"
            fill="#134736"
            opacity="0.82"
          />
        </svg>
      </div>

      {/* Bottom-Right Palm Frond */}
      <div
        className="fixed bottom-0 right-0 pointer-events-none z-30 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${foliageParting * 0.8}px, ${-foliageDriftY * 0.1}px, 0)`,
          filter: 'drop-shadow(0 -10px 15px rgba(0,0,0,0.4))'
        }}
      >
        <svg width="210" height="190" viewBox="0 0 210 190" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 230 200 Q 140 120 120 50 Q 150 110 170 160 Z"
            fill="#08261C"
            opacity="0.9"
          />
          <path
            d="M 220 200 Q 120 140 80 90 Q 110 140 140 180 Z"
            fill="#144C3A"
            opacity="0.85"
          />
        </svg>
      </div>
    </div>
  );
}
