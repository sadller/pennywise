import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider, Box, Chip } from '@mui/material';

interface InstructionsSectionProps {
  supportedFields: readonly string[];
}

const InstructionsSection: React.FC<InstructionsSectionProps> = ({ supportedFields }) => {
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
            Supported Fields:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {supportedFields.map((field) => (
              <Chip key={field} label={field} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InstructionsSection; 