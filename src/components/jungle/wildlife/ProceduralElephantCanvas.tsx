import React, { useEffect, useRef } from 'react';
import {
  damp,
  lerp,
  quinticEase,
  solveTwoBoneIK,
  type WildlifeCanvasController,
  type WildlifeProximitySignal,
} from './wildlifeTypes';

interface ProceduralElephantCanvasProps {
  side: 'left' | 'right';
  registerController?: (controller: WildlifeCanvasController | null) => void;
  className?: string;
}

const PALETTE = {
  skinDeep: '#282f2c',
  skinMain: '#424c48',
  skinMid: '#586460',
  skinLight: '#707d78',
  skinHighlight: '#889691',
  skinFar: '#222825',
  mottleSoft: 'rgba(214, 168, 160, 0.24)',
  mottleEdge: 'rgba(230, 186, 178, 0.38)',
  tusk: '#fffef8',
  tuskMid: '#efe4ce',
  tuskBase: '#d6c7a6',
  nail: '#ded6c4',
  eyeAmber: '#5c3e23',
  eyeRim: '#141816',
  waterRipple: 'rgba(142, 218, 214, 0.45)',
  waterDrop: 'rgba(215, 248, 248, 0.92)',
};

/**
 * Asian Tusker Elephant — Procedural 2D Biomechanical Wildlife Canvas
 * - Realistic Asian elephant anatomy (convex humpback, twin cranial domes, fan ears, ivory tusks)
 * - Articulated muscular trunk with transverse wrinkles
 * - Stops walking when scrolling stops, continuous alive movement while standing
 * - Full triumphant trumpet and water spray display when near the vehicle at checkpoint stops
 */
export default function ProceduralElephantCanvas({
  side,
  registerController,
  className = 'w-60 h-40 sm:w-76 sm:h-48',
}: ProceduralElephantCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const proximityRef = useRef<WildlifeProximitySignal>({
    proximityFactor: 0,
    phase: 'idle',
    distancePx: 9999,
    velocity: 0,
    isStopped: true,
    isAtStop: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initialDir = side === 'left' ? 1 : -1;

    const elephant = {
      x: 0,
      groundY: 0,
      scale: 0.68,
      direction: initialDir,
      visualScaleX: initialDir,
      turnHeadLead: 0,
      gaitPhase: 0,
      elapsed: Math.random() * 6,

      // Autonomous states
      state: 'wade' as 'wade' | 'idle' | 'trumpet' | 'alert' | 'turn',
      stateTimer: 0,
      stateDuration: 4.8,
      targetDirection: initialDir,
      turnSwitched: false,

      // Blends
      walkBlend: 0,
      targetWalk: 0,
      trumpetBlend: 0,
      targetTrumpet: 0,
      earFlap: 0,
      targetEarFlap: 0,
      headPitch: 0,
      targetHeadPitch: 0,

      // Micro-animations
      blinkTimer: 0,
      nextBlink: 3.2,
      blinkAmount: 0,
      earTimer: 0,
      tailSway: 0,

      // Water spray droplets
      droplets: [] as Array<{ x: number; y: number; vx: number; vy: number; age: number; maxAge: number; size: number }>,
      sprayCooldown: 0,
    };

    let viewW = 340;
    let viewH = 230;
    let animationFrameId: number;
    let isVisible = true;
    let lastTime = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = Math.max(180, Math.round(rect.width));
      viewH = Math.max(130, Math.round(rect.height));

      canvas.width = viewW * dpr;
      canvas.height = viewH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      elephant.scale = Math.max(0.48, Math.min(0.82, (viewW / 340) * 0.68));
      elephant.groundY = viewH * 0.83;
      elephant.x = viewW * 0.5;
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

    function updateElephant(dt: number) {
      elephant.elapsed += dt;
      elephant.stateTimer += dt;

      const prox = proximityRef.current;
      const isScrolling = Math.abs(prox.velocity) > 0.04;
      const isNearJeep = prox.proximityFactor > 0.30;
      const isAtStop = prox.isAtStop || (isNearJeep && !isScrolling);

      // Natural gentle blinking with wrinkled eyelids
      elephant.blinkTimer += dt;
      if (elephant.blinkTimer >= elephant.nextBlink) {
        const bp = (elephant.blinkTimer - elephant.nextBlink) / 0.18;
        if (bp <= 1) {
          elephant.blinkAmount = Math.sin(Math.PI * bp);
        } else {
          elephant.blinkAmount = 0;
          elephant.blinkTimer = 0;
          elephant.nextBlink = 3.0 + Math.random() * 3.4;
        }
      }

      // Ear flap micro-motion
      elephant.earTimer += dt;
      if (elephant.earTimer > 2.6 && Math.random() < 0.035) {
        elephant.targetEarFlap = 0.85;
        elephant.earTimer = 0;
      }
      if (elephant.earTimer > 0.45 && elephant.targetEarFlap > 0.5) {
        elephant.targetEarFlap = 0.15;
      }

      // Tail sway
      elephant.tailSway = Math.sin(elephant.elapsed * 1.8) * 0.28;

      // Proximity-Driven State Machine
      if (isAtStop) {
        // Car is stopped at this stop: trumpet proudly and spray mist until user scrolls next!
        elephant.targetWalk = 0.0; // LEGS STOP WALKING
        elephant.targetTrumpet = 1.0; // FULL TRUMPET
        elephant.targetEarFlap = 0.95; // Ears flared wide
        elephant.targetHeadPitch = -0.24; // Head lifted high
      } else if (isNearJeep && isScrolling) {
        // Car is moving near this stop: elephant strides alongside the riverbank
        elephant.targetWalk = 0.88;
        elephant.targetTrumpet = 0.15;
        elephant.targetEarFlap = 0.40;
        elephant.targetHeadPitch = -0.04;
      } else if (!isScrolling) {
        // Car is stopped anywhere else: STOP WALKING, continue alive standing idle
        elephant.targetWalk = 0.0;
        elephant.targetTrumpet = 0.0;
        elephant.targetEarFlap = 0.20;
        elephant.targetHeadPitch = Math.sin(elephant.elapsed * 0.8) * 0.03;
      } else {
        // Autonomous exploration when car is distant
        elephant.targetWalk = 0.80;
        elephant.targetTrumpet = 0.0;
        elephant.targetEarFlap = 0.22;
        elephant.targetHeadPitch = Math.sin(elephant.elapsed * 0.9) * 0.02;
      }

      elephant.visualScaleX = damp(elephant.visualScaleX, elephant.direction, 8.0, dt);
      elephant.turnHeadLead = damp(elephant.turnHeadLead, 0, 8.0, dt);

      // Smooth delta-time damping
      elephant.walkBlend = damp(elephant.walkBlend, elephant.targetWalk, 6.5, dt);
      elephant.trumpetBlend = damp(elephant.trumpetBlend, elephant.targetTrumpet, 5.0, dt);
      elephant.earFlap = damp(elephant.earFlap, elephant.targetEarFlap, 5.5, dt);
      elephant.headPitch = damp(elephant.headPitch, elephant.targetHeadPitch, 4.0, dt);

      // Glistening water spray droplets during trumpet
      elephant.sprayCooldown -= dt;
      if (elephant.trumpetBlend > 0.45 && elephant.sprayCooldown <= 0) {
        const trunkTipX = elephant.x + elephant.direction * 74 * elephant.scale;
        const trunkTipY = elephant.groundY - 96 * elephant.scale;

        for (let k = 0; k < 4; k++) {
          const angle = (elephant.direction === 1 ? -0.45 : -2.69) + (Math.random() - 0.5) * 0.85;
          const speed = 70 + Math.random() * 95;
          elephant.droplets.push({
            x: trunkTipX + (Math.random() - 0.5) * 6,
            y: trunkTipY + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * speed * elephant.scale,
            vy: Math.sin(angle) * speed * elephant.scale,
            age: 0,
            maxAge: 0.75 + Math.random() * 0.45,
            size: 1.8 + Math.random() * 2.2,
          });
        }
        elephant.sprayCooldown = 0.12;
      }

      for (let i = elephant.droplets.length - 1; i >= 0; i--) {
        const d = elephant.droplets[i];
        d.age += dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += 120 * elephant.scale * dt; // gravity
        if (d.age >= d.maxAge) {
          elephant.droplets.splice(i, 1);
        }
      }

      // Gait cycle advances ONLY when walkBlend > 0.01 (zero moonwalking when standing!)
      if (elephant.walkBlend > 0.01) {
        const cycleFreq = 0.82 * elephant.walkBlend;
        elephant.gaitPhase = (elephant.gaitPhase + cycleFreq * dt) % 1;
      }
    }

    function evaluateElephantFootTrajectory(phase01: number, walkWeight: number, halfStride: number, liftHeight: number) {
      const p = ((phase01 % 1) + 1) % 1;
      const duty = 0.68; // High duty factor for heavy pachyderm

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
        const arc = Math.pow(Math.sin(Math.PI * u), 1.25);
        return {
          x: lerp(-halfStride, halfStride, easedX) * walkWeight,
          lift: arc * liftHeight * walkWeight,
          isSwing: true,
          swingU: u,
        };
      }
    }

    function drawColumnarLeg({
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
      const halfStride = 19;
      const liftHeight = 12;
      const footTraj = evaluateElephantFootTrajectory(phase01, walkWeight, halfStride, liftHeight);

      const restOffsetX = isFront ? 4 : -4;
      const padY = groundLevel - 6 - footTraj.lift;
      const footX = rootX + restOffsetX + footTraj.x;

      ctx.save();
      if (isFront) {
        const lenUpper = 35;
        const lenLower = 36;
        const ik = solveTwoBoneIK(rootX, rootY, footX, padY, lenUpper, lenLower, -1);
        drawSmoothElephantFrontLeg(rootX, rootY, ik.jx, ik.jy, ik.ex, ik.ey, isFar);
      } else {
        const lenFemur = 37;
        const lenTibia = 36;
        const ik = solveTwoBoneIK(rootX, rootY, footX, padY, lenFemur, lenTibia, +1);
        drawSmoothElephantHindLeg(rootX, rootY, ik.jx, ik.jy, ik.ex, ik.ey, isFar);
      }
      ctx.restore();
    }

    function drawSmoothElephantFrontLeg(
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      wx: number,
      wy: number,
      isFar: boolean,
    ) {
      const a1 = Math.atan2(ey - sy, ex - sx);
      const a2 = Math.atan2(wy - ey, wx - ex);
      const n1x = Math.sin(a1), n1y = -Math.cos(a1);
      const n2x = Math.sin(a2), n2y = -Math.cos(a2);

      const rShoulder = 18;
      const rElbow = 13;
      const rPad = 11;

      const sFront = { x: sx + n1x * rShoulder, y: sy + n1y * rShoulder };
      const sBack = { x: sx - n1x * rShoulder, y: sy - n1y * rShoulder };
      const eAvgX = n1x + n2x, eAvgY = n1y + n2y;
      const eLen = Math.hypot(eAvgX, eAvgY) || 1;
      const enx = eAvgX / eLen, eny = eAvgY / eLen;
      const eFront = { x: ex + enx * rElbow, y: ey + eny * rElbow };
      const eBack = { x: ex - enx * rElbow, y: ey - eny * rElbow };
      const wFront = { x: wx + n2x * rPad, y: wy + n2y * rPad };
      const wBack = { x: wx - n2x * (rPad + 1.2), y: wy - n2y * (rPad + 1.2) };

      ctx.beginPath();
      ctx.moveTo(sBack.x, sBack.y);
      ctx.bezierCurveTo(
        sBack.x - Math.cos(a1) * 12,
        sBack.y - Math.sin(a1) * 12,
        sFront.x - Math.cos(a1) * 12,
        sFront.y - Math.sin(a1) * 12,
        sFront.x,
        sFront.y,
      );
      ctx.quadraticCurveTo((sFront.x + eFront.x) * 0.5 + n1x * 1.5, (sFront.y + eFront.y) * 0.5 + n1y * 1.5, eFront.x, eFront.y);
      ctx.quadraticCurveTo((eFront.x + wFront.x) * 0.5 + n2x * 1.0, (eFront.y + wFront.y) * 0.5 + n2y * 1.0, wFront.x, wFront.y);
      ctx.lineTo(wFront.x + 3, wFront.y + 6);
      ctx.lineTo(wBack.x - 1, wBack.y + 6);
      ctx.lineTo(wBack.x, wBack.y);
      ctx.quadraticCurveTo((wBack.x + eBack.x) * 0.5 - n2x * 1.5, (wBack.y + eBack.y) * 0.5 - n2y * 1.5, eBack.x, eBack.y);
      ctx.quadraticCurveTo((eBack.x + sBack.x) * 0.5 - n1x * 2.5, (eBack.y + sBack.y) * 0.5 - n1y * 2.5, sBack.x, sBack.y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(sx, sy - 8, wx, wy + 8);
      grad.addColorStop(0, isFar ? PALETTE.skinFar : PALETTE.skinDeep);
      grad.addColorStop(0.55, isFar ? PALETTE.skinDeep : PALETTE.skinMain);
      grad.addColorStop(1, isFar ? PALETTE.skinMain : PALETTE.skinMid);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(38, 44, 42, 0.32)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Clean, embedded ivory toenails (5 on front feet)
      ctx.fillStyle = PALETTE.nail;
      for (let i = 0; i < 5; i++) {
        const nx = lerp(wFront.x + 1.2, wBack.x + 1.8, i / 4);
        const ny = wy + 5.2;
        ctx.beginPath();
        ctx.ellipse(nx, ny, 1.8, 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawSmoothElephantHindLeg(
      hx: number,
      hy: number,
      kx: number,
      ky: number,
      ax: number,
      ay: number,
      isFar: boolean,
    ) {
      const a1 = Math.atan2(ky - hy, kx - hx);
      const a2 = Math.atan2(ay - ky, ax - kx);
      const n1x = Math.sin(a1), n1y = -Math.cos(a1);
      const n2x = Math.sin(a2), n2y = -Math.cos(a2);

      const rHip = 22;
      const rKnee = 14;
      const rPad = 11;

      const hFront = { x: hx + n1x * rHip, y: hy + n1y * rHip };
      const hBack = { x: hx - n1x * rHip, y: hy - n1y * rHip };
      const kAvgX = n1x + n2x, kAvgY = n1y + n2y;
      const kLen = Math.hypot(kAvgX, kAvgY) || 1;
      const knx = kAvgX / kLen, kny = kAvgY / kLen;
      const kFront = { x: kx + knx * rKnee, y: ky + kny * rKnee };
      const kBack = { x: kx - knx * rKnee, y: ky - kny * rKnee };
      const aFront = { x: ax + n2x * rPad, y: ay + n2y * rPad };
      const aBack = { x: ax - n2x * (rPad + 1.2), y: ay - n2y * (rPad + 1.2) };

      ctx.beginPath();
      ctx.moveTo(hBack.x, hBack.y);
      ctx.bezierCurveTo(
        hBack.x - Math.cos(a1) * 14,
        hBack.y - Math.sin(a1) * 14,
        hFront.x - Math.cos(a1) * 14,
        hFront.y - Math.sin(a1) * 14,
        hFront.x,
        hFront.y,
      );
      ctx.quadraticCurveTo((hFront.x + kFront.x) * 0.5 + n1x * 2.0, (hFront.y + kFront.y) * 0.5 + n1y * 2.0, kFront.x, kFront.y);
      ctx.quadraticCurveTo((kFront.x + aFront.x) * 0.5 + n2x * 1.0, (kFront.y + aFront.y) * 0.5 + n2y * 1.0, aFront.x, aFront.y);
      ctx.lineTo(aFront.x + 3, aFront.y + 6);
      ctx.lineTo(aBack.x - 1, aBack.y + 6);
      ctx.lineTo(aBack.x, aBack.y);
      ctx.quadraticCurveTo((aBack.x + kBack.x) * 0.5 - n2x * 1.5, (aBack.y + kBack.y) * 0.5 - n2y * 1.5, kBack.x, kBack.y);
      ctx.quadraticCurveTo((kBack.x + hBack.x) * 0.5 - n1x * 3.5, (kBack.y + hBack.y) * 0.5 - n1y * 3.5, hBack.x, hBack.y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(hx, hy - 8, ax, ay + 8);
      grad.addColorStop(0, isFar ? PALETTE.skinFar : PALETTE.skinDeep);
      grad.addColorStop(0.55, isFar ? PALETTE.skinDeep : PALETTE.skinMain);
      grad.addColorStop(1, isFar ? PALETTE.skinMain : PALETTE.skinMid);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(38, 44, 42, 0.32)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Clean ivory toenails (4 on hind feet)
      ctx.fillStyle = PALETTE.nail;
      for (let i = 0; i < 4; i++) {
        const nx = lerp(aFront.x + 1.2, aBack.x + 1.8, i / 3);
        const ny = ay + 5.2;
        ctx.beginPath();
        ctx.ellipse(nx, ny, 1.8, 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawTorso(breath: number, shoulderLift: number, spineFlex: number) {
      ctx.save();
      const coatGrad = ctx.createLinearGradient(0, -52, 0, 36);
      coatGrad.addColorStop(0, PALETTE.skinDeep);
      coatGrad.addColorStop(0.50, PALETTE.skinMain);
      coatGrad.addColorStop(1, PALETTE.skinMid);

      // Authentic Asian elephant convex "humpback" profile
      ctx.beginPath();
      ctx.moveTo(-74, -14);
      ctx.bezierCurveTo(-54, -42, -18, -48 + spineFlex, 18, -44 + spineFlex * 0.5);
      ctx.bezierCurveTo(46, -40, 64, -44 - shoulderLift * 0.5, 82, -32 - shoulderLift * 0.4);
      ctx.bezierCurveTo(104, -18, 106, 18, 76, 30 + breath * 0.5);
      ctx.bezierCurveTo(28, 32 + breath * 0.7, -34, 22 + breath * 0.3, -76, 18);
      ctx.bezierCurveTo(-90, 10, -92, -4, -74, -14);
      ctx.closePath();

      ctx.fillStyle = coatGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(38, 44, 42, 0.35)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Delicate natural skin wrinkles across flank
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(30, 36, 34, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      [
        [-44, -28, -40, 14],
        [-20, -32, -16, 18],
        [6, -30, 10, 16],
        [32, -26, 36, 14],
      ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo((x1 + x2) * 0.5 - 3, (y1 + y2) * 0.5, x2, y2);
        ctx.stroke();
      });
      ctx.restore();

      ctx.restore();
    }

    function drawTrunkAndHead(shoulderLift: number, spineFlex: number) {
      const trumpet = elephant.trumpetBlend;
      const gRad = elephant.gaitPhase * Math.PI * 2;
      const headAngle = elephant.headPitch + elephant.turnHeadLead + Math.sin(gRad * 2) * 0.02 * elephant.walkBlend;

      const neckX = 76;
      const neckY = -24 - shoulderLift * 0.3 + spineFlex * 0.2;

      ctx.save();
      ctx.translate(neckX, neckY);
      ctx.rotate(headAngle);

      // 1. Far Ear
      drawElephantFanEar(-10, -18, elephant.earFlap, true);

      // 2. Head Cranium (twin domed Asian elephant skull)
      const headGrad = ctx.createLinearGradient(0, -32, 0, 22);
      headGrad.addColorStop(0, PALETTE.skinDeep);
      headGrad.addColorStop(0.55, PALETTE.skinMain);
      headGrad.addColorStop(1, PALETTE.skinMid);

      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.moveTo(-14, -8);
      // Twin cranial domes (bitemporal lobes)
      ctx.bezierCurveTo(-4, -32, 8, -34, 16, -24);
      ctx.bezierCurveTo(22, -32, 32, -28, 34, -10);
      ctx.bezierCurveTo(36, 4, 30, 18, 14, 22);
      ctx.bezierCurveTo(-8, 22, -12, 10, -14, -8);
      ctx.closePath();
      ctx.fill();

      // Soft, subtle natural depigmentation freckling (NOT bright polka dots!)
      ctx.fillStyle = PALETTE.mottleSoft;
      [
        [14, -14, 2.4],
        [20, -10, 2.8],
        [17, -4, 2.2],
        [24, -2, 2.6],
        [20, 4, 2.0],
      ].forEach(([mx, my, mr]) => {
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Sweeping Curved Ivory Tusks
      drawCurvedIvoryTusk(16, 12, trumpet);

      // 4. Articulated Muscular Trunk
      drawElephantTrunk(28, 8, trumpet);

      // 5. Near Fan Ear (large Asian elephant flap with soft mottled rim)
      drawElephantFanEar(-6, -14, elephant.earFlap, false);

      // 6. Gentle, wise eye with wrinkled eyelids
      ctx.fillStyle = PALETTE.eyeRim;
      ctx.beginPath();
      ctx.ellipse(12, -8, 3.5, 2.4, -0.05, 0, Math.PI * 2);
      ctx.fill();

      if (elephant.blinkAmount <= 0.82) {
        ctx.fillStyle = PALETTE.eyeAmber;
        ctx.beginPath();
        ctx.arc(12.4, -8, 1.8 * (1 - elephant.blinkAmount * 0.8), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f1211';
        ctx.beginPath();
        ctx.arc(12.6, -8, 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(11.8, -8.6, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    function drawCurvedIvoryTusk(baseX: number, baseY: number, trumpetWeight: number) {
      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.rotate(-0.15 - trumpetWeight * 0.15);

      const tuskGrad = ctx.createLinearGradient(0, 0, 26, -12);
      tuskGrad.addColorStop(0, PALETTE.tuskBase);
      tuskGrad.addColorStop(0.35, PALETTE.tuskMid);
      tuskGrad.addColorStop(1, PALETTE.tusk);

      ctx.fillStyle = tuskGrad;
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.quadraticCurveTo(14, 0, 26, -12);
      ctx.quadraticCurveTo(16, 4, 0, 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(164, 146, 114, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }

    function drawElephantTrunk(baseX: number, baseY: number, trumpetWeight: number) {
      // Natural trunk pose: relaxed S-curve at rest; triumphant high curl trumpet pose when near car!
      const curl = trumpetWeight * 1.85 + Math.sin(elephant.elapsed * 1.6) * 0.12;

      const p0 = { x: baseX, y: baseY };
      const p1 = {
        x: baseX + 14 + curl * 12,
        y: baseY + 18 - curl * 14,
      };
      const p2 = {
        x: baseX + 24 + curl * 38,
        y: baseY + 36 - curl * 46,
      };
      const p3 = {
        x: baseX + 16 + curl * 54,
        y: baseY + 48 - curl * 74,
      };

      const segments = 18;
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
      // Draw muscular trunk body
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const width = lerp(13, 4.5, a.t);
        ctx.strokeStyle = PALETTE.skinMain;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // Transverse skin wrinkles along trunk
        if (i % 2 === 0 && i < segments - 2) {
          ctx.strokeStyle = 'rgba(28, 34, 32, 0.42)';
          ctx.lineWidth = 1.0;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          ctx.beginPath();
          ctx.moveTo(a.x - nx * width * 0.42, a.y - ny * width * 0.42);
          ctx.lineTo(a.x + nx * width * 0.42, a.y + ny * width * 0.42);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function drawElephantFanEar(x: number, y: number, flapWeight: number, isFar: boolean) {
      ctx.save();
      ctx.translate(x, y);
      const flapAngle = (isFar ? -0.15 : 0.12) + flapWeight * (isFar ? -0.32 : 0.38);
      ctx.rotate(flapAngle);

      const earGrad = ctx.createLinearGradient(0, -18, 0, 22);
      earGrad.addColorStop(0, isFar ? PALETTE.skinFar : PALETTE.skinDeep);
      earGrad.addColorStop(0.55, isFar ? PALETTE.skinDeep : PALETTE.skinMain);
      earGrad.addColorStop(1, isFar ? PALETTE.skinMain : PALETTE.skinMid);

      // Authentic Indian elephant fan ear contour
      ctx.fillStyle = earGrad;
      ctx.beginPath();
      ctx.moveTo(-4, -14);
      ctx.bezierCurveTo(12, -18, 22, -10, 18, 8);
      ctx.bezierCurveTo(14, 22, 2, 24, -8, 16);
      ctx.bezierCurveTo(-14, 8, -12, -6, -4, -14);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(38, 44, 42, 0.32)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Soft depigmentation along ear lobe edge
      if (!isFar) {
        ctx.fillStyle = PALETTE.mottleSoft;
        [
          [8, -6, 2.0],
          [12, 2, 2.2],
          [8, 12, 1.8],
          [2, 16, 2.1],
        ].forEach(([ex, ey, er]) => {
          ctx.beginPath();
          ctx.arc(ex, ey, er, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.restore();
    }

    function drawTail(hipX: number, hipY: number) {
      ctx.save();
      ctx.translate(hipX, hipY);
      ctx.rotate(elephant.tailSway);

      // Tail stem
      ctx.strokeStyle = PALETTE.skinMain;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-6, 22, -4, 38);
      ctx.stroke();

      // Coarse black hair tuft at tip
      ctx.fillStyle = '#141816';
      ctx.beginPath();
      ctx.moveTo(-4, 36);
      ctx.lineTo(-8, 48);
      ctx.lineTo(-2, 49);
      ctx.lineTo(1, 47);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    function drawGroundShadow() {
      const s = elephant.scale;
      const widthScale = Math.max(0.38, Math.abs(elephant.visualScaleX));
      ctx.save();
      ctx.translate(elephant.x, elephant.groundY);

      const rx = 120 * s * widthScale;
      const ry = 12 * s;
      const grad = ctx.createRadialGradient(0, 2 * s, 8 * s, 0, 2 * s, rx);
      grad.addColorStop(0, 'rgba(22, 28, 25, 0.44)');
      grad.addColorStop(0.55, 'rgba(22, 28, 25, 0.16)');
      grad.addColorStop(1, 'rgba(22, 28, 25, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 2 * s, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawElephant() {
      const s = elephant.scale;
      const gRad = elephant.gaitPhase * Math.PI * 2;

      // Heavy pachyderm breathing while standing
      const breath = Math.sin(elephant.elapsed * 1.9) * 2.5;
      const walkHeave = Math.abs(Math.sin(gRad * 2)) * -2.0 * elephant.walkBlend;
      const shoulderLift = Math.max(0, Math.sin(gRad + Math.PI * 1.5)) * 2.5 * elephant.walkBlend;
      const spineFlex = Math.sin(gRad * 2) * 1.4 * elephant.walkBlend;

      const hipRootY = -68 + walkHeave + breath * 0.25;
      const shoulderRootY = -70 + walkHeave + breath * 0.3;
      const groundLocalY = 0;

      ctx.save();
      ctx.translate(elephant.x, elephant.groundY);
      ctx.scale(elephant.visualScaleX * s, s);

      // 1. Tail with coarse tuft
      drawTail(-68, hipRootY - 4);

      // 2. Far Hind Leg
      drawColumnarLeg({
        rootX: -48,
        rootY: hipRootY + 2,
        phase01: elephant.gaitPhase + 0.50,
        isFront: false,
        isFar: true,
        walkWeight: elephant.walkBlend,
        groundLevel: groundLocalY,
      });

      // 3. Far Front Leg
      drawColumnarLeg({
        rootX: 42,
        rootY: shoulderRootY + 2,
        phase01: elephant.gaitPhase + 0.75,
        isFront: true,
        isFar: true,
        walkWeight: elephant.walkBlend,
        groundLevel: groundLocalY,
      });

      // 4. Heavy Humpbacked Torso & Flank
      ctx.save();
      ctx.translate(0, hipRootY);
      drawTorso(breath, shoulderLift, spineFlex);
      ctx.restore();

      // 5. Near Hind Leg
      drawColumnarLeg({
        rootX: -44,
        rootY: hipRootY + 2,
        phase01: elephant.gaitPhase,
        isFront: false,
        isFar: false,
        walkWeight: elephant.walkBlend,
        groundLevel: groundLocalY,
      });

      // 6. Near Front Leg
      drawColumnarLeg({
        rootX: 46,
        rootY: shoulderRootY + 2,
        phase01: elephant.gaitPhase + 0.25,
        isFront: true,
        isFar: false,
        walkWeight: elephant.walkBlend,
        groundLevel: groundLocalY,
      });

      // 7. Head, Tusks & Trumpeting Trunk
      ctx.save();
      ctx.translate(0, shoulderRootY);
      drawTrunkAndHead(shoulderLift, spineFlex);
      ctx.restore();

      ctx.restore();
    }

    function renderWaterDroplets() {
      if (elephant.droplets.length === 0) return;
      ctx.save();
      elephant.droplets.forEach((d) => {
        const p = d.age / d.maxAge;
        const alpha = (1 - p) * 0.85;
        ctx.fillStyle = `rgba(215, 248, 248, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size * (1 - p * 0.4), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function animate(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.08);
      lastTime = timestamp;

      if (isVisible) {
        updateElephant(dt);
        ctx.clearRect(0, 0, viewW, viewH);
        drawGroundShadow();
        drawElephant();
        renderWaterDroplets();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
      io.disconnect();
      registerController?.(null);
    };
  }, [side, registerController]);

  return <canvas ref={canvasRef} className={`select-none pointer-events-none ${className}`} />;
}
