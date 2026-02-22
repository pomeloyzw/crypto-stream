"use server";

import qs from "query-string";

export interface CoinGeckoSearchCoin {
  id: string;
  name: string;
  api_symbol: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

export interface CoinGeckoSearchResponse {
  coins: CoinGeckoSearchCoin[];
  exchanges: unknown[];
  icos: unknown[];
  categories: unknown[];
  nfts: unknown[];
}

export interface CoinGeckoTicker {
  base: string;
  target: string;
  market: {
    name: string;
    identifier: string;
    has_trading_incentive: boolean;
  };
  last: number;
  volume: number;
  converted_last: {
    btc: number;
    eth: number;
    usd: number;
  };
  converted_volume: {
    btc: number;
    eth: number;
    usd: number;
  };
  trust_score: string;
  bid_ask_spread_percentage: number;
  timestamp: string;
  last_traded_at: string;
  last_fetch_at: string;
  is_anomaly: boolean;
  is_stale: boolean;
  trade_url: string | null;
  token_info_url: string | null;
  coin_id: string;
  target_coin_id: string;
}

export interface CoinGeckoTickersResponse {
  name: string;
  tickers: CoinGeckoTicker[];
}

const BASE_URL = process.env.COINGECKO_API_URL;
const API_KEY = process.env.COINGECKO_API_KEY;
const API_KEY_HEADER =
  process.env.COINGECKO_API_KEY_HEADER?.trim() || "x-cg-demo-api-key";

if (!BASE_URL) {
  throw new Error("COINGECKO_API_URL is not defined");
}
if (!API_KEY) {
  throw new Error("COINGECKO_API_KEY is not defined");
}

export async function coingeckoFetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60
): Promise<T> {
  const url = qs.stringifyUrl({
    url: `${BASE_URL}${endpoint}`,
    query: params,
  }, { skipEmptyString: true, skipNull: true });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        [API_KEY_HEADER]: API_KEY,
      } as Record<string, string>,
      next: { revalidate },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    // Try to parse JSON error body, otherwise fall back to text for clearer errors
    const parsed = await res.text().catch(() => "");
    let errorMessage = res.statusText;
    try {
      const json = JSON.parse(parsed || "{}");
      errorMessage = json.error || json.message || errorMessage;
    } catch {
      if (parsed) errorMessage = parsed;
    }
    throw new Error(`Error fetching data from CoinGecko: ${res.status} ${errorMessage}`);
  }

  return res.json();
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null
): Promise<PoolData> {
  const fallback: PoolData = {
    id: "",
    name: "",
    address: "",
    network: "",
  };

  if (network && contractAddress) {
    try {
      const poolData = await coingeckoFetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`);
      return poolData.data?.[0] ?? fallback;
    } catch {
      return fallback;
    }
  }

  try {
    const poolData = await coingeckoFetcher<{ data: PoolData[] }>(
      `/onchain/search/pools`, { query: id });
    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}

export async function searchCoins(query: string): Promise<CoinGeckoSearchCoin[]> {
  if (!query) return [];
  
  try {
    const data = await coingeckoFetcher<CoinGeckoSearchResponse>(
      '/search',
      { query },
      60
    );
    
    return data?.coins || [];
  } catch (error) {
    console.error('Error searching coins:', error);
    return [];
  }
}

export async function fetchCoinGeckoOhlc(coinId: string, days: number = 1): Promise<OHLCData[]> {
  try {
    const data = await coingeckoFetcher<[number, number, number, number, number][]>(
      `/coins/${coinId}/ohlc`,
      { vs_currency: "usd", days },
      60
    );

    if (Array.isArray(data)) {
      return data.map((k) => [
        Math.floor(k[0] / 1000), // ms -> seconds
        k[1],
        k[2],
        k[3],
        k[4],
      ] as OHLCData);
    }
    return [];
  } catch (error) {
    console.error("Error fetching CoinGecko OHLC:", error);
    return [];
  }
}

export async function fetchCoinGeckoTicker(coinId: string): Promise<CoinGeckoTickersResponse | null> {
  try {
    const data = await coingeckoFetcher<CoinGeckoTickersResponse>(
      `/coins/${coinId}/tickers`,
      { include_exchange_logo: "false", page: "1" },
      10
    );
    return data;
  } catch (error) {
    console.error("Error fetching CoinGecko Ticker:", error);
    return null;
  }
}
