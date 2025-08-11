import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { LogisticModel } from "@/hooks/use-model";

function isValidModel(data: any): data is LogisticModel {
  return (
    data && typeof data === "object" &&
    typeof data.intercept === "number" &&
    data.weights && typeof data.weights === "object" &&
    Object.values(data.weights).every((v) => typeof v === "number")
  );
}

export function ModelUpload({
  current,
  onSave,
  onReset,
}: {
  current: LogisticModel;
  onSave: (m: LogisticModel) => void;
  onReset: () => void;
}) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!isValidModel(data)) throw new Error("Invalid model schema");
      onSave(data);
      setError(null);
      toast({ title: "Model loaded", description: `Loaded ${data.metadata?.name ?? "custom model"}` });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to parse model JSON");
      toast({ title: "Upload error", description: "Please provide a valid model JSON.", variant: "destructive" as any });
    }
  };

  return (
    <Card className="elevate">
      <CardHeader>
        <CardTitle>Model</CardTitle>
        <CardDescription>Upload your coefficients (JSON) or keep using the demo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="application/json"
            aria-label="Upload model JSON"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onReset}>Reset to demo model</Button>
          <a
            className="text-sm text-muted-foreground underline underline-offset-4"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const example = {
                intercept: 0.0,
                weights: { rating_diff: 0.02, form_diff: 0.1, home: 0.3, rest_diff: 0.02 },
                metadata: { name: "Example Model", sport: "Generic" },
              } satisfies LogisticModel;
              const blob = new Blob([JSON.stringify(example, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "model.example.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download example JSON
          </a>
        </div>
        <div className="text-sm text-muted-foreground">
          <div>Active: <span className="font-medium text-foreground">{current.metadata?.name ?? "Demo model"}</span></div>
          {current.metadata?.sport && <div>Sport: {current.metadata.sport}</div>}
          {current.metadata?.version && <div>Version: {current.metadata.version}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
