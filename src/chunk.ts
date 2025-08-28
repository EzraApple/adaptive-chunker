/**
 * Core chunking functions: chunkText and streamChunkText.
 * These functions accept chunking strategies and return either 
 * an array of chunks or an async generator for streaming chunks.
 */
import { ChunkingStrategy } from "./core/types";

export function chunkText(
  strategy: ChunkingStrategy,
  text: string
): string[] {
  return strategy(text);
}

export async function* streamChunkText(
  strategy: ChunkingStrategy,
  text: string
) {
  for (const chunk of strategy(text)) {
    yield chunk;
  }
}