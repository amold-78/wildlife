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
export function buildResponsiveSnakeTrail(params: {
  width: number;
  height: number;
  isMobile: boolean;
  checkpointYs?: number[];
}): SnakeTrailGeometry {
  const safeWidth = Math.max(300, Math.round(params.width));
  const safeHeight = Math.max(1200, Math.round(params.height));
  const { isMobile } = params;

  const defaultRatios = [0.11, 0.26, 0.41, 0.59, 0.74, 0.89];
  const ys =
    params.checkpointYs && params.checkpointYs.length === TRAIL_CHECKPOINTS.length
      ? params.checkpointYs.map((y) => clamp(Math.round(y), 80, safeHeight - 80))
      : defaultRatios.map((r) => Math.round(safeHeight * r));

  // Anchor coordinates along the S-curve
  const startPoint: Point2D = {
    x: isMobile ? Math.round(safeWidth * 0.13) : Math.round(safeWidth * 0.5),
    y: 0,
  };

  const checkpointAnchors: Point2D[] = TRAIL_CHECKPOINTS.map((cp, idx) => {
    if (isMobile) {
      // Tight S-wave along the left 9%..17% corridor so cards on the right have ample readable width
      const xRatio = cp.bendSide === 'right' ? 0.17 : 0.09;
      return {
        x: Math.round(safeWidth * xRatio),
        y: ys[idx],
      };
    }

    // Desktop sweeping S-curve leaving clear alternate card room on opposite side
    const xRatio = cp.bendSide === 'right' ? 0.65 : 0.35;
    return {
      x: Math.round(safeWidth * xRatio),
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
    x: isMobile ? Math.round(safeWidth * 0.13) : Math.round(safeWidth * 0.5),
    y: safeHeight,
  };

  // Assemble ordered nodes through start -> 0 -> 1 -> 2 -> bridge -> 3 -> 4 -> 5 -> end
  const waypoints: Point2D[] = [
    startPoint,
    checkpointAnchors[0],
    checkpointAnchors[1],
    checkpointAnchors[2],
    bridgePoint,
    checkpointAnchors[3],
    checkpointAnchors[4],
    checkpointAnchors[5],
    endPoint,
  ];

  // Build C1-smooth cubic Bezier segments with vertical-flowing handles at bends
  const segments: string[] = [`M ${waypoints[0].x} ${waypoints[0].y}`];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p0 = waypoints[i];
    const p1 = waypoints[i + 1];
    const dy = p1.y - p0.y;
    const cp1x = p0.x;
    const cp1y = Math.round(p0.y + dy * 0.52);
    const cp2x = p1.x;
    const cp2y = Math.round(p1.y - dy * 0.52);
    segments.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`);
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
