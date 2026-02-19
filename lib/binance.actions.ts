"use server";

const BINANCE_API_URL = process.env.BINANCE_API_URL;

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

  const response = await fetch(url);

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
