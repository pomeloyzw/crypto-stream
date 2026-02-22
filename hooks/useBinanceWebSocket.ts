import { binanceWSService } from "@/app/services/binanceWsService";
import { useEffect, useState } from "react";

const MAX_TRADES = 10;

export const useBinanceWebSocket = ({
  symbol,
  interval = "1m",
}: UseBinanceWebSocketProps) => {
  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!symbol) return;

    // Clear stale candle data from previous interval/symbol
    // Use queueMicrotask to avoid synchronous render warning
    queueMicrotask(() => {
      setOhlcv(null);
      setTrades([]);
      setPrice(null);
    });

    binanceWSService.connect(symbol, interval);

    const unsubPrice = binanceWSService.subscribe("price", (data) => {
      setPrice(data);
    });

    const unsubTrade = binanceWSService.subscribe("trade", (trade) => {
      setTrades((prev) => [trade, ...prev].slice(0, MAX_TRADES));
    });

    const unsubKline = binanceWSService.subscribe("kline", (kline) => {
      setOhlcv(kline);
    });

    const unsubConnection = binanceWSService.subscribe("connection", (connected) => {
      setIsConnected(connected);
    });

    return () => {
      unsubPrice();
      unsubTrade();
      unsubKline();
      unsubConnection();
      binanceWSService.disconnect();
    };
  }, [symbol, interval]);

  return {
    price,
    trades,
    ohlcv,
    isConnected,
  };
};
