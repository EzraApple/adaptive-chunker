import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";
import { paragraphStrategy } from "../fallbacks";

/**
 * Markdown-aware chunking strategy.
 *
 * Splits text into Markdown blocks, preserving formatting:
 * - Headings (#, ##, ###, etc.)
 * - Fenced code blocks (``` ... ```)
 * - Lists (-, *, 1.)
 * - Tables (| ... |)
 * - Paragraphs
 *
 * If a block exceeds the max token limit:
 * - By default, it falls back to paragraph-based splitting.
 * - Paragraphs then fall back to sentence-based splitting.
 * - Sentences then fall back to fixed-size splitting.
 *
 * @param opts.maxTokens Maximum estimated tokens per chunk. Default: 200.
 * @param opts.overlap Number of tokens to overlap between successive chunks. Default: 0.
 * @param opts.tokenizer Optional tokenizer used for estimating token counts.
 * @param opts.allowFallback Whether to split oversized blocks into smaller units. Default: true.
 * @returns A generator function that yields chunk strings for the provided text.
 *
 * @example
 * const strategy = markdownStrategy({ maxTokens: 500 });
 * for (const chunk of strategy(markdownText)) {
 *   // process chunk
 * }
 */
export function markdownStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    // Regex to capture Markdown blocks
    // - Headings: ^#{1,6} .*
    // - Fenced code blocks: ``` ... ```
    // - Lists: ^(\s*[-*+]|\d+\.) .*
    // - Tables: ^\|.*\|$
    // - Paragraphs: fallback
    const blockRegex =
      /(^#{1,6} .*?$)|(^```[\s\S]*?```)|(^\s*[-*+] .*?$)|(^\d+\. .*?$)|(^\|.*\|$)/gm;

    const blocks: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = blockRegex.exec(text)) !== null) {
      // Push text before the match as a paragraph (if any)
      if (match.index > lastIndex) {
        const before = text.slice(lastIndex, match.index);
        if (before.trim().length > 0) {
          blocks.push(before);
        }
      }
      // Push the matched block
      blocks.push(match[0]!);
      lastIndex = blockRegex.lastIndex;
    }

    // Push any remaining text as a paragraph
    if (lastIndex < text.length) {
      const rest = text.slice(lastIndex);
      if (rest.trim().length > 0) {
        blocks.push(rest);
      }
    }

    // Fallback: paragraph strategy for oversized blocks
    const fallback = paragraphStrategy(opts);

    return yield* traverseBlocks(blocks, opts, fallback);
  };
}

