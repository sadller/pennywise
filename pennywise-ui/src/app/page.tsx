"use client";

import React from "react";
import { Box, Container } from "@mui/material";
import Grid from '@mui/material/Grid';
import LandingSiteHeader from "@/components/landing/LandingSiteHeader";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFeatureList from "@/components/landing/LandingFeatureList";
import LandingDashboardPreview from "@/components/landing/LandingDashboardPreview";
import LandingSiteFooter from "@/components/landing/LandingSiteFooter";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafbfc" }}>
      <LandingSiteHeader />
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="flex-start" justifyContent="center">
          {/* Left Column: Header + Features */}
          <Grid item xs={12} md={7} lg={7}>
            <LandingHeader />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <LandingFeatureList />
            </Box>
          </Grid>
          {/* Right Column: Dashboard Preview */}
          <Grid item xs={12} md={5} lg={5} sx={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            <LandingDashboardPreview />
          </Grid>
        </Grid>
      </Container>
      <LandingSiteFooter />
    </Box>
  );
}
