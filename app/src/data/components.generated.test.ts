import { describe, expect, it } from "vitest";
import { COMPONENT_COUNT, allSlugs, componentMeta } from "./components.generated";
import type { InteractionKind } from "./componentMeta.types";

/** test-plan.md §4.2 UT-22 / UT-23 / UT-24 */
describe("components.generated", () => {
  it("UT-22: 25 件生成されている", () => {
    expect(COMPONENT_COUNT).toBe(25);
    expect(allSlugs).toHaveLength(25);
    expect(Object.keys(componentMeta)).toHaveLength(25);
  });

  it("UT-23: 全件に interaction が設定されている", () => {
    const valid: InteractionKind[] = [
      "ambient",
      "lens",
      "field",
      "geometry",
      "scroll",
    ];
    for (const slug of allSlugs) {
      expect(valid).toContain(componentMeta[slug].interaction);
    }
  });

  it("UT-24: three 依存の 3 件が object、残り 22 件が wrapper", () => {
    const objects = allSlugs.filter((s) => componentMeta[s].family === "object");
    const wrappers = allSlugs.filter(
      (s) => componentMeta[s].family === "wrapper",
    );
    expect(objects.sort()).toEqual([
      "dithered-object",
      "glass-object",
      "particle-object",
    ]);
    expect(wrappers).toHaveLength(22);
  });

  it("family と各フラグの整合性が取れている", () => {
    for (const slug of allSlugs) {
      const m = componentMeta[slug];
      const isObject = m.family === "object";
      expect(m.requiresThree).toBe(isObject);
      expect(m.requiresAsset).toBe(isObject);
      expect(m.acceptsChildren).toBe(!isObject);
    }
  });

  it("総オプション数が調査結果（409）と一致する", () => {
    const total = allSlugs.reduce(
      (s, slug) => s + componentMeta[slug].optionCount,
      0,
    );
    expect(total).toBe(409);
  });

  it("導入コマンドと docs URL が slug から導出されている", () => {
    for (const slug of allSlugs) {
      const m = componentMeta[slug];
      expect(m.installCommand).toBe(
        `npx shadcn@latest add @canvas-ui/${slug}-react`,
      );
      expect(m.docsUrl).toBe(`https://canvasui.dev/docs/components/${slug}`);
      expect(m.slug).toBe(slug);
      expect(m.name).toMatch(/^[A-Z]/);
      expect(m.description.length).toBeGreaterThan(10);
    }
  });

  it("スクロール駆動型は 3 件（REQ-1.6 の対象）", () => {
    const scroll = allSlugs.filter(
      (s) => componentMeta[s].interaction === "scroll",
    );
    expect(scroll.sort()).toEqual(["bend", "laser", "particle-scroll"]);
  });
});
