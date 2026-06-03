import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';

import { API_BASE_URL, USE_MOCK_PUBLIC_DATA } from '../constants/api.constants';
import { PUBLIC_MENU_MOCK } from '../mocks/public-data.mock';
import {
  CategorySummaryResponse,
  CreateProductRequest,
  MenuCategoryResponse,
  PagedResponse,
  ProductResponse,
  UpdateProductRequest,
  UploadImageResponse,
} from '../models/menu.models';

const CACHE_KEY = 'seu-shima-sushi-menu-cache';
const CACHE_DURATION_MS = 10 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  getPublicMenu(): Observable<MenuCategoryResponse[]> {
    if (USE_MOCK_PUBLIC_DATA) {
      return of(PUBLIC_MENU_MOCK);
    }

    const cached = this.lerCache<MenuCategoryResponse[]>(CACHE_KEY);
    if (cached) {
      return of(cached);
    }

    return this.http
      .get<MenuCategoryResponse[]>(`${API_BASE_URL}/public/menu`)
      .pipe(
        tap((data) => this.salvarCache(CACHE_KEY, data)),
        catchError(() => of(PUBLIC_MENU_MOCK)),
      );
  }

  private lerCache<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp > CACHE_DURATION_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return entry.data;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  private salvarCache<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  }

  getAdminCategories(): Observable<CategorySummaryResponse[]> {
    return this.http.get<CategorySummaryResponse[]>(`${API_BASE_URL}/admin/categories`);
  }

  getAdminProducts(page = 0, size = 100): Observable<PagedResponse<ProductResponse>> {
    return this.http.get<PagedResponse<ProductResponse>>(
      `${API_BASE_URL}/admin/products?page=${page}&size=${size}`,
    );
  }

  createAdminProduct(payload: CreateProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${API_BASE_URL}/admin/products`, payload);
  }

  updateAdminProduct(id: number, payload: UpdateProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${API_BASE_URL}/admin/products/${id}`, payload);
  }

  deleteAdminProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/admin/products/${id}`);
  }

  deleteAdminProducts(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/admin/products/batch`, { body: ids });
  }

  uploadProductImage(productId: number, file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<UploadImageResponse>(
      `${API_BASE_URL}/admin/products/${productId}/image`,
      formData,
    );
  }
}
