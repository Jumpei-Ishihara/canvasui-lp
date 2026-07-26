import { EffectSection } from "@/core/EffectSection";
import { assets, isAssetPending } from "@/data/assets";
import { tokens } from "@/styles/tokens";

/**
 * [00] Hero（ui-design.md §7）
 *
 * Object 系を置く理由: three.js のみに依存するため全ブラウザで動く。
 * 非対応環境の訪問者（想定では多数派）にも、最初に動くものを見せられる。
 */
export function Hero() {
  const art = assets.glassObject;

  return (
    <section
      style={{
        display: "grid",
        gap: "var(--sp-7)",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        alignItems: "center",
      }}
    >
      <EffectSection
        id="hero-object"
        effect="glass-object"
        stage="square"
        effectProps={{
          src: art.src,
          tint: "",
          highlight: tokens.accent,
          floatIntensity: 1,
          autoRotate: true,
          autoRotateSpeed: 0.6,
        }}
      >
        <div style={{ display: "grid", placeItems: "center", height: "100%", textAlign: "center" }}>
          <p style={{ color: "var(--color-dim)", fontSize: ".8125rem", padding: "var(--sp-5)" }}>
            {isAssetPending(art)
              ? `${art.label} を待っています（素材確定後に 3D 表示になります）`
              : art.label}
          </p>
        </div>
      </EffectSection>

      <div>
        <div
          style={{
            color: "var(--color-dim)",
            fontSize: ".75rem",
            letterSpacing: ".08em",
            textTransform: "uppercase",
          }}
        >
          html-in-canvas &amp; WebGL
        </div>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: "var(--sp-4) 0",
          }}
        >
          Canvas UI の
          <br />
          全 25 機能を
          <br />
          ためす
        </h1>
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: "1.0625rem",
            maxWidth: "40ch",
            marginBottom: "var(--sp-6)",
          }}
        >
          生きた HTML を WebGL で加工するコンポーネント群。
          全機能の紹介と、組み合わせたときに何が起きるかの検証をまとめました。
        </p>
        <a
          href="#catalog"
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 44,
            padding: "0 var(--sp-6)",
            borderRadius: 8,
            background: "var(--color-accent)",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          機能を見る
        </a>
      </div>
    </section>
  );
}
