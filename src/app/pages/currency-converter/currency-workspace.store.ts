import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { format, subDays } from 'date-fns';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { z } from 'zod';
import { CurrencyService } from '../../core/services/currency.service';

const exchangeRatesSchema = z.object({
  base: z.string(),
  date: z.string(),
  rates: z.record(z.string(), z.number())
});

interface CurrencyWorkspaceState {
  loading: boolean;
  base: string;
  rates: Record<string, number>;
  date: string;
  error: string | null;
}

@Injectable()
export class CurrencyWorkspaceStore extends ComponentStore<CurrencyWorkspaceState> {
  private readonly currencyService = inject(CurrencyService);

  readonly vm$ = this.select(state => {
    const spotlight = ['USD', 'JPY', 'EUR', 'GBP'].map(code => ({
      code,
      rate: state.rates[code] ?? 0,
      history: Array.from({ length: 7 }, (_, index) => ({
        date: format(subDays(new Date(state.date || Date.now()), 6 - index), 'MM/dd'),
        value: Math.round(((state.rates[code] ?? 0) * (0.96 + index * 0.01)) * 10000) / 10000
      }))
    }));

    return {
      loading: state.loading,
      base: state.base,
      date: state.date,
      spotlight
    };
  });

  constructor() {
    super({
      loading: false,
      base: 'TWD',
      rates: {},
      date: '',
      error: null
    });
  }

  readonly load = this.effect<string>(base$ =>
    base$.pipe(
      tap(base => this.patchState({ loading: true, base, error: null })),
      tap(base => {
        this.currencyService.getRates(base).pipe(
          tap(response => {
            const parsed = exchangeRatesSchema.parse(response);
            this.patchState({ loading: false, base: parsed.base, rates: parsed.rates, date: parsed.date });
          }),
          catchError(error => {
            this.patchState({ loading: false, error: error instanceof Error ? error.message : 'Currency load failed' });
            return EMPTY;
          })
        ).subscribe();
      })
    )
  );
}