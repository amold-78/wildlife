# WildTrail Design Direction (`DESIGN.md`)

## Identity & Character
WildTrail is an expedition planning and official NTCA forest gate permit platform for India's six major wildlife reserves (Tadoba, Pench, Ranthambore, Jim Corbett, Kanha, and Kaziranga). Its visual language blends a naturalist's linen field journal with a top-down isometric 3D jungle canopy diorama where a 4x4 safari Jeep travels an S-curve dirt track.

## Liveliness Dials
`Dial: ENERGY 3 / RHYTHM 3 / MOTION 2`

- **ENERGY 3 (Bold)**: Immersive dawn-to-night canopy diorama with etched topographic contours and custom SVG wildlife that responds to the passing 4x4 Jeep.
- **RHYTHM 3 (Varied)**: Sections alternate intentionally between full-bleed photographic trailhead, asymmetric winding S-curve checkpoints, split twilight camp feature, and structured field-journal tables/forms.
- **MOTION 2 (Balanced)**: Scroll-driven Jeep traversal along the S-curve path and 2.5D photo deck transitions, with full `prefers-reduced-motion: reduce` support and zero endless decorative pulses.

## Color System (R-29: 2 Core Colors + 1 Accent)
1. **Core 1 — Deep Canopy Emerald (`#09211A` / `#0D2922` / `#071713`)**: Grounds the header chrome, 3D jungle diorama floor, and Night Safari dark theme in shaded Sal and teak canopy tones.
2. **Core 2 — Warm Field Linen (`#F5EFE6` / `#FBF8F3`)**: Provides a high-contrast, glare-free archival paper surface for reading reserve dossiers, sighting logs, and permit forms in Day mode.
3. **Deliberate Accent — Field Brass Gold (`#C99A4A` / `#E4B865`)**: Reserved strictly for primary interactive CTAs, active route waypoints, and verified permit seals.

## Typography & Hierarchy (R-06, R-31)
- **Display & Section Headings — `Playfair Display`**: Chosen for its editorial expedition-atlas character that distinguishes reserve titles from utility controls.
- **Body & Controls — `Plus Jakarta Sans`**: Chosen for open apertures and high legibility across dense permit manifests and field guides.
- **Telemetry & Fare Data — `JetBrains Mono` (`tabular-nums`)**: Used exclusively for GPS coordinates, elevation meters, permit reference codes, and aligned currency/seat counts.

## One-Line Decision Log (R-31)
- **Palette**: Deep Canopy Emerald, Warm Field Linen, and Field Brass Gold evoke forestry brass instruments and canvas field journals instead of generic tech palettes.
- **Layout**: The home page follows a spatial S-curve trail narrative from dawn gate entry to twilight camp terminus rather than a uniform card grid.
- **Glassmorphism Dose Cap (R-10)**: Backdrop blur is restricted to the sticky navigation bar and the hero search command bar over photography; all cards and modals use solid tactile surfaces.
- **Iconography (R-04)**: Custom SVG compass/trail emblems and domain-specific wildlife/navigation glyphs (`Compass`, `Footprints`, `Trees`, `Shield`, `Ticket`, `MapPin`) replace generic AI sparkles and emoji icons.
