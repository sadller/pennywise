import { Box, Card, CardContent, Typography } from "@mui/material";

const categories = [
  { label: "Food", amount: "₹995", percentage: 35, color: "success.main" },
  { label: "Transport", amount: "₹712", percentage: 25, color: "primary.main" },
  { label: "Shopping", amount: "₹569", percentage: 20, color: "warning.main" },
  { label: "Entertainment", amount: "₹427", percentage: 15, color: "secondary.main" },
];

const transactions = [
  { name: "Pizza Delivery", category: "Food & Dining", amount: "₹24.50", icon: "🍕" },
  { name: "Gas Station", category: "Transportation", amount: "₹45.00", icon: "⛽" },
  { name: "Grocery Store", category: "Shopping", amount: "₹87.30", icon: "🛒" },
];

const LandingDashboardPreview = () => (
  <Box sx={{ 
    width: "100%", 
    maxWidth: { xs: "100%", sm: 700 }, 
    minWidth: { xs: "auto", sm: 450 },
    px: { xs: 1, sm: 0 }
  }}>
    <Card sx={{ 
      borderRadius: 2, 
      overflow: "hidden", 
      boxShadow: 4, 
      display: 'flex', 
      flexDirection: 'column',
      width: "100%"
    }}>
      <Box sx={{ bgcolor: "primary.main", p: { xs: 2, sm: 2.5 }, color: "white", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        <Typography variant="h6" fontWeight={600}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, float: "right", mt: -3 }}>
          December 2024
        </Typography>
      </Box>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, flex: 1 }}>
        {/* Stats Row */}
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: "center", p: { xs: 1, sm: 1.5 }, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="error.main">
              ₹2,847
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Spent
            </Typography>
            <Typography variant="caption" color="success.main" display="block">
              +12% vs last month
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center", p: { xs: 1, sm: 1.5 }, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              ₹1,153
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Budget Left
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              32% remaining
            </Typography>
          </Box>
        </Box>
        {/* Chart Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Spending by Category
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {categories.map((item, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    width: { xs: 70, sm: 100 }, 
                    fontWeight: 500,
                    flexShrink: 0
                  }}
                >
                  {item.label}
                </Typography>
                <Box sx={{ 
                  flex: 1, 
                  position: 'relative',
                  minWidth: 0
                }}>
                  <Box sx={{ 
                    height: 10, 
                    bgcolor: "grey.200", 
                    borderRadius: 5, 
                    overflow: "hidden",
                    position: 'relative',
                    width: "100%"
                  }}>
                    <Box sx={{ 
                      height: "100%", 
                      width: `${item.percentage}%`, 
                      bgcolor: item.color, 
                      borderRadius: 5,
                      transition: 'width 0.3s ease'
                    }} />
                  </Box>
                </Box>
                <Typography 
                  variant="caption" 
                  fontWeight={600} 
                  sx={{ 
                    width: { xs: 50, sm: 70 }, 
                    textAlign: 'right',
                    flexShrink: 0
                  }}
                >
                  {item.amount}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        {/* Recent Transactions */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Recent Transactions
          </Typography>
          <Box>
            {transactions.map((item, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", py: 1, borderBottom: index < 2 ? "1px solid" : "none", borderColor: "divider" }}>
                <Typography variant="body2" sx={{ mr: { xs: 1, sm: 2 } }}>
                  {item.icon}
                </Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} sx={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {item.category}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600} color="error.main" sx={{ ml: 1 }}>
                  -{item.amount}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Box>
);

export default LandingDashboardPreview; 