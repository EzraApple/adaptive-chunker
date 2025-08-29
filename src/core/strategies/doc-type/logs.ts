import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";
import { lineStrategy } from "../fallbacks";

/**
 * Log-aware chunking strategy.
 *
 * Splits text into log entries, typically one per line, preserving formatting.
 * Detects timestamps or log-level markers as natural boundaries.
 *
 * If a log entry exceeds the max token limit:
 * - By default, it falls back to line-based splitting.
 * - Lines then fall back to fixed-size splitting.
 *
 * @param opts.maxTokens Maximum estimated tokens per chunk. Default: 200.
 * @param opts.overlap Number of tokens to overlap between successive chunks. Default: 0.
 * @param opts.tokenizer Optional tokenizer used for estimating token counts.
 * @param opts.allowFallback Whether to split oversized entries into smaller units. Default: true.
 * @returns A generator function that yields chunk strings for the provided logs.
 */
export function logsStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    // Match log entries by timestamp or log level
    const blocks =
      text.match(
        /^(?:\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}|\[\w+\]|\w+Error:).*$/gm
      ) ?? text.split(/\n/);

    // Fallback: line strategy
    const fallback = lineStrategy(opts);

    return yield* traverseBlocks(blocks, opts, fallback);
  };
}

