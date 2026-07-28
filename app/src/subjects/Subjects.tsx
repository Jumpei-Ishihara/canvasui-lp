import type { CSSProperties, ReactNode } from "react";
import type { SubjectKind } from "@/data/catalog";
import { assets, isAssetPending } from "@/data/assets";

/**
 * 被写体テンプレート 5 種（ui-design.md §8）
 *
 * 25 セクション分のコンテンツを個別に作らず、この 5 種を使い回す。
 * どのテンプレートも、エフェクトの有無にかかわらず内容が読めること（REQ-6.3 / D-4）。
 */

const pad: CSSProperties = { padding: "var(--sp-6)", height: "100%", overflow: "auto" };

/* ------------------------------------------------------------------ *
 * dense-document — レンズ系向け
 * あえて小さく細かく作る。「覗き込んで読む」動機を作るため。
 * ------------------------------------------------------------------ */
function DenseDocument({ mono = false }: { mono?: boolean }) {
  const rows = [
    ["描画方式", "html-in-canvas", "drawElementImage"],
    ["出力", "WebGL2", "pointer-events: none"],
    ["対応", "Chrome 148–150", "Origin Trial"],
    ["依存", "なし", "Wrapper 系 22 種"],
    ["解放", "destroy()", "texture / program / buffer"],
  ];
  return (
    <div style={{ ...pad, fontFamily: mono ? "var(--font-mono)" : undefined }}>
      <div style={label}>SPECIFICATION SHEET / 仕様書</div>
      <h3 className="zoomable" style={{ fontSize: "1.5rem", margin: "var(--sp-2) 0 var(--sp-4)" }}>
        レンズで覗いて読む
      </h3>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: ".75rem" }}>
        <tbody>
          {rows.map(([k, v, note]) => (
            <tr key={k} style={{ borderTop: "1px solid var(--color-border)" }}>
              <th style={{ ...cell, color: "var(--color-dim)", textAlign: "left", width: "22%" }}>{k}</th>
              <td className="zoomable" style={{ ...cell, fontFamily: "var(--font-mono)" }}>{v}</td>
              <td style={{ ...cell, color: "var(--color-muted)" }}>{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: ".75rem", color: "var(--color-muted)", marginTop: "var(--sp-4)", lineHeight: 1.7 }}>
        ※ 細かい注記はレンズを重ねたときに初めて読めるようになる。
        エフェクトを外しても内容は同じで、拡大なしでも判読できる大きさを保っている。
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * bold-heading — 破壊系向け
 * 細い文字は歪み系・ディザ系で消えるため、太く短い要素のみ（docs/04 §3.3）。
 * ------------------------------------------------------------------ */
function BoldHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ ...pad, display: "grid", alignContent: "center", gap: "var(--sp-4)" }}>
      <div style={label}>{sub}</div>
      <h3 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
        {title}
      </h3>
      <p style={{ fontSize: "1.125rem", color: "var(--color-muted)", maxWidth: "34ch" }}>
        崩れても読めることが要件。エフェクトは装飾であって、内容の器ではない。
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * color-artwork — 流体系・ジオメトリ系向け
 * 屈折・分割は色差がないと見えない。大きな色面を必ず置く（ui-design.md §8.1）。
 * ------------------------------------------------------------------ */
function ColorArtwork() {
  // キービジュアル（asset-1.svg）を使う。
  // 3D では使えないが、<img> ならブラウザが完全に描画するため
  // Wrapper 系 22 種の被写体として最も情報量が多い（assets.ts のコメント参照）。
  const art = assets.colorArtwork;
  const swatches = [
    "var(--color-accent)",
    "var(--color-ok)",
    "var(--color-warn)",
    "var(--color-danger)",
  ];
  return (
    <div style={{ ...pad, display: "grid", gridTemplateRows: "auto 1fr", gap: "var(--sp-4)" }}>
      <div>
        <div style={label}>COLOR FIELD</div>
        <h3 style={{ fontSize: "1.5rem", marginTop: "var(--sp-2)" }}>屈折と分割を見る</h3>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)", minHeight: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {swatches.map((c) => (
            <div key={c} style={{ background: c, borderRadius: 8 }} />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            placeItems: "center",
            borderRadius: 8,
            background:
              "linear-gradient(135deg, var(--color-accent), var(--color-danger) 60%, var(--color-warn))",
          }}
        >
          {isAssetPending(art) ? (
            <span style={{ fontSize: ".75rem", color: "#0b0b0d", fontFamily: "var(--font-mono)" }}>
              {art.label}（素材待ち）
            </span>
          ) : (
            <img
              src={art.src}
              alt={art.label}
              /* loading="lazy" は試したが取りやめた。
                 ビューポート内に入っても読み込まれず（complete=false のまま）、
                 8 枚すべてが未取得になる事象を実機で確認したため。
                 寸法を予約しても解消しなかった。原因を確定できていない以上、
                 確実に表示される eager のままにする。

                 キービジュアルは転送 442KB あり初期ロードに乗る。
                 LCP は 140ms（PT-02 基準 2,500ms）と余裕があるため許容するが、
                 軽量化するならラスタライズした WebP を用意するのが確実
                 （SVG の 95% は埋め込み PNG なので、WebP 化で大幅に減らせる）。 */
              decoding="async"
              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * ui-mock — パーティクル系向け
 * ParticleReveal は背景色との差で UI 画素を判定するため高コントラストにする。
 * ------------------------------------------------------------------ */
function UiMock() {
  return (
    <div style={{ ...pad, display: "grid", gap: "var(--sp-4)", alignContent: "start" }}>
      <div style={label}>UI MOCK</div>
      <div style={{ display: "grid", gap: "var(--sp-3)", maxWidth: 420 }}>
        <div style={{ display: "flex", gap: "var(--sp-3)" }}>
          <button type="button" style={primaryBtn}>はじめる</button>
          <button type="button" style={ghostBtn}>ドキュメント</button>
        </div>
        <input
          aria-label="メールアドレス"
          placeholder="you@example.com"
          style={{
            height: 40, borderRadius: 8, padding: "0 var(--sp-3)",
            background: "var(--color-raised)", color: "var(--color-fg)",
            border: "1px solid var(--color-border)", font: "inherit",
          }}
        />
        {[
          ["25", "コンポーネント"],
          ["409", "オプション"],
          ["6", "フレームワーク"],
        ].map(([n, l]) => (
          <div key={l} style={statRow}>
            <span style={{ font: "1.5rem/1 var(--font-mono)" }}>{n}</span>
            <span style={{ color: "var(--color-muted)", fontSize: ".875rem" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * object-stage — Object 系向け
 * エフェクト自体が自己完結するため、children は説明のみ。
 * ------------------------------------------------------------------ */
function ObjectStage({ assetLabel, pending }: { assetLabel: string; pending: boolean }) {
  return (
    <div style={{ ...pad, display: "grid", placeItems: "center", textAlign: "center" }}>
      <div>
        <div style={label}>3D OBJECT</div>
        <p style={{ color: "var(--color-muted)", fontSize: ".875rem", marginTop: "var(--sp-3)" }}>
          {pending ? `${assetLabel} を待っています` : assetLabel}
        </p>
        <p style={{ color: "var(--color-dim)", fontSize: ".75rem" }}>
          three.js のみに依存するため、全ブラウザで動作します
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const BOLD_COPY: Record<string, { title: string; sub: string }> = {
  vhs: { title: "テープの記憶", sub: "ANALOG PLAYBACK" },
  glitch: { title: "信号の断絶", sub: "BROADCAST GLITCH" },
  bend: { title: "面を折る", sub: "SCROLL FOLD" },
  peel: { title: "めくる", sub: "PEEL" },
};

/** slug と被写体種別から、そのセクションの中身を返す */
export function renderSubject(kind: SubjectKind, slug: string): ReactNode {
  switch (kind) {
    case "dense-document":
      return <DenseDocument mono={slug === "asciify"} />;
    case "bold-heading": {
      const c = BOLD_COPY[slug] ?? { title: "崩して見せる", sub: "EFFECT" };
      return <BoldHeading title={c.title} sub={c.sub} />;
    }
    case "color-artwork":
      return <ColorArtwork />;
    case "ui-mock":
      return <UiMock />;
    case "object-stage": {
      const a =
        slug === "glass-object" ? assets.glassObject
        : slug === "particle-object" ? assets.particleObject
        : assets.ditheredObject;
      return <ObjectStage assetLabel={a.label} pending={isAssetPending(a)} />;
    }
  }
}

const label: CSSProperties = {
  color: "var(--color-dim)",
  fontSize: ".75rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
};
const cell: CSSProperties = { padding: "6px 8px", verticalAlign: "top" };
const primaryBtn: CSSProperties = {
  background: "var(--color-accent)", color: "#fff", border: 0, borderRadius: 8,
  height: 44, padding: "0 var(--sp-5)", font: "inherit", cursor: "pointer",
};
const ghostBtn: CSSProperties = {
  background: "transparent", color: "var(--color-fg)",
  border: "1px solid var(--color-border)", borderRadius: 8,
  height: 44, padding: "0 var(--sp-5)", font: "inherit", cursor: "pointer",
};
const statRow: CSSProperties = {
  display: "flex", alignItems: "baseline", gap: "var(--sp-3)",
  padding: "var(--sp-3)", borderRadius: 8, background: "var(--color-raised)",
};
