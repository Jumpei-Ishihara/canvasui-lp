import { StrictMode } from "react";
import { mountRoot } from "./mountRoot";
import "./styles/globals.css";
import { RenderBudgetProvider } from "./core/RenderBudget";
import { SupportProvider } from "./core/SupportContext";
import { DebugHud } from "./core/DebugHud";
import { EffectSection } from "./core/EffectSection";
import { SupportBanner } from "./sections/SupportBanner";
import { Hero } from "./sections/Hero";
import { Catalog } from "./sections/Catalog";
import { CombinationLab } from "./sections/CombinationLab";
import { CompatibilityMatrix } from "./sections/CompatibilityMatrix";
import { Constraints, Install, Footer } from "./sections/Static";

/**
 * LP 本体（ui-design.md §7 の骨格）
 *
 * エフェクトを持たないセクション（バナー / 制約 / 導入 / Footer）は意図的なもの。
 * コンテキスト予算に余裕を作り、目も休まる（docs/05 §1）。
 */
function App() {
  return (
    <>
      <SupportBanner />

      <main
        style={{
          maxWidth: "var(--w-default)",
          margin: "0 auto",
          padding: "var(--sp-8) var(--sp-5) var(--sp-9)",
          display: "grid",
          gap: "var(--sp-10)",
        }}
      >
        <Hero />

        {/* [02] 仕組みの解説 — 説明文そのものを Glass で覗かせる */}
        <EffectSection
          id="how-it-works"
          effect="glass"
          stage="card"
          effectProps={{ size: 170, blur: 0.4, shine: 1.0, zoom: 1.6, targets: ".zoomable" }}
          header={
            <div style={{ marginBottom: "var(--sp-3)" }}>
              <div style={labelStyle}>HOW IT WORKS</div>
              <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", marginTop: "var(--sp-2)" }}>
                生きた HTML を描画している
              </h2>
            </div>
          }
        >
          <div style={{ padding: "var(--sp-6)", maxWidth: "56ch" }}>
            <p style={{ color: "var(--color-muted)", marginTop: 0 }}>
              エフェクトは HTML を画像に置き換えているわけではありません。
              <span className="zoomable" style={{ color: "var(--color-fg)" }}>
                {" "}本物の DOM が下に生きたまま存在し
              </span>
              、その上に WebGL の出力レイヤーが重なっています。
            </p>
            <p style={{ color: "var(--color-muted)" }}>
              出力キャンバスは <code>pointer-events: none</code> なので、
              クリック・テキスト選択・フォーム入力はすべて素通りします。
              下のボタンを実際に押してみてください。
            </p>
            <button type="button" style={demoBtn}>
              押せます
            </button>
          </div>
        </EffectSection>

        {/* [03] カタログ */}
        <section id="catalog" style={{ display: "grid", gap: "var(--sp-7)" }}>
          <div>
            <div style={labelStyle}>CATALOG</div>
            <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", marginTop: "var(--sp-2)" }}>
              25 のコンポーネント
            </h2>
          </div>
          <Catalog />
        </section>

        <CombinationLab />
        <CompatibilityMatrix />
        <Constraints />
        <Install />
        <Footer />
      </main>

      <DebugHud />
    </>
  );
}

const labelStyle: React.CSSProperties = {
  color: "var(--color-dim)",
  fontSize: ".75rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
};
const demoBtn: React.CSSProperties = {
  background: "var(--color-accent)",
  color: "#fff",
  border: 0,
  borderRadius: 8,
  height: 44,
  padding: "0 var(--sp-5)",
  font: "inherit",
  cursor: "pointer",
};

mountRoot(
  document.getElementById("root")!,
  <StrictMode>
    <SupportProvider>
      <RenderBudgetProvider>
        <App />
      </RenderBudgetProvider>
    </SupportProvider>
  </StrictMode>,
);
