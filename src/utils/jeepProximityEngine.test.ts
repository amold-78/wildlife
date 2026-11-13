import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResponsiveSnakeTrail } from './jungleTrailEngine.ts';
import {
  buildWildlifeHabitatAnchors,
  computePassengerLookAngle,
  evaluateProximityEcosystem,
  evaluateWildlifeKinematics,
} from './jeepProximityEngine.ts';

test('buildWildlifeHabitatAnchors populates negative space around all 6 checkpoints', () => {
  const geometry = buildResponsiveSnakeTrail({
    width: 1440,
    height: 4600,
    isMobile: false,
  });
  const anchors = buildWildlifeHabitatAnchors(geometry);
  assert.ok(anchors.length >= 10, 'Creates rich multi-species anchors across all 6 stops');

  const coveredCheckpoints = new Set(anchors.map((a) => a.checkpointIndex));
  assert.equal(coveredCheckpoints.size, 6);
});

test('evaluateWildlifeKinematics transitions cleanly through State 1 (idle) -> State 2 (alert) -> State 3 (settle)', () => {
  const geometry = buildResponsiveSnakeTrail({
    width: 1440,
    height: 4600,
    isMobile: false,
  });
  const anchors = buildWildlifeHabitatAnchors(geometry);
  const deerAnchor = anchors.find((a) => a.species === 'spotted-deer')!;
  assert.ok(deerAnchor);

  // State 1: Jeep is far above at trailhead
  const idleState = evaluateWildlifeKinematics(
    deerAnchor,
    { x: 720, y: 80, headingDeg: 90, progress: 0.02, velocity: 0 },
    1.5,
    false,
  );
  assert.equal(idleState.phase, 'idle');
  assert.equal(idleState.proximityFactor, 0);

  // State 2: Jeep pulls up right beside the deer anchor
  const alertState = evaluateWildlifeKinematics(
    deerAnchor,
    {
      x: deerAnchor.anchorX - 40,
      y: deerAnchor.anchorY,
      headingDeg: 90,
      progress: 0.26,
      velocity: 14,
    },
    1.5,
    false,
  );
  assert.equal(alertState.phase, 'alert');
  assert.ok(alertState.proximityFactor > 0.8);
  assert.ok(Math.abs(alertState.offsetX) > 20, 'Deer bounds laterally when startled');
  assert.ok(alertState.particleIntensity > 0.5);

  // State 3: Jeep has scrolled well past the checkpoint
  const settleState = evaluateWildlifeKinematics(
    deerAnchor,
    {
      x: 720,
      y: deerAnchor.anchorY + deerAnchor.alertRadiusPx + 120,
      headingDeg: 90,
      progress: 0.65,
      velocity: 4,
    },
    2.0,
    false,
  );
  assert.equal(settleState.phase, 'settle');
});

test('evaluateProximityEcosystem computes passenger look angle and river elephant water spray', () => {
  const geometry = buildResponsiveSnakeTrail({
    width: 1440,
    height: 4600,
    isMobile: false,
  });
  const anchors = buildWildlifeHabitatAnchors(geometry);
  const elephant = anchors.find((a) => a.species === 'river-elephant')!;

  const snapshot = evaluateProximityEcosystem(
    anchors,
    {
      x: elephant.anchorX + 35,
      y: elephant.anchorY,
      headingDeg: 90,
      progress: 0.54,
      velocity: 12,
    },
    3.2,
    false,
  );

  assert.ok(snapshot.nearestAnimal);
  assert.equal(snapshot.nearestAnimal?.id, elephant.id);
  assert.equal(snapshot.nearestAnimal?.phase, 'alert');
  assert.ok(Math.abs(snapshot.nearestAnimal?.lookAngleDeg ?? 0) <= 65);

  const lookRight = computePassengerLookAngle(
    { x: 500, y: 500 },
    90,
    { x: 400, y: 500 },
  );
  assert.ok(lookRight > 0, 'Target to right of downward-moving Jeep produces positive angle');
});

test('all non-perched wildlife anchors maintain safe horizontal clearance from checkpoint road bends and bridge', () => {
  const desktopGeometry = buildResponsiveSnakeTrail({
    width: 1440,
    height: 4600,
    isMobile: false,
  });
  const desktopAnchors = buildWildlifeHabitatAnchors(desktopGeometry);

  for (const anchor of desktopAnchors) {
    if (anchor.perchedOnCard) continue;
    const cp = desktopGeometry.checkpointCoords[anchor.checkpointIndex];
    if (anchor.id === 'corbett-elephant') {
      const bridgeClearance = Math.abs(
        anchor.anchorX - desktopGeometry.riverCrossing.bridgeX,
      );
      assert.ok(
        bridgeClearance >= 280,
        `corbett-elephant should stay well clear of the river bridge (got ${bridgeClearance}px)`,
      );
    } else {
      const roadClearance = Math.abs(anchor.anchorX - cp.x);
      assert.ok(
        roadClearance >= 200,
        `${anchor.id} should stay well clear of the dirt road apex (got ${roadClearance}px)`,
      );
    }
  }
});
