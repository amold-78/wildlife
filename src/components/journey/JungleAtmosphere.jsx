import React, { useRef, useEffect } from 'react';

/**
 * JungleAtmosphere
 * Orchestrates the progressive atmospheric lighting transitions as the traveler
 * scrolls through the safari day cycle:
 * 1. Morning Dawn Mist (0.0 - 0.25): Golden hour amber rays and morning fog
 * 2. Deep Emerald Canopy Shade (0.25 - 0.70): Dappled sunlight, rich tropical jungle greens
 * 3. Twilight & Fire-Lit Base Camp (0.70 - 1.0): Deep indigo twilight with floating campfire embers
 */
export default function JungleAtmosphere({ scrollProgress = 0 }) {
  const embersCanvasRef = useRef(null);

  // Floating firefly and campfire ember particle system
  useEffect(() => {
    const canvas = embersCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const particles = [];
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 1 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.4 - Math.random() * 0.8,
        alpha: 0.2 + Math.random() * 0.6,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseVal: Math.random() * Math.PI
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Embers are most prominent during dusk and night (progress > 0.6)
      const emberIntensity = Math.max(0.1, (scrollProgress - 0.4) * 1.6);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.y < 0) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        const currentAlpha = Math.min(1, Math.max(0, p.alpha * Math.sin(p.pulseVal) * emberIntensity));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Golden amber embers in evening, soft chartreuse fireflies in canopy
        if (scrollProgress > 0.65) {
          ctx.fillStyle = `rgba(245, 158, 11, ${currentAlpha})`;
        } else {
          ctx.fillStyle = `rgba(163, 230, 53, ${currentAlpha * 0.7})`;
        }
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [scrollProgress]);

  // Lighting overlay opacities based on scroll progress
  // 1. Dawn Mist (0 to 0.25)
  const dawnOpacity = Math.max(0, 1 - scrollProgress * 3.5);

  // 2. Canopy Emerald Shade (0.2 to 0.7)
  const canopyOpacity = Math.sin(Math.PI * Math.max(0, Math.min(1, (scrollProgress - 0.15) / 0.6)));

  // 3. Fire-Lit Night Camp (0.65 to 1.0)
  const nightOpacity = Math.max(0, (scrollProgress - 0.65) / 0.35);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 transition-colors duration-700">
      
      {/* Plane 1: Morning Golden Hour Mist Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#FDE68A]/25 via-[#FEF3C7]/10 to-transparent transition-opacity duration-700"
        style={{ opacity: dawnOpacity }}
      />

      {/* Plane 2: Deep Emerald Canopy Sun-Dapple Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#06241C]/35 to-transparent transition-opacity duration-700"
        style={{ opacity: canopyOpacity * 0.7 }}
      />

      {/* Plane 3: Dusk & Fire-Lit Camp Hearth Glow */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: nightOpacity,
          background: 'radial-gradient(ellipse at bottom, rgba(180, 83, 9, 0.35) 0%, rgba(13, 41, 34, 0.6) 45%, rgba(4, 15, 12, 0.85) 100%)'
        }}
      />

      {/* Ambient Firefly & Campfire Embers Canvas */}
      <canvas
        ref={embersCanvasRef}
        className="absolute inset-0 pointer-events-none opacity-80"
      />
    </div>
  );
}
