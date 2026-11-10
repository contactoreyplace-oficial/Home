import fs from 'fs';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(len, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crc = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, toCrc, crcBuf]);
}

function generatePng(size, isMaskable = false) {
  const width = size;
  const height = size;

  // Raw uncompressed RGBA pixel data with filter byte (0) per row
  const rawBytesPerRow = width * 4 + 1;
  const rawBuf = Buffer.alloc(rawBytesPerRow * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = size / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawBytesPerRow;
    rawBuf[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep space radial background (#02060c to #0a2032)
      const gradFactor = Math.min(1, dist / maxR);
      let r = Math.floor(10 * (1 - gradFactor * 0.7));
      let g = Math.floor(32 * (1 - gradFactor * 0.7));
      let b = Math.floor(52 * (1 - gradFactor * 0.7));
      let a = 255;

      // Cyan outer ring
      const ringRadius = size * (isMaskable ? 0.34 : 0.38);
      if (Math.abs(dist - ringRadius) < size * 0.015) {
        r = 0;
        g = 240;
        b = 255;
      }

      // Golden crown band / halo
      if (dist < size * 0.28 && dy < -size * 0.08) {
        if (Math.abs(dy - (-size * 0.16)) < size * 0.04 && Math.abs(dx) < size * 0.22) {
          r = 245;
          g = 180;
          b = 40;
        }
      }

      // 'R' central prismatic emblem area
      if (Math.abs(dx) < size * 0.18 && Math.abs(dy - size * 0.04) < size * 0.2) {
        // Vertical stem of R
        if (dx > -size * 0.14 && dx < -size * 0.05 && dy > -size * 0.12 && dy < size * 0.2) {
          r = 56;
          g = 189;
          b = 248; // Sky cyan
        }
        // Top loop of R
        if (dy > -size * 0.12 && dy < size * 0.04 && dx > -size * 0.05 && dx < size * 0.12) {
          r = 168;
          g = 85;
          b = 247; // Purple
        }
        // Diagonal leg of R
        const legProg = (dy - size * 0.02) / (size * 0.18);
        if (legProg > 0 && legProg <= 1 && Math.abs(dx - legProg * (size * 0.12)) < size * 0.04) {
          r = 236;
          g = 72;
          b = 153; // Pink
        }
      }

      rawBuf[pxOffset] = r;
      rawBuf[pxOffset + 1] = g;
      rawBuf[pxOffset + 2] = b;
      rawBuf[pxOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressedData = zlib.deflateSync(rawBuf, { level: 9 });

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrBuf = Buffer.alloc(13);
  ihdrBuf.writeUInt32BE(width, 0);
  ihdrBuf.writeUInt32BE(height, 4);
  ihdrBuf[8] = 8; // 8-bit depth
  ihdrBuf[9] = 6; // Color type: RGBA (6)
  ihdrBuf[10] = 0; // Compression: Deflate
  ihdrBuf[11] = 0; // Filter: Standard
  ihdrBuf[12] = 0; // Interlace: None

  const ihdrChunk = createPngChunk('IHDR', ihdrBuf);
  const idatChunk = createPngChunk('IDAT', compressedData);
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate all standard PWA icons
fs.writeFileSync('public/pwa-192x192.png', generatePng(192, false));
fs.writeFileSync('public/pwa-512x512.png', generatePng(512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', generatePng(512, true));
fs.writeFileSync('public/apple-touch-icon.png', generatePng(180, false));
console.log('Successfully generated all PWA PNG icon assets!');
