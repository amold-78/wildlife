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

interface ProceduralLeopardCanvasProps {
  side: 'left' | 'right';
  registerController?: (controller: WildlifeCanvasController | null) => void;
  className?: string;
}

const PALETTE = {
  furMain: '#e6a43b',
  furGold: '#f5be58',
  furDeep: '#b8751e',
  furFar: '#965d14',
  whiteCream: '#fcfaf4',
  whiteShadow: '#e2dcce',
  rosetteRim: '#1a130c',
  rosetteCore: '#8f4f10',
  eyeJade: '#9fe870',
  eyeRim: '#140f09',
  noseRose: '#d46e61',
};

export default function ProceduralLeopardCanvas({
  side,
  registerController,
  className = 'w-56 h-36 sm:w-70 sm:h-44',
}: ProceduralLeopardCanvasProps) {
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

    const leopard = {
      x: 0,
      groundY: 0,
      scale: 0.68,
      direction: initialDir,
      visualScaleX: initialDir,
      turnHeadLead: 0,
      gaitPhase: 0,
      elapsed: Math.random() * 6,

      // Autonomous states
      state: 'prowl' as 'prowl' | 'stalk' | 'idle' | 'alert' | 'turn',
      stateTimer: 0,
      stateDuration: 4.4,
      targetDirection: initialDir,
      turnSwitched: false,

      // Continuous pose parameters
      walkBlend: 1,
      targetWalk: 1,
      crouchBlend: 0,
      targetCrouch: 0,
      headPitch: 0,
      targetHeadPitch: 0,
      earPin: 0,
      targetEarPin: 0,

      // Micro-animations
      blinkTimer: 0,
      nextBlink: 2.6,
      blinkAmount: 0,
      tailTwitch: 0,
    };

    let viewW = 310;
    let viewH = 190;
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

      leopard.scale = Math.max(0.48, Math.min(0.82, (viewW / 310) * 0.68));
      leopard.groundY = viewH * 0.82;
      leopard.x = viewW * 0.5;
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

    function enterState(newState: 'prowl' | 'stalk' | 'idle' | 'alert' | 'turn', duration: number) {
      leopard.state = newState;
      leopard.stateTimer = 0;
      leopard.stateDuration = duration;
    }

    function beginTurn(newDir: number) {
      if (leopard.state === 'turn') return;
      leopard.state = 'turn';
      leopard.targetDirection = newDir;
      leopard.stateTimer = 0;
      leopard.stateDuration = 0.82;
      leopard.turnSwitched = false;
      leopard.targetWalk = 0.12;
      leopard.targetCrouch = 0.15;
    }

    function chooseNextAutonomousState() {
      const margin = 50 * leopard.scale;
      const nearRight = leopard.x >= viewW - margin && leopard.direction === 1;
      const nearLeft = leopard.x <= margin && leopard.direction === -1;

      if (nearRight || nearLeft) {
        beginTurn(nearRight ? -1 : 1);
        return;
      }

      const r = Math.random();
      if (leopard.state === 'prowl') {
        if (r < 0.35) {
          enterState('stalk', 3.2 + Math.random() * 1.8);
        } else if (r < 0.68) {
          enterState('idle', 2.8 + Math.random() * 1.5);
        } else if (r < 0.88) {
          enterState('alert', 2.2 + Math.random() * 1.0);
        } else {
          beginTurn(-leopard.direction);
        }
      } else if (leopard.state === 'stalk') {
        enterState('idle', 2.6 + Math.random() * 1.5);
      } else if (leopard.state === 'alert') {
        enterState('prowl', 3.6 + Math.random() * 2.0);
      } else {
        enterState('prowl', 3.8 + Math.random() * 2.2);
      }
    }

    function updateLeopard(dt: number) {
      leopard.elapsed += dt;
      leopard.stateTimer += dt;

      const prox = proximityRef.current;

      // Natural blinking
      leopard.blinkTimer += dt;
      if (leopard.blinkTimer >= leopard.nextBlink) {
        const bp = (leopard.blinkTimer - leopard.nextBlink) / 0.15;
        if (bp <= 1) {
          leopard.blinkAmount = Math.sin(Math.PI * bp);
        } else {
          leopard.blinkAmount = 0;
          leopard.blinkTimer = 0;
          leopard.nextBlink = 2.4 + Math.random() * 3.0;
        }
      }

      // Edge turn check
      const boundMargin = 50 * leopard.scale;
      if (leopard.state === 'prowl' || leopard.state === 'stalk') {
        if (leopard.x >= viewW - boundMargin && leopard.direction === 1) {
          beginTurn(-1);
        } else if (leopard.x <= boundMargin && leopard.direction === -1) {
          beginTurn(1);
        }
      }

      const isScrolling = Math.abs(prox.velocity) > 0.04;
      const isNearJeep = prox.proximityFactor > 0.30;
      const isAtStop = prox.isAtStop || (isNearJeep && !isScrolling);

      // Proximity reactivity
      if (isAtStop) {
        // Car stopped at this stop: tense poised crouch watching the car intently
        leopard.targetWalk = 0.0;
        leopard.targetCrouch = 0.85;
        leopard.targetHeadPitch = 0.14;
        leopard.targetEarPin = 0.50;
      } else if (isNearJeep && isScrolling) {
        // Car moving near this stop: stalking prowl
        leopard.targetWalk = 0.88;
        leopard.targetCrouch = 0.55;
        leopard.targetHeadPitch = 0.08;
        leopard.targetEarPin = 0.30;
      } else if (!isScrolling) {
        // Car stopped anywhere else: stop walking, stand idle
        leopard.targetWalk = 0.0;
        leopard.targetCrouch = 0.12;
        leopard.targetHeadPitch = Math.sin(leopard.elapsed * 1.2) * 0.05;
        leopard.targetEarPin = 0.05;
      } else {
        if (leopard.stateTimer >= leopard.stateDuration) {
          chooseNextAutonomousState();
        }
        if (leopard.state === 'prowl') {
          const velBoost = clamp(Math.abs(prox.velocity) * 0.06, 0, 0.4);
          leopard.targetWalk = 1.0 + velBoost;
          leopard.targetCrouch = 0.0;
          leopard.targetHeadPitch = Math.sin(leopard.elapsed * 1.0) * 0.03;
          leopard.targetEarPin = 0.0;
        } else if (leopard.state === 'stalk') {
          leopard.targetWalk = 0.52;
          leopard.targetCrouch = 0.88;
          leopard.targetHeadPitch = 0.12;
          leopard.targetEarPin = 0.45;
        } else if (leopard.state === 'alert') {
          leopard.targetWalk = 0.0;
          leopard.targetCrouch = 0.25;
          leopard.targetHeadPitch = -0.08;
          leopard.targetEarPin = 0.2;
        } else if (leopard.state === 'idle') {
          leopard.targetWalk = 0.0;
          leopard.targetCrouch = 0.08;
          leopard.targetHeadPitch = Math.sin(leopard.elapsed * 1.2) * 0.05;
          leopard.targetEarPin = 0.05;
        }
      }

      if (leopard.state === 'turn') {
        const p = clamp(leopard.stateTimer / leopard.stateDuration, 0, 1);
        const eased = quinticEase(p);
        const startDir = -leopard.targetDirection;
        if (p >= 0.5 && !leopard.turnSwitched) {
          leopard.direction = leopard.targetDirection;
          leopard.turnSwitched = true;
        }
        leopard.visualScaleX = lerp(startDir, leopard.targetDirection, eased);
        leopard.turnHeadLead = Math.sin(Math.PI * p) * leopard.targetDirection * 0.16;
      }

      if (leopard.state !== 'turn') {
        leopard.visualScaleX = damp(leopard.visualScaleX, leopard.direction, 9.2, dt);
        leopard.turnHeadLead = damp(leopard.turnHeadLead, 0, 9.2, dt);
      }

      leopard.walkBlend = damp(leopard.walkBlend, leopard.targetWalk, 4.4, dt);
      leopard.crouchBlend = damp(leopard.crouchBlend, leopard.targetCrouch, 4.2, dt);
      leopard.headPitch = damp(leopard.headPitch, leopard.targetHeadPitch, 4.6, dt);
      leopard.earPin = damp(leopard.earPin, leopard.targetEarPin, 6.0, dt);

      // Zero slip stride
      const dutyFactor = 0.62;
      const halfStride = lerp(19, 24, leopard.crouchBlend) * leopard.walkBlend;
      const fullCycleDist = (2 * halfStride) / dutyFactor;
      const cycleFreq = 0.88 * leopard.walkBlend;
      leopard.gaitPhase = (leopard.gaitPhase + cycleFreq * dt) % 1;

      const bodyDisplacement = fullCycleDist * cycleFreq * dt * leopard.scale;
      leopard.x += leopard.direction * bodyDisplacement;
    }

    function evaluateLeopardPaw(phase01: number, walkWeight: number, halfStride: number, liftHeight: number) {
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

    function drawLeopardLeg({
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
      const halfStride = lerp(19, 24, crouch);
      const liftHeight = lerp(15, 10, crouch);
      const pawTraj = evaluateLeopardPaw(phase01, walkWeight, halfStride, liftHeight);

      const restOffsetX = isFront ? 5 + crouch * 8 : -5 - crouch * 6;
      const pawSoleY = groundLevel;
      const pawPadY = pawSoleY - 6.5 - pawTraj.lift;
      const pawX = rootX + restOffsetX + pawTraj.x;

      const swingCurve = pawTraj.isSwing ? Math.sin(Math.PI * pawTraj.swingU) * walkWeight : 0;
      const pawPitch = swingCurve * 0.36;

      ctx.save();
      if (isFront) {
        const lenUpper = 30;
        const lenLower = 29;
        const wristTargetX = pawX - Math.sin(pawPitch) * 2.8;
        const wristTargetY = pawPadY - Math.cos(pawPitch) * 2.8;
        const ik = solveTwoBoneIK(rootX, rootY, wristTargetX, wristTargetY, lenUpper, lenLower, -1);
        drawSmoothFrontLeg(rootX, rootY, ik.jx, ik.jy, ik.ex, ik.ey, pawPitch, isFar);
      } else {
        const lenFemur = 32;
        const lenTibia = 31;
        const lenCannon = 16;
        const hockLean = -0.15 - crouch * 0.25 - swingCurve * 0.24;
        const hockTargetX = pawX + Math.sin(hockLean) * lenCannon;
        const hockTargetY = pawPadY - Math.cos(hockLean) * lenCannon;
        const ik = solveTwoBoneIK(rootX, rootY, hockTargetX, hockTargetY, lenFemur, lenTibia, +1);
        drawSmoothHindLeg(rootX, rootY, ik.jx, ik.jy, ik.ex, ik.ey, pawX, pawPadY, pawPitch, isFar);
      }
      ctx.restore();
    }

    function drawSmoothFrontLeg(
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

      const rShoulder = 16;
      const rElbow = 9.5;
      const rWrist = 6.5;

      const sFront = { x: sx + n1x * rShoulder, y: sy + n1y * rShoulder };
      const sBack = { x: sx - n1x * rShoulder, y: sy - n1y * rShoulder };
      const eAvgX = n1x + n2x, eAvgY = n1y + n2y;
      const eLen = Math.hypot(eAvgX, eAvgY) || 1;
      const enx = eAvgX / eLen, eny = eAvgY / eLen;
      const eFront = { x: ex + enx * rElbow, y: ey + eny * rElbow };
      const eBack = { x: ex - enx * rElbow, y: ey - eny * rElbow };
      const wFront = { x: wx + n2x * rWrist, y: wy + n2y * rWrist };
      const wBack = { x: wx - n2x * rWrist, y: wy - n2y * rWrist };

      const cosP = Math.cos(pawPitch), sinP = Math.sin(pawPitch);
      const toeTop = { x: wFront.x + cosP * 10 - sinP * 2.8, y: wFront.y + sinP * 10 + cosP * 2.8 };
      const toeTip = { x: wFront.x + cosP * 12.5 - sinP * 5.5, y: wFront.y + sinP * 12.5 + cosP * 5.5 };
      const soleFront = { x: wFront.x + cosP * 10 - sinP * 6.5, y: wFront.y + sinP * 10 + cosP * 6.5 };
      const soleBack = { x: wBack.x - cosP * 1.8 - sinP * 6.5, y: wBack.y - sinP * 1.8 + cosP * 6.5 };
      const heelCurve = { x: wBack.x - cosP * 2.5 - sinP * 3.2, y: wBack.y - sinP * 2.5 + cosP * 3.2 };

      ctx.beginPath();
      ctx.moveTo(sBack.x, sBack.y);
      ctx.bezierCurveTo(sBack.x - Math.cos(a1) * 11, sBack.y - Math.sin(a1) * 11, sFront.x - Math.cos(a1) * 11, sFront.y - Math.sin(a1) * 11, sFront.x, sFront.y);
      ctx.quadraticCurveTo((sFront.x + eFront.x) * 0.5 + n1x * 2.4, (sFront.y + eFront.y) * 0.5 + n1y * 2.4, eFront.x, eFront.y);
      ctx.quadraticCurveTo((eFront.x + wFront.x) * 0.5 + n2x * 1.2, (eFront.y + wFront.y) * 0.5 + n2y * 1.2, wFront.x, wFront.y);
      ctx.quadraticCurveTo(wFront.x + cosP * 4.5 - sinP * 1.1, wFront.y + sinP * 4.5 + cosP * 1.1, toeTop.x, toeTop.y);
      ctx.bezierCurveTo(toeTip.x + cosP * 1.1, toeTip.y - sinP * 1.1, toeTip.x, toeTip.y + cosP * 0.9, soleFront.x, soleFront.y);
      ctx.lineTo(soleBack.x, soleBack.y);
      ctx.quadraticCurveTo(heelCurve.x, heelCurve.y, wBack.x, wBack.y);
      ctx.quadraticCurveTo((wBack.x + eBack.x) * 0.5 - n2x * 1.8, (wBack.y + eBack.y) * 0.5 - n2y * 1.8, eBack.x, eBack.y);
      ctx.quadraticCurveTo((eBack.x + sBack.x) * 0.5 - n1x * 3.5, (eBack.y + sBack.y) * 0.5 - n1y * 3.5, sBack.x, sBack.y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(sx, sy - 6, wx, wy + 6);
      grad.addColorStop(0, isFar ? PALETTE.furFar : PALETTE.furDeep);
      grad.addColorStop(0.55, isFar ? PALETTE.furDeep : PALETTE.furMain);
      grad.addColorStop(1, PALETTE.whiteCream);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(92, 45, 12, 0.28)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Small rosettes on leg
      ctx.save();
      ctx.clip();
      [0.32, 0.64].forEach((t) => {
        const cx = lerp(sx, ex, t);
        const cy = lerp(sy, ey, t);
        ctx.fillStyle = PALETTE.rosetteRim;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawSmoothHindLeg(
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

      const rHip = 18;
      const rKnee = 10.5;
      const rHock = 7.0;
      const rAnkle = 6.0;

      const hFront = { x: hx + n1x * rHip, y: hy + n1y * rHip };
      const hBack = { x: hx - n1x * rHip, y: hy - n1y * rHip };
      const kAvgX = n1x + n2x, kAvgY = n1y + n2y;
      const kLen = Math.hypot(kAvgX, kAvgY) || 1;
      const knx = kAvgX / kLen, kny = kAvgY / kLen;
      const kFront = { x: kx + knx * rKnee, y: ky + kny * rKnee };
      const kBack = { x: kx - knx * rKnee, y: ky - kny * rKnee };
      const hkFront = { x: ax + (n2x + n3x) * 0.5 * rHock, y: ay + (n2y + n3y) * 0.5 * rHock };
      const hkBack = { x: ax - (n2x + n3x) * 0.5 * rHock, y: ay - (n2y + n3y) * 0.5 * rHock };
      const pFront = { x: px + n3x * rAnkle, y: py + n3y * rAnkle };
      const pBack = { x: px - n3x * rAnkle, y: py - n3y * rAnkle };

      const cosP = Math.cos(pawPitch), sinP = Math.sin(pawPitch);
      const toeTop = { x: pFront.x + cosP * 9 - sinP * 2.8, y: pFront.y + sinP * 9 + cosP * 2.8 };
      const toeTip = { x: pFront.x + cosP * 11.5 - sinP * 5.5, y: pFront.y + sinP * 11.5 + cosP * 5.5 };
      const soleFront = { x: pFront.x + cosP * 9.5 - sinP * 6.5, y: pFront.y + sinP * 9.5 + cosP * 6.5 };
      const soleBack = { x: pBack.x - cosP * 1.5 - sinP * 6.5, y: pBack.y - sinP * 1.5 + cosP * 6.5 };
      const heelCurve = { x: pBack.x - cosP * 2.2 - sinP * 3.2, y: pBack.y - sinP * 2.2 + cosP * 3.2 };

      ctx.beginPath();
      ctx.moveTo(hBack.x, hBack.y);
      ctx.bezierCurveTo(hBack.x - Math.cos(a1) * 13, hBack.y - Math.sin(a1) * 13, hFront.x - Math.cos(a1) * 13, hFront.y - Math.sin(a1) * 13, hFront.x, hFront.y);
      ctx.quadraticCurveTo((hFront.x + kFront.x) * 0.5 + n1x * 2.8, (hFront.y + kFront.y) * 0.5 + n1y * 2.8, kFront.x, kFront.y);
      ctx.quadraticCurveTo((kFront.x + hkFront.x) * 0.5 + n2x * 1.0, (kFront.y + hkFront.y) * 0.5 + n2y * 1.0, hkFront.x, hkFront.y);
      ctx.quadraticCurveTo((hkFront.x + pFront.x) * 0.5, (hkFront.y + pFront.y) * 0.5, pFront.x, pFront.y);
      ctx.quadraticCurveTo(pFront.x + cosP * 3.8 - sinP * 1.1, pFront.y + sinP * 3.8 + cosP * 1.1, toeTop.x, toeTop.y);
      ctx.bezierCurveTo(toeTip.x + cosP * 1.1, toeTip.y - sinP * 1.1, toeTip.x, toeTip.y + cosP * 0.9, soleFront.x, soleFront.y);
      ctx.lineTo(soleBack.x, soleBack.y);
      ctx.quadraticCurveTo(heelCurve.x, heelCurve.y, pBack.x, pBack.y);
      ctx.quadraticCurveTo((pBack.x + hkBack.x) * 0.5 - n3x * 0.9, (pBack.y + hkBack.y) * 0.5 - n3y * 0.9, hkBack.x, hkBack.y);
      ctx.quadraticCurveTo((hkBack.x + kBack.x) * 0.5 - n2x * 3.0, (hkBack.y + kBack.y) * 0.5 - n2y * 3.0, kBack.x, kBack.y);
      ctx.quadraticCurveTo((kBack.x + hBack.x) * 0.5 - n1x * 4.5, (kBack.y + hBack.y) * 0.5 - n1y * 4.5, hBack.x, hBack.y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(hx, hy - 6, px, py + 6);
      grad.addColorStop(0, isFar ? PALETTE.furFar : PALETTE.furDeep);
      grad.addColorStop(0.55, isFar ? PALETTE.furDeep : PALETTE.furMain);
      grad.addColorStop(1, PALETTE.whiteCream);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(92, 45, 12, 0.28)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      ctx.save();
      ctx.clip();
      [0.32, 0.65].forEach((t) => {
        const cx = lerp(hx, kx, t);
        const cy = lerp(hy, ky, t);
        ctx.fillStyle = PALETTE.rosetteRim;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawLongLeopardTail(hipX: number, hipY: number) {
      const waveSpeed = 3.4 + leopard.walkBlend * 2.2;
      const amp = 14 + leopard.crouchBlend * 8;

      const p0 = { x: hipX, y: hipY };
      const p1 = { x: hipX - 42, y: hipY + 18 + Math.sin(leopard.elapsed * waveSpeed) * 4 };
      const p2 = { x: hipX - 86, y: hipY + 8 + Math.sin(leopard.elapsed * waveSpeed - 1.2) * amp };
      const p3 = { x: hipX - 124 + Math.cos(leopard.elapsed * waveSpeed) * 6, y: hipY - 24 + Math.sin(leopard.elapsed * waveSpeed - 2.2) * (amp * 1.35) };

      const segments = 26;
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
        const width = lerp(12, 5, a.t);
        ctx.strokeStyle = a.t > 0.88 ? '#1a130c' : PALETTE.furMain;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // Spots on tail
        if (i > 3 && i < 22 && i % 3 === 0) {
          ctx.strokeStyle = PALETTE.rosetteRim;
          ctx.lineWidth = width * 0.95;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function drawTorso(breath: number, shoulderLift: number, spineFlex: number) {
      ctx.save();
      const coatGrad = ctx.createLinearGradient(0, -38, 0, 24);
      coatGrad.addColorStop(0, PALETTE.furDeep);
      coatGrad.addColorStop(0.45, PALETTE.furMain);
      coatGrad.addColorStop(0.80, PALETTE.furGold);
      coatGrad.addColorStop(1, PALETTE.whiteCream);

      ctx.beginPath();
      ctx.moveTo(-70, -11);
      ctx.bezierCurveTo(-55, -24, -32, -26 + spineFlex, -8, -23 + spineFlex * 0.5);
      ctx.bezierCurveTo(14, -22, 34, -34 - shoulderLift * 0.7, 60, -27 - shoulderLift * 0.5);
      ctx.bezierCurveTo(82, -17, 85, 11, 55, 20 + breath * 0.4);
      ctx.bezierCurveTo(18, 21 + breath * 0.6, -24, 12 + breath * 0.25, -64, 11);
      ctx.bezierCurveTo(-76, 7, -78, -4, -70, -11);
      ctx.closePath();

      ctx.fillStyle = coatGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(92, 45, 12, 0.28)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.clip();

      // White belly
      const bellyGrad = ctx.createLinearGradient(0, 3, 0, 24);
      bellyGrad.addColorStop(0, 'rgba(252, 250, 244, 0)');
      bellyGrad.addColorStop(0.35, PALETTE.whiteCream);
      bellyGrad.addColorStop(1, PALETTE.whiteShadow);
      ctx.fillStyle = bellyGrad;
      ctx.beginPath();
      ctx.moveTo(-68, 8);
      ctx.bezierCurveTo(-26, 5, 18, 8 + breath * 0.4, 62, 3);
      ctx.lineTo(85, -5);
      ctx.lineTo(85, 28);
      ctx.lineTo(-70, 28);
      ctx.closePath();
      ctx.fill();

      // Authentic Two-Tone Rosettes (burnt-copper centers + broken black rims)
      const rosettes = [
        [-54, -14], [-40, -17], [-24, -18], [-8, -17], [8, -18], [24, -21], [40, -19],
        [-48, -4], [-32, -6], [-16, -6], [0, -6], [16, -7], [32, -8], [48, -7],
        [-42, 5], [-26, 4], [-10, 4], [6, 4], [22, 3], [38, 2],
      ];

      rosettes.forEach(([rx, ry]) => {
        ctx.save();
        ctx.translate(rx, ry + breath * 0.12);
        ctx.fillStyle = PALETTE.rosetteCore;
        ctx.beginPath();
        ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = PALETTE.rosetteRim;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, 2.8, 0.4, 2.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 2.8, 3.4, 5.8);
        ctx.stroke();
        ctx.restore();
      });

      ctx.restore();
    }

    function drawHead(shoulderLift: number, spineFlex: number) {
      const crouch = leopard.crouchBlend;
      const gRad = leopard.gaitPhase * Math.PI * 2;

      const neckX = 70 + crouch * 8;
      const neckY = -22 + crouch * 13 - shoulderLift * 0.35 + spineFlex * 0.25;
      const headAngle = leopard.headPitch + leopard.turnHeadLead + Math.sin(gRad * 2) * 0.02 * leopard.walkBlend;

      ctx.save();
      ctx.translate(neckX, neckY);
      ctx.rotate(headAngle);

      // Far ear
      drawLeopardEar(3, -24, -0.2 - leopard.earPin * 0.25, true);

      // White cheek ruff
      ctx.fillStyle = PALETTE.whiteCream;
      ctx.beginPath();
      ctx.ellipse(-5, 9, 20, 16, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Cranium
      const craniumGrad = ctx.createLinearGradient(0, -24, 0, 11);
      craniumGrad.addColorStop(0, PALETTE.furDeep);
      craniumGrad.addColorStop(0.55, PALETTE.furMain);
      craniumGrad.addColorStop(1, PALETTE.furGold);
      ctx.fillStyle = craniumGrad;
      ctx.beginPath();
      ctx.moveTo(-19, -11);
      ctx.quadraticCurveTo(2, -26, 19, -16);
      ctx.lineTo(33, -8);
      ctx.quadraticCurveTo(37, -2, 34, 5);
      ctx.quadraticCurveTo(23, 10, 4, 10);
      ctx.quadraticCurveTo(-16, 11, -19, -11);
      ctx.closePath();
      ctx.fill();

      // White muzzle pad
      ctx.fillStyle = PALETTE.whiteCream;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.quadraticCurveTo(24, -3, 34, 1.5);
      ctx.quadraticCurveTo(34, 8, 22, 9);
      ctx.quadraticCurveTo(7, 10, 2, 4);
      ctx.closePath();
      ctx.fill();

      // Nose leather
      ctx.fillStyle = PALETTE.noseRose;
      ctx.beginPath();
      ctx.moveTo(29, -4);
      ctx.lineTo(35, -2);
      ctx.quadraticCurveTo(35, 2, 32, 2.5);
      ctx.lineTo(29, 0.5);
      ctx.closePath();
      ctx.fill();

      // Near ear
      const earAngle = -0.32 - leopard.earPin * 0.35;
      drawLeopardEar(-8, -20, earAngle, false);

      // Luminous jade-amber predatory eye
      drawJadeEye(14, -8);

      // Whiskers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.lineWidth = 0.9;
      [1, 4, 7].forEach((wy, idx) => {
        ctx.beginPath();
        ctx.moveTo(24, wy);
        ctx.quadraticCurveTo(35, wy + (idx - 1) * 2, 44, wy + (idx - 1) * 4);
        ctx.stroke();
      });

      ctx.restore();
    }

    function drawLeopardEar(x: number, y: number, rotation: number, isFar: boolean) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = isFar ? '#2b221e' : PALETTE.rosetteRim;
      ctx.beginPath();
      ctx.arc(0, 0, 8, Math.PI, 0);
      ctx.lineTo(8, 6);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = isFar ? PALETTE.whiteShadow : PALETTE.whiteCream;
      ctx.beginPath();
      ctx.ellipse(0, 1, 3.8, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawJadeEye(ex: number, ey: number) {
      ctx.save();
      ctx.translate(ex, ey);

      if (leopard.blinkAmount > 0.72) {
        ctx.strokeStyle = PALETTE.eyeRim;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-4.5, 0);
        ctx.lineTo(4.5, 0);
        ctx.stroke();
        ctx.restore();
        return;
      }

      ctx.fillStyle = PALETTE.eyeRim;
      ctx.beginPath();
      ctx.moveTo(-5.5, -0.8);
      ctx.quadraticCurveTo(0, -4.5, 6, -0.8);
      ctx.lineTo(7.5, 0.8);
      ctx.quadraticCurveTo(0, 4.4, -5.5, -0.8);
      ctx.closePath();
      ctx.fill();

      // Jade-amber iris
      ctx.fillStyle = PALETTE.eyeJade;
      ctx.beginPath();
      ctx.ellipse(0.3, -0.2, 4.0, 2.9 * (1 - leopard.blinkAmount * 0.75), -0.06, 0, Math.PI * 2);
      ctx.fill();

      // Slit pupil
      ctx.fillStyle = '#090b09';
      ctx.beginPath();
      ctx.ellipse(0.8, -0.2, 1.2, 2.4 * (1 - leopard.blinkAmount * 0.75), 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0.1, -1.1, 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawGroundShadow() {
      const s = leopard.scale;
      const stretch = 1 + leopard.crouchBlend * 0.15;
      const widthScale = Math.max(0.32, Math.abs(leopard.visualScaleX));
      ctx.save();
      ctx.translate(leopard.x, leopard.groundY);
      const rx = 120 * s * stretch * widthScale;
      const ry = 10 * s;
      const grad = ctx.createRadialGradient(0, 2 * s, 8 * s, 0, 2 * s, rx);
      grad.addColorStop(0, 'rgba(24, 18, 12, 0.38)');
      grad.addColorStop(0.55, 'rgba(24, 18, 12, 0.14)');
      grad.addColorStop(1, 'rgba(24, 18, 12, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 2 * s, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawLeopard() {
      const s = leopard.scale;
      const gRad = leopard.gaitPhase * Math.PI * 2;
      const breath = Math.sin(leopard.elapsed * 2.4) * 2.2;
      const walkHeave = Math.abs(Math.sin(gRad * 2)) * -2.4 * leopard.walkBlend;
      const shoulderLift = Math.max(0, Math.sin(gRad + Math.PI * 1.5)) * 3.2 * leopard.walkBlend;
      const spineFlex = Math.sin(gRad * 2) * 1.8 * leopard.walkBlend;
      const crouchDrop = leopard.crouchBlend * 12;

      const hipRootY = -60 + crouchDrop + walkHeave + breath * 0.25;
      const groundLocalY = 0;

      ctx.save();
      ctx.translate(leopard.x, leopard.groundY);
      ctx.scale(leopard.visualScaleX * s, s);

      drawLongLeopardTail(-66, hipRootY - 8);

      drawLeopardLeg({
        rootX: -50,
        rootY: hipRootY + 2,
        phase01: leopard.gaitPhase + 0.50,
        isFront: false,
        isFar: true,
        crouch: leopard.crouchBlend,
        walkWeight: leopard.walkBlend,
        groundLevel: groundLocalY,
      });

      drawLeopardLeg({
        rootX: 46,
        rootY: hipRootY + 2,
        phase01: leopard.gaitPhase + 0.75,
        isFront: true,
        isFar: true,
        crouch: leopard.crouchBlend,
        walkWeight: leopard.walkBlend,
        groundLevel: groundLocalY,
      });

      ctx.save();
      ctx.translate(0, hipRootY);
      drawTorso(breath, shoulderLift, spineFlex);
      ctx.restore();

      drawLeopardLeg({
        rootX: -46,
        rootY: hipRootY + 3,
        phase01: leopard.gaitPhase,
        isFront: false,
        isFar: false,
        crouch: leopard.crouchBlend,
        walkWeight: leopard.walkBlend,
        groundLevel: groundLocalY,
      });

      drawLeopardLeg({
        rootX: 50,
        rootY: hipRootY + 3,
        phase01: leopard.gaitPhase + 0.25,
        isFront: true,
        isFar: false,
        crouch: leopard.crouchBlend,
        walkWeight: leopard.walkBlend,
        groundLevel: groundLocalY,
      });

      ctx.save();
      ctx.translate(0, hipRootY);
      drawHead(shoulderLift, spineFlex);
      ctx.restore();

      ctx.restore();
    }

    function renderLoop(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      if (isVisible) {
        ctx.clearRect(0, 0, viewW, viewH);
        updateLeopard(dt);
        drawGroundShadow();
        drawLeopard();
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

