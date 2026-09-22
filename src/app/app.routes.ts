import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/hero/hero-section.component').then(routeModule => routeModule.HeroSectionComponent)
  },
  {
    path: 'order',
    loadComponent: () => import('./features/order/order-flow/order-flow.component').then(routeModule => routeModule.OrderFlowComponent)
  },
  {
    path: 'find-us',
    loadComponent: () => import('./features/find-us/find-us.component').then(routeModule => routeModule.FindUsComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(routeModule => routeModule.CheckoutComponent)
  },
  {
    path: 'impressum',
    loadComponent: () => import('./core/impressum/impressum.component').then(routeModule => routeModule.ImpressumComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./core/privacy/privacy.component').then(routeModule => routeModule.PrivacyComponent)
  },
  {
    path: 'kitchen-internal',
    loadComponent: () => import('./admin/kitchen-internal-monitor/kitchen-internal-monitor.component')
      .then(routeModule => routeModule.KitchenInternalMonitorComponent)
  },
  {
    path: 'riesa-admin-archive',
    loadComponent: () => import('./shared/order-archive/order-archive.component')
      .then(routeModule => routeModule.OrderArchiveComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];