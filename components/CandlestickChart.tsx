"use client";

import { getCandlestickConfig, getChartConfig, PERIOD_BUTTONS, PERIOD_CONFIG } from "@/constants";
import { coingeckoFetcher } from "@/lib/coingecko.actions";
import { convertOHLCData } from "@/lib/utils";
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { useEffect, useRef, useState, useTransition } from "react";

const CandlestickChart = ({
  children,
  data,
  coinId,
  height = 360,
  initialPeriod = "daily"
}: CandlestickChartProps) => {

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
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
        setOhlcData(newData ?? []);
      }
    } catch (error) {
      console.error("Error fetching OHLC data:", error);
    } 
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;
    // Don't await inside startTransition — initiate the low-priority state update
    startTransition(() => {
      setPeriod(newPeriod);
      void fetchOHLCData(newPeriod);
    });
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
    const convertedToSecondsInit = ohlcData.map(
      (item) => [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData
    );
    series.setData(convertOHLCData(convertedToSecondsInit));
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

  }, [height, ohlcData, period]);

  // useEffect(() => {
  //   const showTime = ["daily", "weekly", "monthly"].includes(period);
  //   chartRef.current?.applyOptions({
  //     timeScale: { timeVisible: showTime, secondsVisible: false },
  //   });
  // }, [period]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const convertedToSeconds = ohlcData.map(
      (item) => [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData
    );
    
    const converted = convertOHLCData(convertedToSeconds);
    candleSeriesRef.current.setData(converted);
    chartRef.current?.timeScale().fitContent();
  }, [ohlcData, period]);

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
      </div>
      <div ref={chartContainerRef} className="chart" style={{ height }} />
    </div>
  )
}

export default CandlestickChart