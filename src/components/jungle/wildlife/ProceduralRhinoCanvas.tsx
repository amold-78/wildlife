import React, { useEffect, useRef } from 'react';
import {
  damp,
  lerp,
  quinticEase,
  solveTwoBoneIK,
  type WildlifeCanvasController,
  type WildlifeProximitySignal,
} from './wildlifeTypes';

interface ProceduralRhinoCanvasProps {
  side: 'left' | 'right';
  registerController?: (controller: WildlifeCanvasController | null) => void;
  className?: string;
}

const PALETTE = {
  armorDeep: '#2a2d29',
  armorMain: '#464a44',
  armorMid: '#5b6158',
  armorLight: '#72796e',
  armorHighlight: '#8a9386',
  mudDust: 'rgba(125, 105, 85, 0.32)',
  skinFold: '#1c1f1a',
  hornKeratin: '#463f35',
  hornMid: '#756b5b',
  hornTip: '#c2b39a',
  hornBase: '#26221c',
  hoofNail: '#2b2f29',
  eyeGold: '#d4a23b',
  eyeRim: '#141614',
  snortMist: 'rgba(235, 246, 242, 0.85)',
};

/**
 * Great Indian One-Horned Rhinoceros — Procedural 2D Biomechanical Wildlife Canvas
 * - Prehistoric armor-plated body with deep rivet folds, massive shoulder & rump shields
 * - Formidable curved keratin horn & prehensile grasping lip
 * - Stops walking when scrolling stops, continuous alive movement while standing
 * - Full territorial horn display, foot stamping & snort puff when near the vehicle at checkpoint stops
 */
export default function ProceduralRhinoCanvas({
  side,
  registerController,
  className = 'w-56 h-36 sm:w-72 sm:h-44',
}: ProceduralRhinoCanvasProps) {
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

    const rhino = {
      x: 0,
      groundY: 0,
      scale: 0.68,
      direction: initialDir,
      visualScaleX: initialDir,
      turnHeadLead: 0,
      gaitPhase: 0,
      elapsed: Math.random() * 5,

      // Autonomous states
      state: 'graze' as 'graze' | 'idle' | 'snort' | 'bellow' | 'turn',
      stateTimer: 0,
      stateDuration: 4.6,
      targetDirection: initialDir,
      turnSwitched: false,

      // Blends
      walkBlend: 0,
      targetWalk: 0,
      bellowBlend: 0,
      targetBellow: 0,
      headPitch: 0,
      targetHeadPitch: 0,
      hornPose: 0,
      targetHornPose: 0,

      // Micro-animations
      blinkTimer: 0,
      nextBlink: 2.9,
      blinkAmount: 0,
      earTwitchTimer: 0,
      earTwitch: 0,
      snortPuff: 0,
      snortPuffTimer: 0,
      tailFlick: 0,
    };

    let viewW = 320;
    let viewH = 220;
    let animationFrameId: number;
    let isVisible = true;
    let lastTime = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = Math.max(180, Math.round(rect.width));
      viewH = Math.max(120, Math.round(rect.height));

      canvas.width = viewW * dpr;
      canvas.height = viewH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      rhino.scale = Math.max(0.48, Math.min(0.82, (viewW / 320) * 0.68));
      rhino.groundY = viewH * 0.83;
      rhino.x = viewW * 0.5;
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

    function updateRhino(dt: number) {
      rhino.elapsed += dt;
      rhino.stateTimer += dt;

      const prox = proximityRef.current;
      const isScrolling = Math.abs(prox.velocity) > 0.04;
      const isNearJeep = prox.proximityFactor > 0.30;
      const isAtStop = prox.isAtStop || (isNearJeep && !isScrolling);

      // Natural eye blinking
      rhino.blinkTimer += dt;
      if (rhino.blinkTimer >= rhino.nextBlink) {
        const bp = (rhino.blinkTimer - rhino.nextBlink) / 0.16;
        if (bp <= 1) {
          rhino.blinkAmount = Math.sin(Math.PI * bp);
        } else {
          rhino.blinkAmount = 0;
          rhino.blinkTimer = 0;
          rhino.nextBlink = 2.6 + Math.random() * 3.2;
        }
      }

      // Ear twitch micro-motion
      rhino.earTwitchTimer += dt;
      if (rhino.earTwitchTimer > 2.8 && Math.random() < 0.03) {
        rhino.earTwitch = 1;
        rhino.earTwitchTimer = 0;
      }
      rhino.earTwitch = damp(rhino.earTwitch, 0, 10, dt);

      // Tail flick
      rhino.tailFlick = Math.sin(rhino.elapsed * 2.2) * 0.35;

      // Proximity-Driven State Machine
      if (isAtStop) {
        // Car is stopped at this stop: territorial horn display, foot stamp & snort puffs until user scrolls next!
        rhino.targetWalk = 0.0; // LEGS STOP WALKING
        rhino.targetBellow = 1.0; // FULL BELLOW / HORN DISPLAY
        rhino.targetHeadPitch = -0.16 + Math.sin(rhino.elapsed * 3.5) * 0.08;
        rhino.targetHornPose = 0.95;

        // Snort puff emitted during bellow
        rhino.snortPuffTimer += dt;
        if (rhino.snortPuffTimer > 0.42) {
          rhino.snortPuff = 1;
          rhino.snortPuffTimer = 0;
        }
      } else if (isNearJeep && isScrolling) {
        // Car is moving near this stop: rhino marches along the grassy road verge
        rhino.targetWalk = 0.90;
        rhino.targetBellow = 0.15;
        rhino.targetHeadPitch = 0.04;
        rhino.targetHornPose = 0.25;
      } else if (!isScrolling) {
        // Car is stopped anywhere else: STOP WALKING, continue alive standing idle
        rhino.targetWalk = 0.0;
        rhino.targetBellow = 0.0;
        rhino.targetHeadPitch = Math.sin(rhino.elapsed * 0.8) * 0.03;
        rhino.targetHornPose = 0.05;
      } else {
        // Autonomous exploration when car is distant
        rhino.targetWalk = 0.82;
        rhino.targetBellow = 0.0;
        rhino.targetHeadPitch = Math.sin(rhino.elapsed * 0.9) * 0.02;
        rhino.targetHornPose = 0.0;
      }

      rhino.snortPuff = damp(rhino.snortPuff, 0, 4.0, dt);
      rhino.visualScaleX = damp(rhino.visualScaleX, rhino.direction, 8.0, dt);
      rhino.turnHeadLead = damp(rhino.turnHeadLead, 0, 8.0, dt);

      // Smooth delta-time damping
      rhino.walkBlend = damp(rhino.walkBlend, rhino.targetWalk, 7.0, dt);
      rhino.bellowBlend = damp(rhino.bellowBlend, rhino.targetBellow, 5.0, dt);
      rhino.headPitch = damp(rhino.headPitch, rhino.targetHeadPitch, 4.5, dt);
      rhino.hornPose = damp(rhino.hornPose, rhino.targetHornPose, 5.0, dt);

      // Gait cycle advances ONLY when walkBlend > 0.01 (zero moonwalking when standing!)
      if (rhino.walkBlend > 0.01) {
        const cycleFreq = 0.88 * rhino.walkBlend;
        rhino.gaitPhase = (rhino.gaitPhase + cycleFreq * dt) % 1;
      }
    }

    function evaluateRhinoFootTrajectory(phase01: number, walkWeight: number, halfStride: number, liftHeight: number) {
      const p = ((phase01 % 1) + 1) % 1;
      const duty = 0.65;

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
        const arc = Math.pow(Math.sin(Math.PI * u), 1.2);
        return {
          x: lerp(-halfStride, halfStride, easedX) * walkWeight,
          lift: arc * liftHeight * walkWeight,
          isSwing: true,
          swingU: u,
        };
      }
    }

    function drawRhinoLeg({
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
      const halfStride = 18;
      const liftHeight = 11;
      const footTraj = evaluateRhinoFootTrajectory(phase01, walkWeight, halfStride, liftHeight);

      const restOffsetX = isFront ? 4 : -4;
      const padY = groundLevel - 6 - footTraj.lift;
      const footX = rootX + restOffsetX + footTraj.x;

      ctx.save();
      if (isFront) {
        const lenUpper = 32;
        const lenLower = 33;
        const ik = solveTwoBoneIK(rootX, rootY, footX, padY, lenUpper, lenLower, -1);
        drawSmoothRhinoFrontLeg(rootX, rootY, ik.jx, ik.jy, ik.ex, ik.ey, isFar);
      } else {
        const lenFemur = 34;
        const lenTibia = 33;
        const ik = solveTwoBoneIK(rootX, rootY, footX, padY, lenFemur, lenTibia, +1);
        drawSmoothRhinoHindLeg(rootX, rootY, ik.jx, ik.jy, ik.ex, ik.ey, isFar);
      }
      ctx.restore();
    }

    function drawSmoothRhinoFrontLeg(
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

      const rShoulder = 17;
      const rElbow = 12;
      const rPad = 10;

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
        sBack.x - Math.cos(a1) * 11,
        sBack.y - Math.sin(a1) * 11,
        sFront.x - Math.cos(a1) * 11,
        sFront.y - Math.sin(a1) * 11,
        sFront.x,
        sFront.y,
      );
      ctx.quadraticCurveTo((sFront.x + eFront.x) * 0.5 + n1x * 1.5, (sFront.y + eFront.y) * 0.5 + n1y * 1.5, eFront.x, eFront.y);
      ctx.quadraticCurveTo((eFront.x + wFront.x) * 0.5 + n2x * 1.0, (eFront.y + wFront.y) * 0.5 + n2y * 1.0, wFront.x, wFront.y);
      ctx.lineTo(wFront.x + 2.5, wFront.y + 5.5);
      ctx.lineTo(wBack.x - 1, wBack.y + 5.5);
      ctx.lineTo(wBack.x, wBack.y);
      ctx.quadraticCurveTo((wBack.x + eBack.x) * 0.5 - n2x * 1.5, (wBack.y + eBack.y) * 0.5 - n2y * 1.5, eBack.x, eBack.y);
      ctx.quadraticCurveTo((eBack.x + sBack.x) * 0.5 - n1x * 2.5, (eBack.y + sBack.y) * 0.5 - n1y * 2.5, sBack.x, sBack.y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(sx, sy - 8, wx, wy + 8);
      grad.addColorStop(0, isFar ? '#222521' : PALETTE.armorDeep);
      grad.addColorStop(0.55, isFar ? PALETTE.armorDeep : PALETTE.armorMain);
      grad.addColorStop(1, isFar ? PALETTE.armorMain : PALETTE.armorMid);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = PALETTE.skinFold;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Three distinct rounded hoofed nails on each foot
      ctx.fillStyle = PALETTE.hoofNail;
      for (let i = 0; i < 3; i++) {
        const nx = lerp(wFront.x + 1.0, wBack.x + 1.2, i / 2);
        const ny = wy + 4.8;
        ctx.beginPath();
        ctx.ellipse(nx, ny, 2.2, 1.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawSmoothRhinoHindLeg(
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

      const rHip = 21;
      const rKnee = 13;
      const rPad = 10;

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
        hBack.x - Math.cos(a1) * 13,
        hBack.y - Math.sin(a1) * 13,
        hFront.x - Math.cos(a1) * 13,
        hFront.y - Math.sin(a1) * 13,
        hFront.x,
        hFront.y,
      );
      ctx.quadraticCurveTo((hFront.x + kFront.x) * 0.5 + n1x * 2.0, (hFront.y + kFront.y) * 0.5 + n1y * 2.0, kFront.x, kFront.y);
      ctx.quadraticCurveTo((kFront.x + aFront.x) * 0.5 + n2x * 1.0, (kFront.y + aFront.y) * 0.5 + n2y * 1.0, aFront.x, aFront.y);
      ctx.lineTo(aFront.x + 2.5, aFront.y + 5.5);
      ctx.lineTo(aBack.x - 1, aBack.y + 5.5);
      ctx.lineTo(aBack.x, aBack.y);
      ctx.quadraticCurveTo((aBack.x + kBack.x) * 0.5 - n2x * 1.5, (aBack.y + kBack.y) * 0.5 - n2y * 1.5, kBack.x, kBack.y);
      ctx.quadraticCurveTo((kBack.x + hBack.x) * 0.5 - n1x * 3.5, (kBack.y + hBack.y) * 0.5 - n1y * 3.5, hBack.x, hBack.y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(hx, hy - 8, ax, ay + 8);
      grad.addColorStop(0, isFar ? '#222521' : PALETTE.armorDeep);
      grad.addColorStop(0.55, isFar ? PALETTE.armorDeep : PALETTE.armorMain);
      grad.addColorStop(1, isFar ? PALETTE.armorMain : PALETTE.armorMid);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = PALETTE.skinFold;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Three hoofed nails
      ctx.fillStyle = PALETTE.hoofNail;
      for (let i = 0; i < 3; i++) {
        const nx = lerp(aFront.x + 1.0, aBack.x + 1.2, i / 2);
        const ny = ay + 4.8;
        ctx.beginPath();
        ctx.ellipse(nx, ny, 2.2, 1.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawArmoredTorso(breath: number, shoulderLift: number, spineFlex: number) {
      ctx.save();
      const coatGrad = ctx.createLinearGradient(0, -48, 0, 32);
      coatGrad.addColorStop(0, PALETTE.armorDeep);
      coatGrad.addColorStop(0.48, PALETTE.armorMain);
      coatGrad.addColorStop(0.85, PALETTE.armorMid);
      coatGrad.addColorStop(1, PALETTE.armorLight);

      // Heavy armored torso silhouette with distinct shoulder hump and low barrel chest
      ctx.beginPath();
      ctx.moveTo(-70, -12);
      // Rump shield curve
      ctx.bezierCurveTo(-52, -38, -16, -42 + spineFlex, 14, -38 + spineFlex * 0.5);
      // Massive shoulder hump
      ctx.bezierCurveTo(42, -35, 58, -42 - shoulderLift * 0.5, 76, -28 - shoulderLift * 0.4);
      // Deep chest & dewlap
      ctx.bezierCurveTo(96, -14, 98, 16, 72, 26 + breath * 0.5);
      ctx.bezierCurveTo(26, 28 + breath * 0.6, -30, 20 + breath * 0.3, -72, 16);
      ctx.bezierCurveTo(-84, 8, -86, -4, -70, -12);
      ctx.closePath();

      ctx.fillStyle = coatGrad;
      ctx.fill();

      ctx.strokeStyle = PALETTE.skinFold;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Deep Armor Crevices & Tubercles (Iconic Indian rhino armor plates)
      ctx.save();
      ctx.clip();

      // Shoulder fold crevice
      ctx.strokeStyle = PALETTE.skinFold;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(38, -36);
      ctx.quadraticCurveTo(34, -4, 44, 22);
      ctx.stroke();

      // Flank / saddle fold crevice
      ctx.beginPath();
      ctx.moveTo(-12, -40);
      ctx.quadraticCurveTo(-16, -8, -10, 24);
      ctx.stroke();

      // Pelvic / rump fold crevice
      ctx.beginPath();
      ctx.moveTo(-44, -34);
      ctx.quadraticCurveTo(-50, -4, -46, 20);
      ctx.stroke();

      // Raised skin tubercles / armor rivets along plate margins (natural armor texture)
      ctx.fillStyle = PALETTE.armorHighlight;
      [
        // Shoulder plate tubercles
        [42, -26, 1.8], [40, -16, 2.0], [42, -6, 2.2], [44, 4, 2.0], [46, 14, 1.8],
        // Saddle plate tubercles
        [-8, -28, 1.8], [-12, -18, 2.0], [-10, -6, 2.2], [-8, 6, 2.0],
        // Rump plate tubercles
        [-42, -24, 1.8], [-46, -14, 2.0], [-44, -4, 2.2], [-42, 6, 2.0],
      ].forEach(([tx, ty, tr]) => {
        ctx.beginPath();
        ctx.arc(tx, ty, tr, 0, Math.PI * 2);
        ctx.fill();
        // Subtle tubercle shadow
        ctx.strokeStyle = 'rgba(28, 31, 26, 0.45)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      // Mud-dust patina on lower belly
      const mudGrad = ctx.createLinearGradient(0, 4, 0, 28);
      mudGrad.addColorStop(0, 'rgba(125, 105, 85, 0)');
      mudGrad.addColorStop(1, PALETTE.mudDust);
      ctx.fillStyle = mudGrad;
      ctx.fillRect(-75, 4, 155, 26);

      ctx.restore();
      ctx.restore();
    }

    function drawHead(shoulderLift: number, spineFlex: number) {
      const bellow = rhino.bellowBlend;
      const gRad = rhino.gaitPhase * Math.PI * 2;
      const headAngle = rhino.headPitch + rhino.turnHeadLead + Math.sin(gRad * 2) * 0.02 * rhino.walkBlend;

      const neckX = 72;
      const neckY = -22 - shoulderLift * 0.3 + spineFlex * 0.2;

      ctx.save();
      ctx.translate(neckX, neckY);
      ctx.rotate(headAngle);

      // Far tubular ear
      drawRhinoTubularEar(-6, -20, -0.15 - rhino.earTwitch * 0.2, true);

      // Head Cranium & Muzzle (low-slung, powerful wedge skull)
      const headGrad = ctx.createLinearGradient(0, -28, 0, 18);
      headGrad.addColorStop(0, PALETTE.armorDeep);
      headGrad.addColorStop(0.52, PALETTE.armorMain);
      headGrad.addColorStop(1, PALETTE.armorMid);

      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.moveTo(-10, -6);
      ctx.quadraticCurveTo(0, -26, 22, -18);
      // Snout bridge sloping to horn base
      ctx.lineTo(44, 2);
      ctx.quadraticCurveTo(48, 8, 42, 14);
      // Prehensile upper lip
      ctx.quadraticCurveTo(34, 18, 12, 16);
      ctx.quadraticCurveTo(-8, 16, -10, -6);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = PALETTE.skinFold;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Formidable Single Keratin Horn (Authentic Great Indian Rhino Horn)
      drawFormidableHorn(34, -2, bellow);

      // Near tubular ear with hair tuft
      const nearEarAngle = 0.12 + rhino.earTwitch * 0.25;
      drawRhinoTubularEar(-2, -18, nearEarAngle, false);

      // Small, dark, protected eye with eyelid folds
      ctx.fillStyle = PALETTE.eyeRim;
      ctx.beginPath();
      ctx.ellipse(16, -6, 3.6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (rhino.blinkAmount <= 0.80) {
        ctx.fillStyle = PALETTE.eyeGold;
        ctx.beginPath();
        ctx.arc(16.5, -6, 1.8 * (1 - rhino.blinkAmount * 0.8), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#101411';
        ctx.beginPath();
        ctx.arc(16.8, -6, 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(16.0, -6.6, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Snort vapor breath puff
      if (rhino.snortPuff > 0.08) {
        ctx.save();
        const p = 1 - rhino.snortPuff;
        ctx.fillStyle = `rgba(235, 246, 242, ${(rhino.snortPuff * 0.55).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(52 + p * 16, 6 - p * 4, 7 + p * 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }

    function drawFormidableHorn(baseX: number, baseY: number, bellowWeight: number) {
      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.rotate(-0.08 - bellowWeight * 0.12);

      const hornGrad = ctx.createLinearGradient(0, 0, 15, -28);
      hornGrad.addColorStop(0, PALETTE.hornBase);
      hornGrad.addColorStop(0.42, PALETTE.hornKeratin);
      hornGrad.addColorStop(0.78, PALETTE.hornMid);
      hornGrad.addColorStop(1, PALETTE.hornTip);

      // Formidable curved keratin horn
      ctx.fillStyle = hornGrad;
      ctx.beginPath();
      ctx.moveTo(-2, 2);
      ctx.quadraticCurveTo(8, -16, 14, -28);
      ctx.quadraticCurveTo(12, -14, 6, 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(38, 34, 28, 0.55)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }

    function drawRhinoTubularEar(x: number, y: number, rotation: number, isFar: boolean) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      ctx.fillStyle = isFar ? '#222521' : PALETTE.armorDeep;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-6, -6, -8, -16, -3, -22);
      ctx.bezierCurveTo(3, -16, 5, -8, 2, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = PALETTE.skinFold;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Bristly ear tip tuft
      ctx.strokeStyle = '#141614';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-3, -22);
      ctx.lineTo(-4, -26);
      ctx.moveTo(-1, -22);
      ctx.lineTo(0, -27);
      ctx.stroke();

      ctx.restore();
    }

    function drawTail(hipX: number, hipY: number) {
      ctx.save();
      ctx.translate(hipX, hipY);
      ctx.rotate(rhino.tailFlick);

      // Short flattened tail with hair fringe
      ctx.strokeStyle = PALETTE.armorDeep;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-6, 12, -4, 24);
      ctx.stroke();

      // Black hair fringe
      ctx.fillStyle = '#141614';
      ctx.beginPath();
      ctx.moveTo(-4, 22);
      ctx.lineTo(-7, 30);
      ctx.lineTo(-1, 31);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    function drawGroundShadow() {
      const s = rhino.scale;
      const widthScale = Math.max(0.38, Math.abs(rhino.visualScaleX));
      ctx.save();
      ctx.translate(rhino.x, rhino.groundY);

      const rx = 115 * s * widthScale;
      const ry = 11 * s;
      const grad = ctx.createRadialGradient(0, 2 * s, 8 * s, 0, 2 * s, rx);
      grad.addColorStop(0, 'rgba(22, 28, 26, 0.42)');
      grad.addColorStop(0.55, 'rgba(22, 28, 26, 0.15)');
      grad.addColorStop(1, 'rgba(22, 28, 26, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 2 * s, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawRhino() {
      const s = rhino.scale;
      const gRad = rhino.gaitPhase * Math.PI * 2;

      // Heavy armored breathing while standing
      const breath = Math.sin(rhino.elapsed * 2.2) * 2.2;
      const walkHeave = Math.abs(Math.sin(gRad * 2)) * -2.0 * rhino.walkBlend;
      const shoulderLift = Math.max(0, Math.sin(gRad + Math.PI * 1.5)) * 2.5 * rhino.walkBlend;
      const spineFlex = Math.sin(gRad * 2) * 1.4 * rhino.walkBlend;

      const hipRootY = -66 + walkHeave + breath * 0.25;
      const shoulderRootY = -68 + walkHeave + breath * 0.3;
      const groundLocalY = 0;

      ctx.save();
      ctx.translate(rhino.x, rhino.groundY);
      ctx.scale(rhino.visualScaleX * s, s);

      // 1. Tail
      drawTail(-66, hipRootY - 2);

      // 2. Far Hind Leg
      drawRhinoLeg({
        rootX: -46,
        rootY: hipRootY + 2,
        phase01: rhino.gaitPhase + 0.50,
        isFront: false,
        isFar: true,
        walkWeight: rhino.walkBlend,
        groundLevel: groundLocalY,
      });

      // 3. Far Front Leg
      drawRhinoLeg({
        rootX: 42,
        rootY: shoulderRootY + 2,
        phase01: rhino.gaitPhase + 0.75,
        isFront: true,
        isFar: true,
        walkWeight: rhino.walkBlend,
        groundLevel: groundLocalY,
      });

      // 4. Prehistoric Armored Torso & Plates
      ctx.save();
      ctx.translate(0, hipRootY);
      drawArmoredTorso(breath, shoulderLift, spineFlex);
      ctx.restore();

      // 5. Near Hind Leg
      drawRhinoLeg({
        rootX: -42,
        rootY: hipRootY + 2,
        phase01: rhino.gaitPhase,
        isFront: false,
        isFar: false,
        walkWeight: rhino.walkBlend,
        groundLevel: groundLocalY,
      });

      // 6. Near Front Leg
      drawRhinoLeg({
        rootX: 46,
        rootY: shoulderRootY + 2,
        phase01: rhino.gaitPhase + 0.25,
        isFront: true,
        isFar: false,
        walkWeight: rhino.walkBlend,
        groundLevel: groundLocalY,
      });

      // 7. Head, Muzzle & Keratin Horn
      ctx.save();
      ctx.translate(0, shoulderRootY);
      drawHead(shoulderLift, spineFlex);
      ctx.restore();

      ctx.restore();
    }

    function animate(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.08);
      lastTime = timestamp;

      if (isVisible) {
        updateRhino(dt);
        ctx.clearRect(0, 0, viewW, viewH);
        drawGroundShadow();
        drawRhino();
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
