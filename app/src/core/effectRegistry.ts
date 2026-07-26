/**
 * slug → コンポーネントの遅延解決（ADR-4 / module-spec.md §7）
 *
 * 25 個すべてを初期バンドルに含めると LCP 2.5 秒（NFR-1.2）を満たせない。
 * Object 系 3 種は three を引き込むため特に重い。
 *
 * N-6: Vite がチャンク分割できるのは解析可能な形のみ。
 * 動的パス結合を使わず、静的な import() で明示列挙する。
 */
import type { ComponentType } from "react";

/**
 * 25 種は props が異種混在（children を取る 22 種 / src を取る 3 種、
 * かつ各々固有のオプション 409 個）。共通の props 型を与えると
 * strictFunctionTypes の反変性で代入できないため、ここは意図的に any とする。
 *
 * 型で守れない代わりに、props の妥当性は 2 段で担保する:
 *  - ビルド時: validate-catalog の V-5 が options.json に実在するキーかを検証
 *  - 実行時 : EffectBoundary + 描画ウォッチドッグが失敗を隔離
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEffect = ComponentType<any>;

type EffectLoader = () => Promise<{ default: AnyEffect }>;

export const effectRegistry: Record<string, EffectLoader> = {
  "asciify": () => import("@/components/canvasui/Asciify"),
  "bend": () => import("@/components/canvasui/Bend"),
  "blaze": () => import("@/components/canvasui/Blaze"),
  "bubble": () => import("@/components/canvasui/Bubble"),
  "cloth": () => import("@/components/canvasui/Cloth"),
  "clouds": () => import("@/components/canvasui/Clouds"),
  "dithered-object": () => import("@/components/canvasui/DitheredObject"),
  "droplets": () => import("@/components/canvasui/Droplets"),
  "frost": () => import("@/components/canvasui/Frost"),
  "glass": () => import("@/components/canvasui/Glass"),
  "glass-object": () => import("@/components/canvasui/GlassObject"),
  "glitch": () => import("@/components/canvasui/Glitch"),
  "grid": () => import("@/components/canvasui/Grid"),
  "hex-float": () => import("@/components/canvasui/HexFloat"),
  "laser": () => import("@/components/canvasui/Laser"),
  "liquid": () => import("@/components/canvasui/Liquid"),
  "magnify": () => import("@/components/canvasui/Magnify"),
  "particle-object": () => import("@/components/canvasui/ParticleObject"),
  "particle-reveal": () => import("@/components/canvasui/ParticleReveal"),
  "particle-scroll": () => import("@/components/canvasui/ParticleScroll"),
  "peel": () => import("@/components/canvasui/Peel"),
  "retro-dither": () => import("@/components/canvasui/RetroDither"),
  "ripple": () => import("@/components/canvasui/Ripple"),
  "shatter": () => import("@/components/canvasui/Shatter"),
  "vhs": () => import("@/components/canvasui/VHS"),
};

const cache = new Map<string, Promise<{ default: AnyEffect }>>();

/** 同一 slug への重複呼び出しは 1 回に抑える */
export function loadEffect(slug: string) {
  const cached = cache.get(slug);
  if (cached) return cached;
  const loader = effectRegistry[slug];
  if (!loader) throw new Error(`未知のエフェクト slug です: ${slug}`);
  const p = loader();
  cache.set(slug, p);
  return p;
}

/** preloading フェーズで呼ぶ。失敗しても握りつぶす（本番の描画には影響しない） */
export function preloadEffect(slug: string): void {
  if (!effectRegistry[slug]) return;
  void loadEffect(slug).catch(() => {});
}

/** テスト用 */
export function __clearEffectCache() {
  cache.clear();
}
