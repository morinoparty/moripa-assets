// リポジトリ直下の assets/ (元画像) から、配信する画像の各形式とマニフェストを生成する
// 出力先は docs/public/ (Vite がそのまま docs/out にコピーし、Workers の static assets として配信される)
// 使い方: node scripts/build-assets.ts
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { encode } from "blurhash";
import sharp, { type Sharp } from "sharp";

import type { AssetEntry, AssetFile, AssetFormat, AssetManifest } from "../src/lib/manifest-types.ts";

const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.resolve(docsDir, "../assets");
const publicDir = path.join(docsDir, "public");
// ドキュメントのビルド時に import するマニフェスト (public/manifest.json と同じ内容)
const generatedManifest = path.join(docsDir, "src/generated/manifest.json");

// 公開 URL のオリジン (マニフェストとドキュメントのコピー用 URL に使う)
const ASSETS_ORIGIN = "https://assets.morinoparty.workers.dev";

// SVG をラスター化するときの長辺のピクセル数
const SVG_RASTER_SIZE = 1024;
// favicon カテゴリで追加で出力する PNG の一辺のピクセル数 (32: ブラウザ、180: apple-touch-icon、192 / 512: Web App Manifest)
const FAVICON_PNG_SIZES = [32, 180, 192, 512];
// favicon カテゴリの .ico に含めるサイズ
const FAVICON_ICO_SIZES = [16, 32, 48];

const RASTER_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Source = { category: string; group: string; name: string; ext: string; file: string };

async function listDirs(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort();
}

// assets/<category>/<group>/<name>.<ext> を列挙し、命名規則を検証する
async function collectSources(): Promise<Source[]> {
    const sources: Source[] = [];
    const errors: string[] = [];
    for (const category of await listDirs(sourceDir)) {
        for (const group of await listDirs(path.join(sourceDir, category))) {
            const groupDir = path.join(sourceDir, category, group);
            const seen = new Map<string, string>();
            for (const entry of (await readdir(groupDir, { withFileTypes: true })).sort((a, b) =>
                a.name.localeCompare(b.name),
            )) {
                const rel = `${category}/${group}/${entry.name}`;
                if (!entry.isFile()) {
                    errors.push(`${rel}: ディレクトリは 3 階層 (<category>/<group>/<file>) までにしてください`);
                    continue;
                }
                const ext = path.extname(entry.name).toLowerCase();
                const name = path.basename(entry.name, path.extname(entry.name));
                if (ext !== ".svg" && !RASTER_EXTENSIONS.has(ext)) {
                    errors.push(`${rel}: 対応していない形式です`);
                    continue;
                }
                if (![category, group, name].every((s) => NAME_PATTERN.test(s))) {
                    errors.push(`${rel}: 名前は小文字の英数字とハイフン (kebab-case) にしてください`);
                }
                if (name !== group && !name.startsWith(`${group}-`)) {
                    errors.push(`${rel}: ファイル名は <group> または <group>-<variant> にしてください`);
                }
                const dup = seen.get(name);
                if (dup)
                    errors.push(`${rel}: ${dup} と名前が重複しています (同じ名前の元画像は 1 つだけにしてください)`);
                seen.set(name, entry.name);
                sources.push({ category, group, name, ext, file: path.join(groupDir, entry.name) });
            }
        }
    }
    if (errors.length > 0) {
        throw new Error(`assets/ の命名規則に合わないファイルがあります:\n${errors.map((e) => `  - ${e}`).join("\n")}`);
    }
    return sources;
}

// 横長・縦長に合わせて BlurHash の成分数を決める (長辺 4、短辺は比率に応じて 1〜4)
function blurhashComponents(width: number, height: number) {
    const ratio = Math.min(width, height) / Math.max(width, height);
    const short = Math.min(4, Math.max(1, Math.round(4 * ratio)));
    return width >= height ? { x: 4, y: short } : { x: short, y: 4 };
}

// 透過画像は白背景に合成してから BlurHash を計算する
async function computeBlurhash(image: Sharp, width: number, height: number) {
    const { x, y } = blurhashComponents(width, height);
    const { data, info } = await image
        .clone()
        .flatten({ background: "#ffffff" })
        .resize(32, 32, { fit: "inside" })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    return encode(new Uint8ClampedArray(data), info.width, info.height, x, y);
}

// PNG を埋め込んだ ICO を作る (Windows Vista 以降と主要ブラウザが対応する形式)
function buildIco(pngs: { size: number; data: Buffer }[]) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngs.length, 4);
    const dir = Buffer.alloc(16 * pngs.length);
    let offset = header.length + dir.length;
    pngs.forEach(({ size, data }, i) => {
        const o = i * 16;
        dir.writeUInt8(size >= 256 ? 0 : size, o);
        dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
        dir.writeUInt8(0, o + 2);
        dir.writeUInt8(0, o + 3);
        dir.writeUInt16LE(1, o + 4);
        dir.writeUInt16LE(32, o + 6);
        dir.writeUInt32LE(data.length, o + 8);
        dir.writeUInt32LE(offset, o + 12);
        offset += data.length;
    });
    return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}

async function processSource(src: Source): Promise<AssetEntry> {
    const relDir = `${src.category}/${src.group}`;
    const outDir = path.join(publicDir, relDir);
    await mkdir(outDir, { recursive: true });

    const input = await readFile(src.file);
    const isSvg = src.ext === ".svg";
    const original = await sharp(input).metadata();
    const width = original.width;
    const height = original.height;

    // SVG は長辺を SVG_RASTER_SIZE にしてラスター化する。ラスター画像は元のサイズのまま変換する
    const scale = isSvg ? SVG_RASTER_SIZE / Math.max(width, height) : 1;
    const base = isSvg ? sharp(input, { density: 72 * scale }) : sharp(input);
    const raster = sharp(await base.png().toBuffer());
    const rasterMeta = await raster.metadata();
    const { isOpaque } = await raster.stats();

    const files: AssetFile[] = [];
    const write = async (
        fileName: string,
        format: AssetFormat,
        data: Buffer,
        size: { w: number; h: number },
        label?: string,
    ) => {
        await writeFile(path.join(outDir, fileName), data);
        files.push({
            path: `${relDir}/${fileName}`,
            format,
            width: size.w,
            height: size.h,
            bytes: data.length,
            ...(label ? { label } : {}),
        });
    };
    const rasterSize = { w: rasterMeta.width, h: rasterMeta.height };

    if (isSvg) await write(`${src.name}.svg`, "svg", input, { w: width, h: height });
    // PNG の元画像はそのまま配信する (再エンコードで肥大化させない)
    // ICC プロファイルを含む場合だけ、sRGB に変換するために再エンコードする (他の形式と色をそろえる)
    const png =
        src.ext === ".png" && !original.icc ? input : await raster.clone().png({ compressionLevel: 9 }).toBuffer();
    await write(`${src.name}.png`, "png", png, rasterSize);
    await write(
        `${src.name}.webp`,
        "webp",
        await raster.clone().webp({ quality: 85, effort: 6 }).toBuffer(),
        rasterSize,
    );
    // effort を上げると 1920x1080 で 1 枚 10 秒以上かかる割に小さくならないため、2 にする
    await write(
        `${src.name}.avif`,
        "avif",
        await raster.clone().avif({ quality: 60, effort: 2 }).toBuffer(),
        rasterSize,
    );
    // JPEG は透過を持てないため、不透明な画像だけ出力する
    if (isOpaque) {
        await write(
            `${src.name}.jpg`,
            "jpeg",
            await raster.clone().jpeg({ quality: 85, mozjpeg: true }).toBuffer(),
            rasterSize,
        );
    }

    if (src.category === "favicon") {
        const square = (size: number) =>
            raster
                .clone()
                .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png({ compressionLevel: 9 })
                .toBuffer();
        for (const size of FAVICON_PNG_SIZES) {
            await write(`${src.name}-${size}.png`, "png", await square(size), { w: size, h: size }, `${size}px`);
        }
        const icoPngs = await Promise.all(FAVICON_ICO_SIZES.map(async (size) => ({ size, data: await square(size) })));
        const icoSize = Math.max(...FAVICON_ICO_SIZES);
        await write(
            `${src.name}.ico`,
            "ico",
            buildIco(icoPngs),
            { w: icoSize, h: icoSize },
            FAVICON_ICO_SIZES.join("/"),
        );
    }

    return {
        id: `${relDir}/${src.name}`,
        category: src.category,
        group: src.group,
        name: src.name,
        source: `${relDir}/${path.basename(src.file)}`,
        width,
        height,
        opaque: isOpaque,
        blurhash: await computeBlurhash(raster, rasterSize.w, rasterSize.h),
        files,
    };
}

// Cloudflare Workers の static assets が読む _headers (CORS とキャッシュ)
function buildHeaders(categories: string[]) {
    const lines = ["/*", "  Access-Control-Allow-Origin: *", ""];
    // URL にハッシュを含めないため immutable にはしない
    for (const category of categories) {
        lines.push(`/${category}/*`, "  Cache-Control: public, max-age=86400, stale-while-revalidate=604800", "");
    }
    lines.push("/manifest.json", "  Cache-Control: public, max-age=300", "");
    return lines.join("\n");
}

async function main() {
    const started = performance.now();
    const sources = await collectSources();

    await rm(publicDir, { recursive: true, force: true });
    await mkdir(publicDir, { recursive: true });

    // 元画像ごとに並列で変換する (マニフェストの順序は sources の順序のまま)
    const assets: AssetEntry[] = await Promise.all(sources.map((src) => processSource(src)));
    const categories = [...new Set(assets.map((a) => a.category))];
    const manifest: AssetManifest = { origin: ASSETS_ORIGIN, assets };
    const json = `${JSON.stringify(manifest, null, 2)}\n`;

    await writeFile(path.join(publicDir, "manifest.json"), json);
    await writeFile(path.join(publicDir, "_headers"), buildHeaders(categories));
    await mkdir(path.dirname(generatedManifest), { recursive: true });
    await writeFile(generatedManifest, json);

    const files = assets.reduce((n, a) => n + a.files.length, 0);
    const bytes = (
        await Promise.all(assets.flatMap((a) => a.files.map((f) => stat(path.join(publicDir, f.path)))))
    ).reduce((n, s) => n + s.size, 0);
    console.log(
        `assets: ${assets.length} sources → ${files} files (${(bytes / 1024 / 1024).toFixed(1)} MiB) in ${((performance.now() - started) / 1000).toFixed(1)}s`,
    );
}

await main();
