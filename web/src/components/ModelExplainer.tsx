import { meta } from "../lib/data";
import Reveal, { SectionLabel, SectionTitle } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Elo",
    body: "Every team carries a strength rating, seeded from published June-2026 values and updated after each result with a competition-weighted K-factor. World Cups and continental finals move it most; friendlies least.",
  },
  {
    n: "02",
    title: "Negative binomial",
    body: "The Elo gap plus host-nation advantage becomes an expected goal supremacy, feeding two negative-binomial distributions — chosen over plain Poisson because real goal counts are over-dispersed (the odd blow-out). Their scoreline matrix yields win / draw / loss and the likeliest scores.",
  },
  {
    n: "03",
    title: "Neural net",
    body: `A multi-layer perceptron trained on ${meta.training_matches.toLocaleString()} real matches — World Cups 1930–2022 and Euros 1960–2024 — with competition-importance and recency weighting. It catches the non-linear patterns raw Elo misses.`,
  },
];

export default function ModelExplainer() {
  return (
    <section id="how" className="relative scroll-mt-24 border-t border-line bg-panel/40 py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <Reveal>
          <SectionLabel>Method</SectionLabel>
          <SectionTitle>Three models,<br />one number</SectionTitle>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line/40 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} className="bg-ink">
              <div className="h-full p-8">
                <div className="font-display text-5xl text-pitch/80">{s.n}</div>
                <h3 className="mt-5 font-head text-2xl font-bold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-6 flex flex-col gap-3 rounded-2xl border border-pitch/25 bg-pitch/[0.06] p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-head text-xl font-semibold text-white">
            Final = {Math.round(meta.ensemble_weights.poisson * 100)}% scoreline model + {Math.round(meta.ensemble_weights.neural_net * 100)}% neural net
          </div>
          <p className="max-w-md text-sm text-white/70">
            As 2026 results land, the model re-trains and the learned layer earns more trust —
            so the system sharpens as the tournament unfolds.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
