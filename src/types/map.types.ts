import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';

export interface GroundwaterProperties {
  'Object ID'?: string;
  'Unique ID'?: string;
  'Site ID'?: string;
  'State Name'?: string;
  'District Name'?: string;
  'Block Name'?: string;
  'Site Name'?: string;
  'Site Type'?: string;
  Depth?: string;
  Longitude?: string;
  Latitude?: string;
  'Water Level (mbgl)'?: string;
  [key: string]: any;
}

export interface ReservoirProperties {
  'Name of the Reservoir'?: string;
  'State Name'?: string;
  Latitude?: string;
  Longitude?: string;
  'Full Reservoir Level (FRL) (in m)'?: string;
  'Live Capacity at FRL (in bcm)'?: string;
  'Benefits Irrigation (cca) (in kha)'?: string;
  'Hydro Electric (in MW)'?: string;
  Basin?: string;
  unique_id?: string;
  [key: string]: any;
}

export interface FeatureInfo {
  properties: GroundwaterProperties | ReservoirProperties;
  geometry?: any;
  type?: string;
}

export interface GroundwaterDataPoint {
  date: string;
  waterLevel: number;
}

export interface WaterLevelResponse {
  date: string;
  wl_mbgl: string | null;
  [key: string]: any;
}

export interface ReservoirTimeSeriesData {
  acq_dt: string;
  current_reservoir_level_m: string;
  current_live_storage_bcm: string;
  [key: string]: any;
}

export interface ReservoirChartData {
  unique_id: string;
  labels: string[];
  reservoirLevels: number[];
  storageValues: number[];
}

export interface ReservoirInfo {
  name_of_reservoir?: string;
  capacity_bcm?: string;
  state?: string;
  longitude?: string;
  latitude?: string;
  [key: string]: any;
}

export interface VisibleLayers {
  reservoir: boolean;
  groundwater: boolean;
}

export interface FilteredChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    borderWidth: number;
    tension: number;
    fill: boolean;
  }[];
}

export interface ChartDataFilters {
  labels: string[];
  reservoirLevels: number[];
  storageValues: number[];
}

export type ChartType = 'reservoir' | 'storage' | 'both';

export interface MapLayerConfig {
  url: string;
  layers: string;
  format: string;
  transparent: boolean;
}

export type MapLayer = ImageLayer<ImageWMS>;