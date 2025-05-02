import axios from 'axios';
import { WaterLevelResponse, ReservoirTimeSeriesData } from '../types/map.types';

/**
 * Fetches time series data for groundwater levels
 * @param unique_id The unique identifier for the groundwater station
 * @returns Array of groundwater level data points
 */
export const fetchTimeSeriesData = async (unique_id: string): Promise<WaterLevelResponse[]> => {
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

/**
 * Makes a POST request to a specified URL with a unique ID
 * @param url The API endpoint URL
 * @param unique_id The unique identifier for the feature
 * @returns Response data from the API
 */
export const postRequest = async (url: string, unique_id: string): Promise<{
  status?: string;
  data?: ReservoirTimeSeriesData[];
  error?: string;
}> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { unique_id } }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Error fetching data:', error);
    return { error: error.message };
  }
};