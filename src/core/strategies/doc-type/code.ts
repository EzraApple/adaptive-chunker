import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";
import { lineStrategy } from "../fallbacks";

/**
 * Code-aware chunking strategy.
 *
 * Splits code into blocks based on function/class definitions,
 * fenced code blocks, or indentation. Preserves formatting.
 *
 * If a block exceeds the max token limit:
 * - By default, it falls back to line-based splitting.
 * - Lines then fall back to fixed-size splitting.
 *
 * @param opts.maxTokens Maximum estimated tokens per chunk. Default: 200.
 * @param opts.overlap Number of tokens to overlap between successive chunks. Default: 0.
 * @param opts.tokenizer Optional tokenizer used for estimating token counts.
 * @param opts.allowFallback Whether to split oversized blocks into smaller units. Default: true.
 * @returns A generator function that yields chunk strings for the provided code.
 */
export function codeStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    // Split by function/class definitions or fenced code blocks
    const blocks =
      text.match(
        /(?:^[ \t]*(?:def |class |function |if |for |while |switch |async |public |private).*$[\r\n]*)+|(?:```[\s\S]*?```)/gm
      ) ?? [text];

    // Fallback: line strategy
    const fallback = lineStrategy(opts);

    return yield* traverseBlocks(blocks, opts, fallback);
  };
}

