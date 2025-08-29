// src/core/traverse.ts
import { ChunkingOptions, ChunkingStrategy } from './types';
import { countTokens } from './utils';

/**
 * Traverse a list of blocks (sentences, paragraphs, words, etc.)
 * and yield chunks that respect maxTokens and overlap.
 *
 * Oversized blocks (exceeding maxTokens alone) can be handled via an
 * optional fallback strategy when `allowFallback` is enabled.
 *
 * @param blocks Precomputed blocks (e.g. sentences, paragraphs).
 * @param opts Chunking options (maxTokens, overlap, tokenizer, allowFallback).
 * @param fallback Optional fallback strategy for oversized blocks.
 * @returns A generator yielding chunk strings composed from input blocks.
 */
export function* traverseBlocks(
  blocks: string[],
  opts: ChunkingOptions,
  fallback?: ChunkingStrategy,
): Generator<string> {
  const { maxTokens = 200, overlap = 0, tokenizer, allowFallback = true } = opts;

  let index = 0;
  while (index < blocks.length) {
    let tokenCount = 0;
    let chunkBlocks: string[] = [];
    let end = index;

    while (end < blocks.length) {
      const block = blocks[end] ?? '';
      const blockTokens = countTokens(block, tokenizer);

      if (blockTokens > maxTokens) {
        // Oversized block
        if (allowFallback && fallback) {
          // Flush current buffer first
          if (chunkBlocks.length > 0) {
            yield chunkBlocks.join('');
            chunkBlocks = [];
            tokenCount = 0;
          }
          // Delegate to fallback strategy
          for (const fbChunk of fallback(block)) {
            yield fbChunk;
          }
        } else {
          // Just yield the oversized block (not recommended)
          yield block;
        }
        end++;
        continue;
      }

      if (tokenCount + blockTokens > maxTokens && chunkBlocks.length > 0) {
        break;
      }

      chunkBlocks.push(block);
      tokenCount += blockTokens;
      end++;
    }

    if (chunkBlocks.length > 0) {
      yield chunkBlocks.join('');
    }

    // Compute overlap: step back enough blocks to cover overlap tokens
    if (overlap > 0 && end < blocks.length) {
      let backTokens = 0;
      let stepBack = 0;
      for (let i = chunkBlocks.length - 1; i >= 0; i--) {
        const block = chunkBlocks[i];
        if (block === undefined) {
          continue;
        }
        const t = countTokens(block, tokenizer);
        if (backTokens + t >= overlap) {
          break;
        }
        backTokens += t;
        stepBack++;
      }
      index = Math.max(end - stepBack, index + 1);
    } else {
      index = end;
    }
  }
}