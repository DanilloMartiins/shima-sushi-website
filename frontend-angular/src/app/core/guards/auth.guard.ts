import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ClerkService } from '../services/clerk.service';

export const authGuard = () => {
  const clerkService = inject(ClerkService);
  const router = inject(Router);

  if (clerkService.user()) {
    return true;
  }

  void router.navigate(['/login']);
  return false;
};
