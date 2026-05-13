import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminShellComponent } from './features/admin/admin-shell.component';
import { PublicShellComponent } from './layout/public-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login-page.component').then((m) => m.LoginPageComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register-page.component').then((m) => m.RegisterPageComponent),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/checkout-page.component').then((m) => m.CheckoutPageComponent),
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/my-orders-page.component').then((m) => m.MyOrdersPageComponent),
      },
      {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/user/profile-page.component').then((m) => m.ProfilePageComponent),
      },
    ],
  },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/admin-products-page.component').then(
            (m) => m.AdminProductsPageComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/admin-store-settings-page.component').then(
            (m) => m.AdminStoreSettingsPageComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/admin-orders-page.component').then(
            (m) => m.AdminOrdersPageComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'products' },
    ],
  },
  { path: '**', redirectTo: '' },
];
