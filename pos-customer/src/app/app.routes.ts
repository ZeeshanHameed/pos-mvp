import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'menu',
    loadComponent: () =>
      import('./components/menu/menu.component').then(m => m.MenuComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
  },
  {
    path: 'order/:id',
    loadComponent: () =>
      import('./components/order-tracking/order-tracking.component').then(
        m => m.OrderTrackingComponent
      ),
  },
  {
    path: '',
    redirectTo: '/menu',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/menu',
  },
];

