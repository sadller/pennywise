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

export interface DashboardDateRange {
  startDate?: Date;
  endDate?: Date;
}

const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other;
};

const processTransactionData = (
  transactions: Transaction[],
  dateRange?: DashboardDateRange
): DashboardData => {
  // Determine date range for trends
  let startDate: Date;
  let endDate: Date;
  if (dateRange?.startDate && dateRange?.endDate) {
    startDate = new Date(dateRange.startDate);
    endDate = new Date(dateRange.endDate);
  } else {
    endDate = new Date();
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 29); // default 30-day window
  }
  // Ensure startDate is before endDate
  if (startDate > endDate) {
    const tmp = startDate;
    startDate = endDate;
    endDate = tmp;
  }

  // Filter transactions within date range for calculations
  const rangeFiltered = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= startDate && d <= endDate;
  });

  // Filter only expense transactions for breakdown
  const expenseTransactions = rangeFiltered.filter(t => t.type === TransactionType.EXPENSE);

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

  // Calculate income & expense trends (cumulative)
  const incomeTrendData: IncomeTrendData[] = [];
  const expenseTrendData: ExpenseTrendData[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = new Date(d).toLocaleDateString();
    const cumulativeIncome = rangeFiltered
      .filter(t => new Date(t.date) <= d && t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const cumulativeExpense = rangeFiltered
      .filter(t => new Date(t.date) <= d && t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    incomeTrendData.push({ date: dateStr, cumulativeIncome });
    expenseTrendData.push({ date: dateStr, cumulativeExpense });
  }

  // Daily expenses for the entire selected date range
  const dailyExpenses: DailyExpenseData[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = new Date(d).toLocaleDateString();
    const dailyAmount = expenseTransactions
      .filter(t => new Date(t.date).toDateString() === d.toDateString())
      .reduce((sum, t) => sum + t.amount, 0);
    dailyExpenses.push({ date: dateStr, amount: dailyAmount });
  }

  // Recent & high value transactions from rangeFiltered
  const recentTransactions = rangeFiltered.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  const highValueTransactions = rangeFiltered.slice().sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 5);

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
  getDashboardDataFromTransactions(transactions: Transaction[], dateRange?: DashboardDateRange): DashboardData {
    return processTransactionData(transactions, dateRange);
  },
}; 