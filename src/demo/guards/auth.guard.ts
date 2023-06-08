import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { tap } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated.pipe(
    tap((isAuthenticated) => isAuthenticated || router.navigate(['login']))
  );
};
