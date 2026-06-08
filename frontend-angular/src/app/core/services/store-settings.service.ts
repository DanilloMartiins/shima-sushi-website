import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { API_BASE_URL, USE_MOCK_PUBLIC_DATA } from '../constants/api.constants';
import { PUBLIC_STORE_SETTINGS_MOCK } from '../mocks/public-data.mock';
import { StoreSettingsResponse, UpdateStoreSettingsRequest } from '../models/store.models';

@Injectable({ providedIn: 'root' })
export class StoreSettingsService {
  private readonly http = inject(HttpClient);

  private fallbackCache: StoreSettingsResponse = { ...PUBLIC_STORE_SETTINGS_MOCK };

  getPublicStoreSettings(): Observable<StoreSettingsResponse> {
    if (USE_MOCK_PUBLIC_DATA) {
      return of({ ...this.fallbackCache });
    }

    return this.http
      .get<StoreSettingsResponse>(`${API_BASE_URL}/public/store-settings`)
      .pipe(
        tap((data) => this.fallbackCache = data),
        catchError(() => of({ ...this.fallbackCache })),
      );
  }

  getAdminStoreSettings(): Observable<StoreSettingsResponse> {
    return this.http.get<StoreSettingsResponse>(`${API_BASE_URL}/admin/store-settings`)
      .pipe(
        tap((data) => this.fallbackCache = data),
        catchError(() => of({ ...this.fallbackCache })),
      );
  }

  updateAdminStoreSettings(payload: UpdateStoreSettingsRequest): Observable<StoreSettingsResponse> {
    return this.http.put<StoreSettingsResponse>(`${API_BASE_URL}/admin/store-settings`, payload)
      .pipe(
        tap((data) => this.fallbackCache = data),
        catchError(() => {
          const merged = { ...this.fallbackCache, ...payload } as StoreSettingsResponse;
          this.fallbackCache = merged;
          return of(merged);
        }),
      );
  }
}
