import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }
  if (authService.isLoggedIn() && authService.isStudent()) {
    return router.createUrlTree(['/student']);
  }
  return router.createUrlTree(['/login']);
};

export const studentGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isStudent()) {
    return true;
  }
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return router.createUrlTree(['/admin']);
  }
  return router.createUrlTree(['/login']);
};

export const homeGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    if (authService.isAdmin()) {
      return router.createUrlTree(['/admin']);
    }
    return router.createUrlTree(['/student']);
  }
  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    if (authService.isAdmin()) {
      return router.createUrlTree(['/admin']);
    }
    return router.createUrlTree(['/student']);
  }
  return true;
};
