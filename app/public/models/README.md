# models/ — GLB / glTF

`DitheredObject`（GLB/glTF のみ対応）、`GlassObject`、`ParticleObject` 用。

- `src` の既定値は空文字。ここにファイルを置いて `src="/models/xxx.glb"` で参照する
- `ParticleObject` は頂点をパーティクル化するため、ポリゴン数を抑えたモデルを使う
- Draco 圧縮モデルはデコーダを取得する（既定は gstatic CDN / 自前なら ../draco/）
- 外部調達時はライセンス確認必須
