'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Transaction, TransactionType, TransactionCreate } from '@/types/transaction';
import { GroupMember } from '@/types/group';
import { 
  getCategoryColor
} from '@/constants/transactions';
import { 
  groupTransactionsByDate, 
  formatDateLabel, 
  formatTime,
  getSortedDateKeys 
} from '@/utils/dateUtils';
import EditTransactionForm from './EditTransactionForm';
import { transactionService } from '@/services/transactionService';
import { useStore } from '@/stores/StoreProvider';

interface TransactionCardViewProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onDeleteTransaction?: (transaction: Transaction) => void;
  onEditTransaction?: () => void;
  groupMembers: GroupMember[];
  onEditStateChange?: (isEditing: boolean) => void;
  onLoadMore?: () => void;
  hasMoreTransactions?: boolean;
  isLoadingMore?: boolean;
}

interface TransactionCardProps {
  transaction: Transaction;
  isSelected?: boolean;
  isMultiSelectMode?: boolean;
  onLongPress?: (transaction: Transaction) => void;
  onSelect?: (transactionId: number, selected: boolean) => void;
  onCardClick?: (transaction: Transaction, event: React.MouseEvent<HTMLElement>) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  isSelected = false,
  isMultiSelectMode = false,
  onLongPress,
  onSelect,
  onCardClick,
}) => {
  const theme = useTheme();
  
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);


  const getPaidByName = (): string => {
    if (!transaction.paid_by) return 'Unknown';
    return transaction.paid_by_full_name || 'Unknown';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handleTouchStart = () => {
    if (isMultiSelectMode) return;
    
    const timer = setTimeout(() => {
      onLongPress?.(transaction);
    }, 500); // 500ms for long press
    
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isMultiSelectMode) {
      onSelect?.(transaction.id, !isSelected);
    } else {
      onCardClick?.(transaction, event);
    }
  };

  return (
    <Card
      sx={{
        mb: 1,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
        backgroundColor: isSelected ? theme.palette.primary.light + '20' : 'background.paper',
        overflow: 'visible',
        position: 'relative',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-1px)',
        },
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClick(e);
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, position: 'relative', overflow: 'visible' }}>
        {/* Multi-select checkbox - top left corner */}
        {isMultiSelectMode && (
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect?.(transaction.id, e.target.checked)}
            size="small"
            sx={{ 
              position: 'absolute',
              top: 8,
              left: 8,
              p: 0.5,
              zIndex: 1
            }}
          />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left side - Category, Payment Mode, Description, Entry info */}
          <Box sx={{ flex: 1, minWidth: 0, pl: isMultiSelectMode ? 3 : 0 }}>
            {/* Chips row */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={transaction.category || 'Other'}
                size="small"
                sx={{
                  backgroundColor: getCategoryColor(transaction.category || 'Other'),
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
              <Chip
                label={transaction.payment_mode || 'Cash'}
                size="small"
                sx={{
                  backgroundColor: theme.palette.grey[300],
                  color: theme.palette.grey[700],
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                mb: 0.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.85rem',
              }}
            >
              {transaction.note || 'No description'}
            </Typography>

            {/* Entry info */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.65rem' }}
            >
              Paid by {getPaidByName()} at {formatTime(transaction.date)}
            </Typography>
          </Box>

          {/* Right side - Amount */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Amount */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                color: transaction.type === TransactionType.INCOME 
                  ? 'success.main' 
                  : 'error.main',
                fontSize: '1rem',
              }}
            >
              {formatCurrency(transaction.amount)}
            </Typography>
          </Box>
        </Box>

      </CardContent>
    </Card>
  );
};

const TransactionCardView: React.FC<TransactionCardViewProps> = ({
  transactions,
  isLoading = false,
  onDeleteTransaction,
  onEditTransaction,
  groupMembers,
  onEditStateChange,
  onLoadMore,
  hasMoreTransactions = false,
  isLoadingMore = false,
}) => {
  const [selectedTransactions, setSelectedTransactions] = React.useState<Set<number>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [editFormOpen, setEditFormOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const open = Boolean(anchorEl);
  const { data, auth } = useStore();
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // Group transactions by date
  const dateGroups = React.useMemo(() => {
    return groupTransactionsByDate(transactions);
  }, [transactions]);

  const sortedDateKeys = React.useMemo(() => {
    return getSortedDateKeys(dateGroups);
  }, [dateGroups]);

  // Infinite scroll logic
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreTransactions && !isLoadingMore && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMoreTransactions, isLoadingMore, onLoadMore]);

  const handleTransactionLongPress = (transaction: Transaction) => {
    setIsMultiSelectMode(true);
    setSelectedTransactions(new Set([transaction.id]));
    onEditStateChange?.(true);
  };

  const handleTransactionSelect = (transactionId: number, selected: boolean) => {
    const newSelected = new Set(selectedTransactions);
    if (selected) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedTransactions(newSelected);
    
    if (newSelected.size === 0) {
      setIsMultiSelectMode(false);
      onEditStateChange?.(false);
    }
  };

  const handleDeleteSelected = () => {
    selectedTransactions.forEach(id => {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        onDeleteTransaction?.(transaction);
      }
    });
    setSelectedTransactions(new Set());
    setIsMultiSelectMode(false);
    onEditStateChange?.(false);
  };

  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false);
    setSelectedTransactions(new Set());
    onEditStateChange?.(false);
  };

  const handleCardClick = (transaction: Transaction, event: React.MouseEvent<HTMLElement>) => {
    // Close any open edit form first
    if (editFormOpen) {
      setEditFormOpen(false);
    }
    setSelectedTransaction(transaction);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleActionClick = (action: 'edit' | 'delete') => {
    if (selectedTransaction) {
      if (action === 'edit') {
        // Don't close menu immediately for edit - let the form handle it
        setEditFormOpen(true);
        setAnchorEl(null); // Close menu but keep selectedTransaction
      } else if (action === 'delete') {
        onDeleteTransaction?.(selectedTransaction);
        handleMenuClose();
      }
    }
  };

  const handleEditFormClose = () => {
    setEditFormOpen(false);
    setSelectedTransaction(null);
  };

  const handleTransactionUpdate = async (updateData: TransactionCreate & { id: number }) => {
    if (!selectedTransaction) return;
    
    setIsUpdating(true);
    try {
      // Call the API to update the transaction
      const updatedTransaction = await transactionService.updateTransaction(
        selectedTransaction.id, 
        updateData
      );
      
      // Update the store optimistically
      const updatedTransactions = data.allTransactions.map(t => 
        t.id === selectedTransaction.id ? updatedTransaction : t
      );
      data.setAllTransactions(updatedTransactions);
      
      // Notify parent component
      onEditTransaction?.();
      
      // Close the form
      handleEditFormClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error; // Re-throw to let EditTransactionForm handle the error
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading transactions...</Typography>
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        gap: 2,
        p: 3
      }}>
        <Box sx={{ 
          fontSize: '3rem', 
          color: 'grey.400',
          mb: 1
        }}>
          💰
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          No transactions yet
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Start tracking your expenses and income to see your financial journey here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Multi-select action bar */}
      {isMultiSelectMode && (
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            p: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <Typography variant="body2">
            {selectedTransactions.size} selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleDeleteSelected}
              disabled={selectedTransactions.size === 0}
            >
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
            <IconButton size="small" onClick={exitMultiSelectMode}>
              <Typography variant="body2">Cancel</Typography>
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Transaction groups by date */}
      {sortedDateKeys.map(dateKey => (
        <Box key={dateKey} sx={{ mb: 2 }}>
          {/* Date header */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 500,
              color: 'text.secondary',
              mb: 0.5,
              px: 1,
              fontSize: '0.8rem',
            }}
          >
            {formatDateLabel(dateKey)}
          </Typography>

          {/* Transaction cards for this date */}
          {dateGroups[dateKey].map(transaction => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              isSelected={selectedTransactions.has(transaction.id)}
              isMultiSelectMode={isMultiSelectMode}
              onLongPress={handleTransactionLongPress}
              onSelect={handleTransactionSelect}
              onCardClick={handleCardClick}
            />
          ))}
        </Box>
      ))}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 160,
            boxShadow: 3,
          },
        }}
      >
        <MenuItem onClick={() => handleActionClick('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleActionClick('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Transaction Form */}
      <EditTransactionForm
        open={editFormOpen}
        onClose={handleEditFormClose}
        onSubmit={handleTransactionUpdate}
        transaction={selectedTransaction}
        groupMembers={groupMembers}
        currentUser={auth.user!}
        isLoading={isUpdating}
      />

      {/* Infinite Scroll Load More Trigger */}
      {hasMoreTransactions && (
        <Box
          ref={loadMoreRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
            minHeight: 60,
          }}
        >
          {isLoadingMore ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading more transactions...
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Scroll down to load more
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TransactionCardView;