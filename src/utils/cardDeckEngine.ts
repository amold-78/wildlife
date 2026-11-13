export type SlideDirection = 1 | -1;

export type SlideDeckRole =
  | 'active'
  | 'peek-1'
  | 'peek-2'
  | 'outgoing'
  | 'standby-left'
  | 'standby-back';

export interface SlideDeckTransform {
  role: SlideDeckRole;
  transform: string;
  transformOrigin: string;
  opacity: number;
  zIndex: number;
  transitionMode: 'all' | 'fade' | 'none';
  pointerEvents: 'auto' | 'none';
}

export interface SlideStepResult {
  nextIndex: number;
  prevIndex: number;
  direction: SlideDirection;
}

/**
 * Computes cyclic index progression for multi-image card decks.
 */
export function stepSlideIndex(
  currentIndex: number,
  targetOrDelta: number,
  total: number,
  mode: 'delta' | 'jump' = 'delta',
): SlideStepResult {
  if (total <= 0) {
    return { nextIndex: 0, prevIndex: 0, direction: 1 };
  }
  const safeCurrent = ((currentIndex % total) + total) % total;

  if (mode === 'jump') {
    const safeTarget = ((targetOrDelta % total) + total) % total;
    const direction: SlideDirection = safeTarget >= safeCurrent ? 1 : -1;
    return {
      nextIndex: safeTarget,
      prevIndex: safeCurrent,
      direction,
    };
  }

  const direction: SlideDirection = targetOrDelta >= 0 ? 1 : -1;
  const nextIndex = (((safeCurrent + targetOrDelta) % total) + total) % total;
  return {
    nextIndex,
    prevIndex: safeCurrent,
    direction,
  };
}

/**
 * Computes 2.5D perspective sliding-flip deck transforms using flat stacking context
 * (`perspective(...)` inside each element's transform instead of `preserve-3d`),
 * guaranteeing strict `zIndex` occlusion with zero 3D plane clipping:
 * - Active frame covers front cleanly (`zIndex: 35`)
 * - `peek-1` peeks `12px` past right edge (`origin-right`, `zIndex: 25`)
 * - `peek-2` peeks `22px` past right edge (`origin-right`, `zIndex: 15`)
 * - Outgoing frame flips cleanly off to left (`zIndex: 40`)
 */
export function computeSlideDeckTransform(params: {
  index: number;
  activeIndex: number;
  prevIndex: number | null;
  total: number;
  direction: SlideDirection;
  reducedMotion: boolean;
}): SlideDeckTransform {
  const { index, activeIndex, prevIndex, total, direction, reducedMotion } = params;

  if (total <= 1) {
    return {
      role: 'active',
      transform: 'translate3d(0%, 0, 0)',
      transformOrigin: 'center center',
      opacity: 1,
      zIndex: 35,
      transitionMode: 'none',
      pointerEvents: 'auto',
    };
  }

  if (reducedMotion) {
    const isActive = index === activeIndex;
    return {
      role: isActive ? 'active' : 'standby-back',
      transform: 'translate3d(0%, 0, 0)',
      transformOrigin: 'center center',
      opacity: isActive ? 1 : 0,
      zIndex: isActive ? 35 : 10,
      transitionMode: 'fade',
      pointerEvents: isActive ? 'auto' : 'none',
    };
  }

  const delta = ((index - activeIndex) % total + total) % total;
  const hasMoved = prevIndex !== null && prevIndex !== activeIndex;

  if (delta === 0) {
    return {
      role: 'active',
      transform: 'perspective(1100px) translate3d(0px, 0, 0px) rotateY(0deg) scale(1)',
      transformOrigin: 'right center',
      opacity: 1,
      zIndex: 35,
      transitionMode: hasMoved ? 'all' : 'none',
      pointerEvents: 'auto',
    };
  }

  if (delta === 1) {
    return {
      role: 'peek-1',
      transform: 'perspective(1100px) translate3d(12px, 0, 0px) rotateY(-8deg) scale(0.94)',
      transformOrigin: 'right center',
      opacity: 0.92,
      zIndex: 25,
      transitionMode: hasMoved ? 'all' : 'none',
      pointerEvents: 'auto',
    };
  }

  if (hasMoved && direction === 1 && index === prevIndex) {
    return {
      role: 'outgoing',
      transform: 'perspective(1100px) translate3d(-112%, 0, 0px) rotateY(22deg) scale(0.92)',
      transformOrigin: 'center center',
      opacity: 0,
      zIndex: 40,
      transitionMode: 'all',
      pointerEvents: 'none',
    };
  }

  if (delta === 2 && total >= 3) {
    const cameFromLeft =
      hasMoved && direction === 1 && delta === 2 && total === 4 && prevIndex === (activeIndex + 3) % 4;
    return {
      role: 'peek-2',
      transform: 'perspective(1100px) translate3d(22px, 0, 0px) rotateY(-14deg) scale(0.88)',
      transformOrigin: 'right center',
      opacity: 0.72,
      zIndex: 15,
      transitionMode: !hasMoved ? 'none' : cameFromLeft ? 'fade' : 'all',
      pointerEvents: 'none',
    };
  }

  if (delta === total - 1) {
    return {
      role: 'standby-left',
      transform: 'perspective(1100px) translate3d(-112%, 0, 0px) rotateY(22deg) scale(0.92)',
      transformOrigin: 'center center',
      opacity: 0,
      zIndex: 38,
      transitionMode: 'none',
      pointerEvents: 'none',
    };
  }

  return {
    role: 'standby-back',
    transform: 'perspective(1100px) translate3d(26px, 0, 0px) rotateY(-16deg) scale(0.84)',
    transformOrigin: 'right center',
    opacity: 0,
    zIndex: 5,
    transitionMode: 'none',
    pointerEvents: 'none',
  };
}
