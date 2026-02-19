"use server";

import qs from "query-string";

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