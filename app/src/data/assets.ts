/**
 * 素材参照の単一定義（REQ-7.2 / G-6 / design.md §15.5-1）
 *
 * 【重要】この AssetSource は M4（素材アップロード）の前提。
 * Object 系セクションは kind を判定せず src だけを使うこと。
 * そうしておけば M4 で kind:"uploaded" を注入するだけで済み、
 * セクション実装を書き直さずに拡張できる。
 */
export type AssetSource =
  | { kind: "static"; src: string; label: string }
  | { kind: "uploaded"; src: string; label: string; revoke: () => void };

/**
 * 素材は調達中。現時点はプレースホルダで、確定後にここだけ差し替える（M1-11）。
 * src が空文字のとき Object 系は描画されないが、エラーにはならない。
 */
export const assets = {
  glassObject: {
    kind: "static",
    src: "",
    label: "ロゴ（アウトライン化 SVG）",
  },
  particleObject: {
    kind: "static",
    src: "",
    label: "キャラクターイラスト",
  },
  ditheredObject: {
    kind: "static",
    src: "",
    label: "3D モデル（GLB）",
  },
  lensSubject: {
    kind: "static",
    src: "",
    label: "設定資料（レンズ系の被写体）",
  },
} as const satisfies Record<string, AssetSource>;

export type AssetKey = keyof typeof assets;

/** 素材が未確定かどうか。読み込み中表示・代替表示の出し分けに使う */
export function isAssetPending(a: AssetSource): boolean {
  return a.src.trim() === "";
}
