import { describe, expect, it } from "vitest";
import { rgb01, tokenRgb01, tokens } from "./tokens";

/** test-plan.md §4.2 UT-14 / UT-15 */
describe("rgb01", () => {
  it("UT-14: 既知値を変換する", () => {
    expect(rgb01("#FFFFFF")).toEqual([1, 1, 1]);
    expect(rgb01("#000000")).toEqual([0, 0, 0]);
    // ui-design.md §2.3 の確定値
    expect(rgb01("#0B0B0D")).toEqual([0.0431, 0.0431, 0.051]);
    expect(rgb01("#066AFF")).toEqual([0.0235, 0.4157, 1]);
    expect(rgb01("#F5F5F4")).toEqual([0.9608, 0.9608, 0.9569]);
    expect(rgb01("#A1A1AA")).toEqual([0.6314, 0.6314, 0.6667]);
    expect(rgb01("#5AA2FF")).toEqual([0.3529, 0.6353, 1]);
    expect(rgb01("#F04438")).toEqual([0.9412, 0.2667, 0.2196]);
  });

  it("UT-15: 入力形式を許容する（# 有無・大文字小文字・3 桁短縮）", () => {
    expect(rgb01("FFFFFF")).toEqual([1, 1, 1]);
    expect(rgb01("#ffffff")).toEqual([1, 1, 1]);
    expect(rgb01("#fff")).toEqual([1, 1, 1]);
    expect(rgb01("fff")).toEqual([1, 1, 1]);
    expect(rgb01("  #0B0B0D  ")).toEqual([0.0431, 0.0431, 0.051]);
    // 短縮形は 6 桁展開と一致する
    expect(rgb01("#0AF")).toEqual(rgb01("#00AAFF"));
  });

  it("UT-15: 不正な形式は例外を投げる", () => {
    expect(() => rgb01("#GGGGGG")).toThrow();
    expect(() => rgb01("#12345")).toThrow();
    expect(() => rgb01("")).toThrow();
    expect(() => rgb01("rgb(0,0,0)")).toThrow();
  });

  it("値域は常に 0〜1 に収まる", () => {
    for (const hex of Object.values(tokens)) {
      for (const v of rgb01(hex)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("tokenRgb01", () => {
  it("トークン名から変換できる", () => {
    expect(tokenRgb01("bg")).toEqual(rgb01(tokens.bg));
    expect(tokenRgb01("accent")).toEqual([0.0235, 0.4157, 1]);
  });
});

/**
 * ui-design.md §2.2 の設計判断をテストで固定する。
 * accent は本文に使えない（4.5:1 未満）。accentLit は使える。
 */
describe("コントラスト（REQ-6.6）", () => {
  const srgb = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum = (hex: string) => {
    const [r, g, b] = rgb01(hex).map((v) => srgb(v * 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  it("本文色は AA(4.5:1) を満たす", () => {
    expect(ratio(tokens.fg, tokens.bg)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(tokens.muted, tokens.bg)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(tokens.accentLit, tokens.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("accent は本文に使えない（設計判断の固定）", () => {
    expect(ratio(tokens.accent, tokens.bg)).toBeLessThan(4.5);
    expect(ratio(tokens.accent, tokens.bg)).toBeGreaterThanOrEqual(3);
  });
});

/**
 * globals.css の --color-* が tokens.ts と一致することを保証する。
 * 二重定義のドリフト防止（ui-design.md §2.1）。
 */
describe("globals.css との整合", () => {
  it("全トークンが CSS 変数として同じ値で定義されている", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    // vitest は app/ をルートとして実行される
    const css = readFileSync(
      resolve(process.cwd(), "src/styles/globals.css"),
      "utf8",
    );
    for (const [name, hex] of Object.entries(tokens)) {
      const m = css.match(new RegExp(`--color-${name}:\\s*([^;]+);`));
      expect(m, `--color-${name} が globals.css に無い`).not.toBeNull();
      expect(m![1].trim().toLowerCase()).toBe(hex.toLowerCase());
    }
  });
});
