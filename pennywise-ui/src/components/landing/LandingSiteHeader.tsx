import { AppBar, Toolbar, Box, Typography, Button, Container } from "@mui/material";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const LandingSiteHeader = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth');
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Image src="/pennywise-logo.svg" alt="Pennywise Logo" width={40} height={40} priority />
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                Pennywise
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Smart Expense Tracking
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button color="inherit" sx={{ textTransform: 'none' }}>Features</Button>
            <Button color="inherit" sx={{ textTransform: 'none' }}>About</Button>
            <Button color="inherit" sx={{ textTransform: 'none' }}>Contact</Button>
            {!user && (
              <Button 
                variant="contained"
                sx={{ textTransform: 'none', borderRadius: 2 }}
                onClick={handleLogin}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default LandingSiteHeader; 