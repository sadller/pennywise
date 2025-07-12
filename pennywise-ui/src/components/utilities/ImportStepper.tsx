import React from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';

interface ImportStepperProps {
  activeStep: number;
  steps: readonly string[];
}

const ImportStepper: React.FC<ImportStepperProps> = ({ activeStep, steps }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Stepper activeStep={activeStep} orientation="horizontal">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ImportStepper; 