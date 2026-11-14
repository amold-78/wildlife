import React, { useEffect, useRef } from 'react';
import {
  clamp,
  damp,
  lerp,
  quinticEase,
  solveTwoBoneIK,
  type WildlifeCanvasController,
  type WildlifeProximitySignal,
} from './wildlifeTypes';

interface ProceduralLangurCanvasProps {
  side: 'left' | 'right';
  registerController?: (controller: WildlifeCanvasController | null) => void;
  className?: string;
}

const PALETTE = {
  furSilver: '#ece7dc',
  furMid: '#cbc2b1',
  furDark: '#999080',
  furShadow: '#787062',
  faceBlack: '#1e1c1a',
  eyeAmber: '#f2ba52',
  browWhite: '#fdfcf9',
  handDark: '#23201d',
  vineGreen: '#2e6b48',
  vineHighlight: '#4ba373',
};

export default function ProceduralLangurCanvas({
  side,
  registerController,
  className = 'w-52 h-38 sm:w-64 sm:h-46',
}: ProceduralLangurCanvasProps) {
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

    const langur = {
      x: 0,
      groundY: 0,
      scale: 0.68,
      direction: initialDir,
      visualScaleX: initialDir,
      turnHeadLead: 0,
      gaitPhase: 0,
      elapsed: Math.random() * 6,

      // States
      state: 'perch' as 'perch' | 'walk' | 'alert' | 'look' | 'turn',
      stateTimer: 0,
      stateDuration: 4.2,
      targetDirection: initialDir,
      turnSwitched: false,

      // Blends
      walkBlend: 0,
      targetWalk: 0,
      perchBlend: 1,
      targetPerch: 1,
      alertBlend: 0,
      targetAlert: 0,
      headTilt: 0,
      targetHeadTilt: 0,

      // Micro-animations
      blinkTimer: 0,
      nextBlink: 2.4,
      blinkAmount: 0,
      tailJerk: 0,
    };

    let viewW = 280;
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

      langur.scale = Math.max(0.48, Math.min(0.82, (viewW / 280) * 0.68));
      langur.groundY = viewH * 0.82;
      langur.x = viewW * 0.5;
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

    function enterState(newState: 'perch' | 'walk' | 'alert' | 'look' | 'turn', duration: number) {
      langur.state = newState;
      langur.stateTimer = 0;
      langur.stateDuration = duration;
    }

    function beginTurn(newDir: number) {
      if (langur.state === 'turn') return;
      langur.state = 'turn';
      langur.targetDirection = newDir;
      langur.stateTimer = 0;
      langur.stateDuration = 0.78;
      langur.turnSwitched = false;
      langur.targetWalk = 0.12;
    }

    function chooseNextAutonomousState() {
      const margin = 48 * langur.scale;
      const nearRight = langur.x >= viewW - margin && langur.direction === 1;
      const nearLeft = langur.x <= margin && langur.direction === -1;

      if (nearRight || nearLeft) {
        beginTurn(nearRight ? -1 : 1);
        return;
      }

      const r = Math.random();
      if (langur.state === 'perch') {
        if (r < 0.40) {
          enterState('look', 2.8 + Math.random() * 1.5);
        } else if (r < 0.70) {
          enterState('walk', 3.2 + Math.random() * 1.8);
        } else {
          enterState('alert', 2.2 + Math.random() * 1.0);
        }
      } else if (langur.state === 'walk') {
        if (r < 0.55) {
          enterState('perch', 3.6 + Math.random() * 2.0);
        } else {
          enterState('look', 2.5 + Math.random() * 1.2);
        }
      } else if (langur.state === 'alert') {
        enterState('perch', 3.2 + Math.random() * 1.8);
      } else {
        enterState('perch', 3.4 + Math.random() * 2.0);
      }
    }

    function updateLangur(dt: number) {
      langur.elapsed += dt;
      langur.stateTimer += dt;

      const prox = proximityRef.current;

      // Blinking
      langur.blinkTimer += dt;
      if (langur.blinkTimer >= langur.nextBlink) {
        const bp = (langur.blinkTimer - langur.nextBlink) / 0.14;
        if (bp <= 1) {
          langur.blinkAmount = Math.sin(Math.PI * bp);
        } else {
          langur.blinkAmount = 0;
          langur.blinkTimer = 0;
          langur.nextBlink = 2.0 + Math.random() * 2.8;
        }
      }

      // Edge turn check
      const boundMargin = 48 * langur.scale;
      if (langur.state === 'walk') {
        if (langur.x >= viewW - boundMargin && langur.direction === 1) {
          beginTurn(-1);
        } else if (langur.x <= boundMargin && langur.direction === -1) {
          beginTurn(1);
        }
      }

      const isScrolling = Math.abs(prox.velocity) > 0.04;
      const isNearJeep = prox.proximityFactor > 0.30;
      const isAtStop = prox.isAtStop || (isNearJeep && !isScrolling);

      // Proximity reactivity
      if (isAtStop) {
        // Car stopped at stop: alert perch scanning car
        langur.targetWalk = 0.0;
        langur.targetPerch = 0.95;
        langur.targetAlert = 0.90;
        langur.targetHeadTilt = -0.15;
      } else if (isNearJeep && isScrolling) {
        langur.targetWalk = 0.85;
        langur.targetPerch = 0.35;
        langur.targetAlert = 0.50;
        langur.targetHeadTilt = 0.08;
      } else if (!isScrolling) {
        // Car stopped anywhere else: stop walking, remain perched idle
        langur.targetWalk = 0.0;
        langur.targetPerch = 0.90;
        langur.targetAlert = 0.15;
        langur.targetHeadTilt = Math.sin(langur.elapsed * 1.2) * 0.08;
      } else {
        if (langur.stateTimer >= langur.stateDuration) {
          chooseNextAutonomousState();
        }
        if (langur.state === 'walk') {
          const velBoost = clamp(Math.abs(prox.velocity) * 0.06, 0, 0.4);
          langur.targetWalk = 1.0 + velBoost;
          langur.targetPerch = 0.0;
          langur.targetAlert = 0.0;
          langur.targetHeadTilt = Math.sin(langur.elapsed * 1.8) * 0.06;
        } else if (langur.state === 'perch') {
          langur.targetWalk = 0.0;
          langur.targetPerch = 1.0;
          langur.targetAlert = 0.0;
          langur.targetHeadTilt = Math.sin(langur.elapsed * 1.2) * 0.08;
        } else if (langur.state === 'look') {
          langur.targetWalk = 0.0;
          langur.targetPerch = 0.8;
          langur.targetAlert = 0.3;
          langur.targetHeadTilt = Math.sin(langur.elapsed * 2.2) * 0.14;
        } else if (langur.state === 'alert') {
          langur.targetWalk = 0.1;
          langur.targetPerch = 0.5;
          langur.targetAlert = 1.0;
          langur.targetHeadTilt = -0.12;
        }
      }

      if (langur.state === 'turn') {
        const p = clamp(langur.stateTimer / langur.stateDuration, 0, 1);
        const eased = quinticEase(p);
        const startDir = -langur.targetDirection;
        if (p >= 0.5 && !langur.turnSwitched) {
          langur.direction = langur.targetDirection;
          langur.turnSwitched = true;
        }
        langur.visualScaleX = lerp(startDir, langur.targetDirection, eased);
        langur.turnHeadLead = Math.sin(Math.PI * p) * langur.targetDirection * 0.16;
      }

      if (langur.state !== 'turn') {
        langur.visualScaleX = damp(langur.visualScaleX, langur.direction, 9.5, dt);
        langur.turnHeadLead = damp(langur.turnHeadLead, 0, 9.5, dt);
      }

      langur.walkBlend = damp(langur.walkBlend, langur.targetWalk, 4.6, dt);
      langur.perchBlend = damp(langur.perchBlend, langur.targetPerch, 4.2, dt);
      langur.alertBlend = damp(langur.alertBlend, langur.targetAlert, 5.0, dt);
      langur.headTilt = damp(langur.headTilt, langur.targetHeadTilt, 4.8, dt);

      // Stride
      const dutyFactor = 0.60;
      const halfStride = 16 * langur.walkBlend;
      const fullCycleDist = (2 * halfStride) / dutyFactor;
      const cycleFreq = 0.95 * langur.walkBlend;
      langur.gaitPhase = (langur.gaitPhase + cycleFreq * dt) % 1;

      const bodyDisplacement = fullCycleDist * cycleFreq * dt * langur.scale;
      langur.x += langur.direction * bodyDisplacement;
    }

    function evaluateLangurLimb(phase01: number, walkWeight: number, halfStride: number, liftHeight: number) {
      const p = ((phase01 % 1) + 1) % 1;
      const duty = 0.60;

      if (p < duty) {
        const t = p / duty;
        return {
          x: lerp(halfStride, -halfStride, t) * walkWeight,
          lift: 0,
          isSwing: false,
          swingU: 0,
        };
      } else {
        const u = (p - duty) / (1 - duty);
        const easedX = quinticEase(u);
        const arc = Math.pow(Math.sin(Math.PI * u), 1.15);
        return {
          x: lerp(-halfStride, halfStride, easedX) * walkWeight,
          lift: arc * liftHeight * walkWeight,
          isSwing: true,
          swingU: u,
        };
      }
    }

    function drawLianaVine() {
      const s = langur.scale;
      ctx.save();
      ctx.strokeStyle = PALETTE.vineGreen;
      ctx.lineWidth = 3.6 * s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(10, langur.groundY - 14 * s);
      ctx.bezierCurveTo(viewW * 0.35, langur.groundY + 12 * s, viewW * 0.65, langur.groundY - 26 * s, viewW - 10, langur.groundY - 6 * s);
      ctx.stroke();

      // Leaves along vine
      ctx.fillStyle = PALETTE.vineHighlight;
      [0.2, 0.45, 0.8].forEach((t) => {
        const lx = lerp(20, viewW - 20, t);
        const ly = langur.groundY - 12 * s + Math.sin(t * Math.PI) * 10 * s;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 6 * s, 3 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawLangurLimb({
      rootX,
      rootY,
      phase01,
      isFront,
      isFar,
      walkWeight,
      groundLevel,
    }: {
      rootX: number;
      rootY: number;
      phase01: number;
      isFront: boolean;
      isFar: boolean;
      walkWeight: number;
      groundLevel: number;
    }) {
      const halfStride = 16;
      const liftHeight = 12;
      const limbTraj = evaluateLangurLimb(phase01, walkWeight, halfStride, liftHeight);

      const footX = rootX + limbTraj.x;
      const footY = groundLevel - 5 - limbTraj.lift;

      ctx.save();
      const lenUpper = 26;
      const lenLower = 26;
      const bendDir = isFront ? -1 : 1;
      const ik = solveTwoBoneIK(rootX, rootY, footX, footY, lenUpper, lenLower, bendDir);

      ctx.strokeStyle = isFar ? PALETTE.furDark : PALETTE.furSilver;
      ctx.lineWidth = 4.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.lineTo(ik.jx, ik.jy);
      ctx.lineTo(ik.ex, ik.ey);
      ctx.stroke();

      // Gripping black hand/foot
      ctx.fillStyle = PALETTE.handDark;
      ctx.beginPath();
      ctx.ellipse(ik.ex, ik.ey, 3.2, 2.0, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawLoopTail(hipX: number, hipY: number) {
      const jerk = langur.tailJerk * 14;
      const loopSway = Math.sin(langur.elapsed * 2.4) * 5;

      const p0 = { x: hipX, y: hipY };
      const p1 = { x: hipX - 28, y: hipY - 26 - jerk };
      const p2 = { x: hipX - 32 + loopSway, y: hipY - 64 - jerk };
      const p3 = { x: hipX - 6 + loopSway, y: hipY - 84 - jerk };

      const segments = 24;
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const inv = 1 - t;
        pts.push({
          x: inv * inv * inv * p0.x + 3 * inv * inv * t * p1.x + 3 * inv * t * t * p2.x + t * t * t * p3.x,
          y: inv * inv * inv * p0.y + 3 * inv * inv * t * p1.y + 3 * inv * t * t * p2.y + t * t * t * p3.y,
          t,
        });
      }

      ctx.save();
      ctx.lineCap = 'round';
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const width = lerp(5.2, 2.4, a.t);
        ctx.strokeStyle = a.t > 0.85 ? PALETTE.furSilver : PALETTE.furMid;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawTorso(breath: number, spineFlex: number) {
      ctx.save();
      const coatGrad = ctx.createLinearGradient(0, -32, 0, 18);
      coatGrad.addColorStop(0, PALETTE.furSilver);
      coatGrad.addColorStop(0.55, PALETTE.furMid);
      coatGrad.addColorStop(1, PALETTE.furDark);

      ctx.beginPath();
      ctx.moveTo(-44, -8);
      ctx.bezierCurveTo(-34, -22, -12, -24 + spineFlex, 10, -20 + spineFlex * 0.5);
      ctx.bezierCurveTo(24, -18, 38, -26, 48, -18);
      ctx.bezierCurveTo(58, -8, 54, 12, 38, 16 + breath * 0.3);
      ctx.bezierCurveTo(12, 18 + breath * 0.5, -20, 10 + breath * 0.2, -42, 8);
      ctx.bezierCurveTo(-50, 4, -50, -3, -44, -8);
      ctx.closePath();

      ctx.fillStyle = coatGrad;
      ctx.fill();
      ctx.restore();
    }

    function drawHead(spineFlex: number) {
      const gRad = langur.gaitPhase * Math.PI * 2;
      const headAngle = langur.headTilt + langur.turnHeadLead + Math.sin(gRad * 2) * 0.02 * langur.walkBlend;

      const neckX = 46;
      const neckY = -18 + spineFlex * 0.2;

      ctx.save();
      ctx.translate(neckX, neckY);
      ctx.rotate(headAngle);

      // Silver fur crest & beard
      ctx.fillStyle = PALETTE.furSilver;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Jet-black facial mask
      ctx.fillStyle = PALETTE.faceBlack;
      ctx.beginPath();
      ctx.ellipse(3, 1, 8, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // White brow ruff
      ctx.strokeStyle = PALETTE.browWhite;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(3, -3, 6.5, Math.PI, 0);
      ctx.stroke();

      // Amber eyes
      ctx.fillStyle = PALETTE.eyeAmber;
      ctx.beginPath();
      ctx.arc(3, -1, 1.8 * (1 - langur.blinkAmount * 0.75), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(3.4, -1, 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawGroundShadow() {
      const s = langur.scale;
      const widthScale = Math.max(0.32, Math.abs(langur.visualScaleX));
      ctx.save();
      ctx.translate(langur.x, langur.groundY);
      const rx = 80 * s * widthScale;
      const ry = 8 * s;
      const grad = ctx.createRadialGradient(0, 2 * s, 6 * s, 0, 2 * s, rx);
      grad.addColorStop(0, 'rgba(20, 26, 22, 0.35)');
      grad.addColorStop(0.55, 'rgba(20, 26, 22, 0.12)');
      grad.addColorStop(1, 'rgba(20, 26, 22, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 2 * s, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawLangur() {
      const s = langur.scale;
      const gRad = langur.gaitPhase * Math.PI * 2;
      const breath = Math.sin(langur.elapsed * 2.5) * 1.8;
      const walkHeave = Math.abs(Math.sin(gRad * 2)) * -2.0 * langur.walkBlend;
      const spineFlex = Math.sin(gRad * 2) * 1.4 * langur.walkBlend;

      const hipRootY = -48 + walkHeave + breath * 0.2;
      const groundLocalY = 0;

      ctx.save();
      ctx.translate(langur.x, langur.groundY);
      ctx.scale(langur.visualScaleX * s, s);

      drawLoopTail(-40, hipRootY - 6);

      drawLangurLimb({
        rootX: -34,
        rootY: hipRootY + 2,
        phase01: langur.gaitPhase + 0.50,
        isFront: false,
        isFar: true,
        walkWeight: langur.walkBlend,
        groundLevel: groundLocalY,
      });

      drawLangurLimb({
        rootX: 30,
        rootY: hipRootY + 2,
        phase01: langur.gaitPhase + 0.75,
        isFront: true,
        isFar: true,
        walkWeight: langur.walkBlend,
        groundLevel: groundLocalY,
      });

      ctx.save();
      ctx.translate(0, hipRootY);
      drawTorso(breath, spineFlex);
      ctx.restore();

      drawLangurLimb({
        rootX: -30,
        rootY: hipRootY + 3,
        phase01: langur.gaitPhase,
        isFront: false,
        isFar: false,
        walkWeight: langur.walkBlend,
        groundLevel: groundLocalY,
      });

      drawLangurLimb({
        rootX: 34,
        rootY: hipRootY + 3,
        phase01: langur.gaitPhase + 0.25,
        isFront: true,
        isFar: false,
        walkWeight: langur.walkBlend,
        groundLevel: groundLocalY,
      });

      ctx.save();
      ctx.translate(0, hipRootY);
      drawHead(spineFlex);
      ctx.restore();

      ctx.restore();
    }

    function renderLoop(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      if (isVisible) {
        ctx.clearRect(0, 0, viewW, viewH);
        updateLangur(dt);
        drawLianaVine();
        drawGroundShadow();
        drawLangur();
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
      className={`block pointer-events-none drop-shadow-[0_10px_16px_rgba(0,0,0,0.55)] ${className}`}
    />
  );
}

