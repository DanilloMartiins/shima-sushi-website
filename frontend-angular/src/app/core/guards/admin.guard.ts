import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ClerkService } from '../services/clerk.service';

export const adminGuard = () => {
  const clerkService = inject(ClerkService);
  const router = inject(Router);

  const user = clerkService.user();
  
  // Regra de exemplo: checa se o email é o do admin ou se tem a role nas publicMetadata
  if (user && (user.publicMetadata?.['role'] === 'ADMIN' || user.primaryEmailAddress?.emailAddress === 'admin@seushimasushi.com')) {
    return true;
  }

  void router.navigate(['/']);
  return false;
};
