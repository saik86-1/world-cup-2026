import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { nextMatch, meta } from "../lib/data";
import { flagUrl } from "../lib/flags";
import Count from "./Count";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const p = nextMatch;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yL = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const yR = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const homeWin = p.pick === p.home;
  const awayWin = p.pick === p.away;
  const pcH = Math.round(p.prob.home * 100);
  const pcA = Math.round(p.prob.away * 100);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink grain">
      {/* split flag panels */}
      <motion.div
        style={{ y: yL, clipPath: "polygon(0 0, 56% 0, 44% 100%, 0 100%)" }}
        className="absolute inset-0"
      >
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.06, opacity: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${flagUrl(p.home)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      </motion.div>

      <motion.div
        style={{ y: yR, clipPath: "polygon(56% 0, 100% 0, 100% 100%, 44% 100%)" }}
        className="absolute inset-0"
      >
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.06, opacity: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${flagUrl(p.away)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-ink via-ink/55 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      </motion.div>

      {/* seam line */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(99deg, transparent calc(50% - 1px), rgba(25,230,140,0.55) 50%, transparent calc(50% + 1px))",
        }}
      />

      {/* top editorial bar */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-20 text-[11px] uppercase tracking-[0.25em] text-white/70 sm:px-10"
      >
        <span className="text-pitch">Next up · Group {p.group}{p.kickoff_et ? ` · ${p.kickoff_et}` : ""}</span>
        <span className="hidden sm:block">{p.date} · {p.venue}</span>
      </motion.div>

      {/* content */}
      <motion.div style={{ opacity: fade, y: lift }} className="relative z-10 flex h-full flex-col justify-center">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 items-center gap-2 px-5 sm:px-10">
          {/* home */}
          <motion.div
            initial={{ x: -90, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 0.35 }}
            className="text-left"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-white/60">Home</div>
            <h1 className="display-huge mt-2 text-[clamp(2.8rem,11vw,9rem)] text-white">
              {p.home.split(" ").map((w, i) => (
                <span key={i} className="block">{w}</span>
              ))}
            </h1>
            <div className={`mt-3 font-display text-[clamp(2rem,5vw,4rem)] leading-none ${homeWin ? "text-pitch" : "text-white/45"}`}>
              <Count to={pcH} delay={0.9} suffix="%" />
            </div>
          </motion.div>

          {/* away */}
          <motion.div
            initial={{ x: 90, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 0.45 }}
            className="text-right"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-white/60">Away</div>
            <h1 className="display-huge mt-2 text-[clamp(2.8rem,11vw,9rem)] text-white">
              {p.away.split(" ").map((w, i) => (
                <span key={i} className="block">{w}</span>
              ))}
            </h1>
            <div className={`mt-3 font-display text-[clamp(2rem,5vw,4rem)] leading-none ${awayWin ? "text-electric" : "text-white/45"}`}>
              <Count to={pcA} delay={1} suffix="%" />
            </div>
          </motion.div>
        </div>

        {/* center verdict medallion */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center"
        >
          <div className="rounded-full border border-white/15 bg-ink/70 px-8 py-6 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.3em] text-pitch">Verdict</div>
            <div className="display-huge mt-1 text-5xl text-white sm:text-6xl">
              {p.verdict.result === "draw" ? "DRAW" : `+${p.verdict.margin}`}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
              {p.verdict.result === "draw" ? "predicted level" : `${p.verdict.winner} by ${p.verdict.margin}`}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* bottom ticker + scroll cue */}
      <motion.div
        style={{ opacity: fade }}
        className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-ink/40 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between px-5 py-4 sm:px-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] uppercase tracking-[0.2em] text-white/60">
            <span>Confidence · <span className="text-pitch">{p.confidence}</span></span>
            <span>xG · {p.home} {p.expected_goals[p.home]} — {p.expected_goals[p.away]} {p.away}</span>
            <span className="hidden md:block">Model · ensemble of {meta.training_matches.toLocaleString()} matches</span>
          </div>
          <a href="#today" className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/70 hover:text-white">
            Scroll
            <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
              <ChevronDown size={16} />
            </motion.span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
