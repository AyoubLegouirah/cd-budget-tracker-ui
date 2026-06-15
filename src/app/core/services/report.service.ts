import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  downloadMonthlyReport(month: string): Observable<Blob> {
    const params = new HttpParams().set('month', month);
    return this.http.get(`${environment.apiUrl}/api/reports/monthly`, {
      params,
      responseType: 'blob'
    });
  }
}
