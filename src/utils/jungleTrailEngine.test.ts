import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRAIL_CHECKPOINTS,
  buildResponsiveSnakeTrail,
  computeAtmospherePhase,
  computeVelocityDynamics,
  isWaterCrossingZone,
  resolveActiveCheckpointIndex,
} from './jungleTrailEngine.ts';

test('TRAIL_CHECKPOINTS maps all 6 seeded WildTrail reserves with unique IDs', () => {
  assert.equal(TRAIL_CHECKPOINTS.length, 6);
  const ids = new Set(TRAIL_CHECKPOINTS.map((c) => c.safariId));
  assert.equal(ids.size, 6);
  assert.equal(TRAIL_CHECKPOINTS[0].safariId, 'tadoba-andhari');
  assert.equal(TRAIL_CHECKPOINTS[5].safariId, 'kaziranga-national-park');
});

test('buildResponsiveSnakeTrail creates valid alternating desktop path and tightened mobile curve', () => {
  const desktop = buildResponsiveSnakeTrail({
    width: 1440,
    height: 4600,
    isMobile: false,
  });

  assert.equal(desktop.checkpointCoords.length, 6);
  assert.ok(desktop.roadPath.startsWith('M '));
  assert.ok(desktop.riverCrossing.riverSvgPath.startsWith('M '));
  // Alternating card sides on desktop
  assert.equal(desktop.checkpointCoords[0].cardSide, 'left');
  assert.equal(desktop.checkpointCoords[1].cardSide, 'right');
  // Y positions strictly increase down the trail
  for (let i = 1; i < desktop.checkpointCoords.length; i++) {
    assert.ok(
      desktop.checkpointCoords[i].y > desktop.checkpointCoords[i - 1].y,
      `Checkpoint ${i} should sit lower than ${i - 1}`,
    );
  }

  const mobile = buildResponsiveSnakeTrail({
    width: 390,
    height: 4800,
    isMobile: true,
  });
  // Mobile and desktop road stays centered around 50% width
  for (const cp of mobile.checkpointCoords) {
    assert.ok(
      Math.abs(cp.x - 390 * 0.5) <= 15,
      `Mobile road x=${cp.x} stays centered around 50% width`,
    );
    assert.equal(cp.cardSide, 'right');
  }

  for (const cp of desktop.checkpointCoords) {
    assert.ok(
      Math.abs(cp.x - 1440 * 0.5) <= 45,
      `Desktop road x=${cp.x} stays in center corridor around 50% width`,
    );
  }
});

test('computeAtmospherePhase transitions smoothly from morning mist -> emerald canopy -> night camp', () => {
  const dawn = computeAtmospherePhase(0.05);
  assert.equal(dawn.phase, 'morning-mist');
  assert.equal(dawn.headlightOpacity, 0);
  assert.ok(dawn.mistOpacity > 0.7);

  const canopy = computeAtmospherePhase(0.5);
  assert.equal(canopy.phase, 'emerald-canopy');
  assert.equal(canopy.headlightOpacity, 0);

  const night = computeAtmospherePhase(0.92);
  assert.equal(night.phase, 'night-camp');
  assert.equal(night.headlightOpacity, 1);
  assert.ok(night.firelightOpacity > 0.7);
});

test('computeVelocityDynamics emits dust on dirt roads and splashes inside river ford', () => {
  assert.equal(isWaterCrossingZone(0.2), false);
  assert.equal(isWaterCrossingZone(0.52), true);

  const fastDirt = computeVelocityDynamics(24, 0.2);
  assert.ok(fastDirt.dustIntensity > 0.5);
  assert.equal(fastDirt.splashIntensity, 0);
  assert.ok(fastDirt.wheelSpinDeltaDeg > 0);

  const riverSplash = computeVelocityDynamics(16, 0.52);
  assert.equal(riverSplash.dustIntensity, 0);
  assert.ok(riverSplash.splashIntensity > 0.5);
});

test('resolveActiveCheckpointIndex selects closest trail waypoint', () => {
  const trail = buildResponsiveSnakeTrail({
    width: 1200,
    height: 4000,
    isMobile: false,
  });
  assert.equal(resolveActiveCheckpointIndex(0.1, trail.checkpointCoords), 0);
  assert.equal(resolveActiveCheckpointIndex(0.91, trail.checkpointCoords), 5);
});
