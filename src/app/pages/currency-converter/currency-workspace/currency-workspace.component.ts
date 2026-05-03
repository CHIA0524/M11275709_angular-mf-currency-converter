import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyWorkspaceStore } from '../currency-workspace.store';

@Component({
  selector: 'app-currency-workspace',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe, FormsModule, RouterModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatSelectModule],
  providers: [CurrencyWorkspaceStore],
  templateUrl: './currency-workspace.component.html',
  styleUrl: './currency-workspace.component.scss'
})
export class CurrencyWorkspaceComponent {
  readonly store = inject(CurrencyWorkspaceStore);
  readonly vm$ = this.store.vm$;
  selectedBase = 'TWD';
  readonly baseOptions = ['TWD', 'USD', 'EUR', 'JPY'];

  constructor() {
    this.store.load(this.selectedBase);
  }

  updateBase(base: string): void {
    this.selectedBase = base;
    this.store.load(base);
  }
}