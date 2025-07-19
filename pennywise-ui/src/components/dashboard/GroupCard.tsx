import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Group as GroupIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { GroupStats } from '@/services/dashboardService';
import { User } from '@/types/user';

interface GroupCardProps {
  group: GroupStats;
  currentUser: User;
  isSelected: boolean;
  onGroupSelect: (groupId: number, groupName: string) => void;
  onAddMember: (groupId: number, groupName: string) => void;
  onDeleteGroup: (e: React.MouseEvent, group: GroupStats) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  currentUser,
  isSelected,
  onGroupSelect,
  onAddMember,
  onDeleteGroup,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'primary.50' : 'background.paper',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }
      }}
      onClick={() => onGroupSelect(group.id, group.name)}
    >
      <CardContent>
        {/* Group Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{
            bgcolor: isSelected ? 'primary.main' : 'primary.light',
            mr: 2,
            width: 48,
            height: 48
          }}>
            <GroupIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {group.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="body2" color="text.secondary">
                {group.owner_name}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onAddMember(group.id, group.name);
              }}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.50' }
              }}
            >
              <PersonAddIcon />
            </IconButton>
            {currentUser.id === group.owner_id && (
              <IconButton
                size="small"
                color="error"
                onClick={(e) => onDeleteGroup(e, group)}
                sx={{
                  opacity: 0.7,
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'error.light',
                    color: 'error.contrastText'
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Group Statistics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <PersonIcon sx={{ fontSize: 20, color: 'secondary.main', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {group.member_count}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Members
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <ReceiptIcon sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {group.transaction_count}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Transactions
            </Typography>
          </Box>
        </Box>

        {/* Total Amount */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <MoneyIcon sx={{ fontSize: 28, color: 'warning.main', mr: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              ₹{group.total_amount.toFixed(2)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Total Amount
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Group Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {new Date(group.created_at).toLocaleDateString()}
            </Typography>
          </Box>
          <Chip
            label={isSelected ? "Selected" : "View Details"}
            size="small"
            color={isSelected ? "success" : "primary"}
            variant={isSelected ? "filled" : "outlined"}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default GroupCard; 