import type { CSSProperties } from "react";
import { CopyButton } from "./CopyButton";

/**
 * コマンド・設定の表示（REQ-8.6）
 *
 * コピーできない環境でも困らないよう、テキストは常に選択可能なままにする
 * （design.md §8.3: execCommand へは退避しない）。
 */
export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div style={wrap}>
      <div style={head}>
        <span style={{ color: "var(--color-dim)", fontSize: ".75rem", letterSpacing: ".06em" }}>
          {label ?? ""}
        </span>
        <CopyButton text={code} />
      </div>
      <pre style={pre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

const wrap: CSSProperties = {
  background: "#08080A",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  marginBottom: "var(--sp-4)",
  overflow: "hidden",
};
const head: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--sp-3)",
  padding: "6px 10px",
  borderBottom: "1px solid var(--color-border)",
};
const pre: CSSProperties = {
  margin: 0,
  padding: "var(--sp-3)",
  overflowX: "auto",
  fontSize: ".8125rem",
  lineHeight: 1.6,
};
