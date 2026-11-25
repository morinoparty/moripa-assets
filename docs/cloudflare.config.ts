import { defineConfig } from "cf/config";

// ドキュメントサイトと素材 (docs/out) を Cloudflare Workers の static assets として配信する
// assets-only Worker (エントリポイントなし・binding なし)。https://assets.morinoparty.workers.dev/
// 配信するディレクトリ (docs/out) は package.json の deploy スクリプトで渡す (cf deploy ./out はビルドせずにそのままアップロードする)
// デプロイ: pnpm build && pnpm run deploy (CI: .github/workflows/deploy.yml)
export default defineConfig({
    worker: {
        name: "assets",
        compatibilityDate: "2026-11-01",
        workersDev: true,
        previewUrls: true,
        observability: {
            enabled: false,
        },
        assets: {
            // プリレンダーした複数の HTML で構成するため、SPA フォールバックではなく 404.html を返す
            notFoundHandling: "404-page",
        },
    },
});
