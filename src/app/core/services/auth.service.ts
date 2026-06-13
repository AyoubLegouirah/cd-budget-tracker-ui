import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private _token = signal<string | null>(this.loadTokenFromStorage());
  private _currentUser = signal<User | null>(this.loadUserFromStorage());

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  private loadTokenFromStorage(): string | null {
    const raw = localStorage.getItem('token');
    return raw && raw !== 'null' && raw !== 'undefined' ? raw : null;
  }

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('http://localhost:8080/api/auth/login', req).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        const user: User = { userId: res.userId, email: res.email, firstName: res.firstName, lastName: res.lastName };
        localStorage.setItem('user', JSON.stringify(user));
        this._token.set(res.token);
        this._currentUser.set(user);
      })
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('http://localhost:8080/api/auth/register', req).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        const user: User = { userId: res.userId, email: res.email, firstName: res.firstName, lastName: res.lastName };
        localStorage.setItem('user', JSON.stringify(user));
        this._token.set(res.token);
        this._currentUser.set(user);
      })
    );
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this._currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
