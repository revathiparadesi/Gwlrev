import React from 'react';
import { Line } from 'react-chartjs-2';
import { ReservoirInfo, FilteredChartData, ChartType } from '../../types/map.types';

interface ReservoirDetailPanelProps {
  reservoirInfo: ReservoirInfo | null;
  chartData: { unique_id: string } | null;
  filterChartData: FilteredChartData;
  fromDate: string;
  toDate: string;
  selectedChart: ChartType;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  setSelectedChart: (type: ChartType) => void;
  chartRef: React.RefObject<any>;
}

const ReservoirDetailPanel: React.FC<ReservoirDetailPanelProps> = ({
  reservoirInfo,
  chartData,
  filterChartData,
  fromDate,
  toDate,
  selectedChart,
  setFromDate,
  setToDate,
  setSelectedChart,
  chartRef
}) => {
  if (!chartData) return null;
  
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
        Reservoir Data (ID: {chartData.unique_id})
      </h4>

      {reservoirInfo && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '16px' }}>
          <tbody>
            <tr><td style={{ padding: '4px 0' }}><b>Name:</b></td><td>{reservoirInfo?.['Name of the Reservoir'] ?? 'N/A'}</td></tr>
            <tr><td style={{ padding: '4px 0' }}><b>Capacity (BCM):</b></td><td>{reservoirInfo?.['Live Capacity at FRL (in bcm)'] ?? 'N/A'}</td></tr>
            <tr><td style={{ padding: '4px 0' }}><b>State:</b></td><td>{reservoirInfo?.['State Name'] ?? 'N/A'}</td></tr>
            <tr><td style={{ padding: '4px 0' }}><b>Longitude:</b></td><td>{reservoirInfo?.['Longitude'] ?? 'N/A'}</td></tr>
            <tr><td style={{ padding: '4px 0' }}><b>Latitude:</b></td><td>{reservoirInfo?.['Latitude'] ?? 'N/A'}</td></tr>
          </tbody>
        </table>
      )}

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

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            value="reservoir" 
            checked={selectedChart === 'reservoir'} 
            onChange={() => setSelectedChart('reservoir')} 
          />
          <span style={{ fontSize: '14px' }}>Reservoir Level</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            value="storage" 
            checked={selectedChart === 'storage'} 
            onChange={() => setSelectedChart('storage')} 
          />
          <span style={{ fontSize: '14px' }}>Live Storage</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            value="both" 
            checked={selectedChart === 'both'} 
            onChange={() => setSelectedChart('both')} 
          />
          <span style={{ fontSize: '14px' }}>Both</span>
        </label>
      </div>

      <div style={{ width: "100%", height: "400px" }}>
        {filterChartData.labels.length > 0 ? (
          <Line
            ref={chartRef}
            data={filterChartData}
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

export default ReservoirDetailPanel;