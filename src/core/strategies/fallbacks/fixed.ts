import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";

/**
 * Fixed-size, token-aligned chunking strategy.
 * Preserves original whitespace (including newlines).
 *
 * @param opts Chunking options (maxTokens, overlap, tokenizer, allowFallback).
 * @returns A generator factory that yields fixed-size chunks for the input text.
 */
export function fixedStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    // Split into words and whitespace, preserving formatting
    const tokens = text.match(/\S+|\s+/g) ?? [];
    return yield* traverseBlocks(tokens, opts);
  };
}

