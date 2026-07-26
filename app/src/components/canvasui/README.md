# canvasui/ — shadcn の導入先

```bash
npx shadcn@latest add @canvas-ui/glass-react
```

レジストリ定義の `target` は `components/canvasui/Glass.tsx`（プロジェクトルート基準）。
Vite + src 構成では出力先がずれる可能性があるため、**最初の 1 本を入れた時点で配置先を確認**し、
ずれていれば `components.json` の aliases か import パスを調整すること。

全 25 種の一覧とオプションは `docs/02-component-reference.md` を参照。
