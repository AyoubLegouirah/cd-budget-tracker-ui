import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';
import { TinkService } from '../../core/services/tink.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly accountService = inject(AccountService);
  private readonly txService = inject(TransactionService);
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

  readonly totalBalance = computed(() =>
    this.accounts().reduce((sum, a) => sum + a.balance, 0)
  );

  readonly totalIncome = computed(() =>
    this.transactions()
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly totalExpense = computed(() =>
    this.transactions()
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly recentTransactions = computed(() =>
    [...this.transactions()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  );

  readonly expenseByCategory = computed(() => {
    const map = new Map<string, { name: string; color: string; icon: string; total: number }>();
    this.transactions()
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        const existing = map.get(t.categoryName) ?? { name: t.categoryName, color: t.categoryColor, icon: t.categoryIcon, total: 0 };
        existing.total += t.amount;
        map.set(t.categoryName, existing);
      });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  });

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
    this.accountService.loadAll().subscribe();
    this.txService.loadAll().subscribe({
      complete: () => this.loading.set(false)
    });
  }

  connectBank(): void {
    this.connectingBank.set(true);
    this.tinkService.getConnectUrl().subscribe({
      next: res => { window.location.href = res.url; },
      error: () => this.connectingBank.set(false)
    });
  }

  getBarWidth(amount: number): string {
    const max = Math.max(...this.expenseByCategory().map(c => c.total), 1);
    return `${(amount / max) * 100}%`;
  }
}
