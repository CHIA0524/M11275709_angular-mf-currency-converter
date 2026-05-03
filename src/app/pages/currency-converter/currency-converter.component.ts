import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Currency {
  code: string;
  name: string;
}

interface RateData {
  base: string;
  date: string;
  rates: { [key: string]: number };
}

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule, 
    MatButtonModule,
    MatCardModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './currency-converter.component.html'
})
export class CurrencyConverterComponent implements OnInit {
  amount: number = 1000;
  baseCurrency: string = 'TWD';
  targetCurrency: string = 'USD';
  convertedAmount: number | null = null;
  loading: boolean = false;
  
  availableCurrencies: Currency[] = [
    { code: 'TWD', name: '新台幣' },
    { code: 'USD', name: '美金' },
    { code: 'EUR', name: '歐元' },
    { code: 'JPY', name: '日圓' },
    { code: 'KRW', name: '韓元' },
    { code: 'CNY', name: '人民幣' },
    { code: 'HKD', name: '港幣' },
    { code: 'AUD', name: '澳幣' },
    { code: 'GBP', name: '英鎊' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.convert();
  }

  onBaseCurrencyChange() {
    this.convert();
  }

  convert() {
    if (this.baseCurrency === this.targetCurrency) {
      this.convertedAmount = this.amount;
      return;
    }

    this.loading = true;
    
    // 優先嘗試使用免費的 API (Frankfurter)
    // Frankfurter 默認 Base 是 EUR，但也支援其他
    // 備註：Frankfurter 不支援 TWD 作為 Base，通常需要透過 EUR 或 USD 中轉
    // 這裡為了簡化演示，我們先嘗試抓取 Mock 資料，如果需要真實即時匯率，建議後端處理或使用付費 API
    
    this.http.get<RateData>('assets/mock/currency/rates.json').pipe(
        catchError(err => {
            console.error('Failed to load mock rates', err);
            return of(null);
        })
    ).subscribe(data => {
        if (data && data.rates) {
            // 這裡使用 mock 資料中的 TWD 匯率來做轉換
            // 假設 mock data base 是 TWD
            const baseRate = data.base === this.baseCurrency ? 1 : (1 / data.rates[this.baseCurrency]);
            const targetRate = data.base === this.targetCurrency ? 1 : data.rates[this.targetCurrency];
            
            if (baseRate && targetRate) {
                // 轉換公式: 金額 * (目標匯率 / 來源匯率)
                // 例如 TWD -> USD: 1000 * (0.032 / 1) = 32
                // 例如 USD -> JPY: 10 * (4.25 / 0.032) ... 需注意 mock data 結構
                
                // 簡化邏輯：如果 mock base 是 TWD
                if (data.base === 'TWD') {
                   // TWD -> Others
                   if (this.baseCurrency === 'TWD') {
                       this.convertedAmount = this.amount * (data.rates[this.targetCurrency] || 0);
                   } 
                   // Others -> TWD
                   else if (this.targetCurrency === 'TWD') {
                       this.convertedAmount = this.amount / (data.rates[this.baseCurrency] || 1);
                   }
                   // Others -> Others (e.g. USD -> JPY) = (USD -> TWD) -> (TWD -> JPY)
                   else {
                       const toTwd = this.amount / (data.rates[this.baseCurrency] || 1);
                       this.convertedAmount = toTwd * (data.rates[this.targetCurrency] || 0);
                   }
                }
            }
        }
        this.loading = false;
    });
  }
}
