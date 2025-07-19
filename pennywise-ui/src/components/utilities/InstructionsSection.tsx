import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider, Box, Chip } from '@mui/material';
import { CSVMappingService } from '@/services/csvMappingService';

const InstructionsSection: React.FC = () => {
  const { required, optional } = CSVMappingService.getSupportedHeaders();

  return (
    <Card sx={{ width: '100%', height: 'fit-content', minHeight: '400px' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          How to Export from Cashbook
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemText 
              primary="1. Open Cashbook application"
              secondary="Navigate to the export or backup section"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="2. Select Export Format"
              secondary="Choose CSV format for compatibility"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="3. Download Export File"
              secondary="Save the CSV file to your device"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="4. Upload Here"
              secondary="Drag and drop or click to upload"
            />
          </ListItem>
        </List>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Required CSV Headers:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Your CSV must have these column headers:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {required.map((field) => (
              <Chip 
                key={field} 
                label={field} 
                size="small" 
                variant="outlined" 
                color="primary"
              />
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Optional CSV Headers:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            These headers are optional but recommended:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {optional.map((field) => (
              <Chip 
                key={field} 
                label={field} 
                size="small" 
                variant="outlined" 
                color="secondary"
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Important Notes:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            • Only one of &quot;Cash In&quot; or &quot;Cash Out&quot; should have a value per row<br/>
            • &quot;Entry By&quot; field will be mapped to group members during import<br/>
            • Date format should be DD/MM/YYYY or YYYY-MM-DD<br/>
            • Time format should be HH:MM (24-hour format)<br/>
            • Category is optional - transactions without category will be imported
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InstructionsSection; 