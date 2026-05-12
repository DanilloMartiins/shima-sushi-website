import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { ClerkService } from '../services/clerk.service';

export const clerkInterceptor: HttpInterceptorFn = (request, next) => {
  const clerkService = inject(ClerkService);

  // Se não for uma chamada para a nossa API, segue o fluxo normal
  if (!request.url.startsWith(API_BASE_URL)) {
    return next(request);
  }

  // Pega o token do Clerk de forma assíncrona (Observable)
  return from(clerkService.getToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(request);
      }

      // Adiciona o token no header Authorization
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next(authReq);
    })
  );
};
