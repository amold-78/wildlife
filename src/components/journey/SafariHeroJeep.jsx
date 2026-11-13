import React, { useRef, useEffect, useState } from 'react';

/**
 * SafariHeroJeep
 * Top-down / 2.5D open-top 4x4 expedition Jeep carrying an adventurous family.
 * Features:
 * - Driver in safari bush hat at the wheel
 * - Mother with telephoto camera aiming dynamically toward nearest alert wildlife
 * - Child with binoculars aiming toward wildlife sightings
 * - Child with field notebook
 * - Chassis suspension micro-bounce based on scroll speed
 * - Dual forward headlight beams with variable intensity
 * - Mud-terrain wheels with dynamic tread rotation
 * - Canvas dust particles and water spray emissions
 */
export default function SafariHeroJeep({
  scrollVelocity = 0,
  isRiverCrossing = false,
  nightFactor = 0,
  targetPassengerAngle = null, // Angle in degrees pointing to the active wildlife
  jeepRef
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const [bounceOffset, setBounceOffset] = useState(0);

  // Chassis suspension bounce animation driven by velocity
  useEffect(() => {
    let animId;
    let tick = 0;

    const updateBounce = () => {
      const absVel = Math.abs(scrollVelocity);
      if (absVel > 0.2) {
        tick += 0.15;
        const offset = Math.sin(tick) * Math.min(absVel * 0.8, 2.5);
        setBounceOffset(offset);
      } else {
        setBounceOffset(0);
      }
      animId = requestAnimationFrame(updateBounce);
    };

    animId = requestAnimationFrame(updateBounce);
    return () => cancelAnimationFrame(animId);
  }, [scrollVelocity]);

  // Particle emission system for tire dust and river water spray
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const renderParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const absVel = Math.abs(scrollVelocity);

      // Spawn dust or water particles when moving
      if (absVel > 0.4 && Math.random() < Math.min(absVel * 0.35, 0.8)) {
        const isWater = isRiverCrossing;
        // Spawn from left and right rear wheel hubs
        [-14, 14].forEach((wheelX) => {
          particlesRef.current.push({
            x: 28 + wheelX + (Math.random() * 4 - 2),
            y: 72 + Math.random() * 4,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 1.5 + Math.random() * 2.5,
            size: isWater ? 2 + Math.random() * 3 : 3 + Math.random() * 4,
            alpha: 0.65,
            decay: 0.02 + Math.random() * 0.02,
            isWater
          });
        });
      }

      // Update and draw existing particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size *= 1.02;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        if (p.isWater) {
          ctx.fillStyle = `rgba(147, 197, 253, ${p.alpha})`;
        } else {
          ctx.fillStyle = `rgba(180, 140, 90, ${p.alpha * 0.8})`;
        }
        ctx.fill();
      }

      animId = requestAnimationFrame(renderParticles);
    };

    animId = requestAnimationFrame(renderParticles);
    return () => cancelAnimationFrame(animId);
  }, [scrollVelocity, isRiverCrossing]);

  // Headlight beam intensity: gets brighter and casts longer as nightFactor increases
  const beamOpacity = 0.35 + nightFactor * 0.55;
  const beamLength = 85 + nightFactor * 55;

  // Passenger aiming rotation (clamp to reasonable neck swivel -55deg to +55deg)
  const passengerAimAngle = targetPassengerAngle !== null
    ? Math.max(-55, Math.min(55, targetPassengerAngle))
    : 0;

  return (
    <div
      ref={jeepRef}
      className="absolute top-0 left-0 will-change-transform z-30 pointer-events-none"
      style={{
        width: 56,
        height: 96,
        transformOrigin: '28px 48px'
      }}
    >
      {/* Dynamic Forward Headlight Beams (Illuminates nearby animals) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500"
        style={{
          top: -beamLength,
          width: 90 + nightFactor * 35,
          height: beamLength,
          clipPath: 'polygon(35% 100%, 65% 100%, 100% 0%, 0% 0%)',
          background: `linear-gradient(to top, rgba(254, 243, 199, ${beamOpacity}), rgba(245, 158, 11, 0))`,
          filter: 'blur(2px)'
        }}
      />

      {/* Tire Dust & Water Splash Canvas Layer */}
      <canvas
        ref={canvasRef}
        width={56}
        height={110}
        className="absolute -top-4 -left-0 pointer-events-none"
      />

      {/* Detailed SVG Vehicle Silhouette */}
      <svg
        viewBox="0 0 56 96"
        width="56"
        height="96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl overflow-visible"
        style={{
          transform: `translateY(${bounceOffset}px)`
        }}
      >
        <defs>
          {/* Ground drop shadow under chassis */}
          <filter id="chassisShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#0D2922" floodOpacity="0.45" />
          </filter>

          {/* Safari Olive Body Gradient */}
          <linearGradient id="safariBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#13362D" />
            <stop offset="50%" stopColor="#1E4D40" />
            <stop offset="100%" stopColor="#13362D" />
          </linearGradient>

          {/* Hood Highlights */}
          <linearGradient id="hoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A6353" />
            <stop offset="100%" stopColor="#173F35" />
          </linearGradient>

          {/* Canvas Sand Interior */}
          <linearGradient id="canvasInterior" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5D9C3" />
            <stop offset="100%" stopColor="#C9B89B" />
          </linearGradient>
        </defs>

        {/* Contact Shadow */}
        <ellipse cx="28" cy="50" rx="23" ry="38" fill="#051510" fillOpacity="0.4" filter="blur(3px)" />

        {/* 4 Heavy-Duty Mud Tires with Rotating Tread Markings */}
        {/* Front-Left Tire */}
        <g transform="translate(1, 18)">
          <rect x="0" y="0" width="7" height="17" rx="2" fill="#1C1917" stroke="#292524" strokeWidth="0.8" />
          <line x1="1" y1="5" x2="6" y2="5" stroke="#57534E" strokeWidth="1" strokeDasharray="1 2" />
          <line x1="1" y1="12" x2="6" y2="12" stroke="#57534E" strokeWidth="1" strokeDasharray="1 2" />
        </g>
        {/* Front-Right Tire */}
        <g transform="translate(48, 18)">
          <rect x="0" y="0" width="7" height="17" rx="2" fill="#1C1917" stroke="#292524" strokeWidth="0.8" />
          <line x1="1" y1="5" x2="6" y2="5" stroke="#57534E" strokeWidth="1" strokeDasharray="1 2" />
          <line x1="1" y1="12" x2="6" y2="12" stroke="#57534E" strokeWidth="1" strokeDasharray="1 2" />
        </g>
        {/* Rear-Left Tire */}
        <g transform="translate(1, 62)">
          <rect x="0" y="0" width="7" height="17" rx="2" fill="#1C1917" stroke="#292524" strokeWidth="0.8" />
          <line x1="1" y1="5" x2="6" y2="5" stroke="#57534E" strokeWidth="1" strokeDasharray="1 2" />
          <line x1="1" y1="12" x2="6" y2="12" stroke="#57534E" strokeWidth="1" strokeDasharray="1 2" />
        </g>
        {/* Rear-Right Tire */}
        <g transform="translate(48, 62)">
          <rect x="0" y="0" width="7" height="17" rx="2" fill="#1C1917" stroke="#292524" strokeWidth="0.8" />
          <line x1="1" y1="5" x2="6" y2="5" stroke="#57534E" strokeWidth="1" strokeDasharray="1 2" />
          <line x1="1" y1="12" x2="6" y2="12" stroke="#57534E" strokeWidth="1" strokeDasharray="1 2" />
        </g>

        {/* Mud Flaps */}
        <rect x="0" y="80" width="8" height="2" rx="0.5" fill="#292524" />
        <rect x="48" y="80" width="8" height="2" rx="0.5" fill="#292524" />

        {/* Main Body Shell */}
        <rect
          x="7"
          y="13"
          width="42"
          height="70"
          rx="7"
          fill="url(#safariBodyGrad)"
          stroke="#0D2922"
          strokeWidth="1.5"
          filter="url(#chassisShadow)"
        />

        {/* Front Steel Bumper & Winch */}
        <rect x="11" y="8" width="34" height="6" rx="2" fill="#262626" stroke="#404040" strokeWidth="0.8" />
        <rect x="23" y="9" width="10" height="4" rx="1" fill="#737373" />
        {/* High-Intensity Fog Lamps */}
        <circle cx="16" cy="11" r="2.5" fill="#FEF08A" stroke="#F59E0B" strokeWidth="0.8" />
        <circle cx="40" cy="11" r="2.5" fill="#FEF08A" stroke="#F59E0B" strokeWidth="0.8" />

        {/* Hood Surface & Louvers */}
        <path d="M12 14 L44 14 L41 30 L15 30 Z" fill="url(#hoodGrad)" stroke="#0E2D25" strokeWidth="0.8" />
        <line x1="21" y1="19" x2="35" y2="19" stroke="#0D2922" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="23" x2="34" y2="23" stroke="#0D2922" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="27" x2="32" y2="27" stroke="#0D2922" strokeWidth="1.5" strokeLinecap="round" />

        {/* Tinted Windshield Glass */}
        <polygon
          points="13,31 43,31 41,39 15,39"
          fill="#BAE6FD"
          fillOpacity="0.5"
          stroke="#0D2922"
          strokeWidth="1.2"
        />
        {/* Dual Windshield Wipers */}
        <line x1="22" y1="36" x2="27" y2="33" stroke="#1F2937" strokeWidth="1" strokeLinecap="round" />
        <line x1="33" y1="36" x2="38" y2="33" stroke="#1F2937" strokeWidth="1" strokeLinecap="round" />

        {/* Open-Air Passenger Cabin */}
        <rect x="11" y="40" width="34" height="34" rx="3" fill="url(#canvasInterior)" stroke="#11332A" strokeWidth="1" />

        {/* Dashboard & Steering Wheel */}
        <rect x="13" y="41" width="30" height="4" rx="1" fill="#422006" />
        <ellipse cx="21" cy="43" rx="3.5" ry="1.5" fill="#1C1917" />

        {/* ========================================================
            THE EXCITED ADVENTURE FAMILY (Top-Down Silhouette Rendering)
            Passengers swivel heads and aim cameras toward active wildlife
           ======================================================== */}
        
        {/* ROW 1 (Front Seats): Dad (Driver) and Mom (Wildlife Photographer) */}
        {/* Dad Driver (Left Seat) */}
        <g transform="translate(16, 45)">
          <rect x="-4" y="-1" width="10" height="9" rx="2" fill="#78350F" />
          <ellipse cx="1" cy="3" rx="5" ry="3.5" fill="#365314" />
          {/* Safari Bush Hat */}
          <ellipse cx="1" cy="3" rx="4.8" ry="4.2" fill="#A16207" />
          <ellipse cx="1" cy="3" rx="3.2" ry="2.8" fill="#CA8A04" />
        </g>

        {/* Mom Photographer (Right Seat, aiming DSLR camera toward nearby wildlife) */}
        <g
          transform={`translate(39, 45) rotate(${passengerAimAngle})`}
          className="transition-transform duration-500 ease-out origin-center"
        >
          <rect x="-6" y="-1" width="10" height="9" rx="2" fill="#78350F" />
          <ellipse cx="-1" cy="3" rx="5" ry="3.5" fill="#155E75" />
          <ellipse cx="-1" cy="3" rx="4.5" ry="4" fill="#E2E8F0" />
          <ellipse cx="-1" cy="3" rx="2.8" ry="2.5" fill="#CBD5E1" />
          {/* Telephoto DSLR Camera Swiveling */}
          <rect x="2.5" y="1" width="5.5" height="3" rx="1" fill="#18181B" />
          <rect x="7" y="1.5" width="4.5" height="2" rx="0.5" fill="#3F3F46" />
        </g>

        {/* ROW 2 (Tiered Safari Bench): Child 1 (Binoculars) & Child 2 (Field Journal) */}
        <rect x="13" y="58" width="30" height="7" rx="2" fill="#581C87" fillOpacity="0.2" />

        {/* Child 1 (Left: peering eagerly through binoculars, aiming toward sightings) */}
        <g
          transform={`translate(20, 60) rotate(${passengerAimAngle * 0.8})`}
          className="transition-transform duration-500 ease-out origin-center"
        >
          <ellipse cx="0" cy="2" rx="3.8" ry="2.8" fill="#DC2626" />
          <circle cx="0" cy="2" r="3" fill="#FBBF24" />
          {/* Binoculars pointing toward sighting */}
          <rect x="-2.2" y="-2" width="2" height="2.5" rx="0.5" fill="#1E293B" />
          <rect x="0.2" y="-2" width="2" height="2.5" rx="0.5" fill="#1E293B" />
        </g>

        {/* Child 2 (Right: holding open field journal) */}
        <g transform="translate(36, 60)">
          <ellipse cx="0" cy="2" rx="3.8" ry="2.8" fill="#047857" />
          <circle cx="0" cy="2" r="2.8" fill="#78350F" />
          <rect x="-3" y="3.5" width="6" height="3.5" rx="0.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.5" />
        </g>

        {/* Heavy-Duty Roll Cage Frame */}
        <rect x="10" y="38" width="36" height="37" rx="3" fill="none" stroke="#0D2922" strokeWidth="1.8" />
        <line x1="10" y1="55" x2="46" y2="55" stroke="#0D2922" strokeWidth="1.4" />

        {/* Rear Expedition Equipment Rack */}
        {/* Spare Tire with Gold Rim */}
        <g transform="translate(22, 75)">
          <rect x="0" y="0" width="12" height="8" rx="2.5" fill="#1C1917" stroke="#44403C" strokeWidth="1" />
          <circle cx="6" cy="4" r="2.5" fill="#C99A4A" />
        </g>
        {/* Red Jerrycan for Extra Reserve Fuel */}
        <rect x="12" y="75" width="6" height="7" rx="1.5" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />
        {/* Canvas Equipment Bedroll */}
        <rect x="37" y="75" width="7" height="7" rx="2" fill="#A16207" stroke="#713F12" strokeWidth="0.8" />

        {/* Rear Amber Indicator and Taillights */}
        <rect x="8" y="80" width="3" height="2" rx="0.5" fill="#EF4444" />
        <rect x="45" y="80" width="3" height="2" rx="0.5" fill="#EF4444" />
      </svg>
    </div>
  );
}
