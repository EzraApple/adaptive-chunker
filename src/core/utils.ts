/**
 * Utility functions for the adaptive-chunker package.
 * Includes token counting helpers, overlap calculation utilities, and other shared functionality.
 */
import { TokenizerFn } from "./types";

// Default heuristic: ~0.75 tokens per word
export const defaultTokenizer: TokenizerFn = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  return Math.round(words * 0.75);
};

export function countTokens(
  text: string,
  tokenizer?: TokenizerFn
): number {
  return (tokenizer || defaultTokenizer)(text);
}