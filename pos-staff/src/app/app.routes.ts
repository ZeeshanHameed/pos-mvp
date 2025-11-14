import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'orders/create',
    loadComponent: () =>
      import('./components/create-order/create-order.component').then(
        m => m.CreateOrderComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'orders/manage',
    loadComponent: () =>
      import('./components/manage-orders/manage-orders.component').then(
        m => m.ManageOrdersComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];

