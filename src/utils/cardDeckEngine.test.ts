import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSlideDeckTransform, stepSlideIndex } from './cardDeckEngine.ts';

test('stepSlideIndex cycles smoothly forward, backward, and by direct jump', () => {
  assert.deepEqual(stepSlideIndex(0, 1, 4, 'delta'), {
    nextIndex: 1,
    prevIndex: 0,
    direction: 1,
  });

  assert.deepEqual(stepSlideIndex(0, -1, 4, 'delta'), {
    nextIndex: 3,
    prevIndex: 0,
    direction: -1,
  });

  assert.deepEqual(stepSlideIndex(1, 3, 4, 'jump'), {
    nextIndex: 3,
    prevIndex: 1,
    direction: 1,
  });
});

test('computeSlideDeckTransform keeps strict zIndex hierarchy without 3D plane intersection', () => {
  const active = computeSlideDeckTransform({
    index: 1,
    activeIndex: 1,
    prevIndex: 0,
    total: 4,
    direction: 1,
    reducedMotion: false,
  });
  assert.equal(active.role, 'active');
  assert.equal(active.opacity, 1);
  assert.equal(active.zIndex, 35);
  assert.equal(active.transformOrigin, 'right center');
  assert.ok(active.transform.startsWith('perspective(1100px)'));

  const peek1 = computeSlideDeckTransform({
    index: 2,
    activeIndex: 1,
    prevIndex: 0,
    total: 4,
    direction: 1,
    reducedMotion: false,
  });
  assert.equal(peek1.role, 'peek-1');
  assert.ok(peek1.zIndex < active.zIndex);
  assert.ok(peek1.transform.includes('12px'));
  assert.ok(peek1.transform.includes('rotateY(-8deg)'));

  const peek2 = computeSlideDeckTransform({
    index: 3,
    activeIndex: 1,
    prevIndex: 0,
    total: 4,
    direction: 1,
    reducedMotion: false,
  });
  assert.equal(peek2.role, 'peek-2');
  assert.ok(peek2.zIndex < peek1.zIndex);
  assert.ok(peek2.transform.includes('22px'));

  const outgoing = computeSlideDeckTransform({
    index: 0,
    activeIndex: 1,
    prevIndex: 0,
    total: 4,
    direction: 1,
    reducedMotion: false,
  });
  assert.equal(outgoing.role, 'outgoing');
  assert.equal(outgoing.opacity, 0);
  assert.equal(outgoing.transitionMode, 'all');
  assert.ok(outgoing.transform.includes('-112%'));
});

test('computeSlideDeckTransform removes 3D tilt and horizontal translation under reduced motion', () => {
  const active = computeSlideDeckTransform({
    index: 2,
    activeIndex: 2,
    prevIndex: 1,
    total: 4,
    direction: 1,
    reducedMotion: true,
  });
  const inactive = computeSlideDeckTransform({
    index: 3,
    activeIndex: 2,
    prevIndex: 1,
    total: 4,
    direction: 1,
    reducedMotion: true,
  });

  assert.equal(active.opacity, 1);
  assert.equal(inactive.opacity, 0);
  assert.equal(active.transitionMode, 'fade');
  assert.equal(active.transform.includes('rotateY'), false);
  assert.equal(inactive.transform.includes('rotateY'), false);
});
