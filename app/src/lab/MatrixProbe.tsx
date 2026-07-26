import { Suspense, lazy, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { allSlugs, componentMeta } from "@/data/components.generated";
import { loadEffect } from "@/core/effectRegistry";
import { rgb01, tokens } from "@/styles/tokens";
import { box, button, h2, label, note, select as selectStyle } from "./ui";

type AnyProps = Record<string, unknown> & { children?: ReactNode };
const cache = new Map<string, ComponentType<AnyProps>>();
function getEffect(slug: string): ComponentType<AnyProps> {
  const hit = cache.get(slug);
  if (hit) return hit;
  const C = lazy(() => loadEffect(slug)) as unknown as ComponentType<AnyProps>;
  cache.set(slug, C);
  return C;
}

/** "auto" を受け付けるオプションを持つコンポーネント（docs/04 §3.1） */
const AUTO_OPTION: Record<string, string> = {
  asciify: "background",
  cloth: "backing",
  clouds: "color",
  "hex-float": "gapColor",
  peel: "shineColor",
};

const Subject = () => (
  <div style={{ padding: 24 }}>
    <h3 style={{ fontSize: "1.75rem", margin: 0, color: tokens.fg }}>比較用の被写体</h3>
    <p style={{ color: tokens.muted }}>背景サンプリングの差を確認します。</p>
  </div>
);

/** T-5 — "auto" 指定と RGB 明示の比較 */
function AutoVsExplicit() {
  const slugs = Object.keys(AUTO_OPTION);
  // ?t5=hex-float のように URL で指定できる。常時発動する種を選ぶと差が見やすい
  const [slug, setSlug] = useState(() => {
    const q = new URLSearchParams(window.location.search).get("t5");
    return q && slugs.includes(q) ? q : slugs[0];
  });
  const prop = AUTO_OPTION[slug];
  const Effect = getEffect(slug);

  return (
    <section style={box}>
      <h2 style={h2}>T-5 — "auto" 背景サンプリングの挙動</h2>
      <p style={note}>
        左が <code>{prop}: "auto"</code>、右が RGB 明示。
        入れ子や特殊な背景で <code>"auto"</code> が破綻しないかを見ます。
      </p>
      <div style={{ margin: "var(--sp-4) 0" }}>
        <div style={label}>コンポーネント</div>
        <select style={selectStyle} value={slug} onChange={(e) => setSlug(e.target.value)}>
          {slugs.map((s) => (
            <option key={s} value={s}>
              {componentMeta[s].name} — {AUTO_OPTION[s]}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)" }}>
        {(["auto", "explicit"] as const).map((mode) => (
          <div key={mode}>
            <div style={label}>{mode === "auto" ? '"auto"' : "RGB 明示"}</div>
            <div style={stage}>
              <Suspense fallback={<Subject />}>
                <Effect {...{ [prop]: mode === "auto" ? "auto" : rgb01(tokens.bg) }} style={{ width: "100%", height: "100%" }}>
                  <Subject />
                </Effect>
              </Suspense>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** T-7 — マウント／アンマウントの往復 */
function MountCycle() {
  const [slug, setSlug] = useState("glass");
  const [mounted, setMounted] = useState(true);
  const [cycles, setCycles] = useState(0);
  const [auto, setAuto] = useState(false);
  const [failures, setFailures] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!auto) {
      if (timer.current) window.clearInterval(timer.current);
      return;
    }
    timer.current = window.setInterval(() => {
      setMounted((m) => {
        if (m) setCycles((c) => c + 1);
        return !m;
      });
    }, 500);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [auto]);

  // 復帰確認: マウント後に canvas が生成されているか
  useEffect(() => {
    if (!mounted) return;
    const t = window.setTimeout(() => {
      const el = document.querySelector("[data-cycle-stage] canvas");
      if (!el) setFailures((f) => f + 1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [mounted, cycles]);

  const Effect = getEffect(slug);
  const wrappers = allSlugs.filter((s) => componentMeta[s].family === "wrapper");

  return (
    <section style={box}>
      <h2 style={h2}>T-7 — マウント／アンマウントの往復</h2>
      <p style={note}>
        50 回以上往復させ、毎回描画が復帰することを確認します。
        コンテキストが解放されずに蓄積すると、途中から復帰しなくなります。
      </p>

      <div style={{ display: "flex", gap: "var(--sp-4)", alignItems: "flex-end", margin: "var(--sp-4) 0", flexWrap: "wrap" }}>
        <div>
          <div style={label}>コンポーネント</div>
          <select style={selectStyle} value={slug} onChange={(e) => setSlug(e.target.value)}>
            {wrappers.map((s) => (
              <option key={s} value={s}>
                {componentMeta[s].name}
              </option>
            ))}
          </select>
        </div>
        <button style={button} onClick={() => setAuto((a) => !a)}>
          {auto ? "停止" : "自動往復を開始"}
        </button>
        <button style={{ ...button, background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-fg)" }}
          onClick={() => { setCycles(0); setFailures(0); }}>
          リセット
        </button>
        <div>
          <div style={label}>往復回数</div>
          <div style={{ font: "1.5rem/1.2 var(--font-mono)" }}>{cycles}</div>
        </div>
        <div>
          <div style={label}>復帰失敗</div>
          <div style={{ font: "1.5rem/1.2 var(--font-mono)", color: failures ? "var(--color-danger)" : "var(--color-ok)" }}>
            {failures}
          </div>
        </div>
      </div>

      <div data-cycle-stage style={{ ...stage, height: 320 }}>
        {mounted ? (
          <Suspense fallback={<Subject />}>
            <Effect style={{ width: "100%", height: "100%" }}>
              <Subject />
            </Effect>
          </Suspense>
        ) : (
          <Subject />
        )}
      </div>
    </section>
  );
}

export function MatrixProbe() {
  return (
    <>
      <AutoVsExplicit />
      <MountCycle />
    </>
  );
}

const stage: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  background: "var(--color-surface)",
  height: 260,
};
