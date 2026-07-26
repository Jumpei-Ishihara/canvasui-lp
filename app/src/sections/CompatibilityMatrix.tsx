import { useState, type CSSProperties } from "react";
import {
  INTERACTION_DESC,
  INTERACTION_LABEL,
  RATING_MARK,
  adjacencyMatrix,
  interactionKinds,
  structuralMatrix,
  type Cell,
  type Family,
} from "@/data/categories";
import { allSlugs, componentMeta } from "@/data/components.generated";

/**
 * 相性マトリクス（REQ-3）
 *
 * 2 つの表に分ける。
 *  1. 構造的な合成可否 — 実測で確定（T-2 / T-3）
 *  2. 並置の相性       — 設計指針。verifiedBy が null なので必ず区別して見せる（REQ-3.3）
 */
const RATING_COLOR: Record<string, string> = {
  recommended: "var(--color-ok)",
  ok: "var(--color-fg)",
  caution: "var(--color-warn)",
  avoid: "var(--color-danger)",
};

const FAMILY_LABEL: Record<Family, string> = {
  wrapper: "Wrapper 系（22）",
  object: "Object 系（3）",
};

function CellButton({ cell, onSelect, active }: { cell: Cell; onSelect: () => void; active: boolean }) {
  const unverified = cell.verifiedBy === null;
  return (
    <button
      onClick={onSelect}
      aria-label={`${RATING_MARK[cell.rating]} ${cell.rationale}`}
      style={{
        width: "100%",
        minHeight: 48,
        cursor: "pointer",
        background: active ? "var(--color-raised)" : "transparent",
        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
        borderRadius: 8,
        color: RATING_COLOR[cell.rating],
        font: "inherit",
        fontSize: "1.125rem",
        // 未検証は破線で示す。実測済みと視覚的に区別する（REQ-3.3）
        borderStyle: unverified ? "dashed" : "solid",
        opacity: unverified ? 0.75 : 1,
      }}
    >
      {RATING_MARK[cell.rating]}
    </button>
  );
}

export function CompatibilityMatrix() {
  const [selected, setSelected] = useState<{ cell: Cell; title: string } | null>(null);

  const counts = interactionKinds.map((k) => ({
    kind: k,
    n: allSlugs.filter((s) => componentMeta[s].interaction === k).length,
  }));

  return (
    <section style={{ display: "grid", gap: "var(--sp-7)" }}>
      <div>
        <div style={microLabel}>COMPATIBILITY</div>
        <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", marginTop: "var(--sp-2)" }}>
          相性マトリクス
        </h2>
      </div>

      {/* ---- 1. 構造的な合成可否（実測） ---- */}
      <div>
        <h3 style={h3}>重ねられるか — 実測で確定</h3>
        <p style={{ ...note, marginBottom: "var(--sp-4)" }}>
          縦が外側、横が内側。<strong>実機の検証結果</strong>であり、推測は含みません。
        </p>
        <div style={scrollX}>
          <table style={{ borderCollapse: "separate", borderSpacing: 6, minWidth: 480 }}>
            <thead>
              <tr>
                <th style={corner} />
                {(["wrapper", "object"] as Family[]).map((f) => (
                  <th key={f} style={colHead}>内側: {FAMILY_LABEL[f]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["wrapper", "object"] as Family[]).map((row) => (
                <tr key={row}>
                  <th style={rowHead}>外側: {FAMILY_LABEL[row]}</th>
                  {(["wrapper", "object"] as Family[]).map((col) => {
                    const cell = structuralMatrix[row][col];
                    const title = `外側 ${FAMILY_LABEL[row]} × 内側 ${FAMILY_LABEL[col]}`;
                    return (
                      <td key={col} style={{ width: 200 }}>
                        <CellButton
                          cell={cell}
                          active={selected?.title === title}
                          onSelect={() => setSelected({ cell, title })}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- 2. 並置の相性（設計指針） ---- */}
      <div>
        <h3 style={h3}>並べたときの相性 — 設計指針</h3>
        <p style={{ ...note, marginBottom: "var(--sp-4)" }}>
          重ねられないため、実際の組み合わせは「並置」か「切り替え」になります。
          この表は視覚的な判断であり実測ではないので、
          <span style={{ borderBottom: "1px dashed var(--color-muted)" }}>破線</span>
          で未検証であることを示しています。
        </p>
        <div style={scrollX}>
          <table style={{ borderCollapse: "separate", borderSpacing: 6, minWidth: 620 }}>
            <thead>
              <tr>
                <th style={corner} />
                {interactionKinds.map((k) => (
                  <th key={k} style={colHead}>
                    {INTERACTION_LABEL[k]}
                    <br />
                    <span style={{ color: "var(--color-dim)", fontWeight: 400 }}>
                      {counts.find((c) => c.kind === k)!.n} 種
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {interactionKinds.map((row) => (
                <tr key={row}>
                  <th style={rowHead} title={INTERACTION_DESC[row]}>
                    {INTERACTION_LABEL[row]}
                  </th>
                  {interactionKinds.map((col) => {
                    const cell = adjacencyMatrix[row][col];
                    const title = `${INTERACTION_LABEL[row]} ／ ${INTERACTION_LABEL[col]}`;
                    return (
                      <td key={col} style={{ width: 92 }}>
                        <CellButton
                          cell={cell}
                          active={selected?.title === title}
                          onSelect={() => setSelected({ cell, title })}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- 根拠の表示（REQ-3.2） ---- */}
      <div style={detailBox} aria-live="polite">
        {selected ? (
          <>
            <div style={microLabel}>{selected.title}</div>
            <p style={{ margin: "var(--sp-2) 0", fontSize: "1.0625rem" }}>
              <span style={{ color: RATING_COLOR[selected.cell.rating], marginRight: 8 }}>
                {RATING_MARK[selected.cell.rating]}
              </span>
              {selected.cell.rationale}
            </p>
            <p style={{ ...note, margin: 0, color: "var(--color-dim)" }}>
              {selected.cell.verifiedBy
                ? `根拠: 検証 ${selected.cell.verifiedBy}（実測）`
                : "根拠: 設計判断（未検証）"}
            </p>
          </>
        ) : (
          <p style={{ ...note, margin: 0 }}>
            セルを選ぶと根拠を表示します。
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "var(--sp-5)", flexWrap: "wrap", ...note }}>
        {(["recommended", "ok", "caution", "avoid"] as const).map((r) => (
          <span key={r}>
            <span style={{ color: RATING_COLOR[r], marginRight: 6 }}>{RATING_MARK[r]}</span>
            {{ recommended: "推奨", ok: "可", caution: "要調整", avoid: "不可" }[r]}
          </span>
        ))}
        <span style={{ color: "var(--color-dim)" }}>破線 = 未検証（設計判断）</span>
      </div>
    </section>
  );
}

const microLabel: CSSProperties = {
  color: "var(--color-dim)",
  fontSize: ".75rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
};
const h3: CSSProperties = { fontSize: "1.125rem", marginBottom: "var(--sp-2)" };
const note: CSSProperties = { color: "var(--color-muted)", fontSize: ".9375rem" };
/**
 * grid / flex のアイテムは既定で min-width:auto のため、
 * 中身（表）が親より広いと overflow-x:auto が効かず、ページ全体が横に伸びる。
 * minWidth:0 を明示して初めてスクロールコンテナとして機能する。
 */
const scrollX: CSSProperties = { overflowX: "auto", minWidth: 0 };
const corner: CSSProperties = { width: 150 };
const colHead: CSSProperties = {
  fontSize: ".75rem",
  color: "var(--color-muted)",
  fontWeight: 500,
  padding: "0 4px 6px",
  verticalAlign: "bottom",
};
const rowHead: CSSProperties = {
  fontSize: ".8125rem",
  color: "var(--color-muted)",
  fontWeight: 500,
  textAlign: "right",
  paddingRight: "var(--sp-3)",
  whiteSpace: "nowrap",
};
const detailBox: CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  background: "var(--color-surface)",
  padding: "var(--sp-5)",
  minHeight: 110,
};
