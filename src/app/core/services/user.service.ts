import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

const BASE = 'http://localhost:8080/api/users';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getMe(): Observable<User> {
    return this.http.get<User>(`${BASE}/me`);
  }

  updateProfile(req: { firstName: string; lastName: string }): Observable<User> {
    return this.http.put<User>(`${BASE}/me`, req);
  }

  updatePassword(req: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.put<void>(`${BASE}/me/password`, req);
  }
}
