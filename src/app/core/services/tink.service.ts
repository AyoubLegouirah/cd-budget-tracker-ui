import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TinkService {
  private readonly http = inject(HttpClient);

  getConnectUrl(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>('http://localhost:8080/api/tink/connect');
  }

  importTransactions(code: string): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>('http://localhost:8080/api/tink/import', { code });
  }
}
