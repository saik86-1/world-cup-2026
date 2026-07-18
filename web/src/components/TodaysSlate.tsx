import { motion } from "framer-motion";
import { predictions, type Prediction } from "../lib/data";
import { flagUrl } from "../lib/flags";
import Reveal, { SectionLabel, SectionTitle } from "./Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;
const pct = (n: number) => `${Math.round(n * 100)}%`;

function SlateCard({ p, i }: { p: Prediction; i: number }) {
  const [time, meridiem] = (p.kickoff_et ?? "TBD").replace(" ET", "").split(" ");
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-[120px_1fr] md:items-stretch"
    >
      {/* kickoff time rail */}
      <div className="flex items-center gap-3 md:flex-col md:items-start md:justify-center">
        <div className={`font-display text-4xl leading-none md:text-5xl ${p.result ? "text-white/40" : "text-white"}`}>{time}</div>
        <div className="text-xs uppercase tracking-[0.25em] text-pitch">{meridiem} ET</div>
        {p.result ? (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/60">Full time</span>
        ) : p.is_next ? (
          <span className="rounded-full bg-pitch/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-pitch">Next up</span>
        ) : null}
      </div>

      {/* split-flag match card */}
      <div className="relative h-44 overflow-hidden rounded-2xl border border-line sm:h-52">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${flagUrl(p.home, 640)})`, clipPath: "polygon(0 0, 58% 0, 42% 100%, 0 100%)" }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${flagUrl(p.away, 640)})`, clipPath: "polygon(58% 0, 100% 0, 100% 100%, 42% 100%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/0 to-ink/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-ink/15" />

        <div className="relative flex h-full items-center justify-between px-4 sm:px-7">
          <div className="text-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <div className="display-huge text-[clamp(1.4rem,4vw,2.6rem)] text-white">{p.home}</div>
            <div className={`font-head text-sm font-semibold ${p.pick === p.home ? "text-pitch" : "text-white/70"}`}>
              {p.result || p.is_next ? pct(p.prob.home) : ""}
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-ink/75 px-4 py-2 text-center backdrop-blur-md">
            {p.result ? (
              <>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">Full time</div>
                <div className="font-display text-2xl text-white sm:text-3xl">
                  {p.result.home}–{p.result.away}
                </div>
                <div className={`text-[11px] tracking-[0.1em] ${p.correct ? "text-pitch" : "text-danger"}`}>
                  we said {p.verdict.result === "draw" ? "draw" : `${p.verdict.winner} by ${p.verdict.margin}`}{" "}
                  · {p.correct ? "✓" : "✗"}
                </div>
              </>
            ) : p.is_next ? (
              <>
                <div className="text-[10px] uppercase tracking-[0.2em] text-pitch">Pick</div>
                <div className="font-head text-base font-bold text-white sm:text-lg">
                  {p.verdict.result === "draw" ? "Draw" : p.verdict.winner}
                </div>
                <div className="text-[11px] tracking-[0.1em] text-white/70">
                  {Math.round(Math.max(p.prob.home, p.prob.draw, p.prob.away) * 100)}%
                  {p.verdict.result === "draw" ? " · level" : ` · by ${p.verdict.margin}`}
                </div>
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Locked</div>
                <div className="mt-1 font-head text-xs font-medium leading-snug text-white/70">
                  Prediction made<br />1 hr before kickoff
                </div>
              </>
            )}
          </div>

          <div className="text-right drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <div className="display-huge text-[clamp(1.4rem,4vw,2.6rem)] text-white">{p.away}</div>
            <div className={`font-head text-sm font-semibold ${p.pick === p.away ? "text-electric" : "text-white/70"}`}>
              {p.result || p.is_next ? pct(p.prob.away) : ""}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3 text-[10px] uppercase tracking-[0.2em] text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:px-7">
          <span>Group {p.group}</span>
          <span className="hidden truncate sm:block">{p.venue}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function TodaysSlate() {
  if (predictions.length < 2) return null;
  return (
    <section id="slate" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-10">
      <Reveal>
        <SectionLabel accent="text-electric">The slate</SectionLabel>
        <SectionTitle>Today&apos;s fixtures</SectionTitle>
        <p className="mt-4 max-w-xl text-muted">
          Every match on the card today, in kickoff order — each with our predicted
          result. All times Eastern.
        </p>
      </Reveal>
      <div className="mt-12 space-y-6">
        {predictions.map((p, i) => <SlateCard key={p.id} p={p} i={i} />)}
      </div>
    </section>
  );
}
