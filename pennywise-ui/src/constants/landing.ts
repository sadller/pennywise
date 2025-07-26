// Landing page constants and demo data
export const LANDING_CONSTANTS = {
  // Demo categories for spending breakdown
  DEMO_CATEGORIES: [
    { label: "Food", amount: "₹995", percentage: 35, color: "success.main" },
    { label: "Transport", amount: "₹712", percentage: 25, color: "primary.main" },
    { label: "Shopping", amount: "₹569", percentage: 20, color: "warning.main" },
    { label: "Entertainment", amount: "₹427", percentage: 15, color: "secondary.main" },
  ] as const,

  // Demo transactions for recent activity
  DEMO_TRANSACTIONS: [
    { name: "Pizza Delivery", category: "Food & Dining", amount: "₹24.50", icon: "🍕" },
    { name: "Gas Station", category: "Transportation", amount: "₹45.00", icon: "⛽" },
    { name: "Grocery Store", category: "Shopping", amount: "₹87.30", icon: "🛒" },
  ] as const,

  // Feature highlights
  FEATURES: [
    {
      title: "Smart Expense Tracking",
      description: "Automatically categorize and track your daily expenses with intelligent insights",
      icon: "📊",
    },
    {
      title: "Group Budgeting",
      description: "Create shared budgets with friends and family for collaborative financial planning",
      icon: "👥",
    },
    {
      title: "Real-time Analytics",
      description: "Get instant insights into your spending patterns with beautiful charts and reports",
      icon: "📈",
    },
    {
      title: "Mobile-First Design",
      description: "Access your finances anywhere with our responsive PWA that works offline",
      icon: "📱",
    },
  ] as const,

  // App statistics
  STATS: [
    { label: "Active Users", value: "10K+" },
    { label: "Groups Created", value: "5K+" },
    { label: "Transactions Tracked", value: "1M+" },
    { label: "Money Saved", value: "₹50L+" },
  ] as const,
} as const; 