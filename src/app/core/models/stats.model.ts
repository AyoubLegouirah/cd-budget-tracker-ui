export interface CategoryStat {
  categoryName: string;
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
