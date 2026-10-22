## このリポジトリの概要
もりのパーティ（morinoparty）のロゴ・画像などの素材置き場です。
リポジトリ名は `moripa-assets` です。

## 目的
morinoparty の各種サイトやコンテンツで使うロゴ・街の画像を 1 か所にまとめて管理します。
コードやビルドの仕組みはなく、画像ファイルと `README.md` のみで構成されています。

- `logo/` は [morino.party](https://morino.party) の `/assets/` 以下と同じ構成です。
- 素材は `../morino.party` リポジトリの `public/assets/` からコピーしたものです（2026-10-04 時点で公開サイトの配信内容と一致することを確認済み）。
- AVIF（全画像）と文字画像の WebP は、PNG から sharp で生成したものです。

## 収録している素材

| パス | 内容 |
| --- | --- |
| `logo/` | ロゴ類（`logo-72.png`, `logo_border.svg`, もりパニュース `moripanews.svg`, 切手 `morino_kitte.png`・スタンプ `morino_stamp.png`） |
| `city/<id>/<id>.{png,webp,avif}` | 街の風景画像（1920x1080） |
| `city/<id>/<id>-text.{png,webp,avif}` | 街のキャッチコピー＋街名の文字画像（透過、高さ 220px） |

## 街

| ID | 街 | キャッチコピー |
| --- | --- | --- |
| `morimoto` | もりもと | はじまりの都市 |
| `umimoto` | うみもと | 潮風のかほり |
| `atsumori` | あつもり | あちちちち！！ |
| `kamimori` | かみもり | 神々いづるまち。 |
| `sekkakyo` | 雪華郷 | 愛に雪、恋を白 |

## 主な技術スタック
- なし（package.json・Makefile・CI などのビルド設定は存在しません）
- 画像形式: PNG / WebP / AVIF / SVG
