import { cn } from "@/lib/utils";

type LoadingIndicatorProps = {
  label?: string;
  className?: string;
  size?: "md" | "lg";
  showProgressBar?: boolean;
};

const SPINNER_CONFIG: Record<
  NonNullable<LoadingIndicatorProps["size"]>,
  { container: string; ring: string; inner: string }
> = {
  md: {
    container: "h-14 w-14",
    ring: "h-14 w-14 border-4",
    inner: "h-6 w-6",
  },
  lg: {
    container: "h-20 w-20",
    ring: "h-20 w-20 border-[6px]",
    inner: "h-8 w-8",
  },
};

/**
 * Visueller Indikator, während die Wörterliste aus KV geladen wird
 * oder eine große Liste im Browser initialisiert wird.
 */
export function LoadingIndicator({
  label = "Lädt…",
  className,
  size = "md",
  showProgressBar = false,
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn("relative flex items-center justify-center", SPINNER_CONFIG[size].container)}>
        <div className="absolute inset-0 rounded-full bg-primary-green/10 shadow-inner" />
        <div
          className={cn(
            "absolute inset-0 rounded-full border-transparent animate-spin",
            SPINNER_CONFIG[size].ring,
            "border-t-primary-green border-r-primary-green/40 border-b-primary-green/25 border-l-primary-green/60",
          )}
        />
        <div
          className={cn(
            "absolute rounded-full bg-white dark:bg-slate-900 shadow-inner",
            SPINNER_CONFIG[size].inner,
          )}
        />
      </div>
      {showProgressBar ? (
        <div className="relative h-1.5 w-48 overflow-hidden rounded-full bg-border/60">
          <div className="loading-bar-animation absolute inset-y-0 left-0 w-1/2 rounded-full bg-primary/80" />
        </div>
      ) : null}
      <span className="text-center">{label}</span>
    </div>
  );
}
