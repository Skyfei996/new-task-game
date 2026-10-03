// 原创关卡《空间站大停摆》自测：node prototype/test.station.mjs
// 覆盖：多关卡加载与旧存档兼容 / 关卡数据完整性（45 点·23 道具·8 乘员·4 场景坐标与素材尺寸）
//       / 通关 A 路线完整模拟 / 三件重启物每条路径 / 氧气预算验算 / 双资源失败 / 卡死保险 / DOM id 自检
//       / §8.7 十条自动断言（断循环 / 预算 95·180·100 / 简单·困难跑通 A 与困难保险柜短线反例 /
//         结局 C 前置 / 资源不为负 / 星币不判失败 / 改名扫描 / 提示分级 lint / 文本道具 / R10~R16 落点）
//       / B02 断言 11~14：lint L1~L5（同现·once 隐藏·跨层·代价·名词首现）/ 战斗失败 loseSay＋原地 /
//         4 号探索化 / 机制落点（lockIf 16＋恒灰 10·完成态并 cond 7·去向修正 4·新去向 9·tIf 增补）
//       / B02-QA 修正轮（B40~B59）：12 号三态×②③④ / 41 证据×广播 8 版 / 43 重启×站长 4 版 /
//         17③·40④ 灰字两缺项 / 名称统一（维修爬道·焊接枪）/ 普通难度短线 80
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
/* 序章（R01/E2）：设计稿 111 字（含标点；B75 改第 3 句后按现状重算——B03 评审修正轮 2 已统一） */
ok(!!D.meta.prologue && Array.isArray(D.meta.prologue.lines) && D.meta.prologue.lines.length > 0, 'meta.prologue 存在（E2）');
const prologueText = D.meta.prologue.lines.join('');
eq(prologueText.length, 111, '序章恰为设计稿的 111 字（含标点，{me} 按 4 字符计）');
ok(D.meta.prologue.lines.every(l => l.length > 0), '序章每一行都非空');
ok(prologueText.indexOf('攒下') >= 0, 'B75：序章含「攒下」（打工动机——兜里还有实习攒下的星币）');
ok(!!C.prologue() && C.prologue().lines.length === D.meta.prologue.lines.length, 'Core.prologue() 读得到序章（E2 数据面）');
/* 帮助（玩法说明）：9 条（新增第 7 条）；也是 §14-7 扫描面里的「帮助」那一半 */
ok(Array.isArray(D.help) && D.help.length === 9, '帮助恰 9 条（实测 ' + ((D.help || []).length) + '）');
ok(D.help.every(l => typeof l === 'string' && l.length > 10), '帮助每一条都是完整句子');
ok(D.help.some(l => l.indexOf('星币') >= 0 && l.indexOf('20') >= 0), '帮助里有星币条目（R02）');
ok(D.help.some(l => l.indexOf('氧气条会告诉你还剩多少') >= 0) && !D.help.some(l => l.indexOf('💨') >= 0 && /普通开局 100|困难只有 30/.test(l)),
  'B03：帮助资源行改氧气条口径（不报开局数值；§7.46/§8.3）');
ok(D.help.some(l => l.indexOf('武力值＝装备加成＋伙伴加成') >= 0 && l.indexOf('焊接枪 +1') >= 0),
  'B69：帮助武力行含构成算式与四件装备');
ok(D.help.some(l => l.indexOf('🧭') >= 0 && l.indexOf('剧情会告诉你为什么') >= 0), '帮助里有「选项」新哲学条（B03/R06）');
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
    if (ch.lockIf !== undefined) ok(!!ch.lockIf && typeof ch.lockIf === 'object', `节点 ${id} 选项#${i} lockIf 是条件对象（E12）`);
    if (ch.battle && ch.battle.loseSay !== undefined) ok(typeof ch.battle.loseSay === 'string' && ch.battle.loseSay.length > 0, `节点 ${id} 选项#${i} battle.loseSay 是字符串（E11）`);
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
    /* 条件里引用的道具 / 资源 / 结构的合法性（cond 与 lockIf 同一套检查，tag 只影响报错文案） */
    const walkCondTag = (c, tag) => {
      if (!c) return;
      if (c.item) ok(!!D.items[c.item], `节点 ${id} 选项#${i} ${tag}.item「${c.item}」`);
      if (c.noItem) ok(!!D.items[c.noItem], `节点 ${id} 选项#${i} ${tag}.noItem「${c.noItem}」`);
      if (c.anyItem) c.anyItem.forEach(it => ok(!!D.items[it], `节点 ${id} 选项#${i} ${tag}.anyItem「${it}」`));
      (c.all || []).forEach(x => walkCondTag(x, tag));
      (c.any || []).forEach(x => walkCondTag(x, tag));
      Object.keys(c).forEach(k => {
        if (['item', 'noItem', 'knows', 'noKnows', 'anyItem', 'notPinsAll', 'pinsAll', 'notPins', 'all', 'any', 'chDone'].indexOf(k) >= 0) return;
        ok(RES_IDS.indexOf(k) >= 0, `节点 ${id} 选项#${i} ${tag} 的资源键「${k}」已在 resources 表`);
      });
    };
    walkCondTag(ch.cond, 'cond');
    walkCondTag(ch.lockIf, 'lockIf');
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
eq(D.nodes['4'].en, undefined, '4 号健身房：B03 探索化后不再有进入效果（不自动扣氧发物）');
{
  const box = D.nodes['4'].c.find(ch => (ch.l || '').indexOf('撬开墙上的急救箱') >= 0);
  ok(!!box && box.fx.oxygen === -5 && (box.fx.gain || []).indexOf('医疗包') >= 0, '4 号撬箱改显式选项：−5 氧 + 得医疗包');
}
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
  const crawlCh = D.nodes['16'].c.find(ch => (ch.l || '').indexOf('往上爬') >= 0);   // B91（R2 问题 13）：标签改「掀开检修口的盖子」
  ok(!!crawlCh && crawlCh.fx && crawlCh.fx.oxygen === -10, '16 号掀开检修口往上爬 −10 氧');
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
  goPick('2', '回中央大厅'); goPick('18', '去健身房');
  goPick('4', '撬开墙上的急救箱'); snap('健身房');          // B03：−5 氧从 en 移到 4③ 显式选项（数值不变）
  goPick('4', '回中央大厅'); goPick('18', '去医务室'); snap('医务室');
  goPick('3', '把医疗包交给阿雅'); snap('授权卡');
  goPick('24', '回中央大厅'); goPick('18', '去观景厅');
  goPick('5', '钻到沙发后面'); snap('见胖胖');
  goPick('5', '追出去'); goPick('28', '站猫罐头'); snap('换到账本');
  goPick('28', '先回中层大厅'); snap('中层补给柜');        // B19：28 入口仅 5、出口显式（③→20）
  goPick('20', '吃一盒合成料理'); snap('吃掉赠的料理');
  goPick('20', '乘电梯去底层'); goPick('21', '去维修区');
  goPick('16', '零件堆'); snap('翻零件堆');
  goPick('16', '往上爬'); snap('爬道到实验室');
  goPick('7', '打开工具柜'); snap('拆到芯片');
  goPick('30', '把芯片收好'); goPick('16', '回底层大厅'); goPick('21', '去冷却塔'); snap('进冷却塔');
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
  eq(T['爬道到实验室'].ox, 140, '16④ 爬道 −10');
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
goPick('16', '往上爬'); eq(st.loc, '7', '16→7（爬道）');
eq(st.oxygen, oxCrawl - 10, '钻爬道 −10 氧');
ok(st.learned['维修爬道路线'], '记住维修爬道路线');
goPick('7', '打开工具柜'); eq(st.loc, '30', '7→30（自己拆芯片）');
eq(st.oxygen, oxCrawl - 15, '7② 拆芯片再 −5 氧');
ok(C.hasItem(st, '控制芯片'), '拿到控制芯片（路径②：自己拆，无需老布）');

/* 芯片·路径①（老布线）：7① → 25 → 16③ → 38；并与 7 号正文分叉联动（R14） */
st = C.newState('normal');
C.go(st, '7');
goPick('7', '帮他去找工具箱'); eq(st.loc, '25', '7→25（老布的委托）');
ok(!st.learned['老布的委托'], 'B71：委托去线索化——不再 learn「老布的委托」（只留 once 锚点）');
goPick('25', '顺着维修爬道滑下去'); eq(st.loc, '16', '25→16（爬道滑降）');
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
eq(st.oxygen, 100, '4 号 B03 探索化：进入不再自动扣氧（旧 en 已删）');
goPick('4', '掰手腕'); eq(st.loc, '26', '4→26（挑战铁头）');
goPick('26', '用力'); eq(st.loc, '27', '战斗胜利 → 27（铁头开门）');
eq(st.oxygen, 95, '26① 掰手腕 −5 氧（唯一载体；4① 不另扣）');
ok(st.learned['铁头已开门'], '铁头开门');
C.go(st, '10');
goPick('10', '直接动手搬'); eq(st.loc, '31', '10→31（硬拿冷却剂）');
ok(C.hasItem(st, '冷却剂罐'), '拿到冷却剂罐（路径①：硬拿）');
eq(st.oxygen, 90, '10① 搬冷却剂 −5 氧（B08）');
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
goPick('5', '钻到沙发后面');                                // 拿站猫罐头
goPick('5', '追出去'); goPick('28', '站猫罐头');             // 换到桑尼的账本
goPick('28', '先回中层大厅'); goPick('20', '去仓库');        // B19：28 出口显式（→20）
eq(st.loc, '10', '20→10（仓库）');
goPick('10', '把银河叼来的本子拿给他看'); eq(st.loc, '32', '10→32（账本把柄）');
ok(C.hasItem(st, '星尘矿石') && !C.hasItem(st, '冷却剂罐'), 'B03：32 报酬＝星尘矿石（去冷却剂——§9.7-37）');
ok((D.nodes['32'].t || '').indexOf('星尘矿石') >= 0 && D.nodes['32'].t.indexOf('抓包') < 0 && D.nodes['32'].c[0].to === '20',
  '32 号：抓包场面重写（货箱里的星尘矿石作证 → 捐着矿石离开）');

/* 收贿赂（10 ③）：+10 星币只发一次，线索断；再进反应堆舱 → 桑尼伏击（29 号失败结算） */
st = C.newState('normal');
C.go(st, '10');
goPick('10', '收下他亮出来的星币'); eq(st.loc, '33', '10→33（收下好处——B03 标签去「封口费」预设；B81 动作已在正文）');
eq(st.coins, 30, '封口费 +10（只发一次：20→30）');
ok(st.learned['收了桑尼的贿赂'], '线索断：记住「收了桑尼的贿赂」');
C.go(st, '12');
ok(C.condOk(st, D.nodes['12'].c[0].cond), '收贿后进反应堆舱：① 伏击可点（②③ 隐藏、④ 全态出口——B45；§9.6-3）');
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
eq(st.oxygen, 90, 'B65：开柜 −10 氧（100→90）');
ok(C.choiceDone(st, D.nodes['9'].c[0], 0, '9'), '9① 的 once 标记已记录（开过保险柜）');
goPick('45', '把东西收好'); eq(st.loc, '20', '45→20（回中层大厅）');
C.go(st, '9');
ok(C.nodeText(st, D.nodes['9']).indexOf('空了') >= 0, '开柜后再进站长室 → 正文分叉（R14）');

/* 观景厅·R11：一次性礼物移入 ①、二次进入文本分叉 */
st = C.newState('normal');
C.go(st, '5');
eq(C.nodeText(st, D.nodes['5']), D.nodes['5'].t, '未打招呼 → 用场景正文');
goPick('5', '钻到沙发后面');
eq(st.oxygen, 95, '钻过沙发 −5 氧');
ok(C.hasItem(st, '合成料理') && C.hasItem(st, '站猫罐头'), '打招呼拿到料理 + 罐头');
ok(C.nodeText(st, D.nodes['5']) !== D.nodes['5'].t, '打过招呼 → 正文分叉');
ok(C.visibleChoices(st).every(x => (x.label || '').indexOf('钻到沙发') < 0), '一次性选项做过即隐藏（E6）');
C.go(st, '18'); C.go(st, '5');
ok(C.nodeText(st, D.nodes['5']).indexOf('猫毛') >= 0, '二次进入仍是分叉文本（R11）');

/* ============ 8. 氧气预算验算（§8.7-2） ============ */
/* 设计档 §8.2 逐段表（账面口径：补给记毛额，翻找/搬运 −5 另列；数据里 2/3 号把这两笔并入 en 净值） */
const SEG = [
  { id: '1',  deck: '顶层', ox: -5,  at: 'en' },
  { id: '2',  deck: '顶层', ox: -5,  at: 'net', net: 10 },
  { id: '4',  deck: '顶层', ox: -5,  at: 'fx' },   // B03：撬箱从 en 移到 4③ 选项（同额 −5）
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
  eq((pin('5', '钻到沙发').fx || {}).oxygen, -5, '§8.7-2 点名行：5① 打招呼 −5（钻沙发）');
  eq((pin('16', '翻一翻零件堆').fx || {}).oxygen, -5, '§8.7-2 点名行：16⑤ 翻零件堆 −5');
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
eq(C.payReason(st, 5), '星币不够（需要 5 枚星币，还差 2 枚）', '钱不够的理由文案（B77 币种名＋B78 数字式）');
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
ok(C.condOk(st, D.nodes['16'].c[0].cond), '16 号战斗选项未收编时可点（cond: noKnows 机器人小帮手）');
{
  const s16 = C.newState('normal'); s16.loc = '16'; s16.learned['机器人小帮手'] = true;
  ok(!C.visibleChoices(s16).some(x => (x.label || '').indexOf('把卡住的机器人') >= 0),
    '16 号战斗选项收编后隐藏（cond noKnows 机器人小帮手；B13）');
}
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
  if (!cond) return;
  if (cond.item) s.items.push(cond.item);
  if (cond.chDone) s.chDone[cond.chDone] = true;
  if (cond.knows) s.learned[cond.knows] = true;
  if (cond.pinsAll) cond.pinsAll.forEach(p => { s.visited[p] = true; });
  if (cond.noItem) { const i = s.items.indexOf(cond.noItem); if (i >= 0) s.items.splice(i, 1); }
  if (cond.noKnows) delete s.learned[cond.noKnows];
  if (cond.all) cond.all.forEach(c => applyCond(s, c));
  if (cond.any) applyCond(s, cond.any[0]);        // 满足其一即可
}

/* --- 14-1 断循环：20 轮「洗碗×3 → 买 → 吃」净氧 ≤ 0 --- */
/* B67：劳动拆三段后，「洗碗」同时命中三条目——本段用「当前可见的那一条」执行（与玩家所见一致） */
function goPickVisible(id, part, allowFail) {
  st.loc = id;                                  // 定位到节点（循环内只做同节点动作）
  const e = C.visibleChoices(st).find(x => (x.label || '').indexOf(part) >= 0);
  if (!e) throw new Error('当前没有可见选项：' + id + ' / ' + part);
  const res = C.choose(st, e.ci);
  if (!allowFail) {
    if (st.bankrupt) throw new Error('路线中触发失败结算：' + id + ' / ' + part);
    if (st.oxygen <= 0) throw new Error('氧气耗尽：' + id + ' / ' + part);
  }
  return res;
}
{
  st = C.newState('normal');
  st.oxygen = 300; st.coins = 30;      // 只验循环净收益：起点调高，避免半路缺氧打断
  C.go(st, '1');
  const ox0 = st.oxygen;
  for (let r = 0; r < 20; r++) {
    goPickVisible('1', '洗碗'); goPickVisible('1', '洗碗'); goPickVisible('1', '洗碗');   // +2 星币 / −5 氧，各一次
    C.buy(st, '合成料理', D.nodes['1'].shop.price);                  // −5 星币
    goPickVisible('1', '吃一盒合成料理');                              // +10 氧
  }
  const net = st.oxygen - ox0;
  P('断循环：20 轮净氧 = ' + net + '（一轮 ' + (net / 20) + '）');
  eq(net, -100, '20 轮「洗碗×3 → 买 → 吃」净氧 = −100');
  ok(net <= 0, '循环净收益 ≤ 0（刷不出来）');
  const price = D.nodes['1'].shop.price;
  const eatCh = D.nodes['1'].c.find(ch => ch.hint === 'exact');
  const washEntries = D.nodes['1'].c.filter(ch => (ch.l || '').indexOf('洗碗') >= 0);
  const washCh = washEntries[0];
  eq(eatCh.fx.oxygen / price, 2, '结构：料理 ' + eatCh.fx.oxygen + '/' + price + ' = 2.0 氧每星币');
  eq(-washCh.fx.oxygen / washCh.fx.coins, 2.5, '结构：劳动 ' + (-washCh.fx.oxygen) + '/' + washCh.fx.coins + ' = 2.5 氧每星币');
  ok(eatCh.fx.oxygen / price < -washCh.fx.oxygen / washCh.fx.coins, '结构断言 2.0 < 2.5 ⇒ 循环必亏');
  /* B67：三段互斥、前两段 once、此后无 once；fx 三段逐字相同 */
  eq(washEntries.length, 3, 'B67：1③ 洗碗恰三段（首遍／再遍／此后）');
  eq(washEntries.map(e => JSON.stringify(e.fx)).join('|'),
    ['{"coins":2,"oxygen":-5}', '{"coins":2,"oxygen":-5}', '{"coins":2,"oxygen":-5}'].join('|'),
    'B67：1③ 三段 fx 逐字相同（+2 星币／−5 氧）');
  ok(washEntries[0].once === '洗过碗' && washEntries[1].once === '再洗过碗' && !washEntries[2].once,
    'B67：1③ 前两段带 once、此后可重复');
  const lbEntries = D.nodes['7'].c.filter(ch => (ch.l || '').indexOf('打下手') >= 0);
  eq(lbEntries.length, 3, 'B67：7③ 打下手恰三段');
  eq(lbEntries.map(e => JSON.stringify(e.fx)).join('|'),
    ['{"coins":2,"oxygen":-5}', '{"coins":2,"oxygen":-5}', '{"coins":2,"oxygen":-5}'].join('|'),
    'B67：7③ 三段 fx 逐字相同');
  const lbCh = lbEntries[0];
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
/* 反例：困难走「保险柜短线」（不撬箱、跳过医务室、改走 9 号开柜）→ 进 12 号触底
 * B02 数据口径（父侧 2026-10-02 裁定「按事实走」）：B03 把 4 号 −5 从 en 移到 4③ 后，短线可避这 5 点——
 *   ① 不带医务室：12 号入口前 10 → 入内后 0 触底（不可通，原口径不变）；
 *   ② 补上医务室：12 号入口前 15 → 入内后 5（可通——原设计「也恰好归 0」已按设计档 v3.4 同步为可通）；
 *   ③ 普通难度同口径（§8.2「同口径 85 − 5 = 80」）：无医务室 90 → 80、补上医务室 95 → 85（均可通）。 */
function cabinetShortcut(withMedical, diff) {
  diff = diff || 'hard';
  st = C.newState(diff);
  const price = D.nodes['1'].shop.price;
  C.go(st, '1');
  const meals = Math.floor(st.coins / price);   // 困难 3 盒 / 普通 4 盒（看开局星币）
  for (let i = 0; i < meals; i++) { C.buy(st, '合成料理', price); goPick('1', '吃一盒合成料理'); }
  goPick('1', '摸黑去中央大厅'); goPick('18', '摸回去');
  goPick('2', '回中央大厅'); goPick('18', '去健身房'); goPick('4', '回中央大厅');   // 短线不撬箱（避掉 4③ 的 −5）
  if (withMedical) { goPick('18', '去医务室'); goPick('3', '回中央大厅'); }
  goPick('18', '去观景厅'); goPick('5', '钻到沙发后面');
  goPick('5', '追出去'); goPick('28', '站猫罐头'); goPick('28', '先回中层大厅');
  goPick('20', '吃一盒合成料理');
  goPick('20', '拐两个弯'); goPick('6', '问它'); goPick('23', '回中层大厅');   // 拿保险柜密码
  goPick('20', '乘电梯去底层'); goPick('21', '去维修区');
  goPick('16', '零件堆'); goPick('16', '往上爬'); goPick('7', '打开工具柜');
  goPick('30', '把芯片收好'); goPick('16', '回底层大厅'); goPick('21', '去冷却塔');
  goPick('13', '用万能扳手拧上总阀');
  goPick('21', '乘电梯去中层'); goPick('20', '去气闸舱'); goPick('11', '打开安保柜'); goPick('11', '穿上磁力靴，出舱');
  goPick('19', '用工具把面板焊好'); goPick('39', '爬回气闸舱');
  goPick('11', '回中层大厅'); goPick('20', '乘电梯去底层');
  goPick('21', '去太阳能控制室'); goPick('15', '双手推上主供电闸门'); goPick('36', '回底层大厅');
  goPick('21', '乘电梯去中层'); goPick('20', '去站长室');     // 保险柜线（B65：多一笔 −10）
  goPick('9', '转动密码盘'); goPick('45', '把东西收好');
  goPick('20', '乘电梯去底层');
  const oxBefore = st.oxygen;
  goPick('21', '去反应堆舱', true);                            // 允许触底（反例）
  return { oxBefore, loc: st.loc, bankrupt: st.bankrupt, zeroRes: st.zeroRes, oxygen: st.oxygen };
}
{
  /* B65（设计档 §8.2/§8.7-3）：9① 开柜 −10 ⇒ 困难下**两变体均不可通**（老板 2026-10-02 裁定恢复） */
  const noMed = cabinetShortcut(false);
  ok(noMed.bankrupt && noMed.zeroRes === 'oxygen' && noMed.loc === '44',
    '困难·保险柜短线（不带医务室）：进 12 号前 ' + noMed.oxBefore + ' 氧 → 12 号 −10 → 触底失败（不可通）');
  eq(noMed.oxBefore, 5, '困难·保险柜短线（不带医务室）：进 12 号前恰好 5 氧（−10 → 触底）');
  const withMed = cabinetShortcut(true);
  ok(withMed.bankrupt && withMed.zeroRes === 'oxygen' && withMed.loc === '44',
    '困难·保险柜短线（补上医务室）：进 12 号前 ' + withMed.oxBefore + ' 氧 → 入内后 ' + withMed.oxygen + ' 触底（不可通——B65 恢复）');
  eq(withMed.oxBefore, 10, '补上医务室：进 12 号前 10 氧');
  eq(withMed.oxygen, 0, '补上医务室：入 12 号 −10 → 恰好 0 触底（不可通）');
  /* 普通难度同口径（设计档 §8.2：普通 85 → 75 ｜ 90 → 80——两变体均可通） */
  const nNoMed = cabinetShortcut(false, 'normal');
  eq(nNoMed.oxBefore, 85, '普通·保险柜短线（不带医务室）：进 12 号前 85 氧');
  ok(!nNoMed.bankrupt && nNoMed.zeroRes === null && nNoMed.loc === '12' && nNoMed.oxygen === 75,
    '普通·保险柜短线（不带医务室）：入内 −10 → 余 ' + nNoMed.oxygen + '（可通）');
  const nWithMed = cabinetShortcut(true, 'normal');
  eq(nWithMed.oxBefore, 90, '普通·保险柜短线（补上医务室）：进 12 号前 90 氧');
  eq(nWithMed.oxygen, 80, '普通·保险柜短线（补上医务室）：入内后余 80（可通）');
  P('反例：保险柜短线 —— 困难：5 → 触底（不可通）｜10 → 0 触底（不可通）；普通：85 → 75 ｜ 90 → 80（均可通）');
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
  ok(!c17.lockText && !c40.lockText && !c17.lock && !c40.lock, 'B03：17③/40④ 无 lock／lockText（灰显取消）');
  const f17 = D.nodes['17'].c.filter(ch => (ch.l || '').indexOf('按下发射钮') >= 0);
  const f40 = D.nodes['40'].c.filter(ch => (ch.l || '').indexOf('放下反应堆') >= 0);
  eq(f17.length + ',' + f40.length, '3,3', 'B03：17③/40④ 均为成事＋双失败条目（3 条）');
  ok(f17[1].say.indexOf('还空着') >= 0 && f17[2].say.indexOf('还不知道要走') >= 0,
    'B03：17③ 双失败条文案＝检查表空着／大家不知情（§9.7-33）');
  ok(f40[1].say.indexOf('还没检完') >= 0 && f40[2].say.indexOf('还不知道要走') >= 0,
    'B03：40④ 双失败条文案＝还没检完／大家不知情（§9.7-43）');
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
  eq(C.payReason(s, 5), '星币不够（需要 5 枚星币，还差 5 枚）', '没钱买不了（理由清晰；B77 币种名＋B78 数字式）');
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
  /* R11/R14 + B02：tIf 十四处（cond 与设计一致；条件满足后正文不同） */
  const TIF = {
    '1':  { knows: '全站复电' },                 // B03 新：复电后食堂生活面
    '3':  { pinsAll: ['24'] },
    '4':  { knows: '铁头已开门' },
    '5':  { chDone: '跟胖胖打过招呼' },
    '6':  { knows: '全站复电' },                 // B03 新
    '7':  { pinsAll: ['38'] },
    '9':  { chDone: '开过保险柜' },
    '10': { knows: '收了桑尼的贿赂' },           // B43：收贿版置首
    '11': { chDone: '取了磁力靴' },
    '12': { knows: '收了桑尼的贿赂' },
    '14': { item: '监控回放' },                  // B03 复检 ②：复访写回（挡门那句收束）
    '15': { knows: '全站复电' },                 // B12：15 号 tIf 重排（复电版在前）
    '16': { knows: '机器人小帮手' },            // B99 新：已收编＝写回版置首（原 pinsAll 6 版退居第二行）
    '17': { knows: '逃生舱检查过' },             // B03 复检 ②：复访写回（检查表已打勾）
    '18': { knows: '全站复电' },                 // B66 新：三厅分叉（复电版置首）
    '19': { knows: '太阳能板已修好' },
    '20': { knows: '全站复电' },
    '21': { knows: '全站复电' },
    '24': { all: [ { item: '站长授权卡' }, { pinsAll: ['45'] } ] },   // B03 复检 ③：持卡进入＝衔接版置首（父仲裁修正：加 45 来源面）
    '27': { pinsAll: ['26'] },                    // B79 新：掰腕赢家版置首
    '28': { item: '桑尼的账本' },
    '36': { pinsAll: ['24'] },
    '39': { chDone: '小帮手焊板' },               // B03 新
    '40': { knows: '走私暗号' },                  // B03 新
    '41': { all: [ { item: '桑尼的账本' }, { item: '监控回放' }, { pinsAll: ['24'] } ] },   // B57：8 版分档，首档为准
    '43': { all: [ { knows: '反应堆已重启' }, { pinsAll: ['24'] } ] }                       // B58：4 版分档
  };
  const TIF_NODES = Object.keys(TIF);
  eq(TIF_NODES.length, 26, 'TIF 表 26 行（14＋B03 新 8：1/6/16/18/20/21/39/40＋复检收口新 4：14/17/24/27）');
  const tifNodes = Object.keys(D.nodes).filter(id => (D.nodes[id].tIf || []).length);
  eq(tifNodes.sort((a, b) => a - b).join(','), TIF_NODES.slice().sort((a, b) => a - b).join(','),
    '全节点扫描：带 tIf 的节点恰为这 26 个（无表外分叉）');
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
  const c3 = D.nodes['3'].c.find(ch => (ch.l || '').indexOf('问阿雅') >= 0);
  ok(!!c3 && !!c3.say && c3.say.length > 10, 'R16：3 号问密码有对话反馈（say）');
  ok(!!c3 && !!c3.fx && c3.fx.learn === '阿雅的提醒', 'R16/F1：3 号②留下「阿雅的提醒」面包屑（复检收口：原「密码线索」去黑话化）');
  ok(!c3.once, 'B03：3② 去掉 once（不再一次即隐）——重复可问');
  {
    const s3 = C.newState('normal'); s3.loc = '3'; s3.learned['阿雅的提醒'] = true;
    ok(C.visibleChoices(s3).some(x => (x.label || '').indexOf('问阿雅') >= 0), 'B03：3② 已问过 ⇒ 仍可见（可重复）');
  }
  ok(D.nodes['17'].c[1].once === true && (D.nodes['17'].c[1].fx.gain || []).indexOf('绳索') >= 0,
    'R16：17 号②应急柜可拿（正文提到的绳索 / 应急盾真的可拿）');
  ok((D.nodes['17'].c[0].fx.gain || []).indexOf('绳索') < 0, 'R16：17 号①检查不再顺手给绳索 / 盾（分到应急柜选项）');
  ok((D.nodes['28'].c || []).some(ch => (ch.l || '').indexOf('先回中层大厅') >= 0), 'R16：28 号出口显式回中层（不指路）');
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
  P('R10~R16 落点：45 保险柜 / 14 处 tIf / 13 硬穿收获 / 14 绕行 say / 17 拆柜 / 28 出口 逐条通过');
}

/* ============ 15. 断言 11~14（lint L1~L6 / 战斗失败 / 4 号探索化 / 机制落点） ============ */
console.log('');
console.log('———— §8.7-11 lint 五条（L1 同现 / L2 可见性两态 / L3 跨层 / L4 代价 / L5 名词）＋ L6 前提可知性 ————');

/* —— 支撑表数据源（照 design-station-nodes.md §9.4；维护方＝叙事/系统线）——
 * 扫描面：node.t / tIf / 选项文案 / say / lockText / battle.loseSay / items.text / 序章 / 帮助（数据源头）；
 * 导出文案稿 docs/station-copy-v1.md 是数据的产品面快照（重导归父侧收口——QA 轮改了文案后须重导，方与源头同源）。 */
const L1_EVENT_CHARS = { '23': ['tangtang'], '28': ['yinhe'], '29': ['sangni'], '31': ['sangni'], '32': ['sangni'], '33': ['sangni'], '40': ['sangni', 'tietou'] };
const L1_SPOT_TOL = 150;                       // 同房间容差（设计像素）
const L3_WHITELIST = [['18', '20'], ['20', '21'], ['18', '21'], ['16', '7'], ['11', '19']];
const L3_EVENT_SCENE = { '22': 'S1', '24': 'S1', '26': 'S1', '27': 'S1', '28': 'S2', '23': 'S2', '25': 'S2', '30': 'S2', '31': 'S2', '32': 'S2', '33': 'S2', '45': 'S2', '29': 'S3', '34': 'S3', '35': 'S3', '36': 'S3', '37': 'S3', '38': 'S3', '40': 'S3', '39': 'S4' };   // B99：28 的发生场景＝中层仓库门口（R2 问题 16③）
const L3_EVENT_DECK = { S1: 'deck1', S2: 'deck2', S3: 'deck3', S4: 'exterior' };   // 事件层 → 楼层（§9.4：S1 顶层／S2 中层／S3 底层／S4 舱外）
const L3_CHANNEL = /电梯|爬道|舱/;
const L3_EXEMPT = ['41', '42', '43', '29', '44'];         // 结局 / 失败节点豁免
const L4_WORDS = /[撬搬拖推拽掰扛翻钻爬冲焊拧]/;
/* 豁免登记（§10.3）：滑降·借重力（0 氧）；移动/退出类去向（去向即反馈、0 氧——依据：§10.1-R1 通道免费与 §10.3 反馈规则「纯移动以旁白为反馈」；本 4 条已随设计档 v3.4 同步登记于 §10.3 豁免表） */
const L4_EXEMPT = [
  ['25', '滑下去'], ['30', '把芯片收好'],
  ['28', '推开仓库的门'], ['19', '爬回气闸舱'], ['39', '爬回气闸舱'], ['26', '先不掰了']
];
const L4_CLIMB = [['16', '往上爬', 10]];   // 攀爬类：掀检修口上行 ≥10（正常命中词表靠阈值 5，检修口单列；B91）
/* L5 名词表（B03 重构）：19 词条 = 圣经 §5（引入点·可引用集）
 * 登记规则（设计档 §10.5-L5）：可引用集 = 允许出现该词的节点集（含序章／帮助／道具:xx 三个非节点面）+ 引入点。
 * B03 补登（圣经 §5 可引用列与本轮实现实存在的差异，按实现补登并上报）：银河@10（10② 新标签）、老布@30 / 桑尼@4·12·34·道具:监控回放（§7 正文实引）、维修爬道@帮助（帮助第 8 条）。 */
const L5_NOUNS = [
  { w: '晨星号', intro: '序章 / 44', allow: 'ALL' },
  { w: '星币', intro: '序章 / 1', allow: 'ALL' },
  { w: '木星', intro: '5（画面化在 1）', allow: 'ALL' },
  { w: '胖胖', intro: '1', allow: ['1', '5'] },
  { w: '伊莲娜', intro: '3 / 45', allow: ['3', '24', '36', '41', '43', '45', '道具:站长的便条'] },
  { w: '阿雅', intro: '3', allow: ['3', '24', '36', '41', '43'] },   // 41/43 分版（B57/B58）广播发言人
  { w: '铁头', intro: '4 / 26', allow: ['4', '25', '26', '27', '34', '40', '41', '45', '道具:站长的便条'] },
  { w: '银河', intro: '5 / 28', allow: ['5', '10', '28'] },
  { w: '糖糖', intro: '6', allow: ['3', '6', '16', '23', '35', '道具:监控回放'] },
  { w: '老布', intro: '7 / 25', allow: ['4', '7', '16', '25', '30', '38'] },
  { w: '桑尼', intro: '10 / 35', allow: ['4', '10', '12', '29', '31', '32', '33', '34', '35', '40', '41', '42', '道具:监控回放'] },
  { w: '维修爬道', intro: '23（7 号写「那条爬道」）', allow: ['23', '25', '30'] },   // 复检收口：16 号已不再用此名（改说「检修口」）
  { w: '星尘矿石', intro: '10 / 32', allow: ['10', '31', '32', '40', '41', '道具:桑尼的账本'] },
  { w: '保险柜', intro: '9 / 23', allow: ['9', '23', '35', '道具:监控回放'] },
  { w: '货单', intro: '8', allow: ['8'] },
  { w: '账本', intro: '8', allow: ['8', '10', '28', '32', '40', '41'] },
  { w: '调令牌', intro: '14 / 35', allow: ['14', '35'] },
  { w: '小帮手', intro: '37', allow: ['14', '19', '37', '39'] },
  { w: '监控回放', intro: '35', allow: ['35', '41'] }
];

/* 扫描助手：节点的可见文案面 */
function nodeTextOf(n) {
  const parts = [n.t || ''];
  (n.tIf || []).forEach(x => parts.push(x.t || ''));
  (n.c || []).forEach(ch => parts.push(ch.l || '', ch.say || '', ch.lockText || '', (ch.battle && ch.battle.loseSay) || ''));
  return parts.join('\n');
}
function localSceneMap(L) {
  const m = {};
  Object.keys(L.scenes).forEach(sid => Object.keys(L.scenes[sid].pins).forEach(nid => { m[nid] = sid; }));
  return m;
}

/* --- L1 同一角色多地同现 --- */
function lintL1(L) {
  const bad = [], locScene = localSceneMap(L), seen = {};
  Object.entries(L.characters).forEach(([cid, ch]) => {
    if (!ch.spot || !L.scenes[ch.spot.scene]) { bad.push(`${cid} spot 场景不存在`); return; }
    Object.entries(L.nodes).forEach(([id, n]) => {
      if ((n.chars || []).indexOf(cid) < 0) return;
      seen[cid] = true;
      if (locScene[id]) {                                   // 地点节点：同场景 + 距该节点 pin ≤150px
        if (ch.spot.scene !== locScene[id]) { bad.push(`角色多地同现：${cid}（spot=${ch.spot.scene}）出现在 ${id}（${locScene[id]}）`); return; }
        const pin = L.scenes[ch.spot.scene].pins[id];
        const d = Math.hypot(pin[0] - ch.spot.x, pin[1] - ch.spot.y);
        if (d > L1_SPOT_TOL) bad.push(`角色多地同现：${cid} 距 ${id} 号 pin ${Math.round(d)}px > ${L1_SPOT_TOL}px`);
      } else if ((L1_EVENT_CHARS[id] || []).indexOf(cid) < 0) {   // 事件节点：须登记在在场表
        bad.push(`事件 ${id} 的 chars「${cid}」未登记在【角色在场表】`);
      }
    });
  });
  Object.keys(L.characters).forEach(cid => { if (!seen[cid]) bad.push(`角色 ${cid} 从未出场`); });
  return bad;
}
{
  const bad = lintL1(D);
  eq(bad.join(' ｜ '), '', 'L1 角色同现：每角色一处 spot；地点 chars 同房间（≤150px）；事件 chars 已登记；全员出场');
}

/* --- L2 可见性两态（B03 重订 · 设计档 §10.5-L2） --- */
/* ① 静态：全关 lock／lockIf／lockText = 0；一次性语义清单（§9.3 组一/组二）——完成后齐隐 */
function condHasDonePred(c) {
  if (!c || typeof c !== 'object') return false;
  if (c.noItem || c.noKnows || c.notPinsAll) return true;
  return (c.all || []).some(condHasDonePred) || (c.any || []).some(condHasDonePred);
}
/* 一次性语义清单（对应 §9.3 组一/组二 的实现条目；可重复组三不列） */
const L2_ONCE_LIST = [
  ['1', '循着说话声'], ['3', '把医疗包交给阿雅'], ['4', '撬开墙上的急救箱'], ['4', '请铁头搭把手'], ['4', '请他帮忙打开仓库'],
  ['5', '钻到沙发后面'], ['5', '追出去'], ['6', '你能带我去哪儿'], ['7', '打开工具柜'],
  ['8', '对一对'], ['8', '查一查被改过的货单'], ['9', '转动密码盘'], ['10', '搬一罐冷却剂'], ['10', '把银河叼来的本子'], ['10', '收下他亮出来的星币'],
  ['11', '打开安保柜'], ['12', '启动反应堆'], ['12', '照一照堆芯'], ['13', '拧上总阀'], ['13', '冲过蒸汽'],
  ['14', '跟安保机器人过招'], ['14', '小帮手去机房后台'], ['15', '推上主供电闸门'],
  ['16', '把卡住的机器人'], ['16', '换上一节新电池'], ['16', '红漆工具箱'], ['16', '翻一翻零件堆'],
  ['17', '检查表'], ['17', '应急柜'], ['19', '用工具把面板焊好'], ['19', '让机器人小帮手去焊'], ['28', '站猫罐头']
];
/* 豁免登记（设计档 §10.5-L2①）：14③／8①b＝隐藏式、只有 cond 无显式未完成谓词的边界——本实现在 cond 内已含 noItem，故无需豁免；
 * 9① F1/F2、12③ F、16⑤ F、17③ F1/F2、40④ F1/F2 为失败条（形状由 ③ 判，完成态由条件互补或终局蕴含关闭——不列入本清单）；11②/13②/14② 为可重复项（组三——不列入）。 */
function lintL2Static(L) {
  const bad = [], lockFields = [];
  Object.keys(L.nodes).forEach(id => (L.nodes[id].c || []).forEach((ch, i) => {
    if (ch.lock) lockFields.push('lock:' + id + '#' + i);
    if (ch.lockIf) lockFields.push('lockIf:' + id + '#' + i);
    if (ch.lockText) lockFields.push('lockText:' + id + '#' + i);
  }));
  if (lockFields.length) bad.push('可见性字段未归零：' + lockFields.join(' ｜ '));
  L2_ONCE_LIST.forEach(([id, frag]) => {
    const ch = (L.nodes[id].c || []).find(x => (x.l || '').indexOf(frag) >= 0);
    if (!ch) { bad.push(`${id} 找不到选项「${frag}」`); return; }
    if (!ch.once && !condHasDonePred(ch.cond)) bad.push(`${id}「${frag}」缺 once／完成态条件（完成后未齐隐）`);
  });
  return bad;
}
/* ② 互补（可尝试 22 站点）：成事＋失败条目条件两两互斥；失败条形状；完成态探针 */
const L2_SITES = [
  ['3', '把医疗包交给阿雅'], ['4', '请他帮忙打开仓库'], ['4', '请铁头搭把手'], ['7', '打开工具柜'],
  ['9', '转动密码盘'], ['10', '搬一罐冷却剂'], ['11', '穿上磁力靴，出舱'], ['12', '启动反应堆'], ['12', '照一照堆芯'],
  ['13', '拧上总阀'], ['13', '系上绳索'], ['14', '扳下电闸'], ['15', '推上主供电闸门'],
  ['16', '换上一节新电池'], ['16', '红漆工具箱'], ['16', '掀开检修口'], ['16', '翻一翻零件堆'],
  ['17', '按下发射钮'], ['19', '用工具把面板焊好'], ['28', '站猫罐头'], ['40', '揭发他'], ['40', '放下反应堆']
];
const L2_REPEATABLE = ['11\u0000穿上磁力靴，出舱', '13\u0000系上绳索', '14\u0000扳下电闸', '16\u0000掀开检修口'];   // 组三：可重复·按次计费（无完成态）
const L2_TERMINAL = ['17\u0000按下发射钮', '40\u0000揭发他', '40\u0000放下反应堆'];              // 终局蕴含：成事条去向即结局（无回访）
function isFailEntry(ch, id) {
  return !!ch && !!ch.say && !ch.fx && !ch.once && !ch.toIf && !ch.back && !ch.battle && !ch.random && ch.to === id;
}
function siteUnion(sites) {   // 站点组：同文案片段的所有条目
  const out = [];
  sites.forEach(([id, frag]) => {
    const group = (D.nodes[id].c || []).filter(x => (x.l || '').indexOf(frag) >= 0);
    if (group.length) out.push({ id, frag, group });
  });
  return out;
}
function atomsOf(conds) {   // 条件里用到的原子（item／knows／pins）
  const atoms = [];
  const walk = c => {
    if (!c) return;
    if (c.item) atoms.push(['item', c.item]);
    if (c.noItem) atoms.push(['item', c.noItem]);
    if (c.knows) atoms.push(['knows', c.knows]);
    if (c.noKnows) atoms.push(['knows', c.noKnows]);
    if (c.pinsAll) c.pinsAll.forEach(p => atoms.push(['pins', p]));
    if (c.notPinsAll) c.notPinsAll.forEach(p => atoms.push(['pins', p]));
    if (c.chDone) atoms.push(['chDone', c.chDone]);
    (c.all || []).forEach(walk); (c.any || []).forEach(walk);
  };
  conds.forEach(walk);
  const seen = {}, out = [];
  atoms.forEach(a => { const k = a[0] + ':' + a[1]; if (!seen[k]) { seen[k] = true; out.push(a); } });
  return out;
}
function stateFromAtoms(atoms, bits) {   // bits：每个原子 true/false 的开关
  const s = C.newState('normal');
  atoms.forEach((a, i) => {
    if (!bits[i]) return;
    if (a[0] === 'item') s.items.push(a[1]);
    else if (a[0] === 'knows') s.learned[a[1]] = true;
    else if (a[0] === 'pins') s.visited[a[1]] = true;
    else if (a[0] === 'chDone') s.chDone[a[1]] = true;
  });
  return s;
}
/* 把一个 cond 直接构造为「真」：any 逐枝试（不满足就换一枝） */
function satisfyCond(s, c) {
  if (!c || typeof c !== 'object') return true;
  if (c.item && s.items.indexOf(c.item) < 0) s.items.push(c.item);
  if (c.noItem) { const i = s.items.indexOf(c.noItem); if (i >= 0) s.items.splice(i, 1); }
  if (c.knows) s.learned[c.knows] = true;
  if (c.noKnows) delete s.learned[c.noKnows];
  if (c.pinsAll) c.pinsAll.forEach(p => { s.visited[p] = true; });
  if (c.notPinsAll) c.notPinsAll.forEach(p => { delete s.visited[p]; });
  if (c.chDone) { s.chDone = s.chDone || {}; s.chDone[c.chDone] = true; }
  if (c.all) { for (const x of c.all) satisfyCond(s, x); }
  if (c.any) {
    let done = false;
    for (const x of c.any) {
      const probe = JSON.parse(JSON.stringify(s));
      satisfyCond(probe, x);
      if (C.condOk(probe, x)) { Object.assign(s, probe); done = true; break; }
    }
    if (!done) satisfyCond(s, c.any[0]);
  }
  return C.condOk(s, c);
}
function visibleOf(s, id, group) {
  s.loc = id;
  const vis = C.visibleChoices(s);
  return group.map(ch => vis.some(x => x.ci === D.nodes[id].c.indexOf(ch)));
}
function domAtoms(c, s) {   // 把成事条 cond 里的“未完成”谓词翻成“已完成”
  if (!c) return;
  if (c.noItem) s.items.push(c.noItem);
  if (c.noKnows) s.learned[c.noKnows] = true;
  if (c.notPinsAll) c.notPinsAll.forEach(p => { s.visited[p] = true; });
  (c.all || []).forEach(x => domAtoms(x, s)); (c.any || []).forEach(x => domAtoms(x, s));
}
{
  const lockFields = [];
  Object.keys(D.nodes).forEach(id => (D.nodes[id].c || []).forEach(ch => {
    if (ch.lock || ch.lockIf || ch.lockText) lockFields.push(id);
  }));
  eq(lockFields.join(','), '', 'L2① 静态：全关 lock／lockIf／lockText 均 0（灰显不复存在）');
  eq(lintL2Static(D).join(' ｜ '), '', 'L2① 静态：一次性语义清单均带 once ／完成态谓词（完成后齐隐）');
  /* 失败条计数（§9.7.1）：共 26 条（可尝试 22 站点＋双条站点 4 处各多 1） */
  let failCount = 0;
  Object.keys(D.nodes).forEach(id => (D.nodes[id].c || []).forEach(ch => { if (isFailEntry(ch, id)) failCount += 1; }));
  eq(failCount, 26, 'L2① 计数：失败条共 26 条（可尝试 22＋双条站点 9①/10①/17③/40④ 各多 1 条）');
  /* ② 站点逐条模拟：形状 / 互斥 / 失败探针 / 完成态探针 */
  const badShape = [], badExcl = [], badProbe = [], badFailProbe = [];
  siteUnion(L2_SITES).forEach(({ id, frag, group }) => {
    const fails = group.filter(ch => isFailEntry(ch, id));
    if (!fails.length) badShape.push(`${id}「${frag}」无失败条`);
    fails.forEach(ch => {
      if (!ch.say || ch.say.length < 6) badShape.push(`${id}「${frag}」失败条 say 缺失`);
      if (ch.fx || ch.once || ch.toIf || ch.back || ch.battle || ch.random || ch.to !== id) badShape.push(`${id}「${frag}」失败条形状非法`);
    });
    const atoms = atomsOf(group.map(ch => ch.cond));
    const n = atoms.length, combos = Math.min(1 << n, 64);
    for (let m = 0; m < combos; m++) {
      const bits = atoms.map((_, i) => (m >> i) & 1);
      const s = stateFromAtoms(atoms, bits);
      const vis = visibleOf(s, id, group);
      const cnt = vis.filter(Boolean).length;
      if (cnt > 1) badExcl.push(`${id}「${frag}」组合 ${m} 同时可见 ${cnt} 条`);
    }
    /* 失败探针：失败条条件成立时，恰这一条可见 */
    fails.forEach(ch => {
      const s = C.newState('normal');
      if (!satisfyCond(s, ch.cond)) { badFailProbe.push(`${id}「${frag}」失败条条件构造失败`); return; }
      const vis = visibleOf(s, id, group);
      const idx = group.indexOf(ch);
      if (vis.filter(Boolean).length !== 1 || !vis[idx]) badFailProbe.push(`${id}「${frag}」失败态未恰一条可见`);
    });
    /* 完成态探针：成事条完成（应用 fx＋翻未完成谓词＋记 once）后，整组齐隐 */
    const okEntry = group.find(ch => !isFailEntry(ch, id));
    if (okEntry) {
      const s = C.newState('normal');
      satisfyCond(s, okEntry.cond);
      const fx = okEntry.fx || {};
      (fx.gain || []).forEach(it => { if (s.items.indexOf(it) < 0) s.items.push(it); });
      (fx.lose || []).forEach(it => { const i = s.items.indexOf(it); if (i >= 0) s.items.splice(i, 1); });
      [].concat(fx.learn || []).forEach(k => { s.learned[k] = true; });
      domAtoms(okEntry.cond, s);
      if (okEntry.once) C.markChoiceDone(s, okEntry, D.nodes[id].c.indexOf(okEntry), id);
      const vis = visibleOf(s, id, group);
      const cnt = vis.filter(Boolean).length;
      const key = id + '\u0000' + frag;
      const exempted = L2_REPEATABLE.indexOf(key) >= 0 || L2_TERMINAL.indexOf(key) >= 0;
      if (!exempted && cnt !== 0) badProbe.push(`${id}「${frag}」完成后仍可见 ${cnt} 条`);
    }
  });
  eq(badShape.join(' ｜ '), '', 'L2② 形状：全部失败条 say＋原地（无 fx／once／跨节点去向）');
  eq(badExcl.join(' ｜ '), '', 'L2② 互斥：' + L2_SITES.length + ' 站点——成事与失败条条件两两互斥（组合穷举）');
  eq(badFailProbe.join(' ｜ '), '', 'L2② 反馈：失败态下恰一条可见（选→没成＝一条 say＋原地）');
  eq(badProbe.join(' ｜ '), '', 'L2② 完成态：一次站点完成后齐隐（可重复项／终局项登记豁免）');
  /* 回放：执行一次后从 visibleChoices 消失，且重进节点仍不出现 */
  const REPLAY = [
    ['5', '钻到沙发后面', null],
    ['7', '打开工具柜', s => { s.learned['维修爬道路线'] = true; }],
    ['9', '转动密码盘', s => { s.learned['保险柜密码'] = true; s.items.push('工牌'); }],
    ['11', '打开安保柜', null],
    ['16', '红漆工具箱', s => { s.visited['25'] = true; s.items.push('手电'); }],
    ['16', '翻一翻零件堆', s => { s.items.push('手电'); }],
    ['17', '检查表', null],
    ['17', '应急柜', null],
    ['4', '撬开墙上的急救箱', null],
    ['4', '请铁头搭把手', s => { s.visited['26'] = true; }],
    ['8', '对一对', s => { s.items.push('桑尼的账本'); }],
    ['8', '广播', null],
    ['8', '查一查被改过的货单', null],
    ['12', '照一照堆芯', s => { s.items.push('手电'); }],
    ['13', '拧上总阀', s => { s.items.push('万能扳手'); }],
    ['13', '冲过蒸汽', null],
    ['15', '推上主供电闸门', s => { s.learned['太阳能板已修好'] = true; }],
    ['16', '换上一节新电池', s => { s.items.push('备用电池'); }],
    ['19', '用工具把面板焊好', s => { s.items.push('焊接枪'); }],
    ['19', '让机器人小帮手去焊', s => { s.learned['机器人小帮手'] = true; }],
    ['28', '站猫罐头', s => { s.items.push('站猫罐头'); }],
    ['3', '把医疗包交给阿雅', s => { s.items.push('医疗包'); }],
    ['4', '请他帮忙打开仓库', s => { s.visited['25'] = true; }],
    ['10', '搬一罐冷却剂', s => { s.learned['铁头已开门'] = true; }],
    ['10', '把银河叼来的本子', s => { s.items.push('桑尼的账本'); }],
    ['12', '启动反应堆', s => { s.items.push('控制芯片', '冷却剂罐', '站长授权卡'); s.learned['全站复电'] = true; }],
    ['14', '让小帮手去机房后台', s => { s.learned['机器人小帮手'] = true; }]
  ];
  const rep = [];
  REPLAY.forEach(([id, frag, setup]) => {
    const st = C.newState('normal');
    (setup || function () {})(st);
    st.loc = id;
    const node = D.nodes[id];
    const idx = (node.c || []).findIndex(x => (x.l || '').indexOf(frag) >= 0);
    if (idx < 0) { rep.push(`${id} 找不到「${frag}」`); return; }
    if (!C.condOk(st, node.c[idx].cond)) { rep.push(`${id}「${frag}」前提未满足（回放无法执行）`); return; }
    const r = C.choose(st, idx);
    if (r.back) C.goBack(st); else if (r.to) C.go(st, r.to);
    C.go(st, id);                                   // 重进节点：once／完成态条件都应关闭它
    if (C.visibleChoices(st).some(x => x.ci === idx)) rep.push(`${id}「${frag}」执行一次后仍可见`);
  });
  eq(rep.join(' ｜ '), '', 'L2 回放：' + REPLAY.length + ' 条一次性选项执行一次后均消失（重进节点不出现）');
  /* 交叉路径：经另一条路完成后同样隐藏 */
  const CROSS = [
    ['4', '请他帮忙打开仓库', s => { s.learned['铁头已开门'] = true; }],
    ['28', '站猫罐头', s => { s.items.push('桑尼的账本'); }],
    ['3', '把医疗包交给阿雅', s => { s.visited['24'] = true; }],
    ['15', '推上主供电闸门', s => { s.learned['全站复电'] = true; }],
    ['13', '拧上总阀', s => { s.items.push('冷却剂罐'); }],
    ['13', '冲过蒸汽', s => { s.items.push('冷却剂罐'); }],
    ['10', '搬一罐冷却剂', s => { s.items.push('冷却剂罐'); }],
    ['7', '打开工具柜', s => { s.items.push('控制芯片'); }],
    ['16', '红漆工具箱', s => { s.items.push('手电', '控制芯片'); }],
    ['16', '换上一节新电池', s => { s.learned['机器人小帮手'] = true; }],
    ['14', '让小帮手去机房后台', s => { s.items.push('监控回放'); }],
    ['12', '启动反应堆', s => { s.items.push('控制芯片', '冷却剂罐', '站长授权卡'); s.learned['全站复电'] = true; s.learned['收了桑尼的贿赂'] = true; }],
    ['19', '用工具把面板焊好', s => { s.learned['太阳能板已修好'] = true; }],
    ['19', '让机器人小帮手去焊', s => { s.learned['太阳能板已修好'] = true; }],
    /* 完成态条件补录（§8.7-14 点名；与 L2 静态清单同步） */
    ['1', '循着说话声', s => { s.visited['22'] = true; }],
    ['3', '问阿雅', s => { s.learned['保险柜密码'] = true; }],
    ['5', '追出去', s => { s.items.push('桑尼的账本'); }],
    ['6', '你能带我去哪儿', s => { s.learned['糖糖是帮手'] = true; }],
    ['8', '查一查被改过的货单', s => { s.items.push('桑尼的账本'); }],
    ['14', '跟安保机器人过招', s => { s.items.push('监控回放'); }],
    ['16', '把卡住的机器人', s => { s.learned['机器人小帮手'] = true; }]
  ];
  const miss = [];
  CROSS.forEach(([id, frag, setup]) => {
    const st = C.newState('normal');
    (setup || function () {})(st);
    st.loc = id;
    const idx = (D.nodes[id].c || []).findIndex(x => (x.l || '').indexOf(frag) >= 0);
    if (idx < 0) { miss.push(`${id} 找不到「${frag}」`); return; }
    if (C.visibleChoices(st).some(x => x.ci === idx)) miss.push(`${id}「${frag}」经另一条路完成后仍可见`);
  });
  eq(miss.join(' ｜ '), '', 'L2 交叉路径：' + CROSS.length + ' 条（含 4② 经 26→27、10① 经 13/31/32 等）完成后隐藏');
}

/* --- L3 跨层跳跃（白名单外） --- */
function lintL3(L) {
  const bad = [], locScene = localSceneMap(L);
  const deckOf = id => locScene[id] || L3_EVENT_DECK[L3_EVENT_SCENE[id]] || null;
  Object.keys(L.nodes).forEach(id => {         // 事件登记完整性
    if (locScene[id] || L3_EXEMPT.indexOf(id) >= 0) return;
    if (!L3_EVENT_SCENE[id]) bad.push(`事件节点 ${id} 未登记发生场景（§9.4）`);
  });
  Object.entries(L.nodes).forEach(([id, n]) => {
    const src = deckOf(id);
    if (!src) return;
    (n.c || []).forEach(ch => {
      if (ch.back) return;                     // 动态返回豁免
      const tgts = [];
      if (ch.to) tgts.push(ch.to);
      (ch.toIf || []).forEach(x => tgts.push(x.to));
      if (ch.battle) tgts.push(ch.battle.winTo, ch.battle.loseTo);
      (ch.random || []).forEach(x => tgts.push(x));
      tgts.forEach(t => {
        if (L3_EXEMPT.indexOf(t) >= 0) return;
        const dst = deckOf(t);
        if (!dst || dst === src) return;
        /* B99：通道词可落在源选项／源正文／目标正文（站关 28 的场景表定在 S2，而「搭电梯下到中层」
         * 写在 28 的正文里——玩家一进 28 就读到，通道交代并未缺失） */
        const text = (ch.l || '') + ' ' + (ch.say || '') + ' ' + (n.t || '') + ' ' + ((L.nodes[t] && L.nodes[t].t) || '');
        if (locScene[id] && locScene[t]) {     // 地点 → 地点：白名单节点对 + 文案含通道词
          const pair = L3_WHITELIST.some(([a, b]) => (a === id && b === t) || (b === id && a === t));
          if (!pair) bad.push(`跨层跳跃（白名单外）：${id}(${src}) → ${t}(${dst})「${ch.l}」`);
          else if (!L3_CHANNEL.test(text)) bad.push(`跨层去向缺通道词：${id} → ${t}「${ch.l}」`);
        } else if (!L3_CHANNEL.test(text)) {   // 事件跨层：正文/选项点出通道即过（目标不必是通道端点）
          bad.push(`事件跨层去向缺通道词：${id}(${src}) → ${t}(${dst})「${ch.l}」`);
        }
      });
    });
  });
  return bad;
}
{
  const bad = lintL3(D);
  eq(bad.join(' ｜ '), '', 'L3 跨层：全部去向命中通道白名单（电梯 18/20/21・爬道 16/7・舱外 11/19）且文案可读');
}

/* --- L4 动作选项缺代价标记（B03 补失败条目口径） --- */
function lintL4(L) {
  const bad = [];
  Object.entries(L.nodes).forEach(([id, n]) => (n.c || []).forEach((ch, ci) => {
    /* 判定式（v1 §10.5-L4）：所有 battle 选项必须带 loseSay；失败条目整类豁免（反向断言零代价） */
    if (ch.battle && !(ch.battle.loseSay && ch.battle.loseSay.length > 5)) bad.push(`${id} 战斗选项 #${ci} 缺 loseSay`);
    if (isFailEntry(ch, id)) {
      if (ch.fx || ch.once || ch.toIf || ch.back || ch.random || ch.to !== id) bad.push(`${id} 失败条 #${ci} 形状非法（应零代价＋原地）`);
      return;
    }
    let text = ch.l || '';
    /* 通道名（「爬道」「电梯」）不计（§10.5-L4） */
    text = text.split('爬道').join('').split('电梯').join('');
    if (!L4_WORDS.test(text)) return;
    if (L4_EXEMPT.some(([eid, efrag]) => eid === id && (ch.l || '').indexOf(efrag) >= 0)) return;
    const own = (ch.fx && typeof ch.fx.oxygen === 'number' && ch.fx.oxygen < 0) ? -ch.fx.oxygen : 0;
    const tgts = [];
    if (ch.to) tgts.push(ch.to);
    (ch.toIf || []).forEach(x => tgts.push(x.to));
    let viaEn = 0;
    tgts.forEach(t => { const tn = L.nodes[t]; if (tn && tn.en && typeof tn.en.oxygen === 'number' && tn.en.oxygen < 0) viaEn = Math.max(viaEn, -tn.en.oxygen); });
    /* 载体唯一（§10.3）：入口选项与战斗选项同属一次动作——4① 掰手腕的 −5 挂在 26①，不另扣 */
    let viaNext = 0;
    tgts.forEach(t => {
      const tn = L.nodes[t];
      if (!tn || !(tn.c || []).some(x => x.battle)) return;
      (tn.c || []).forEach(x => { if (x.fx && typeof x.fx.oxygen === 'number' && x.fx.oxygen < 0) viaNext = Math.max(viaNext, -x.fx.oxygen); });
    });
    const climbRow = L4_CLIMB.find(([eid, efrag]) => eid === id && (ch.l || '').indexOf(efrag) >= 0);
    const need = climbRow ? climbRow[2] : 5;
    const cost = Math.max(own, viaEn, viaNext);
    if (cost < need) bad.push(`${id}「${ch.l}」命中力气动作但代价不足（${cost} < ${need}；fx／目标 en／载体均未给）`);
  }));
  return bad;
}
{
  const bad = lintL4(D);
  eq(bad.join(' ｜ '), '', 'L4 代价：成事条目均有载体（选项 fx ／ 目标 en ／ 唯一载体）或豁免；失败条零代价＋原地；全部 battle 带 loseSay');
}

/* --- L5 文本提到未出现过的名词（表＝圣经 §5 引入点集／可引用集；B03 重构） --- */
function lintL5(L) {
  const bad = [], listing = [];
  const pro = ((L.meta.prologue && L.meta.prologue.lines) || []).join('\n');
  const help = (L.help || []).join('\n');
  const itemTexts = Object.entries(L.items).map(([k, v]) => ['道具:' + k, v.text || '']);
  L5_NOUNS.forEach(({ w, intro, allow }) => {
    const occ = [];
    if (pro.indexOf(w) >= 0) occ.push('序章');
    if (help.indexOf(w) >= 0) occ.push('帮助');
    itemTexts.forEach(([tag, t]) => { if (t.indexOf(w) >= 0) occ.push(tag); });
    Object.keys(L.nodes).sort((a, b) => a - b).forEach(id => { if (nodeTextOf(L.nodes[id]).indexOf(w) >= 0) occ.push(id); });
    if (!occ.length) { bad.push(`名词表死条目：${w} 从未出现`); return; }
    if (allow === 'ALL') { listing.push(`${w}｜引入点集：${intro}｜可引用：全篇｜实际出现：${occ.join('/')}`); return; }
    const outside = occ.filter(x => allow.indexOf(x) < 0);
    if (outside.length) bad.push(`引用早于首现／超出可引用集：${w} → ${outside.join(',')}`);
    listing.push(`${w}｜引入点集：${intro}｜实际出现：${occ.join('/')}`);
  });
  return { bad, listing };
}
{
  const r5 = lintL5(D);
  eq(r5.bad.join(' ｜ '), '', 'L5 名词首现：名词表词条均不早于允许集出现（无死条目）');
  r5.listing.forEach(x => P('  · ' + x));
  P('L5 首现句清单（机器产出，供人工/叙事复核「当场解释」）');
}

/* --- L6 前提可知性（B03 新）：静态（引入点非空／引用⊆可引用集／无死条目／标记有提供者／道具可获得）＋ 六路线回放 --- */
function providedFlags(L) {
  const given = {}, items = {};
  const addFlag = k => { [].concat(k || []).forEach(x => { if (x) given[x] = true; }); };
  Object.keys(L.nodes).forEach(id => {
    const n = L.nodes[id];
    if (n.en) addFlag(n.en.learn);
    (n.c || []).forEach(ch => {
      if (ch.once && ch.once !== true) given[ch.once] = true;
      if (ch.fx) { addFlag(ch.fx.learn); [].concat(ch.fx.gain || []).forEach(it => { items[it] = true; }); }
      if (ch.battle && ch.battle.win && ch.battle.win.learn) addFlag(ch.battle.win.learn);
      const st0 = ch.shop || n.shop;
      if (st0 && st0.stock) st0.stock.forEach(s => { items[typeof s === 'string' ? s : s.id] = true; });
      if (ch.fx && ch.fx.lose) [].concat(ch.fx.lose).forEach(it => { items['~' + it] = true; });
    });
    if (n.shop && n.shop.stock) n.shop.stock.forEach(s => { items[typeof s === 'string' ? s : s.id] = true; });
    if (n.en && n.en.gain) [].concat(n.en.gain).forEach(it => { items[it] = true; });
  });
  return { given, items };
}
{
  const { given, items } = providedFlags(D);
  const needKnows = {}, needItems = [];
  const walk = (c, id) => {
    if (!c || typeof c !== 'object') return;
    if (c.knows) needKnows[c.knows] = id;
    if (c.chDone) needKnows[c.chDone] = id;
    if (c.item) needItems.push([id, c.item]);
    (c.all || []).forEach(x => walk(x, id)); (c.any || []).forEach(x => walk(x, id));
  };
  Object.keys(D.nodes).forEach(id => (D.nodes[id].c || []).forEach(ch => walk(ch.cond, id)));
  const noFlag = Object.keys(needKnows).filter(k => !given[k]);
  const noItem = needItems.filter(([id, it]) => !items[it]).map(([id, it]) => id + ':' + it);
  eq(noFlag.join(','), '', 'L6① 静态：cond 引用的线索标记／once 标记均有提供者（无不可得前题）');
  eq(noItem.join(','), '', 'L6① 静态：cond 引用的道具均有来源（选项发放／商店货架）');
  const dead = L5_NOUNS.filter(({ w, intro }) => {
    const pool = [((D.meta.prologue && D.meta.prologue.lines) || []).join(''), (D.help || []).join(''),
      Object.values(D.items).map(v => v.text || '').join(''),
      Object.values(D.nodes).map(n => nodeTextOf(n)).join('')].join('\n');
    return !pool.includes(w) || !intro;
  }).map(x => x.w);
  eq(dead.join(','), '', 'L6① 静态：名词表无死条目、引入点均非空（19 词条）');
  P('L6 静态：线索标记 ' + Object.keys(needKnows).length + ' 个均有提供者；道具引用 ' + needItems.length + ' 处均有来源；词条 19 无死条目');
}
{
  /* 回放：六路线（资源放宽——只验「前提不被门挡住」，经济面由 14-2/14-3 管） */
  const runRoute = (name, seq, mut) => {
    const st = C.newState(name === '困难短线' ? 'hard' : 'normal');
    st.oxygen = 300; st.coins = 30;
    if (mut) mut(st);
    const trace = [];
    for (const [at, frag, expect] of seq) {
      if (at && st.loc !== at) { st.loc = at; }
      const e = C.visibleChoices(st).find(x => (x.label || '').indexOf(frag) >= 0);
      if (!e) throw new Error(name + '：' + st.loc + ' 找不到「' + frag + '」');
      if (!e.ok) throw new Error(name + '：' + st.loc + '「' + frag + '」不可点');
      const r = C.choose(st, e.ci);
      if (r.back) C.goBack(st); else if (r.to) C.go(st, r.to);
      trace.push(st.loc);
      if (expect && st.loc !== expect) throw new Error(name + '：' + at + '「' + frag + '」→ ' + st.loc + '（期望 ' + expect + '）');
    }
    return { st, trace };
  };
  const R1 = [
    ['1', '摸黑去中央大厅', '18'], ['18', '睡觉的铺位', '2'], ['2', '回中央大厅', '18'],
    ['18', '去健身房', '4'], ['4', '撬开墙上的急救箱', '4'], ['4', '回中央大厅', '18'], ['18', '去医务室', '3'],
    ['3', '把医疗包交给阿雅', '24'], ['24', '回中央大厅', '18'], ['18', '去观景厅', '5'],
    ['5', '钻到沙发后面', '5'], ['5', '追出去', '28'], ['28', '站猫罐头', '28'],
    ['28', '先回中层大厅', '20'], ['20', '坐在补给柜旁边', '20'],
    ['20', '去实验室', '7'], ['7', '帮他去找工具箱', '25'], ['25', '顺着维修爬道滑下去', '16'],
    ['16', '翻一翻零件堆', '16'], ['16', '往上爬', '7'], ['7', '自己动手', '30'],
    ['30', '把芯片收好', '16'], ['16', '回底层大厅', '21'], ['21', '去冷却塔', '13'], ['13', '用万能扳手拧上总阀', '21'],
    ['21', '乘电梯去中层', '20'], ['20', '去气闸舱', '11'], ['11', '打开安保柜', '11'], ['11', '穿上磁力靴', '19'],
    ['19', '用工具把面板焊好', '39'], ['39', '爬回气闸舱', '11'], ['11', '回中层大厅', '20'],
    ['20', '乘电梯去底层', '21'], ['21', '去太阳能控制室', '15'], ['15', '双手推上主供电闸门', '36'],
    ['36', '回底层大厅', '21'], ['21', '去反应堆舱', '12'], ['12', '启动反应堆', '34'],
    ['34', '去应急逃生舱口', '40'], ['40', '揭发他', '41']
  ];
  const ROUTES = [
    ['主线·结局A', R1, null, '41'],
    ['收贿线·伏击', [['10', '收下他亮出来的星币', '33'], ['33', '回仓库看看', '10'], ['10', '先退出去', '20'],
      ['20', '乘电梯去底层', '21'], ['21', '去反应堆舱', '12'], ['12', '舱门', '29']], null, '29'],
    ['氧气死亡', [['21', '去冷却塔', '44']], s => { s.oxygen = 5; }, '44'],
    ['保险柜线', [['9', '转动密码盘', '45']], s => { s.learned['保险柜密码'] = true; s.items.push('工牌'); }, '45'],
    ['结局C·撤离', [['17', '按下发射钮', '43']], s => { s.learned['逃生舱检查过'] = true; s.learned['已广播集合'] = true; }, '43'],
    ['败北·结局B', [['40', '拦住他的无人机', '42']], null, '42']
  ];
  const bad = [];
  ROUTES.forEach(([name, seq, mut, end]) => {
    try {
      const r = runRoute(name, seq, mut);
      if (end === '29') { if (r.st.loc !== '29' || !D.nodes['29'].fail) bad.push(name + '：未进失败结算'); }
      else if (end === '44') { if (!r.st.bankrupt || r.st.zeroRes !== 'oxygen') bad.push(name + '：未触氧气失败'); }
      else if (r.st.loc !== end) bad.push(name + '：停在 ' + r.st.loc);
    } catch (e) { bad.push(e.message); }
  });
  eq(bad.join(' ｜ '), '', 'L6② 回放：六路线（主线／收贿／氧气死亡／保险柜／结局C／败北结局B）全程前提可达');
  P('L6 回放：六路线逐条走通（每步的可见选项都可点——无隐藏前置墙）');
}

/* --- B66 三厅复访短提示：两分支顺序＋词面（复电版在前、走熟版在后；先匹配者为准） --- */
{
  const HALLS = { '18': ['2', '3', '4', '5'], '20': ['6', '7', '8', '9', '10', '11'], '21': ['12', '13', '14', '15', '16', '17'] };
  const bad = [];
  Object.keys(HALLS).forEach(id => {
    const n = D.nodes[id];
    const rows = n.tIf || [];
    if (rows.length !== 2) { bad.push(id + ' 号 tIf 行数 ' + rows.length + '（期望 2）'); return; }
    const fresh = C.newState('normal');
    if (C.nodeText(fresh, n) !== n.t) bad.push(id + ' 号首访未用全文');
    const back = C.newState('normal'); back.visited[HALLS[id][0]] = true;
    const t = C.nodeText(back, n);
    if (t !== rows[1].t) bad.push(id + ' 号去过本层后未用短提示');
    if (t === n.t) bad.push(id + ' 号短提示与全文同文（未做精简）');
    if (t.indexOf('你已经走熟了') < 0 || t.indexOf('都在老地方') < 0) bad.push(id + ' 号短提示词面不符');
    if (JSON.stringify(rows[1].cond) !== JSON.stringify({ any: HALLS[id].map(x => ({ pinsAll: [x] })) })) bad.push(id + ' 号短提示 cond 不符');
    /* 复电态（先匹配者为准）：复电版接管（两版不同文，不重复同一段全文） */
    const pw = C.newState('normal'); pw.learned['全站复电'] = true;
    if (C.nodeText(pw, n) !== rows[0].t) bad.push(id + ' 号复电后未用复电版');
    if (rows[0].t === rows[1].t) bad.push(id + ' 号两分支文相同');
  });
  eq(bad.join(' ｜ '), '', 'B66：三厅（18/20/21）复访短提示——首访全文→走熟短提示／复电版；两版不同文（不重复同一段全文）');
}

/* --- B70~B77：B03 各轮落点抽查（数据面） --- */
{
  const find = (id, frag) => (D.nodes[id].c || []).find(ch => (ch.l || '').indexOf(frag) >= 0) || {};
  /* B70 · 25 en 去 learn（保留 once） */
  eq(JSON.stringify(D.nodes['25'].en), JSON.stringify({ once: true }), 'B70：25 号 en＝{ once: true }（去掉 learn）');
  /* B71 · 委托去线索化：7① learn 字段不再含 老布的委托 */
  const c71 = find('7', '帮他去找工具箱');
  ok(!(c71.fx && c71.fx.learn && [].concat(c71.fx.learn).indexOf('老布的委托') >= 0), 'B71：7① 不再 learn「老布的委托」');
  /* B72 · 8② once（查单做过即隐） */
  eq(find('8', '查一查被改过的货单').once, true, 'B72：8② 查单带 once');
  /* B73 · 7 号持芯片态：成事条需先有「维修爬道路线」（16④/23 号授）且手头无芯片 */
  ok(JSON.stringify(find('7', '打开工具柜').cond).indexOf('维修爬道路线') >= 0, 'B73：7② cond 需「维修爬道路线」（先走爬道或问糖糖）');
  ok(JSON.stringify(find('7', '打开工具柜').cond).indexOf('control') < 0 && JSON.stringify(find('7', '打开工具柜').cond).indexOf('控制芯片') >= 0,
    'B73：7② cond 含 noItem 控制芯片');
  /* B74 · 三厅 tIf 复电版置首（三厅＋1/6 号） */
  ['1', '6', '18', '20', '21'].forEach(id => eq(JSON.stringify(D.nodes[id].tIf[0].cond), JSON.stringify({ knows: '全站复电' }), 'B74：' + id + ' 号 tIf 首行＝复电版'));
  /* B76 · 三厅短提示不抢首（tIf[0] 是复电版、tIf[1] 是走熟版） */
  ok(D.nodes['18'].tIf[0].t !== D.nodes['18'].tIf[1].t && D.nodes['18'].tIf[0].t.length > D.nodes['18'].tIf[1].t.length, 'B76：18 号两版顺序＝复电版在前、短提示在后');
  /* B75 · 序章第三句＝打工动机（序列化检查） */
  ok(D.meta.prologue.lines.join('').indexOf('兜里还有实习攒下的星币') >= 0, 'B75：序章第三句＝兜里还有实习攒下的星币');
  /* B77 · 资源定义：氧气 bar 标记（HUD 分段条数据面） */
  ok(!!D.resources.find(r => r.id === 'oxygen' && r.bar === true), 'B77：oxygen 资源带 bar:true（HUD 分段条数据面）');
  /* B65/B67/B68 · 已并入 14-1/14-3；此处抽查 9① −10 与 3② 去 once */
  eq(find('9', '转动密码盘').fx.oxygen, -10, 'B65：9① 开柜 −10（数据面）');
  ok(!find('3', '问阿雅').once, 'B68：3② 去 once（可重复征询）');
  /* 23 号正文含「她交代过」（源文照抄；括号疑似 typo 未擅改——见交付报告） */
  ok(D.nodes['23'].t.indexOf('她交代过') >= 0, 'B03 源文照抄：23 号正文含「她交代过」');
}


/* --- 15-6 B03 可见性两态（证据：全关零灰显；「没做到」→ 失败条原地 say；「做过」→ 隐） --- */
{
  /* ① 4② 由「锁」改判据：未去过 25（未认识铁头）⇒ 整条不出现（连灰显都不出现） */
  const i42 = D.nodes['4'].c.findIndex(ch => (ch.l || '').indexOf('请他帮忙打开仓库') >= 0);
  const st = C.newState('normal'); st.loc = '4';
  ok(!C.visibleChoices(st).find(x => x.ci === i42), 'B03：4② 未去过 25 ⇒ 整条不出现（不再灰显）');
  const st2 = C.newState('normal'); st2.loc = '4'; st2.visited['25'] = true;
  ok(!!C.visibleChoices(st2).find(x => x.ci === i42 && x.ok), 'B03：4② 去过 25（pinsAll 25）⇒ 可见可点');
  /* ② 10① 未开门：可见的反馈条接管（可点、原地）；开门后：成事条出、反馈条隐 */
  const st3 = C.newState('normal'); st3.loc = '10';
  const v3 = C.visibleChoices(st3).filter(x => (x.label || '').indexOf('搬一罐冷却剂') >= 0);
  ok(v3.length === 1 && v3[0].ok, 'B03：10① 未开门 ⇒ 可见一条（反馈条可点）');
  const st4 = C.newState('normal'); st4.loc = '10'; st4.learned['铁头已开门'] = true;
  const v4 = C.visibleChoices(st4).filter(x => (x.label || '').indexOf('搬一罐冷却剂') >= 0);
  ok(v4.length === 1 && v4[0].ok, 'B03：10① 开门后 ⇒ 可见一条（成事条）');
  /* ③ 全关不变量：本关任何条目在任何状态下都不会落到 'lock'（灰显态）——判定单点 Core.choiceState */
  const lockHits = [];
  const full = C.newState('normal');
  Object.keys(D.nodes).forEach(id => {
    full.loc = id;
    (D.nodes[id].c || []).forEach((ch, i) => { if (C.choiceState(full, ch) === 'lock') lockHits.push(id + '#' + i); });
  });
  eq(lockHits.join(','), '', 'B03：全关扫描——任何条目都不会判成灰显（lock 态 0 处）');
  /* 引擎侧能力保留（不在本关数据里用）：choiceState 对 lock／lockIf 仍会返回 'lock' */
  eq(C.choiceState(C.newState('normal'), { lock: true, cond: { knows: '不存在的标记' } }), 'lock', 'B03：引擎侧 lock 能力保留（数据不用，能力不拆）');
  ok(C.choiceState(C.newState('normal'), { lockIf: { knows: '不存在的标记' }, cond: { knows: '不存在的标记' } }) === 'hide',
    'B03：引擎侧 lockIf 分支仍在（cond 假＋lockIf 假 ⇒ hide）');
  P('B03 可见性两态：整条不出现（未认识）⇄ 可点（含反馈条）——本关旧「灰显＋lockText」面全废');
}

/* --- 15-6b B03 失败条零代价（行为面：实跑，不只看形状）--- */
{
  /* 形状对≠行为对：12/13/19 的 en 都是「每次进入扣氧」，若失败条 `to` 自指被当成一次进入，
   * 点一次失败反馈就白扣一次氧。此处逐条实跑（choose ＋ Core.move＝与网页/CLI 同一条收口）。 */
  const bad = [], n = [];
  Object.keys(D.nodes).sort((a, b) => a - b).forEach(id => {
    const node = D.nodes[id];
    (node.c || []).forEach((ch, ci) => {
      const isFail = !!ch.say && !ch.fx && !ch.once && !ch.toIf && !ch.back && !ch.battle && !ch.random && ch.to === id;
      if (!isFail) return;
      n.push(id + '#' + ci);
      const st = C.newState('normal');
      st.loc = id; st.visited[id] = true;
      const snap = JSON.stringify({ o: st.oxygen, c: st.coins, i: st.items, l: st.learned, v: st.visited });
      const r = C.choose(st, ci);
      const ev = C.move(st, r);
      const after = JSON.stringify({ o: st.oxygen, c: st.coins, i: st.items, l: st.learned, v: st.visited });
      if (after !== snap) bad.push(id + '#' + ci + '（资源/物品/线索/访问被改）');
      if ((ev || []).length) bad.push(id + '#' + ci + '（原地却带进入日志：' + ev.join('、') + '）');
      if (st.loc !== id) bad.push(id + '#' + ci + '（跑了：' + st.loc + '）');
    });
  });
  eq(bad.join(' ｜ '), '', 'B03 行为面：全 ' + n.length + ' 条失败条实跑一次 ⇒ 原地不动、资源/物品/线索零变化（零代价）');
  /* 反向：真实跨节点进入仍按「每次进入」扣费（12/13/19），别把维修口一并关了 */
  const s1 = C.newState('normal'); s1.loc = '21'; C.go(s1, '12'); const o1 = s1.oxygen;
  C.go(s1, '21'); C.go(s1, '12');
  ok(o1 === 90 && s1.oxygen === 80, 'B03 反向：12 号「每次进入 −10」仍在（21→12 两次：90 → 80）');
  const s2 = C.newState('normal'); s2.loc = '18'; C.go(s2, '13');
  const s3 = C.newState('normal'); s3.loc = '20'; C.go(s3, '19');
  ok(s2.oxygen === 95 && s3.oxygen === 85, 'B03 反向：13 号 −5、19 号 −15 的每次进入费仍在（95 / 85）');
  P('失败条零代价（行为面）：' + n.length + ' 条实跑零变化；跨节点每次进入费不受影响');
}


/* --- 15-7 §8.7-12 战斗失败（E11 loseSay + 原地） --- */
{
  const BATTLE_ROWS = [
    { id: '14', frag: '跟安保机器人过招', loseTo: '14', hit: '铁臂' },
    { id: '16', frag: '拖出来', loseTo: '16', hit: '呼' },
    { id: '26', frag: '用力', loseTo: '4', hit: '就这点劲儿' },
    { id: '40', frag: '拦住他的无人机', loseTo: '42', hit: '舱门' }
  ];
  BATTLE_ROWS.forEach(row => {
    const node = D.nodes[row.id];
    const idx = node.c.findIndex(ch => (ch.l || '').indexOf(row.frag) >= 0);
    ok(idx >= 0, row.id + ' 号战斗选项在（' + row.frag + '）');
    const ch = node.c[idx];
    ok(!!ch.battle && ch.battle.loseTo === row.loseTo, row.id + ' 号败北去向 = ' + row.loseTo + '（' + (row.loseTo === '42' ? '登记迁移' : '原地') + '）');
    ok(typeof ch.battle.loseSay === 'string' && ch.battle.loseSay.length > 10, row.id + ' 号带 battle.loseSay 败方描写');
    const st = C.newState('normal');
    st.loc = row.id; st.visited[row.id] = true;
    const r = C.choose(st, idx);                       // 武力 0 打不过（四场对手武力 1/3/6）
    eq(r.to, row.loseTo, row.id + ' 号败北 → ' + row.loseTo + '（引擎结算）');
    ok((r.log || []).some(x => x.indexOf('你输了') >= 0), row.id + ' 号败北机械行在 log（在 loseSay 之前）');
    ok(typeof r.say === 'string' && r.say.indexOf(row.hit) >= 0, row.id + ' 号败方描写随 say 渠道带出（E11）');
  });
  /* 26① −5＝掰手腕唯一载体：4① 不另扣（两处不同时收费） */
  const c4 = D.nodes['4'].c.find(ch => (ch.l || '').indexOf('掰手腕') >= 0);
  const c26 = D.nodes['26'].c[0];
  eq(c4.fx, undefined, '4① 掰手腕入口不另扣氧（载体唯一，B18）');
  eq((c26.fx || {}).oxygen, -5, '26① 掰手腕 −5 氧（唯一载体，B18）');
  /* 真走一遍败北：4 → 26 打输 → 回 4（原地） */
  let s = C.newState('normal');
  C.go(s, '4');
  const i26 = D.nodes['4'].c.findIndex(ch => (ch.l || '').indexOf('掰手腕') >= 0);
  C.choose(s, i26); C.go(s, '26');
  const rLose = C.choose(s, 0);
  eq(rLose.to, '4', '掰手腕败北 → 回健身房');
  C.go(s, rLose.to);
  eq(s.loc, '4', '败北停留原地：回健身房后还在 4（不是大厅）');
  eq(s.oxygen, 95, '掰手腕败北也扣 −5（败了也费，B18）');
  P('战斗失败：4 场 loseSay＋原地（14/16/26）＋登记迁移（40③→42）；26① 唯一载体');
}

/* --- 15-8 §8.7-13 四号探索化 --- */
{
  ok(!D.nodes['4'].en, '4 号无进入效果（不再自动扣氧发物，B03）');
  const box = D.nodes['4'].c.find(ch => (ch.l || '').indexOf('撬开墙上的急救箱') >= 0);
  const help = D.nodes['4'].c.find(ch => (ch.l || '').indexOf('请铁头搭把手') >= 0);
  ok(!!box && box.fx.oxygen === -5 && (box.fx.gain || []).indexOf('医疗包') >= 0 && box.once === '急救箱开过',
    'B02-13：③撬箱＝显式选项（−5 氧、得医疗包、once 急救箱开过）');
  ok(!!help && !(help.fx || {}).oxygen && (help.fx.gain || []).indexOf('医疗包') >= 0 && help.once === '急救箱开过',
    'B02-13：④请铁头搭手＝0 氧（代劳）、共享同一 once 标记（天然互斥）');
  ok(help.cond && JSON.stringify(help.cond).indexOf('pinsAll') >= 0 && help.cond.all[0].pinsAll[0] === '26',
    'B03：④ 前置＝去过 26（掰腕赢过 → 铁头开门）');
  const st4 = C.newState('normal');
  st4.visited['26'] = true;
  C.go(st4, '4');
  ok(C.condOk(st4, help.cond), 'B03：去过 26 ⇒ ④ 可点');
  C.choose(st4, D.nodes['4'].c.indexOf(help));
  ok(C.hasItem(st4, '医疗包'), 'B03：④ 拿到医疗包');
  eq(st4.oxygen, 100, 'B03：④ 代劳不扣自己的氧（0）');
  ok(!C.visibleChoices(st4).some(x => (x.label || '').indexOf('撬开墙上的急救箱') >= 0), 'B03：④ 走过后 ③ 同步隐藏（共享标记）');
  /* B03 复盘修正：已开门态（27 = 铁头把仓库门打开了）下——④ 与其失败条齐隐、③ 仍在（把解释摆到已发生之后） */
  const st5 = C.newState('normal'); st5.loc = '4'; st5.visited['26'] = true; st5.learned['铁头已开门'] = true;
  const v5 = C.visibleChoices(st5).filter(x => (x.label || '').indexOf('请铁头搭把手') >= 0);
  ok(v5.length === 1 && v5[0].ok, 'B03：已开门态 ⇒ 4④ 成事条仍可点（人熟、门开着，照样搭手）');
  ok(!C.visibleChoices(st5).some(x => isFailEntry(x.raw || {}, '4')), 'B03：已开门态 ⇒ 4④ 反馈条已隐');
  const v5b = C.visibleChoices(st5).filter(x => (x.label || '').indexOf('撬开墙上的急救箱') >= 0);
  ok(v5b.length === 1 && v5b[0].ok, 'B03：已开门态 ⇒ 4③ 仍在（没拿包就给③）');
  P('4 号探索化：en 删除；③/④ 双路显式、条件与共享 once、已开门态 均通过');
}

/* --- 15-9 §8.7-14 机制落点 --- */
{
  const find = (id, frag) => (D.nodes[id].c || []).find(ch => (ch.l || '').indexOf(frag) >= 0) || {};
  /* 去向修正 4 处（B16/B17/B20/B21） */
  eq(find('24', '回医务室看看').to, '3', 'B02-14：24② → 3（同层修正）');
  eq(find('25', '顺着维修爬道滑下去').to, '16', 'B02-14：25① → 16（爬道滑降）');
  eq(find('30', '把芯片收好').to, '16', 'B02-14：30① → 16（滑回维修区）');
  eq(find('38', '再看看维修区').to, '16', 'B02-14：38① → 16（留存）');
  /* 新增退出/回访选项 9 处（B18/B19/B24~B30；B03：32 号出口按圣经 §7.32 ＝「再看看仓库。」） */
  [['23', '回指挥舱', '6'], ['26', '先不掰了', '4'], ['28', '推开仓库', '10'], ['31', '回仓库看看', '10'],
   ['32', '再看看仓库', '10'], ['33', '回仓库看看', '10'], ['36', '再看看控制室', '15'], ['39', '再看一眼新面板', '19'], ['45', '回站长室里看看', '9']]
    .forEach(([id, frag, to]) => eq(find(id, frag).to, to, `B02-14：新去向 ${id}「${frag}」→ ${to}`));
  /* B03：可见性字段（lock／lockIf／lockText）全关 ＝ 0——判定单点保留在引擎侧（本关数据不用） */
  const lockFields = [];
  Object.keys(D.nodes).forEach(id => (D.nodes[id].c || []).forEach((ch, i) => {
    if (ch.lock) lockFields.push('lock:' + id + '#' + i);
    if (ch.lockIf) lockFields.push('lockIf:' + id + '#' + i);
    if (ch.lockText) lockFields.push('lockText:' + id + '#' + i);
  }));
  eq(lockFields.join(','), '', 'B03：全关 lock／lockIf／lockText ＝ 0 处（B02 的 16＋10 清单作废）');
  /* 完成态谓词（B03 收口）：成事条在完成后 cond 恒假（谓词存在即证） */
  const DONE_CONDS = [
    ['13', '拧上总阀', '冷却剂罐'], ['10', '搬一罐冷却剂', '冷却剂罐'], ['7', '打开工具柜', '控制芯片'],
    ['16', '红漆工具箱', '控制芯片'], ['16', '换上一节新电池', '机器人小帮手'],
    ['19', '用工具把面板焊好', '太阳能板已修好'], ['15', '推上主供电闸门', '全站复电'],
    ['12', '启动反应堆', '反应堆已重启']
  ];
  DONE_CONDS.forEach(([id, frag, key]) => {
    const s = C.newState('normal'); s.loc = id;
    s.items.push(key); s.learned[key] = true;
    ok(!C.condOk(s, find(id, frag).cond), `B03：完成态谓词——${id}「${frag}」在 ${key} 完成后 cond 恒假`);
  });
  /* B03：公共完成态谓词——4② 用 pinsAll 25（去过实验室见老布＝有了由头）；4④ 用 pinsAll 26（去过 26＝掰腕赢过） */
  eq(JSON.stringify(find('4', '请他帮忙打开仓库').cond),
    JSON.stringify({ all: [{ pinsAll: ['25'] }, { noKnows: '铁头已开门' }] }), 'B03：4② cond＝pinsAll 25 ＋ noKnows 铁头已开门');
  ok(JSON.stringify(D.nodes['4'].c.find(ch => (ch.l || '').indexOf('请铁头搭把手') >= 0).cond).indexOf('pinsAll') >= 0,
    'B03：4④ cond 含 pinsAll 26');
  /* B03：6 处替换锁为判据的站點——原 lockIf 名单对应条目均有谓词 */
  [['3', '把医疗包交给阿雅'], ['7', '打开工具柜'], ['12', '启动反应堆'], ['15', '推上主供电闸门'], ['19', '用工具把面板焊好'], ['28', '站猫罐头']]
    .forEach(([id, frag]) => ok(condHasDonePred(find(id, frag).cond), `B03：${id}「${frag}」带完成态谓词（原 lockIf → 谓词）`));
  /* once 新增/收口抽查（B07/B09/B10/B12/B13/B15/B19 ＋ B03：8②/28） */
  [['8', '对一对'], ['8', '广播'], ['8', '查一查被改过的货单'], ['12', '照一照堆芯'], ['13', '拧上总阀'], ['15', '推上主供电闸门'], ['16', '换上一节新电池'], ['19', '用工具把面板焊好'], ['28', '站猫罐头']]
    .forEach(([id, frag]) => ok(find(id, frag).once === true, `B02-14：once 收口——${id}「${frag}」带 once`));
  /* 31/32 en learn（收口轮核定） */
  eq(D.nodes['31'].en.learn, '桑尼翻脸了', 'B02-14：31 en learn＝桑尼翻脸了');
  eq(D.nodes['32'].en.learn, '桑尼认栽了', 'B02-14：32 en learn＝桑尼认栽了');
  /* 8 号 en 删除 / 走私暗号只在 22（B07）；6 号 en.once＝幕标题卡锚点（B23） */
  ok(!D.nodes['8'].en, 'B02-14：8 号 en 已删除（货单两态：对单 / 查单）');
  ok(!!D.nodes['22'].en && D.nodes['22'].en.learn === '走私暗号', 'B02-14：走私暗号唯一来源＝22 号电话');
  eq(JSON.stringify(D.nodes['6'].en), JSON.stringify({ once: true }), 'B02-14：6 号 en＝{ once: true }（幕标题卡锚点）');
  P('机制落点：去向 4 / 新去向 9 / 可见性字段 0 处 / 完成态谓词 11＋替换站点 6 / once 9 / learn 2 逐条通过');
}

/* ============ 16. B02-QA 修正轮（B40~B59）落点与分版 ============ */
console.log('');
console.log('———— B02-QA 修正轮：12 号三态 / 41 证据分版 / 43 分版 / 缺项灰字 / 名称统一 / 文案落点 ————');

/* --- 16-1 12 号两态表（B03 重订：三态 × ②③④——灰显取消，一律「可见一条（可点）⇄ 隐」） --- */
{
  const c12 = D.nodes['12'].c;
  const cell = (s, frag) => {
    s.loc = '12';
    const v = C.visibleChoices(s).filter(x => (x.label || '').indexOf(frag) >= 0);
    return v.length + ':' + (v.length ? (v.every(x => x.ok) ? '可点' : '不可点') : '隐');
  };
  const FRAG_START = '启动反应堆', FRAG_TORCH = '照一照堆芯', FRAG_EXIT = '回底层大厅';
  const s1 = C.newState('normal');
  const s2 = C.newState('normal'); s2.learned['收了桑尼的贿赂'] = true;
  const s3 = C.newState('normal'); s3.learned['反应堆已重启'] = true;
  P('12 号两态表（②③④）：未收贿未重启 ' + cell(s1, FRAG_START) + '/' + cell(s1, FRAG_TORCH) + '/' + cell(s1, FRAG_EXIT) +
    ' ｜ 已收贿 ' + cell(s2, FRAG_START) + '/' + cell(s2, FRAG_TORCH) + '/' + cell(s2, FRAG_EXIT) +
    ' ｜ 已重启 ' + cell(s3, FRAG_START) + '/' + cell(s3, FRAG_TORCH) + '/' + cell(s3, FRAG_EXIT));
  /* 态①：未收贿未重启 ⇒ ②③ 均出「缺东西」反馈条（可点、不是灰显）；④ 可点 */
  eq(cell(s1, FRAG_START), '1:可点', 'B03 12 号①：② 缺件缺电 ⇒ 一条（缺东西反馈条，可点）');
  eq(cell(s1, FRAG_TORCH), '1:可点', 'B03 12 号①：③ 缺手电 ⇒ 一条（反馈条，可点）');
  const s1b = C.newState('normal'); s1b.items.push('控制芯片', '冷却剂罐', '站长授权卡'); s1b.learned['全站复电'] = true;
  eq(cell(s1b, FRAG_START), '1:可点', 'B03 12 号①：三件齐＋复电 ⇒ ② 一条（成事条）');
  const s1c = C.newState('normal'); s1c.items.push('手电');
  eq(cell(s1c, FRAG_TORCH), '1:可点', 'B03 12 号①：③ 有手电 ⇒ 一条（成事条）');
  eq(cell(s1, FRAG_EXIT), '1:可点', 'B03 12 号①：④ 可点（全态出口）');
  /* 态②：已收贿 ⇒ ②③ 整条不出现、④ 可点、正文＝收贿版；① 伏击保留 */
  eq(cell(s2, FRAG_START), '0:隐', 'B03 12 号②（已收贿）：② 整条不出现');
  eq(cell(s2, FRAG_TORCH), '0:隐', 'B03 12 号②：③ 收贿一律不出现');
  eq(cell(s2, FRAG_EXIT), '1:可点', 'B03 12 号②：④ 可点（R4 全态出口）');
  ok(C.visibleChoices(s2).some(x => x.ci === 0), '12 号②：① 伏击保留（收贿后进舱仍触发 29）');
  ok(C.nodeText(s2, D.nodes['12']).indexOf('这条线，断了') >= 0, '12 号②：正文＝收贿版（后果说明）');
  /* 态③：已重启 ⇒ ② 不出现、③ 仍可（手电决定成事／反馈）、④ 可点、正文＝重启版 */
  eq(cell(s3, FRAG_START), '0:隐', 'B03 12 号③（已重启）：② 整条不出现');
  eq(cell(s3, FRAG_TORCH), '1:可点', 'B03 12 号③：③ 仍可见（没手电 ⇒ 反馈条）');
  const s3b = C.newState('normal'); s3b.learned['反应堆已重启'] = true; s3b.items.push('手电');
  eq(cell(s3b, FRAG_TORCH), '1:可点', 'B03 12 号③：③ 有手电 ⇒ 成事条');
  eq(cell(s3, FRAG_EXIT), '1:可点', 'B03 12 号③：④ 可点');
  ok(C.nodeText(s3, D.nodes['12']).indexOf('三个接口都插好了') >= 0, '12 号③：正文＝重启版');
}

/* --- 16-2 41 号：证据 4 档 × 广播 2 档（B57；条件显式互斥、先匹配者为准） --- */
{
  const t41 = D.nodes['41'].tIf;
  eq(t41.length, 8, '41 号：tIf 恰 8 条（证据 4 档 × 广播 2 档）');
  const COMBOS = [
    [['桑尼的账本', '监控回放'], true, '监控里那只手', '站长'],
    [['桑尼的账本', '监控回放'], false, '监控里那只手', '一个轻柔的声音'],
    [['桑尼的账本'], true, '「猫粮」进、「矿石」出', '站长'],
    [['桑尼的账本'], false, '「猫粮」进、「矿石」出', '一个轻柔的声音'],
    [['监控回放'], true, '拉下了主供电的保险丝', '站长'],
    [['监控回放'], false, '拉下了主供电的保险丝', '一个轻柔的声音'],
    [[], true, '人赃并获', '站长'],
    [[], false, '人赃并获', '一个轻柔的声音']
  ];
  const bad = [];
  COMBOS.forEach(([items, p24, fragA, fragB], k) => {
    const s = C.newState('normal'); s.items = items.slice();
    if (p24) s.visited['24'] = true;
    const hits = t41.map((x, i) => C.condOk(s, x.cond) ? i : -1).filter(i => i >= 0);
    if (hits.join(',') !== String(k)) { bad.push(k + '→' + hits.join(',')); return; }
    if (t41[k].t.indexOf(fragA) < 0 || t41[k].t.indexOf(fragB) < 0) bad.push(k + ' 词面');
  });
  eq(bad.join(' ｜ '), '', '41 号分版：8 档逐档命中唯一分支（证据词面 × 广播发言人两维正确）');
  eq(D.nodes['41'].t, t41[7].t, '41 号默认正文＝无证据×未救站长版（兜底，B57）');
}

/* --- 16-3 43 号：重启 × 站长 4 版（B58） --- */
{
  const t43 = D.nodes['43'].tIf;
  eq(t43.length, 4, '43 号：tIf 恰 4 条（重启 × 站长）');
  const COMBOS = [
    [true, true, '点亮', '站长'],
    [true, false, '点亮', '身旁的人拍拍你的肩'],
    [false, true, '熄灭', '站长'],
    [false, false, '熄灭', '身旁的人拍拍你的肩']
  ];
  const bad = [];
  COMBOS.forEach(([restart, p24, fragA, fragB], k) => {
    const s = C.newState('normal');
    if (restart) s.learned['反应堆已重启'] = true;
    if (p24) s.visited['24'] = true;
    const hits = t43.map((x, i) => C.condOk(s, x.cond) ? i : -1).filter(i => i >= 0);
    if (hits.join(',') !== String(k)) { bad.push(k + '→' + hits.join(',')); return; }
    if (t43[k].t.indexOf(fragA) < 0 || t43[k].t.indexOf(fragB) < 0) bad.push(k + ' 词面');
  });
  eq(bad.join(' ｜ '), '', '43 号分版：4 档逐档命中唯一分支（星体两版＋发言人两版）');
  eq(D.nodes['43'].t, t43[3].t, '43 号默认正文＝未重启×未救站长版（兜底，B58）');
}

/* --- 16-4 17③ / 40④：双失败条代替灰字（QA ④-3 → B03 重订） --- */
{
  const f17 = D.nodes['17'].c.filter(ch => (ch.l || '').indexOf('按下发射钮') >= 0);
  const f40 = D.nodes['40'].c.filter(ch => (ch.l || '').indexOf('放下反应堆') >= 0);
  eq(f17.length + ',' + f40.length, '3,3', 'B03 ④-3：17③/40④ 均为「成事＋双反馈条」（两缺项各一条）');
  ok(f17[1].say.indexOf('还空着') >= 0 && f17[2].say.indexOf('还不知道要走') >= 0 &&
     f40[1].say.indexOf('还没检完') >= 0 && f40[2].say.indexOf('还不知道要走') >= 0,
    'B03 ④-3：17/40 双反馈条文案覆盖两缺项（检查／广播）');
  eq(JSON.stringify(f17[0].cond), JSON.stringify(f40[0].cond), '两条撤离入口前置仍完全一致（检查过＋已广播）');
  /* 两缺项→先报检查；只缺广播→报广播；两项齐→成事条 */
  const mk = (learned) => { const s = C.newState('normal'); s.loc = '40'; learned.forEach(k => { s.learned[k] = true; }); return C.visibleChoices(s).filter(x => (x.label || '').indexOf('放下反应堆') >= 0); };
  eq(mk([]).length + ':' + mk([])[0].ci, '1:' + D.nodes['40'].c.indexOf(f40[1]), 'B03 ④-3：两缺项 ⇒ 恰第一条反馈条（先报检查）');
  eq(mk(['逃生舱检查过']).length + ':' + mk(['逃生舱检查过'])[0].ci, '1:' + D.nodes['40'].c.indexOf(f40[2]), 'B03 ④-3：只缺广播 ⇒ 第二条反馈条');
  const vBoth = mk(['逃生舱检查过', '已广播集合']);
  ok(vBoth.length === 1 && vBoth[0].ok && vBoth[0].ci === D.nodes['40'].c.indexOf(f40[0]), 'B03 ④-3：两项齐 ⇒ 成事条可点');
}


/* --- 16-5 名称统一（QA ⑤-5）：通道＝维修爬道、道具＝焊接枪（值＋对象键两面同扫） --- */
{
  const bad = [];
  const hit = (s, ptr) => {
    if (s.indexOf('检修爬道') >= 0) bad.push(ptr + '：检修爬道');
    if (s.indexOf('焊枪') >= 0) bad.push(ptr + '：焊枪');
  };
  (function walk(v, ptr) {
    if (typeof v === 'string') { hit(v, ptr); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, ptr + '[' + i + ']')); return; }
    if (v && typeof v === 'object') Object.keys(v).forEach(k => { hit(k, ptr + '.' + k + '（键）'); walk(v[k], ptr + '.' + k); });
  })(D, 'station');
  eq(bad.join(' ｜ '), '', 'QA ⑤-5：数据面「检修爬道」「焊枪」零残留（值＋键；维修爬道／焊接枪）');
}

/* --- 16-6 B40~B59 文案落点速查（数据面；B03 改：lockText 面已废——指向语料改由反馈条 say 承担） --- */
{
  const has = (s, sub) => (s || '').indexOf(sub) >= 0;
  const ch = (id, frag) => (D.nodes[id].c || []).find(x => (x.l || '').indexOf(frag) >= 0) || {};
  const gas = id => (D.nodes[id].c || []).map(x => x.say || '').join('\n');   // 节点全部反馈语料池
  const cases = [
    ['B40：4 号药箱分叉中性化', has(D.nodes['4'].tIf[1].t, '药箱开了') && !has(D.nodes['4'].tIf[1].t, '撬开啦')],
    ['B66：7② 工具柜文案直说＋7①/② 均需「无芯片」', has(ch('7', '打开工具柜').l, '自己动手') && !has(ch('7', '打开工具柜').l, '钻上来的你') &&
      has(JSON.stringify(ch('7', '打开工具柜').cond), '控制芯片') && has(JSON.stringify(ch('7', '打开工具柜').cond), '维修爬道路线')],
    ['B41：23 改「诀窍我教你」', has(D.nodes['23'].t, '诀窍我教你') && !has(D.nodes['23'].t, '带你钻进去')],
    ['B41：30 去「钻出来」', has(D.nodes['30'].t, '死角') && !has(D.nodes['30'].t, '钻出来')],
    ['B42：8① 两行账目＋无账本反馈', has(ch('8', '对一对').say, '「罐头」8 箱进') && has(gas('8'), '为什么是矿石')],
    ['B42/B93：8③ 广播呼应（尾句＝心里没底）', has(ch('8', '广播').say, '喊完之后，你心里反倒有点没底') && !has(ch('8', '广播').say, '把所有人带走的地方')],
    ['B43/B81：10 两缺项反馈＋收贿标签去预设', has(gas('10'), '安保科的锁') && has(gas('10'), '得先过安保那一关') && has(ch('10', '收下他亮出来的星币').l, '拿着烫手') && has(D.nodes['10'].tIf[0].t, '货架已经空了大半')],
    ['B44：11 删「流程卡」／13 删「梯子」＋②回报句', !has(D.nodes['11'].t, '流程卡') && !has(D.nodes['13'].t, '梯子') && has(gas('13'), '挂架')],
    ['B46：14③ 需小帮手／19① 工具（原 lockText 指路语料退场）',
      has(JSON.stringify(ch('14', '小帮手').cond), '机器人小帮手') && has(gas('19'), '没有能焊的家伙') &&
      !has(JSON.stringify(D.nodes['14']), '维修区里还卡着一台')],
    ['B47/B99：16 型号句分叉（写回版置首）／商店未写／④零件堆指路／37 命名',
      !has(D.nodes['16'].t, '跟糖糖一个型号') && has(D.nodes['16'].tIf[1].t, '跟糖糖一个型号') && has(D.nodes['16'].tIf[0].t, '货架底下空了') &&
      has(gas('16'), '没有能用的电池') && has(gas('16'), '也许有趁手的东西') &&
      has(D.nodes['37'].t, '小帮手') && !has(JSON.stringify(D.nodes['16']), '贩卖机')],
    ['B49：17 检查表空格＋钥匙文案', has(D.nodes['17'].t, '三个格子还空着') && has(ch('17', '按下发射钮').l, '插上逃生舱钥匙')],
    ['B50：22 臂章暗示', has(D.nodes['22'].t, '臂章') && has(D.nodes['22'].t, '货运')],
    ['B52：31 去数字', has(D.nodes['31'].t, '一把') && !has(D.nodes['31'].t, '8 枚')],
    ['B53：33 台词＋代价句', has(D.nodes['33'].t, '你就别去了') && has(D.nodes['33'].t, '比看上去的还要沉')],
    ['B89：35 调令收束', has(D.nodes['35'].t, '调令牌正面空着') && !has(D.nodes['35'].t, '调令落款')],
    ['B55/B03：36 广播音中性化＋站长版分叉', has(D.nodes['36'].t, '一个平稳的声音') && has(D.nodes['36'].tIf[0].t, '站长的声音很稳') &&
      !has(D.nodes['36'].t + D.nodes['36'].tIf[0].t, '脱离了危险') && !has(D.nodes['36'].t, '站长稳住了')],
    ['B56：40 胶囊/无人机＋暗号串线', has(D.nodes['40'].t, '三枚金色胶囊') && has(D.nodes['40'].t, '一台无人机') && has(D.nodes['40'].tIf[0].t, '全串起来了')],
    ['B94：帮助地图行去通道列举（跨层时场景图会自动切换）', has(D.help[7], '跨层时场景图会自动切换') && !has(D.help[7], '维修爬道') && !has(D.help[7], '舱外') && !has(D.help[7], '电梯')],
    ['B59：乘员表去剧透', !has(D.characters.sangni.bio, '真凶') && !has(D.characters.yilanna.bio, '失踪') && has(D.characters.pangpang.bio, '洗碗')],
    ['B03：全关零灰显——lockText 面彻底退场', !has(JSON.stringify(D), 'lockText') && !has(JSON.stringify(D), '"lock"')]
  ];
  cases.forEach(([msg, cond]) => ok(cond, 'QA 落点：' + msg));
  P('QA 文案落点：' + cases.length + ' 组逐条通过（B40~B59 数据面＋B03 改写点）');
}


/* ============ 17. B03 复检收口轮（B78~B100 ＋ 真人线 R2 四条）落点 ============ */
console.log('');
console.log('———— B03 复检收口轮：B78 星币数字 / B79 27 号兑现 / B80 构成行 / B99 发生场景 / R2 四条 ————');

/* --- 17-1 B78：星币数字口径（引擎面；界面面由 test.play ⑧ 段覆盖） --- */
{
  eq(C.payReason({ coins: 3 }, 5), '星币不够（需要 5 枚星币，还差 2 枚）', 'B78：拒付理由＝数字式（需要 N／还差 K）');
  ok(C.lockHint({ cond: { coins: 5 } }).indexOf('需要 5 枚星币') >= 0, 'B78：资源条件提示＝数字式（lockHint）');
  ok(C.lockHint({ cond: { coins: 5 } }).indexOf('底气') < 0, 'B78：「还差点底气」句退役（引擎面无残留；37 号正文「多一分底气」为叙事句，不在本项面）');
  P('B78：星币数字口径——payReason／lockHint 两处引擎面通过');
}

/* --- 17-2 B79：27 号赢家当场兑现（数据＋行为） --- */
{
  const n27 = D.nodes['27'];
  eq((n27.tIf || []).length, 1, 'B79：27 号 tIf 恰 1 行（赢家版）');
  eq(JSON.stringify(n27.tIf[0].cond), JSON.stringify({ pinsAll: ['26'] }), 'B79：赢家版 cond＝pinsAll 26（先匹配者为准）');
  ok(n27.tIf[0].t.indexOf('交过手的人') >= 0 && n27.tIf[0].t.indexOf('掰赢') < 0, 'B79：交手过版正文（父代理 2026-10-03 中性化裁定：判据不记胜负⇒不误称「掰赢」）');
  const pick = s => C.visibleChoices(s).filter(x => (x.label || '').indexOf('急救箱') >= 0);
  const s = C.newState('normal'); s.loc = '27'; s.visited['26'] = true;
  const v = pick(s);
  eq(v.length + ':' + v[0].ci, '1:0', 'B79：掰腕赢家进 27 ⇒ 兑现条恰一条、置首');
  eq(JSON.stringify(n27.c[0].cond), JSON.stringify({ all: [{ pinsAll: ['26'] }, { noItem: '医疗包' }] }), 'B79：兑现条 cond＝pinsAll 26 ＋ noItem 医疗包');
  eq(n27.c[0].once, '急救箱开过', 'B79：共享 once「急救箱开过」（与 4③/④ 天然互斥）');
  const ox = s.oxygen;
  const r = C.choose(s, v[0].ci); C.move(s, r);
  ok(C.hasItem(s, '医疗包'), 'B79：当场拿到医疗包');
  eq(s.oxygen, ox, 'B79：0 氧（赢家待遇——不扣氧气）');
  eq(s.loc, '27', 'B79：原地（留在 27，不被踢出）');
  eq(pick(s).length, 0, 'B79：兑现后本节点该条隐（once）');
  const s4 = C.newState('normal'); s4.loc = '4'; s4.visited['26'] = true; s4.chDone['急救箱开过'] = true;
  eq(C.visibleChoices(s4).filter(x => (x.label || '').indexOf('急救箱') >= 0).length, 0, 'B79：共享 once——27 兑现后 4③/④ 齐隐');
  const s2 = C.newState('normal'); s2.loc = '27';
  eq(pick(s2).length, 0, 'B79：没掰过手腕 ⇒ 兑现条不出现（无白拿）');
  const s3 = C.newState('normal'); s3.loc = '27'; s3.visited['26'] = true; s3.items.push('医疗包');
  eq(pick(s3).length, 0, 'B79：已持医疗包 ⇒ 不重复发');
  P('B79：27 号赢家当场兑现（0 氧／原地／once 共享／三态不出现）逐条通过');
}

/* --- 17-3 B80：战斗构成行（Core 面；呈现面由 test.play ⑧ 段覆盖） --- */
{
  const s0 = C.newState('normal');
  eq(C.battleBreakdown(s0, 1), '构成：无加成＝0（还差 1 点）', 'B80：零加成＝「无加成＝0（还差 1 点）」');
  const s1 = C.newState('normal'); s1.items.push('焊接枪', '电击棒');
  eq(C.battleBreakdown(s1, 3), '构成：焊接枪 +1、电击棒 +2＝3', 'B80：逐项列举＋达标（不带还差）');
  eq(C.battleBreakdown(s1, 6), '构成：焊接枪 +1、电击棒 +2＝3（还差 3 点）', 'B80：差额＝need − 现价');
  const s2 = C.newState('normal'); s2.items.push('焊接枪'); s2.learned['机器人小帮手'] = true;
  ok(C.battleBreakdown(s2, 3).indexOf('机器人小帮手 +1') >= 0, 'B80：线索加成（机器人小帮手）并入构成');
  eq(C.atkParts(s1).length, 2, 'B80：atkParts 与 atkOf 同源（两件装备 ⇒ 两条）');
  ok(C.atkOf(s1) === 3 && C.battleBreakdown(s1, 3).indexOf('＝3') >= 0, 'B80：atkOf＝构成合计（同源）');
  P('B80：构成行数据面（无加成／逐项／还差／线索加成）逐条通过');
}

/* --- 17-4 B99：28 号发生场景（显示楼层＝发生场景） --- */
{
  eq(D.nodes['28'].scene, 'deck2', 'B99：28 号声明发生场景 scene:deck2（§9.4 事件发生场景表 S2）');
  const s = C.newState('normal');
  C.go(s, '5'); eq(s.scene, 'deck1', 'B99：5 号照旧取 pin 场景（deck1）');
  C.go(s, '28'); eq(s.scene, 'deck2', 'B99：进 28 ⇒ 显示楼层切到中层（原为顶层——R2 ④-4 楼层自相矛盾）');
  C.go(s, '10'); eq(s.scene, 'deck2', 'B99：28 → 仓库（同层 deck2）');
  const s2 = C.newState('normal'); C.go(s2, '21');
  eq(s2.scene, 'deck3', 'B99：scene 字段不影响其它节点（21 = deck3）');
  P('B99：事件节点显式发生场景——28 显示楼层＝中层（不再自相矛盾）');
}

/* --- 17-5 R2 ①：编号面（数据侧锚点保留＋呈现侧过滤在工具面） --- */
{
  ok((D.nodes['18'].c || []).some(ch => (ch.l || '').indexOf('（1）') >= 0), 'R2①：数据面保留地图锚点（（1）——网页端 R09 锚点；--player 由呈现层过滤，见 test.play ⑧）');
  P('R2①：编号只从 --player 呈现层撤下（数据面锚点不动）');
}

/* --- 17-6 R2 ②：复访写回 3 处（16/14/17；自写句原文入交付报告） --- */
{
  const s16 = C.newState('normal'); s16.learned['机器人小帮手'] = true;
  ok(C.nodeText(s16, D.nodes['16']).indexOf('货架底下空了') >= 0, 'R2②：16 号已收编 ⇒ 写回版（货架底下空了）');
  ok(C.nodeText(C.newState('normal'), D.nodes['16']).indexOf('卡在货架底下') >= 0, 'R2②：16 号未收编 ⇒ 照旧（机器人还卡着）');
  const s14 = C.newState('normal'); s14.items.push('监控回放');
  ok(C.nodeText(s14, D.nodes['14']).indexOf('不再拦你') >= 0, 'R2②：14 号持监控回放 ⇒ 写回版（退到一边不再拦路）');
  ok(C.nodeText(C.newState('normal'), D.nodes['14']).indexOf('横在门口') >= 0, 'R2②：14 号首访 ⇒ 照旧（横在门口）');
  const s17 = C.newState('normal'); s17.learned['逃生舱检查过'] = true;
  ok(C.nodeText(s17, D.nodes['17']).indexOf('都打上了勾') >= 0, 'R2②：17 号查过检查表 ⇒ 写回版（三个格子都打上了勾）');
  ok(C.nodeText(C.newState('normal'), D.nodes['17']).indexOf('还空着') >= 0, 'R2②：17 号未查 ⇒ 照旧（还空着）');
  P('R2②：复访写回 3 处（16 已收编／14 持回放／17 已查表）——各自谓词下正文换版');
}

/* --- 17-7 R2 ③：24 号持卡衔接（＋不重发卡；父代理 2026-10-03 修正裁定：谓词＝持卡∧去过 45） --- */
{
  const s = C.newState('normal'); s.items.push('站长授权卡'); s.visited['45'] = true;
  const t = C.nodeText(s, D.nodes['24']);
  ok(t.indexOf('原来你早拿到了') >= 0 && t.indexOf('塞进你手里') < 0, 'R2③：从保险柜取卡后再进 24 ⇒ 衔接版（不再重演「塞进你手里」）');
  const t2 = C.nodeText(C.newState('normal'), D.nodes['24']);
  ok(t2.indexOf('塞进你手里') >= 0 && t2.indexOf('原来你早拿到了') < 0, 'R2③：首访（未去过 45）⇒ 默认交接版（en 先发卡也不误判）');
  const s2b = C.newState('normal'); s2b.items.push('站长授权卡');
  ok(C.nodeText(s2b, D.nodes['24']).indexOf('塞进你手里') >= 0, 'R2③：只持卡、未去过 45 ⇒ 仍默认版（来源面不混淆）');
  const s2 = C.newState('normal'); s2.items.push('站长授权卡');
  const before = s2.items.length;
  C.go(s2, '24');
  eq(s2.items.length, before, 'R2③：持卡进 24 ⇒ 不重复发卡（物品数不变）');
  const s3 = C.newState('normal');
  C.go(s3, '24');
  ok(C.hasItem(s3, '站长授权卡'), 'R2③：无卡进 24 ⇒ 照旧发卡');
  P('R2③：24 号持卡衔接（首访默认版／45 取卡后衔接版／不重发卡）');
}

/* --- 17-8 R2 ④：12③ 自指（门票只收一次） --- */
{
  const n12 = D.nodes['12'];
  const idx = n12.c.findIndex(ch => (ch.l || '').indexOf('照一照堆芯') >= 0 && ch.once === true);
  ok(idx >= 0, 'R2④：12③ 成事条在（带 once）');
  eq(n12.c[idx].to, '12', 'R2④：12③ 成事条 to 自指（原 to:21＝被踢出＋重复收门票）');
  const s = C.newState('normal'); s.items.push('手电');
  C.go(s, '12');                        // 进舱：扣门票 −10
  const ox = s.oxygen;
  const r = C.choose(s, idx); C.move(s, r);
  eq(s.loc, '12', 'R2④：执行 12③ ⇒ 留在反应堆舱（不被踢出）');
  eq(s.oxygen, ox, 'R2④：自指不重跑 en（门票不再收第二次）');
  ok(C.hasItem(s, '反应堆安全规程'), 'R2④：照旧拿到安全规程');
  ok(!C.visibleChoices(s).some(x => x.ci === idx), 'R2④：拿到后该条隐（once）');
  ok(C.visibleChoices(s).some(x => (x.label || '').indexOf('启动反应堆') >= 0), 'R2④：留在舱内 ⇒ 可直接接着启动反应堆');
  P('R2④：12③ 自指收口（留舱／门票只收一次／一次即隐）');
}

/* --- 17-9 B90：12 号失败词（去「序列」预设） --- */
{
  const fail12 = (D.nodes['12'].c || []).find(ch => (ch.say || '').indexOf('缺的东西，还没凑齐') >= 0);
  ok(!!fail12 && fail12.say.indexOf('你按铭牌挨个把接口试了一遍') >= 0 && fail12.say.indexOf('序列') < 0,
    'B90：12 号失败词＝「你按铭牌挨个把接口试了一遍」（去「序列」预设）；去向自指 12');
  eq(fail12 && fail12.to, '12', 'B90：失败条原地（to:12，不重跑门票）');
  P('B90：12 号失败词逐字落点');
}

/* ============ 汇总 ============ */
console.log('');
console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项。');
process.exit(fail ? 1 : 0);
