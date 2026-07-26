import { createRoot, type Root } from "react-dom/client";
import type { ReactNode } from "react";

/**
 * HMR で createRoot が重複呼び出しされるのを防ぐ。
 *
 * 検証ハーネスではコンソールを常にきれいに保ちたい。
 * ノイズがあると T-1〜T-9 実施時に本物のエラーを見落とすため。
 */
const roots = new WeakMap<Element, Root>();

export function mountRoot(container: Element, node: ReactNode): void {
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  root.render(node);
}
