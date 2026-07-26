import { useState } from "react";
import { useHtmlInCanvasSupport } from "@/core/SupportContext";

const KEY = "canvasui.banner.dismissed";

/**
 * 対応状況バナー（REQ-5.3〜5.6 / ui-design.md §6）
 *
 * position: fixed にしない。コンテンツを覆わないため（REQ-5.5）。
 */
export function SupportBanner() {
  const supported = useHtmlInCanvasSupport();
  const [dismissed, setDismissed] = useState(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem(KEY) === "1",
  );

  // 対応環境では表示しない（REQ-5.6）
  if (supported || dismissed) return null;

  const close = () => {
    sessionStorage.setItem(KEY, "1");
    setDismissed(true);
  };

  return (
    <div
      role="status"
      style={{
        display: "flex",
        gap: "var(--sp-4)",
        alignItems: "flex-start",
        padding: "var(--sp-4) var(--sp-5)",
        background: "var(--color-surface)",
        borderLeft: "3px solid var(--color-warn)",
      }}
    >
      <p style={{ margin: 0, flex: 1, fontSize: ".875rem", lineHeight: 1.7 }}>
        このブラウザは <strong>html-in-canvas</strong> に未対応のため、
        25 種のうち 22 種はエフェクトなしで表示しています。
        <strong> 内容はすべてお読みいただけます。</strong>
        <br />
        <span style={{ color: "var(--color-muted)" }}>
          Chrome 148 以降（Origin Trial 有効、または{" "}
          <code>chrome://flags/#canvas-draw-element</code> を有効化）で全機能を体験できます。
          3D の 3 種はこの環境でも動作します。
        </span>
      </p>
      <button
        onClick={close}
        aria-label="このお知らせを閉じる"
        style={{
          background: "transparent",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          color: "var(--color-muted)",
          cursor: "pointer",
          font: "inherit",
          minWidth: 44,
          minHeight: 44,
        }}
      >
        ✕
      </button>
    </div>
  );
}
