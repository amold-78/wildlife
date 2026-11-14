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

interface ProceduralTigerCanvasProps {
  side: 'left' | 'right';
  registerController?: (controller: WildlifeCanvasController | null) => void;
  className?: string;
}

const PALETTE = {
  furDeep: '#a63a04',
  furMain: '#d85910',
  furMid: '#eb741e',
  furGold: '#f79338',
  furHighlight: '#fcae56',
  furFarTop: '#8c3104',
  furFarMid: '#a8410b',
  whiteCream: '#fbf9f4',
  whiteMid: '#eee7da',
  whiteShadow: '#d8cfbd',
  stripe: '#181210',
  stripeOrganic: 'rgba(24, 18, 16, 0.94)',
  nose: '#d96e68',
  noseDark: '#993a35',
  eyeAmber: '#f5a623',
  eyeGlow: '#ffd066',
  eyeRim: '#181210',
  mouthDark: '#4a0e14',
  tongue: '#e66576',
  fang: '#fffef8',
};

/**
 * Royal Bengal Tiger — Procedural 2D Biomechanical Wildlife Canvas
 * - True feline skeletal kinematics with 2-bone analytical IK
 * - Organic Bezier spline muscular silhouette (no sharp polygons or blocky bibs)
 * - Walk vs Standing idle: stops walking when scrolling stops, continuous alive movement while standing
 * - Full Roar display when near the vehicle at checkpoint stops
 */
export default function ProceduralTigerCanvas({
  side,
  registerController,
  className = 'w-56 h-36 sm:w-72 sm:h-44',
}: ProceduralTigerCanvasProps) {
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

    const tiger = {
      x: 0,
      groundY: 0,
      scale: 0.68,
      direction: initialDir,
      visualScaleX: initialDir,
      turnHeadLead: 0,
      gaitPhase: 0,
      elapsed: Math.random() * 5,

      // Autonomous state machine
      state: 'prowl' as 'prowl' | 'idle' | 'stalk' | 'roar' | 'turn',
      stateTimer: 0,
      stateDuration: 4.2,
      targetDirection: initialDir,
      turnSwitched: false,

      // Continuous pose parameters
      walkBlend: 0,
      targetWalk: 0,
      crouchBlend: 0,
      targetCrouch: 0,
      roarBlend: 0,
      targetRoar: 0,
      headPitch: 0,
      targetHeadPitch: 0,
      earPin: 0,
      targetEarPin: 0,

      // Micro-animations
      blinkTimer: 0,
      nextBlink: 2.8,
      blinkAmount: 0,
      earTwitchTimer: 0,
      earTwitch: 0,

      // Roar air-vibration shockwaves
      roarWaves: [] as Array<{ x: number; y: number; dir: number; age: number; maxAge: number }>,
      roarWaveCooldown: 0,
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

      tiger.scale = Math.max(0.48, Math.min(0.82, (viewW / 320) * 0.68));
      tiger.groundY = viewH * 0.82;
      tiger.x = viewW * 0.5;
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

    function beginTurn(newDir: number) {
      if (tiger.state === 'turn') return;
      tiger.state = 'turn';
      tiger.targetDirection = newDir;
      tiger.stateTimer = 0;
      tiger.stateDuration = 0.85;
      tiger.turnSwitched = false;
      tiger.targetWalk = 0.15;
      tiger.targetCrouch = 0.15;
      tiger.targetRoar = 0;
      tiger.targetEarPin = 0.15;
    }

    function updateTiger(dt: number) {
      tiger.elapsed += dt;
      tiger.stateTimer += dt;

      const prox = proximityRef.current;
      const isScrolling = Math.abs(prox.velocity) > 0.04;
      const isNearJeep = prox.proximityFactor > 0.30;
      const isAtStop = prox.isAtStop || (isNearJeep && !isScrolling);

      // Natural smooth blinking
      tiger.blinkTimer += dt;
      if (tiger.blinkTimer >= tiger.nextBlink) {
        const blinkProgress = (tiger.blinkTimer - tiger.nextBlink) / 0.16;
        if (blinkProgress <= 1) {
          tiger.blinkAmount = Math.sin(Math.PI * blinkProgress);
        } else {
          tiger.blinkAmount = 0;
          tiger.blinkTimer = 0;
          tiger.nextBlink = 2.4 + Math.random() * 3.2;
        }
      }

      // Ear twitch micro-motion
      tiger.earTwitchTimer += dt;
      if (tiger.earTwitchTimer > 3.2 && Math.random() < 0.025) {
        tiger.earTwitch = 1;
        tiger.earTwitchTimer = 0;
      }
      tiger.earTwitch = damp(tiger.earTwitch, 0, 10, dt);

      // Proximity-Driven State Machine
      const roadFacingDir = side === 'left' ? 1 : -1;
      if ((isAtStop || (isNearJeep && isScrolling)) && tiger.direction !== roadFacingDir && tiger.state !== 'turn') {
        beginTurn(roadFacingDir);
      }

      if (isAtStop) {
        // Car is stopped at this stop: roar and display until user scrolls next!
        tiger.targetWalk = 0.0; // LEGS STOP WALKING
        tiger.targetRoar = 1.0; // FULL ROAR
        tiger.targetCrouch = 0.38; // Poised muscular crouch
        tiger.targetHeadPitch = -0.22; // Head lifted high roaring
        tiger.targetEarPin = 0.82; // Ears pinned in predatory roar
      } else if (isNearJeep && isScrolling) {
        // Car is moving near this stop: tiger walks parallel with the car
        tiger.targetWalk = 0.95;
        tiger.targetRoar = 0.0;
        tiger.targetCrouch = 0.18;
        tiger.targetHeadPitch = 0.04;
        tiger.targetEarPin = 0.20;
      } else if (!isScrolling) {
        // Car is stopped anywhere else: STOP WALKING, continue alive standing movement
        tiger.targetWalk = 0.0;
        tiger.targetRoar = 0.0;
        tiger.targetCrouch = 0.06;
        tiger.targetHeadPitch = Math.sin(tiger.elapsed * 1.1) * 0.05;
        tiger.targetEarPin = 0.05;
      } else {
        // Normal autonomous exploration when vehicle is distant
        tiger.targetWalk = 0.85;
        tiger.targetRoar = 0.0;
        tiger.targetCrouch = 0.04;
        tiger.targetHeadPitch = Math.sin(tiger.elapsed * 0.9) * 0.03;
        tiger.targetEarPin = 0.02;
      }

      if (tiger.state === 'turn') {
        const p = clamp(tiger.stateTimer / tiger.stateDuration, 0, 1);
        const eased = quinticEase(p);
        const startDir = -tiger.targetDirection;
        if (p >= 0.5 && !tiger.turnSwitched) {
          tiger.direction = tiger.targetDirection;
          tiger.turnSwitched = true;
        }
        tiger.visualScaleX = lerp(startDir, tiger.targetDirection, eased);
        tiger.turnHeadLead = Math.sin(Math.PI * p) * tiger.targetDirection * 0.16;
        if (p >= 1.0) {
          tiger.state = 'prowl';
        }
      }

      if (tiger.state !== 'turn') {
        tiger.visualScaleX = damp(tiger.visualScaleX, tiger.direction, 8.5, dt);
        tiger.turnHeadLead = damp(tiger.turnHeadLead, 0, 8.5, dt);
      }

      // Smooth delta-time damping
      tiger.walkBlend = damp(tiger.walkBlend, tiger.targetWalk, 7.0, dt);
      tiger.crouchBlend = damp(tiger.crouchBlend, tiger.targetCrouch, 4.5, dt);
      tiger.roarBlend = damp(tiger.roarBlend, tiger.targetRoar, 5.5, dt);
      tiger.headPitch = damp(tiger.headPitch, tiger.targetHeadPitch, 4.5, dt);
      tiger.earPin = damp(tiger.earPin, tiger.targetEarPin, 6.0, dt);

      // Roar air-vibration shockwave rings
      tiger.roarWaveCooldown -= dt;
      if (tiger.roarBlend > 0.60 && tiger.roarWaveCooldown <= 0) {
        tiger.roarWaves.push({
          x: tiger.x + tiger.direction * 56 * tiger.scale,
          y: tiger.groundY - 52 * tiger.scale,
          dir: tiger.direction,
          age: 0,
          maxAge: 0.95,
        });
        tiger.roarWaveCooldown = 0.28;
      }

      for (let i = tiger.roarWaves.length - 1; i >= 0; i--) {
        tiger.roarWaves[i].age += dt;
        tiger.roarWaves[i].x += tiger.roarWaves[i].dir * 60 * tiger.scale * dt;
        if (tiger.roarWaves[i].age >= tiger.roarWaves[i].maxAge) {
          tiger.roarWaves.splice(i, 1);
        }
      }

      // Gait cycle advances ONLY when walkBlend > 0.01 (zero moonwalking when standing!)
      if (tiger.walkBlend > 0.01) {
        const cycleFreq = 1.05 * tiger.walkBlend;
        tiger.gaitPhase = (tiger.gaitPhase + cycleFreq * dt) % 1;
      }
    }

    function evaluatePawTrajectory(phase01: number, walkWeight: number, halfStride: number, liftHeight: number) {
      const p = ((phase01 % 1) + 1) % 1;
      const duty = 0.62;

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
        const arc = Math.pow(Math.sin(Math.PI * u), 1.18);
        return {
          x: lerp(-halfStride, halfStride, easedX) * walkWeight,
          lift: arc * liftHeight * walkWeight,
          isSwing: true,
          swingU: u,
        };
      }
    }

    function drawOrganicLeg({
      rootX,
      rootY,
      phase01,
      isFront,
      isFar,
      crouch,
      walkWeight,
      groundLevel,
    }: {
      rootX: number;
      rootY: number;
      phase01: number;
      isFront: boolean;
      isFar: boolean;
      crouch: number;
      walkWeight: number;
      groundLevel: number;
    }) {
      const halfStride = lerp(18, 24, crouch);
      const liftHeight = lerp(15, 10, crouch);
      const pawTraj = evaluatePawTrajectory(phase01, walkWeight, halfStride, liftHeight);

      const restOffsetX = isFront ? 4 + crouch * 8 : -5 - crouch * 6;
      const pawSoleY = groundLevel;
      const pawPadY = pawSoleY - 6 - pawTraj.lift;
      const pawX = rootX + restOffsetX + pawTraj.x;

      const swingCurve = pawTraj.isSwing ? Math.sin(Math.PI * pawTraj.swingU) * walkWeight : 0;
      const pawPitch = swingCurve * 0.35;

      ctx.save();
      if (isFront) {
        const lenUpper = 32;
        const lenLower = 31;
        const wristTargetX = pawX - Math.sin(pawPitch) * 2.5;
        const wristTargetY = pawPadY - Math.cos(pawPitch) * 2.5;
        const ik = solveTwoBoneIK(rootX, rootY, wristTargetX, wristTargetY, lenUpper, lenLower, -1);
        drawSmoothFrontLegSpline(rootX, rootY, ik.jx, ik.jy, ik.ex, ik.ey, pawPitch, isFar);
      } else {
        const lenFemur = 35;
        const lenTibia = 34;
        const lenCannon = 16;
        const hockLean = -0.16 - crouch * 0.24 - swingCurve * 0.22;
        const hockTargetX = pawX + Math.sin(hockLean) * lenCannon;
        const hockTargetY = pawPadY - Math.cos(hockLean) * lenCannon;
        const ik = solveTwoBoneIK(rootX, rootY, hockTargetX, hockTargetY, lenFemur, lenTibia, +1);
        drawSmoothHindLegSpline(rootX, rootY, ik.jx, ik.jy, ik.ex, ik.ey, pawX, pawPadY, pawPitch, isFar);
      }
      ctx.restore();
    }

    function drawSmoothFrontLegSpline(
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      wx: number,
      wy: number,
      pawPitch: number,
      isFar: boolean,
    ) {
      const a1 = Math.atan2(ey - sy, ex - sx);
      const a2 = Math.atan2(wy - ey, wx - ex);
      const n1x = Math.sin(a1), n1y = -Math.cos(a1);
      const n2x = Math.sin(a2), n2y = -Math.cos(a2);

      const rShoulder = 17;
      const rElbow = 10.5;
      const rWrist = 7.0;

      const sFront = { x: sx + n1x * rShoulder, y: sy + n1y * rShoulder };
      const sBack = { x: sx - n1x * rShoulder, y: sy - n1y * rShoulder };

      const eAvgX = n1x + n2x, eAvgY = n1y + n2y;
      const eLen = Math.hypot(eAvgX, eAvgY) || 1;
      const enx = eAvgX / eLen, eny = eAvgY / eLen;
      const eFront = { x: ex + enx * rElbow, y: ey + eny * rElbow };
      const eBack = { x: ex - enx * (rElbow + 1.0), y: ey - eny * (rElbow + 1.0) };

      const wFront = { x: wx + n2x * rWrist, y: wy + n2y * rWrist };
      const wBack = { x: wx - n2x * rWrist, y: wy - n2y * rWrist };

      const cosP = Math.cos(pawPitch), sinP = Math.sin(pawPitch);
      const toeTop = { x: wFront.x + cosP * 10 - sinP * 2.8, y: wFront.y + sinP * 10 + cosP * 2.8 };
      const toeTip = { x: wFront.x + cosP * 13 - sinP * 5.8, y: wFront.y + sinP * 13 + cosP * 5.8 };
      const soleFront = { x: wFront.x + cosP * 10 - sinP * 6.5, y: wFront.y + sinP * 10 + cosP * 6.5 };
      const soleBack = { x: wBack.x - cosP * 2 - sinP * 6.5, y: wBack.y - sinP * 2 + cosP * 6.5 };
      const heelCurve = { x: wBack.x - cosP * 2.5 - sinP * 3.0, y: wBack.y - sinP * 2.5 + cosP * 3.0 };

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

      ctx.quadraticCurveTo((sFront.x + eFront.x) * 0.5 + n1x * 2.4, (sFront.y + eFront.y) * 0.5 + n1y * 2.4, eFront.x, eFront.y);
      ctx.quadraticCurveTo((eFront.x + wFront.x) * 0.5 + n2x * 1.4, (eFront.y + wFront.y) * 0.5 + n2y * 1.4, wFront.x, wFront.y);
      ctx.quadraticCurveTo(wFront.x + cosP * 4 - sinP * 1.0, wFront.y + sinP * 4 + cosP * 1.0, toeTop.x, toeTop.y);
      ctx.bezierCurveTo(toeTip.x + cosP * 1.0, toeTip.y - sinP * 1.0, toeTip.x, toeTip.y + cosP * 0.8, soleFront.x, soleFront.y);
      ctx.lineTo(soleBack.x, soleBack.y);
      ctx.quadraticCurveTo(heelCurve.x, heelCurve.y, wBack.x, wBack.y);
      ctx.quadraticCurveTo((wBack.x + eBack.x) * 0.5 - n2x * 1.8, (wBack.y + eBack.y) * 0.5 - n2y * 1.8, eBack.x, eBack.y);
      ctx.quadraticCurveTo((eBack.x + sBack.x) * 0.5 - n1x * 3.5, (eBack.y + sBack.y) * 0.5 - n1y * 3.5, sBack.x, sBack.y);
      ctx.closePath();

      // Soft natural fur gradient — subtle white paws, NOT hard boots!
      const grad = ctx.createLinearGradient(sx, sy - 8, wx, wy + 8);
      if (isFar) {
        grad.addColorStop(0, PALETTE.furFarTop);
        grad.addColorStop(0.55, PALETTE.furFarMid);
        grad.addColorStop(0.85, PALETTE.whiteShadow);
        grad.addColorStop(1, PALETTE.whiteMid);
      } else {
        grad.addColorStop(0, PALETTE.furMain);
        grad.addColorStop(0.55, PALETTE.furDeep);
        grad.addColorStop(0.82, PALETTE.whiteMid);
        grad.addColorStop(1, PALETTE.whiteCream);
      }
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = isFar ? 'rgba(92, 34, 4, 0.28)' : 'rgba(124, 45, 18, 0.25)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Organic leg stripes
      ctx.save();
      ctx.clip();
      ctx.fillStyle = PALETTE.stripeOrganic;
      [0.28, 0.58].forEach((t) => {
        const cx = lerp(sx, ex, t);
        const cy = lerp(sy, ey, t);
        const w = rShoulder * (1.0 - t * 0.25);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a1 - Math.PI * 0.5);
        ctx.beginPath();
        ctx.moveTo(w + 2, -2.4);
        ctx.quadraticCurveTo(0, -0.6, -w * 0.35, 0.5);
        ctx.quadraticCurveTo(0, 1.8, w + 2, 2.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }

    function drawSmoothHindLegSpline(
      hx: number,
      hy: number,
      kx: number,
      ky: number,
      ax: number,
      ay: number,
      px: number,
      py: number,
      pawPitch: number,
      isFar: boolean,
    ) {
      const a1 = Math.atan2(ky - hy, kx - hx);
      const a2 = Math.atan2(ay - ky, ax - kx);
      const a3 = Math.atan2(py - ay, px - ax);

      const n1x = Math.sin(a1), n1y = -Math.cos(a1);
      const n2x = Math.sin(a2), n2y = -Math.cos(a2);
      const n3x = Math.sin(a3), n3y = -Math.cos(a3);

      const rHip = 20;
      const rKnee = 12;
      const rHock = 7.5;
      const rPaw = 7.0;

      const hFront = { x: hx + n1x * rHip, y: hy + n1y * rHip };
      const hBack = { x: hx - n1x * rHip, y: hy - n1y * rHip };

      const kAvgX = n1x + n2x, kAvgY = n1y + n2y;
      const kLen = Math.hypot(kAvgX, kAvgY) || 1;
      const knx = kAvgX / kLen, kny = kAvgY / kLen;
      const kFront = { x: kx + knx * rKnee, y: ky + kny * rKnee };
      const kBack = { x: kx - knx * rKnee, y: ky - kny * rKnee };

      const hockAvgX = n2x + n3x, hockAvgY = n2y + n3y;
      const hockLen = Math.hypot(hockAvgX, hockAvgY) || 1;
      const hockNx = hockAvgX / hockLen, hockNy = hockAvgY / hockLen;
      const hockFront = { x: ax + hockNx * rHock, y: ay + hockNy * rHock };
      const hockBack = { x: ax - hockNx * (rHock + 2.2), y: ay - hockNy * (rHock + 2.2) };

      const pFront = { x: px + n3x * rPaw, y: py + n3y * rPaw };
      const pBack = { x: px - n3x * rPaw, y: py - n3y * rPaw };

      const cosP = Math.cos(pawPitch), sinP = Math.sin(pawPitch);
      const toeTop = { x: pFront.x + cosP * 10 - sinP * 2.8, y: pFront.y + sinP * 10 + cosP * 2.8 };
      const toeTip = { x: pFront.x + cosP * 13 - sinP * 5.8, y: pFront.y + sinP * 13 + cosP * 5.8 };
      const soleFront = { x: pFront.x + cosP * 10 - sinP * 6.5, y: pFront.y + sinP * 10 + cosP * 6.5 };
      const soleBack = { x: pBack.x - cosP * 2 - sinP * 6.5, y: pBack.y - sinP * 2 + cosP * 6.5 };

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

      ctx.quadraticCurveTo((hFront.x + kFront.x) * 0.5 + n1x * 3.5, (hFront.y + kFront.y) * 0.5 + n1y * 3.5, kFront.x, kFront.y);
      ctx.quadraticCurveTo((kFront.x + hockFront.x) * 0.5 + n2x * 1.5, (hFront.y + hockFront.y) * 0.5 + n2y * 1.5, hockFront.x, hockFront.y);
      ctx.lineTo(pFront.x, pFront.y);
      ctx.quadraticCurveTo(pFront.x + cosP * 4 - sinP * 1.0, pFront.y + sinP * 4 + cosP * 1.0, toeTop.x, toeTop.y);
      ctx.bezierCurveTo(toeTip.x + cosP * 1.0, toeTip.y - sinP * 1.0, toeTip.x, toeTip.y + cosP * 0.8, soleFront.x, soleFront.y);
      ctx.lineTo(soleBack.x, soleBack.y);
      ctx.lineTo(pBack.x, pBack.y);
      ctx.quadraticCurveTo((pBack.x + hockBack.x) * 0.5 - n3x * 1.0, (pBack.y + hockBack.y) * 0.5 - n3y * 1.0, hockBack.x, hockBack.y);
      ctx.quadraticCurveTo((hockBack.x + kBack.x) * 0.5 - n2x * 2.5, (hockBack.y + kBack.y) * 0.5 - n2y * 2.5, kBack.x, kBack.y);
      ctx.quadraticCurveTo((kBack.x + hBack.x) * 0.5 - n1x * 4.0, (kBack.y + hBack.y) * 0.5 - n1y * 4.0, hBack.x, hBack.y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(hx, hy - 8, px, py + 8);
      if (isFar) {
        grad.addColorStop(0, PALETTE.furFarTop);
        grad.addColorStop(0.55, PALETTE.furFarMid);
        grad.addColorStop(0.85, PALETTE.whiteShadow);
        grad.addColorStop(1, PALETTE.whiteMid);
      } else {
        grad.addColorStop(0, PALETTE.furMain);
        grad.addColorStop(0.55, PALETTE.furDeep);
        grad.addColorStop(0.82, PALETTE.whiteMid);
        grad.addColorStop(1, PALETTE.whiteCream);
      }
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = isFar ? 'rgba(92, 34, 4, 0.28)' : 'rgba(124, 45, 18, 0.25)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Hind leg stripes
      ctx.save();
      ctx.clip();
      ctx.fillStyle = PALETTE.stripeOrganic;
      [0.26, 0.56].forEach((t) => {
        const cx = lerp(hx, kx, t);
        const cy = lerp(hy, ky, t);
        const w = rHip * (1.0 - t * 0.26);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a1 - Math.PI * 0.5);
        ctx.beginPath();
        ctx.moveTo(w + 2, -2.4);
        ctx.quadraticCurveTo(0, -0.6, -w * 0.35, 0.5);
        ctx.quadraticCurveTo(0, 1.8, w + 2, 2.8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }

    function drawFlowingTail(hipX: number, hipY: number) {
      const waveSpeed = 2.4 + tiger.walkBlend * 2.2 + tiger.roarBlend * 3.8;
      const amp = 10 + tiger.roarBlend * 8;

      const p0 = { x: hipX, y: hipY };
      const p1 = { x: hipX - 36, y: hipY + 16 + Math.sin(tiger.elapsed * waveSpeed) * 4 };
      const p2 = { x: hipX - 74, y: hipY + 6 + Math.sin(tiger.elapsed * waveSpeed - 1.15) * amp };
      const p3 = { x: hipX - 104 + Math.cos(tiger.elapsed * waveSpeed) * 5, y: hipY - 20 + Math.sin(tiger.elapsed * waveSpeed - 2.2) * (amp * 1.3) };

      const segments = 22;
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
        const width = lerp(13, 5.5, a.t);
        ctx.strokeStyle = a.t > 0.86 ? PALETTE.stripe : PALETTE.furMain;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        if (i > 3 && i < 18 && i % 3 === 0) {
          ctx.strokeStyle = PALETTE.stripe;
          ctx.lineWidth = width * 0.95;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function drawTorso(breath: number, shoulderLift: number, spineFlex: number, chestExpand: number) {
      ctx.save();
      const coatGrad = ctx.createLinearGradient(0, -42, 0, 28);
      coatGrad.addColorStop(0, PALETTE.furDeep);
      coatGrad.addColorStop(0.42, PALETTE.furMain);
      coatGrad.addColorStop(0.78, PALETTE.furGold);
      coatGrad.addColorStop(1, PALETTE.whiteCream);

      // Powerful, muscular feline contour
      ctx.beginPath();
      ctx.moveTo(-76, -13);
      ctx.bezierCurveTo(-60, -28, -34, -30 + spineFlex, -8, -26 + spineFlex * 0.5);
      ctx.bezierCurveTo(16, -24, 38, -38 - shoulderLift - chestExpand * 0.35, 68, -30 - shoulderLift * 0.7 - chestExpand * 0.5);
      ctx.bezierCurveTo(92, -18 - chestExpand * 0.4, 94, 14 + chestExpand, 60, 24 + chestExpand * 0.7);
      ctx.bezierCurveTo(20, 25 + breath * 0.6, -26, 15 + breath * 0.25, -70, 14);
      ctx.bezierCurveTo(-84, 8, -86, -5, -76, -13);
      ctx.closePath();

      ctx.fillStyle = coatGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(124, 45, 18, 0.28)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      ctx.clip();

      // Soft, feathered white underbelly (NO hard cut line!)
      const bellyGrad = ctx.createLinearGradient(0, -2, 0, 26);
      bellyGrad.addColorStop(0, 'rgba(251, 249, 244, 0)');
      bellyGrad.addColorStop(0.35, 'rgba(251, 249, 244, 0.72)');
      bellyGrad.addColorStop(1, PALETTE.whiteCream);

      ctx.fillStyle = bellyGrad;
      ctx.beginPath();
      ctx.moveTo(-74, 10);
      ctx.bezierCurveTo(-28, 4, 22, 8 + breath * 0.4, 68, 2 + chestExpand * 0.4);
      ctx.lineTo(95, -6);
      ctx.lineTo(95, 34);
      ctx.lineTo(-76, 34);
      ctx.closePath();
      ctx.fill();

      // Authentic, organic tiger stripes
      const stripes = [
        { x: -65, y: -25, w: 6.0, h: 30, rot: 0.22, fork: false },
        { x: -50, y: -29, w: 7.5, h: 38, rot: 0.14, fork: true },
        { x: -34, y: -31, w: 7.0, h: 41, rot: 0.08, fork: false },
        { x: -18, y: -31, w: 8.5, h: 43, rot: 0.02, fork: true },
        { x: -2, y: -30, w: 7.2, h: 41, rot: -0.04, fork: false },
        { x: 14, y: -32, w: 8.5, h: 43, rot: -0.08, fork: true },
        { x: 30, y: -36, w: 7.5, h: 44, rot: -0.14, fork: false },
        { x: 46, y: -35, w: 7.0, h: 38, rot: -0.20, fork: true },
        { x: 62, y: -31, w: 6.0, h: 28, rot: -0.26, fork: false },
      ];

      ctx.fillStyle = PALETTE.stripeOrganic;
      stripes.forEach((st) => {
        ctx.save();
        ctx.translate(st.x, st.y);
        ctx.rotate(st.rot);
        ctx.beginPath();
        ctx.moveTo(-st.w * 0.5, 0);
        ctx.lineTo(st.w * 0.5, 0);
        ctx.bezierCurveTo(st.w * 0.4, st.h * 0.35, st.w * 0.1, st.h * 0.7, st.w * 0.04, st.h);
        ctx.bezierCurveTo(-st.w * 0.2, st.h * 0.68, -st.w * 0.3, st.h * 0.32, -st.w * 0.5, 0);
        ctx.closePath();
        ctx.fill();

        if (st.fork) {
          ctx.beginPath();
          ctx.moveTo(st.w * 0.18, st.h * 0.22);
          ctx.lineTo(st.w * 0.88, st.h * 0.42);
          ctx.quadraticCurveTo(st.w * 0.6, st.h * 0.68, st.w * 0.3, st.h * 0.84);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });
      ctx.restore();
    }

    function drawHead(shoulderLift: number, spineFlex: number) {
      const roar = tiger.roarBlend;
      const crouch = tiger.crouchBlend;
      const gRad = tiger.gaitPhase * Math.PI * 2;

      const neckX = 76 + crouch * 6;
      const neckY = -24 + crouch * 12 - roar * 6 - shoulderLift * 0.4 + spineFlex * 0.3;
      const headAngle = tiger.headPitch + tiger.turnHeadLead + Math.sin(gRad * 2) * 0.02 * tiger.walkBlend;
      const jawOpen = roar * 0.56 + Math.sin(tiger.elapsed * 24) * 0.02 * roar;

      ctx.save();
      ctx.translate(neckX, neckY);
      ctx.rotate(headAngle);

      // Far ear (natural feline rounded ear with white ocelli spot on back)
      drawTigerEar(2, -28, -0.16 - tiger.earPin * 0.28, true);

      // Lower Jaw
      ctx.save();
      ctx.translate(4, 9);
      ctx.rotate(jawOpen);
      ctx.fillStyle = PALETTE.whiteCream;
      ctx.beginPath();
      ctx.moveTo(-10, -3);
      ctx.lineTo(28, -2);
      ctx.quadraticCurveTo(32, 7, 22, 10);
      ctx.quadraticCurveTo(5, 12, -9, 9);
      ctx.closePath();
      ctx.fill();

      if (roar > 0.04) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, roar * 1.3);
        ctx.fillStyle = PALETTE.mouthDark;
        ctx.beginPath();
        ctx.ellipse(10, -2, 16, 7.0 * roar, -0.04, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PALETTE.tongue;
        ctx.beginPath();
        ctx.ellipse(12, 1, 10, 4.0 * roar, 0, 0, Math.PI);
        ctx.fill();

        // Lower canine fangs
        ctx.fillStyle = PALETTE.fang;
        ctx.beginPath();
        ctx.moveTo(19, -2);
        ctx.quadraticCurveTo(22, -7.0 * roar, 24, -10.5 * roar);
        ctx.quadraticCurveTo(25, -6.0 * roar, 26, -2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // Cranium (Broad predatory skull)
      const craniumGrad = ctx.createLinearGradient(0, -28, 0, 12);
      craniumGrad.addColorStop(0, PALETTE.furDeep);
      craniumGrad.addColorStop(0.55, PALETTE.furMain);
      craniumGrad.addColorStop(1, PALETTE.furGold);
      ctx.fillStyle = craniumGrad;
      ctx.beginPath();
      ctx.moveTo(-22, -12);
      ctx.quadraticCurveTo(2, -30, 22, -18);
      ctx.lineTo(38, -9);
      ctx.quadraticCurveTo(42, -2, 40, 6);
      ctx.quadraticCurveTo(27, 11, 4, 11);
      ctx.quadraticCurveTo(-18, 12, -22, -12);
      ctx.closePath();
      ctx.fill();

      // Upper canine fangs during roar
      if (roar > 0.04) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, roar * 1.3);
        ctx.fillStyle = PALETTE.fang;
        ctx.beginPath();
        ctx.moveTo(27, 6);
        ctx.quadraticCurveTo(29, 13 * roar, 31, 18 * roar);
        ctx.quadraticCurveTo(33, 12 * roar, 34, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // White muzzle pad & whisker bed
      ctx.fillStyle = PALETTE.whiteCream;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.quadraticCurveTo(28, -3, 40, 2);
      ctx.quadraticCurveTo(40, 9, 26, 10);
      ctx.quadraticCurveTo(7, 11, 1, 4);
      ctx.closePath();
      ctx.fill();

      // Soft cheek ruff
      ctx.fillStyle = PALETTE.whiteCream;
      ctx.beginPath();
      ctx.moveTo(-4, 2);
      ctx.bezierCurveTo(-18, 5, -24, 12, -18, 18);
      ctx.bezierCurveTo(-14, 22, -6, 20, 0, 16);
      ctx.closePath();
      ctx.fill();

      // Forehead stripes
      ctx.fillStyle = PALETTE.stripe;
      [
        [2, -24, 9, -22, 5, -16],
        [11, -21, 19, -18, 15, -13],
        [-7, -20, 0, -20, -3, -13],
      ].forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.fill();
      });

      // Nose leather
      ctx.fillStyle = PALETTE.nose;
      ctx.beginPath();
      ctx.moveTo(34, -4);
      ctx.lineTo(41, -2);
      ctx.quadraticCurveTo(41, 2, 37, 3);
      ctx.lineTo(34, 1);
      ctx.closePath();
      ctx.fill();

      // Near Ear (authentic feline form with white ocelli spot on dark back)
      const earAngle = -0.28 - tiger.earPin * 0.32 - tiger.earTwitch * 0.25;
      drawTigerEar(-9, -23, earAngle, false);

      // White supraorbital eye brow & predatory feline eye
      ctx.fillStyle = PALETTE.whiteCream;
      ctx.beginPath();
      ctx.ellipse(15, -13, 4.8, 1.6, -0.1, 0, Math.PI * 2);
      ctx.fill();
      drawPredatoryEye(16, -9, roar, crouch);

      // Delicate curving white whiskers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.lineWidth = 0.9;
      [1, 4, 7].forEach((wy, idx) => {
        ctx.beginPath();
        ctx.moveTo(28, wy);
        ctx.quadraticCurveTo(40, wy + (idx - 1) * 2, 50, wy + (idx - 1) * 4);
        ctx.stroke();
      });
      ctx.restore();
    }

    function drawTigerEar(x: number, y: number, rotation: number, isFar: boolean) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Outer ear shell (charcoal/dark fur with rounded tip)
      ctx.fillStyle = isFar ? '#2b221e' : PALETTE.stripe;
      ctx.beginPath();
      ctx.moveTo(-8, 6);
      ctx.bezierCurveTo(-10, -4, -4, -14, 2, -14);
      ctx.bezierCurveTo(8, -14, 10, -4, 8, 6);
      ctx.closePath();
      ctx.fill();

      // White ocelli spot on back of ear (iconic Royal Bengal Tiger trait)
      ctx.fillStyle = isFar ? PALETTE.whiteShadow : PALETTE.whiteCream;
      ctx.beginPath();
      ctx.ellipse(0, -3, 3.8, 4.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft cream inner hair tuft
      ctx.fillStyle = '#f0e6d6';
      ctx.beginPath();
      ctx.ellipse(0, 2, 2.5, 3.0, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawPredatoryEye(ex: number, ey: number, roar: number, crouch: number) {
      ctx.save();
      ctx.translate(ex, ey);

      // Black eyeliner rim
      ctx.fillStyle = PALETTE.eyeRim;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.8, 2.8, -0.05, 0, Math.PI * 2);
      ctx.fill();

      if (tiger.blinkAmount <= 0.85) {
        // Glowing amber iris
        ctx.fillStyle = PALETTE.eyeAmber;
        ctx.beginPath();
        ctx.arc(0.2, 0, 2.4 * (1 - tiger.blinkAmount * 0.85), 0, Math.PI * 2);
        ctx.fill();

        // Round big cat pupil (constricts slightly when alert/roar)
        const pupilRadius = lerp(1.2, 0.9, roar + crouch * 0.4);
        ctx.fillStyle = '#0f0c0a';
        ctx.beginPath();
        ctx.arc(0.4, 0, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-0.4, -0.8, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawGroundShadow() {
      const s = tiger.scale;
      const widthScale = Math.max(0.35, Math.abs(tiger.visualScaleX));
      ctx.save();
      ctx.translate(tiger.x, tiger.groundY);

      const rx = 110 * s * widthScale;
      const ry = 11 * s;
      const grad = ctx.createRadialGradient(0, 2 * s, 6 * s, 0, 2 * s, rx);
      grad.addColorStop(0, 'rgba(22, 28, 24, 0.42)');
      grad.addColorStop(0.55, 'rgba(22, 28, 24, 0.15)');
      grad.addColorStop(1, 'rgba(22, 28, 24, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 2 * s, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawTiger() {
      const s = tiger.scale;
      const gRad = tiger.gaitPhase * Math.PI * 2;
      const crouch = tiger.crouchBlend;
      const roar = tiger.roarBlend;

      // Heavy predatory breathing while standing
      const breath = Math.sin(tiger.elapsed * 2.2) * 2.6;
      const walkHeave = Math.abs(Math.sin(gRad * 2)) * -2.2 * tiger.walkBlend;
      const shoulderLift = Math.max(0, Math.sin(gRad + Math.PI * 1.5)) * 2.8 * tiger.walkBlend;
      const spineFlex = Math.sin(gRad * 2) * 1.6 * tiger.walkBlend;
      const chestExpand = roar * 7 + Math.sin(tiger.elapsed * 2.2) * 1.8;

      const hipRootY = -62 + crouch * 12 + walkHeave + breath * 0.25;
      const shoulderRootY = -63 + crouch * 9 + walkHeave + breath * 0.3;
      const groundLocalY = 0;

      ctx.save();
      ctx.translate(tiger.x, tiger.groundY);
      ctx.scale(tiger.visualScaleX * s, s);

      // 1. Flowing Tail
      drawFlowingTail(-66, hipRootY + 2);

      // 2. Far Hind Leg
      drawOrganicLeg({
        rootX: -48,
        rootY: hipRootY + 2,
        phase01: tiger.gaitPhase + 0.50,
        isFront: false,
        isFar: true,
        crouch,
        walkWeight: tiger.walkBlend,
        groundLevel: groundLocalY,
      });

      // 3. Far Front Leg
      drawOrganicLeg({
        rootX: 42,
        rootY: shoulderRootY + 2,
        phase01: tiger.gaitPhase + 0.75,
        isFront: true,
        isFar: true,
        crouch,
        walkWeight: tiger.walkBlend,
        groundLevel: groundLocalY,
      });

      // 4. Muscular Torso & Underbelly
      ctx.save();
      ctx.translate(0, hipRootY);
      drawTorso(breath, shoulderLift, spineFlex, chestExpand);
      ctx.restore();

      // 5. Near Hind Leg
      drawOrganicLeg({
        rootX: -44,
        rootY: hipRootY + 2,
        phase01: tiger.gaitPhase,
        isFront: false,
        isFar: false,
        crouch,
        walkWeight: tiger.walkBlend,
        groundLevel: groundLocalY,
      });

      // 6. Near Front Leg
      drawOrganicLeg({
        rootX: 46,
        rootY: shoulderRootY + 2,
        phase01: tiger.gaitPhase + 0.25,
        isFront: true,
        isFar: false,
        crouch,
        walkWeight: tiger.walkBlend,
        groundLevel: groundLocalY,
      });

      // 7. Head & Roaring Jaws
      ctx.save();
      ctx.translate(0, shoulderRootY);
      drawHead(shoulderLift, spineFlex);
      ctx.restore();

      ctx.restore();
    }

    function renderRoarShockwaves() {
      if (tiger.roarWaves.length === 0) return;
      ctx.save();
      tiger.roarWaves.forEach((wave) => {
        const p = wave.age / wave.maxAge;
        const alpha = (1 - p) * 0.45;
        const radius = (18 + p * 52) * tiger.scale;
        ctx.strokeStyle = `rgba(245, 166, 35, ${alpha.toFixed(3)})`;
        ctx.lineWidth = Math.max(1, (2.8 - p * 1.8) * tiger.scale);
        ctx.beginPath();
        const startAngle = wave.dir === 1 ? -Math.PI * 0.38 : Math.PI * 0.62;
        const endAngle = wave.dir === 1 ? Math.PI * 0.38 : Math.PI * 1.38;
        ctx.arc(wave.x, wave.y, radius, startAngle, endAngle);
        ctx.stroke();
      });
      ctx.restore();
    }

    function animate(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.08);
      lastTime = timestamp;

      if (isVisible) {
        updateTiger(dt);
        ctx.clearRect(0, 0, viewW, viewH);
        drawGroundShadow();
        drawTiger();
        renderRoarShockwaves();
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
