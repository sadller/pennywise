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
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h2" fontWeight="bold" gutterBottom>
        Take Control of Your {" "}
        <Box component="span" color="primary.main" display="inline">
          Finances
        </Box>
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track expenses, manage budgets, and achieve your financial goals with our intuitive expense tracking application.
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ borderRadius: 2, px: 4 }}
          onClick={handleGetStarted}
        >
          {auth.user ? 'Dashboard' : 'Get Started'}
        </Button>
        <Button variant="outlined" size="large" sx={{ borderRadius: 2, px: 4 }}>
          Learn More
        </Button>
      </Box>
    </Box>
  );
});

export default LandingHeader; 