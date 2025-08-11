import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TriProbabilityBar } from "./TriProbabilityBar";
import type { MatchInput } from "@/lib/soccerModel";
import { predictRoundV5H2H } from "@/lib/soccerModel";
import { Button } from "@/components/ui/button";

function parseNum(v: string): number | undefined {
  return v === "" ? undefined : Number(v);
}

export function SoccerForecaster() {
  const [match, setMatch] = useState<MatchInput>({
    homeTeam: "Home",
    awayTeam: "Away",
    home: {
      last5: {
        wins: 3,
        draws: 1,
        losses: 1,
        xgFor: 1.5,
        xgAgainst: 1.0,
        sotFor: 5,
        sotAgainst: 3,
        goalsFor: 1.4,
        goalsAgainst: 1.0,
      },
      redCardsPerMatch: 0,
      goalieOut: false,
      keyScorerOut: false,
    },
    away: {
      last5: {
        wins: 2,
        draws: 2,
        losses: 1,
        xgFor: 1.2,
        xgAgainst: 1.1,
        sotFor: 4,
        sotAgainst: 4,
        goalsFor: 1.1,
        goalsAgainst: 1.0,
        awayWins: 1,
        awayWinsStreak: 1,
      },
      redCardsPerMatch: 0,
      goalieOut: false,
      keyScorerOut: false,
    },
    h2hLast5: { homeWins: 2, draws: 1, awayWins: 2, awayWinsAway: 1 },
  });

  const output = useMemo(() => predictRoundV5H2H([match])[0], [match]);

  const reset = () => {
    setMatch({
      homeTeam: "Home",
      awayTeam: "Away",
      home: { last5: { wins: 3, draws: 1, losses: 1 }, redCardsPerMatch: 0 },
      away: { last5: { wins: 2, draws: 2, losses: 1, awayWins: 0, awayWinsStreak: 0 }, redCardsPerMatch: 0 },
      h2hLast5: { homeWins: 0, draws: 0, awayWins: 0, awayWinsAway: 0 },
    });
  };

  return (
    <Card className="elevate">
      <CardHeader>
        <CardTitle>Soccer forecaster (V5 H2H)</CardTitle>
        <CardDescription>Preencha forma recente, xG/SOT, disciplina e H2H. Probabilidades em tempo real para Casa/Empate/Fora.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="homeTeam">Home team</Label>
            <Input id="homeTeam" value={match.homeTeam} onChange={(e) => setMatch((m) => ({ ...m, homeTeam: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="awayTeam">Away team</Label>
            <Input id="awayTeam" value={match.awayTeam} onChange={(e) => setMatch((m) => ({ ...m, awayTeam: e.target.value }))} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Home side */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Home: {match.homeTeam}</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Wins</Label>
                <Input type="number" value={match.home.last5.wins}
                  onChange={(e) => setMatch((m) => ({ ...m, home: { ...m.home, last5: { ...m.home.last5, wins: Number(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>Draws</Label>
                <Input type="number" value={match.home.last5.draws}
                  onChange={(e) => setMatch((m) => ({ ...m, home: { ...m.home, last5: { ...m.home.last5, draws: Number(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>Losses</Label>
                <Input type="number" value={match.home.last5.losses}
                  onChange={(e) => setMatch((m) => ({ ...m, home: { ...m.home, last5: { ...m.home.last5, losses: Number(e.target.value) } } }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>xG For</Label>
                <Input type="number" step="0.01" value={match.home.last5.xgFor ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, home: { ...m.home, last5: { ...m.home.last5, xgFor: parseNum(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>xG Against</Label>
                <Input type="number" step="0.01" value={match.home.last5.xgAgainst ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, home: { ...m.home, last5: { ...m.home.last5, xgAgainst: parseNum(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>SOT For</Label>
                <Input type="number" step="0.1" value={match.home.last5.sotFor ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, home: { ...m.home, last5: { ...m.home.last5, sotFor: parseNum(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>SOT Against</Label>
                <Input type="number" step="0.1" value={match.home.last5.sotAgainst ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, home: { ...m.home, last5: { ...m.home.last5, sotAgainst: parseNum(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>Goals For</Label>
                <Input type="number" step="0.01" value={match.home.last5.goalsFor ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, home: { ...m.home, last5: { ...m.home.last5, goalsFor: parseNum(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>Goals Against</Label>
                <Input type="number" step="0.01" value={match.home.last5.goalsAgainst ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, home: { ...m.home, last5: { ...m.home.last5, goalsAgainst: parseNum(e.target.value) } } }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 items-center">
              <div className="space-y-1 col-span-2">
                <Label>Red cards per match</Label>
                <Input type="number" step="0.01" value={match.home.redCardsPerMatch ?? 0}
                  onChange={(e) => setMatch((m) => ({ ...m, home: { ...m.home, redCardsPerMatch: Number(e.target.value) } }))} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Switch checked={!!match.home.goalieOut} onCheckedChange={(v) => setMatch((m) => ({ ...m, home: { ...m.home, goalieOut: v } }))} />
                <Label>Goalie out</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!match.home.keyScorerOut} onCheckedChange={(v) => setMatch((m) => ({ ...m, home: { ...m.home, keyScorerOut: v } }))} />
                <Label>Key scorer out</Label>
              </div>
            </div>
          </div>

          {/* Away side */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Away: {match.awayTeam}</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Wins</Label>
                <Input type="number" value={match.away.last5.wins}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, wins: Number(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>Draws</Label>
                <Input type="number" value={match.away.last5.draws}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, draws: Number(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>Losses</Label>
                <Input type="number" value={match.away.last5.losses}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, losses: Number(e.target.value) } } }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>xG For</Label>
                <Input type="number" step="0.01" value={match.away.last5.xgFor ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, xgFor: parseNum(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>xG Against</Label>
                <Input type="number" step="0.01" value={match.away.last5.xgAgainst ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, xgAgainst: parseNum(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>SOT For</Label>
                <Input type="number" step="0.1" value={match.away.last5.sotFor ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, sotFor: parseNum(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>SOT Against</Label>
                <Input type="number" step="0.1" value={match.away.last5.sotAgainst ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, sotAgainst: parseNum(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>Goals For</Label>
                <Input type="number" step="0.01" value={match.away.last5.goalsFor ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, goalsFor: parseNum(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>Goals Against</Label>
                <Input type="number" step="0.01" value={match.away.last5.goalsAgainst ?? ""}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, goalsAgainst: parseNum(e.target.value) } } }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 items-center">
              <div className="space-y-1">
                <Label>Away wins (last 5 away)</Label>
                <Input type="number" value={match.away.last5.awayWins ?? 0}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, awayWins: Number(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>Away wins streak</Label>
                <Input type="number" value={match.away.last5.awayWinsStreak ?? 0}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, last5: { ...m.away.last5, awayWinsStreak: Number(e.target.value) } } }))} />
              </div>
              <div className="space-y-1">
                <Label>Red cards per match</Label>
                <Input type="number" step="0.01" value={match.away.redCardsPerMatch ?? 0}
                  onChange={(e) => setMatch((m) => ({ ...m, away: { ...m.away, redCardsPerMatch: Number(e.target.value) } }))} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Switch checked={!!match.away.goalieOut} onCheckedChange={(v) => setMatch((m) => ({ ...m, away: { ...m.away, goalieOut: v } }))} />
                <Label>Goalie out</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!match.away.keyScorerOut} onCheckedChange={(v) => setMatch((m) => ({ ...m, away: { ...m.away, keyScorerOut: v } }))} />
                <Label>Key scorer out</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">H2H last 5</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label>Home wins</Label>
              <Input type="number" value={match.h2hLast5?.homeWins ?? 0}
                onChange={(e) => setMatch((m) => ({ ...m, h2hLast5: { ...(m.h2hLast5 ?? { homeWins: 0, draws: 0, awayWins: 0, awayWinsAway: 0 }), homeWins: Number(e.target.value) } }))} />
            </div>
            <div className="space-y-1">
              <Label>Draws</Label>
              <Input type="number" value={match.h2hLast5?.draws ?? 0}
                onChange={(e) => setMatch((m) => ({ ...m, h2hLast5: { ...(m.h2hLast5 ?? { homeWins: 0, draws: 0, awayWins: 0, awayWinsAway: 0 }), draws: Number(e.target.value) } }))} />
            </div>
            <div className="space-y-1">
              <Label>Away wins</Label>
              <Input type="number" value={match.h2hLast5?.awayWins ?? 0}
                onChange={(e) => setMatch((m) => ({ ...m, h2hLast5: { ...(m.h2hLast5 ?? { homeWins: 0, draws: 0, awayWins: 0, awayWinsAway: 0 }), awayWins: Number(e.target.value) } }))} />
            </div>
            <div className="space-y-1">
              <Label>Away wins away</Label>
              <Input type="number" value={match.h2hLast5?.awayWinsAway ?? 0}
                onChange={(e) => setMatch((m) => ({ ...m, h2hLast5: { ...(m.h2hLast5 ?? { homeWins: 0, draws: 0, awayWins: 0, awayWinsAway: 0 }), awayWinsAway: Number(e.target.value) } }))} />
            </div>
          </div>
        </div>

        <TriProbabilityBar values={output.probs} labels={{ home: match.homeTeam, draw: "Draw", away: match.awayTeam }} />

        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-md bg-secondary">
            <div className="text-muted-foreground">Home</div>
            <div className="text-2xl font-semibold">{output.probs.home}%</div>
          </div>
          <div className="p-4 rounded-md bg-secondary">
            <div className="text-muted-foreground">Draw</div>
            <div className="text-2xl font-semibold">{output.probs.draw}%</div>
          </div>
          <div className="p-4 rounded-md bg-secondary">
            <div className="text-muted-foreground">Away</div>
            <div className="text-2xl font-semibold">{output.probs.away}%</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm">Pick:</div>
          <div className="text-lg font-semibold">
            {output.pick === "HOME" ? match.homeTeam : output.pick === "AWAY" ? match.awayTeam : "Draw"}
          </div>
          <Button variant="outline" onClick={reset} className="ml-auto">Reset fields</Button>
        </div>

        {output.notes.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Notes</div>
            <ul className="list-disc ml-5 text-sm text-muted-foreground">
              {output.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
