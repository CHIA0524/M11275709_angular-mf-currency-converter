import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/currency-converter.component').then((m) => m.CurrencyConverterComponent)
	}
];
