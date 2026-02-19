import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import Image from 'next/image';
import { Badge } from "./ui/badge";

type Trend = 'up' | 'down' | 'neutral';

const getTrend = (value: number | null | undefined): Trend => {
  if (value == null) return 'neutral';
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
};

const CoinHeader = ({
  livePriceChangePercentage24h,
  priceChangePercentage30d,
  name,
  image,
  livePrice,
  priceChange24h
}: LiveCoinHeaderProps) => {
  const trendToday = getTrend(livePriceChangePercentage24h);
  const trend30d = getTrend(priceChangePercentage30d);
  const trendPriceChange = getTrend(priceChange24h);

  const stats = [
    {
      label: 'Today',
      value: livePriceChangePercentage24h,
      trend: trendToday,
      formatter: formatPercentage,
      showIcon: true,
    },
    {
      label: '30 Days',
      value: priceChangePercentage30d,
      trend: trend30d,
      formatter: formatPercentage,
      showIcon: true,
    },
    {
      label: 'Price Change (24h)',
      value: priceChange24h,
      trend: trendPriceChange,
      formatter: formatCurrency,
      showIcon: false,
    },
  ];

  return (
    <div id="coin-header">
      <h3>{name}</h3>

      <div className="info">
        <Image src={image} alt={name} width={77} height={77} />

        <div className="price-row">
          <h1>{formatCurrency(livePrice)}</h1>
          <Badge className={cn('badge', trendToday === 'up' ? 'badge-up' : trendToday === 'down' ? 'badge-down' : 'badge-neutral')}>
            {formatPercentage(livePriceChangePercentage24h)}
            {trendToday !== 'neutral' && (trendToday === 'down' ? <TrendingDown /> : <TrendingUp />)}
            (24h)
          </Badge>
        </div>
      </div>

      <ul className="stats">
        {stats.map((stat) => (
          <li key={stat.label}>
            <p className="label">{stat.label}</p>

            <div
              className={cn('value', {
                'text-green-500': stat.trend === 'up',
                'text-red-500': stat.trend === 'down',
              })}
            >
              <p>{stat.formatter(stat.value)}</p>
              {stat.showIcon && stat.trend !== 'neutral' &&
                (stat.trend === 'up' ? (
                  <TrendingUp width={16} height={16} />
                ) : (
                  <TrendingDown width={16} height={16} />
                ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CoinHeader