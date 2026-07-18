import { motion } from "framer-motion";
import { nextMatch, type Prediction, type Probs } from "../lib/data";
import { flagSmall } from "../lib/flags";
import Reveal, { SectionLabel, SectionTitle } from "./Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;
const pct = (n: number) => `${Math.round(n * 100)}%`;

const confTone: Record<string, string> = {
  High: "text-pitch border-pitch/40 bg-pitch/10",
  Medium: "text-gold border-gold/40 bg-gold/10",
  Low: "text-danger border-danger/40 bg-danger/10",
};

function Bar({ value, color, delay }: { value: number; color: string; delay: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        whileInView={{ width: pct(value) }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      />
    </div>
  );
}

function TeamRow({ name, prob, win, color, delay }: { name: string; prob: number; win: boolean; color: string; delay: number }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={flagSmall(name)} alt="" className="h-7 w-10 rounded object-cover ring-1 ring-white/15" />
          <span className={`font-head text-xl font-semibold ${win ? "text-white" : "text-white/70"}`}>{name}</span>
        </div>
        <span className={`font-display text-3xl ${win ? "" : "text-white/50"} ${win && color === "bg-pitch" ? "text-pitch" : ""} ${win && color === "bg-electric" ? "text-electric" : ""}`}>
          {pct(prob)}
        </span>
      </div>
      <div className="mt-2">
        <Bar value={prob} color={color} delay={delay} />
      </div>
    </div>
  );
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</div>
      <div className="mt-1 font-head text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function CompRow({ label, p }: { label: string; p: Probs }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-32 shrink-0 text-muted">{label}</span>
      <span className="text-pitch">{pct(p.home)}</span>
      <span className="text-white/40">/</span>
      <span className="text-white/60">{pct(p.draw)}</span>
      <span className="text-white/40">/</span>
      <span className="text-electric">{pct(p.away)}</span>
    </div>
  );
}

function Card({ p }: { p: Prediction }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-panel to-ink">
      <div className="grid gap-px bg-line/40 lg:grid-cols-[1.25fr_1fr]">
        <div className="bg-ink p-7 sm:p-9">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
              Group {p.group}
            </span>
            <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${confTone[p.confidence]}`}>
              {p.confidence} confidence
            </span>
          </div>

          <div className="mt-8 space-y-6">
            <TeamRow name={p.home} prob={p.prob.home} win={p.pick === p.home} color="bg-pitch" delay={0.1} />
            <div className="flex items-center gap-3 pl-[52px]">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Draw</span>
              <div className="flex-1"><Bar value={p.prob.draw} color="bg-white/35" delay={0.2} /></div>
              <span className="font-head text-sm text-white/60">{pct(p.prob.draw)}</span>
            </div>
            <TeamRow name={p.away} prob={p.prob.away} win={p.pick === p.away} color="bg-electric" delay={0.3} />
          </div>
        </div>

        <div className="flex flex-col justify-between bg-panel p-7 sm:p-9">
          {(() => {
            const draw = p.verdict.result === "draw";
            const by2 = p.pick === p.home ? p.margins.home_by2plus : p.margins.away_by2plus;
            return (
              <div className="mb-2 rounded-2xl border border-pitch/25 bg-pitch/[0.06] p-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted">The call</div>
                {draw ? (
                  <div className="mt-2 font-display text-4xl text-white">Predicted draw</div>
                ) : (
                  <>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="font-display text-5xl leading-none text-pitch">+{p.verdict.margin}</span>
                      <span className="font-head text-lg font-semibold leading-tight text-white">
                        {p.verdict.text}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-white/75">
                      chance {p.pick} win by 2+ goals:{" "}
                      <span className="font-semibold text-pitch">{pct(by2)}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })()}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetaTile label="xG home" value={String(p.expected_goals[p.home])} />
            <MetaTile label="xG away" value={String(p.expected_goals[p.away])} />
            <MetaTile label={`${p.home} Elo`} value={String(p.elo[p.home])} />
            <MetaTile label={`${p.away} Elo`} value={String(p.elo[p.away])} />
          </div>
          <div className="mt-6 space-y-2 border-t border-line pt-5">
            <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted">Ensemble · home / draw / away</div>
            <CompRow label="Scoreline · 62%" p={p.components.poisson} />
            <CompRow label="Neural net · 38%" p={p.components.net} />
          </div>
        </div>
      </div>
      {p.lineup_note && (
        <div className="border-t border-line bg-ink px-7 py-4 text-sm text-white/70 sm:px-9">
          <span className="text-pitch">Lineups — </span>{p.lineup_note}
        </div>
      )}
      {p.h2h && (
        <div className="border-t border-line bg-ink px-7 py-4 text-sm text-white/60 sm:px-9">
          <span className="text-gold">Head to head — </span>{p.h2h}
        </div>
      )}
    </div>
  );
}

export default function TodaysPrediction() {
  return (
    <section id="today" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-10">
      <Reveal>
        <SectionLabel>Next up{nextMatch.kickoff_et ? ` · ${nextMatch.kickoff_et}` : ""}</SectionLabel>
        <SectionTitle>The verdict</SectionTitle>
        <p className="mt-4 max-w-xl text-muted">
          {nextMatch.home} vs {nextMatch.away}. Probabilities blend the negative-binomial
          scoreline model with a neural-net calibrator — committed before kickoff.
        </p>
      </Reveal>
      <Reveal delay={0.1} className="mt-10">
        <Card p={nextMatch} />
      </Reveal>
    </section>
  );
}
