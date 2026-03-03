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

/** Resolve transfer message content from team names (for news/headlines). */
export function getMessageDisplayContent(
  m: { content: string; buyerId?: string; sellerId?: string; playerName?: string; transferValue?: number; fromTeamId?: string },
  getTeamName: (id: string) => string
): string {
  if (m.buyerId != null && m.sellerId != null && m.playerName != null && m.transferValue != null) {
    return `${getTeamName(m.buyerId)} have completed the signing of ${m.playerName} from ${getTeamName(m.sellerId)} for a fee of ${formatMoney(m.transferValue)}.`;
  }
  if (m.fromTeamId != null && m.playerName != null && m.transferValue != null) {
    return `${getTeamName(m.fromTeamId)} have submitted an official bid of ${formatMoney(m.transferValue)} for ${m.playerName}.`;
  }
  return m.content;
}
