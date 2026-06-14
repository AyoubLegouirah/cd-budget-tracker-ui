import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Transaction, CreateTransactionRequest, PagedResponse, RecurringTransaction } from '../models/transaction.model';

export interface TransactionFilter {
  type?: string;
  categoryId?: number;
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);

  private _transactions = signal<Transaction[]>([]);
  readonly transactions = this._transactions.asReadonly();

  private _recurring = signal<RecurringTransaction[]>([]);
  readonly recurring = this._recurring.asReadonly();

  getRecurring(): Observable<RecurringTransaction[]> {
    return this.http.get<RecurringTransaction[]>('http://localhost:8080/api/transactions/recurring').pipe(
      tap(data => this._recurring.set(data))
    );
  }

  loadAll(): Observable<Transaction[]> {
    return this.http.get<PagedResponse<Transaction>>('http://localhost:8080/api/transactions').pipe(
      map(res => res.content),
      tap(data => this._transactions.set(data))
    );
  }

  loadByType(type: 'INCOME' | 'EXPENSE'): Observable<Transaction[]> {
    return this.http.get<PagedResponse<Transaction>>(`http://localhost:8080/api/transactions/type/${type}`).pipe(
      map(res => res.content),
      tap(data => this._transactions.set(data))
    );
  }

  loadByPeriod(from: string, to: string): Observable<Transaction[]> {
    return this.http.get<PagedResponse<Transaction>>(`http://localhost:8080/api/transactions/period?from=${from}&to=${to}`).pipe(
      map(res => res.content),
      tap(data => this._transactions.set(data))
    );
  }

  create(req: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>('http://localhost:8080/api/transactions', req).pipe(
      tap(tx => this._transactions.update(list => [tx, ...list]))
    );
  }

  loadFiltered(filter: TransactionFilter): Observable<Transaction[]> {
    let params = new HttpParams();
    if (filter.type && filter.type !== 'ALL') params = params.set('type', filter.type);
    if (filter.categoryId) params = params.set('categoryId', String(filter.categoryId));
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    return this.http.get<PagedResponse<Transaction>>('http://localhost:8080/api/transactions', { params }).pipe(
      map(res => res.content),
      tap(data => this._transactions.set(data))
    );
  }

  patchCategory(id: number, categoryId: number): Observable<Transaction> {
    return this.http.patch<Transaction>(`http://localhost:8080/api/transactions/${id}/category`, { categoryId }).pipe(
      tap(updated => this._transactions.update(list => list.map(t => t.id === id ? updated : t)))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/transactions/${id}`).pipe(
      tap(() => this._transactions.update(list => list.filter(t => t.id !== id)))
    );
  }
}
