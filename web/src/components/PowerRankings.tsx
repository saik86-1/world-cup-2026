import { motion } from "framer-motion";
import { teams } from "../lib/data";
import { flagSmall } from "../lib/flags";
import Reveal, { SectionLabel, SectionTitle } from "./Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;
const TOP = 12;

export default function PowerRankings() {
  const top = teams.slice(0, TOP);
  const max = top[0].current_elo;
  const min = top[top.length - 1].current_elo - 60;

  return (
    <section id="index" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-10">
      <Reveal>
        <SectionLabel accent="text-gold">Power index</SectionLabel>
        <SectionTitle>Live Elo</SectionTitle>
        <p className="mt-4 max-w-xl text-muted">
          Each team&apos;s strength, seeded from published June-2026 ratings and nudged
          after every result. The backbone every prediction is built on.
        </p>
      </Reveal>

      <div className="mt-12 divide-y divide-line/70 border-t border-line">
        {top.map((t, i) => {
          const w = ((t.current_elo - min) / (max - min)) * 100;
          const drift = t.current_elo - t.seed_elo;
          return (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
              className="group flex items-center gap-4 py-4"
            >
              <span className="w-8 font-display text-2xl text-white/30 group-hover:text-pitch">
                {String(i + 1).padStart(2, "0")}
              </span>
              <img src={flagSmall(t.name)} alt="" className="h-7 w-10 rounded object-cover ring-1 ring-white/15" />
              <span className="w-32 shrink-0 font-head text-base font-semibold text-white sm:w-48 sm:text-lg">
                {t.name}
              </span>
              <div className="relative hidden h-[6px] flex-1 overflow-hidden rounded-full bg-white/8 sm:block">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pitch to-electric"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${w}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.04 }}
                />
              </div>
              <span className="w-16 text-right font-display text-2xl text-white">{t.current_elo}</span>
              <span className={`w-12 text-right text-xs font-medium ${drift > 0 ? "text-pitch" : drift < 0 ? "text-danger" : "text-muted"}`}>
                {drift > 0 ? "▲" : drift < 0 ? "▼" : "–"} {drift ? Math.abs(drift) : ""}
              </span>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted">Right column: movement since the tournament's opening rating.</p>
    </section>
  );
}
