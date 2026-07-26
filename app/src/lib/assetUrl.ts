/**
 * public/ 配下のファイルを参照する URL を作る。
 *
 * 【なぜ必要か】
 * Vite は `import` されたアセットには base を付けるが、
 * 文字列で書いた絶対パス（"/svg/x.svg"）には**何もしない**。
 * base が "/" のうちは動いてしまうため気づけず、
 * GitHub Pages のプロジェクトサイト（base="/canvasui-lp/"）で初めて 404 になる。
 *
 * → public 配下を参照するときは必ずこの関数を通すこと。
 *   ローカル開発（base="/"）でも本番（base="/canvasui-lp/"）でも正しく解決される。
 *
 * 実際に本番で `/svg/test-shape.svg` が 404 になり、この関数を追加した。
 */
export function assetUrl(path: string): string {
  if (!path) return "";
  // 外部 URL と data/blob URL はそのまま通す（M4 のアップロード素材を想定）
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  // BASE_URL は常に "/" で終わる。先頭の "/" を落として連結する
  return import.meta.env.BASE_URL + path.replace(/^\/+/, "");
}
