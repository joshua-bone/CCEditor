// frontend/src/core/game/cc1/cc1DatCodec.ts

import { createGrid } from '../../model/grid';
import type { Size } from '../../model/types';
import type { GameLevelMetadata, GameLevelset, GameLevel } from '../../model/gameTypes';
import type { CC1Cell } from './cc1Types';
import { CC1TileId, type CC1TileId as CC1TileCode } from './cc1Tiles';

interface Cc1ParsedLevelHeader {
  number: number;
  timeLimit: number;
  requiredChips: number;
  mapDetail: number;
}

interface Cc1ParsedLevelMeta {
  title?: string;
  hint?: string;
  author?: string;
  password?: string;
}

/**
 * Minimal binary reader/writer for CC1 DAT.
 */
class BinaryReader {
  private readonly view: DataView;
  private offset = 0;

  constructor(buffer: ArrayBufferLike) {
    this.view = new DataView(buffer);
  }

  get position(): number {
    return this.offset;
  }

  byte(): number {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  short(): number {
    const value = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return value;
  }

  long(): number {
    const value = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  bytes(length: number): Uint8Array {
    const slice = new Uint8Array(this.view.buffer, this.offset, length);
    this.offset += length;
    return slice;
  }
}

class BinaryWriter {
  private readonly chunks: Uint8Array[] = [];

  byte(value: number): void {
    const arr = new Uint8Array(1);
    arr[0] = value & 0xff;
    this.chunks.push(arr);
  }

  short(value: number): void {
    const arr = new Uint8Array(2);
    const view = new DataView(arr.buffer);
    view.setUint16(0, value, true);
    this.chunks.push(arr);
  }

  long(value: number): void {
    const arr = new Uint8Array(4);
    const view = new DataView(arr.buffer);
    view.setUint32(0, value, true);
    this.chunks.push(arr);
  }

  bytes(data: Uint8Array): void {
    this.chunks.push(data);
  }

  toArrayBuffer(): ArrayBuffer {
    const total = this.chunks.reduce((sum, arr) => sum + arr.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const arr of this.chunks) {
      out.set(arr, offset);
      offset += arr.length;
    }
    return out.buffer;
  }
}

// ---------------------------------------------------------------------------
// Decoding helpers (parse)
// ---------------------------------------------------------------------------

function parseLayer(reader: BinaryReader): Uint8Array {
  const layerSize = reader.short();
  const data = reader.bytes(layerSize);

  const inner = new BinaryReader(
    data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
  );

  const tiles: number[] = [];

  while (tiles.length < 32 * 32) {
    const nextByte = inner.byte();
    if (nextByte === 0xff) {
      const length = inner.byte();
      const tileCode = inner.byte();
      for (let i = 0; i < length; i += 1) {
        tiles.push(tileCode);
      }
    } else {
      tiles.push(nextByte);
    }
  }

  return new Uint8Array(tiles);
}

function parseLevelHeader(reader: BinaryReader): Cc1ParsedLevelHeader {
  reader.short(); // level_size_bytes (unused)
  const number = reader.short();
  const timeLimit = reader.short();
  const requiredChips = reader.short();
  const mapDetail = reader.short();
  return { number, timeLimit, requiredChips, mapDetail };
}

const TITLE_FIELD = 3;
// We ignore traps/cloners/movement for now
const PASSWORD_FIELD = 6;
const HINT_FIELD = 7;
const AUTHOR_FIELD = 9;

function decodeWindows1252(bytes: Uint8Array): string {
  // Minimal approximation using charCode & 0xff
  const chars: string[] = [];
  for (let i = 0; i < bytes.length; i += 1) {
    chars.push(String.fromCharCode(bytes[i]));
  }
  return chars.join('');
}

function decodePassword(bytes: Uint8Array): string {
  // XOR with 0x99, drop trailing null
  const decoded = bytes.map((b) => b ^ 0x99);
  const trimmed =
    decoded[decoded.length - 1] === 0 ? decoded.slice(0, decoded.length - 1) : decoded;
  return decodeWindows1252(trimmed);
}

function parseLevelFields(reader: BinaryReader): Cc1ParsedLevelMeta {
  const bytesRemaining = reader.short();
  const startPosition = reader.position;

  let title: string | undefined;
  let password: string | undefined;
  let hint: string | undefined;
  let author: string | undefined;

  let remaining = bytesRemaining;
  while (remaining > 0) {
    const field = reader.byte();
    const length = reader.byte();
    const content = reader.bytes(length);
    remaining -= length + 2;

    if (field === TITLE_FIELD) {
      const text = content.slice(0, content.length - 1);
      title = decodeWindows1252(text);
    } else if (field === PASSWORD_FIELD) {
      password = decodePassword(content);
    } else if (field === HINT_FIELD) {
      const text = content.slice(0, content.length - 1);
      hint = decodeWindows1252(text);
    } else if (field === AUTHOR_FIELD) {
      const text = content.slice(0, content.length - 1);
      author = decodeWindows1252(text);
    }
  }

  const offsetDelta = reader.position - startPosition;
  if (offsetDelta !== bytesRemaining) {
    console.warn('Level field length mismatch', { bytesRemaining, offsetDelta });
  }

  return { title, hint, author, password };
}

function buildLevelGrid(top: Uint8Array, bottom: Uint8Array): CC1Cell[] {
  const cells: CC1Cell[] = [];
  const length = top.length;

  for (let i = 0; i < length; i += 1) {
    const topCode = top[i] as CC1TileCode;
    const bottomCode = bottom[i] as CC1TileCode;

    cells.push({
      gameId: 'cc1',
      top: topCode,
      bottom: bottomCode,
    });
  }

  return cells;
}

// ---------------------------------------------------------------------------
// parseDat: ArrayBuffer -> GameLevelset<CC1Cell>
// ---------------------------------------------------------------------------

export function parseDat(buffer: ArrayBuffer): GameLevelset<CC1Cell> {
  const reader = new BinaryReader(buffer);
  const magicNumber = reader.long();
  const numLevels = reader.short();

  const size: Size = { width: 32, height: 32 };
  const levels: GameLevel<CC1Cell>[] = [];

  for (let i = 0; i < numLevels; i += 1) {
    const header = parseLevelHeader(reader);
    const topLayer = parseLayer(reader);
    const bottomLayer = parseLayer(reader);
    const metaFields = parseLevelFields(reader);

    const cells = buildLevelGrid(topLayer, bottomLayer);
    const grid = createGrid<CC1Cell>(size, (_coords, index) => cells[index]);

    const meta: GameLevelMetadata = {
      title: metaFields.title,
      author: metaFields.author,
      comment: metaFields.hint,
      timeLimitSeconds: header.timeLimit,
      requiredChips: header.requiredChips,
      extra: {
        magicNumber,
        password: metaFields.password,
      },
    };

    levels.push({
      id: `level-${header.number}`,
      name: metaFields.title ?? `Level ${header.number}`,
      size,
      grid,
      meta,
    });
  }

  return {
    id: 'cc1-dat',
    name: 'CC1 DAT Levelset',
    gameId: 'cc1',
    levels,
  };
}

// ---------------------------------------------------------------------------
// Encoding helpers (DAT Writer)
// ---------------------------------------------------------------------------

function compressLayer(codes: Uint8Array): Uint8Array {
  const writer = new BinaryWriter();
  let index = 0;

  while (index < codes.length) {
    const value = codes[index];
    let end = index;
    while (end + 1 < codes.length && codes[end + 1] === value && end + 1 - index < 255) {
      end += 1;
    }
    const length = end + 1 - index;

    if (length <= 3) {
      for (let i = 0; i < length; i += 1) {
        writer.byte(value);
      }
    } else {
      writer.byte(0xff);
      writer.byte(length);
      writer.byte(value);
    }

    index += length;
  }

  return new Uint8Array(writer.toArrayBuffer());
}

function extractLayerCodes(level: GameLevel<CC1Cell>): {
  topCodes: Uint8Array;
  bottomCodes: Uint8Array;
} {
  const { width, height } = level.size;
  const total = width * height;

  const topCodes = new Uint8Array(total);
  const bottomCodes = new Uint8Array(total);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const cell = level.grid.get({ x, y });
      topCodes[index] = (cell.top ?? CC1TileId.FLOOR) as number;
      bottomCodes[index] = (cell.bottom ?? CC1TileId.FLOOR) as number;
    }
  }

  return { topCodes, bottomCodes };
}

function encodeWindows1252(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    bytes[i] = text.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function encodePassword(password: string): Uint8Array {
  const plain = encodeWindows1252(password);
  const out = new Uint8Array(plain.length);
  for (let i = 0; i < plain.length; i += 1) {
    out[i] = plain[i] ^ 0x99;
  }
  return out;
}

function encodeLevelExtraFields(meta: GameLevelMetadata): Uint8Array {
  const writer = new BinaryWriter();

  const title = meta.title;
  const hint = meta.comment;
  const author = meta.author;
  const extra = (meta.extra ?? {}) as Record<string, unknown>;
  const passwordValue = extra.password;
  const password = typeof passwordValue === 'string' ? passwordValue : undefined;

  const writeNullTerminated = (field: number, text: string, encoder: (s: string) => Uint8Array) => {
    const bytes = encoder(text);
    const payload = new Uint8Array(bytes.length + 1);
    payload.set(bytes, 0);
    payload[payload.length - 1] = 0;

    writer.byte(field);
    writer.byte(payload.length);
    writer.bytes(payload);
  };

  if (title) {
    writeNullTerminated(TITLE_FIELD, title, encodeWindows1252);
  }

  if (hint) {
    writeNullTerminated(HINT_FIELD, hint, encodeWindows1252);
  }

  if (author) {
    writeNullTerminated(AUTHOR_FIELD, author, encodeWindows1252);
  }

  if (password) {
    const encodedPwd = encodePassword(password);
    const payload = new Uint8Array(encodedPwd.length + 1);
    payload.set(encodedPwd, 0);
    payload[payload.length - 1] = 0;

    writer.byte(PASSWORD_FIELD);
    writer.byte(payload.length);
    writer.bytes(payload);
  }

  return new Uint8Array(writer.toArrayBuffer());
}

function encodeLevel(level: GameLevel<CC1Cell>, levelNumber: number): Uint8Array {
  const writer = new BinaryWriter();
  const meta = level.meta;

  const timeLimit = meta.timeLimitSeconds ?? 0;
  const requiredChips = meta.requiredChips ?? 0;

  writer.short(levelNumber);
  writer.short(timeLimit);
  writer.short(requiredChips);
  writer.short(1); // mapDetail

  const { topCodes, bottomCodes } = extractLayerCodes(level);
  const topCompressed = compressLayer(topCodes);
  const bottomCompressed = compressLayer(bottomCodes);

  writer.short(topCompressed.length);
  writer.bytes(topCompressed);
  writer.short(bottomCompressed.length);
  writer.bytes(bottomCompressed);

  const extraBytes = encodeLevelExtraFields(meta);
  writer.short(extraBytes.length);
  writer.bytes(extraBytes);

  return new Uint8Array(writer.toArrayBuffer());
}

// ---------------------------------------------------------------------------
// encodeDat: GameLevelset<CC1Cell> -> ArrayBuffer
// ---------------------------------------------------------------------------

export function encodeDat(levelset: GameLevelset<CC1Cell>): ArrayBuffer {
  const writer = new BinaryWriter();
  const magicNumber = 0x0002aaac;

  writer.long(magicNumber);
  writer.short(levelset.levels.length);

  let levelNumber = 1;
  for (const level of levelset.levels) {
    const levelBytes = encodeLevel(level, levelNumber);
    writer.short(levelBytes.length);
    writer.bytes(levelBytes);
    levelNumber += 1;
  }

  return writer.toArrayBuffer();
}
