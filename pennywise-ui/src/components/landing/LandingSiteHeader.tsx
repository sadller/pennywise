import { AppBar, Toolbar, Box, Typography, Button, Container, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Image from "next/image";
import { observer } from "mobx-react-lite";
import { useState } from "react";

const LandingSiteHeader = observer(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = () => {
    handleMenuClose();
    // Handle menu item clicks here
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Image src="/pennywise-logo.svg" alt="Pennywise Logo" width={40} height={40} priority />
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                Pennywise
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Smart Expense Tracking
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Button color="inherit" sx={{ textTransform: 'none' }}>Features</Button>
              <Button color="inherit" sx={{ textTransform: 'none' }}>About</Button>
              <Button color="inherit" sx={{ textTransform: 'none' }}>Contact</Button>
            </Box>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 150,
            boxShadow: 3,
            borderRadius: 2,
          }
        }}
      >
        <MenuItem onClick={handleMenuItemClick}>
          Features
        </MenuItem>
        <MenuItem onClick={handleMenuItemClick}>
          About
        </MenuItem>
        <MenuItem onClick={handleMenuItemClick}>
          Contact
        </MenuItem>
      </Menu>
    </AppBar>
  );
});

export default LandingSiteHeader; 