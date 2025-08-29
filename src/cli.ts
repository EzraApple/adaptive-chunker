#!/usr/bin/env node

/**
 * Command-line interface entrypoint for the adaptive-chunker package.
 * Provides CLI commands for chunking text files or raw strings using various strategies.
 */
import fs from "fs";
import { streamChunkText } from "./chunk";

// Doc-type strategies
import {
  markdownStrategy,
  codeStrategy,
  htmlStrategy,
  dialogueStrategy,
  latexStrategy,
  logsStrategy,
  emailStrategy,
  plainTextStrategy,
} from "./core/strategies/doc-type";

// Fallback strategies
import {
  fixedStrategy,
  sentenceStrategy,
  paragraphStrategy,
  lineStrategy,
} from "./core/strategies/fallbacks";

import { adaptiveStrategy } from "./core/strategies/adaptive";
import { ChunkingStrategyFactory } from "./core/types";

function parseArgs() {
  const args = process.argv.slice(2);
  const opts: any = {};
  let file: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--strategy") {
      opts.strategy = args[++i];
    } else if (arg === "--maxTokens") {
      opts.maxTokens = parseInt(args[++i] ?? "0", 10);
    } else if (arg === "--overlap") {
      opts.overlap = parseInt(args[++i] ?? "0", 10);
    } else if (arg === "--text") {
      opts.text = args[++i];
    } else if (arg === "--maxChunksDisplayed") {
      opts.maxChunksDisplayed = parseInt(args[++i] ?? "0", 10);
    } else if (!file && arg && !arg.startsWith("--")) {
      file = arg;
    }
  }

  return { file, opts };
}

async function main() {
  const { file, opts } = parseArgs();

  if (!file && (!opts.text || opts.text === "")) {
    console.error(
      "Usage: adaptive-chunker <file> [--strategy <name>] [--maxTokens <n>] [--overlap <n>] [--maxChunksDisplayed <n>]\n" +
        "       adaptive-chunker --text 'your text here' [--strategy <name>] [--maxTokens <n>] [--overlap <n>] [--maxChunksDisplayed <n>]\n" +
        "Tip: use 'npm run cli -- <args>' to forward flags in npm scripts."
    );
    process.exit(1);
  }

  const text =
    opts.text && opts.text !== ""
      ? opts.text
      : fs.readFileSync(file as string, "utf-8");

  // Pick strategy factory (defaults to adaptive)
  let strategyFactory: ChunkingStrategyFactory;
  switch (opts.strategy) {
    case "fixed":
      strategyFactory = fixedStrategy;
      break;
    case "sentence":
      strategyFactory = sentenceStrategy;
      break;
    case "paragraph":
      strategyFactory = paragraphStrategy;
      break;
    case "line":
      strategyFactory = lineStrategy;
      break;
    case "markdown":
      strategyFactory = markdownStrategy;
      break;
    case "code":
      strategyFactory = codeStrategy;
      break;
    case "html":
      strategyFactory = htmlStrategy;
      break;
    case "dialogue":
      strategyFactory = dialogueStrategy;
      break;
    case "latex":
      strategyFactory = latexStrategy;
      break;
    case "logs":
      strategyFactory = logsStrategy;
      break;
    case "email":
      strategyFactory = emailStrategy;
      break;
    case "plain":
      strategyFactory = plainTextStrategy;
      break;
    case undefined:
    case null:
      strategyFactory = adaptiveStrategy;
      break;
    default:
      console.error(
        "Unknown strategy:",
        opts.strategy,
        "\nValid strategies: fixed, sentence, paragraph, line, markdown, code, html, dialogue, latex, logs, email, plain"
      );
      process.exit(1);
  }

  // Track memory before
  const memBefore = process.memoryUsage().rss;

  const start = process.hrtime.bigint();
  const chunks: string[] = [];
  let totalChars = 0;

  // ✅ Pass factory into streamChunkText
  for await (const chunk of streamChunkText(text, opts, strategyFactory)) {
    chunks.push(chunk);
    totalChars += chunk.length;
  }

  const end = process.hrtime.bigint();
  const memAfter = process.memoryUsage().rss;

  const totalNs = Number(end - start);
  const totalMs = totalNs / 1e6;
  const totalSec = totalNs / 1e9;
  const count = chunks.length;

  // Show preview
  const toShow = opts.maxChunksDisplayed ?? 10;
  for (let i = 0; i < Math.min(toShow, count); i++) {
    console.log(`--- Chunk ${i + 1} ---\n${chunks[i]}\n`);
  }
  if (count > toShow) {
    console.log(`... (${count - toShow} more chunks not shown)\n`);
  }

  // Stats: mean/min/max/std over character length
  const lengths = chunks.map((c) => c.length);
  const sum = lengths.reduce((a, b) => a + b, 0);
  const mean = count > 0 ? sum / count : 0;
  const min = count > 0 ? Math.min(...lengths) : 0;
  const max = count > 0 ? Math.max(...lengths) : 0;
  const variance =
    count > 0
      ? lengths.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count
      : 0;
  const std = Math.sqrt(variance);

  const chunksPerSec = totalSec > 0 ? count / totalSec : Infinity;
  const charsPerSec = totalSec > 0 ? totalChars / totalSec : Infinity;

  console.log("=== Stats ===");
  console.log(`Total chunks: ${count}`);
  console.log(`Total characters: ${totalChars}`);
  console.log(`Chunks/s: ${chunksPerSec.toFixed(2)}`);
  console.log(`Chars/s: ${charsPerSec.toFixed(2)}`);
  console.log(`Mean chunk size (chars): ${mean.toFixed(2)}`);
  console.log(`Min/Max chunk size (chars): ${min} / ${max}`);
  console.log(`Std dev chunk size (chars): ${std.toFixed(2)}`);
  console.log(`Total time: ${totalMs.toFixed(2)} ms`);
  console.log(
    `Memory usage: ${(memBefore / 1024 / 1024).toFixed(
      2
    )} MB -> ${(memAfter / 1024 / 1024).toFixed(2)} MB`
  );
}

main();