import { useCallback, useMemo, useRef, useState } from 'react';
import type { SnakeTrailGeometry } from '../utils/jungleTrailEngine';
import type { WildlifeCanvasController } from '../components/jungle/wildlife/wildlifeTypes';
import {
  buildWildlifeHabitatAnchors,
  evaluateProximityEcosystem,
  type JeepPose,
  type ProximityFrameSnapshot,
  type WildlifeAnchorConfig,
} from '../utils/jeepProximityEngine';

export interface PassengerTrackingRefs {
  coPilotCameraRef: React.RefObject<SVGGElement | null>;
  kidBinocularRef: React.RefObject<SVGGElement | null>;
  kidPointerRef: React.RefObject<SVGGElement | null>;
}

export interface UseJeepProximityReturn {
  anchors: WildlifeAnchorConfig[];
  registerAnimalNode: (id: string) => (node: HTMLElement | null) => void;
  registerParticleNode: (id: string) => (node: HTMLElement | null) => void;
  registerGlowNode: (id: string) => (node: HTMLElement | null) => void;
  registerAnimalController: (id: string) => (controller: WildlifeCanvasController | null) => void;
  updateProximityFrame: (jeep: JeepPose, timeSec: number, reducedMotion: boolean) => void;
  telemetry: {
    nearestAnimal: ProximityFrameSnapshot['nearestAnimal'];
    checkpointSightings: ProximityFrameSnapshot['checkpointSightings'];
  };
}

/**
 * Spatial tracker hook (`useJeepProximity`) that broadcasts the Jeep's normalized path
 * progress and (x, y) coordinates at 60fps to every surrounding wildlife character
 * and updates passenger head/camera tracking without 60fps React re-render overhead.
 */
export function useJeepProximity(
  geometry: SnakeTrailGeometry,
  passengerRefs?: PassengerTrackingRefs,
): UseJeepProximityReturn {
  const anchors = useMemo(() => buildWildlifeHabitatAnchors(geometry), [geometry]);

  const animalNodesRef = useRef<Record<string, HTMLElement | null>>({});
  const particleNodesRef = useRef<Record<string, HTMLElement | null>>({});
  const glowNodesRef = useRef<Record<string, HTMLElement | null>>({});
  const animalControllersRef = useRef<Record<string, WildlifeCanvasController | null>>({});
  const lastTelemetrySyncRef = useRef<number>(0);

  const [telemetry, setTelemetry] = useState<UseJeepProximityReturn['telemetry']>(() => {
    const initial = evaluateProximityEcosystem(
      anchors,
      {
        x: geometry.width * 0.5,
        y: 80,
        headingDeg: 90,
        progress: 0,
        velocity: 0,
      },
      0,
      false,
    );
    return {
      nearestAnimal: initial.nearestAnimal,
      checkpointSightings: initial.checkpointSightings,
    };
  });

  const registerAnimalNode = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      animalNodesRef.current[id] = node;
    },
    [],
  );

  const registerAnimalController = useCallback(
    (id: string) => (controller: WildlifeCanvasController | null) => {
      if (controller) {
        animalControllersRef.current[id] = controller;
      } else {
        delete animalControllersRef.current[id];
      }
    },
    [],
  );

  const registerParticleNode = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      particleNodesRef.current[id] = node;
    },
    [],
  );

  const registerGlowNode = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      glowNodesRef.current[id] = node;
    },
    [],
  );

  const updateProximityFrame = useCallback(
    (jeep: JeepPose, timeSec: number, reducedMotion: boolean) => {
      const snapshot = evaluateProximityEcosystem(anchors, jeep, timeSec, reducedMotion);

      // Mutate wildlife character DOM nodes and notify procedural canvas controllers directly at 60fps
      const isStopped = Math.abs(jeep.velocity) < 0.05;

      for (const state of snapshot.animals) {
        const isAtStop = state.proximityFactor > 0.36 && isStopped;
        const ctrl = animalControllersRef.current[state.id];
        if (ctrl) {
          ctrl.onJeepUpdate({
            proximityFactor: state.proximityFactor,
            phase: state.phase,
            distancePx: state.distancePx,
            velocity: jeep.velocity,
            isStopped,
            isAtStop,
          });
        }

        const el = animalNodesRef.current[state.id];
        if (el) {
          el.style.transform = `translate3d(${state.offsetX}px, ${state.offsetY}px, 0) rotate(${state.rotationDeg}deg) scale(${state.scale})`;
          el.setAttribute('data-proximity-phase', state.phase);
        }

        const particleEl = particleNodesRef.current[state.id];
        if (particleEl) {
          particleEl.style.opacity = String(state.particleIntensity);
          particleEl.style.transform = `scale(${0.85 + state.particleIntensity * 0.35})`;
        }

        const glowEl = glowNodesRef.current[state.id];
        if (glowEl) {
          glowEl.style.opacity = String(state.headlightGlow);
        }
      }

      // Rotate Jeep passengers' camera, binoculars, and pointing arm toward the nearest animal
      const lookDeg = snapshot.nearestAnimal ? snapshot.nearestAnimal.lookAngleDeg : 0;
      if (passengerRefs?.coPilotCameraRef.current) {
        passengerRefs.coPilotCameraRef.current.setAttribute(
          'transform',
          `rotate(${(lookDeg * 0.65).toFixed(1)}, 43.5, 21.5)`,
        );
      }
      if (passengerRefs?.kidBinocularRef.current) {
        passengerRefs.kidBinocularRef.current.setAttribute(
          'transform',
          `rotate(${(lookDeg * 0.8).toFixed(1)}, 24, 35)`,
        );
      }
      if (passengerRefs?.kidPointerRef.current) {
        passengerRefs.kidPointerRef.current.setAttribute(
          'transform',
          `rotate(${(lookDeg * 0.75).toFixed(1)}, 24, 22.5)`,
        );
      }

      // Sync discrete badge telemetry smoothly without re-render thrashing:
      // Immediate when an animal triggers alert/settle, or when stationary/slowed down, or throttled to 1.2s during fast scroll
      const now = timeSec * 1000;
      const isSlowOrStopped = Math.abs(jeep.velocity) < 0.8;
      const timeSinceLastSync = now - lastTelemetrySyncRef.current;
      const phaseChanged = snapshot.animals.some(
        (a) => a.phase === 'alert' && a.distanceMeters < a.alertRadiusPx * 0.7,
      );

      if (
        (phaseChanged && timeSinceLastSync > 250) ||
        (isSlowOrStopped && timeSinceLastSync > 350) ||
        timeSinceLastSync > 1200
      ) {
        lastTelemetrySyncRef.current = now;
        setTelemetry({
          nearestAnimal: snapshot.nearestAnimal,
          checkpointSightings: snapshot.checkpointSightings,
        });
      }
    },
    [anchors, passengerRefs],
  );

  return {
    anchors,
    registerAnimalNode,
    registerParticleNode,
    registerGlowNode,
    registerAnimalController,
    updateProximityFrame,
    telemetry,
  };
}
