import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines and merges CSS class name inputs into a single normalized string.
 *
 * @param inputs - One or more clsx-compatible class values (strings, arrays, objects) to combine
 * @returns The resulting class string with Tailwind class conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number | null | undefined,
  digits?: number,
  currency?: string,
  showSymbol?: boolean,
) {
  if (value === null || value === undefined || isNaN(value)) {
    return showSymbol !== false ? '$0.00' : '0.00';
  }

  if (showSymbol === undefined || showSymbol === true) {
    const currencyCode = currency?.toUpperCase() || 'USD';

    // feature-detect narrowSymbol support for USD formatting
    let currencyDisplay: 'narrowSymbol' | 'symbol' = 'symbol';
    if (currencyCode === 'USD') {
      try {
        // Some environments (older Safari) throw when using 'narrowSymbol'
        (0).toLocaleString(undefined, {
          style: 'currency',
          currency: 'USD',
          currencyDisplay: 'narrowSymbol',
        });
        currencyDisplay = 'narrowSymbol';
      } catch {
        currencyDisplay = 'symbol';
      }
    }

    const formatted = value.toLocaleString(undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: digits ?? 2,
      maximumFractionDigits: digits ?? 2,
      currencyDisplay: currencyDisplay,
    });

    // Robust normalization for USD: handle variants like 'US$', 'USD ' and locale spacing
    if (currencyCode === 'USD') {
      const normalized = formatted.replace(/\u00A0/g, ' ')
        .replace(/US\$|USD\s*/g, '$')
        .replace(/\$+/g, '$')
        .replace(/\s+/g, ' ')
        .trim();

      return normalized;
    }

    return formatted;
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits ?? 2,
    maximumFractionDigits: digits ?? 2,
  });
}

export function formatPercentage(change: number | null | undefined, decimalPlaces?: number): string {
  const clamped = (() => {
    const DEFAULT = 1;
    if (decimalPlaces === undefined || decimalPlaces === null) return DEFAULT;
    const intVal = Math.trunc(Number(decimalPlaces));
    if (!Number.isFinite(intVal)) return DEFAULT;
    return Math.min(100, Math.max(0, intVal));
  })();

  if (change === null || change === undefined || isNaN(change)) {
    return "-%";
  }

  const formattedChange = change.toFixed(clamped);
  return `${formattedChange}%`;
}


export function trendingClasses(value: number) {
  const isTrendingUp = value > 0;

  return {
    textClass: isTrendingUp ? 'text-green-400' : 'text-red-400',
    bgClass: isTrendingUp ? 'bg-green-500/10' : 'bg-red-500/10',
    iconClass: isTrendingUp ? 'icon-up' : 'icon-down',
  };
}

/**
 * Produces a human-readable relative time string for a given date.
 *
 * @param date - A Date object, a numeric timestamp (milliseconds), or a date string parseable by Date.
 * @returns A string describing the time difference:
 * - `'invalid date'` if the input cannot be parsed,
 * - `'just now'` for <60 seconds,
 * - `'<n> min'` for minutes,
 * - `'<n> hour'` or `'<n> hours'` for hours,
 * - `'<n> day'` or `'<n> days'` for days,
 * - `'<n> week'` or `'<n> weeks'` for weeks (<4 weeks),
 * - otherwise the date in `YYYY-MM-DD` format.
 */
export function timeAgo(date: string | number | Date): string {
  const now = new Date();
  const past = new Date(date);
  if (Number.isNaN(past.getTime())) return 'invalid date';
  const diff = Math.max(0, now.getTime() - past.getTime()); // difference in ms

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''}`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''}`;

  // Format date as YYYY-MM-DD
  return past.toISOString().split('T')[0];
}

/**
 * Normalize a numeric timestamp to seconds for use with lightweight-charts.
 *
 * @param ts - A timestamp provided in either seconds or milliseconds.
 * @returns The timestamp expressed in seconds (floored when input was milliseconds). 
 */
export function toSeconds(ts: number): import('lightweight-charts').Time {
  return (ts > 1e11 ? Math.floor(ts / 1000) : ts) as import('lightweight-charts').Time;
}

/**
 * Converts an array of OHLC tuples into time-series objects suitable for lightweight-charts.
 *
 * @param data - Array of OHLC tuples in the form `[timestamp, open, high, low, close]`. `timestamp` may be in milliseconds or seconds.
 * @returns An array of objects `{ time, open, high, low, close }` where `time` is converted to seconds for lightweight-charts. Consecutive entries with the same `time` are deduplicated, keeping the first occurrence.
 */
export function convertOHLCData(data: OHLCData[]) {
  return data
    .map((d) => ({
      time: toSeconds(d[0] as number), // ensure seconds, not ms
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4],
    }))
    .filter((item, index, arr) => index === 0 || item.time !== arr[index - 1].time);
}

export const ELLIPSIS = 'ellipsis' as const;
export const buildPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | typeof ELLIPSIS)[] => {
  const MAX_VISIBLE_PAGES = 5;

  const pages: (number | typeof ELLIPSIS)[] = [];
  if (totalPages <= 0) return pages;
  const safeCurrent = Math.min(Math.max(currentPage, 1), totalPages);

  if (totalPages <= MAX_VISIBLE_PAGES) {
    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);

  const start = Math.max(2, safeCurrent - 1);
  const end = Math.min(totalPages - 1, safeCurrent + 1);

  if (start > 2) {
    pages.push(ELLIPSIS);
  }

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (end < totalPages - 1) {
    pages.push(ELLIPSIS);
  }

  pages.push(totalPages);

  return pages;
};