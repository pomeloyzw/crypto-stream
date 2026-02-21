import { useEffect, useState } from "react";
import { fetchCoinGeckoOhlc, fetchCoinGeckoTicker } from "@/lib/coingecko.actions";

export const useCoinGeckoPolling = ({
  coinId,
  interval = "30m",
}: { coinId?: string; interval?: string }) => {
  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!coinId) return;

    let isMounted = true;

    // Determine days for OHLC based on interval.
    // CoinGecko only supports 1, 7, 14, 30, 90, 180, 365 days.
    // 1 day = 30 min candles. 7 days = 4 hour candles.
    const daysMap: Record<string, number> = {
      "1m": 1,
      "3m": 1,
      "5m": 1,
      "15m": 1,
      "30m": 1,
      "1h": 1,
      "2h": 1,
      "4h": 7,
      "6h": 7,
      "8h": 7,
      "12h": 7,
      "1d": 30,
      "3d": 90,
      "1w": 180,
      "1M": 365,
    };
    const days = daysMap[interval] || 1;

    const poll = async () => {
      try {
        const [ohlcData, tickerData] = await Promise.all([
          fetchCoinGeckoOhlc(coinId, days),
          fetchCoinGeckoTicker(coinId),
        ]);

        if (!isMounted) return;

        if (tickerData && tickerData.tickers && tickerData.tickers.length > 0) {
          const validTickers = tickerData.tickers.filter(
            (t: any) => t.target === "USD" || t.target === "USDT" || t.target === "USDC"
          );
          const bestTicker = validTickers.length > 0 ? validTickers[0] : tickerData.tickers[0];
          
          const p = typeof bestTicker.last === 'number' ? bestTicker.last : parseFloat(bestTicker.last);
          const v = typeof bestTicker.volume === 'number' ? bestTicker.volume : parseFloat(bestTicker.volume);

          if (!isNaN(p)) {
            setPrice({
              usd: p,
              coin: coinId,
              price: p,
              change24h: null, 
              marketCap: null,
              volume24h: v || 0,
              timestamp: new Date().getTime(),
            });

            // Generate synthetic fake trade as fallback for recent trades since CoinGecko does not
            // offer a free real-time trades stream endpoint.
            const fakeTrade: Trade = {
              price: p,
              amount: v > 0 ? v / 1000 : 0.1,
              value: p * (v > 0 ? v / 1000 : 0.1),
              type: Math.random() > 0.5 ? "buy" : "sell",
              timestamp: bestTicker.timestamp ? new Date(bestTicker.timestamp).getTime() : new Date().getTime(),
              isSynthetic: true,
            };

            setTrades((prev) => [fakeTrade, ...prev].slice(0, 10));
          }
        }

        if (ohlcData && ohlcData.length > 0) {
          const lastCandle = ohlcData[ohlcData.length - 1];
          setOhlcv(lastCandle);
        }

        setIsConnected(true);
      } catch (e) {
        if (isMounted) setIsConnected(false);
      }
    };

    poll();
    const timer = setInterval(poll, 10000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [coinId, interval]);

  return { price, trades, ohlcv, isConnected };
};
