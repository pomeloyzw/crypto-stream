"use client";

import { Separator } from "./ui/separator"
import CandlestickChart from "./CandlestickChart"
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";
import { useCoinGeckoPolling } from "@/hooks/useCoinGeckoPolling";
import { checkBinanceSymbol } from "@/lib/binance.actions";
import { formatCurrency, timeAgo } from "@/lib/utils";
import DataTable from "./DataTable";
import { useState, useEffect } from "react";
import CoinHeader from "./CoinHeader";
import { theme } from "@/lib/theme";

const LiveDataWrapper = ({ coinId, coin, coinOHLCData }: LiveDataProps) => {
  const [klineInterval, setKlineInterval] = useState<BinanceKlineInterval>('30m');

  // Convert coin symbol to Binance format (e.g., 'btc' -> 'btcusdt')
  const binanceSymbol = `${coin.symbol.toLowerCase()}usdt`;

  const [isBinanceSupported, setIsBinanceSupported] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsBinanceSupported(null);
    checkBinanceSymbol(binanceSymbol).then(supported => {
      if (isMounted) setIsBinanceSupported(supported);
    });
    return () => { isMounted = false; };
  }, [binanceSymbol]);

  const binanceProps = isBinanceSupported === true ? { symbol: binanceSymbol, interval: klineInterval } : { symbol: "" };
  const binanceData = useBinanceWebSocket(binanceProps);

  const cgProps = isBinanceSupported === false ? { coinId, interval: klineInterval } : { coinId: "" };
  const cgData = useCoinGeckoPolling(cgProps);

  const liveData = isBinanceSupported === false ? cgData : binanceData;
  const { trades, ohlcv, price } = liveData;

  const tradeColumns: DataTableColumn<Trade>[] = [
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (trade) => (trade.price ? formatCurrency(trade.price) : '-'),
    },
    {
      header: 'Amount',
      cellClassName: 'amount-cell',
      cell: (trade) => formatCurrency(trade.amount, 4) ?? '-',
    },
    {
      header: 'Value',
      cellClassName: 'value-cell',
      cell: (trade) => (trade.value ? formatCurrency(trade.value) : '-'),
    },
    {
      header: 'Buy/Sell',
      cellClassName: 'type-cell',
      cell: (trade) => (
        <span className={trade.type === 'buy' ? theme.colors.trendUp : theme.colors.trendDown}>
          {trade.type === 'buy' ? 'Buy' : 'Sell'}
          {trade.isSynthetic && <span className="ml-1 text-[10px] text-muted-foreground opacity-70">(Synthetic)</span>}
        </span>
      ),
    },
    {
      header: 'Time',
      cellClassName: 'time-cell',
      cell: (trade) => (trade.timestamp ? timeAgo(trade.timestamp) : '-'),
    },
  ];

  return (
    <section id="live-data-wrapper">
      <CoinHeader
        name={coin.name}
        image={coin.image.large}
        livePrice={price?.usd ?? coin.market_data.current_price.usd}
        livePriceChangePercentage24h={price?.change24h ??
          coin.market_data.price_change_percentage_24h_in_currency.usd}
        priceChangePercentage30d={coin.market_data.price_change_percentage_30d_in_currency.usd}
        priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
      />
      <Separator className="divider" />

      <div className="trend">
        {isBinanceSupported !== null ? (
          <CandlestickChart
            coinId={coinId}
            binanceSymbol={isBinanceSupported === true ? binanceSymbol : undefined}
            data={coinOHLCData}
            liveOhlcv={ohlcv}
            mode="live"
            klineInterval={klineInterval}
            onKlineIntervalChange={setKlineInterval}
          >
            <h4>Trend Overview</h4>
          </CandlestickChart>
        ) : (
          <div className="flex items-center justify-center h-[360px]">
            <span className="text-muted-foreground text-sm font-medium">Loading chart data...</span>
          </div>
        )}
      </div>

      <Separator className="divider" />

      <div className="trades">
        <h4>Recent Trades</h4>

        <DataTable
          columns={tradeColumns}
          data={trades}
          rowKey={(_, index) => index}
          tableClassName="trades-table"
        />
      </div>
    </section>
  )
}

export default LiveDataWrapper