/**
 * Public API entrypoint for the adaptive-chunker package.
 * Exports main chunking functions and strategies for use by consumers.
 */
export { chunkText, streamChunkText } from "./chunk";
export { fixedStrategy } from "./core/strategies/fixed";
export { sentenceStrategy } from "./core/strategies/sentence";
export type {
  ChunkingOptions,
  ChunkingStrategy,
  ChunkingStream,
  TokenizerFn,
} from "./core/types";