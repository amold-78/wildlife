import React from 'react';

export interface SafariFamilyJeepRefs {
  containerRef: React.RefObject<HTMLDivElement | null>;
  chassisRef: React.RefObject<SVGGElement | null>;
  headlightRef: React.RefObject<SVGGElement | null>;
  dustGroupRef: React.RefObject<SVGGElement | null>;
  splashGroupRef: React.RefObject<SVGGElement | null>;
  wheelTreadRefs: React.MutableRefObject<(SVGGElement | null)[]>;
  coPilotCameraRef?: React.RefObject<SVGGElement | null>;
  kidBinocularRef?: React.RefObject<SVGGElement | null>;
  kidPointerRef?: React.RefObject<SVGGElement | null>;
  underpassShadowRef?: React.RefObject<SVGGElement | null>;
}

interface SafariFamilyJeepProps {
  refs: SafariFamilyJeepRefs;
  forceHeadlights?: boolean;
}

/**
 * Top-down / 2.5D open-top 4x4 safari Jeep carrying an excited family.
 * Layered at z-20 (beneath z-30 cave masks & z-40 destination cards, above z-10 road).
 * Geometry faces +X (right) so GSAP MotionPathPlugin `autoRotate: true`
 * steers the vehicle tangent to the winding S-curve dirt trail, while passengers'
 * heads, telephoto camera, and binoculars swivel toward nearby wildlife.
 */
export default function SafariFamilyJeep({
  refs,
  forceHeadlights = false,
}: SafariFamilyJeepProps) {
  const setWheelRef = (index: number) => (node: SVGGElement | null) => {
    refs.wheelTreadRefs.current[index] = node;
  };

  return (
    <div
      ref={refs.containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 z-20 w-[96px] h-[58px] will-change-transform"
      style={{ transform: 'translate3d(-9999px, -9999px, 0)' }}
    >
      <svg
        width="96"
        height="58"
        viewBox="0 0 96 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible select-none"
      >
        <defs>
          <linearGradient id="jeepHeadlightGrad" x1="86" y1="29" x2="256" y2="29" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE69A" stopOpacity="0.92" />
            <stop offset="38%" stopColor="#F5C36A" stopOpacity="0.46" />
            <stop offset="100%" stopColor="#F5C36A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="jeepBodyGrad" x1="12" y1="10" x2="86" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5D6F4B" />
            <stop offset="55%" stopColor="#465738" />
            <stop offset="100%" stopColor="#35432A" />
          </linearGradient>
          <linearGradient id="jeepHoodGrad" x1="58" y1="14" x2="86" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D6BE8C" />
            <stop offset="100%" stopColor="#BA9F6B" />
          </linearGradient>
          <radialGradient id="caveUnderpassShadowGrad" cx="50%" cy="50%" r="58%">
            <stop offset="0%" stopColor="#010604" stopOpacity="0.96" />
            <stop offset="58%" stopColor="#04120C" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#0B2117" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        {/* Warm Headlight Beams projecting ahead along +X and sweeping onto nearby wildlife */}
        <g
          ref={refs.headlightRef}
          style={{ opacity: forceHeadlights ? 0.92 : 0 }}
        >
          <path
            d="M 85 16 L 254 -28 L 254 36 L 85 23 Z"
            fill="url(#jeepHeadlightGrad)"
          />
          <path
            d="M 85 35 L 254 22 L 254 86 L 85 42 Z"
            fill="url(#jeepHeadlightGrad)"
          />
        </g>

        {/* Rear Laterite Dust Plume (visible on fast dirt scrolling) */}
        <g ref={refs.dustGroupRef} style={{ opacity: 0 }}>
          <circle cx="4" cy="14" r="5" fill="#C48F64" fillOpacity="0.48" />
          <circle cx="-8" cy="11" r="7.5" fill="#D5A67D" fillOpacity="0.34" />
          <circle cx="-21" cy="15" r="9.5" fill="#E3BE98" fillOpacity="0.22" />
          <circle cx="4" cy="44" r="5" fill="#C48F64" fillOpacity="0.48" />
          <circle cx="-8" cy="47" r="7.5" fill="#D5A67D" fillOpacity="0.34" />
          <circle cx="-21" cy="43" r="9.5" fill="#E3BE98" fillOpacity="0.22" />
        </g>

        {/* River Water Splashes (emitted when crossing Ramganga ford) */}
        <g ref={refs.splashGroupRef} style={{ opacity: 0 }}>
          <ellipse cx="66" cy="4" rx="8" ry="3.5" fill="#CBEFF2" fillOpacity="0.65" />
          <ellipse cx="22" cy="4" rx="9" ry="4" fill="#CBEFF2" fillOpacity="0.65" />
          <ellipse cx="66" cy="54" rx="8" ry="3.5" fill="#CBEFF2" fillOpacity="0.65" />
          <ellipse cx="22" cy="54" rx="9" ry="4" fill="#CBEFF2" fillOpacity="0.65" />
          <circle cx="10" cy="6" r="2.2" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="2" cy="11" r="2.8" fill="#A6E3E9" fillOpacity="0.78" />
          <circle cx="10" cy="52" r="2.2" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="2" cy="47" r="2.8" fill="#A6E3E9" fillOpacity="0.78" />
        </g>

        {/* Ground Shadow */}
        <rect
          x="10"
          y="9"
          width="78"
          height="42"
          rx="10"
          fill="#06140E"
          fillOpacity="0.34"
        />

        {/* Animated Off-Road 4x4 Tires (4 corners) */}
        {[
          { x: 18, y: 7 },
          { x: 63, y: 7 },
          { x: 18, y: 45 },
          { x: 63, y: 45 },
        ].map((wheel, idx) => (
          <g key={idx} transform={`translate(${wheel.x}, ${wheel.y})`}>
            <rect x="0" y="0" width="16" height="6" rx="2.2" fill="#171A19" />
            <g ref={setWheelRef(idx)}>
              <rect x="2" y="0.5" width="2" height="5" rx="0.5" fill="#464E4A" />
              <rect x="7" y="0.5" width="2" height="5" rx="0.5" fill="#464E4A" />
              <rect x="12" y="0.5" width="2" height="5" rx="0.5" fill="#464E4A" />
            </g>
          </g>
        ))}

        {/* Chassis Group with Velocity-Locked Suspension Bounce */}
        <g ref={refs.chassisRef}>
          {/* Rear Spare Tire mounted on tailgate */}
          <rect x="5" y="21" width="5.5" height="16" rx="2.5" fill="#181C1B" stroke="#363E3A" strokeWidth="1" />

          {/* Main 4x4 Chassis Tub */}
          <rect
            x="10"
            y="11"
            width="76"
            height="36"
            rx="7"
            fill="url(#jeepBodyGrad)"
            stroke="#1F281A"
            strokeWidth="1.4"
          />

          {/* Expedition Sand Bonnet / Hood */}
          <path
            d="M 59 13 H 80 C 83 13 85 15 85 18 V 40 C 85 43 83 45 80 45 H 59 V 13 Z"
            fill="url(#jeepHoodGrad)"
            stroke="#8B7449"
            strokeWidth="0.9"
          />

          {/* Hood Intake Louvers */}
          <rect x="67" y="21" width="10" height="2" rx="1" fill="#7D683F" opacity="0.65" />
          <rect x="67" y="25" width="10" height="2" rx="1" fill="#7D683F" opacity="0.65" />
          <rect x="67" y="31" width="10" height="2" rx="1" fill="#7D683F" opacity="0.65" />
          <rect x="67" y="35" width="10" height="2" rx="1" fill="#7D683F" opacity="0.65" />

          {/* Front Steel Bull Bar & Headlamps */}
          <rect x="85.5" y="15" width="3" height="28" rx="1.4" fill="#232926" />
          <circle cx="84.5" cy="18.5" r="2.2" fill="#FFF3C4" />
          <circle cx="84.5" cy="39.5" r="2.2" fill="#FFF3C4" />

          {/* Tail Lamps */}
          <rect x="9.5" y="14" width="2" height="4.5" rx="0.8" fill="#D94E34" />
          <rect x="9.5" y="39.5" width="2" height="4.5" rx="0.8" fill="#D94E34" />

          {/* Open Cabin Interior */}
          <rect x="15" y="14.5" width="42" height="29" rx="3.5" fill="#222A22" />

          {/* Windshield Frame & Tinted Glass */}
          <path
            d="M 54 13.5 L 59 14.5 V 43.5 L 54 44.5 Z"
            fill="#9BD4CE"
            fillOpacity="0.82"
            stroke="#1F281A"
            strokeWidth="1"
          />

          {/* Rear Bench Seat & Front Seats */}
          <rect x="18" y="17" width="11" height="24" rx="2.5" fill="#7B5636" />
          <rect x="38" y="16.5" width="10" height="10" rx="2.5" fill="#7B5636" />
          <rect x="38" y="31.5" width="10" height="10" rx="2.5" fill="#7B5636" />

          {/* Roll Cage Bars */}
          <line x1="14" y1="14" x2="54" y2="14" stroke="#1E241F" strokeWidth="2.1" strokeLinecap="round" />
          <line x1="14" y1="44" x2="54" y2="44" stroke="#1E241F" strokeWidth="2.1" strokeLinecap="round" />
          <line x1="33" y1="13.5" x2="33" y2="44.5" stroke="#1E241F" strokeWidth="1.9" />
          <line x1="14.5" y1="13.5" x2="14.5" y2="44.5" stroke="#1E241F" strokeWidth="1.9" />

          {/* Family Crew inside the Jeep */}
          {/* 1. Driver (Front-Right, Steering Wheel + Safari Pith Hat) */}
          <circle cx="48" cy="36.5" r="3" fill="none" stroke="#111" strokeWidth="1.2" />
          <ellipse cx="43.5" cy="36.5" rx="4.2" ry="4.8" fill="#C9A86A" />
          <circle cx="43.5" cy="36.5" r="3.4" fill="#D9BA7C" stroke="#8C6D38" strokeWidth="0.7" />
          <circle cx="43.5" cy="36.5" r="2" fill="#B59354" />

          {/* 2. Co-Pilot Parent (Front-Left with Swiveling Telephoto Camera tracking wildlife) */}
          <g ref={refs.coPilotCameraRef}>
            <ellipse cx="43.5" cy="21.5" rx="4" ry="4.5" fill="#E39A4A" />
            <circle cx="43.5" cy="21.5" r="2.8" fill="#2A2420" />
            <rect x="42.2" y="13" width="2.8" height="5.8" rx="0.9" fill="#17191A" />
            <circle cx="43.6" cy="13" r="1.2" fill="#7CD6D3" />
          </g>

          {/* 3. Child 1 (Rear-Right with Brass Binoculars tracking wildlife) */}
          <g ref={refs.kidBinocularRef}>
            <ellipse cx="24" cy="35" rx="3.4" ry="3.8" fill="#D96B43" />
            <circle cx="24" cy="35" r="2.5" fill="#2D231E" />
            <rect x="25.2" y="38.2" width="3.4" height="2.2" rx="0.6" fill="#C99A4A" />
          </g>

          {/* 4. Child 2 (Rear-Left pointing toward active wildlife with expedition cap) */}
          <g ref={refs.kidPointerRef}>
            <ellipse cx="24" cy="22.5" rx="3.4" ry="3.8" fill="#4FA38B" />
            <circle cx="24" cy="22.5" r="2.6" fill="#E8C987" />
            <path d="M 24 19.8 L 28.2 16.8" stroke="#F4D3A1" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </g>

        {/* Smooth Dark Shadow Gradient Overlay for Cave / Canopy Underpass Effect */}
        <g
          ref={refs.underpassShadowRef}
          style={{ opacity: 0, mixBlendMode: 'multiply' }}
          className="pointer-events-none transition-opacity duration-300"
        >
          <rect
            x="4"
            y="5"
            width="88"
            height="48"
            rx="8"
            fill="url(#caveUnderpassShadowGrad)"
          />
        </g>
      </svg>
    </div>
  );
}
