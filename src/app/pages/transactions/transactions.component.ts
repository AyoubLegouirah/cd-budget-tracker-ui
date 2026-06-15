import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { CreateTransactionRequest, TransactionType } from '../../core/models/transaction.model';

const PAGE_SIZE = 25;

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit {
  private readonly txService = inject(TransactionService);
  private readonly accountService = inject(AccountService);
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  readonly transactions = this.txService.transactions;
  readonly accounts = this.accountService.accounts;
  readonly categories = this.categoryService.categories;

  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  formError = signal('');
  patchingIds = signal<Set<number>>(new Set());

  // Filter state
  filterSearch = signal('');
  filterType = signal<string>('ALL');
  filterCategoryId = signal<number>(0);
  filterFrom = signal('');
  filterTo = signal('');

  // Pagination state
  currentPage = signal(1);

  readonly sorted = computed(() =>
    [...this.transactions()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sorted().length / PAGE_SIZE)));

  readonly paginated = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * PAGE_SIZE;
    return this.sorted().slice(start, start + PAGE_SIZE);
  });

  readonly visiblePages = computed((): (number | null)[] => {
    const total = this.totalPages();
    const current = Math.min(this.currentPage(), total);
    const pages = new Set<number>([1, total]);
    for (let i = current - 2; i <= current + 2; i++) {
      if (i >= 1 && i <= total) pages.add(i);
    }
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result: (number | null)[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(null);
      result.push(sorted[i]);
    }
    return result;
  });

  form = {
    amount: 0,
    description: '',
    note: '',
    type: 'EXPENSE' as TransactionType,
    date: new Date().toISOString().split('T')[0],
    accountId: 0,
    categoryId: 0
  };

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.applyFilters());
  }

  onSearchInput(val: string): void {
    this.filterSearch.set(val);
    this.currentPage.set(1);
    this.searchSubject.next(val);
  }

  ngOnInit(): void {
    this.txService.loadAll().subscribe();
    this.accountService.loadAll().subscribe();
    this.categoryService.loadAll().subscribe({
      complete: () => this.loading.set(false)
    });
  }

  applyFilters(): void {
    this.loading.set(true);
    this.currentPage.set(1);
    this.txService.loadFiltered({
      type: this.filterType(),
      categoryId: this.filterCategoryId() || undefined,
      from: this.filterFrom() || undefined,
      to: this.filterTo() || undefined,
      search: this.filterSearch() || undefined
    }).subscribe({ complete: () => this.loading.set(false), error: () => this.loading.set(false) });
  }

  setCurrentMonth(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.filterFrom.set(firstDay.toISOString().split('T')[0]);
    this.filterTo.set(now.toISOString().split('T')[0]);
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterSearch.set('');
    this.filterType.set('ALL');
    this.filterCategoryId.set(0);
    this.filterFrom.set('');
    this.filterTo.set('');
    this.currentPage.set(1);
    this.loading.set(true);
    this.txService.loadAll().subscribe({ complete: () => this.loading.set(false) });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  patchCategory(txId: number, categoryId: number): void {
    this.patchingIds.update(s => new Set([...s, txId]));
    this.txService.patchCategory(txId, categoryId).subscribe({
      complete: () => this.patchingIds.update(s => { const n = new Set(s); n.delete(txId); return n; }),
      error: () => this.patchingIds.update(s => { const n = new Set(s); n.delete(txId); return n; })
    });
  }

  saveTransaction(): void {
    if (!this.form.amount || !this.form.description || !this.form.accountId || !this.form.categoryId) {
      this.formError.set('Please fill in all required fields.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    const req: CreateTransactionRequest = {
      amount: this.form.amount,
      description: this.form.description,
      note: this.form.note,
      type: this.form.type,
      date: this.form.date,
      account: { id: this.form.accountId },
      category: { id: this.form.categoryId }
    };
    this.txService.create(req).subscribe({
      next: () => {
        this.showForm.set(false);
        this.resetForm();
        this.saving.set(false);
      },
      error: () => {
        this.formError.set('Failed to save transaction.');
        this.saving.set(false);
      }
    });
  }

  deleteTransaction(id: number): void {
    if (!confirm('Delete this transaction?')) return;
    this.txService.delete(id).subscribe();
  }

  private resetForm(): void {
    this.form = {
      amount: 0,
      description: '',
      note: '',
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      accountId: 0,
      categoryId: 0
    };
  }
}
