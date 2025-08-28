/**
 * Shared types and interfaces for the adaptive-chunker package.
 * Defines common data structures used across all chunking strategies and core functions.
 */
export type TokenizerFn = (text: string) => number;

export interface ChunkingOptions {
  maxTokens?: number;
  overlap?: number;
  tokenizer?: TokenizerFn;
}

export type ChunkingStrategy = (
  text: string,
  opts?: ChunkingOptions
) => string[];

export type ChunkingStream = (
  text: string,
  opts?: ChunkingOptions
) => AsyncGenerator<string, void, unknown>;