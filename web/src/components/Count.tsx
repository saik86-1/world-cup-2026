import { useEffect, useState } from "react";
import { animate } from "framer-motion";

export default function Count({
  to,
  duration = 1.6,
  delay = 0,
  suffix = "",
}: {
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (x) => setV(x),
    });
    return () => controls.stop();
  }, [to, duration, delay]);
  return (
    <>
      {Math.round(v)}
      {suffix}
    </>
  );
}
