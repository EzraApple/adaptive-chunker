import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";
import { fixedStrategy } from "./fixed";

/**
 * Line-aware chunking strategy.
 *
 * Splits text into lines, preserving line breaks and formatting.
 *
 * If a line exceeds the max token limit:
 * - By default, it falls back to fixed-size splitting.
 * - This behavior can be disabled with opts.allowFallback = false.
 *
 * @param opts.maxTokens Maximum estimated tokens per chunk. Default: 200.
 * @param opts.overlap Number of tokens to overlap between successive chunks. Default: 0.
 * @param opts.tokenizer Optional tokenizer used for estimating token counts.
 * @param opts.allowFallback Whether to split oversized lines into smaller units. Default: true.
 * @returns A generator function that yields chunk strings for the provided text.
 */
export function lineStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    // Split into lines, preserving newline characters
    const lines = text.match(/.*(?:\r?\n|$)/g) ?? [text];

    // Fallback: fixed strategy for oversized lines
    const fallback = fixedStrategy(opts);

    return yield* traverseBlocks(lines, opts, fallback);
  };
}

