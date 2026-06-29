import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { href: "#today", label: "Verdict" },
  { href: "#slate", label: "Slate" },
  { href: "#calendar", label: "Calendar" },
  { href: "#track", label: "Track record" },
  { href: "#index", label: "Power index" },
  { href: "#how", label: "Method" },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "border-b border-line/70 bg-ink/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-10">
        <a href="#top" className="font-display text-lg uppercase tracking-tight text-white">
          WC<span className="text-pitch">26</span>
          <span className="ml-2 align-middle text-[10px] uppercase tracking-[0.3em] text-muted">Predicted</span>
        </a>
        <div className="hidden items-center gap-8 text-[12px] uppercase tracking-[0.2em] text-white/70 sm:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors duration-200 hover:text-pitch">
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </motion.header>
  );
}
