'use client';

import React from 'react';
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
  ChartOptions,
} from 'chart.js';
import { Box, Typography, Paper, alpha } from '@mui/material';
import { CURRENCY_SYMBOL } from '@/constants/transactions';
import { theme } from '@/theme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface IncomeData {
  date: string;
  cumulativeIncome: number;
}

interface IncomeTrendChartProps {
  data: IncomeData[];
  title?: string;
}

const IncomeTrendChart: React.FC<IncomeTrendChartProps> = ({
  data,
  title = 'Net Income Trend',
}) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Cumulative Income',
        data: data.map(item => item.cumulativeIncome),
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Income: ${CURRENCY_SYMBOL}${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `${CURRENCY_SYMBOL}${value}`;
          },
        },
      },
    },
  };

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 300 }}>
        {title}
      </Typography>
      <Box sx={{ height: 300, position: 'relative' }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default IncomeTrendChart; 