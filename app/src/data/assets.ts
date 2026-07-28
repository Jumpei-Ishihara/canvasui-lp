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
   * GlassObject — アルファのシルエットだけが押し出され、色は捨てられる。
   * ロゴは白フチで文字が繋がり塊状になるため、輪郭の明快な図形を使う。
   * 実測: logo.png / asset-1.svg はどちらも判別できない形になった。
   */
  glassObject: {
    kind: "static",
    src: assetUrl("/svg/test-shape.svg"),
    label: "ガラス化する図形",
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
   * 手元に GLB が無いため未設定。src が空でもエラーにはならず、
   * 「素材待ち」の表示になる（REQ-7.3 / 7.4）。
   */
  ditheredObject: {
    kind: "static",
    src: assetUrl(""),
    label: "3D モデル（GLB）",
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
