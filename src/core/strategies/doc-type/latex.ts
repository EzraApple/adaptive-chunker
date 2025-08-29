import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";
import { paragraphStrategy } from "../fallbacks";

/**
 * LaTeX-aware chunking strategy.
 *
 * Splits text into blocks based on LaTeX sections, subsections, and math environments.
 * Preserves formatting.
 *
 * If a block exceeds the max token limit:
 * - By default, it falls back to paragraph-based splitting.
 * - Paragraphs then fall back to sentence-based splitting.
 * - Sentences then fall back to fixed-size splitting.
 *
 * @param opts.maxTokens Maximum estimated tokens per chunk. Default: 200.
 * @param opts.overlap Number of tokens to overlap between successive chunks. Default: 0.
 * @param opts.tokenizer Optional tokenizer used for estimating token counts.
 * @param opts.allowFallback Whether to split oversized blocks into smaller units. Default: true.
 * @returns A generator function that yields chunk strings for the provided LaTeX.
 */
export function latexStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    const blocks =
      text.match(/\\section\{.*?\}|\\subsection\{.*?\}|\\begin\{.*?\}[\s\S]*?\\end\{.*?\}|\$\$[\s\S]*?\$\$/g) ??
      [text];

    // Fallback: paragraph strategy
    const fallback = paragraphStrategy(opts);

    return yield* traverseBlocks(blocks, opts, fallback);
  };
}

