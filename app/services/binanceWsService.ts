type Listener<T> = (data: T) => void;

type Streams = {
  price: ExtendedPriceData;
  trade: Trade;
  kline: OHLCData;
};

class BinanceWSService {
  private ws: WebSocket | null = null;

  private listeners = {
    price: new Set<Listener<Streams["price"]>>(),
    trade: new Set<Listener<Streams["trade"]>>(),
    kline: new Set<Listener<Streams["kline"]>>(),
  };

  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  private currentConfig: {
    symbol: string;
    interval: string;
  } | null = null;

  private readonly MAX_RECONNECT = 5;

  connect(symbol: string, interval: string) {
    if (!symbol) return;

    const normalized = symbol.toLowerCase();

    if (
      this.ws &&
      this.currentConfig?.symbol === normalized &&
      this.currentConfig?.interval === interval
    ) {
      return;
    }

    this.disconnect();

    this.currentConfig = { symbol: normalized, interval };

    const wsBase = process.env.NEXT_PUBLIC_BINANCE_WS_URL;
    if (!wsBase) {
      console.error("NEXT_PUBLIC_BINANCE_WS_URL is not set — skipping WebSocket connection");
      return;
    }

    const streams = [
      `${normalized}@ticker`,
      `${normalized}@trade`,
      `${normalized}@kline_${interval}`,
    ];

    const url = `${wsBase}/stream?streams=${streams.join("/")}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const data = parsed.data;
        if (!data) return;

        switch (data.e) {
          case "24hrTicker":
            this.emit("price", {
              usd: parseFloat(data.c),
              coin: normalized,
              price: parseFloat(data.c),
              change24h: parseFloat(data.P),
              marketCap: 0,
              volume24h: parseFloat(data.v),
              timestamp: data.E,
            });
            break;

          case "trade":
            this.emit("trade", {
              price: parseFloat(data.p),
              value: parseFloat(data.p) * parseFloat(data.q),
              timestamp: data.T,
              type: data.m ? "sell" : "buy",
              amount: parseFloat(data.q),
            });
            break;

          case "kline": {
            const k = data.k;
            this.emit("kline", [
              Math.floor(k.t / 1000),
              parseFloat(k.o),
              parseFloat(k.h),
              parseFloat(k.l),
              parseFloat(k.c),
            ]);
            break;
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("WS parse error:", err);
        }
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.tryReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private tryReconnect() {
    if (!this.currentConfig) return;
    if (this.reconnectAttempts >= this.MAX_RECONNECT) return;

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(
        this.currentConfig!.symbol,
        this.currentConfig!.interval
      );
    }, delay);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      // Remove all handlers BEFORE closing to prevent stale messages
      // from being emitted (ws.close() is async — the old WS can still
      // fire onmessage with old interval data before fully closing)
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onopen = null;
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe<K extends keyof Streams>(
    type: K,
    listener: Listener<Streams[K]>
  ): () => boolean {
    switch (type) {
      case "price":
        this.listeners.price.add(listener as Listener<Streams["price"]>);
        return () =>
          this.listeners.price.delete(
            listener as Listener<Streams["price"]>
          );

      case "trade":
        this.listeners.trade.add(listener as Listener<Streams["trade"]>);
        return () =>
          this.listeners.trade.delete(
            listener as Listener<Streams["trade"]>
          );

      case "kline":
        this.listeners.kline.add(listener as Listener<Streams["kline"]>);
        return () =>
          this.listeners.kline.delete(
            listener as Listener<Streams["kline"]>
          );

      default: {
        const _exhaustive: never = type;
        throw new Error(`Unknown stream type: ${_exhaustive}`);
      }
    }
  }

  private emit<K extends keyof Streams>(type: K, data: Streams[K]) {
    switch (type) {
      case "price":
        this.listeners.price.forEach((l) => l(data as Streams["price"]));
        break;
      case "trade":
        this.listeners.trade.forEach((l) => l(data as Streams["trade"]));
        break;
      case "kline":
        this.listeners.kline.forEach((l) => l(data as Streams["kline"]));
        break;
    }
  }
}

export const binanceWSService = new BinanceWSService();
