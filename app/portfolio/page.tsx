'use client';

import { usePortfolio, INITIAL_BALANCE } from '@/hooks/usePortfolio';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Trash2, Wallet } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { theme } from '@/lib/theme';

const PortfolioPage = () => {
  const { balance, holdings, history, isLoaded, resetPortfolio } = usePortfolio();
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [pricesError, setPricesError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const holdingsKey = useMemo(() => holdings.map(h => h.coinId).sort().join(','), [holdings]);

  useEffect(() => {
    const fetchPrices = async () => {
      if (holdings.length === 0) return;
      setIsLoadingPrices(true);
      setPricesError(null);
      try {
        const ids = holdings.map((h) => h.coinId).join(',');
        const res = await fetch(`/api/prices?ids=${ids}`);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        const prices: Record<string, number> = {};
        if (data && typeof data === 'object') {
          Object.keys(data).forEach((id) => {
            if (data[id] && typeof data[id].usd === 'number') {
              prices[id] = data[id].usd;
            }
          });
        }
        setCurrentPrices(prices);
      } catch (e) {
        console.error('Failed to fetch current prices', e);
        setPricesError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPrices();

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [holdingsKey]);

  // Reset pagination if history shrinks below current page
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(history.length / rowsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [history.length, currentPage, rowsPerPage]);

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
    const currentPrice = currentPrices[holding.coinId] ?? holding.averageBuyPrice;
    return total + holding.amount * currentPrice;
  }, 0);

  const totalValue = balance + holdingsValue;
  const totalProfitLoss = totalValue - INITIAL_BALANCE;
  const isProfit = totalProfitLoss >= 0;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Portfolio</h1>
          <p className="text-gray-400">Paper Trading Simulator</p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="danger">
              <Trash2 size={16} />
              Reset Portfolio
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-dark-500 border-white/5 top-[50%]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete your portfolio
                history and reset your interactive balance to {formatCurrency(INITIAL_BALANCE)}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-dark-400 border-white/5 text-white hover:bg-dark-300 hover:text-white cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                className="cursor-pointer border-0"
                onClick={() => resetPortfolio()}
              >
                Yes, Reset Portfolio
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-500 rounded-xl border border-white/5 p-6">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Balance</p>
          <h2 className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</h2>
          <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${isProfit ? theme.classes.trendUp : theme.classes.trendDown}`}>
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
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">Your Holdings</h3>
            {pricesError && <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-500/20">Live Prices Unavailable</span>}
          </div>
          {isLoadingPrices && !pricesError && <RefreshCw className="animate-spin text-gray-400" size={16} />}
        </div>

        {holdings.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <div className="bg-dark-400/50 p-4 rounded-full mb-4 inline-flex">
              <Wallet className="w-12 h-12 text-gray-500" strokeWidth={1.5} />
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">No Assets Yet</h4>
            <p className="mb-8 max-w-sm text-sm">You don&apos;t own any coins. Start paper trading to track your portfolio performance here.</p>
            <Link href="/coins">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-6 border-0">Explore Coins to Buy</Button>
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
                  const currentPrice = currentPrices[holding.coinId] ?? holding.averageBuyPrice;
                  const holdingTotalValue = holding.amount * currentPrice;
                  const totalCost = holding.amount * holding.averageBuyPrice;
                  const pnl = holdingTotalValue - totalCost;
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
                        ) : pricesError && !currentPrices[holding.coinId] ? (
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-red-400 mb-0.5" title={pricesError}>Fetch Error</span>
                            <span className="text-xs text-gray-500">Using avg: {formatCurrency(holding.averageBuyPrice)}</span>
                          </div>
                        ) : (
                          formatCurrency(currentPrice)
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-white">{formatCurrency(holdingTotalValue)}</TableCell>
                      <TableCell className={`text-right font-medium ${isPositive ? theme.classes.trendUp : theme.classes.trendDown}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {formatCurrency(pnl)}
                          <span className="text-xs ml-1 opacity-70">({pnlPercentage.toFixed(2)}%)</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/coins/${holding.coinId}`}>
                          <Button variant="action" size="sm" className="h-8">Trade</Button>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-dark-500 z-10">
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
                {history.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((tx) => (
                  <TableRow key={tx.id} className="border-white/5 hover:bg-white/[0.02]">
                    <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                      {new Date(tx.date).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.type === 'buy' ? theme.classes.buyTx : theme.classes.sellTx}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-white whitespace-nowrap">
                      {tx.name} <span className="text-gray-500 text-xs ml-1 uppercase">{tx.symbol}</span>
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {tx.amount} <span className="text-xs text-gray-500 uppercase">{tx.symbol}</span>
                    </TableCell>
                    <TableCell className="text-right text-gray-300">{formatCurrency(tx.price)}</TableCell>
                    <TableCell className={`text-right font-medium ${tx.type === 'buy' ? theme.classes.trendUp : theme.classes.trendDown}`}>
                      {tx.type === 'buy' ? '-' : '+'}{formatCurrency(tx.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {history.length > rowsPerPage && (
            <div className="p-4 border-t border-white/5 flex items-center justify-center bg-dark-400/10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.max(1, currentPage - 1));
                      }}
                      className={currentPage === 1 ? theme.classes.paginationDisabled : theme.classes.paginationControl}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.ceil(history.length / rowsPerPage) }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                        isActive={currentPage === i + 1}
                        className={currentPage === i + 1 ? theme.classes.paginationActive : theme.classes.paginationInactive}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.min(Math.ceil(history.length / rowsPerPage), currentPage + 1));
                      }}
                      className={currentPage === Math.ceil(history.length / rowsPerPage) ? theme.classes.paginationDisabled : theme.classes.paginationControl}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default PortfolioPage;
