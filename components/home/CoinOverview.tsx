import { coingeckoFetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image"
import { CoinOverviewFallback } from "./fallback";
import CandlestickChart from "../CandlestickChart";

const CoinOverview = async () => {
  let coin: CoinDetailsData | undefined
  let coinOHLC: OHLCData[] | undefined

  try {
    [coin, coinOHLC] = await Promise.all([
      coingeckoFetcher<CoinDetailsData>("/coins/bitcoin"),
      coingeckoFetcher<OHLCData[]>("/coins/bitcoin/ohlc", {
        vs_currency: "usd",
        days: 1,
      }),
    ])
  } catch (error) {
    console.error("Error fetching coin data:", error)
    return <CoinOverviewFallback />
  }

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