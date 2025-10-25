'use client';

import React, { useState } from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  Mic as MicIcon,
} from '@mui/icons-material';

interface ExpandableFabProps {
  onAddTransaction: () => void;
  onOpenVoiceTransaction: () => void;
  disabled?: boolean;
}

export default function ExpandableFab({
  onAddTransaction,
  onOpenVoiceTransaction,
  disabled = false,
}: ExpandableFabProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const actions = [
    {
      icon: <AddIcon />,
      name: 'Add Transaction',
      action: () => {
        handleClose();
        onAddTransaction();
      },
    },
    {
      icon: <MicIcon />,
      name: 'Voice Transaction',
      action: () => {
        handleClose();
        onOpenVoiceTransaction();
      },
    },
  ];

  // Don't render if disabled
  if (disabled) {
    return null;
  }

  return (
    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
      <SpeedDial
        ariaLabel="Transaction actions"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          '& .MuiFab-primary': {
            width: 56,
            height: 56,
          },
        }}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
            sx={{
              '& .MuiSpeedDialAction-fab': {
                width: 48,
                height: 48,
              },
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
} 