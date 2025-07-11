import { Card, Avatar, Box, Typography } from "@mui/material";

interface LandingFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  avatarSx?: object;
}

const LandingFeatureCard = ({ icon, title, description, avatarSx }: LandingFeatureCardProps) => (
  <Card sx={{ display: "flex", alignItems: "center", p: 2, boxShadow: 0, width: '75%' }}>
    <Avatar sx={{ mr: 2, ...avatarSx }}>{icon}</Avatar>
    <Box>
      <Typography fontWeight={600}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  </Card>
);

export default LandingFeatureCard; 