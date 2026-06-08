import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

import { API_BASE_URL, USE_MOCK_PUBLIC_DATA } from '../constants/api.constants';
import { PUBLIC_MENU_MOCK } from '../mocks/public-data.mock';
import { sanitizarCardapio } from '../utils/menu.utils';
import {
  CategorySummaryResponse,
  CreateProductRequest,
  FeaturedProductResponse,
  MenuCategoryResponse,
  PagedResponse,
  ProductResponse,
  UpdateProductRequest,
  UploadImageResponse,
} from '../models/menu.models';

const CACHE_TTL_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  private menuCache$: Observable<MenuCategoryResponse[]> | null = null;
  private lastFetchTime = 0;

  getPublicMenu(): Observable<MenuCategoryResponse[]> {
    if (USE_MOCK_PUBLIC_DATA) {
      return of(sanitizarCardapio(PUBLIC_MENU_MOCK));
    }

    const now = Date.now();
    const cacheValido = this.menuCache$ && (now - this.lastFetchTime) < CACHE_TTL_MS;
    if (cacheValido) {
      return this.menuCache$!;
    }

    this.menuCache$ = this.http
      .get<MenuCategoryResponse[]>(`${API_BASE_URL}/public/menu`)
      .pipe(
        map(sanitizarCardapio),
        tap(() => {
          this.lastFetchTime = Date.now();
        }),
        shareReplay(1),
        catchError(() => {
          this.clearCache();
          return of(sanitizarCardapio(PUBLIC_MENU_MOCK));
        }),
      );

    return this.menuCache$;
  }

  getFeaturedProducts(): Observable<FeaturedProductResponse[]> {
    return this.http.get<FeaturedProductResponse[]>(`${API_BASE_URL}/public/featured-products`);
  }

  toggleFeaturedProduct(id: number): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${API_BASE_URL}/admin/products/${id}/toggle-featured`, {});
  }

  clearCache(): void {
    this.menuCache$ = null;
    this.lastFetchTime = 0;
  }

  // Metodos admin: sempre chamam a API, sem cache
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
