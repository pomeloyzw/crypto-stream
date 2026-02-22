'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, cn } from '@/lib/utils';
import { theme } from '@/lib/theme';
import { Wallet } from 'lucide-react';

interface TradeCardProps {
  coinId: string;
  symbol: string;
  name: string;
  currentPrice: number;
}

const TradeCard = ({ coinId, symbol, name, currentPrice }: TradeCardProps) => {
  const { balance, holdings, buyCoin, sellCoin, isLoaded } = usePortfolio();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTrading, setIsTrading] = useState(false);

  const holding = holdings.find((h) => h.coinId === coinId);
  const holdingAmount = holding ? holding.amount : 0;

  const handleTrade = async () => {
    if (isTrading) return;
    setError('');
    setSuccess('');

    if (!currentPrice || currentPrice <= 0) {
      setError('Invalid price');
      return;
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (tab === 'buy') {
      if (parsedAmount * currentPrice > balance) {
        setError('Insufficient balance');
        return;
      }
    } else {
      if (parsedAmount > holdingAmount) {
        setError('Insufficient holding amount');
        return;
      }
    }

    setIsTrading(true);
    try {
      if (tab === 'buy') {
        await buyCoin(coinId, symbol, name, parsedAmount, currentPrice);
        setSuccess(`Successfully bought ${parsedAmount} ${symbol.toUpperCase()}`);
      } else {
        await sellCoin(coinId, symbol, name, parsedAmount, currentPrice);
        setSuccess(`Successfully sold ${parsedAmount} ${symbol.toUpperCase()}`);
      }
      setAmount('');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Trade failed');
      }
    } finally {
      setIsTrading(false);
    }
  };

  const setMaxAmount = () => {
    if (tab === 'buy') {
      if (!currentPrice || currentPrice <= 0) {
        setAmount('0');
        return;
      }
      const maxBuy = Math.floor((balance / currentPrice) * 1e8) / 1e8;
      setAmount(maxBuy.toString());
    } else {
      setAmount(holdingAmount.toString());
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="bg-dark-500 rounded-xl border border-white/5 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">Paper Trade</h4>
        <div className="flex items-center gap-2 text-sm text-purple-200">
          <Wallet size={16} />
          {formatCurrency(balance)}
        </div>
      </div>

      <div className="flex rounded-lg bg-dark-400 p-1">
        <button
          onClick={() => { setTab('buy'); setError(''); setSuccess(''); setAmount(''); }}
          className={cn('flex-1 py-1.5 text-sm font-medium rounded-md transition-colors', tab === 'buy' ? theme.classes.buyTab : 'text-gray-400 hover:text-white cursor-pointer')}
        >
          Buy
        </button>
        <button
          onClick={() => { setTab('sell'); setError(''); setSuccess(''); setAmount(''); }}
          className={cn('flex-1 py-1.5 text-sm font-medium rounded-md transition-colors', tab === 'sell' ? theme.classes.sellTab : 'text-gray-400 hover:text-white cursor-pointer')}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Amount ({symbol.toUpperCase()})</span>
            {tab === 'sell' && <span>Available: {holdingAmount} {symbol.toUpperCase()}</span>}
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16 bg-dark-400 border-white/5 focus-visible:ring-purple-500/50"
            />
            <button
              onClick={setMaxAmount}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
          <span className="text-gray-400">{tab === 'buy' ? 'Total Cost' : 'Total Proceeds'}</span>
          <span className="font-semibold text-white">
            {formatCurrency((parseFloat(amount) || 0) * currentPrice)}
          </span>
        </div>

        {error && <p className={`text-xs ${theme.classes.trendDown}`}>{error}</p>}
        {success && <p className={`text-xs ${theme.classes.trendUp}`}>{success}</p>}

        <Button
          onClick={handleTrade}
          variant={tab === 'buy' ? 'buy' : 'sell'}
          disabled={isTrading}
          className="w-full h-10 font-semibold !text-white border-0"
        >
          {isTrading ? 'Processing...' : `${tab === 'buy' ? 'Buy' : 'Sell'} ${symbol.toUpperCase()}`}
        </Button>
      </div>
    </div>
  );
};

export default TradeCard;
