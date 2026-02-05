import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value?: number | null,
  currency = "USD",
  locale = "en-US",
  minimumFractionDigits?: number
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";

  // For crypto prices: 4 decimals if price < 1, 1 decimal if price >= 10000, otherwise 2 decimals
  const absValue = Math.abs(value);
  const decimals = minimumFractionDigits ?? (absValue < 1 ? 4 : absValue >= 10000 ? 1 : 2);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
