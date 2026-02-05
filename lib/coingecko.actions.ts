"use server";

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_API_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

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

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json", 
      "x-cg-pro-api-key": API_KEY
    } as Record<string, string>,
    next: { revalidate }
  });
  console.debug(res)
  if (!res.ok) {
    const errorBody: CoinGeckoErrorBody = await res.json().catch(() => ({}));
    throw new Error(`Error fetching data from CoinGecko: ${res.status} ${errorBody.error || res.statusText}`);
  }

  return res.json();
}