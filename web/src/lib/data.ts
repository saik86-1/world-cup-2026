import predictionsJson from "../data/predictions.json";
import accuracyJson from "../data/accuracy.json";
import teamsJson from "../data/teams.json";
import matchesJson from "../data/matches.json";
import scheduleJson from "../data/schedule.json";
import archiveJson from "../data/archive.json";

export type Probs = { home: number; draw: number; away: number };

export type Prediction = {
  id: string;
  date: string;
  group: string;
  venue: string;
  home: string;
  away: string;
  elo: Record<string, number>;
  prob: Probs;
  verdict: { result: "win" | "draw"; winner: string | null; margin: number; text: string };
  scoreline: string;
  projected_score: string;
  top_scores: { score: string; prob: number }[];
  margins: {
    home_by1: number;
    home_by2plus: number;
    away_by1: number;
    away_by2plus: number;
  };
  expected_goals: Record<string, number>;
  confidence: "High" | "Medium" | "Low";
  pick: string;
  kickoff_et: string | null;
  result: { home: number; away: number } | null;
  status: "played" | "upcoming";
  is_next: boolean;
  correct?: boolean;
  actual_outcome?: "home" | "draw" | "away";
  lineup_note?: string | null;
  h2h: string | null;
  components: {
    poisson: Probs;
    net: Probs;
    weights: { poisson: number; net: number };
  };
};

export type Team = {
  name: string;
  flag: string;
  confederation: string;
  fifa_rank: number;
  seed_elo: number;
  current_elo: number;
};

export type Match = {
  id: string;
  date: string;
  group: string;
  home: string;
  away: string;
  venue: string | null;
  result: { home: number; away: number } | null;
  predicted: boolean;
};

export const meta = (predictionsJson as any).meta as {
  updated: string;
  model: string;
  training_matches: number;
  ensemble_weights: { poisson: number; neural_net: number };
  as_of_date: string;
};

export const predictions = (predictionsJson as any).predictions as Prediction[];
export const accuracy = (accuracyJson as any).accuracy as Record<string, any>;
export const teams = (teamsJson as any).teams as Team[];
export const matches = (matchesJson as any).matches as Match[];

export type Fixture = {
  id: string;
  date: string;
  group: string;
  home: string;
  away: string;
  venue: string | null;
  kickoff_et: string | null;
  result: { home: number; away: number } | null;
};

export type ArchivedPrediction = {
  id: string;
  pick: string;
  prob: Probs;
  verdict?: { result: "win" | "draw"; winner: string | null; margin: number; text: string };
  confidence: string;
  result: { home: number; away: number } | null;
  correct?: boolean;
};

export const fixtures = (scheduleJson as any).fixtures as Fixture[];
export const archive = (archiveJson as any).predictions as Record<string, ArchivedPrediction>;

export const flagOf = (name: string) =>
  teams.find((t) => t.name === name)?.flag ?? "";

// the match the landing page features: next upcoming, else the last one
export const nextMatch: Prediction =
  predictions.find((p) => p.is_next) ??
  predictions.find((p) => p.status === "upcoming") ??
  predictions[predictions.length - 1];
