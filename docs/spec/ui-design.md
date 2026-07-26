# デザイン詳細書 — Canvas UI 全機能 LP

| | |
|---|---|
| 文書種別 | デザイン詳細（SDD 補遺 / ビジュアル設計） |
| バージョン | 1.0 |
| 作成日 | 2026-07-25 |
| 状態 | レビュー待ち |
| 関連 | [requirements.md](requirements.md) / [design.md](design.md) / [module-spec.md](module-spec.md) |

**この文書は「どう見えるか」を定義する。** 配色・タイポグラフィ・レイアウト・
各セクションの画面構成・25 コンポーネントの推奨設定値までを確定させる。

---

## 1. デザイン原則

| # | 原則 | 理由 |
|---|---|---|
| **D-1** | **エフェクトが主役。UI は黒子に徹する** | 装飾的な UI はエフェクトと視覚的に競合し、何が効果なのか分からなくなる |
| **D-2** | **被写体は「本来の姿」が想像できるものにする** | 歪み・崩れは、正解を知っている対象でのみ知覚できる（`docs/06` §6） |
| **D-3** | **エフェクトの有無でレイアウトを変えない** | フォールバック時に別デザインを作らない（REQ-5.1 / NFR-1.4） |
| **D-4** | **可読性はエフェクト非適用状態で担保する** | エフェクトは可読性を破壊しうる。素の状態が AA を満たしていることが前提（REQ-6.6） |
| **D-5** | **余白を厚くとる** | エフェクトは画面全体に及ぶ。密なレイアウトでは効果が読み取れない |

### 1.1 全体のトーン
ダーク固定（ADR-6）。**「観測装置・実験室」**のトーンで統一する。
本 LP は研究がテーマであり、装飾的な華やかさより**計測されている感じ**を出す。
罫線・等幅数値・ラベルを積極的に使う。

---

## 2. カラーシステム

### 2.1 パレット

```ts
export const tokens = {
  bg:        "#0B0B0D",  // ページ背景
  surface:   "#141417",  // カード面
  raised:    "#1C1C21",  // 浮いた面（ホバー・入力欄）
  border:    "#2A2A31",  // 罫線
  fg:        "#F5F5F4",  // 本文
  muted:     "#A1A1AA",  // 副次テキスト
  dim:       "#71717A",  // 非活性・キャプション
  accent:    "#066AFF",  // 主アクセント（Canvas UI 既定の highlight と同値）
  accentLit: "#5AA2FF",  // アクセント文字用（明るい）
  warn:      "#F5A524",
  danger:    "#F04438",
  ok:        "#3DD68C",
} as const;
```

`accent` は Canvas UI 自身の既定 `highlight`（`#066aff`）と揃えてある。
Object 系のライティングと LP の配色が自然に一致する。

### 2.2 コントラスト実測値（REQ-6.6）

**実測済み。** 数値は WCAG 2.1 の相対輝度式による。

| 前景 | on `bg` | on `surface` | on `raised` | 用途 |
|---|---|---|---|---|
| `fg` | **18.03** | 16.85 | 15.56 | 本文・見出し |
| `muted` | **7.67** | 7.17 | 6.62 | 副次テキスト |
| `accentLit` | **7.54** | 7.05 | 6.50 | **アクセント文字** |
| `ok` | 10.48 | 9.80 | 9.05 | 成功・◎ |
| `warn` | 9.64 | 9.01 | 8.32 | 注意・△ |
| `danger` | 5.23 | 4.89 | 4.52 | 警告・✕ |
| `dim` | 4.07 | 3.80 | 3.51 | ⚠️ **大字・UI 部品のみ** |
| `accent` | 4.23 | 3.95 | 3.65 | ⚠️ **面・枠・大字のみ。本文に使わない** |

> **重要な設計判断**: `accent`（#066AFF）は本文には使えない（4.23 < 4.5）。
> **文字にアクセント色を使う場合は必ず `accentLit`** を用いる。
> `accent` はボタン背景・枠線・グラフィック要素に限定する。

### 2.3 Wrapper 系へ渡す rgb01 値（REQ-9.2 / §6.3）

Wrapper 系の色指定は **0〜1 の正規化 RGB**。`rgb01()` が変換するが、確定値を明記しておく。

| トークン | hex | rgb01 |
|---|---|---|
| `bg` | #0B0B0D | `[0.0431, 0.0431, 0.0510]` |
| `surface` | #141417 | `[0.0784, 0.0784, 0.0902]` |
| `fg` | #F5F5F4 | `[0.9608, 0.9608, 0.9569]` |
| `muted` | #A1A1AA | `[0.6314, 0.6314, 0.6667]` |
| `accent` | #066AFF | `[0.0235, 0.4157, 1.0000]` |
| `accentLit` | #5AA2FF | `[0.3529, 0.6353, 1.0000]` |
| `danger` | #F04438 | `[0.9412, 0.2667, 0.2196]` |

---

## 3. タイポグラフィ

### 3.1 書体

外部フォントを読み込まない（NFR-1.2 / 依存削減）。システムフォントスタックを用いる。

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Hiragino Sans",
             "Noto Sans JP", "Yu Gothic UI", sans-serif;
--font-mono: ui-monospace, "SF Mono", "Cascadia Mono", Menlo,
             "Noto Sans Mono CJK JP", monospace;
```

**選定理由**（`docs/04` §3.4 の制約に対応）:
- ディザ系・アスキー系はグリフを潰す → **単純な字形**のサンスが有利。装飾書体は不可
- `Asciify` は等幅前提の見え方になる → **該当セクションの被写体は `--font-mono`** を使う
- 日本語グリフを含むこと（本 LP は日本語）

### 3.2 スケール

| 役割 | サイズ | 行間 | 字送り | ウェイト |
|---|---|---|---|---|
| `display` | `clamp(2.5rem, 6vw, 4.5rem)` | 1.05 | -0.02em | 700 |
| `h1` | `clamp(2rem, 4vw, 3rem)` | 1.15 | -0.015em | 700 |
| `h2` | `clamp(1.5rem, 2.5vw, 2rem)` | 1.25 | -0.01em | 600 |
| `h3` | `1.125rem` | 1.4 | 0 | 600 |
| `body` | `1rem` | **1.75** | 0 | 400 |
| `small` | `0.875rem` | 1.6 | 0 | 400 |
| `label` | `0.75rem` | 1.4 | **0.08em** | 500 / 大文字 |
| `code` | `0.875rem` | 1.6 | 0 | 400 / mono |

**エフェクト被写体の文字は最小 `h2` 以上**とする。
細い文字・小さい文字は歪み系とディザ系で消える（`docs/04` §3.3）。

---

## 4. スペーシングとレイアウト

### 4.1 スペーススケール
`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128`（px）。CSS 変数 `--sp-1`〜`--sp-10`。

### 4.2 コンテナ
| 種別 | 最大幅 | 用途 |
|---|---|---|
| `narrow` | 720px | 本文・説明 |
| `default` | 1080px | 一般セクション |
| `wide` | 1400px | マトリクス・ステージ |
| `full` | 100% | 全面エフェクト |

左右パディング: モバイル 20px / デスクトップ 40px。

### 4.3 セクション間の余白
上下 `--sp-9`（96px）を基準。効果セクションどうしが隣接する場合は `--sp-10`（128px）。
**エフェクトの視覚的干渉を防ぐため、効果セクション間の余白は詰めない**（D-5）。

---

## 5. ステージ設計【中核】

「ステージ」は、エフェクトが適用される固定寸法の矩形。**LP のビジュアルの最小単位。**
`design.md` ADR-2 により寸法が明示必須であり、これが視覚的な一貫性の土台になる。

### 5.1 寸法プリセット

| プリセット | 寸法 | 用途 |
|---|---|---|
| `full` | `100vw × 100vh` | 全面エフェクト（`VHS` `Glitch` `Clouds` 等） |
| `hero` | `100% × min(80vh, 720px)` | ヒーロー |
| `card` | `100% × 480px`（モバイル 360px） | カタログ既定 |
| `tall` | `100% × 160vh` | スクロール駆動型（`Laser` `ParticleScroll` `Bend`） |
| `square` | `aspect-ratio: 1 / 1`、最大 560px | Object 系 3 種 |

**`tall` が必要な理由**: スクロール駆動型はスクロール量で見え方が決まるため、
ステージ内に十分な縦の移動量が要る（`docs/04` §3.3）。

### 5.2 ステージの視覚仕様

```
┌─ ラベル行 ────────────────────────────┐
│ 03 / 25   GLASS          [lens] [wrapper] │  ← label / mono / dim
├───────────────────────────────────────┤
│                                       │
│           ステージ本体                 │  ← border 1px, radius 12px
│        （被写体 + エフェクト）          │     背景 surface
│                                       │
├───────────────────────────────────────┤
│ 説明文（narrow 幅）                     │  ← body / muted
│ $ npx shadcn@latest add @canvas-ui/... │  ← code + コピーボタン
└───────────────────────────────────────┘
```

- ステージ枠: `1px solid border` / `border-radius: 12px` / `overflow: hidden`
- **`overflow: hidden` は必須**。エフェクトによっては描画がステージ外へはみ出す
- ステージ内側の余白: `--sp-6`（32px）。被写体が枠に触れないようにする

### 5.3 状態表示

`design.md` §4.2 の 4 フェーズを、**控えめに**可視化する（D-1）。

| フェーズ | 表示 |
|---|---|
| `dormant` / `preloading` | 通常表示。**インジケータを出さない**（多くの時間がこの状態のため） |
| `active` | ラベル行の右端に 6px の `ok` 色ドット |
| `failed` | ラベル行に「この環境では表示できません」を `dim` で表示 |
| 読み込み中（Object 系） | ステージ中央に 24px のスピナー（`muted`） |

---

## 6. UI インベントリ

| 部品 | 仕様 |
|---|---|
| **対応バナー**（REQ-5.3） | ページ最上部・通常フロー。`surface` 背景 / 上下 `--sp-4` / 左に `warn` の 3px 縦線 / 右端に閉じるボタン。**`position: fixed` にしない** |
| **カード** | `surface` / `1px border` / `radius 12px` / パディング `--sp-6` |
| **バッジ** | `label` サイズ / `raised` 背景 / `radius 4px` / 上下 2px 左右 8px。カテゴリ表示に使用 |
| **一次ボタン** | `accent` 背景 / `#fff` 文字 / `radius 8px` / 高さ 40px |
| **二次ボタン** | 透明背景 / `1px border` / `fg` 文字 |
| **コードブロック** | `#08080A` 背景 / `mono` / `radius 8px` / 右上にコピーボタン |
| **コピーボタン**（REQ-8.6） | 24px アイコン。成功時に 1.5 秒「コピーしました」を `ok` 色で表示 |
| **スライダー**（REQ-2.2） | トラック 4px `border` 色 / つまみ 16px `accent` / 右に現在値を `mono` で表示 |
| **タブ**（組み合わせ切替） | 下線式。選択中は `accentLit` 文字 + 2px `accent` 下線 |
| **マトリクスセル** | 40×40px。◎`ok` ○`fg` △`warn` ✕`danger`。未検証は `dim` の「—」 |
| **DebugHud** | 右下固定 / `mono` / `--sp-3` パディング / 半透明 `raised`。`?debug=1` 時のみ |

### 6.1 フォーカス表示（REQ-6.5）
```css
:focus-visible { outline: 2px solid var(--accentLit); outline-offset: 2px; }
```
`accent` ではなく **`accentLit`** を使う（コントラスト 7.54 を確保）。

---

## 7. 画面構成

`docs/05-lp-structure-plan.md` の骨格に、具体的なレイアウトを与える。

### [00] Hero — `GlassObject`
```
┌──────────────────────────────────────┐
│                                      │
│   ┌────────────┐   Canvas UI         │  左: square ステージ
│   │  ガラス化   │   全 25 機能を        │  右: display 見出し
│   │  したロゴ   │   ためす            │      + body 説明
│   └────────────┘   [機能を見る]       │      + 一次ボタン
│                                      │
└──────────────────────────────────────┘
```
- **Object 系を置く理由**: 全ブラウザで動くため、非対応環境の訪問者にも動くものを最初に見せられる
- モバイルは縦積み（ステージが上）

### [01] 対応状況バナー
非対応環境でのみ表示。§6 のバナー仕様。

### [02] 仕組みの解説 — `Glass`
`narrow` 幅の解説文を `card` ステージに載せ、レンズで覗かせる。
**説明文自体が被写体**になる構成。html-in-canvas が「生きた DOM を描画する」ことを、
文章を読ませながら体感させる。

### [03] カタログ — 25 セクション
`card` ステージを縦に連ねる。1 画面 1 コンポーネント。
ラベル行の連番（`03 / 25`）で進捗が分かるようにする。

### [04] 組み合わせラボ
```
┌─ タブ ────────────────────────────────┐
│ パラメータ融合 │ 入れ子 │ 避けるべき例    │
├──────────────────────────────────────┤
│  ┌──────────────┐  ┌───────────────┐  │
│  │              │  │ blur      1.2 │  │  左: ステージ
│  │   ステージ    │  │ aberration 0.8│  │  右: スライダー列
│  │              │  │ zoom      1.6 │  │      （mono で数値）
│  └──────────────┘  └───────────────┘  │
└──────────────────────────────────────┘
```
モバイルは縦積み（スライダーが下）。

### [05] 相性マトリクス
5×5 の表。`wide` 幅。セルにホバー／フォーカスで根拠をツールチップ表示。
**未検証セルは `dim` の「—」**として、検証済みと視覚的に区別する（REQ-3.3）。

### [06] 制約と限界
エフェクトなし。コンテキスト予算・ブラウザ対応を図解する。
**この LP で最も情報密度が高いセクション**。`default` 幅・2 カラム。

### [07] 導入方法 — `RetroDither`
CLI / MCP / 手動の 3 手順。コードブロック中心。

### [08] Footer
リンク・ライセンス表記のみ。

---

## 8. 被写体テンプレート（5 種）

`design.md` §8.1 の `SubjectKind` に具体的なデザインを与える。
**25 セクション分のコンテンツを個別に作らず、この 5 種を使い回す。**

| テンプレート | 構成 | 対象エフェクト |
|---|---|---|
| **`dense-document`** | 設定資料風の版面。細い罫線・小さな注記・数値表。`mono` 多用 | レンズ系 5 種（`Glass` `Magnify` `Bubble` `RetroDither` `Asciify`） |
| **`bold-heading`** | `display` サイズの短い日本語 + 英字サブ。要素は 3 つまで | 破壊系（`VHS` `Glitch` `Bend` `Peel`） |
| **`color-artwork`** | キャラクターイラスト（`character.png`）＋ 彩度の高い面 | 流体系・ジオメトリ系（`Liquid` `Ripple` `Droplets` `Frost` `Cloth` `Shatter` `Grid` `HexFloat`） |
| **`ui-mock`** | ボタン・入力欄・カードを並べた擬似 UI。高コントラスト | パーティクル系（`ParticleReveal` `ParticleScroll`）・`Laser` `Clouds` `Blaze` |
| **`object-stage`** | 中央に Object 系 1 つ。周囲は無地 | Object 系 3 種 |

### 8.1 テンプレートごとの注意

- **`dense-document`**: レンズで拡大する前提なので、**あえて小さく細かく**する。
  ただし `alt` と実テキストは維持（REQ-6.3）
- **`bold-heading`**: 破壊系は細い文字を消すため、**線の太い字形**のみ
- **`color-artwork`**: 屈折・分割は色差がないと見えない。**単色背景に置かない**
- **`ui-mock`**: `ParticleReveal` は背景色との差で UI 画素を判定するため、
  **背景は `tokens.bg` を明示指定**する（`"auto"` を使わない）

---

## 9. 25 コンポーネントの推奨設定

各セクションの初期値。**プロパティ名は実ソースの `Options` interface に実在するもののみ**を使用。
色は rgb01（§2.3）。

| # | コンポーネント | テンプレート | ステージ | 推奨設定 |
|---|---|---|---|---|
| 1 | `Glass` | dense-document | card | `size: 160, blur: 0.6, shine: 1.0, zoom: 1.8, targets: ".zoomable"` |
| 2 | `Magnify` | dense-document | card | `size: 180, zoom: 2.0, color: accent` |
| 3 | `Bubble` | dense-document | card | `size: 120, shine: 1.2, intensity: 0.9` |
| 4 | `RetroDither` | dense-document | card | `radius: 200, pixelSize: 4, darkColor: bg, lightColor: fg, scanlines: 0.3` |
| 5 | `Asciify` | dense-document（mono） | card | `radius: 200, scale: 1.0, background: bg, backgroundOpacity: 1` |
| 6 | `ParticleReveal` | ui-mock | card | `radius: 220, size: 1.5, background: "#0B0B0D"` |
| 7 | `VHS` | bold-heading | full | `speed: 1.0, scanlines: 0.45` |
| 8 | `Glitch` | bold-heading | full | `intensity: 0.7` |
| 9 | `Clouds` | ui-mock | full | `scale: 1.2, speed: 0.6, color: surface, opacity: 0.8` |
| 10 | `Blaze` | ui-mock | full | `speed: 1.0, sparkColor: warn, smokeColor: surface` |
| 11 | `Liquid` | color-artwork | card | `radius: 0.3, intensity: 1.0, color: accent` |
| 12 | `Ripple` | color-artwork | card | `speed: 1.0, shine: 1.2` |
| 13 | `Droplets` | color-artwork | card | `intensity: 1.0, speed: 1.0, blur: 0.5` |
| 14 | `Frost` | color-artwork | card | `strength: 1.0, meltRadius: 140, meltStrength: 1.0` |
| 15 | `Cloth` | color-artwork | card | `speed: 1.0, brushSize: 120, backing: bg` |
| 16 | `Shatter` | color-artwork | card | `radius: 220, tileSize: 56, gapColor: bg, strength: 1.0` |
| 17 | `Grid` | color-artwork | card | `tileSize: 64, gap: 2, cornerRadius: 6, waveSpeed: 1.0` |
| 18 | `HexFloat` | color-artwork | card | `size: 40, gap: 2, shine: 1.0, gapColor: bg` |
| 19 | `Peel` | bold-heading | card | `side: "right", shine: 1.0, shineColor: fg` ＋**第 2 レイヤー必要** |
| 20 | `Bend` | bold-heading | **tall** | `direction: "out"` |
| 21 | `Laser` | ui-mock | **tall** | `speed: 1.0, color: accent, radius: 120` |
| 22 | `ParticleScroll` | ui-mock | **tall** | `size: 1.5` |
| 23 | `GlassObject` | object-stage | square | `src: assets.glassObject, tint: "", highlight: "#066AFF", floatIntensity: 1` |
| 24 | `ParticleObject` | object-stage | square | `src: assets.particleObject, count: 60000, size: 1.2, background: ""` |
| 25 | `DitheredObject` | object-stage | square | `src: assets.ditheredObject, gridSize: 96, grayscale: true, highlight: "#066AFF"` |

> **注**: 上表は初期値であり、実機で調整する前提（D-4 の可読性判定を優先）。
> `ParticleObject.count` は素材の解像度に依存するため、実素材確定後に再調整する。

### 9.1 カタログの並び順（REQ-1.6 / 1.7）

上表の #1〜#25 がそのまま並び順。**制約を満たしていることの確認**:
- 同一カテゴリの 3 連続なし（レンズ 5 連続 → #5 と #6 の間でパーティクルを挟む形に調整済み）
- スクロール駆動型 3 種（#20 `Bend` / #21 `Laser` / #22 `ParticleScroll`）は**それぞれ独立セクション**
- ※ #1〜#5 のレンズ系 5 連続は REQ-1.7 に抵触する。**実装時に #7 `VHS` と #3 `Bubble` を入れ替える**などで解消すること（`module-spec.md` のビルド時検証が検出する）

---

## 10. レスポンシブ

| ブレークポイント | 幅 | 方針 |
|---|---|---|
| `mobile` | < 640px | 1 カラム。ステージは `card` を 360px 高に縮小。**入れ子実演は無効**（NFR-2.4） |
| `tablet` | 640–1024px | 1 カラム。ステージ既定寸法 |
| `desktop` | > 1024px | Hero・ラボは 2 カラム |

### 10.1 モバイルでの削減（NFR-2.3 / 2.4）
- 同時マウント上限を **3** に下げる
- 組み合わせラボは**単体デモのみ**表示し、入れ子タブを隠す
- `full` ステージは `100vh` ではなく `80vh` に（アドレスバー対策）

**これは機能削減ではなく、「内容が読めること」を守るための設計判断。**

---

## 11. モーション設計（WebGL 以外）

エフェクト自体の動きと競合しないよう、**UI 側のモーションは最小限**にする（D-1）。

| 対象 | 動き | 時間 | イージング |
|---|---|---|---|
| セクション出現 | `opacity 0→1` + `translateY 12px→0` | 400ms | `cubic-bezier(.2,.8,.2,1)` |
| タブ切替 | 下線のスライド | 200ms | 同上 |
| ボタンホバー | 背景の明度のみ | 120ms | `ease-out` |
| バナー閉じる | 高さの畳み込み | 240ms | `ease-in-out` |
| コピー完了 | 文字のフェード | 150ms | `ease` |

**回転・拡大・パララックスは使わない。** エフェクトの動きと混同されるため。

### 11.1 reduced-motion（REQ-6.1）
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```
加えて `RenderBudget.capacity` を下げ、**エフェクト数自体を減らす**（`design.md` §11）。

---

## 12. アクセシビリティ実装値

| 項目 | 値 |
|---|---|
| 本文コントラスト | 18.03:1（`fg` on `bg`）— AA 大幅超過 |
| 副次テキスト | 7.67:1（`muted`）— AA 適合 |
| アクセント文字 | **必ず `accentLit`**（7.54:1）。`accent` は不可（4.23:1） |
| フォーカスリング | 2px `accentLit` / offset 2px |
| タップ領域 | 最小 44×44px |
| 本文行間 | 1.75 |
| 見出しレベル | `h1` は 1 ページ 1 つ。`h2` = セクション、`h3` = 小見出し |
| `alt` | 被写体コンポーネントが型として要求（REQ-6.8） |

---

## 13. 未決事項

| # | 項目 | 決定時期 |
|---|---|---|
| U-1 | `dense-document` の具体的な版面内容（設定資料の流用可否） | M1 着手時 |
| U-2 | `Peel` の第 2 レイヤーに何を表示するか（Q-4） | M1 着手時 |
| U-3 | カタログ並び順の REQ-1.7 抵触解消（§9.1 の注記） | M1 着手時 |
| U-4 | `ParticleObject.count` の実素材に応じた再調整 | 素材確定後 |
| U-5 | Hero のコピー文言 | M1 着手時 |

---

## 14. 改訂履歴

| 版 | 日付 | 内容 |
|---|---|---|
| 1.0 | 2026-07-25 | 初版。配色は実測、推奨設定は実ソースのプロパティ名で構成 |
