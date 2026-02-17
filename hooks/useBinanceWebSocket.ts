"use client";

import { useEffect, useRef, useState } from 'react';

// Binance WebSocket endpoints
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';
const BINANCE_COMBINED_WS = 'wss://stream.binance.com:9443/stream';

export const useBinanceWebSocket = ({
  symbol, // e.g., 'btcusdt', 'ethusdt'
  interval = '1m', // kline interval: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
}: UseBinanceWebSocketProps): UseBinanceWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isWsReady, setIsWsReady] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  
  // Buffer to collect trades between candle closes
  const tradesBufferRef = useRef<Trade[]>([]);

  useEffect(() => {
    if (!symbol) return;

    const normalizedSymbol = symbol.toLowerCase();
    
    // Combined streams for multiple subscriptions
    const streams = [
      `${normalizedSymbol}@ticker`,      // 24hr ticker (price, volume, change)
      `${normalizedSymbol}@trade`,       // Real-time trades
      `${normalizedSymbol}@kline_${interval}`, // OHLCV candlestick data
    ];

    const wsUrl = `${BINANCE_COMBINED_WS}?streams=${streams.join('/')}`;
    
    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`Binance WebSocket connected with interval: ${interval}`);
        setIsWsReady(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          const data = message.data;

          if (!data) return;

          // Handle 24hr Ticker Stream (price, volume, market cap proxy)
          if (data.e === '24hrTicker') {
            setPrice({
              usd: parseFloat(data.c), // Current price
              coin: normalizedSymbol,
              price: parseFloat(data.c),
              change24h: parseFloat(data.P), // 24h price change percent
              marketCap: 0, // Binance doesn't provide market cap directly
              volume24h: parseFloat(data.v), // 24h volume in base asset
              timestamp: data.E,
            });
          }

          // Handle Trade Stream
          if (data.e === 'trade') {
            const newTrade: Trade = {
              price: parseFloat(data.p),
              value: parseFloat(data.p) * parseFloat(data.q), // price * quantity
              timestamp: data.T,
              type: data.m ? 'sell' : 'buy', // m = true means buyer is market maker (sell)
              amount: parseFloat(data.q),
            };
            console.log('Trade received:', { timestamp: data.T, date: new Date(data.T).toISOString() });
            // Buffer trades instead of immediately updating state
            tradesBufferRef.current = [newTrade, ...tradesBufferRef.current].slice(0, 20);
          }

          // Handle Kline/Candlestick Stream (OHLCV)
          if (data.e === 'kline') {
            const kline = data.k;
            
            // Only update when the candle is closed (x = true) to control update frequency
            // This means: 1m interval = update every 1 minute, 3m interval = update every 3 minutes
            if (kline.x) {
              console.log(`Kline closed - interval: ${kline.i}, flushing ${tradesBufferRef.current.length} trades`);
              
              // Update OHLCV data
              const candle: OHLCData = [
                Math.floor(kline.t / 1000), // Open time in seconds (convert from ms)
                parseFloat(kline.o), // Open
                parseFloat(kline.h), // High
                parseFloat(kline.l), // Low
                parseFloat(kline.c), // Close
              ];
              setOhlcv(candle);
              
              // Flush trades buffer to state (show top 7 trades)
              const tradesToFlush = tradesBufferRef.current.slice(0, 7);
              console.log('Flushing trades:', tradesToFlush.map(t => ({ 
                timestamp: t.timestamp, 
                date: t.timestamp ? new Date(t.timestamp).toISOString() : 'no timestamp'
              })));
              setTrades(tradesToFlush);
              // Clear the buffer for the next interval
              tradesBufferRef.current = [];
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
        setIsWsReady(false);
      };

      ws.onclose = (event) => {
        console.log('Binance WebSocket closed:', event.code, event.reason);
        setIsWsReady(false);
        wsRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsWsReady(false);
    };
  }, [symbol, interval]);

  return {
    price,
    trades,
    ohlcv,
    isConnected: isWsReady,
  };
};