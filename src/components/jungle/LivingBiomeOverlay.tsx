import React from 'react';
import type { SnakeTrailGeometry } from '../../utils/jungleTrailEngine';
import type {
  ProximityFrameSnapshot,
  WildlifeAnchorConfig,
  WildlifeSpeciesId,
} from '../../utils/jeepProximityEngine';

interface LivingBiomeOverlayProps {
  geometry: SnakeTrailGeometry;
  anchors: WildlifeAnchorConfig[];
  atmospherePhase: 'morning-mist' | 'emerald-canopy' | 'night-camp';
  registerAnimalNode: (id: string) => (node: HTMLElement | null) => void;
  registerParticleNode: (id: string) => (node: HTMLElement | null) => void;
  registerGlowNode: (id: string) => (node: HTMLElement | null) => void;
  checkpointSightings: ProximityFrameSnapshot['checkpointSightings'];
}

function SpeciesIllustration({
  species,
  side,
}: {
  species: WildlifeSpeciesId;
  side: 'left' | 'right';
}) {
  const flipX = side === 'left' ? 'scale(-1, 1)' : undefined;

  switch (species) {
    case 'bengal-tiger':
      return (
        <svg viewBox="0 0 180 112" className="w-24 h-16 sm:w-44 sm:h-28 overflow-visible">
          <defs>
            <linearGradient id="tigerCoatGrad" x1="30" y1="26" x2="135" y2="78" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F09A3E" />
              <stop offset="52%" stopColor="#DE7A22" />
              <stop offset="100%" stopColor="#B85912" />
            </linearGradient>
            <linearGradient id="tigerBellyGrad" x1="65" y1="55" x2="65" y2="78" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DE7A22" stopOpacity="0" />
              <stop offset="100%" stopColor="#FFF7E8" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <g transform={flipX} style={{ transformOrigin: '90px 56px' }}>
            {/* Soft 3D Ground Shadow */}
            <ellipse cx="92" cy="92" rx="58" ry="13" fill="#020B08" fillOpacity="0.55" />

            {/* Lush 3D Monstera Deliciosa Foliage Behind & Beside Tiger */}
            <g>
              {/* Back Left Fenestrated Monstera Leaf */}
              <path
                d="M 18 82 C 4 64, 6 34, 26 22 C 34 32, 24 40, 34 44 C 24 46, 38 22, 46 20 C 62 22, 68 48, 52 76 C 40 84, 26 86, 18 82 Z"
                fill="#114B39"
                stroke="#237A5E"
                strokeWidth="1"
              />
              <path d="M 36 80 Q 34 50 42 22" stroke="#399E7D" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              {/* Front Sculpted Monstera Leaf with Cutout Fenestrations */}
              <path
                d="M 8 88 C -4 72, -2 48, 16 36 C 22 44, 14 52, 24 54 C 16 56, 26 36, 36 36 C 48 40, 52 64, 38 86 Z"
                fill="#1A664E"
                stroke="#359B7A"
                strokeWidth="0.9"
              />
              {/* Right Margin Monstera & Bamboo Culms */}
              <path
                d="M 144 86 C 154 64, 172 52, 178 66 C 174 78, 158 88, 144 86 Z"
                fill="#165944"
              />
              <path d="M 148 90 Q 156 54 166 22" stroke="#2D755C" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </g>

            {/* Far Hind Leg & Foreleg (Darker Depth Plane) */}
            <g className="wildlife-leg-b">
              <path
                d="M 54 64 C 50 74, 46 82, 43 90 C 43 92, 48 93, 52 91 C 55 83, 60 74, 63 64 Z"
                fill="#A84F10"
              />
              <path d="M 46 78 L 53 76 M 44 84 L 51 83" stroke="#18120E" strokeWidth="1.8" strokeLinecap="round" />
            </g>
            <g className="wildlife-leg-a">
              <path
                d="M 110 62 C 112 73, 115 82, 118 90 C 120 92, 125 92, 126 89 C 124 80, 121 71, 119 60 Z"
                fill="#A84F10"
              />
              <path d="M 114 76 L 122 75 M 116 83 L 124 82" stroke="#18120E" strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Articulated Ringed Tail */}
            <g className="wildlife-tail">
              <path
                d="M 44 52 C 28 54, 16 42, 12 28 C 10 21, 15 16, 20 20 C 18 30, 26 42, 44 45 Z"
                fill="#E07D24"
              />
              <path
                d="M 35 49 L 33 43 M 26 44 L 29 38 M 19 37 L 23 32 M 14 29 L 19 26"
                stroke="#18120E"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <circle cx="15" cy="20" r="3.2" fill="#18120E" />
              <circle cx="16.5" cy="18.5" r="1.6" fill="#FFF7E8" />
            </g>

            {/* Sculpted Muscular Torso, Shoulder Hump & Haunches */}
            <path
              d="M 42 52 C 42 39, 56 34, 72 36 C 88 38, 102 32, 118 34 C 130 35, 136 44, 134 56 C 131 66, 120 71, 106 70 C 90 69, 76 66, 62 69 C 49 71, 42 63, 42 52 Z"
              fill="url(#tigerCoatGrad)"
            />
            {/* Cream White Underbelly & Chest */}
            <path
              d="M 56 64 C 72 61, 94 62, 116 66 C 124 64, 130 58, 132 52 C 126 67, 112 71, 96 70 C 78 68, 64 70, 56 64 Z"
              fill="url(#tigerBellyGrad)"
            />

            {/* Near Hind Leg & Paws */}
            <g className="wildlife-leg-a">
              <path
                d="M 46 58 C 44 70, 38 80, 35 90 C 35 93, 42 94, 46 91 C 49 82, 56 72, 58 60 Z"
                fill="#DF7B24"
              />
              <ellipse cx="42" cy="91" rx="5.5" ry="2.6" fill="#F8EBD7" />
              <path d="M 42 73 L 51 71 M 39 80 L 47 79" stroke="#18120E" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Near Foreleg Striding Forward */}
            <g className="wildlife-leg-b">
              <path
                d="M 116 56 C 120 68, 126 79, 131 89 C 133 92, 140 91, 140 88 C 136 78, 130 67, 127 54 Z"
                fill="#E8862B"
              />
              <ellipse cx="136" cy="89.5" rx="5.5" ry="2.6" fill="#F8EBD7" />
              <path d="M 121 69 L 130 67 M 125 77 L 133 75" stroke="#18120E" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Authentic Forked Anatomical Bengal Tiger Stripes */}
            <g stroke="#18120E" strokeLinecap="round" fill="none">
              <path d="M 52 38 C 50 46, 48 54, 51 62" strokeWidth="2.8" />
              <path d="M 61 36 C 59 45, 57 52, 60 61 M 59 46 L 64 56" strokeWidth="2.6" />
              <path d="M 72 37 C 70 46, 71 55, 73 63" strokeWidth="2.8" />
              <path d="M 83 37 C 81 46, 80 54, 83 62 M 81 47 L 86 57" strokeWidth="2.6" />
              <path d="M 95 36 C 93 45, 93 54, 96 63" strokeWidth="2.8" />
              <path d="M 106 34 C 104 44, 105 53, 108 61 M 105 44 L 111 53" strokeWidth="2.7" />
              <path d="M 117 35 C 116 43, 118 51, 121 57" strokeWidth="2.5" />
            </g>

            {/* Sculpted Feline Head, Ruff, Ears & Amber Eyes */}
            <g>
              {/* Rounded Black Ears with White Ocelli Spots */}
              <ellipse cx="129" cy="27" rx="4.5" ry="5.5" transform="rotate(-18 129 27)" fill="#18120E" />
              <circle cx="129" cy="27" r="1.8" fill="#FFF7E8" />
              <ellipse cx="143" cy="26" rx="4.5" ry="5.5" transform="rotate(14 143 26)" fill="#18120E" />
              <circle cx="143" cy="26" r="1.8" fill="#FFF7E8" />

              {/* Main Cranium & Muzzle */}
              <path
                d="M 122 36 C 122 26, 132 23, 142 26 C 151 28, 156 36, 155 44 C 154 51, 147 56, 138 56 C 128 56, 122 47, 122 36 Z"
                fill="#EC8D32"
              />
              {/* White Cheek Ruff & Chin */}
              <path
                d="M 126 44 C 125 52, 133 57, 143 56 C 150 55, 155 50, 154 44 C 149 48, 143 50, 136 49 C 131 48, 128 46, 126 44 Z"
                fill="#FFF7E8"
              />
              {/* Forehead & Cheek Stripes */}
              <path
                d="M 133 28 L 136 33 M 142 28 L 140 33 M 129 45 C 132 48, 135 51, 133 54"
                stroke="#18120E"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* White Supraorbital Eye Patches */}
              <ellipse cx="137" cy="34.5" rx="3" ry="1.5" fill="#FFF7E8" />
              <ellipse cx="147" cy="34.5" rx="2.8" ry="1.4" fill="#FFF7E8" />

              {/* Piercing Golden-Amber Eyes */}
              <ellipse cx="138" cy="37.5" rx="2.6" ry="2.2" fill="#FFE066" stroke="#18120E" strokeWidth="1" />
              <circle cx="138.5" cy="37.5" r="1.1" fill="#18120E" />
              <ellipse cx="148" cy="37.5" rx="2.4" ry="2" fill="#FFE066" stroke="#18120E" strokeWidth="1" />
              <circle cx="148.4" cy="37.5" r="1" fill="#18120E" />

              {/* Terracotta Nose & Muzzle Pads */}
              <polygon points="145,42 151,42 148,46" fill="#D96B52" stroke="#18120E" strokeWidth="0.9" />
              <path d="M 148 46 L 148 49 M 144 50 Q 148 48 152 50" stroke="#18120E" strokeWidth="1.3" strokeLinecap="round" fill="none" />

              {/* Fine White Whiskers */}
              <path
                d="M 141 48 L 129 51 M 142 50 L 131 55 M 152 48 L 163 50 M 152 50 L 161 54"
                stroke="#FFFDF9"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.9"
              />
            </g>
          </g>
        </svg>
      );

    case 'canopy-leopard':
      return (
        <svg viewBox="0 0 180 112" className="w-24 h-16 sm:w-44 sm:h-28 overflow-visible">
          <defs>
            <linearGradient id="leopardCoatGrad" x1="36" y1="28" x2="132" y2="74" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5C364" />
              <stop offset="55%" stopColor="#DFA03B" />
              <stop offset="100%" stopColor="#B5791E" />
            </linearGradient>
            <linearGradient id="salBoughGrad" x1="10" y1="68" x2="170" y2="86" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B2A1D" />
              <stop offset="50%" stopColor="#59402C" />
              <stop offset="100%" stopColor="#2E2015" />
            </linearGradient>
          </defs>
          <g transform={flipX} style={{ transformOrigin: '90px 56px' }}>
            {/* Gnarled Moss-Draped Sal Tree Bough */}
            <path
              d="M 8 84 C 46 72, 92 70, 168 80 C 172 81, 172 90, 166 91 C 96 82, 48 84, 10 94 Z"
              fill="url(#salBoughGrad)"
            />
            {/* Hanging Lichen & Canopy Leaves on Branch */}
            <path
              d="M 38 80 C 32 90, 26 96, 22 102 M 136 78 C 142 88, 150 92, 158 86"
              stroke="#3B7A5E"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M 140 77 C 150 68, 164 70, 168 78 C 156 80, 146 79, 140 77 Z" fill="#2A694E" />

            {/* Long Counterbalance Leopard Tail Draping Below the Bough */}
            <g className="wildlife-tail">
              <path
                d="M 46 56 C 28 62, 18 82, 24 98 C 26 104, 34 103, 32 96 C 28 82, 36 66, 50 60 Z"
                fill="#DFA03B"
              />
              <circle cx="29" cy="78" r="2.2" fill="#21170E" />
              <circle cx="26" cy="89" r="2.4" fill="#21170E" />
              <circle cx="28" cy="99" r="3.2" fill="#21170E" />
            </g>

            {/* Far Legs */}
            <path d="M 56 60 L 48 77 L 55 78 L 63 60 Z" fill="#B5791E" />
            <path d="M 110 58 L 116 76 L 123 76 L 118 56 Z" fill="#B5791E" />

            {/* Sleek Low-Slung Crouching Leopard Body */}
            <path
              d="M 44 54 C 44 41, 60 36, 78 38 C 95 40, 108 35, 122 38 C 132 40, 136 48, 132 58 C 127 65, 114 67, 98 65 C 82 63, 66 64, 54 65 C 46 65, 44 60, 44 54 Z"
              fill="url(#leopardCoatGrad)"
            />
            {/* Cream Underbelly */}
            <path d="M 58 61 Q 88 66 118 62" stroke="#FAF0DC" strokeWidth="4" strokeLinecap="round" fill="none" />

            {/* Near Hind Leg & Reaching Stalking Forepaw */}
            <g className="wildlife-leg-a">
              <path
                d="M 48 56 C 44 65, 40 72, 38 79 C 38 81, 45 82, 48 79 C 51 72, 56 65, 58 57 Z"
                fill="#E4A742"
              />
            </g>
            <g className="wildlife-leg-b">
              <path
                d="M 116 54 C 121 63, 128 71, 135 77 C 138 79, 144 78, 142 74 C 136 68, 129 60, 125 52 Z"
                fill="#EAB04B"
              />
            </g>

            {/* Authentic Two-Tone Rosette Clusters (Copper centers inside broken dark rings) */}
            {[
              { x: 58, y: 46 },
              { x: 70, y: 44 },
              { x: 65, y: 54 },
              { x: 82, y: 47 },
              { x: 78, y: 56 },
              { x: 94, y: 44 },
              { x: 91, y: 54 },
              { x: 106, y: 46 },
              { x: 103, y: 55 },
              { x: 117, y: 47 },
            ].map((r, i) => (
              <g key={i} transform={`translate(${r.x}, ${r.y})`}>
                <circle cx="0" cy="0" r="3.4" fill="#9E5B14" />
                <path
                  d="M -3 -1.5 A 3.4 3.4 0 0 1 2.5 -2 M 3 1 A 3.4 3.4 0 0 1 -2 3"
                  stroke="#1E150C"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            ))}

            {/* Sculpted Leopard Head & Luminous Night-Vision Eyes */}
            <g>
              <circle cx="129" cy="32" r="4" fill="#1E150C" />
              <circle cx="141" cy="31" r="4" fill="#1E150C" />
              <path
                d="M 123 41 C 123 32, 132 29, 141 31 C 149 33, 154 40, 152 47 C 150 53, 143 56, 135 55 C 127 54, 123 48, 123 41 Z"
                fill="#EBB24E"
              />
              {/* Luminous Jade-Amber Predator Eyes */}
              <ellipse cx="137" cy="41" rx="2.6" ry="2.1" fill="#B8FF94" stroke="#1E150C" strokeWidth="1" />
              <circle cx="137.4" cy="41" r="1" fill="#121A0E" />
              <ellipse cx="146" cy="41" rx="2.4" ry="2" fill="#B8FF94" stroke="#1E150C" strokeWidth="1" />
              <circle cx="146.4" cy="41" r="1" fill="#121A0E" />
              <polygon points="143,45 148,45 145.5,48.5" fill="#C46A52" />
              <path
                d="M 139 50 L 128 53 M 148 50 L 159 52"
                stroke="#FFFDF9"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </g>
          </g>
        </svg>
      );

    case 'spotted-deer':
      return (
        <svg viewBox="0 0 176 116" className="w-24 h-16 sm:w-44 sm:h-28 overflow-visible">
          <defs>
            <linearGradient id="deerCoatGrad" x1="40" y1="36" x2="118" y2="76" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D98841" />
              <stop offset="60%" stopColor="#BD6C2A" />
              <stop offset="100%" stopColor="#965019" />
            </linearGradient>
          </defs>
          <g transform={flipX} style={{ transformOrigin: '88px 58px' }}>
            <ellipse cx="86" cy="96" rx="52" ry="11" fill="#020B08" fillOpacity="0.5" />

            {/* Lush Grassy Margin Tufts & Golden Savannah Blades */}
            <g strokeLinecap="round" fill="none">
              <path d="M 24 98 Q 18 78 10 66 M 28 98 Q 28 76 24 62 M 32 98 Q 38 80 44 68" stroke="#287A5C" strokeWidth="2.4" />
              <path d="M 132 98 Q 128 80 122 68 M 136 98 Q 140 76 148 64 M 140 98 Q 148 82 156 72" stroke="#369672" strokeWidth="2.2" />
              <path d="M 76 100 Q 72 86 66 76 M 82 100 Q 86 84 92 74" stroke="#C99A4A" strokeWidth="1.8" opacity="0.75" />
            </g>

            {/* Companion Alert Chital Doe in Background Layer */}
            <g opacity="0.82" transform="translate(-22, -6) scale(0.84)">
              <path d="M 52 68 L 46 94 M 62 68 L 64 94 M 90 68 L 88 94 M 98 68 L 104 94" stroke="#8C4A17" strokeWidth="3.2" strokeLinecap="round" />
              <path
                d="M 46 60 C 46 50, 62 47, 80 49 C 94 50, 104 54, 102 64 C 100 71, 86 72, 70 71 C 54 70, 46 67, 46 60 Z"
                fill="#AE6022"
              />
              <path d="M 94 54 C 98 42, 102 32, 106 26" stroke="#AE6022" strokeWidth="7.5" strokeLinecap="round" />
              <ellipse cx="110" cy="25" rx="8" ry="4.8" transform="rotate(-10 110 25)" fill="#B86828" />
              <ellipse cx="103" cy="19" rx="2.5" ry="5.5" transform="rotate(-28 103 19)" fill="#965019" />
              <circle cx="62" cy="56" r="1.6" fill="#FFF7E8" />
              <circle cx="72" cy="55" r="1.6" fill="#FFF7E8" />
              <circle cx="82" cy="57" r="1.6" fill="#FFF7E8" />
            </g>

            {/* Lead Chital Stag: Articulated Slender Legs */}
            <g className="wildlife-leg-b">
              <path d="M 60 66 L 52 82 L 46 96" stroke="#8F4D1A" strokeWidth="3.6" strokeLinecap="round" fill="none" />
              <path d="M 102 65 L 106 81 L 102 96" stroke="#8F4D1A" strokeWidth="3.6" strokeLinecap="round" fill="none" />
            </g>
            <g className="wildlife-leg-a">
              <path d="M 68 66 L 64 82 L 66 97" stroke="#C47330" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 110 64 L 120 79 L 126 95" stroke="#C47330" strokeWidth="4" strokeLinecap="round" fill="none" />
            </g>

            {/* Sculpted Stag Torso & Haunches */}
            <path
              d="M 52 58 C 52 45, 68 41, 88 43 C 104 45, 118 46, 120 58 C 121 67, 110 71, 94 70 C 78 69, 64 70, 56 67 C 52 65, 52 61, 52 58 Z"
              fill="url(#deerCoatGrad)"
            />
            {/* Cream White Underbelly & Throat Bib */}
            <path d="M 62 67 Q 88 71 112 66" stroke="#FFF8EB" strokeWidth="3.8" strokeLinecap="round" fill="none" />
            {/* Raised White-Lined Tail */}
            <g className="wildlife-tail">
              <path d="M 53 52 C 44 46, 38 40, 36 34" stroke="#D98841" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 52 54 C 44 48, 39 43, 37 37" stroke="#FFF8EB" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </g>

            {/* Authentic Rows of Ivory Chital Spots */}
            {[
              { x: 64, y: 49 }, { x: 73, y: 48 }, { x: 82, y: 49 }, { x: 92, y: 50 }, { x: 102, y: 51 },
              { x: 60, y: 55 }, { x: 69, y: 54 }, { x: 78, y: 55 }, { x: 88, y: 56 }, { x: 98, y: 57 }, { x: 107, y: 56 },
              { x: 65, y: 61 }, { x: 75, y: 60 }, { x: 85, y: 61 }, { x: 95, y: 62 },
            ].map((pt, idx) => (
              <circle key={idx} cx={pt.x} cy={pt.y} r="1.8" fill="#FFF9EE" />
            ))}

            {/* Graceful Arched Neck, Sculpted Head & 3-Tined Lyre Antlers */}
            <path
              d="M 108 52 C 114 40, 120 28, 125 20 C 129 22, 130 28, 126 36 C 122 45, 118 54, 114 60 Z"
              fill="#C97835"
            />
            {/* White Throat Patch */}
            <path d="M 125 25 Q 122 36 117 48" stroke="#FFF9EE" strokeWidth="2.8" strokeLinecap="round" fill="none" />

            {/* Branched Three-Tined Lyre Antlers */}
            <g stroke="#EAD7B7" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Back Antler */}
              <path d="M 122 16 C 114 8, 102 4, 92 7 M 114 10 L 122 4 M 102 6 L 106 1" strokeWidth="2.2" />
              {/* Front Antler with Brow Tine */}
              <path d="M 126 17 C 120 7, 108 2, 96 4 M 122 12 L 132 8 M 108 4 L 113 -2" strokeWidth="2.6" />
            </g>

            {/* Ears & Snout */}
            <ellipse cx="118" cy="19" rx="2.8" ry="6.5" transform="rotate(-35 118 19)" fill="#A85A1E" />
            <ellipse cx="122" cy="18" rx="2.6" ry="6" transform="rotate(-18 122 18)" fill="#C97835" />
            <path
              d="M 122 17 C 128 15, 138 17, 142 21 C 143 24, 139 27, 133 27 C 127 27, 122 23, 122 17 Z"
              fill="#D4823D"
            />
            <circle cx="130" cy="20.5" r="1.8" fill="#1A1410" />
            <circle cx="130.5" cy="20" r="0.6" fill="#FFFFFF" />
            <circle cx="141" cy="21.5" r="2" fill="#1F1814" />
          </g>
        </svg>
      );

    case 'macaw-pair':
      return (
        <svg viewBox="0 0 168 108" className="w-22 h-15 sm:w-40 sm:h-26 overflow-visible">
          <defs>
            <linearGradient id="scarletWingGrad" x1="20" y1="10" x2="118" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF4B3A" />
              <stop offset="48%" stopColor="#F7C346" />
              <stop offset="100%" stopColor="#1B76D4" />
            </linearGradient>
            <linearGradient id="goldMacawGrad" x1="24" y1="14" x2="96" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#35A7FF" />
              <stop offset="60%" stopColor="#1D70B8" />
              <stop offset="100%" stopColor="#F5B841" />
            </linearGradient>
          </defs>
          <g transform={flipX} style={{ transformOrigin: '84px 54px' }}>
            {/* Lead Vibrant Scarlet Macaw Taking Flight from Card Frame */}
            <g>
              {/* Long Streaming Crimson & Cobalt Macaw Tail Plumes */}
              <g className="wildlife-tail">
                <path d="M 56 54 L 6 84 L 14 87 L 60 58 Z" fill="#1B76D4" />
                <path d="M 58 52 L 2 74 L 10 79 L 62 56 Z" fill="#E63725" />
                <path d="M 57 53 L 16 79 L 22 81 L 60 57 Z" fill="#F7C346" />
              </g>

              {/* Back Outstretched Crimson-Gold-Cobalt Wing */}
              <g className="wildlife-wing">
                <path
                  d="M 68 44 C 52 14, 26 6, 10 16 C 20 25, 28 31, 20 35 C 32 39, 42 41, 36 46 C 48 48, 58 48, 68 44 Z"
                  fill="#C92818"
                />
                <path
                  d="M 48 34 C 36 22, 22 18, 12 22 C 22 28, 30 33, 48 34 Z"
                  fill="#F7C346"
                />
              </g>

              {/* Sculpted Aerodynamic Scarlet Macaw Body */}
              <path
                d="M 52 52 C 56 39, 72 35, 86 38 C 96 40, 100 49, 94 57 C 86 64, 66 64, 52 52 Z"
                fill="#F03E2F"
              />

              {/* Front Articulated Layered Tri-Color Macaw Wing */}
              <g className="wildlife-wing">
                <path
                  d="M 74 46 C 84 14, 112 6, 130 16 C 120 26, 110 32, 116 36 C 106 41, 96 43, 100 48 C 88 50, 80 50, 74 46 Z"
                  fill="url(#scarletWingGrad)"
                />
                {/* Individual Primary Feather Shaft Highlights */}
                <path
                  d="M 80 42 L 118 18 M 84 44 L 110 28 M 86 46 L 102 36"
                  stroke="#FFF4CC"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.82"
                />
              </g>

              {/* Scarlet Head, White Featherless Facial Patch & Ivory/Charcoal Curved Beak */}
              <circle cx="94" cy="40" r="8.5" fill="#F03E2F" />
              <ellipse cx="97" cy="40" rx="4.2" ry="3.6" fill="#FFF8EC" />
              <circle cx="97.2" cy="39.2" r="1.4" fill="#141716" />
              {/* Upper Ivory & Lower Black Mandible */}
              <path d="M 101 36.5 C 109 36.5, 112 41, 108 45.5 C 105 43, 103 42, 101 42 Z" fill="#FFF6E0" stroke="#2A211B" strokeWidth="0.7" />
              <path d="M 101 42 C 104 45, 107 44.5, 106 41.5 Z" fill="#1E1B18" />
            </g>

            {/* Companion Blue-and-Gold Macaw Banking Above */}
            <g transform="translate(38, -14) scale(0.78)">
              <path d="M 62 48 L 24 66 L 30 69 L 66 51 Z" fill="#1B76D4" />
              <g className="wildlife-wing">
                <path
                  d="M 70 42 C 58 16, 34 12, 22 22 C 36 32, 48 38, 70 42 Z"
                  fill="url(#goldMacawGrad)"
                />
              </g>
              <ellipse cx="74" cy="44" rx="13" ry="7.5" fill="#F7C346" />
              <circle cx="86" cy="40" r="6.5" fill="#2589E8" />
              <ellipse cx="88" cy="40" rx="3.2" ry="2.6" fill="#FFF8EC" />
              <path d="M 91 38 C 97 38, 99 42, 95 45 L 91 42 Z" fill="#222524" />
              <circle cx="88.2" cy="39.5" r="1.2" fill="#141716" />
            </g>
          </g>
        </svg>
      );

    case 'langur-monkey':
      return (
        <svg viewBox="0 0 164 118" className="w-22 h-16 sm:w-40 sm:h-28 overflow-visible">
          <defs>
            <linearGradient id="langurFurGrad" x1="58" y1="34" x2="104" y2="86" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ECE6DA" />
              <stop offset="55%" stopColor="#C8C0B0" />
              <stop offset="100%" stopColor="#968E7E" />
            </linearGradient>
          </defs>
          <g transform={flipX} style={{ transformOrigin: '82px 59px' }}>
            {/* Braided Jungle Liana Vine with Sprouting Canopy Leaves */}
            <path
              d="M 10 8 C 48 34, 98 32, 154 10"
              stroke="#3D613E"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 14 11 C 50 37, 96 35, 150 13"
              stroke="#274228"
              strokeWidth="1.8"
              strokeDasharray="6 6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Vine Leaves */}
            <path d="M 38 22 C 28 12, 16 14, 14 24 C 24 27, 32 25, 38 22 Z" fill="#2D6E52" />
            <path d="M 122 22 C 132 12, 144 14, 146 24 C 136 27, 128 25, 122 22 Z" fill="#2D6E52" />

            {/* Iconic Long S-Curved Hanuman Langur Balance Tail */}
            <g className="wildlife-tail">
              <path
                d="M 68 72 C 42 78, 22 98, 34 110 C 42 116, 54 110, 48 102 C 42 95, 50 82, 70 76 Z"
                fill="#C4BCAE"
              />
              <circle cx="40" cy="107" r="4.5" fill="#DFD9CC" />
            </g>

            {/* Back Reaching Arm gripping the Liana Vine */}
            <g className="wildlife-leg-b">
              <path
                d="M 76 48 C 68 38, 60 30, 56 24"
                stroke="#A8A090"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="55" cy="23" r="3.8" fill="#24211F" />
            </g>

            {/* Sculpted Acrobatic Torso */}
            <path
              d="M 66 56 C 64 46, 74 42, 84 44 C 94 46, 98 58, 92 70 C 86 80, 74 80, 68 72 C 65 67, 66 61, 66 56 Z"
              fill="url(#langurFurGrad)"
            />

            {/* Articulated Hind Legs & Charcoal Feet */}
            <g className="wildlife-leg-a">
              <path
                d="M 72 72 C 66 82, 60 88, 54 94"
                stroke="#B8B0A0"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse cx="52" cy="95" rx="4.5" ry="2.5" transform="rotate(-20 52 95)" fill="#24211F" />
              <path
                d="M 86 72 C 92 80, 98 86, 104 90"
                stroke="#CEC7B8"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse cx="106" cy="91" rx="4.5" ry="2.5" transform="rotate(15 106 91)" fill="#24211F" />
            </g>

            {/* Front Reaching Arm */}
            <g className="wildlife-leg-a">
              <path
                d="M 88 50 C 96 40, 102 32, 106 24"
                stroke="#D6CFC2"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="107" cy="23" r="3.8" fill="#24211F" />
            </g>

            {/* Sculpted Head with White Brow Ruff & Jet-Black Expressive Face */}
            <g>
              <circle cx="83" cy="36" r="11" fill="#EFEAE0" />
              {/* Dark Ears */}
              <circle cx="72" cy="36" r="3.2" fill="#24211F" />
              <circle cx="94" cy="36" r="3.2" fill="#24211F" />
              {/* Expressive Black Facial Mask */}
              <ellipse cx="84" cy="37.5" rx="7.2" ry="6.5" fill="#1F1C1A" />
              {/* White Peak Brow Hair */}
              <path d="M 75 32 Q 84 28 92 32" stroke="#FAF6EE" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              {/* Bright Amber Eyes */}
              <circle cx="81.5" cy="36" r="1.5" fill="#F5C975" />
              <circle cx="87" cy="36" r="1.5" fill="#F5C975" />
              <ellipse cx="84.5" cy="40.5" rx="2.8" ry="1.8" fill="#332E2B" />
            </g>
          </g>
        </svg>
      );

    case 'river-elephant':
      return (
        <svg viewBox="0 0 192 120" className="w-28 h-18 sm:w-48 sm:h-30 overflow-visible">
          <defs>
            <linearGradient id="elephantSkinGrad" x1="36" y1="24" x2="132" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7C8784" />
              <stop offset="55%" stopColor="#5C6663" />
              <stop offset="100%" stopColor="#3F4745" />
            </linearGradient>
          </defs>
          <g transform={flipX} style={{ transformOrigin: '96px 60px' }}>
            {/* Concentric Ramganga River Water Ripples */}
            <ellipse
              cx="92"
              cy="96"
              rx="72"
              ry="14"
              fill="#174949"
              fillOpacity="0.42"
              stroke="#8FD6D3"
              strokeWidth="1.8"
              strokeDasharray="12 8"
            />
            <ellipse
              cx="92"
              cy="96"
              rx="52"
              ry="9"
              fill="none"
              stroke="#C5F5F2"
              strokeWidth="1.4"
              strokeDasharray="8 6"
            />

            {/* Companion Baby Elephant Calf Wading Beside Matriarch */}
            <g transform="translate(8, 22) scale(0.58)">
              <rect x="44" y="82" width="12" height="24" rx="5" fill="#464F4C" />
              <rect x="76" y="82" width="12" height="24" rx="5" fill="#464F4C" />
              <path
                d="M 36 72 C 36 52, 58 46, 82 50 C 98 53, 106 64, 102 78 C 98 88, 76 90, 54 88 C 40 86, 36 80, 36 72 Z"
                fill="#56605D"
              />
              <ellipse cx="92" cy="64" rx="11" ry="14" fill="#48524F" />
              <circle cx="102" cy="62" r="14" fill="#5C6663" />
              <path
                d="M 112 64 C 122 64, 128 52, 124 44"
                stroke="#5C6663"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="106" cy="59" r="1.8" fill="#181C1B" />
            </g>

            {/* Matriarch Pillar Legs Wading in River Current */}
            <g className="wildlife-leg-b">
              <path d="M 54 68 L 50 96 L 64 96 L 68 68 Z" fill="#434B49" />
              <path d="M 104 68 L 102 96 L 116 96 L 118 68 Z" fill="#434B49" />
            </g>
            <g className="wildlife-leg-a">
              <path d="M 66 68 L 64 97 L 79 97 L 81 68 Z" fill="#58625F" />
              <path d="M 116 66 L 118 97 L 133 97 L 130 66 Z" fill="#58625F" />
              {/* Toe Nails */}
              <circle cx="68" cy="95.5" r="1.8" fill="#D8CFC0" />
              <circle cx="73" cy="95.5" r="1.8" fill="#D8CFC0" />
              <circle cx="122" cy="95.5" r="1.8" fill="#D8CFC0" />
              <circle cx="127" cy="95.5" r="1.8" fill="#D8CFC0" />
            </g>

            {/* Tail */}
            <g className="wildlife-tail">
              <path d="M 44 56 C 34 64, 30 76, 32 86" stroke="#4D5653" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <ellipse cx="32" cy="87" rx="2.5" ry="4" fill="#232826" />
            </g>

            {/* Sculpted Domed Back & Massive Ribcage */}
            <path
              d="M 42 56 C 42 32, 68 24, 96 28 C 116 31, 130 40, 130 58 C 130 72, 114 76, 88 75 C 62 74, 42 70, 42 56 Z"
              fill="url(#elephantSkinGrad)"
            />
            {/* Wrinkled Skin Fold Contours */}
            <path
              d="M 64 34 Q 62 52 66 68 M 82 32 Q 80 50 84 68 M 100 34 Q 98 50 102 66"
              stroke="#3E4644"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />

            {/* Iconic Scalloped Asian Elephant Fan Ear */}
            <path
              d="M 118 32 C 104 30, 98 42, 102 56 C 106 66, 118 68, 124 58 C 128 48, 126 34, 118 32 Z"
              fill="#4B5451"
              stroke="#38403E"
              strokeWidth="1.4"
            />
            {/* Subtle Warm Pinkish Ear Border Mottling */}
            <path d="M 105 46 Q 108 58 117 61" stroke="#C49A8E" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55" />

            {/* Twin-Domed Forehead & Raised S-Curved Spraying Trunk */}
            <path
              d="M 120 34 C 122 22, 134 20, 142 26 C 150 30, 152 42, 148 52 C 142 60, 128 60, 122 50 Z"
              fill="#687370"
            />
            <g className="wildlife-trunk">
              <path
                d="M 145 44 C 158 46, 168 38, 168 24 C 168 14, 158 10, 154 16 C 152 20, 157 24, 160 21"
                stroke="#646F6C"
                strokeWidth="9.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Trunk Transverse Muscle Rings */}
              <path
                d="M 152 43 L 154 38 M 160 39 L 163 35 M 165 31 L 169 29"
                stroke="#434B49"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* Curved Ivory Tusks */}
            <path
              d="M 140 50 C 150 56, 162 54, 167 46 C 161 50, 151 50, 142 46 Z"
              fill="#FDF7E7"
              stroke="#C9B998"
              strokeWidth="0.9"
            />
            {/* Wise Eye */}
            <circle cx="137" cy="38" r="2.2" fill="#1B1F1E" />
            <circle cx="137.6" cy="37.4" r="0.7" fill="#FFFFFF" />
          </g>
        </svg>
      );

    case 'one-horned-rhino':
      return (
        <svg viewBox="0 0 188 116" className="w-26 h-16 sm:w-46 sm:h-28 overflow-visible">
          <defs>
            <linearGradient id="rhinoArmorGrad" x1="34" y1="24" x2="136" y2="86" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7A827F" />
              <stop offset="52%" stopColor="#58605D" />
              <stop offset="100%" stopColor="#3B413F" />
            </linearGradient>
          </defs>
          <g transform={flipX} style={{ transformOrigin: '94px 58px' }}>
            {/* Kaziranga Wetland Pool & Tall Elephant Grass */}
            <ellipse cx="92" cy="94" rx="64" ry="12" fill="#0E332E" fillOpacity="0.45" stroke="#56A8A6" strokeWidth="1.5" />
            <path
              d="M 20 92 Q 14 56 8 24 M 28 94 Q 26 58 22 22"
              stroke="#2C6652"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Back Legs */}
            <g className="wildlife-leg-b">
              <path d="M 52 68 L 48 93 L 62 93 L 66 68 Z" fill="#3B413F" />
              <path d="M 106 68 L 104 93 L 118 93 L 120 68 Z" fill="#3B413F" />
            </g>

            {/* Front Legs */}
            <g className="wildlife-leg-a">
              <path d="M 62 68 L 60 94 L 75 94 L 78 68 Z" fill="#525956" />
              <path d="M 116 66 L 118 94 L 133 94 L 130 66 Z" fill="#525956" />
            </g>

            {/* Heavy Prehistoric Plated Armor Body (Haunch Plate, Flank Plate, Shoulder Plate) */}
            <path
              d="M 40 56 C 40 34, 62 28, 92 30 C 116 31, 132 36, 134 56 C 135 70, 120 75, 92 74 C 64 74, 40 70, 40 56 Z"
              fill="url(#rhinoArmorGrad)"
              stroke="#2D3331"
              strokeWidth="1.6"
            />

            {/* Deep Anatomical Armor Seam Folds */}
            <path
              d="M 68 30 C 62 46, 62 60, 68 73 M 108 31 C 104 46, 106 60, 112 73 M 126 36 C 122 50, 124 62, 130 70"
              stroke="#282E2C"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 46 52 Q 56 54 65 50 M 108 50 Q 118 53 128 48"
              stroke="#282E2C"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Characteristic Bumpy Tubercle Rivets Across Haunches & Flank */}
            {[
              { x: 50, y: 44 }, { x: 56, y: 42 }, { x: 53, y: 49 }, { x: 48, y: 58 }, { x: 56, y: 60 },
              { x: 60, y: 54 }, { x: 78, y: 44 }, { x: 86, y: 42 }, { x: 82, y: 50 }, { x: 94, y: 46 },
              { x: 76, y: 58 }, { x: 88, y: 60 }, { x: 98, y: 56 },
            ].map((t, idx) => (
              <circle key={idx} cx={t.x} cy={t.y} r="1.9" fill="#8D9693" opacity="0.78" />
            ))}

            {/* Sculpted Armored Head, Tufted Ears & Upward-Curved Single Keratin Horn */}
            <g>
              <ellipse cx="128" cy="30" rx="3.5" ry="6" transform="rotate(-18 128 30)" fill="#484F4D" />
              <ellipse cx="135" cy="31" rx="3.5" ry="6" transform="rotate(12 135 31)" fill="#5E6663" />
              <path
                d="M 126 38 C 134 34, 148 38, 158 44 C 162 47, 160 58, 152 60 C 142 62, 130 58, 126 48 Z"
                fill="#636B68"
                stroke="#2D3331"
                strokeWidth="1.4"
              />
              {/* Prominent Curved Single Keratin Horn */}
              <path
                d="M 151 41 C 156 32, 163 22, 166 18 C 167 25, 164 36, 159 45 Z"
                fill="#DFD0B2"
                stroke="#6E624B"
                strokeWidth="1.2"
              />
              {/* Prehensile Upper Lip & Glowing Eye */}
              <circle cx="143" cy="46" r="2.1" fill="#FFE07D" stroke="#1E2220" strokeWidth="0.9" />
              <circle cx="143.5" cy="46" r="0.9" fill="#181C1A" />
              <path d="M 154 53 Q 158 55 155 58" stroke="#282E2C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          </g>
        </svg>
      );
  }
}

function SpeciesParticles({ species }: { species: WildlifeSpeciesId }) {
  if (species === 'river-elephant') {
    // Rich multi-layered arc of glistening Ramganga river water spray & mist droplets
    return (
      <svg viewBox="0 0 160 96" className="w-36 h-24 overflow-visible">
        <g>
          <path
            d="M 126 34 C 114 8, 86 4, 64 20 M 130 30 C 142 6, 158 8, 166 24 M 122 36 C 102 18, 78 20, 58 34"
            stroke="#CCF7F7"
            strokeWidth="2.2"
            strokeDasharray="4 5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="118" cy="14" r="3.4" fill="#E3FFFF" />
          <circle cx="102" cy="10" r="2.8" fill="#A6EFEF" />
          <circle cx="84" cy="14" r="3.2" fill="#E3FFFF" />
          <circle cx="68" cy="22" r="2.4" fill="#8CE6E6" />
          <circle cx="138" cy="10" r="3" fill="#E3FFFF" />
          <circle cx="152" cy="16" r="2.5" fill="#A6EFEF" />
        </g>
      </svg>
    );
  }

  if (species === 'macaw-pair') {
    // Drifting vibrant scarlet, sunburst gold & cobalt macaw plumage feathers
    return (
      <svg viewBox="0 0 130 84" className="w-30 h-20 overflow-visible">
        <g>
          <path d="M 22 52 C 30 46, 40 48, 44 54 C 36 58, 26 56, 22 52 Z" fill="#F03E2F" />
          <path d="M 48 62 C 56 56, 66 58, 70 64 C 62 68, 52 66, 48 62 Z" fill="#F7C346" />
          <path d="M 76 50 C 82 44, 92 46, 94 52 C 86 56, 78 54, 76 50 Z" fill="#1B76D4" />
          <circle cx="38" cy="40" r="2.2" fill="#FFF3C4" />
          <circle cx="64" cy="44" r="1.8" fill="#FFD166" />
        </g>
      </svg>
    );
  }

  // Botanical leaf & golden pollen scatter for bounding deer, swinging langurs, and stalking cats
  return (
    <svg viewBox="0 0 130 84" className="w-30 h-20 overflow-visible">
      <g>
        <path d="M 24 54 C 32 44, 44 46, 46 56 C 36 60, 28 58, 24 54 Z" fill="#3B9B78" />
        <path d="M 82 48 C 90 38, 102 40, 104 50 C 94 54, 86 52, 82 48 Z" fill="#2D7A5E" />
        <circle cx="56" cy="40" r="2.4" fill="#F0C46C" />
        <circle cx="72" cy="52" r="2" fill="#FFE69A" />
      </g>
    </svg>
  );
}

/**
 * Renders the negative-space rainforest diorama and detailed, anatomically sculpted
 * proximity-reactive wildlife characters around every bend and destination card.
 */
export default function LivingBiomeOverlay({
  geometry,
  anchors,
  atmospherePhase,
  registerAnimalNode,
  registerParticleNode,
  registerGlowNode,
  checkpointSightings,
}: LivingBiomeOverlayProps) {
  const { width, height, isMobile, checkpointCoords } = geometry;
  const isNight = atmospherePhase === 'night-camp';

  // Generate negative-space fern & flora clusters opposite each card so there is zero dead space
  const negativeSpaceFlora = checkpointCoords.map((cp) => {
    const x = isMobile
      ? Math.round(width * 0.06)
      : cp.cardSide === 'left'
        ? Math.round(width * 0.82)
        : Math.round(width * 0.18);
    return {
      id: `flora-${cp.safariId}`,
      x,
      y: cp.y,
      side: cp.bendSide,
      index: cp.index,
    };
  });

  // Bioluminescent spores & fireflies distributed down the trail
  const fireflyNodes = Array.from({ length: 18 }).map((_, idx) => {
    const ratio = (idx + 1) / 19;
    const x = Math.round(width * (idx % 2 === 0 ? 0.18 + (idx % 3) * 0.07 : 0.82 - (idx % 3) * 0.07));
    const y = Math.round(height * ratio);
    const isLowerDusk = ratio > 0.55;
    return { id: `spore-${idx}`, x, y, isLowerDusk };
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-15 overflow-hidden select-none"
    >
      {/* 1. DAPPLED SUNLIGHT GOD-RAYS (Dawn & Mid-Canopy Negative Space) */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="canopyGodRay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE8A3" stopOpacity={isNight ? '0.06' : '0.26'} />
            <stop offset="55%" stopColor="#E4B865" stopOpacity={isNight ? '0.03' : '0.11'} />
            <stop offset="100%" stopColor="#E4B865" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="biolumGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9FFFCB" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#38B28B" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#071713" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Volumetric Golden Sunbeams Filtering Through the Dark Emerald Canopy */}
        <polygon
          points={`${width * 0.04},0 ${width * 0.31},0 ${width * 0.66},${height * 0.29} ${width * 0.34},${height * 0.29}`}
          fill="url(#canopyGodRay)"
        />
        <polygon
          points={`${width * 0.62},${height * 0.14} ${width * 0.92},${height * 0.14} ${width * 0.48},${height * 0.46} ${width * 0.22},${height * 0.46}`}
          fill="url(#canopyGodRay)"
        />
        <polygon
          points={`${width * 0.08},${height * 0.36} ${width * 0.36},${height * 0.36} ${width * 0.74},${height * 0.68} ${width * 0.44},${height * 0.68}`}
          fill="url(#canopyGodRay)"
        />

        {/* Subtle Negative-Space Ground Contour Halos */}
        {negativeSpaceFlora.map((cluster) => (
          <g key={cluster.id} transform={`translate(${cluster.x}, ${cluster.y})`}>
            <ellipse
              cx="0"
              cy="24"
              rx={isMobile ? 36 : 78}
              ry={isMobile ? 16 : 32}
              fill={cluster.index >= 4 || isNight ? '#11382C' : '#587A62'}
              fillOpacity="0.18"
            />
          </g>
        ))}

        {/* Drifting Golden Spores (Upper Trail) & Bioluminescent Fireflies (Lower Dusk/Night) */}
        {fireflyNodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            {node.isLowerDusk && (
              <circle cx="0" cy="0" r="18" fill="url(#biolumGlow)" />
            )}
            <circle
              cx="0"
              cy="0"
              r={node.isLowerDusk ? 3.2 : 2.4}
              fill={node.isLowerDusk ? '#A8FFCE' : '#FFE394'}
              fillOpacity={node.isLowerDusk ? 0.85 : 0.65}
            />
          </g>
        ))}
      </svg>

      {/* 2. PROXIMITY-REACTIVE DETAILED WILDLIFE CHARACTERS IN NEGATIVE SPACE */}
      {anchors.map((anchor) => {
        const sighting = checkpointSightings[anchor.checkpointIndex];
        const isAlert = sighting?.phase === 'alert';

        return (
          <div
            key={anchor.id}
            data-wildlife-id={anchor.id}
            data-wildlife-species={anchor.species}
            style={{
              left: `${anchor.anchorX}px`,
              top: `${anchor.anchorY}px`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            {/* Dynamic Headlight Rim-Glow Cone when Jeep illuminates animal in Dusk/Night */}
            <div
              ref={registerGlowNode(anchor.id)}
              style={{ opacity: 0 }}
              className="absolute -inset-10 rounded-full bg-radial from-[#FFE69A]/50 via-[#E58C3A]/18 to-transparent blur-md transition-opacity duration-150"
            />

            {/* Main Articulated 3D Wildlife Character Node (mutated at 60fps via useJeepProximity) */}
            <div
              ref={registerAnimalNode(anchor.id)}
              data-proximity-phase="idle"
              className="relative flex flex-col items-center will-change-transform drop-shadow-[0_12px_14px_rgba(0,0,0,0.62)]"
            >
              {/* Feather / Water Spray / Leaf Rustle Particle Emitter */}
              <div
                ref={registerParticleNode(anchor.id)}
                style={{ opacity: 0 }}
                className="absolute -top-8 -left-4 pointer-events-none will-change-transform"
              >
                <SpeciesParticles species={anchor.species} />
              </div>

              <SpeciesIllustration species={anchor.species} side={anchor.side} />

              {/* Spatial Habitat Telemetry Tag on Desktop Negative Space */}
              {!anchor.perchedOnCard && (
                <div
                  className={`hidden md:inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg border text-xs font-mono tabular-nums whitespace-nowrap transition-colors duration-300 ${
                    isAlert
                      ? 'bg-[#0D2922] text-[#F5C975] border-[#C99A4A]'
                      : 'bg-[#09211A] text-[#E9DFC9] border-[#2C5C4C]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAlert ? 'bg-[#F5C975]' : 'bg-[#4FA38B]'
                    }`}
                  />
                  <span className="font-semibold">{anchor.name}</span>
                  {sighting && (
                    <span className="text-[#C99A4A]">· {sighting.distanceMeters}m</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
