'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const PortfolioPage = () => {
  const { balance, holdings, history, isLoaded, resetPortfolio } = usePortfolio();
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      if (holdings.length === 0) return;
      setIsLoadingPrices(true);
      try {
        const ids = holdings.map((h) => h.coinId).join(',');
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        const data = await res.json();
        const prices: Record<string, number> = {};
        Object.keys(data).forEach((id) => {
          prices[id] = data[id].usd;
        });
        setCurrentPrices(prices);
      } catch (e) {
        console.error('Failed to fetch current prices', e);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPrices();

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [holdings]);

  if (!isLoaded) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin text-purple-500" size={32} />
        </div>
      </main>
    );
  }

  const holdingsValue = holdings.reduce((total, holding) => {
    const currentPrice = currentPrices[holding.coinId] || holding.averageBuyPrice;
    return total + holding.amount * currentPrice;
  }, 0);

  const totalValue = balance + holdingsValue;
  const totalProfitLoss = totalValue - 10000;
  const isProfit = totalProfitLoss >= 0;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Portfolio</h1>
          <p className="text-gray-400">Paper Trading Simulator</p>
        </div>

        <Button
          variant="destructive"
          onClick={() => {
            if (confirm('Are you sure you want to reset your portfolio back to $10,000? All history will be lost.')) {
              resetPortfolio();
            }
          }}
          className="flex items-center gap-2"
        >
          <Trash2 size={16} />
          Reset Portfolio
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-500 rounded-xl border border-white/5 p-6">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Balance</p>
          <h2 className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</h2>
          <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {isProfit ? '+' : ''}{formatCurrency(totalProfitLoss)}
            <span className="text-gray-500 ml-1">All Time</span>
          </div>
        </div>

        <div className="bg-dark-500 rounded-xl border border-white/5 p-6">
          <p className="text-sm font-medium text-gray-400 mb-1">Available Cash</p>
          <h2 className="text-3xl font-bold text-white">{formatCurrency(balance)}</h2>
          <div className="mt-2 text-sm text-gray-500">Ready to trade</div>
        </div>

        <div className="bg-dark-500 rounded-xl border border-white/5 p-6">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Invested</p>
          <h2 className="text-3xl font-bold text-white">{formatCurrency(holdingsValue)}</h2>
          <div className="mt-2 text-sm text-gray-500">Current value of holdings</div>
        </div>
      </div>

      {/* Holdings Section */}
      <div className="bg-dark-500 rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-dark-400/30">
          <h3 className="text-xl font-semibold text-white">Your Holdings</h3>
          {isLoadingPrices && <RefreshCw className="animate-spin text-gray-400" size={16} />}
        </div>

        {holdings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="mb-4">You don't own any coins yet.</p>
            <Link href="/coins">
              <Button>Explore Coins to Buy</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-gray-400">Asset</TableHead>
                  <TableHead className="text-gray-400 text-right">Balance</TableHead>
                  <TableHead className="text-gray-400 text-right">Avg Buy Price</TableHead>
                  <TableHead className="text-gray-400 text-right">Current Price</TableHead>
                  <TableHead className="text-gray-400 text-right">Total Value</TableHead>
                  <TableHead className="text-gray-400 text-right">Profit/Loss</TableHead>
                  <TableHead className="text-gray-400 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((holding) => {
                  const currentPrice = currentPrices[holding.coinId] || holding.averageBuyPrice;
                  const totalValue = holding.amount * currentPrice;
                  const totalCost = holding.amount * holding.averageBuyPrice;
                  const pnl = totalValue - totalCost;
                  const pnlPercentage = (pnl / totalCost) * 100;
                  const isPositive = pnl >= 0;

                  return (
                    <TableRow key={holding.coinId} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="font-medium text-white">
                        <Link href={`/coins/${holding.coinId}`} className="hover:text-purple-400 transition-colors">
                          {holding.name} <span className="text-gray-500 text-xs ml-1 uppercase">{holding.symbol}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {holding.amount} <span className="text-xs text-gray-500 uppercase">{holding.symbol}</span>
                      </TableCell>
                      <TableCell className="text-right text-gray-300">{formatCurrency(holding.averageBuyPrice)}</TableCell>
                      <TableCell className="text-right text-gray-300">
                        {isLoadingPrices && !currentPrices[holding.coinId] ? (
                          <span className="text-gray-500">Loading...</span>
                        ) : (
                          formatCurrency(currentPrice)
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-white">{formatCurrency(totalValue)}</TableCell>
                      <TableCell className={`text-right font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {formatCurrency(pnl)}
                          <span className="text-xs ml-1 opacity-70">({pnlPercentage.toFixed(2)}%)</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/coins/${holding.coinId}`}>
                          <Button variant="outline" size="sm" className="h-8 border-white/10 hover:bg-white/10">Trade</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Transaction History */}
      {history.length > 0 && (
        <div className="bg-dark-500 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-dark-400/30">
            <h3 className="text-xl font-semibold text-white">Transaction History</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <Table>
              <TableHeader className="sticky top-0 bg-dark-500 z-10">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Asset</TableHead>
                  <TableHead className="text-gray-400 text-right">Amount</TableHead>
                  <TableHead className="text-gray-400 text-right">Price</TableHead>
                  <TableHead className="text-gray-400 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((tx) => (
                  <TableRow key={tx.id} className="border-white/5 hover:bg-white/[0.02]">
                    <TableCell className="text-gray-400 text-sm">
                      {new Date(tx.date).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {tx.name} <span className="text-gray-500 text-xs ml-1 uppercase">{tx.symbol}</span>
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {tx.amount} <span className="text-xs text-gray-500 uppercase">{tx.symbol}</span>
                    </TableCell>
                    <TableCell className="text-right text-gray-300">{formatCurrency(tx.price)}</TableCell>
                    <TableCell className="text-right font-medium text-white">{formatCurrency(tx.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </main>
  );
};

export default PortfolioPage;
