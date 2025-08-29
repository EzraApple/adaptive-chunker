import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";
import { sentenceStrategy } from "../fallbacks";

/**
 * Dialogue-aware chunking strategy.
 *
 * Splits text into blocks based on speaker turns (e.g., "Speaker:", "Q:", "A:").
 * Preserves formatting.
 *
 * If a block exceeds the max token limit:
 * - By default, it falls back to sentence-based splitting.
 * - Sentences then fall back to fixed-size splitting.
 *
 * @param opts.maxTokens Maximum estimated tokens per chunk. Default: 200.
 * @param opts.overlap Number of tokens to overlap between successive chunks. Default: 0.
 * @param opts.tokenizer Optional tokenizer used for estimating token counts.
 * @param opts.allowFallback Whether to split oversized blocks into smaller units. Default: true.
 * @returns A generator function that yields chunk strings for the provided dialogue.
 */
export function dialogueStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    const blocks = text.match(/^\w+:\s.*(?:\n(?!\w+:).*)*/gm) ?? [text];

    // Fallback: sentence strategy
    const fallback = sentenceStrategy(opts);

    return yield* traverseBlocks(blocks, opts, fallback);
  };
}

