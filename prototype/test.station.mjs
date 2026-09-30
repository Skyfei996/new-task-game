// 原创关卡《空间站大停摆》自测：node prototype/test.station.mjs
// 覆盖：多关卡加载与旧存档兼容 / 关卡数据完整性（45 点·20 道具·8 乘员·4 场景坐标与素材尺寸）
//       / 通关 A 路线完整模拟 / 三件重启物每条路径 / 氧气预算验算 / 双资源失败 / 卡死保险 / DOM id 自检
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

eq(D.resources.length, 2, '两种资源（信用点 + 氧气）');
const coins = D.resources.find(r => r.id === 'coins');
const oxygen = D.resources.find(r => r.id === 'oxygen');
ok(!!coins && !!oxygen, '资源表里有 coins 与 oxygen 两条');
eq(coins.name, '信用点', '信用点的名字');
eq(coins.icon, '🪙', '信用点的图标');
eq(coins.start.normal, 20, '信用点普通开局 20');
eq(coins.start.hard, 15, '信用点困难开局 15');
eq(coins.noSpendToZero, true, '信用点是 noSpendToZero（购买不许花光）');
eq(coins.fail.node, '45', '信用点归零 → 45 号失败结算');
ok(coins.fail.text.indexOf('账户冻结') >= 0, '信用点失败文案（设计档原文）');
eq(oxygen.name, '氧气', '氧气的名字');
eq(oxygen.icon, '💨', '氧气的图标');
eq(oxygen.start.normal, 100, '氧气普通开局 100');
eq(oxygen.start.hard, 80, '氧气困难开局 80');
eq(oxygen.fail.node, '44', '氧气归零 → 44 号失败结算');
ok(oxygen.fail.text.indexOf('眼前一黑') >= 0, '氧气失败文案（设计档原文）');
/* 资源 id 不能和状态字段撞名（资源直接住在 state 的同名字段上） */
['diff', 'me', 'items', 'visited', 'done', 'learned', 'wristband', 'hist', 'loc',
 'bankrupt', 'zeroRes', 'scene', 'flash'].forEach(k =>
  ok(!D.resources.some(r => r.id === k), '资源 id 不与状态字段撞名：' + k));
/* 开局数值走资源表 */
const stN = C.newState('normal'), stH = C.newState('hard');
eq(stN.coins, 20, '普通开局信用点 20');
eq(stN.oxygen, 100, '普通开局氧气 100');
eq(stH.coins, 15, '困难开局信用点 15');
eq(stH.oxygen, 80, '困难开局氧气 80');
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

/* ============ 3. 道具（20 件 + 红框 + 武力） ============ */
const NEED_ITEMS = ['手电', '工牌', '氧气瓶', '万能扳手', '磁力靴', '焊接枪', '电击棒', '机械手套', '应急盾',
  '控制芯片', '冷却剂罐', '站长授权卡', '备用电池', '医疗包', '绳索', '站猫罐头', '合成料理', '桑尼的账本',
  '逃生舱钥匙', '星尘矿石'];
eq(Object.keys(D.items).length, 20, '道具表 20 件');
eq(D.itemOrder.length, 20, 'itemOrder 列出 20 件');
eq(new Set(D.itemOrder).size, 20, 'itemOrder 无重复');
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
  const targets = [];
  (node.c || []).forEach((ch, i) => {
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
        if (['item', 'noItem', 'knows', 'noKnows', 'anyItem', 'notPinsAll', 'pinsAll', 'notPins', 'all', 'any'].indexOf(k) >= 0) return;
        ok(RES_IDS.indexOf(k) >= 0, `节点 ${id} 选项#${i} cond 的资源键「${k}」已在 resources 表`);
      });
    })(ch.cond);
  });
  ['gain', 'lose'].forEach(k => (node.en && node.en[k] || []).forEach(it => ok(!!D.items[it], `节点 ${id} en.${k}「${it}」`)));
  Object.keys((node.en) || {}).forEach(k => {
    if (['once', 'ifNoItem', 'gain', 'lose', 'learn', 'thief', 'thiefRes', 'testItems', 'testCoins', 'pass'].indexOf(k) >= 0) return;
    ok(RES_IDS.indexOf(k) >= 0, `节点 ${id} en 的资源键「${k}」已在 resources 表`);
  });
  (node.shop ? node.shop.stock : []).forEach(it => ok(!!D.items[it], `节点 ${id} 商店货架「${it}」`));
  targets.forEach(t => ok(!!D.nodes[t], `节点 ${id} 的目标「${t}」存在`));
});
/* 45 点覆盖：1~43 = 节点（地点 21 + 事件 19 + 结局 3），44/45 = 资源归零的失败结算点 */
const missing = [];
for (let i = 1; i <= 43; i++) if (!D.nodes[String(i)]) missing.push(i);
eq(missing.join(','), '', '1~43 号节点全部存在');
ok(['44', '45'].every(id => D.nodes[id] && D.nodes[id].fail), '44/45 号失败结算点存在且是失败节点');
eq(RES_IDS.length, 2, '两种资源各指向一个失败结算点');
eq(D.resources.map(r => r.fail.node).sort().join(','), '44,45', '资源 fail.node 覆盖 44 与 45');
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
/* 氧气数值（设计档 §4） */
eq(D.nodes['12'].en.oxygen, -10, '12 号反应堆舱：每次进入 −10 氧');
eq(D.nodes['13'].en.oxygen, -5, '13 号冷却塔：每次进入 −5 氧');
eq(D.nodes['19'].en.oxygen, -15, '19 号舱外：每次进入 −15 氧');
eq(D.nodes['2'].en.oxygen, 30, '睡眠舱氧气瓶 +30 氧（一次性）');
eq(D.nodes['3'].en.oxygen, 20, '医务室氧气站 +20 氧（一次性）');
eq(D.nodes['20'].en.oxygen, 15, '中层大厅补给柜 +15 氧（一次性）');
eq(D.nodes['2'].en.once, true, '睡眠舱补给只给一次');
eq(D.nodes['3'].en.once, true, '医务室补给只给一次');
eq(D.nodes['20'].en.once, true, '大厅补给只给一次');
eq(D.nodes['12'].en.once, undefined, '反应堆舱每次进入都要耗氧（不是一次性）');
eq(D.nodes['19'].en.once, undefined, '舱外每次进入都要耗氧（不是一次性）');
{
  const battleCh = D.nodes['16'].c.find(ch => ch.battle);
  ok(!!battleCh && battleCh.fx && battleCh.fx.oxygen === -5, '16 号失控机器人战 −5 氧（战斗选项的代价）');
  const crawlCh = D.nodes['16'].c.find(ch => (ch.l || '').indexOf('爬道') >= 0);
  ok(!!crawlCh && crawlCh.fx && crawlCh.fx.oxygen === -10, '16 号钻维修爬道 −10 氧');
  ok(crawlCh.cond.any && crawlCh.cond.any.length === 2, '爬道需要「糖糖是帮手」或「万能扳手」（任一）');
}

/* ============ 6. 通关 A 路线完整模拟 ============ */
let st = C.newState('normal');
/* 选项定位：按文案片段找下标，条件不满足直接抛错（测试脚本自身的护栏） */
function goPick(id, part) {
  const node = D.nodes[id];
  const idx = node.c.findIndex(ch => (ch.l || '').indexOf(part) >= 0);
  if (idx < 0) throw new Error('找不到选项：' + id + ' / ' + part);
  if (!C.condOk(st, node.c[idx].cond)) throw new Error('选项条件不满足：' + id + ' / ' + part);
  const res = C.choose(st, idx);
  if (res.back) C.goBack(st); else if (res.to) C.go(st, res.to);
  return res;
}
C.go(st, '1');
eq(st.loc, '1', '开局在食堂（1 号）');
goPick('1', '摸黑去中央大厅'); eq(st.loc, '18', '1→18（顶层中央大厅）');
goPick('18', '去睡眠舱'); eq(st.loc, '2', '18→2（睡眠舱）');
ok(C.hasItem(st, '手电') && C.hasItem(st, '工牌') && C.hasItem(st, '氧气瓶'), '睡眠舱拿到 手电 / 工牌 / 氧气瓶');
eq(st.oxygen, 130, '氧气瓶 +30（100→130）');
goPick('2', '回中央大厅'); goPick('18', '去健身房'); eq(st.loc, '4', '18→4（健身房）');
ok(C.hasItem(st, '医疗包'), '健身房拿到医疗包');
goPick('4', '回中央大厅'); goPick('18', '去观景厅'); eq(st.loc, '5', '18→5（观景厅）');
ok(C.hasItem(st, '站猫罐头') && C.hasItem(st, '合成料理'), '观景厅拿到 站猫罐头 + 合成料理');
goPick('5', '看银河往哪个方向跑'); eq(st.loc, '28', '5→28（货单疑点）');
goPick('28', '用站猫罐头跟它换'); eq(st.loc, '5', '换到账本后返回上一地点（5）');
ok(C.hasItem(st, '桑尼的账本'), '拿到桑尼的账本（证据①）');
ok(!C.hasItem(st, '站猫罐头'), '站猫罐头被银河收下');
ok(st.learned['走私暗号'], '记住走私暗号');
goPick('5', '回中央大厅'); goPick('18', '去医务室'); eq(st.loc, '3', '18→3（医务室）');
eq(st.oxygen, 150, '医务室氧气站 +20（130→150）');
goPick('3', '把医疗包交给阿雅'); eq(st.loc, '24', '3→24（阿雅的委托）');
ok(C.hasItem(st, '站长授权卡'), '拿到站长授权卡（路径①：阿雅）');
goPick('24', '回中央大厅'); eq(st.loc, '18', '24→18');
goPick('18', '乘电梯去中层'); eq(st.loc, '20', '18→20（中层中央大厅）');
eq(st.oxygen, 165, '中层大厅补给柜 +15（150→165）');
goPick('20', '去实验室'); eq(st.loc, '7', '20→7（实验室）');
goPick('7', '帮他去找工具箱'); eq(st.loc, '25', '7→25（老布的委托）');
ok(st.learned['老布的委托'], '记住老布的委托');
goPick('25', '这就下维修区'); eq(st.loc, '16', '25→16（维修区）');
goPick('16', '打着手电翻零件堆'); eq(st.loc, '16', '翻零件（原地，不换节点）');
ok(C.hasItem(st, '万能扳手') && C.hasItem(st, '焊接枪'), '维修区翻出 万能扳手 + 焊接枪');
goPick('16', '拖出老布的工具箱'); eq(st.loc, '38', '16→38（老布的工具箱）');
ok(C.hasItem(st, '控制芯片'), '拿到控制芯片（路径①：工具箱）');
goPick('38', '回底层大厅'); eq(st.loc, '21', '38→21');
goPick('21', '乘电梯回顶层'); eq(st.loc, '18', '21→18');
goPick('18', '去健身房'); goPick('4', '请他帮忙打开仓库'); eq(st.loc, '27', '4→27（铁头开门）');
ok(st.learned['铁头已开门'], '铁头帮忙开门（仓库/站长室门禁解除）');
ok(C.hasItem(st, '机械手套'), '铁头给了机械手套');
goPick('27', '谢谢！回顶层大厅'); eq(st.loc, '18', '27→18');
goPick('18', '乘电梯去中层'); goPick('20', '去仓库'); eq(st.loc, '10', '20→10（仓库）');
goPick('10', '把账本拍在他面前'); eq(st.loc, '32', '10→32（账本把柄）');
ok(C.hasItem(st, '冷却剂罐'), '拿到冷却剂罐（路径②：账本把柄）');
ok(C.hasItem(st, '星尘矿石'), '拿到星尘矿石（红框·证据）');
goPick('32', '抱着冷却剂罐离开'); eq(st.loc, '20', '32→20');
goPick('20', '去气闸舱'); eq(st.loc, '11', '20→11（气闸舱）');
ok(C.hasItem(st, '磁力靴') && C.hasItem(st, '电击棒'), '气闸舱拿到 磁力靴 + 电击棒');
const oxBeforeEva = st.oxygen;
goPick('11', '穿上磁力靴，出舱'); eq(st.loc, '19', '11→19（舱外）');
eq(st.oxygen, oxBeforeEva - 15, '出舱 −15 氧');
goPick('19', '用工具把面板焊好'); eq(st.loc, '39', '19→39（修好太阳能板）');
ok(st.learned['太阳能板已修好'], '太阳能板已修好（电力前置的第一半）');
goPick('39', '爬回气闸舱'); eq(st.loc, '11', '39→11');
goPick('11', '回中层大厅'); goPick('20', '乘电梯去底层'); eq(st.loc, '21', '20→21');
goPick('21', '去太阳能控制室'); eq(st.loc, '15', '21→15（太阳能控制室）');
goPick('15', '合上主供电闸门'); eq(st.loc, '36', '15→36（合闸）');
ok(st.learned['全站复电'], '全站复电（电力前置的第二半）');
goPick('36', '回底层大厅'); eq(st.loc, '21', '36→21');
const oxBeforeReactor = st.oxygen;
goPick('21', '去反应堆舱'); eq(st.loc, '12', '21→12（反应堆舱）');
eq(st.oxygen, oxBeforeReactor - 10, '进反应堆舱 −10 氧');
goPick('12', '装上三件东西，启动反应堆'); eq(st.loc, '34', '三件齐 + 全站复电 → 反应堆重启（34）');
goPick('34', '追！去应急逃生舱口'); eq(st.loc, '40', '34→40（对峙）');
ok(C.condOk(st, D.nodes['40'].c.find(ch => (ch.l || '').indexOf('揭发') >= 0).cond), '有账本 → 「揭发」可用');
goPick('40', '揭发他'); eq(st.loc, '41', '40→41（结局 A）');
ok(!!D.nodes['41'].win, '到达结局 A·圆满');
eq(st.oxygen, 140, 'A 路线结束时氧气 140（100 + 65 补给 − 25 消耗）');
ok(st.coins === 20 && !st.bankrupt, 'A 路线不需要花信用点（结束时 ' + st.coins + ' 枚，未失败）');

/* ============ 7. 三件重启物的每条路径 ============ */
/* 芯片·路径②：糖糖带路 → 维修爬道 → 实验室自己拆 */
st = C.newState('normal');
C.go(st, '6');
goPick('6', '问它'); eq(st.loc, '23', '6→23（糖糖登场）');
ok(st.learned['糖糖是帮手'] && st.learned['保险柜密码'], '糖糖是帮手 + 知道保险柜密码');
goPick('23', '去实验室'); eq(st.loc, '7', '23→7');
C.go(st, '16'); eq(st.loc, '16', '走到维修区');
const oxCrawl = st.oxygen;
goPick('16', '钻维修爬道'); eq(st.loc, '7', '16→7（爬道）');
eq(st.oxygen, oxCrawl - 10, '钻爬道 −10 氧');
ok(st.learned['维修爬道路线'], '记住维修爬道路线');
goPick('7', '自己拆一颗控制芯片'); eq(st.loc, '30', '7→30（自己拆芯片）');
ok(C.hasItem(st, '控制芯片'), '拿到控制芯片（路径②：自己拆，无需老布）');

/* 冷却剂·路径①：铁头掰手腕 → 铁头开门 → 仓库硬拿（并挨无人机抢） */
st = C.newState('normal');
st.items = ['焊接枪'];             // 武力 1，够赢铁头（武力 1）
C.go(st, '4');
goPick('4', '掰手腕'); eq(st.loc, '26', '4→26（挑战铁头）');
goPick('26', '用力'); eq(st.loc, '27', '战斗胜利 → 27（铁头开门）');
ok(st.learned['铁头已开门'], '铁头开门');
C.go(st, '10');
goPick('10', '动手搬冷却剂罐'); eq(st.loc, '31', '10→31（硬拿冷却剂）');
ok(C.hasItem(st, '冷却剂罐'), '拿到冷却剂罐（路径①：硬拿）');
eq(st.coins, 12, '被桑尼的无人机抢走 8 枚信用点（20→12）');
const theft = C.takeFlash(st);
ok(theft && theft.kind === 'theft' && theft.thief === '桑尼的无人机' && theft.amount === 8,
  '给出「无人机抢信用点」提示事件（供警示条用）');
eq(C.takeFlash(st), null, '提示事件取走后不重复');

/* 冷却剂·路径③（备用）：冷却塔关阀 */
st = C.newState('normal');
st.items = ['万能扳手'];
C.go(st, '13');
eq(st.oxygen, 95, '冷却塔泄漏区每次进入 −5 氧');
goPick('13', '用万能扳手关掉总阀'); eq(st.loc, '21', '13→21');
ok(C.hasItem(st, '冷却剂罐'), '拿到冷却剂罐（路径③：冷却塔备件）');

/* 收贿赂（10 ③）：+10 信用点只发一次，线索断；再进反应堆舱 → 桑尼伏击（29 号失败结算） */
st = C.newState('normal');
C.go(st, '10');
goPick('10', '封口费'); eq(st.loc, '33', '10→33（收贿赂）');
eq(st.coins, 30, '封口费 +10（只发一次：20→30）');
ok(st.learned['收了桑尼的贿赂'], '线索断：记住「收了桑尼的贿赂」');
C.go(st, '12');
ok(C.condOk(st, D.nodes['12'].c[0].cond), '收贿后进反应堆舱：只剩「被桑尼伏击」这一条');
goPick('12', '舱门'); eq(st.loc, '29', '桑尼偷袭 → 29 号被制服（失败结算）');
ok(!!D.nodes['29'].fail, '29 号是失败结算点（可重开）');

/* 授权卡·路径②：糖糖给密码 → 站长室保险柜（需工牌或铁头） */
st = C.newState('normal');
C.go(st, '9');
{ const ch = D.nodes['9'].c.find(x => (x.l || '').indexOf('保险柜') >= 0);
  ok(!C.condOk(st, ch.cond), '站长室保险柜：没密码没工牌 → 打不开'); }
C.go(st, '6'); goPick('6', '问它');   // 拿到保险柜密码
ok(!C.condOk(st, D.nodes['9'].c[0].cond), '有密码但仍需 工牌 或 铁头开门');
st.items.push('工牌');
ok(C.condOk(st, D.nodes['9'].c[0].cond), '有密码 + 工牌 → 可以开保险柜');
C.go(st, '9');
goPick('9', '进站，用密码打开保险柜'); eq(st.loc, '20', '9→20（开柜后回中层大厅）');
ok(C.hasItem(st, '站长授权卡'), '拿到站长授权卡（路径②：保险柜备卡）');

/* ============ 8. 氧气预算验算 ============ */
{
  let supplies = 0, costs = 0;
  Object.entries(D.nodes).forEach(([id, n]) => {
    const e = (n.en && n.en.oxygen) || 0;
    if (e > 0) supplies += e; else costs += -e;
    (n.c || []).forEach(ch => {
      const v = (ch.fx && ch.fx.oxygen) || 0;
      if (v > 0) supplies += v; else costs += -v;
    });
  });
  ok(supplies >= 65, '数据里的氧气补给总量 ≥ 65（氧气瓶 30 + 氧气站 20 + 补给柜 15；实测 ' + supplies + '）');
  const MANDATORY = 15 + 10;   // 主线必经：出舱一次 −15 + 进反应堆舱一次 −10
  ok(MANDATORY <= 100 + 65, '主线必经消耗 25 ≤ 起始 100 + 全部补给 65（普通模式）');
  ok(MANDATORY <= 80 + 65, '主线必经消耗 25 ≤ 起始 80 + 全部补给 65（困难模式）');
  /* 最坏情况（走弯路）：多出一次舱 + 多进一次反应堆舱 + 硬穿冷却塔 + 爬道 = 70 */
  const WORST = 15 * 2 + 10 * 2 + 10 + 10;
  ok(WORST <= 100 + 65, '最坏绕路消耗 ' + WORST + ' ≤ 100 + 65（仍有余量）');
  /* 每段主线都有一处补给可达（数据层：补给点在 1~2 步之内） */
  const step = (a, b) => (D.nodes[a].c || []).some(ch => ch.to === b);
  ok(step('18', '3') && D.nodes['3'].en.oxygen === 20, '顶层段：大厅 ⇄ 医务室（+20 补给）相邻');
  ok(step('20', '21') && D.nodes['20'].en.oxygen === 15, '中层段：大厅自带补给柜（+15）');
  ok(step('19', '11') && step('11', '20'), '出舱段（−15）：19 → 11 → 20 两处可补给');
  ok(step('12', '21') && step('21', '20'), '反应堆段（−10）：12 → 21 → 20 可补给');
  ok(step('16', '21') && step('21', '20'), '维修区段（爬道 −10）：16 → 21 → 20 可补给');
  ok(step('13', '21') && step('21', '20'), '冷却塔段（−5）：13 → 21 → 20 可补给');
}

/* ============ 9. 双资源失败 ============ */
/* ① 氧气耗尽 → 44 号结算 */
st = C.newState('normal');
st.oxygen = 5;
C.go(st, '12');
eq(st.oxygen, 0, '氧气钳在 0（不会变负）');
eq(st.bankrupt, true, '氧气归零 → 判失败');
eq(st.zeroRes, 'oxygen', '失败结算归因到氧气');
eq(st.loc, '44', '自动走入 44 号失败结算点');
ok(D.nodes['44'].t.indexOf('眼前一黑') >= 0, '44 号正文 = 氧气失败文案');
eq(Object.keys(C.reachablePins(st)).length, 0, '失败结算后地图上没有任何可走的编号');
eq(C.choose(st, 0).to, undefined, '失败结算后不再接受选项');
/* ② 信用点见底 → 45 号结算 */
st = C.newState('normal');
st.items = ['焊接枪'];
st.learned['铁头已开门'] = true;
st.coins = 3;
C.go(st, '31');
eq(st.coins, 0, '信用点钳在 0（20 起步 → 被抢到 0）');
eq(st.bankrupt, true, '信用点归零 → 判失败');
eq(st.zeroRes, 'coins', '失败结算归因到信用点');
eq(st.loc, '45', '自动走入 45 号失败结算点');
ok(D.nodes['45'].t.indexOf('账户冻结') >= 0, '45 号正文 = 信用点失败文案');
/* ③ 购买守卫（noSpendToZero）：两种理由文案 */
eq(C.mainResId(), 'coins', '花钱扣的是「信用点」（noSpendToZero 的资源）');
st = C.newState('normal');
st.coins = 3;
eq(C.payReason(st, 3), '买完就剩 0 枚——寸步难行会闯关失败，不能买', '恰好花光的理由文案');
eq(C.payReason(st, 4), '信用点不够（需要 4 枚）', '钱不够的理由文案');
st = C.newState('normal');
st.coins = 4;
eq(C.payReason(st, 3), '', '留得下 1 枚 → 可以买');
let log = C.buy(st, '合成料理', 3);
ok(C.hasItem(st, '合成料理') && st.coins === 1, '买了一份合成料理，剩 1 枚（不会被买到 0）');
st = C.newState('normal');   // 干净的背包：再验一次「恰好花光被拒」
st.coins = 3;
log = C.buy(st, '合成料理', 3);
ok(!C.hasItem(st, '合成料理') && st.coins === 3, '恰好花光被拒绝，且不扣款');
ok(log.join('｜').indexOf('寸步难行') >= 0, '拒绝理由提到闯关失败：' + log.join('｜'));
/* ④ 自动贩卖机（食堂）也走同一条守卫 */
st = C.newState('normal');
st.coins = 3;
log = C.buy(st, '合成料理', D.nodes['1'].shop.price);
ok(!C.hasItem(st, '合成料理'), '食堂贩卖机：3 枚买 3 枚也被拒（要留 1 枚）');
st.coins = 4;
C.buy(st, '合成料理', D.nodes['1'].shop.price);
ok(C.hasItem(st, '合成料理') && st.coins === 1, '食堂贩卖机：4 枚买 3 枚 → 剩 1 枚');
/* ⑤ 两种资源互相独立 */
st = C.newState('normal');
st.oxygen = 1;
C.applyRes(st, 'oxygen', -1);
ok(st.bankrupt && st.zeroRes === 'oxygen' && st.coins === 20, '氧气归零不影响信用点数值，但本关结束');
st = C.newState('normal');
C.applyRes(st, 'coins', -20);
ok(st.bankrupt && st.zeroRes === 'coins' && st.oxygen === 100, '信用点归零时氧气还在，但本关结束');

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
ok(C.condOk(st, { coins: 20 }), '资源下限：信用点够 → true');
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
eq(st.coins, 21, '卖一件废料 +1 信用点');
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

/* ============ 汇总 ============ */
console.log('');
console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项。');
process.exit(fail ? 1 : 0);
