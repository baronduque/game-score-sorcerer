import { FC } from "react";
import { cn } from "@/lib/utils";

export const ProbabilityBar: FC<{
  value: number; // 0..1
  leftLabel?: string;
  rightLabel?: string;
}> = ({ value, leftLabel = "Home", rightLabel = "Away" }) => {
  const pct = Math.max(0, Math.min(1, value));

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className={cn("h-3 w-full rounded-full bg-muted overflow-hidden elevate")}
           aria-label="win probability bar"
           role="meter"
           aria-valuemin={0}
           aria-valuemax={100}
           aria-valuenow={Math.round(pct * 100)}>
        <div
          className="h-full bg-gradient-to-r from-secondary to-primary"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <div className="text-sm font-medium text-center">
        {Math.round(pct * 100)}% win probability
      </div>
    </div>
  );
};
