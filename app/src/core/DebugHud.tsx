import { useEffect, useState } from "react";
import { useBudgetSnapshot } from "./RenderBudget";
import { useHtmlInCanvasSupport } from "./SupportContext";

/**
 * 計測用 HUD（ui-design.md §6 / 受入 AC-3 の確認手段）
 * ?debug=1 のときのみ表示する。
 */
export function DebugHud() {
  const snap = useBudgetSnapshot();
  const supported = useHtmlInCanvasSupport();
  const [fps, setFps] = useState(0);
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("debug") === "1",
  );

  useEffect(() => {
    if (!enabled) return;
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  if (!enabled) return null;

  const over = snap.activeCount > snap.capacity;
  const counts = { active: 0, preloading: 0, dormant: 0, failed: 0 };
  for (const p of snap.phases.values()) counts[p]++;

  return (
    <aside
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9999,
        padding: "var(--sp-3)",
        borderRadius: 8,
        border: "1px solid var(--color-border)",
        background: "color-mix(in srgb, var(--color-raised) 88%, transparent)",
        color: "var(--color-fg)",
        font: "12px/1.6 var(--font-mono)",
        pointerEvents: "none",
        minWidth: 190,
      }}
    >
      <div style={{ color: over ? "var(--color-danger)" : "var(--color-ok)" }}>
        active {snap.activeCount} / {snap.capacity}
        {over ? "  ← 上限超過" : ""}
      </div>
      <div style={{ color: "var(--color-muted)" }}>
        preload {counts.preloading} · dormant {counts.dormant} · failed{" "}
        <span style={{ color: counts.failed ? "var(--color-danger)" : undefined }}>
          {counts.failed}
        </span>
      </div>
      <div style={{ color: "var(--color-muted)" }}>fps {fps}</div>
      <div style={{ color: "var(--color-muted)" }}>
        html-in-canvas {supported ? "有効" : "無効"}
      </div>
    </aside>
  );
}
