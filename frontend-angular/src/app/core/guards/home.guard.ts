import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ClerkService } from '../services/clerk.service';

/**
 * Redireciona o usuário para a página correta após o login.
 * - Se for admin, vai para /admin.
 * - Se for usuário comum ou visitante, permanece na home.
 */
export const homeGuard = () => {
  const clerkService = inject(ClerkService);
  const router = inject(Router);

  // Só atua se o usuário já estiver carregado e logado
  if (clerkService.user()) {
    if (clerkService.isUserAdmin()) {
      // É admin, redireciona para o painel e bloqueia a ida para a home
      void router.navigate(['/admin']);
      return false;
    }
  }

  // Para usuários comuns ou visitantes, permite o acesso à home
  return true;
};
