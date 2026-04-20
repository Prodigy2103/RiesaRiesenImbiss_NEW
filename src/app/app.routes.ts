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
	// NEU: Die interne Küchen-Ansicht
	{
		path: 'kitchen-internal',
		loadComponent: () => import('./admin/kitchen-internal-monitor/kitchen-internal-monitor.component')
			.then(m => m.KitchenInternalMonitorComponent)
	},
	// Sicherheitsnetz: Unbekannte Pfade leiten zur Startseite
	{
		path: '**',
		redirectTo: ''
	}
];