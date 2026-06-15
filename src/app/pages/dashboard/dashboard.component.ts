import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';
import { TinkService } from '../../core/services/tink.service';
import { StatsService } from '../../core/services/stats.service';
import { ReportService } from '../../core/services/report.service';
import { BalanceStat, CategoryStat, MonthlyStat, ForecastStat } from '../../core/models/stats.model';
import { PieChartComponent } from '../../shared/charts/pie-chart.component';
import { BarChartComponent } from '../../shared/charts/bar-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink, PieChartComponent, BarChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  constructor() {
    effect(() => this.loadForecast(this.selectedMonth()));
  }
  private readonly accountService = inject(AccountService);
  private readonly txService = inject(TransactionService);
  private readonly statsService = inject(StatsService);
  private readonly reportService = inject(ReportService);
  private readonly tinkService = inject(TinkService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly accounts = this.accountService.accounts;
  readonly transactions = this.txService.transactions;

  loading = signal(true);
  tinkSuccess = signal(false);
  tinkError = signal(false);
  importedCount = signal(0);
  connectingBank = signal(false);
  exportLoading = signal(false);
  exportError = signal('');

  readonly selectedMonth = signal(DashboardComponent.currentYearMonth());

  readonly selectedMonthLabel = computed(() => {
    const [y, m] = this.selectedMonth().split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  });

  readonly isCurrentMonth = computed(() =>
    this.selectedMonth() === DashboardComponent.currentYearMonth()
  );

  balance = signal<BalanceStat | null>(null);
  categoryStats = signal<CategoryStat[]>([]);
  monthlyStats = signal<MonthlyStat[]>([]);
  forecast = signal<ForecastStat | null>(null);
  forecastLoading = signal(false);

  readonly projectedTotalIsWarning = computed(() => {
    const f = this.forecast();
    if (!f || f.totalIncome <= 0) return false;
    const ratio = f.projectedTotal / f.totalIncome;
    return ratio > 0.8 && ratio <= 1.0;
  });

  readonly projectedTotalIsDanger = computed(() => {
    const f = this.forecast();
    if (!f || f.totalIncome <= 0) return false;
    return f.projectedTotal > f.totalIncome;
  });

  readonly projectedSavingsIsPositive = computed(() => (this.forecast()?.projectedSavings ?? 0) >= 0);

  readonly recurringTransactions = this.txService.recurring;

  readonly totalMonthlyRecurring = computed(() =>
    this.recurringTransactions()
      .filter(r => r.type === 'EXPENSE')
      .reduce((sum, r) => sum + (r.monthlyAmount ?? r.amount), 0)
  );

  readonly recurringTotalLabel = computed(() => {
    const list = this.recurringTransactions();
    const hasIncome = list.some(r => r.type === 'INCOME');
    const hasExpense = list.some(r => r.type === 'EXPENSE');
    return hasIncome && hasExpense ? 'Balance récurrente' : 'Total abonnements';
  });

  readonly totalCategoryExpense = computed(() =>
    this.categoryStats().reduce((sum, s) => sum + s.total, 0)
  );

  readonly recentTransactions = computed(() =>
    [...this.transactions()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  );

  private readonly frequencyLabels: Record<string, string> = {
    WEEKLY: 'Hebdomadaire',
    BIWEEKLY: 'Bi-mensuel',
    MONTHLY: 'Mensuel',
    QUARTERLY: 'Trimestriel',
    YEARLY: 'Annuel',
  };

  frequencyLabel(freq: string): string {
    return this.frequencyLabels[freq] ?? freq;
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['tink'] === 'success') {
      this.importedCount.set(Number(params['imported'] ?? 0));
      this.tinkSuccess.set(true);
      this.router.navigate([], { replaceUrl: true, queryParams: {} });
    } else if (params['tink'] === 'error') {
      this.tinkError.set(true);
      this.router.navigate([], { replaceUrl: true, queryParams: {} });
    }

    forkJoin({
      accounts: this.accountService.loadAll(),
      transactions: this.txService.loadAll(),
      balance: this.statsService.getBalance(),
      categories: this.statsService.getByCategory(),
      monthly: this.statsService.getMonthly(),
      recurring: this.txService.getRecurring(),
    }).subscribe({
      next: res => {
        this.balance.set(res.balance);
        this.categoryStats.set(res.categories);
        this.monthlyStats.set(res.monthly);
      },
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }

  prevMonth(): void {
    const [y, m] = this.selectedMonth().split('-').map(Number);
    this.selectedMonth.set(DashboardComponent.toYearMonth(new Date(y, m - 2, 1)));
    this.exportError.set('');
  }

  nextMonth(): void {
    if (this.isCurrentMonth()) return;
    const [y, m] = this.selectedMonth().split('-').map(Number);
    this.selectedMonth.set(DashboardComponent.toYearMonth(new Date(y, m, 1)));
    this.exportError.set('');
  }

  exportPdf(): void {
    this.exportLoading.set(true);
    this.exportError.set('');
    const month = this.selectedMonth();
    this.reportService.downloadMonthlyReport(month).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bilan-${month}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.exportLoading.set(false);
      },
      error: () => {
        this.exportError.set('Erreur lors de la génération du PDF');
        this.exportLoading.set(false);
      }
    });
  }

  connectBank(): void {
    this.connectingBank.set(true);
    this.tinkService.getConnectUrl().subscribe({
      next: res => { window.location.href = res.url; },
      error: () => this.connectingBank.set(false)
    });
  }

  private loadForecast(month: string): void {
    this.forecastLoading.set(true);
    this.statsService.getForecast(month).subscribe({
      next: data => {
        this.forecast.set(data);
        this.forecastLoading.set(false);
      },
      error: () => {
        this.forecast.set(null);
        this.forecastLoading.set(false);
      }
    });
  }

  private static currentYearMonth(): string {
    return DashboardComponent.toYearMonth(new Date());
  }

  private static toYearMonth(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}
