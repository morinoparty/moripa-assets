# moripa-assets

もりのパーティ（morinoparty）のロゴ・画像などの素材置き場です。

`logo/` は [morino.party](https://morino.party) の `/assets/` 以下と同じ構成です。

## 構成

| パス | 内容 |
| --- | --- |
| `logo/` | ロゴ類（`logo-72.png`, `logo_border.svg`, もりパニュース, 切手・スタンプ） |
| `city/<id>/<id>.{png,webp,avif}` | 街の風景画像 |
| `city/<id>/<id>-text.{png,webp,avif}` | 街のキャッチコピー＋街名の文字画像（透過） |

## 街

| ID | 街 | キャッチコピー |
| --- | --- | --- |
| `morimoto` | もりもと | はじまりの都市 |
| `umimoto` | うみもと | 潮風のかほり |
| `atsumori` | あつもり | あちちちち！！ |
| `kamimori` | かみもり | 神々いづるまち。 |
| `sekkakyo` | 雪華郷 | 愛に雪、恋を白 |

## 出典

`../morino.party` リポジトリの `public/assets/` からコピーしたものです
（2026-10-04 時点で公開サイトの配信内容と一致することを確認済み）。
AVIF（全画像）と文字画像の WebP は、PNG から sharp で生成しました。
