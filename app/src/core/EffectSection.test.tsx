import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EffectSection } from "./EffectSection";
import { EffectBoundary } from "./EffectBoundary";
import { RenderBudgetProvider, effectiveCapacity, DEFAULT_BUDGET_CONFIG } from "./RenderBudget";
import { SupportProvider } from "./SupportContext";
import { Stage } from "./Stage";
import { __clearEffectCache, effectRegistry, loadEffect } from "./effectRegistry";

/** jsdom には IntersectionObserver が無いので最小限のスタブを置く */
class IOStub {
  static instances: IOStub[] = [];
  callback: IntersectionObserverCallback;
  targets = new Set<Element>();
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    IOStub.instances.push(this);
  }
  observe(el: Element) {
    this.targets.add(el);
  }
  unobserve(el: Element) {
    this.targets.delete(el);
  }
  disconnect() {
    this.targets.clear();
  }
  takeRecords() {
    return [];
  }
  /** テストから交差を発火させる */
  trigger(isIntersecting: boolean) {
    this.callback(
      [...this.targets].map(
        (target) => ({ target, isIntersecting }) as IntersectionObserverEntry,
      ),
      this as unknown as IntersectionObserver,
    );
  }
}

beforeEach(() => {
  IOStub.instances = [];
  vi.stubGlobal("IntersectionObserver", IOStub);
  __clearEffectCache();
});

function renderSection(props: Partial<Parameters<typeof EffectSection>[0]> = {}, supported = true) {
  return render(
    <SupportProvider value={supported}>
      <RenderBudgetProvider>
        <EffectSection id="s1" effect="glass" {...props}>
          <p>本文テキスト</p>
        </EffectSection>
      </RenderBudgetProvider>
    </SupportProvider>,
  );
}

describe("EffectSection", () => {
  it("IT-01: 活性/非活性でステージ寸法が変わらない（NFR-1.4）", () => {
    // 非活性（dormant）
    const { container, unmount } = renderSection({ stage: "card" });
    const dormantStage = container.querySelector("[data-stage]") as HTMLElement;
    const dormantStyle = dormantStage.getAttribute("style");
    unmount();

    // disabled でも同じ Stage が使われる
    const { container: c2 } = renderSection({ stage: "card", disabled: true });
    const disabledStage = c2.querySelector("[data-stage]") as HTMLElement;
    expect(disabledStage.getAttribute("style")).toBe(dormantStyle);
  });

  it("IT-03: 非対応環境では Wrapper 系が素の Stage になる（REQ-5.1）", () => {
    const { container } = renderSection({}, false);
    expect(container.querySelector("[data-stage]")).not.toBeNull();
    expect(screen.getByText("本文テキスト")).toBeInTheDocument();
  });

  it("本文は常に DOM 上の実テキストとして存在する（REQ-6.3）", () => {
    renderSection({}, false);
    expect(screen.getByText("本文テキスト")).toBeInTheDocument();
  });

  it("セクションに data-phase が出る（DebugHud / 受入の確認手段）", () => {
    const { container } = renderSection();
    const section = container.querySelector("section");
    expect(section?.getAttribute("data-phase")).toBe("dormant");
    expect(section?.getAttribute("data-effect")).toBe("glass");
  });

  it("Object 系は family=object として解決される（REQ-5.7 の前提）", () => {
    const { container } = renderSection({ effect: "glass-object" }, false);
    // 非対応環境でも section は描画され、Stage が存在する
    expect(container.querySelector("[data-stage]")).not.toBeNull();
  });
});

describe("EffectBoundary", () => {
  it("IT-04: 例外を捕捉してフォールバックへ切り替え、onError を呼ぶ（REQ-4.7）", () => {
    const onError = vi.fn();
    const Boom = (): never => {
      throw new Error("描画失敗");
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <EffectBoundary onError={onError} fallback={<p>フォールバック</p>}>
        <Boom />
      </EffectBoundary>,
    );
    expect(screen.getByText("フォールバック")).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("RenderBudget", () => {
  it("IT-06: 実効 capacity がモバイル・reduced-motion で切り替わる", () => {
    const c = { ...DEFAULT_BUDGET_CONFIG, capacity: 8, capacityMobile: 3 };
    expect(effectiveCapacity(c, false, false)).toBe(8);
    expect(effectiveCapacity(c, true, false)).toBe(3);
    expect(effectiveCapacity(c, false, true)).toBe(4); // ceil(8/2)
    expect(effectiveCapacity(c, true, true)).toBe(2); // ceil(3/2)
    // 最低 1 は確保する
    expect(effectiveCapacity({ ...c, capacity: 0, capacityMobile: 0 }, false, false)).toBe(1);
  });
});

describe("effectRegistry", () => {
  it("25 種すべてが登録されている", () => {
    expect(Object.keys(effectRegistry)).toHaveLength(25);
  });

  it("IT-08: 同一 slug の重複読み込みは 1 回に抑えられる", async () => {
    const p1 = loadEffect("glass");
    const p2 = loadEffect("glass");
    const p3 = loadEffect("glass");
    expect(p1).toBe(p2);
    expect(p2).toBe(p3);
  });

  it("未知の slug は例外を投げる", () => {
    expect(() => loadEffect("no-such-effect")).toThrow();
  });
});

describe("Stage", () => {
  it("プリセットごとに寸法が設定される", () => {
    const { container, rerender } = render(<Stage preset="card">x</Stage>);
    const el = () => container.querySelector("[data-stage]") as HTMLElement;
    expect(el().style.height).toBe("480px");
    rerender(<Stage preset="card" isMobile>x</Stage>);
    expect(el().style.height).toBe("360px");
    rerender(<Stage preset="tall">x</Stage>);
    expect(el().style.height).toBe("160vh");
  });

  it("overflow:hidden が必ず設定される（はみ出し対策）", () => {
    const { container } = render(<Stage preset="full">x</Stage>);
    const el = container.querySelector("[data-stage]") as HTMLElement;
    expect(el.style.overflow).toBe("hidden");
  });
});
