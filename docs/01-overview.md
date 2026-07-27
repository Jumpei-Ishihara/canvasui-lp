# Canvas UI 全体像・アーキテクチャ分析

調査日: 2026-07-25 / 一次情報: https://canvasui.dev, `https://canvasui.dev/r/registry.json`, 各コンポーネントの実ソース

---

## 1. Canvas UI とは

> "An open source library of tasteful html-in-canvas & WebGL components"

- **25 コンポーネント** × **6 フレームワーク**（React / Vue / Svelte / Solid / Preact / Vanilla TS）= レジストリ 150 アイテム
- 配布形式は **shadcn レジストリ**。npm パッケージ依存ではなく、**ソースファイルが自分のリポジトリにコピーされる**
- 各コンポーネントは **単一ファイル完結**。同一エンジン・同一オプションでフレームワーク別に実装
- ライセンス: **MIT + Commons Clause**（個人・商用利用は無料。ただし「本体の販売」は不可）
- リポジトリ: https://github.com/DavidHDev/canvas-ui

### サイト表記の揺れについて
トップページは「25 components」、`/components` は「28」、`/docs` サイドバーは「30+」と表記が食い違うが、
**レジストリ実体は 25 種**（150 ÷ 6）。本資料は 25 種を正とする。

---

## 2. 最重要: 2 つのアーキテクチャ系統

ソースを全 25 本解析した結果、**構造がまったく異なる 2 系統**に分かれる。
これが LP 設計の土台になる。

| | **A: Wrapper 系** | **B: Object 系** |
|---|---|---|
| 数 | **22 / 25** | **3 / 25** |
| 該当 | Object 系以外すべて | `GlassObject` `ParticleObject` `DitheredObject` |
| API | `children` を包む | `src` でアセットを指定（children なし） |
| 描画対象 | **ページの実 DOM そのもの** | 外部 3D モデル / SVG / 画像 |
| 技術 | html-in-canvas + WebGL2 | three.js（WebGLRenderer） |
| npm 依存 | **なし** | `three` + `@types/three` |
| ブラウザ | **Chrome 限定（実験機能）** | **全モダンブラウザで動作** |
| 素材 | 不要（中身は自分のHTML） | **必須**（GLB/glTF/SVG/画像） |

### A: Wrapper 系のレンダリングパイプライン

```
<div position:relative>
  ├─ <canvas layoutsubtree="true">     ← ここに実DOMが子として入る（html-in-canvas）
  │    └─ <div>{children}</div>        ← 実際にクリック・選択・入力できる本物のHTML
  ├─ ctx.drawElementImage(content,0,0) ← DOMをピクセルへスナップショット
  ├─ WebGL2 でシェーダ処理             ← 屈折・歪み・パーティクル化など
  └─ <canvas aria-hidden pointer-events:none>  ← 結果を上に重ねる
</div>
```

**要点**: HTML は画像に置き換わるのではなく、**生きたまま**下にある。
出力キャンバスは `pointer-events: none` なので、クリック・テキスト選択・フォーム入力・
スクロールはすべて素通りして本物の DOM に届く。アクセシビリティも DOM 側に残る。

### B: Object 系
three.js の独立シーン。ページ DOM とは無関係に、指定した 3D モデル/SVG/画像を描画する。
html-in-canvas に依存しないため **Safari / Firefox でも動く**。
→ **非対応ブラウザでも「何か動いているもの」を見せられる唯一の手段**。LP のフォールバック戦略の要。

---

## 3. ブラウザ対応状況（LP 設計の最大の制約）

`html-in-canvas` API は **Chrome 専用の実験的機能**。

| 項目 | 状況 |
|---|---|
| 仕様 | HTML-in-Canvas API（`ctx.drawElementImage()` / `canvas.requestPaint()` / `layoutsubtree` 属性） |
| Chrome | **Origin Trial: Chrome 148〜150**（2026年5月時点） |
| ローカル開発 | `chrome://flags/#canvas-draw-element` を有効化（Chrome Canary 149+ 推奨） |
| 本番配信 | **Origin Trial トークン**を登録し `<meta http-equiv="origin-trial">` で配信 → 訪問者はフラグ不要 |
| 正式版 | 2026年後半にステーブル化予定（OT のメトリクス次第） |
| Firefox / Safari | **実装表明なし**。当面 Chrome 独占 |

### 検出とフォールバック
各コンポーネントは以下で対応判定し、非対応なら**自動的に素の HTML を描画**する（エラーは出ない）。

```ts
function supportsHtmlInCanvas(): boolean {
  const probe = document.createElement("canvas");
  const ctx = probe.getContext("2d");
  return Boolean(ctx && typeof ctx.drawElementImage === "function"
                     && typeof probe.requestPaint === "function");
}
```
さらに初期化失敗時も `failed` state で素の HTML に落ちる二段構え。
→ **LP のコンテンツは非対応ブラウザでも必ず読める**。方針として「自動フォールバック＋告知バナー」を採用。

---

## 4. 共通の品質保証（全 25 本で確認済み）

ソース全走査の結果、**25 本すべてに以下が実装されている**。

| 機構 | 実装 | 意味 |
|---|---|---|
| 画面外での停止 | `IntersectionObserver` | 25/25 |
| `prefers-reduced-motion` 尊重 | `matchMedia` | 25/25 |
| リサイズ追従 | `ResizeObserver` | 25/25 |
| DPR 対応 | `devicePixelRatio` | 25/25 |
| 完全クリーンアップ | `destroy()` で texture/program/shader/buffer を全削除 | 25/25 |
| イベント素通し | `pointer-events: none` | 22/22（Wrapper 系） |

### 解像度の非対称 — エフェクト越しの文字が甘く見える ⚠️

全 22 種の Wrapper 系で、**ソースキャンバスと出力キャンバスの解像度が揃っていない**。

```js
// 出力キャンバス（画面に出す側）— DPR を掛ける
const dpr = Math.min(window.devicePixelRatio || 1, 2);
output.width = output.clientWidth * dpr;        // Retina なら 2x

// ソースキャンバス（DOM を取り込む側）— CSS ピクセルのまま
const cssWidth = Math.max(1, Math.round(source.clientWidth));
source.width = cssWidth;                        // 1x のまま ★
```

```
DOM ──[1x でラスタライズ]──> ソースcanvas ──[texture]──> 2x の出力canvas
                                                  ↑ ここで 2 倍に拡大される
```

テクスチャフィルタが `gl.LINEAR` のため、拡大時に補間される。
結果として **Retina では、エフェクトを通した文字だけが実質半分の解像度**になり、
ドットが粗く見えるのではなく「にじんで」見える。

**理由（推測）**: `drawElementImage` は DOM 全体のラスタライズで負荷が高い。
2x にするとピクセル数が 4 倍になるため、性能とのトレードオフと思われる。
ただしソースに根拠のコメントは無く、意図的な判断か見落としかは判別できない。

#### 本 LP での扱い: **現状維持**（2026-07-26 決定）

修正は `source.width = cssWidth * dpr` の 1 行だが、
これは `components/canvasui/` の**ベンダーソース改変**にあたる。
G-4 / NFR-3.2「Canvas UI 本体は改変しない」に反し、
レジストリからの再取得時に上書きされて更新追従ができなくなる。

「加工されている」表現である以上、多少の甘さは効果の一部とも読めるため、
**仕様として受け入れる**。`ui-design.md` §3.2 の「被写体の文字は最小 h2 以上」という
指針は、結果的にこの制約への緩和策としても働いている。

### タッチ環境での制約 — カーソル追従型は実用上ほぼ効かない ⚠️

**25 種中 17 種**がポインタ入力に依存する（ベンダーソース走査で機械判定）。
スマートフォンでは次の 3 点により、本来の見え方にならない。

| # | 要因 | 詳細 |
|---|---|---|
| 1 | **ホバーが無い** | `pointermove` はタッチでも発火するが、**指を触れて動かしている間だけ**。マウスのような「乗せているだけ」の状態が存在しない |
| 2 | **スクロールに奪われる** | `touch-action` を指定しているのは Object 系 3 種のみ。残り 22 種は未指定のため、指でなぞるとブラウザがスクロールジェスチャを優先し、`pointercancel` でポインタストリームが途切れる |
| 3 | **中断からの復帰が無い** | `pointercancel` を処理しているのは `Frost` / `Liquid` / `ParticleObject` の 3 種のみ |

さらに `pointerleave` で効果が引っ込むため、指を離すたびにリセットされる。

#### 影響を受けない種

- **アンビエント系 5 種**（`VHS` `Glitch` `Blaze` `GlassObject` `DitheredObject`）— ポインタ非依存
- **スクロール駆動 3 種**（`Bend` `Laser` `ParticleScroll`）— スクロール量で動く
- **Object 系 3 種** — `touch-action: none` を指定済み

#### 本 LP での扱い: **事実を伝える**（2026-07-26 決定）

`touch-action` の未指定と `pointercancel` の未処理はライブラリ本体の実装であり、
修正にはベンダーソース改変が必要（G-4 / NFR-3.2 に抵触）。解像度の件と同じ構図。

そこで LP 側では次の 2 点で**制約を隠さず提示**する。

1. モバイル幅のとき、該当 17 セクションに注記を表示する
2. 「制約と限界」セクションに独立した項目として記載する

判定は `scripts/generate-component-meta.ts` が**ベンダーソースを走査して自動生成**する
（`pointerDependent` / `touchReady` / `touchLimited`）。手書きだと実態と乖離するため。

### 一方で、実装されていないもの ⚠️
| 機構 | 状況 | 影響 |
|---|---|---|
| `webglcontextlost` ハンドラ | **0 / 25** | WebGL コンテキストが失われると**自動復帰しない** |

これが後述の「コンテキスト予算」問題に直結する。**LP 設計上いちばん重要な制約**。

---

## 5. 導入方法

```bash
# React 版の例（1コンポーネントずつ）
npx shadcn@latest add @canvas-ui/liquid-react
```

`components.json` にレジストリを登録:
```json
{ "registries": { "@canvas-ui": "https://canvasui.dev/r/{name}.json" } }
```

- 既定の配置先: `components/canvasui/`（Svelte は `src/lib/components/canvasui/`）
- 手動導入も可（コンポーネントページでフレームワークを選んでコピー）
- 対応バージョン: **React 19 / Solid 1.9 / Preact 10 / Vue 3.5 / Svelte 5**、TypeScript 推奨

### MCP 連携
```bash
npx shadcn@latest mcp init --client claude
```
shadcn MCP サーバー経由で、AI アシスタントがレジストリの一覧取得・メタデータ参照・
コンポーネント追加まで実行できる。**本 LP の開発フローでそのまま活用できる**。

---

## 6. 分析からの結論（LP 設計への示唆）

1. **「全 25 機能を 1 ページに同時展示」は技術的に不可能**。WebGL コンテキスト予算の上限に当たる
   → セクション単位で切り替える構成が必須（詳細は `03-combination-research.md`）
2. **22 種は Chrome 限定**。訪問者の大半には素の HTML が見える前提で、コンテンツ自体が成立する設計にする
3. **Object 系 3 種が全ブラウザ対応の切り札**。ヒーロー領域など「誰にでも見せたい場所」に配置する価値が高い
4. **背景色の統制が必須**。多くのコンポーネントが `"auto"` でページ背景をサンプリングしたり、
   `background` / `gapColor` / `backing` で背景色の明示を要求する（`04-assets-requirements.md`）
5. **素材が必要なのは Object 系だけ**。残り 22 種は「自分の HTML」が素材そのもの
   → LP のコピーとレイアウトの質が、そのままエフェクトの見栄えになる
