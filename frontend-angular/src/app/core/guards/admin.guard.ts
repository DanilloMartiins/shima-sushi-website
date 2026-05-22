import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ClerkService } from '../services/clerk.service';

export const adminGuard = () => {
  const clerkService = inject(ClerkService);
  const router = inject(Router);

  if (clerkService.isUserAdmin()) {
    return true;
  }

  void router.navigate(['/']); // Redireciona para a home se não for admin
  return false;
};
