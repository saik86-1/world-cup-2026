import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fixtures, archive, meta, type Fixture } from "../lib/data";
import { flagSmall } from "../lib/flags";
import Reveal, { SectionLabel, SectionTitle } from "./Reveal";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const dates = [...new Set(fixtures.map((f) => f.date))].sort();

function fmt(d: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

function Row({ f }: { f: Fixture }) {
  const pred = archive[f.id];
  return (
    <div className="flex items-center gap-3 border-b border-line/60 py-4 last:border-0">
      <div className="w-16 shrink-0 text-[11px] uppercase tracking-[0.15em] text-muted">
        {f.result ? "FT" : f.kickoff_et?.replace(" ET", "") ?? "TBD"}
      </div>
      <div className="flex flex-1 items-center gap-3">
        <img src={flagSmall(f.home)} alt="" className="h-5 w-8 rounded-sm object-cover ring-1 ring-white/10" />
        <span className="w-24 truncate font-head text-sm font-semibold text-white sm:w-36">{f.home}</span>
        <span className="font-display text-lg text-white">
          {f.result ? `${f.result.home}–${f.result.away}` : "v"}
        </span>
        <span className="w-24 truncate text-right font-head text-sm font-semibold text-white sm:w-36">{f.away}</span>
        <img src={flagSmall(f.away)} alt="" className="h-5 w-8 rounded-sm object-cover ring-1 ring-white/10" />
      </div>
      <div className="hidden w-40 text-right text-xs md:block">
        {pred ? (
          f.result ? (
            <span className={pred.correct ? "text-pitch" : "text-danger"}>
              said {pred.pick} {pred.correct ? "✓" : "✗"}
            </span>
          ) : (
            <span className="text-white/70">
              {pred.pick} · {pct(Math.max(pred.prob.home, pred.prob.draw, pred.prob.away))}
            </span>
          )
        ) : (
          <span className="text-muted/50">{f.result ? "—" : "not yet predicted"}</span>
        )}
      </div>
    </div>
  );
}

export default function Calendar() {
  const initial = dates.includes(meta.as_of_date) ? meta.as_of_date : dates[0];
  const [sel, setSel] = useState(initial);
  const dayFixtures = fixtures.filter((f) => f.date === sel);

  return (
    <section id="calendar" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-10">
      <Reveal>
        <SectionLabel accent="text-gold">Calendar</SectionLabel>
        <SectionTitle>Every matchday</SectionTitle>
        <p className="mt-4 max-w-xl text-muted">
          Browse the tournament day by day — results where played, our prediction and
          how it fared on every game we&apos;ve called.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-10 flex gap-2 overflow-x-auto pb-3">
        {dates.map((d) => {
          const active = d === sel;
          return (
            <button
              key={d}
              onClick={() => setSel(d)}
              className={`shrink-0 rounded-xl border px-4 py-2 text-center transition ${
                active ? "border-pitch bg-pitch/10 text-white" : "border-line text-muted hover:border-line/90 hover:text-white"
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.2em]">{fmt(d, { weekday: "short" })}</div>
              <div className="font-display text-xl">{fmt(d, { day: "2-digit" })}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted">{fmt(d, { month: "short" })}</div>
            </button>
          );
        })}
      </Reveal>

      <div className="mt-6 rounded-2xl border border-line bg-panel/50 px-5 py-3 sm:px-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={sel}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <div className="py-2 text-sm font-medium text-white/80">
              {fmt(sel, { weekday: "long", month: "long", day: "numeric" })} · {dayFixtures.length} match{dayFixtures.length === 1 ? "" : "es"}
            </div>
            {dayFixtures.map((f) => <Row key={f.id} f={f} />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
