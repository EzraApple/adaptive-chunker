import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";
import { fixedStrategy } from "./fixed";

/**
 * Sentence-aware chunking strategy.
 * Preserves original whitespace (including newlines).
 * Falls back to fixed-size splitting if a sentence exceeds maxTokens.
 *
 * @param opts Chunking options (maxTokens, overlap, tokenizer, allowFallback).
 * @returns A generator factory that yields sentence-aware chunks for the input text.
 */
export function sentenceStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    // Split into sentences, preserving punctuation + trailing whitespace
    const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) ?? [text];

    // Fallback: fixed strategy for oversized sentences
    const fallback = fixedStrategy(opts);

    return yield* traverseBlocks(sentences, opts, fallback);
  };
}

