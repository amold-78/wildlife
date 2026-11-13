import { useContext } from 'react';
import { SpatialWildlifeContext } from './SpatialWildlifeContext';

export function useSpatialWildlife() {
  const context = useContext(SpatialWildlifeContext);
  if (!context) {
    throw new Error('useSpatialWildlife must be used within a SpatialWildlifeProvider');
  }
  return context;
}
