import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats currency values in a retro-friendly style (e.g., 1.25M or 750K)
 */
export function formatMoney(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return `£${(amount / 1000000).toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `£${(amount / 1000).toFixed(0)}K`;
  }
  return `£${amount}`;
}
