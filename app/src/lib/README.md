# lib/ — 共通部品（未実装）

実装フェーズで最初に作るもの:

1. **マウント予算マネージャ** — 同時マウントを 6〜8 に制限する `<Section>` ラッパー。
   画面外セクションを条件付きレンダリングから外して WebGL コンテキストを解放する。
   ※ 各コンポーネント内蔵の IntersectionObserver は rAF を止めるだけでコンテキストは解放しない。
   詳細: docs/03-combination-research.md §5

2. **RGB 変換ヘルパー** — Wrapper 系の色指定は `[r, g, b]` の 0〜1 正規化値（0〜255 ではない）。
   カラートークンから変換する関数を置く。Object 系は CSS 文字列を取るので変換不要。

3. **html-in-canvas 対応判定** — 告知バナーの出し分け用。
   `ctx.drawElementImage` と `canvas.requestPaint` の存在で判定する。
