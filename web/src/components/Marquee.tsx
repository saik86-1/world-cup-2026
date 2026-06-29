import { nextMatch as p, meta } from "../lib/data";

export default function Marquee() {
  const items = [
    `${p.home} ${Math.round(p.prob.home * 100)}%`,
    `Draw ${Math.round(p.prob.draw * 100)}%`,
    `${p.away} ${Math.round(p.prob.away * 100)}%`,
    p.verdict.text,
    `${p.confidence} confidence`,
    `Group ${p.group}`,
    `${meta.training_matches.toLocaleString()} matches trained`,
    "World Cup 2026",
  ];
  const strip = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-line bg-pitch py-3 text-ink">
      <div className="marquee flex w-max items-center gap-8 whitespace-nowrap">
        {strip.map((t, i) => (
          <span key={i} className="flex items-center gap-8 font-head text-sm font-bold uppercase tracking-[0.15em]">
            {t}
            <span className="text-ink/50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
