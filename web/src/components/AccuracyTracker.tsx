import { accuracy, matches, meta } from "../lib/data";
import { flagSmall } from "../lib/flags";
import Reveal, { SectionLabel, SectionTitle } from "./Reveal";
import Count from "./Count";

function BigStat({ value, label, sub, suffix = "" }: { value: number | null; label: string; sub: string; suffix?: string }) {
  return (
    <div className="border-t border-line pt-5">
      <div className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-white">
        {value == null ? "—" : <Count to={value} suffix={suffix} />}
      </div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-[0.15em] text-white/80">{label}</div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}

export default function AccuracyTracker() {
  const a = accuracy;
  const played = matches.filter((m) => m.result);
  const rate = a.outcome_hit_rate != null ? Math.round(a.outcome_hit_rate * 100) : null;

  return (
    <section id="track" className="relative scroll-mt-24 border-y border-line bg-panel/40 py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <Reveal>
          <SectionLabel accent="text-electric">Track record</SectionLabel>
          <SectionTitle>Kept honest</SectionTitle>
          <p className="mt-4 max-w-xl text-muted">
            Every prediction is scored against the real result the moment a match ends.
            No cherry-picking — the record stands as it falls.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-3">
          <BigStat value={a.predictions_made} label="Predictions" sub="completed & graded" />
          <BigStat value={rate} label="Hit rate" sub="correct W / D / L" suffix="%" />
          <BigStat value={a.exact_margin} label="Exact margin" sub="right winner & goal gap" />
        </Reveal>

        {a.scored === 0 && (
          <Reveal delay={0.15} className="mt-8 rounded-2xl border border-line bg-ink/60 p-5 text-sm text-muted">
            {a.note}
          </Reveal>
        )}

        {played.length > 0 && (
          <Reveal delay={0.2} className="mt-14">
            <div className="mb-4 text-[11px] uppercase tracking-[0.25em] text-muted">
              Results already in the books — feeding live Elo
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {played.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-line bg-ink/40 px-4 py-3">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted">{m.date}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="hidden sm:inline text-white/80">{m.home}</span>
                    <img src={flagSmall(m.home)} alt="" className="h-4 w-6 rounded-sm object-cover ring-1 ring-white/10" />
                    <span className="font-display text-lg text-white">{m.result!.home}–{m.result!.away}</span>
                    <img src={flagSmall(m.away)} alt="" className="h-4 w-6 rounded-sm object-cover ring-1 ring-white/10" />
                    <span className="hidden sm:inline text-white/80">{m.away}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
