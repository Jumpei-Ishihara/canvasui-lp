import { createContext, useContext, useState, type ReactNode } from "react";

interface ElementImageContext extends CanvasRenderingContext2D {
  drawElementImage?: (element: Element, x: number, y: number) => void;
}
interface PaintableCanvas extends HTMLCanvasElement {
  requestPaint?: () => void;
}

/**
 * html-in-canvas の対応判定（design.md §6.1 / REQ-5.8）
 *
 * Canvas UI 各コンポーネント内部と同一の判定式を用いる。挙動を一致させるため。
 * Origin Trial トークンの有無・失効はこの判定に自然に反映される（REQ-5.9）。
 */
export function detectHtmlInCanvas(): boolean {
  if (typeof document === "undefined") return false;
  const probe = document.createElement("canvas") as PaintableCanvas;
  const ctx = probe.getContext("2d") as ElementImageContext | null;
  return Boolean(
    ctx &&
      typeof ctx.drawElementImage === "function" &&
      typeof probe.requestPaint === "function",
  );
}

const SupportCtx = createContext<boolean>(false);

export function SupportProvider({
  children,
  /** テスト用の上書き。本番では渡さない */
  value,
}: {
  children: ReactNode;
  value?: boolean;
}) {
  // 起動時に 1 回だけ評価する。以後は再評価しない（design.md §6.1）
  const [supported] = useState(() => value ?? detectHtmlInCanvas());
  return <SupportCtx.Provider value={supported}>{children}</SupportCtx.Provider>;
}

export function useHtmlInCanvasSupport(): boolean {
  return useContext(SupportCtx);
}
