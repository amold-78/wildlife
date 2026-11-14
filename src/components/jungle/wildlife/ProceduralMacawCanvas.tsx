import React, { useEffect, useRef } from 'react';
import {
  damp,
  lerp,
  type WildlifeCanvasController,
  type WildlifeProximitySignal,
} from './wildlifeTypes';

interface ProceduralMacawCanvasProps {
  side: 'left' | 'right';
  registerController?: (controller: WildlifeCanvasController | null) => void;
  className?: string;
}

const PALETTE = {
  scarletRed: '#ee3625',
  scarletGold: '#f7c346',
  scarletBlue: '#1b76d4',
  blueAzure: '#228be6',
  goldBelly: '#f5b027',
  faceWhite: '#fdf9ee',
  beakIvory: '#fbf5e2',
  beakDark: '#1c1b18',
  eyeDark: '#141716',
};

export default function ProceduralMacawCanvas({
  side,
  registerController,
  className = 'w-56 h-38 sm:w-68 sm:h-46',
}: ProceduralMacawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const proximityRef = useRef<WildlifeProximitySignal>({
    proximityFactor: 0,
    phase: 'idle',
    distancePx: 9999,
    velocity: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initialDir = side === 'left' ? 1 : -1;

    const macaws = {
      x: 0,
      y: 0,
      scale: 0.70,
      direction: initialDir,
      visualScaleX: initialDir,
      elapsed: Math.random() * 6,

      // States: 'perch' | 'glide' | 'flap'
      state: 'perch' as 'perch' | 'glide' | 'flap',
      stateTimer: 0,
      stateDuration: 4.0,

      // Blends
      flapBlend: 0,
      targetFlap: 0,
      flightY: 0,
      bankAngle: 0,

      wingPhase: 0,
      tailFlutter: 0,
      headBob: 0,
    };

    let viewW = 300;
    let viewH = 210;
    let animationFrameId: number;
    let isVisible = true;
    let lastTime = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = Math.max(160, Math.round(rect.width));
      viewH = Math.max(120, Math.round(rect.height));

      canvas.width = viewW * dpr;
      canvas.height = viewH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      macaws.scale = Math.max(0.48, Math.min(0.85, (viewW / 300) * 0.70));
      macaws.x = viewW * 0.48;
      macaws.y = viewH * 0.62;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry ? entry.isIntersecting : true;
      },
      { rootMargin: '200px' },
    );
    io.observe(canvas);

    const controller: WildlifeCanvasController = {
      onJeepUpdate: (signal) => {
        proximityRef.current = signal;
      },
    };
    registerController?.(controller);

    function updateMacaws(dt: number) {
      macaws.elapsed += dt;
      macaws.stateTimer += dt;

      const prox = proximityRef.current;
      const isJeepNear = prox.proximityFactor > 0.12;

      // Proximity triggers flight
      if (isJeepNear) {
        if (prox.proximityFactor > 0.45) {
          macaws.targetFlap = 1.0;
        } else {
          macaws.targetFlap = 0.5;
        }
      } else {
        if (macaws.stateTimer > macaws.stateDuration) {
          macaws.stateTimer = 0;
          macaws.targetFlap = Math.random() < 0.35 ? 0.7 : 0.0;
        }
      }

      macaws.flapBlend = damp(macaws.flapBlend, macaws.targetFlap, 4.0, dt);

      // Wing beat frequency (fast flap vs resting glide)
      const flapFreq = lerp(1.2, 7.5, macaws.flapBlend);
      macaws.wingPhase = (macaws.wingPhase + flapFreq * dt) % 1;

      // Flight vertical lift & banking
      const flightLift = macaws.flapBlend * 28;
      macaws.flightY = damp(macaws.flightY, flightLift, 3.5, dt);
      macaws.bankAngle = Math.sin(macaws.elapsed * 2.2) * 0.12 * macaws.flapBlend;
      macaws.headBob = Math.sin(macaws.elapsed * 3.5) * 0.08 * (1 - macaws.flapBlend);
      macaws.tailFlutter = Math.sin(macaws.elapsed * 8.5) * 0.18 * macaws.flapBlend;
    }

    function drawSingleMacaw(
      cx: number,
      cy: number,
      scaleVal: number,
      isScarlet: boolean,
      wingCycle: number,
    ) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scaleVal, scaleVal);
      ctx.rotate(macaws.bankAngle);

      // Flapping wing angle (-0.7 upstroke to +0.8 downstroke)
      const wingAngle = Math.sin(wingCycle * Math.PI * 2) * lerp(0.2, 0.75, macaws.flapBlend);

      // 1. Long streaming tail feathers
      ctx.save();
      ctx.rotate(macaws.tailFlutter);
      if (isScarlet) {
        ctx.fillStyle = PALETTE.scarletBlue;
        ctx.beginPath();
        ctx.moveTo(-10, 8);
        ctx.lineTo(-46, 38);
        ctx.lineTo(-42, 42);
        ctx.lineTo(-6, 12);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PALETTE.scarletRed;
        ctx.beginPath();
        ctx.moveTo(-8, 6);
        ctx.lineTo(-52, 32);
        ctx.lineTo(-47, 36);
        ctx.lineTo(-4, 10);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = PALETTE.blueAzure;
        ctx.beginPath();
        ctx.moveTo(-8, 6);
        ctx.lineTo(-46, 32);
        ctx.lineTo(-42, 36);
        ctx.lineTo(-4, 10);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 2. Far Wing
      ctx.save();
      ctx.translate(2, -4);
      ctx.rotate(-wingAngle * 0.9);
      ctx.fillStyle = isScarlet ? '#c42518' : '#1a6ec0';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-14, -28, 8, -44, 28, -26);
      ctx.bezierCurveTo(16, -16, 8, -8, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Body
      ctx.fillStyle = isScarlet ? PALETTE.scarletRed : PALETTE.goldBelly;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 9.5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // 4. Near Layered Wing
      ctx.save();
      ctx.translate(4, -2);
      ctx.rotate(wingAngle);

      const wingGrad = ctx.createLinearGradient(0, -20, 24, 10);
      if (isScarlet) {
        wingGrad.addColorStop(0, PALETTE.scarletRed);
        wingGrad.addColorStop(0.5, PALETTE.scarletGold);
        wingGrad.addColorStop(1, PALETTE.scarletBlue);
      } else {
        wingGrad.addColorStop(0, PALETTE.blueAzure);
        wingGrad.addColorStop(1, PALETTE.goldBelly);
      }

      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(14, -32, 38, -36, 46, -14);
      ctx.bezierCurveTo(34, -4, 18, 4, 0, 0);
      ctx.closePath();
      ctx.fill();

      // Feather shafts
      ctx.strokeStyle = '#fff8e2';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(6, -8);
      ctx.lineTo(34, -20);
      ctx.moveTo(10, -4);
      ctx.lineTo(38, -12);
      ctx.stroke();
      ctx.restore();

      // 5. Head
      ctx.save();
      ctx.translate(14, -5 + macaws.headBob * 4);
      ctx.fillStyle = isScarlet ? PALETTE.scarletRed : PALETTE.blueAzure;
      ctx.beginPath();
      ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // White facial skin patch
      ctx.fillStyle = PALETTE.faceWhite;
      ctx.beginPath();
      ctx.ellipse(2, 0, 4.2, 3.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = PALETTE.eyeDark;
      ctx.beginPath();
      ctx.arc(2.5, -0.8, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Curved beak
      ctx.fillStyle = PALETTE.beakIvory;
      ctx.beginPath();
      ctx.moveTo(5, -3);
      ctx.quadraticCurveTo(13, -3, 11, 5);
      ctx.quadraticCurveTo(8, 2, 5, 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = PALETTE.beakDark;
      ctx.beginPath();
      ctx.moveTo(5, 2);
      ctx.lineTo(9, 4.5);
      ctx.lineTo(5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    function drawMacaws() {
      const s = macaws.scale;
      const flyY = macaws.y - macaws.flightY * s;

      ctx.save();
      ctx.translate(macaws.x, flyY);
      ctx.scale(macaws.visualScaleX * s, s);

      // Lead Scarlet Macaw
      drawSingleMacaw(0, 0, 1.0, true, macaws.wingPhase);

      // Banking companion Blue-and-Gold Macaw
      drawSingleMacaw(34, -22, 0.78, false, (macaws.wingPhase + 0.22) % 1);

      ctx.restore();
    }

    function renderLoop(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      if (isVisible) {
        ctx.clearRect(0, 0, viewW, viewH);
        updateMacaws(dt);
        drawMacaws();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    }

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
      io.disconnect();
      registerController?.(null);
    };
  }, [side, registerController]);

  return (
    <canvas
      ref={canvasRef}
      className={`block pointer-events-none drop-shadow-[0_12px_18px_rgba(0,0,0,0.58)] ${className}`}
    />
  );
}
