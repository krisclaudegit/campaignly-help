import type { MDXComponents } from "mdx/types";

// Provides MDX component overrides globally — required by @next/mdx App Router integration
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
