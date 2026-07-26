import { useEffect, useState, type CSSProperties } from "react";

export const box: CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: "var(--sp-6)",
  background: "var(--color-surface)",
  marginBottom: "var(--sp-6)",
};
export const h2: CSSProperties = { fontSize: "1.25rem", marginBottom: "var(--sp-3)" };
export const note: CSSProperties = { color: "var(--color-muted)", fontSize: ".875rem" };
export const label: CSSProperties = {
  color: "var(--color-dim)",
  fontSize: ".75rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  marginBottom: 4,
};
export const select: CSSProperties = {
  background: "var(--color-raised)",
  color: "var(--color-fg)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  height: 36,
  padding: "0 var(--sp-3)",
  font: "inherit",
};
export const button: CSSProperties = {
  background: "var(--color-accent)",
  color: "#fff",
  border: 0,
  borderRadius: 8,
  height: 40,
  padding: "0 var(--sp-5)",
  cursor: "pointer",
  font: "inherit",
};

/** 常時 fps を表示する。T-4 の判定に使う */
export function FpsMeter() {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const color = fps >= 50 ? "var(--color-ok)" : fps >= 30 ? "var(--color-warn)" : "var(--color-danger)";
  return (
    <div style={{ marginLeft: "auto" }}>
      <div style={label}>fps（50 以上が合格）</div>
      <div style={{ font: "1.5rem/1.2 var(--font-mono)", color }}>{fps}</div>
    </div>
  );
}
