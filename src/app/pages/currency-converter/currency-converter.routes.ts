import { Routes } from '@angular/router';

export const currencyConverterRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./currency-converter.component').then(m => m.CurrencyConverterComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./exchange-history/exchange-history.component').then(m => m.ExchangeHistoryComponent)
  },
  {
    path: 'workspace',
    loadComponent: () => import('./currency-workspace/currency-workspace.component').then(m => m.CurrencyWorkspaceComponent)
  }
];