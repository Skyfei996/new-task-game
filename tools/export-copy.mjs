// tools/export-copy.mjs —— 把某关的"玩家可见文案"从数据文件导出成一份便于阅读的 Markdown 稿
// 用途：审文案用（只读快照；改动请改源头 prototype/levels/<关卡>.js）
// 用法：node tools/export-copy.mjs [关卡id=station] [输出=docs/<关卡>-copy-v1.md]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const LEVEL_ID = process.argv[2] || 'station';
const OUT = path.join(ROOT, process.argv[3] || `docs/${LEVEL_ID === 'station' ? 'station-copy-v1' : LEVEL_ID + '-copy-v1'}.md`);
const LEVEL_FILE = path.join(ROOT, 'prototype/levels', LEVEL_ID + '.js');

globalThis.LEVELS = {};
await import(pathToFileURL(LEVEL_FILE).href);
const L = globalThis.LEVELS[LEVEL_ID];
if (!L) { console.error('✗ 没找到关卡 ' + LEVEL_ID + '（' + LEVEL_FILE + '）'); process.exit(1); }

const RES_NAME = Object.fromEntries((L.resources || []).map(r => [r.id, (r.icon ? r.icon + ' ' : '') + r.name]));
const COND_LABEL = { item: '需要', noItem: '不可有', knows: '需要线索', noKnows: '不可知线索', anyItem: '任意一件', notPinsAll: '未点亮', pinsAll: '已点亮', all: '全部满足', any: '任一满足' };
const list = (v) => Array.isArray(v) ? v.join('、') : (v && typeof v === 'object' ? JSON.stringify(v) : String(v));
const fx = (o) => !o ? '' : Object.entries(o).map(([k, v]) => {
  if (k === 'gain') return '获得 ' + list(v);
  if (k === 'lose') return '失去 ' + list(v);
  if (k === 'learn') return '得知线索「' + list(v) + '」';
  if (k === 'thief') return '被偷 ' + list(v);
  if (RES_NAME[k]) return RES_NAME[k] + (v > 0 ? ' +' : ' ') + v;
  return k + ' ' + JSON.stringify(v);
}).join('；');
const cond = (o) => !o ? '' : Object.entries(o).map(([k, v]) => {
  if (Array.isArray(v)) return (COND_LABEL[k] || k) + '：' + v.join('、');
  if (v && typeof v === 'object') return (COND_LABEL[k] || k) + '（' + cond(v) + '）';
  return (RES_NAME[k] || k) + ' ≥ ' + v;
}).join('；');
const choice = (c) => {
  const bits = [];
  if (c.cond) bits.push('条件：' + cond(c.cond) + (c.lock ? '（不满足则灰显）' : ''));
  if (c.fx) bits.push('效果：' + fx(c.fx));
  if (c.battle) bits.push('战斗：武力 ' + c.battle.power + '（胜 → ' + c.battle.winTo + '，负 → ' + c.battle.loseTo + '）');
  if (c.random) bits.push('随机去 ' + c.random.join(' / '));
  if (c.prices) bits.push('花费 ' + JSON.stringify(c.prices));
  if (c.back) bits.push('返回上一处');
  if (c.toIf) bits.push('分支：' + c.toIf.map(x => '[' + cond(x.cond) + '] → ' + x.to).join('；'));
  const tail = c.to && !c.random ? ' → ' + c.to : '';
  return '- 「' + c.l + '」' + (bits.length ? '（' + bits.join('；') + '）' : '') + tail;
};

const out = [];
out.push('# ' + L.meta.title + ' · 文案稿（只读快照）');
out.push('');
out.push('> 本文件由 `tools/export-copy.mjs` 从 `prototype/levels/' + LEVEL_ID + '.js` 自动导出，**不要手改**——改文案请改源头数据文件。');
out.push('> 导出时间：' + new Date().toISOString().slice(0, 16).replace('T', ' ') + '　｜　关卡：' + L.meta.title + '（' + (L.meta.level || '') + '）');
out.push('');
out.push('## 一、关卡信息');
out.push('');
out.push('- 一句话：' + (L.meta.tagline || '—'));
out.push('- 副标题：' + (L.meta.level || '—'));
out.push('- 说明：' + (L.meta.note || '—'));
out.push('- 起点：' + (L.start?.node || '—') + '　｜　安全点：' + (L.meta.safeNode || '—') + '　｜　通关奖励：' + (L.meta.winReward || '—'));
out.push('');
out.push('## 二、资源');
out.push('');
out.push('| 资源 | 普通开局 | 困难开局 | 归零时 |');
out.push('|---|---|---|---|');
for (const r of L.resources || []) out.push('| ' + (r.icon || '') + ' ' + r.name + ' | ' + r.start?.normal + ' | ' + r.start?.hard + ' | ' + (r.fail?.title || '—') + ' |');
out.push('');
out.push('## 三、道具（' + (L.itemOrder || Object.keys(L.items)).length + ' 件）');
out.push('');
out.push('| 道具 | 图标 | 说明 |');
out.push('|---|---|---|');
for (const k of L.itemOrder || Object.keys(L.items)) {
  const it = L.items[k] || {};
  const tag = [it.atk ? '武力 +' + it.atk : '', it.nosell ? '**红框·不可卖**' : '', it.desc || ''].filter(Boolean).join('；');
  out.push('| ' + k + ' | ' + (it.icon || '') + ' | ' + (tag || '—') + ' |');
}
out.push('');
out.push('## 四、乘员（' + (L.charOrder || Object.keys(L.characters)).length + ' 位）');
out.push('');
out.push('| 姓名 | 称号 | 形象 | 小传 |');
out.push('|---|---|---|---|');
for (const k of L.charOrder || Object.keys(L.characters)) {
  const ch = L.characters[k] || {};
  out.push('| ' + ch.name + ' | ' + (ch.title || '') + ' | ' + (ch.emoji || ch.img || '') + ' | ' + (ch.bio || '') + ' |');
}
out.push('');
if (L.help && L.help.length) {
  out.push('## 五、玩法说明（游戏内帮助）');
  out.push('');
  L.help.forEach(h => out.push('- ' + h));
  out.push('');
}
out.push('## 六、任务点正文');
out.push('');
const ids = Object.keys(L.nodes).sort((a, b) => (Number(a) || 999) - (Number(b) || 999) || a.localeCompare(b));
for (const id of ids) {
  const n = L.nodes[id];
  const tags = [n.win ? '🏁 结局' : n.fail ? '💀 失败结算' : '', n.endTag || '', n.chars ? '出场：' + n.chars.map(c => L.characters[c]?.name || c).join('、') : ''].filter(Boolean);
  out.push('### ' + id + '　' + n.n + (tags.length ? '　（' + tags.join('｜') + '）' : ''));
  out.push('');
  if (n.t) out.push(n.t.replace(/\n/g, '  \n'));
  out.push('');
  if (n.en) out.push('- 〔进入时〕' + fx(n.en) + (n.once ? '（只触发一次）' : ''));
  if (n.shop) out.push('- 〔商店〕单价 ' + n.shop.price + '，售 ' + n.shop.stock.join('、'));
  if (n.sell) out.push('- 〔收购〕' + JSON.stringify(n.sell));
  if (n.c && n.c.length) for (const c of n.c) out.push(choice(c));
  out.push('');
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out.join('\n'));
console.log('✓ 已导出文案稿：' + path.relative(ROOT, OUT));
console.log('  任务点 ' + ids.length + ' 个，道具 ' + Object.keys(L.items).length + ' 件，乘员 ' + Object.keys(L.characters).length + ' 位');
