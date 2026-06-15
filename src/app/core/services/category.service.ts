import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Category, CreateCategoryRequest } from '../models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  private _categories = signal<Category[]>([]);
  readonly categories = this._categories.asReadonly();

  loadAll(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/api/categories`).pipe(
      tap(data => this._categories.set(data))
    );
  }

  create(req: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/api/categories`, req).pipe(
      tap(cat => this._categories.update(list => [...list, cat]))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/categories/${id}`).pipe(
      tap(() => this._categories.update(list => list.filter(c => c.id !== id)))
    );
  }
}
