import { ReservoirChartData, ChartDataFilters, FilteredChartData, ChartType } from '../types/map.types';

/**
 * Filters chart data based on date range
 * @param chartData The reservoir chart data
 * @param fromDate Start date for filtering
 * @param toDate End date for filtering
 * @param selectedChart The type of chart to display
 * @returns Filtered chart data ready for display
 */
export const filterChartData = (
  chartData: ReservoirChartData | null,
  fromDate: string,
  toDate: string,
  selectedChart: ChartType
): FilteredChartData => {
  if (!chartData) return { labels: [], datasets: [] };

  const fromTimestamp = fromDate ? new Date(fromDate).getTime() : null;
  const toTimestamp = toDate ? new Date(toDate).getTime() : null;

  const filteredData = chartData.labels.reduce<ChartDataFilters>(
    (acc, label, index) => {
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
    }, 
    { labels: [], reservoirLevels: [], storageValues: [] }
  );

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
};

/**
 * Processes groundwater data for display
 * @param timeSeriesData Raw data from the API
 * @returns Processed groundwater data points
 */
export const processGroundwaterData = (timeSeriesData: any[]): {
  processedData: { date: string; waterLevel: number }[];
  fromDate: string;
  toDate: string;
} => {
  if (!timeSeriesData.length) {
    return { processedData: [], fromDate: '', toDate: '' };
  }
  
  const processedData = timeSeriesData
    .filter(entry => entry.wl_mbgl !== null)
    .map(entry => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      waterLevel: parseFloat(entry.wl_mbgl),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return {
    processedData,
    fromDate: processedData.length ? processedData[0].date : '',
    toDate: processedData.length ? processedData[processedData.length - 1].date : '',
  };
};