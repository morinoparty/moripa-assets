## ディレクトリ配置規則

- `assets/<category>/<group>/<name>.<ext>` に素材の元画像を配置します。
  - `assets/logo/<group>/` - ロゴ類（`morinoparty`, `moripanews`）
  - `assets/city/<id>/` - 街ごとの画像（`<id>` は `morimoto`, `umimoto`, `atsumori`, `kamimori`, `sekkakyo` など）
    - `<id>.png` - 街の風景画像
    - `<id>-text.png` - 街のキャッチコピー＋街名の文字画像（透過）
  - `assets/favicon/<group>/` - 各サイトの favicon（`fishing` など）
- `docs/` にドキュメントサイトと素材の生成スクリプトを配置します。
  - `docs/scripts/build-assets.ts` - `assets/` から配信する素材と `manifest.json` を `docs/public/` に生成する
  - `docs/content/docs/` - ドキュメント本文（MDX）
  - `docs/src/` - ドキュメントサイトのコード（素材一覧のコンポーネントは `src/components/asset-gallery.tsx`）
  - `docs/public/`, `docs/src/generated/`, `docs/out/` - 生成物（git には含めない）
- `README.md` に構成・素材の一覧・街の一覧・出典を記載します。
- 新しいカテゴリ（`assets/` 直下のディレクトリ）を追加する場合は、事前にユーザーに相談してください。
