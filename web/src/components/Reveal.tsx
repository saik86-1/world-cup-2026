import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (inView) setShown(true);
  }, [inView]);
  // safety net: never leave content invisible even if the observer misfires
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, ease: EASE, delay: shown ? delay : 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children, accent = "text-pitch" }: { children: ReactNode; accent?: string }) {
  return (
    <div className={`text-[11px] font-medium uppercase tracking-[0.3em] ${accent}`}>{children}</div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-3 font-display text-[clamp(2.2rem,6vw,4.5rem)] uppercase leading-[0.9] tracking-tightest text-white">
      {children}
    </h2>
  );
}
