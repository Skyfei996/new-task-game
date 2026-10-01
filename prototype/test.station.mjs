// 原创关卡《空间站大停摆》自测：node prototype/test.station.mjs
// 覆盖：多关卡加载与旧存档兼容 / 关卡数据完整性（45 点·23 道具·8 乘员·4 场景坐标与素材尺寸）
//       / 通关 A 路线完整模拟 / 三件重启物每条路径 / 氧气预算验算 / 双资源失败 / 卡死保险 / DOM id 自检
//       / §8.7 十条自动断言（断循环 / 预算 95·180·100 / 简单·困难跑通 A 与困难保险柜短线反例 /
//         结局 C 前置 / 资源不为负 / 星币不判失败 / 改名扫描 / 提示分级 lint / 文本道具 / R10~R16 落点）
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const code = ['levels/dalim.js', 'levels/station.js', 'engine.js']
  .map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
vm.runInThisContext(code, { filename: 'bundle.station.js' });
const C = globalThis.GameCore;
const LEVELS = globalThis.LEVELS;

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.error('  ✗ FAIL:', msg); } }
function eq(a, b, msg) { ok(a === b, msg + '（实际 ' + JSON.stringify(a) + '，期望 ' + JSON.stringify(b) + '）'); }

/* ============ 0. 多关卡注册表 ============ */
ok(!!LEVELS && !!LEVELS.dalim && !!LEVELS.station, '关卡注册表里有 dalim 与 station 两关');
eq(C.defaultLevelId(), 'dalim', '默认关卡 = 加载顺序里的第一个（勇闯大里姆）');
ok(C.selectLevel('station'), '可以选中《空间站大停摆》');
eq(C.currentLevelId(), 'station', '当前关卡 = station');
ok(C.selectLevel('dalim') && C.selectLevel('station'), '两关之间可以来回切换');
const D = globalThis.GAME_DATA;   // selectLevel 已把当前关卡同步给 GAME_DATA

/* ============ 1. 元信息 / 资源 ============ */
eq(D.meta.title, '空间站大停摆', '标题');
eq(D.meta.level, '你有一个新任务！· 原创 L1', '副标题');
eq(D.meta.poster, '../images/station/station-map-ai-v1.jpg', '海报图（站外图未到，暂用总览图占位）');
ok(D.meta.tagline.length > 10, '有一句话简介');
eq(D.start.node, '1', '起点 1 号（食堂）');
eq(D.meta.safeNode, '18', '安全点 18 号（顶层中央大厅）');
ok((D.meta.winReward || '').length > 0, '有通关奖励文案');
eq(D.meta.atkFromClues['机器人小帮手'], 1, '收编机器人 = 武力 +1');

eq(D.resources.length, 2, '两种资源（星币 + 氧气）');
const coins = D.resources.find(r => r.id === 'coins');
const oxygen = D.resources.find(r => r.id === 'oxygen');
ok(!!coins && !!oxygen, '资源表里有 coins 与 oxygen 两条');
eq(coins.name, '星币', '货币名 = 星币（R02）');
eq(coins.icon, '🪙', '星币的图标');
eq(coins.start.normal, 20, '星币普通开局 20');
eq(coins.start.hard, 15, '星币困难开局 15');
eq(coins.fail, null, '星币 fail: null（花光不判失败，E1）');
eq(coins.noSpendToZero, undefined, 'noSpendToZero 已移除（可以花到 0）');
eq(oxygen.name, '氧气', '氧气的名字');
eq(oxygen.icon, '💨', '氧气的图标');
eq(oxygen.start.normal, 100, '氧气普通开局 100');
eq(oxygen.start.hard, 30, '氧气困难开局 30（D2：80→30）');
eq(oxygen.fail.node, '44', '氧气归零 → 44 号失败结算');
ok(oxygen.fail.text.indexOf('眼前一黑') >= 0, '氧气失败文案（设计档原文）');
ok(oxygen.fail.text.indexOf('晨星号') >= 0 && oxygen.fail.text.indexOf('中继站') < 0, '失败文案站名 = 晨星号（R13）');
/* 序章（R01/E2）：设计稿 99 字（含标点），要求 ≤ 100 字 */
ok(!!D.meta.prologue && Array.isArray(D.meta.prologue.lines) && D.meta.prologue.lines.length > 0, 'meta.prologue 存在（E2）');
const prologueText = D.meta.prologue.lines.join('');
ok(prologueText.length <= 100, '序章 ≤ 100 字（实测 ' + prologueText.length + ' 字）');
eq(prologueText.length, 99, '序章恰为设计稿的 99 字');
ok(D.meta.prologue.lines.every(l => l.length > 0), '序章每一行都非空');
ok(!!C.prologue() && C.prologue().lines.length === D.meta.prologue.lines.length, 'Core.prologue() 读得到序章（E2 数据面）');
/* 帮助（玩法说明）：9 条（新增第 7 条）；也是 §14-7 扫描面里的「帮助」那一半 */
ok(Array.isArray(D.help) && D.help.length === 9, '帮助恰 9 条（实测 ' + ((D.help || []).length) + '）');
ok(D.help.every(l => typeof l === 'string' && l.length > 10), '帮助每一条都是完整句子');
ok(D.help.some(l => l.indexOf('星币') >= 0 && l.indexOf('20') >= 0), '帮助里有星币条目（R02）');
ok(D.help.some(l => l.indexOf('30 点') >= 0), '帮助里写明困难氧气 30 点（D2）');
ok(D.help.some(l => l.indexOf('🧭') >= 0), '帮助里有「选项」第 7 条（R06 提示分级）');
/* 资源 id 不能和状态字段撞名（资源直接住在 state 的同名字段上） */
['diff', 'me', 'items', 'visited', 'done', 'learned', 'wristband', 'hist', 'loc',
 'bankrupt', 'zeroRes', 'scene', 'flash'].forEach(k =>
  ok(!D.resources.some(r => r.id === k), '资源 id 不与状态字段撞名：' + k));
/* 开局数值走资源表 */
const stN = C.newState('normal'), stH = C.newState('hard');
eq(stN.coins, 20, '普通开局星币 20');
eq(stN.oxygen, 100, '普通开局氧气 100');
eq(stH.coins, 15, '困难开局星币 15');
eq(stH.oxygen, 30, '困难开局氧气 30');
eq(stN.me, '林小晨', '默认玩家名 = 林小晨');
ok(!stN.bankrupt && stN.zeroRes === null, '开局没有失败标记');

/* ============ 2. 场景与编号坐标（四场景 pins） ============ */
const PINS = {
  deck1: { '1': [358, 404], '2': [1021, 235], '3': [1452, 404], '4': [412, 729], '5': [1416, 751], '18': [896, 504] },
  deck2: { '6': [340, 336], '7': [950, 224], '8': [1523, 336], '9': [340, 695], '10': [860, 740], '11': [1416, 673], '20': [896, 471] },
  deck3: { '12': [466, 269], '13': [950, 247], '14': [1452, 359], '15': [305, 594], '16': [788, 807], '17': [1308, 717], '21': [896, 504] },
  exterior: { '19': [760, 700] }
};
eq(Object.keys(D.scenes).join(','), 'deck1,deck2,deck3,exterior', '四个场景');
const allPins = new Set();
Object.entries(PINS).forEach(([sid, pins]) => {
  const sc = D.scenes[sid];
  ok(!!sc, '场景存在：' + sid);
  eq(Object.keys(sc.pins).sort().join(','), Object.keys(pins).sort().join(','), sid + ' 的编号集合与规格一致');
  Object.entries(pins).forEach(([id, xy]) => {
    allPins.add(id);
    ok(!!D.nodes[id], `编号点 ${id} 有对应节点`);
    const p = sc.pins[id];
    ok(!!p && p[0] === xy[0] && p[1] === xy[1], `${sid} 编号 ${id} 坐标 = [${xy}]（实际 ${JSON.stringify(p)}）`);
    ok(p[0] >= 0 && p[0] < sc.width && p[1] >= 0 && p[1] < sc.height, `编号 ${id} 坐标在图内（未越界）`);
  });
});
eq(allPins.size, 21, '四场景编号合计 21 个（无重复）');
eq(allPins.has('19'), true, '站外场景有 19 号（太阳能板阵列）');
/* 19 号放在画面中部（±15% 中心） */
const ext = D.scenes.exterior;
const cx = ext.width / 2, cy = ext.height / 2;
ok(Math.abs(ext.pins['19'][0] - cx) <= ext.width * 0.15 && Math.abs(ext.pins['19'][1] - cy) <= ext.height * 0.15,
  '19 号钉在站外图的画面中部');

/* 素材校验：声明的宽高必须和真实图片一致（编号按原图像素定位） */
function jpegSize(file) {
  const buf = fs.readFileSync(file);
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
Object.entries(D.scenes).forEach(([sid, sc]) => {
  const p = path.join(dir, sc.image);
  ok(fs.existsSync(p), `场景图文件存在：${sid}（${sc.image}）`);
  const sz = fs.existsSync(p) ? jpegSize(p) : null;
  eq(sz && sz.w + '×' + sz.h, sc.width + '×' + sc.height, `${sid} 场景图实测尺寸 = 数据声明（${sc.width}×${sc.height}）`);
});
ok(D.scenes.exterior.image.indexOf('station-map-ai-v1') >= 0, '站外图用的是站体总览图占位（站外素材未到）');

/* ============ 3. 道具（23 件 + 红框 + 武力 + 文本道具） ============ */
const NEED_ITEMS = ['手电', '工牌', '氧气瓶', '万能扳手', '磁力靴', '焊接枪', '电击棒', '机械手套', '应急盾',
  '控制芯片', '冷却剂罐', '站长授权卡', '备用电池', '医疗包', '绳索', '站猫罐头', '合成料理', '桑尼的账本',
  '监控回放', '反应堆安全规程', '站长的便条', '逃生舱钥匙', '星尘矿石'];
eq(Object.keys(D.items).length, 23, '道具表 23 件（20 + 文本道具 3，R07）');
eq(D.itemOrder.length, 23, 'itemOrder 列出 23 件');
eq(new Set(D.itemOrder).size, 23, 'itemOrder 无重复');
NEED_ITEMS.forEach(it => {
  ok(!!D.items[it], '道具表里有：' + it);
  ok(D.itemOrder.indexOf(it) >= 0, 'itemOrder 里有：' + it);
});
const nosell = D.itemOrder.filter(it => D.items[it].nosell).sort().join(',');
eq(nosell,
  ['控制芯片', '冷却剂罐', '站长授权卡', '星尘矿石', '磁力靴', '焊接枪'].sort().join(','),
  '红框（不可售/不可丢）恰为设计档指定的 6 件');
eq(D.items['焊接枪'].atk, 1, '焊接枪 武力 +1');
eq(D.items['电击棒'].atk, 2, '电击棒 武力 +2');
eq(D.items['机械手套'].atk, 1, '机械手套 武力 +1');
eq(D.items['应急盾'].atk, 1, '应急盾 武力 +1');
ok(D.itemOrder.every(it => !!D.items[it].icon), '每件道具都有 emoji 图标（图标素材未到，emoji 占位）');
/* 每件道具都能拿到（出现在某处的 en.gain / 选项 fx.gain / 商店货架） */
function gainSources(item) {
  return Object.entries(D.nodes).filter(([id, n]) =>
    (n.en && (n.en.gain || []).indexOf(item) >= 0) ||
    (n.c || []).some(ch => ch.fx && (ch.fx.gain || []).indexOf(item) >= 0) ||
    (n.shop && n.shop.stock.indexOf(item) >= 0)).map(([id]) => id);
}
NEED_ITEMS.forEach(it => ok(gainSources(it).length > 0, '道具可获得：' + it + '（来源 ' + gainSources(it).join('/') + '）'));

/* ============ 4. 人物（8 位乘员） ============ */
eq(Object.keys(D.characters).length, 8, '人物表 8 位');
eq(D.charOrder.length, 8, 'charOrder 列出 8 位');
eq(new Set(D.charOrder).size, 8, 'charOrder 无重复');
D.charOrder.forEach(cid => ok(!!D.characters[cid], 'charOrder 里的「' + cid + '」在人物表中'));
const NEED_CHARS = ['伊莲娜', '老布', '阿雅', '胖胖', 'R2-糖糖', '铁头', '桑尼', '银河'];
NEED_CHARS.forEach(n => ok(D.charOrder.some(cid => D.characters[cid].name === n), '乘员表里有：' + n));
Object.entries(D.characters).forEach(([cid, ch]) => {
  ok(!!ch.name, `人物 ${cid} 有名称`);
  ok(typeof ch.title === 'string' && ch.title.length > 0, `人物 ${cid} 有称号`);
  ok(!!ch.emoji && !ch.img, `人物 ${cid} 用 emoji 占位（立绘未到）`);
  ok(typeof ch.bio === 'string' && ch.bio.length >= 8, `人物 ${cid} 有小传（照抄设计档 §2）`);
  const sc = D.scenes[ch.spot && ch.spot.scene];
  ok(!!sc, `人物 ${cid} 的 spot.scene 是已有场景`);
  ok(!!sc && ch.spot.x >= 0 && ch.spot.x < sc.width && ch.spot.y >= 0 && ch.spot.y < sc.height,
    `人物 ${cid} 的钉位在图内（${ch.spot && ch.spot.scene}）`);
  const near = !!sc && Object.values(sc.pins).some(p => Math.hypot(p[0] - ch.spot.x, p[1] - ch.spot.y) <= 60);
  ok(near, `人物 ${cid} 的钉位贴着对应房间的编号点`);
  const refs = Object.keys(D.nodes).filter(id => (D.nodes[id].chars || []).indexOf(cid) >= 0);
  ok(refs.length > 0, `人物 ${cid} 至少关联一个任务点（${refs.join('/')}）`);
  ok(refs.some(id => C.sceneOfNode(id) === ch.spot.scene), `人物 ${cid} 至少有一个关联点就在它的钉位场景里（光环会亮）`);
});
Object.entries(D.nodes).forEach(([id, node]) => {
  (node.chars || []).forEach(cid => ok(!!D.characters[cid], `节点 ${id} 的 chars 引用「${cid}」在人物表中`));
});

/* ============ 5. 节点图完整性（45 点网络） ============ */
const RES_IDS = D.resources.map(r => r.id);
Object.entries(D.nodes).forEach(([id, node]) => {
  ok(typeof node.n === 'string' && node.n.length > 0, `节点 ${id} 有名称`);
  ok(typeof node.t === 'string' && node.t.length >= 8, `节点 ${id} 有正文（儿童向短句，1~3 句）`);
  /* E6/E7/E5/E4：新字段的类型校验 */
  const targets = [];
  (node.c || []).forEach((ch, i) => {
    if (ch.once !== undefined) ok(ch.once === true || typeof ch.once === 'string', `节点 ${id} 选项#${i} once 类型合法`);
    if (ch.say !== undefined) ok(typeof ch.say === 'string' && ch.say.length > 0, `节点 ${id} 选项#${i} say 是字符串`);
    if (ch.lockText !== undefined) ok(typeof ch.lockText === 'string' && ch.lockText.length > 0, `节点 ${id} 选项#${i} lockText 是字符串`);
    if (ch.hint !== undefined) ok(['vague', 'exact', 'none'].indexOf(ch.hint) >= 0, `节点 ${id} 选项#${i} hint 合法`);
    if (ch.to) targets.push(ch.to);
    if (ch.battle) targets.push(ch.battle.winTo, ch.battle.loseTo);
    if (ch.random) targets.push(...ch.random);
    if (ch.toIf) targets.push(...ch.toIf.map(x => x.to));
    ['gain', 'lose'].forEach(k => (ch.fx && ch.fx[k] || []).forEach(it => ok(!!D.items[it], `节点 ${id} 选项#${i} fx.${k}「${it}」在道具表`)));
    /* 效果里的资源键必须是本关声明的资源 */
    Object.keys(ch.fx || {}).forEach(k => {
      if (['gain', 'lose', 'learn', 'coinsByWristband'].indexOf(k) >= 0) return;
      ok(RES_IDS.indexOf(k) >= 0, `节点 ${id} 选项#${i} fx 的资源键「${k}」已在 resources 表`);
    });
    /* 条件里引用的道具 / 资源 / 结构的合法性 */
    (function walkCond(c) {
      if (!c) return;
      if (c.item) ok(!!D.items[c.item], `节点 ${id} 选项#${i} cond.item「${c.item}」`);
      if (c.noItem) ok(!!D.items[c.noItem], `节点 ${id} 选项#${i} cond.noItem「${c.noItem}」`);
      if (c.anyItem) c.anyItem.forEach(it => ok(!!D.items[it], `节点 ${id} 选项#${i} cond.anyItem「${it}」`));
      (c.all || []).forEach(walkCond);
      (c.any || []).forEach(walkCond);
      Object.keys(c).forEach(k => {
        if (['item', 'noItem', 'knows', 'noKnows', 'anyItem', 'notPinsAll', 'pinsAll', 'notPins', 'all', 'any', 'chDone'].indexOf(k) >= 0) return;
        ok(RES_IDS.indexOf(k) >= 0, `节点 ${id} 选项#${i} cond 的资源键「${k}」已在 resources 表`);
      });
    })(ch.cond);
  });
  ['gain', 'lose'].forEach(k => (node.en && node.en[k] || []).forEach(it => ok(!!D.items[it], `节点 ${id} en.${k}「${it}」`)));
  Object.keys((node.en) || {}).forEach(k => {
    if (['once', 'ifNoItem', 'gain', 'lose', 'learn', 'thief', 'thiefRes', 'testItems', 'testCoins', 'pass'].indexOf(k) >= 0) return;
    ok(RES_IDS.indexOf(k) >= 0, `节点 ${id} en 的资源键「${k}」已在 resources 表`);
  });
  /* E8 正文分叉：tIf 的 cond 与正文同样要合法（chDone / pinsAll / knows / item…） */
  ok(!node.tIf || Array.isArray(node.tIf), `节点 ${id} tIf 是数组`);
  (node.tIf || []).forEach((x, i) => {
    ok(typeof x.t === 'string' && x.t.length >= 8, `节点 ${id} tIf#${i} 有正文`);
    ok(!!x.cond, `节点 ${id} tIf#${i} 有 cond`);
    (function walkCond(c) {
      if (!c) return;
      if (c.item) ok(!!D.items[c.item], `节点 ${id} tIf#${i} cond.item「${c.item}」`);
      (c.all || []).forEach(walkCond);
      (c.any || []).forEach(walkCond);
      Object.keys(c).forEach(k => {
        if (['item', 'noItem', 'knows', 'noKnows', 'anyItem', 'notPinsAll', 'pinsAll', 'notPins', 'all', 'any', 'chDone'].indexOf(k) >= 0) return;
        ok(RES_IDS.indexOf(k) >= 0, `节点 ${id} tIf#${i} cond 的资源键「${k}」已在 resources 表`);
      });
    })(x.cond);
  });
  (node.shop ? node.shop.stock : []).forEach(it => ok(!!D.items[it], `节点 ${id} 商店货架「${it}」`));
  targets.forEach(t => ok(!!D.nodes[t], `节点 ${id} 的目标「${t}」存在`));
});
/* 45 点覆盖：1~43 = 节点（地点 21 + 事件 19 + 结局 3），44 = 氧气失败结算，45 = 保险柜事件（R10） */
const missing = [];
for (let i = 1; i <= 43; i++) if (!D.nodes[String(i)]) missing.push(i);
eq(missing.join(','), '', '1~43 号节点全部存在');
ok(!!D.nodes['44'] && !!D.nodes['44'].fail, '44 号失败结算点存在（氧气）');
ok(!!D.nodes['45'] && !D.nodes['45'].fail, '45 号存在且非失败（保险柜事件，R10）');
eq(RES_IDS.length, 2, '两种资源');
eq(D.resources.filter(r => r.fail && r.fail.node).map(r => r.fail.node).join(','), '44', '只有氧气指向失败结算点 44');
const endNodes = ['41', '42', '43'];
endNodes.forEach(id => {
  ok(!!D.nodes[id].win, `结局节点 ${id} 标记为通关`);
  ok(!!D.nodes[id].endTag, `结局节点 ${id} 有结局标签（${D.nodes[id].endTag}）`);
});
eq(D.nodes['41'].endTag.indexOf('结局 A') >= 0 && D.nodes['42'].endTag.indexOf('结局 B') >= 0 && D.nodes['43'].endTag.indexOf('结局 C') >= 0,
  true, '三个结局分别是 A/B/C');
ok(!!D.nodes['29'].fail, '29 号「被制服」是失败结算点');
/* {me} 占位符 */
const meNodes = Object.entries(D.nodes).filter(([, n]) => (n.t || '').indexOf('{me}') >= 0);
ok(meNodes.length >= 4, '{me} 占位符出现在多个任务点文本里（' + meNodes.map(([id]) => id).join('/') + '）');
const sMe = C.newState('normal', '小豆');
ok(C.fillName(D.nodes['41'].t, sMe).indexOf('小豆') >= 0, '结局文案里的 {me} 会替换成玩家名');
ok(C.fillName(D.nodes['41'].t, sMe).indexOf('{me}') < 0, '结局文案里不会残留 {me}');
/* 从起点全图可达（不含 ended 状态；44/45 由资源归零触发，不是选项目标） */
const reachable = new Set(['44', '45']);
(function bfs() {
  const q = [D.start.node];
  while (q.length) {
    const id = q.shift();
    if (reachable.has(id)) continue;
    reachable.add(id);
    const n = D.nodes[id];
    if (!n || n.fail || n.win) continue;
    (n.c || []).forEach(ch => {
      const t = C.choiceTargets(ch);
      [...t.to, ...t.random, ...t.win, ...t.lose].forEach(x => { if (D.nodes[x] && !reachable.has(x)) q.push(x); });
    });
  }
})();
const unreachable = Object.keys(D.nodes).filter(id => !reachable.has(id));
eq(unreachable.join(','), '', '所有节点都能从起点走到（无孤岛；44/45 由资源归零触发）');
/* 门槛两条路线的数据层核对（防卡死第 2 条）：三件重启物 ≥2 条来源 */
['控制芯片', '冷却剂罐', '站长授权卡'].forEach(it =>
  ok(gainSources(it).length >= 2, '关键道具 ≥2 条来源：' + it + '（' + gainSources(it).join('/') + '）'));
['磁力靴', '焊接枪', '万能扳手', '手电', '绳索', '备用电池', '医疗包', '站猫罐头'].forEach(it =>
  ok(gainSources(it).length >= 1, '必需工具可获得：' + it + '（' + gainSources(it).join('/') + '）'));
ok(gainSources('控制芯片').length >= 2, '控制芯片 ≥2 条来源（老布 / 自己拆）');
ok(gainSources('冷却剂罐').length >= 2, '冷却剂罐 ≥2 条来源（硬拿 / 账本 / 冷却塔备件）');
ok(gainSources('站长授权卡').length >= 2, '站长授权卡 ≥2 条来源（阿雅 / 站长室保险柜）');
/* 氧气数值（设计档 §8.2 逐段表 · 数据口径：2/3 号并入 en 净值） */
eq(D.nodes['12'].en.oxygen, -10, '12 号反应堆舱：每次进入 −10 氧');
eq(D.nodes['13'].en.oxygen, -5, '13 号冷却塔：每次进入 −5 氧');
eq(D.nodes['19'].en.oxygen, -15, '19 号舱外：每次进入 −15 氧');
eq(D.nodes['1'].en.oxygen, -5, '1 号食堂：黑暗摸索 −5 氧（首入）');
eq(D.nodes['4'].en.oxygen, -5, '4 号健身房：撬急救箱 −5 氧');
eq(D.nodes['39'].en.oxygen, -5, '39 号焊接作业 −5 氧');
eq(D.nodes['2'].en.oxygen, 10, '睡眠舱应急包净 +10（氧气瓶 +15 ∕ 翻找 −5）');
eq(D.nodes['3'].en.oxygen, 5, '医务室氧气站净 +5（+10 ∕ 搬运 −5）');
eq(D.nodes['20'].en.oxygen, 5, '中层大厅补给柜 +5 氧（一次性）');
eq(D.nodes['1'].en.once, true, '食堂黑暗摸索只扣一次');
eq(D.nodes['2'].en.once, true, '睡眠舱补给只给一次');
eq(D.nodes['3'].en.once, true, '医务室补给只给一次');
eq(D.nodes['20'].en.once, true, '大厅补给只给一次');
eq(D.nodes['20'].en.gain, undefined, '中层大厅不再送备用电池（D7：电池改去贩卖机买）');
eq(D.nodes['12'].en.once, undefined, '反应堆舱每次进入都要耗氧（不是一次性）');
eq(D.nodes['19'].en.once, undefined, '舱外每次进入都要耗氧（不是一次性）');
{
  const battleCh = D.nodes['16'].c.find(ch => ch.battle);
  ok(!!battleCh && battleCh.fx && battleCh.fx.oxygen === -5, '16 号失控机器人战 −5 氧（战斗选项的代价）');
  const crawlCh = D.nodes['16'].c.find(ch => (ch.l || '').indexOf('爬道') >= 0);
  ok(!!crawlCh && crawlCh.fx && crawlCh.fx.oxygen === -10, '16 号钻维修爬道 −10 氧');
  ok(crawlCh.cond.any && crawlCh.cond.any.length === 2, '爬道需要「糖糖是帮手」或「万能扳手」（任一）');
}

/* ============ 6. 通关 A 路线完整模拟（推荐主线 · 结局 A） ============ */
let st = C.newState('normal');
/* 选项定位：按文案片段找下标，条件不满足直接抛错（测试脚本自身的护栏）；
 * allowFail=true 时允许路线中触发失败结算（反例路线专用） */
function goPick(id, part, allowFail) {
  const node = D.nodes[id];
  const idx = node.c.findIndex(ch => (ch.l || '').indexOf(part) >= 0);
  if (idx < 0) throw new Error('找不到选项：' + id + ' / ' + part);
  if (!C.condOk(st, node.c[idx].cond)) throw new Error('选项条件不满足：' + id + ' / ' + part);
  const res = C.choose(st, idx);
  if (res.back) C.goBack(st); else if (res.to) C.go(st, res.to);
  if (!allowFail) {
    if (st.bankrupt) throw new Error('路线中触发失败结算：' + id + ' / ' + part + '（' + st.zeroRes + '）');
    if (st.oxygen <= 0 || st.coins < 0) throw new Error('资源为负/耗尽：' + id + ' / ' + part);
  }
  return res;
}
/* 设计档 §8.2 推荐主线（简单 / 困难同一条路径）：返回逐步快照，供两种难度分别断言 */
function runMainRoute(diff) {
  st = C.newState(diff);
  const T = {};
  const snap = (label) => { T[label] = { ox: st.oxygen, coins: st.coins, loc: st.loc }; };
  C.go(st, '1');
  snap('开局食堂');
  const price = D.nodes['1'].shop.price;
  const meals = Math.floor(st.coins / price);        // 普通 4 盒 / 困难 3 盒（一次只拿得动一盒：买一盒、吃一盒）
  for (let i = 0; i < meals; i++) { C.buy(st, '合成料理', price); goPick('1', '吃一盒合成料理'); }
  snap('买满吃掉');
  goPick('1', '摸黑去中央大厅'); goPick('18', '摸回去'); snap('睡眠舱');
  goPick('2', '回中央大厅'); goPick('18', '去健身房'); snap('健身房');
  goPick('4', '回中央大厅'); goPick('18', '去医务室'); snap('医务室');
  goPick('3', '把医疗包交给阿雅'); snap('授权卡');
  goPick('24', '回中央大厅'); goPick('18', '去观景厅');
  goPick('5', '凑过去'); snap('见胖胖');
  goPick('5', '看银河'); goPick('28', '用站猫罐头'); snap('换到账本');
  goPick('5', '回中央大厅'); goPick('18', '乘电梯去中层'); snap('中层补给柜');
  goPick('20', '吃一盒合成料理'); snap('吃掉赠的料理');
  goPick('20', '乘电梯去底层'); goPick('21', '去维修区');
  goPick('16', '零件堆'); snap('翻零件堆');
  goPick('16', '钻进'); snap('爬道上来');
  goPick('7', '打开工具柜'); snap('拆到芯片');
  goPick('30', '把芯片收好'); goPick('21', '去冷却塔'); snap('进冷却塔');
  goPick('13', '用万能扳手拧上总阀'); snap('关阀');
  goPick('21', '乘电梯去中层'); goPick('20', '去气闸舱');
  goPick('11', '打开安保柜'); goPick('11', '穿上磁力靴，出舱'); snap('舱外');
  goPick('19', '用工具把面板焊好'); snap('焊好');
  goPick('39', '爬回气闸舱'); goPick('11', '回中层大厅'); goPick('20', '乘电梯去底层');
  goPick('21', '去太阳能控制室'); goPick('15', '双手推上主供电闸门'); snap('复电');
  goPick('36', '回底层大厅'); goPick('21', '去反应堆舱'); snap('进反应堆舱');
  goPick('12', '装上三件东西'); snap('重启');
  goPick('34', '追！'); goPick('40', '揭发他'); snap('结局 A');
  return { meals, T };
}
{
  const { meals, T } = runMainRoute('normal');
  eq(meals, 4, '普通：开局 20 星币买得起 4 盒料理');
  eq(T['开局食堂'].ox, 95, '1 食堂：黑暗摸索 −5（100→95）');
  eq(T['买满吃掉'].ox, 135, '买 4 盒吃掉 +40（95→135）');
  eq(T['买满吃掉'].coins, 0, '星币花光到 0（不判失败）');
  eq(T['睡眠舱'].ox, 145, '睡眠舱应急包净 +10（135→145）');
  ok(C.hasItem(st, '手电') && C.hasItem(st, '工牌') && C.hasItem(st, '氧气瓶'), '睡眠舱拿到 手电 / 工牌 / 氧气瓶');
  eq(T['健身房'].ox, 140, '健身房撬急救箱 −5（140）');
  ok(!C.hasItem(st, '医疗包'), '医疗包在 3① 交给阿雅时被消耗（不留在背包）');
  eq(T['医务室'].ox, 145, '医务室氧气站净 +5（145）');
  ok(C.hasItem(st, '站长授权卡'), '拿到站长授权卡（路径①：阿雅）');
  eq(T['见胖胖'].ox, 140, '观景厅打招呼（钻沙发 −5）');
  ok(C.hasItem(st, '站猫罐头') || C.hasItem(st, '桑尼的账本'), '观景厅礼物 / 账本到手');
  eq(T['换到账本'].ox, 140, '换账本不耗氧');
  ok(C.hasItem(st, '桑尼的账本'), '拿到桑尼的账本（证据① → 揭发可用）');
  eq(T['中层补给柜'].ox, 145, '中层补给柜 +5');
  eq(T['吃掉赠的料理'].ox, 155, '吃掉胖胖给的料理 +10');
  eq(T['翻零件堆'].ox, 150, '16⑤ 翻零件堆 −5');
  ok(C.hasItem(st, '万能扳手') && C.hasItem(st, '焊接枪'), '维修区翻出 万能扳手 + 焊接枪');
  eq(T['爬道上来'].ox, 140, '16④ 爬道 −10');
  eq(T['拆到芯片'].ox, 135, '7② 拆芯片 −5');
  ok(C.hasItem(st, '控制芯片'), '拿到控制芯片（路径②：自己拆）');
  eq(T['进冷却塔'].ox, 130, '13 号进入 −5');
  eq(T['关阀'].ox, 125, '13① 关阀 −5');
  ok(C.hasItem(st, '冷却剂罐'), '拿到冷却剂罐（冷却塔备件）');
  eq(T['舱外'].ox, 105, '11② 开舱门 −5、19 进入 −15（125→120→105）');
  eq(T['焊好'].ox, 100, '19 进入 −15、39 焊接 −5（120→105→100）');
  ok(st.learned['太阳能板已修好'], '太阳能板已修好（电力前置的第一半）');
  eq(T['复电'].ox, 95, '15① 合闸 −5');
  ok(st.learned['全站复电'], '全站复电（电力前置的第二半）');
  eq(T['进反应堆舱'].ox, 85, '12 号进入 −10（→85，主线段完）');
  eq(T['结局 A'].loc, '41', '抵达结局 A · 圆满');
  ok(!!D.nodes['41'].win, '41 号标记为通关');
  eq(T['结局 A'].ox, 85, 'A 路线结束时氧气 85（= 180 − 95，结余 47.2%）');
  ok(st.coins === 0 && !st.bankrupt, 'A 路线把钱花光但并不失败（结束时 ' + st.coins + ' 枚）');
}

/* ============ 7. 三件重启物的每条路径 ============ */
/* 芯片·路径②：糖糖带路 → 维修爬道 → 实验室自己拆（新增 7② 的 −5 氧） */
st = C.newState('normal');
C.go(st, '6');
goPick('6', '问它'); eq(st.loc, '23', '6→23（糖糖登场）');
ok(st.learned['糖糖是帮手'] && st.learned['保险柜密码'], '糖糖是帮手 + 知道保险柜密码');
goPick('23', '去实验室'); eq(st.loc, '7', '23→7');
C.go(st, '16'); eq(st.loc, '16', '走到维修区');
const oxCrawl = st.oxygen;
goPick('16', '钻进'); eq(st.loc, '7', '16→7（爬道）');
eq(st.oxygen, oxCrawl - 10, '钻爬道 −10 氧');
ok(st.learned['维修爬道路线'], '记住维修爬道路线');
goPick('7', '打开工具柜'); eq(st.loc, '30', '7→30（自己拆芯片）');
eq(st.oxygen, oxCrawl - 15, '7② 拆芯片再 −5 氧');
ok(C.hasItem(st, '控制芯片'), '拿到控制芯片（路径②：自己拆，无需老布）');

/* 芯片·路径①（老布线）：7① → 25 → 16③ → 38；并与 7 号正文分叉联动（R14） */
st = C.newState('normal');
C.go(st, '7');
goPick('7', '帮他去找工具箱'); eq(st.loc, '25', '7→25（老布的委托）');
ok(st.learned['老布的委托'], '记住老布的委托');
goPick('25', '这就下维修区'); eq(st.loc, '16', '25→16（维修区）');
st.items.push('手电');   // 16③ 需要手电（打着手电拖工具箱）
goPick('16', '红漆工具箱'); eq(st.loc, '38', '16→38（老布的工具箱）');
ok(C.hasItem(st, '控制芯片'), '拿到控制芯片（路径①：工具箱）');
goPick('38', '回底层大厅'); eq(st.loc, '21', '38→21');
ok(C.condOk(st, { pinsAll: ['38'] }), '38 号已到过（7 号 tIf 的 cond 成立）');
C.go(st, '7');
ok(C.nodeText(st, D.nodes['7']).indexOf('宝贝回来了') >= 0, '拿回箱后再进实验室 → 正文分叉（R14）');
ok(C.nodeText(st, D.nodes['7']) !== D.nodes['7'].t, '7 号两段正文不同');

/* 冷却剂·路径①：铁头掰手腕 → 铁头开门 → 仓库硬拿（并挨无人机抢） */
st = C.newState('normal');
st.items = ['焊接枪'];             // 武力 1，够赢铁头（武力 1）
C.go(st, '4');
eq(st.oxygen, 95, '4 号进场撬急救箱 −5 氧');
goPick('4', '掰手腕'); eq(st.loc, '26', '4→26（挑战铁头）');
goPick('26', '用力'); eq(st.loc, '27', '战斗胜利 → 27（铁头开门）');
ok(st.learned['铁头已开门'], '铁头开门');
C.go(st, '10');
goPick('10', '直接动手搬'); eq(st.loc, '31', '10→31（硬拿冷却剂）');
ok(C.hasItem(st, '冷却剂罐'), '拿到冷却剂罐（路径①：硬拿）');
eq(st.coins, 12, '被桑尼的无人机抢走 8 枚星币（20→12）');
const theft = C.takeFlash(st);
ok(theft && theft.kind === 'theft' && theft.thief === '桑尼的无人机' && theft.amount === 8,
  '给出「无人机抢星币」提示事件（供警示条用）');
eq(C.takeFlash(st), null, '提示事件取走后不重复');

/* 冷却剂·路径③（备用）：冷却塔关阀（进入 −5 + 关阀 −5） */
st = C.newState('normal');
st.items = ['万能扳手'];
C.go(st, '13');
eq(st.oxygen, 95, '冷却塔泄漏区每次进入 −5 氧');
goPick('13', '用万能扳手拧上总阀'); eq(st.loc, '21', '13→21');
eq(st.oxygen, 90, '关阀再 −5 氧');
ok(C.hasItem(st, '冷却剂罐'), '拿到冷却剂罐（路径③：冷却塔备件）');

/* 冷却剂·路径④（R12）：硬穿蒸汽也有收获，不再是零收益纯亏 */
st = C.newState('normal');
C.go(st, '13');
eq(st.oxygen, 95, '进冷却塔 −5 氧');
goPick('13', '冲过蒸汽'); eq(st.loc, '21', '13→21（硬穿）');
eq(st.oxygen, 85, '硬穿 −10 氧');
ok(C.hasItem(st, '冷却剂罐'), '硬穿也能拿到冷却剂（R12）');

/* 冷却剂·路径②：账本把柄（28 换账本 → 10② → 32） */
st = C.newState('normal');
C.go(st, '5');
goPick('5', '凑过去');                                     // 拿站猫罐头
goPick('5', '看银河'); goPick('28', '用站猫罐头');           // 换到桑尼的账本
goPick('5', '回中央大厅'); goPick('18', '乘电梯去中层'); goPick('20', '去仓库');
eq(st.loc, '10', '20→10（仓库）');
goPick('10', '把账本拍在他面前'); eq(st.loc, '32', '10→32（账本把柄）');
ok(C.hasItem(st, '冷却剂罐') && C.hasItem(st, '星尘矿石'), '拿到冷却剂罐 + 星尘矿石（路径②：账本把柄）');
ok((D.nodes['32'].t || '').indexOf('星尘矿石') >= 0 && D.nodes['32'].c[0].to === '20',
  '32 号：账本把柄收尾（货箱里的星尘矿石作证 → 放你走）');

/* 收贿赂（10 ③）：+10 星币只发一次，线索断；再进反应堆舱 → 桑尼伏击（29 号失败结算） */
st = C.newState('normal');
C.go(st, '10');
goPick('10', '封口费'); eq(st.loc, '33', '10→33（收贿赂）');
eq(st.coins, 30, '封口费 +10（只发一次：20→30）');
ok(st.learned['收了桑尼的贿赂'], '线索断：记住「收了桑尼的贿赂」');
C.go(st, '12');
ok(C.condOk(st, D.nodes['12'].c[0].cond), '收贿后进反应堆舱：只剩「被桑尼伏击」这一条');
goPick('12', '舱门'); eq(st.loc, '29', '桑尼偷袭 → 29 号被制服（失败结算）');
ok(!!D.nodes['29'].fail, '29 号是失败结算点（可重开）');

/* 授权卡·路径②：糖糖给密码 → 站长室保险柜（R10：走 45 号保险柜事件） */
st = C.newState('normal');
C.go(st, '9');
{ const ch = D.nodes['9'].c.find(x => (x.l || '').indexOf('保险柜') >= 0);
  ok(!C.condOk(st, ch.cond), '站长室保险柜：没密码没工牌 → 打不开'); }
C.go(st, '6'); goPick('6', '问它');   // 拿到保险柜密码
ok(!C.condOk(st, D.nodes['9'].c[0].cond), '有密码但仍需 工牌 或 铁头开门');
st.items.push('工牌');
ok(C.condOk(st, D.nodes['9'].c[0].cond), '有密码 + 工牌 → 可以开保险柜');
C.go(st, '9');
goPick('9', '转动密码盘'); eq(st.loc, '45', '9→45（保险柜事件）');
ok(C.hasItem(st, '站长授权卡') && C.hasItem(st, '站长的便条'), '拿到站长授权卡 + 站长的便条（文本道具）');
eq(st.oxygen, 95, '开柜 −5 氧（100→95）');
ok(C.choiceDone(st, D.nodes['9'].c[0], 0, '9'), '9① 的 once 标记已记录（开过保险柜）');
goPick('45', '把东西收好'); eq(st.loc, '20', '45→20（回中层大厅）');
C.go(st, '9');
ok(C.nodeText(st, D.nodes['9']).indexOf('空了') >= 0, '开柜后再进站长室 → 正文分叉（R14）');

/* 观景厅·R11：一次性礼物移入 ①、二次进入文本分叉 */
st = C.newState('normal');
C.go(st, '5');
eq(C.nodeText(st, D.nodes['5']), D.nodes['5'].t, '未打招呼 → 用场景正文');
goPick('5', '凑过去');
eq(st.oxygen, 95, '钻过沙发 −5 氧');
ok(C.hasItem(st, '合成料理') && C.hasItem(st, '站猫罐头'), '打招呼拿到料理 + 罐头');
ok(C.nodeText(st, D.nodes['5']) !== D.nodes['5'].t, '打过招呼 → 正文分叉');
ok(C.visibleChoices(st).every(x => (x.label || '').indexOf('凑过去') < 0), '一次性选项做过即隐藏（E6）');
C.go(st, '18'); C.go(st, '5');
ok(C.nodeText(st, D.nodes['5']).indexOf('呼噜') >= 0, '二次进入仍是分叉文本（R11）');

/* ============ 8. 氧气预算验算（§8.7-2） ============ */
/* 设计档 §8.2 逐段表（账面口径：补给记毛额，翻找/搬运 −5 另列；数据里 2/3 号把这两笔并入 en 净值） */
const SEG = [
  { id: '1',  deck: '顶层', ox: -5,  at: 'en' },
  { id: '2',  deck: '顶层', ox: -5,  at: 'net', net: 10 },
  { id: '4',  deck: '顶层', ox: -5,  at: 'en' },
  { id: '3',  deck: '顶层', ox: -5,  at: 'net', net: 5 },
  { id: '5',  deck: '顶层', ox: -5,  at: 'fx' },
  { id: '7',  deck: '中层', ox: -5,  at: 'fx' },
  { id: '11', deck: '中层', ox: -5,  at: 'fx' },
  { id: '16', deck: '底层', ox: -5,  at: 'fx' },
  { id: '16', deck: '底层', ox: -10, at: 'fx' },
  { id: '13', deck: '底层', ox: -5,  at: 'en' },
  { id: '13', deck: '底层', ox: -5,  at: 'fx' },
  { id: '15', deck: '底层', ox: -5,  at: 'fx' },
  { id: '12', deck: '底层', ox: -10, at: 'en' },
  { id: '19', deck: '站外', ox: -15, at: 'en' },
  { id: '39', deck: '站外', ox: -5,  at: 'en' }
];
let BUDGET = null;
{
  const deck = { '顶层': 0, '中层': 0, '底层': 0, '站外': 0 };
  SEG.forEach(r => { deck[r.deck] += -r.ox; });
  const COSTS = SEG.reduce((s, r) => s - r.ox, 0);
  eq(COSTS, 95, '主线消耗合计 = 95（逐行相加）');
  eq(deck['顶层'], 25, '顶层支出 −25');
  eq(deck['中层'], 10, '中层支出 −10');
  eq(deck['底层'], 40, '底层支出 −40');
  eq(deck['站外'], 20, '站外支出 −20');
  /* 15 行逐条在数据里有实现载体（2/3 号按设计并入 en 净值） */
  const bad = [];
  SEG.forEach(r => {
    const n = D.nodes[r.id];
    let hit = false;
    if (r.at === 'en') hit = !!(n.en && n.en.oxygen === r.ox);
    else if (r.at === 'fx') hit = (n.c || []).some(ch => ch.fx && ch.fx.oxygen === r.ox);
    else hit = !!(n.en && n.en.oxygen === r.net);
    if (!hit) bad.push(r.id + '（' + r.ox + '）');
  });
  eq(bad.join(','), '', '预算表 15 行逐条在数据里有落点');
  /* 设计 §8.7-2 的三处点名行：钉到具体选项（节点级匹配可能被同节点其它选项代偿） */
  const pin = (id, frag) => (D.nodes[id].c.find(ch => (ch.l || '').indexOf(frag) >= 0) || {});
  eq((pin('5', '凑过去').fx || {}).oxygen, -5, '§8.7-2 点名行：5① 打招呼 −5（钻沙发）');
  eq((pin('16', '零件堆翻一翻').fx || {}).oxygen, -5, '§8.7-2 点名行：16⑤ 翻零件堆 −5');
  eq((pin('13', '拧上总阀').fx || {}).oxygen, -5, '§8.7-2 点名行：13① 关阀 −5');
  /* 补给（毛额）：数据里的净值 20 + 并入的 10 = 30 */
  let dataPos = 0, posOnce = true;
  Object.entries(D.nodes).forEach(([id, n]) => {
    const e = (n.en && n.en.oxygen) || 0;
    if (e > 0) { dataPos += e; if (!n.en.once) posOnce = false; }
  });
  eq(dataPos, 20, '数据里的补给净值合计 20（2 号 +10、3 号 +5、20 号 +5）');
  eq(dataPos + 10, 30, '补给毛额 = 30（睡眠舱 15 + 医务室 10 + 补给柜 5）');
  ok(posOnce, '三处补给都是一次性（once）');
  /* 热食：赠 1 份 + 购买上限（普通 4 盒 / 困难 3 盒，看开局星币） */
  const price = D.nodes['1'].shop.price;
  const mealsN = Math.floor(coins.start.normal / price), mealsH = Math.floor(coins.start.hard / price);
  eq(mealsN, 4, '普通最多买 4 盒料理（20÷5）');
  eq(mealsH, 3, '困难最多买 3 盒料理（15÷5）');
  const NORMAL = 100 + 30 + (10 + mealsN * 10), HARD = 30 + 30 + (10 + mealsH * 10);
  eq(NORMAL, 180, '普通可得 100 + 30 + 50 = 180');
  eq(HARD, 100, '困难可得 30 + 30 + 40 = 100');
  ok(COSTS <= 0.7 * NORMAL, '简单：95 ≤ 0.7 × 180 = 126');
  ok(COSTS <= 0.95 * HARD, '困难：95 ≤ 0.95 × 100 = 95（取等）');
  const marginN = (NORMAL - COSTS) / NORMAL, marginH = (HARD - COSTS) / HARD;
  ok(marginN >= 0.3, '普通结余 ≥ 30%');
  ok(marginH <= 0.05, '困难结余 ≤ 5%');
  BUDGET = { COSTS, NORMAL, HARD, marginN, marginH, dataPos, deck };
  console.log('预算验算：消耗 ' + COSTS + ' ｜ 可得 普通 ' + NORMAL + ' / 困难 ' + HARD +
    ' ｜ 结余 普通 ' + (marginN * 100).toFixed(1) + '% / 困难 ' + (marginH * 100).toFixed(2) + '%');
  console.log('  分层支出：顶层 ' + deck['顶层'] + ' ｜ 中层 ' + deck['中层'] + ' ｜ 底层 ' + deck['底层'] + ' ｜ 站外 ' + deck['站外']);
  /* 每段主线都有补给可达（数据层：补给点在 1~2 步之内） */
  const step = (a, b) => (D.nodes[a].c || []).some(ch => ch.to === b);
  ok(step('18', '3') && D.nodes['3'].en.oxygen === 5, '顶层段：大厅 ⇄ 医务室（补给）相邻');
  ok(D.nodes['20'].en.oxygen === 5, '中层段：大厅自带补给柜（+5）');
  ok(step('19', '11') && step('11', '20'), '出舱段（−15）：19 → 11 → 20 可补给');
  ok(step('12', '21') && step('21', '20'), '反应堆段（−10）：12 → 21 → 20 可补给');
  ok(step('16', '21') && step('21', '20'), '维修区段（爬道 −10）：16 → 21 → 20 可补给');
  ok(step('13', '21') && step('21', '20'), '冷却塔段（−5）：13 → 21 → 20 可补给');
}

/* ============ 9. 双资源失败（星币不再判失败） ============ */
/* ① 氧气耗尽 → 44 号结算（唯一的失败资源） */
st = C.newState('normal');
st.oxygen = 5;
C.go(st, '12');
eq(st.oxygen, 0, '氧气钳在 0（不会变负）');
eq(st.bankrupt, true, '氧气归零 → 判失败');
eq(st.zeroRes, 'oxygen', '失败结算归因到氧气');
eq(st.loc, '44', '自动走入 44 号失败结算点');
ok(D.nodes['44'].t.indexOf('眼前一黑') >= 0, '44 号正文 = 氧气失败文案');
ok(D.nodes['44'].t.indexOf('晨星号') >= 0, '44 号文案站名 = 晨星号（R13）');
eq(Object.keys(C.reachablePins(st)).length, 0, '失败结算后地图上没有任何可走的编号');
eq(C.choose(st, 0).to, undefined, '失败结算后不再接受选项');
/* ② 星币被抢到 0 → 只钳位、不判失败、不进 45（R02/E1） */
st = C.newState('normal');
st.items = ['焊接枪'];
st.learned['铁头已开门'] = true;
st.coins = 3;
C.go(st, '31');
eq(st.coins, 0, '星币钳在 0（20 起步 → 被抢到 0）');
ok(!st.bankrupt && st.zeroRes === null, '星币归零不判失败');
eq(st.loc, '31', '不走进 45 号（45 号是保险柜事件）');
/* ③ 购买口径（E1）：允许花到 0，钱不够才拒绝 */
eq(C.mainResId(), 'coins', '花钱扣的是「星币」');
st = C.newState('normal');
st.coins = 5;
eq(C.payReason(st, 5), '', '刚好够 → 可以买（允许花到 0）');
let log = C.buy(st, '合成料理', 5);
ok(C.hasItem(st, '合成料理') && st.coins === 0, '买到 0（花光不判失败）');
ok(!st.bankrupt, '买完不判失败');
st = C.newState('normal');
st.coins = 3;
eq(C.payReason(st, 5), '星币不够（需要 5 枚）', '钱不够的理由文案');
st.coins = 4;
log = C.buy(st, '合成料理', 5);
ok(!C.hasItem(st, '合成料理') && st.coins === 4, '钱不够买不了，且不扣款');
ok(log.join('｜').indexOf('不够') >= 0, '拒绝理由说明钱不够：' + log.join('｜'));
/* ④ 自动贩卖机（食堂）同一条口径（价格 5） */
st = C.newState('normal');
st.coins = 4;
log = C.buy(st, '合成料理', D.nodes['1'].shop.price);
ok(!C.hasItem(st, '合成料理'), '食堂贩卖机：4 枚买不起 5 枚的料理');
st.coins = 5;
C.buy(st, '合成料理', D.nodes['1'].shop.price);
ok(C.hasItem(st, '合成料理') && st.coins === 0, '食堂贩卖机：5 枚买 5 枚 → 花到 0');
/* ⑤ 两种资源互相独立：氧气归零 = 本关结束；星币归零 = 无事发生 */
st = C.newState('normal');
st.oxygen = 1;
C.applyRes(st, 'oxygen', -1);
ok(st.bankrupt && st.zeroRes === 'oxygen' && st.coins === 20, '氧气归零 → 本关结束，星币不受影响');
st = C.newState('normal');
C.applyRes(st, 'coins', -20);
ok(!st.bankrupt && st.coins === 0 && st.oxygen === 100, '星币归零 → 不结束，氧气不受影响');

/* ============ 10. 卡死保险（走投无路检测） ============ */
st = C.newState('normal');
C.go(st, '1');
ok(!C.deadEnd(st), '食堂：有可执行选项 → 不误报');
C.go(st, '12');
ok(!C.deadEnd(st), '反应堆舱：至少「回底层大厅」可走 → 不误报');
C.go(st, '41');
ok(!C.deadEnd(st), '结局节点不触发求救面板');
st = C.newState('normal');
st.oxygen = 1;
C.go(st, '12');
ok(st.bankrupt && !C.deadEnd(st), '资源归零的失败结算不触发求救面板');
/* 造假节点：所有选项都带条件、且不满足 → 走投无路 */
D.nodes['T9'] = { n: '测试点', t: '（测试用）', c: [{ l: '需要手电', cond: { item: '手电' }, to: '1' }] };
st = C.newState('normal');
st.loc = 'T9';
ok(C.deadEnd(st), '所有选项条件都不满足 + 无可达编号 + 无返回 → 判定走投无路');
st.items = ['手电'];
ok(!C.deadEnd(st), '拿到手电后 → 不再是走投无路');
/* 只有「买得起」的价格选项才算可执行动作（把场景换到站外，避免“点击编号”这条旁路） */
D.nodes['T9'] = { n: '测试点', t: '（测试用）', c: [{ l: '买腕带', prices: [3], to: '1' }] };
st = C.newState('normal'); st.loc = 'T9'; st.scene = 'exterior'; st.coins = 2;
ok(C.deadEnd(st), '价格选项全部买不起（钱不够）也算没有可执行动作');
st.coins = 5;
ok(!C.deadEnd(st), '钱够了 → 有可执行动作');
/* 返回选项也算可执行动作 */
D.nodes['T9'] = { n: '测试点', t: '（测试用）', c: [{ l: '需要手电', cond: { item: '手电' }, to: '1' }, { l: '返回', back: true }] };
st = C.newState('normal'); st.loc = 'T9'; st.scene = 'exterior'; st.hist = ['18'];
ok(!C.deadEnd(st), '有「返回」选项 → 不算走投无路');
delete D.nodes['T9'];
/* 求救面板的两个出口：安全点配置 + 回到安全点后能继续玩 */
st = C.newState('normal');
eq(C.safeNodeId(), '18', '安全点 = 关卡 meta.safeNode');
ok(D.nodes['18'].n.indexOf('中央大厅') >= 0, '18 号是中央大厅');
C.go(st, '12');
C.go(st, C.safeNodeId());
eq(st.loc, '18', '「回到安全点」一按就到');
ok(!C.deadEnd(st), '回到安全点后可以继续冒险');
eq(D.nodes['18'].c.length, 7, '顶层大厅有 7 个出口（五个房间 + 上下两层）');
/* 大里姆也有安全点配置（引擎兜底用） */
C.selectLevel('dalim');
ok(!!C.safeNodeId() && !!globalThis.GAME_DATA.nodes[C.safeNodeId()], '示例关卡同样配置了可用的安全点');
C.selectLevel('station');

/* ============ 11. 多关卡加载与旧存档兼容 ============ */
eq(C.saveKey('dalim'), 'mygame2.save.dalim.v1', '大里姆存档键（按关卡独立）');
eq(C.saveKey('station'), 'mygame2.save.station.v1', '空间站存档键（按关卡独立）');
eq(C.legacyKey('dalim'), 'mygame2.market.save.v1', '旧的市场存档键只对大里姆生效');
eq(C.legacyKey('station'), null, '空间站没有旧存档键');
function fakeStore(init) {
  const m = Object.assign({}, init || {});
  return {
    getItem: k => (Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    _map: m
  };
}
/* ① 新键：存 → 读 */
const store = fakeStore();
const s1 = C.newState('normal', '小明');
C.go(s1, '18');
s1.oxygen = 77;
ok(C.saveTo(store, 'station', s1), '写入空间站存档');
ok(store.getItem('mygame2.save.station.v1').indexOf('"oxygen":77') >= 0, '存档里带着氧气 77');
const back = C.loadFrom(store, 'station');
eq(back.oxygen, 77, '读回氧气 77');
eq(back.loc, '18', '读回当前位置 18');
eq(back.me, '小明', '读回玩家名');
ok(C.loadFrom(store, 'dalim') === null, '空间站的存档不会被大里姆误读');
/* ② 旧存档 mygame2.market.save.v1 → 当作大里姆的进度读入并迁移 */
const oldSave = {
  diff: 'normal', coins: 9, items: ['饼干'], visited: { '11': true }, done: {}, learned: {},
  wristband: 0, hist: [], loc: '11', bankrupt: false, scene: 'market'
};
const store2 = fakeStore({ 'mygame2.market.save.v1': JSON.stringify(oldSave) });
const dl = C.loadFrom(store2, 'dalim');
ok(!!dl && dl.coins === 9 && dl.loc === '11', '旧的 mygame2.market.save.v1 作为大里姆的存档读入');
ok(store2.getItem('mygame2.save.dalim.v1') !== null, '读入后写入新键（完成迁移）');
eq(C.loadFrom(store2, 'station'), null, '空间站不会误读大里姆的旧存档');
/* ③ 读档兜底：旧存档没有 scene / me / zeroRes */
C.selectLevel('dalim');
const old2 = { diff: 'hard', coins: 0, items: [], visited: {}, done: {}, learned: {}, wristband: 0, hist: [], loc: '14' };
C.normalizeState(old2);
eq(old2.scene, 'basement', '没有 scene 字段 → 按 loc 兜底推断场景（负一层）');
eq(old2.me, '林小晨', '没有 me 字段 → 默认玩家名');
eq(old2.bankrupt, true, '旧存档金币 0 → 按新规矩判失败（沿用 v1.3 行为）');
eq(old2.zeroRes, 'coins', '失败归因到萨瓦币');
const old3 = { diff: 'normal', coins: -5, items: [], visited: {}, done: {}, learned: {}, loc: '1' };
C.normalizeState(old3);
eq(old3.coins, 0, '负数余额钳到 0');
ok(old3.bankrupt, '钳到 0 即判失败');
C.selectLevel('station');
/* ④ 玩家名：全局存 + 清洗 */
eq(C.playerName(fakeStore()), '林小晨', '没存过 → 默认「林小晨」');
const store3 = fakeStore();
C.savePlayer(store3, '  小明  ');
eq(C.playerName(store3), '小明', '玩家名去掉首尾空格并保存');
eq(C.cleanName(''), '林小晨', '空名字 → 兜底默认');
eq(C.cleanName('一二三四五六七八九十十一'), '一二三四五六七八九十', '超长名字截到 10 字');
/* ⑤ {me} 占位符 */
const s2 = C.newState('normal', '小明');
eq(C.fillName('你好，{me}！', s2), '你好，小明！', '{me} → 玩家名');
eq(C.fillName('{me}{me}', s2), '小明小明', '多处占位符都替换');
eq(C.fillName('没有占位符', s2), '没有占位符', '没有占位符时原样返回');
const s3 = C.newState('normal');
eq(C.fillName('{me}', s3), '林小晨', '默认名也能替换');

/* ============ 12. v0.2 新条件语言 / 战斗代价 ============ */
st = C.newState('normal');
ok(!C.condOk(st, { all: [{ item: '控制芯片' }, { knows: '全站复电' }] }), 'all：缺一不可');
st.items = ['控制芯片']; st.learned['全站复电'] = true;
ok(C.condOk(st, { all: [{ item: '控制芯片' }, { knows: '全站复电' }] }), 'all：全部满足');
ok(!C.condOk(st, { any: [{ item: '焊接枪' }, { item: '机械手套' }] }), 'any：都不满足 → false');
st.items.push('机械手套');
ok(C.condOk(st, { any: [{ item: '焊接枪' }, { item: '机械手套' }] }), 'any：满足其一 → true');
st.visited['5'] = true;
ok(C.condOk(st, { pinsAll: ['5'] }), 'pinsAll：到过 → true');
ok(!C.condOk(st, { pinsAll: ['5', '8'] }), 'pinsAll：还有没到过的 → false');
ok(!C.condOk(st, { notPins: ['5'] }), 'notPins：到过 → false');
ok(C.condOk(st, { notPins: ['8'] }), 'notPins：没到过 → true');
ok(!C.condOk(st, { oxygen: 999 }), '资源下限：氧气不足 → false');
ok(C.condOk(st, { coins: 20 }), '资源下限：星币够 → true');
/* 12 号启动的电力前置 */
st = C.newState('normal');
const c12 = D.nodes['12'].c.find(ch => (ch.l || '').indexOf('启动反应堆') >= 0);
ok(!C.condOk(st, c12.cond), '12 号启动：什么都没有 → 不可用');
st.items = ['控制芯片', '冷却剂罐', '站长授权卡'];
ok(!C.condOk(st, c12.cond), '12 号启动：三件齐但没复电 → 仍不可用（电力前置）');
st.learned['全站复电'] = true;
ok(C.condOk(st, c12.cond), '三件齐 + 全站复电 → 可以启动');
ok(C.lockReason(c12).indexOf('控制芯片') >= 0 && C.lockReason(c12).indexOf('全站复电') >= 0, '灰显理由列出缺的条件');
/* 收编机器人 = 武力 +1（meta.atkFromClues）——真走一遍 16→37，不手工注入线索 */
st = C.newState('normal');
st.items = ['焊接枪', '电击棒', '机械手套', '应急盾'];   // 1+2+1+1 = 5
eq(C.atkOf(st), 5, '装备齐全时武力 5');
C.go(st, '16');
const oxBattle = st.oxygen;
goPick('16', '拖出来'); eq(st.loc, '37', '战斗胜利 → 37（收编维修机器人）');
eq(st.oxygen, oxBattle - 5, '失控机器人战 −5 氧（战斗选项的代价）');
ok(st.learned['机器人小帮手'], '收编后学到线索「机器人小帮手」');
eq(C.atkOf(st), 6, '收编维修机器人 → 武力 5 → 6');
const drone = D.nodes['40'].c.find(ch => ch.battle && ch.battle.power === 6);
ok(!!drone, '40 号有「桑尼的无人机（武力 6）」的战斗选项');
ok(C.atkOf(st) >= 6, '满配 + 小帮手 = 6 ≥ 6 → 打得过无人机');
st.learned = {};
ok(C.atkOf(st) === 5 && 5 < 6, '没带小帮手时 5 < 6 → 打不过（但战斗输了只是结局 B，不是死局）');
eq(C.battleNeed(st, { power: 3 }), 3, '安保机器人武力 3');
/* 战斗选项带代价：耗氧先扣，再判胜负 */
st = C.newState('normal');
st.oxygen = 3;
C.go(st, '16');
ok(C.condOk(st, D.nodes['16'].c[0].cond), '16 号战斗选项无条件（总能点）');
const res16 = C.choose(st, 0);
eq(st.oxygen, 0, '战斗代价 −5 氧先扣（3 → 0）');
ok(st.bankrupt && st.loc === '44', '代价把氧气花光 → 当场走失败结算，不再进战斗');
eq(res16.to, undefined, '资源归零时不产生战斗去向');
/* 商店 / 出售 走同一条资源口径 */
st = C.newState('normal');
st.items = ['绳索'];
C.sell(st, '绳索');
eq(st.coins, 21, '卖一件废料 +1 星币');
C.sell(st, '控制芯片');
eq(st.coins, 21, '红框道具不能卖');

/* ============ 13. DOM id / 页面自检 ============ */
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const jsSrc = fs.readFileSync(path.join(dir, 'engine.js'), 'utf8');
const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const refIds = [...new Set([...jsSrc.matchAll(/\$\(\s*'([^']+)'\s*\)/g)].map(m => m[1]))];
const missingIds = refIds.filter(id => !htmlIds.has(id));
console.log('DOM id 引用检查：engine.js 引用 ' + refIds.length + ' 个 id，缺失 ' + missingIds.length + ' 个');
eq(missingIds.join(','), '', 'engine.js 引用的 DOM id 全部存在于 index.html');
eq([...new Set([...html.matchAll(/data-close="([^"]+)"/g)].map(m => m[1]))].filter(id => !htmlIds.has(id)).join(','),
  '', 'index.html 里所有 data-close 都指向存在的弹层 id');
ok(html.indexOf('levels/dalim.js') >= 0 && html.indexOf('levels/station.js') >= 0, 'index.html 按序加载两份关卡数据');
ok(html.indexOf('levels/dalim.js') < html.indexOf('levels/station.js'), '加载顺序：dalim 在前（默认关卡）');
ok(html.indexOf('levels/station.js') < html.indexOf('engine.js'), 'engine.js 最后加载（注册表已就绪）');
ok(!/src="data\.js"/.test(html), 'index.html 不再引用老的 data.js');
ok(fs.existsSync(path.join(dir, 'levels', 'dalim.js')) && fs.existsSync(path.join(dir, 'levels', 'station.js')),
  '关卡数据都在 prototype/levels/ 目录');
ok(!fs.existsSync(path.join(dir, 'data.js')), '老的 prototype/data.js 已迁走（单一数据源）');
ok(htmlIds.has('playerName') && htmlIds.has('levelList') && htmlIds.has('overlay'), '启动页 = 玩家名 + 关卡选择');
ok(htmlIds.has('stuckModal') && htmlIds.has('resList'), '页面里有求救面板与资源 HUD 容器');

/* ============ 14. §8.7 十条自动断言（设计档 v1 §8.7） ============ */
console.log('');
console.log('———— §8.7 十条自动断言 ————');
function P(line) { console.log('  ' + line); }
function applyCond(s, cond) {
  if (cond.item) s.items.push(cond.item);
  if (cond.chDone) s.chDone[cond.chDone] = true;
  if (cond.knows) s.learned[cond.knows] = true;
  if (cond.pinsAll) cond.pinsAll.forEach(p => { s.visited[p] = true; });
}

/* --- 14-1 断循环：20 轮「洗碗×3 → 买 → 吃」净氧 ≤ 0 --- */
{
  st = C.newState('normal');
  st.oxygen = 300; st.coins = 30;      // 只验循环净收益：起点调高，避免半路缺氧打断
  C.go(st, '1');
  const ox0 = st.oxygen;
  for (let r = 0; r < 20; r++) {
    goPick('1', '洗碗'); goPick('1', '洗碗'); goPick('1', '洗碗');   // +2 星币 / −5 氧，各一次
    C.buy(st, '合成料理', D.nodes['1'].shop.price);                  // −5 星币
    goPick('1', '吃一盒合成料理');                                    // +10 氧
  }
  const net = st.oxygen - ox0;
  P('断循环：20 轮净氧 = ' + net + '（一轮 ' + (net / 20) + '）');
  eq(net, -100, '20 轮「洗碗×3 → 买 → 吃」净氧 = −100');
  ok(net <= 0, '循环净收益 ≤ 0（刷不出来）');
  const price = D.nodes['1'].shop.price;
  const eatCh = D.nodes['1'].c.find(ch => ch.hint === 'exact');
  const washCh = D.nodes['1'].c.find(ch => (ch.l || '').indexOf('洗碗') >= 0);
  eq(eatCh.fx.oxygen / price, 2, '结构：料理 ' + eatCh.fx.oxygen + '/' + price + ' = 2.0 氧每星币');
  eq(-washCh.fx.oxygen / washCh.fx.coins, 2.5, '结构：劳动 ' + (-washCh.fx.oxygen) + '/' + washCh.fx.coins + ' = 2.5 氧每星币');
  ok(eatCh.fx.oxygen / price < -washCh.fx.oxygen / washCh.fx.coins, '结构断言 2.0 < 2.5 ⇒ 循环必亏');
  const lbCh = D.nodes['7'].c.find(ch => (ch.l || '').indexOf('打下手') >= 0);
  eq(-lbCh.fx.oxygen / lbCh.fx.coins, 2.5, '老布打下手同汇率（+2 星币 ∕ −5 氧）');
  const eat = [], badPos = [];
  Object.entries(D.nodes).forEach(([id, n]) => {
    (n.c || []).forEach(ch => {
      const v = (ch.fx && ch.fx.oxygen) || 0;
      if (v > 0) {
        eat.push(id);
        if (((ch.fx || {}).lose || []).indexOf('合成料理') < 0) badPos.push(id + '：' + ch.l);
      }
    });
    const e = (n.en && n.en.oxygen) || 0;
    if (e > 0 && !n.en.once) badPos.push(id + '：en 回氧不是一次性');
  });
  eq(eat.join(','), '1,20', '回氧选项只有 1④ 与 20 号吃料理两处（都消耗料理）');
  eq(badPos.join('|'), '', '没有其它「可重复且回氧」的入口');
}

/* --- 14-2 预算：消耗 95 ｜ 可得 普通 180 / 困难 100 ｜ 结余 47.2% / 5.00% --- */
{
  P('预算：消耗 ' + BUDGET.COSTS + ' ｜ 可得 普通 ' + BUDGET.NORMAL + ' / 困难 ' + BUDGET.HARD +
    ' ｜ 结余 普通 ' + (BUDGET.marginN * 100).toFixed(1) + '% / 困难 ' + (BUDGET.marginH * 100).toFixed(2) + '%');
  eq(BUDGET.COSTS, 95, '主线消耗合计 95');
  eq(BUDGET.NORMAL, 180, '普通可得 180（100 + 30 + 50）');
  eq(BUDGET.HARD, 100, '困难可得 100（30 + 30 + 40）');
  eq((BUDGET.marginN * 100).toFixed(1), '47.2', '普通结余 47.2%');
  eq((BUDGET.marginH * 100).toFixed(2), '5.00', '困难结余 5.00%');
  ok(BUDGET.deck['顶层'] > 0 && BUDGET.deck['中层'] > 0 && BUDGET.deck['底层'] > 0 && BUDGET.deck['站外'] > 0,
    '四个区段每段都有支出（顶层 25 / 中层 10 / 底层 40 / 站外 20）');
}

/* --- 14-3 主线跑通（简单 + 困难）+ 困难「保险柜短线」反例 --- */
{
  const n = runMainRoute('normal');
  eq(n.meals, 4, '简单：开局 20 星币买得起 4 盒料理');
  eq(n.T['结局 A'].loc, '41', '简单：主线跑通到结局 A');
  ok(!st.bankrupt, '简单：全程不触失败');
  eq(n.T['结局 A'].ox, 85, '简单：结束氧气 85（结余 47.2%）');
  const h = runMainRoute('hard');
  eq(h.meals, 3, '困难：开局 15 星币买得起 3 盒料理');
  eq(h.T['结局 A'].loc, '41', '困难：主线跑通到结局 A');
  ok(!st.bankrupt, '困难：全程不触失败');
  eq(h.T['结局 A'].ox, 5, '困难：结束氧气 5（结余 5.00%）');
  P('主线跑通：简单 85 → 41 ｜ 困难 5 → 41（均不触失败）');
}
/* 反例：困难走「保险柜短线」（跳过医务室、改走 9 号开柜）→ 进 12 号就触底 */
function cabinetShortcut(withMedical) {
  st = C.newState('hard');
  const price = D.nodes['1'].shop.price;
  C.go(st, '1');
  for (let i = 0; i < 3; i++) { C.buy(st, '合成料理', price); goPick('1', '吃一盒合成料理'); }
  goPick('1', '摸黑去中央大厅'); goPick('18', '摸回去');
  goPick('2', '回中央大厅'); goPick('18', '去健身房'); goPick('4', '回中央大厅');
  if (withMedical) { goPick('18', '去医务室'); goPick('3', '回中央大厅'); }
  goPick('18', '去观景厅'); goPick('5', '凑过去');
  goPick('5', '看银河'); goPick('28', '用站猫罐头'); goPick('5', '回中央大厅');
  goPick('18', '乘电梯去中层'); goPick('20', '吃一盒合成料理');
  goPick('20', '拐两个弯'); goPick('6', '问它'); goPick('23', '回中层大厅');   // 拿保险柜密码
  goPick('20', '乘电梯去底层'); goPick('21', '去维修区');
  goPick('16', '零件堆'); goPick('16', '钻进'); goPick('7', '打开工具柜');
  goPick('30', '把芯片收好'); goPick('21', '去冷却塔'); goPick('13', '用万能扳手拧上总阀');
  goPick('21', '乘电梯去中层'); goPick('20', '去气闸舱'); goPick('11', '打开安保柜'); goPick('11', '穿上磁力靴，出舱');
  goPick('19', '用工具把面板焊好'); goPick('39', '爬回气闸舱');
  goPick('11', '回中层大厅'); goPick('20', '乘电梯去底层');
  goPick('21', '去太阳能控制室'); goPick('15', '双手推上主供电闸门'); goPick('36', '回底层大厅');
  goPick('21', '乘电梯去中层'); goPick('20', '去站长室');     // 保险柜线（多一笔 −5）
  goPick('9', '转动密码盘'); goPick('45', '把东西收好');
  goPick('20', '乘电梯去底层');
  const oxBefore = st.oxygen;
  goPick('21', '去反应堆舱', true);                            // 允许触底（反例）
  return { oxBefore, loc: st.loc, bankrupt: st.bankrupt, zeroRes: st.zeroRes, oxygen: st.oxygen };
}
{
  const noMed = cabinetShortcut(false);
  ok(noMed.bankrupt && noMed.zeroRes === 'oxygen' && noMed.loc === '44',
    '困难·保险柜短线（不带医务室）：进 12 号前 ' + noMed.oxBefore + ' 氧 → 12 号 −10 → 触底失败' +
    '（对照推荐线 = 少医务室 +5、多开柜 −5）');
  eq(noMed.oxBefore, 5, '困难·保险柜短线：开柜后进 12 号前恰好 5 氧');
  const withMed = cabinetShortcut(true);
  ok(withMed.bankrupt && withMed.zeroRes === 'oxygen' && withMed.loc === '44',
    '困难·保险柜短线（补上医务室）：恰好归 0，仍然失败（氧 ≤ 0 即失败）');
  eq(withMed.oxBefore, 10, '补上医务室后进 12 号前 10 氧（10 − 10 = 0）');
  P('反例：困难保险柜短线两条 → 均在 12 号入口触底（' + noMed.oxygen + ' / ' + withMed.oxygen + ' 氧）');
}

/* --- 14-4 结局 C 前置：未满足即锁死 --- */
{
  const c17 = D.nodes['17'].c.find(ch => (ch.l || '').indexOf('按下发射钮') >= 0);
  const c40 = D.nodes['40'].c.find(ch => (ch.l || '').indexOf('放下反应堆') >= 0);
  ok(!!c17 && !!c40, '17 / 40 的撤离入口都在（R08）');
  let s = C.newState('normal');
  ok(!C.condOk(s, c17.cond) && !C.condOk(s, c40.cond), '未检查 + 未广播 → 两个入口都锁死');
  s.learned['逃生舱检查过'] = true;
  ok(!C.condOk(s, c17.cond) && !C.condOk(s, c40.cond), '只检查过（缺广播）→ 仍锁死');
  s.learned['已广播集合'] = true;
  ok(C.condOk(s, c17.cond) && C.condOk(s, c40.cond), '检查过 + 已广播 → 两个入口都解锁');
  ok(!!c17.lockText && c17.lockText.indexOf('全员撤离') >= 0 && !/\d/.test(c17.lockText), '灰显理由为模糊文案（无数字）');
  ok(C.sceneOfNode('8') !== C.sceneOfNode('17'), '前置分布在两个场景（8 号 / 17 号）→ 不再同屋自解锁');
  eq(JSON.stringify(c17.cond), JSON.stringify(c40.cond), '17/40 前置完全一致（检查过 + 已广播）');
  /* 满足后可达 43 */
  s = C.newState('normal'); s.loc = '17';
  s.learned['逃生舱检查过'] = true; s.learned['已广播集合'] = true;
  eq(C.choose(s, D.nodes['17'].c.indexOf(c17)).to, '43', '17 号「按下发射钮」→ 43');
  s = C.newState('normal'); s.loc = '40';
  s.learned['逃生舱检查过'] = true; s.learned['已广播集合'] = true;
  eq(C.choose(s, D.nodes['40'].c.indexOf(c40)).to, '43', '40 号「放下反应堆」→ 43');
  /* 广播选项真实可得（8 号） */
  s = C.newState('normal');
  C.go(s, '8');
  const bc = D.nodes['8'].c.find(ch => (ch.l || '').indexOf('广播') >= 0);
  ok(!!bc, '8 号有广播选项（C 前置之一在这里拿）');
  const rB = C.choose(s, D.nodes['8'].c.indexOf(bc));
  ok(s.learned['已广播集合'] && !!rB.say, '广播一次 → 记住「已广播集合」+ 有旁白反馈');
}

/* --- 14-5 资源不为负 --- */
{
  let s = C.newState('normal');
  C.applyRes(s, 'oxygen', -999);
  eq(s.oxygen, 0, '氧气钳在 0（不会变负）');
  s = C.newState('normal');
  C.applyRes(s, 'coins', -999);
  eq(s.coins, 0, '星币钳在 0（不会变负）');
  ok(!s.bankrupt, '星币归零不判失败');
  s = C.newState('normal'); s.coins = 5;
  C.buy(s, '合成料理', 5);
  eq(s.coins, 0, '购买允许花到 0');
  ok(!s.bankrupt, '花光不判失败');
  P('资源不为负：氧气 / 星币全程钳 ≥ 0；购买可到 0');
}

/* --- 14-6 钱不判失败 --- */
{
  eq(coins.fail, null, 'coins.fail === null');
  eq(coins.noSpendToZero, undefined, 'noSpendToZero 已移除');
  ok(D.resources.every(r => !r.fail || r.fail.node !== '45'), '没有任何资源把 45 当失败结算点');
  ok(!!D.nodes['45'] && !D.nodes['45'].fail, '45 号不再是失败节点（是保险柜事件）');
  const s = C.newState('normal');
  C.go(s, '1');
  C.applyRes(s, 'coins', -99);
  ok(s.coins === 0 && !s.bankrupt && s.zeroRes === null && s.loc === '1',
    '星币归零：不设 bankrupt、不进 45、位置不动');
  eq(C.payReason(s, 5), '星币不够（需要 5 枚）', '没钱买不了（理由清晰）');
  P('钱不判失败：coins.fail === null；归零不结算、不进 45');
}

/* --- 14-7 改名扫描（产品面） --- */
{
  const hits = [], zjHits = [];
  (function walk(v, ptr) {
    if (typeof v === 'string') {
      if (v.indexOf('信用点') >= 0) hits.push(ptr);
      if (v.indexOf('中继站') >= 0) zjHits.push(ptr);
      return;
    }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, ptr + '[' + i + ']')); return; }
    if (v && typeof v === 'object') { Object.keys(v).forEach(k => walk(v[k], ptr + '.' + k)); }
  })(D, 'station');
  eq(hits.join(','), '', 'station 数据与帮助：无「信用点」（R02）');
  eq(zjHits.join(','), '', 'station 数据：无「中继站」（R13：玩家可见文案一律「晨星号」）');
  const uiFiles = ['index.html', 'engine.js', 'lab.js'];
  const uiBad = uiFiles.filter(f => {
    const p = path.join(dir, f);
    return fs.existsSync(p) && fs.readFileSync(p, 'utf8').indexOf('信用点') >= 0;
  });
  eq(uiBad.join(','), '', '游戏 / 管理台界面文案：无「信用点」（' + uiFiles.join(' / ') + '）');
  /* 导出文案稿（docs/station-copy-v1.md，工具产物）也属产品面（设计档 §8.7-7） */
  const copyPath = path.join(dir, '..', 'docs', 'station-copy-v1.md');
  const copyTxt = fs.existsSync(copyPath) ? fs.readFileSync(copyPath, 'utf8') : null;
  ok(copyTxt !== null, '导出文案稿存在：docs/station-copy-v1.md');
  eq(copyTxt === null ? '缺失' : (copyTxt.indexOf('信用点') >= 0 ? '有信用点残留' : ''), '', '导出文案稿：无「信用点」（R02 产品面）');
  ok(!(copyTxt && copyTxt.indexOf('中继站') >= 0), '导出文案稿：无「中继站」（R13 产品面）');
  P('改名扫描面：station 数据+帮助（深走全部字符串）＋ ' + uiFiles.join(' / ') + ' ＋ 导出文案稿；' +
    '根 README 对外句由收口步骤随其他分片同步（未纳入断言，避免跨分片误红）');
}

/* --- 14-8 提示分级 lint --- */
{
  const HINTS = ['vague', 'exact', 'none'];
  const badHint = [], numLabels = [], wuliLabels = [], badLock = [], exactList = [], strayValues = [];
  Object.entries(D.nodes).forEach(([id, n]) => {
    (n.c || []).forEach(ch => {
      const h = C.choiceHint(ch);
      if (HINTS.indexOf(h) < 0) badHint.push(id + '：' + h);
      const L = ch.l || '';
      if (ch.hint === 'exact') exactList.push(id + '：' + L);
      else if (/[+＋−-]\s*\d+\s*(氧|星币)/.test(L)) numLabels.push(id + '：' + L);
      else if (/\d\s*(氧|星币)|(氧|星币)\s*\d/.test(L)) strayValues.push(id + '：' + L);
      if (/武力\s*\d/.test(L)) wuliLabels.push(id + '：' + L);
      if (ch.lockText && /\d/.test(ch.lockText)) badLock.push(id + '：' + ch.lockText);
    });
  });
  eq(badHint.join('|'), '', '全部选项 hint ∈ {vague, exact, none}（缺省 vague）');
  eq(wuliLabels.join('|'), '', '选项文案不含「（武力 N）」（战斗对照只由引擎渲染）');
  eq(badLock.join('|'), '', 'lockText 不含数字');
  eq(numLabels.join('|'), '', '白名单外的选项文案不含 [±−]N 氧 / 星币');
  eq(strayValues.join('|'), '', '白名单外的选项文案不把「数字 + 资源名」写在一起（不剧透数值）');
  eq(exactList.length, 2, 'exact（精确）恰为 2 处：1④ 与 20 号吃料理');
  ok(exactList.every(x => x.indexOf('（+10 氧气）') >= 0), '两处 exact 都是「（+10 氧气）」（白名单②·已知道具）');
  P('提示分级：exact ' + exactList.join(' ｜ '));
}

/* --- 14-9 文本道具（≥4 件、可读、只读） --- */
{
  const textItems = D.itemOrder.filter(it => D.items[it].text);
  ok(textItems.length >= 4, '带 text 的文本道具 ≥ 4 件（' + textItems.length + ' 件：' + textItems.join(' / ') + '）');
  ['桑尼的账本', '监控回放', '反应堆安全规程', '站长的便条'].forEach(it =>
    ok(!!D.items[it] && typeof D.items[it].text === 'string' && D.items[it].text.length > 10, '文本道具正文在：' + it));
  textItems.forEach(it => ok(gainSources(it).length > 0, '文本道具可获得：' + it + '（' + gainSources(it).join('/') + '）'));
  const s = C.newState('normal');
  C.go(s, '1');
  const before = JSON.stringify(s);
  textItems.forEach(it => ok(typeof C.itemText(it) === 'string' && C.itemText(it).length > 10, 'C.itemText 可读：' + it));
  eq(JSON.stringify(s), before, '读正文不改任何状态（只读）');
  ok(C.itemText('手电') === null, '没有正文的道具 → null（界面显示「没什么可读的」）');
  ok(D.items['站长的便条'].text.indexOf('{me}') >= 0, '站长的便条正文含 {me}（渲染时替换玩家名）');
  P('文本道具：' + textItems.join(' / '));
}

/* --- 14-10 R10~R16 落点 --- */
{
  /* R10：45 号保险柜事件 */
  ok(typeof D.nodes['45'].t === 'string' && D.nodes['45'].t.length > 10, 'R10：45 号有正文（保险柜反馈）');
  ok(!D.nodes['45'].fail && !D.nodes['45'].win, 'R10：45 号是事件节点（非失败 / 结局）');
  const c9 = D.nodes['9'].c.find(ch => ch.once === '开过保险柜');
  ok(!!c9 && c9.to === '45', 'R10：9 号①开柜 → 45（once: 开过保险柜）');
  /* R11/R14：tIf 六处（cond 与设计一致；条件满足后正文不同） */
  const TIF = {
    '5':  { chDone: '跟胖胖打过招呼' },
    '7':  { pinsAll: ['38'] },
    '9':  { chDone: '开过保险柜' },
    '11': { chDone: '取了磁力靴' },
    '15': { knows: '太阳能板已修好' },
    '19': { knows: '太阳能板已修好' }
  };
  Object.keys(TIF).forEach(id => {
    const node = D.nodes[id];
    ok(Array.isArray(node.tIf) && node.tIf.length >= 1, id + ' 号有 tIf（正文分叉）');
    eq(JSON.stringify(node.tIf[0].cond), JSON.stringify(TIF[id]), id + ' 号 tIf cond 与设计一致');
    const s = C.newState('normal');
    const t0 = C.nodeText(s, node);
    applyCond(s, TIF[id]);
    ok(C.condOk(s, TIF[id]), id + ' 号 tIf 条件可满足');
    const t1 = C.nodeText(s, node);
    ok(t0 !== t1 && !!t1, id + ' 号：条件满足后正文不同（二次进入文本变化）');
  });
  /* R14：11 号取靴＝显式命名 once 选项（首访场景正文；取后再进分叉——防「首访即命中」回归） */
  {
    const n11 = D.nodes['11'];
    const i11 = n11.c.findIndex(ch => ch.once === '取了磁力靴');
    ok(i11 >= 0 && (n11.c[i11].fx.gain || []).indexOf('磁力靴') >= 0, 'R14：11 号取柜选项发放磁力靴（once: 取了磁力靴）');
    ok(!n11.en, 'R14：11 号不再由进入效果自动发靴（首访不命中分叉的前提）');
    const s11 = C.newState('normal');
    C.go(s11, '11');
    eq(C.nodeText(s11, n11), n11.t, 'R14：11 号首访显示场景正文（未拿不分叉）');
    C.choose(s11, i11); C.go(s11, '11');
    eq(C.nodeText(s11, n11), n11.tIf[0].t, 'R14：11 号取靴后再进显示分叉文案');
    eq(s11.chDone['取了磁力靴'], true, 'R14：11 号取靴标记已记入 chDone（随存档）');
  }
  ok(!D.nodes['5'].en, 'R11：5 号的一次性获得已移出 en（不再每次进入都写）');
  ok(!D.nodes['7'].c.some(ch => ch.lock) || D.nodes['7'].c.every(ch => !ch.lock || !!ch.lockText),
    'R14：7 号带锁选项都有灰显理由（lockText）');
  /* R12：冷却塔硬穿有收获 */
  const c13 = D.nodes['13'].c.find(ch => (ch.l || '').indexOf('冲过蒸汽') >= 0);
  ok(!!c13 && (c13.fx.gain || []).indexOf('冷却剂罐') >= 0, 'R12：硬穿蒸汽也有收获（冷却剂）');
  /* R15：14 号绕行有 say 下文与明确去向 */
  const c14 = D.nodes['14'].c.find(ch => (ch.l || '').indexOf('扳手') >= 0);
  ok(!!c14 && !!c14.say && c14.say.length > 10 && c14.to === '21', 'R15：14 号断电绕行有反馈与去向');
  /* R16：3 号对话 / 17 号拆柜 / 28 号文案 */
  const c3 = D.nodes['3'].c.find(ch => (ch.l || '').indexOf('密码') >= 0);
  ok(!!c3 && !!c3.say && c3.say.length > 10, 'R16：3 号问密码有对话反馈（say）');
  ok(!!D.nodes['3'].c[1].fx && D.nodes['3'].c[1].fx.learn === '密码线索', 'R16/F1：3 号②留下「密码线索」面包屑（不再凭空给密码）');
  ok(D.nodes['17'].c[1].once === true && (D.nodes['17'].c[1].fx.gain || []).indexOf('绳索') >= 0,
    'R16：17 号②应急柜可拿（正文提到的绳索 / 应急盾真的可拿）');
  ok((D.nodes['17'].c[0].fx.gain || []).indexOf('绳索') < 0, 'R16：17 号①检查不再顺手给绳索 / 盾（分到应急柜选项）');
  ok((D.nodes['28'].c[1].l || '').indexOf('记在心里') >= 0, 'R16：28 号②文案已改（不指路）');
  /* 39 / 35 / 38 / 5 进入即有可见反馈 */
  ok(C.go(C.newState('normal'), '39').length > 0, '39 号进入有反馈（焊接 −5 氧 + 线索）');
  ok(C.go(C.newState('normal'), '35').length > 0, '35 号进入有反馈（获得 监控回放 + 密码）');
  ok(C.go(C.newState('normal'), '38').length > 0, '38 号进入有反馈（获得 控制芯片）');
  {
    const s = C.newState('normal');
    C.go(s, '5');
    const i5 = D.nodes['5'].c.findIndex(ch => ch.once === '跟胖胖打过招呼');
    const r5 = C.choose(s, i5);
    ok(r5.log.length > 0 && !!r5.say, '5 号①打招呼：有获得日志 + 旁白（反馈可见）');
  }
  P('R10~R16 落点：45 保险柜 / 6 处 tIf / 13 硬穿收获 / 14 绕行 say / 17 拆柜 / 28 文案 逐条通过');
}

/* ============ 汇总 ============ */
console.log('');
console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项。');
process.exit(fail ? 1 : 0);
