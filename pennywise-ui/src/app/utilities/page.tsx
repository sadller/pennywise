'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

const UtilitiesContent = () => {
  const router = useRouter();
  
  const handleCashbookImport = () => {
    router.push('/utilities/cashbook-import');
  };
  
  const handlePennywiseImport = () => {
    router.push('/utilities/pennywise-import');
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Utilities"
        subtitle="Tools and utilities to help manage your expenses"
      />
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: 3,
        mt: 2 
      }}>
        <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <UploadIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" component="h3">
                Cashbook Import
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Import your transactions from Cashbook application. Upload CSV files or connect directly to import your expense data.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleCashbookImport}
            >
              Import from Cashbook
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <UploadIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" component="h3">
                Import
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Import your transactions from a Pennywise CSV export file. This is a direct import with no field mapping required.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handlePennywiseImport}
            >
              Import CSV
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default function UtilitiesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedLayout>
        <UtilitiesContent />
      </AuthenticatedLayout>
    </QueryClientProvider>
  );
} 