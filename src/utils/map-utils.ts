import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { XYZLayerProps } from '../types/layer-types';

export const createBaseMapLayer = (xyzData: XYZLayerProps, visible = false): TileLayer<XYZ> => {
  const baseMapSource = new XYZ({
    maxZoom: xyzData.maxZoom,
    attributions: xyzData.attributions,
    attributionsCollapsible: true,
    url: xyzData.url,
    crossOrigin: 'Anonymous',
  });
  
  return new TileLayer({
    source: baseMapSource,
    properties: {
      title: xyzData.title,
      imageThumb: xyzData.image,
    },
    visible,
  });
};

export const generateMapImg = (map: any, format: string): void => {
  // Implementation of map image generation
  console.log(`Generating ${format} map image`);
  // Actual implementation would go here
};

export const generatePdfReport = (
  map: any, 
  setModalOpen: (open: boolean) => void, 
  setReportContent: (content: any) => void
): void => {
  // Implementation of PDF report generation
  console.log('Generating PDF report');
  // Actual implementation would go here
  setModalOpen(true);
  setReportContent({ mapImage: 'map-image-data' });
};