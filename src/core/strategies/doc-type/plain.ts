import { ChunkingOptions } from "../../types";
import { paragraphStrategy } from "../fallbacks";

/**
 * Plain text chunking strategy.
 *
 * Uses paragraph-based splitting as the default for unstructured text.
 * Preserves formatting.
 *
 * If a paragraph exceeds the max token limit:
 * - By default, it falls back to sentence-based splitting.
 * - Sentences then fall back to fixed-size splitting.
 *
 * @param opts.maxTokens Maximum estimated tokens per chunk. Default: 200.
 * @param opts.overlap Number of tokens to overlap between successive chunks. Default: 0.
 * @param opts.tokenizer Optional tokenizer used for estimating token counts.
 * @param opts.allowFallback Whether to split oversized paragraphs into smaller units. Default: true.
 * @returns A generator function that yields chunk strings for the provided plain text.
 */
export function plainTextStrategy(opts: ChunkingOptions = {}) {
  return paragraphStrategy(opts);
}

