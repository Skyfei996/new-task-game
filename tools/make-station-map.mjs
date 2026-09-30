// 《空间站大停摆》场景图生成器（路线 B：程序化扁平几何插画）
// 产出：images/station/station-map-v1.jpg + 19 个编号点的精确坐标（房间中心，无需检测/校准）
// 用法：node tools/make-station-map.mjs [输出路径]
import fs from 'node:fs';
import path from 'node:path';
import jpeg from 'jpeg-js';

const OW = 1520, OH = 1400;
const img = new Uint8Array(OW * OH * 4);

// ---------- 基础绘制 ----------
const px = (x, y, c, a = 1) => {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= OW || y >= OH) return;
  const i = (y * OW + x) * 4;
  img[i] = Math.round(img[i] * (1 - a) + c[0] * a);
  img[i + 1] = Math.round(img[i + 1] * (1 - a) + c[1] * a);
  img[i + 2] = Math.round(img[i + 2] * (1 - a) + c[2] * a);
  img[i + 3] = 255;
};
const rect = (x, y, w, h, c, a = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c, a); };
function poly(pts, c, alpha = 1) {
  const ys = pts.map(p => p[1]);
  const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(OH - 1, Math.ceil(Math.max(...ys)));
  for (let y = y0; y <= y1; y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.ceil(xs[k])); x <= Math.min(OW - 1, Math.floor(xs[k + 1])); x++) px(x, y, c, alpha);
  }
}
const stroke = (pts, c, w = 1, alpha = 1) => {
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let t = 0; t <= L; t++) {
      const x = a[0] + (b[0] - a[0]) * t / L, y = a[1] + (b[1] - a[1]) * t / L;
      for (let dj = -w; dj <= w; dj++) for (let di = -w; di <= w; di++) if (di * di + dj * dj <= w * w) px(x + di, y + dj, c, alpha);
    }
  }
};
const disc = (cx, cy, r, c, a = 1) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) px(cx + x, cy + y, c, a); };
const glow = (cx, cy, r, c, aMax = 0.55) => { for (let r2 = r; r2 > 0; r2--) disc(cx, cy, r2, c, aMax * (1 - r2 / r) ** 1.6); };
const shade = (c, k) => [Math.min(255, c[0] * k), Math.min(255, c[1] * k), Math.min(255, c[2] * k)];
const mix = (c1, c2, t) => [c1[0] + (c2[0] - c1[0]) * t, c1[1] + (c2[1] - c1[1]) * t, c1[2] + (c2[2] - c1[2]) * t];

// ---------- 星空 + 木星 ----------
rect(0, 0, OW, OH, [9, 13, 28]);
for (let i = 0; i < 1300; i++) {
  const x = (i * 977 + 131) % OW, y = (i * 613 + 47) % OH;
  const b = 70 + ((i * 37) % 140);
  px(x, y, [b, b, Math.min(255, b + 45)]);
  if (i % 17 === 0) { px(x + 1, y, [b, b, 255]); px(x, y - 1, [b, b, 255]); }
}
// 木星（左下，被画布裁掉一部分）
const JP = [140, 1470, 470];
disc(JP[0], JP[1], JP[2], [72, 54, 46], 0.95);
for (let k = 0; k < 7; k++) {
  const yOff = -JP[2] + 60 + k * 110;
  const band = mix([132, 96, 70], [204, 160, 124], (k % 3) / 2 / 1.5);
  for (let y = -JP[2]; y <= JP[2]; y++) {
    const dy = y - yOff;
    if (Math.abs(dy) > 26) continue;
    const half = Math.sqrt(Math.max(0, JP[2] * JP[2] - y * y));
    const aa = 0.5 * (1 - Math.abs(dy) / 26);
    for (let x = -half; x <= half; x++) px(JP[0] + x, JP[1] + y, band, aa);
  }
}
disc(JP[0], JP[1], JP[2] + 26, [40, 60, 120], 0.10);

// ---------- 等距 ----------
const S = 76;
const FPW = 6.52, FPD = 3.9;
const proj = (cx, cy) => (x, y, z = 0) => [cx + ((x - FPW / 2) - (y - FPD / 2)) * 0.866 * S, cy + (((x - FPW / 2) + (y - FPD / 2)) * 0.5) * S - z];
// 等距盒子（平顶 + 两面可见侧壁）
function box3(P, x, y, w, d, h, top, cA, cB, z0 = 0) {
  poly([P(x, y, z0 + h), P(x + w, y, z0 + h), P(x + w, y + d, z0 + h), P(x, y + d, z0 + h)], top);
  poly([P(x + w, y, z0), P(x + w, y + d, z0), P(x + w, y + d, z0 + h), P(x + w, y, z0 + h)], cA);
  poly([P(x, y + d, z0), P(x + w, y + d, z0), P(x + w, y + d, z0 + h), P(x, y + d, z0 + h)], cB);
}
function cylinder(P, cx, cy, r, h, top, side, z0 = 0) {
  // 近似圆柱：多边形柱体
  const N = 18, top_pts = [], bot_pts = [];
  for (let i = 0; i < N; i++) {
    const t = i / N * Math.PI * 2;
    const wx = cx + Math.cos(t) * r, wy = cy + Math.sin(t) * r;
    top_pts.push(P(wx, wy, z0 + h)); bot_pts.push(P(wx, wy, z0));
  }
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    const mid = (bot_pts[i][1] + bot_pts[j][1]) / 2;
    if (mid > P(cx, cy, z0)[1] - 6) poly([bot_pts[i], bot_pts[j], top_pts[j], top_pts[i]], side);
  }
  poly(top_pts, top);
  return { top_pts, bot_pts };
}
// 小工具：一摞箱子 / 一排货架
const crates = (P, x, y, arr, pal) => arr.forEach(([dx, dy, w, d, h]) => box3(P, x + dx, y + dy, w, d, h, shade(pal.floor, 0.82), shade(pal.floor, 0.6), shade(pal.floor, 0.5)));

// ---------- 甲板 ----------
function deck(cx, cy, rooms, pal, opts = {}) {
  const P = proj(cx, cy);
  const slabH = 26, wallH = 52;
  // 甲板阴影
  for (const [dx, dy] of [[0, slabH + 10]]) poly([P(-0.2, -0.2, -dy), P(FPW + 0.2, -0.2, -dy), P(FPW + 0.2, FPD + 0.4, -dy), P(-0.2, FPD + 0.4, -dy)], [0, 0, 0], 0.22);
  // 侧面 / 底面
  poly([P(FPW, 0, 0), P(FPW, FPD, 0), P(FPW, FPD, -slabH), P(FPW, 0, -slabH)], shade(pal.side, 1));
  poly([P(0, FPD, 0), P(FPW, FPD, 0), P(FPW, FPD, -slabH), P(0, FPD, -slabH)], shade(pal.side, 0.78));
  // 地面
  poly([P(0, 0), P(FPW, 0), P(FPW, FPD), P(0, FPD)], pal.floor);
  // 环廊（外围一圈） + 十字走廊
  const ringC = shade(pal.floor, 0.9);
  poly([P(0.08, 0.08), P(FPW - 0.08, 0.08), P(FPW - 0.08, FPD - 0.08), P(0.08, FPD - 0.08)], shade(pal.floor, 0.96));
  poly([P(0.08, 0.08), P(FPW - 0.08, 0.08), P(FPW - 0.08, 0.44), P(0.08, 0.44)], ringC);
  poly([P(0.08, FPD - 0.44), P(FPW - 0.08, FPD - 0.44), P(FPW - 0.08, FPD - 0.08), P(0.08, FPD - 0.08)], ringC);
  poly([P(0.08, 0.08), P(0.44, 0.08), P(0.44, FPD - 0.08), P(0.08, FPD - 0.08)], ringC);
  poly([P(FPW - 0.44, 0.08), P(FPW - 0.08, 0.08), P(FPW - 0.08, FPD - 0.08), P(FPW - 0.44, FPD - 0.08)], ringC);
  // 后侧外壳墙
  poly([P(0, 0), P(FPW, 0), P(FPW, 0, wallH), P(0, 0, wallH)], shade(pal.side, 0.62));
  poly([P(0, 0), P(0, FPD), P(0, FPD, wallH), P(0, 0, wallH)], shade(pal.side, 0.5));
  poly([P(0, 0, wallH), P(FPW, 0, wallH), P(FPW, 0, wallH - 5), P(0, 0, wallH - 5)], shade(pal.side, 0.92));
  poly([P(0, 0, wallH), P(0, FPD, wallH), P(0, FPD, wallH - 5), P(0, 0, wallH - 5)], shade(pal.side, 0.92));
  // 舷窗（外壳墙上的小窗）
  for (let wx = 0.7; wx < FPW - 0.5; wx += 0.95) {
    const c = P(wx, 0, wallH * 0.55);
    disc(c[0], c[1], 9, [140, 200, 240], 0.85); disc(c[0], c[1], 5, [220, 245, 255], 0.9);
  }
  for (let wy = 0.7; wy < FPD - 0.5; wy += 0.95) {
    const c = P(0, wy, wallH * 0.55);
    disc(c[0], c[1], 9, [140, 200, 240], 0.8); disc(c[0], c[1], 5, [220, 245, 255], 0.85);
  }
  // 房间（远→近，画家算法）
  const sorted = rooms.slice().sort((a, b) => (a.x + a.y) - (b.x + b.y));
  const centers = {};
  for (const r of sorted) {
    const { x, y, w, d } = r;
    poly([P(x, y), P(x + w, y), P(x + w, y + d), P(x, y + d)], shade(pal.floor, r.tint || 1));
    stroke([P(x, y), P(x + w, y), P(x + w, y + d), P(x, y + d)], shade(pal.side, 0.72), 1, 0.9);
    // 后墙（矮）
    poly([P(x, y), P(x + w, y), P(x + w, y, 14), P(x, y, 14)], shade(pal.side, 0.74));
    poly([P(x, y), P(x, y + d), P(x, y + d, 14), P(x, y, 14)], shade(pal.side, 0.66));
    if (r.draw) { const Pl = (x, y, z = 0) => P(x + r.x, y + r.y, z); r.draw(Pl, pal); }
    // 前墙（矮 + 门口缺口）
    const gapA = x + w * 0.36, gapB = x + w * 0.64;
    poly([P(x, y + d), P(gapA, y + d), P(gapA, y + d, 14), P(x, y + d, 14)], shade(pal.side, 0.95));
    poly([P(gapB, y + d), P(x + w, y + d), P(x + w, y + d, 14), P(gapB, y + d, 14)], shade(pal.side, 0.95));
    poly([P(x + w, y), P(x + w, y + d), P(x + w, y + d, 14), P(x + w, y, 14)], shade(pal.side, 0.7));
    const c = P(x + w / 2, y + d / 2, 0);
    centers[r.n] = [Math.round(c[0]), Math.round(c[1])];
  }
  // 甲板外沿描边
  stroke([P(0, 0), P(FPW, 0), P(FPW, FPD), P(0, FPD)], shade(pal.edge, 1), 2);
  return centers;
}

// ---------- 房间陈设 ----------
const pod = (P, x, y, w = 0.42, d = 0.5, h = 26) => box3(P, x, y, w, d, h, [214, 224, 236], [150, 164, 186], [126, 140, 164]);
const table = (P, x, y, w, d, pal) => { box3(P, x, y, w, d, 12, shade(pal.floor, 1.12), shade(pal.floor, 0.8), shade(pal.floor, 0.68)); };
const chairs = (P, x, y, n, dx, dy, pal) => { for (let i = 0; i < n; i++) box3(P, x + dx * i, y + dy * i, 0.16, 0.16, 8, shade(pal.floor, 0.7), shade(pal.floor, 0.55), shade(pal.floor, 0.48)); };

const ROOMS = {
  1: { draw: (P, pal) => { table(P, 0.15, 0.15, 1.0, 0.4, pal); table(P, 0.15, 0.9, 1.0, 0.4, pal); chairs(P, 0.2, 0.62, 3, 0.3, 0, pal); box3(P, 1.32, 0.2, 0.32, 1.2, 18, [226, 214, 196], [176, 158, 132], [150, 134, 112]); } },   // 食堂
  2: { draw: (P, pal) => { pod(P, 0.18, 0.2); pod(P, 0.72, 0.2); pod(P, 1.26, 0.2); pod(P, 0.18, 0.92); pod(P, 1.26, 0.92); } },                                              // 睡眠舱
  3: { draw: (P, pal) => { box3(P, 0.2, 0.25, 0.9, 0.5, 12, [232, 236, 240], [176, 184, 196], [152, 160, 174]); box3(P, 1.28, 0.9, 0.4, 0.4, 16, [212, 216, 222], [160, 166, 176], [138, 144, 156]); const c = P(0.75, 1.05, 22); rect(c[0] - 9, c[1] - 3, 18, 6, [220, 80, 80]); rect(c[0] - 3, c[1] - 9, 6, 18, [220, 80, 80]); } }, // 医务室（+ 红十字）
  4: { draw: (P, pal) => { box3(P, 0.25, 0.3, 0.8, 0.5, 10, [168, 172, 180], [120, 124, 134], [104, 108, 118]); disc(P(1.3, 0.5, 8)[0], P(1.3, 0.5, 8)[1], 15, [92, 96, 104]); disc(P(1.3, 0.5, 24)[0], P(1.3, 0.5, 24)[1], 12, [132, 136, 144]); box3(P, 0.3, 1.0, 0.9, 0.3, 6, [150, 154, 164], [110, 114, 124], [96, 100, 110]); { const a = P(1.35, 0.95, 46), b = P(1.35, 1.25, 46); stroke([a, b], [120, 124, 134], 3); cylinder(P, 1.35, 1.1, 0.14, 22, [188, 108, 96], [140, 76, 68]); } } }, // 健身房（跑步机 + 沙袋）
  5: { draw: (P, pal) => { const a = P(0.25, 0.3, 6), b = P(1.5, 0.3, 6), c = P(1.5, 1.1, 40), d = P(0.25, 1.1, 40); poly([a, b, c, d], [22, 40, 78], 0.92); const e = P(0.35, 0.42, 12), f = P(1.4, 0.42, 12), g = P(1.4, 1.0, 34), h = P(0.35, 1.0, 34); poly([e, f, g, h], [70, 120, 190], 0.5); box3(P, 0.3, 1.2, 1.1, 0.3, 8, [200, 206, 214], [150, 156, 168], [128, 134, 146]); } }, // 观景厅（大窗）
  6: { draw: (P, pal) => { box3(P, 0.2, 0.2, 1.35, 0.35, 16, [206, 214, 224], [156, 164, 178], [134, 142, 156]); const c = P(0.9, 0.36, 26); rect(c[0] - 26, c[1] - 12, 52, 24, [30, 60, 92]); rect(c[0] - 22, c[1] - 8, 44, 16, [96, 200, 240], 0.85); box3(P, 0.28, 0.85, 0.4, 0.4, 10, [180, 188, 200], [136, 144, 158], [118, 126, 140]); } }, // 指挥舱（大屏）
  7: { draw: (P, pal) => { table(P, 0.18, 0.2, 0.9, 0.4, pal); for (let i = 0; i < 3; i++) { const c = P(0.35 + i * 0.3, 0.34, 20); disc(c[0], c[1], 6, [120, 220, 200]); disc(c[0], c[1], 3, [230, 255, 250]); } box3(P, 1.25, 0.85, 0.42, 0.42, 14, [214, 220, 230], [160, 168, 180], [138, 146, 158]); } }, // 实验室
  8: { draw: (P, pal) => { const c = P(0.85, 0.6, 30); disc(c[0], c[1], 26, [200, 206, 216]); disc(c[0], c[1], 20, [232, 236, 242]); disc(c[0], c[1], 8, [140, 148, 160]); stroke([[c[0] - 34, c[1] + 14], [c[0] + 34, c[1] - 14]], [180, 186, 196], 2); } }, // 通讯舱（天线碟）
  9: { draw: (P, pal) => { box3(P, 0.25, 0.25, 1.0, 0.45, 14, [196, 176, 148], [150, 132, 108], [128, 112, 92]); box3(P, 0.62, 0.85, 0.34, 0.3, 8, [110, 116, 128], [80, 86, 98], [68, 74, 86]); box3(P, 1.3, 0.95, 0.4, 0.35, 18, [120, 128, 142], [86, 92, 104], [72, 78, 90]); { const c = P(0.25, 1.1, 18); disc(c[0], c[1], 11, [110, 176, 118]); disc(c[0] - 6, c[1] - 6, 8, [140, 210, 140]); rect(c[0] - 4, c[1] + 8, 8, 10, [170, 140, 110]); } } }, // 站长室（桌 + 椅 + 盆栽 + 保险柜）
  10: { draw: (P, pal) => { crates(P, 0.18, 0.2, [[0, 0, 0.45, 0.45, 22], [0.5, 0.05, 0.4, 0.4, 16], [0.05, 0.55, 0.42, 0.42, 18], [1.15, 0.3, 0.5, 0.5, 26], [1.25, 0.95, 0.38, 0.38, 14]], pal); } }, // 仓库
  11: { draw: (P, pal) => { const c = P(0.85, 0.6, 20); disc(c[0], c[1], 30, [180, 188, 200]); disc(c[0], c[1], 23, [206, 214, 226]); disc(c[0], c[1], 12, [150, 158, 172]); stroke([[c[0] - 22, c[1]], [c[0] + 22, c[1]]], [150, 158, 172], 2); box3(P, 0.2, 0.25, 0.35, 0.35, 20, [200, 206, 214], [152, 158, 170], [130, 136, 148]); box3(P, 1.35, 0.3, 0.3, 0.3, 18, [200, 206, 214], [152, 158, 170], [130, 136, 148]); } }, // 气闸舱（圆舱门）
  12: { draw: (P, pal) => { const c = P(0.85, 0.6, 0); glow(c[0], c[1] - 14, 74, [90, 230, 220], 0.5); cylinder(P, 0.85, 0.6, 0.42, 46, [170, 250, 244], [90, 200, 196]); cylinder(P, 0.85, 0.6, 0.3, 62, [220, 255, 252], [140, 226, 222]); for (let i = 0; i < 4; i++) { const t = i / 4 * Math.PI * 2; const c2 = P(0.85 + Math.cos(t) * 0.6, 0.6 + Math.sin(t) * 0.6, 26); disc(c2[0], c2[1], 7, [250, 214, 96]); } } }, // 反应堆舱（发光核心）
  13: { draw: (P, pal) => { cylinder(P, 0.6, 0.5, 0.3, 40, [206, 232, 240], [130, 172, 186]); cylinder(P, 1.15, 0.75, 0.22, 32, [206, 232, 240], [130, 172, 186]); for (let i = 0; i < 5; i++) disc(P(0.6 + (i % 3) * 0.25, 0.15 + i * 0.16, 52 + i * 6)[0], P(0.6 + (i % 3) * 0.25, 0.15 + i * 0.16, 52 + i * 6)[1], 12 + i * 2, [220, 240, 250], 0.12); } }, // 冷却塔（白汽）
  14: { draw: (P, pal) => { for (let i = 0; i < 4; i++) { box3(P, 0.2 + i * 0.34, 0.25, 0.26, 0.9, 34, [92, 100, 118], [62, 68, 82], [52, 58, 72]); for (let j = 0; j < 4; j++) { const c = P(0.33 + i * 0.34, 0.4 + j * 0.2, 34 - j * 7); px(c[0], c[1], j % 2 ? [120, 240, 160] : [250, 200, 90]); px(c[0] + 1, c[1], j % 2 ? [120, 240, 160] : [250, 200, 90]); } } } }, // 服务器机房（机柜 + 灯）
  15: { draw: (P, pal) => { const c = P(0.85, 0.5, 30); rect(c[0] - 34, c[1] - 22, 68, 44, [40, 70, 110]); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) rect(c[0] - 28 + i * 16, c[1] - 17 + j * 14, 12, 10, [90, 190, 240], 0.9); disc(c[0] + 40, c[1] - 26, 12, [250, 220, 120]); box3(P, 0.3, 1.0, 0.34, 0.3, 8, [150, 156, 168], [110, 116, 128], [96, 102, 114]); box3(P, 0.8, 1.05, 0.36, 0.28, 10, [140, 146, 158], [102, 108, 120], [90, 96, 108]); } }, // 太阳能控制室
  16: { draw: (P, pal) => { box3(P, 0.2, 0.3, 0.35, 0.35, 22, [190, 198, 210], [140, 148, 160], [120, 128, 140]); box3(P, 1.1, 0.9, 0.5, 0.35, 12, [188, 196, 208], [138, 146, 158], [118, 126, 138]); for (let i = 0; i < 5; i++) rect(P(1.42, 0.35, i * 9)[0], P(1.42, 0.35, i * 9)[1], 10, 4, [210, 216, 226]); { const c = P(0.75, 0.95, 0); box3(P, 0.62, 0.88, 0.26, 0.22, 16, [226, 232, 240], [168, 176, 190], [146, 154, 168]); disc(c[0], c[1] - 22, 8, [214, 224, 236]); disc(c[0] - 3, c[1] - 23, 2.4, [90, 220, 250]); disc(c[0] + 3, c[1] - 23, 2.4, [90, 220, 250]); stroke([[c[0], c[1] - 30], [c[0], c[1] - 40]], [180, 190, 205], 2); disc(c[0], c[1] - 42, 3, [250, 200, 90]); } } }, // 维修区（爬梯 + 糖糖机器人）
  17: { draw: (P, pal) => { const c = P(0.75, 0.6, 0); glow(c[0], c[1] - 6, 40, [250, 230, 140], 0.3); cylinder(P, 0.75, 0.6, 0.34, 40, [246, 226, 160], [190, 164, 96]); const c2 = P(0.75, 0.6, 40); disc(c2[0], c2[1], 12, [160, 220, 250]); box3(P, 1.3, 0.25, 0.4, 0.4, 14, [200, 206, 214], [150, 156, 168], [130, 136, 148]); } } // 应急逃生舱
};

const G = { w: 1.72, d: 1.42, gx: 0.32, gy: 0.30 };
const cell2 = (col, row) => [0.5 + col * (G.w + G.gx), 0.52 + row * (G.d + G.gy)];
const mk = (n, col, row, tint) => { const [x, y] = cell2(col, row); return { n, x, y, w: G.w, d: G.d, tint, draw: ROOMS[n].draw }; };
const D1 = [mk(1, 0, 0, 1.0), mk(2, 1, 0, 0.95), mk(3, 2, 0, 1.0), mk(4, 0, 1, 0.95), mk(5, 2, 1, 1.0)];
const D2 = [mk(6, 0, 0, 1.0), mk(7, 1, 0, 0.95), mk(8, 2, 0, 1.0), mk(9, 0, 1, 0.95), mk(10, 1, 1, 1.0), mk(11, 2, 1, 0.9)];
const D3 = [mk(12, 0, 0, 1.0), mk(13, 1, 0, 0.95), mk(14, 2, 0, 1.0), mk(15, 0, 1, 0.95), mk(16, 1, 1, 1.0), mk(17, 2, 1, 0.9)];

const CX = 760, CY1 = 258, CY2 = 700, CY3 = 1142;
// 中央井（三层之间）
for (const [ya, yb] of [[CY1 + 170, CY2 - 168], [CY2 + 170, CY3 - 168]]) {
  rect(CX - 16, ya, 32, yb - ya, [58, 72, 106]);
  rect(CX - 16, ya, 8, yb - ya, [80, 98, 138]);
  for (let y = ya + 10; y < yb - 4; y += 15) rect(CX - 16, y, 32, 3.2, [104, 126, 170]);
  for (let y = ya + 3; y < yb; y += 40) disc(CX, y, 3, [200, 230, 255], 0.8);
}
const C1 = deck(CX, CY1, D1, { floor: [242, 200, 146], side: [196, 146, 88], edge: [58, 40, 24] });
const C2 = deck(CX, CY2, D2, { floor: [156, 198, 238], side: [92, 134, 186], edge: [28, 44, 68] });
const C3 = deck(CX, CY3, D3, { floor: [136, 220, 206], side: [72, 158, 146], edge: [22, 58, 54] });
const centers = { ...C1, ...C2, ...C3 };

// 太阳能板（中层右侧，两片）
const SP = (x, y, z = 0) => [CX + 400 + (x - y) * 0.866 * S, CY2 - 40 + ((x + y) * 0.5) * S - z];
for (const off of [0, 74]) {
  poly([SP(0, 0 + off), SP(2.6, -0.9 + off), SP(2.6, -0.45 + off), SP(0, 0.45 + off)], [44, 74, 132]);
  poly([SP(0, 0.45 + off), SP(2.6, -0.45 + off), SP(2.6, 0 + off), SP(0, 0.9 + off)], [70, 108, 184]);
  for (let i = 1; i < 6; i++) { const a = SP(i * 0.43, -0.9 + off + i * 0.15), b = SP(i * 0.43, 0.45 + off - i * 0.15); stroke([a, b], [110, 150, 220], 1, 0.5); }
}
// 对接环 + 接驳艇（中层左侧，与甲板左角相接）
const DKR = [352, 706];
const SHIFT = 58;   // 接驳艇贴近对接环
for (let k = 0; k < 3; k++) disc(DKR[0], DKR[1] + 26 - k * 26, 62 - k * 3, k === 0 ? [64, 78, 108] : k === 1 ? [96, 112, 146] : [128, 146, 182]);
disc(DKR[0], DKR[1], 40, [40, 52, 76]);
disc(DKR[0], DKR[1], 30, [26, 36, 56]);
stroke([[DKR[0] - 62, DKR[1] + 26], [DKR[0] + 62, DKR[1] + 26]], [150, 168, 200], 2);
// 接驳艇（机身 + 舷窗 + 尾翼）
poly([[DKR[0] - 250 + SHIFT, DKR[1] - 34], [DKR[0] - 96 + SHIFT, DKR[1] - 12], [DKR[0] - 96 + SHIFT, DKR[1] + 30], [DKR[0] - 250 + SHIFT, DKR[1] + 52]], [196, 204, 218]);
poly([[DKR[0] - 250 + SHIFT, DKR[1] - 34], [DKR[0] - 96 + SHIFT, DKR[1] - 12], [DKR[0] - 96 + SHIFT, DKR[1] - 2], [DKR[0] - 250 + SHIFT, DKR[1] - 22]], [226, 232, 244]);
poly([[DKR[0] - 244 + SHIFT, DKR[1] - 20], [DKR[0] - 214 + SHIFT, DKR[1] - 62], [DKR[0] - 196 + SHIFT, DKR[1] - 60], [DKR[0] - 226 + SHIFT, DKR[1] - 18]], [150, 160, 180]);
disc(DKR[0] - 170 + SHIFT, DKR[1] + 10, 13, [120, 214, 248]);
disc(DKR[0] - 170 + SHIFT, DKR[1] + 10, 7, [220, 245, 255]);
glow(DKR[0] - 96 + SHIFT, DKR[1] + 8, 30, [130, 200, 250], 0.35);

// 小人（扁平风：头 + 身体）
function figure(P, x, y, z, body, face) {
  const c = P(x, y, z);
  poly([[c[0] - 7, c[1]], [c[0] + 7, c[1]], [c[0] + 5, c[1] - 17], [c[0] - 5, c[1] - 17]], body);
  disc(c[0], c[1] - 24, 7, face);
  disc(c[0], c[1] - 24, 3.2, shade(face, 0.75));
}
figure(proj(CX, CY1), 1.1, 0.75, 0, [236, 244, 252], [232, 200, 168]);
figure(proj(CX, CY1), 3.2, 1.9, 0, [120, 150, 220], [232, 200, 168]);
figure(proj(CX, CY1), 5.35, 1.35, 0, [250, 208, 120], [228, 196, 164]);
figure(proj(CX, CY2), 2.9, 0.7, 0, [190, 200, 214], [226, 194, 162]);
figure(proj(CX, CY2), 1.1, 0.8, 0, [240, 236, 220], [230, 198, 166]);
figure(proj(CX, CY3), 1.2, 0.55, 0, [226, 180, 120], [228, 196, 164]);
figure(proj(CX, CY3), 5.6, 1.15, 0, [200, 214, 232], [230, 198, 166]);

// 编号点坐标（房间中心，引擎 pins 直接可用）
const pins = {};
for (const [n, c] of Object.entries(centers)) pins[n] = [Math.round(c[0]), Math.round(c[1])];
// 18 = 中央电梯井（两段井道中点），19 = 太阳能板阵列中心
pins['18'] = [Math.round(CX), Math.round((CY1 + CY2) / 2)];
pins['19'] = [Math.round(SP(1.3, 0.15)[0]), Math.round(SP(1.3, 0.15)[1])];
const out = jpeg.encode({ data: img, width: OW, height: OH }, 90);
const OUT = process.argv[2] || 'C:/Users/gyf96/AppData/Local/Temp/imgproc/station_map_v1.jpg';
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out.data);
fs.writeFileSync(OUT.replace(/\.jpg$/, '-pins.json'), JSON.stringify({ width: OW, height: OH, pins }, null, 2));
console.log('map ->', OUT, OW + '×' + OH, Math.round(out.data.length / 1024) + 'KB');
console.log('pins =', JSON.stringify(pins));
