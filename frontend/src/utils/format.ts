export interface CurrencyConfig {
  symbol: string;
  position: 'before' | 'after';
  code: string;
  decimals: number;
}

export const CURRENCY_PRESETS: CurrencyConfig[] = [
  { symbol: '¥', position: 'before', code: 'CNY', decimals: 2 },
  { symbol: '$', position: 'before', code: 'USD', decimals: 2 },
  { symbol: '€', position: 'before', code: 'EUR', decimals: 2 },
  { symbol: '£', position: 'before', code: 'GBP', decimals: 2 },
  { symbol: '¥', position: 'before', code: 'JPY', decimals: 0 },
  { symbol: '₩', position: 'after', code: 'KRW', decimals: 0 },
];

export const DEFAULT_CURRENCY: CurrencyConfig = CURRENCY_PRESETS[0];

export function formatPrice(amount: number, currency: CurrencyConfig): string {
  const formatted = amount.toFixed(currency.decimals);
  return currency.position === 'before'
    ? `${currency.symbol}${formatted}`
    : `${formatted}${currency.symbol}`;
}
