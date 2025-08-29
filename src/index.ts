/**
 * Public API entrypoint for the adaptive-chunker package.
 * Exports main chunking functions and strategies for use by consumers.
 */
export { chunkText, streamChunkText } from "./chunk";
export { fixedStrategy, sentenceStrategy, paragraphStrategy, lineStrategy } from "./core/strategies/fallbacks";
export { markdownStrategy, codeStrategy, htmlStrategy, dialogueStrategy, latexStrategy, plainTextStrategy, logsStrategy, emailStrategy } from "./core/strategies/doc-type";
export type {
  ChunkingOptions,
  ChunkingStrategy,
  Tokenizer,
} from "./core/types";