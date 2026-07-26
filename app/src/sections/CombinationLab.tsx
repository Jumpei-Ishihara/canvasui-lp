import {
  Suspense,
  lazy,
  useEffect,
  useState,
  type CSSProperties,
  type ComponentType,
  type ReactNode,
} from "react";
import { loadEffect } from "@/core/effectRegistry";
import { useHtmlInCanvasSupport } from "@/core/SupportContext";
import { componentMeta } from "@/data/components.generated";
import { COMBO_KIND_LABEL, combos, type ComboKind, type ComboPreset } from "@/data/combos";
import { rgb01, tokens } from "@/styles/tokens";

/**
 * 組み合わせラボ（REQ-2 / design.md §8.2 改訂版）
 *
 * 【重要】切り替えは 2 フレームに分ける（N-5）。
 * 同一フレームで差し替えると React の調整で両方が一時的に存在し、
 * コンテキスト予算を超えうる。
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

const FILL = { width: "100%", height: "100%" } as const;

const Subject = () => (
  <div style={{ padding: "var(--sp-6)" }}>
    <h4 style={{ fontSize: "1.75rem", margin: 0 }}>重ねて、並べて</h4>
    <p style={{ color: "var(--color-muted)", maxWidth: "34ch" }}>
      同じ内容に別々の効果をかけると何が起きるかを確かめます。
    </p>
    <button type="button" style={demoBtn}>押せます</button>
  </div>
);

/* ================================================================== *
 * A. パラメータ融合 — 重ねずに複合表現を作る（REQ-2.1 / 2.2）
 * ================================================================== */
const SLIDERS = [
  { key: "size", label: "レンズ半径", min: 80, max: 260, step: 10, init: 160 },
  { key: "blur", label: "フロスト", min: 0, max: 4, step: 0.1, init: 0.6 },
  { key: "aberration", label: "色収差", min: 0, max: 3, step: 0.1, init: 1.2 },
  { key: "ior", label: "屈折率", min: 1, max: 2, step: 0.01, init: 1.45 },
  { key: "zoom", label: "ズーム", min: 1, max: 3, step: 0.1, init: 1.8 },
  { key: "shine", label: "リムの光沢", min: 0, max: 2, step: 0.1, init: 1.0 },
] as const;

function ParameterFusion() {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(SLIDERS.map((s) => [s.key, s.init])),
  );
  const Glass = getEffect("glass");

  return (
    <div style={twoCol}>
      <div style={stage}>
        <Suspense fallback={<Subject />}>
          <Glass {...values} targets=".zoomable" style={FILL}>
            <div style={{ padding: "var(--sp-6)" }}>
              <div style={microLabel}>PARAMETER FUSION</div>
              <h4 className="zoomable" style={{ fontSize: "1.75rem", margin: "var(--sp-2) 0" }}>
                重ねずに、詰める
              </h4>
              <p style={{ color: "var(--color-muted)", maxWidth: "32ch" }}>
                これは <strong>Glass 1 つだけ</strong>です。
                フロスト・色収差・屈折率・ズームを同時に効かせています。
                <span className="zoomable"> WebGL コンテキストの消費は 1 個。</span>
              </p>
            </div>
          </Glass>
        </Suspense>
      </div>
      <div style={{ display: "grid", gap: "var(--sp-4)", alignContent: "start" }}>
        {SLIDERS.map((s) => (
          <label key={s.key} style={{ display: "grid", gap: 4 }}>
            <span style={{ display: "flex", justifyContent: "space-between", fontSize: ".8125rem" }}>
              <span style={{ color: "var(--color-muted)" }}>{s.label}</span>
              <code style={{ color: "var(--color-accentLit)" }}>
                {s.key} = {values[s.key].toFixed(2)}
              </code>
            </span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={values[s.key]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [s.key]: Number(e.target.value) }))
              }
              style={{ accentColor: tokens.accent }}
            />
          </label>
        ))}
        <p style={{ ...note, marginTop: "var(--sp-2)" }}>
          スライダーを動かしても再マウントは起きません。
          props の更新だけで反映されます。
        </p>
      </div>
    </div>
  );
}

/* ================================================================== *
 * B / C / D — プリセットの実演
 * ================================================================== */
function ComboStage({ preset }: { preset: ComboPreset }) {
  const Outer = getEffect(preset.outer.slug);
  const Inner = getEffect(preset.inner.slug);
  const innerIsObject = componentMeta[preset.inner.slug]?.family === "object";

  if (preset.kind === "juxtapose") {
    return (
      <div style={twoCol}>
        {[preset.outer, preset.inner].map((layer) => {
          const E = getEffect(layer.slug);
          return (
            <div key={layer.slug}>
              <div style={microLabel}>{componentMeta[layer.slug].name}</div>
              <div style={{ ...stage, marginTop: 6 }}>
                <Suspense fallback={<Subject />}>
                  <E {...layer.props} style={FILL}>
                    <Subject />
                  </E>
                </Suspense>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // overlay（Object を内包）と nested-fails（Wrapper を内包）は同じ形で描く。
  // 後者が壊れて見えることこそが提示したい内容。
  return (
    <div style={stage}>
      <Suspense fallback={<Subject />}>
        <Outer {...preset.outer.props} style={FILL}>
          {innerIsObject ? (
            <Inner {...preset.inner.props} style={FILL} />
          ) : (
            <Inner {...preset.inner.props} style={FILL}>
              <Subject />
            </Inner>
          )}
        </Outer>
      </Suspense>
    </div>
  );
}

const KIND_ORDER: ComboKind[] = ["overlay", "juxtapose", "nested-fails"];

function ComboPlayer() {
  const [kind, setKind] = useState<ComboKind>("overlay");
  const list = combos.filter((c) => c.kind === kind);
  const [id, setId] = useState(list[0].id);

  // N-5: 2 フレームに分けて切り替える。
  // 1 フレーム目で null にしてアンマウントを確定させ、2 フレーム目で次を載せる。
  const [shown, setShown] = useState<string | null>(id);
  useEffect(() => {
    setShown(null);
    const raf = requestAnimationFrame(() => setShown(id));
    return () => cancelAnimationFrame(raf);
  }, [id]);

  const preset = combos.find((c) => c.id === shown) ?? null;
  const meta = combos.find((c) => c.id === id)!;

  return (
    <div style={{ display: "grid", gap: "var(--sp-5)" }}>
      <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
        {KIND_ORDER.map((k) => (
          <button
            key={k}
            onClick={() => {
              setKind(k);
              setId(combos.find((c) => c.kind === k)!.id);
            }}
            style={{
              ...pill,
              borderColor: kind === k ? "var(--color-accent)" : "var(--color-border)",
              color: kind === k ? "var(--color-accentLit)" : "var(--color-muted)",
            }}
          >
            {COMBO_KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
        {list.map((c) => (
          <button
            key={c.id}
            onClick={() => setId(c.id)}
            style={{
              ...pill,
              background: id === c.id ? "var(--color-raised)" : "transparent",
              color: id === c.id ? "var(--color-fg)" : "var(--color-muted)",
            }}
          >
            {c.title}
          </button>
        ))}
      </div>

      <p style={{ ...note, margin: 0 }}>
        {meta.intent}{" "}
        <span style={{ color: "var(--color-dim)" }}>（検証 {meta.verifiedBy}）</span>
      </p>

      {kind === "nested-fails" && (
        <p style={warnBox}>
          <strong>これは失敗例です。</strong>
          内側のエフェクトが黒く抜けるのが正しい観察結果で、実装の不具合ではありません。
          html-in-canvas どうしの入れ子は composition しないことが検証 T-2 で確定しています。
        </p>
      )}

      {preset ? <ComboStage preset={preset} /> : <div style={stage} />}
    </div>
  );
}

/* ================================================================== */
export function CombinationLab() {
  const supported = useHtmlInCanvasSupport();

  return (
    <section id="lab" style={{ display: "grid", gap: "var(--sp-7)" }}>
      <div>
        <div style={microLabel}>COMBINATION LAB</div>
        <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", marginTop: "var(--sp-2)" }}>
          組み合わせラボ
        </h2>
        <p style={{ ...note, maxWidth: "60ch", marginTop: "var(--sp-3)" }}>
          25 種を組み合わせたときに何が起きるかを、実機の検証結果にもとづいて示します。
          <strong>
            {" "}Wrapper どうしを重ねることはできません
          </strong>
          — これは推測ではなく実測です。成立するのは「Object 系を Wrapper で包む」形だけでした。
        </p>
      </div>

      {!supported && (
        <p style={warnBox}>
          このブラウザでは Wrapper 系のエフェクトが適用されないため、
          ラボの実演は素の HTML として表示されます。
          <strong> 3D の 3 種は動作します。</strong>
        </p>
      )}

      <div>
        <h3 style={h3}>単体で複合表現を作る</h3>
        <p style={{ ...note, marginBottom: "var(--sp-4)" }}>
          409 個あるオプションを詰めれば、重ねなくても複合的な見た目になります。
          重ねる前にまずここを尽くすのが定石です。
        </p>
        <ParameterFusion />
      </div>

      <div>
        <h3 style={h3}>重ねる・並べる・重ねられない</h3>
        <ComboPlayer />
      </div>
    </section>
  );
}

/* ---- styles ---- */
const microLabel: CSSProperties = {
  color: "var(--color-dim)",
  fontSize: ".75rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
};
const h3: CSSProperties = { fontSize: "1.125rem", marginBottom: "var(--sp-3)" };
const note: CSSProperties = { color: "var(--color-muted)", fontSize: ".9375rem" };
const stage: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  background: "var(--color-surface)",
  height: 380,
};
const twoCol: CSSProperties = {
  display: "grid",
  gap: "var(--sp-5)",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
};
const pill: CSSProperties = {
  background: "transparent",
  border: "1px solid var(--color-border)",
  borderRadius: 999,
  padding: "6px 14px",
  font: "inherit",
  fontSize: ".875rem",
  cursor: "pointer",
  color: "var(--color-muted)",
};
const warnBox: CSSProperties = {
  ...note,
  borderLeft: "3px solid var(--color-warn)",
  background: "var(--color-surface)",
  padding: "var(--sp-3) var(--sp-4)",
  margin: 0,
};
const demoBtn: CSSProperties = {
  background: "var(--color-accent)",
  color: "#fff",
  border: 0,
  borderRadius: 8,
  height: 40,
  padding: "0 var(--sp-4)",
  font: "inherit",
  cursor: "pointer",
};

void rgb01;
