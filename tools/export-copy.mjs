// tools/export-copy.mjs —— 把某关的"玩家可见文案"从数据文件导出成一份便于阅读的 Markdown 稿
// 用途：审文案用（只读快照；改动请改源头 prototype/levels/<关卡>.js）
// 用法：node tools/export-copy.mjs [关卡id=station] [输出=docs/<关卡>-copy-v1.md]
// 段落：关卡信息 / 序章 / 资源 / 道具 / 道具正文 / 乘员 / 玩法说明 / 任务点正文
//      （选项行带 say 旁白与 lockText 灰显理由；节点带 tIf 正文分叉）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/* 纯导出：关卡数据对象 → 文案稿 markdown（与命令行分离，本体自测可直接调它） */
export function buildCopy(L, levelId) {
  const RES_NAME = Object.fromEntries((L.resources || []).map(r => [r.id, (r.icon ? r.icon + ' ' : '') + r.name]));
  const COND_LABEL = { item: '需要', noItem: '不可有', knows: '需要线索', noKnows: '不可知线索', anyItem: '任意一件', notPinsAll: '未点亮', pinsAll: '已点亮', all: '全部满足', any: '任一满足' };
  const list = (v) => Array.isArray(v) ? v.join('、') : (v && typeof v === 'object' ? JSON.stringify(v) : String(v));
  const fx = (o) => !o ? '' : Object.entries(o).map(([k, v]) => {
    if (k === 'gain') return '获得 ' + list(v);
    if (k === 'lose') return '失去 ' + list(v);
    if (k === 'learn') return '得知线索「' + list(v) + '」';
    if (k === 'thief') return '被偷 ' + list(v);
    if (k === 'once') return '';                 // 「只触发一次」由调用方后缀标注，不把 once true 裸渲出来
    if (RES_NAME[k]) return RES_NAME[k] + (v > 0 ? ' +' : ' ') + v;
    return k + ' ' + JSON.stringify(v);
  }).filter(Boolean).join('；');
  const cond = (o) => !o ? '' : Object.entries(o).map(([k, v]) => {
    if (Array.isArray(v)) return (COND_LABEL[k] || k) + '：' + v.map(x => (x && typeof x === 'object') ? '（' + cond(x) + '）' : String(x)).join('、');
    if (v && typeof v === 'object') return (COND_LABEL[k] || k) + '（' + cond(v) + '）';
    return (RES_NAME[k] || k) + ' ≥ ' + v;
  }).join('；');
  const choice = (c) => {
    const bits = [];
    if (c.cond) bits.push('条件：' + cond(c.cond) + ((c.lock || c.lockIf) ? '（不满足则灰显）' : ''));
    if (c.fx) bits.push('效果：' + fx(c.fx));
    if (c.battle) bits.push('战斗：武力 ' + c.battle.power + '（胜 → ' + c.battle.winTo + '，负 → ' + c.battle.loseTo + '）');
    if (c.random) bits.push('随机去 ' + c.random.join(' / '));
    if (c.prices) bits.push('花费 ' + JSON.stringify(c.prices));
    if (c.back) bits.push('返回上一处');
    if (c.toIf) bits.push('分支：' + c.toIf.map(x => '[' + cond(x.cond) + '] → ' + x.to).join('；'));
    if (c.say) bits.push('旁白：' + c.say);                    // E7（v0.3）：执行时的旁白行
    if (c.lockText) bits.push('灰显理由：' + c.lockText);      // E5（v0.3）：玩家向的锁定理由
    const tail = c.to && !c.random ? ' → ' + c.to : '';
    return '- 「' + c.l + '」' + (bits.length ? '（' + bits.join('；') + '）' : '') + tail;
  };

  const itemKeys = L.itemOrder || Object.keys(L.items || {});
  const textKeys = itemKeys.filter(k => (L.items[k] || {}).text);
  const charKeys = L.charOrder || Object.keys(L.characters || {});
  const out = [];
  out.push('# ' + L.meta.title + ' · 文案稿（只读快照）');
  out.push('');
  out.push('> 本文件由 `tools/export-copy.mjs` 从 `prototype/levels/' + levelId + '.js` 自动导出，**不要手改**——改文案请改源头数据文件。');
  out.push('> 导出时间：' + new Date().toISOString().slice(0, 16).replace('T', ' ') + '　｜　关卡：' + L.meta.title + '（' + (L.meta.level || '') + '）');
  out.push('');
  out.push('## 一、关卡信息');
  out.push('');
  out.push('- 一句话：' + (L.meta.tagline || '—'));
  out.push('- 副标题：' + (L.meta.level || '—'));
  out.push('- 说明：' + (L.meta.note || '—'));
  out.push('- 起点：' + (L.start?.node || '—') + '　｜　安全点：' + (L.meta.safeNode || '—') + '　｜　通关奖励：' + (L.meta.winReward || '—'));
  out.push('');
  /* 二、序章（E2）：新局开场整屏显示一次（可跳过）；读档不重放 */
  out.push('## 二、序章');
  out.push('');
  const pro = L.meta.prologue;
  if (pro && Array.isArray(pro.lines) && pro.lines.length) {
    for (const line of pro.lines) out.push(String(line).replace(/\n/g, '  \n'));
    out.push('');
    out.push('> 新局开场显示一次（可跳过），读档不重放；{me} = 玩家名。' + (pro.image ? '开场图：' + pro.image : ''));
  } else {
    out.push('（本关没有序章）');
  }
  out.push('');
  out.push('## 三、资源');
  out.push('');
  out.push('| 资源 | 普通开局 | 困难开局 | 归零时 |');
  out.push('|---|---|---|---|');
  for (const r of L.resources || []) out.push('| ' + (r.icon || '') + ' ' + r.name + ' | ' + r.start?.normal + ' | ' + r.start?.hard + ' | ' + (r.fail?.title || '—') + ' |');
  out.push('');
  out.push('## 四、道具（' + itemKeys.length + ' 件）');
  out.push('');
  out.push('| 道具 | 图标 | 说明 |');
  out.push('|---|---|---|');
  for (const k of itemKeys) {
    const it = L.items[k] || {};
    const tag = [it.desc || '', it.atk ? '武力 +' + it.atk : '', it.nosell ? '**红框·不可卖**' : '', it.text ? '**可读**（正文见「道具正文」段）' : ''].filter(Boolean).join('；');   // B07：说明列＝介绍在前、属性/规则标记在后
    out.push('| ' + k + ' | ' + (it.icon || '') + ' | ' + (tag || '—') + ' |');
  }
  out.push('');
  /* 五、道具正文（E3）：items[].text，多段用 \n */
  out.push('## 五、道具正文（' + textKeys.length + ' 件）');
  out.push('');
  if (!textKeys.length) out.push('（本关没有可读的道具正文）');
  for (const k of textKeys) {
    const it = L.items[k] || {};
    out.push('### ' + (it.icon ? it.icon + ' ' : '') + k);
    out.push('');
    out.push(String(it.text).replace(/\n/g, '  \n'));
    out.push('');
  }
  out.push('## 六、乘员（' + charKeys.length + ' 位）');
  out.push('');
  out.push('| 姓名 | 称号 | 形象 | 小传 |');
  out.push('|---|---|---|---|');
  for (const k of charKeys) {
    const ch = (L.characters || {})[k] || {};
    out.push('| ' + ch.name + ' | ' + (ch.title || '') + ' | ' + (ch.emoji || ch.img || '') + ' | ' + (ch.bio || '') + ' |');
  }
  out.push('');
  out.push('## 七、玩法说明（游戏内帮助）');
  out.push('');
  if (L.help && L.help.length) L.help.forEach(h => out.push('- ' + h));
  else out.push('（本关没有玩法说明）');
  out.push('');
  out.push('## 八、任务点正文');
  out.push('');
  const ids = Object.keys(L.nodes || {}).sort((a, b) => (Number(a) || 999) - (Number(b) || 999) || a.localeCompare(b));
  for (const id of ids) {
    const n = L.nodes[id];
    const tags = [n.win ? '🏁 结局' : n.fail ? '💀 失败结算' : '', n.endTag || '', n.chars ? '出场：' + n.chars.map(c => (L.characters[c] || {}).name || c).join('、') : ''].filter(Boolean);
    out.push('### ' + id + '　' + n.n + (tags.length ? '　（' + tags.join('｜') + '）' : ''));
    out.push('');
    if (n.t) out.push(n.t.replace(/\n/g, '  \n'));
    out.push('');
    if (n.tIf && n.tIf.length) for (const v of n.tIf) out.push('- 〔分叉·' + cond(v.cond) + '〕' + String(v.t).replace(/\n/g, '  \n'));   // E8：正文分叉
    if (n.en) out.push('- 〔进入时〕' + fx(n.en) + ((n.once || n.en.once) ? '（只触发一次）' : ''));
    if (n.shop) out.push('- 〔商店〕单价 ' + n.shop.price + '，售 ' + n.shop.stock.join('、'));
    if (n.sell) out.push('- 〔收购〕' + JSON.stringify(n.sell));
    if (n.c && n.c.length) for (const c of n.c) out.push(choice(c));
    out.push('');
  }
  /* 九、指路记录（meta.notes——②块「线索与记录」详情稿；B08／B143）：线索（learn 值逐字）＋记录（出现门＋常态/完成稿） */
  const notes = (L.meta && Array.isArray(L.meta.notes)) ? L.meta.notes : [];
  const clueNotes = notes.filter(n => n.kind === 'clue');
  const recNotes = notes.filter(n => n.kind === 'record');
  out.push('## 九、指路记录（' + clueNotes.length + ' 线索 ＋ ' + recNotes.length + ' 记录）');
  out.push('');
  if (!notes.length) out.push('（本关没有指路记录表）');
  else {
    out.push('> 指路面板②块「线索与记录」详情稿（`meta.notes`；口径＝`design-ui-v1.md` §2-B143）：线索＝`learn` 值逐字＋点开详情；记录＝出现门＋常态稿／完成稿（完成稿缺省＝沿用常态稿）。');
    out.push('');
    if (clueNotes.length) {
      out.push('### 线索（' + clueNotes.length + ' 条）');
      out.push('');
      out.push('| 线索（＝learn 值逐字） | 点开详情 | 出处 |');
      out.push('|---|---|---|');
      for (const n of clueNotes) out.push('| ' + n.key + ' | ' + n.text + ' | ' + n.src + ' |');
      out.push('');
    }
    if (recNotes.length) {
      out.push('### 记录（' + recNotes.length + ' 条）');
      out.push('');
      for (const n of recNotes) {
        out.push('- **' + n.title + '**（' + n.id + '）');
        out.push('  - 出现门：`' + cond(n.cond) + '`' + (n.done ? '；完成：`' + cond(n.done) + '`' : '（单态）') + '　｜　出处：' + n.src + (n.doneSrc ? ' → ' + n.doneSrc : ''));
        out.push('  - 常态稿：' + n.text);
        if (n.doneText) out.push('  - 完成稿：' + n.doneText);
      }
      out.push('');
    }
  }
  return out.join('\n');
}

/* 命令行入口：直接用 node 跑本文件时才执行（被 test.play.mjs import 时不执行） */
async function main() {
  const LEVEL_ID = process.argv[2] || 'station';
  const OUT = path.join(ROOT, process.argv[3] || `docs/${LEVEL_ID === 'station' ? 'station-copy-v1' : LEVEL_ID + '-copy-v1'}.md`);
  const LEVEL_FILE = path.join(ROOT, 'prototype/levels', LEVEL_ID + '.js');
  globalThis.LEVELS = {};
  await import(pathToFileURL(LEVEL_FILE).href);
  const L = globalThis.LEVELS[LEVEL_ID];
  if (!L) { console.error('✗ 没找到关卡 ' + LEVEL_ID + '（' + LEVEL_FILE + '）'); process.exit(1); }
  const md = buildCopy(L, LEVEL_ID);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, md);
  const textKeys = (L.itemOrder || Object.keys(L.items)).filter(k => (L.items[k] || {}).text);
  console.log('✓ 已导出文案稿：' + path.relative(ROOT, OUT));
  console.log('  任务点 ' + Object.keys(L.nodes).length + ' 个，道具 ' + Object.keys(L.items).length + ' 件（带正文 ' + textKeys.length + ' 件），乘员 ' + Object.keys(L.characters).length + ' 位');
}

const isMain = (() => {
  try { return !!process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url)); }
  catch (e) { return false; }
})();
if (isMain) await main().catch(err => { console.error('✗ ' + ((err && err.message) || err)); process.exit(1); });
