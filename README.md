# Canvas UI 全機能 LP — 調査・設計フェーズ

[canvasui.dev](https://canvasui.dev) の全機能を使った LP を作るための、調査資料と開発環境。
**現在は設計フェーズ。LP 本体の実装はまだ行っていない。**

---

## 調査結果サマリ

| 項目 | 結果 |
|---|---|
| コンポーネント数 | **25**（レジストリ 150 items ÷ 6 フレームワーク） |
| フレームワーク | React / Vue / Svelte / Solid / Preact / Vanilla TS |
| 総オプション数 | **409** |
| アーキテクチャ | **Wrapper 系 22**（html-in-canvas・Chrome 限定）/ **Object 系 3**（three.js・全ブラウザ） |
| npm 依存 | Wrapper 系は **ゼロ**。Object 系のみ `three` + `@types/three` |
| 外部素材 | **Object 系 3 種のみ**必要（GLB/glTF/SVG/画像） |
| ライセンス | MIT + Commons Clause |

### 設計に効いた 3 つの発見
1. **25 種の同時展示は不可能** — 1 コンポーネント = 1 WebGL2 コンテキスト。Chrome の上限（概ね 16）を超えると
   古いものから失われ、`webglcontextlost` ハンドラが **0/25** のため復帰しない
2. **画面外での「停止」はコンテキストを解放しない** — `IntersectionObserver` は rAF を止めるだけ。
   予算を守るには **条件付きマウント／アンマウント**が必須（`destroy()` は 25/25 で完備）
3. **22/25 は Chrome 専用**（Origin Trial 148〜150、Firefox/Safari は実装表明なし）。
   非対応環境では自動で素の HTML に落ちるため、**コンテンツ自体は必ず読める**

---

## ドキュメント

| ファイル | 内容 |
|---|---|
| [docs/01-overview.md](docs/01-overview.md) | 全体像・2 系統のアーキテクチャ・ブラウザ対応・共通品質保証 |
| [docs/02-component-reference.md](docs/02-component-reference.md) | **25 コンポーネント × 409 オプションの全リファレンス**（レジストリから機械抽出） |
| [docs/03-combination-research.md](docs/03-combination-research.md) | **組み合わせ研究**。6 パターン分類・相互作用プロファイル・リスク登録簿・検証計画 T-1〜T-9 |
| [docs/04-assets-requirements.md](docs/04-assets-requirements.md) | 必要な素材・技術要件・カラートークン・準備チェックリスト |
| [docs/05-lp-structure-plan.md](docs/05-lp-structure-plan.md) | LP 構成案。25 機能の配置と実装順序 |
| [docs/06-asset-motif-study.md](docs/06-asset-motif-study.md) | **素材の適性評価とモチーフ設計**。提供 SVG の判定と、題材選定の指針 |

### SDD ドキュメント（`docs/spec/`）
| フェーズ | ファイル | 状態 |
|---|---|---|
| 1. 要件定義 | [docs/spec/requirements.md](docs/spec/requirements.md) | 承認済み |
| 2. 設計（アーキテクチャ） | [docs/spec/design.md](docs/spec/design.md) | 承認済み |
| 2a. 設計（ビジュアル） | [docs/spec/ui-design.md](docs/spec/ui-design.md) | **レビュー待ち** |
| 2b. 設計（実装詳細） | [docs/spec/module-spec.md](docs/spec/module-spec.md) | **レビュー待ち** |
| 3. 実装タスク | [docs/spec/tasks.md](docs/spec/tasks.md) | **レビュー待ち** |
| 補遺. テスト計画 | [docs/spec/test-plan.md](docs/spec/test-plan.md) | **レビュー待ち** |

`data/registry.json` は取得した生データ、`data/options.json` は抽出したオプション定義（02 の生成元）。

---

## 決定事項

- **スタック**: React 19 + Vite + TypeScript
- **非対応ブラウザ**: 自動フォールバック（素の HTML）＋ 告知バナー。代替動画は作らない

---

## フォルダ構成

```
CanvasUI_test/
├─ docs/                       調査・設計資料
├─ data/                       レジストリ生データ・抽出済みオプション
└─ app/                        Vite プロジェクト（設定のみ・未実装）
   ├─ index.html               Origin Trial meta のプレースホルダ入り
   ├─ components.json          shadcn レジストリ登録済み（@canvas-ui）
   ├─ package.json             未インストール
   ├─ public/
   │  ├─ models/  svg/  images/    Object 系 3 種用の素材置き場
   │  └─ draco/                    Draco デコーダを自前ホストする場合
   └─ src/
      ├─ components/canvasui/  shadcn の導入先（空）
      ├─ sections/             LP セクション（空）
      ├─ lib/                  マウント予算管理・RGB 変換ヘルパー（空）
      └─ styles/               カラートークン（空）
```

---

## 次のステップ

仕様は 4 文書（要件 / 設計 / デザイン / 実装詳細）＋ 実装計画まで揃った。
着手は [docs/spec/tasks.md](docs/spec/tasks.md) の **M0** から。

**M0 を飛ばして M1 に進まないこと。** `capacity` が未確定のままカタログ 25 セクションを作ると、
コンテキストロスト発生時に全面的な作り直しになる。
クリティカルパスは `M0-05 → M0-06 → M0-11 → M0-14 → M0-16 → G0`。

```bash
cd app && npm install
```

開発時は Chrome Canary 149+ で `chrome://flags/#canvas-draw-element` を有効にすること。
（通常の Chrome / Safari / Firefox では 22 種が動かない）
