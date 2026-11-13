import React, { useState, useRef, useCallback } from 'react';
import { SpatialWildlifeContext } from './SpatialWildlifeContext';

/**
 * SpatialWildlifeProvider
 * High-performance 60fps spatial proximity tracker.
 * Animals register their world coordinates and alert radius.
 * The central physics loop broadcasts the Jeep's current (x, y) coordinates,
 * updating animal proximity states (IDLE, ALERT, SCATTER, SETTLE) without lag.
 */
export default function SpatialWildlifeProvider({ children }) {
  const animalsRef = useRef(new Map());
  const [nearestAlertAnimal, setNearestAlertAnimal] = useState(null);

  const registerAnimal = useCallback((id, data) => {
    animalsRef.current.set(id, {
      ...data,
      state: 'IDLE',
      dist: 9999
    });

    return () => {
      animalsRef.current.delete(id);
    };
  }, []);

  const updateProximity = useCallback((jeepX, jeepY, scrollVelocity) => {
    let closestAlert = null;
    let minAlertDist = 9999;

    animalsRef.current.forEach((animal, id) => {
      const dx = jeepX - animal.x;
      const dy = jeepY - animal.y;
      const dist = Math.hypot(dx, dy);
      animal.dist = dist;

      const alertRadius = animal.alertRadius || 420;
      const scatterRadius = animal.scatterRadius || 240;

      let nextState = 'IDLE';

      if (dist < scatterRadius) {
        nextState = 'SCATTER';
      } else if (dist < alertRadius) {
        nextState = 'ALERT';
      } else if (dist < alertRadius * 1.3 && animal.state !== 'IDLE') {
        nextState = 'SETTLE';
      } else {
        nextState = 'IDLE';
      }

      if (animal.state !== nextState) {
        animal.state = nextState;
        if (animal.onStateChange) {
          animal.onStateChange(nextState, dist, { dx, dy, scrollVelocity });
        }
      }

      if ((nextState === 'ALERT' || nextState === 'SCATTER') && dist < minAlertDist) {
        minAlertDist = dist;
        closestAlert = {
          id,
          x: animal.x,
          y: animal.y,
          dx,
          dy,
          dist,
          type: animal.type
        };
      }
    });

    setNearestAlertAnimal(closestAlert);
  }, []);

  return (
    <SpatialWildlifeContext.Provider
      value={{
        registerAnimal,
        updateProximity,
        nearestAlertAnimal
      }}
    >
      {children}
    </SpatialWildlifeContext.Provider>
  );
}
