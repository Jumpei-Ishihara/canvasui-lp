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
/**
 * base を取り出す。
 *
 * このモジュールは Vite だけでなく、ビルド時検証（validate-catalog）からも
 * 素の Node（tsx）経由で読み込まれる。Node には import.meta.env が無いため、
 * 素朴に参照すると検証スクリプトが落ちる（実際にビルドが失敗した）。
 * 取得できない場合は "/" として扱う — 検証はパスの整合だけを見るので支障ない。
 */
function baseUrl(): string {
  const env = (import.meta as { env?: { BASE_URL?: string } }).env;
  return env?.BASE_URL ?? "/";
}

export function assetUrl(path: string): string {
  if (!path) return "";
  // 外部 URL と data/blob URL はそのまま通す（M4 のアップロード素材を想定）
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  // base は常に "/" で終わる。先頭の "/" を落として連結する
  return baseUrl() + path.replace(/^\/+/, "");
}
