import type { AssetManifest } from "./manifest-types";
// scripts/build-assets.ts が生成する (pnpm assets / dev / build で作られる)
import manifestJson from "../generated/manifest.json";

export const appName = "moripa-assets";
// ドキュメントはサイトのルートに置く (トップページがドキュメントの index になる)
export const docsRoute = "/";

export const gitConfig = {
    user: "morinoparty",
    repo: "moripa-assets",
    branch: "main",
};

export const manifest = manifestJson as AssetManifest;

// コピーする URL は、開いている環境 (localhost やプレビュー) ではなく常に公開先のオリジンにする
export const assetsOrigin = manifest.origin;

export function assetUrl(path: string) {
    return `${assetsOrigin}/${path}`;
}

// ドキュメント内のプレビュー表示用 (開いている環境の素材を読む)
export function localAssetUrl(path: string) {
    return `${import.meta.env.BASE_URL}${path}`;
}

// BASE_URL は Vite の base (通常は /)。静的ファイルの URL には base を付ける
export const searchIndexUrl = `${import.meta.env.BASE_URL}api/search.json`;
