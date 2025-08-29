import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";
import { paragraphStrategy } from "../fallbacks";

/**
 * Email-aware chunking strategy.
 *
 * Splits emails into blocks:
 * - Headers (From, To, Subject, Date)
 * - Body paragraphs
 * - Quoted replies (lines starting with ">")
 *
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
 * @returns A generator function that yields chunk strings for the provided email.
 */
export function emailStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    // Split into headers, quoted replies, and body paragraphs
    const blocks =
      text.match(
        /^(From:.*|To:.*|Subject:.*|Date:.*)$|^>.*$|(?:[^\n][\s\S]*?(?=\n{2,}|\Z))/gm
      ) ?? [text];

    // Fallback: paragraph strategy
    const fallback = paragraphStrategy(opts);

    return yield* traverseBlocks(blocks, opts, fallback);
  };
}

