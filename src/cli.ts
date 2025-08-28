#!/usr/bin/env node

/**
 * Command-line interface entrypoint for the adaptive-chunker package.
 * Provides CLI commands for chunking text files using various strategies.
 */
import fs from "fs";
import { chunkText } from "./chunk";
import { fixedStrategy } from "./core/strategies/fixed";
import { sentenceStrategy } from "./core/strategies/sentence";

function parseArgs() {
  const args = process.argv.slice(2);
  console.log(args);
  const opts: any = {};
  let file: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--strategy") {
      const value = args[++i];
      if (value) opts.strategy = value;
    } else if (arg === "--maxTokens") {
      const value = args[++i];
      if (value) opts.maxTokens = parseInt(value, 10);
    } else if (arg === "--overlap") {
      const value = args[++i];
      if (value) opts.overlap = parseInt(value, 10);
    } else if (!file && arg) {
      file = arg;
    }
  }

  return { file, opts };
}

async function main() {
  const { file, opts } = parseArgs();
  if (!file) {
    console.error("Usage: adaptive-chunker <file> --strategy fixed|sentence");
    process.exit(1);
  }

  const text = fs.readFileSync(file, "utf-8");

  let strategyFn;
  if (opts.strategy === "fixed") {
    strategyFn = fixedStrategy(opts);
  } else if (opts.strategy === "sentence") {
    strategyFn = sentenceStrategy(opts);
  } else {
    console.error("Unknown strategy:", opts.strategy);
    process.exit(1);
  }

  const chunks = chunkText(strategyFn, text);
  chunks.forEach((c, i) => {
    console.log(`--- Chunk ${i + 1} ---\n${c}\n`);
  });
}

main();