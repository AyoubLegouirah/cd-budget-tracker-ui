import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { CreateCategoryRequest } from '../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  private readonly catService = inject(CategoryService);

  readonly categories = this.catService.categories;
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  formError = signal('');

  form: CreateCategoryRequest = { name: '', color: '#6366f1', icon: '📦' };

  readonly iconOptions = ['🍕','🚗','🏠','💊','🎮','✈️','👕','🛒','💡','🎓','💰','🏋️','🎵','📱','☕','🍺','🎁','🐶','💼','🔧'];

  ngOnInit(): void {
    this.catService.loadAll().subscribe({ complete: () => this.loading.set(false) });
  }

  save(): void {
    if (!this.form.name) {
      this.formError.set('Name is required.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    this.catService.create(this.form).subscribe({
      next: () => {
        this.showForm.set(false);
        this.form = { name: '', color: '#6366f1', icon: '📦' };
        this.saving.set(false);
      },
      error: () => {
        this.formError.set('Failed to create category.');
        this.saving.set(false);
      }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this category?')) return;
    this.catService.delete(id).subscribe();
  }
}
