import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { AssetCategory } from "./asset-gallery";
import { Mermaid } from "./mdx/mermaid";

export function getMDXComponents(components?: MDXComponents) {
    return {
        ...defaultMdxComponents,
        Mermaid,
        AssetCategory,
        ...components,
    } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
    type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
