import { meta } from "../lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink px-5 py-14 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="font-display text-[clamp(2rem,7vw,5rem)] uppercase leading-none tracking-tightest text-white/90">
          Predicted<span className="text-pitch">.</span> daily
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>World Cup 2026 Predictor · ensemble model · updated {meta.updated}</span>
          <span>Data: openfootball (WC 1930–2022, Euro 1960–2024) · Elo: World Football Elo Ratings.</span>
        </div>
        <p className="mt-4 text-xs text-muted/70">
          Probabilistic estimates for interest only, not betting advice. A favourite is never a
          certainty — that&apos;s rather the point of the game.
        </p>
      </div>
    </footer>
  );
}
