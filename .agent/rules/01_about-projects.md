## このリポジトリの概要
もりのパーティ（morinoparty）のロゴ・画像・favicon などの素材置き場です。
リポジトリ名は `moripa-assets` です。

## 目的
morinoparty の各種サイトやコンテンツで使うロゴ・街の画像・favicon を 1 か所にまとめて管理し、
Cloudflare Workers（https://assets.morinoparty.workers.dev/）から配信します。
同じサイトで、素材の一覧と URL・BlurHash をコピーできるドキュメントも配信します。

- 元画像は `assets/<category>/<group>/<name>.<ext>` に置きます。WebP・AVIF・JPEG、favicon の ICO やサイズ違いの PNG はビルド時に生成し、リポジトリには含めません。
- `docs/` は PluginTemplateKt のドキュメントサイト（Fumadocs + TanStack Start + Vite+）をもとにしたもので、素材の生成スクリプト（`docs/scripts/build-assets.ts`）も含みます。
- 配信する URL は `https://assets.morinoparty.workers.dev/<category>/<group>/<name>.<ext>` です。

## 収録している素材

| パス | 内容 |
| --- | --- |
| `assets/logo/morinoparty/` | もりのパーティのロゴ（`morinoparty.png`）、線画（`morinoparty-border.svg`）、切手（`morinoparty-kitte.png`）、スタンプ（`morinoparty-stamp.png`） |
| `assets/logo/moripanews/` | もりパニュースのロゴ（`moripanews.svg`） |
| `assets/city/<id>/` | 街の風景画像 `<id>.png`（1920x1080）と、キャッチコピー＋街名の文字画像 `<id>-text.png`（透過、高さ 220px） |
| `assets/favicon/fishing/` | MoripaFishing のドキュメントの favicon（`fishing.png`、648x648） |

## 街

| ID | 街 | キャッチコピー |
| --- | --- | --- |
| `morimoto` | もりもと | はじまりの都市 |
| `umimoto` | うみもと | 潮風のかほり |
| `atsumori` | あつもり | あちちちち！！ |
| `kamimori` | かみもり | 神々いづるまち。 |
| `sekkakyo` | 雪華郷 | 愛に雪、恋を白 |

## 主な技術スタック
- 素材の生成: Node.js（TypeScript をそのまま実行）、sharp、blurhash
- ドキュメント: Fumadocs、TanStack Start、Vite+（`vp`）、Tailwind CSS、Chlorophyll のデザイントークン（Panda CSS）
- 配信: Cloudflare Workers の static assets（`docs/cloudflare.config.ts`、Worker 名 `assets`）。デプロイは Cloudflare CLI（`cf deploy ./out`）
- パッケージマネージャー: pnpm（`docs/` が単独の pnpm プロジェクト）
