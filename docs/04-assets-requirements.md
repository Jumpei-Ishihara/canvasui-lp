# 必要なもの・素材の検討

「何を用意すれば 25 機能すべてを展示できるか」の棚卸し。

---

## 1. 素材が必要なのは Object 系 3 種だけ

全 25 本のソースを確認した結果、**外部アセットを要求するのは 3 コンポーネントのみ**。
残り 22 種の「素材」は**自分で書く HTML そのもの**。

```ts
// 3種とも src の既定値は空文字 = 自前で用意しないと何も表示されない
src: ""
```

| コンポーネント | 受け付ける形式 | 必要数の目安 |
|---|---|---|
| `GlassObject` | GLB / glTF / SVG / PNG / JPEG / WebP / GIF | 1〜2 |
| `ParticleObject` | GLB / glTF / SVG / PNG / JPEG / WebP / GIF | 1〜2 |
| `DitheredObject` | **GLB / glTF のみ** | 1 |

> ⚠️ **同じ 2D 画像を渡しても 3 種の処理はまったく違う。**
> `GlassObject` は**アルファのシルエットだけ**を抽出して押し出す（色は捨てられる）。
> `ParticleObject` は**ピクセルの RGB を保持**する。`DitheredObject` は画像・SVG を受け付けない。
> モチーフ選定はこの差で決まる → **[06-asset-motif-study.md](06-asset-motif-study.md)**

- 形式は**拡張子ではなくバイト列から判定**される
- `<input type="file">` の Object URL も渡せる → **来訪者が自分のモデルを投げ込めるデモ**が作れる（LP の目玉候補）
- 2D アセット（SVG / 画像）は `depth` / `bevel` で押し出して立体化される
  → **ロゴ SVG 1 枚あれば `GlassObject` と `ParticleObject` の両方が成立する**。最小コストの解

### 調達方針（推奨）
1. **まず自作ロゴの SVG 1 枚**で 3 種すべてを賄う（`DitheredObject` 用には要 GLB 化）
2. 3D らしさが欲しい箇所だけ GLB を追加
3. 外部調達する場合はライセンス確認必須（Poly Haven / Sketchfab の CC0 など）
4. GLB は**ポリゴン数を抑える**。`ParticleObject` は頂点をパーティクル化するため重いモデルは致命的

---

## 2. 技術要件

### 2-1. Chrome Origin Trial トークン（本番配信に必須）
22/25 が html-in-canvas 依存。本番で訪問者にフラグ操作をさせないために必要。

- 登録先: Chrome Origin Trials（HTML-in-Canvas / Chrome 148〜150）
- 配信方法: `<meta http-equiv="origin-trial" content="TOKEN">`
- **ドメイン単位で発行**されるため、デプロイ先ドメインを先に決める必要がある
- 有効期限があるため**失効日を管理**する（失効すると全 22 種が素の HTML に落ちる）

### 2-2. ローカル開発環境
```
chrome://flags/#canvas-draw-element  を有効化
```
- Chrome Canary 149 以降を推奨
- **通常の Chrome / Safari / Firefox では 22 種が動かない**ので、開発時のブラウザを固定する

### 2-3. npm 依存
```
three  +  @types/three     ← Object系3種を使う場合のみ
```
Wrapper 系 22 種は **npm 依存ゼロ**。

### 2-4. Draco デコーダ
Object 系 3 種は既定で外部 CDN を参照する:
```
https://www.gstatic.com/draco/versioned/decoders/1.5.7/
```
- Draco 圧縮 GLB を使うときだけ取得される
- 外部依存を避けるなら `dracoDecoderPath` を `/draco/` に変更し、デコーダを自前ホストする
  → `app/public/draco/` を用意済み

---

## 3. デザイン面で先に決めるべきもの

### 3-1. 背景カラートークン（最優先）
多くのコンポーネントが**背景色を知らないと正しく描画できない**。

| コンポーネント | 該当オプション | 挙動 |
|---|---|---|
| `Asciify` | `background: [r,g,b] \| "auto"` | 文字の下地色 |
| `Cloth` | `backing: [r,g,b] \| "auto"` | 透過部分の布地色 |
| `Clouds` | `color: [r,g,b] \| "auto"` | 霧の色 |
| `HexFloat` | `gapColor: [r,g,b] \| "auto"` | タイルの目地色 |
| `Peel` | `shineColor: [r,g,b] \| "auto"` | めくれ面の光沢色 |
| `Shatter` | `gapColor: [r,g,b]` | 破片の裏の空隙色 |
| `ParticleReveal` | `background: string` | **UI ピクセルと余白の判別に使う** |
| `Blaze` | `sparkColor` / `smokeColor` | 火の粉・煙 |
| `RetroDither` | `darkColor` / `lightColor` | 2 色パレット |
| `Laser` / `Liquid` / `Magnify` | `color` | 発光色 |

**注意点 2 つ**
- 色指定は **`[r, g, b]` で 0〜1 の正規化値**（0〜255 ではない）。CSS 文字列を取るのは Object 系のみ
- `"auto"` はページ背景のサンプリング。**入れ子で使うと壊れる可能性**（`03` の R5 / T-5）

→ **`app/src/styles/` に背景色を単一のソースとして定義し、0〜1 の RGB 配列へ変換するヘルパーを置く**。
   これが無いと 25 セクションで色がバラける。

### 3-2. ライト／ダークの方針
`Asciify` `Cloth` `Clouds` `Peel` は `prefers-color-scheme` を購読して自動で色を変える。
→ **両テーマで検証が必要**。もしくは LP をダーク固定にして変数を減らす（推奨）。

### 3-3. コンテンツ設計
Wrapper 系 22 種は「自分の HTML」を描画対象にするため、**中身の質がそのまま効果の質**になる。
- 文字は**大きく・コントラスト高く**。細い文字は歪み系・ディザ系で消える
- `Glass` の `targets` は**CSS セレクタ**を取る → ズーム対象にしたい要素にクラスを用意する
- `Peel` は**めくった下に見える第 2 レイヤー**の内容が必要
- `Laser` / `ParticleScroll` は**スクロールする縦の長さ**が必要 → セクション高さを確保する

### 3-4. フォント
ディザ系・アスキー系はグリフを潰すため、**可変フォントより単純な形の書体**が有利。
`Asciify` は等幅フォント前提の見え方になる。

---

## 4. 用意しないでよいもの（判断の記録）

| 項目 | 理由 |
|---|---|
| 各エフェクトの録画動画 | 「自動フォールバック＋告知バナー」方針を採用したため不要。25 本分の撮影コストを回避 |
| 画像素材（Wrapper 系用） | Wrapper 系は HTML を描画対象にするので不要 |
| WebGL / シェーダの自作 | 全 25 種に同梱済み |
| npm パッケージ管理 | shadcn 方式でソースが直接入る。バージョン追従は手動 |

---

## 5. 準備物チェックリスト

**技術**
- [ ] デプロイ先ドメインの決定（Origin Trial の前提）
- [ ] Origin Trial トークンの取得と `index.html` への埋め込み
- [ ] Chrome Canary + `#canvas-draw-element` の開発環境
- [ ] `npm install`（`three` / `@types/three` を含む）

**素材**（詳細と適性評価は [06-asset-motif-study.md](06-asset-motif-study.md)）
- [x] 色付きイラスト（透過 PNG）→ `app/public/images/character.png` ✅ 入手済み
- [ ] ロゴのアウトライン化 SVG（`<image>`/`<text>` を含まないもの）→ `app/public/svg/`
      ※ 現状は `logo.png` で代用可だが、輪郭トレースになるため文字が潰れる
- [x] GLB モデル 1 点（`DitheredObject` 用）→ `app/public/models/glass.glb` ✅ 入手済み
      ※ 押し出し文字のため面が平らで、1bit ディザの階調が出にくい。
        曲面のあるモデルを追加できればさらに良くなる（必須ではない）
- [ ] Draco デコーダの自前ホスト（任意）→ `app/public/draco/`
- [x] キャラクター IP の公開可否確認 ✅ 問題なしと確認（2026-07-27）

**デザイン**
- [ ] 背景カラートークンの確定（ダーク固定を推奨）
- [ ] RGB 0〜1 変換ヘルパー → `app/src/lib/`
- [ ] 各セクションのコピー（大きく短く、高コントラスト）
- [ ] `Peel` 用の第 2 レイヤー内容
- [ ] `Glass` の `targets` 用クラス設計
