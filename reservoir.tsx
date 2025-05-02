import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Circle, Fill, Stroke, Style } from "ol/style";
import Overlay from "ol/Overlay";
import axios from "axios";
import { Line } from "react-chartjs-2";

const ReservoirDashboard = () => {
  const mapRef = useRef();
  const overlayRef = useRef();
  const [selectedReservoir, setSelectedReservoir] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [dateRange, setDateRange] = useState({ from: "2018-01-01", to: "2020-12-31" });

  useEffect(() => {
    const vectorSource = new VectorSource();

    axios.get("https://geosust.co.in/api/reservoirs")
      .then(response => {
        response.data.forEach(reservoir => {
          const feature = new Feature({
            geometry: new Point(fromLonLat([reservoir.longitude, reservoir.latitude])),
            ...reservoir
          });
          feature.setStyle(new Style({
            image: new Circle({
              radius: 6,
              fill: new Fill({ color: "blue" }),
              stroke: new Stroke({ color: "white", width: 2 })
            })
          }));
          vectorSource.addFeature(feature);
        });
      });

    const vectorLayer = new VectorLayer({ source: vectorSource });
    const map = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: new View({ center: fromLonLat([78.9629, 20.5937]), zoom: 5 })
    });

    map.on("singleclick", (event) => {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        setSelectedReservoir(feature.getProperties());
        fetchChartData(feature.get("id"));
        overlayRef.current.setPosition(event.coordinate);
      });
    });
  }, []);

  const fetchChartData = (id) => {
    axios.get(`https://geosust.co.in/api/water_levels?id=${id}&from=${dateRange.from}&to=${dateRange.to}`)
      .then(response => {
        setChartData({
          labels: response.data.map(d => d.date),
          datasets: [{
            label: "Reservoir Water Level (m)",
            data: response.data.map(d => d.level),
            borderColor: "blue",
            borderWidth: 2,
            fill: false
          }]
        });
      });
  };

  return (
    <div>
      <h2>Reservoir Monitoring Dashboard</h2>
      <div ref={mapRef} style={{ width: "100%", height: "500px" }}></div>
      <div ref={overlayRef} style={{ background: "white", padding: "10px", position: "absolute", display: selectedReservoir ? "block" : "none" }}>
        {selectedReservoir && (
          <div>
            <h4>{selectedReservoir.reservoir_name}</h4>
            <p><strong>State:</strong> {selectedReservoir.state}</p>
            <p><strong>Latitude:</strong> {selectedReservoir.latitude}</p>
            <p><strong>Longitude:</strong> {selectedReservoir.longitude}</p>
          </div>
        )}
      </div>
      <label>From: <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} /></label>
      <label>To: <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} /></label>
      {chartData && <Line data={chartData} />}
    </div>
  );
};

export default ReservoirDashboard;
