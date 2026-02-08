import { coingeckoFetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image"
import { CoinOverviewFallback } from "./fallback";
import CandlestickChart from "../CandlestickChart";

const CoinOverview = async () => {
  let coinOHLC: OHLCData[] | undefined

  const [coinResult, ohlcResult] = await Promise.allSettled([
    coingeckoFetcher<CoinDetailsData>("/coins/bitcoin"),
    coingeckoFetcher<OHLCData[]>("/coins/bitcoin/ohlc", {
      vs_currency: "usd",
      days: 1,
    }),
  ])

  if (coinResult.status === "rejected") {
    console.error("Error fetching coin details:", coinResult.reason)
    return <CoinOverviewFallback />
  }

  if (ohlcResult.status === "fulfilled") {
    coinOHLC = ohlcResult.value
  } else {
    console.error("Error fetching OHLC data:", ohlcResult.reason)
    coinOHLC = []
  }

  const coin = coinResult.value;
  if (!coin) return <CoinOverviewFallback />

  return (
    <div id="coin-overview">
      <CandlestickChart data={coinOHLC || []} coinId={coin.id}>
        <div className="header pt-2">
          <Image
            className="header-image"
            src={coin.image.large}
            alt={coin.name}
            width={56}
            height={56}
          />
          <div className="info">
            <p>
              {coin.name} / {coin.symbol.toUpperCase()}
            </p>
            <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
          </div>
        </div>
      </CandlestickChart>
    </div>
  )
}

export default CoinOverview