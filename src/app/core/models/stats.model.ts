export interface CategoryStat {
  categoryName: string;
  icon?: string;
  color: string;
  total: number;
}

export interface MonthlyStat {
  month: string;
  totalIncome: number;
  totalExpense: number;
}

export interface BalanceStat {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
}

export interface ForecastStat {
  totalSpentSoFar: number;
  daysElapsed: number;
  totalDaysInMonth: number;
  dailyRate: number;
  percentageOfMonthElapsed: number;
  projectedTotal: number;
  projectedSavings: number;
  totalIncome: number;
}
