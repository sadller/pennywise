import { Transaction, TransactionType } from '@/types/transaction';
import { CATEGORY_COLORS } from '@/constants/transactions';

export interface ExpenseBreakdownData {
  category: string;
  amount: number;
  color: string;
}

export interface IncomeTrendData {
  date: string;
  cumulativeIncome: number;
}

export interface ExpenseTrendData {
  date: string;
  cumulativeExpense: number;
}

export interface DailyExpenseData {
  date: string;
  amount: number;
}

export interface DashboardData {
  expenseBreakdown: ExpenseBreakdownData[];
  incomeTrend: IncomeTrendData[];
  expenseTrend: ExpenseTrendData[];
  dailyExpenses: DailyExpenseData[];
  recentTransactions: Transaction[];
  highValueTransactions: Transaction[];
}

const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other;
};

const processTransactionData = (transactions: Transaction[]): DashboardData => {
  // Filter only expense transactions for breakdown
  const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
  
  // Group by category for expense breakdown
  const categoryMap = new Map<string, number>();
  expenseTransactions.forEach(transaction => {
    const category = transaction.category || 'Other';
    categoryMap.set(category, (categoryMap.get(category) || 0) + transaction.amount);
  });

  const expenseBreakdown: ExpenseBreakdownData[] = Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    color: getCategoryColor(category),
  }));

  // Calculate income trend data (last 30 days)
  const incomeTrendData: IncomeTrendData[] = [];
  const expenseTrendData: ExpenseTrendData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    
    // Calculate cumulative income up to this date
    const cumulativeIncome = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate <= date && t.type === TransactionType.INCOME;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate cumulative expense up to this date
    const cumulativeExpense = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate <= date && t.type === TransactionType.EXPENSE;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    incomeTrendData.push({ date: dateStr, cumulativeIncome });
    expenseTrendData.push({ date: dateStr, cumulativeExpense });
  }

  // Calculate daily expenses (last 7 days)
  const dailyExpenses: DailyExpenseData[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    
    const dailyAmount = expenseTransactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === date.toDateString();
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    dailyExpenses.push({ date: dateStr, amount: dailyAmount });
  }

  // Get recent transactions (last 10)
  const recentTransactions = transactions
    .slice() // Create a copy to avoid mutating the observable array
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Get high value transactions (top 5 by amount)
  const highValueTransactions = transactions
    .slice()
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5);

  return {
    expenseBreakdown,
    incomeTrend: incomeTrendData,
    expenseTrend: expenseTrendData,
    dailyExpenses,
    recentTransactions,
    highValueTransactions,
  };
};

export const dashboardService = {
  getDashboardDataFromTransactions(transactions: Transaction[]): DashboardData {
    return processTransactionData(transactions);
  },
}; 