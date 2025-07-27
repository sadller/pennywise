'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Box, Typography, Paper } from '@mui/material';
import { CURRENCY_SYMBOL } from '@/constants/transactions';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseData {
  category: string;
  amount: number;
  color: string;
}

interface ExpenseBreakdownChartProps {
  data: ExpenseData[];
  title?: string;
}

const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({
  data,
  title = 'Expense Breakdown',
}) => {
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.amount),
        backgroundColor: data.map(item => item.color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${CURRENCY_SYMBOL}${value} (${percentage}%)`;
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
        <Doughnut data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default ExpenseBreakdownChart; 