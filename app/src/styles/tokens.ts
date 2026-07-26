/**
 * 配色トークン（ui-design.md §2）
 *
 * ADR-6 によりダーク固定。prefers-color-scheme に追従しない。
 * ここが配色の単一の真実であり、セクション側で色を直書きしない（REQ-9.1 / N-3）。
 */
export const tokens = {
  bg: "#0B0B0D",
  surface: "#141417",
  raised: "#1C1C21",
  border: "#2A2A31",
  fg: "#F5F5F4",
  muted: "#A1A1AA",
  dim: "#71717A",
  /** 主アクセント。Canvas UI 既定の highlight と同値。コントラスト 4.23:1 のため本文には使えない */
  accent: "#066AFF",
  /** アクセント文字用。7.54:1。文字にアクセント色を使う場合は必ずこちら（ui-design.md §2.2） */
  accentLit: "#5AA2FF",
  warn: "#F5A524",
  danger: "#F04438",
  ok: "#3DD68C",
} as const;

export type TokenName = keyof typeof tokens;

/** 3 桁短縮形を 6 桁へ展開する */
function expandShorthand(hex: string): string {
  if (hex.length !== 3) return hex;
  return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
}

/**
 * CSS の hex を Wrapper 系が要求する [r, g, b] 0〜1 正規化値へ変換する。
 *
 * Wrapper 系の色指定は 0〜255 ではなく 0〜1（requirements.md §6.3）。
 * Object 系は CSS 文字列を取るため、この変換は不要。
 *
 * 受け付ける形式: "#RRGGBB" / "RRGGBB" / "#RGB" / "RGB"（大文字小文字を問わない）
 */
export function rgb01(hex: string): [number, number, number] {
  const raw = expandShorthand(hex.trim().replace(/^#/, ""));
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) {
    throw new Error(`rgb01: 不正な hex 形式です: ${JSON.stringify(hex)}`);
  }
  const n = Number.parseInt(raw, 16);
  return [
    round4(((n >> 16) & 0xff) / 255),
    round4(((n >> 8) & 0xff) / 255),
    round4((n & 0xff) / 255),
  ];
}

/** 小数第 4 位で丸める。シェーダへ渡す値の桁を安定させるため */
function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

/** トークン名から直接 rgb01 を得る糖衣 */
export function tokenRgb01(name: TokenName): [number, number, number] {
  return rgb01(tokens[name]);
}
