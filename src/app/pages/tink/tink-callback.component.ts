import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TinkService } from '../../core/services/tink.service';

@Component({
  selector: 'app-tink-callback',
  standalone: true,
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:1rem;font-family:inherit">
      <div class="spinner" style="width:2rem;height:2rem;border:3px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite"></div>
      <p style="color:#64748b;font-size:0.95rem">Importation des transactions en cours…</p>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
  `
})
export class TinkCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tinkService = inject(TinkService);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParams['code'];
    if (!code) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.tinkService.importTransactions(code).subscribe({
      next: res => this.router.navigate(['/dashboard'], {
        queryParams: { tink: 'success', imported: res.imported }
      }),
      error: () => this.router.navigate(['/dashboard'], {
        queryParams: { tink: 'error' }
      })
    });
  }
}
