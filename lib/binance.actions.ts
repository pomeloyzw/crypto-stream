"use server";

const BINANCE_API_URL = process.env.BINANCE_API_URL;

if (!BINANCE_API_URL) {
  throw new Error("Missing BINANCE_API_URL environment variable");
}

/**
 * Fetch historical kline (candlestick) data from Binance in OHLC format.
 *
 * @param limit - Maximum number of klines to retrieve (default: 500)
 * @returns An array of OHLCData tuples: [timestamp_seconds, open, high, low, close]
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
  // [openTime, open, high, low, close, volume, closeTime, quoteVolume, count, takerBuyVolume, takerBuyQuoteVolume, ignore]
  const rawKlines: [number, string, string, string, string, string, number, string, number, string, string, string][] = await response.json();

  return rawKlines.map((k) => [
    Math.floor(k[0] / 1000),  // Convert ms → seconds to align with live kline data
    parseFloat(k[1]),         // Open
    parseFloat(k[2]),         // High
    parseFloat(k[3]),         // Low
    parseFloat(k[4]),         // Close
  ] as OHLCData);
}

/**
 * Check if a symbol exists on Binance.
 */
export async function checkBinanceSymbol(symbol: string): Promise<boolean> {
  const url = `${BINANCE_API_URL}/ticker/price?symbol=${symbol.toUpperCase()}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}