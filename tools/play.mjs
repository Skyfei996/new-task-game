// tools/play.mjs —— 无头试玩器（CLI）
// 用途：不打开浏览器、在终端里真玩一局（给 AI「游戏体验师」与喜欢命令行的人用）。
// 规则来自同一份 engine.js 的纯核心 Core —— 与网页版完全一致，这里不重写任何规则。
//
// 用法（在项目根目录跑）：
//   node tools/play.mjs new station            开新局（默认普通模式，玩家名「林小晨」）
//   node tools/play.mjs new station --hard --name 小豆
//   node tools/play.mjs choose 3               执行当前可见选项里的第 3 个（1 起）
//   node tools/play.mjs buy 1 | buy 通行证      在商店买东西（序号见屏幕上的「商店」块）
//   node tools/play.mjs sell 毛绒玩具           在废料回收点卖东西（红框道具不能卖）
//   node tools/play.mjs read 桑尼的账本          翻看文本道具的正文（只读；未拥有的会明确报错）
//   node tools/play.mjs state | where | items | log [--tail 5]
//   node tools/play.mjs save my-run.json | load my-run.json
//   node tools/play.mjs auto [--steps 40] [--seed 7]
//   node tools/play.mjs --json state           （JSON 输出，AI 友好；--json 可放子命令前）
//   node tools/play.mjs --player choose 2      （玩家模式，给 AI 体验师：隐藏数值/去向编号/机械理由；
//                                                禁用 --json / load / auto；会话单独存）
//
// 会话状态存在 <当前目录>/.playtest/session.json（玩家模式 = player-session.json；已加入 .gitignore）。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const LEVEL_DIR = path.join(ROOT, 'prototype', 'levels');
const ENGINE_FILE = path.join(ROOT, 'prototype', 'engine.js');
const SESSION_DIR = path.join(process.cwd(), '.playtest');
const SESSION_FILE = path.join(SESSION_DIR, 'session.json');               // 开发会话
const PLAYER_SESSION_FILE = path.join(SESSION_DIR, 'player-session.json');  // --player：体验师独立会话（E10）
const USAGE_HINT = 'node tools/play.mjs help';

class CliError extends Error {}

/* ============================ 参数 ============================ */
function parseArgs(argv) {
  const json = argv.indexOf('--json') >= 0;
  const player = argv.indexOf('--player') >= 0;               // 玩家模式（E10）：与 --json 一样可放任意子命令前
  const rest = argv.filter(a => a !== '--json' && a !== '--player');
  const flags = {}, pos = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) { flags[a.slice(2, eq)] = a.slice(eq + 1); continue; }
      const k = a.slice(2), nxt = rest[i + 1];
      if (nxt !== undefined && !nxt.startsWith('--')) { flags[k] = nxt; i++; } else flags[k] = true;
    } else pos.push(a);
  }
  return { json, player, flags, pos };
}
function intFlag(v, def, min, max, name) {
  if (v === undefined) return def;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new CliError('--' + name + ' 要是 ' + min + '~' + max + ' 的整数（收到 ' + JSON.stringify(v) + '）');
  return n;
}

/* ============================ 关卡 & 引擎 ============================ */
function listLevels() {
  return fs.readdirSync(LEVEL_DIR).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3)).sort();
}
/* 照 prototype/test.core.mjs 的加载方式：关卡数据 + engine.js 一起塞进 vm → globalThis.GameCore */
function loadEngine(levelId) {
  if (!levelId || !/^[A-Za-z0-9_-]+$/.test(levelId)) throw new CliError('关卡 id 不合法：' + JSON.stringify(levelId) + '（可用：' + listLevels().join(' / ') + '）');
  const file = path.join(LEVEL_DIR, levelId + '.js');
  if (!fs.existsSync(file)) throw new CliError('没有这个关卡：' + levelId + '（可用：' + listLevels().join(' / ') + '）');
  const code = fs.readFileSync(file, 'utf8') + '\n' + fs.readFileSync(ENGINE_FILE, 'utf8');
  vm.runInThisContext(code, { filename: 'play-bundle-' + levelId + '.js' });
  const C = globalThis.GameCore;
  if (!C.selectLevel(levelId)) throw new CliError('关卡加载失败：' + levelId);
  return C;
}

/* ============================ 会话 ============================ */
function readSession(file) {
  if (!fs.existsSync(file)) return null;
  let s;
  try { s = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { throw new CliError('会话文件读不出来（' + file + '）：' + e.message + '——可以先开一局：node tools/play.mjs new <关卡id>'); }
  return (s && s.level && s.state && s.state.loc) ? s : null;
}
function writeSession(s, file) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
  s.updatedAt = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify(s, null, 2) + '\n');
}
function requireSession(file) {
  const s = readSession(file);
  if (!s) throw new CliError('还没有进行中的试玩——先开一局：node tools/play.mjs new <关卡id>');
  return s;
}
function newSession(levelId, st) {
  return { v: 1, level: levelId, state: st, log: [], steps: 0, createdAt: new Date().toISOString() };
}

/* ============================ 渲染素材 ============================ */
const pad2 = n => String(n).padStart(2, '0');
function clock(iso) {
  const d = new Date(iso);
  return isNaN(d) ? '--:--:--' : pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
}
function nodeName(C, id) { const n = C.currentLevel().nodes[id]; return n ? n.n : '？'; }
function sceneLabel(C, sid) {
  const sc = C.currentLevel().scenes[sid];
  if (!sc) return sid || '';
  return sc.label || String(sc.name || '').split('·').pop().trim();
}
function itemLabel(C, id) {
  const meta = C.currentLevel().items[id] || {};
  return (meta.icon ? meta.icon + ' ' : '') + id + (meta.nosell ? '（红框·不能卖）' : '');
}
function visitedIds(C, st) {
  /* 与网页版 renderVisited 同一口径：不数隐藏节点，也不数结局/失败结算点 */
  return Object.keys(st.visited).filter(id => {
    const n = C.currentLevel().nodes[id];
    return n && !n.hidden && !n.fail && !n.win;
  });
}
function getNode(C, st) { return C.currentLevel().nodes[st.loc] || {}; }

/* 一个可见选项 → JSON 友好的对象（i/label/to/ok/why 是给 AI 的固定字段） */
function choiceInfo(C, st, e) {
  const ch = (getNode(C, st).c || [])[e.ci] || {};
  let kind = 'move';
  if (ch.battle) kind = 'battle';
  else if (ch.random) kind = 'random';
  else if (e.back) kind = 'back';
  else if (e.price != null) kind = 'price';
  let to = [];
  if (e.back) {
    const prev = st.hist[st.hist.length - 1];
    if (prev) to = [prev];
  } else if (ch.battle) to = [ch.battle.winTo, ch.battle.loseTo];
  else if (ch.random) to = ch.random.slice();
  else if (ch.toIf) to = [...new Set(ch.toIf.map(x => x.to).concat(ch.to ? [ch.to] : []))];
  else if (ch.to) to = [ch.to];
  return {
    i: e.i,
    label: C.fillName(e.label, st),
    to,
    ok: e.ok,
    why: e.why || '',
    kind,
    price: e.price == null ? null : e.price,
    battle: ch.battle ? { need: C.battleNeed(st, ch.battle), mine: C.atkOf(st), winTo: ch.battle.winTo, loseTo: ch.battle.loseTo } : null
  };
}

/* 选项的去向：给人看的一小段（如「→ 18 中央大厅（顶层）」） */
function destText(C, st, c) {
  const one = id => id + ' ' + nodeName(C, id);
  const unit = (C.resDef(C.mainResId()) || {}).unit || '';
  if (c.kind === 'price') return '　（付 ' + c.price + ' ' + unit + '）' + (c.to.length ? ' → ' + c.to.map(one).join(' / ') : '');
  if (c.kind === 'back') return '　→ ↩ ' + (c.to.length ? '返回 ' + one(c.to[0]) : '返回上一处');
  if (c.kind === 'battle') return '　→ 胜 ' + one(c.to[0]) + ' ｜ 负 ' + one(c.to[1]) + '（你的武力 ' + c.battle.mine + '，需要 ' + c.battle.need + '）';
  if (c.kind === 'random') return '　→ ' + c.to.map(one).join(' 或 ') + '（50/50）';
  if (c.to.length) return '　→ ' + c.to.map(one).join(' / ');
  return '';
}

/* 选项在执行记录里的名字（价格类带上价，回头看得懂付了多少） */
function choiceLogLabel(c) { return c.label + (c.kind === 'price' ? '（付 ' + c.price + ' 枚）' : ''); }

/* 商店 / 废料回收：给人看的块（数据来自 Core.shopInfo / Core.sellInfo，与网页版的块同源） */
function shopLines(C, st) {
  const shop = C.shopInfo(st);
  if (!shop) return [];
  /* 花光警语跟资源自己的失败规则走（E1：fail:null 的资源花光不判失败） */
  const L = ['商店（' + (C.resNoFail(C.resDef(shop.resId) || {}) ? '花光不判失败' : '买完必须留 1 ' + (shop.unit || '') + '，花光会闯关失败') + '）：'];
  shop.stock.forEach((s, k) => L.push('  ' + (k + 1) + ') ' + (s.icon ? s.icon + ' ' : '') + s.id + '　' + shop.price + ' ' + shop.unit
    + (s.ok ? '　→ 可买：buy ' + (k + 1) + '（或 buy ' + s.id + '）' : '　（灰：' + (s.why || '买不了') + '）')));
  return L;
}
function sellLines(C, st) {
  const sell = C.sellInfo(st);
  if (!sell) return [];
  if (!sell.length) return ['废料回收（红框道具不能卖）：（没有可卖的东西）'];
  return ['废料回收（一件 +1 ' + ((C.resDef(C.mainResId()) || {}).unit || '') + '）：'
    + sell.map(s => (s.icon ? s.icon + ' ' : '') + s.id).join('、')
    + '　→ 卖：sell <道具名>'];
}

/* 每个子命令都会打印的「一屏」；player = 玩家模式（E10：隐藏数值/去向编号/机械理由） */
function renderScreen(C, sess, player) {
  const st = sess.state, node = getNode(C, st), D = C.currentLevel();
  const L = [];
  L.push('══ 当前位置 ══');
  L.push(st.loc + ' · ' + C.fillName(node.n || '？', st) + '　【' + sceneLabel(C, C.sceneOf(st)) + '】'
    + (node.endTag ? '　🏁 ' + node.endTag : '') + (node.fail ? '　💀 失败结算' : ''));
  L.push('──────');
  L.push(C.fillName(C.nodeText(st, node) || '', st));    // E8：正文分叉（首个满足的 tIf；都不满足用 node.t）
  L.push('');
  if (node.win) {
    L.push('🏁 ' + (node.endTag || '闯关成功！'));
    if (D.meta.winReward) L.push('🎁 通关奖励：' + D.meta.winReward);
    L.push('（重开一局：node tools/play.mjs ' + (player ? '--player ' : '') + 'new ' + sess.level + '）');
  } else if (node.fail || st.bankrupt) {
    const info = st.bankrupt ? C.failInfo(st.zeroRes) : null;
    L.push('💀 ' + ((info && info.title) || node.endTag || '闯关失败'));
    L.push('（重开一局：node tools/play.mjs ' + (player ? '--player ' : '') + 'new ' + sess.level + '）');
  } else {
    const entries = C.visibleChoices(st);
    const list = entries.map(e => choiceInfo(C, st, e));
    if (player) playerShopLines(C, st).forEach(x => L.push(x));
    else {
      shopLines(C, st).forEach(x => L.push(x));      // 商店块（网页版同位置的纯文字版）
      sellLines(C, st).forEach(x => L.push(x));      // 废料回收块
    }
    L.push('选项：');
    if (!list.length) L.push('  （现在没有可执行的选项）');
    list.forEach((c, k) => L.push(player ? playerChoiceLine(C, st, node, c, entries[k]) : devChoiceLine(C, st, c)));
  }
  L.push('');
  L.push(player ? playerStateText(C, st) : stateText(C, sess));
  return L.join('\n');
}

/* 开发版选项行：带去向编号 + 机械理由（lab 与开发版 CLI 保留该标签；玩家模式不用） */
function devChoiceLine(C, st, c) {
  return '  ' + c.i + ') ' + (c.ok ? '' : '🔒 ') + c.label + destText(C, st, c)
    + (c.ok ? '' : '　（灰：' + (c.why || '条件不足') + '）');
}

/* ============ 玩家模式（E10，给 AI 体验师）============
 * 隐藏：资源数字（改定性档位）、武力面板、步数、计数、去向编号、机械理由；显示 lockText。
 * 例外：战斗选项保留与真实玩家一模一样的「你的武力值 X ≥/< Y」对照（白名单③，§8.3）。
 * 规范：docs/design-station-v1.md §7-E10、§8.3；简报见 docs/playtest-guide.md §二。 */
const PLAYER_TIER = {
  /* 氧气：§8.3 的 ≥50% / 20~50% / <20% 三档（基准 = 普通开局 100，即绝对值 50 / 20） */
  oxygen: v => (v >= 50 ? '还好' : v >= 20 ? '有点闷' : '快喘不上气'),
  /* 星币：§8.3 直接给的绝对值档位（≥5 / 1~4 / 0） */
  coins: v => (v >= 5 ? '能买点东西' : v >= 1 ? '不多了' : '花光了')
};
/* 定性档位：没有档位定义的资源只报名字，不报数字 */
function playerResText(C, st, r) {
  const name = (r.icon ? r.icon + ' ' : '') + (r.name || r.id);
  const tier = PLAYER_TIER[r.id] ? PLAYER_TIER[r.id](C.resOf(st, r.id)) : null;
  return tier ? name + ' ' + tier : name;
}
function playerChoiceLine(C, st, node, c, e) {
  const ch = (node.c || [])[e.ci] || {};               // 原始选项：拿 battle / lockText 用
  let tail = '';
  if (ch.battle) {                                   // 例外：与网页版同一句对照（白名单③）
    const mine = C.atkOf(st), need = C.battleNeed(st, ch.battle);
    tail = '　你的武力值 ' + mine + (mine >= need ? ' ≥ ' : ' < ') + need;
  } else if (c.price != null) {
    tail = '　（付 ' + c.price + ' ' + ((C.resDef(C.mainResId()) || {}).unit || '枚') + '）';
  }
  if (!c.ok) tail += '　（灰：' + C.lockHint(ch) + '）';   // E5：lockText 优先，兜底同样不含数字
  return '  ' + c.i + ') ' + (c.ok ? '' : '🔒 ') + c.label + tail;
}
/* 玩家版商店/回收：只带货架与明码价格（白名单①），不带「买完留几 / 怎么买」这些机械指点 */
function playerShopLines(C, st) {
  const L = [];
  const shop = C.shopInfo(st);
  if (shop) L.push('🛒 商店：' + shop.stock.map(s =>
    (s.icon ? s.icon + ' ' : '') + s.id + ' ' + shop.price + ' ' + shop.unit + (s.owned ? '（已拥有）' : '')).join('、'));
  const sell = C.sellInfo(st);
  if (sell) L.push(sell.length
    ? '♻ 废料回收：' + sell.map(s => (s.icon ? s.icon + ' ' : '') + s.id).join('、')
    : '♻ 废料回收：（没有可卖的东西）');
  return L;
}
/* 玩家版状态（E10）：资源只给定性档位；不报武力/步数/计数 */
function playerStateText(C, st) {
  const D = C.currentLevel();
  const res = C.resources().map(r => playerResText(C, st, r)).join('　');
  const items = st.items.length
    ? st.items.map(id => ((D.items[id] || {}).icon ? (D.items[id] || {}).icon + ' ' : '') + id).join('、')
    : '（空）';
  const clues = Object.keys(st.learned).length ? Object.keys(st.learned).join('、') : '（还没有）';
  return '状态：' + res + ' ｜ 物品：' + items + ' ｜ 线索：' + clues
    + '\n难度 ' + (st.diff === 'hard' ? '困难' : '普通') + ' ｜ 玩家 ' + st.me;
}

function stateText(C, sess) {
  const st = sess.state;
  const res = C.resources().map(r => (r.icon ? r.icon + ' ' : '') + C.resOf(st, r.id)).join('　');
  const items = st.items.length ? st.items.map(id => itemLabel(C, id)).join('、') : '（空）';
  const clues = Object.keys(st.learned).length ? Object.keys(st.learned).join('、') : '（还没有）';
  return '状态：' + res + '　⚔ 武力 ' + C.atkOf(st)
    + ' ｜ 物品（' + st.items.length + '）：' + items
    + ' ｜ 线索：' + clues
    + '\n进度：第 ' + sess.steps + ' 步 ｜ 已探索 ' + visitedIds(C, st).length + ' 处 ｜ 难度 '
    + (st.diff === 'hard' ? '困难' : '普通') + ' ｜ 玩家 ' + st.me;
}

function detailText(C, sess) {
  const st = sess.state;
  const L = ['── 详细状态 ──'];
  L.push('位置：' + st.loc + ' · ' + C.fillName(getNode(C, st).n || '？', st) + '　（场景：' + sceneLabel(C, C.sceneOf(st)) + ' / ' + C.sceneOf(st) + '）');
  L.push('资源：' + C.resources().map(r => (r.icon || '') + ' ' + (r.name || r.id) + ' ' + C.resOf(st, r.id)).join('　'));
  L.push('物品（' + st.items.length + ' 件）：' + (st.items.length ? st.items.map(id => itemLabel(C, id)).join('、') : '（空）'));
  L.push('线索（' + Object.keys(st.learned).length + ' 条）：' + (Object.keys(st.learned).length ? Object.keys(st.learned).join('、') : '（还没有）'));
  L.push('武力：⚔ ' + C.atkOf(st));
  L.push('步数：' + sess.steps + '　已探索（' + visitedIds(C, st).length + ' 处）：' + visitedIds(C, st).join(', '));
  L.push('提示：物品里标「红框」的是关键道具（不可卖、不可丢）；灰显选项 = 条件不足，按提示去别处找。');
  return L.join('\n');
}

/* 玩家版 state 的「详细」：位置/物品（可读的标 📖）/线索；数值一律不出 */
function playerDetailText(C, sess) {
  const st = sess.state, D = C.currentLevel();
  const L = ['── 详细状态 ──'];
  L.push('位置：' + st.loc + ' · ' + C.fillName(getNode(C, st).n || '？', st) + '（' + sceneLabel(C, C.sceneOf(st)) + '）');
  L.push('物品：' + (st.items.length
    ? st.items.map(id => ((D.items[id] || {}).icon ? (D.items[id] || {}).icon + ' ' : '') + id + (C.itemText(id) ? ' 📖' : '')).join('、')
    : '（空）'));
  L.push('线索：' + (Object.keys(st.learned).length ? Object.keys(st.learned).join('、') : '（还没有）'));
  L.push('提示：灰显选项 = 现在做不到，理由写在旁边；标 📖 的东西可以用 read 翻看。');
  return L.join('\n');
}

/* ============================ 执行一个选项（规则全部走 Core）============================ */
function executeChoice(C, st, e) {
  const ch = (getNode(C, st).c || [])[e.ci] || {};
  const ev = [];
  let say = null;                                 // E7：选项旁白（执行时单独打印；不改状态、与效果日志并列）
  if (e.price != null) {                          // 价格类选项（如大里姆的腕带）：每个价格一个按钮
    const why = C.payReason(st, e.price);
    if (why) return { ev, error: why };
    ev.push(...C.buySticker(st, e.price));
    if (ch.say) say = C.fillName(ch.say, st);
    const hit = (ch.toIf || []).find(x => C.condOk(st, x.cond));
    ev.push(...C.go(st, hit ? hit.to : ch.to));
  } else {
    const res = C.choose(st, e.ci);
    ev.push(...(res.log || []));
    say = res.say || null;
    if (res.back) ev.push(...C.goBack(st));
    else if (res.to) ev.push(...C.go(st, res.to));
  }
  const flash = C.takeFlash(st);
  if (flash) {
    const r = C.resDef(flash.res) || {};
    if (flash.kind === 'theft') ev.push('🥷 ' + flash.thief + '偷走了你 ' + flash.amount + ' ' + (r.unit || '') + (r.name || '') + '！');
    else if (flash.kind === 'blocked') ev.push('🪢 ' + flash.guard + '挡住了' + flash.thief);
  }
  return { ev, say };
}

/* 一局里发生过的事：记进会话流水 */
function logEntry(sess, cmd, from, label, notes) {
  const e = { n: sess.log.length + 1, at: new Date().toISOString(), cmd, from, to: sess.state.loc, label, notes: notes || [] };
  sess.log.push(e);
  return e;
}

/* ============================ JSON 载荷 ============================ */
function buildPayload(C, sess, extra) {
  const st = sess.state, node = getNode(C, st), D = C.currentLevel();
  const choices = C.visibleChoices(st).map(e => choiceInfo(C, st, e));
  const ended = node.win ? 'win' : (node.fail ? 'fail' : null);
  return Object.assign({
    ok: true,
    cmd: extra.cmd,
    level: sess.level,
    levelTitle: (D.meta && D.meta.title) || sess.level,
    node: st.loc,
    name: C.fillName(node.n || '', st),
    scene: C.sceneOf(st),
    sceneName: sceneLabel(C, C.sceneOf(st)),
    text: C.fillName(node.t || '', st),
    choices,
    shop: C.shopInfo(st),          // 没有商店 = null；字段与 renderNode 商店块同源
    sell: C.sellInfo(st),          // 没有回收点 = null；没有可卖的东西 = []
    state: {
      loc: st.loc,
      steps: sess.steps,
      diff: st.diff,
      me: st.me,
      resources: Object.fromEntries(C.resources().map(r => [r.id, C.resOf(st, r.id)])),
      items: st.items.map(id => ({
        id,
        icon: (D.items[id] || {}).icon || '',
        nosell: !!(D.items[id] || {}).nosell
      })),
      clues: Object.keys(st.learned),
      atk: C.atkOf(st),
      bankrupt: !!st.bankrupt,
      zeroRes: st.zeroRes || null,
      visited: visitedIds(C, st).length,
      deadEnd: C.deadEnd(st),
      ended,
      endTag: node.endTag || null,
      winReward: node.win ? (D.meta.winReward || null) : null
    }
  }, extra.fields || {});
}

/* ============================ 子命令 ============================ */
function cmdNew(ctx) {
  const { flags, pos, say, player, sessFile } = ctx;
  const levelId = pos[1];
  if (!levelId) throw new CliError('用法：node tools/play.mjs new <关卡id> [--hard] [--name 名字]（可用：' + listLevels().join(' / ') + '）');
  const C = loadEngine(levelId);
  const D = C.currentLevel();
  const st = C.newState(flags.hard === true ? 'hard' : 'normal', typeof flags.name === 'string' ? flags.name : undefined);
  const ev = C.go(st, D.start.node);
  const sess = newSession(levelId, st);
  logEntry(sess, 'new', null, '开局 · ' + ((D.meta && D.meta.title) || levelId) + '（' + (st.diff === 'hard' ? '困难' : '普通') + '）· 玩家 ' + st.me, ev);
  writeSession(sess, sessFile);
  say('🎬 开局：' + ((D.meta && D.meta.title) || levelId) + '（' + levelId + '）· ' + (st.diff === 'hard' ? '困难' : '普通') + '模式 · 玩家 ' + st.me);
  ev.forEach(x => say('  · ' + x));
  say('');
  say(renderScreen(C, sess, player));
  say('');
  say('（下一步：node tools/play.mjs ' + (player ? '--player ' : '') + 'choose <序号>；随时 state / where / items / log 看情况）');
  return buildPayload(C, sess, { cmd: 'new', fields: { events: ev } });
}

function cmdChoose(ctx) {
  const { pos, say, player, sessFile } = ctx;
  const sess = requireSession(sessFile);
  const C = loadEngine(sess.level);
  const st = sess.state;
  const raw = pos[1];
  const n = Number(raw);
  if (raw === undefined || !Number.isInteger(n)) throw new CliError('用法：node tools/play.mjs choose <序号>（1 起，序号见选项列表）');
  const entries = C.visibleChoices(st);
  const list = entries.map(e => choiceInfo(C, st, e));
  if (n < 1 || n > list.length) {
    throw new CliError('序号 ' + raw + ' 超出范围：当前位置（' + st.loc + ' · ' + nodeName(C, st.loc) + '）有 ' + list.length + ' 个选项'
      + (list.length ? '（1~' + list.length + '）' : '') + '；（位置没有变化）');
  }
  const info = list[n - 1];
  const e = entries[n - 1];
  if (!e.ok) {
    /* 玩家模式：灰显理由用玩家向措辞（lockText / 兜底），不透机械理由 */
    const chLock = (getNode(C, st).c || [])[e.ci] || {};
    throw new CliError('选项 ' + n + '「' + info.label + '」现在不能执行：'
      + (player ? C.lockHint(chLock) : (info.why || '条件不足')) + '；（位置没有变化）');
  }
  const from = st.loc;
  const r = executeChoice(C, st, e);
  if (r.error) throw new CliError('选项 ' + n + '「' + info.label + '」现在不能执行：'
    + (player ? C.lockHint({ cond: { [C.mainResId()]: e.price } }) : r.error) + '；（位置没有变化）');   // 玩家模式：钱不够 → 玩家向兜底措辞（同 E5）
  const notes = r.say ? r.ev.concat(['💬 ' + r.say]) : r.ev;   // E7：旁白也进流水（与效果日志并列）
  sess.steps += 1;
  logEntry(sess, 'choose', from, n + ') ' + choiceLogLabel(info), notes);
  writeSession(sess, sessFile);
  say('▶ 执行：' + n + ') ' + choiceLogLabel(info) + (player ? '' : '　（' + from + ' → ' + st.loc + '）'));
  r.ev.forEach(x => say('  · ' + x));
  if (r.say) say('  💬 ' + r.say);
  say('');
  say(renderScreen(C, sess, player));
  return buildPayload(C, sess, { cmd: 'choose', fields: { stepped: { i: n, label: info.label, from, to: st.loc }, events: r.ev, say: r.say } });
}

function cmdState(ctx) {
  const { say, player, sessFile } = ctx;
  const sess = requireSession(sessFile);
  const C = loadEngine(sess.level);
  say(renderScreen(C, sess, player));
  say('');
  say(player ? playerDetailText(C, sess) : detailText(C, sess));
  return buildPayload(C, sess, { cmd: 'state' });
}

function cmdWhere(ctx) {
  const { say, player, sessFile } = ctx;
  const sess = requireSession(sessFile);
  const C = loadEngine(sess.level);
  const st = sess.state;
  const node = getNode(C, st);
  say('📍 当前位置：' + st.loc + ' · ' + C.fillName(node.n || '？', st) + '　【' + sceneLabel(C, C.sceneOf(st)) + '】'
    + (node.endTag ? '　🏁 ' + node.endTag : '') + (node.fail ? '　💀 失败结算' : ''));
  if (!player) {   // 玩家模式不带场景 id / 已探索计数 / 步数
    say('   场景：' + sceneLabel(C, C.sceneOf(st)) + '（' + C.sceneOf(st) + '）　｜　已探索 ' + visitedIds(C, st).length + ' 处　｜　第 ' + sess.steps + ' 步');
  }
  if (st.bankrupt) say('   ⚠ 本关已结束（' + C.failInfo(st.zeroRes).title + '）');
  return buildPayload(C, sess, { cmd: 'where' });
}

/* 商店购买（规则走 Core.buy / Core.payReason，与网页版的购买按钮同一条路） */
function cmdBuy(ctx) {
  const { pos, say, player, sessFile } = ctx;
  const sess = requireSession(sessFile);
  const C = loadEngine(sess.level);
  const st = sess.state;
  const shop = C.shopInfo(st);
  const raw = pos[1];
  if (!shop) throw new CliError('当前位置（' + st.loc + ' · ' + nodeName(C, st.loc) + '）没有商店——按 state 看屏幕上的「商店」块再买');
  const goods = shop.stock.map((s, k) => (k + 1) + '.' + s.id).join('、');
  if (raw === undefined) throw new CliError('用法：node tools/play.mjs buy <编号|道具名>（这里的商店卖：' + goods + '）');
  const num = /^\d+$/.test(raw) ? parseInt(raw, 10) : NaN;
  const item = shop.stock.find(s => s.id === raw) || (Number.isInteger(num) ? shop.stock[num - 1] : null);
  if (!item) throw new CliError('商店里没有「' + raw + '」——这里卖：' + goods);
  if (item.owned) throw new CliError('你已经有一件「' + item.id + '」了（不用再买）；（没有变化）');
  const why = C.payReason(st, shop.price);
  if (why) throw new CliError('买不了「' + item.id + '」：'
    + (player ? C.lockHint({ cond: { [shop.resId]: shop.price } }) : why) + '；（没有变化）');   // 玩家模式不透含数字的 payReason
  const ev = C.buy(st, item.id, shop.price);
  sess.steps += 1;
  logEntry(sess, 'buy', st.loc, '买 ' + item.id + '（-' + shop.price + ' ' + shop.unit + '）', ev);
  writeSession(sess, sessFile);
  say('🛒 购买：' + (item.icon ? item.icon + ' ' : '') + item.id + '　（-' + shop.price + ' ' + shop.unit + '，现在 '
    + (player ? playerResText(C, st, C.resDef(shop.resId) || {}) : '剩 ' + C.resOf(st, shop.resId) + ' ' + shop.unit) + '）');
  ev.forEach(x => say('  · ' + x));
  say('');
  say(renderScreen(C, sess, player));
  return buildPayload(C, sess, { cmd: 'buy', fields: { bought: { id: item.id, price: shop.price }, events: ev } });
}

/* 废料回收（规则走 Core.sell，与网页版的卖出按钮同一条路） */
function cmdSell(ctx) {
  const { pos, say, player, sessFile } = ctx;
  const sess = requireSession(sessFile);
  const C = loadEngine(sess.level);
  const st = sess.state;
  const sell = C.sellInfo(st);
  const raw = pos[1];
  const unit = (C.resDef(C.mainResId()) || {}).unit || '';
  if (!sell) throw new CliError('当前位置（' + st.loc + ' · ' + nodeName(C, st.loc) + '）没有废料回收点——按 state 看屏幕上的「废料回收」块再卖');
  const list = sell.map(s => (s.icon ? s.icon + ' ' : '') + s.id).join('、') || '（现在没有可卖的）';
  if (raw === undefined) throw new CliError('用法：node tools/play.mjs sell <道具名>（这里可卖：' + list + '）');
  const item = sell.find(s => s.id === raw);
  if (!item) throw new CliError('卖不了「' + raw + '」：' + (C.hasItem(st, raw) ? '红框关键道具不能卖' : '背包里没有这件') + '；可卖：' + list);
  const ev = C.sell(st, item.id);
  sess.steps += 1;
  logEntry(sess, 'sell', st.loc, '卖 ' + item.id + '（+1 ' + unit + '）', ev);
  writeSession(sess, sessFile);
  say('♻ 卖出：' + (item.icon ? item.icon + ' ' : '') + item.id + '　（+1 ' + unit + '，现在 '
    + (player ? playerResText(C, st, C.resDef(C.mainResId()) || {}) : C.resOf(st, C.mainResId()) + ' ' + unit) + '）');
  ev.forEach(x => say('  · ' + x));
  say('');
  say(renderScreen(C, sess, player));
  return buildPayload(C, sess, { cmd: 'sell', fields: { sold: { id: item.id, gain: item.gain }, events: ev } });
}

/* E3：翻看文本道具的正文（只读：不改任何状态、不写会话）。
 * 未拥有 → 明确报错；有这件东西但没有正文 → 「没什么可读的」（不是错误）。 */
function cmdRead(ctx) {
  const { pos, say, sessFile } = ctx;
  const sess = requireSession(sessFile);
  const C = loadEngine(sess.level);
  const st = sess.state;
  const raw = pos[1];
  const readable = st.items.filter(id => C.itemText(id));
  if (raw === undefined) {
    throw new CliError('用法：node tools/play.mjs read <道具名>（手里能翻看的：' + (readable.join('、') || '暂时没有') + '）');
  }
  const meta = C.currentLevel().items[raw] || {};
  if (!C.hasItem(st, raw)) {
    throw new CliError('你手里没有「' + raw + '」这件东西，翻看不了'
      + (readable.length ? '；能翻看的：' + readable.join('、') : '') + '；（没有变化）');
  }
  if (!C.itemText(raw)) {
    say('📖 ' + (meta.icon ? meta.icon + ' ' : '') + raw + '：这件东西没什么可读的。');
    return buildPayload(C, sess, { cmd: 'read', fields: { read: { id: raw, text: null } } });
  }
  const text = C.fillName(C.itemText(raw), st);
  say('📖 ' + (meta.icon ? meta.icon + ' ' : '') + raw);
  say('');
  say(text);
  return buildPayload(C, sess, { cmd: 'read', fields: { read: { id: raw, text: text } } });
}

function cmdItems(ctx) {
  const { say, player, sessFile } = ctx;
  const sess = requireSession(sessFile);
  const C = loadEngine(sess.level);
  const st = sess.state;
  if (player) {   // 玩家版：不带件数/武力；可读的标 📖
    say('🎒 物品：');
    if (!st.items.length) say('  （空——去任务点找找看）');
    st.items.forEach(id => {
      const meta = C.currentLevel().items[id] || {};
      say('  ' + (meta.icon || '•') + ' ' + id + (meta.nosell ? '　【关键·不可卖】' : '') + (C.itemText(id) ? '　📖 可读' : ''));
    });
    return buildPayload(C, sess, { cmd: 'items' });
  }
  say('🎒 物品（' + st.items.length + ' 件，其中红框关键道具 ' + st.items.filter(id => (C.currentLevel().items[id] || {}).nosell).length + ' 件）');
  if (!st.items.length) say('  （空——去任务点找找看）');
  st.items.forEach(id => {
    const meta = C.currentLevel().items[id] || {};
    say('  ' + (meta.icon || '•') + ' ' + id + (meta.atk ? '　武力 +' + meta.atk : '') + (meta.nosell ? '　【红框·关键·不可卖】' : ''));
  });
  say('⚔ 武力值 ' + C.atkOf(st) + '（装备加成 + 线索加成）');
  return buildPayload(C, sess, { cmd: 'items' });
}

function cmdLog(ctx) {
  const { say, flags, player, sessFile } = ctx;
  const sess = requireSession(sessFile);
  const C = loadEngine(sess.level);
  const tail = intFlag(flags.tail, sess.log.length, 1, 999, 'tail');
  const list = sess.log.slice(Math.max(0, sess.log.length - tail));
  say(player
    ? '📜 操作流水' + (list.length < sess.log.length ? '（显示最后 ' + list.length + ' 条）' : '')
    : '📜 操作流水（共 ' + sess.log.length + ' 条' + (list.length < sess.log.length ? '，显示最后 ' + list.length + ' 条' : '') + '）');
  if (!list.length) say('  （还没有操作）');
  list.forEach(e => {
    say('  ' + e.n + '. [' + clock(e.at) + '] '
      + (!player && e.from ? e.from + ' → ' + e.to + '　' : '')   // 玩家模式不带「编号 → 编号」
      + (e.label || e.cmd) + (e.notes && e.notes.length ? '　' + e.notes.join('；') : ''));
  });
  return buildPayload(C, sess, { cmd: 'log', fields: { log: list } });
}

function cmdSave(ctx) {
  const { say, pos, player, sessFile } = ctx;
  const sess = requireSession(sessFile);
  const C = loadEngine(sess.level);
  const file = pos[1];
  if (!file) throw new CliError('用法：node tools/play.mjs save <文件>（例如 save my-run.json）');
  const target = path.resolve(process.cwd(), file);
  const snap = { v: 1, kind: 'playtest-snapshot', level: sess.level, state: sess.state, log: sess.log, steps: sess.steps, savedAt: new Date().toISOString() };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(snap, null, 2) + '\n');
  say('💾 已保存会话快照：' + target);
  say(player
    ? '   （留证据用；复现问题把这份文件发给开发者）'
    : '   （复现问题：node tools/play.mjs load ' + file + '，然后 state / log 回看）');
  return buildPayload(C, sess, { cmd: 'save', fields: { saved: target } });
}

function cmdLoad(ctx) {
  const { say, pos, sessFile } = ctx;
  const file = pos[1];
  if (!file) throw new CliError('用法：node tools/play.mjs load <文件>（由 save 生成的快照）');
  const target = path.resolve(process.cwd(), file);
  if (!fs.existsSync(target)) throw new CliError('找不到快照文件：' + target);
  let snap;
  try { snap = JSON.parse(fs.readFileSync(target, 'utf8')); }
  catch (e) { throw new CliError('快照读不出来（' + target + '）：' + e.message); }
  if (!snap || !snap.level || !snap.state || !snap.state.loc) throw new CliError('这不是有效的试玩快照（缺 level / state.loc）：' + target);
  const C = loadEngine(snap.level);
  const st = C.normalizeState(snap.state);
  if (!C.currentLevel().nodes[st.loc]) throw new CliError('快照里的位置 ' + st.loc + ' 在关卡 ' + snap.level + ' 里不存在（关卡数据改过？）');
  const sess = { v: 1, level: snap.level, state: st, log: Array.isArray(snap.log) ? snap.log : [], steps: Number(snap.steps) || 0, createdAt: new Date().toISOString() };
  writeSession(sess, sessFile);
  say('📂 已载入快照：' + target + '　（' + (snap.savedAt || '未知时间保存') + '）');
  say('');
  say(renderScreen(C, sess));
  return buildPayload(C, sess, { cmd: 'load', fields: { loaded: target } });
}

function cmdAuto(ctx) {
  const { say, flags, sessFile } = ctx;
  const sess = requireSession(sessFile);
  const C = loadEngine(sess.level);
  const st = sess.state;
  const maxSteps = intFlag(flags.steps, 30, 1, 500, 'steps');
  const seed = flags.seed === undefined ? String(Date.now() % 100000) : String(flags.seed);
  const rnd = makeRng(seed);
  const realRandom = Math.random;
  /* 同一个种子也接管引擎里的随机（如大里姆的抽奖 random 选项）——这样「同种子同起点」才真的可复现 */
  Math.random = rnd;
  say('🎲 自动试玩开始：最多 ' + maxSteps + ' 步　｜　种子 ' + seed + '（同种子可复现，含关卡里的 50/50）');
  let played = 0, stopped = null, reason = '';
  const trail = [];
  try {
    for (let k = 0; k < maxSteps; k++) {
      const node = getNode(C, st);
      if (st.bankrupt || node.win || node.fail) { stopped = 'ended'; break; }
      const list = C.visibleChoices(st).map(e => ({ e, info: choiceInfo(C, st, e) })).filter(x => x.e.ok);
      if (!list.length) {
        stopped = 'stuck';
        reason = C.deadEnd(st) ? '这里没有可执行的选项（引擎判定：走投无路）' : '这里没有可执行的选项';
        break;
      }
      const pick = list[Math.floor(rnd() * list.length)];
      const from = st.loc;
      const r = executeChoice(C, st, pick.e);
      if (r.error) { stopped = 'stuck'; reason = '执行选项失败：' + r.error; break; }
      played += 1;
      sess.steps += 1;
      logEntry(sess, 'auto', from, pick.info.i + ') ' + choiceLogLabel(pick.info), r.ev);
      trail.push({ n: played, from, to: st.loc, i: pick.info.i, label: pick.info.label, events: r.ev, say: r.say || null });
      say('  ' + pad2(played) + '. ' + from + ' ' + nodeName(C, from) + ' → ' + pick.info.i + ') ' + pick.info.label
        + (st.loc !== from ? '　⇒ ' + st.loc + ' ' + nodeName(C, st.loc) : '')
        + (r.ev.length ? '　[' + r.ev.join('；') + ']' : '')
        + (r.say ? '　💬 ' + r.say : ''));
    }
  } finally {
    Math.random = realRandom;
  }
  if (!stopped) stopped = 'steps';
  const node = getNode(C, st);
  say('');
  say('══ 自动试玩结束 ══');
  say('走了 ' + played + ' 步　｜　停在 ' + st.loc + ' · ' + nodeName(C, st.loc) + '　｜　'
    + (node.win ? '🏁 ' + (node.endTag || '通关')
      : node.fail || st.bankrupt ? '💀 ' + (st.bankrupt ? C.failInfo(st.zeroRes).title : (node.endTag || '失败结算'))
        : stopped === 'stuck' ? '⚠ ' + reason
          : '步数用尽'));
  say('结束原因：' + ({ ended: '到达结局/结算', stuck: '卡死', steps: '步数用尽' })[stopped]
    + '　｜　重跑：node tools/play.mjs auto --steps ' + maxSteps + ' --seed ' + seed);
  say(stateText(C, sess));
  writeSession(sess, sessFile);
  return buildPayload(C, sess, { cmd: 'auto', fields: { auto: { played, stopped, reason, seed, maxSteps, trail } } });
}

function makeRng(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  let a = (h >>> 0) || 1;                                   // mulberry32
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ============================ 帮助 ============================ */
function helpText(player) {
  const L = [
    '《你有一个新任务！》无头试玩器 —— 在终端里真玩一局（规则 = 网页版 engine.js 的 Core，不重写）',
    '',
    '用法：node tools/play.mjs [--json|--player] <子命令> [参数]',
    '',
    '  new <关卡id> [--hard] [--name 名字]   开新局并打印首屏（关卡：' + listLevels().join(' / ') + '）',
    '  choose <序号>                          执行当前可见选项里的第 <序号> 个（1 起）',
    '  buy <编号|道具名>                  在商店买东西（编号看屏幕上的「商店」块）',
    '  sell <道具名>                      在废料回收点卖东西（红框关键道具不能卖）',
    '  read <道具名>                      翻看文本道具的正文（只读；未拥有的会明确报错）',
    '  state                                  一屏状态 + 详细（位置/资源/物品/线索/武力/步数）',
    '  where                                  当前位置（编号 · 名称 · 场景）',
    '  items                                  物品（红框关键道具会标出来）与武力值',
    '  log [--tail N]                         操作流水（默认全部；--tail 只看最后 N 条）',
    '  save <文件> / load <文件>              会话快照（复现问题用）',
    '  auto [--steps N] [--seed S]            自动随机试玩 N 步（冒烟；卡死会停下并报出来）',
    '  help                                   这份说明',
    '',
    '  --json 可放在任意子命令前：输出机器可读 JSON（node / name / text / choices[{i,label,to,ok,why}] / shop / sell / state{…}）',
    '  --player 玩家模式（给 AI 体验师）：隐藏数值（改定性档位）/武力/步数/去向编号/机械理由，显示 lockText；',
    '           禁用 --json / load / auto；会话存 player-session.json；save 可用',
    '',
    '文件：会话 = ' + SESSION_FILE + '（开发）｜ ' + PLAYER_SESSION_FILE + '（--player）　（.playtest/ 已进 .gitignore）',
    '详细玩法与「给 AI 体验师下指令」的模板：docs/playtest-guide.md'
  ];
  if (player) L.splice(1, 0, '（玩家模式已启用：隐藏数值/去向编号/机械理由；禁用 --json / load / auto；会话 = player-session.json）');
  return L.join('\n');
}

/* ============================ 入口 ============================ */
function main() {
  const { json, player, flags, pos } = parseArgs(process.argv.slice(2));
  const sessFile = player ? PLAYER_SESSION_FILE : SESSION_FILE;    // E10：玩家模式用独立会话，不覆盖开发会话
  const sink = [];
  const say = (...xs) => { sink.push(xs.map(x => String(x)).join(' ')); };
  const ctx = { json, player, sessFile, flags, pos, say };
  const cmd = pos[0];
  let payload = null;
  let code = 0;
  try {
    /* E10 硬隔离：玩家模式禁用 --json / load / auto */
    if (player && json) throw new CliError('玩家模式不能用 --json（体验师硬隔离：免得看到机械数据）');
    if (player && (cmd === 'load' || cmd === 'auto')) throw new CliError('玩家模式不能用 ' + cmd + '（体验师硬隔离：不许试探式重试 / 跳步）');
    if (!cmd || cmd === 'help' || flags.help === true) { process.stdout.write(helpText(player) + '\n'); return; }
    const run = ({
      new: cmdNew, choose: cmdChoose, state: cmdState, where: cmdWhere,
      items: cmdItems, log: cmdLog, save: cmdSave, load: cmdLoad, auto: cmdAuto,
      buy: cmdBuy, sell: cmdSell, read: cmdRead
    })[cmd];
    if (!run) throw new CliError('不认识的子命令：' + cmd + '（试试 ' + USAGE_HINT + '）');
    payload = run(ctx);
  } catch (e) {
    if (!(e instanceof CliError)) {
      console.error('✗ 试玩器内部错误（这不应该发生，请连同下面的信息报告）：');
      console.error(e && e.stack ? e.stack : String(e));
      process.exitCode = 1;
      return;
    }
    if (json) {
      process.stdout.write(JSON.stringify({ ok: false, cmd: cmd || null, error: e.message }, null, 2) + '\n');
    } else {
      if (sink.length) process.stdout.write(sink.join('\n') + '\n');
      console.error('✗ ' + e.message);
    }
    process.exitCode = 1;
    return;
  }
  if (json) process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
  else if (sink.length) process.stdout.write(sink.join('\n') + '\n');
  if (payload && payload.auto && payload.auto.stopped === 'stuck') code = 3;   // 卡死 → 退出码 3（冒烟脚本可判）
  process.exitCode = code;    // 用 exitCode 让进程自然退出：stdout 是管道时也保证写完（不用 process.exit 硬切）
}

main();
