import { decode } from "blurhash";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { AssetEntry, AssetFile, AssetFormat } from "@/lib/manifest-types";
import { assetUrl, localAssetUrl, manifest } from "@/lib/shared";

const FORMAT_LABEL: Record<AssetFormat, string> = {
    svg: "SVG",
    png: "PNG",
    webp: "WebP",
    avif: "AVIF",
    jpeg: "JPEG",
    ico: "ICO",
};

const MIME: Record<AssetFormat, string> = {
    svg: "image/svg+xml",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    jpeg: "image/jpeg",
    ico: "image/x-icon",
};

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function useCopy() {
    const [copied, setCopied] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);
    const copy = (key: string, text: string) => {
        void navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(null), 1500);
        });
    };
    return { copied, copy };
}

type CopyButtonProps = {
    copyKey: string;
    text: string;
    copied: string | null;
    onCopy: (key: string, text: string) => void;
    title?: string;
    children: React.ReactNode;
};

function CopyButton({ copyKey, text, copied, onCopy, title, children }: CopyButtonProps) {
    const done = copied === copyKey;
    return (
        <button
            type="button"
            title={title ?? text}
            onClick={() => onCopy(copyKey, text)}
            className="inline-flex items-center gap-1.5 rounded-md border bg-fd-card px-2 py-1 text-xs font-medium transition-colors hover:bg-fd-accent data-[done=true]:border-[var(--mpc-colors-color-palette-solid)] data-[done=true]:bg-[var(--mpc-colors-color-palette-solid)] data-[done=true]:text-[var(--mpc-colors-color-palette-contrast)]"
            data-done={done}
        >
            {done ? <Check className="size-3.5" /> : <Copy className="size-3.5 opacity-60" />}
            {children}
        </button>
    );
}

// BlurHash を canvas に描画する (小さく decode して CSS で引き伸ばす)
function BlurhashCanvas({
    hash,
    width,
    height,
    className,
}: {
    hash: string;
    width: number;
    height: number;
    className?: string;
}) {
    const ref = useRef<HTMLCanvasElement>(null);
    const w = 32;
    const h = Math.max(1, Math.round((32 * height) / width));
    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const image = ctx.createImageData(w, h);
        image.data.set(decode(hash, w, h));
        ctx.putImageData(image, 0, 0);
    }, [hash, w, h]);
    return (
        <canvas
            ref={ref}
            width={w}
            height={h}
            className={className}
            style={{ aspectRatio: `${width} / ${height}` }}
            aria-label="BlurHash のプレビュー"
        />
    );
}

function snippetFor(asset: AssetEntry, mainFiles: AssetFile[]) {
    const fallback = mainFiles.find((f) => f.format === "svg") ?? mainFiles.find((f) => f.format === "png")!;
    const alt = asset.name;
    const img = `<img src="${assetUrl(fallback.path)}" width="${fallback.width}" height="${fallback.height}" alt="${alt}" />`;
    if (fallback.format === "svg") return { img, picture: img };
    const sources = mainFiles
        .filter((f) => f.format === "avif" || f.format === "webp")
        .map((f) => `  <source srcset="${assetUrl(f.path)}" type="${MIME[f.format]}" />`);
    const picture = ["<picture>", ...sources, `  ${img}`, "</picture>"].join("\n");
    return { img, picture };
}

function faviconLinks(sized: AssetFile[], ico: AssetFile | undefined) {
    const lines: string[] = [];
    if (ico) lines.push(`<link rel="icon" href="${assetUrl(ico.path)}" sizes="any" />`);
    const png32 = sized.find((f) => f.width === 32);
    if (png32) lines.push(`<link rel="icon" type="image/png" href="${assetUrl(png32.path)}" sizes="32x32" />`);
    const touch = sized.find((f) => f.width === 180);
    if (touch) lines.push(`<link rel="apple-touch-icon" href="${assetUrl(touch.path)}" />`);
    return lines.join("\n");
}

function AssetCard({ asset }: { asset: AssetEntry }) {
    const { copied, copy } = useCopy();
    const [showBlur, setShowBlur] = useState(false);
    // サイズ違い (label 付き) と ICO 以外が、元画像と同じサイズのファイル
    const mainFiles = asset.files.filter((f) => !f.label);
    const sizedFiles = asset.files.filter((f) => f.label && f.format === "png");
    const ico = asset.files.find((f) => f.format === "ico");
    const preview = mainFiles.find((f) => f.format === "svg") ?? mainFiles.find((f) => f.format === "png")!;
    const { img, picture } = snippetFor(asset, mainFiles);
    const k = (s: string) => `${asset.id}:${s}`;

    return (
        <div className="not-prose flex flex-col overflow-hidden rounded-xl border bg-fd-card shadow-sm">
            <div
                className="relative flex items-center justify-center border-b p-4"
                style={
                    asset.opaque
                        ? undefined
                        : {
                              backgroundImage:
                                  "repeating-conic-gradient(var(--mpc-colors-color-palette-3) 0% 25%, transparent 0% 50%)",
                              backgroundSize: "16px 16px",
                          }
                }
            >
                {showBlur ? (
                    <BlurhashCanvas
                        hash={asset.blurhash}
                        width={preview.width}
                        height={preview.height}
                        className="max-h-56 w-full max-w-full rounded object-contain"
                    />
                ) : (
                    <picture className="contents">
                        {preview.format !== "svg" &&
                            mainFiles
                                .filter((f) => f.format === "avif" || f.format === "webp")
                                .map((f) => (
                                    <source key={f.path} srcSet={localAssetUrl(f.path)} type={MIME[f.format]} />
                                ))}
                        <img
                            src={localAssetUrl(preview.path)}
                            width={preview.width}
                            height={preview.height}
                            alt={asset.name}
                            loading="lazy"
                            className="h-auto max-h-56 w-auto max-w-full object-contain [image-rendering:auto]"
                            style={asset.width < 128 ? { width: Math.min(asset.width * 2, 192) } : undefined}
                        />
                    </picture>
                )}
            </div>
            <div className="flex flex-col gap-3 p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <code className="font-mono text-sm font-bold">{asset.name}</code>
                    <span className="text-xs text-fd-muted-foreground">
                        {asset.width}×{asset.height}
                        {asset.source.endsWith(".svg") ? " (SVG)" : ""}
                    </span>
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-fd-muted-foreground">クリックで URL をコピー</span>
                    <div className="flex flex-wrap gap-1.5">
                        {mainFiles.map((f) => (
                            <CopyButton
                                key={f.path}
                                copyKey={k(f.path)}
                                text={assetUrl(f.path)}
                                copied={copied}
                                onCopy={copy}
                            >
                                {FORMAT_LABEL[f.format]}
                                <span className="opacity-60">{formatBytes(f.bytes)}</span>
                            </CopyButton>
                        ))}
                    </div>
                    {(sizedFiles.length > 0 || ico) && (
                        <div className="flex flex-wrap gap-1.5">
                            {ico && (
                                <CopyButton
                                    copyKey={k(ico.path)}
                                    text={assetUrl(ico.path)}
                                    copied={copied}
                                    onCopy={copy}
                                >
                                    ICO<span className="opacity-60">{ico.label}</span>
                                </CopyButton>
                            )}
                            {sizedFiles.map((f) => (
                                <CopyButton
                                    key={f.path}
                                    copyKey={k(f.path)}
                                    text={assetUrl(f.path)}
                                    copied={copied}
                                    onCopy={copy}
                                >
                                    PNG<span className="opacity-60">{f.label}</span>
                                </CopyButton>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-fd-muted-foreground">HTML</span>
                    <div className="flex flex-wrap gap-1.5">
                        <CopyButton copyKey={k("img")} text={img} copied={copied} onCopy={copy} title="<img> をコピー">
                            {"<img>"}
                        </CopyButton>
                        {picture !== img && (
                            <CopyButton
                                copyKey={k("picture")}
                                text={picture}
                                copied={copied}
                                onCopy={copy}
                                title="<picture> をコピー"
                            >
                                {"<picture>"}
                            </CopyButton>
                        )}
                        {asset.category === "favicon" && (
                            <CopyButton
                                copyKey={k("link")}
                                text={faviconLinks(sizedFiles, ico)}
                                copied={copied}
                                onCopy={copy}
                                title="<link> タグをコピー"
                            >
                                {"<link>"}
                            </CopyButton>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-fd-muted-foreground">BlurHash</span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowBlur((v) => !v)}
                            title="プレビューを BlurHash に切り替える"
                            className="shrink-0 overflow-hidden rounded border"
                        >
                            <BlurhashCanvas
                                hash={asset.blurhash}
                                width={asset.width}
                                height={asset.height}
                                className="block h-6 w-auto"
                            />
                        </button>
                        <CopyButton copyKey={k("blurhash")} text={asset.blurhash} copied={copied} onCopy={copy}>
                            <span className="max-w-48 truncate font-mono">{asset.blurhash}</span>
                        </CopyButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** カテゴリ (assets/<category>/) のすべての素材をグループごとに表示する */
export function AssetCategory({ category }: { category: string }) {
    const assets = manifest.assets.filter((a) => a.category === category);
    if (assets.length === 0) throw new Error(`unknown asset category: ${category}`);
    const groups = [...new Set(assets.map((a) => a.group))];
    return (
        <div className="flex flex-col gap-10">
            {groups.map((group) => (
                <section key={group} className="flex flex-col gap-4">
                    <h2 id={group} className="scroll-m-28 font-mono">
                        {group}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {assets
                            .filter((a) => a.group === group)
                            // <group> そのものの素材を先頭に、<group>-<variant> を名前順に並べる
                            .sort(
                                (a, b) =>
                                    Number(b.name === group) - Number(a.name === group) || a.name.localeCompare(b.name),
                            )
                            .map((asset) => (
                                <AssetCard key={asset.id} asset={asset} />
                            ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
