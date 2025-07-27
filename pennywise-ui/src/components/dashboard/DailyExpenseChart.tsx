'use client';

import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Box, Typography, Paper } from '@mui/material';
import { CURRENCY_SYMBOL } from '@/constants/transactions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyExpenseData {
  date: string;
  amount: number;
}

interface DailyExpenseChartProps {
  data: DailyExpenseData[];
  title?: string;
}

const DailyExpenseChart: React.FC<DailyExpenseChartProps> = ({
  data,
  title = 'Daily Expenses',
}) => {
  const theme = useTheme();
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Daily Expense',
        data: data.map(item => item.amount),
        backgroundColor: alpha(theme.palette.primary.main, 0.8),
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Expense: ${CURRENCY_SYMBOL}${context.parsed.y}`;
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
        <Bar data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default DailyExpenseChart; 