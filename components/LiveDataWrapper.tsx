"use client";

import { Separator } from "./ui/separator"
import CandlestickChart from "./CandlestickChart"
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";
import { formatCurrency, timeAgo } from "@/lib/utils";
import DataTable from "./DataTable";
import { useState } from "react";
import CoinHeader from "./CoinHeader";

const LiveDataWrapper = ({ children, coinId, poolId, coin, coinOHLCData }: LiveDataProps) => {
  const [klineInterval, setKlineInterval] = useState<BinanceKlineInterval>('30m');

  // Convert coin symbol to Binance format (e.g., 'btc' -> 'btcusdt')
  const binanceSymbol = `${coin.symbol.toLowerCase()}usdt`;

  const { trades, ohlcv, price } = useBinanceWebSocket({
    symbol: binanceSymbol,
    interval: klineInterval,
  });

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
        <span className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
          {trade.type === 'buy' ? 'Buy' : 'Sell'}
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
        <CandlestickChart
          coinId={coinId}
          binanceSymbol={binanceSymbol}
          data={coinOHLCData}
          liveOhlcv={ohlcv}
          mode="live"
          klineInterval={klineInterval}
          onKlineIntervalChange={setKlineInterval}
        >
          <h4>Trend Overview</h4>
        </CandlestickChart>
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