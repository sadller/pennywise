import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { GroupStats } from '@/services/dashboardService';

interface DashboardStatsProps {
  groupsWithStats: GroupStats[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ groupsWithStats }) => {
  const totalTransactions = groupsWithStats.reduce((sum, group) => sum + group.transaction_count, 0);
  const totalAmount = groupsWithStats.reduce((sum, group) => sum + group.total_amount, 0);
  const totalMembers = groupsWithStats.reduce((sum, group) => sum + group.member_count, 0);

  const stats = [
    {
      title: 'Total Groups',
      value: groupsWithStats.length,
      icon: GroupIcon,
      color: 'primary.main',
    },
    {
      title: 'Total Transactions',
      value: totalTransactions,
      icon: ReceiptIcon,
      color: 'success.main',
    },
    {
      title: 'Total Amount',
      value: `₹${totalAmount.toFixed(2)}`,
      icon: MoneyIcon,
      color: 'warning.main',
    },
    {
      title: 'Total Members',
      value: totalMembers,
      icon: PersonIcon,
      color: 'info.main',
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 6 }}>
      {stats.map((stat) => (
        <Card
          key={stat.title}
          sx={{
            bgcolor: stat.color,
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)' },
            transition: 'all 0.3s ease'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {stat.title}
                </Typography>
              </Box>
              <stat.icon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default DashboardStats; 