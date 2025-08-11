import { FC } from "react";
import { cn } from "@/lib/utils";

export const TriProbabilityBar: FC<{
  values: { home: number; draw: number; away: number }; // percentages 0..100
  labels?: { home?: string; draw?: string; away?: string };
}> = ({ values, labels }) => {
  const h = Math.max(0, Math.min(100, values.home ?? 0));
  const d = Math.max(0, Math.min(100, values.draw ?? 0));
  const a = Math.max(0, Math.min(100, values.away ?? 0));
  const total = h + d + a || 1;
  const wh = (h / total) * 100;
  const wd = (d / total) * 100;
  const wa = (a / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{labels?.home ?? "Home"}</span>
        <span>{labels?.draw ?? "Draw"}</span>
        <span>{labels?.away ?? "Away"}</span>
      </div>
      <div
        className={cn(
          "h-3 w-full rounded-full bg-muted overflow-hidden elevate",
        )}
        aria-label="three-way probability bar"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((h / total) * 100)}
      >
        <div className="h-full bg-primary" style={{ width: `${wh}%` }} />
        <div className="h-full bg-accent" style={{ width: `${wd}%` }} />
        <div className="h-full bg-secondary" style={{ width: `${wa}%` }} />
      </div>
      <div className="grid grid-cols-3 text-center text-sm font-medium">
        <div>{h.toFixed(0)}%</div>
        <div>{d.toFixed(0)}%</div>
        <div>{a.toFixed(0)}%</div>
      </div>
    </div>
  );
};
