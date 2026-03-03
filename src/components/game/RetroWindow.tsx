
import { cn } from "@/lib/utils";

interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export function RetroWindow({ title, children, className, footer, noPadding = false }: RetroWindowProps) {
  return (
    <div className={cn("flex flex-col h-full border border-primary/30 bg-card/40 backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(64,121,176,0.2)]", className)}>
      <div className="bg-primary/90 px-3 py-1 flex justify-between items-center shrink-0">
        <span className="text-primary-foreground font-bold tracking-tight uppercase text-[10px]">{title}</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 border border-primary-foreground/50 bg-transparent"></div>
        </div>
      </div>
      <div className={cn("flex-1 overflow-auto scrollbar-thin", noPadding ? "" : "p-3")}>
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
