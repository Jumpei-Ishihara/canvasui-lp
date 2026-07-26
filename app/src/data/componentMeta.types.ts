export type ComponentFamily = "wrapper" | "object";

/**
 * 相互作用の型。組み合わせ相性の判定に使う（REQ-3.1）。
 * 分類根拠は docs/03-combination-research.md §3（イベント購読の全数調査）。
 */
export type InteractionKind =
  /** ポインタ入力なし。積み重ねに最も安全 */
  | "ambient"
  /** カーソル追従の局所効果。同種どうしは競合する */
  | "lens"
  /** ポインタで乱れる場。全面効果 */
  | "field"
  /** ジオメトリ変形。同種どうしは競合する */
  | "geometry"
  /** スクロール量を占有する。同種の併用は不可 */
  | "scroll";

export interface ComponentMeta {
  slug: string;
  name: string;
  family: ComponentFamily;
  interaction: InteractionKind;
  description: string;
  optionCount: number;
  requiresThree: boolean;
  /** 外部アセットを要するか（Object 系のみ true） */
  requiresAsset: boolean;
  acceptsChildren: boolean;
  installCommand: string;
  docsUrl: string;
}
