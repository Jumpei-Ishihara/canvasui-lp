# styles/ — カラートークン（未実装）

**最優先で確定させる。** 多くのコンポーネントが背景色を知らないと正しく描画できない:
`Asciify.background` / `Cloth.backing` / `Clouds.color` / `HexFloat.gapColor` /
`Peel.shineColor` / `Shatter.gapColor` / `ParticleReveal.background` ほか。

- `"auto"` はページ背景のサンプリングだが、入れ子で壊れる可能性がある（docs/03 R5・T-5）
  → 組み合わせて使う箇所では RGB を明示指定する
- `Asciify` / `Cloth` / `Clouds` / `Peel` は prefers-color-scheme を購読する
  → 両テーマ検証が要る。**ダーク固定にして変数を減らすのを推奨**

`globals.css` を components.json の tailwind.css に指定済み（Tailwind 未導入なら要調整）。
