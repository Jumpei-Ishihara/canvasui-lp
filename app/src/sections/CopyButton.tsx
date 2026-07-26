import { useState } from "react";

/**
 * コマンドのコピー（REQ-8.6）
 * クリップボードが使えない場合は execCommand へ退避せず、
 * 選択可能なテキストとして見せる（design.md §8.3）。
 */
export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
      window.setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("failed");
    }
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-2)" }}>
      <button
        onClick={copy}
        style={{
          background: "transparent",
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          color: "var(--color-muted)",
          cursor: "pointer",
          font: "inherit",
          fontSize: ".75rem",
          padding: "4px 10px",
          minHeight: 28,
        }}
      >
        コピー
      </button>
      {state === "done" && (
        <span role="status" style={{ color: "var(--color-ok)", fontSize: ".75rem" }}>
          コピーしました
        </span>
      )}
      {state === "failed" && (
        <span role="status" style={{ color: "var(--color-muted)", fontSize: ".75rem" }}>
          コマンドを選択してコピーしてください
        </span>
      )}
    </span>
  );
}
