/* ============================================================================
 * detect-pins.mjs — 场景图编号自动检测（半自动标注用）
 * ----------------------------------------------------------------------------
 * 用法：  node tools/detect-pins.mjs <场景图路径> [输出目录]
 * 示例：  node tools/detect-pins.mjs images/dd_sw_5_BIG.jpg
 *
 * 做什么：在图里找"白色圆形编号徽章"（浅色圆 + 深色数字），输出
 *   - candidates.json   候选坐标（自动检测，供人工核对）
 *   - detect_debug.png  全图 + 候选框（看漏检/误检）
 *   - detect_montage.png 候选点放大拼图（人工读编号）
 * 之后把“编号 → 坐标”填进 prototype/levels/<关卡>.js 的 pins，即可在原型里点击。
 *
 * 说明：阈值按《你有一个新任务》官方画风调过。若换画风：先看 debug 图，
 *       再调 isWhite 阈值与尺寸过滤（下方常量）。
 * 依赖：jpeg-js（项目根目录 npm install）
 * ==========================================================================*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

let jpeg;
try { jpeg = (await import('jpeg-js')).default; }
catch { console.error('缺少依赖 jpeg-js：请在项目根目录执行  npm install  '); process.exit(1); }

const IMG = process.argv[2];
if (!IMG) { console.error('用法：node tools/detect-pins.mjs <场景图路径> [输出目录]'); process.exit(1); }
const OUT = path.resolve(process.argv[3] || path.join(process.cwd(), 'detect-out'));
fs.mkdirSync(OUT, { recursive: true });

/* ---------- 参数（按画风调整） ---------- */
const WHITE_MIN = 198;   // 白色阈值：低于它算"背景/杂色"
const MIN_SIZE = 8, MAX_SIZE = 60;   // 候选框边长范围
const MIN_AREA = 36;     // 最小白色面积
const FILL_MIN = 0.15, FILL_MAX = 0.95;

const raw = jpeg.decode(fs.readFileSync(IMG), { useTArray: true });
const W = raw.width, H = raw.height, data = raw.data;

const isWhite = (x, y) => { const i = (y * W + x) * 4; return data[i] > WHITE_MIN && data[i + 1] > WHITE_MIN && data[i + 2] > WHITE_MIN; };

/* ---------- 连通域 ---------- */
const label = new Int32Array(W * H).fill(-1);
const comps = [];
const stack = [];
for (let y0 = 0; y0 < H; y0++) for (let x0 = 0; x0 < W; x0++) {
  const p0 = y0 * W + x0;
  if (label[p0] !== -1 || !isWhite(x0, y0)) continue;
  const id = comps.length;
  let minX = x0, maxX = x0, minY = y0, maxY = y0, area = 0, sx = 0, sy = 0;
  stack.length = 0; stack.push(p0); label[p0] = id;
  while (stack.length) {
    const p = stack.pop(); const px = p % W, py = (p / W) | 0;
    area++; sx += px; sy += py;
    if (px < minX) minX = px; if (px > maxX) maxX = px;
    if (py < minY) minY = py; if (py > maxY) maxY = py;
    if (px + 1 < W) { const q = p + 1; if (label[q] === -1 && isWhite(px + 1, py)) { label[q] = id; stack.push(q); } }
    if (px - 1 >= 0) { const q = p - 1; if (label[q] === -1 && isWhite(px - 1, py)) { label[q] = id; stack.push(q); } }
    if (py + 1 < H) { const q = p + W; if (label[q] === -1 && isWhite(px, py + 1)) { label[q] = id; stack.push(q); } }
    if (py - 1 >= 0) { const q = p - W; if (label[q] === -1 && isWhite(px, py - 1)) { label[q] = id; stack.push(q); } }
  }
  comps.push({ id, minX, maxX, minY, maxY, area, cx: sx / area, cy: sy / area });
}

const cands = comps.filter(c => {
  const w = c.maxX - c.minX + 1, h = c.maxY - c.minY + 1;
  if (w < MIN_SIZE || w > MAX_SIZE || h < MIN_SIZE || h > MAX_SIZE) return false;
  if (c.area < MIN_AREA) return false;
  const ratio = w / h; if (ratio < 0.5 || ratio > 2.1) return false;
  const fill = c.area / (w * h); if (fill < FILL_MIN || fill > FILL_MAX) return false;
  return true;
}).sort((a, b) => a.cy - b.cy || a.cx - b.cx);

/* ---------- PNG 编码 ---------- */
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (type, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length, 0); const t = Buffer.from(type, 'ascii'); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, d])), 0); return Buffer.concat([len, t, d, crc]); };
function encodePNG(pixels, w, h) {
  const stride = w * 4 + 1; const rawB = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) { rawB[y * stride] = 0; Buffer.from(pixels.buffer, pixels.byteOffset + y * w * 4, w * 4).copy(rawB, y * stride + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(rawB)), chunk('IEND', Buffer.alloc(0))]);
}
const setPx = (px, w, h, x, y, col) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const i = (y * w + x) * 4; px[i] = col[0]; px[i + 1] = col[1]; px[i + 2] = col[2]; px[i + 3] = 255; };
const rect = (px, w, h, x, y, ww, hh, col) => { for (let j = 0; j < hh; j++) for (let i = 0; i < ww; i++) setPx(px, w, h, x + i, y + j, col); };
const FONT35 = { '0': ['111','101','101','101','111'], '1': ['010','110','010','010','111'], '2': ['111','001','111','100','111'], '3': ['111','001','111','001','111'], '4': ['101','101','111','001','001'], '5': ['111','100','111','001','111'], '6': ['111','100','111','101','111'], '7': ['111','001','001','001','001'], '8': ['111','101','111','101','111'], '9': ['111','101','111','001','111'] };
function drawDigit(px, w, h, x, y, ch, s, col) { const g = FONT35[ch]; if (!g) return; for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r][c] === '1') rect(px, w, h, x + c * s, y + r * s, s, s, col); }
function drawIndex(px, w, h, x, y, n, s, col, bg) { const str = String(n); const tw = str.length * (3 * s + s); if (bg) rect(px, w, h, x - 2, y - 2, tw + 4, 5 * s + 4, bg); for (let i = 0; i < str.length; i++) drawDigit(px, w, h, x + i * 4 * s, y, str[i], s, col); }

/* ---------- 调试图：绿框 + 十字 + 序号 ---------- */
{
  const px = new Uint8Array(data);
  cands.forEach((c, i) => {
    const x0 = c.minX, y0 = c.minY, x1 = c.maxX, y1 = c.maxY;
    for (let x = x0; x <= x1; x++) { setPx(px, W, H, x, y0, [0, 170, 0]); setPx(px, W, H, x, y1, [0, 170, 0]); }
    for (let y = y0; y <= y1; y++) { setPx(px, W, H, x0, y, [0, 170, 0]); setPx(px, W, H, x1, y, [0, 170, 0]); }
    const cxi = Math.round(c.cx), cyi = Math.round(c.cy);
    for (let k = -8; k <= 8; k++) { setPx(px, W, H, cxi + k, cyi, [255, 0, 0]); setPx(px, W, H, cxi, cyi + k, [255, 0, 0]); }
    drawIndex(px, W, H, Math.max(0, x0 - 2), Math.max(0, y0 - 30), i, 3, [0, 0, 0], [255, 255, 0]);
  });
  fs.writeFileSync(path.join(OUT, 'detect_debug.png'), encodePNG(px, W, H));
}

/* ---------- 放大拼图：读编号用 ---------- */
{
  const S = 4, CROP = 84, CELL = CROP * S, COLS = 6;
  const rows = Math.max(1, Math.ceil(cands.length / COLS));
  const MW = COLS * CELL, MH = rows * CELL;
  const mp = new Uint8Array(MW * MH * 4).fill(255);
  cands.forEach((c, i) => {
    const col = i % COLS, row = (i / COLS) | 0;
    const ox = col * CELL, oy = row * CELL;
    const sx = Math.round(c.cx - CROP / 2), sy = Math.round(c.cy - CROP / 2);
    for (let j = 0; j < CROP; j++) for (let k = 0; k < CROP; k++) {
      const srcX = Math.max(0, Math.min(W - 1, sx + k)), srcY = Math.max(0, Math.min(H - 1, sy + j));
      const si = (srcY * W + srcX) * 4;
      for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) {
        const dx = ox + k * S + a, dy = oy + j * S + b, di = (dy * MW + dx) * 4;
        mp[di] = data[si]; mp[di + 1] = data[si + 1]; mp[di + 2] = data[si + 2]; mp[di + 3] = 255;
      }
    }
    const cxi = ox + Math.round((c.cx - sx) * S), cyi = oy + Math.round((c.cy - sy) * S);
    for (let k = -10; k <= 10; k++) { setPx(mp, MW, MH, cxi + k, cyi, [255, 0, 0]); setPx(mp, MW, MH, cxi, cyi + k, [255, 0, 0]); }
    for (let k = 0; k < CELL; k++) { setPx(mp, MW, MH, ox + k, oy, [80, 80, 80]); setPx(mp, MW, MH, ox + k, oy + CELL - 1, [80, 80, 80]); setPx(mp, MW, MH, ox, oy + k, [80, 80, 80]); setPx(mp, MW, MH, ox + CELL - 1, oy + k, [80, 80, 80]); }
    drawIndex(mp, MW, MH, ox + 6, oy + 6, i, 4, [255, 255, 0], [0, 0, 0]);
  });
  fs.writeFileSync(path.join(OUT, 'detect_montage.png'), encodePNG(mp, MW, MH));
}

fs.writeFileSync(path.join(OUT, 'candidates.json'),
  JSON.stringify(cands.map((c, i) => ({ i, x: Math.round(c.cx), y: Math.round(c.cy), w: c.maxX - c.minX + 1, h: c.maxY - c.minY + 1, area: c.area })), null, 2));

console.log('场景图：' + IMG + '（' + W + '×' + H + '）');
console.log('候选点：' + cands.length + ' 个');
cands.forEach((c, i) => console.log('  #' + i + '  (' + Math.round(c.cx) + ', ' + Math.round(c.cy) + ')  ' + (c.maxX - c.minX + 1) + '×' + (c.maxY - c.minY + 1)));
console.log('输出目录：' + OUT);
console.log('  - detect_debug.png  （看漏检/误检）');
console.log('  - detect_montage.png（放大读编号）');
console.log('  - candidates.json   （候选坐标）');
