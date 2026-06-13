import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

interface Status { type: 'success' | 'error'; msg: string; }

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);

  readonly currentUser = this.auth.currentUser;

  loading = signal(true);

  profileForm = signal({ firstName: '', lastName: '' });
  savingProfile = signal(false);
  profileStatus = signal<Status | null>(null);

  passwordForm = signal({ currentPassword: '', newPassword: '', confirm: '' });
  savingPassword = signal(false);
  passwordStatus = signal<Status | null>(null);
  showCurrentPwd = signal(false);
  showNewPwd = signal(false);
  showConfirmPwd = signal(false);

  ngOnInit(): void {
    this.userService.getMe().subscribe({
      next: user => {
        this.profileForm.set({ firstName: user.firstName, lastName: user.lastName });
        this.loading.set(false);
      },
      error: () => {
        const cached = this.currentUser();
        if (cached) this.profileForm.set({ firstName: cached.firstName, lastName: cached.lastName });
        this.loading.set(false);
      }
    });
  }

  saveProfile(): void {
    const { firstName, lastName } = this.profileForm();
    if (!firstName.trim() || !lastName.trim()) {
      this.setStatus('profileStatus', { type: 'error', msg: 'Le prénom et le nom sont requis.' });
      return;
    }
    this.savingProfile.set(true);
    this.userService.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() }).subscribe({
      next: updated => {
        this.auth.updateCurrentUser(updated);
        this.savingProfile.set(false);
        this.setStatus('profileStatus', { type: 'success', msg: 'Profil mis à jour avec succès.' });
      },
      error: () => {
        this.savingProfile.set(false);
        this.setStatus('profileStatus', { type: 'error', msg: 'Erreur lors de la mise à jour du profil.' });
      }
    });
  }

  savePassword(): void {
    const { currentPassword, newPassword, confirm } = this.passwordForm();
    if (!currentPassword || !newPassword || !confirm) {
      this.setStatus('passwordStatus', { type: 'error', msg: 'Tous les champs sont requis.' });
      return;
    }
    if (newPassword !== confirm) {
      this.setStatus('passwordStatus', { type: 'error', msg: 'Le nouveau mot de passe et la confirmation ne correspondent pas.' });
      return;
    }
    if (newPassword.length < 6) {
      this.setStatus('passwordStatus', { type: 'error', msg: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    this.savingPassword.set(true);
    this.userService.updatePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.set({ currentPassword: '', newPassword: '', confirm: '' });
        this.setStatus('passwordStatus', { type: 'success', msg: 'Mot de passe modifié avec succès.' });
      },
      error: () => {
        this.savingPassword.set(false);
        this.setStatus('passwordStatus', { type: 'error', msg: 'Mot de passe actuel incorrect ou erreur serveur.' });
      }
    });
  }

  updateProfileField(field: 'firstName' | 'lastName', value: string): void {
    this.profileForm.update(f => ({ ...f, [field]: value }));
  }

  updatePasswordField(field: 'currentPassword' | 'newPassword' | 'confirm', value: string): void {
    this.passwordForm.update(f => ({ ...f, [field]: value }));
  }

  private setStatus(target: 'profileStatus' | 'passwordStatus', status: Status): void {
    this[target].set(status);
    setTimeout(() => this[target].set(null), 4000);
  }
}
