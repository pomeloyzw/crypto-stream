import { useState, useEffect, useCallback, useRef } from 'react';

export const INITIAL_BALANCE = 10000;
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
      try {
        setPortfolio(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse portfolio from localStorage', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (isLoaded) {
      const currentStr = JSON.stringify(portfolio);
      if (currentStr !== lastSavedRef.current) {
        localStorage.setItem(STORAGE_KEY, currentStr);
        lastSavedRef.current = currentStr;
      }
    }
  }, [portfolio, isLoaded]);

  const buyCoin = useCallback((coinId: string, symbol: string, name: string, amount: number, price: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const total = amount * price;

      setPortfolio((prev) => {
        if (prev.balance < total) {
          reject(new Error('Insufficient balance'));
          return prev;
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
        id: crypto.randomUUID(),
        type: 'buy',
        coinId,
        symbol,
        name,
        amount,
        price,
        total,
        date: new Date().toISOString(),
      };

        resolve();
        return {
          balance: newBalance,
          holdings: newHoldings,
          history: [transaction, ...prev.history],
        };
      });
    });
  }, []);

  const sellCoin = useCallback((coinId: string, symbol: string, name: string, amount: number, price: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const total = amount * price;

      setPortfolio((prev) => {
        const currentHoldingIndex = prev.holdings.findIndex(h => h.coinId === coinId);
        if (currentHoldingIndex === -1) {
          reject(new Error('Holding not found'));
          return prev;
        }

        const currentExisting = prev.holdings[currentHoldingIndex];
        if (currentExisting.amount < amount) {
          reject(new Error('Insufficient holding amount'));
          return prev;
        }

        const newBalance = prev.balance + total;
        let newHoldings = [...prev.holdings];
        
        if (currentExisting.amount === amount) {
        newHoldings = newHoldings.filter(h => h.coinId !== coinId);
      } else {
        newHoldings[currentHoldingIndex] = {
          ...currentExisting,
          amount: currentExisting.amount - amount,
        };
      }

      const transaction: PortfolioTransaction = {
        id: crypto.randomUUID(),
        type: 'sell',
        coinId,
        symbol,
        name,
        amount,
        price,
        total,
        date: new Date().toISOString(),
      };

        resolve();
        return {
          balance: newBalance,
          holdings: newHoldings,
          history: [transaction, ...prev.history],
        };
      });
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
