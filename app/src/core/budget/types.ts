/** セクションのライフサイクル（design.md §4.2） */
export type SectionPhase = "dormant" | "preloading" | "active" | "failed";

export interface SectionObservation {
  id: string;
  /** ビューポート中心からの距離（ビューポート高さ単位）。未測定は Infinity */
  distance: number;
  /** 現在のフェーズ */
  phase: SectionPhase;
}

export interface SelectConfig {
  /** 同時活性上限。検証 T-6 の実測で確定する */
  capacity: number;
  /** 活性化閾値 */
  activateDistance: number;
  /** 解放閾値。activateDistance より大きいこと（ヒステリシス） */
  releaseDistance: number;
  /** チャンク先読み閾値。releaseDistance より大きいこと */
  prefetchDistance: number;
  /**
   * 現役ボーナス。振動を抑えるための距離割引。
   * 絶対優先にすると画面中心の新規セクションが永久に活性化されない（starvation）ため、
   * 優先ではなく割引にとどめる（module-spec.md §2.4 ケース 4）。
   */
  incumbentBonus: number;
}

/** 既定値。capacity は T-6 の実測で上書きする（requirements.md REQ-4.2） */
export const DEFAULT_SELECT_CONFIG: SelectConfig = {
  capacity: 8,
  activateDistance: 1.0,
  releaseDistance: 2.0,
  prefetchDistance: 3.0,
  incumbentBonus: 0.5,
};
