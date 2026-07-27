import type { CSSProperties } from "react";
import { useHtmlInCanvasSupport } from "@/core/SupportContext";
import { CodeBlock } from "./CodeBlock";
import { allSlugs, componentMeta } from "@/data/components.generated";
import { DEFAULT_BUDGET_CONFIG } from "@/core/RenderBudget";

/** [06] 制約と限界（REQ-3.4 / 3.5）— エフェクトを持たない。予算に余裕を作るため */
export function Constraints() {
  const supported = useHtmlInCanvasSupport();
  const objects = allSlugs.filter((s) => componentMeta[s].family === "object");
  const touchLimited = allSlugs.filter((s) => componentMeta[s].touchLimited);
  const totalOptions = allSlugs.reduce((s, k) => s + componentMeta[k].optionCount, 0);

  return (
    <section style={{ display: "grid", gap: "var(--sp-6)" }}>
      <div>
        <div style={label}>CONSTRAINTS</div>
        <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", marginTop: "var(--sp-2)" }}>
          制約と限界
        </h2>
      </div>

      <div style={grid2}>
        <article style={card}>
          <h3 style={h3}>WebGL コンテキスト予算</h3>
          <p style={body}>
            1 コンポーネント = 1 WebGL コンテキスト。ブラウザの同時保持上限は概ね{" "}
            <strong>16</strong> で、超えると古いものから破棄されます。
            25 種すべてを常時表示することは<strong>技術的に不可能</strong>です。
          </p>
          <p style={body}>
            さらに全 25 種に <code>webglcontextlost</code> ハンドラが無いため、
            一度失われたコンテキストは復帰しません。
            このサイトは画面から離れたセクションを<strong>アンマウントして解放</strong>し、
            同時数を常に上限以下に保っています。
          </p>
          <dl style={statGrid}>
            <div>
              <dt style={label}>実測上限</dt>
              <dd style={stat}>16</dd>
            </div>
            <div>
              <dt style={label}>同時マウント上限</dt>
              <dd style={{ ...stat, color: "var(--color-ok)" }}>
                {DEFAULT_BUDGET_CONFIG.capacity}
              </dd>
            </div>
            <div>
              <dt style={label}>モバイル</dt>
              <dd style={stat}>{DEFAULT_BUDGET_CONFIG.capacityMobile}</dd>
            </div>
          </dl>
        </article>

        <article style={card}>
          <h3 style={h3}>ブラウザ対応</h3>
          <p style={body}>
            25 種のうち <strong>22 種</strong>は Chrome の実験的 API
            「html-in-canvas」に依存します（Origin Trial: Chrome 148〜150）。
            Firefox と Safari は実装を表明していません。
          </p>
          <p style={body}>
            残る <strong>{objects.length} 種</strong>（
            {objects.map((s) => componentMeta[s].name).join(" / ")}）は three.js
            のみに依存するため、<strong>すべてのモダンブラウザで動作</strong>します。
          </p>
          <p style={{ ...body, color: supported ? "var(--color-ok)" : "var(--color-warn)" }}>
            現在のブラウザ: html-in-canvas は
            <strong>{supported ? "有効" : "無効"}</strong>
            {!supported && "（22 種はエフェクトなしで表示中）"}
          </p>
        </article>
      </div>

      <article style={card}>
        <h3 style={h3}>タッチ環境での制約</h3>
        <p style={body}>
          25 種のうち <strong>{touchLimited.length} 種</strong>はポインタの動きに追従します。
          タッチにはホバーが無く、指でなぞるとブラウザのスクロールが優先されるため、
          スマートフォンでは<strong>本来の見え方になりません</strong>。
        </p>
        <p style={body}>
          該当するのは主にレンズ系と撹乱場系です。
          <strong>アンビエント系・スクロール駆動型・3D の 3 種は影響を受けません</strong>
          （ポインタに依存しないか、タッチ操作を自前で受け取っているため）。
        </p>
        <p style={{ ...body, color: "var(--color-dim)", marginBottom: 0 }}>
          この判定はライブラリのソースを走査して自動生成しています。
          対象: {touchLimited.map((s) => componentMeta[s].name).join(" / ")}
        </p>
      </article>

      <div style={grid3}>
        {[
          ["25", "コンポーネント"],
          [String(totalOptions), "オプション"],
          ["6", "フレームワーク"],
        ].map(([n, l]) => (
          <div key={l} style={{ ...card, textAlign: "center" }}>
            <div style={{ font: "clamp(2rem,5vw,3rem)/1 var(--font-mono)" }}>{n}</div>
            <div style={{ ...label, marginTop: "var(--sp-2)" }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** [07] 導入方法（REQ-8） */
export function Install() {
  return (
    <section style={{ display: "grid", gap: "var(--sp-5)" }}>
      <div>
        <div style={label}>INSTALL</div>
        <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", marginTop: "var(--sp-2)" }}>
          導入方法
        </h2>
      </div>
      <div style={grid2}>
        <article style={card}>
          <h3 style={h3}>CLI</h3>
          <p style={body}>shadcn レジストリ経由でソースが直接コピーされます。</p>
          <CodeBlock label="CLI" code="npx shadcn@latest add @canvas-ui/glass-react" />
          <p style={body}>
            <code>components.json</code> にレジストリを登録します。
          </p>
          <CodeBlock
            label="components.json"
            code={'{\n  "registries": {\n    "@canvas-ui": "https://canvasui.dev/r/{name}.json"\n  }\n}'}
          />
        </article>
        <article style={card}>
          <h3 style={h3}>MCP</h3>
          <p style={body}>
            AI アシスタントからレジストリの一覧取得・追加ができます。
          </p>
          <CodeBlock label="MCP" code="npx shadcn@latest mcp init --client claude" />
          <h3 style={{ ...h3, marginTop: "var(--sp-5)" }}>要件</h3>
          <ul style={{ ...body, paddingLeft: "1.2em" }}>
            <li>React 19 / Solid 1.9 / Preact 10 / Vue 3.5 / Svelte 5</li>
            <li>TypeScript 推奨（すべて型付きソースで配布）</li>
            <li>3D の 3 種のみ <code>three</code> が必要</li>
          </ul>
        </article>
      </div>
      <p style={{ ...body, color: "var(--color-dim)" }}>
        ライセンス: MIT + Commons Clause — 個人・商用ともに無料で利用できます。
      </p>
    </section>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        paddingTop: "var(--sp-6)",
        color: "var(--color-muted)",
        fontSize: ".875rem",
        display: "flex",
        gap: "var(--sp-5)",
        flexWrap: "wrap",
      }}
    >
      <a href="https://canvasui.dev" style={link}>canvasui.dev</a>
      <a href="https://github.com/DavidHDev/canvas-ui" style={link}>GitHub</a>
      <a href="https://canvasui.dev/docs" style={link}>ドキュメント</a>
      <span style={{ marginLeft: "auto", color: "var(--color-dim)" }}>
        MIT + Commons Clause
      </span>
    </footer>
  );
}

const label: CSSProperties = {
  color: "var(--color-dim)", fontSize: ".75rem",
  letterSpacing: ".08em", textTransform: "uppercase",
};
const h3: CSSProperties = { fontSize: "1.125rem", marginBottom: "var(--sp-3)" };
const body: CSSProperties = { color: "var(--color-muted)", fontSize: ".9375rem", margin: "0 0 var(--sp-3)" };
const card: CSSProperties = {
  background: "var(--color-surface)", border: "1px solid var(--color-border)",
  borderRadius: 12, padding: "var(--sp-6)",
};
const grid2: CSSProperties = {
  display: "grid", gap: "var(--sp-5)",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
};
const grid3: CSSProperties = {
  display: "grid", gap: "var(--sp-5)",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
};
const statGrid: CSSProperties = {
  display: "flex", gap: "var(--sp-6)", margin: "var(--sp-4) 0 0", flexWrap: "wrap",
};
const stat: CSSProperties = { font: "1.75rem/1.2 var(--font-mono)", margin: 0 };
const link: CSSProperties = { color: "var(--color-accentLit)" };
