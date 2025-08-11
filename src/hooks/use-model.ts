import { useEffect, useMemo, useState } from "react";

export type LogisticModel = {
  intercept: number;
  weights: Record<string, number>;
  metadata?: {
    name?: string;
    sport?: string;
    version?: string;
  };
};

export type FeatureDef = {
  key: string;
  label: string;
  type: "number" | "boolean";
  min?: number;
  max?: number;
  step?: number;
};

const DEMO_MODEL: LogisticModel = {
  intercept: -0.15,
  weights: {
    rating_diff: 0.025,
    form_diff: 0.12,
    home: 0.35,
    rest_diff: 0.03,
  },
  metadata: { name: "Demo Elo + Form Model", sport: "Generic", version: "1.0" },
};

const DEFAULT_FEATURES: FeatureDef[] = [
  { key: "rating_diff", label: "Rating difference (home - away)", type: "number", min: -100, max: 100, step: 1 },
  { key: "form_diff", label: "Form last 5 games (home - away)", type: "number", min: -10, max: 10, step: 1 },
  { key: "home", label: "Home advantage", type: "boolean" },
  { key: "rest_diff", label: "Rest days difference (home - away)", type: "number", min: -5, max: 5, step: 1 },
];

const STORAGE_KEY = "forecaster.custom.model";

export function useModel() {
  const [model, setModel] = useState<LogisticModel | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setModel(JSON.parse(raw));
      else setModel(DEMO_MODEL);
    } catch (e) {
      console.error("Failed to load model from storage", e);
      setModel(DEMO_MODEL);
    }
  }, []);

  const saveModel = (m: LogisticModel) => {
    setModel(m);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  };

  const resetModel = () => {
    saveModel(DEMO_MODEL);
  };

  const features = useMemo(() => DEFAULT_FEATURES, []);

  return { model: model ?? DEMO_MODEL, saveModel, resetModel, features };
}

export function logistic(z: number) {
  return 1 / (1 + Math.exp(-z));
}

export function predictProbability(model: LogisticModel, inputs: Record<string, number | boolean>) {
  let z = model.intercept;
  for (const [k, w] of Object.entries(model.weights)) {
    const v = inputs[k];
    if (typeof v === "boolean") z += (v ? 1 : 0) * w;
    else if (typeof v === "number") z += v * w;
  }
  return logistic(z);
}
