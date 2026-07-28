import type { StagePreset } from "@/core/Stage";
import { rgb01, tokens } from "@/styles/tokens";
import { assets } from "./assets";

/**
 * 被写体テンプレート（ui-design.md §8）
 * 25 セクション分のコンテンツを個別に作らず、この 5 種を使い回す。
 */
export type SubjectKind =
  /** 情報密度の高い版面。レンズ系（覗いて読ませる） */
  | "dense-document"
  /** 太い見出し。破壊系（細い文字は消えるため） */
  | "bold-heading"
  /** 彩度の高いイラスト。流体系・ジオメトリ系（色差がないと効果が見えない） */
  | "color-artwork"
  /** 擬似 UI。パーティクル系（背景との差で判定するため高コントラスト） */
  | "ui-mock"
  /** Object 系。中央に 1 つ、周囲は無地 */
  | "object-stage";

export interface CatalogEntry {
  slug: string;
  subject: SubjectKind;
  stage: StagePreset;
  effectProps: Record<string, unknown>;
}

/**
 * カタログ 25 件（ui-design.md §9）
 *
 * 並び順は REQ-1.6 / 1.7 を満たす（M1-04 で是正済み）:
 *  - 同一 interaction が 3 連続しない
 *  - スクロール駆動 3 種（bend / laser / particle-scroll）が隣接しない
 * この 2 点は scripts/validate-catalog.ts が V-3 / V-4 で機械検証する。
 *
 * 色は必ず rgb01(tokens.x) を通す。数値の直書きは禁止（N-3 / REQ-9.1）。
 * Wrapper 系の色は 0〜1 正規化 RGB、Object 系は CSS 文字列（§6.3）。
 */
export const catalog: readonly CatalogEntry[] = [
  {
    slug: "glass",
    subject: "dense-document",
    stage: "card",
    effectProps: { size: 160, blur: 0.6, shine: 1.0, zoom: 1.8, targets: ".zoomable" },
  },
  {
    slug: "vhs",
    subject: "bold-heading",
    stage: "card",
    effectProps: { speed: 1.0, scanlines: 0.45 },
  },
  {
    slug: "liquid",
    subject: "color-artwork",
    stage: "card",
    effectProps: { radius: 0.3, intensity: 1.0, color: rgb01(tokens.accent) },
  },
  {
    slug: "shatter",
    subject: "color-artwork",
    stage: "card",
    effectProps: { radius: 220, tileSize: 56, gapColor: rgb01(tokens.bg), strength: 1.0 },
  },
  {
    slug: "magnify",
    subject: "dense-document",
    stage: "card",
    effectProps: { size: 180, zoom: 2.0, color: rgb01(tokens.accent) },
  },
  {
    slug: "glitch",
    subject: "bold-heading",
    stage: "card",
    effectProps: { intensity: 0.7 },
  },
  {
    slug: "ripple",
    subject: "color-artwork",
    stage: "card",
    effectProps: { speed: 1.0, shine: 1.2 },
  },
  {
    slug: "grid",
    subject: "color-artwork",
    stage: "card",
    effectProps: { tileSize: 64, gap: 2, cornerRadius: 6, waveSpeed: 1.0 },
  },
  {
    slug: "bend",
    subject: "bold-heading",
    stage: "tall",
    effectProps: { direction: "out" },
  },
  {
    slug: "bubble",
    subject: "dense-document",
    stage: "card",
    effectProps: { size: 120, shine: 1.2, intensity: 0.9 },
  },
  {
    slug: "blaze",
    subject: "ui-mock",
    stage: "card",
    effectProps: {
      speed: 1.0,
      sparkColor: rgb01(tokens.warn),
      smokeColor: rgb01(tokens.surface),
    },
  },
  {
    slug: "droplets",
    subject: "color-artwork",
    stage: "card",
    effectProps: { intensity: 1.0, speed: 1.0, blur: 0.5 },
  },
  {
    slug: "hex-float",
    subject: "color-artwork",
    stage: "card",
    effectProps: { size: 40, gap: 2, shine: 1.0, gapColor: rgb01(tokens.bg) },
  },
  {
    slug: "laser",
    subject: "ui-mock",
    stage: "tall",
    effectProps: { speed: 1.0, color: rgb01(tokens.accent), radius: 120 },
  },
  {
    slug: "retro-dither",
    subject: "dense-document",
    stage: "card",
    effectProps: {
      radius: 200,
      pixelSize: 4,
      darkColor: rgb01(tokens.bg),
      lightColor: rgb01(tokens.fg),
      scanlines: 0.3,
    },
  },
  {
    slug: "clouds",
    subject: "ui-mock",
    stage: "card",
    effectProps: { scale: 1.2, speed: 0.6, color: rgb01(tokens.surface), opacity: 0.8 },
  },
  {
    slug: "frost",
    subject: "color-artwork",
    stage: "card",
    effectProps: { strength: 1.0, meltRadius: 140, meltStrength: 1.0 },
  },
  {
    slug: "peel",
    subject: "bold-heading",
    stage: "card",
    // 第 2 レイヤーの内容は未決（Q-4 / U-2）。暫定で shine のみ設定する
    effectProps: { side: "right", shine: 1.0, shineColor: rgb01(tokens.fg) },
  },
  {
    slug: "particle-scroll",
    subject: "ui-mock",
    stage: "tall",
    effectProps: { size: 1.5 },
  },
  {
    slug: "asciify",
    subject: "dense-document",
    stage: "card",
    effectProps: {
      radius: 200,
      scale: 1.0,
      background: rgb01(tokens.bg),
      backgroundOpacity: 1,
    },
  },
  {
    slug: "cloth",
    subject: "color-artwork",
    stage: "card",
    effectProps: { speed: 1.0, brushSize: 120, backing: rgb01(tokens.bg) },
  },
  {
    slug: "particle-reveal",
    subject: "ui-mock",
    stage: "card",
    // particle-reveal の background だけは CSS 文字列を取る（options.json 準拠）
    effectProps: { radius: 220, size: 1.5, background: tokens.bg },
  },
  {
    slug: "particle-object",
    subject: "object-stage",
    stage: "square",
    effectProps: {
      src: assets.particleObject.src,
      count: 60000,
      size: 1.2,
      background: "",
    },
  },
  {
    slug: "glass-object",
    subject: "object-stage",
    stage: "square",
    effectProps: {
      src: assets.glassObject.src,
      tint: "",
      highlight: tokens.accent,
      floatIntensity: 1,
    },
  },
  {
    slug: "dithered-object",
    subject: "object-stage",
    stage: "square",
    /**
     * 値は glass.glb を入れてから実測で決めた。素材が無かった頃の値
     * （gridSize: 96）は 96px 角の市松模様になり、形が全く読めなかった。
     *
     * gridSize はセルの「個数」ではなく一辺のピクセル数（既定 4）。
     * roughness / environmentIntensity を上げているのは、このモデルの
     * マテリアルが metallic=1 / roughness=1 のまま書き出されていて、
     * 既定の environmentIntensity 0.1 では拾う光が無く真っ黒になるため。
     */
    effectProps: {
      src: assets.ditheredObject.src,
      gridSize: 5,
      grayscale: true,
      highlight: tokens.accent,
      roughness: 0.6,
      environmentIntensity: 0.14,
      scale: 3.6,
    },
  },
];

export const catalogOrder: readonly string[] = catalog.map((e) => e.slug);
