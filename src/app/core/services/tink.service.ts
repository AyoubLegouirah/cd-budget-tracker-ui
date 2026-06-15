import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TinkService {
  private readonly http = inject(HttpClient);

  getConnectUrl(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${environment.apiUrl}/api/tink/connect`);
  }

  importTransactions(code: string): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(`${environment.apiUrl}/api/tink/import`, { code });
  }
}
