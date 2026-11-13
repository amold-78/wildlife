import { clamp, lerp, type Point2D, type SnakeTrailGeometry } from './jungleTrailEngine';

export type WildlifeSpeciesId =
  | 'bengal-tiger'
  | 'spotted-deer'
  | 'macaw-pair'
  | 'langur-monkey'
  | 'river-elephant'
  | 'canopy-leopard'
  | 'one-horned-rhino';

export type ProximityPhase = 'idle' | 'alert' | 'settle';

export interface WildlifeAnchorConfig {
  id: string;
  checkpointIndex: number;
  species: WildlifeSpeciesId;
  name: string;
  idleStatus: string;
  alertStatus: string;
  settleStatus: string;
  anchorX: number;
  anchorY: number;
  alertRadiusPx: number;
  side: 'left' | 'right';
  perchedOnCard?: boolean;
}

export interface WildlifeKinematicState {
  id: string;
  species: WildlifeSpeciesId;
  phase: ProximityPhase;
  statusLabel: string;
  distancePx: number;
  proximityFactor: number;
  offsetX: number;
  offsetY: number;
  rotationDeg: number;
  scale: number;
  particleIntensity: number;
  foliageShakeDeg: number;
  headlightGlow: number;
}

export interface JeepPose {
  x: number;
  y: number;
  headingDeg: number;
  progress: number;
  velocity: number;
}

export interface ProximityFrameSnapshot {
  jeep: JeepPose;
  animals: WildlifeKinematicState[];
  nearestAnimal: {
    id: string;
    name: string;
    species: WildlifeSpeciesId;
    distancePx: number;
    phase: ProximityPhase;
    statusLabel: string;
    lookAngleDeg: number;
    worldX: number;
    worldY: number;
  } | null;
  checkpointSightings: Record<
    number,
    {
      species: WildlifeSpeciesId;
      name: string;
      phase: ProximityPhase;
      statusLabel: string;
      distanceMeters: number;
      proximityFactor: number;
      foliageShakeDeg: number;
    }
  >;
}

/**
 * Euclidean distance between two 2D points.
 */
export function euclideanDistance(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/**
 * Smooth Hermite interpolation (smoothstep) on [0, 1].
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Computes the relative look angle (-65°..+65°) from the Jeep's current heading
 * toward a target wildlife coordinate so passengers' cameras, binoculars, and
 * pointing arms track the animal as the Jeep drives past.
 */
export function computePassengerLookAngle(
  jeepPos: Point2D,
  jeepHeadingDeg: number,
  targetPos: Point2D,
): number {
  const dx = targetPos.x - jeepPos.x;
  const dy = targetPos.y - jeepPos.y;
  const worldAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  let delta = ((worldAngleDeg - jeepHeadingDeg + 540) % 360) - 180;
  if (Number.isNaN(delta)) delta = 0;
  return Number(clamp(delta, -65, 65).toFixed(2));
}

/**
 * Builds deterministic spatial anchors in the negative space surrounding
 * each destination checkpoint card and bend along the snake trail.
 */
export function buildWildlifeHabitatAnchors(
  geometry: SnakeTrailGeometry,
): WildlifeAnchorConfig[] {
  const { width, isMobile, checkpointCoords, riverCrossing } = geometry;
  const baseRadius = isMobile ? 275 : 420;
  const anchors: WildlifeAnchorConfig[] = [];

  for (const cp of checkpointCoords) {
    // Card sits on `cp.cardSide`, while road bend apex sits at `cp.x`
    // On desktop, negative space sits opposite the card (`bendOuterX`); on mobile, in the open clearing above each card
    const outerClearancePx = Math.max(210, Math.round(width * 0.165));
    const bendOuterX = isMobile
      ? Math.round(width * 0.42)
      : cp.bendSide === 'right'
        ? Math.min(width - 115, cp.x + outerClearancePx)
        : Math.max(115, cp.x - outerClearancePx);

    const bendAnchorY = isMobile ? cp.y - 208 : cp.y - 12;

    const cardMarginX = isMobile
      ? Math.round(width * 0.84)
      : cp.cardSide === 'left'
        ? Math.round(width * 0.22)
        : Math.round(width * 0.78);

    if (cp.index === 0) {
      // Stop 0: Tadoba Andhari: Royal Bengal Tiger stepping out from lush Monstera foliage + Vibrant Macaws taking flight from card frame
      anchors.push({
        id: 'tadoba-tiger',
        checkpointIndex: 0,
        species: 'bengal-tiger',
        name: 'Royal Bengal Tiger',
        idleStatus: 'Stepping from Monstera foliage',
        alertStatus: 'Emerging beside trail bend',
        settleStatus: 'Resting by Telia bank',
        anchorX: bendOuterX,
        anchorY: bendAnchorY,
        alertRadiusPx: baseRadius,
        side: cp.bendSide,
      });
      const perchedSide = isMobile ? 'left' : cp.cardSide;
      anchors.push({
        id: 'tadoba-macaws',
        checkpointIndex: 0,
        species: 'macaw-pair',
        name: 'Scarlet Macaw Pair',
        idleStatus: 'Perched on card frame',
        alertStatus: 'Taking flight into canopy',
        settleStatus: 'Soaring in golden sunbeams',
        anchorX: cardMarginX,
        anchorY: isMobile ? cp.y - 142 : cp.y - 125,
        alertRadiusPx: baseRadius * 0.92,
        side: perchedSide,
        perchedOnCard: true,
      });
    } else if (cp.index === 1) {
      const perchedSide = isMobile ? 'left' : cp.cardSide;
      // Stop 1: Pench: Spotted Chital Deer bounding across grassy margin + Langur monkey swinging on vines
      anchors.push({
        id: 'pench-deer',
        checkpointIndex: 1,
        species: 'spotted-deer',
        name: 'Spotted Chital Herd',
        idleStatus: 'Grazing grassy margin',
        alertStatus: 'Bounding across grassy margin',
        settleStatus: 'Watching from deep ferns',
        anchorX: bendOuterX,
        anchorY: bendAnchorY,
        alertRadiusPx: baseRadius,
        side: cp.bendSide,
      });
      anchors.push({
        id: 'pench-monkey',
        checkpointIndex: 1,
        species: 'langur-monkey',
        name: 'Canopy Langur Troop',
        idleStatus: 'Hanging from liana vine',
        alertStatus: 'Swinging across trail gap',
        settleStatus: 'Perched on teak bough',
        anchorX: cardMarginX,
        anchorY: isMobile ? cp.y - 138 : cp.y - 110,
        alertRadiusPx: baseRadius * 0.95,
        side: perchedSide,
        perchedOnCard: true,
      });
    } else if (cp.index === 2) {
      const perchedSide = isMobile ? 'left' : cp.cardSide;
      // Stop 2: Ranthambore: Tiger stepping from Monstera foliage + Vibrant Macaws taking flight from card frame
      anchors.push({
        id: 'ranthambore-tiger',
        checkpointIndex: 2,
        species: 'bengal-tiger',
        name: 'Padam Talao Tigress',
        idleStatus: 'Stepping from Monstera leaves',
        alertStatus: 'Walking parallel to 4x4 Jeep',
        settleStatus: 'Poised beside lake ridge',
        anchorX: bendOuterX,
        anchorY: bendAnchorY,
        alertRadiusPx: baseRadius,
        side: cp.bendSide,
      });
      anchors.push({
        id: 'ranthambore-macaws',
        checkpointIndex: 2,
        species: 'macaw-pair',
        name: 'Vibrant Macaw Pair',
        idleStatus: 'Perched on card frame',
        alertStatus: 'Taking flight over reserve',
        settleStatus: 'Gliding over banyan crown',
        anchorX: cardMarginX,
        anchorY: isMobile ? cp.y - 142 : cp.y - 128,
        alertRadiusPx: baseRadius * 0.9,
        side: perchedSide,
        perchedOnCard: true,
      });
    } else if (cp.index === 3) {
      // Stop 3: Jim Corbett & Ramganga Ford: Elephants splashing in shallow river crossing + Deer bounding on grassy bank
      anchors.push({
        id: 'corbett-elephant',
        checkpointIndex: 3,
        species: 'river-elephant',
        name: 'Ramganga Tusker & Calf',
        idleStatus: 'Wading in shallow river crossing',
        alertStatus: 'Splashing in river shallows',
        settleStatus: 'Bathing in Ramganga current',
        anchorX: isMobile
          ? Math.round(width * 0.68)
          : Math.round(width * 0.76),
        anchorY: isMobile
          ? Math.round(riverCrossing.bridgeY - 22)
          : Math.round(riverCrossing.bridgeY + 38),
        alertRadiusPx: baseRadius * 1.15,
        side: 'right',
      });
      anchors.push({
        id: 'corbett-deer',
        checkpointIndex: 3,
        species: 'spotted-deer',
        name: 'Dhikala Chital Stag',
        idleStatus: 'Grazing river margin',
        alertStatus: 'Bounding across grassy margin',
        settleStatus: 'Sheltered in Sal thicket',
        anchorX: bendOuterX,
        anchorY: bendAnchorY,
        alertRadiusPx: baseRadius * 0.9,
        side: cp.bendSide,
      });
    } else if (cp.index === 4) {
      const perchedSide = isMobile ? 'left' : cp.cardSide;
      // Stop 4: Kanha: Canopy Leopard emerging into headlight cone + Vine-swinging Langur
      anchors.push({
        id: 'kanha-leopard',
        checkpointIndex: 4,
        species: 'canopy-leopard',
        name: 'Mukki Rosette Leopard',
        idleStatus: 'Camouflaged in Sal shadows',
        alertStatus: 'Emerging along road bend',
        settleStatus: 'Observing from rocky ledge',
        anchorX: bendOuterX,
        anchorY: bendAnchorY,
        alertRadiusPx: baseRadius,
        side: cp.bendSide,
      });
      anchors.push({
        id: 'kanha-monkey',
        checkpointIndex: 4,
        species: 'langur-monkey',
        name: 'Sentinel Langur',
        idleStatus: 'Scanning Sal canopy',
        alertStatus: 'Swinging & shaking vines',
        settleStatus: 'Settled on high branch',
        anchorX: cardMarginX,
        anchorY: isMobile ? cp.y - 138 : cp.y - 115,
        alertRadiusPx: baseRadius * 0.92,
        side: perchedSide,
        perchedOnCard: true,
      });
    } else if (cp.index === 5) {
      // Stop 5: Kaziranga: Great One-Horned Rhino + Twilight Wetland Birds
      anchors.push({
        id: 'kaziranga-rhino',
        checkpointIndex: 5,
        species: 'one-horned-rhino',
        name: 'Great One-Horned Rhino',
        idleStatus: 'Grazing elephant grass',
        alertStatus: 'Stepping into headlight beam',
        settleStatus: 'Guarding wetland pool',
        anchorX: bendOuterX,
        anchorY: bendAnchorY,
        alertRadiusPx: baseRadius,
        side: cp.bendSide,
      });
    }
  }

  return anchors;
}

/**
 * Evaluates the real-time 3-state proximity machine (`idle` -> `alert` -> `settle`)
 * for a single wildlife character based on Euclidean distance to the Jeep.
 */
export function evaluateWildlifeKinematics(
  anchor: WildlifeAnchorConfig,
  jeep: JeepPose,
  timeSec: number,
  reducedMotion = false,
): WildlifeKinematicState {
  const dist = euclideanDistance(
    { x: jeep.x, y: jeep.y },
    { x: anchor.anchorX, y: anchor.anchorY },
  );

  const radius = Math.max(120, anchor.alertRadiusPx);
  const rawProximity = clamp(1 - dist / radius, 0, 1);
  const proximityFactor = Number(smoothstep(0, 1, rawProximity).toFixed(3));

  // Determine 3-state machine phase:
  // - 'alert' when inside proximity threshold
  // - 'settle' when Jeep has driven past the anchor vertically beyond settle threshold
  // - 'idle' when Jeep is still approaching from above or far away
  let phase: ProximityPhase = 'idle';
  if (dist <= radius) {
    phase = 'alert';
  } else if (jeep.y > anchor.anchorY + radius * 0.55) {
    phase = 'settle';
  }

  const statusLabel =
    phase === 'alert'
      ? anchor.alertStatus
      : phase === 'settle'
        ? anchor.settleStatus
        : anchor.idleStatus;

  if (reducedMotion) {
    return {
      id: anchor.id,
      species: anchor.species,
      phase,
      statusLabel,
      distancePx: Math.round(dist),
      proximityFactor,
      offsetX: 0,
      offsetY: 0,
      rotationDeg: 0,
      scale: 1,
      particleIntensity: 0,
      foliageShakeDeg: 0,
      headlightGlow: jeep.progress > 0.6 && phase === 'alert' ? proximityFactor : 0,
    };
  }

  const dirSign = anchor.side === 'right' ? 1 : -1;
  let offsetX = 0;
  let offsetY = 0;
  let rotationDeg = 0;
  let scale = 1;
  let particleIntensity = 0;
  let foliageShakeDeg = 0;

  switch (anchor.species) {
    case 'bengal-tiger':
    case 'canopy-leopard': {
      // State 1 (Idle): Slow stealthy pacing behind tall grass
      // State 2 (Alert): Emerges from negative space, walks parallel along the road curve tracking the Jeep, pauses beside card
      // State 3 (Settle): Rests on the ridge watching the trail
      if (phase === 'idle') {
        offsetX = Math.sin(timeSec * 1.4 + anchor.checkpointIndex) * 10;
        offsetY = Math.cos(timeSec * 0.9) * 3;
        rotationDeg = Math.sin(timeSec * 1.4) * 3;
      } else if (phase === 'alert') {
        // Step slightly toward the road bend while staying in the outer clearing
        const stepInward = -dirSign * lerp(0, 18, proximityFactor);
        const trackY = clamp((jeep.y - anchor.anchorY) * 0.28, -32, 36);
        offsetX = stepInward;
        offsetY = trackY;
        rotationDeg = clamp((jeep.y - anchor.anchorY) * 0.06 * dirSign, -10, 10);
        scale = Number(lerp(1, 1.08, proximityFactor).toFixed(3));
        foliageShakeDeg = Number((Math.sin(timeSec * 9) * 4 * proximityFactor).toFixed(2));
      } else {
        offsetX = -dirSign * 10;
        offsetY = 18;
        rotationDeg = 0;
        scale = 1.02;
      }
      break;
    }

    case 'spotted-deer': {
      // State 1 (Idle): Grazing gently in margin
      // State 2 (Alert): Lifts head, startles, and bounds laterally into deeper foliage away from the road
      // State 3 (Settle): Sheltered in deep fern margin
      if (phase === 'idle') {
        offsetX = Math.sin(timeSec * 1.1) * 4;
        offsetY = Math.abs(Math.sin(timeSec * 1.8)) * 3;
      } else if (phase === 'alert') {
        const boundProgress = smoothstep(0.12, 0.88, proximityFactor);
        offsetX = dirSign * lerp(0, 44, boundProgress);
        offsetY = -Math.sin(boundProgress * Math.PI) * 24 - boundProgress * 10;
        rotationDeg = dirSign * Math.sin(boundProgress * Math.PI) * -14;
        scale = Number(lerp(1, 1.06, proximityFactor).toFixed(3));
        particleIntensity = Number(proximityFactor.toFixed(3));
        foliageShakeDeg = Number((Math.sin(timeSec * 14) * 7 * proximityFactor).toFixed(2));
      } else {
        offsetX = dirSign * 34;
        offsetY = -8;
        scale = 0.96;
      }
      break;
    }

    case 'macaw-pair': {
      // State 1 (Idle): Perched on top frame of destination card preening feathers
      // State 2 (Alert): Takes flight diagonally upward into canopy away from road
      // State 3 (Settle): Perched in upper canopy bough
      if (phase === 'idle') {
        offsetY = Math.sin(timeSec * 2.4) * 2.5;
        rotationDeg = Math.sin(timeSec * 1.6) * 4;
      } else if (phase === 'alert') {
        const flightT = smoothstep(0.08, 0.92, proximityFactor);
        offsetX = dirSign * lerp(0, 32, flightT);
        offsetY = -lerp(0, 56, flightT) + Math.sin(timeSec * 16) * 4;
        rotationDeg = dirSign * lerp(0, 18, flightT);
        scale = Number(lerp(1, 1.12, flightT).toFixed(3));
        particleIntensity = Number(clamp(proximityFactor * 1.2, 0, 1).toFixed(3));
      } else {
        offsetX = dirSign * 24;
        offsetY = -36;
        scale = 0.96;
      }
      break;
    }

    case 'langur-monkey': {
      // State 1 (Idle): Hanging from canopy vines beside card text
      // State 2 (Alert): Swings along canopy vine above card, shaking foliage layers
      // State 3 (Settle): Rests on upper vine branch
      if (phase === 'idle') {
        rotationDeg = Math.sin(timeSec * 1.8) * 6;
        offsetX = Math.sin(timeSec * 1.8) * 5;
      } else if (phase === 'alert') {
        const swingArc = Math.sin(proximityFactor * Math.PI);
        offsetX = dirSign * lerp(0, 28, proximityFactor);
        offsetY = -swingArc * 18;
        rotationDeg = dirSign * Math.sin(timeSec * 8) * 16 * proximityFactor;
        scale = Number(lerp(1, 1.08, proximityFactor).toFixed(3));
        foliageShakeDeg = Number((Math.sin(timeSec * 15) * 9 * proximityFactor).toFixed(2));
        particleIntensity = Number((proximityFactor * 0.85).toFixed(3));
      } else {
        offsetX = dirSign * 18;
        offsetY = -6;
      }
      break;
    }

    case 'river-elephant': {
      // State 1 (Idle): Wading calmly in East Ramganga shallows
      // State 2 (Alert): Wades along the river channel and sprays water mist arc
      // State 3 (Settle): Bathing peacefully in river current
      if (phase === 'idle') {
        offsetX = Math.sin(timeSec * 0.9) * 5;
        offsetY = Math.cos(timeSec * 1.2) * 2.5;
      } else if (phase === 'alert') {
        offsetX = -dirSign * lerp(0, 18, proximityFactor);
        offsetY = lerp(0, -10, proximityFactor);
        rotationDeg = -dirSign * lerp(0, 5, proximityFactor);
        scale = Number(lerp(1, 1.08, proximityFactor).toFixed(3));
        particleIntensity = Number(clamp(proximityFactor * 1.25, 0, 1).toFixed(3));
      } else {
        offsetX = -dirSign * 10;
        offsetY = -4;
      }
      break;
    }

    case 'one-horned-rhino': {
      // State 1 (Idle): Grazing tall Kaziranga elephant grass
      // State 2 (Alert): Lifts armored head and steps into Jeep headlight glow in outer clearing
      // State 3 (Settle): Watching quietly beside twilight camp pool
      if (phase === 'idle') {
        offsetX = Math.sin(timeSec * 0.8) * 4;
      } else if (phase === 'alert') {
        offsetX = -dirSign * lerp(0, 16, proximityFactor);
        offsetY = lerp(0, -8, proximityFactor);
        rotationDeg = -dirSign * lerp(0, 5, proximityFactor);
        scale = Number(lerp(1, 1.08, proximityFactor).toFixed(3));
        foliageShakeDeg = Number((Math.sin(timeSec * 10) * 5 * proximityFactor).toFixed(2));
      } else {
        offsetX = -dirSign * 10;
      }
      break;
    }
  }

  // Dynamic headlight illumination in dusk/night sections (progress >= 0.56)
  const nightFactor = clamp((jeep.progress - 0.56) / 0.28, 0, 1);
  const headlightGlow = Number((nightFactor * proximityFactor).toFixed(3));

  return {
    id: anchor.id,
    species: anchor.species,
    phase,
    statusLabel,
    distancePx: Math.round(dist),
    proximityFactor,
    offsetX: Number(offsetX.toFixed(2)),
    offsetY: Number(offsetY.toFixed(2)),
    rotationDeg: Number(rotationDeg.toFixed(2)),
    scale,
    particleIntensity,
    foliageShakeDeg,
    headlightGlow,
  };
}

/**
 * Evaluates the entire ecosystem frame for all anchored animals and summarizes
 * the closest active wildlife target for Jeep passenger head/camera tracking
 * plus per-checkpoint sighting telemetry.
 */
export function evaluateProximityEcosystem(
  anchors: WildlifeAnchorConfig[],
  jeep: JeepPose,
  timeSec: number,
  reducedMotion = false,
): ProximityFrameSnapshot {
  const animals: WildlifeKinematicState[] = [];
  const checkpointSightings: ProximityFrameSnapshot['checkpointSightings'] = {};

  let nearest: ProximityFrameSnapshot['nearestAnimal'] = null;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const anchor of anchors) {
    const state = evaluateWildlifeKinematics(anchor, jeep, timeSec, reducedMotion);
    animals.push(state);

    const worldX = anchor.anchorX + state.offsetX;
    const worldY = anchor.anchorY + state.offsetY;

    if (state.distancePx < minDistance) {
      minDistance = state.distancePx;
      nearest = {
        id: anchor.id,
        name: anchor.name,
        species: anchor.species,
        distancePx: state.distancePx,
        phase: state.phase,
        statusLabel: state.statusLabel,
        lookAngleDeg: computePassengerLookAngle(
          { x: jeep.x, y: jeep.y },
          jeep.headingDeg,
          { x: worldX, y: worldY },
        ),
        worldX,
        worldY,
      };
    }

    // Track primary animal per checkpoint (prefer non-perched apex animal or highest proximity)
    const existing = checkpointSightings[anchor.checkpointIndex];
    if (!existing || !anchor.perchedOnCard || state.proximityFactor > existing.proximityFactor) {
      // Convert canvas pixel distance into realistic field meters (12m .. 95m)
      const distanceMeters = clamp(Math.round(state.distancePx * 0.14), 12, 120);
      checkpointSightings[anchor.checkpointIndex] = {
        species: anchor.species,
        name: anchor.name,
        phase: state.phase,
        statusLabel: state.statusLabel,
        distanceMeters,
        proximityFactor: state.proximityFactor,
        foliageShakeDeg: state.foliageShakeDeg,
      };
    }
  }

  return {
    jeep,
    animals,
    nearestAnimal: nearest,
    checkpointSightings,
  };
}
