import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('./pages/currency-converter/currency-converter.routes').then((m) => m.currencyConverterRoutes)
	}
];
