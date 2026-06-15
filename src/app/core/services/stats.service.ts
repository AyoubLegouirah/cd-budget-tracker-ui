import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryStat, MonthlyStat, BalanceStat } from '../models/stats.model';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/api/stats`;

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);

  getBalance(): Observable<BalanceStat> {
    return this.http.get<BalanceStat>(`${BASE}/balance`);
  }

  getByCategory(): Observable<CategoryStat[]> {
    return this.http.get<CategoryStat[]>(`${BASE}/by-category`);
  }

  getMonthly(): Observable<MonthlyStat[]> {
    return this.http.get<MonthlyStat[]>(`${BASE}/monthly`);
  }
}
