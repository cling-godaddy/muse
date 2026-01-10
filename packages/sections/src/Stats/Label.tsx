import type { ReactNode } from "react";
import styles from "./Label.module.css";

interface LabelProps {
  children: ReactNode
}

export function Label({ children }: LabelProps) {
  return <div className={styles.label}>{children}</div>;
}
