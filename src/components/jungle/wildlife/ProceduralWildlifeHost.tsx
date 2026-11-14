import React from 'react';
import type { WildlifeSpeciesId } from '../../../utils/jeepProximityEngine';
import type { WildlifeCanvasController } from './wildlifeTypes';
import ProceduralTigerCanvas from './ProceduralTigerCanvas';
import ProceduralDeerCanvas from './ProceduralDeerCanvas';
import ProceduralElephantCanvas from './ProceduralElephantCanvas';
import ProceduralRhinoCanvas from './ProceduralRhinoCanvas';
import ProceduralLeopardCanvas from './ProceduralLeopardCanvas';
import ProceduralLangurCanvas from './ProceduralLangurCanvas';
import ProceduralMacawCanvas from './ProceduralMacawCanvas';

interface ProceduralWildlifeHostProps {
  species: WildlifeSpeciesId;
  side: 'left' | 'right';
  registerController?: (controller: WildlifeCanvasController | null) => void;
  className?: string;
}

export default function ProceduralWildlifeHost({
  species,
  side,
  registerController,
  className,
}: ProceduralWildlifeHostProps) {
  switch (species) {
    case 'bengal-tiger':
      return <ProceduralTigerCanvas side={side} registerController={registerController} className={className} />;
    case 'spotted-deer':
      return <ProceduralDeerCanvas side={side} registerController={registerController} className={className} />;
    case 'river-elephant':
      return <ProceduralElephantCanvas side={side} registerController={registerController} className={className} />;
    case 'one-horned-rhino':
      return <ProceduralRhinoCanvas side={side} registerController={registerController} className={className} />;
    case 'canopy-leopard':
      return <ProceduralLeopardCanvas side={side} registerController={registerController} className={className} />;
    case 'langur-monkey':
      return <ProceduralLangurCanvas side={side} registerController={registerController} className={className} />;
    case 'macaw-pair':
      return <ProceduralMacawCanvas side={side} registerController={registerController} className={className} />;
    default:
      return null;
  }
}

