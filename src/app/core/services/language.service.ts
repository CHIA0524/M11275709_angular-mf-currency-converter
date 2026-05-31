import { Injectable, signal } from '@angular/core';

export type SupportedLanguage = 'zh-TW' | 'en-US' | 'ja-JP';
export type TranslationKey = string;

interface LanguageChangedDetail {
  sourceId: string;
  language: SupportedLanguage;
}

const translations: Record<SupportedLanguage, Record<string, string>> = {
  'zh-TW': {
    '匯率歷史': '匯率歷史',
    '匯率工作台': '匯率工作台',
    '來源貨幣': '來源貨幣',
    '目標貨幣': '目標貨幣',
    '更新方式': '更新方式',
    '匯率更新中': '匯率更新中',
    '使用 mock rates': '使用 mock rates',
    '匯率計算機': '匯率計算機',
    '快速換算不同貨幣': '快速換算不同貨幣',
    '金額': '金額',
    '更新匯率中...': '更新匯率中...',
    '新台幣': '新台幣',
    '美金': '美金',
    '歐元': '歐元',
    '日圓': '日圓',
    '韓元': '韓元',
    '人民幣': '人民幣',
    '港幣': '港幣',
    '澳幣': '澳幣',
    '英鎊': '英鎊'
  },
  'en-US': {
    '匯率歷史': 'Exchange history',
    '匯率工作台': 'Currency workspace',
    '來源貨幣': 'Base currency',
    '目標貨幣': 'Target currency',
    '更新方式': 'Update mode',
    '匯率更新中': 'Updating rates',
    '使用 mock rates': 'Using mock rates',
    '匯率計算機': 'FX Converter',
    '快速換算不同貨幣': 'Quickly convert between currencies',
    '金額': 'Amount',
    '更新匯率中...': 'Refreshing rates...',
    '新台幣': 'New Taiwan dollar',
    '美金': 'US dollar',
    '歐元': 'Euro',
    '日圓': 'Japanese yen',
    '韓元': 'Korean won',
    '人民幣': 'Chinese yuan',
    '港幣': 'Hong Kong dollar',
    '澳幣': 'Australian dollar',
    '英鎊': 'British pound'
  },
  'ja-JP': {
    '匯率歷史': '為替履歴',
    '匯率工作台': '為替ワークスペース',
    '來源貨幣': '基準通貨',
    '目標貨幣': '換算先通貨',
    '更新方式': '更新方式',
    '匯率更新中': 'レート更新中',
    '使用 mock rates': 'モックレートを使用',
    '匯率計算機': '為替コンバーター',
    '快速換算不同貨幣': '異なる通貨をすばやく換算します',
    '金額': '金額',
    '更新匯率中...': '為替レートを更新中...',
    '新台幣': '台湾ドル',
    '美金': '米ドル',
    '歐元': 'ユーロ',
    '日圓': '日本円',
    '韓元': '韓国ウォン',
    '人民幣': '人民元',
    '港幣': '香港ドル',
    '澳幣': '豪ドル',
    '英鎊': '英ポンド'
  }
};

const storageKey = 'workspace.language';
const languageChangedEvent = 'microfrontends:language-changed';

const isSupportedLanguage = (value: string | null | undefined): value is SupportedLanguage =>
  value === 'zh-TW' || value === 'en-US' || value === 'ja-JP';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly currentLanguage = signal<SupportedLanguage>(this.resolveInitialLanguage());
  private readonly sourceId = Math.random().toString(36).slice(2);

  constructor() {
    this.applyLanguage(this.currentLanguage(), false);

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange);
      window.addEventListener(languageChangedEvent, this.handleLanguageChanged as EventListener);
    }
  }

  translate(key: TranslationKey): string {
    return translations[this.currentLanguage()][key] ?? translations['zh-TW'][key] ?? key;
  }

  setLanguage(language: SupportedLanguage): void {
    this.applyLanguage(language, true);
  }

  private resolveInitialLanguage(): SupportedLanguage {
    if (typeof localStorage !== 'undefined') {
      const storedLanguage = localStorage.getItem(storageKey);
      if (isSupportedLanguage(storedLanguage)) {
        return storedLanguage;
      }
    }

    return 'zh-TW';
  }

  private applyLanguage(language: SupportedLanguage, shouldBroadcast: boolean): void {
    this.currentLanguage.set(language);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, language);
    }

    if (shouldBroadcast && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<LanguageChangedDetail>(languageChangedEvent, {
          detail: {
            sourceId: this.sourceId,
            language
          }
        })
      );
    }
  }

  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key !== storageKey || !isSupportedLanguage(event.newValue)) {
      return;
    }

    this.applyLanguage(event.newValue, false);
  };

  private handleLanguageChanged = (event: Event): void => {
    const customEvent = event as CustomEvent<LanguageChangedDetail>;

    if (!customEvent.detail || customEvent.detail.sourceId === this.sourceId) {
      return;
    }

    this.applyLanguage(customEvent.detail.language, false);
  };
}