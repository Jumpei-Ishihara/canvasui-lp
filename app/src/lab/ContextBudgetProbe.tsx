import { useState } from "react";

/**
 * T-6 — 同時マウント上限の実測（test-plan.md §4.4 / REQ-10.3）
 *
 * WebGL2 コンテキストを 1 つずつ生成し、
 *  (a) 生成に失敗する、または
 *  (b) 既存のコンテキストが失われる
 * まで増やして、その個数を実測上限とする。
 *
 * 【重要】実測値をそのまま capacity にしない。
 * GPU・ブラウザ・同居する他の canvas により変動するため、50〜60% を採用する
 * （module-spec.md §9.1）。
 */
const HARD_STOP = 64;

interface Result {
  created: number;
  reason: string;
  lostAt: number | null;
}

export function ContextBudgetProbe() {
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setResult(null);

    const contexts: WebGL2RenderingContext[] = [];
    const canvases: HTMLCanvasElement[] = [];
    let reason = `上限に達しませんでした（${HARD_STOP} 個で打ち切り）`;
    let lostAt: number | null = null;

    for (let i = 0; i < HARD_STOP; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const gl = canvas.getContext("webgl2");
      if (!gl) {
        reason = `${i + 1} 個目の生成に失敗しました`;
        break;
      }
      // 実際に描画資源を確保させる。取得だけでは評価が甘くなるため
      gl.createTexture();
      gl.createBuffer();
      canvases.push(canvas);
      contexts.push(gl);

      // 既存のコンテキストが失われていないか毎回確認する
      const lostIndex = contexts.findIndex((c) => c.isContextLost());
      if (lostIndex >= 0) {
        lostAt = lostIndex + 1;
        reason = `${i + 1} 個目の生成時に、${lostAt} 個目のコンテキストが失われました`;
        break;
      }
    }

    const alive = contexts.filter((c) => !c.isContextLost()).length;

    // 後始末。明示的に破棄しないと以降の検証に影響する
    for (const gl of contexts) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    canvases.length = 0;

    setResult({ created: alive, reason, lostAt });
    setRunning(false);
  };

  const recommended = result ? Math.max(1, Math.floor(result.created * 0.55)) : null;

  return (
    <section style={box}>
      <h2 style={h2}>T-6 — 同時マウント上限の実測</h2>
      <p style={note}>
        WebGL2 コンテキストを逐次生成し、失敗またはロストが起きるまでの個数を測ります。
        この結果で <code>BudgetConfig.capacity</code> を確定します（未決 D-1）。
      </p>
      <button style={button} onClick={run} disabled={running}>
        {running ? "測定中…" : "測定する"}
      </button>

      {result && (
        <dl style={dl}>
          <dt style={dt}>同時に生存できた数</dt>
          <dd style={ddBig}>{result.created}</dd>
          <dt style={dt}>停止理由</dt>
          <dd style={dd}>{result.reason}</dd>
          <dt style={dt}>推奨 capacity（実測の 55%）</dt>
          <dd style={{ ...ddBig, color: "var(--color-ok)" }}>{recommended}</dd>
        </dl>
      )}

      {result && (
        <p style={note}>
          この値を <code>src/core/budget/types.ts</code> の
          <code> DEFAULT_SELECT_CONFIG.capacity </code>
          に反映し、<code>docs/03-combination-research.md</code> §7 に記録してください。
        </p>
      )}
    </section>
  );
}

const box: React.CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: "var(--sp-6)",
  background: "var(--color-surface)",
  marginBottom: "var(--sp-6)",
};
const h2: React.CSSProperties = { fontSize: "1.25rem", marginBottom: "var(--sp-3)" };
const note: React.CSSProperties = { color: "var(--color-muted)", fontSize: ".875rem" };
const button: React.CSSProperties = {
  background: "var(--color-accent)",
  color: "#fff",
  border: 0,
  borderRadius: 8,
  height: 40,
  padding: "0 var(--sp-5)",
  cursor: "pointer",
  font: "inherit",
};
const dl: React.CSSProperties = { marginTop: "var(--sp-5)", display: "grid", gap: "var(--sp-2)" };
const dt: React.CSSProperties = {
  color: "var(--color-dim)",
  fontSize: ".75rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
};
const dd: React.CSSProperties = { margin: 0, fontFamily: "var(--font-mono)" };
const ddBig: React.CSSProperties = { ...dd, fontSize: "1.75rem", lineHeight: 1.2 };
