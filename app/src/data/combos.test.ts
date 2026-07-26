import { describe, expect, it } from "vitest";
import { combos } from "./combos";
import { adjacencyMatrix, interactionKinds, structuralMatrix } from "./categories";
import { componentMeta } from "./components.generated";

describe("combos", () => {
  it("すべてのプリセットが実在する slug を参照している", () => {
    for (const c of combos) {
      expect(componentMeta[c.outer.slug], `outer: ${c.outer.slug}`).toBeDefined();
      expect(componentMeta[c.inner.slug], `inner: ${c.inner.slug}`).toBeDefined();
    }
  });

  it("id が一意である", () => {
    const ids = combos.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("overlay は必ず「外側 Wrapper × 内側 Object」である（T-3 で成立が確認された形）", () => {
    const overlays = combos.filter((c) => c.kind === "overlay");
    expect(overlays.length).toBeGreaterThanOrEqual(2);
    for (const c of overlays) {
      expect(componentMeta[c.outer.slug].family).toBe("wrapper");
      expect(componentMeta[c.inner.slug].family).toBe("object");
      expect(c.verifiedBy).toBe("T-3");
    }
  });

  it("nested-fails は必ず「Wrapper × Wrapper」である（T-2 で不成立が確認された形）", () => {
    const fails = combos.filter((c) => c.kind === "nested-fails");
    expect(fails.length).toBeGreaterThanOrEqual(1);
    for (const c of fails) {
      expect(componentMeta[c.outer.slug].family).toBe("wrapper");
      expect(componentMeta[c.inner.slug].family).toBe("wrapper");
      expect(c.verifiedBy).toBe("T-2");
    }
  });

  it("REQ-2.3（読み替え後）: 並置の実演が 2 例以上ある", () => {
    expect(combos.filter((c) => c.kind === "juxtapose").length).toBeGreaterThanOrEqual(2);
  });

  it("REQ-2.9: 色指定に \"auto\" を使っていない", () => {
    for (const c of combos) {
      for (const props of [c.outer.props, c.inner.props]) {
        for (const [k, v] of Object.entries(props)) {
          expect(v, `${c.id}.${k}`).not.toBe("auto");
        }
      }
    }
  });

  it("すべてのプリセットに intent（狙いの説明）がある", () => {
    for (const c of combos) {
      expect(c.intent.length).toBeGreaterThan(10);
    }
  });
});

describe("相性マトリクス（REQ-3.3）", () => {
  it("構造マトリクスは全セルが実測に裏づけられている", () => {
    for (const row of ["wrapper", "object"] as const) {
      for (const col of ["wrapper", "object"] as const) {
        const cell = structuralMatrix[row][col];
        expect(cell.verifiedBy, `${row}×${col}`).not.toBeNull();
        expect(cell.rationale.length).toBeGreaterThan(10);
      }
    }
  });

  it("Wrapper × Wrapper は不可、Wrapper × Object は推奨", () => {
    expect(structuralMatrix.wrapper.wrapper.rating).toBe("avoid");
    expect(structuralMatrix.wrapper.wrapper.verifiedBy).toBe("T-2");
    expect(structuralMatrix.wrapper.object.rating).toBe("recommended");
    expect(structuralMatrix.wrapper.object.verifiedBy).toBe("T-3");
  });

  it("並置マトリクスは全セルが未検証として明示されている（推測を実測と混ぜない）", () => {
    for (const row of interactionKinds) {
      for (const col of interactionKinds) {
        const cell = adjacencyMatrix[row][col];
        expect(cell.verifiedBy, `${row}／${col}`).toBeNull();
        expect(cell.rationale.length).toBeGreaterThan(5);
      }
    }
  });

  it("並置マトリクスは 5×5 で対称な構造を持つ", () => {
    expect(interactionKinds).toHaveLength(5);
    for (const row of interactionKinds) {
      expect(Object.keys(adjacencyMatrix[row])).toHaveLength(5);
    }
  });

  it("スクロール駆動どうしの並置は不可", () => {
    expect(adjacencyMatrix.scroll.scroll.rating).toBe("avoid");
  });
});
