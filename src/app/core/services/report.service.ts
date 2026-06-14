import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  downloadMonthlyReport(month: string): Observable<Blob> {
    const params = new HttpParams().set('month', month);
    return this.http.get('http://localhost:8080/api/reports/monthly', {
      params,
      responseType: 'blob'
    });
  }
}
