import React from 'react';
import JourneyThroughJungle from '../components/journey/JourneyThroughJungle';

/**
 * HomePage
 * Refactored into a full-page scroll-driven "Journey Through the Jungle" experience.
 * The entire viewport acts as a continuous, winding safari trail with:
 * - Full-page S-curve snake dirt road through 6 premier national park reserves
 * - 3 parallax depth planes (topographic contours, winding road, lush foreground canopy)
 * - Dynamic lighting transition (morning golden hour -> deep emerald canopy -> fire-lit base camp)
 * - 2.5D open-top 4x4 safari Jeep carrying an excited family with physics, wheel spin, and headlights
 * - Tactile glassmorphic "Field Journal" cards unfolding at each curve apex
 * - Collapsible telemetry HUD with magnetic compass, altimeter, and vertical skip-links
 */
export default function HomePage({ onSelectSafari, onNavigate }) {
  return (
    <JourneyThroughJungle
      onSelectSafari={onSelectSafari}
      onNavigate={onNavigate}
    />
  );
}
