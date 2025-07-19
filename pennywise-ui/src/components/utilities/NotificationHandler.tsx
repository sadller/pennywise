import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';

export const NotificationHandler: React.FC = observer(() => {
  const { cashbookImport } = useStore();

  const handleClose = () => {
    cashbookImport.setNotification(null);
  };

  return (
    <Snackbar
      open={!!cashbookImport.notification}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert 
        onClose={handleClose} 
        severity={cashbookImport.notification?.type || 'info'}
        sx={{ width: '100%' }}
      >
        {cashbookImport.notification?.message}
      </Alert>
    </Snackbar>
  );
}); 