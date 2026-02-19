import type {
  CandlestickSeriesPartialOptions,
  ChartOptions,
  DeepPartial,
} from 'lightweight-charts';
import { ColorType } from 'lightweight-charts';

export const navItems = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Search',
    href: '/',
  },
  {
    label: 'All Coins',
    href: '/coins',
  },
];

const CHART_COLORS = {
  background: '#0b1116',
  text: '#8f9fb1',
  grid: '#1a2332',
  border: '#1a2332',
  crosshairVertical: '#ffffff40',
  crosshairHorizontal: '#ffffff20',
  candleUp: '#158A6E',
  candleDown: '#EB1C36',
} as const;

export const getCandlestickConfig = (): CandlestickSeriesPartialOptions => ({
  upColor: CHART_COLORS.candleUp,
  downColor: CHART_COLORS.candleDown,
  wickUpColor: CHART_COLORS.candleUp,
  wickDownColor: CHART_COLORS.candleDown,
  borderVisible: true,
  wickVisible: true,
});

export const getChartConfig = (
  height: number,
  timeVisible: boolean = true,
): DeepPartial<ChartOptions> => ({
  width: 0,
  height,
  layout: {
    background: { type: ColorType.Solid, color: CHART_COLORS.background },
    textColor: CHART_COLORS.text,
    fontSize: 12,
    fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial',
  },
  grid: {
    vertLines: { visible: false },
    horzLines: {
      visible: true,
      color: CHART_COLORS.grid,
      style: 2,
    },
  },
  rightPriceScale: {
    borderColor: CHART_COLORS.border,
  },
  timeScale: {
    borderColor: CHART_COLORS.border,
    timeVisible,
    secondsVisible: false,
  },
  handleScroll: true,
  handleScale: true,
  crosshair: {
    mode: 1,
    vertLine: {
      visible: true,
      color: CHART_COLORS.crosshairVertical,
      width: 1,
      style: 0,
    },
    horzLine: {
      visible: true,
      color: CHART_COLORS.crosshairHorizontal,
      width: 1,
      style: 0,
    },
  },
  localization: {
    priceFormatter: (price: number) =>
      '$' + price.toLocaleString(undefined, { maximumFractionDigits: 2 }),
  },
});

export const PERIOD_CONFIG: Record<
  Period,
  { days: number | string; interval?: 'hourly' | 'daily' }
> = {
  daily: { days: 1, interval: 'hourly' },
  weekly: { days: 7, interval: 'hourly' },
  monthly: { days: 30, interval: 'hourly' },
  '3months': { days: 90, interval: 'daily' },
  '6months': { days: 180, interval: 'daily' },
  yearly: { days: 365 },
  max: { days: 'max' },
};

export const PERIOD_BUTTONS: { value: Period; label: string }[] = [
  { value: 'daily', label: '1D' },
  { value: 'weekly', label: '1W' },
  { value: 'monthly', label: '1M' },
  { value: '3months', label: '3M' },
  { value: '6months', label: '6M' },
  { value: 'yearly', label: '1Y' },
  { value: 'max', label: 'Max' },
];

export const KLINE_INTERVAL_BUTTONS: { value: BinanceKlineInterval; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
];

// Maps each chart period to the Binance kline interval and candle count
export const PERIOD_TO_KLINE_INTERVAL: Record<Period, { interval: BinanceKlineInterval; limit: number }> = {
  daily: { interval: '30m', limit: 48 },    // 1D  → 30-minute candles
  weekly: { interval: '4h', limit: 42 },    // 1W  → 4-hour candles
  monthly: { interval: '8h', limit: 90 },   // 1M  → 8-hour candles
  '3months': { interval: '1d', limit: 90 }, // 3M  → 1-day candles
  '6months': { interval: '3d', limit: 60 }, // 6M  → 3-day candles
  yearly: { interval: '1w', limit: 52 },    // 1Y  → 1-week candles
  max: { interval: '1M', limit: 120 },      // Max → 1-month candles
};