/**
 * Fixed-size chunking strategy implementation.
 * Splits text into chunks of a specified maximum size with optional overlap.
 */
import { ChunkingOptions } from "../types";
import { countTokens } from "../utils";

export function fixedStrategy(opts: ChunkingOptions = {}) {
  const { maxTokens = 200, overlap = 0, tokenizer } = opts;

  return (text: string): string[] => {
    const words = text.trim().split(/\s+/);
    const chunks: string[] = [];

    let start = 0;
    while (start < words.length) {
      let end = start;
      let tokenCount = 0;

      while (end < words.length) {
        const word = words[end] ?? "";
        if (tokenCount + countTokens(word, tokenizer) > maxTokens) {
          break;
        }
        tokenCount += countTokens(word, tokenizer);
        end++;
      }

      chunks.push(words.slice(start, end).join(" "));

      // Move forward with overlap
      start = end - overlap > start ? end - overlap : end;
    }

    return chunks;
  };
}