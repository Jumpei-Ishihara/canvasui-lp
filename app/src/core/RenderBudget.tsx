import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { BudgetStore } from "./budget/store";
import { DEFAULT_SELECT_CONFIG, type SectionPhase, type SelectConfig } from "./budget/types";

const BudgetCtx = createContext<BudgetStore | null>(null);

const MOBILE_QUERY = "(max-width: 639px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export interface BudgetConfig extends SelectConfig {
  /** モバイル時の上限（NFR-2.4） */
  capacityMobile: number;
}

export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  ...DEFAULT_SELECT_CONFIG,
  capacityMobile: 3,
};

/**
 * 実効 capacity（module-spec.md §3.2）
 * reduced-motion では上限自体を下げ、エフェクト数を減らす（design.md §11）。
 */
export function effectiveCapacity(
  config: BudgetConfig,
  isMobile: boolean,
  reducedMotion: boolean,
): number {
  const base = isMobile ? config.capacityMobile : config.capacity;
  const reduced = reducedMotion ? Math.ceil(base / 2) : base;
  return Math.max(1, reduced);
}

function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (typeof window === "undefined") return () => {};
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => (typeof window === "undefined" ? false : window.matchMedia(query).matches),
    () => false,
  );
}

export function RenderBudgetProvider({
  config: partial,
  children,
}: {
  config?: Partial<BudgetConfig>;
  children: ReactNode;
}) {
  const config = useMemo<BudgetConfig>(
    () => ({ ...DEFAULT_BUDGET_CONFIG, ...partial }),
    [partial],
  );
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_QUERY);

  const storeRef = useRef<BudgetStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = new BudgetStore({
      ...config,
      capacity: effectiveCapacity(config, isMobile, reducedMotion),
    });
  }
  const store = storeRef.current;

  // 画面幅・reduced-motion の変化で上限を切り替える（UT-05 相当の実行時変更）
  useEffect(() => {
    store.setConfig({
      ...config,
      capacity: effectiveCapacity(config, isMobile, reducedMotion),
    });
  }, [store, config, isMobile, reducedMotion]);

  useEffect(() => {
    const onScroll = () => store.schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    store.schedule();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [store]);

  useEffect(() => () => store.dispose(), [store]);

  return <BudgetCtx.Provider value={store}>{children}</BudgetCtx.Provider>;
}

function useStore(): BudgetStore {
  const store = useContext(BudgetCtx);
  if (!store) {
    throw new Error("RenderBudgetProvider の外で useBudgetSlot が呼ばれました");
  }
  return store;
}

/**
 * セクションを登録し、自身のフェーズを購読する（module-spec.md §3.1）。
 * セクション側は ref を付けて phase を見るだけでよい。
 */
export function useBudgetSlot(id: string): {
  ref: (el: HTMLElement | null) => void;
  phase: SectionPhase;
  reportFailure: () => void;
} {
  const store = useStore();
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback(
    (el: HTMLElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = el ? store.register(id, el) : null;
    },
    [store, id],
  );

  const phase = useSyncExternalStore(
    store.subscribe,
    () => store.getPhase(id),
    () => "dormant" as SectionPhase,
  );

  const reportFailure = useCallback(() => store.reportFailure(id), [store, id]);

  return { ref, phase, reportFailure };
}

/** 計測用（DebugHud / 受入 AC-3） */
export function useBudgetSnapshot() {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
