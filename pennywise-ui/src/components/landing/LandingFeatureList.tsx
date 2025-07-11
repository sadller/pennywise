import { Box } from "@mui/material";
import LandingFeatureCard from "./LandingFeatureCard";
import { TrendingUp, Security, Smartphone } from "@mui/icons-material";

const features = [
  {
    icon: <TrendingUp />,
    title: "Smart Insights",
    description: "Get personalized spending analytics and tips.",
    avatarSx: { bgcolor: "#fff3cd", color: "#fbc02d" },
  },
  {
    icon: <Security />,
    title: "Secure & Private",
    description: "Your data is encrypted and never shared.",
    avatarSx: { bgcolor: "#e3fcec", color: "#388e3c" },
  },
  {
    icon: <Smartphone />,
    title: "Mobile Friendly",
    description: "Access your dashboard anywhere, anytime.",
    avatarSx: { bgcolor: "#e3f2fd", color: "#1976d2" },
  },
];

const LandingFeatureList = () => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    gap: 2,
    height: '100%',
    justifyContent: 'space-between',
    minHeight: 350
  }}>
    {features.map((feature) => (
      <LandingFeatureCard key={feature.title} {...feature} />
    ))}
  </Box>
);

export default LandingFeatureList; 