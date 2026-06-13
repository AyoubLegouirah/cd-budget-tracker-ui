export type TransactionType = 'INCOME' | 'EXPENSE';

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

export interface CreateTransactionRequest {
  amount: number;
  description: string;
  note: string;
  type: TransactionType;
  date: string;
  account: { id: number };
  category: { id: number };
}
