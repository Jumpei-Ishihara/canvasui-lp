import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  type ComponentType,
  type ReactNode,
} from "react";
import { componentMeta } from "@/data/components.generated";
import { EffectBoundary } from "./EffectBoundary";
import { useBudgetSlot } from "./RenderBudget";
import { Stage, type StagePreset } from "./Stage";
import { loadEffect, preloadEffect } from "./effectRegistry";
import { useHtmlInCanvasSupport } from "./SupportContext";

/** 描画が始まらない場合に failed とするまでの猶予（module-spec.md §4.3） */
const DRAW_WATCHDOG_MS = 1500;

export interface EffectSectionProps {
  /** 一意な識別子。RenderBudget の登録キー */
  id: string;
  /** 適用するエフェクトの slug */
  effect: string;
  effectProps?: Record<string, unknown>;
  stage?: StagePreset;
  isMobile?: boolean;
  /** エフェクトを常に無効にする（静的セクション用） */
  disabled?: boolean;
  /** ラベル行など、ステージの外に置く要素 */
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

type AnyProps = Record<string, unknown> & { children?: ReactNode };

const lazyCache = new Map<string, ComponentType<AnyProps>>();

function getLazyEffect(slug: string): ComponentType<AnyProps> {
  const hit = lazyCache.get(slug);
  if (hit) return hit;
  const C = lazy(() => loadEffect(slug)) as unknown as ComponentType<AnyProps>;
  lazyCache.set(slug, C);
  return C;
}

/**
 * 着脱の単位（design.md §5 / module-spec.md §4）
 *
 * 設計の中心となる着想は「所有関係の反転」（design.md §1.1）。
 * コンテンツは常にこのセクションが所有し、エフェクトは着脱可能なラッパーとして被せる。
 * これにより G-1（予算遵守）/ G-2（レイアウト不変）/ G-3（共通化）が同時に満たされる。
 */
export function EffectSection({
  id,
  effect,
  effectProps,
  stage = "card",
  isMobile = false,
  disabled = false,
  header,
  footer,
  children,
}: EffectSectionProps) {
  const { ref, phase, reportFailure } = useBudgetSlot(id);
  const supported = useHtmlInCanvasSupport();
  const meta = componentMeta[effect];
  const family = meta?.family ?? "wrapper";

  // Object 系は対応判定を無視する。three.js のみに依存するため（REQ-5.7）
  const shouldApply =
    phase === "active" && !disabled && (family === "object" || supported);

  // preloading の間にチャンクを取得しておく（ADR-4）
  useEffect(() => {
    if (phase === "preloading" || phase === "active") preloadEffect(effect);
  }, [phase, effect]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // 描画開始のウォッチドッグ（module-spec.md §4.3 / REQ-4.7）
  //
  // 検出対象は「canvas 要素そのものが用意されなかった」場合に限る。
  // 当初は出力キャンバス（aria-hidden 付き）を探していたが、これは誤りだった:
  //  - Object 系（three.js）の canvas に aria-hidden は付かないため、
  //    正常に描画していても必ず失敗と判定してしまう
  //  - WebGL の初期化に失敗した場合、Canvas UI 側が自前で素の HTML へ
  //    フォールバックする。内容は読めるので「失敗」として殺す必要はない
  // failed は終端状態（不変条件 I-2）で復帰できないため、判定は保守的に行う。
  useEffect(() => {
    if (!shouldApply) return;
    const timer = window.setTimeout(() => {
      const canvas = wrapperRef.current?.querySelector("canvas");
      const ok =
        canvas instanceof HTMLCanvasElement &&
        canvas.clientWidth > 0 &&
        canvas.clientHeight > 0;
      if (!ok) {
        console.warn(`[EffectSection] 描画が開始されませんでした: ${id}`);
        reportFailure();
      }
    }, DRAW_WATCHDOG_MS);
    return () => window.clearTimeout(timer);
  }, [shouldApply, id, reportFailure]);

  // Stage は「常に外側」に置く。エフェクトはその内側を 100% で埋める。
  //
  // 【重要】html-in-canvas が有効なとき、Canvas UI のラッパーは
  // source canvas を position:absolute で描画する。つまりルート div から見て
  // in-flow の子が 1 つも無くなり、**高さ 0 に潰れる**。
  // フラグ無効時は content div が in-flow なので潰れず、この不具合は現れない。
  // → T-1 を対応環境で実施して初めて発覚した（docs/03 §7.1）。
  //
  // Stage を外側に置けば固定寸法の箱が保証され、Wrapper 系・Object 系の
  // どちらも style で 100% を与えるだけで正しく収まる（ADR-2 の一般化）。
  const fill = { width: "100%", height: "100%" } as const;
  const Effect = shouldApply ? getLazyEffect(effect) : null;

  let stageContent: ReactNode = children;
  let outside: ReactNode = null;

  if (family === "object") {
    // Object 系は children を取らないため、children は常に外側へ置く（module-spec.md §4.5）。
    //
    // 【重要】活性・非活性のどちらでも外側に置くこと。
    // 当初は活性時のみ外に出していたが、そのせいで phase が変わるたびに
    // セクションの高さが変わり、スクロール中にレイアウトシフトが発生していた
    // （PT-03 の実測で CLS 0.05・2 回のシフトとして観測）。
    // 配置を固定すれば box が動かない（NFR-1.4 / G-2）。
    outside = children;
    stageContent = Effect ? (
      <EffectBoundary onError={reportFailure} fallback={null}>
        <Suspense fallback={null}>
          <Effect {...(effectProps ?? {})} style={fill} />
        </Suspense>
      </EffectBoundary>
    ) : null;
  } else if (Effect) {
    stageContent = (
      <EffectBoundary onError={reportFailure} fallback={children}>
        <Suspense fallback={children}>
          <Effect {...(effectProps ?? {})} style={fill}>
            {children}
          </Effect>
        </Suspense>
      </EffectBoundary>
    );
  }

  return (
    <section ref={ref} data-phase={phase} data-effect={effect}>
      {header}
      <div ref={wrapperRef}>
        {/* Stage は全分岐で同一。これが G-2（レイアウト不変）の担保 */}
        <Stage preset={stage} isMobile={isMobile}>
          {stageContent}
        </Stage>
        {outside}
      </div>
      {footer}
    </section>
  );
}
