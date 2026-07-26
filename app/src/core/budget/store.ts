import { selectPhases } from "./selectPhases";
import type { SectionObservation, SectionPhase, SelectConfig } from "./types";

interface Entry {
  el: Element | null;
  phase: SectionPhase;
  /** IntersectionObserver の粗い絞り込み結果 */
  intersecting: boolean;
  distance: number;
}

/**
 * 資源管理の本体（design.md §4 / module-spec.md §3）
 *
 * React に依存しない素のストア。テストしやすく、rAF の間引きも素直に書ける。
 * React 側は useSyncExternalStore で購読する。
 */
export class BudgetStore {
  private entries = new Map<string, Entry>();
  private listeners = new Set<() => void>();
  private frame = 0;
  private observer: IntersectionObserver | null = null;
  private snapshotCache: {
    capacity: number;
    activeCount: number;
    phases: ReadonlyMap<string, SectionPhase>;
  };

  constructor(private config: SelectConfig) {
    this.snapshotCache = { capacity: config.capacity, activeCount: 0, phases: new Map() };
    if (typeof IntersectionObserver !== "undefined") {
      // 粗い絞り込み。ビューポートの上下 300% を候補圏とする（design.md §4.5）
      this.observer = new IntersectionObserver(
        (records) => {
          for (const r of records) {
            const id = (r.target as HTMLElement).dataset.budgetId;
            if (!id) continue;
            const e = this.entries.get(id);
            if (e) e.intersecting = r.isIntersecting;
          }
          this.schedule();
        },
        { rootMargin: "300% 0px" },
      );
    }
  }

  setConfig(next: SelectConfig) {
    this.config = next;
    this.schedule();
  }

  getConfig(): SelectConfig {
    return this.config;
  }

  register(id: string, el: Element): () => void {
    const existing = this.entries.get(id);
    this.entries.set(id, {
      el,
      phase: existing?.phase ?? "dormant",
      intersecting: false,
      distance: Number.POSITIVE_INFINITY,
    });
    (el as HTMLElement).dataset.budgetId = id;
    this.observer?.observe(el);
    this.schedule();
    return () => {
      const e = this.entries.get(id);
      if (e?.el) this.observer?.unobserve(e.el);
      this.entries.delete(id);
      this.schedule();
    };
  }

  /** 描画に失敗したセクションを終端状態にする（REQ-4.7 / 不変条件 I-2） */
  reportFailure(id: string) {
    const e = this.entries.get(id);
    if (!e || e.phase === "failed") return;
    e.phase = "failed";
    this.schedule();
  }

  getPhase(id: string): SectionPhase {
    return this.entries.get(id)?.phase ?? "dormant";
  }

  subscribe = (cb: () => void): (() => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  getSnapshot = () => this.snapshotCache;

  /** スクロール・リサイズから呼ぶ。rAF で 1 フレーム 1 回に間引く */
  schedule = () => {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.recompute();
    });
  };

  dispose() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.observer?.disconnect();
    this.listeners.clear();
    this.entries.clear();
  }

  private recompute() {
    const vh = typeof window === "undefined" ? 0 : window.innerHeight;
    const center = vh / 2;

    // 交差しているものだけ測距する。非交差は候補圏外なので Infinity で足りる
    const observations: SectionObservation[] = [];
    for (const [id, e] of this.entries) {
      let distance = Number.POSITIVE_INFINITY;
      if (e.intersecting && e.el && vh > 0) {
        const r = e.el.getBoundingClientRect();
        distance = Math.abs((r.top + r.bottom) / 2 - center) / vh;
      }
      e.distance = distance;
      observations.push({ id, distance, phase: e.phase });
    }

    const next = selectPhases(observations, this.config);

    let changed = false;
    let activeCount = 0;
    for (const [id, phase] of next) {
      const e = this.entries.get(id);
      if (!e) continue;
      if (e.phase !== phase) {
        e.phase = phase;
        changed = true;
      }
      if (phase === "active") activeCount++;
    }

    if (
      changed ||
      this.snapshotCache.activeCount !== activeCount ||
      this.snapshotCache.capacity !== this.config.capacity
    ) {
      this.snapshotCache = {
        capacity: this.config.capacity,
        activeCount,
        phases: next,
      };
      for (const cb of this.listeners) cb();
    }
  }
}
