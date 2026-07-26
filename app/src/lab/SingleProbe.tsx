import { Suspense, lazy, useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { allSlugs, componentMeta } from "@/data/components.generated";
import { loadEffect } from "@/core/effectRegistry";
import { assetUrl } from "@/lib/assetUrl";
import { tokens } from "@/styles/tokens";
import { FpsMeter, box, button, h2, label, note } from "./ui";

/**
 * T-1 — 25 種の単体動作
 * T-8 — 非対応ブラウザでの挙動（この画面をそのまま Safari 等で開く）
 * T-9 — reduced-motion での挙動
 *
 * 一度に 1 種類のみマウントする。25 種を同時に出すとコンテキスト予算を超えるため
 * （そもそもそれを検証するのが T-6）。
 */
type AnyProps = Record<string, unknown> & { children?: ReactNode };
const cache = new Map<string, ComponentType<AnyProps>>();
function getEffect(slug: string): ComponentType<AnyProps> {
  const hit = cache.get(slug);
  if (hit) return hit;
  const C = lazy(() => loadEffect(slug)) as unknown as ComponentType<AnyProps>;
  cache.set(slug, C);
  return C;
}

const STORAGE_KEY = "lab.t1.results";
type Verdict = "ok" | "ng";

const Subject = () => (
  <div style={{ padding: 32 }}>
    <h3 style={{ fontSize: "2rem", margin: 0, color: tokens.fg }}>Canvas UI</h3>
    <p style={{ color: tokens.muted, maxWidth: 420 }}>
      この文章が読め、下のボタンが押せて、テキストが選択できることを確認します。
      エフェクトが適用されても DOM は生きているはずです。
    </p>
    <button type="button" style={{ font: "inherit", padding: "8px 16px" }}>
      クリック確認
    </button>
  </div>
);

export function SingleProbe() {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, Verdict>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      return {};
    }
  });

  const slug = allSlugs[index];
  const meta = componentMeta[slug];

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }, [results]);

  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const mark = (v: Verdict) => {
    setResults((r) => ({ ...r, [slug]: v }));
    if (index < allSlugs.length - 1) setIndex(index + 1);
  };

  const Effect = getEffect(slug);
  const isObject = meta.family === "object";
  const done = Object.keys(results).length;
  const ng = Object.entries(results).filter(([, v]) => v === "ng").map(([k]) => k);

  return (
    <section style={box}>
      <h2 style={h2}>T-1 — 25 種の単体動作</h2>
      <p style={note}>
        1 種ずつ確認します。判定は sessionStorage に保存されます。
        {reducedMotion && (
          <strong style={{ color: "var(--color-warn)" }}>
            {" "}reduced-motion 有効。これは T-9 の確認になります。
          </strong>
        )}
      </p>

      <div style={{ display: "flex", gap: "var(--sp-4)", alignItems: "flex-end", margin: "var(--sp-5) 0", flexWrap: "wrap" }}>
        <div>
          <div style={label}>
            {index + 1} / {allSlugs.length}
          </div>
          <div style={{ font: "1.5rem/1.2 var(--font-mono)" }}>{meta.name}</div>
          <div style={{ fontSize: ".75rem", color: "var(--color-dim)" }}>
            {meta.family} · {meta.interaction} · {meta.optionCount} options
          </div>
        </div>
        <button style={{ ...button, background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-fg)" }}
          onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          前へ
        </button>
        <button style={{ ...button, background: "var(--color-ok)", color: "#04140c" }} onClick={() => mark("ok")}>
          OK
        </button>
        <button style={{ ...button, background: "var(--color-danger)" }} onClick={() => mark("ng")}>
          NG
        </button>
        <button style={{ ...button, background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-fg)" }}
          onClick={() => setIndex((i) => Math.min(allSlugs.length - 1, i + 1))}
          disabled={index === allSlugs.length - 1}>
          次へ
        </button>
        <FpsMeter />
      </div>

      {/* key で必ず作り直し、前のコンポーネントを確実にアンマウントする */}
      <div style={{ position: "relative", overflow: "hidden", border: "1px solid var(--color-border)", borderRadius: 12, background: "var(--color-surface)", height: 420 }}>
        <Suspense key={slug} fallback={<Subject />}>
          {isObject ? (
            <Effect src={assetUrl("/svg/test-shape.svg")} background="" style={{ width: "100%", height: "100%" }} />
          ) : (
            <Effect style={{ width: "100%", height: "100%" }}>{<Subject />}</Effect>
          )}
        </Suspense>
      </div>

      {isObject && (
        <p style={note}>
          Object 系は検証用のテスト素材（<code>/svg/test-shape.svg</code>）を表示しています。
          <strong>本番素材の確定後に再確認してください。</strong>
        </p>
      )}

      <div style={{ marginTop: "var(--sp-5)" }}>
        <div style={label}>進捗 {done} / {allSlugs.length}{ng.length > 0 && ` — NG: ${ng.join(", ")}`}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
          {allSlugs.map((s, i) => (
            <button
              key={s}
              onClick={() => setIndex(i)}
              title={componentMeta[s].name}
              style={{
                width: 26, height: 26, borderRadius: 4, cursor: "pointer", fontSize: 10,
                border: i === index ? "2px solid var(--color-accentLit)" : "1px solid var(--color-border)",
                background:
                  results[s] === "ok" ? "var(--color-ok)"
                  : results[s] === "ng" ? "var(--color-danger)"
                  : "var(--color-raised)",
                color: results[s] ? "#0b0b0d" : "var(--color-muted)",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
