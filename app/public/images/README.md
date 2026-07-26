# images/ — PNG / JPEG / WebP / GIF

`GlassObject` / `ParticleObject` の `src`、`GlassObject` の `backgroundImage`、
および Wrapper 22 種の被写体（`<img>` として DOM に置く）に使う。
形式は拡張子ではなくバイト列から判定される。

## 収録物
提供された `アセット 1.svg` から抽出した埋め込み PNG（ファイルの 95.3% がこの 2 枚だった）。

| ファイル | 寸法 | 用途 |
|---|---|---|
| `character.png` | 1026×1457 | 原寸。Wrapper 系の被写体用 |
| `character-sm.png` | 634×900 | 粒子数を抑えた縮小版。**ParticleObject 用（推奨）** |
| `logo.png` | 316×180 | GlassObject 用の暫定。純ベクター SVG があればそちらが優先 |

いずれも透過 RGBA（キャラは 80% 透過・切り抜き良好）。

⚠️ 重要: **GlassObject に画像を渡すとアルファのシルエットのみが押し出され、色は捨てられる。**
色付きイラストを活かしたいなら ParticleObject を使うこと。
詳細: docs/06-asset-motif-study.md
