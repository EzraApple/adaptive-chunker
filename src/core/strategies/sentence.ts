/**
 * Sentence-based chunking strategy implementation.
 * Splits text at sentence boundaries while respecting maximum chunk size limits.
 */
import { ChunkingOptions } from "../types";
import { countTokens } from "../utils";

export function sentenceStrategy(opts: ChunkingOptions = {}) {
  const { maxTokens = 200, tokenizer } = opts;

  return (text: string): string[] => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];

    let buffer: string[] = [];
    let tokenCount = 0;

    for (const sentence of sentences) {
      const sentenceTokens = countTokens(sentence, tokenizer);

      if (tokenCount + sentenceTokens > maxTokens && buffer.length > 0) {
        chunks.push(buffer.join(" "));
        buffer = [];
        tokenCount = 0;
      }

      buffer.push(sentence);
      tokenCount += sentenceTokens;
    }

    if (buffer.length > 0) {
      chunks.push(buffer.join(" "));
    }

    return chunks;
  };
}