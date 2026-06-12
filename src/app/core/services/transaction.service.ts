import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Transaction, CreateTransactionRequest } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);

  private _transactions = signal<Transaction[]>([]);
  readonly transactions = this._transactions.asReadonly();

  loadAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>('http://localhost:8080/api/transactions').pipe(
      tap(data => this._transactions.set(data))
    );
  }

  loadByType(type: 'INCOME' | 'EXPENSE'): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`http://localhost:8080/api/transactions/type/${type}`).pipe(
      tap(data => this._transactions.set(data))
    );
  }

  loadByPeriod(from: string, to: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`http://localhost:8080/api/transactions/period?from=${from}&to=${to}`).pipe(
      tap(data => this._transactions.set(data))
    );
  }

  create(req: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>('http://localhost:8080/api/transactions', req).pipe(
      tap(tx => this._transactions.update(list => [tx, ...list]))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/transactions/${id}`).pipe(
      tap(() => this._transactions.update(list => list.filter(t => t.id !== id)))
    );
  }
}
