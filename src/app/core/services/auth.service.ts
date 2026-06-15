import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private _currentUser = signal<User | null>(this.loadUserFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, req).pipe(
      tap(res => {
        const user: User = { userId: res.userId, email: res.email, firstName: res.firstName, lastName: res.lastName };
        localStorage.setItem('user', JSON.stringify(user));
        this._currentUser.set(user);
      })
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, req).pipe(
      tap(res => {
        const user: User = { userId: res.userId, email: res.email, firstName: res.firstName, lastName: res.lastName };
        localStorage.setItem('user', JSON.stringify(user));
        this._currentUser.set(user);
      })
    );
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this._currentUser.set(user);
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/api/auth/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  private clearSession(): void {
    localStorage.removeItem('user');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
