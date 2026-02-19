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
    setOhlcv(null);

    binanceWSService.connect(symbol, interval);
    setIsConnected(true);

    const unsubPrice = binanceWSService.subscribe("price", (data) => {
      setPrice(data);
    });

    const unsubTrade = binanceWSService.subscribe("trade", (trade) => {
      setTrades((prev) => [trade, ...prev].slice(0, MAX_TRADES));
    });

    const unsubKline = binanceWSService.subscribe("kline", (kline) => {
      setOhlcv(kline);
    });

    return () => {
      unsubPrice();
      unsubTrade();
      unsubKline();
      binanceWSService.disconnect();
      setIsConnected(false);
    };
  }, [symbol, interval]);

  return {
    price,
    trades,
    ohlcv,
    isConnected,
  };
};
