import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";

const LandingSiteFooter = () => (
  <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', py: 6, mt: 8 }}>
    <Container maxWidth="lg">
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        gap: 4 
      }}>
        <Box sx={{ gridColumn: { xs: '1', md: '1 / 3' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Image src="/pennywise-logo.svg" alt="Pennywise Logo" width={32} height={32} />
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              Pennywise
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Smart expense tracking for everyone. Take control of your finances with our intuitive and secure platform.
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Product
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Features</Typography>
            <Typography variant="body2" color="text.secondary">Pricing</Typography>
            <Typography variant="body2" color="text.secondary">API</Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Company
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">About</Typography>
            <Typography variant="body2" color="text.secondary">Blog</Typography>
            <Typography variant="body2" color="text.secondary">Careers</Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Support
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Help Center</Typography>
            <Typography variant="body2" color="text.secondary">Contact</Typography>
            <Typography variant="body2" color="text.secondary">Privacy</Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Connect
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Twitter</Typography>
            <Typography variant="body2" color="text.secondary">LinkedIn</Typography>
            <Typography variant="body2" color="text.secondary">GitHub</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 4, pt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          &copy; 2024 Pennywise. All rights reserved.
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default LandingSiteFooter; 