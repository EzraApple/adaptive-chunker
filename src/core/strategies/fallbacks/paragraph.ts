import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";
import { sentenceStrategy } from "./sentence";

/**
 * Paragraph-aware chunking strategy.
 *
 * Splits text into paragraphs based on:
 * - Two or more newlines ("\n\n+")
 * - Or indentation at the start of a line
 *
 * Preserves original whitespace and formatting.
 *
 * If a paragraph exceeds the max token limit:
 * - By default, it falls back to sentence-based splitting.
 * - If a sentence then exceeds the limit, sentence strategy falls back to fixed.
 *
 * @param opts.maxTokens Maximum estimated tokens per chunk. Default: 200.
 * @param opts.overlap Number of tokens to overlap between successive chunks. Default: 0.
 * @param opts.tokenizer Optional tokenizer used for estimating token counts.
 * @param opts.allowFallback Whether to split oversized paragraphs into smaller units. Default: true.
 * @returns A generator function that yields chunk strings for the provided text.
 */
export function paragraphStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    // Split into paragraphs, preserving delimiters
    // Matches blocks separated by 2+ newlines OR indentation
    const paragraphs =
      text.match(/(?:[^\n][\s\S]*?(?=\n{2,}|\n\s|\Z))/g) ?? [text];

    // Fallback: sentence strategy for oversized paragraphs
    const fallback = sentenceStrategy(opts);

    return yield* traverseBlocks(paragraphs, opts, fallback);
  };
}

