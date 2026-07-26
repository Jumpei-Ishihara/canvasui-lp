import { StrictMode, useState } from "react";
import { mountRoot } from "./mountRoot";
import "./styles/globals.css";
import { detectHtmlInCanvas } from "./core/SupportContext";
import { ContextBudgetProbe } from "./lab/ContextBudgetProbe";
import { NestingProbe } from "./lab/NestingProbe";
import { MatrixProbe } from "./lab/MatrixProbe";
import { SingleProbe } from "./lab/SingleProbe";
import { AutoRunner } from "./lab/AutoRunner";

type Tab = "auto" | "budget" | "single" | "nesting" | "matrix";

const TABS: Array<{ id: Tab; title: string; tests: string }> = [
  { id: "auto", title: "自動検証", tests: "T-1 / T-8 / T-9" },
  { id: "budget", title: "コンテキスト予算", tests: "T-6" },
  { id: "single", title: "単体動作（手動）", tests: "T-1" },
  { id: "nesting", title: "入れ子", tests: "T-2 / T-3 / T-4" },
  { id: "matrix", title: "背景と往復", tests: "T-5 / T-7" },
];

function Lab() {
  const [tab, setTab] = useState<Tab>(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    return (["auto", "budget", "single", "nesting", "matrix"] as const).includes(t as Tab)
      ? (t as Tab)
      : "auto";
  });
  const supported = detectHtmlInCanvas();

  return (
    <main style={{ maxWidth: "var(--w-wide)", margin: "0 auto", padding: "var(--sp-7) var(--sp-5)" }}>
      <h1 style={{ fontSize: "1.75rem" }}>検証ハーネス</h1>
      <p style={{ color: "var(--color-muted)", fontSize: ".875rem" }}>
        T-1〜T-9 を実施する画面（test-plan.md §4.4）。結果は{" "}
        <code>docs/03-combination-research.md</code> §7 に記録してください。
      </p>

      <p
        style={{
          padding: "var(--sp-3) var(--sp-4)",
          borderLeft: `3px solid ${supported ? "var(--color-ok)" : "var(--color-warn)"}`,
          background: "var(--color-surface)",
          fontSize: ".875rem",
        }}
      >
        html-in-canvas:{" "}
        <strong style={{ color: supported ? "var(--color-ok)" : "var(--color-warn)" }}>
          {supported ? "有効" : "無効"}
        </strong>
        {!supported && (
          <>
            {" "}— Wrapper 系 22 種は素の HTML になります。T-1〜T-5, T-7 の実施には
            Chrome Canary 149+ で <code>chrome://flags/#canvas-draw-element</code> を
            有効にしてください。<strong>この状態は T-8 の確認そのものです。</strong>
          </>
        )}
      </p>

      <nav style={{ display: "flex", gap: "var(--sp-4)", margin: "var(--sp-6) 0", borderBottom: "1px solid var(--color-border)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none",
              border: 0,
              borderBottom: `2px solid ${tab === t.id ? "var(--color-accent)" : "transparent"}`,
              color: tab === t.id ? "var(--color-accentLit)" : "var(--color-muted)",
              font: "inherit",
              padding: "var(--sp-3) 0",
              cursor: "pointer",
            }}
          >
            {t.title}
            <span style={{ marginLeft: 8, fontSize: ".75rem", color: "var(--color-dim)" }}>{t.tests}</span>
          </button>
        ))}
      </nav>

      {/* タブ切替でアンマウントされるため、前のタブのコンテキストは解放される */}
      {tab === "auto" && <AutoRunner />}
      {tab === "budget" && <ContextBudgetProbe />}
      {tab === "single" && <SingleProbe />}
      {tab === "nesting" && <NestingProbe />}
      {tab === "matrix" && <MatrixProbe />}
    </main>
  );
}

mountRoot(
  document.getElementById("root")!,
  <StrictMode>
    <Lab />
  </StrictMode>,
);
