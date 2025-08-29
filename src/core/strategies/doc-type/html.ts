import { ChunkingOptions } from "../../types";
import { traverseBlocks } from "../../traverse";
import { paragraphStrategy } from "../fallbacks";

/**
 * HTML/XML-aware chunking strategy.
 *
 * Splits text into blocks based on HTML/XML tags such as <p>, <div>, <section>,
 * <pre>, <code>, <table>. Preserves formatting.
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
 * @returns A generator function that yields chunk strings for the provided HTML/XML.
 */
export function htmlStrategy(opts: ChunkingOptions = {}) {
  return function* (text: string): Generator<string> {
    const blocks =
      text.match(/<p[\s\S]*?<\/p>|<div[\s\S]*?<\/div>|<section[\s\S]*?<\/section>|<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>|<table[\s\S]*?<\/table>/gi) ??
      [text];

    // Fallback: paragraph strategy
    const fallback = paragraphStrategy(opts);

    return yield* traverseBlocks(blocks, opts, fallback);
  };
}

