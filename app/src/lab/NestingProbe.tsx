import { Suspense, lazy, useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { allSlugs, componentMeta } from "@/data/components.generated";
import { loadEffect } from "@/core/effectRegistry";
import { assetUrl } from "@/lib/assetUrl";
import { tokens } from "@/styles/tokens";
import { FpsMeter, box, h2, note, label, select as selectStyle } from "./ui";

/**
 * T-2 / T-3 / T-4 — 入れ子の成否とコスト（test-plan.md §4.4）
 *
 * 構造は「Wrapper を depth 段重ね、その最内に被写体を置く」。
 *   最内 = 通常の HTML          → T-2（Wrapper どうしの入れ子）
 *   最内 = Object 系（three.js）→ T-3（Object を Wrapper に内包できるか）
 *   depth を 1→2→3 と変えて fps → T-4
 *
 * 【重要】各段に style で寸法を渡す。
 * html-in-canvas が有効なとき source canvas は position:absolute になり、
 * ラッパーのルート div から in-flow の子が消えて高さ 0 に潰れるため。
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

/**
 * T-3 用のテスト素材。
 * 本番素材は調達中のため、検証専用の単純な図形を使う。
 * ?coreSrc= で差し替えられる。
 */
const TEST_ASSET = assetUrl("/svg/test-shape.svg");
const wrappers = allSlugs.filter((s) => componentMeta[s].family === "wrapper");
const objects = allSlugs.filter((s) => componentMeta[s].family === "object");

const Subject = () => (
  <div style={{ padding: 32 }}>
    <h3 style={{ fontSize: "2rem", margin: 0, color: tokens.fg }}>入れ子検証</h3>
    <p style={{ color: tokens.muted, maxWidth: 420 }}>
      この文字が読め、ボタンが押せて、テキストが選択できれば下層の DOM は生きています。
    </p>
    <button type="button" style={{ font: "inherit", padding: "8px 16px" }}>
      クリック確認
    </button>
  </div>
);

/**
 * 構成は URL クエリでも指定できる。
 *   ?tab=nesting&depth=1&core=glass-object&outer=ripple
 * 検証条件を URL で固定できるので、再現・共有・自動操作がしやすい。
 */
function q(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(name) ?? fallback;
}

export function NestingProbe() {
  const [depth, setDepth] = useState(() => Number(q("depth", "2")));
  const [outer, setOuter] = useState(() => q("outer", "vhs"));
  const [middle, setMiddle] = useState(() => q("middle", "glass"));
  const [third, setThird] = useState(() => q("third", "ripple"));
  const [core, setCore] = useState<string>(() => q("core", "none"));
  const coreSrc = q("coreSrc", TEST_ASSET);
  const [nonce, setNonce] = useState(0);

  // 構成が変わったら必ず作り直す（前段のコンテキストを確実に解放する）
  useEffect(() => setNonce((n) => n + 1), [depth, outer, middle, third, core]);

  const tree = useMemo(() => {
    const key = `${depth}|${outer}|${middle}|${third}|${core}|${nonce}`;

    // 最内の被写体
    let node: ReactNode;
    if (core !== "none") {
      const Obj = getEffect(core);
      node = <Obj src={coreSrc} background="" style={FILL} />;
    } else {
      node = <Subject />;
    }

    // Wrapper を内側から積む
    if (depth >= 3) {
      const T = getEffect(third);
      node = <T style={FILL}>{node}</T>;
    }
    if (depth >= 2) {
      const M = getEffect(middle);
      node = <M style={FILL}>{node}</M>;
    }
    if (depth >= 1) {
      const O = getEffect(outer);
      node = <O style={FILL}>{node}</O>;
    }

    return (
      <Suspense key={key} fallback={<Subject />}>
        {node}
      </Suspense>
    );
  }, [depth, outer, middle, third, core, coreSrc, nonce]);

  const layers = [
    ...(depth >= 1 ? [outer] : []),
    ...(depth >= 2 ? [middle] : []),
    ...(depth >= 3 ? [third] : []),
  ];
  const chain = [
    ...layers.map((s) => componentMeta[s].name),
    core !== "none" ? componentMeta[core].name : "HTML",
  ].join(" › ");

  return (
    <section style={box}>
      <h2 style={h2}>T-2 / T-3 / T-4 — 入れ子の成否とコスト</h2>
      <p style={note}>
        Wrapper を <strong>{depth}</strong> 段重ね、最内に
        {core === "none" ? "通常の HTML" : "Object 系（three.js）"}
        を置いています。
        <br />
        <strong>T-3 を見るには「最内」で Object 系を選んでください。</strong>
        内側の 3D が外側の効果に取り込まれて見えれば成立、黒く抜ければ不成立です。
      </p>

      <div style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap", margin: "var(--sp-5) 0", alignItems: "flex-end" }}>
        <div>
          <div style={label}>Wrapper の段数</div>
          <select style={selectStyle} value={depth} onChange={(e) => setDepth(Number(e.target.value))}>
            <option value={0}>0 段（Wrapper なし＝基準）</option>
            <option value={1}>1 段</option>
            <option value={2}>2 段（T-2）</option>
            <option value={3}>3 段（T-4）</option>
          </select>
        </div>
        <div>
          <div style={label}>最内（T-3）</div>
          <select style={selectStyle} value={core} onChange={(e) => setCore(e.target.value)}>
            <option value="none">通常の HTML</option>
            {objects.map((s) => (
              <option key={s} value={s}>{componentMeta[s].name}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={label}>外側</div>
          <select style={selectStyle} value={outer} onChange={(e) => setOuter(e.target.value)}>
            {wrappers.map((s) => (
              <option key={s} value={s}>
                {componentMeta[s].name}（{componentMeta[s].interaction}）
              </option>
            ))}
          </select>
        </div>
        {depth >= 2 && (
          <div>
            <div style={label}>2 段目</div>
            <select style={selectStyle} value={middle} onChange={(e) => setMiddle(e.target.value)}>
              {wrappers.map((s) => (
                <option key={s} value={s}>
                  {componentMeta[s].name}（{componentMeta[s].interaction}）
                </option>
              ))}
            </select>
          </div>
        )}
        {depth >= 3 && (
          <div>
            <div style={label}>3 段目</div>
            <select style={selectStyle} value={third} onChange={(e) => setThird(e.target.value)}>
              {wrappers.map((s) => (
                <option key={s} value={s}>
                  {componentMeta[s].name}（{componentMeta[s].interaction}）
                </option>
              ))}
            </select>
          </div>
        )}
        <FpsMeter />
      </div>

      <div style={{ ...label, marginBottom: 8, color: "var(--color-accentLit)" }}>
        構成: {chain}
      </div>

      <div
        data-nesting-stage
        style={{
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          background: "var(--color-surface)",
          height: 420,
        }}
      >
        {tree}
      </div>
    </section>
  );
}
