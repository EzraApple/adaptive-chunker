## adaptive-chunker

Smart, document-aware text chunking for RAG and LLM pipelines. It adaptively detects content types (Markdown, code, HTML, dialogue, LaTeX, logs, emails, plain text) and applies the most appropriate strategy, cascading to sensible fallbacks to respect token limits while preserving structure.

### Installation

```bash
npm install adaptive-chunker
# or
yarn add adaptive-chunker
# or
pnpm add adaptive-chunker
```

### Quick start

Import the high-level APIs and chunk some text.

```ts
import { chunkText, streamChunkText } from "adaptive-chunker";
// Optional: deep import if you prefer
// import { chunkText, streamChunkText } from "adaptive-chunker/chunk";

const text = "# Title\n\nThis is an example paragraph. It has some sentences.";

// Synchronous materialization
const chunks = chunkText(text, { maxTokens: 256, overlap: 0 });
console.log(chunks);

// Streaming (async generator)
for await (const chunk of streamChunkText(text, { maxTokens: 256 })) {
  console.log(chunk);
}
```

### Options (ChunkingOptions)

You can pass options to both `chunkText` and `streamChunkText`:

- **maxTokens**: Maximum estimated tokens per chunk. Default: 256 (package default).
- **overlap**: Desired token overlap between successive chunks. Default: 0.
- **tokenizer**: Optional function to estimate token counts. Default uses a lightweight internal `countTokens` heuristic.
- **allowFallback**: Whether strategies may cascade to smaller units when a block exceeds `maxTokens`. Default: true.

Example:

```ts
const chunks = chunkText(longText, {
  maxTokens: 512,
  overlap: 32,
  allowFallback: true,
});
```

## Strategies

### Adaptive strategy

The default behavior uses an adaptive router that inspects the text and chooses a document-type strategy, in the following priority:

1. Markdown
2. Code
3. HTML/XML
4. Dialogue/Transcript
5. LaTeX/Scientific
6. Logs
7. Emails
8. Plain text (default)

Oversized blocks (relative to `maxTokens`) cascade to fallbacks (e.g., paragraphs → sentences → fixed-size) when `allowFallback` is enabled.

Use adaptive explicitly (it is the default):

```ts
import { chunkText } from "adaptive-chunker";
import { adaptiveStrategy } from "adaptive-chunker/core/strategies/adaptive"; // optional explicit

const chunks = chunkText(text, { maxTokens: 256 }, adaptiveStrategy);
```

### Document-type strategies

You can opt into a specific document-type strategy when you know the input’s structure:

- **markdownStrategy**: Headings, fenced code blocks, lists, tables, paragraphs.
- **codeStrategy**: Function/class/indentation blocks; falls back to lines.
- **htmlStrategy**: `<p>`, `<div>`, `<section>`, `<pre>`, `<code>`, `<table>` blocks.
- **dialogueStrategy**: Speaker turns like `Speaker:`, `Q:`, `A:`.
- **latexStrategy**: `\section{}`, `\subsection{}`, environments, `$$...$$`.
- **logsStrategy**: Log lines with timestamps/levels.
- **emailStrategy**: Headers, quoted replies (`>`), body paragraphs.
- **plainTextStrategy**: Paragraph-based for unstructured text.

Usage:

```ts
import { chunkText } from "adaptive-chunker";
import { markdownStrategy } from "adaptive-chunker";

const chunks = chunkText(markdownDoc, { maxTokens: 400 }, markdownStrategy);
```

### Fallback strategies

Lower-level, structure-preserving strategies that many doc-type strategies fall back to:

- **paragraphStrategy**: Splits on paragraphs; falls back to sentences, then fixed.
- **sentenceStrategy**: Splits on sentences; falls back to fixed.
- **lineStrategy**: Splits on lines; falls back to fixed.
- **fixedStrategy**: Fixed-size, token-aligned splitting of words/whitespace.

Example: using `fixedStrategy` directly

```ts
import { chunkText, streamChunkText } from "adaptive-chunker";
import { fixedStrategy } from "adaptive-chunker";

const chunks = chunkText(text, { maxTokens: 200 }, fixedStrategy);

for await (const chunk of streamChunkText(text, { maxTokens: 200 }, fixedStrategy)) {
  // process chunk
}
```

### Notes

- All strategies preserve original formatting (including newlines) as much as possible.
- `allowFallback` controls whether oversized blocks are further split using the next fallback layer.
- Types are included; import `ChunkingOptions`, `ChunkingStrategy`, and `Tokenizer` from the package if needed.

### Releasing updates & versioning

Use semantic versioning: patch for fixes, minor for features, major for breaking changes.

1) Update version

```bash
# choose one
npm version patch   # 1.0.1
npm version minor   # 1.1.0
npm version major   # 2.0.0
```

2) Publish (build runs automatically via prepublishOnly)

```bash
npm publish --access public
# If you have 2FA enabled:
npm publish --access public --otp <code>
```

Tips:
- Validate contents before publishing:
```bash
npm publish --dry-run
npm pack
```
- CLI entry is `adaptive-chunker` (from `bin`).
- Only `dist/**`, `README.md`, `LICENSE`, and `package.json` are shipped.
