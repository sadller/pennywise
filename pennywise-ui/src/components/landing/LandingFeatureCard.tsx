import { Card, Avatar, Box, Typography } from "@mui/material";

interface LandingFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  avatarSx?: object;
}

const LandingFeatureCard = ({ icon, title, description, avatarSx }: LandingFeatureCardProps) => (
  <Card sx={{ 
    display: "flex", 
    alignItems: "center", 
    p: { xs: 1.5, sm: 2 }, 
    boxShadow: 0, 
    width: "100%",
    maxWidth: { xs: "100%", sm: "75%" }
  }}>
    <Avatar sx={{ mr: { xs: 1.5, sm: 2 }, ...avatarSx }}>{icon}</Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography fontWeight={600} sx={{ 
        fontSize: { xs: '0.875rem', sm: '1rem' }
      }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ 
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {description}
      </Typography>
    </Box>
  </Card>
);

export default LandingFeatureCard; 