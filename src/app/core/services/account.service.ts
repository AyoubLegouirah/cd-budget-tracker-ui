import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Account, CreateAccountRequest } from '../models/account.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);

  private _accounts = signal<Account[]>([]);
  readonly accounts = this._accounts.asReadonly();

  loadAll(): Observable<Account[]> {
    return this.http.get<Account[]>(`${environment.apiUrl}/api/accounts`).pipe(
      tap(data => this._accounts.set(data))
    );
  }

  create(req: CreateAccountRequest): Observable<Account> {
    return this.http.post<Account>(`${environment.apiUrl}/api/accounts`, req).pipe(
      tap(account => this._accounts.update(list => [...list, account]))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/accounts/${id}`).pipe(
      tap(() => this._accounts.update(list => list.filter(a => a.id !== id)))
    );
  }
}
