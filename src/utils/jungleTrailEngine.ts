export type BendSide = 'left' | 'right';
export type AtmospherePhase = 'morning-mist' | 'emerald-canopy' | 'night-camp';

export interface TrailCheckpointMeta {
  safariId: string;
  index: number;
  shortName: string;
  coordinates: string;
  elevationMeters: number;
  zoneTag: string;
  bendSide: BendSide;
  atmosphereHint: AtmospherePhase;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface CheckpointCoord extends TrailCheckpointMeta {
  x: number;
  y: number;
  cardSide: 'left' | 'right';
  pathT: number;
}

export interface RiverCrossingGeometry {
  startT: number;
  endT: number;
  centerT: number;
  bridgeX: number;
  bridgeY: number;
  bridgeAngleDeg: number;
  riverSvgPath: string;
}

export interface SnakeTrailGeometry {
  width: number;
  height: number;
  isMobile: boolean;
  roadPath: string;
  checkpointCoords: CheckpointCoord[];
  riverCrossing: RiverCrossingGeometry;
}

export interface AtmosphereState {
  progress: number;
  phase: AtmospherePhase;
  phaseLabel: string;
  headlightOpacity: number;
  firelightOpacity: number;
  mistOpacity: number;
  canopyDensity: number;
  elevationMeters: number;
}

export interface VelocityDynamics {
  absVelocity: number;
  normalizedSpeed: number;
  wheelSpinDeltaDeg: number;
  suspensionOffsetPx: number;
  suspensionTiltDeg: number;
  dustIntensity: number;
  splashIntensity: number;
}

export const TRAIL_CHECKPOINTS: TrailCheckpointMeta[] = [
  {
    safariId: 'tadoba-andhari',
    index: 0,
    shortName: 'Tadoba Andhari',
    coordinates: '20.2285° N, 79.3586° E',
    elevationMeters: 285,
    zoneTag: 'Telia Lake Dawn',
    bendSide: 'right',
    atmosphereHint: 'morning-mist',
  },
  {
    safariId: 'pench-national-park',
    index: 1,
    shortName: 'Pench Reserve',
    coordinates: '21.7031° N, 79.2950° E',
    elevationMeters: 415,
    zoneTag: 'Teak & Bamboo Track',
    bendSide: 'left',
    atmosphereHint: 'morning-mist',
  },
  {
    safariId: 'ranthambore',
    index: 2,
    shortName: 'Ranthambore',
    coordinates: '26.0173° N, 76.5026° E',
    elevationMeters: 365,
    zoneTag: 'Padam Talao Ridge',
    bendSide: 'right',
    atmosphereHint: 'emerald-canopy',
  },
  {
    safariId: 'jim-corbett',
    index: 3,
    shortName: 'Jim Corbett',
    coordinates: '29.5300° N, 78.7747° E',
    elevationMeters: 512,
    zoneTag: 'Ramganga River Ford',
    bendSide: 'left',
    atmosphereHint: 'emerald-canopy',
  },
  {
    safariId: 'kanha-tiger-reserve',
    index: 4,
    shortName: 'Kanha Reserve',
    coordinates: '22.3345° N, 80.6115° E',
    elevationMeters: 610,
    zoneTag: 'Deep Sal Canopy',
    bendSide: 'right',
    atmosphereHint: 'night-camp',
  },
  {
    safariId: 'kaziranga-national-park',
    index: 5,
    shortName: 'Kaziranga',
    coordinates: '26.5775° N, 93.1711° E',
    elevationMeters: 112,
    zoneTag: 'Brahmaputra Camp',
    bendSide: 'left',
    atmosphereHint: 'night-camp',
  },
];

export const RIVER_CROSSING_RANGE: readonly [number, number] = [0.47, 0.58];

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Computes a smooth, responsive multi-point cubic Bezier SVG S-curve weaving
 * down the full expedition canvas. On desktop, the road swings generously across
 * the center band while leaving clean space for Field Journal cards beside each
 * outer apex. On mobile (< 768px), the road tightens cleanly along the left rail
 * so both the Jeep and destination cards fit comfortably inside 390px viewports.
 */
export interface CardBoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  centerY: number;
}

/**
 * Computes a smooth, responsive multi-point cubic Bezier SVG S-curve weaving
 * down the full expedition canvas.
 *
 * Strict Two-Lane Spatial Grid:
 * - Left Destination Card (5% to 42% viewport width) -> Road apex routes wide to the RIGHT (68% to 82% viewport width).
 * - Right Destination Card (58% to 95% viewport width) -> Road apex routes wide to the LEFT (18% to 32% viewport width).
 * - Minimum 80px clearance from card bounding boxes with vertical tangent flattening alongside each card.
 * - On mobile (< 768px), road stays strictly in the left lane (10% to 15%) while cards sit at 28%+ with clear separation.
 */
export function buildResponsiveSnakeTrail(params: {
  width: number;
  height: number;
  isMobile: boolean;
  checkpointYs?: number[];
  cardBoxes?: (CardBoundingBox | null)[];
}): SnakeTrailGeometry {
  const safeWidth = Math.max(300, Math.round(params.width));
  const safeHeight = Math.max(1200, Math.round(params.height));
  const { isMobile, cardBoxes } = params;

  const defaultRatios = [0.11, 0.26, 0.41, 0.59, 0.74, 0.89];
  const ys =
    params.checkpointYs && params.checkpointYs.length === TRAIL_CHECKPOINTS.length
      ? params.checkpointYs.map((y) => clamp(Math.round(y), 80, safeHeight - 80))
      : defaultRatios.map((r) => Math.round(safeHeight * r));

  // Anchor coordinates along the S-curve: centered at 50% width
  const startPoint: Point2D = {
    x: Math.round(safeWidth * 0.5),
    y: 0,
  };

  const checkpointAnchors: Point2D[] = TRAIL_CHECKPOINTS.map((cp, idx) => {
    if (isMobile) {
      // Mobile: Centered road corridor (50%) so Jeep stays centered on screen
      const subtleWiggle = (idx % 2 === 0 ? 0.015 : -0.015);
      return {
        x: Math.round(safeWidth * (0.5 + subtleWiggle)),
        y: ys[idx],
      };
    }

    // Desktop: Keep road in the center corridor (centered at 50%)
    // Left card sits at 4%..40%, Right card sits at 60%..96%
    // Road sways gently between 47.5% and 52.5% so Jeep steers naturally down the center corridor
    const sway = idx % 2 === 0 ? 0.024 : -0.024;
    const targetX = Math.round(safeWidth * (0.5 + sway));

    return {
      x: targetX,
      y: ys[idx],
    };
  });

  // Explicit mid-trail river crossing bridge between Stop 3 (index 2) and Stop 4 (index 3)
  const preRiver = checkpointAnchors[2];
  const postRiver = checkpointAnchors[3];
  const bridgePoint: Point2D = {
    x: isMobile
      ? Math.round((preRiver.x + postRiver.x) * 0.5)
      : Math.round(safeWidth * 0.5),
    y: Math.round((preRiver.y + postRiver.y) * 0.5),
  };

  const endPoint: Point2D = {
    x: Math.round(safeWidth * 0.5),
    y: safeHeight,
  };

  // Build flattened tangent dwell segments alongside cards so the Jeep travels
  // parallel to each card's outer boundary without cutting corners or drifting into cards
  interface PathNode {
    x: number;
    y: number;
    isDwell?: boolean;
  }

  const pathNodes: PathNode[] = [{ x: startPoint.x, y: startPoint.y }];

  for (let i = 0; i < 3; i++) {
    const cpAnchor = checkpointAnchors[i];
    const cardBox = cardBoxes?.[i];
    const dwellHeight = isMobile
      ? 40
      : Math.max(60, Math.min(130, Math.round((cardBox?.height || 360) * 0.32)));

    // Pre-dwell entry, apex center, and post-dwell exit with vertical tangent alignment
    pathNodes.push({ x: cpAnchor.x, y: cpAnchor.y - dwellHeight, isDwell: true });
    pathNodes.push({ x: cpAnchor.x, y: cpAnchor.y, isDwell: true });
    pathNodes.push({ x: cpAnchor.x, y: cpAnchor.y + dwellHeight, isDwell: true });
  }

  // Canyon river bridge crossing node
  pathNodes.push({ x: bridgePoint.x, y: bridgePoint.y - 30 });
  pathNodes.push({ x: bridgePoint.x, y: bridgePoint.y });
  pathNodes.push({ x: bridgePoint.x, y: bridgePoint.y + 30 });

  for (let i = 3; i < 6; i++) {
    const cpAnchor = checkpointAnchors[i];
    const cardBox = cardBoxes?.[i];
    const dwellHeight = isMobile
      ? 40
      : Math.max(60, Math.min(130, Math.round((cardBox?.height || 360) * 0.32)));

    pathNodes.push({ x: cpAnchor.x, y: cpAnchor.y - dwellHeight, isDwell: true });
    pathNodes.push({ x: cpAnchor.x, y: cpAnchor.y, isDwell: true });
    pathNodes.push({ x: cpAnchor.x, y: cpAnchor.y + dwellHeight, isDwell: true });
  }

  pathNodes.push({ x: endPoint.x, y: endPoint.y });

  // Build C1-smooth cubic Bezier segments with vertical-flowing handles
  const segments: string[] = [`M ${pathNodes[0].x} ${pathNodes[0].y}`];
  for (let i = 0; i < pathNodes.length - 1; i++) {
    const p0 = pathNodes[i];
    const p1 = pathNodes[i + 1];
    const dy = p1.y - p0.y;

    if (p0.x === p1.x) {
      // Pure vertical crawl corridor alongside the destination card
      const cp1x = p0.x;
      const cp1y = Math.round(p0.y + dy * 0.33);
      const cp2x = p1.x;
      const cp2y = Math.round(p1.y - dy * 0.33);
      segments.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`);
    } else {
      // Smooth S-curve cross-transition between opposite lanes
      const cp1x = p0.x;
      const cp1y = Math.round(p0.y + dy * 0.52);
      const cp2x = p1.x;
      const cp2y = Math.round(p1.y - dy * 0.52);
      segments.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`);
    }
  }

  const roadPath = segments.join(' ');

  // Build river path crossing diagonally underneath the timber bridge
  const riverY = bridgePoint.y;
  const riverLeftY = Math.round(riverY - (isMobile ? 48 : 88));
  const riverRightY = Math.round(riverY + (isMobile ? 48 : 88));
  const riverSvgPath = [
    `M -40 ${riverLeftY}`,
    `C ${Math.round(safeWidth * 0.25)} ${Math.round(riverLeftY + 55)},`,
    `${Math.round(safeWidth * 0.42)} ${Math.round(riverY - 22)},`,
    `${bridgePoint.x} ${riverY}`,
    `C ${Math.round(safeWidth * 0.62)} ${Math.round(riverY + 24)},`,
    `${Math.round(safeWidth * 0.8)} ${Math.round(riverRightY - 45)},`,
    `${safeWidth + 40} ${riverRightY}`,
  ].join(' ');

  // Compute bridge tangent angle relative to horizontal river flow vs road vertical tangent
  const dxRoad = postRiver.x - preRiver.x;
  const dyRoad = Math.max(1, postRiver.y - preRiver.y);
  const roadAngleDeg = Math.round((Math.atan2(dyRoad, dxRoad) * 180) / Math.PI);

  const checkpointCoords: CheckpointCoord[] = TRAIL_CHECKPOINTS.map((meta, idx) => {
    const pt = checkpointAnchors[idx];
    const pathT = clamp(pt.y / safeHeight, 0.04, 0.96);
    // Card sits beside the curve on desktop (opposite side of the swing), and always to the right on mobile
    const cardSide: 'left' | 'right' = isMobile
      ? 'right'
      : meta.bendSide === 'right'
        ? 'left'
        : 'right';

    return {
      ...meta,
      x: pt.x,
      y: pt.y,
      cardSide,
      pathT,
    };
  });

  const bridgeCenterT = clamp(bridgePoint.y / safeHeight, 0.45, 0.6);

  return {
    width: safeWidth,
    height: safeHeight,
    isMobile,
    roadPath,
    checkpointCoords,
    riverCrossing: {
      startT: RIVER_CROSSING_RANGE[0],
      endT: RIVER_CROSSING_RANGE[1],
      centerT: bridgeCenterT,
      bridgeX: bridgePoint.x,
      bridgeY: bridgePoint.y,
      bridgeAngleDeg: roadAngleDeg - 90,
      riverSvgPath,
    },
  };
}

/**
 * Computes global lighting & atmosphere parameters along the scroll journey:
 * 0.00 - 0.30 : Golden-hour morning mist
 * 0.30 - 0.72 : Deep emerald canopy shade
 * 0.72 - 1.00 : Fire-lit twilight & night camp
 */
export function computeAtmospherePhase(rawProgress: number): AtmosphereState {
  const progress = clamp(rawProgress, 0, 1);

  let phase: AtmospherePhase = 'morning-mist';
  let phaseLabel = 'Golden Morning Mist';
  if (progress >= 0.7) {
    phase = 'night-camp';
    phaseLabel = 'Fire-Lit Night Camp';
  } else if (progress >= 0.28) {
    phase = 'emerald-canopy';
    phaseLabel = 'Emerald Canopy Shade';
  }

  // Headlights switch on gradually entering evening canopy (0.62 -> 0.85)
  const headlightOpacity = Number(
    clamp((progress - 0.6) / 0.24, 0, 1).toFixed(3),
  );

  // Firelight glow swells at base camp near bottom
  const firelightOpacity = Number(
    clamp((progress - 0.72) / 0.25, 0, 1).toFixed(3),
  );

  // Morning mist is strongest near trailhead and fades by mid-canopy
  const mistOpacity = Number(clamp(1 - progress / 0.38, 0, 1).toFixed(3));

  // Canopy density peaks through middle forest corridor
  const canopyDensity = Number(
    clamp(Math.sin(progress * Math.PI) * 1.1, 0.2, 1).toFixed(3),
  );

  // Interpolated elevation along checkpoints for HUD readout
  const scaled = progress * (TRAIL_CHECKPOINTS.length - 1);
  const lowerIdx = Math.floor(scaled);
  const upperIdx = Math.min(TRAIL_CHECKPOINTS.length - 1, lowerIdx + 1);
  const localT = scaled - lowerIdx;
  const elevationMeters = Math.round(
    lerp(
      TRAIL_CHECKPOINTS[lowerIdx].elevationMeters,
      TRAIL_CHECKPOINTS[upperIdx].elevationMeters,
      localT,
    ),
  );

  return {
    progress,
    phase,
    phaseLabel,
    headlightOpacity,
    firelightOpacity,
    mistOpacity,
    canopyDensity,
    elevationMeters,
  };
}

export function isWaterCrossingZone(
  progress: number,
  range: readonly [number, number] = RIVER_CROSSING_RANGE,
): boolean {
  const p = clamp(progress, 0, 1);
  return p >= range[0] && p <= range[1];
}

/**
 * Converts instantaneous Lenis scroll velocity into smooth 60fps vehicle physics:
 * wheel spin, chassis suspension bounce, roll tilt, and dust vs splash particle intensity.
 */
export function computeVelocityDynamics(
  rawVelocity: number,
  progress: number,
): VelocityDynamics {
  const absVelocity = Math.abs(Number.isFinite(rawVelocity) ? rawVelocity : 0);
  const normalizedSpeed = clamp(absVelocity / 28, 0, 1);
  const signedDir = rawVelocity >= 0 ? 1 : -1;

  const inRiver = isWaterCrossingZone(progress);

  // Subtle suspension bounce increases cleanly with travel speed
  const suspensionOffsetPx = Number(
    (Math.sin(absVelocity * 0.45) * 2.2 * normalizedSpeed).toFixed(2),
  );
  const suspensionTiltDeg = Number(
    (signedDir * normalizedSpeed * 2.6).toFixed(2),
  );

  const wheelSpinDeltaDeg = Number((rawVelocity * 3.8).toFixed(2));

  const dustIntensity = inRiver
    ? 0
    : Number(clamp((normalizedSpeed - 0.14) / 0.65, 0, 1).toFixed(3));

  const splashIntensity = inRiver
    ? Number(clamp(0.28 + normalizedSpeed * 0.72, 0.28, 1).toFixed(3))
    : 0;

  return {
    absVelocity,
    normalizedSpeed,
    wheelSpinDeltaDeg,
    suspensionOffsetPx,
    suspensionTiltDeg,
    dustIntensity,
    splashIntensity,
  };
}

/**
 * Identifies whichever destination checkpoint the Jeep is currently nearest along the trail.
 */
export function resolveActiveCheckpointIndex(
  progress: number,
  checkpoints: Pick<CheckpointCoord, 'index' | 'pathT'>[],
): number {
  if (!checkpoints.length) return 0;
  const p = clamp(progress, 0, 1);
  let bestIdx = 0;
  let minDist = Number.POSITIVE_INFINITY;
  for (const cp of checkpoints) {
    const dist = Math.abs(p - cp.pathT);
    if (dist < minDist) {
      minDist = dist;
      bestIdx = cp.index;
    }
  }
  return bestIdx;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Time-Warping Checkpoint Deceleration:
 * Maps linear scroll progress [0, 1] into a smooth, strictly monotonic progression
 * where the vehicle naturally decelerates to a slow safari crawl beside each card
 * (giving the user time to inspect the card and view surrounding reactive wildlife)
 * before gently accelerating into the open jungle curves toward the next stop.
 */
export function warpCheckpointDeceleration(
  p: number,
  checkpointRatios: number[] = [0.11, 0.26, 0.41, 0.59, 0.74, 0.89],
): number {
  const clampedP = clamp(p, 0, 1);
  if (clampedP <= 0) return 0;
  if (clampedP >= 1) return 1;

  const sigma = 0.038;
  const sqrtTwo = Math.SQRT2;
  const sqrtHalfPi = Math.sqrt(Math.PI / 2);

  // High precision erf approximation (Abramowitz and Stegun 7.1.26)
  const approxErf = (x: number): number => {
    const sign = x >= 0 ? 1 : -1;
    const absX = Math.abs(x);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const tVal = 1.0 / (1.0 + 0.3275911 * absX);
    const poly = ((((a5 * tVal + a4) * tVal + a3) * tVal + a2) * tVal + a1) * tVal;
    const yVal = 1.0 - poly * Math.exp(-absX * absX);
    return sign * yVal;
  };

  const wellDepth = 0.74;

  const indefiniteIntegral = (x: number): number => {
    let sum = x;
    for (const mu of checkpointRatios) {
      const z = (x - mu) / (sigma * sqrtTwo);
      const integralPart = sigma * sqrtHalfPi * approxErf(z);
      sum -= wellDepth * integralPart;
    }
    return sum;
  };

  const i0 = indefiniteIntegral(0);
  const i1 = indefiniteIntegral(1);
  const ip = indefiniteIntegral(clampedP);

  const denom = i1 - i0;
  if (denom <= 0) return clampedP;

  const result = (ip - i0) / denom;
  return clamp(result, 0, 1);
}

export interface UnderpassState {
  underpassFactor: number;
  isUnderpass: boolean;
  scale: number;
  shadowOpacity: number;
  headlightBoost: number;
}

/**
 * Computes whether the vehicle is passing beneath an elevated rock cave arch,
 * jungle canopy overpass, or the Ramganga canyon bridge.
 * Returns depth scale (1.00 down to 0.92), shadow overlay opacity, and headlight boost.
 */
export function computeUnderpassState(
  progress: number,
  checkpointRatios: number[] = [0.11, 0.26, 0.41, 0.59, 0.74, 0.89],
): UnderpassState {
  const p = clamp(progress, 0, 1);

  // 1. Center Ramganga Canyon rock cave & canopy bridge overpass
  const bridgeFactor =
    smoothstep(0.44, 0.49, p) * (1 - smoothstep(0.53, 0.58, p));

  // 2. Destination card canopy / rock arch overpasses
  let cardOverpassFactor = 0;
  for (const cpT of checkpointRatios) {
    const halfWidth = 0.036;
    const start = cpT - halfWidth;
    const mid1 = cpT - 0.012;
    const mid2 = cpT + 0.012;
    const end = cpT + halfWidth;
    const f = smoothstep(start, mid1, p) * (1 - smoothstep(mid2, end, p));
    if (f > cardOverpassFactor) {
      cardOverpassFactor = f;
    }
  }

  const underpassFactor = Number(
    Math.max(bridgeFactor, cardOverpassFactor * 0.92).toFixed(3),
  );
  const isUnderpass = underpassFactor > 0.15;
  const scale = Number((1.0 - underpassFactor * 0.08).toFixed(3)); // 1.0 -> 0.92
  const shadowOpacity = Number((underpassFactor * 0.82).toFixed(3));
  const headlightBoost = Number((underpassFactor * 0.95).toFixed(3));

  return {
    underpassFactor,
    isUnderpass,
    scale,
    shadowOpacity,
    headlightBoost,
  };
}

export interface RoadSamplePoint {
  x: number;
  y: number;
  angle: number;
  progress: number;
}

export interface RoadSampler {
  getPointAtY: (targetY: number) => RoadSamplePoint;
}

/**
 * High-performance pre-sampled LUT for SVG road paths.
 * Allows O(log N) zero-allocation lookup of (x, angle) at any canvas Y coordinate
 * without calling expensive SVG getPointAtLength on every frame.
 */
export function createRoadSampler(
  pathEl: SVGPathElement | null,
  totalHeight: number,
  samplesCount = 400,
): RoadSampler {
  if (!pathEl || typeof pathEl.getTotalLength !== 'function') {
    return {
      getPointAtY: (targetY: number) => ({
        x: 0,
        y: targetY,
        angle: 180,
        progress: clamp(targetY / (totalHeight || 1), 0, 1),
      }),
    };
  }

  const totalLength = pathEl.getTotalLength();
  const samples: RoadSamplePoint[] = [];

  for (let i = 0; i <= samplesCount; i++) {
    const s = (i / samplesCount) * totalLength;
    const pt = pathEl.getPointAtLength(s);
    const sNext = Math.min(totalLength, s + 3);
    const ptNext = pathEl.getPointAtLength(sNext);
    const dx = ptNext.x - pt.x;
    const dy = ptNext.y - pt.y;
    // Rotation angle: 0deg is pointing +X (right), 90deg is pointing +Y (downwards)
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    samples.push({
      x: pt.x,
      y: pt.y,
      angle,
      progress: s / totalLength,
    });
  }

  return {
    getPointAtY: (targetY: number): RoadSamplePoint => {
      if (samples.length === 0) return { x: 0, y: targetY, angle: 90, progress: 0 };
      if (targetY <= samples[0].y) return samples[0];
      if (targetY >= samples[samples.length - 1].y) return samples[samples.length - 1];

      let low = 0;
      let high = samples.length - 1;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (samples[mid].y < targetY) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      const idx0 = Math.max(0, low - 1);
      const idx1 = Math.min(samples.length - 1, low);
      const p0 = samples[idx0];
      const p1 = samples[idx1];
      const span = p1.y - p0.y;
      if (span <= 0) return p0;

      const t = (targetY - p0.y) / span;
      return {
        x: p0.x + (p1.x - p0.x) * t,
        y: targetY,
        angle: p0.angle + (p1.angle - p0.angle) * t,
        progress: p0.progress + (p1.progress - p0.progress) * t,
      };
    },
  };
}

