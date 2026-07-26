import { describe, expect, it } from "vitest";
import { selectPhases } from "./selectPhases";
import type { SectionObservation, SectionPhase, SelectConfig } from "./types";

/**
 * test-plan.md §4.1 UT-01〜UT-13
 * 共通設定: capacity=3, activate=1.0, release=2.0, prefetch=3.0, incumbentBonus=0.5
 */
const CFG: SelectConfig = {
  capacity: 3,
  activateDistance: 1.0,
  releaseDistance: 2.0,
  prefetchDistance: 3.0,
  incumbentBonus: 0.5,
};

const obs = (
  id: string,
  distance: number,
  phase: SectionPhase = "dormant",
): SectionObservation => ({ id, distance, phase });

const countActive = (m: Map<string, SectionPhase>) =>
  [...m.values()].filter((p) => p === "active").length;

describe("selectPhases — 境界条件", () => {
  it("UT-01: 候補ゼロなら dormant", () => {
    const r = selectPhases([obs("a", 5.0)], CFG);
    expect(r.get("a")).toBe("dormant");
  });

  it("UT-02: 候補が capacity 未満なら全て active", () => {
    const r = selectPhases([obs("a", 0.1), obs("b", 0.5)], CFG);
    expect(r.get("a")).toBe("active");
    expect(r.get("b")).toBe("active");
  });

  it("UT-03: 候補が capacity 超過なら近い順に capacity 個", () => {
    const r = selectPhases(
      [obs("a", 0.1), obs("b", 0.2), obs("c", 0.3), obs("d", 0.4)],
      CFG,
    );
    expect(r.get("a")).toBe("active");
    expect(r.get("b")).toBe("active");
    expect(r.get("c")).toBe("active");
    // 溢れたが先読み距離内なので preloading
    expect(r.get("d")).toBe("preloading");
    expect(countActive(r)).toBe(3);
  });

  it("UT-04: starvation 回避 — 中心の新規が現役を押し出す", () => {
    // 現役 3 件は実効 1.3 / 1.4 / 1.45、新規は 0.1
    const r = selectPhases(
      [
        obs("inc180", 1.8, "active"),
        obs("inc190", 1.9, "active"),
        obs("inc195", 1.95, "active"),
        obs("fresh", 0.1, "dormant"),
      ],
      CFG,
    );
    expect(r.get("fresh")).toBe("active");
    expect(r.get("inc180")).toBe("active");
    expect(r.get("inc190")).toBe("active");
    // 最も遠い現役が押し出される
    expect(r.get("inc195")).toBe("preloading");
    expect(countActive(r)).toBe(3);
  });

  it("UT-04b: 現役ボーナスは働く — わずかに近いだけの新規は現役を追い出さない", () => {
    // 現役 0.9（実効 0.4）vs 新規 0.6（実効 0.6）→ 現役が残る
    const r = selectPhases(
      [obs("inc", 0.9, "active"), obs("fresh", 0.6, "dormant")],
      { ...CFG, capacity: 1 },
    );
    expect(r.get("inc")).toBe("active");
    expect(r.get("fresh")).toBe("preloading");
  });

  it("UT-05: capacity が実行時に減少したら最遠から解放", () => {
    const input = [
      obs("a", 0.1, "active"),
      obs("b", 0.2, "active"),
      obs("c", 0.3, "active"),
    ];
    const r = selectPhases(input, { ...CFG, capacity: 1 });
    expect(r.get("a")).toBe("active");
    expect(r.get("b")).toBe("preloading");
    expect(r.get("c")).toBe("preloading");
    expect(countActive(r)).toBe(1);
  });

  it("UT-06: 未測定（Infinity）は dormant", () => {
    const r = selectPhases([obs("a", Number.POSITIVE_INFINITY)], CFG);
    expect(r.get("a")).toBe("dormant");
  });

  it("UT-07: 全て failed なら active は 0 件", () => {
    const r = selectPhases(
      [obs("a", 0.1, "failed"), obs("b", 0.2, "failed")],
      CFG,
    );
    expect(r.get("a")).toBe("failed");
    expect(r.get("b")).toBe("failed");
    expect(countActive(r)).toBe(0);
  });

  it("UT-08: 同値は id 昇順で決定される", () => {
    const r = selectPhases([obs("b", 0.5), obs("a", 0.5)], {
      ...CFG,
      capacity: 1,
    });
    expect(r.get("a")).toBe("active");
    expect(r.get("b")).toBe("preloading");
  });
});

describe("selectPhases — 不変条件", () => {
  it("UT-09 (I-1): active は常に capacity 以下", () => {
    let seed = 12345;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const phases: SectionPhase[] = [
      "dormant",
      "preloading",
      "active",
      "failed",
    ];
    for (let trial = 0; trial < 100; trial++) {
      const capacity = Math.floor(rand() * 10);
      const input = Array.from({ length: 100 }, (_, i) =>
        obs(`s${i}`, rand() * 4, phases[Math.floor(rand() * 4)]),
      );
      const r = selectPhases(input, { ...CFG, capacity });
      expect(countActive(r)).toBeLessThanOrEqual(capacity);
    }
  });

  it("UT-10 (I-2): failed は他フェーズへ遷移しない", () => {
    const r = selectPhases(
      [obs("f", 0.0, "failed"), obs("a", 0.1), obs("b", 0.2)],
      CFG,
    );
    expect(r.get("f")).toBe("failed");
  });

  it("UT-11 (I-3): releaseDistance 超過の現役は active にならない", () => {
    const r = selectPhases([obs("far", 2.1, "active")], CFG);
    expect(r.get("far")).not.toBe("active");
    expect(r.get("far")).toBe("preloading");
  });

  it("UT-11b (I-3): 境界値 releaseDistance ちょうどの現役は維持される", () => {
    const r = selectPhases([obs("edge", 2.0, "active")], CFG);
    expect(r.get("edge")).toBe("active");
  });

  it("UT-12 (I-4): 同一入力なら出力も同一（決定性）", () => {
    const input = [
      obs("a", 0.4, "active"),
      obs("b", 0.4, "dormant"),
      obs("c", 1.5, "active"),
      obs("d", 2.5, "dormant"),
    ];
    const r1 = selectPhases(input, CFG);
    const r2 = selectPhases(input, CFG);
    expect([...r1.entries()].sort()).toEqual([...r2.entries()].sort());
  });

  it("UT-13 (I-5): capacity 0 なら active は 0 件", () => {
    const r = selectPhases([obs("a", 0.0), obs("b", 0.1)], {
      ...CFG,
      capacity: 0,
    });
    expect(countActive(r)).toBe(0);
    expect(r.get("a")).toBe("preloading");
  });

  it("全ての入力 id が結果に含まれる", () => {
    const input = [obs("a", 0.1), obs("b", 5.0, "failed"), obs("c", 9.9)];
    const r = selectPhases(input, CFG);
    expect([...r.keys()].sort()).toEqual(["a", "b", "c"]);
  });
});
