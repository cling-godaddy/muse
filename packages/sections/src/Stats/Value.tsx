import { useEffect, useState, useRef, type ReactNode } from "react";
import styles from "./Value.module.css";

interface ValueProps {
  children: ReactNode
  animate?: boolean
}

function parseAnimatable(value: string): { num: number, suffix: string } | null {
  // Skip ratios like "24/7" or "4.8/5"
  if (/^\d+(\.\d+)?\/\d+$/.test(value)) return null;

  const match = String(value).match(/^([\d.]+)(.*)$/);
  if (!match || match[1] === undefined) return null;
  return { num: parseFloat(match[1]), suffix: match[2] ?? "" };
}

export function Value({ children, animate = false }: ValueProps) {
  const [display, setDisplay] = useState(children);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!animate || hasAnimated.current || typeof children !== "string") return;

    const parsed = parseAnimatable(children);
    if (!parsed) return;

    hasAnimated.current = true;
    const { num, suffix } = parsed;
    const duration = 1500;
    const startTime = performance.now();
    const isFloat = children.includes(".");

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = isFloat
        ? (num * eased).toFixed(1)
        : Math.round(num * eased).toLocaleString();
      setDisplay(current + suffix);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [children, animate]);

  return <div className={styles.value}>{display}</div>;
}
