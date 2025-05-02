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
import "chartjs-adapter-moment";
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
import zoomPlugin from "chartjs-plugin-zoom";

import { fetchTimeSeriesData, postRequest } from '../../services/api';
import { filterChartData, processGroundwaterData } from '../../utils/chart-utils';
import PopupContent from './PopupContent';
import LayerToggle from './LayerToggle';
import ReservoirDetailPanel from './ReservoirDetailPanel';
import GroundwaterDetailPanel from './GroundwaterDetailPanel';
import { 
  VisibleLayers, 
  ChartType,
  FeatureInfo,
  GroundwaterDataPoint,
  ReservoirChartData,
  ReservoirInfo
} from '../../types/map.types';

// Register Chart.js components
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

const BaseMapWithMarkers: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<'reservoir' | 'groundwater'>('reservoir');
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const chartRef = useRef<any>(null);
  const [visibleLayers, setVisibleLayers] = useState<VisibleLayers>({
    reservoir: false,
    groundwater: false
  });

  const [chartData, setChartData] = useState<ReservoirChartData | null>(null);
  const [reservoirInfo, setReservoirInfo] = useState<ReservoirInfo | null>(null);
  const [selectedChart, setSelectedChart] = useState<ChartType>("both");

  const [featureInfo, setFeatureInfo] = useState<FeatureInfo | null>(null);
  const [gwChartData, setGwChartData] = useState<GroundwaterDataPoint[]>([]);
  const [gwFilteredData, setGwFilteredData] = useState<GroundwaterDataPoint[]>([]);

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

  // Use memo to compute filtered chart data
  const filteredChartData = useMemo(() => 
    filterChartData(chartData, fromDate, toDate, selectedChart),
  [chartData, fromDate, toDate, selectedChart]);

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
            popupElement.innerHTML = '';
            
            // Render the appropriate popup content
            const root = document.createElement('div');
            popupElement.appendChild(root);
            
            // Using React to render the popup content
            const reactRoot = document.createRoot(root);
            reactRoot.render(
              <PopupContent 
                properties={properties} 
                layerType={selectedLayer} 
              />
            );
            
            overlay.setPosition(coordinate);
          } else {
            overlay.setPosition(undefined);
          }
        } catch (error) {
          console.error('Error fetching feature info:', error);
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
              const properties = feature.properties;
              const { unique_id } = properties;
              
              setReservoirInfo(properties);
              setFeatureInfo({ properties });

              const apiResponse = await postRequest('https://geosust.co.in/api/cwc_temporal_data/', unique_id);
              
              if (apiResponse?.data?.length > 0) {
                const labels = apiResponse.data.map((d: any) => d.acq_dt);
                const reservoirLevels = apiResponse.data.map((d: any) => parseFloat(d.current_reservoir_level_m));
                const storageValues = apiResponse.data.map((d: any) => parseFloat(d.current_live_storage_bcm));
                
                setChartData({ unique_id, labels, reservoirLevels, storageValues });
                setIsPanelOpen(true);
              }
            } else {
              setFeatureInfo({ properties: feature.properties });
              setIsPanelOpen(true);

              const { unique_id } = feature.properties;
              if (unique_id) {
                const timeSeriesData = await fetchTimeSeriesData(unique_id);
                if (timeSeriesData.length > 0) {
                  const { processedData, fromDate: startDate, toDate: endDate } = processGroundwaterData(timeSeriesData);
                  
                  setGwChartData(processedData);
                  setFromDate(startDate);
                  setToDate(endDate);
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
  }, [selectedLayer, visibleLayers]);

  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const handleLayerChange = (layerName: keyof VisibleLayers) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
    setSelectedLayer(layerName);
  };

  return (
    <div style={{ width: '100%', height: '700px', position: 'relative' }}>
      <LayerToggle 
        visibleLayers={visibleLayers} 
        handleLayerChange={handleLayerChange} 
      />

      <div id="map" style={{ width: '100%', height: '100%' }}></div>
      
      <button
        onClick={() => setIsPanelOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          top: '50%',
          right: isPanelOpen ? '470px' : '0',
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
          transition: 'right 0.3s ease-in-out',
        }}
      >
        {isPanelOpen ? '>' : '<'}
      </button>
      
      {isPanelOpen && selectedLayer === 'reservoir' && chartData && (
        <ReservoirDetailPanel
          reservoirInfo={reservoirInfo}
          chartData={chartData}
          filterChartData={filteredChartData}
          fromDate={fromDate}
          toDate={toDate}
          selectedChart={selectedChart}
          setFromDate={setFromDate}
          setToDate={setToDate}
          setSelectedChart={setSelectedChart}
          chartRef={chartRef}
        />
      )}

      {isPanelOpen && selectedLayer === 'groundwater' && featureInfo && (
        <GroundwaterDetailPanel
          featureInfo={featureInfo}
          gwFilteredData={gwFilteredData}
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          resetZoom={resetZoom}
          chartRef={chartRef}
        />
      )}
    </div>
  );
};

export default BaseMapWithMarkers;