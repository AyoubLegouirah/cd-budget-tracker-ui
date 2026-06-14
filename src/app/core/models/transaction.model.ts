export type TransactionType = 'INCOME' | 'EXPENSE';

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  note: string;
  type: TransactionType;
  date: string;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  createdAt: string;
}

export type RecurringFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface RecurringTransaction {
  id: number;
  description: string;
  amount: number;
  monthlyAmount: number;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  frequency: RecurringFrequency;
  lastDate: string;
}

export interface CreateTransactionRequest {
  amount: number;
  description: string;
  note: string;
  type: TransactionType;
  date: string;
  account: { id: number };
  category: { id: number };
}
