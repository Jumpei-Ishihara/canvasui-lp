import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  /** 失敗時に呼ぶ。RenderBudget へ failed を通知する（REQ-4.7） */
  onError: () => void;
  /** エフェクトを外した状態の表示。children と同じ内容でなければならない */
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * エフェクト部分のみを包むエラー境界（design.md §6.3）
 *
 * 方針: 1 セクションの失敗が他へ波及しないこと。
 */
export class EffectBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[EffectBoundary] エフェクトの描画に失敗しました", error, info);
    this.props.onError();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
