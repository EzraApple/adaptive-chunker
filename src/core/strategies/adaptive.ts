import { ChunkingOptions } from "../types";
import { markdownStrategy, codeStrategy, htmlStrategy, dialogueStrategy, latexStrategy, logsStrategy, emailStrategy, plainTextStrategy } from "./doc-type";

/**
 * Adaptive strategy that routes text to the most appropriate
 * document-type strategy based on simple heuristics.
 *
 * Detection priority:
 * 1. Markdown
 * 2. Code
 * 3. HTML/XML
 * 4. Dialogue/Transcript
 * 5. LaTeX/Scientific
 * 6. Logs
 * 7. Emails
 * 8. Plain Text (default)
 *
 * @param opts Chunking options (maxTokens, overlap, tokenizer, allowFallback).
 * @returns A generator function that yields chunk strings for the provided text.
 *
 * @example
 * const chunks = chunkText(text); // adaptive by default
 * const chunks2 = chunkText(text, adaptiveStrategy({ maxTokens: 512 }));
 */
export function adaptiveStrategy(opts: ChunkingOptions = {}) {
    return function* (text: string): Generator<string> {
      // Markdown
      if (/^# |\n```/.test(text) || /\|[-:]+\|/.test(text)) {
        return yield* markdownStrategy(opts)(text);
      }
  
      // Code
      if (/\b(function|class|def|public |private |async )\b/.test(text)) {
        return yield* codeStrategy(opts)(text);
      }
  
      // HTML/XML
      if (/<[a-z][\s\S]*?>/.test(text)) {
        return yield* htmlStrategy(opts)(text);
      }
  
      // Dialogue
      if (/^\w+:/m.test(text) || /^Q:|^A:/m.test(text)) {
        return yield* dialogueStrategy(opts)(text);
      }
  
      // LaTeX
      if (/\\section\{|\\begin\{|\\end\{|\$\$/m.test(text)) {
        return yield* latexStrategy(opts)(text);
      }
  
      // Logs
      if (
        /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/m.test(text) ||
        /\[(INFO|ERROR|WARN|DEBUG)\]/.test(text)
      ) {
        return yield* logsStrategy(opts)(text);
      }
  
      // Emails
      if (/^From:|^To:|^Subject:|^Date:/m.test(text) || /^>/.test(text)) {
        return yield* emailStrategy(opts)(text);
      }
  
      // Default: plain text
      return yield* plainTextStrategy(opts)(text);
    };
  }