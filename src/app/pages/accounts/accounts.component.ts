import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { AccountService } from '../../core/services/account.service';
import { CreateAccountRequest } from '../../core/models/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent implements OnInit {
  private readonly accountService = inject(AccountService);

  readonly accounts = this.accountService.accounts;
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  formError = signal('');

  form: CreateAccountRequest = { name: '', balance: 0, currency: 'EUR' };

  readonly totalBalance = computed(() =>
    this.accounts().reduce((sum, a) => sum + a.balance, 0)
  );

  readonly currencies = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'JPY', 'MAD'];

  ngOnInit(): void {
    this.accountService.loadAll().subscribe({ complete: () => this.loading.set(false) });
  }

  save(): void {
    if (!this.form.name || !this.form.currency) {
      this.formError.set('Name and currency are required.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    this.accountService.create(this.form).subscribe({
      next: () => {
        this.showForm.set(false);
        this.form = { name: '', balance: 0, currency: 'EUR' };
        this.saving.set(false);
      },
      error: () => {
        this.formError.set('Failed to create account.');
        this.saving.set(false);
      }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this account? This cannot be undone.')) return;
    this.accountService.delete(id).subscribe();
  }
}
