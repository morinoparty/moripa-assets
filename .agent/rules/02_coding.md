# 作業プラクティス

作業の中心は、素材の元画像の追加・差し替えと、ドキュメントサイト（`docs/`）の更新です。

## 作業手順

1. **配置と命名を決める**
   - `assets/<category>/<group>/<name>.<ext>` の構成と命名規則に合わせて配置先とファイル名を決める

2. **素材を追加・差し替える**
   - 小さく始めて、関係のないファイルには触れない

## プラクティス

- 常に既存の構成・命名・形式を参考にしてください。
- 既存の素材は上書き・削除・リネームする前にユーザーに確認してください（他のサイトから URL で参照されています）。
- 素材を追加・変更したら、`README.md` の「素材」「街」の表と、ドキュメント（`docs/content/docs/`）も合わせて更新してください。

## 素材の規則

- 元画像は `assets/<category>/<group>/<name>.<ext>` に置きます。
  - `<category>`, `<group>`, `<name>` は小文字の英数字とハイフン（kebab-case）
  - `<name>` は `<group>` または `<group>-<variant>`
  - 同じ `<name>` の元画像は 1 つだけ（`.svg` と `.png` を両方置かない）
  - 対応する形式は `svg`, `png`, `jpg`, `jpeg`, `webp`
- WebP・AVIF・JPEG・ICO・サイズ違いの PNG は `docs/scripts/build-assets.ts` が生成するため、リポジトリには置きません。
- 街の素材は `assets/city/<id>/` に `<id>.png`（風景画像、1920x1080）と `<id>-text.png`（文字画像、背景は透過）の 2 ファイルを置いてください。
- `<id>` は README の「街」の表にある ID（ローマ字の小文字）を使ってください。

## 作業後の確認

`docs/` で以下を実行し、すべて成功することを確認してください。

```bash
cd docs
pnpm build      # 素材の生成（命名規則の検証を含む）とドキュメントのビルド
pnpm check:ci   # フォーマットとリント
pnpm typecheck  # 型チェック
```

- `git status` で、意図したファイルだけが追加・変更されていること
- 街の素材が 2 ファイル揃っていること（何も出力されなければ OK）:

```bash
for d in assets/city/*/; do id=$(basename "$d"); for f in "$id" "$id-text"; do [ -f "$d$f.png" ] || echo "missing: $d$f.png"; done; done
```

- `docs/public/manifest.json` で、素材のサイズ・形式が想定どおりであること（風景画像が 1920x1080 で `opaque: true`、文字画像が `opaque: false`）
- `README.md` の表が実際のファイル構成と一致していること
