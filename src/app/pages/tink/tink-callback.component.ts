import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { timeout } from 'rxjs';
import { TinkService } from '../../core/services/tink.service';

const TIMEOUT_MS = 30_000;

const STATUS_STEPS: { message: string; delay: number }[] = [
  { message: 'Connexion à la banque...', delay: 0 },
  { message: 'Import des transactions...', delay: 8_000 },
  { message: 'Finalisation...', delay: 20_000 },
];

@Component({
  selector: 'app-tink-callback',
  standalone: true,
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:1rem;font-family:inherit">
      <div class="spinner" style="width:2rem;height:2rem;border:3px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite"></div>
      <p style="color:#64748b;font-size:0.95rem">{{ statusMessage() }}</p>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
  `
})
export class TinkCallbackComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tinkService = inject(TinkService);

  protected readonly statusMessage = signal(STATUS_STEPS[0].message);
  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    const code = this.route.snapshot.queryParams['code'];
    if (!code) {
      this.router.navigate(['/dashboard'], { queryParams: { tink: 'error' } });
      return;
    }

    this.scheduleStatusMessages();

    this.tinkService.importTransactions(code).pipe(
      timeout(TIMEOUT_MS)
    ).subscribe({
      next: res => this.router.navigate(['/dashboard'], {
        queryParams: { tink: 'success', imported: res.imported }
      }),
      error: () => this.router.navigate(['/dashboard'], {
        queryParams: { tink: 'error' }
      })
    });
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearTimeout(t));
  }

  private scheduleStatusMessages(): void {
    for (const step of STATUS_STEPS) {
      if (step.delay === 0) {
        this.statusMessage.set(step.message);
        continue;
      }
      this.timers.push(setTimeout(() => this.statusMessage.set(step.message), step.delay));
    }
  }
}
