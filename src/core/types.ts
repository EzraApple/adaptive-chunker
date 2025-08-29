// src/core/types.ts

/**
 * Function that estimates token count for a given string.
 */
export type Tokenizer = (text: string) => number;

/**
 * Options that control how chunking is performed.
 */
export interface ChunkingOptions {
  /** Maximum estimated tokens per chunk. */
  maxTokens?: number;
  /** Desired overlap in tokens between successive chunks. */
  overlap?: number;
  /** Optional tokenizer used to estimate token counts. */
  tokenizer?: Tokenizer;
  /** Whether strategies may cascade to fallback strategies for oversized blocks. */
  allowFallback?: boolean;
}

/**
 * A strategy function that yields chunk strings for the provided text.
 */
export type ChunkingStrategy = (
  text: string
) => Generator<string, void, unknown>;

/**
 * A factory that takes options and returns a strategy
 */
export type ChunkingStrategyFactory = (opts: ChunkingOptions) => ChunkingStrategy;