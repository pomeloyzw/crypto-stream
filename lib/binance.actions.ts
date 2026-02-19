"use server";

const BINANCE_API_URL = process.env.BINANCE_API_URL;

if (!BINANCE_API_URL) {
  throw new Error("Missing BINANCE_API_URL environment variable");
}

/**
 * Fetch historical kline (candlestick) data from Binance REST API.
 * Returns data in the same OHLCData format: [timestamp_seconds, open, high, low, close]
 */
export async function fetchBinanceKlines(
  symbol: string,
  interval: BinanceKlineInterval,
  limit: number = 500,
): Promise<OHLCData[]> {
  const url = `${BINANCE_API_URL}/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err) {
    throw new Error(`Binance API request failed: ${err instanceof Error ? err.message : err}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
  }

  // Binance kline response format:
  // [openTime, open, high, low, close, volume, closeTime, ...]
  const rawKlines: (string | number)[][] = await response.json();

  return rawKlines.map((k) => [
    Number(k[0]),                     // Open time in milliseconds (same as CoinGecko format)
    parseFloat(String(k[1])),         // Open
    parseFloat(String(k[2])),         // High
    parseFloat(String(k[3])),         // Low
    parseFloat(String(k[4])),         // Close
  ] as OHLCData);
}
