import Converter from "@/components/Converter";
import LiveDataWrapper from "@/components/LiveDataWrapper";
import TradeCard from "@/components/TradeCard";
import { coingeckoFetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const page = async ({ params }: NextPageProps) => {
  const { id } = await params;

  const [coinData, coinOHLCData] = await Promise.all([
    coingeckoFetcher<CoinDetailsData>(`/coins/${id}`, {
      dex_pair_format: 'contract_address',
    }),
    coingeckoFetcher<OHLCData[]>(`/coins/${id}/ohlc`, {
      vs_currency: 'usd',
      days: 1,
      precision: "full",
    }),
  ]);

  const isValidUrl = (url: string | undefined | null): url is string =>
    typeof url === 'string' && url.trim().length > 0 && /^https?:\/\//i.test(url.trim());

  const coinDetails = [
    {
      label: "Market Cap",
      value: formatCurrency(coinData.market_data.market_cap.usd),
    },
    {
      label: "Market Cap Rank",
      value: coinData.market_cap_rank != null ? `# ${coinData.market_cap_rank}` : "—",
    },
    {
      label: "Total Volume",
      value: formatCurrency(coinData.market_data.total_volume.usd),
    },
    {
      label: "Website",
      value: "-",
      link: isValidUrl(coinData.links.homepage?.[0]) ? coinData.links.homepage![0] : undefined,
      linkText: "Homepage",
    },
    {
      label: "Explorer",
      value: "-",
      link: isValidUrl(coinData.links.blockchain_site?.[0]) ? coinData.links.blockchain_site![0] : undefined,
      linkText: "Explorer",
    },
    {
      label: "Community",
      value: "-",
      link: isValidUrl(coinData.links.subreddit_url) ? coinData.links.subreddit_url : undefined,
      linkText: "Community",
    },
  ];

  return (
    <main id="coin-details-page">
      <section className="primary">
        <LiveDataWrapper
          coinId={id}
          coin={coinData}
          coinOHLCData={coinOHLCData}
        >
        </LiveDataWrapper>
      </section>

      <section className="secondary flex flex-col gap-6">
        <Converter
          symbol={coinData.symbol}
          icon={coinData.image.small}
          priceList={coinData.market_data.current_price}
        />
        <TradeCard
          coinId={id}
          symbol={coinData.symbol}
          name={coinData.name}
          currentPrice={coinData.market_data.current_price.usd}
        />
        <div className="details">
          <h4>Coin Details</h4>
          <ul className="details-grid">
            {coinDetails.map(({ label, value, link, linkText }, index) => (
              <li key={index}>
                <span className="label">{label}</span>
                {link ? (
                  <div className="link">
                    <Link href={link} target="_blank" rel="noopener noreferrer">
                      {linkText || label}
                    </Link>
                    <ArrowUpRight size={16} />
                  </div>
                ) : (
                  <p className="text-base font-medium">{value}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

export default page