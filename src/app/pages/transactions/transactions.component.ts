import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { CreateTransactionRequest, TransactionType } from '../../core/models/transaction.model';

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

  readonly transactions = this.txService.transactions;
  readonly accounts = this.accountService.accounts;
  readonly categories = this.categoryService.categories;

  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  formError = signal('');

  filterType = signal<string>('ALL');
  filterFrom = signal('');
  filterTo = signal('');

  form = {
    amount: 0,
    description: '',
    note: '',
    type: 'EXPENSE' as TransactionType,
    date: new Date().toISOString().split('T')[0],
    accountId: 0,
    categoryId: 0
  };

  readonly filtered = computed(() => {
    let list = [...this.transactions()];
    if (this.filterType() !== 'ALL') {
      list = list.filter(t => t.type === this.filterType());
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  ngOnInit(): void {
    this.txService.loadAll().subscribe();
    this.accountService.loadAll().subscribe();
    this.categoryService.loadAll().subscribe({
      complete: () => this.loading.set(false)
    });
  }

  applyPeriodFilter(): void {
    if (this.filterFrom() && this.filterTo()) {
      this.loading.set(true);
      this.txService.loadByPeriod(this.filterFrom(), this.filterTo()).subscribe({
        complete: () => this.loading.set(false)
      });
    }
  }

  clearFilters(): void {
    this.filterType.set('ALL');
    this.filterFrom.set('');
    this.filterTo.set('');
    this.loading.set(true);
    this.txService.loadAll().subscribe({
      complete: () => this.loading.set(false)
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
