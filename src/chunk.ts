// src/chunk.ts
import { ChunkingOptions, ChunkingStrategyFactory } from "./core/types";
import { adaptiveStrategy } from "./core/strategies/adaptive";
import { countTokens } from "./core/utils";

/**
 * Fully materialize chunks from a given strategy.
 *
 * If no strategy is provided, defaults to adaptiveStrategy.
 *
 * @param text Input text to be chunked.
 * @param opts Chunking options (maxTokens, overlap, tokenizer, allowFallback).
 * @param strategy Optional strategy factory. Defaults to adaptiveStrategy.
 * @returns Array of chunk strings in order.
 */
export function chunkText(
  text: string,
  opts: ChunkingOptions = {
    maxTokens: 256,
    overlap: 0,
    tokenizer: countTokens,
    allowFallback: true,
  },
  strategy: ChunkingStrategyFactory = adaptiveStrategy
): string[] {
  const chunker = strategy(opts); // instantiate with opts
  return Array.from(chunker(text));
}

/**
 * Stream chunks lazily from a given strategy.
 *
 * If no strategy is provided, defaults to adaptiveStrategy.
 *
 * Useful for large inputs where you want to process chunks incrementally
 * without allocating the entire array of chunks.
 *
 * @param text Input text to be chunked.
 * @param opts Chunking options (maxTokens, overlap, tokenizer, allowFallback).
 * @param strategy Optional strategy factory. Defaults to adaptiveStrategy.
 * @returns Async generator yielding chunk strings.
 */
export async function* streamChunkText(
  text: string,
  opts: ChunkingOptions = {
    maxTokens: 256,
    overlap: 0,
    tokenizer: countTokens,
    allowFallback: true,
  },
  strategy: ChunkingStrategyFactory = adaptiveStrategy
) {
  const chunker = strategy(opts); // instantiate with opts
  for (const chunk of chunker(text)) {
    yield chunk;
  }
}