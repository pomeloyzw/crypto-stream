"use client";

import { getCandlestickConfig, getChartConfig, KLINE_INTERVAL_BUTTONS, PERIOD_BUTTONS, PERIOD_CONFIG, PERIOD_TO_KLINE_INTERVAL } from "@/constants";
import { fetchBinanceKlines } from "@/lib/binance.actions";
import { coingeckoFetcher } from "@/lib/coingecko.actions";
import { convertOHLCData, toSeconds } from "@/lib/utils";
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { useEffect, useRef, useState, useTransition } from "react";

const normalizeOhlcTimestamps = (data: OHLCData[]): OHLCData[] => {
  return data.map(
    (item) => [toSeconds(item[0]) as unknown as number, item[1], item[2], item[3], item[4]] as OHLCData
  );
};

const CandlestickChart = ({
  children,
  data,
  coinId,
  binanceSymbol,
  height = 360,
  initialPeriod = "daily",
  liveOhlcv = null,
  mode = "historical",
  klineInterval,
  onKlineIntervalChange,
}: CandlestickChartProps) => {

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const prevOhlcDataLengthRef = useRef<number>(data?.length || 0);
  const requestIdRef = useRef<number>(0);
  const binanceDataLoadedRef = useRef(false);
  const ohlcDataRef = useRef<OHLCData[]>([]);

  const [period, setPeriod] = useState<Period>(initialPeriod);
  // In live mode, start empty — Binance data will be fetched on mount
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(mode === 'live' ? [] : (data ?? []));
  const [isPending, startTransition] = useTransition();

  // Keep ref in sync so the chart-creation effect always reads current data
  ohlcDataRef.current = ohlcData;

  const fetchOHLCData = async (selectedPeriod: Period, overrideInterval?: BinanceKlineInterval) => {
    // increment request id to invalidate previous requests
    const reqId = ++requestIdRef.current;
    try {
      let newData: OHLCData[] | null = null;

      if (mode === 'live' && binanceSymbol) {
        // In live mode, fetch from Binance REST API so candle intervals match the WebSocket
        const { interval: defaultInterval, limit: defaultLimit } = PERIOD_TO_KLINE_INTERVAL[selectedPeriod];
        const interval = overrideInterval ?? defaultInterval;
        // When using a custom interval, use a reasonable default limit
        const limit = overrideInterval ? 100 : defaultLimit;
        newData = await fetchBinanceKlines(binanceSymbol, interval, limit);
      } else {
        // In historical mode, use CoinGecko
        const { days } = PERIOD_CONFIG[selectedPeriod];
        newData = await coingeckoFetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
          vs_currency: "usd",
          days,
        });
      }

      // only apply response if this request is the latest
      if (reqId === requestIdRef.current) {
        startTransition(() => {
          setOhlcData(newData ?? []);
        });
      }
    } catch (error) {
      console.error("Error fetching OHLC data:", error);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;

    setPeriod(newPeriod);

    // Notify parent of the new kline interval so the WebSocket can reconnect
    if (onKlineIntervalChange) {
      onKlineIntervalChange(PERIOD_TO_KLINE_INTERVAL[newPeriod].interval);
    }

    // Reset flag so update() is blocked until new data loads
    binanceDataLoadedRef.current = false;
    fetchOHLCData(newPeriod);
  };

  const handleIntervalChange = (newInterval: BinanceKlineInterval) => {
    if (onKlineIntervalChange) {
      onKlineIntervalChange(newInterval);
    }
    // Re-fetch historical data with the new interval
    binanceDataLoadedRef.current = false;
    fetchOHLCData(period, newInterval);
  };

  // Notify parent of initial kline interval and fetch initial Binance data on mount
  useEffect(() => {
    if (onKlineIntervalChange) {
      onKlineIntervalChange(PERIOD_TO_KLINE_INTERVAL[initialPeriod ?? 'daily'].interval);
    }
    // Fetch initial data in live mode (will use Binance or CoinGecko based on binanceSymbol support)
    if (mode === 'live') {
      fetchOHLCData(initialPeriod ?? 'daily');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = mode === 'live' || ["daily", "weekly", "monthly"].includes(period);

    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });
    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    // Binance data is already in seconds; CoinGecko data is in milliseconds
    // Graceful fallback for dynamic data souring: determine if ms or s based on size
    const convertedToSeconds = normalizeOhlcTimestamps(ohlcDataRef.current);

    series.setData(convertOHLCData(convertedToSeconds));
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    observer.observe(container);

    return () => {
      observer.unobserve(container);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  useEffect(() => {
    const showTime = mode === 'live' || ["daily", "weekly", "monthly"].includes(period);
    chartRef.current?.applyOptions({
      timeScale: { timeVisible: showTime, secondsVisible: false },
    });
  }, [period, mode]);

  // Effect for historical data changes — full chart rebuild
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    // Binance data is already in seconds; CoinGecko data is in milliseconds
    // Graceful fallback for dynamic data souring: determine if ms or s based on size
    const convertedToSeconds = normalizeOhlcTimestamps(ohlcData);

    const converted = convertOHLCData(convertedToSeconds);
    candleSeriesRef.current.setData(converted);

    // Mark data as loaded AFTER it's actually applied to the chart
    if (mode === 'live' && ohlcData.length > 0) {
      binanceDataLoadedRef.current = true;
    }

    const dataChanged = prevOhlcDataLengthRef.current !== ohlcData.length;

    if (dataChanged || mode === "historical") {
      chartRef.current?.timeScale().fitContent();
      prevOhlcDataLengthRef.current = ohlcData.length;
    }

  }, [ohlcData, mode]);

  // Effect for live candle updates — incremental update (no flicker)
  useEffect(() => {
    if (!candleSeriesRef.current || !liveOhlcv) return;

    // Only apply live updates after Binance historical data has loaded,
    // otherwise timestamps from CoinGecko data won't align with Binance candles
    if (!binanceDataLoadedRef.current) return;

    // Use series.update() for real-time candle updates instead of setData()
    // update() will replace the bar if the timestamp matches the last bar,
    // or append a new bar if the timestamp is newer.
    // During period/interval transitions, the live candle may briefly have a timestamp
    // older than the last historical bar — safely ignore until new data loads.
    try {
      candleSeriesRef.current.update({
        time: liveOhlcv[0] as import("lightweight-charts").Time,
        open: liveOhlcv[1],
        high: liveOhlcv[2],
        low: liveOhlcv[3],
        close: liveOhlcv[4],
      });
    } catch {
      // Ignore — transient mismatch resolves once new historical data loads
    }

  }, [liveOhlcv]);

  return (
    <div id="candlestick-chart">
      <div className="chart-header">
        <div className="flex-1">{children}</div>

        <div className="button-group">
          <span className="text-sm mx-2 font-medium text-purple-100/50">Period:</span>
          {PERIOD_BUTTONS.map(({ label, value }) => (
            <button
              key={value}
              className={period === value ? "config-button-active" : "config-button"}
              onClick={() => handlePeriodChange(value)}
              disabled={isPending}
            >
              {label}
            </button>
          ))}
        </div>

        {klineInterval && (
          <div className="button-group">
            <span className="text-sm mx-2 font-medium text-purple-100/50">Interval:</span>
            {KLINE_INTERVAL_BUTTONS.map(({ label, value }) => (
              <button
                key={value}
                className={klineInterval === value ? "config-button-active" : "config-button"}
                onClick={() => handleIntervalChange(value)}
                disabled={isPending}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div ref={chartContainerRef} className="chart" style={{ height }} />
    </div>
  )
}

export default CandlestickChart