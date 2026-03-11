"use client";

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Shared overlay template for pre-match lineups, half-time, and full-time screens. */
export interface MatchOverlayTemplateProps {
  /** Overlay title (e.g. "Official Match Lineups", "HALF TIME", "FULL TIME"). */
  title: string;
  /** Optional subtitle below title (e.g. "LEAGUE • Stadium"). */
  subtitle?: string;
  /** Main content (lineups grid, or score + ratings, etc.). */
  children: ReactNode;
  /** Primary action button. */
  primaryButton: { label: string; onClick: () => void };
  /** Optional secondary button (e.g. Tactical Review). When set, uses half/full-time layout (mobile top row, desktop bottom row). */
  secondaryButton?: { label: string; onClick: () => void };
  /** Tailwind z-index class (e.g. z-[500], z-[600]). */
  zIndex?: string;
  /** Extra class for the overlay container. */
  className?: string;
}

export function MatchOverlayTemplate({
  title,
  subtitle,
  children,
  primaryButton,
  secondaryButton,
  zIndex = 'z-[500]',
  className,
}: MatchOverlayTemplateProps) {
  const hasSecondary = !!secondaryButton;

  return (
    <div
      className={cn(
        'absolute inset-0 bg-background/95 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in duration-300',
        hasSecondary ? 'p-2 max-md:p-2 sm:p-4' : 'overflow-y-auto p-4 sm:p-6',
        zIndex,
        className
      )}
    >


      <div
        className={cn(
          'w-full flex-1 min-h-0 flex flex-col',
          hasSecondary ? 'max-w-5xl mx-auto justify-center text-center gap-1 sm:gap-2 max-md:gap-1 relative overflow-hidden pt-0.5' : 'max-w-4xl mx-auto justify-center min-h-0 py-6 space-y-6'
        )}
      >
        <div className={cn('shrink-0', hasSecondary ? 'max-md:space-y-0 space-y-0.5' : 'text-center space-y-2 max-[1300px]:space-y-4')}>
          <h2
            className={cn(
              'text-primary font-black uppercase tracking-[0.4em]',
              hasSecondary ? 'text-sm sm:text-base md:text-lg max-[1300px]:text-[24px]' : 'text-xl max-[1300px]:text-3xl'
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-white/90 uppercase font-black text-[12px] max-[1300px]:text-[18px]">{subtitle}</p>
          )}
        </div>

        <div className={cn(hasSecondary ? 'flex-1 min-h-0 overflow-auto py-1 sm:py-2' : 'shrink-0')}>
          {children}
        </div>

        {!hasSecondary && (
          <div className="flex justify-center pt-4 pb-4 shrink-0">
            <Button
              onClick={primaryButton.onClick}
              className="h-14 sm:h-16 px-12 sm:px-20 bg-accent text-accent-foreground font-black uppercase text-xl sm:text-2xl shadow-[8px_8px_0_0_rgba(38,217,117,0.3)] hover:scale-[1.05] transition-transform"
            >
              {primaryButton.label}
            </Button>
          </div>
        )}

        {hasSecondary && (
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 max-[1300px]:gap-6 w-full shrink-0 mt-2 sm:mt-0 px-2 sm:px-0 pb-2 sm:pb-0">
            <Button
              onClick={secondaryButton!.onClick}
              variant="outline"
              className="h-10 sm:h-14 max-[1300px]:h-20 w-full sm:w-auto font-black uppercase text-sm sm:text-lg max-[1300px]:text-[24px] border-primary/40 hover:bg-primary/10"
            >
              {secondaryButton!.label}
            </Button>
            <Button
              onClick={primaryButton.onClick}
              className="h-10 sm:h-14 max-[1300px]:h-20 w-full sm:w-auto font-black uppercase text-sm sm:text-lg max-[1300px]:text-[24px] bg-primary text-primary-foreground shadow-xl hover:scale-[1.02] transition-transform"
            >
              {primaryButton.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
