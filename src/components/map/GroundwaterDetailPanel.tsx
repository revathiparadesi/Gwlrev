import React from 'react';
import { Line } from 'react-chartjs-2';
import { FeatureInfo, GroundwaterDataPoint } from '../../types/map.types';

interface GroundwaterDetailPanelProps {
  featureInfo: FeatureInfo | null;
  gwFilteredData: GroundwaterDataPoint[];
  fromDate: string;
  toDate: string;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  resetZoom: () => void;
  chartRef: React.RefObject<any>;
}

const GroundwaterDetailPanel: React.FC<GroundwaterDetailPanelProps> = ({
  featureInfo,
  gwFilteredData,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  resetZoom,
  chartRef
}) => {
  if (!featureInfo) return null;
  
  const properties = featureInfo.properties;
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '70px',
      width: '400px',
      background: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 999,
      overflow: 'auto',
      maxHeight: 'calc(100vh - 40px)'
    }}>
      <h4 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
        Groundwater Level Information
      </h4>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '16px' }}>
        <tbody>
          <tr><td style={{ padding: '4px 0' }}><b>Object ID:</b></td><td>{properties['Object ID'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>Unique ID:</b></td><td>{properties['Unique ID'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>Site ID:</b></td><td>{properties['Site ID'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>State:</b></td><td>{properties['State Name'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>District:</b></td><td>{properties['District Name'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>Block:</b></td><td>{properties['Block Name'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>Site Name:</b></td><td>{properties['Site Name'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>Site Type:</b></td><td>{properties['Site Type'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>Depth:</b></td><td>{properties['Depth'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>Longitude:</b></td><td>{properties['Longitude'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>Latitude:</b></td><td>{properties['Latitude'] ?? 'N/A'}</td></tr>
          <tr><td style={{ padding: '4px 0' }}><b>Water Level (mbgl):</b></td><td>{properties['Water Level (mbgl)'] ?? 'N/A'}</td></tr>
        </tbody>
      </table>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <label style={{ flex: '1', minWidth: '140px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#4b5563' }}>From:</span>
          <input 
            type="date" 
            value={fromDate} 
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </label>
        <label style={{ flex: '1', minWidth: '140px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#4b5563' }}>To:</span>
          <input 
            type="date" 
            value={toDate} 
            onChange={(e) => setToDate(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </label>
      </div>

      <button 
        onClick={resetZoom} 
        style={{ 
          marginBottom: '16px',
          padding: '8px 16px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        Reset Zoom
      </button>

      <div style={{ width: "100%", height: "300px" }}>
        {gwFilteredData.length > 0 ? (
          <Line
            ref={chartRef}
            data={{
              labels: gwFilteredData.map(d => d.date),
              datasets: [{
                label: "Water Level (mbgl)",
                data: gwFilteredData.map(d => d.waterLevel),
                borderColor: "#2563eb",
                borderWidth: 2,
                tension: 0.2,
                fill: false,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  type: "time",
                  time: {
                    unit: "day",
                    tooltipFormat: "MMM D"
                  }
                }
              },
              plugins: {
                zoom: {
                  pan: {
                    enabled: true,
                    mode: 'x'
                  },
                  zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: 'x'
                  }
                }
              }
            }}
          />
        ) : (
          <p style={{ color: "#ef4444", textAlign: "center", marginTop: "20px" }}>
            No data available for the selected date range.
          </p>
        )}
      </div>
    </div>
  );
};

export default GroundwaterDetailPanel;