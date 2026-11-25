# moripa-assets

もりのパーティ（morinoparty）のロゴ・画像・favicon などの素材置き場です。

素材とドキュメントは <https://assets.morinoparty.workers.dev/> で配信しています。
ドキュメントでは素材の一覧を見られるほか、クリックで素材の URL や BlurHash をコピーできます。

## 構成

| パス | 内容 |
| --- | --- |
| `assets/<category>/<group>/<name>.<ext>` | 素材の元画像（WebP・AVIF・JPEG などはビルド時に生成） |
| `docs/` | ドキュメントサイト（Fumadocs + TanStack Start + Vite+）と素材の生成スクリプト |
| `.github/workflows/` | プルリクエストのチェック（`check.yml`）と Cloudflare Workers へのデプロイ（`deploy.yml`） |

## 素材

| 元画像 | 内容 |
| --- | --- |
| `assets/logo/morinoparty/morinoparty.svg` | もりのパーティのロゴ |
| `assets/logo/morinoparty/morinoparty-text-white.svg` | 「もりのパーティ」の文字ロゴ（白） |
| `assets/logo/morinoparty/morinoparty-border.svg` | もりのパーティのロゴ（線画） |
| `assets/logo/morinoparty/morinoparty-kitte.png` | 切手 |
| `assets/logo/morinoparty/morinoparty-stamp.png` | スタンプ |
| `assets/logo/moripanews/moripanews.svg` | もりパニュースのロゴ |
| `assets/city/<id>/<id>.png` | 街の風景画像（1920x1080） |
| `assets/city/<id>/<id>-text.png` | 街のキャッチコピー＋街名の文字画像（透過、高さ 220px） |
| `assets/favicon/fishing/fishing.png` | [MoripaFishing のドキュメント](https://fishing.plugin.morino.party/) の favicon |

## 街

| ID | 街 | キャッチコピー |
| --- | --- | --- |
| `morimoto` | もりもと | はじまりの都市 |
| `umimoto` | うみもと | 潮風のかほり |
| `atsumori` | あつもり | あちちちち！！ |
| `kamimori` | かみもり | 神々いづるまち。 |
| `sekkakyo` | 雪華郷 | 愛に雪、恋を白 |

## URL

```text
https://assets.morinoparty.workers.dev/<category>/<group>/<name>.<ext>
```

元画像ごとに PNG・WebP・AVIF（SVG の元画像は SVG も、透過を含まない画像は JPEG も）を配信します。
favicon には ICO と 32 / 180 / 192 / 512px の PNG も配信します。
すべての素材の一覧は <https://assets.morinoparty.workers.dev/manifest.json> で取得できます。

## 開発

```bash
cd docs
pnpm install
pnpm dev     # 素材を生成して開発サーバーを起動（http://localhost:3000/）
pnpm build   # 素材を生成して docs/out に出力
```

素材の追加方法と命名規則は、ドキュメントの「素材の追加」（`docs/content/docs/development/adding-assets.mdx`）を参照してください。

## 出典

`logo/` と `city/` の素材は `../morino.party` リポジトリの `public/assets/` からコピーしたものです
（2026-10-04 時点で公開サイトの配信内容と一致することを確認済み）。
2026-11-25 に `assets/` へ移し、名前を `<group>-<variant>` の形式にそろえました。

| 旧パス | 新パス |
| --- | --- |
| `logo/logo-72.png` | （`assets/logo/morinoparty/morinoparty.svg` に置き換え） |
| `logo/logo_border.svg` | `assets/logo/morinoparty/morinoparty-border.svg` |
| `logo/morino_kitte.png` | `assets/logo/morinoparty/morinoparty-kitte.png` |
| `logo/morino_stamp.png` | `assets/logo/morinoparty/morinoparty-stamp.png` |
| `logo/moripanews.svg` | `assets/logo/moripanews/moripanews.svg` |
| `city/<id>/<id>{,-text}.png` | `assets/city/<id>/<id>{,-text}.png` |

`favicon/fishing/fishing.png` は、MoripaFishing の `docs/public/favicon.svg` に埋め込まれていた 648x648 の PNG（Display P3）を取り出し、sRGB に変換したものです。

`logo/morinoparty/morinoparty.svg` と `morinoparty-text-white.svg` は、`morinopartyweb` リポジトリの `assets/svg/moripa-img-nobg-logo.svg` と `assets/svg/moripalogo.svg` をそのままコピーしたものです
（2026-11-25 に、72px の `logo-72.png` を同じロゴのベクター版に置き換えました）。
