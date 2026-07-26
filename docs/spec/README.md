# spec/ — SDD ドキュメント

仕様駆動開発（Spec-Driven Development）の成果物。

| フェーズ | ファイル | 内容 | 状態 |
|---|---|---|---|
| 1. 要件定義 | [requirements.md](requirements.md) | 何を作るか。EARS 記法の受入基準 | **承認済み** |
| 2. 設計（アーキテクチャ） | [design.md](design.md) | どう作るか。ADR・中核機構 | **承認済み** |
| 2a. 設計（ビジュアル） | [ui-design.md](ui-design.md) | どう見えるか。配色・レイアウト・25種の推奨設定 | レビュー待ち |
| 2b. 設計（実装詳細） | [module-spec.md](module-spec.md) | モジュール契約・アルゴリズム厳密仕様 | レビュー待ち |
| 3. 実装タスク | [tasks.md](tasks.md) | 全39タスク・ゲート4段 | レビュー待ち |
| 補遺. テスト計画 | [test-plan.md](test-plan.md) | 各フェーズのテスト項目・ゲート判定基準 | レビュー待ち |

## 読む順序

- **実装を始める人**: `tasks.md` §0〜1（M0）→ `module-spec.md` §2（選定アルゴリズム）→ §14（注意点）
- **テストする人**: `test-plan.md` §3（環境）→ 該当段階の章 → ゲート判定基準
- **デザインを確認する人**: `ui-design.md`
- **全体像を知る人**: `requirements.md` §1〜3 → `design.md` §1〜4

## 根拠資料
技術調査は `../01-overview.md` 〜 `../06-asset-motif-study.md`。
要件・設計の主張はすべてこれらの実測にもとづく。

## 変更ルール
- 各文書の末尾に改訂履歴を持つ。変更時は版を上げる
- 検証（T-1〜T-9）で確定する値は各文書の未決事項で追跡する
