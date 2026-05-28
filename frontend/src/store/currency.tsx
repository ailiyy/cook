import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type CurrencyConfig, DEFAULT_CURRENCY, formatPrice as _formatPrice } from '../utils/format';

const STORAGE_KEY = 'currency_config';

interface CurrencyContextType {
  currency: CurrencyConfig;
  setCurrency: (config: CurrencyConfig) => void;
  formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CURRENCY;
    } catch {
      return DEFAULT_CURRENCY;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currency));
  }, [currency]);

  const setCurrency = (config: CurrencyConfig) => {
    setCurrencyState(config);
  };

  const formatPrice = (amount: number) => _formatPrice(amount, currency);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
