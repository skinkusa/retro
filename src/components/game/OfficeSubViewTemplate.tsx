"use client"

import { cn } from "@/lib/utils";

interface OfficeSubViewTemplateProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Shared wrapper for Office sub-screens: Manager Profile, Financial Hub,
 * Staff Management, Legacy & Records, OS Config. Full-size retro system window.
 */
export function OfficeSubViewTemplate({
  title,
  children,
  className,
  contentClassName,
}: OfficeSubViewTemplateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-primary/30 bg-black/40 shadow-2xl overflow-hidden backdrop-blur-sm min-h-[520px] flex flex-col",
        className
      )}
    >
      <div className="bg-primary/90 px-5 py-4 md:px-6 md:py-4 border-b border-primary/50 shrink-0 flex items-center">
        <h2 className="text-[22px] md:text-[26px] lg:text-[28px] font-black text-primary-foreground uppercase tracking-[0.2em]">
          {title}
        </h2>
      </div>
      <div
        className={cn(
          "flex-1 p-5 md:p-6 lg:p-7 space-y-5 md:space-y-6 overflow-auto",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
