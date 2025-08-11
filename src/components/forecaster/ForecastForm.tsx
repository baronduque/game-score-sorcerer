import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ProbabilityBar } from "./ProbabilityBar";
import type { FeatureDef, LogisticModel } from "@/hooks/use-model";
import { predictProbability } from "@/hooks/use-model";

function toDecimalOdds(p: number) {
  return p > 0 ? (1 / p) : Infinity;
}

export function ForecastForm({
  model,
  features,
}: {
  model: LogisticModel;
  features: FeatureDef[];
}) {
  const initial = useMemo(() => {
    const obj: Record<string, number | boolean> = {};
    for (const f of features) obj[f.key] = f.type === "boolean" ? false : 0;
    return obj;
  }, [features]);

  const [inputs, setInputs] = useState<Record<string, number | boolean>>(initial);
  const prob = predictProbability(model, inputs);
  const awayProb = 1 - prob;

  const [marketHome, setMarketHome] = useState<string>("");

  const implied = (() => {
    const v = parseFloat(marketHome);
    if (!v || v <= 1) return null;
    return 1 / v;
  })();

  const edge = implied ? (prob - implied) : null;

  return (
    <Card className="elevate">
      <CardHeader>
        <CardTitle>Forecast</CardTitle>
        <CardDescription>Adjust pregame inputs and get instant probabilities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.type === "boolean" ? (
                <div className="flex items-center gap-3">
                  <Switch id={f.key} checked={Boolean(inputs[f.key])} onCheckedChange={(v) => setInputs((s) => ({ ...s, [f.key]: v }))} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Slider
                    id={f.key}
                    value={[Number(inputs[f.key] ?? 0)]}
                    min={f.min ?? 0}
                    max={f.max ?? 100}
                    step={f.step ?? 1}
                    onValueChange={([v]) => setInputs((s) => ({ ...s, [f.key]: v }))}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={Number(inputs[f.key] ?? 0)}
                      onChange={(e) => setInputs((s) => ({ ...s, [f.key]: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <ProbabilityBar value={prob} leftLabel="Home" rightLabel="Away" />

        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-md bg-secondary">
            <div className="text-muted-foreground">Home win</div>
            <div className="text-2xl font-semibold">{(prob * 100).toFixed(1)}%</div>
            <div className="text-muted-foreground">Fair odds: {toDecimalOdds(prob).toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-md bg-secondary">
            <div className="text-muted-foreground">Away win</div>
            <div className="text-2xl font-semibold">{(awayProb * 100).toFixed(1)}%</div>
            <div className="text-muted-foreground">Fair odds: {toDecimalOdds(awayProb).toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-md bg-secondary">
            <div className="text-muted-foreground">Compare market</div>
            <div className="flex items-center gap-2 mt-2">
              <Input placeholder="Market odds (home) e.g. 1.80" value={marketHome} onChange={(e) => setMarketHome(e.target.value)} />
            </div>
            <div className="text-muted-foreground mt-2">
              {implied ? (
                <>
                  Implied p: {(implied * 100).toFixed(1)}% · Edge: {edge! >= 0 ? "+" : ""}{(edge! * 100).toFixed(1)}%
                </>
              ) : (
                <>Enter decimal odds to see edge</>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="hero">Run forecast</Button>
          <Button variant="outline" onClick={() => setInputs(initial)}>Reset inputs</Button>
        </div>
      </CardContent>
    </Card>
  );
}
