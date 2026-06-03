import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ClerkService } from '../services/clerk.service';

/**
 * Redireciona o usuário para a página correta após o login.
 * - Se for admin, vai para /admin.
 * - Se for usuário comum ou visitante, permanece na home.
 *
 * Aguarda o Clerk terminar de carregar antes de decidir,
 * porque senão o usuário admin cai na home (o signal user() ainda é null).
 */
export const homeGuard = () => {
  const clerkService = inject(ClerkService);
  const router = inject(Router);

  // Se o Clerk já carregou, decide na hora
  if (clerkService.loaded()) {
    if (clerkService.user() && clerkService.isUserAdmin()) {
      void router.navigate(['/admin']);
      return false;
    }
    return true;
  }

  // Clerk ainda carregando — espera ele terminar pra decidir
  return new Promise<boolean>((resolve) => {
    const interval = setInterval(() => {
      if (clerkService.loaded()) {
        clearInterval(interval);
        if (clerkService.user() && clerkService.isUserAdmin()) {
          void router.navigate(['/admin']);
          resolve(false);
        } else {
          resolve(true);
        }
      }
    }, 100);
  });
};
