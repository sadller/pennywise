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
import { Box, Typography, Paper } from '@mui/material';
import { CURRENCY_SYMBOL } from '@/constants/transactions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ExpenseData {
  date: string;
  cumulativeExpense: number;
}

interface ExpenseTrendChartProps {
  data: ExpenseData[];
  title?: string;
}

const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({
  data,
  title = 'Net Expense Trend',
}) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Cumulative Expense',
        data: data.map(item => item.cumulativeExpense),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
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
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default ExpenseTrendChart; 