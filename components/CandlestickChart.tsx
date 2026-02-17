"use client";

import { getCandlestickConfig, getChartConfig, LIVE_INTERVAL_BUTTONS, PERIOD_BUTTONS, PERIOD_CONFIG } from "@/constants";
import { coingeckoFetcher } from "@/lib/coingecko.actions";
import { convertOHLCData } from "@/lib/utils";
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { useEffect, useRef, useState, useTransition } from "react";

const CandlestickChart = ({
  children,
  data,
  coinId,
  height = 360,
  initialPeriod = "daily",
  liveOhlcv = null,
  mode = "historical",
  liveInterval,
  setLiveInterval,
}: CandlestickChartProps) => {

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const prevOhlcDataLengthRef = useRef<number>(data?.length || 0);
  const requestIdRef = useRef<number>(0);

  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [isPending, startTransition] = useTransition();

  const fetchOHLCData = async (selectedPeriod: Period) => {
    // increment request id to invalidate previous requests
    const reqId = ++requestIdRef.current;
    try {
      const { days } = PERIOD_CONFIG[selectedPeriod];
      const newData = await coingeckoFetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
        vs_currency: "usd",
        days,
      });
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
    fetchOHLCData(newPeriod);
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ["daily", "weekly", "monthly"].includes(period);

    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });
    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    // Ensure timestamps are converted to seconds before passing to the chart
    const convertedToSeconds = ohlcData.map(
      (item) => [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData
    );

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
    const showTime = ["daily", "weekly", "monthly"].includes(period);
    chartRef.current?.applyOptions({
      timeScale: { timeVisible: showTime, secondsVisible: false },
    });
  }, [period]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const convertedToSeconds = ohlcData.map(
      (item) => [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData
    );

    let merged: OHLCData[];

    if (liveOhlcv) {
      const liveTimeStamp = liveOhlcv[0];
      const lastHistoricalCandle = convertedToSeconds[convertedToSeconds.length - 1];

      if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimeStamp) {
        merged = [...convertedToSeconds.slice(0, -1), liveOhlcv]
      } else {
        merged = [...convertedToSeconds, liveOhlcv]
      }
    } else {
      merged = convertedToSeconds
    }

    merged.sort((a, b) => a[0] - b[0]);

    const converted = convertOHLCData(merged);
    candleSeriesRef.current.setData(converted);

    const dataChanged = prevOhlcDataLengthRef.current !== ohlcData.length;

    if (dataChanged || mode === "historical") {
      chartRef.current?.timeScale().fitContent();
      prevOhlcDataLengthRef.current = ohlcData.length;
    }

  }, [ohlcData, period, liveOhlcv, mode]);

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

        {liveInterval && (
          <div className="button-group">
            <span className="text-sm mx-2 font-medium text-purple-100/50">Interval:</span>
            {LIVE_INTERVAL_BUTTONS.map(({ label, value }) => (
              <button
                key={value}
                className={liveInterval === value ? "config-button-active" : "config-button"}
                onClick={() => setLiveInterval && setLiveInterval(value)}
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