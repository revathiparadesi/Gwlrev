import React from 'react';
import { ReservoirProperties, GroundwaterProperties } from '../../types/map.types';

interface PopupContentProps {
  properties: ReservoirProperties | GroundwaterProperties;
  layerType: 'reservoir' | 'groundwater';
}

const PopupContent: React.FC<PopupContentProps> = ({ properties, layerType }) => {
  if (layerType === 'reservoir') {
    return (
      <div>
        <strong style={{ fontSize: '12px', color: '#333' }}>Reservoir Info</strong>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginTop: '4px' }}>
          <tbody>
            <tr><td><b>Name</b></td><td>{properties?.['Name of the Reservoir'] || 'N/A'}</td></tr>
            <tr><td><b>State</b></td><td>{properties?.['State Name'] || 'N/A'}</td></tr>
            <tr><td><b>Latitude</b></td><td>{properties?.['Latitude'] || 'N/A'}</td></tr>
            <tr><td><b>Longitude</b></td><td>{properties?.['Longitude'] || 'N/A'}</td></tr>
            <tr><td><b>FRL (m)</b></td><td>{properties?.['Full Reservoir Level (FRL) (in m)'] || 'N/A'}</td></tr>
            <tr><td><b>Live Capacity (BCM)</b></td><td>{properties?.['Live Capacity at FRL (in bcm)'] || 'N/A'}</td></tr>
            <tr><td><b>Irrigation Benefits (cca) (in kha)</b></td><td>{properties?.['Benefits Irrigation (cca) (in kha)'] || 'N/A'}</td></tr>
            <tr><td><b>Hydel Capacity (MW)</b></td><td>{properties?.['Hydro Electric (in MW)'] || 'N/A'}</td></tr>
            <tr><td><b>Basin</b></td><td>{properties?.['Basin'] || 'N/A'}</td></tr>
          </tbody>
        </table>
      </div>
    );
  } else {
    return (
      <div>
        <strong style={{ fontSize: '12px', color: '#333' }}>Groundwater Level Info</strong>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginTop: '4px' }}>
          <tbody>
            <tr><td><b>Object ID</b></td><td>{properties?.['Object ID'] || 'N/A'}</td></tr>
            <tr><td><b>Unique ID</b></td><td>{properties?.['Unique ID'] || 'N/A'}</td></tr>
            <tr><td><b>Site ID</b></td><td>{properties?.['Site ID'] || 'N/A'}</td></tr>
            <tr><td><b>State</b></td><td>{properties?.['State Name'] || 'N/A'}</td></tr>
            <tr><td><b>District</b></td><td>{properties?.['District Name'] || 'N/A'}</td></tr>
            <tr><td><b>Block</b></td><td>{properties?.['Block Name'] || 'N/A'}</td></tr>
            <tr><td><b>Site Name</b></td><td>{properties?.['Site Name'] || 'N/A'}</td></tr>
            <tr><td><b>Site Type</b></td><td>{properties?.['Site Type'] || 'N/A'}</td></tr>
            <tr><td><b>Depth (mbgl)</b></td><td>{properties?.['Depth'] || 'N/A'}</td></tr>
            <tr><td><b>Longitude</b></td><td>{properties?.['Longitude'] || 'N/A'}</td></tr>
            <tr><td><b>Latitude</b></td><td>{properties?.['Latitude'] || 'N/A'}</td></tr>
            <tr><td><b>Water Level (mbgl)</b></td><td>{properties?.['Water Level (mbgl)'] || 'N/A'}</td></tr>
          </tbody>
        </table>
      </div>
    );
  }
};

export default PopupContent;z