import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';
import { TinkService } from '../../core/services/tink.service';
import { StatsService } from '../../core/services/stats.service';
import { BalanceStat, CategoryStat, MonthlyStat } from '../../core/models/stats.model';
import { RecurringTransaction } from '../../core/models/transaction.model';
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
  private readonly accountService = inject(AccountService);
  private readonly txService = inject(TransactionService);
  private readonly statsService = inject(StatsService);
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

  balance = signal<BalanceStat | null>(null);
  categoryStats = signal<CategoryStat[]>([]);
  monthlyStats = signal<MonthlyStat[]>([]);

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

  connectBank(): void {
    this.connectingBank.set(true);
    this.tinkService.getConnectUrl().subscribe({
      next: res => { window.location.href = res.url; },
      error: () => this.connectingBank.set(false)
    });
  }
}
