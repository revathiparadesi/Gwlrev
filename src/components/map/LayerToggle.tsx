import React from 'react';
import { VisibleLayers } from '../../types/map.types';

interface LayerToggleProps {
  visibleLayers: VisibleLayers;
  handleLayerChange: (layerName: keyof VisibleLayers) => void;
}

const LayerToggle: React.FC<LayerToggleProps> = ({ visibleLayers, handleLayerChange }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '75%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      background: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      display: 'flex',
      gap: '24px',
      alignItems: 'center'
    }}> 
      <label style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        color: '#333'
      }}>
        <input
          type="checkbox"
          checked={visibleLayers.reservoir}
          onChange={() => handleLayerChange('reservoir')}
          style={{ cursor: 'pointer' }}
        />
        Reservoir Data
      </label>
      <label style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        color: '#333'
      }}>
        <input
          type="checkbox"
          checked={visibleLayers.groundwater}
          onChange={() => handleLayerChange('groundwater')}
          style={{ cursor: 'pointer' }}
        />
        Groundwater Level
      </label>
    </div>
  );
};

export default LayerToggle;