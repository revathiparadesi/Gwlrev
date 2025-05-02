import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/joy';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { GroundwaterDataPoint } from '../../../types/map-types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GroundwaterChartProps {
  unique_id: string;
  gwChartData: GroundwaterDataPoint[];
}

const GroundwaterChart: React.FC<GroundwaterChartProps> = ({ unique_id, gwChartData }) => {
  const chartData = useMemo(() => {
    // Sort data by date
    const sortedData = [...gwChartData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return {
      labels: sortedData.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Groundwater Level (m)',
          data: sortedData.map(item => item.level),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3,
        }
      ]
    };
  }, [gwChartData]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        reverse: true, // Higher values (deeper) should appear lower on chart
        title: {
          display: true,
          text: 'Depth to Water (meters)',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Groundwater Level Over Time - Well ID: ${unique_id}`,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Depth: ${context.parsed.y.toFixed(2)}m`,
        }
      }
    },
  };

  return (
    <Box sx={{ width: '100%', height: '90%', padding: 2 }}>
      {gwChartData.length > 0 ? (
        <Box sx={{ width: '100%', height: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      ) : (
        <Typography sx={{ textAlign: 'center', marginTop: 4 }}>
          No groundwater data available for this location.
        </Typography>
      )}
    </Box>
  );
};

export default GroundwaterChart;