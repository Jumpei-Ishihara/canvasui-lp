/**
 * 素材参照の単一定義（REQ-7.2 / G-6 / design.md §15.5-1）
 *
 * 【重要】この AssetSource は M4（素材アップロード）の前提。
 * Object 系セクションは kind を判定せず src だけを使うこと。
 * そうしておけば M4 で kind:"uploaded" を注入するだけで済み、
 * セクション実装を書き直さずに拡張できる。
 */
import { assetUrl } from "@/lib/assetUrl";

export type AssetSource =
  | { kind: "static"; src: string; label: string }
  | { kind: "uploaded"; src: string; label: string; revoke: () => void };

/**
 * 素材は調達中。現時点はプレースホルダで、確定後にここだけ差し替える（M1-11）。
 * src が空文字のとき Object 系は描画されないが、エラーにはならない。
 *
 * 【重要】public 配下のパスは必ず assetUrl() を通すこと。
 * 素の絶対パスは Vite の base が付かず、GitHub Pages のプロジェクトサイトで 404 になる。
 */
export const assets = {
  /**
   * GlassObject — SVG ではなく GLB を渡す。
   *
   * SVG を渡すとアルファのシルエットを押し出すだけになり、奥行きが均一な板になる。
   * 実測でも logo.png / asset-1.svg は判別できない形になり、代わりに置いていた
   * test-shape.svg は「意味のない星」でしかなかった。
   *
   * glass.glb は Blender で作られた押し出し済みの立体文字なので、
   * 面の向きが場所ごとに変わる。GlassObject は素材を自前の
   * MeshPhysicalMaterial（transmission:1）で置き換えるため、
   * モデル側のマテリアル（metallic=1 の "glass"）は影響しない。
   * つまり必要なのは形状だけで、この GLB はその条件を満たす。
   */
  glassObject: {
    kind: "static",
    src: assetUrl("/models/glass.glb"),
    label: "ガラス化する立体文字",
  },
  /**
   * ParticleObject — RGB が保持されるので色付き素材が活きる。
   * キャラクターは輪郭も色数も豊かで、粒子化したときに元の形が読み取れる。
   * 軽い方（178KB）を使い、粒子数の暴発を避ける。
   */
  particleObject: {
    kind: "static",
    src: assetUrl("/images/character-sm.png"),
    label: "キャラクターイラスト",
  },
  /**
   * DitheredObject — GLB / glTF のみ。画像・SVG は受け付けない。
   *
   * glass.glb は要件を満たすことを確認済み:
   *   - GLB v2、外部 .bin / テクスチャ参照 0 件（自己完結）
   *   - extensionsRequired なし → Draco デコーダ不要
   *   - 203KB / 7,788 三角形 / メッシュ 1・マテリアル 1
   *
   * GlassObject と同じモデルを使っている。これは手抜きではなく、
   * 「同じ被写体を別の効果に通す」ことで効果そのものの差が読める、
   * という組み合わせ研究（03-combination-research.md）の意図に沿う。
   */
  ditheredObject: {
    kind: "static",
    src: assetUrl("/models/glass.glb"),
    label: "立体文字（GLB）",
  },
  lensSubject: {
    kind: "static",
    src: assetUrl(""),
    label: "設定資料（レンズ系の被写体）",
  },

  /**
   * asset-1.svg の使い道 —— Wrapper 系の被写体として使う。
   *
   * この SVG は 95% が埋め込み PNG で、<image> / <text> / <clipPath> を含む。
   * three.js の SVGLoader はそれらを解釈できないため、3D 用途には使えない
   * （実測: GlassObject では枠線だけの板になった）。
   *
   * 一方 <img> として表示する分にはブラウザが完全に描画するので、
   * Wrapper 系 22 種は問題なく加工できる。
   * 彩度と情報量が高く、ui-design.md §8 の color-artwork が求める
   * 「屈折・分割は色差がないと見えない」という条件にそのまま合う。
   */
  colorArtwork: {
    kind: "static",
    src: assetUrl("/svg/asset-1.svg"),
    label: "キービジュアル",
  },
} as const satisfies Record<string, AssetSource>;

export type AssetKey = keyof typeof assets;

/** 素材が未確定かどうか。読み込み中表示・代替表示の出し分けに使う */
export function isAssetPending(a: AssetSource): boolean {
  return a.src.trim() === "";
}
