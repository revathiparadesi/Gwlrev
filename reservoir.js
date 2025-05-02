import React, { useEffect, useState, useRef, useMemo } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import Overlay from 'ol/Overlay';
import axios from 'axios';
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
  zoomPlugin
);

const fetchTimeSeriesData = async (unique_id) => {
  try {
    const response = await axios.post('https://geosust.co.in/api/gwl_temporal_data/', {
      data: { unique_id }
    });
    return response.data.status === "success" ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching time-series data:', error);
    return [];
  }
};

const postRequest = async (url, unique_id) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { unique_id } }),
    });
    if (!response.ok) throw new Error('HTTP error! Status: ${response.status}');
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return { error: error.message };
  }
};

const BaseMapWithMarkers = () => {
  const [selectedLayer, setSelectedLayer] = useState('reservoir');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const chartRef = useRef(null);
  
  // New state for layer visibility
  const [visibleLayers, setVisibleLayers] = useState({
    reservoir: false,
    groundwater: false
  });
  
  const [chartData, setChartData] = useState(null);
  const [reservoirInfo, setReservoirInfo] = useState(null);
  const [selectedChart, setSelectedChart] = useState("both");
  
  const [featureInfo, setFeatureInfo] = useState(null);
  const [gwChartData, setGwChartData] = useState([]);
  const [gwFilteredData, setGwFilteredData] = useState([]);

  useEffect(() => {
    if (gwChartData.length > 0) {
      const fromTimestamp = fromDate ? new Date(fromDate).getTime() : null;
      const toTimestamp = toDate ? new Date(toDate).getTime() : null;

      const filteredData = gwChartData.filter(entry => {
        const entryTimestamp = new Date(entry.date).getTime();
        return (!fromTimestamp || entryTimestamp >= fromTimestamp) &&
               (!toTimestamp || entryTimestamp <= toTimestamp);
      });

      setGwFilteredData(filteredData);
    }
  }, [gwChartData, fromDate, toDate]);

  useEffect(() => {
    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';
    popupElement.style.cssText = `
      background: white;
      padding: 8px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      font-size: 12px;
    `;
    document.body.appendChild(popupElement);

    const overlay = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10],
    });

    const reservoirLayer = new ImageLayer({
      source: new ImageWMS({
        url: 'https://gcrs.co.in/geoserver/geosust_industry/wms',
        params: {
          LAYERS: 'geosust_industry:cwc_reservoir_static_data',
          FORMAT: 'image/png',
          TRANSPARENT: true,
        },
        ratio: 1,
        serverType: 'geoserver',
      }),
      visible: visibleLayers.reservoir,
    });

    const groundwaterLayer = new ImageLayer({
      source: new ImageWMS({
        url: 'https://gcrs.co.in/geoserver/geosust_industry/wms',
        params: {
          LAYERS: 'geosust_industry:gwl',
          FORMAT: 'image/png',
          TRANSPARENT: true,
        },
        ratio: 1,
        serverType: 'geoserver',
      }),
      visible: visibleLayers.groundwater,
    });

    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({ source: new OSM() }),
        reservoirLayer,
        groundwaterLayer
      ],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]),
        zoom: 5
      }),
      controls: defaultControls({
        attribution: false,
        rotate: false,
        zoom: true
      }),
      overlays: [overlay],
    });

    map.on('pointermove', async (event) => {
      if (event.dragging) return;
      const resolution = map.getView().getResolution();
      const coordinate = event.coordinate;
      
      const activeLayer = selectedLayer === 'reservoir' ? reservoirLayer : groundwaterLayer;
      const url = activeLayer.getSource().getFeatureInfoUrl(
        coordinate,
        resolution,
        'EPSG:3857',
        { INFO_FORMAT: 'application/json', FEATURE_COUNT: 1 }
      );

      if (url) {
        try {
          const response = await axios.get(url);
          const features = response.data.features;

          if (features?.length > 0) {
            const properties = features[0].properties;
            
            if (selectedLayer === 'reservoir') {
              popupElement.innerHTML = `
                <strong style="font-size: 12px; color: #333;">Reservoir Info</strong>
                <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 4px;">
                  <tr><td><b>Name</b></td><td>${properties.name_of_reservoir ?? 'N/A'}</td></tr>
                  <tr><td><b>State</b></td><td>${properties.state ?? 'N/A'}</td></tr>
                  <tr><td><b>Latitude</b></td><td>${properties.latitude ?? 'N/A'}</td></tr>
                  <tr><td><b>Longitude</b></td><td>${properties.longitude ?? 'N/A'}</td></tr>
                  <tr><td><b>FRL (m)</b></td><td>${properties.frl_m ?? 'N/A'}</td></tr>
                  <tr><td><b>Live Capacity (BCM)</b></td><td>${properties.live_capacit_y_at_frl_bcm ?? 'N/A'}</td></tr>
                  <tr><td><b>Irrigation Benefits (ha)</b></td><td>${properties.benefits_irr_cca_in_th_ha ?? 'N/A'}</td></tr>
                  <tr><td><b>Hydel Capacity (MW)</b></td><td>${properties.hydel_in_mw ?? 'N/A'}</td></tr>
                  <tr><td><b>Basin</b></td><td>${properties.basin ?? 'N/A'}</td></tr>
                </table>
              `;
            } else {
              popupElement.innerHTML = `
                <strong style="font-size: 12px; color: #333;">Groundwater Level Info</strong>
                <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 4px;">
                  <tr><td><b>Object ID</b></td><td>${properties.objectid ?? 'N/A'}</td></tr>
                  <tr><td><b>Unique ID</b></td><td>${properties.unique_id ?? 'N/A'}</td></tr>
                  <tr><td><b>Site ID</b></td><td>${properties.site_id ?? 'N/A'}</td></tr>
                  <tr><td><b>State</b></td><td>${properties.state_name ?? 'N/A'}</td></tr>
                  <tr><td><b>District</b></td><td>${properties.district_name ?? 'N/A'}</td></tr>
                  <tr><td><b>Block</b></td><td>${properties.block_name ?? 'N/A'}</td></tr>
                  <tr><td><b>Site Name</b></td><td>${properties.site_name ?? 'N/A'}</td></tr>
                  <tr><td><b>Site Type</b></td><td>${properties.site_type ?? 'N/A'}</td></tr>
                  <tr><td><b>Depth</b></td><td>${properties.depth ?? 'N/A'}</td></tr>
                  <tr><td><b>Longitude</b></td><td>${properties.longitude ?? 'N/A'}</td></tr>
                  <tr><td><b>Latitude</b></td><td>${properties.latitude ?? 'N/A'}</td></tr>
                </table>
              `;
            }
            overlay.setPosition(coordinate);
          } else {
            overlay.setPosition(undefined);
          }
        } catch {
          overlay.setPosition(undefined);
        }
      }
    });

    map.on('singleclick', async (event) => {
      const resolution = map.getView().getResolution();
      const coordinate = event.coordinate;
      const activeLayer = selectedLayer === 'reservoir' ? reservoirLayer : groundwaterLayer;
      
      const featureInfoUrl = activeLayer.getSource().getFeatureInfoUrl(
        coordinate,
        resolution,
        'EPSG:3857',
        { INFO_FORMAT: 'application/json', FEATURE_COUNT: 1 }
      );

      if (featureInfoUrl) {
        try {
          const response = await axios.get(featureInfoUrl);
          const feature = response.data.features?.[0];

          if (feature) {
            if (selectedLayer === 'reservoir') {
              const { unique_id, latitude, longitude, name_of_reservoir, state, live_capacit_y_at_frl_bcm } = feature.properties;
              setReservoirInfo({
                name_of_reservoir,
                capacity_bcm: live_capacit_y_at_frl_bcm,
                state,
                longitude,
                latitude,
              });

              const apiResponse = await postRequest('https://geosust.co.in/api/cwc_temporal_data/', unique_id);
              if (apiResponse?.data?.length > 0) {
                const labels = apiResponse.data.map((d) => d.acq_dt);
                const reservoirLevels = apiResponse.data.map((d) => parseFloat(d.current_reservoir_level_m));
                const storageValues = apiResponse.data.map((d) => parseFloat(d.current_live_storage_bcm));
                setChartData({ unique_id, labels, reservoirLevels, storageValues });
                setIsPanelOpen(true);
              }
            } else {
              setFeatureInfo(feature.properties);
              setIsPanelOpen(true);

              const { unique_id } = feature.properties;
              if (unique_id) {
                const timeSeriesData = await fetchTimeSeriesData(unique_id);
                if (timeSeriesData.length > 0) {
                  const processedData = timeSeriesData
                    .filter(entry => entry.wl_mbgl !== null)
                    .map(entry => ({
                      date: new Date(entry.date).toISOString().split('T')[0],
                      waterLevel: parseFloat(entry.wl_mbgl),
                    }));

                  setGwChartData(processedData);
                  setFromDate(processedData[0].date);
                  setToDate(processedData[processedData.length - 1].date);
                  setGwFilteredData(processedData);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching feature info:', error);
        }
      }
    });

    // Update layer visibility when visibleLayers changes
    const updateLayerVisibility = () => {
      reservoirLayer.setVisible(visibleLayers.reservoir);
      groundwaterLayer.setVisible(visibleLayers.groundwater);
    };

    updateLayerVisibility();

    return () => {
      map.setTarget(null);
      if (popupElement.parentNode) {
        popupElement.parentNode.removeChild(popupElement);
      }
    };
  }, [selectedLayer, visibleLayers]); // Added visibleLayers to dependencies

  const filterChartData = useMemo(() => {
    if (!chartData) return { labels: [], datasets: [] };

    const fromTimestamp = fromDate ? new Date(fromDate).getTime() : null;
    const toTimestamp = toDate ? new Date(toDate).getTime() : null;

    const filteredData = chartData.labels.reduce((acc, label, index) => {
      const labelTimestamp = new Date(label).getTime();
      if (
        (!fromTimestamp || labelTimestamp >= fromTimestamp) &&
        (!toTimestamp || labelTimestamp <= toTimestamp)
      ) {
        acc.labels.push(label);
        acc.reservoirLevels.push(chartData.reservoirLevels[index]);
        acc.storageValues.push(chartData.storageValues[index]);
      }
      return acc;
    }, { labels: [], reservoirLevels: [], storageValues: [] });

    let datasets = [];
    if (selectedChart === "reservoir" || selectedChart === "both") {
      datasets.push({
        label: "Reservoir Level (m)",
        data: filteredData.reservoirLevels,
        borderColor: "blue",
        borderWidth: 2,
        tension: 0.2,
        fill: false,
      });
    }
    if (selectedChart === "storage" || selectedChart === "both") {
      datasets.push({
        label: "Live Storage (BCM)",
        data: filteredData.storageValues,
        borderColor: "red",
        borderWidth: 2,
        tension: 0.2,
        fill: false,
      });
    }

    return { labels: filteredData.labels, datasets };
  }, [chartData, fromDate, toDate, selectedChart]);

  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  // Handle layer visibility changes
  const handleLayerChange = (layerName) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
    setSelectedLayer(layerName);
  };

  return (
    <div style={{ width: '100%', height: '700px', position: 'relative' }}>
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

      <div id="map" style={{ width: '100%', height: '200%' }}></div>

      {/* Panel Toggle Button */}
      <button
        onClick={() => setIsPanelOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          top: '50%',
          right: '0',
          transform: 'translateY(-50%)',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px 0 0 8px',
          width: '40px',
          height: '50px',
          fontSize: '20px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          transition: 'background-color 0.2s',
          '&:hover': {
            background: '#1d4ed8'
          }
        }}
      >
        {isPanelOpen ? '>' : '<'}
      </button>

      {/* Reservoir Data Panel */}
      {isPanelOpen && selectedLayer === 'reservoir' && chartData && (
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
                <tr><td style={{ padding: '4px 0' }}><b>Name:</b></td><td>{reservoirInfo.name_of_reservoir ?? 'N/A'}</td></tr>
                <tr><td style={{ padding: '4px 0' }}><b>Capacity (BCM):</b></td><td>{reservoirInfo.capacity_bcm ?? 'N/A'}</td></tr>
                <tr><td style={{ padding: '4px 0' }}><b>State:</b></td><td>{reservoirInfo.state ?? 'N/A'}</td></tr>
                <tr><td style={{ padding: '4px 0' }}><b>Longitude:</b></td><td>{reservoirInfo.longitude ?? 'N/A'}</td></tr>
                <tr><td style={{ padding: '4px 0' }}><b>Latitude:</b></td><td>{reservoirInfo.latitude ?? 'N/A'}</td></tr>
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
              <input type="radio" value="reservoir" checked={selectedChart === 'reservoir'} onChange={() => setSelectedChart('reservoir')} />
              <span style={{ fontSize: '14px' }}>Reservoir Level</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="radio" value="storage" checked={selectedChart === 'storage'} onChange={() => setSelectedChart('storage')} />
              <span style={{ fontSize: '14px' }}>Live Storage</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="radio" value="both" checked={selectedChart === 'both'} onChange={() => setSelectedChart('both')} />
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
      )}

      {/* Groundwater Data Panel */}
      {isPanelOpen && selectedLayer === 'groundwater' && featureInfo && (
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
              <tr><td style={{ padding: '4px 0' }}><b>Object ID:</b></td><td>{featureInfo.objectid ?? 'N/A'}</td></tr>
              <tr><td style={{ padding: '4px 0' }}><b>Unique ID:</b></td><td>{featureInfo.unique_id ?? 'N/A'}</td></tr>
              <tr><td style={{ padding: '4px 0' }}><b>Site ID:</b></td><td>{featureInfo.site_id ?? 'N/A'}</td></tr>
              <tr><td style={{ padding: '4px 0' }}><b>State:</b></td><td>{featureInfo.state_name ?? 'N/A'}</td></tr>
              <tr><td style={{ padding: '4px 0' }}><b>District:</b></td><td>{featureInfo.district_name ?? 'N/A'}</td></tr>
              <tr><td style={{ padding: '4px 0' }}><b>Block:</b></td><td>{featureInfo.block_name ?? 'N/A'}</td></tr>
              <tr><td style={{ padding: '4px 0' }}><b>Site Name:</b></td><td>{featureInfo.site_name ?? 'N/A'}</td></tr>
              <tr><td style={{ padding: '4px 0' }}><b>Site Type:</b></td><td>{featureInfo.site_type ?? 'N/A'}</td></tr>
              <tr><td style={{ padding: '4px 0' }}><b>Depth:</b></td><td>{featureInfo.depth ?? 'N/A'}</td></tr>
              <tr><td style={{ padding: '4px 0' }}><b>Longitude:</b></td><td>{featureInfo.longitude ?? 'N/A'}</td></tr>
              <tr><td style={{ padding: '4px 0' }}><b>Latitude:</b></td><td>{featureInfo.latitude ?? 'N/A'}</td></tr>
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
              fontWeight: '500',
              transition: 'background-color 0.2s',
              '&:hover': {
                background: '#1d4ed8'
              }
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
      )}
    </div>
  );
};

export default BaseMapWithMarkers;  