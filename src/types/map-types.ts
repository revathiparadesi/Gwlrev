import { Collection } from 'ol';
import Feature from 'ol/Feature';
import { Geometry, Point } from 'ol/geom';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { TileImage, TileWMS } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { BaseMapProps, XYZLayerProps } from './layer-types';

export interface ReportContent {
  mapImage?: string;
}

export interface ImageData {
  latitude: number;
  longitude: number;
  image_name: string;
  path: string;
}

export interface PopupContent {
  src: string;
  lat: number;
  long: number;
  image_name: string;
  key: string;
}

export interface PrintValues {
  title: string;
  format: string;
}

export interface GroundwaterDataPoint {
  unique_id: string;
  date: string;
  level: number;
  [key: string]: any;
}

export interface MapContextType {
  map: Map | null;
  setMap: React.Dispatch<React.SetStateAction<Map | null>>;
  staticLayers: LayerGroup;
  reportContent: ReportContent | null;
  setReportContent: React.Dispatch<React.SetStateAction<ReportContent | null>>;
  highletVectorLayer: VectorLayer<VectorSource>;
  bufferLayer: VectorLayer<VectorSource>;
  aoiVectorLayer: VectorLayer<VectorSource>;
  dashboardTileLayers: LayerGroup;
  cdTileLayers: LayerGroup;
  assetsLayer: VectorLayer<VectorSource>;
  watershedLayer: VectorLayer<VectorSource>;
}

export interface AuthContextType {
  user: any; // Replace with proper user type if available
}

export interface LayerData {
  title: string;
  idx: string;
  layerName: string;
}