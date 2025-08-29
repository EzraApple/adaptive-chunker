/**
 * Utility functions for the adaptive-chunker package.
 * Includes token counting helpers, overlap calculation utilities, and other shared functionality.
 */
import { Tokenizer } from './types';

/**
 * Default tokenizer heuristic: ~0.75 tokens per word.
 * Uses a simple word count to approximate token usage.
 */
export const defaultTokenizer: Tokenizer = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  return Math.round(words * 0.75);
};

/**
 * Estimate token count for a string using a provided tokenizer
 * or the default tokenizer if none is provided.
 *
 * @param text Text to measure.
 * @param tokenizer Optional tokenizer function.
 * @returns Estimated number of tokens.
 */
export function countTokens(
  text: string,
  tokenizer?: Tokenizer,
): number {
  return (tokenizer || defaultTokenizer)(text);
}

/**
 * Compute how many trailing blocks need to be overlapped to reach a target
 * token count when stepping back from the end of a chunk.
 *
 * @param blocks Blocks that made up the last emitted chunk.
 * @param tokenizer Tokenizer used to estimate token counts.
 * @param overlapTokens Desired overlap in tokens.
 * @returns Number of blocks to step back for the next chunk.
 */
export function computeOverlapIndex(
  blocks: string[],
  tokenizer: Tokenizer,
  overlapTokens: number,
): number {
  let tokens = 0;
  let stepBack = 0;

  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    if (block === undefined) {
      continue;
    }
    const blockTokens = tokenizer(block);
    if (tokens + blockTokens >= overlapTokens) {
      break;
    }
    tokens += blockTokens;
    stepBack++;
  }

  return stepBack;
}