import type { CSSProperties, ReactNode } from "react";

export type StagePreset = "full" | "hero" | "card" | "tall" | "square";

/**
 * 固定寸法の描画領域（ADR-2 / ui-design.md §5）
 *
 * 寸法を明示するのは 2 つの理由による。
 *  1. Canvas UI の Wrapper は内部で height:100% のコンテンツ div を作るため、
 *     親に高さが無いと解決できない
 *  2. 活性・非活性で box が変わらないのでレイアウトシフトが起きない（NFR-1.4）
 *
 * EffectSection の両分岐で「同一の Stage」を描画することが G-2 の担保。
 */
const PRESET: Record<StagePreset, CSSProperties> = {
  full: { height: "100vh" },
  hero: { height: "min(80vh, 720px)" },
  card: { height: "480px" },
  tall: { height: "160vh" },
  square: { aspectRatio: "1 / 1", maxWidth: "560px", width: "100%" },
};

/** モバイル時の上書き（ui-design.md §10.1） */
const PRESET_MOBILE: Partial<Record<StagePreset, CSSProperties>> = {
  full: { height: "80vh" },
  card: { height: "360px" },
};

export interface StageProps {
  preset: StagePreset;
  isMobile?: boolean;
  className?: string;
  children: ReactNode;
}

export function Stage({ preset, isMobile = false, className, children }: StageProps) {
  const size = {
    ...PRESET[preset],
    ...(isMobile ? (PRESET_MOBILE[preset] ?? {}) : {}),
  };
  return (
    <div
      data-stage={preset}
      className={className}
      style={{
        position: "relative",
        // エフェクトが枠外へ描画することがあるため必須（ui-design.md §5.2）
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        background: "var(--color-surface)",
        ...size,
      }}
    >
      {children}
    </div>
  );
}
