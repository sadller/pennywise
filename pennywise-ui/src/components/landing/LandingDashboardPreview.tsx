import { Box, Card, CardContent, Typography } from "@mui/material";
import { LANDING_CONSTANTS } from "@/constants/landing";

const LandingDashboardPreview = () => (
  <Box sx={{ 
    width: "100%", 
    maxWidth: { xs: "100%", sm: 700 }, 
    minWidth: { xs: "auto", sm: 450 },
    px: { xs: 1, sm: 0 }
  }}>
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid',
      borderColor: 'grey.200',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Spending Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your expenses and stay on top of your budget
          </Typography>
        </Box>

        {/* Spending by Category */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Spending by Category
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {LANDING_CONSTANTS.DEMO_CATEGORIES.map((item, index) => (
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {LANDING_CONSTANTS.DEMO_TRANSACTIONS.map((transaction, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 1,
                borderRadius: 1,
                bgcolor: 'grey.50'
              }}>
                <Box sx={{ fontSize: '1.2rem' }}>
                  {transaction.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} noWrap>
                    {transaction.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {transaction.category}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  {transaction.amount}
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