import type { InteractionKind } from "./componentMeta.types";

export type Rating = "recommended" | "ok" | "caution" | "avoid";

export interface Cell {
  rating: Rating;
  /** 根拠。REQ-3.2 で必須 */
  rationale: string;
  /**
   * 根拠となった検証 ID（T-2 等）。null は「未検証・設計判断」。
   * REQ-3.3 により、null のセルは UI 上で必ず区別して表示する。
   */
  verifiedBy: string | null;
}

export const RATING_MARK: Record<Rating, string> = {
  recommended: "◎",
  ok: "○",
  caution: "△",
  avoid: "✕",
};

export const INTERACTION_LABEL: Record<InteractionKind, string> = {
  ambient: "アンビエント",
  lens: "レンズ",
  field: "撹乱場",
  geometry: "ジオメトリ",
  scroll: "スクロール駆動",
};

export const INTERACTION_DESC: Record<InteractionKind, string> = {
  ambient: "ポインタに反応しない。常時一定の効果",
  lens: "カーソルを追う局所的な効果",
  field: "ポインタで乱れる場。全面に及ぶ",
  geometry: "座標そのものを作り替える",
  scroll: "スクロール量で見え方を占有する",
};

/* ------------------------------------------------------------------ *
 * 1. 構造的な合成可否【実測で確定】
 *
 * 検証 T-2 / T-3 の結果。ここは推測を一切含まない。
 * ------------------------------------------------------------------ */
export type Family = "wrapper" | "object";

export const structuralMatrix: Record<Family, Record<Family, Cell>> = {
  wrapper: {
    wrapper: {
      rating: "avoid",
      rationale:
        "内側ラッパーの WebGL 出力が外側の drawElementImage に黒として取り込まれ、効果が消える。順序を入れ替えても同じ。",
      verifiedBy: "T-2",
    },
    object: {
      rating: "recommended",
      rationale:
        "three.js の canvas は layoutsubtree による入れ子キャプチャを伴わないため、外側から普通の canvas として取り込まれる。成立する唯一の重ね合わせ。",
      verifiedBy: "T-3",
    },
  },
  object: {
    wrapper: {
      rating: "avoid",
      rationale:
        "Object 系は children を取らないため、内側に Wrapper を置くことが構造的にできない。",
      verifiedBy: "T-1",
    },
    object: {
      rating: "caution",
      rationale:
        "重ねる手段が無い。並置は可能だが、それぞれが WebGL コンテキストを 1 個ずつ消費する。",
      verifiedBy: "T-6",
    },
  },
};

/* ------------------------------------------------------------------ *
 * 2. 並置したときの相性【設計指針】
 *
 * 入れ子が不成立と判明したため、この表は「重ねられるか」ではなく
 * 「隣り合わせたとき / 続けて見せたときに喧嘩しないか」を示す。
 * 視覚判断であり実測ではないため、verifiedBy はすべて null。
 * ------------------------------------------------------------------ */
const KINDS: InteractionKind[] = ["ambient", "lens", "field", "geometry", "scroll"];

function cell(rating: Rating, rationale: string): Cell {
  return { rating, rationale, verifiedBy: null };
}

const A = cell("recommended", "動きの質が異なるため隣り合っても混同されない");
const OK = cell("ok", "並置して問題ない");
const CAUTION_SAME_LENS = cell(
  "caution",
  "どちらもカーソルを追うため、視線が 2 か所に割れる。サイズか追従速度を大きく変える",
);
const CAUTION_SAME_GEO = cell(
  "caution",
  "どちらも形を崩すため、隣り合うと「何が元の形か」が分からなくなる",
);
const AVOID_SCROLL = cell(
  "avoid",
  "どちらもスクロール量を占有する。同一画面に入れると操作が競合する",
);

export const adjacencyMatrix: Record<InteractionKind, Record<InteractionKind, Cell>> =
  Object.fromEntries(
    KINDS.map((row) => [
      row,
      Object.fromEntries(
        KINDS.map((col) => {
          if (row === "lens" && col === "lens") return [col, CAUTION_SAME_LENS];
          if (row === "geometry" && col === "geometry") return [col, CAUTION_SAME_GEO];
          if (row === "scroll" && col === "scroll") return [col, AVOID_SCROLL];
          if (row === "ambient" || col === "ambient") return [col, A];
          return [col, OK];
        }),
      ),
    ]),
  ) as Record<InteractionKind, Record<InteractionKind, Cell>>;

export const interactionKinds = KINDS;
