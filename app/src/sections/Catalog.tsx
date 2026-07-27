import { useSyncExternalStore } from "react";
import { EffectSection } from "@/core/EffectSection";
import { componentMeta } from "@/data/components.generated";
import { catalog } from "@/data/catalog";
import { renderSubject } from "@/subjects/Subjects";
import { CopyButton } from "./CopyButton";

/**
 * カタログ 25 セクション（REQ-1）
 *
 * catalog を map して生成する。セクションごとの個別コンポーネントは作らない（G-3）。
 */
function useIsMobile(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(max-width: 639px)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 639px)").matches,
    () => false,
  );
}

const INTERACTION_LABEL: Record<string, string> = {
  ambient: "アンビエント",
  lens: "レンズ",
  field: "撹乱場",
  geometry: "ジオメトリ",
  scroll: "スクロール駆動",
};

export function Catalog() {
  const isMobile = useIsMobile();

  return (
    <div style={{ display: "grid", gap: "var(--sp-10)" }}>
      {catalog.map((entry, i) => {
        const meta = componentMeta[entry.slug];
        return (
          <EffectSection
            key={entry.slug}
            id={`catalog-${entry.slug}`}
            effect={entry.slug}
            effectProps={entry.effectProps}
            stage={entry.stage}
            isMobile={isMobile}
            header={
              <div style={labelRow}>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-dim)" }}>
                  {String(i + 1).padStart(2, "0")} / {catalog.length}
                </span>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>{meta.name}</h3>
                <span style={badge}>{INTERACTION_LABEL[meta.interaction]}</span>
                <span style={badge}>{meta.family === "object" ? "3D" : "Wrapper"}</span>
                <span style={{ ...badge, color: "var(--color-dim)" }}>
                  {meta.optionCount} options
                </span>
              </div>
            }
            footer={
              <div style={{ marginTop: "var(--sp-4)", maxWidth: "var(--w-narrow)" }}>
                <p style={{ margin: 0, color: "var(--color-muted)", fontSize: ".9375rem" }}>
                  {meta.description}
                </p>
                {/* タッチ環境ではポインタ追従型が本来の見え方にならない。
                    事実を伝える（touchLimited はベンダーソースの走査で自動判定） */}
                {isMobile && meta.touchLimited && (
                  <p style={touchNote}>
                    この効果は<strong>ポインタの動きに追従</strong>します。
                    タッチ環境にはホバーが無く、指でなぞるとスクロールが優先されるため、
                    <strong>本来の見え方にはなりません</strong>。
                    マウス環境でご覧ください。
                  </p>
                )}
                <div style={codeRow}>
                  <code style={{ fontSize: ".8125rem", overflowX: "auto" }}>
                    {meta.installCommand}
                  </code>
                  <CopyButton text={meta.installCommand} />
                </div>
              </div>
            }
          >
            {renderSubject(entry.subject, entry.slug)}
          </EffectSection>
        );
      })}
    </div>
  );
}

const labelRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--sp-3)",
  flexWrap: "wrap",
  marginBottom: "var(--sp-3)",
};
const badge: React.CSSProperties = {
  fontSize: ".75rem",
  letterSpacing: ".04em",
  background: "var(--color-raised)",
  borderRadius: 4,
  padding: "2px 8px",
  color: "var(--color-muted)",
};
const touchNote: React.CSSProperties = {
  margin: "var(--sp-3) 0 0",
  padding: "var(--sp-3)",
  borderLeft: "3px solid var(--color-warn)",
  background: "var(--color-surface)",
  color: "var(--color-muted)",
  fontSize: ".8125rem",
  lineHeight: 1.7,
};
const codeRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--sp-3)",
  marginTop: "var(--sp-3)",
  padding: "var(--sp-3)",
  borderRadius: 8,
  background: "#08080A",
  border: "1px solid var(--color-border)",
  flexWrap: "wrap",
};
