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

interface ProceduralDeerCanvasProps {
  side: 'left' | 'right';
  registerController?: (controller: WildlifeCanvasController | null) => void;
  className?: string;
}

const PALETTE = {
  coatDeep: '#9c4e1a',
  coatMain: '#c86d2d',
  coatMid: '#d9823b',
  coatGold: '#e69d55',
  coatFarTop: '#874215',
  coatFarMid: '#a3541e',
  coatFarLow: '#b8682c',
  dorsalStripe: '#59290c',
  spotCream: '#fcf8f0',
  spotSoft: 'rgba(252, 248, 240, 0.88)',
  whitePure: '#fdfbf7',
  whiteShadow: '#e6dfd3',
  earInner: '#f4dcd1',
  earRim: '#3b2416',
  noseDark: '#231c18',
  chinDark: '#362921',
  eyeDark: '#241409',
  eyeIris: '#4f2c14',
  antlerBase: '#dfd4be',
  antlerMid: '#efe7d6',
  antlerTip: '#faf6ed',
  hoofDark: '#1c1816',
  hoofHighlight: '#4a413b',
};

export default function ProceduralDeerCanvas({
  side,
  registerController,
  className = 'w-56 h-38 sm:w-68 sm:h-46',
}: ProceduralDeerCanvasProps) {
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

    const deer = {
      x: 0,
      groundY: 0,
      scale: 0.70,
      direction: initialDir,
      visualScaleX: initialDir,
      turnHeadLead: 0,
      gaitPhase: 0,
      elapsed: Math.random() * 6,

      // Autonomous state machine
      state: 'walk' as 'walk' | 'alert' | 'graze' | 'trot' | 'turn',
      stateTimer: 0,
      stateDuration: 4.4,
      targetDirection: initialDir,
      turnSwitched: false,

      // Continuous pose parameters
      walkBlend: 1,
      targetWalk: 1,
      trotBlend: 0,
      targetTrot: 0,
      grazeBlend: 0,
      targetGraze: 0,
      alertSnap: 0,
      targetAlertSnap: 0,
      neckPitch: 0,
      targetNeckPitch: 0,

      // Independent ear flicks & blinking
      blinkTimer: 0,
      nextBlink: 2.6,
      blinkAmount: 0,
      nearEarFlick: 0,
      farEarFlick: 0,
      earTimer: 0,

      // Tail flick micro-animation
      tailFlick: 0,
      tailTimer: 0,
    };

    let viewW = 300;
    let viewH = 220;
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

      deer.scale = Math.max(0.48, Math.min(0.85, (viewW / 300) * 0.70));
      deer.groundY = viewH * 0.84;
      deer.x = viewW * 0.5;
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

    function enterState(newState: 'walk' | 'alert' | 'graze' | 'trot' | 'turn', duration: number) {
      deer.state = newState;
      deer.stateTimer = 0;
      deer.stateDuration = duration;
    }

    function beginTurn(newDir: number) {
      if (deer.state === 'turn') return;
      deer.state = 'turn';
      deer.targetDirection = newDir;
      deer.stateTimer = 0;
      deer.stateDuration = 0.82;
      deer.turnSwitched = false;
      deer.targetWalk = 0.14;
      deer.targetTrot = 0;
      deer.targetGraze = 0;
      deer.targetAlertSnap = 0.35;
    }

    function chooseNextAutonomousState() {
      const margin = 55 * deer.scale;
      const nearRight = deer.x >= viewW - margin && deer.direction === 1;
      const nearLeft = deer.x <= margin && deer.direction === -1;

      if (nearRight || nearLeft) {
        beginTurn(nearRight ? -1 : 1);
        return;
      }

      const r = Math.random();
      if (deer.state === 'walk') {
        if (r < 0.35) {
          enterState('alert', 2.2 + Math.random() * 1.5);
        } else if (r < 0.70) {
          enterState('graze', 3.6 + Math.random() * 2.0);
        } else if (r < 0.88) {
          enterState('trot', 2.0 + Math.random() * 1.0);
        } else {
          beginTurn(-deer.direction);
        }
      } else if (deer.state === 'graze') {
        enterState('alert', 2.2 + Math.random() * 1.4);
        deer.alertSnap = 1.0;
      } else if (deer.state === 'alert') {
        if (r < 0.65) {
          enterState('walk', 3.6 + Math.random() * 2.4);
        } else if (r < 0.85) {
          enterState('trot', 1.8 + Math.random() * 1.0);
        } else {
          beginTurn(-deer.direction);
        }
      } else if (deer.state === 'trot') {
        enterState('walk', 3.4 + Math.random() * 2.2);
      } else {
        enterState('walk', 3.6 + Math.random() * 2.4);
      }
    }

    function updateDeer(dt: number) {
      deer.elapsed += dt;
      deer.stateTimer += dt;

      const prox = proximityRef.current;

      // Natural blinking
      deer.blinkTimer += dt;
      if (deer.blinkTimer >= deer.nextBlink) {
        const bp = (deer.blinkTimer - deer.nextBlink) / 0.15;
        if (bp <= 1) {
          deer.blinkAmount = Math.sin(Math.PI * bp);
        } else {
          deer.blinkAmount = 0;
          deer.blinkTimer = 0;
          deer.nextBlink = 2.2 + Math.random() * 3.0;
        }
      }

      // Independent ear flicks
      deer.earTimer += dt;
      if (deer.earTimer > 1.6 && Math.random() < 0.03) {
        if (Math.random() < 0.55) {
          deer.nearEarFlick = 1;
        } else {
          deer.farEarFlick = 1;
        }
        deer.earTimer = 0;
      }
      deer.nearEarFlick = damp(deer.nearEarFlick, 0, 11, dt);
      deer.farEarFlick = damp(deer.farEarFlick, 0, 11, dt);

      // Tail flick
      deer.tailTimer += dt;
      if (deer.tailTimer > 2.2 && Math.random() < 0.03) {
        deer.tailFlick = 1;
        deer.tailTimer = 0;
      }
      deer.tailFlick = damp(deer.tailFlick, 0, 8, dt);

      // Edge turn check
      const boundMargin = 52 * deer.scale;
      if (deer.state === 'walk' || deer.state === 'trot') {
        if (deer.x >= viewW - boundMargin && deer.direction === 1) {
          beginTurn(-1);
        } else if (deer.x <= boundMargin && deer.direction === -1) {
          beginTurn(1);
        }
      }

      const isScrolling = Math.abs(prox.velocity) > 0.04;
      const isNearJeep = prox.proximityFactor > 0.30;
      const isAtStop = prox.isAtStop || (isNearJeep && !isScrolling);

      // Proximity-Reactive State Override
      if (isAtStop) {
        // Car stopped at this stop: deer stands alert, ears perked, head lifted, watching car!
        deer.targetWalk = 0.0;
        deer.targetTrot = 0.0;
        deer.targetGraze = 0.0;
        deer.targetAlertSnap = 0.85;
        deer.targetNeckPitch = -0.12;
      } else if (isNearJeep && isScrolling) {
        // Car moving near this stop: lively alert trot
        deer.targetWalk = 1.0;
        deer.targetTrot = 0.85;
        deer.targetGraze = 0.0;
        deer.targetAlertSnap = 0.35;
        deer.targetNeckPitch = -0.06;
      } else if (!isScrolling) {
        // Car stopped anywhere else: stop walking, stand idle
        deer.targetWalk = 0.0;
        deer.targetTrot = 0.0;
        deer.targetGraze = 0.15;
        deer.targetAlertSnap = 0.10;
        deer.targetNeckPitch = Math.sin(deer.elapsed * 1.1) * 0.03;
      } else {
        if (deer.stateTimer >= deer.stateDuration) {
          chooseNextAutonomousState();
        }
        if (deer.state === 'walk') {
          const velBoost = clamp(Math.abs(prox.velocity) * 0.06, 0, 0.4);
          deer.targetWalk = 1.0 + velBoost;
          deer.targetTrot = 0.0;
          deer.targetGraze = 0.0;
          deer.targetAlertSnap = 0.0;
          deer.targetNeckPitch = Math.sin(deer.elapsed * 1.1) * 0.03;
        } else if (deer.state === 'trot') {
          deer.targetWalk = 1.0;
          deer.targetTrot = 1.0;
          deer.targetGraze = 0.0;
          deer.targetAlertSnap = 0.35;
          deer.targetNeckPitch = -0.06;
        } else if (deer.state === 'alert') {
          deer.targetWalk = 0.0;
          deer.targetTrot = 0.0;
          deer.targetGraze = 0.0;
          deer.targetAlertSnap = 0.28;
          deer.targetNeckPitch = Math.sin(deer.elapsed * 1.7) * 0.07;
        } else if (deer.state === 'graze') {
          const p = deer.stateTimer / deer.stateDuration;
          const grazeEnv =
            p < 0.22
              ? quinticEase(p / 0.22)
              : p > 0.86
                ? 1 - quinticEase((p - 0.86) / 0.14)
                : 1;
          deer.targetWalk = 0.0;
          deer.targetTrot = 0.0;
          deer.targetGraze = grazeEnv;
          deer.targetAlertSnap = 0.0;
          deer.targetNeckPitch = 0.0;
        }
      }

      if (deer.state === 'turn') {
        const p = clamp(deer.stateTimer / deer.stateDuration, 0, 1);
        const eased = quinticEase(p);
        const startDir = -deer.targetDirection;
        if (p >= 0.5 && !deer.turnSwitched) {
          deer.direction = deer.targetDirection;
          deer.turnSwitched = true;
        }
        deer.visualScaleX = lerp(startDir, deer.targetDirection, eased);
        deer.turnHeadLead = Math.sin(Math.PI * p) * deer.targetDirection * 0.18;
      }

      if (deer.state !== 'turn') {
        deer.visualScaleX = damp(deer.visualScaleX, deer.direction, 9.5, dt);
        deer.turnHeadLead = damp(deer.turnHeadLead, 0, 9.5, dt);
      }

      deer.walkBlend = damp(deer.walkBlend, deer.targetWalk, 4.6, dt);
      deer.trotBlend = damp(deer.trotBlend, deer.targetTrot, 4.2, dt);
      deer.grazeBlend = damp(deer.grazeBlend, deer.targetGraze, 4.4, dt);
      deer.alertSnap = damp(deer.alertSnap, deer.targetAlertSnap, 5.2, dt);
      deer.neckPitch = damp(deer.neckPitch, deer.targetNeckPitch, 4.5, dt);

      // Zero-slip stride synchronization
      const dutyFactor = lerp(0.62, 0.52, deer.trotBlend);
      const halfStride = lerp(19, 28, deer.trotBlend) * deer.walkBlend;
      const fullCycleDist = (2 * halfStride) / dutyFactor;
      const cycleFreq = lerp(0.92, 1.48, deer.trotBlend) * deer.walkBlend;
      deer.gaitPhase = (deer.gaitPhase + cycleFreq * dt) % 1;

      const bodyDisplacement = fullCycleDist * cycleFreq * dt * deer.scale;
      deer.x += deer.direction * bodyDisplacement;
    }

    function evaluateHoofTrajectory(phase01: number, walkWeight: number, trotWeight: number, halfStride: number, liftHeight: number) {
      const p = ((phase01 % 1) + 1) % 1;
      const duty = lerp(0.62, 0.52, trotWeight);

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
        const arc = Math.pow(Math.sin(Math.PI * u), 1.12);
        return {
          x: lerp(-halfStride, halfStride, easedX) * walkWeight,
          lift: arc * liftHeight * walkWeight,
          isSwing: true,
          swingU: u,
        };
      }
    }

    function drawUngulateLeg({
      rootX,
      rootY,
      phase01,
      isFront,
      isFar,
      graze,
      walkWeight,
      trotWeight,
      groundLevel,
    }: {
      rootX: number;
      rootY: number;
      phase01: number;
      isFront: boolean;
      isFar: boolean;
      graze: number;
      walkWeight: number;
      trotWeight: number;
      groundLevel: number;
    }) {
      const halfStride = lerp(19, 28, trotWeight);
      const liftHeight = lerp(18, 25, trotWeight);
      const hoofTraj = evaluateHoofTrajectory(phase01, walkWeight, trotWeight, halfStride, liftHeight);

      const grazeSpread = isFront ? graze * (isFar ? 7 : 3) : -graze * 2;
      const restOffsetX = (isFront ? 3 : -5) + grazeSpread;
      const hoofSoleY = groundLevel;
      const fetlockY = hoofSoleY - 9 - hoofTraj.lift;
      const hoofX = rootX + restOffsetX + hoofTraj.x;

      const swingCurve = hoofTraj.isSwing ? Math.sin(Math.PI * hoofTraj.swingU) * walkWeight : 0;
      const hoofPitch = swingCurve * 0.48;

      ctx.save();
      if (isFront) {
        const lenUpper = 36;
        const lenCannon = 39;
        const fetlockTargetX = hoofX - Math.sin(hoofPitch) * 2.5;
        const fetlockTargetY = fetlockY - Math.cos(hoofPitch) * 2.5;
        const ik = solveTwoBoneIK(rootX, rootY, fetlockTargetX, fetlockTargetY, lenUpper, lenCannon, -1);
        drawSmoothFrontUngulateSpline(rootX, rootY, ik.jx, ik.jy, ik.ex, ik.ey, hoofPitch, isFar);
      } else {
        const lenFemur = 36;
        const lenTibia = 37;
        const lenCannon = 28;
        const hockLean = -0.18 - trotWeight * 0.14 - swingCurve * 0.28;
        const hockTargetX = hoofX + Math.sin(hockLean) * lenCannon;
        const hockTargetY = fetlockY - Math.cos(hockLean) * lenCannon;
        const ik = solveTwoBoneIK(rootX, rootY, hockTargetX, hockTargetY, lenFemur, lenTibia, +1);
        drawSmoothHindUngulateSpline(rootX, rootY, ik.jx, ik.jy, ik.ex, ik.ey, hoofX, fetlockY, hoofPitch, isFar);
      }
      ctx.restore();
    }

    function drawSmoothFrontUngulateSpline(
      sx: number,
      sy: number,
      kx: number,
      ky: number,
      fx: number,
      fy: number,
      hoofPitch: number,
      isFar: boolean,
    ) {
      const a1 = Math.atan2(ky - sy, kx - sx);
      const a2 = Math.atan2(fy - ky, fx - kx);
      const n1x = Math.sin(a1), n1y = -Math.cos(a1);
      const n2x = Math.sin(a2), n2y = -Math.cos(a2);

      const rShoulder = 14;
      const rKnee = 5.8;
      const rFetlock = 3.8;

      const sFront = { x: sx + n1x * rShoulder, y: sy + n1y * rShoulder };
      const sBack = { x: sx - n1x * rShoulder, y: sy - n1y * rShoulder };
      const kAvgX = n1x + n2x, kAvgY = n1y + n2y;
      const kLen = Math.hypot(kAvgX, kAvgY) || 1;
      const knx = kAvgX / kLen, kny = kAvgY / kLen;
      const kFront = { x: kx + knx * rKnee, y: ky + kny * rKnee };
      const kBack = { x: kx - knx * (rKnee + 0.6), y: ky - kny * (rKnee + 0.6) };
      const fFront = { x: fx + n2x * rFetlock, y: fy + n2y * rFetlock };
      const fBack = { x: fx - n2x * rFetlock, y: fy - n2y * rFetlock };

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
      ctx.quadraticCurveTo((sFront.x + kFront.x) * 0.5 + n1x * 1.8, (sFront.y + kFront.y) * 0.5 + n1y * 1.8, kFront.x, kFront.y);
      ctx.quadraticCurveTo((kFront.x + fFront.x) * 0.5, (kFront.y + fFront.y) * 0.5, fFront.x, fFront.y);

      const cosP = Math.cos(hoofPitch), sinP = Math.sin(hoofPitch);
      const pasternFront = { x: fFront.x + cosP * 2 - sinP * 3.8, y: fFront.y + sinP * 2 + cosP * 3.8 };
      const pasternBack = { x: fBack.x - cosP * 1 - sinP * 3.8, y: fBack.y - sinP * 1 + cosP * 3.8 };

      ctx.lineTo(pasternFront.x, pasternFront.y);
      ctx.lineTo(pasternBack.x, pasternBack.y);
      ctx.lineTo(fBack.x, fBack.y);
      ctx.quadraticCurveTo((fBack.x + kBack.x) * 0.5, (fBack.y + kBack.y) * 0.5, kBack.x, kBack.y);
      ctx.quadraticCurveTo((kBack.x + sBack.x) * 0.5 - n1x * 2.8, (kBack.y + sBack.y) * 0.5 - n1y * 2.8, sBack.x, sBack.y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(sx, sy - 6, fx, fy + 5);
      if (isFar) {
        grad.addColorStop(0, PALETTE.coatFarTop);
        grad.addColorStop(0.55, PALETTE.coatFarMid);
        grad.addColorStop(1, PALETTE.coatFarLow);
      } else {
        grad.addColorStop(0, PALETTE.coatMain);
        grad.addColorStop(0.55, PALETTE.coatMid);
        grad.addColorStop(1, PALETTE.coatGold);
      }
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = isFar ? 'rgba(72, 34, 10, 0.28)' : 'rgba(110, 52, 16, 0.25)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      drawClovenHoof(pasternFront, pasternBack, cosP, sinP, isFar);
    }

    function drawSmoothHindUngulateSpline(
      hx: number,
      hy: number,
      sx: number,
      sy: number,
      ax: number,
      ay: number,
      fx: number,
      fy: number,
      hoofPitch: number,
      isFar: boolean,
    ) {
      const a1 = Math.atan2(sy - hy, sx - hx);
      const a2 = Math.atan2(ay - sy, ax - sx);
      const a3 = Math.atan2(fy - ay, fx - ax);

      const n1x = Math.sin(a1), n1y = -Math.cos(a1);
      const n2x = Math.sin(a2), n2y = -Math.cos(a2);
      const n3x = Math.sin(a3), n3y = -Math.cos(a3);

      const rHip = 18;
      const rStifle = 9.5;
      const rHock = 5.5;
      const rFetlock = 3.6;

      const hFront = { x: hx + n1x * rHip, y: hy + n1y * rHip };
      const hBack = { x: hx - n1x * rHip, y: hy - n1y * rHip };
      const sAvgX = n1x + n2x, sAvgY = n1y + n2y;
      const sLen = Math.hypot(sAvgX, sAvgY) || 1;
      const snx = sAvgX / sLen, sny = sAvgY / sLen;
      const sFront = { x: sx + snx * rStifle, y: sy + sny * rStifle };
      const sBack = { x: sx - snx * rStifle, y: sy - sny * rStifle };

      const aAvgX = n2x + n3x, aAvgY = n2y + n3y;
      const aLen = Math.hypot(aAvgX, aAvgY) || 1;
      const anx = aAvgX / aLen, any = aAvgY / aLen;
      const hkFront = { x: ax + anx * rHock, y: ay + any * rHock };
      const hkBack = { x: ax - anx * (rHock + 0.8), y: ay - any * (rHock + 0.8) };
      const fFront = { x: fx + n3x * rFetlock, y: fy + n3y * rFetlock };
      const fBack = { x: fx - n3x * rFetlock, y: fy - n3y * rFetlock };

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
      ctx.quadraticCurveTo((hFront.x + sFront.x) * 0.5 + n1x * 2.0, (hFront.y + sFront.y) * 0.5 + n1y * 2.0, sFront.x, sFront.y);
      ctx.quadraticCurveTo((sFront.x + hkFront.x) * 0.5, (sFront.y + hkFront.y) * 0.5, hkFront.x, hkFront.y);
      ctx.quadraticCurveTo((hkFront.x + fFront.x) * 0.5, (hkFront.y + fFront.y) * 0.5, fFront.x, fFront.y);

      const cosP = Math.cos(hoofPitch), sinP = Math.sin(hoofPitch);
      const pasternFront = { x: fFront.x + cosP * 2 - sinP * 3.8, y: fFront.y + sinP * 2 + cosP * 3.8 };
      const pasternBack = { x: fBack.x - cosP * 1 - sinP * 3.8, y: fBack.y - sinP * 1 + cosP * 3.8 };

      ctx.lineTo(pasternFront.x, pasternFront.y);
      ctx.lineTo(pasternBack.x, pasternBack.y);
      ctx.lineTo(fBack.x, fBack.y);
      ctx.quadraticCurveTo((fBack.x + hkBack.x) * 0.5, (fBack.y + hkBack.y) * 0.5, hkBack.x, hkBack.y);
      ctx.quadraticCurveTo((hkBack.x + sBack.x) * 0.5 - n2x * 2.4, (hkBack.y + sBack.y) * 0.5 - n2y * 2.4, sBack.x, sBack.y);
      ctx.quadraticCurveTo((sBack.x + hBack.x) * 0.5 - n1x * 4.2, (sBack.y + hBack.y) * 0.5 - n1y * 4.2, hBack.x, hBack.y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(hx, hy - 6, fx, fy + 5);
      if (isFar) {
        grad.addColorStop(0, PALETTE.coatFarTop);
        grad.addColorStop(0.55, PALETTE.coatFarMid);
        grad.addColorStop(1, PALETTE.coatFarLow);
      } else {
        grad.addColorStop(0, PALETTE.coatMain);
        grad.addColorStop(0.55, PALETTE.coatMid);
        grad.addColorStop(1, PALETTE.coatGold);
      }
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = isFar ? 'rgba(72, 34, 10, 0.28)' : 'rgba(110, 52, 16, 0.25)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      drawClovenHoof(pasternFront, pasternBack, cosP, sinP, isFar);
    }

    function drawClovenHoof(
      pFront: { x: number; y: number },
      pBack: { x: number; y: number },
      cosP: number,
      sinP: number,
      isFar: boolean,
    ) {
      const toeTip = { x: pFront.x + cosP * 5.2 - sinP * 5.2, y: pFront.y + sinP * 5.2 + cosP * 5.2 };
      const heelBase = { x: pBack.x - cosP * 0.4 - sinP * 5.2, y: pBack.y - sinP * 0.4 + cosP * 5.2 };

      ctx.fillStyle = isFar ? '#2a2421' : PALETTE.hoofDark;
      ctx.beginPath();
      ctx.moveTo(pFront.x, pFront.y);
      ctx.quadraticCurveTo(pFront.x + cosP * 3.6 - sinP * 2, pFront.y + sinP * 3.6 + cosP * 2, toeTip.x, toeTip.y);
      ctx.lineTo(heelBase.x, heelBase.y);
      ctx.lineTo(pBack.x, pBack.y);
      ctx.closePath();
      ctx.fill();

      if (!isFar) {
        ctx.strokeStyle = PALETTE.hoofHighlight;
        ctx.lineWidth = 0.9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pFront.x + cosP * 1 - sinP * 1, pFront.y + sinP * 1 + cosP * 1);
        ctx.lineTo(toeTip.x - cosP * 1 - sinP * 0.6, toeTip.y - sinP * 1 + cosP * 0.6);
        ctx.stroke();
      }
    }

    function drawChitalTail(hipX: number, hipY: number) {
      const flickAngle =
        Math.sin(deer.elapsed * 26) * 0.55 * deer.tailFlick +
        Math.sin(deer.elapsed * 3.8) * 0.08 +
        deer.trotBlend * 0.35;

      ctx.save();
      ctx.translate(hipX, hipY);
      ctx.rotate(flickAngle);

      ctx.fillStyle = PALETTE.whitePure;
      ctx.beginPath();
      ctx.moveTo(3, -5);
      ctx.quadraticCurveTo(-14, -2, -21, 13);
      ctx.quadraticCurveTo(-11, 19, 2, 13);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = PALETTE.coatMain;
      ctx.beginPath();
      ctx.moveTo(2, -6);
      ctx.quadraticCurveTo(-13, -5, -20, 10);
      ctx.quadraticCurveTo(-10, 10, 0, 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = PALETTE.dorsalStripe;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.quadraticCurveTo(-11, -3, -18, 9);
      ctx.stroke();
      ctx.restore();
    }

    function drawTorso(breath: number, shoulderLift: number, spineFlex: number) {
      ctx.save();
      const coatGrad = ctx.createLinearGradient(0, -36, 0, 22);
      coatGrad.addColorStop(0, PALETTE.coatDeep);
      coatGrad.addColorStop(0.42, PALETTE.coatMain);
      coatGrad.addColorStop(0.80, PALETTE.coatGold);
      coatGrad.addColorStop(1, PALETTE.whitePure);

      ctx.beginPath();
      ctx.moveTo(-62, -15);
      ctx.bezierCurveTo(-41, -27, -15, -25 + spineFlex, 11, -24 + spineFlex * 0.5);
      ctx.bezierCurveTo(29, -25, 44, -31 - shoulderLift * 0.7, 59, -23 - shoulderLift * 0.5);
      ctx.bezierCurveTo(75, -11, 74, 13, 51, 19 + breath * 0.4);
      ctx.bezierCurveTo(18, 20 + breath * 0.6, -20, 12 + breath * 0.25, -57, 11);
      ctx.bezierCurveTo(-69, 6, -70, -7, -62, -15);
      ctx.closePath();

      ctx.fillStyle = coatGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(110, 52, 16, 0.26)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      ctx.clip();

      const bellyGrad = ctx.createLinearGradient(0, 3, 0, 23);
      bellyGrad.addColorStop(0, 'rgba(253, 251, 247, 0)');
      bellyGrad.addColorStop(0.35, PALETTE.whitePure);
      bellyGrad.addColorStop(1, PALETTE.whiteShadow);

      ctx.fillStyle = bellyGrad;
      ctx.beginPath();
      ctx.moveTo(-64, 6);
      ctx.bezierCurveTo(-20, 5, 18, 9 + breath * 0.4, 57, 5);
      ctx.lineTo(75, -3);
      ctx.lineTo(75, 25);
      ctx.lineTo(-66, 25);
      ctx.closePath();
      ctx.fill();

      // Dorsal stripe
      ctx.strokeStyle = 'rgba(89, 41, 12, 0.45)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-60, -16);
      ctx.bezierCurveTo(-25, -26, 13, -25, 54, -26 - shoulderLift * 0.5);
      ctx.stroke();

      // Rows of Chital spots
      const spotRows = [
        [[-52, -17, 1.9], [-41, -20, 2.0], [-29, -20, 2.1], [-16, -20, 2.0], [-4, -20, 2.1], [8, -20, 2.0], [20, -20, 1.9], [33, -21, 1.8], [44, -19, 1.5]],
        [[-57, -11, 2.0], [-46, -12, 2.2], [-33, -13, 2.3], [-21, -13, 2.2], [-9, -12, 2.3], [3, -12, 2.2], [15, -12, 2.1], [28, -13, 2.0], [39, -12, 1.8], [50, -10, 1.5]],
        [[-54, -3, 1.9], [-41, -5, 2.1], [-29, -6, 2.2], [-17, -6, 2.1], [-5, -5, 2.2], [7, -5, 2.1], [20, -5, 2.0], [32, -6, 1.8], [43, -4, 1.6]],
        [[-47, 2, 1.7], [-35, 1, 1.9], [-23, 1, 2.0], [-11, 1, 1.9], [1, 1, 1.9], [14, 1, 1.7], [26, 1, 1.6], [37, 1, 1.4]],
      ];

      ctx.fillStyle = PALETTE.spotSoft;
      spotRows.forEach((row) => {
        row.forEach(([sx0, sy0, sr]) => {
          ctx.beginPath();
          ctx.ellipse(sx0, sy0 + breath * 0.12, sr * 1.25, sr * 0.86, -0.06, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      ctx.restore();
    }

    function drawNeckAndHead(shoulderLift: number, spineFlex: number) {
      const graze = deer.grazeBlend;
      const gRad = deer.gaitPhase * Math.PI * 2;
      const walkHeadBob = Math.sin(gRad * 2) * 0.045 * deer.walkBlend * (1 - graze);
      const alertLift = deer.alertSnap * -0.14;

      const neckBaseX = 55;
      const neckBaseY = -13 - shoulderLift * 0.35 + spineFlex * 0.25;

      const baseNeckAngle = lerp(-0.98, 0.80, quinticEase(graze));
      const neckAngle = baseNeckAngle + deer.neckPitch + walkHeadBob + alertLift;
      const neckLength = lerp(48, 56, graze);

      const headPivotX = neckBaseX + Math.cos(neckAngle) * neckLength;
      const headPivotY = neckBaseY + Math.sin(neckAngle) * neckLength;

      ctx.save();
      const nPerpX = -Math.sin(neckAngle);
      const nPerpY = Math.cos(neckAngle);

      const rBase = 17;
      const rTop = 9.5;
      const bBack = { x: neckBaseX - nPerpX * rBase, y: neckBaseY - nPerpY * rBase };
      const bFront = { x: neckBaseX + nPerpX * (rBase + 1.6), y: neckBaseY + nPerpY * (rBase + 1.6) };
      const tBack = { x: headPivotX - nPerpX * rTop, y: headPivotY - nPerpY * rTop };
      const tFront = { x: headPivotX + nPerpX * rTop, y: headPivotY + nPerpY * rTop };

      const neckGrad = ctx.createLinearGradient(bBack.x, bBack.y, bFront.x, bFront.y);
      neckGrad.addColorStop(0, PALETTE.coatDeep);
      neckGrad.addColorStop(0.55, PALETTE.coatMain);
      neckGrad.addColorStop(0.85, PALETTE.coatGold);
      neckGrad.addColorStop(1, PALETTE.whitePure);

      ctx.fillStyle = neckGrad;
      ctx.beginPath();
      ctx.moveTo(bBack.x, bBack.y);
      ctx.quadraticCurveTo((bBack.x + tBack.x) * 0.5 - nPerpX * 1.6, (bBack.y + tBack.y) * 0.5 - nPerpY * 1.6, tBack.x, tBack.y);
      ctx.lineTo(tFront.x, tFront.y);
      ctx.quadraticCurveTo((tFront.x + bFront.x) * 0.5 + nPerpX * 2.4, (tFront.y + bFront.y) * 0.5 + nPerpY * 2.4, bFront.x, bFront.y);
      ctx.closePath();
      ctx.fill();

      // White throat ruff
      ctx.save();
      ctx.clip();
      ctx.fillStyle = PALETTE.whitePure;
      ctx.beginPath();
      ctx.moveTo(tFront.x + nPerpX * 1.6, tFront.y + nPerpY * 1.6);
      ctx.quadraticCurveTo((tFront.x + bFront.x) * 0.5 + nPerpX * 2.4, (tFront.y + bFront.y) * 0.5 + nPerpY * 2.4, bFront.x + nPerpX * 1.6, bFront.y + nPerpY * 1.6);
      ctx.lineTo(bFront.x - nPerpX * 8, bFront.y - nPerpY * 8);
      ctx.quadraticCurveTo((tFront.x + bFront.x) * 0.5 - nPerpX * 4, (tFront.y + bFront.y) * 0.5 - nPerpY * 4, tFront.x - nPerpX * 4, tFront.y - nPerpY * 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Head
      const headWorldAngle = lerp(0.04, 0.72, quinticEase(graze)) + deer.turnHeadLead + deer.neckPitch * 0.6 + alertLift * 0.5;
      const nibble = graze > 0.75 ? Math.sin(deer.elapsed * 14) * 1.2 * ((graze - 0.75) / 0.25) : 0;

      ctx.save();
      ctx.translate(headPivotX, headPivotY);
      ctx.rotate(headWorldAngle);

      drawDeerEar(-5, -12, -0.35 + deer.farEarFlick * 0.35, true);
      drawChitalAntler(-2, -12, true);

      const headGrad = ctx.createLinearGradient(0, -15, 0, 10);
      headGrad.addColorStop(0, PALETTE.coatDeep);
      headGrad.addColorStop(0.55, PALETTE.coatMain);
      headGrad.addColorStop(1, PALETTE.coatGold);

      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.moveTo(-11, -6);
      ctx.quadraticCurveTo(0, -15, 11, -9);
      ctx.lineTo(28, -2);
      ctx.quadraticCurveTo(31, 1, 29, 5);
      ctx.quadraticCurveTo(18, 8 + nibble * 0.4, 3, 9);
      ctx.quadraticCurveTo(-10, 10, -11, -6);
      ctx.closePath();
      ctx.fill();

      // White chin
      ctx.fillStyle = PALETTE.whitePure;
      ctx.beginPath();
      ctx.moveTo(8, 4);
      ctx.quadraticCurveTo(19, 4, 27, 3);
      ctx.quadraticCurveTo(26, 7 + nibble * 0.5, 14, 8 + nibble * 0.3);
      ctx.quadraticCurveTo(2, 9, -5, 6);
      ctx.closePath();
      ctx.fill();

      // Dark chin spot & nose
      ctx.fillStyle = PALETTE.chinDark;
      ctx.beginPath();
      ctx.ellipse(22, 5 + nibble * 0.3, 2.6, 1.1, -0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.noseDark;
      ctx.beginPath();
      ctx.moveTo(25, -3);
      ctx.quadraticCurveTo(31, -3, 31, 1.2);
      ctx.quadraticCurveTo(29, 3.4, 26, 2.6);
      ctx.quadraticCurveTo(24, 0, 25, -3);
      ctx.closePath();
      ctx.fill();

      drawChitalAntler(-6, -11, false);
      drawDeerEar(-9, -10, -0.58 - deer.nearEarFlick * 0.42, false);
      drawDeerEye(9, -3.6);

      ctx.restore();
      ctx.restore();
    }

    function drawDeerEar(x: number, y: number, rotation: number, isFar: boolean) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = isFar ? PALETTE.coatFarTop : PALETTE.coatMain;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-8, -6, -13, -18, -6, -26);
      ctx.bezierCurveTo(0, -19, 3, -8, 2, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = PALETTE.earRim;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = isFar ? '#d9c4b8' : PALETTE.earInner;
      ctx.beginPath();
      ctx.moveTo(-1, -2);
      ctx.bezierCurveTo(-6, -7, -9, -15, -6, -21);
      ctx.bezierCurveTo(-2, -15, 1, -8, 0, -2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawChitalAntler(x: number, y: number, isFar: boolean) {
      ctx.save();
      ctx.translate(x, y);
      if (isFar) {
        ctx.translate(2, -1);
        ctx.scale(0.92, 0.94);
      }
      ctx.strokeStyle = isFar ? PALETTE.antlerBase : PALETTE.antlerMid;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.lineWidth = 2.9;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-5, -13, -8, -27, 3, -42);
      ctx.stroke();

      ctx.lineWidth = 1.8;
      ctx.strokeStyle = isFar ? PALETTE.antlerMid : PALETTE.antlerTip;
      ctx.beginPath();
      ctx.moveTo(3, -42);
      ctx.quadraticCurveTo(9, -48, 13, -52);
      ctx.stroke();

      // Brow tine
      ctx.strokeStyle = isFar ? PALETTE.antlerBase : PALETTE.antlerTip;
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.quadraticCurveTo(6, -9, 11, -15);
      ctx.stroke();

      // Upper tine
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-1, -30);
      ctx.quadraticCurveTo(-6, -38, -5, -46);
      ctx.stroke();

      ctx.restore();
    }

    function drawDeerEye(ex: number, ey: number) {
      ctx.save();
      ctx.translate(ex, ey);

      ctx.fillStyle = 'rgba(253, 251, 247, 0.72)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 5.2, 3.9, -0.08, 0, Math.PI * 2);
      ctx.fill();

      if (deer.blinkAmount > 0.72) {
        ctx.strokeStyle = PALETTE.eyeDark;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-3.9, 0.2);
        ctx.lineTo(3.9, 0.2);
        ctx.stroke();
        ctx.restore();
        return;
      }

      const openScaleY = 1 - deer.blinkAmount * 0.78;
      ctx.fillStyle = PALETTE.eyeDark;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.9, 3.1 * openScaleY, -0.06, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.eyeIris;
      ctx.beginPath();
      ctx.ellipse(0.3, 0.2, 2.8, 2.0 * openScaleY, -0.06, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0d0805';
      ctx.beginPath();
      ctx.ellipse(0.2, 0.1, 2.1, 1.1 * openScaleY, -0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-1.0, -1.0, 0.95, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawGroundShadow() {
      const s = deer.scale;
      const widthScale = Math.max(0.32, Math.abs(deer.visualScaleX));
      const grazeReach = deer.grazeBlend * 11 * s;
      const boundLift = deer.trotBlend * Math.abs(Math.sin(deer.gaitPhase * Math.PI * 2)) * 8 * s;

      ctx.save();
      ctx.translate(deer.x + deer.direction * grazeReach * 0.5, deer.groundY);
      const rx = (112 * s + grazeReach - boundLift * 0.5) * widthScale;
      const ry = 10 * s;

      const grad = ctx.createRadialGradient(0, 2 * s, 8 * s, 0, 2 * s, rx);
      grad.addColorStop(0, 'rgba(32, 24, 16, 0.35)');
      grad.addColorStop(0.58, 'rgba(32, 24, 16, 0.12)');
      grad.addColorStop(1, 'rgba(32, 24, 16, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 2 * s, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawDeer() {
      const s = deer.scale;
      const gRad = deer.gaitPhase * Math.PI * 2;
      const breath = Math.sin(deer.elapsed * 2.5) * 2.0;
      const walkHeave = Math.abs(Math.sin(gRad * 2)) * -2.3 * deer.walkBlend;
      const trotBound = Math.sin(gRad * 2) * -3.4 * deer.trotBlend;
      const shoulderLift = Math.max(0, Math.sin(gRad + Math.PI * 1.5)) * 3.1 * deer.walkBlend;
      const spineFlex = Math.sin(gRad * 2) * 1.8 * deer.walkBlend;
      const grazeDip = deer.grazeBlend * 3.6;

      const hipRootY = -79 + grazeDip + walkHeave + trotBound + breath * 0.25;
      const groundLocalY = 0;

      ctx.save();
      ctx.translate(deer.x, deer.groundY);
      ctx.scale(deer.visualScaleX * s, s);

      drawChitalTail(-61, hipRootY - 10);

      drawUngulateLeg({
        rootX: -47,
        rootY: hipRootY + 2,
        phase01: deer.gaitPhase + 0.50,
        isFront: false,
        isFar: true,
        graze: deer.grazeBlend,
        walkWeight: deer.walkBlend,
        trotWeight: deer.trotBlend,
        groundLevel: groundLocalY,
      });

      drawUngulateLeg({
        rootX: 43,
        rootY: hipRootY + 3,
        phase01: deer.gaitPhase + 0.75,
        isFront: true,
        isFar: true,
        graze: deer.grazeBlend,
        walkWeight: deer.walkBlend,
        trotWeight: deer.trotBlend,
        groundLevel: groundLocalY,
      });

      ctx.save();
      ctx.translate(0, hipRootY);
      drawTorso(breath, shoulderLift, spineFlex);
      ctx.restore();

      drawUngulateLeg({
        rootX: -43,
        rootY: hipRootY + 3,
        phase01: deer.gaitPhase,
        isFront: false,
        isFar: false,
        graze: deer.grazeBlend,
        walkWeight: deer.walkBlend,
        trotWeight: deer.trotBlend,
        groundLevel: groundLocalY,
      });

      drawUngulateLeg({
        rootX: 47,
        rootY: hipRootY + 4,
        phase01: deer.gaitPhase + 0.25,
        isFront: true,
        isFar: false,
        graze: deer.grazeBlend,
        walkWeight: deer.walkBlend,
        trotWeight: deer.trotBlend,
        groundLevel: groundLocalY,
      });

      ctx.save();
      ctx.translate(0, hipRootY);
      drawNeckAndHead(shoulderLift, spineFlex);
      ctx.restore();

      ctx.restore();
    }

    function renderLoop(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      if (isVisible) {
        ctx.clearRect(0, 0, viewW, viewH);
        updateDeer(dt);
        drawGroundShadow();
        drawDeer();
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

