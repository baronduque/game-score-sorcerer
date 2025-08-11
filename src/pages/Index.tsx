import Spotlight from "@/components/Spotlight";
import { Button } from "@/components/ui/button";
import { ForecastForm } from "@/components/forecaster/ForecastForm";
import { ModelUpload } from "@/components/forecaster/ModelUpload";
import { useModel } from "@/hooks/use-model";
import { Card, CardContent } from "@/components/ui/card";
import { SoccerForecaster } from "@/components/forecaster/SoccerForecaster";

const Index = () => {
  const { model, saveModel, resetModel, features } = useModel();

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I use my own model?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Export your coefficients as JSON (intercept and weights) and upload them using the Model card.",
        },
      },
      {
        "@type": "Question",
        name: "Which sports are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Any sport that fits a binary outcome model (home vs away). You control feature definitions in your uploaded model.",
        },
      },
    ],
  } as const;

  return (
    <div className="min-h-screen">
      <header>
        <Spotlight className="bg-background">
          <div className="container mx-auto px-6 pt-20 pb-14 text-center relative">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Sports Result Forecaster
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Upload your statistical model and generate instant win probabilities and fair odds for upcoming games.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a href="#forecast">
                <Button variant="hero" size="lg">Start forecasting</Button>
              </a>
              <a href="#model">
                <Button variant="outline" size="lg">Upload model</Button>
              </a>
            </div>
          </div>
        </Spotlight>
      </header>

      <main className="container mx-auto px-6 pb-24 space-y-10">
        <section id="forecast" className="scroll-mt-24">
          <ForecastForm model={model} features={features} />
        </section>

        <section id="model" className="scroll-mt-24">
          <ModelUpload current={model} onSave={saveModel} onReset={resetModel} />
        </section>

        <section id="soccer" className="scroll-mt-24">
          <Card className="elevate">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-2">Soccer forecaster (3-way)</h2>
              <p className="text-muted-foreground mb-4">Use o modelo V5 H2H para probabilidades de Casa/Empate/Fora.</p>
              <SoccerForecaster />
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="how-it-works">
          <Card className="elevate">
            <CardContent className="p-6">
              <h2 id="how-it-works" className="text-2xl font-semibold mb-2">How it works</h2>
              <ol className="list-decimal ml-5 space-y-2 text-muted-foreground">
                <li>Prepare your model as a logistic regression: one intercept and numeric weights per feature key.</li>
                <li>Upload the JSON and adjust inputs using the controls.</li>
                <li>Compare model fair odds against market to find value.</li>
              </ol>
            </CardContent>
          </Card>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </div>
  );
};

export default Index;
