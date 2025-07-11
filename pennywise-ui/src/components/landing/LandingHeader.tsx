import { Box, Typography, Button } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/StoreProvider";
import { useRouter } from "next/navigation";

const LandingHeader = observer(() => {
  const { auth } = useStore();
  const router = useRouter();

  const handleGetStarted = () => {
    if (auth.user) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <Box sx={{ maxWidth: { xs: "100%", sm: 480 } }}>
      <Typography 
        variant="h2" 
        fontWeight="bold" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          lineHeight: { xs: 1.2, sm: 1.3 }
        }}
      >
        Take Control of Your {" "}
        <Box component="span" color="primary.main" display="inline">
          Finances
        </Box>
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          mb: { xs: 3, sm: 4 },
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}
      >
        Track expenses, manage budgets, and achieve your financial goals with our intuitive expense tracking application.
      </Typography>
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 2 }, 
        mb: { xs: 3, sm: 4 }
      }}>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ 
            borderRadius: 2, 
            px: { xs: 3, sm: 4 },
            py: { xs: 1.5, sm: 1.75 }
          }}
          onClick={handleGetStarted}
        >
          {auth.user ? 'Dashboard' : 'Get Started'}
        </Button>
        <Button 
          variant="outlined" 
          size="large" 
          sx={{ 
            borderRadius: 2, 
            px: { xs: 3, sm: 4 },
            py: { xs: 1.5, sm: 1.75 }
          }}
        >
          Learn More
        </Button>
      </Box>
    </Box>
  );
});

export default LandingHeader; 