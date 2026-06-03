import { env } from '../../config/env.js';
import { normalizeWhitespace } from '../../utils/text.js';
import { estimateTokens } from '../../utils/token-estimator.js';

export type ChunkMetadata = {
  title?: string | undefined;
  source_type?: string | undefined;
  source_url?: string | undefined;
  chunk_index: number;
  heading?: string | undefined;
  headings: string[];
  block_types: string[];
};
export type Chunk = { content: string; token_count: number; metadata: ChunkMetadata };
export type ChunkOptions = {
  title?: string | undefined;
  source_type?: string | undefined;
  source_url?: string | undefined;
  targetTokens?: number;
  overlapTokens?: number;
};

type DocumentBlock = {
  content: string;
  headings: string[];
  blockType: 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'structured';
};

type DraftChunk = { content: string; headings: string[]; blockTypes: Set<string> };

const markdownHeadingPattern = /^(#{1,6})\s+(.+)$/;
const structuredHeadingPattern = /^([A-Z][A-Za-z0-9 /&().,'-]{2,80}:)$/;

export class ChunkerService {
  chunk(content: string, options: ChunkOptions = {}): Chunk[] {
    const target = options.targetTokens ?? env.RAG_CHUNK_TARGET_TOKENS;
    const overlap = Math.min(options.overlapTokens ?? env.RAG_CHUNK_OVERLAP_TOKENS, target - 1);
    const blocks = this.parseBlocks(content);
    if (blocks.length === 0) return [];

    const drafts: DraftChunk[] = [];
    let current: DraftChunk | undefined;

    for (const block of blocks) {
      const blockWithContext = this.withHeadingContext(block);
      if (!current) {
        current = {
          content: blockWithContext,
          headings: block.headings,
          blockTypes: new Set([block.blockType]),
        };
        continue;
      }

      const candidate = `${current.content}\n\n${blockWithContext}`;
      if (estimateTokens(candidate) > target && current.content.trim().length > 0) {
        drafts.push(current);
        current = {
          content: this.mergeOverlap(this.tail(current.content, overlap), blockWithContext),
          headings: block.headings,
          blockTypes: new Set([block.blockType]),
        };
      } else {
        current = {
          content: candidate,
          headings: this.mergeHeadings(current.headings, block.headings),
          blockTypes: new Set([...current.blockTypes, block.blockType]),
        };
      }
    }
    if (current?.content.trim()) drafts.push(current);

    return drafts
      .flatMap((draft) => this.splitOversized(draft, target, overlap))
      .map((draft, i) => ({
        content: draft.content,
        token_count: estimateTokens(draft.content),
        metadata: {
          title: options.title,
          source_type: options.source_type,
          source_url: options.source_url,
          chunk_index: i,
          heading: draft.headings.at(-1),
          headings: draft.headings,
          block_types: [...draft.blockTypes],
        },
      }));
  }

  private parseBlocks(content: string): DocumentBlock[] {
    const normalized = normalizeWhitespace(content).replace(/\r\n/g, '\n');
    if (!normalized) return [];

    const lines = normalized.split('\n');
    const blocks: DocumentBlock[] = [];
    const headingStack: string[] = [];
    let buffer: string[] = [];
    let bufferType: DocumentBlock['blockType'] = 'paragraph';
    let inFence = false;

    const flush = () => {
      const text = buffer.join('\n').trim();
      if (text) blocks.push({ content: text, headings: [...headingStack], blockType: bufferType });
      buffer = [];
      bufferType = 'paragraph';
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
        if (!inFence) flush();
        inFence = !inFence;
        bufferType = 'code';
        buffer.push(line);
        if (!inFence) flush();
        continue;
      }
      if (inFence) {
        buffer.push(line);
        continue;
      }

      const heading = markdownHeadingPattern.exec(trimmed);
      if (heading) {
        flush();
        const level = heading[1]!.length;
        const headingText = heading[2]!.replace(/#+$/, '').trim();
        headingStack.splice(level - 1, headingStack.length, headingText);
        blocks.push({ content: trimmed, headings: [...headingStack], blockType: 'heading' });
        continue;
      }

      if (!trimmed) {
        flush();
        continue;
      }

      const detectedType = this.detectBlockType(trimmed);
      if (buffer.length > 0 && detectedType !== bufferType) flush();
      bufferType = detectedType;
      buffer.push(line);
    }
    flush();
    return blocks;
  }

  private detectBlockType(line: string): DocumentBlock['blockType'] {
    if (/^[-*+]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) return 'list';
    if (line.startsWith('|') && line.endsWith('|')) return 'table';
    if (structuredHeadingPattern.test(line)) return 'structured';
    return 'paragraph';
  }

  private withHeadingContext(block: DocumentBlock): string {
    if (block.blockType === 'heading' || block.headings.length === 0) return block.content;
    const context = block.headings
      .map((heading, index) => `${'#'.repeat(Math.min(index + 1, 6))} ${heading}`)
      .join('\n');
    return `${context}\n\n${block.content}`;
  }

  private mergeHeadings(existing: string[], next: string[]): string[] {
    return [...new Set([...existing, ...next])];
  }

  private splitOversized(draft: DraftChunk, target: number, overlap: number): DraftChunk[] {
    const approxChars = target * 4;
    const overlapChars = overlap * 4;
    if (draft.content.length <= approxChars * 1.3) return [draft];
    const out: DraftChunk[] = [];
    const step = Math.max(approxChars - overlapChars, Math.floor(approxChars * 0.75));
    for (let start = 0; start < draft.content.length; start += step) {
      out.push({
        content: draft.content.slice(start, start + approxChars).trim(),
        headings: draft.headings,
        blockTypes: new Set(draft.blockTypes),
      });
    }
    return out.filter((chunk) => chunk.content.length > 0);
  }

  private mergeOverlap(overlap: string, next: string): string {
    return overlap ? `${overlap}\n\n${next}` : next;
  }

  private tail(text: string, tokens: number): string {
    if (tokens <= 0) return '';
    return text.slice(Math.max(0, text.length - tokens * 4)).trim();
  }
}
