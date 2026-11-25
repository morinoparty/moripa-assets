// scripts/build-assets.ts が出力する manifest.json の型
// 公開している https://assets.morinoparty.workers.dev/manifest.json もこの形式

export type AssetFormat = "svg" | "png" | "webp" | "avif" | "jpeg" | "ico";

export type AssetFile = {
    /** オリジンからのパス (例: city/morimoto/morimoto.avif) */
    path: string;
    format: AssetFormat;
    width: number;
    height: number;
    bytes: number;
    /** サイズ違いのファイルの補足 (例: 180px) */
    label?: string;
};

export type AssetEntry = {
    /** <category>/<group>/<name> */
    id: string;
    category: string;
    group: string;
    name: string;
    /** リポジトリの assets/ からの元画像のパス */
    source: string;
    /** 元画像のサイズ (SVG は viewBox のサイズ) */
    width: number;
    height: number;
    /** 透過を含まない画像なら true (JPEG を出力する) */
    opaque: boolean;
    /** 白背景に合成して計算した BlurHash */
    blurhash: string;
    files: AssetFile[];
};

export type AssetManifest = {
    origin: string;
    assets: AssetEntry[];
};
