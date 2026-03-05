
import { cn } from "@/lib/utils";

interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  noPadding?: boolean;
  titleClassName?: string;
  /** Override inner content padding (e.g. "p-3 max-md:px-1 max-md:py-1.5") */
  contentClassName?: string;
  /** Hide the blue title bar (e.g. for pitch to sit higher) */
  hideTitle?: boolean;
}

export function RetroWindow({ title, children, className, footer, noPadding = false, titleClassName, contentClassName, hideTitle = false }: RetroWindowProps) {
  return (
    <div className={cn("flex flex-col h-full border border-primary/30 bg-card/40 backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(64,121,176,0.2)]", className)}>
      {!hideTitle && (
      <div className="bg-primary/90 px-3 py-1 flex justify-between items-center shrink-0 max-lg:hidden">
        <span className={cn("text-primary-foreground font-bold tracking-tight uppercase text-[10px]", titleClassName)}>{title}</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 border border-primary-foreground/50 bg-transparent"></div>
        </div>
      </div>
      )}
      <div className={cn("flex-1 overflow-auto scrollbar-thin", noPadding ? "" : (contentClassName ?? "p-3 max-md:p-2"))}>
        {children}
      </div>
      {footer && (
        <div className="bg-muted/50 px-3 py-2 border-t border-border/50 flex justify-end">
          {footer}
        </div>
      )}
    </div>
  );
}
