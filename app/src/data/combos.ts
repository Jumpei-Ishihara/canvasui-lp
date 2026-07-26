import { rgb01, tokens } from "@/styles/tokens";

/**
 * 組み合わせプリセット（REQ-2 / design.md §8.2 改訂版）
 *
 * 検証 T-2 により Wrapper どうしの入れ子は不成立と判明した。
 * したがってプリセットは 3 種類になる:
 *   overlay — Object 系を Wrapper で包む。成立する唯一の重ね合わせ（T-3）
 *   juxtapose — 同じ内容に別々の効果をかけて並置する（REQ-2.3 読み替え後）
 *   nested-fails — 入れ子が成立しないことの実演。研究成果そのもの
 */
export type ComboKind = "overlay" | "juxtapose" | "nested-fails";

export interface ComboPreset {
  id: string;
  title: string;
  kind: ComboKind;
  /** 狙い・観察してほしい点 */
  intent: string;
  /** 外側の Wrapper */
  outer: { slug: string; props: Record<string, unknown> };
  /** 内側。overlay は Object 系、nested-fails は Wrapper、juxtapose は比較相手 */
  inner: { slug: string; props: Record<string, unknown> };
  /** 実証済みの検証 ID */
  verifiedBy: string;
}

const TEST_ASSET = "/svg/test-shape.svg";

export const combos: readonly ComboPreset[] = [
  /* ---- overlay: 成立する唯一の重ね合わせ（T-3） ---- */
  {
    id: "vhs-glassobject",
    title: "VHS × GlassObject",
    kind: "overlay",
    intent:
      "劣化したテープに 3D ガラスが映っている画。テープ揺れと色滲みが立体に乗る。",
    outer: { slug: "vhs", props: { speed: 1.0, scanlines: 0.45 } },
    inner: {
      slug: "glass-object",
      props: { src: TEST_ASSET, tint: "", highlight: tokens.accent, floatIntensity: 1 },
    },
    verifiedBy: "T-3",
  },
  {
    id: "glitch-particleobject",
    title: "Glitch × ParticleObject",
    kind: "overlay",
    intent: "信号の断絶が粒子の雲を引き裂く。崩れたものがさらに崩れる。",
    outer: { slug: "glitch", props: { intensity: 0.7 } },
    inner: {
      slug: "particle-object",
      props: { src: TEST_ASSET, count: 40000, size: 1.2, background: "" },
    },
    verifiedBy: "T-3",
  },
  {
    id: "clouds-ditheredobject",
    title: "Clouds × DitheredObject",
    kind: "overlay",
    intent: "霧の奥に 1bit のモデルが沈む。ディザの粒と霧の粒が干渉する。",
    outer: {
      slug: "clouds",
      props: { scale: 1.2, speed: 0.6, color: rgb01(tokens.surface), opacity: 0.8 },
    },
    inner: {
      slug: "dithered-object",
      props: { src: "", gridSize: 96, grayscale: true, highlight: tokens.accent },
    },
    verifiedBy: "T-3",
  },
  {
    id: "ripple-glassobject",
    title: "Ripple × GlassObject",
    kind: "overlay",
    intent:
      "水面の屈折越しに 3D ガラスを見る。クリックで広がる波紋が立体を歪める。",
    outer: { slug: "ripple", props: { speed: 1.0, shine: 1.2 } },
    inner: {
      slug: "glass-object",
      props: { src: TEST_ASSET, tint: "", highlight: tokens.accent, floatIntensity: 1 },
    },
    verifiedBy: "T-3",
  },

  /* ---- juxtapose: 重ねられないので並べる（REQ-2.3 読み替え後） ---- */
  {
    id: "vhs-vs-glitch",
    title: "VHS ／ Glitch",
    kind: "juxtapose",
    intent:
      "同じ内容に別々の劣化をかけて並べる。連続的な揺れと瞬間的な断絶の差が分かる。",
    outer: { slug: "vhs", props: { speed: 1.0, scanlines: 0.45 } },
    inner: { slug: "glitch", props: { intensity: 0.7 } },
    verifiedBy: "T-1",
  },
  {
    id: "glass-vs-magnify",
    title: "Glass ／ Magnify",
    kind: "juxtapose",
    intent:
      "レンズ型どうしは重ねると視線が割れる。並べれば「光学」と「計測」の性格差が読める。",
    outer: { slug: "glass", props: { size: 150, blur: 0.5, shine: 1.0 } },
    inner: { slug: "magnify", props: { size: 150, zoom: 2.0, color: rgb01(tokens.accent) } },
    verifiedBy: "T-1",
  },

  /* ---- nested-fails: 実証された限界（研究成果） ---- */
  {
    id: "nested-vhs-glass",
    title: "VHS ‹ Glass（入れ子）",
    kind: "nested-fails",
    intent:
      "外側 VHS は文字に効いているのに、内側 Glass のレンズは真っ黒に抜ける。内側の WebGL 出力が外側に取り込まれない。",
    outer: { slug: "vhs", props: { speed: 1.0, scanlines: 0.45 } },
    inner: { slug: "glass", props: { size: 150, blur: 0.4, shine: 1.0 } },
    verifiedBy: "T-2",
  },
  {
    id: "nested-glass-vhs",
    title: "Glass ‹ VHS（入れ子・逆順）",
    kind: "nested-fails",
    intent:
      "順序を入れ替えても同じ。外側 Glass は正常に屈折するが、内側 VHS は完全に消える。順番の問題ではない。",
    outer: { slug: "glass", props: { size: 150, blur: 0.4, shine: 1.0 } },
    inner: { slug: "vhs", props: { speed: 1.0, scanlines: 0.45 } },
    verifiedBy: "T-2",
  },
];

export const COMBO_KIND_LABEL: Record<ComboKind, string> = {
  overlay: "重ねる（成立）",
  juxtapose: "並べる",
  "nested-fails": "重ねられない（実証）",
};
