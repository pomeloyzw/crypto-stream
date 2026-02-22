import { useState, useEffect, useCallback } from 'react';

const INITIAL_BALANCE = 10000;
const STORAGE_KEY = 'crypto_pulse_portfolio';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioState>({
    balance: INITIAL_BALANCE,
    holdings: [],
    history: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTimeout(() => {
        try {
          setPortfolio(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse portfolio from localStorage', e);
        }
      }, 0);
    }
    setTimeout(() => {
      setIsLoaded(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    }
  }, [portfolio, isLoaded]);

  const buyCoin = useCallback((coinId: string, symbol: string, name: string, amount: number, price: number) => {
    const total = amount * price;

    setPortfolio((prev) => {
      if (prev.balance < total) {
        throw new Error('Insufficient balance');
      }

      const newBalance = prev.balance - total;
      
      const holdingIndex = prev.holdings.findIndex(h => h.coinId === coinId);
      const newHoldings = [...prev.holdings];
      
      if (holdingIndex >= 0) {
        const existing = newHoldings[holdingIndex];
        const newTotalAmount = existing.amount + amount;
        const newTotalCost = (existing.amount * existing.averageBuyPrice) + total;
        
        newHoldings[holdingIndex] = {
          ...existing,
          amount: newTotalAmount,
          averageBuyPrice: newTotalCost / newTotalAmount,
        };
      } else {
        newHoldings.push({
          coinId,
          symbol,
          name,
          amount,
          averageBuyPrice: price,
        });
      }

      const transaction: PortfolioTransaction = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'buy',
        coinId,
        symbol,
        name,
        amount,
        price,
        total,
        date: new Date().toISOString(),
      };

      return {
        balance: newBalance,
        holdings: newHoldings,
        history: [transaction, ...prev.history],
      };
    });
  }, []);

  const sellCoin = useCallback((coinId: string, symbol: string, name: string, amount: number, price: number) => {
    const total = amount * price;

    setPortfolio((prev) => {
      const holdingIndex = prev.holdings.findIndex(h => h.coinId === coinId);
      if (holdingIndex === -1) {
        throw new Error('Holding not found');
      }

      const existing = prev.holdings[holdingIndex];
      if (existing.amount < amount) {
        throw new Error('Insufficient holding amount');
      }

      const newBalance = prev.balance + total;
      let newHoldings = [...prev.holdings];
      
      if (existing.amount === amount) {
        newHoldings = newHoldings.filter(h => h.coinId !== coinId);
      } else {
        newHoldings[holdingIndex] = {
          ...existing,
          amount: existing.amount - amount,
        };
      }

      const transaction: PortfolioTransaction = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'sell',
        coinId,
        symbol,
        name,
        amount,
        price,
        total,
        date: new Date().toISOString(),
      };

      return {
        balance: newBalance,
        holdings: newHoldings,
        history: [transaction, ...prev.history],
      };
    });
  }, []);

  const resetPortfolio = useCallback(() => {
    const initial = {
      balance: INITIAL_BALANCE,
      holdings: [],
      history: [],
    };
    setPortfolio(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  }, []);

  return {
    ...portfolio,
    isLoaded,
    buyCoin,
    sellCoin,
    resetPortfolio,
  };
};
