import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/hero/hero-section.component').then(m => m.HeroSectionComponent)
    },
    {
        path: 'order',
        loadComponent: () => import('./features/order/order-flow/order-flow.component').then(m => m.OrderFlowComponent)
    },
    {
        path: 'find-us',
        loadComponent: () => import('./features/find-us/find-us.component').then(m => m.FindUsComponent)
    },
    {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
    },
    {
        path: 'impressum',
        loadComponent: () => import('./core/impressum/impressum.component').then(m => m.ImpressumComponent)
    },
    {
        path: 'privacy',
        loadComponent: () => import('./core/privacy/privacy.component').then(m => m.PrivacyComponent)
    },
    {
        path: 'kitchen-internal',
        loadComponent: () => import('./admin/kitchen-internal-monitor/kitchen-internal-monitor.component')
            .then(m => m.KitchenInternalMonitorComponent)
    },
    {
        path: 'riesa-admin-archive',
        loadComponent: () => import('./shared/order-archive/order-archive.component')
            .then(m => m.OrderArchiveComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];