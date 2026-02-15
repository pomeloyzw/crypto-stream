"use client";

import { Separator } from "./ui/separator"
import CandlestickChart from "./CandlestickChart"
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";
import { formatCurrency, timeAgo } from "@/lib/utils";
import DataTable from "./DataTable";

const LiveDataWrapper = ({ children, coinId, poolId, coin, coinOHLCData }: LiveDataProps) => {
  // Convert coin symbol to Binance format (e.g., 'btc' -> 'btcusdt')
  const binanceSymbol = `${coin.symbol.toLowerCase()}usdt`;
  
  const { trades } = useBinanceWebSocket({
    symbol: binanceSymbol,
    interval: '1m',
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
        <span className={trade.type === 'b' ? 'text-green-500' : 'text-red-500'}>
          {trade.type === 'b' ? 'Buy' : 'Sell'}
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
      <p>Coin Header</p>
      <Separator className="divider" />

      <div className="trend">
        <CandlestickChart coinId={coinId} data={coinOHLCData}>
          <h4>Trend Overview</h4>
        </CandlestickChart>
      </div>

      <Separator className="divider" />

      {tradeColumns && (
        <div className="trades">
          <h4>Recent Trades</h4>

          <DataTable 
            columns={tradeColumns} 
            data={trades} 
            rowKey={(_, index) => index} 
            tableClassName="trades-table" 
          />
        </div>
      )}
    </section>
  )
}

export default LiveDataWrapper