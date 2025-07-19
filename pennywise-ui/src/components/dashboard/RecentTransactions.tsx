import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Button,
  Skeleton,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { RecentTransaction } from '@/services/dashboardService';

interface RecentTransactionsProps {
  recentTransactions: RecentTransaction[];
  isLoading: boolean;
  onViewTransactions: () => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  recentTransactions,
  isLoading,
  onViewTransactions,
}) => {
  return (
    <Card sx={{
      borderRadius: 3,
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <Box sx={{ bgcolor: 'primary.main', p: 3, color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          Recent Transactions
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Latest activity across all your groups
        </Typography>
      </Box>

      <CardContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={24} />
                    <Skeleton variant="text" width="50%" height={20} />
                  </Box>
                  <Skeleton variant="rectangular" width={80} height={24} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : recentTransactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No recent transactions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start adding transactions to see them here
            </Typography>
            <Button
              variant="outlined"
              onClick={onViewTransactions}
              sx={{ borderRadius: 2 }}
            >
              Add your first transaction
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {recentTransactions.slice(0, 5).map((transaction: RecentTransaction, index: number) => (
              <React.Fragment key={transaction.id}>
                <ListItem sx={{ px: 3, py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <MoneyIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`₹${transaction.amount.toFixed(2)} - ${transaction.note || 'No description'}`}
                    secondary={`${transaction.paid_by_name || 'Unknown'} • ${new Date(transaction.date).toLocaleDateString()}`}
                  />
                  <Chip
                    label={transaction.group_name}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                </ListItem>
                {index < Math.min(4, recentTransactions.length - 1) && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {recentTransactions.length > 0 && (
          <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              fullWidth
              onClick={onViewTransactions}
              sx={{ borderRadius: 2 }}
            >
              View All Transactions
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions; 