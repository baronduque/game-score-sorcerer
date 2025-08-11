// Soccer V5 H2H model implemented exactly as provided by user

export type Last5 = {
  wins: number;
  draws: number;
  losses: number; // soma = 5 (ideal)
  xgFor?: number;
  xgAgainst?: number; // média por jogo
  sotFor?: number;
  sotAgainst?: number; // chutes no alvo / jogo
  goalsFor?: number;
  goalsAgainst?: number; // média por jogo
  awayWins?: number; // vitórias fora nos últimos 5 (para visitante)
  awayWinsStreak?: number; // vitórias consecutivas fora (0–5)
};

export type TeamFeatures = {
  last5: Last5;
  redCardsPerMatch?: number; // média últimos ~8 jogos
  goalieOut?: boolean;
  keyScorerOut?: boolean;
};

export type H2HLast5 = {
  homeWins: number;
  draws: number;
  awayWins: number;
  awayWinsAway?: number;
};

export type MatchInput = {
  id?: string | number;
  homeTeam: string;
  awayTeam: string;
  home: TeamFeatures;
  away: TeamFeatures;
  h2hLast5?: H2HLast5;
};

export type MatchOutput = {
  id?: string | number;
  homeTeam: string;
  awayTeam: string;
  probs: { home: number; draw: number; away: number }; // 0–100
  pick: "HOME" | "DRAW" | "AWAY";
  notes: string[];
};

type Weights = {
  form: number; // forma recente
  xg: number; // xG (a favor - contra)
  visitorMomentum: number;
  homeAdv: number;
  shots: number; // SOT (a favor - contra)
  drawTendency: number;
  discipline: number; // cartões/lesões
};

const W_NORMAL: Weights = {
  form: 28,
  xg: 20,
  visitorMomentum: 15,
  homeAdv: 10,
  shots: 8,
  drawTendency: 15,
  discipline: 4,
};
const W_BALANCED: Weights = {
  form: 25,
  xg: 18,
  visitorMomentum: 10,
  homeAdv: 8,
  shots: 6,
  drawTendency: 30,
  discipline: 3,
};

// ---------- Helpers ----------
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const nz = (v: number | undefined, fallback = 0) =>
  Number.isFinite(v as number) ? (v as number) : fallback;

function netXG(l5: Last5): number {
  if (l5.xgFor != null && l5.xgAgainst != null) return l5.xgFor - l5.xgAgainst;
  // fallback: aproxima xG com SOT e gols (peso leve)
  const sotNet = nz(l5.sotFor) - nz(l5.sotAgainst);
  const gNet = nz(l5.goalsFor) - nz(l5.goalsAgainst);
  return 0.12 * sotNet + 0.25 * gNet; // heurística simples
}

function formScore(l5: Last5): number {
  // pontos/15, normalizado 0..1
  const pts = l5.wins * 3 + l5.draws;
  return clamp(pts / 15);
}

function shotsScore(l5: Last5): number {
  // SOT net normalizado pelo “range” típico (±4)
  const net = nz(l5.sotFor) - nz(l5.sotAgainst);
  return clamp(0.5 + net / 8); // 0.5±(net/8)
}

function drawTendency(home: Last5, away: Last5): number {
  const dHome = clamp(home.draws / 5);
  const dAway = clamp(away.draws / 5);
  return (dHome + dAway) / 2; // 0..1
}

function avgAbsDeltaXG(matches: MatchInput[]): number {
  if (!matches.length) return 0.3;
  const vals = matches.map((m) =>
    Math.abs(netXG(m.home.last5) - netXG(m.away.last5))
  );
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function normalize3(a: number, b: number, c: number): [number, number, number] {
  const sum = a + b + c;
  if (sum <= 0) return [33.33, 33.33, 33.33];
  return [a / sum, b / sum, c / sum];
}

// ---------- Core ----------
export function predictRoundV5H2H(matches: MatchInput[]): MatchOutput[] {
  // 1) Pré-análise da rodada para detectar “rodada equilibrada”
  const roundDelta = avgAbsDeltaXG(matches);
  const balancedRound = roundDelta <= 0.25;
  const W = balancedRound ? W_BALANCED : W_NORMAL;

  return matches.map((m): MatchOutput => {
    const notes: string[] = [];
    if (balancedRound) notes.push("Rodada equilibrada: peso extra para empate.");

    // 2) Features base
    const homeForm = formScore(m.home.last5);
    const awayForm = formScore(m.away.last5);
    const xgHome = netXG(m.home.last5);
    const xgAway = netXG(m.away.last5);
    const dXG = xgHome - xgAway; // positivo favorece mandante
    const absDXG = Math.abs(dXG);

    const shotsHome = shotsScore(m.home.last5);
    const shotsAway = shotsScore(m.away.last5);

    // 3) Escores lineares (0..1) por via
    let homeScore =
      W.form * (homeForm - awayForm + 0.5) +
      W.xg * clamp(0.5 + dXG / 2) + // dXG ~ [-1,+1] típico => 0..1
      W.shots * clamp(0.5 + (shotsHome - shotsAway)) +
      W.homeAdv * 0.58; // mando base

    let drawScore = W.drawTendency * drawTendency(m.home.last5, m.away.last5);

    let awayScore =
      W.form * (awayForm - homeForm + 0.5) +
      W.xg * clamp(0.5 - dXG / 2) +
      W.shots * clamp(0.5 + (shotsAway - shotsHome));

    // 4) Regras finas (boosts/deduções)
    // 4.1 Empates em jogos muito parelhos
    if (absDXG <= 0.15) {
      drawScore += 12;
      notes.push("Jogo muito parelho: +12 p.p. empate.");
    } else if (absDXG <= 0.2) {
      drawScore += 8;
      notes.push("Jogo parelho: +8 p.p. empate.");
    }

    // 4.2 Momentum visitante
    const aw = nz(m.away.last5.awayWins);
    const awStreak = nz(m.away.last5.awayWinsStreak);
    if (aw >= 2 || awStreak >= 2 || xgAway - xgHome >= 0.3) {
      awayScore += 7;
      homeScore -= 4;
      drawScore -= 3;
      notes.push("Visitante perigoso: +7 away / -4 home / -3 draw.");
    }

    // 4.3 Disciplina e desfalques
    if (nz(m.home.redCardsPerMatch) > 0.2) {
      homeScore -= 3;
      drawScore += 1;
      awayScore += 2;
      notes.push("Mandante indisciplinado.");
    }
    if (nz(m.away.redCardsPerMatch) > 0.2) {
      awayScore -= 3;
      drawScore += 1;
      homeScore += 2;
      notes.push("Visitante indisciplinado.");
    }
    if (m.home.goalieOut) {
      homeScore -= 4;
      awayScore += 2;
      drawScore += 2;
      notes.push("Goleiro do mandante fora.");
    }
    if (m.away.goalieOut) {
      awayScore -= 4;
      homeScore += 2;
      drawScore += 2;
      notes.push("Goleiro do visitante fora.");
    }
    if (m.home.keyScorerOut) {
      homeScore -= 2;
      drawScore += 1;
      notes.push("Artilheiro do mandante fora.");
    }
    if (m.away.keyScorerOut) {
      awayScore -= 2;
      drawScore += 1;
      notes.push("Artilheiro do visitante fora.");
    }

    // 4.4 H2H (últimos 5)
    if (m.h2hLast5) {
      const { homeWins, draws, awayWins, awayWinsAway } = m.h2hLast5;
      if (homeWins >= 3) {
        homeScore += 5;
        notes.push("H2H favorece mandante (+5).");
      }
      if (awayWins >= 3) {
        awayScore += 5;
        notes.push("H2H favorece visitante (+5).");
      }
      if (draws >= 3) {
        drawScore += 6;
        notes.push("H2H com muitos empates (+6).");
      }
      if ((awayWinsAway ?? 0) >= 3) {
        awayScore += 3;
        notes.push("Visitante já venceu fora repetidas vezes (+3).");
      }
    }

    // 4.5 Favorito não confiável: se muito favorito mas dXG pequeno
    const favScore = Math.max(homeScore, awayScore);
    if (favScore > 65 && absDXG <= 0.25) {
      if (homeScore >= awayScore) {
        homeScore -= 5;
        drawScore += 3;
        awayScore += 2;
      } else {
        awayScore -= 5;
        drawScore += 3;
        homeScore += 2;
      }
      notes.push("Corte de overconfidence do favorito.");
    }

    // 5) Normalização para probabilidades (0–100)
    let [ph, pd, pa] = normalize3(
      Math.max(0, homeScore),
      Math.max(0, drawScore),
      Math.max(0, awayScore)
    );
    ph *= 100;
    pd *= 100;
    pa *= 100;

    // 6) Saída
    const pick: MatchOutput["pick"] =
      ph >= pd && ph >= pa ? "HOME" : pa >= ph && pa >= pd ? "AWAY" : "DRAW";
    return {
      id: m.id,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      probs: { home: Math.round(ph), draw: Math.round(pd), away: Math.round(pa) },
      pick,
      notes,
    };
  });
}
