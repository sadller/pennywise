"use client";

import React from "react";
import { Box, Container } from "@mui/material";
import LandingSiteHeader from "@/components/landing/LandingSiteHeader";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFeatureList from "@/components/landing/LandingFeatureList";
import LandingDashboardPreview from "@/components/landing/LandingDashboardPreview";
import LandingSiteFooter from "@/components/landing/LandingSiteFooter";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafbfc" }}>
      <LandingSiteHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 10 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
          gap: { xs: 4, sm: 6 },
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}>
          {/* Left Column: Header + Features */}
          <Box sx={{ order: { xs: 1, md: 1 } }}>
            <LandingHeader />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: { xs: 3, sm: 2 } }}>
              <LandingFeatureList />
            </Box>
          </Box>
          {/* Right Column: Dashboard Preview */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "flex-start", 
            justifyContent: "center",
            order: { xs: 2, md: 2 }
          }}>
            <LandingDashboardPreview />
          </Box>
        </Box>
      </Container>
      <LandingSiteFooter />
    </Box>
  );
}
