# svg/ — ベクター素材（現在は空）

`GlassObject` / `ParticleObject` は SVG を受け付け、`depth` / `bevel` で押し出して立体化する。
`DitheredObject` は GLB/glTF のみなので SVG 不可。

## 必要な SVG の条件（重要）
three.js の SVGLoader が解釈するのは
`path / rect / polygon / polyline / circle / ellipse / line / g / use` のみ。

- ❌ `<image>` は無視される（埋め込みラスタは消える）
- ❌ `<text>` は無視される（**必ずアウトライン化する**）
- ❌ `<clipPath>` は無視される
- ❌ グラデーション・パターン（fill: url(#…)）は未解決
- ❌ `fill: none` の線だけの図形はコンポーネント側で除外される
- ✅ 塗りのある閉じたパス。内側の穴は holes として正しく処理される

提供された `アセット 1.svg` は 95% が埋め込み PNG のため**そのままでは使えない**。
判定の詳細は docs/06-asset-motif-study.md を参照。

## 書き出し手順（Illustrator）
テキストをアウトライン化 → 画像を埋め込まない → クリップを解除 → SVG 書き出し
