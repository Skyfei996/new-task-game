// 原创关卡《空间站大停摆》自测：node prototype/test.station.mjs
// 覆盖：多关卡加载与旧存档兼容 / 关卡数据完整性（45 点·23 道具·8 乘员·4 场景坐标与素材尺寸）
//       / 通关 A 路线完整模拟 / 三件重启物每条路径 / 氧气预算验算 / 双资源失败 / 卡死保险 / DOM id 自检
//       / §8.7 十条自动断言（断循环 / 预算 95·180·100 / 简单·困难跑通 A 与困难保险柜短线反例 /
//         结局 C 前置 / 资源不为负 / 星币不判失败 / 改名扫描 / 提示分级 lint / 文本道具 / R10~R16 落点）
//       / B02 断言 11~14：lint L1~L5（同现·once 隐藏·跨层·代价·名词首现）/ 战斗失败 loseSay＋原地 /
//         4 号探索化 / 机制落点（lockIf 16＋恒灰 10·完成态并 cond 7·去向修正 4·新去向 9·tIf 增补）
//       / B02-QA 修正轮（B40~B59）：12 号三态×②③④ / 41 证据×广播 8 版 / 43 重启×站长 4 版 /
//         17③·40④ 灰字两缺项 / 名称统一（维修爬道·焊接枪）/ 普通难度短线 80
//       / B04 老板试玩验收轮（B110~B115）：B111 4 号浮图（T41）/ B112 当前位置标记抑制 /
//         B114 站外切 T04＋19 号 pin 实测校准 / B115 选关页（难度单选＋唯一「开始」）
//       / B04 三裁轮（B117／B119 · 2026-10-04）：B119 内景接线（注册一致性／pins／进出往返／锚点／回归五条机检）
//         ＋ B117 存档三态与通关记录（storage 桩六条）
//       / B04 同框覆盖轮（B120 · 2026-10-04）：覆盖卡（同框判据／卡面 ⊇ 轮廓框＋余量／单源去 at·w／
//         换态不换位／z 序）＋ figures lint（§7.7-10）＋全站枚举零双现（§7.7-7／§10-③）＋标定通道（C 键两点定框）
//       / B04 表现体系轮（B121/B122/B123/B124/B125 · 2026-10-04）：背景状态变体（scenes[].variants——
//         判定／几何／兜底／读档／回归五条）＋同框完备性机检（§7.7-12：36 组合全分类、未登记 0）＋
//         到达提示（房间名无 🛗）＋重开确认同句＋每房自指 pin（17 房无例外；N14 标记回来）
//       / B04 扩图批到货注册轮（B126 · 2026-10-04）：T57~T72 16 条浮现图到货即注册（注册集＝到货集；
//         挂条件 3 处／两处场景声明）＋§20-5 完备性扩表 20→36＋T73 medbay-awake 的 figures 回填（N24 无同角色双现）
//       / B04 试玩系统复盘轮（B127~B131 · 2026-10-04 晨）：浮窗窗口与首访一次（§7.7-13：收窗 6／mOnce 2／
//         撤注册 5——注册表 36→31、枚举 36→31、内景锚点 33→28）＋数字圈「可点即显」（§7.7-14；自指 pin＝
//         校准锚点）＋遮罩楼层图专属（§7.7-15；17 房＋站外 mask=false）＋B131 舱外两条（N19 收窗＋N39 零浮图、删冗余选项）
//       / B04 午 撤调暗＋CG 整屏层轮（B130 重订／B132 · 2026-10-04 午）：CG 登记集 7 行（once＝3·5／keep＝41~43）＋
//         序章图（meta.prologue.image）＋层序与 contain 契约＋一次性与读档（§6.7 机检①~⑧）＋撤调暗零残留（数据/样式/引擎三面）
//       / B05 轮（B135／B136 · 2026-10-06）：29 号整屏图注册（defeat-ambush·keep）＋浮图 sangni-ambush 撤注册（登记集 9 张）＋
//         多档位存档/读档（§1.2 机检①~⑦：键／结构／读档一致／旧档与三态回归／确认句／兜底／源码契约；帮助 11→12 条）
//       / B06 轮（B137~B139 · 2026-10-06）：指路面板（§2-B137 机检①~⑪：阶梯表六态／文本约束三条／need 门／空态／
//         dalim 降级／源码契约与死局两态／第二入口三条）＋地图点名字（§2-B138 ①~③）＋已探索分楼层（§2-B139 ①~③）
//       / B07 轮（B140／B141 · 2026-10-06）：道具介绍（§2-B140 机检①~④：覆盖 23/22／句式／导出对拍／旧档）＋
//         呈现口径（§2-B141 机检①③：源码契约／回归）；lint L5/L6 扫描面收 items[].desc
//       / B09 轮（B144~B147＋⑦ · 2026-10-06）：多结局提示（§2-B144 机检①~④⑥）／记录线头（§2-B145 ①~④）／
//         任务清单（§2-B146 机检①~⑨）／难度三档（§2-B147 机检①~⑤）／10 号呼应版（老板⑦）；
//         资源与预算断言换三档（§1／§6／§8／§14：氧气 500/200/80、星币 25/20/15；可得 590/280/150）
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

/* B119（内景接线）：场景降到「房间」粒度——楼层判定统一走这两个助手。
 * floorOfScene：room-* 场景按 label（顶层/中层/底层）折算成所属层图；其它场景原样返回。
 * sceneOfId：节点当前场景＝node.scene 优先（引擎同源：Core.sceneOfNode），其次图上的 pin。 */
const FLOOR_OF_LABEL = { '顶层': 'deck1', '中层': 'deck2', '底层': 'deck3', '站外': 'exterior' };
function floorOfScene(sid, L) {
  const lv = L || D;
  const sc = sid && lv.scenes[sid];
  if (sc && /^room-/.test(sid)) return FLOOR_OF_LABEL[sc.label] || sid;
  return sid;
}
function floorOfId(id) { return floorOfScene(C.sceneOfNode(id)); }

/* ============ 1. 元信息 / 资源 ============ */
eq(D.meta.title, '空间站大停摆', '标题');
eq(D.meta.level, '你有一个新任务！· 原创 L1', '副标题');
eq(D.meta.poster, '../images/station/station-map-ai-v1.jpg', '海报图＝L0 总览图用法（站外场景图另配 scenes.exterior）');
ok(D.meta.tagline.length > 10, '有一句话简介');
eq(D.start.node, '1', '起点 1 号（食堂）');
eq(D.meta.safeNode, '18', '安全点 18 号（顶层中央大厅）');
eq(String(D.meta.winReward), 'undefined', 'B144 §2-B144-①：结算奖励字段已删（无下一关——失效即删；旧「有通关奖励文案」断言随之作废）');
eq(C.moreEndings(), true, 'B144 §2-B144-①：本关多结局判据成立（win 节点 41／42／43＝ 3 个 ≥ 2）');
eq(D.meta.atkFromClues['机器人小帮手'], 1, '收编机器人 = 武力 +1');

eq(D.resources.length, 2, '两种资源（星币 + 氧气）');
const coins = D.resources.find(r => r.id === 'coins');
const oxygen = D.resources.find(r => r.id === 'oxygen');
ok(!!coins && !!oxygen, '资源表里有 coins 与 oxygen 两条');
eq(coins.name, '星币', '货币名 = 星币（R02）');
eq(coins.icon, '🪙', '星币的图标');
eq([coins.start.easy, coins.start.normal, coins.start.hard].join('/'), '25/20/15',
  'B147 §2-B147-①：星币三档开局＝简单 25／中等 20／困难 15（旧「普通 20／困难 15」两档随之作废）');
eq(coins.fail, null, '星币 fail: null（花光不判失败，E1）');
eq(coins.noSpendToZero, undefined, 'noSpendToZero 已移除（可以花到 0）');
eq(oxygen.name, '氧气', '氧气的名字');
eq(oxygen.icon, '💨', '氧气的图标');
eq([oxygen.start.easy, oxygen.start.normal, oxygen.start.hard].join('/'), '500/200/80',
  'B147 §2-B147-①：氧气三档开局＝简单 500／中等 200／困难 80（旧「普通 100／困难 30」两档随之作废）');
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
/* 帮助（玩法说明）：B04 换新稿＋B05 增存档行＝12 条（design-ui-v1.md §8.1 照抄区）；也是 §14-7 扫描面里的「帮助」那一半 */
ok(Array.isArray(D.help) && D.help.length === 12, 'B04＋B05：帮助恰 12 条（§8.1 全文；实测 ' + ((D.help || []).length) + '）');
ok(D.help[11] === '💾 存档 / 读档：进度会自动存在这台设备上（关卡卡上的「继续」就是接着上次玩）；想「回头再试一次」，就用右上角的 💾：三个存档位，想存哪个存哪个，读取就能回到当时。',
  'B136 §8.1 第 12 条：存档行逐字（帮助 11→12 条——H2：💾 与三个存档位在）');
ok(D.help.every(l => typeof l === 'string' && l.length > 10), '帮助每一条都是完整句子');
ok(D.help.some(l => l.indexOf('星币') >= 0 && l.indexOf('20') >= 0), '帮助里有星币条目（R02）');
ok(D.help.some(l => l.indexOf('氧气条旁边的数字') >= 0 && l.indexOf('简单开局 500') >= 0 && l.indexOf('中等 200') >= 0 && l.indexOf('困难 80') >= 0),
  'B147 §2-B147-④：帮助第 2 条＝三档开局数值（500/200/80——取代「普通开局 100、困难 30」；§8.1 第 2 条）');
ok(D.help[0].indexOf('简单开局 25 枚、中等 20 枚、困难 15 枚') >= 0,
  'B147 §2-B147-④：帮助第 1 条＝三档开局数值（简单 25／中等 20／困难 15 枚）');
ok(D.help.some(l => l.indexOf('武力值＝装备加成＋伙伴加成') >= 0 && l.indexOf('焊接枪 +1') >= 0),
  'B69：帮助武力行含构成算式与四件装备');
ok(D.help.some(l => l.indexOf('👉') >= 0 && l.indexOf('剧情会告诉你为什么') >= 0), '帮助「选项」新哲学条（B03/R06；B06：第 9 条图标 🧭→👉——与指路图标消重）');
/* 资源 id 不能和状态字段撞名（资源直接住在 state 的同名字段上） */
['diff', 'me', 'items', 'visited', 'done', 'learned', 'wristband', 'hist', 'loc',
 'bankrupt', 'zeroRes', 'scene', 'flash'].forEach(k =>
  ok(!D.resources.some(r => r.id === k), '资源 id 不与状态字段撞名：' + k));
/* 开局数值走资源表 */
const stN = C.newState('normal'), stH = C.newState('hard'), stE = C.newState('easy');
eq([stE.coins, stN.coins, stH.coins].join('/'), '25/20/15', 'B147 §2-B147-②：星币开局＝startValue 单源（简单／中等／困难）');
eq([stE.oxygen, stN.oxygen, stH.oxygen].join('/'), '500/200/80', 'B147 §2-B147-②：氧气开局＝startValue 单源（简单／中等／困难）');
eq([C.newState('x').diff, C.newState().diff].join('｜'), 'normal｜normal', 'B147 §2-B147-②：难度缺省／未识别值 ⇒ 中等（旧值 normal 照读）');
eq(stN.me, '林小晨', '默认玩家名 = 林小晨');
ok(!stN.bankrupt && stN.zeroRes === null, '开局没有失败标记');

/* ============ 2. 场景与编号坐标（四楼层／站外＋十七间内景） ============ */
const PINS = {
  deck1: { '1': [358, 404], '2': [1021, 235], '3': [1452, 404], '4': [412, 729], '5': [1416, 751], '18': [896, 504] },
  deck2: { '6': [340, 336], '7': [950, 224], '8': [1523, 336], '9': [340, 695], '10': [860, 740], '11': [1416, 673], '20': [896, 471] },
  deck3: { '12': [466, 269], '13': [950, 247], '14': [1452, 359], '15': [305, 594], '16': [788, 807], '17': [1308, 717], '21': [896, 504] },
  exterior: { '19': [1505, 778] }
};
/* B119（内景 pins）：出口 pin＝本层大厅＋房内交互点（暂定值·目测取值，待手标校准回填；口径＝design-station-v1.md §4.1）
 * B125（自指 pin）：每房含 `pins[<本房节点号>]`＝标记载体（点击＝空操作）——无浮图时承担「你在这里」标记与遮罩开孔
 * （17 房无例外；坐标为暂定值·目测，随 C 键手标校准回填）。 */
const ROOM_PINS = {
  'room-galley': { '18': [1330, 690], '1': [640, 660] },
  'room-sleep': { '18': [830, 850], '2': [560, 560] },
  'room-medbay': { '18': [1330, 860], '24': [870, 470], '3': [980, 700] },
  'room-gym': { '18': [1022, 285], '26': [1240, 520], '4': [560, 760] },
  'room-observation': { '18': [830, 890], '28': [1185, 600], '5': [700, 760] },
  'room-lab': { '20': [830, 880], '25': [780, 55], '30': [300, 640], '7': [950, 700] },
  'room-comms': { '20': [850, 760], '8': [450, 520] },
  'room-cooling': { '21': [700, 870], '13': [940, 470] },
  'room-server': { '21': [830, 870], '35': [1340, 520], '14': [830, 560] },
  'room-solarctl': { '21': [830, 870], '36': [1370, 400], '15': [470, 640] },
  'room-maintenance': { '21': [900, 880], '37': [1430, 660], '7': [830, 60], '16': [1150, 780] },
  'room-escapepod': { '21': [900, 880], '17': [1425, 400], '43': [1255, 330] },
  'room-command': { '20': [700, 950], '23': [1120, 660], '6': [700, 780] },
  'room-captain': { '20': [600, 1000], '45': [770, 300], '9': [1050, 720] },
  'room-warehouse': { '20': [350, 900], '31': [1120, 450], '32': [1355, 720], '10': [620, 560] },
  'room-airlock': { '20': [900, 1010], '19': [890, 380], '11': [1180, 700] },
  'room-reactor': { '21': [900, 1000], '34': [880, 720], '12': [560, 820] }
};
eq(Object.keys(D.scenes).join(','),
  'deck1,deck2,deck3,exterior,room-galley,room-sleep,room-medbay,room-gym,room-observation,room-lab,room-comms,'
  + 'room-cooling,room-server,room-solarctl,room-maintenance,room-escapepod,'
  + 'room-command,room-captain,room-warehouse,room-airlock,room-reactor',
  '四楼层场景＋十七间内景（B119：§4.1 映射表 17 房全接线——首轮 5＋P2a 7＋P2b 5）');
const allPins = new Set();
Object.entries(Object.assign({}, PINS, ROOM_PINS)).forEach(([sid, pins]) => {
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
eq([...allPins].sort((a, b) => Number(a) - Number(b)).join(','),
  '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,25,26,28,30,31,32,34,35,36,37,43,45',
  '全部场景编号合计 35 个＝21 个地点＋14 个房内交互点事件（B119：23/24/25/26/28/30/31/32/34/35/36/37/43/45；每仍对应既有节点）');
eq(allPins.has('19'), true, '站外场景有 19 号（太阳能板阵列）');
/* 19 号 pin（B114）：按 T04 成图（`images/station/eva-v1.jpg`）实测校准——右侧下片太阳能板阵列「面板蓝」像素
 * （b>90 且 b−r>40 且 b−g>12）在 x∈[1240,1791]×y∈[520,1010] 的质心实测 (1509,778)（窗口放宽到 x≥1150 ⇒ (1502,778)；
 * 两组差 <10px ⇒ 取中值记 [1505,778]）；旧值 [760,700]（对 1520×1400 占位图）作废。
 * 板区实测范围：过质心水平线 x∈[1222,1779]，板体 y∈[520,960]——下方两条断言即据此划界。 */
const ext = D.scenes.exterior;
eq(JSON.stringify(ext.pins['19']), '[1505,778]', 'B114：19 号 pin＝按 T04 成图实测校准值');
ok(ext.pins['19'][0] >= 1222 && ext.pins['19'][0] <= 1779 && ext.pins['19'][1] >= 520 && ext.pins['19'][1] <= 960,
  'B114：19 号 pin 落在下片太阳能板阵列板区（实测 x∈[1222,1779]／y∈[520,960]）');

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
ok(D.scenes.exterior.image.indexOf('eva-v1') >= 0, 'B114：站外场景图＝T04 成图 eva-v1（占位总览图退出 exterior 位）');

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
  ok(!!ch.emoji && !!ch.img && ch.img.indexOf('images/station/chars/') >= 0,
    `人物 ${cid} 补 img（T05 切片路径）＋保留 emoji 兜底（B04/§7.6；切片未入库时回落 emoji）`);
  ok(typeof ch.bio === 'string' && ch.bio.length >= 8, `人物 ${cid} 有小传（照抄设计档 §2）`);
  const sc = D.scenes[ch.spot && ch.spot.scene];
  ok(!!sc, `人物 ${cid} 的 spot.scene 是已有场景`);
  ok(!!sc && ch.spot.x >= 0 && ch.spot.x < sc.width && ch.spot.y >= 0 && ch.spot.y < sc.height,
    `人物 ${cid} 的钉位在图内（${ch.spot && ch.spot.scene}）`);
  const near = !!sc && Object.values(sc.pins).some(p => Math.hypot(p[0] - ch.spot.x, p[1] - ch.spot.y) <= 60);
  ok(near, `人物 ${cid} 的钉位贴着对应房间的编号点`);
  const refs = Object.keys(D.nodes).filter(id => (D.nodes[id].chars || []).indexOf(cid) >= 0);
  ok(refs.length > 0, `人物 ${cid} 至少关联一个任务点（${refs.join('/')}）`);
  ok(refs.some(id => floorOfId(id) === floorOfScene(ch.spot.scene)), `人物 ${cid} 至少有一个关联点就在它的钉位楼层里（B119：楼层口径）`);
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
  C.move(st, res);   // B10：走游戏同一移动收口（Core.move——原地自指不重跑 en，同 DOM 层 doChoice；13①/③⑤・17① 留房不重复收门票）
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
  goPick('13', '用万能扳手拧上总阀'); snap('关阀');   // B10（§2-B151）：动作留房（13① 自指）——下一行＝明示出口
  goPick('13', '先回底层大厅');
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
  eq(T['开局食堂'].ox, 195, '1 食堂：黑暗摸索 −5（200→195）');
  eq(T['买满吃掉'].ox, 235, '买 4 盒吃掉 +40（195→235）');
  eq(T['买满吃掉'].coins, 0, '星币花光到 0（不判失败）');
  eq(T['睡眠舱'].ox, 245, '睡眠舱应急包净 +10（235→245）');
  ok(C.hasItem(st, '手电') && C.hasItem(st, '工牌') && C.hasItem(st, '氧气瓶'), '睡眠舱拿到 手电 / 工牌 / 氧气瓶');
  eq(T['健身房'].ox, 240, '健身房撬急救箱 −5（240）');
  ok(!C.hasItem(st, '医疗包'), '医疗包在 3① 交给阿雅时被消耗（不留在背包）');
  eq(T['医务室'].ox, 245, '医务室氧气站净 +5（245）');
  ok(C.hasItem(st, '站长授权卡'), '拿到站长授权卡（路径①：阿雅）');
  eq(T['见胖胖'].ox, 240, '观景厅打招呼（钻沙发 −5）');
  ok(C.hasItem(st, '站猫罐头') || C.hasItem(st, '桑尼的账本'), '观景厅礼物 / 账本到手');
  eq(T['换到账本'].ox, 240, '换账本不耗氧');
  ok(C.hasItem(st, '桑尼的账本'), '拿到桑尼的账本（证据① → 揭发可用）');
  eq(T['中层补给柜'].ox, 245, '中层补给柜 +5');
  eq(T['吃掉赠的料理'].ox, 255, '吃掉胖胖给的料理 +10');
  eq(T['翻零件堆'].ox, 250, '16⑤ 翻零件堆 −5');
  ok(C.hasItem(st, '万能扳手') && C.hasItem(st, '焊接枪'), '维修区翻出 万能扳手 + 焊接枪');
  eq(T['爬道到实验室'].ox, 240, '16④ 爬道 −10');
  eq(T['拆到芯片'].ox, 235, '7② 拆芯片 −5');
  ok(C.hasItem(st, '控制芯片'), '拿到控制芯片（路径②：自己拆）');
  eq(T['进冷却塔'].ox, 230, '13 号进入 −5');
  eq(T['关阀'].ox, 225, '13① 关阀 −5');
  ok(C.hasItem(st, '冷却剂罐'), '拿到冷却剂罐（冷却塔备件）');
  eq(T['舱外'].ox, 205, '11② 开舱门 −5、19 进入 −15（225→220→205）');
  eq(T['焊好'].ox, 200, '19 进入 −15、39 焊接 −5（220→205→200）');
  ok(st.learned['太阳能板已修好'], '太阳能板已修好（电力前置的第一半）');
  eq(T['复电'].ox, 195, '15① 合闸 −5');
  ok(st.learned['全站复电'], '全站复电（电力前置的第二半）');
  eq(T['进反应堆舱'].ox, 185, '12 号进入 −10（→185，主线段完）');
  eq(T['结局 A'].loc, '41', '抵达结局 A · 圆满');
  ok(!!D.nodes['41'].win, '41 号标记为通关');
  eq(T['结局 A'].ox, 185, 'A 路线结束时氧气 185（= 280 − 95，结余 66.1%——B147 新档）');
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
eq(st.oxygen, 200, '4 号 B03 探索化：进入不再自动扣氧（旧 en 已删）');
goPick('4', '掰手腕'); eq(st.loc, '26', '4→26（挑战铁头）');
goPick('26', '用力'); eq(st.loc, '27', '战斗胜利 → 27（铁头开门）');
eq(st.oxygen, 195, '26① 掰手腕 −5 氧（唯一载体；4① 不另扣）');
ok(st.learned['铁头已开门'], '铁头开门');
C.go(st, '10');
goPick('10', '直接动手搬'); eq(st.loc, '31', '10→31（硬拿冷却剂）');
ok(C.hasItem(st, '冷却剂罐'), '拿到冷却剂罐（路径①：硬拿）');
eq(st.oxygen, 190, '10① 搬冷却剂 −5 氧（B08）');
eq(st.coins, 12, '被桑尼的无人机抢走 8 枚星币（20→12）');
const theft = C.takeFlash(st);
ok(theft && theft.kind === 'theft' && theft.thief === '桑尼的无人机' && theft.amount === 8,
  '给出「无人机抢星币」提示事件（供警示条用）');
eq(C.takeFlash(st), null, '提示事件取走后不重复');

/* 冷却剂·路径③（备用）：冷却塔关阀（进入 −5 + 关阀 −5） */
st = C.newState('normal');
st.items = ['万能扳手'];
C.go(st, '13');
eq(st.oxygen, 195, '冷却塔泄漏区每次进入 −5 氧');
goPick('13', '用万能扳手拧上总阀'); eq(st.loc, '13', '13→13（B10／§2-B151 动作留房：关完阀还在冷却塔）');
eq(st.oxygen, 190, '关阀再 −5 氧');
ok(C.hasItem(st, '冷却剂罐'), '拿到冷却剂罐（路径③：冷却塔备件）');
goPick('13', '先回底层大厅'); eq(st.loc, '21', '13→21（留房后走留存出口）');

/* 冷却剂·路径④（R12）：硬穿蒸汽也有收获，不再是零收益纯亏 */
st = C.newState('normal');
C.go(st, '13');
eq(st.oxygen, 195, '进冷却塔 −5 氧');
goPick('13', '冲过蒸汽'); eq(st.loc, '13', '13→13（B10／§2-B151 动作留房：硬穿后还在冷却塔）');
eq(st.oxygen, 185, '硬穿 −10 氧');
ok(C.hasItem(st, '冷却剂罐'), '硬穿也能拿到冷却剂（R12）');
goPick('13', '先回底层大厅'); eq(st.loc, '21', '13→21（留房后走留存出口）');

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
eq(st.oxygen, 190, 'B65：开柜 −10 氧（200→190）');
ok(C.choiceDone(st, D.nodes['9'].c[0], 0, '9'), '9① 的 once 标记已记录（开过保险柜）');
goPick('45', '把东西收好'); eq(st.loc, '20', '45→20（回中层大厅）');
C.go(st, '9');
ok(C.nodeText(st, D.nodes['9']).indexOf('空了') >= 0, '开柜后再进站长室 → 正文分叉（R14）');

/* 观景厅·R11：一次性礼物移入 ①、二次进入文本分叉 */
st = C.newState('normal');
C.go(st, '5');
eq(C.nodeText(st, D.nodes['5']), D.nodes['5'].t, '未打招呼 → 用场景正文');
goPick('5', '钻到沙发后面');
eq(st.oxygen, 195, '钻过沙发 −5 氧');
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
  const mealsE = Math.floor(coins.start.easy / price), mealsN = Math.floor(coins.start.normal / price), mealsH = Math.floor(coins.start.hard / price);
  eq(mealsE, 5, '简单最多买 5 盒料理（25÷5）');
  eq(mealsN, 4, '中等最多买 4 盒料理（20÷5）');
  eq(mealsH, 3, '困难最多买 3 盒料理（15÷5）');
  const EASY = 500 + 30 + (10 + mealsE * 10), NORMAL = 200 + 30 + (10 + mealsN * 10), HARD = 80 + 30 + (10 + mealsH * 10);
  eq(EASY, 590, '简单可得 500 + 30 + 60 = 590');
  eq(NORMAL, 280, '中等可得 200 + 30 + 50 = 280');
  eq(HARD, 150, '困难可得 80 + 30 + 40 = 150');
  ok(COSTS <= 0.7 * NORMAL, '中等：95 ≤ 0.7 × 280 = 196');
  ok(COSTS <= 0.95 * HARD, '困难：95 ≤ 0.95 × 150 = 142.5');
  const marginE = (EASY - COSTS) / EASY, marginN = (NORMAL - COSTS) / NORMAL, marginH = (HARD - COSTS) / HARD;
  eq([(marginE * 100).toFixed(1), (marginN * 100).toFixed(1), (marginH * 100).toFixed(1)].join('/'), '83.9/66.1/36.7',
    'B147 §2-B147-①：三档结余＝简单 83.9%／中等 66.1%／困难 36.7%（旧「≤5%」紧口径随三档重订作废）');
  BUDGET = { COSTS, EASY, NORMAL, HARD, marginE, marginN, marginH, dataPos, deck };
  console.log('预算验算：消耗 ' + COSTS + ' ｜ 可得 简单 ' + EASY + ' / 中等 ' + NORMAL + ' / 困难 ' + HARD +
    ' ｜ 结余 简单 ' + (marginE * 100).toFixed(1) + '% / 中等 ' + (marginN * 100).toFixed(1) + '% / 困难 ' + (marginH * 100).toFixed(1) + '%');
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
ok(!st.bankrupt && st.coins === 0 && st.oxygen === 200, '星币归零 → 不结束，氧气不受影响');

/* ============ 10. 卡死保险（走投无路检测） ============ */
st = C.newState('normal');
C.go(st, '1');
ok(!C.deadEnd(st), '食堂：有可执行选项 → 不误报');
C.go(st, '12');
ok(!C.deadEnd(st), '反应堆舱：至少「回底层大厅」可走 → 不误报');
C.go(st, '41');
ok(!C.deadEnd(st), '结局节点不触发指路面板');
st = C.newState('normal');
st.oxygen = 1;
C.go(st, '12');
ok(st.bankrupt && !C.deadEnd(st), '资源归零的失败结算不触发指路面板');
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
/* 指路面板的两个出口：安全点配置 + 回到安全点后能继续玩 */
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
    removeItem: k => { delete m[k]; },   // B136：slotsAvailable 探针（写入＋删除）需要
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
ok(htmlIds.has('stuckModal') && htmlIds.has('resList'), '页面里有指路面板与资源 HUD 容器');

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
  P('预算：消耗 ' + BUDGET.COSTS + ' ｜ 可得 简单 ' + BUDGET.EASY + ' / 中等 ' + BUDGET.NORMAL + ' / 困难 ' + BUDGET.HARD +
    ' ｜ 结余 简单 ' + (BUDGET.marginE * 100).toFixed(1) + '% / 中等 ' + (BUDGET.marginN * 100).toFixed(1) + '% / 困难 ' + (BUDGET.marginH * 100).toFixed(1) + '%');
  eq(BUDGET.COSTS, 95, '主线消耗合计 95');
  eq(BUDGET.EASY, 590, '简单可得 590（500 + 30 + 60）');
  eq(BUDGET.NORMAL, 280, '中等可得 280（200 + 30 + 50）');
  eq(BUDGET.HARD, 150, '困难可得 150（80 + 30 + 40）');
  eq((BUDGET.marginE * 100).toFixed(1), '83.9', '简单结余 83.9%');
  eq((BUDGET.marginN * 100).toFixed(1), '66.1', '中等结余 66.1%');
  eq((BUDGET.marginH * 100).toFixed(1), '36.7', '困难结余 36.7%');
  ok(BUDGET.deck['顶层'] > 0 && BUDGET.deck['中层'] > 0 && BUDGET.deck['底层'] > 0 && BUDGET.deck['站外'] > 0,
    '四个区段每段都有支出（顶层 25 / 中层 10 / 底层 40 / 站外 20）');
}

/* --- 14-3 主线跑通（三档）+ 保险柜短线（B147 三档重订） --- */
{
  const n = runMainRoute('normal');
  eq(n.meals, 4, '中等：开局 20 星币买得起 4 盒料理');
  eq(n.T['结局 A'].loc, '41', '中等：主线跑通到结局 A');
  ok(!st.bankrupt, '中等：全程不触失败');
  eq(n.T['结局 A'].ox, 185, '中等：结束氧气 185（结余 66.1%）');
  const h = runMainRoute('hard');
  eq(h.meals, 3, '困难：开局 15 星币买得起 3 盒料理');
  eq(h.T['结局 A'].loc, '41', '困难：主线跑通到结局 A');
  ok(!st.bankrupt, '困难：全程不触失败');
  eq(h.T['结局 A'].ox, 55, '困难：结束氧气 55（结余 36.7%）');
  const e = runMainRoute('easy');
  eq(e.meals, 5, '简单：开局 25 星币买得起 5 盒料理');
  eq(e.T['结局 A'].loc, '41', '简单：主线跑通到结局 A');
  ok(!st.bankrupt, '简单：全程不触失败');
  eq(e.T['结局 A'].ox, 495, '简单：结束氧气 495（结余 83.9%）');
  P('主线跑通：简单 495 → 41 ｜ 中等 185 → 41 ｜ 困难 55 → 41（均不触失败）');
}
/* 反例：保险柜短线（不撬箱、跳过医务室、改走 9 号开柜）——B147 三档重订：开局值上调后三档均可通
 * （旧的「困难触底（不可通）」反例随之作废）；下表钉住「进 12 号前余量」与「入内后余量」（12 号每次进入 −10）。 */
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
  goPick('13', '先回底层大厅');   // B10（§2-B151）：动作留房——留房后走明示出口
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
  /* B147（§2-B147）：三档开局值上调 ⇒ 保险柜短线三档均可通（可通性判据＝12 号入口前余量 > 10） */
  const noMedE = cabinetShortcut(false, 'easy');
  eq(noMedE.oxBefore, 495, '简单·保险柜短线（不带医务室）：进 12 号前 495 氧');
  ok(!noMedE.bankrupt && noMedE.zeroRes === null && noMedE.loc === '12' && noMedE.oxygen === 485,
    '简单：入内 −10 → 余 485（可通）');
  const withMedE = cabinetShortcut(true, 'easy');
  eq(withMedE.oxBefore, 500, '简单·保险柜短线（补上医务室）：进 12 号前 500 氧');
  eq(withMedE.oxygen, 490, '简单：入内后余 490（可通）');
  const noMed = cabinetShortcut(false);
  eq(noMed.oxBefore, 55, '困难·保险柜短线（不带医务室）：进 12 号前 55 氧');
  ok(!noMed.bankrupt && noMed.zeroRes === null && noMed.loc === '12' && noMed.oxygen === 45,
    '困难：入内 −10 → 余 45（可通——旧「触底不可通」随 B147 三档作废）');
  const withMed = cabinetShortcut(true);
  eq(withMed.oxBefore, 60, '困难·保险柜短线（补上医务室）：进 12 号前 60 氧');
  eq(withMed.oxygen, 50, '困难：入内后余 50（可通）');
  const nNoMed = cabinetShortcut(false, 'normal');
  eq(nNoMed.oxBefore, 185, '中等·保险柜短线（不带医务室）：进 12 号前 185 氧');
  ok(!nNoMed.bankrupt && nNoMed.oxygen === 175, '中等：入内 −10 → 余 175（可通）');
  const nWithMed = cabinetShortcut(true, 'normal');
  eq(nWithMed.oxBefore, 190, '中等·保险柜短线（补上医务室）：进 12 号前 190 氧');
  eq(nWithMed.oxygen, 180, '中等：入内后余 180（可通）');
  P('保险柜短线（B147 三档）：简单 495／500、中等 185／190、困难 55／60——三档均可通');
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
  ok(floorOfId('8') !== floorOfId('17'), '前置分布在两个楼层（8 号中层 / 17 号底层）→ 不再同屋自解锁');
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
 * 扫描面：node.t / tIf / 选项文案 / say / lockText / battle.loseSay / items.text / items.desc（B07 纳入——§10.5-L5/L6） / 序章 / 帮助（数据源头）；
 * 导出文案稿 docs/station-copy-v1.md 是数据的产品面快照（重导归父侧收口——QA 轮改了文案后须重导，方与源头同源）。 */
const L1_EVENT_CHARS = { '23': ['tangtang'], '24': ['aya', 'yilanna'], '25': ['laobu'], '26': ['tietou'], '27': ['tietou'], '28': ['yinhe'],
  '29': ['sangni'], '31': ['sangni'], '32': ['sangni'], '33': ['sangni'], '38': ['laobu'], '40': ['sangni', 'tietou'] };   // B04：24/25/26/27/38 补登记（与 design-station-nodes.md §9.4【角色在场表】同步）
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
   { w: '监控回放', intro: '35', allow: ['10', '35', '41'] }   // B09（老板⑦）：10 号 tIf 第四条＝持物条件句（item 监控回放 ⇒ 才出现——迟引不成立）；引入点仍 35
];

/* 扫描助手：节点的可见文案面 */
function nodeTextOf(n) {
  const parts = [n.t || ''];
  (n.tIf || []).forEach(x => parts.push(x.t || ''));
  (n.c || []).forEach(ch => parts.push(ch.l || '', ch.say || '', ch.lockText || '', (ch.battle && ch.battle.loseSay) || ''));
  return parts.join('\n');
}
function localSceneMap(L) {
  /* B119：房间 pins 是「进房再入」的次级视图，楼层 pins 才是地点的归属场景——
   * 两层都登记时楼层优先（否则房内跨层端口如维修区→7 会把 7 号的归属拉到房间上）。 */
  const m = {}, roomM = {};
  Object.keys(L.scenes).forEach(sid => Object.keys(L.scenes[sid].pins).forEach(nid => {
    ( /^room-/.test(sid) ? roomM : m )[nid] = sid;
  }));
  Object.keys(roomM).forEach(nid => { if (!m[nid]) m[nid] = roomM[nid]; });
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
      if (locScene[id]) {                                   // 地点节点：同楼层 + 距该节点 pin ≤150px
        /* B119：内景接线后按楼层归一（房间 → 所在层；characters[].spot 仍在层图上，距离按层图 pin 量） */
        if (floorOfScene(ch.spot.scene, L) !== floorOfScene(locScene[id], L)) {
          bad.push(`角色多地同现：${cid}（spot=${ch.spot.scene}）出现在 ${id}（${locScene[id]}）`); return;
        }
        const pin = L.scenes[ch.spot.scene].pins[id];        // 只印在房内的节点（如 24）在层图上无 pin ⇒ 不量距离
        if (!pin) return;
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
  /* 失败条计数（§9.7.1；B10 起 27：旧 26＋13③ 自指后入形状）：共 26 条旧锁定　＋１ */
  let failCount = 0;
  Object.keys(D.nodes).forEach(id => (D.nodes[id].c || []).forEach(ch => { if (isFailEntry(ch, id)) failCount += 1; }));
  eq(failCount, 27, 'L2① 计数：失败条共 27 条（可尝试 22＋双条站点 9①/10①/17③/40④ 各多 1 条＝26；B10／§2-B151 13③ 自指后入形状 ⇒ 27）');
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
  /* B119：内景接线后「场景」降到房间粒度——跨层判定按楼层归一（room-* → 所在层）；
   * 且「地点/事件」按编号域判定（1~21＝地点；22+＝事件）——不再看「有没有 pin」：
   * 事件节点接线后也有房内 pin（25/26/30…），按老口径会被误判成地点（→ 误报跨层）。 */
  const isLoc = id => { const n = Number(id); return n >= 1 && n <= 21; };
  const sceneOfIdL = id => (L.nodes[id] && L.nodes[id].scene) || locScene[id] || null;
  const deckOf = id => floorOfScene(sceneOfIdL(id), L) || L3_EVENT_DECK[L3_EVENT_SCENE[id]] || null;
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
        if (isLoc(id) && isLoc(t)) {            // 地点 → 地点：白名单节点对 + 文案含通道词
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
  const itemTexts = Object.entries(L.items).map(([k, v]) => ['道具:' + k, (v.text || '') + '\n' + (v.desc || '')]);   // B07：扫描面收 items[].desc（§10.5-L5）
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
      Object.values(D.items).map(v => (v.text || '') + (v.desc || '')).join(''),   // B07：扫描面收 items[].desc（§10.5-L6）
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
      C.move(st, r);
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
    ['30', '把芯片收好', '16'], ['16', '回底层大厅', '21'], ['21', '去冷却塔', '13'], ['13', '用万能扳手拧上总阀', '13'], ['13', '先回底层大厅', '21'],
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
  ok(o1 === 190 && s1.oxygen === 180, 'B03 反向：12 号「每次进入 −10」仍在（21→12 两次：190 → 180）');
  const s2 = C.newState('normal'); s2.loc = '18'; C.go(s2, '13');
  const s3 = C.newState('normal'); s3.loc = '20'; C.go(s3, '19');
  ok(s2.oxygen === 195 && s3.oxygen === 185, 'B03 反向：13 号 −5、19 号 −15 的每次进入费仍在（195 / 185）');
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
  eq(s.oxygen, 195, '掰手腕败北也扣 −5（败了也费，B18）');
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
  eq(st4.oxygen, 200, 'B03：④ 代劳不扣自己的氧（0）');
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
  /* 新增退出/回访选项（B18/B19/B24~B30；B03：32 号出口按圣经 §7.32 ＝「再看看仓库。」；B131：39 号冗余选项已删 ⇒ 本表 8 处） */
  [['23', '回指挥舱', '6'], ['26', '先不掰了', '4'], ['28', '推开仓库', '10'], ['31', '回仓库看看', '10'],
   ['32', '再看看仓库', '10'], ['33', '回仓库看看', '10'], ['36', '再看看控制室', '15'], ['45', '回站长室里看看', '9']]
    .forEach(([id, frag, to]) => eq(find(id, frag).to, to, `B02-14：新去向 ${id}「${frag}」→ ${to}`));
  eq([find('39', '爬回气闸舱').to, (D.nodes['39'].c || []).length].join(','), '11,1',
    'B131③：39 号仅留「爬回气闸舱。」→11（冗余选项①「再看一眼新面板」已删——再入 19 扣 15 氧且无意义）');
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
    .forEach(([id, frag]) => ok(!!find(id, frag).once, `B02-14：once 收口——${id}「${frag}」带 once`));
  eq(find('8', '对一对').once, '对过货单', 'B08 §2-B143：8① once 具名化＝`对过货单`（E6——行为不变；供 rec-08 完成态查询；改前＝true）');
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
    ['B94：帮助地图行去通道列举（跨层时场景图会自动切换；B04 后为第 10 条）', has(D.help[9], '跨层时场景图会自动切换') && !has(D.help[9], '维修爬道') && !has(D.help[9], '舱外') && !has(D.help[9], '电梯')],
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
  C.go(s, '5'); eq(s.scene, 'room-observation', 'B119：5 号已接线 ⇒ 进房切内景（T19 observation.jpg）');
  C.go(s, '18'); eq(s.scene, 'deck1', 'B119：回顶层大厅 ⇒ 切回层图（出口 pin 同路径）');
  C.go(s, '5'); C.go(s, '28'); eq(s.scene, 'deck2', 'B99：进 28 ⇒ 显示楼层切到中层（原为顶层——R2 ④-4 楼层自相矛盾）');
  C.go(s, '10'); eq(s.scene, 'room-warehouse', 'B119：28 → 仓库（已接线 ⇒ 切仓库内景）');
  const s2 = C.newState('normal'); C.go(s2, '21');
  eq(s2.scene, 'deck3', 'B99：scene 字段不影响其它节点（21 = deck3）');
  P('B99/B119：事件节点显式发生场景（28＝中层）＋ 内景进出切图（5 ⇄ 18）');
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

/* ============ 18. B04 界面与视觉批（B101~B109；口径＝docs/design-ui-v1.md） ============ */
console.log('');
console.log('———— B04 界面批：帮助新稿 / 消息四类 / 反馈区 / 物品栏 / 氧气数值 / 结局名 / 浮现层 ————');
const uiCssSrc = fs.readFileSync(path.join(dir, 'style-ui.css'), 'utf8');
const engSrc = fs.readFileSync(path.join(dir, 'engine.js'), 'utf8');

/* --- 18-1 §8.1 帮助新稿（11→12 条）＋§8.2 H1：帮助里出现的每个数字＝数据面现值 --- */
{
  const H = D.help.join('\n');
  const RES = id => D.resources.find(r => r.id === id) || {};
  const wash = (D.nodes['1'].c || []).find(ch => (ch.l || '').indexOf('洗碗') >= 0) || {};
  const eat1 = (D.nodes['1'].c || []).find(ch => ch.hint === 'exact') || {};
  const H1_ROWS = [
    ['星币开局 25/20/15', H.indexOf('简单开局 25 枚、中等 20 枚、困难 15 枚') >= 0, RES('coins').start.easy === 25 && RES('coins').start.normal === 20 && RES('coins').start.hard === 15],
    ['氧气开局 500/200/80', H.indexOf('简单开局 500、中等 200、困难 80') >= 0, RES('oxygen').start.easy === 500 && RES('oxygen').start.normal === 200 && RES('oxygen').start.hard === 80],
    ['料理 5 枚一盒', H.indexOf('合成料理 5 枚一盒') >= 0, D.nodes['1'].shop.price === 5],
    ['备用电池 5 枚', H.indexOf('备用电池 5 枚') >= 0, D.nodes['1'].shop.stock.indexOf('备用电池') >= 0],
    ['应急包 +10', H.indexOf('应急包 +10') >= 0, D.nodes['2'].en.oxygen === 10],
    ['氧气站 +5', H.indexOf('氧气站 +5') >= 0, D.nodes['3'].en.oxygen === 5],
    ['补给柜 +5', H.indexOf('补给柜 +5') >= 0, D.nodes['20'].en.oxygen === 5],
    ['料理 +10', H.indexOf('合成料理（+10）') >= 0, !!eat1.fx && eat1.fx.oxygen === 10],
    ['劳动 +2 枚 ∕ −5 氧', H.indexOf('每次 +2 枚星币，费 5 点氧气') >= 0, !!wash.fx && wash.fx.coins === 2 && wash.fx.oxygen === -5],
    ['氧气条旁的数字（B104 界面同步）', H.indexOf('氧气条旁边的数字') >= 0, true],
    ['物品栏（B103 界面同步）', H.indexOf('地图下方的物品栏') >= 0, true],
    ['提示颜色四类（B102 界面同步）', H.indexOf('蓝色＝常规动静') >= 0 && H.indexOf('橙红色') >= 0 && H.indexOf('金色') >= 0 && H.indexOf('绿色') >= 0, true]
  ];
  H1_ROWS.forEach(([msg, inHelp, inData]) => ok(inHelp && inData, 'B04 H1：帮助「' + msg + '」＝数据面现值'));
  eq(['焊接枪', '电击棒', '机械手套', '应急盾'].map(it => D.items[it].atk).join(','), '1,2,1,1',
    'B04 H1：四件装备武力加成＝帮助第 6 条（+1/+2/+1/+1）');
  eq(D.meta.atkFromClues['机器人小帮手'], 1, 'B04 H1：收编维修机器人 +1＝帮助第 6 条');
  ok(!/信用点|还差点底气/.test(H), 'B04 H4：帮助无旧词残留（信用点／还差点底气）');
  P('帮助新稿：11 条全文在案；H1 数值对拍 ' + H1_ROWS.length + ' 组＋装备/伙伴加成 全中');
}

/* --- 18-2 §3 消息四类：判据 / fail 双向 / CSS token 四色 / data-kind 契约 --- */
{
  const kinds = new Set();
  let nSay = 0;
  Object.keys(D.nodes).forEach(id => (D.nodes[id].c || []).forEach(ch => {
    const k = C.sayKindOf({ loc: id }, ch);
    if (k == null) return;
    nSay += 1; kinds.add(k);
  }));
  ok(nSay > 0 && [...kinds].every(k => ['info', 'fail'].indexOf(k) >= 0),
    'B04 §3-1：选项消息类 ∈ {fail,info}（实测 ' + [...kinds].join('/') + '，' + nSay + ' 条）');
  eq(C.textKind('🔑 记住了一条线索：保险柜密码'), 'key', 'B04 §3-3：fx.learn 产出 → key');
  eq(C.textKind('获得 医疗包 🩹'), 'gain', 'B04 §3-3：fx.gain → gain');
  eq(C.textKind('失去 医疗包'), 'gain', 'B04 §3-3：fx.lose 同归 gain（帮助第 8 条含「交出去」）');
  eq(C.textKind('−5 点氧气'), 'info', 'B04 §3-1：其余效果日志 → info');
  eq(C.textKind('🛗 到达：顶层'), 'info', 'B04 §3-1：移动提示 → info');
  /* 断言 2 fail 双向：形状命中集 ≡ 27 条集合（两向相等、零多报；B10 起 13③ 入形状） */
  const shapeFail = [];
  Object.keys(D.nodes).forEach(id => (D.nodes[id].c || []).forEach((ch, ci) => {
    if (C.sayKindOf({ loc: id }, ch) === 'fail') shapeFail.push(id + '#' + ci);
  }));
  const isFailRow = (ch, id) => !!ch.say && !ch.fx && !ch.once && !ch.toIf && !ch.back && !ch.battle && !ch.random && ch.to === id;
  const declared = [];
  Object.keys(D.nodes).forEach(id => (D.nodes[id].c || []).forEach((ch, ci) => { if (isFailRow(ch, id)) declared.push(id + '#' + ci); }));
  eq(shapeFail.join(','), declared.join(','), 'B04 §3-2：fail 双向——形状命中集 ≡ 27 条集合（两向相等、零多报）');
  eq(shapeFail.length, 27, 'B04 §3-2：fail 恰 27 条（design-station-nodes.md §9.7 旧锁定 26；B10／§2-B151 13③ 自指后入形状 ⇒ 27）');
  eq(C.sayKindOf({ loc: '1' }, { say: '喂', sayKind: 'info', to: '1' }), 'info', 'B04：sayKind 可选覆盖生效（引擎能力保留）');
  const wrote = [];
  Object.keys(D.nodes).forEach(id => (D.nodes[id].c || []).forEach((ch, ci) => { if (ch.sayKind) wrote.push(id + '#' + ci); }));
  eq(wrote.join(','), '', 'B04 §3-2：全关 sayKind 写入 0 处（形状判据零多报 ⇒ 无需在数据面归位）');
  /* 断言 4：四类 CSS token 互不相同 + :root 有 token */
  const token = k => (uiCssSrc.match(new RegExp('--msg-' + k + ':\\s*(#[0-9a-fA-F]{6})')) || [])[1];
  const cols = ['info', 'gain', 'key', 'fail'].map(token);
  ok(cols.every(Boolean), 'B04 §3-4：style-ui.css :root 四条 --msg-* token（' + cols.join(' ') + '）');
  eq(new Set(cols).size, 4, 'B04 §3-4：四类颜色互不相同');
  ['info', 'gain', 'key', 'fail'].forEach(k => ok(uiCssSrc.indexOf('.msg-' + k + ' ') >= 0, 'B04 §3-4：.msg-' + k + ' 类在案'));
  ok(engSrc.indexOf("className = 'msg msg-' + kind") >= 0 && engSrc.indexOf('dataset.kind = kind') >= 0,
    'B04 §3-1：消息节点＝class "msg msg-<kind>" ＋ data-kind（DOM 机检锚点）');
  P('消息四类：判据／fail 双向 27 条／CSS 四色 token／data-kind 契约 逐条通过');
}

/* --- 18-3 §4 反馈区与 toast：时长 / 去重 / 同屏 / 清空规则 --- */
{
  const hold = C.msgHold || {};
  eq(hold.info + ',' + hold.gain + ',' + hold.key + ',' + hold.fail, '4200,4200,7000,7000',
    'B04 §4：toast 时长 info/gain＝4.2s、key/fail＝7.0s');
  const g = C.msgGroup('你推了推门——锁着。', 'fail', ['你推了推门——锁着。', '−5 点氧气']);
  eq(g.length, 2, 'B04 §4-去重①：say 与效果日志同文本 ⇒ 只显示一次');
  eq(g[0].text + '｜' + g[0].kind + '｜' + g[1].kind, '你推了推门——锁着。｜fail｜info',
    'B04 §4：消息组置首为 say（反馈区内容＝say＋效果行）、逐条带 kind');
  eq(C.msgGroup(null, null, ['获得 手电 🔦', '获得 手电 🔦']).length, 1, 'B04 §4-去重②：同文本效果行只留一次（同源渲染两处）');
  ok(/c => !c\.classList\.contains\('leaving'\)/.test(engSrc) && engSrc.indexOf('live.length - 3') >= 0,
    'B04 §4：toast 同屏最多 3 条——计数排除淡出中的（一次塞 5 条也只留 3 条在场；源码契约）');
  ok(/function showFeedback\(msgs\)[\s\S]{0,200}box\.innerHTML = ''/.test(engSrc) && engSrc.indexOf('function syncFeedback') >= 0,
    'B04 §4-去重③：反馈区原位刷新（不叠新行）＋换节点即清空（源码契约）');
  ok(engSrc.indexOf('if (n >= 4) break;') >= 0, 'B04 §4：反馈区合计 ≤4 行（源码契约）');
  P('反馈区/toast：时长／去重①②／同屏上限／原位刷新与换节点清空 逐条通过');
}

/* --- 18-4 §5 物品栏三断言 --- */
{
  /* ① 条目集＝st.items、顺序＝itemOrder */
  const s = C.newState('normal');
  s.items = ['合成料理', '手电', '焊接枪'];
  eq(C.invItems(s).join(','), '手电,焊接枪,合成料理', 'B04 §5-①：物品栏顺序＝itemOrder');
  ok(C.invItems(s).every(it => s.items.indexOf(it) >= 0) && C.invItems(s).length === s.items.length,
    'B04 §5-①：条目集＝st.items 集（未持有不留位）');
  eq(C.invItems(C.newState('normal')).join(','), '', 'B04 §5-①：空栏＝空（界面画「（还没有道具）」）');
  /* ② 「使用」判据（抽查 4/13/16/12 等节点） */
  const useOf = (items, loc, extra) => {
    const st2 = C.newState('normal');
    st2.items = items.slice(); st2.loc = loc;
    if (extra) Object.assign(st2, extra);
    return C.itemUseInfo(st2, items[items.length - 1]);
  };
  eq(useOf(['医疗包'], '3').count, 1, 'B04 §5-②：3 号持医疗包 ⇒ 恰一条（交给阿雅）');
  eq(useOf(['医疗包'], '4').count, 0, 'B04 §5-②：4 号持医疗包 ⇒ 零条（不出现按钮）');
  eq(useOf(['万能扳手'], '13').count, 1, 'B04 §5-②：13 号持万能扳手 ⇒ 一条（拧总阀）');
  eq(useOf(['备用电池'], '16').count, 1, 'B04 §5-②：16 号持备用电池 ⇒ 一条（换电池）');
  eq(useOf(['手电'], '12').count, 1, 'B04 §5-②：12 号持手电 ⇒ 一条（照堆芯）');
  eq(useOf(['手电'], '16', { visited: { '25': true } }).count, 2, 'B04 §5-②：16 号持手电（已到过 25）⇒ 两条——「可用于 N 处」');
  eq(useOf(['合成料理'], '1').count, 1, 'B04 §5-②：fx.lose 判据命中（1④ 吃掉料理）');
  /* ③ 「使用」与「选项」结果逐字一致 */
  const mk13 = () => { const x = C.newState('normal'); x.items = ['万能扳手']; x.loc = '13'; return x; };
  const a13 = mk13(), b13 = mk13();
  const ci13 = C.itemUseInfo(a13, '万能扳手').cis[0];
  const snapOf = x => JSON.stringify({ o: x.oxygen, c: x.coins, i: x.items, k: x.learned, v: x.visited, l: x.loc });
  const viaA = C.choose(a13, ci13); C.move(a13, viaA);
  const viaB = C.choose(b13, ci13); C.move(b13, viaB);
  eq(snapOf(a13), snapOf(b13), 'B04 §5-③：走「使用」与走「选项」后的状态逐字一致（资源/道具/去向）');
  ok(C.hasItem(a13, '冷却剂罐') && a13.loc === '13', 'B04 §5-③：使用真的生效（拿到冷却剂罐；B10 起留房——去向仍 13，不跳 21）');
  P('物品栏：内容＝st.items×itemOrder ／「使用」判据 7 组抽查 ／ 等效执行逐字一致 逐条通过');
}

/* --- 18-5 §6.1 氧气＝条＋数值（对拍 / 同帧 / 档位；B147：基准＝本档开局值） --- */
{
  const OXY = D.resources.find(r => r.id === 'oxygen') || { start: {} };
  const obase = C.startValue(OXY, C.newState('normal').diff);
  eq(obase, 200, 'B147 §2-B147-③：HUD 条基准＝本档开局值（中等 200——取代固定基准 100）');
  [[200, 10], [116, 6], [60, 3], [40, 2], [38, 2], [10, 1], [0, 0]].forEach(([v, k]) =>
    eq(C.barFill(v, obase), k, 'B147 §2-B147-③：条填充 round(' + v + '/' + obase + '×10)＝' + k + ' 格'));
  eq([C.barFill(500, C.startValue(OXY, 'easy')), C.barFill(80, C.startValue(OXY, 'hard'))].join('/'), '10/10',
    'B147 §2-B147-③：简单（500/500）与困难（80/80）开局条均满格——基准随档');
  eq([C.startValue({ start: { normal: 20 } }, 'easy'), C.startValue({ start: { normal: 20 } }, 'x'), C.startValue({ start: { easy: 25, normal: 20 } }, 'easy')].join('/'),
  '20/20/25', 'B147 §2-B147-②：startValue 单一取值口（缺键回落 normal；三档键在＝取值；旧文档 _entry() 作废）');
  ok(/num\.textContent = v/.test(engSrc) && engSrc.indexOf('s.appendChild(num);') >= 0,
    'B04 §6.1：HUD 数值＝余量原值，与条同一处渲染（同帧更新）');
  eq([C.barFill(39, C.startValue(OXY, 'hard')), C.barTierOf(39, C.startValue(OXY, 'hard'))].join('/'), '5/warn',
    'B147 §2-B147 机检④：困难 39 ⇒ 5 格＋警示色（比例探针：39÷80＝48.75% ⇒ warn、round(4.875)＝5）');
  eq(C.barTierOf(40, obase), 'warn', 'B147 §2-B147 机检④：中等 40／200＝20% ⇒ 临界 warn（≥20% 口径）');
  eq([C.barTierOf(100, 200), C.barTierOf(99, 200), C.barTierOf(40, 200), C.barTierOf(39, 200)].join(','), 'ok,warn,warn,danger',
    'B147 §2-B147 机检④：比例色档边界（50% ok／＜50% warn／20% warn／＜20% danger——≥ / ＜ 口径）');
  ok(/k >= 0\.5 \? 'ok' : k >= 0\.2 \? 'warn' : 'danger'/.test(engSrc), 'B04 §6.1：档位 ≥50／20~49／<20（比例口径——单一判据在 Core.barTierOf）');
  ok(engSrc.indexOf('Core.startValue(r, st.diff)') >= 0 && engSrc.indexOf('Core.barFill(v, base)') >= 0,
    'B147 §2-B147-③：条与档位基准走 Core.startValue 单源（源码契约）');
  ok(uiCssSrc.indexOf('.barNum') >= 0 && uiCssSrc.indexOf('.bar.ok .barNum') >= 0, 'B04 §6.1：数字与条同色（CSS）');
  P('氧气读数（B147 三档）：条填充对拍 7 组／三档满格／startValue 两探针／同帧渲染／档位边界／同色 逐条通过');
}

/* --- 18-6 §6.2 结局名去字母（网页端渲染层） --- */
{
  eq(C.endDisplayName('结局 A · 圆满'), '结局 · 圆满', 'B04 §6.2：去字母（圆满）');
  eq(C.endDisplayName('结局 B · 取舍'), '结局 · 取舍', 'B04 §6.2：去字母（取舍）');
  eq(C.endDisplayName('结局 C · 撤离'), '结局 · 撤离', 'B04 §6.2：去字母（撤离）');
  eq(C.endDisplayName('失败 · 氧气耗尽'), '失败 · 氧气耗尽', 'B04 §6.2：非结局名不受影响');
  ok((D.nodes['41'].endTag || '').indexOf('结局 A') >= 0, 'B04 §6.2：数据面 endTag 保留（渲染层才去字母）');
  ['41', '42', '43'].forEach(id => {
    const shown = C.endDisplayName(C.fillName(D.nodes[id].n, C.newState('normal')));
    ok(!/结局 [ABC]/.test(shown), 'B04 §6.2：' + id + ' 号渲染串不含「结局 A/B/C」（' + shown + '）');
  });
  const endHits = (engSrc.match(/endDisplayName\(/g) || []).length;
  ok(endHits >= 4, 'B04 §6.2：渲染层调用 endDisplayName 覆盖结局屏/失败屏/位置名（共 ' + endHits + ' 处）');
  P('结局名去字母：三条结局＋失败屏＋数据面保留 逐条通过');
}

/* --- 18-7 §7.7 浮现层七断言（B101） --- */
{
  const mom = (loc, extra) => {
    const s = C.newState('normal'); s.loc = loc;
    if (extra) Object.assign(s, extra);
    return C.momentsOf(s, D.nodes[loc]);
  };
  /* 1 浮现集＝数据（抽查 N1／N3／N4／N5／N14／N24／N28／N40） */
  eq(mom('1').join(','), 'pangpang-hail', 'B04 §7.7-1：N1 默认＝[pangpang-hail]');
  eq(mom('4').join(','), 'tietou-armwrestle', 'B111 §7.7-1：N4 默认＝[tietou-armwrestle]（＝T41，与 N26 同图、零新图）');
  eq(mom('3').join(','), 'aya-nurse', 'B04 §7.7-1：N3 默认＝[aya-nurse]');
  eq(mom('3', { visited: { '24': true } }).join(','), '', 'B122 §7.11：N3 pinsAll 24 ⇒ 空集（状态由变体 medbay-awake 承担——不显示 L2）');
  eq(mom('5').join(','), 'yinhe-idle', 'B127 §7.12 行 35：N5 默认＝猫一张（窗景 T51 不注册——窗内木星由 T19 成图承担）');
  eq(mom('5', { chDone: { '跟胖胖打过招呼': true } }).join(','), '', 'B127 §7.12 行 5：N5 打过招呼 ⇒ 收窗（猫已离场——画面由变体 observation-catgone 承担）');
  eq(mom('14').join(','), 'guardbot-block', 'B04 §7.7-1：N14 默认＝[guardbot-block]');
  eq(mom('24').join(','), 'yilanna-awake', 'B04 §7.7-1：N24 默认＝[yilanna-awake]');
  eq(mom('28').join(','), 'yinhe-ledger', 'B04 §7.7-1：N28 默认＝[yinhe-ledger]');
  eq(mom('40').join(','), 'pod-standoff', 'B04 §7.7-1：N40 默认＝[pod-standoff]');
  eq(C.momentsOf(C.newState('normal'), { moments: ['不存在的图'] }).length, 0, 'B04 §7.3：id 未注册 ⇒ 忽略该条');
  const M = Object.keys(D.moments);
  eq(M.length, 30, 'B127＋B05 §7.12：注册表 30 条（B126 的 36 撤注册 6＝win-observation-jupiter／win-airlock-array／firstaid-open／robot-rescue／pods-check／sangni-ambush（B05））');
  ok(M.every(id => D.moments[id].file === '../images/station/moments/' + id + '.jpg'), 'B04：file 路径＝images/station/moments/<id>.jpg');
  const onlyChar = M.filter(id => !D.moments[id].win);
  eq(onlyChar.length, 30, 'B127：角色图 30 张（撤注册 6 后实盘；注册表内无窗景条目）');
  const COVER_IDS = ['pangpang-hail', 'aya-nurse', 'yilanna-awake', 'tietou-armwrestle', 'tietou-open', 'yinhe-idle', 'laobu-point'];
  const anchored = onlyChar.filter(id => COVER_IDS.indexOf(id) < 0);
  ok(anchored.length === 23 && anchored.every(id => D.moments[id].w >= 0.16 && D.moments[id].w <= 0.32),
    'B127 §7.4.1：非覆盖图 23 张、宽 w ∈ [0.16,0.32]（撤注册 6 后重算；' + anchored.map(id => D.moments[id].w).join('/') + '）');
  eq(COVER_IDS.filter(id => D.moments[id].at != null || D.moments[id].w != null).join(','), '',
    'B120 §7.3：七张覆盖图无 at／w 残留（B126：laobu-point 到货按同口径——仅 file）');
  eq(M.filter(id => D.moments[id].win).length, 0, 'B127 §7.5：窗景 0 条（T51／T52 本期不注册——资产留档、按四要件可重启）');
  const nodeSet = Object.keys(D.nodes).filter(id => D.nodes[id].moments || D.nodes[id].mIf).sort((a, b) => a - b);
  eq(nodeSet.join(','), '1,2,3,4,5,6,8,10,11,12,13,14,19,22,23,24,25,26,27,28,30,31,32,33,36,37,38,40,45', 'B127＋B05：节点 moments/mIf 恰 29 个（撤注/收窗后 N9／N17／N39 退出；B05：N29 改由 CG 整屏图承担——浮图撤注册）');
  /* 2 层序与不改可点性 */
  const htmlB = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  ok(htmlB.indexOf('id="momentLayer"') > htmlB.indexOf('id="dimSvg"') && htmlB.indexOf('id="momentLayer"') < htmlB.indexOf('id="pinLayer"'),
    'B04 §7.7-2：浮现层在场景图/遮罩之上、编号层之下（index.html 结构）');
  ok(uiCssSrc.indexOf('#momentLayer { position: absolute') >= 0 && uiCssSrc.indexOf('pointer-events: none') >= 0,
    'B04 §7.7-2：浮现层 pointer-events:none（点编号仍可达）');
  ok(htmlB.indexOf('<link rel="stylesheet" href="style-ui.css">') > htmlB.indexOf('<link rel="stylesheet" href="style.css">'),
    'B04 §11：style-ui.css 以多 link 引入、层叠序在后');
  /* 3 状态切换（28 换图不换位 / 14 退场） */
  eq(mom('28', { items: ['桑尼的账本'] }).join(','), 'yinhe-lick', 'B04 §7.7-3：N28 交易后切 yinhe-lick');
  eq(JSON.stringify([D.moments['yinhe-lick'].at, D.moments['yinhe-lick'].w]), JSON.stringify([D.moments['yinhe-ledger'].at, D.moments['yinhe-ledger'].w]),
    'B04 §7.7-3：换图不换位（两图 at/w 逐字相同）');
  eq(mom('14', { items: ['监控回放'] }).length, 0, 'B04 §7.7-3：N14 持监控回放 ⇒ guardbot-block 退场（空列表）');
  /* 4 缺图兜底（结构契约＋源码契约） */
  ok(/img\.onerror = \(\) => \{ d\.remove\(\); console\.warn/.test(engSrc), 'B04 §7.7-4：单张缺图 ⇒ 移除该元素＋一行告警（其余照常）');
  ok(uiCssSrc.indexOf('visibility: hidden') >= 0 && uiCssSrc.indexOf('.momentImg.on') >= 0,
    'B04 §7.7-4：加载完成前不可见（不留白框/破图；无占位框元素）');
  /* 5 窗景（B127：本期不注册——注册表零 win 条目；几何能力＝合成探针验证后还原） */
  eq(M.filter(id => D.moments[id].win).length, 0, 'B127 §7.5：注册表零窗景条目（不注册口径——窗内景由背景图/正文承担）');
  ok(fs.existsSync(path.join(dir, '../images/station/moments/win-observation-jupiter.jpg'))
    && fs.existsSync(path.join(dir, '../images/station/moments/win-airlock-array.jpg')),
    'B127 §7.5：T51／T52 资产留档在库（重启四要件即有图可注册）');
  {
    D.moments['T-win-probe'] = { file: '../images/station/moments/win-observation-jupiter.jpg', at: [815, 277], win: [1255, 385], fit: 1.06 };
    const w = C.momentLayout('T-win-probe', 'room-sleep');
    ok(!!w && w.win === true && w.x === 815 && w.y === 277 && Math.abs(w.w - 1255 * 1.06) < 1e-9 && Math.abs(w.h - 385 * 1.06) < 1e-9,
      'B04 §7.7-5：窗景几何能力在（锚＝窗区中心、尺寸＝窗区×fit）——合成探针 ' + w.w + '×' + w.h);
    delete D.moments['T-win-probe'];
    eq(C.momentLayout('T-win-probe', 'room-sleep'), null, 'B127：合成窗景探针已撤除（注册表还原 31 条）');
  }
  const p1 = C.momentLayout('sangni-smile', 'room-warehouse');   // 非覆盖场合：走既有锚点渲染
  eq(p1.w, D.scenes['room-warehouse'].width * D.moments['sangni-smile'].w, 'B04 §7.3：非覆盖角色图宽＝场景宽×w');
  eq(p1.h, null, 'B04 §7.3：非覆盖角色图锚底边中点（高度自适应）');
  D.moments['T-noanchor'] = { file: '../images/station/moments/T-noanchor.jpg', w: 0.2 };
  const na1 = C.momentLayout('T-noanchor', 'deck1', 0, 2), na2 = C.momentLayout('T-noanchor', 'deck1', 1, 2);
  ok(Math.abs(na1.x - D.scenes.deck1.width * 0.18) < 1e-6 && Math.abs(na2.x - D.scenes.deck1.width * 0.82) < 1e-6 && na1.y === na2.y,
    'B04 §7.3：未给锚点 ⇒ 左右对称（中心 ±0.32×场景宽）＋底边对齐');
  delete D.moments['T-noanchor'];
  /* 6 回归（无 moments 的节点＝空集；站关光环位停用、示例关照旧） */
  eq(C.momentsOf(C.newState('normal'), D.nodes['16']).length, 0, 'B04 §7.7-6：无 moments 的节点 ⇒ 空集（输出与改前一致；样本＝N16——B126 换置：N2 已注册 locker-emergency）');
  ok(!!D.moments && !LEVELS.dalim.moments, 'B04 §11：站关注册了 moments（两层制）、示例关 dalim 无（光环位保留）');
  ok(engSrc.indexOf('if (D.moments) return;') >= 0, 'B04 §11：renderCharSpots 按关卡停用（站关撤下——源码契约）');
  ok(engSrc.indexOf('if (D.moments) return ids;') >= 0, 'B04 §7.6：在场条＝node.chars 直连（示例关沿用旧口径——源码契约）');
  /* 7 同角色同框（B120 覆盖卡：判据／覆盖几何／单源／换态不换位）＋不并置同角色 */
  const prefixOf = id => id.split('-')[0];
  const dup = [];
  Object.keys(D.nodes).forEach(id => {
    const seen = {};
    C.momentsOf(C.newState('normal'), D.nodes[id]).filter(x => !C.momentDef(x).win).forEach(x => {
      const p = prefixOf(x);
      if (seen[p]) dup.push(id + ':' + p);
      seen[p] = 1;
    });
  });
  eq(dup.join(','), '', 'B04 §7.7-7：任一节点的浮现集里同一角色至多一张（不并置同角色）');
  const COVER = [['1', 'pangpang-hail', null], ['3', 'aya-nurse', null],
    ['4', 'tietou-armwrestle', null],
    ['5', 'yinhe-idle', null], ['24', 'yilanna-awake', null], ['25', 'laobu-point', null],
    ['26', 'tietou-armwrestle', null], ['27', 'tietou-open', null]];
  COVER.forEach(([id, mid, extra]) => {
    const sid = C.sceneOfNode(id);
    ok(mom(id, extra).indexOf(mid) >= 0, 'B120 §7.7-7：同框组合 N' + id + '×' + mid + ' 在案（场景 ' + sid + '）');
    eq(C.coverState(mid, sid), 'cover', 'B120 §7.7-7：' + mid + ' ⇒ 覆盖分支命中（同框判据＝figures）');
    const cid = C.charIdOf(mid), box = C.figuresOf(sid)[cid], plan = C.momentLayout(mid, sid);
    const ex = Math.max(12, box[2] * 0.08), ey = Math.max(12, box[3] * 0.08);
    eq([plan.cover, plan.win].join(','), 'true,false', 'B120 §7.7-7：' + mid + ' 渲染计划＝覆盖卡（非窗景）');
    ok(Math.abs(plan.w - (box[2] + ex * 2)) < 1e-9 && Math.abs(plan.h - (box[3] + ey * 2)) < 1e-9
      && Math.abs(plan.x - (box[0] - ex + (box[2] + ex * 2) / 2)) < 1e-9 && Math.abs(plan.y - (box[1] - ey + (box[3] + ey * 2) / 2)) < 1e-9,
      'B120 §7.7-7：' + mid + ' 卡面 ⊇ 轮廓框外扩 max(12,8%×边)（卡 ' + [plan.x, plan.y, plan.w, plan.h].join(',') + '）');
  });
  const geoOf = id => { const p = C.momentLayout(id, 'room-gym'); return [p.x, p.y, p.w, p.h].join(','); };
  eq(geoOf('tietou-armwrestle'), geoOf('tietou-open'),
    'B120 §7.7-7：换态不换位——T41／T49 同卡面（几何逐字相同：' + geoOf('tietou-open') + '）');
  eq(C.momentLayout('pangpang-hail', 'deck1'), null,
    'B120 §7.3：非本场景（deck1 未标定 figures）⇒ 该张不渲染（不得回落对称摆放）');
  /* chars 补登记 6 处 + 头像 img */
  [['23', 'tangtang'], ['24', 'aya'], ['24', 'yilanna'], ['25', 'laobu'], ['26', 'tietou'], ['27', 'tietou'], ['38', 'laobu']]
    .forEach(([id, cid]) => ok((D.nodes[id].chars || []).indexOf(cid) >= 0, 'B04 §7.6：' + id + ' 号 chars 补登记 ' + cid));
  ok(Object.keys(D.characters).every(cid => (D.characters[cid].img || '').indexOf('images/station/chars/') >= 0),
    'B04 §7.6：8 位乘员 img 全部指向 images/station/chars/（缺图回落 emoji）');
  ok(engSrc.indexOf('function guardFaces') >= 0 && engSrc.indexOf('img.onerror = () => {') >= 0,
    'B04：头像缺图回落 emoji（不留破图——源码契约）');
  P('浮现层：断言 1~7 逐条通过（30 节点／31 条注册表／零窗景（T51/T52 留档）／层序／缺图兜底／覆盖卡 8 组几何）');
}

/* --- 18-8 B114 站外切换（T04 入库接管；pin 按成图实测；占位退场） --- */
{
  eq(D.scenes.exterior.image, '../images/station/eva-v1.jpg', 'B114：站外场景图＝T04 成图 eva-v1（入库＝父侧执行）');
  ok(D.scenes.exterior.image.indexOf('station-map-ai-v1') < 0, 'B114：总览占位图不再是站外场景图（退出 exterior 位）');
  eq(D.scenes.exterior.width + '×' + D.scenes.exterior.height, '1792×1121',
    'B114：站外宽高＝1792×1121（与成图实测一致——§2 处的 JPEG 实测循环另有校验）');
  eq(JSON.stringify(D.scenes.exterior.pins['19']), '[1505,778]', 'B114：19 号 pin＝按 T04 成图实测校准（下片阵列蓝区质心，见 §2 注释）');
  P('B114：站外＝eva-v1（1792×1121）＋ pin 实测值；占位图退场（海报位保留）');
}

/* --- 18-9 B112 当前位置标记抑制（有浮现图的节点 ⇒ 光环＋编号＋「你在这里」整体不渲染） --- */
{
  const hid = (loc, extra) => {
    const s = C.newState('normal'); s.loc = loc;
    if (extra) Object.assign(s, extra);
    return C.currentMarkerHidden(s);
  };
  eq([hid('5'), hid('14')].join(','), 'true,true', 'B04 §7.7-8：有浮图节点（N5／N14）⇒ 当前位置标记抑制');
  eq([hid('18'), hid('20'), hid('21')].join(','), 'false,false,false', 'B04 §7.7-8：无浮图节点（N18／N20／N21）⇒ 标记照旧（回归）');
  eq([hid('5', { chDone: { '跟胖胖打过招呼': true } }), hid('14', { items: ['监控回放'] })].join(','), 'false,false',
    'B127 §7.7-8：条件变化逐次重算（N5 打过招呼 ⇒ 收窗 ⇒ 判据 false；N14 持监控回放 ⇒ 浮图退场 ⇒ 判据 false）');
  ok(C.currentMarkerHidden(Object.assign(C.newState('normal'), { loc: '4' })), 'B111/B112：N4 登记浮图（T41）⇒ 其当前位置标记同样抑制');
  ok(engSrc.indexOf('const hideCur = Core.currentMarkerHidden(st);') >= 0 && /if \(!plain && isCur && hideCur\) return;/.test(engSrc),
    'B04 §7.7-8：renderPins 用判据跳过当前位置标记（光环/编号/「你在这里」同一元素——源码契约；B128 后仅楼层图适用）');
  ok(engSrc.indexOf('add(x, y, 98 * k)') >= 0, 'B112：遮罩开孔不受影响（renderDim 对当前位置照旧开孔——源码契约）');
  P('当前位置标记抑制：N5／N14 抑制 ＋ N18／N20／N21 回归 ＋ 条件重算（N14 退场即恢复） 逐条通过');
}

/* --- 18-10 B115/B117/B147 选关页（难度三档单选默认中等；按钮三态；「继续上次进度」退场） --- */
{
  const engCode = engSrc.replace(/\/\*[\s\S]*?\*\//g, '');   // 去块注释：只查「代码面零残留」（注释里对旧面的历史记述不算残留）
  const uiCode = uiCssSrc.replace(/\/\*[\s\S]*?\*\//g, '');
  ok(engSrc.indexOf("r.type = 'radio'") >= 0 && engSrc.indexOf("r.checked = (d === 'normal')") >= 0,
    'B115＋B147：难度＝单选控件、默认选中中等（源码契约；行为由 DOM 冒烟演示验证）');
  ok(engSrc.indexOf("['easy', 'normal', 'hard'].forEach") >= 0 && engSrc.indexOf('Core.diffLabel(d)') >= 0,
    'B147 §2-B147-⑤：难度三档（简单／中等／困难）与档位词单源（Core.diffLabel——卡片单选与资源行同源）');
  ok(engSrc.indexOf('Core.cardInfo(store, id)') >= 0 && engSrc.indexOf('startGame(id, picked.diff)') >= 0,
    'B117：卡片按钮由 Core.cardInfo 三态驱动；开新局＝以所选难度（startGame(id, 所选档)；「继续」不经它）');
  ok(engCode.indexOf('lcResume') < 0 && engCode.indexOf('levelProgress') < 0 && engCode.indexOf('继续上次进度') < 0,
    'B115：「继续上次进度」连同其渲染（levelProgress）退场——代码面零残留');
  ok(uiCssSrc.indexOf('.lcDiffOpt') >= 0 && uiCssSrc.indexOf('.lcBtns .lcMain') >= 0 && uiCssSrc.indexOf('.lcBtns .lcAlt') >= 0 && uiCode.indexOf('lcResume') < 0,
    'B115/B117：单选与三态按钮（主/次）样式在案（style-ui.css）、lcResume 样式已撤（代码面）');
  P('选关页：单选三档默认中等／三态按钮（cardInfo 驱动）／「继续」零残留 逐条通过');
}

/* --- 18-11 B120 同框全覆盖（覆盖卡）：figures lint ／ 全站枚举零双现 ／ 呈现与标定通道 --- */
{
  /* ① figures 规格＋lint（§7.7-10）：5 房 6 条基础框（登记表 7 行——N4／N26 同角色同行）＋medbay 变体 1 条；键 ∈ characters；
   *   框与卡面（含余量）落在图界内；基础 6 条中 5 条与 §7.3 同框面表逐值一致；room-medbay/yilanna 基础值＝
   *   基图（卧姿）留守回落值——苏醒态由变体 figures 承担（B126：T73 到货同批标定回填，§7.3 第 3 行）。 */
  const FIG = { 'room-galley': { pangpang: [880, 205, 160, 225] },
    'room-medbay': { aya: [455, 145, 235, 515], yilanna: [690, 255, 195, 180] },
    'room-gym': { tietou: [745, 195, 245, 445] },
    'room-observation': { yinhe: [1125, 440, 165, 170] },
    'room-lab': { laobu: [430, 300, 290, 460] } };
  eq(Object.keys(D.scenes).filter(sid => D.scenes[sid].figures).sort().join(','), Object.keys(FIG).sort().join(','),
    'B120 §7.7-10：figures 登记＝5 房（含角色房间全登记；其余房间不登记＝无同框面）');
  eq(Object.keys(FIG).reduce((n, sid) => n + Object.keys(FIG[sid]).length, 0), 6,
    'B120：figures 共 6 条＝同框面表 7 行（N4／N26 同角色共用一行）');
  const bad = [];
  Object.entries(FIG).forEach(([sid, spec]) => {
    const sc = D.scenes[sid], figs = sc.figures || {};
    if (JSON.stringify(Object.keys(figs).sort()) !== JSON.stringify(Object.keys(spec).sort())) bad.push(sid + '：键集不符');
    Object.entries(spec).forEach(([cid, box]) => {
      if (!D.characters[cid]) bad.push(sid + '/' + cid + '：键非 characters');
      if (JSON.stringify(figs[cid]) !== JSON.stringify(box)) bad.push(sid + '/' + cid + '：轮廓框初值与登记表不符');
      const ex = Math.max(12, box[2] * 0.08), ey = Math.max(12, box[3] * 0.08);
      if (!(box[0] > 0 && box[1] > 0 && box[0] + box[2] < sc.width && box[1] + box[3] < sc.height)) bad.push(sid + '/' + cid + '：框越界');
      if (!(box[0] - ex > 0 && box[1] - ey > 0 && box[0] + box[2] + ex < sc.width && box[1] + box[3] + ey < sc.height)) bad.push(sid + '/' + cid + '：卡面（含余量）越界');
    });
  });
  eq(bad.join(' ｜ '), '', 'B120 §7.7-10：figures lint——键 ∈ characters／框与卡面在图界内／初值与 §7.3 表逐值（medbay/yilanna 基础值＝留守回落；变体值＝B126 T73 标定）');
  const coverFalse = Object.keys(D.moments).filter(id => D.moments[id].cover === false);
  eq(coverFalse.join(','), '', 'B120 §7.7-10：例外表初始为空 ⇒ 全关零 cover:false（与登记一致）');
  /* ② 全站枚举（含 mIf 分支与条件变化）：同框必覆盖卡；无 L1 实体者不得误判——零双现（§7.7-7／§10-③） */
  const PROBES = [null, { visited: { '24': true } }, { chDone: { '跟胖胖打过招呼': true } },
    { items: ['桑尼的账本'] }, { items: ['监控回放'] }];
  const miss = [], wrong = [], dbl = [], nCombos = [];
  Object.keys(D.nodes).forEach(id => {
    const n = D.nodes[id];
    if (!n.moments && !n.mIf) return;
    const sid = C.sceneOfNode(id);
    PROBES.forEach(extra => {
      const s = C.newState('normal'); s.loc = id; if (extra) Object.assign(s, extra);
      const seen = {};
      C.momentsOf(s, n).filter(mid => C.charIdOf(mid)).forEach(mid => {
        const cid = C.charIdOf(mid), figs = C.figuresOf(sid) || {}, st = C.coverState(mid, sid);
        nCombos.push(id + '×' + mid);
        if (seen[cid]) dbl.push(id + ':' + cid);
        seen[cid] = 1;
        if (figs[cid]) { if (st !== 'cover') miss.push(id + '×' + mid); }
        else if (st !== 'none') wrong.push(id + '×' + mid + ':' + st);
      });
    });
  });
  eq(nCombos.length, 78, 'B127＋B05 复核：全站枚举 78 条（节点×角色 L2 组合，含 mIf 分支与 5 探针）——撤注册 6 条中 5 条为窗景/对象图、sangni-ambush（B05）为角色图（−5 探针行）');
  eq(miss.join(' ｜ '), '', 'B120 §7.7-7：同框组合逐条覆盖分支命中——零漏覆盖');
  eq(wrong.join(' ｜ '), '', 'B120 §7.7-7：无 L1 实体的角色 L2 不被误判覆盖（走既有呈现；未标定即红）');
  eq(dbl.join(' ｜ '), '', 'B120 §10-③：全站同角色双现＝0（机检）');
  /* ③ 老板一眼判三条的机检面（N3 阿雅/伊莲娜各一次；N5 银河一次） */
  const cnt = (loc, extra, cid) => {
    const s = C.newState('normal'); s.loc = loc; if (extra) Object.assign(s, extra);
    return C.momentsOf(s, D.nodes[loc]).filter(mid => C.charIdOf(mid) === cid).length;
  };
  eq([cnt('3', null, 'aya'), cnt('3', null, 'yilanna'), cnt('3', { visited: { '24': true } }, 'aya'),
    cnt('3', { visited: { '24': true } }, 'yilanna'), cnt('24', null, 'aya'), cnt('24', null, 'yilanna')].join(','),
    '1,0,0,0,0,1', 'B120 §10-①：医务室——N3 阿雅恰一次（伊莲娜由 L1 承担）；B122 后，pinsAll24 ⇒ 空集（状态归变体）、N24 伊莲娜恰一次');
  eq(cnt('5', null, 'yinhe'), 1, 'B120 §10-②：观景厅——银河恰一次');
  eq(C.coverState('yinhe-idle', 'room-observation'), 'cover', 'B120 §10-②：银河一次＝覆盖卡（L1 猫被卡面盖住，无双现）');
  /* ④ 覆盖卡呈现契约（CSS）：实底圆角卡／无羽化遮罩／object-fit:cover 内缩 ≥6%／z 序在其它浮现图之上 */
  const coverRule = (uiCssSrc.match(/\.moment\.cover \{([\s\S]*?)\}/) || [])[1] || '';
  const coverImg = (uiCssSrc.match(/\.moment\.cover \.momentImg \{([^}]*)\}/) || [])[1] || '';
  const pct = (s, k) => { const m = s.match(new RegExp('(?:^|[^-])' + k + ':\\s*(-?[\\d.]+)%')); return m ? Number(m[1]) : NaN; };
  ok(/z-index:\s*2/.test(coverRule) && /overflow:\s*hidden/.test(coverRule) && /background:\s*#/.test(coverRule) && /border-radius/.test(coverRule),
    'B120 §7.3：覆盖卡＝实底圆角卡（不透明底＋裁边）＋z 序在其它浮现图之上（z-index:2）');
  ok(/object-fit:\s*cover/.test(coverImg) && /mask-image:\s*none/.test(coverImg),
    'B120 §7.3：卡内图 object-fit:cover＋无羽化遮罩（mask:none）');
  const inset = -pct(coverImg, 'left'), zoom = pct(coverImg, 'width') / 100;
  ok(inset >= 6 && zoom >= 1.06,
    'B120 §7.3：内缩放大 ≥6%（实测 ×' + zoom.toFixed(2) + '；每侧裁 ' + (inset / zoom).toFixed(1) + '%）');
  ok(/z-index:\s*0/.test((uiCssSrc.match(/#momentLayer \{([^}]*)\}/) || [])[1] || ''),
    'B120 §7.3：#momentLayer 自建堆叠上下文（z-index:0）——覆盖卡不越到编号层之上');
  /* ⑤ 标定通道：两点定框（Core 纯面）＋引擎接线契约 */
  eq(JSON.stringify(C.boxOfPoints([100, 200], [40, 260])), '[40,200,60,60]', 'B120 标定：两点定框归一化（左上／右下可反着点）');
  eq(JSON.stringify(C.boxOfPoints([40, 260], [100, 200])), '[40,200,60,60]', 'B120 标定：两点定框与点击顺序无关');
  ok(engSrc.indexOf('Core.boxOfPoints(calibA') >= 0 && engSrc.indexOf('function calibDot') >= 0 && engSrc.indexOf('calibRedraw') >= 0,
    'B120 标定：C 键校准＝两点定框（屏上给「scenes[].figures = { 角色id: [x,y,w,h] }」数值行——源码契约）');
  ok(/if \(calib\) calibRedraw\(\);/.test(engSrc),
    'B120 标定：校准层随场景切换重画（既有 figures 虚线框对照——源码契约）');
  /* ⑥ 渲染契约：.cover 类／未标定告警／缺图兜底不受影响；「无 at 无 w」才算待标定（w 默认值／对称摆放不受影响） */
  ok(engSrc.indexOf("(plan.cover ? ' cover' : '')") >= 0, 'B120：覆盖卡渲染类（engine 契约）');
  ok(engSrc.indexOf('浮现图未标定轮廓框（已跳过）') >= 0, 'B120 §7.3：未标定 figures ⇒ 该张不渲染＋一行告警');
  ok(/img\.onerror = \(\) => \{ d\.remove\(\); console\.warn/.test(engSrc), 'B120 §7.3：覆盖卡缺图走同一兜底（移除＋告警——源码契约）');
  D.moments['pangpang-probe'] = { file: '../images/station/moments/pangpang-hail.jpg', w: 0.2 };   // 合成：角色图「有 w、无 at」
  eq(C.coverState('pangpang-probe', 'deck1'), 'none', 'B120 §7.3：有 w 无 at 的角色图不误判待标定（w 默认 0.22／对称摆放口径在）');
  const probe = C.momentLayout('pangpang-probe', 'deck1', 0, 1);
  ok(!!probe && probe.x > 0 && probe.h === null, 'B120 §7.3：有 w 无 at 的角色图照旧走对称摆放（不被 figures 判据吞掉）');
  delete D.moments['pangpang-probe'];
  P('覆盖卡：figures lint ／ 全站枚举零双现 ' + nCombos.length + ' 条 ／ 医务室与观景厅计数 ／ CSS 契约 ／ 标定通道 逐条通过');
}


/* ============ 19. B119 内景接线 ＋ B117 存档三态／通关记录（2026-10-04 三裁轮） ============ */
console.log('');
console.log('———— B119 内景接线（注册一致性 / pins / 进出往返 / 锚点 / 回归）＋ B117 三态与通关记录 ————');

/* --- 19-1 B119① 注册一致性（图在库／宽高＝成图实测／节点 scene 覆盖 ↔ 场景一一对应） --- */
{
  const ROOMS = ['room-galley', 'room-sleep', 'room-medbay', 'room-gym', 'room-observation', 'room-lab', 'room-comms',
    'room-cooling', 'room-server', 'room-solarctl', 'room-maintenance', 'room-escapepod',
    'room-command', 'room-captain', 'room-warehouse', 'room-airlock', 'room-reactor'];
  eq(ROOMS.length, 17, 'B119①：§4.1 映射表 17 房——全部入断言面');
  const bound = Object.keys(D.nodes).filter(id => /^room-/.test(D.nodes[id].scene || '') && Number(id) <= 21);
  eq(bound.sort((a, b) => Number(a) - Number(b)).join(','), '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17',
    'B119①：接线房间节点＝1~17 全（17 房无一走回退）');
  const boundEv = Object.keys(D.nodes).filter(id => /^room-/.test(D.nodes[id].scene || '') && Number(id) > 21);
  eq(boundEv.sort((a, b) => Number(a) - Number(b)).join(','), '23,24,25,26,27,29,30,31,32,33,34,35,36,37,38,40,43,45',
    'B119①：房内后继事件显式声明房间场景 18 个（B126：+29 被制服——桑尼自反应堆舱走出）——读档/直进也落回内景');
  const bad = [];
  ROOMS.forEach(sid => {
    const sc = D.scenes[sid];
    if (!sc) { bad.push(sid + '：未注册'); return; }
    if (sc.image.indexOf('../images/station/rooms/') !== 0) bad.push(sid + '：图路径前缀非 rooms/');
    const p = path.join(dir, sc.image);
    if (!fs.existsSync(p)) bad.push(sid + '：图不存在');
    const sz = fs.existsSync(p) ? jpegSize(p) : null;
    if (!(sc.width > 0 && sc.height > 0)) bad.push(sid + '：宽高非法');
    if (sz && (sz.w !== sc.width || sz.h !== sc.height)) bad.push(sid + '：宽高 ≠ 成图实测');
    const hosts = bound.filter(id => D.nodes[id].scene === sid);
    if (hosts.length !== 1) bad.push(sid + '：绑定节点数 ' + hosts.length);
    if (!FLOOR_OF_LABEL[sc.label]) bad.push(sid + '：label 非楼层（' + sc.label + '）');
  });
  eq(bad.join(' ｜ '), '', 'B119①：十七间内景——路径前缀／文件在／宽高＝成图实测／节点一一对应／label＝楼层');
  ok(!LEVELS.dalim.moments && Object.keys(LEVELS.dalim.scenes).every(sid => !/^room-/.test(sid)),
    'B119⑤：示例关（dalim）无内景接线——零变化');
}

/* --- 19-2 B119②③ pins：界内／出口 pin＝本层大厅／点击路径 pinChoiceIndex ≥ 0 --- */
{
  const HALL = { '顶层': '18', '中层': '20', '底层': '21' };
  const PROBES = [{}, { items: ['医疗包'] }, { items: ['万能扳手'] }, { items: ['桑尼的账本'] }, { items: ['磁力靴'] },
    { learned: { '维修爬道路线': true } }, { learned: { '太阳能板已修好': true } },
    { learned: { '逃生舱检查过': true, '已广播集合': true } }, { learned: { '铁头已开门': true } },
    { items: ['工牌'], learned: { '保险柜密码': true } },
    { items: ['控制芯片', '冷却剂罐', '站长授权卡'], learned: { '全站复电': true } }];
  const bad = [], unpick = [];
  Object.keys(D.scenes).filter(sid => /^room-/.test(sid)).forEach(sid => {
    const sc = D.scenes[sid];
    const host = Object.keys(D.nodes).find(id => D.nodes[id].scene === sid);
    const hall = HALL[sc.label];
    if (!sc.pins[hall]) bad.push(sid + '：缺出口 pin ' + hall);
    if (!(host && sc.pins[host])) bad.push(sid + '：缺自指 pin ' + host);   // B125/B128：每房必有（数据面＝校准锚点；房间不渲染标记/遮罩）
    Object.entries(sc.pins).forEach(([pid, xy]) => {
      if (!(xy[0] > 0 && xy[0] < sc.width && xy[1] > 0 && xy[1] < sc.height)) bad.push(sid + '：pin ' + pid + ' 越界');
      if (pid === host) return;                       // B125：自指 pin＝校准锚点（点击＝空操作）⇒ 豁免「可点路径」断言
      const hit = PROBES.some(extra => {
        const s = C.newState('normal'); s.loc = host; s.scene = sid; Object.assign(s, extra);
        return C.pinChoiceIndex(s, pid) >= 0;
      });
      if (!hit) unpick.push(sid + '/' + pid);
    });
  });
  eq(bad.join(' ｜ '), '', 'B119②/B125：内景 pin 全部界内，每房有本层大厅出口 pin（18/20/21）与自指 pin（键＝本房节点号/B128 起＝校准锚点）');
  eq(unpick.join(' ｜ '), '', 'B119③：每个房内交互 pin 有可点路径（自指 pin 豁免——点击＝空操作；B128 起渲染面不出现）');
}

/* --- 19-3 B119③ 行为：进房切内景／回大厅切层图（Core 直测，无 DOM）＋未接线房间零降级 --- */
{
  const ROOM = { '1': ['room-galley', '18'], '2': ['room-sleep', '18'], '3': ['room-medbay', '18'],
    '4': ['room-gym', '18'], '5': ['room-observation', '18'], '7': ['room-lab', '20'], '8': ['room-comms', '20'],
    '13': ['room-cooling', '21'], '14': ['room-server', '21'], '15': ['room-solarctl', '21'],
    '16': ['room-maintenance', '21'], '17': ['room-escapepod', '21'],
    '6': ['room-command', '20'], '9': ['room-captain', '20'], '10': ['room-warehouse', '20'],
    '11': ['room-airlock', '20'], '12': ['room-reactor', '21'] };
  const bad = [];
  Object.entries(ROOM).forEach(([id, [sid, hall]]) => {
    const s = C.newState('normal');
    C.go(s, hall);
    const deck = s.scene;
    C.go(s, id);                                   // 点门 pin／选项 → 进房
    if (s.scene !== sid) bad.push('进 ' + id + '：' + s.scene + ' ≠ ' + sid);
    if (C.sceneOf(s) !== sid) bad.push('进 ' + id + '：sceneOf 未跟随');
    C.go(s, hall);                                 // 出口 → 回大厅
    if (s.scene !== deck) bad.push('出 ' + id + '：' + s.scene + ' ≠ ' + deck);
  });
  eq(bad.join(' ｜ '), '', 'B119③：十七间进出往返——进房切内景、回大厅切回本层图（syncScene／sceneOf 同源）');
  /* 零降级机制：临时注销一间（合成场景）⇒ 该房不换图、维持本层 deck；还原后恢复 —— 产品数据零改动 */
  {
    const keep = D.scenes['room-reactor'];
    delete D.scenes['room-reactor'];
    const s = C.newState('normal'); C.go(s, '21'); const deck = s.scene; C.go(s, '12');
    eq(s.scene, deck, 'B119⑤：未接线（临时注销 room-reactor）⇒ 不换图、维持本层 deck（零降级机制在）');
    D.scenes['room-reactor'] = keep;
    const s2 = C.newState('normal'); C.go(s2, '21'); C.go(s2, '12');
    eq(s2.scene, 'room-reactor', 'B119⑤：还原注册后 ⇒ 再进 12 号切回内景（合成场景已复原）');
  }
}

/* --- 19-4 B119④ 锚点：房间相关浮现图锚点落在本房图界内（含分支/窗景） --- */
{
  const STALE = { 'pangpang-hail': [478, 554], 'aya-nurse': [1332, 554], 'yilanna-awake': [1572, 554],
    'yinhe-idle': [1416, 871], 'tietou-armwrestle': [552, 879], 'tietou-open': [552, 879],
    'guardbot-block': [1322, 509], 'helper-join': [928, 927], 'laobu-lookout': [728, 947],
    'tangtang-guide': [470, 486], 'sangni-smile': [990, 880], 'sangni-flip': [820, 880],
    'sangni-cave': [980, 880], 'sangni-bribe': [900, 880],
    'pod-standoff': [1188, 857] };   // B127：win-* 两条随撤注册退出（T51／T52 不注册）
  const PROBES = [{}, { visited: { '24': true } }, { chDone: { '跟胖胖打过招呼': true } }, { items: ['桑尼的账本'] },
    { chDone: { '开过保险柜': true } }, { chDone: { '急救箱开过': true } }, { learned: { '逃生舱检查过': true } }];
  const PAIRS = Object.keys(D.scenes).filter(sid => /^room-/.test(sid))
    .map(sid => [sid, Object.keys(D.nodes).find(id => D.nodes[id].scene === sid)]);
  /* 房内后继事件（无 pin／有 pin 均列——确保房间相关浮图逐张被覆盖；B126 补 25/30/29/45 与站外 19/39） */
  PAIRS.push(['room-command', '23'], ['room-medbay', '24'], ['room-gym', '26'], ['room-gym', '27'], ['room-warehouse', '31'],
    ['room-warehouse', '32'], ['room-warehouse', '33'], ['room-server', '35'], ['room-solarctl', '36'],
    ['room-maintenance', '37'], ['room-maintenance', '38'], ['room-escapepod', '40'], ['room-escapepod', '43'],
    ['room-lab', '25'], ['room-lab', '30'], ['room-reactor', '29'], ['room-captain', '45'], ['exterior', '19'], ['exterior', '39']);
  const bad = [], seen = new Set();
  PAIRS.forEach(([sid, host]) => {
    const sc = D.scenes[sid];
    PROBES.forEach(extra => {
      const s = C.newState('normal'); s.loc = host; Object.assign(s, extra);
      C.momentsOf(s, D.nodes[host]).forEach(mid => {
        seen.add(mid);
        const plan = C.momentLayout(mid, sid);
        const half = plan && plan.h ? plan.h / 2 : 0;
        const inside = !!plan && plan.x > 0 && plan.x < sc.width && plan.y > 0 && plan.y < sc.height
          && (!plan.h || (plan.y - half > 0 && plan.y + half < sc.height));
        if (!inside) bad.push(sid + '：' + mid);
      });
    });
  });
  eq(bad.join(' ｜ '), '', 'B119④：各房浮现图锚点（含 mIf 分支）落在本房图界内');
  const stale = Object.keys(STALE).filter(id => JSON.stringify(D.moments[id].at) === JSON.stringify(STALE[id]));
  eq(stale.join(','), '', 'B119④：房间相关浮现图锚点已按 room 图重标（deck 期旧值作废重标）');
  eq([...seen].sort().join(','),
    'aya-nurse,broadcast,chip-extract,core-interfaces,gear-locker,guardbot-block,helper-join,laobu-lookout,laobu-point,locker-emergency,manifest-clue,panel-weld,pangpang-hail,pod-standoff,power-restore,safe-open,sangni-bribe,sangni-cave,sangni-flip,sangni-smile,spec-pickup,steam-dash,tangtang-guide,tietou-armwrestle,tietou-open,yilanna-awake,yinhe-idle',
    'B119④＋B127＋B05：覆盖 27 张（原 33 减撤注册 6——窗景 2＋firstaid-open／robot-rescue／pods-check＋sangni-ambush（B05）；含 mIf 分支 N4／N8／N9／N11／N12／N17／N19 与站外 19）——逐张锚点界内');
  P('内景锚点：27 张图逐张落在本房图界内（撤注册 6 条已退出） 逐条通过');
}

/* --- 19-5 B119⑤ 回归：读档场景归一／未接线节点输出与改前一致 --- */
{
  const mk = (loc, scene) => {
    const s = C.newState('normal'); s.loc = loc; s.visited[loc] = true;
    if (scene) s.scene = scene;
    return s;
  };
  eq(C.normalizeState(mk('1', 'deck1')).scene, 'room-galley', 'B119⑤：旧档（scene 停在 deck1）读到 1 号 ⇒ 归一为内景');
  eq(C.normalizeState(mk('5', 'deck1')).scene, 'room-observation', 'B119⑤：同一口径覆盖 5 号');
  eq(C.normalizeState(mk('16', 'deck1')).scene, 'room-maintenance', 'B119⑤：P2b 同口径——16 号归一到维修区内景');
  eq(C.normalizeState(mk('6', 'deck1')).scene, 'room-command', 'B119⑤：首轮五间——6 号归一到指挥舱内景');
  eq(C.normalizeState(mk('9', 'deck1')).scene, 'room-captain', 'B119⑤：9 号归一到站长室内景');
  eq(C.normalizeState(mk('10', 'deck1')).scene, 'room-warehouse', 'B119⑤：10 号归一到仓库内景');
  eq(C.normalizeState(mk('11', 'deck3')).scene, 'room-airlock', 'B119⑤：11 号归一到气闸舱内景');
  eq(C.normalizeState(mk('12', 'deck2')).scene, 'room-reactor', 'B119⑤：12 号归一到反应堆舱内景');
  eq(C.normalizeState(mk('21', 'room-galley')).scene, 'deck3', 'B119⑤：底层大厅显式声明 ⇒ 不被出发房间带走（同 18/20/22 口径）');
  eq(C.normalizeState(mk('19')).scene, 'exterior', 'B119⑤：19（站外，无 scene 字段旧档）⇒ 由显式声明/ pin 推出站外');
  eq(C.normalizeState(mk('22', 'room-galley')).scene, 'deck1', 'B119⑤：无 pin 走廊事件（22）⇒ 按声明重算回楼层（不被出发房间带走）');
  eq(C.normalizeState(mk('10')).scene, 'room-warehouse', 'B119⑤：无 scene 字段的旧档 ⇒ 按节点声明推出内景');
  eq(C.normalizeState(mk('24')).scene, 'room-medbay', 'B119⑤：房内事件（24）⇒ 由注册场景推出内景');
  eq(C.normalizeState(mk('38', 'deck3')).scene, 'room-maintenance', 'B119⑤：房内后继事件（38）显式声明 ⇒ 读档归一到维修区内景');
  const s = C.newState('normal'); C.go(s, '19');
  eq(s.scene, 'exterior', 'B119⑤：站外 19 照旧（未接线节点输出不变）');
  eq(JSON.stringify(D.scenes.exterior.pins['19']), '[1505,778]', 'B119⑤：deck/exterior 既有 pins 未动（19 号实测值保留——§2 另有逐条断言）');
}

/* --- 19-6 B117 卡片三态与通关记录（storage 桩；渲染与机检同源＝Core.cardInfo） --- */
{
  const info0 = C.cardInfo(fakeStore(), 'station');
  eq(info0.save, null, 'B117①：无存档 ⇒ save 为空');
  eq(info0.buttons.map(b => b.label).join(','), '开始', 'B117①：无存档 ⇒ 唯一按钮「开始」');
  eq(info0.buttons.map(b => b.confirm).join(','), 'false', 'B117①：无存档 ⇒ 无覆盖确认（直接开新局）');
  ok(!/继续|重玩|继续上次进度/.test([info0.buttons.map(b => b.label).join(''), info0.recordLine, info0.failLine, info0.note].join('｜')),
    'B117①：无存档卡片文案不含「继续」「重玩」「继续上次进度」');
  /* ② 未结束存档：继续＋重新开始；点「继续」＝载入该存档 */
  const st2 = fakeStore();
  const save2 = C.newState('normal', '小豆'); save2.loc = '5'; save2.coins = 7; save2.items = ['手电', '工牌']; save2.scene = 'room-observation';
  C.saveTo(st2, 'station', save2);
  const info2 = C.cardInfo(st2, 'station');
  eq(info2.buttons.map(b => b.label).join(','), '继续,重新开始', 'B117②：未结束存档 ⇒ 「继续」＋「重新开始」、无「开始」');
  eq(info2.buttons.map(b => b.confirm).join(','), 'false,true', 'B117④：覆盖确认只挂新局（「继续」不要，「重新开始」要）');
  const back2 = C.normalizeState(C.loadFrom(st2, 'station'));
  eq([back2.loc, back2.coins, back2.items.join('+'), back2.scene, back2.me].join('｜'), '5｜7｜手电+工牌｜room-observation｜小豆',
    'B117②：点「继续」⇒ 载入该存档（节点／资源／道具／场景／玩家名一致）');
  /* ③ 已结束（通关／失败各一）：不出现「继续」、记录块在、有「重玩」 */
  const st3 = fakeStore();
  const save3 = C.newState('normal'); save3.loc = '41';
  C.saveTo(st3, 'station', save3);
  C.addRecord(st3, 'station', C.endShortName(D.nodes['41']));
  const info3 = C.cardInfo(st3, 'station');
  eq(info3.buttons.map(b => b.label).join(','), '重玩', 'B117③：已结束（通关）⇒ 唯一「重玩」、无「继续」');
  eq(info3.buttons.map(b => b.confirm).join(','), 'true', 'B117④：「重玩」＝覆盖确认');
  eq(info3.recordLine, '🏆 通关记录：结局 · 圆满', 'B117③：记录块＝「🏆 通关记录：结局 · 圆满」');
  eq(info3.failLine, '', 'B117③：通关结束 ⇒ 无「上局结束」行');
  const st4 = fakeStore();
  const save4 = C.newState('normal'); save4.loc = '44';
  C.saveTo(st4, 'station', save4);
  const info4 = C.cardInfo(st4, 'station');
  eq(info4.buttons.map(b => b.label).join(','), '重玩', 'B117③：已结束（失败）⇒ 唯一「重玩」');
  eq(info4.failLine, '上局结束：未通关', 'B117③：失败终止 ⇒ 「上局结束：未通关」另起一行');
  eq(info4.recordLine, '', 'B117⑤：失败不写记录（记录块空）');
  /* 结束判定＝win／fail 节点或 bankrupt：29 号（剧情失败）与破产态同样算结束 */
  const st5 = fakeStore(); const save5 = C.newState('normal'); save5.loc = '29'; C.saveTo(st5, 'station', save5);
  eq(C.cardInfo(st5, 'station').buttons[0].label, '重玩', 'B117③：29 号失败节点 ⇒ 已结束');
  const st6 = fakeStore(); const save6 = C.newState('normal'); save6.loc = '12'; save6.bankrupt = true; save6.zeroRes = 'oxygen';
  C.saveTo(st6, 'station', save6);
  eq(C.cardInfo(st6, 'station').buttons[0].label, '重玩', 'B117③：bankrupt ⇒ 已结束');
  eq(C.cardInfo(st6, 'station').failLine, '上局结束：未通关', 'B117③：破产态同样报「上局结束：未通关」');
  /* ④ 覆盖确认文案（逐字）＋脚注（DOM 侧行为由冒烟演示；文案与开关在本层锁死） */
  eq(info3.coverAsk, '开始新局会覆盖本关的旧存档（通关记录与手动存档位保留）。确定开始？', 'B117④＋B05：覆盖确认文案逐字（§1.1——句尾并入「与手动存档位保留」，评审修正轮 #9）');
  eq(info0.note, '进度存在这台设备的浏览器里（各人各份）', 'B117：卡片脚注＝本机存档口径（各人各份）');
  /* ⑤ 记录持久：开新局覆盖存档 ⇒ 记录仍在；多结局按达成先后追加、去重 */
  const recBefore = C.recordOf(st3, 'station').join('、');
  C.saveTo(st3, 'station', C.newState('normal'));            // 开新局＝覆盖本关存档
  eq(C.recordOf(st3, 'station').join('、'), recBefore, 'B117⑤：开新局覆盖存档 ⇒ 通关记录仍在（独立键）');
  C.addRecord(st3, 'station', C.endShortName(D.nodes['42']));
  C.addRecord(st3, 'station', C.endShortName(D.nodes['41']));
  eq(C.recordOf(st3, 'station').join('、'), '结局 · 圆满、结局 · 取舍', 'B117⑤：多结局按达成先后追加＋重复不重记');
  eq(C.recordOf(fakeStore(), 'station').join('、'), '', 'B117⑤：无记录 ⇒ 空（不显示记录块）');
  /* ⑥ 键与本地口径：存档键·既有／记录键·新增；引擎无网络请求 */
  eq(C.recKey('station'), 'mygame2.rec.station.v1', 'B117⑥：记录键＝mygame2.rec.<关>.v1（独立键）');
  eq(C.saveKey('station'), 'mygame2.save.station.v1', 'B117⑥：存档键＝既有 mygame2.save.<关>.v1');
  ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon/.test(engSrc), 'B117⑥：引擎无网络请求——存档与记录只在 localStorage');
  P('B117：三态①③／继续载入一致②／覆盖确认与文案④／记录持久⑤／键与本地口径⑥ 逐条通过');
}

/* ============ 20. B122 背景状态变体 ＋ B123/B124/B125 ＋ §7.7-12 同框完备性（2026-10-04 表现体系轮） ============ */
console.log('');
console.log('———— B122 背景变体（判定/几何/兜底/读档/回归）＋ B123 到达提示 ＋ B124 重开同句 ＋ B125 自指 pin ＋ §7.7-12 完备性 ————');

/* --- 20-1 B122 §7.10 变体五条机检（判定／几何／兜底／读档／回归） --- */
{
  const mk = extra => { const s = C.newState('normal'); if (extra) Object.assign(s, extra); return s; };
  /* ① 判定：七条注册逐条命中（条件驱动）；全不满足＝基础条目；多命中取首条（先匹配者为准） */
  const VAR = [
    ['room-medbay', { visited: { '24': true } }, 'medbay-awake'],
    ['room-maintenance', { learned: { '机器人小帮手': true } }, 'maintenance-free'],
    ['room-observation', { chDone: { '跟胖胖打过招呼': true } }, 'observation-catgone'],
    ['room-warehouse', { learned: { '收了桑尼的贿赂': true } }, 'warehouse-clear'],
    ['room-gym', { chDone: { '急救箱开过': true } }, 'gym-firstaid-open'],
    ['room-captain', { chDone: { '开过保险柜': true } }, 'captain-safeopen'],
    ['room-escapepod', { learned: { '逃生舱检查过': true } }, 'escapepod-checked']
  ];
  const bad = [];
  VAR.forEach(([sid, extra, id]) => {
    const hit = C.sceneEntry(mk(extra), sid), base = C.sceneEntry(mk(), sid);
    if (!hit || !hit.variant || hit.image !== '../images/station/rooms/' + id + '.jpg') bad.push(sid + '：命中≠' + id);
    if (hit && (hit.width !== D.scenes[sid].width || hit.height !== D.scenes[sid].height)) bad.push(sid + '：变体宽高≠基础');
    if (!base || base.variant || base.image !== D.scenes[sid].image) bad.push(sid + '：未命中未回落基础条目');
  });
  eq(bad.join(' ｜ '), '', 'B122 §7.10-1：七条变体判定（条件命中 ⇒ 新状态图；全不命中 ⇒ 基础条目；路径＝rooms/<id>.jpg）');
  eq(Object.keys(D.scenes).filter(sid => (D.scenes[sid].variants || []).length).sort().join(','), VAR.map(v => v[0]).sort().join(','),
    'B122 §7.11：变体注册＝7 间（T73~T79 枚举 1~7 行逐条在案）');
  {
    /* 行 4 的 any 三分支逐支命中（VAR 表只抽了收贿一支；后两支＝pinsAll 31／32） */
    const anyBad = [['31', '搬过冷却剂'], ['32', '看过账本']]
      .filter(([pid]) => { const s = mk(); s.visited[pid] = true;
        const e = C.sceneEntry(s, 'room-warehouse'); return !e.variant || e.image !== '../images/station/rooms/warehouse-clear.jpg'; });
    eq(anyBad.map(x => x[1]).join(','), '', 'B122 §7.11 行 4：any 三支逐支命中（收贿／pinsAll 31／pinsAll 32）');
  }
  {
    const sc = D.scenes['room-sleep'];
    sc.variants = [ { cond: { pinsAll: ['2'] }, image: '../images/station/rooms/sleep-first.jpg', width: sc.width, height: sc.height },
                    { cond: { pinsAll: ['18'] }, image: '../images/station/rooms/sleep-second.jpg', width: sc.width, height: sc.height } ];
    const s = mk(); s.visited['2'] = true; s.visited['18'] = true;
    eq(C.sceneEntry(s, 'room-sleep').image.split('/').pop(), 'sleep-first.jpg', 'B122 §7.10-1：多命中 ⇒ 取数组首条（顺序敏感）');
    delete sc.variants;
    eq(C.sceneEntry(s, 'room-sleep').image.split('/').pop(), 'sleep.jpg', 'B122：合成探针已撤除（场景还原基线）');
  }
  /* ② 几何：width/height 与基础条目逐值相等（同尺寸同构图）；figures（若有）键 ∈ characters、框与卡面在图界内 */
  const geoBad = [];
  Object.keys(D.scenes).forEach(sid => {
    const sc = D.scenes[sid];
    (sc.variants || []).forEach((v, i) => {
      if (v.width !== sc.width || v.height !== sc.height) geoBad.push(sid + '#' + i + '：尺寸≠基础');
      if (v.figures) Object.entries(v.figures).forEach(([cid, box]) => {
        if (!D.characters[cid]) geoBad.push(sid + '#' + i + '/' + cid + '：键非 characters');
        const ex = Math.max(12, box[2] * 0.08), ey = Math.max(12, box[3] * 0.08);
        if (!(box[0] > 0 && box[1] > 0 && box[0] + box[2] < v.width && box[1] + box[3] < v.height)) geoBad.push(sid + '#' + i + '/' + cid + '：框越界');
        if (!(box[0] - ex > 0 && box[1] - ey > 0 && box[0] + box[2] + ex < v.width && box[1] + box[3] + ey < v.height)) geoBad.push(sid + '#' + i + '/' + cid + '：卡面越界');
      });
    });
  });
  eq(geoBad.join(' ｜ '), '', 'B122 §7.10-2：变体 width/height＝基础条目逐值相等；figures（若有）键／界内／卡面（含余量）同判（B126：medbay-awake 苏醒姿 figures 已标定回填——T73 到货）');
  /* figures 解析语义（合成探针）：整表替换 / {}＝该状态无同框面 / 缺省回落基础表 */
  {
    const sc = D.scenes['room-sleep'];
    sc.variants = [ { cond: { pinsAll: ['2'] }, image: sc.image, width: sc.width, height: sc.height, figures: { pangpang: [10, 10, 100, 100] } } ];
    const s = mk(); s.visited['2'] = true;
    eq(JSON.stringify(C.figuresOf('room-sleep', s)), JSON.stringify({ pangpang: [10, 10, 100, 100] }),
      'B122 §7.10：变体给出 figures ⇒ 整表替换（按变体后的 L1 判）');
    sc.variants[0].figures = {};
    eq(JSON.stringify(C.figuresOf('room-sleep', s)), '{}', 'B122 §7.10：变体 figures＝{} ⇒ 该状态无同框面（不回落基础表）');
    sc.variants[0].figures = null;
    eq(C.figuresOf('room-sleep', s), null, 'B122 §7.10：变体未给 figures ⇒ 回落基础 figures（本房无 ⇒ null）');
    delete sc.variants;
  }
  /* 覆盖卡按变体后 L1 判（合成探针：变体 figures 生效 ⇒ 覆盖几何随新轮廓框） */
  {
    const sc = D.scenes['room-medbay'];
    sc.variants.push({ cond: { pinsAll: ['18'] }, image: sc.image, width: sc.width, height: sc.height, figures: { yilanna: [100, 200, 80, 120] } });
    const s = mk(); s.visited['18'] = true;
    const plan = C.momentLayout('yilanna-awake', 'room-medbay', 0, 1, s);
    eq([C.coverState('yilanna-awake', 'room-medbay', s), plan && plan.cover].join(','), 'cover,true',
      'B122 §7.10：变体生效 ⇒ 覆盖卡按新状态判（合成变体 figures [100,200,80,120]）');
    eq([plan.x, plan.y, plan.w, plan.h].join(','), '140,260,104,144', 'B122 §7.10：卡面＝新轮廓框＋外扩 max(12,8%×边) 实算（140,260,104,144）');
    sc.variants.pop();
    eq(JSON.stringify(C.figuresOf('room-medbay', s).yilanna), '[690,255,195,180]', 'B122：合成变体已撤除（基础 figures 还原）');
  }
  /* ③ 兜底：运行期加载失败 ⇒ src 回落基础图＋一行告警（行为由临时 DOM 冒烟演示；此处为源码契约） */
  ok(/背景状态变体缺图（回落基础图）/.test(engSrc) && engSrc.indexOf('img.dataset.fail = cur') >= 0 && engSrc.indexOf('sceneLoad(sc.image, entry)') >= 0,
    'B122 §7.10-3：变体图加载失败 ⇒ 回落基础图渲染＋一行告警（同一失败图不重复重试；B10 起回落同走双帧路径 sceneLoad——源码契约）');
  ok(engSrc.indexOf('const entry = Core.sceneEntry(st, sid)') >= 0 && engSrc.indexOf('toast(Core.arriveText(sid))') >= 0,
    'B122 §7.10：applyScene 单源＝sceneEntry（图／宽高）——逐帧求值（条件变化同帧生效、场景不变也重算）');
  ok(engSrc.indexOf('function applyMomentGeom(d, plan, sc)') >= 0 && engSrc.indexOf('d.dataset.plan !== momentKey(plan)') >= 0,
    'B122 §7.10：覆盖几何随生效 figures 就地刷新（复用元素、同 plan 零改动；行为面＝DOM 冒烟⑦——源码契约）');

  /* ④ 读档：旧档（无 variants 概念）读入 ⇒ 按 st 重算即落位（cond 驱动、零状态位；Core 层，无 DOM） */
  const oldRaw = { diff: 'normal', coins: 12, oxygen: 70, items: ['手电'], visited: { '24': true, '3': true }, done: {},
    learned: { '逃生舱检查过': true }, chDone: { '急救箱开过': true }, hist: [], loc: '3' };
  const sv = C.normalizeState(oldRaw);
  eq(sv.scene, 'room-medbay', 'B122 §7.10-4：旧档（scene 停在 deck）读入 ⇒ 场景归一到内景');
  eq(C.sceneEntry(sv, 'room-medbay').image.split('/').pop(), 'medbay-awake.jpg',
    'B122 §7.10-4：读档后按 cond 重算 ⇒ 变体求值正确（无独立状态位）');
  eq(C.sceneEntry(C.normalizeState(Object.assign({}, oldRaw, { loc: '4' })), 'room-gym').image.split('/').pop(), 'gym-firstaid-open.jpg',
    'B122 §7.10-4：同一口径覆盖 N4（chDone 急救箱开过）');
  eq(C.sceneEntry(C.normalizeState(Object.assign({}, oldRaw, { loc: '9', visited: {}, chDone: { '开过保险柜': true } })), 'room-captain').image.split('/').pop(),
    'captain-safeopen.jpg', 'B122 §7.10-4：同一口径覆盖 9 号（chDone 开过保险柜）');
  /* ⑤ 回归：无 variants 的场景逐值一致；示例关零变化；pins／pinsAll／覆盖几何不受影响（同尺寸断言） */
  const noVar = Object.keys(D.scenes).filter(sid => !(D.scenes[sid].variants || []).length);
  const regBad = noVar.filter(sid => { const e = C.sceneEntry(mk(), sid), sc = D.scenes[sid];
    return !e || e.variant || e.image !== sc.image || e.width !== sc.width || e.height !== sc.height; });
  eq(regBad.join(','), '', 'B122 §7.10-5：无 variants 场景输出与改前逐字一致（' + noVar.length + ' 个场景）');
  ok(Object.keys(LEVELS.dalim.scenes).every(sid => !(LEVELS.dalim.scenes[sid].variants || []).length),
    'B122 §7.10-5：示例关（dalim）零变化（无一 scenes[].variants）');
  eq(C.figuresOf('room-medbay', null).aya.join(','), '455,145,235,515', 'B122 §7.10-5：变体未命中 ⇒ 覆盖几何＝基础 figures（pins／pinsAll／覆盖不受影响）');
  P('背景变体：判定 7 条／序敏感／几何（同尺寸＋figures 界内）／figures 解析三态／覆盖随变体判／兜底契约／读档归一 3 例／回归 逐条通过');
}

/* --- 20-2 B123 到达提示（房间＝房间名·无图标；其余场景＝现形） --- */
{
  const ROOMS17 = ['room-galley', 'room-sleep', 'room-medbay', 'room-gym', 'room-observation', 'room-lab', 'room-comms',
    'room-cooling', 'room-server', 'room-solarctl', 'room-maintenance', 'room-escapepod',
    'room-command', 'room-captain', 'room-warehouse', 'room-airlock', 'room-reactor'];
  const badR = ROOMS17.filter(sid => { const t = C.arriveText(sid); return !/^到达：/.test(t) || t.indexOf('🛗') >= 0; });
  eq(badR.join(','), '', 'B123 §6.3：17 房到达提示＝「到达：<房间名>」（无 🛗）');
  eq(C.arriveText('room-galley'), '到达：食堂', 'B123：房间名＝name「·」后段（抽查食堂）');
  eq(C.arriveText('room-solarctl'), '到达：太阳能控制室', 'B123：抽查太阳能控制室（多字房名）');
  eq([C.arriveText('deck1'), C.arriveText('deck2'), C.arriveText('deck3'), C.arriveText('exterior')].join('｜'),
    '🛗 到达：顶层｜🛗 到达：中层｜🛗 到达：底层｜🛗 到达：站外', 'B123：非房间（大厅／走廊／站外）＝保留现形逐条');
  ok(engSrc.indexOf('toast(Core.arriveText(sid))') >= 0, 'B123：applyScene 的到达 toast 走 Core.arriveText（口径单源——源码契约）');
  eq(C.sceneLabel('deck1'), '顶层', 'B123：场景标口径未动（左上角标仍＝楼层）');
  eq(Object.keys(LEVELS.dalim.scenes).filter(sid => /^room-/.test(sid)).length, 0, 'B123：示例关无内景（全走非房间分支——零变化）');
  const dalimAll = (C.selectLevel('dalim'), Object.keys(LEVELS.dalim.scenes).map(sid => C.arriveText(sid)));
  C.selectLevel('station');                       // 口径面回切站关（后续检定仍按站关）
  eq(dalimAll.length > 0 && dalimAll.every(t => /^🛗 到达：/.test(t)), true,
    'B123：示例关全场景到达提示＝现形「🛗 到达：…」（逐场景核；口径零变化）');
  P('到达提示：房间无 🛗（17/17）／大厅与站外现形／单源 逐条通过');
}

/* --- 20-3 B124 重开确认同句（卡片侧与局内重开同源；不得各写一份） --- */
{
  eq(C.coverAsk(), '开始新局会覆盖本关的旧存档（通关记录与手动存档位保留）。确定开始？', 'B124＋B05 §1.1：采用句逐字（B05 评审修正轮 #9：句尾并入「与手动存档位保留」——B136 口径）');
  eq(C.cardInfo(fakeStore(), 'station').coverAsk, C.coverAsk(), 'B124：卡片侧（cardInfo.coverAsk）＝同源一份');
  ok(engSrc.indexOf('confirm(Core.coverAsk())') >= 0, 'B124：局内重开（restart）＝同一句（源码契约）');
  const hits = engSrc.split(C.coverAsk()).length - 1;
  eq(hits, 1, 'B124：采用句在源码中恰一份（不得各写一份；实测 ' + hits + ' 处）');
  P('重开确认：卡片与局内同源一句（源码恰一份） 逐条通过');
}

/* --- 20-4 自指 pin（17 房无例外 · 数据面）＋编号圈渲染集与遮罩门控（B128／B129 机检①~③） --- */
{
  const ROOMS17 = Object.keys(D.scenes).filter(sid => /^room-/.test(sid));
  eq(ROOMS17.length, 17, 'B125：17 房全在断言面');
  const roomOf = sid => Object.keys(D.nodes).find(id => D.nodes[id].scene === sid);
  const missing = ROOMS17.filter(sid => { const host = roomOf(sid); return !(host && D.scenes[sid].pins[host]); });
  eq(missing.join(','), '', 'B125 §4.1-④：每房 pins 键集含本房节点号（17/17——自指 pin＝校准锚点）');
  const inb = [];
  ROOMS17.forEach(sid => { const sc = D.scenes[sid]; Object.entries(sc.pins).forEach(([pid, xy]) => {
    if (!(xy[0] > 0 && xy[0] < sc.width && xy[1] > 0 && xy[1] < sc.height)) inb.push(sid + '/' + pid); }); });
  eq(inb.join(','), '', 'B125：自指 pin 与既有 pins 全部界内（暂定值·目测，随 C 键手标回填）');
  /* B128 机检①：房间/站外渲染集＝可达集（零不可点圈；自指/当前位置不出现——逐节点枚举） */
  const mk = (loc, extra) => { const s = C.newState('normal'); s.loc = loc; s.scene = C.sceneOfNode(loc); if (extra) Object.assign(s, extra); return s; };
  const badSet = [];
  Object.keys(D.nodes).forEach(id => {
    const sid = C.sceneOfNode(id);
    if (!sid || !C.plainPins(sid)) return;
    const s = mk(id), reach = C.reachablePins(s);
    C.pinsVisible(s, sid).forEach(x => { if (x === id || !reach[x]) badSet.push(sid + '/' + id + '→' + x); });
  });
  eq(badSet.join(' ｜ '), '', 'B128 §6.5-①：房间/站外渲染集＝可达集（零不可点圈、零自指/当前位置——逐节点枚举）');
  /* B128 机检②：N3 抽查（无医疗包 ⇒ {18}；持医疗包 ⇒ {18,24}——“24”仅在可点时出现、“3”不出现） */
  eq([C.pinsVisible(mk('3'), 'room-medbay').join(','),
      C.pinsVisible(mk('3', { items: ['医疗包'] }), 'room-medbay').join(',')].join('｜'), '18｜18,24',
    'B128 §6.5-②：N3 抽查（无医疗包 ⇒ {18}；持医疗包 ⇒ {18,24}）');
  /* B128 机检③：楼层图三场景渲染集与改前逐字一致（回归——全部 pins，含当前位置标记载体） */
  eq(['deck1', 'deck2', 'deck3'].map(sid => C.pinsVisible(mk('20'), sid).join(',')).join('｜'),
    '1,2,3,4,5,18｜6,7,8,9,10,11,20｜12,13,14,15,16,17,21',
    'B128 §6.5-③：楼层图三场景渲染集＝全部 pins（与改前逐字一致——地图语义保留）');
  ok(C.plainPins('room-medbay') && C.plainPins('exterior') && !C.plainPins('deck1'),
    'B128：场景分类判据＝room-*／exterior ⇒ 只渲染可点；deck／其余（含示例关）⇒ 现形');
  eq(C.pinsVisible(mk('19'), 'exterior').join(','), '', 'B128 §6.5：站外无可点编号 ⇒ 零编号圈（19 不可点时不显示）');
  /* B129：遮罩门控（房间/站外整层不渲染、不开孔）＋提示条随场景 */
  ok(engSrc.indexOf("$('dimSvg').classList.toggle('hidden', !entry.mask)") >= 0,
    'B129 §6.6：遮罩层门控＝entry.mask（false ⇒ 整层 hidden——源码契约）');
  ok(engSrc.indexOf('if (!Core.sceneEntry(st, sid).mask) return;') >= 0,
    'B129 §6.6：房间/站外不开孔（renderDim 门控在孔循环之前——源码契约）');
  eq([C.hintText('room-medbay'), C.hintText('exterior'), C.hintText('deck1')].join('｜'),
    '高亮的位置可以点击前往 ｜ 拖拽 / 滚轮缩放｜高亮的位置可以点击前往 ｜ 拖拽 / 滚轮缩放｜高亮的位置可以点击前往 · 灰暗区域还没探索到 ｜ 拖拽 / 滚轮缩放',
    'B129 §6.5/§6.6：提示条随场景（房间/站外无「灰暗区域」句；楼层图＝现形）');
  ok(engSrc.indexOf("$('hintBar').textContent = Core.hintText(sid)") >= 0, 'B129：applyScene 写入提示条（单源＝Core.hintText——源码契约）');
  /* N14：持监控回放 ⇒ 浮现集空 ⇒ 判据 false（B112 守护口径；B128 后房间不渲染标记，判据仍为数据面单源） */
  const s14 = C.newState('normal'); s14.loc = '14'; s14.items = ['监控回放'];
  eq(C.currentMarkerHidden(s14), false, 'B112/§7.7-8：N14 持监控回放 ⇒ 浮现集空 ⇒ 判据 false（回归）');
  ok(!!D.scenes['room-server'].pins['14'], 'B125：N14 自指 pin 在数据面（校准锚点——B128 后渲染面不出现）');
  const s16 = C.newState('normal'); s16.loc = '16'; s16.scene = 'room-maintenance';
  eq(C.currentMarkerHidden(s16), false, 'B125：N16（无浮图）⇒ 判据 false（样本换置——B126 后 N2 已注册 locker-emergency）');
  ok(engSrc.indexOf('add(x, y, 98 * k)') >= 0, 'B125/B129：楼层图遮罩开孔仍按当前位置洞开（半径 98×k——回归；房间/站外整层不开孔）');
  P('编号圈与遮罩：房间/站外可达集＋N3 抽查＋楼层图回归＋提示条随场景 逐条通过');
}

/* --- 20-5 §7.7-12 同框完备性（全场景×全 L2 枚举；分类与登记表逐条一致；未登记 ⇒ 红） --- */
{
  /* 登记表＝§7.3 同框面表＋§7.11 变体表（测试侧对照；渲染判据＝数据——新图/新场景自动纳入） */
  const REG_COVER = [['room-galley', 'pangpang-hail'], ['room-medbay', 'aya-nurse'], ['room-medbay', 'yilanna-awake'],
    ['room-gym', 'tietou-armwrestle'], ['room-gym', 'tietou-open'], ['room-observation', 'yinhe-idle'], ['room-lab', 'laobu-point']];
  const REG_NONE = [['room-command', 'tangtang-guide'], ['room-warehouse', 'sangni-smile'], ['room-warehouse', 'sangni-flip'],
    ['room-warehouse', 'sangni-cave'], ['room-warehouse', 'sangni-bribe'], ['room-server', 'guardbot-block'],
    ['room-maintenance', 'laobu-lookout'], ['room-escapepod', 'pod-standoff'], ['deck2', 'yinhe-ledger'], ['deck2', 'yinhe-lick']];   // B05：sangni-ambush（29）撤注册退出
  const REG_VARIANT = [['room-maintenance', 'helper-join'], ['room-captain', 'safe-open']];   // B127：firstaid-open／robot-rescue／pods-check 撤注册退出
  const REG_OBJECT = [['deck1', 'sil-figure'],
    ['room-solarctl', 'power-restore'], ['exterior', 'panel-weld'], ['room-comms', 'broadcast'], ['room-sleep', 'locker-emergency'],
    ['room-lab', 'chip-extract'], ['room-airlock', 'gear-locker'], ['room-reactor', 'spec-pickup'], ['room-reactor', 'core-interfaces'],
    ['room-comms', 'manifest-clue'], ['room-cooling', 'steam-dash']];   // B127：win-* 两条（窗景）撤注册退出
  const table = {};
  REG_COVER.forEach(([s, m]) => { table[s + '|' + m] = 'cover'; });
  REG_NONE.forEach(([s, m]) => { table[s + '|' + m] = 'none'; });
  REG_VARIANT.forEach(([s, m]) => { table[s + '|' + m] = 'variant'; });
  REG_OBJECT.forEach(([s, m]) => { table[s + '|' + m] = 'object'; });
  /* 枚举：全场景×全 L2（含 mIf 分支——条件探针覆盖节点分支） */
  const PROBES = [{}, { visited: { '24': true } }, { chDone: { '跟胖胖打过招呼': true } },
    { items: ['桑尼的账本'] }, { items: ['监控回放'] },
    { chDone: { '开过保险柜': true } }, { chDone: { '急救箱开过': true } }, { learned: { '逃生舱检查过': true } }];
  const combos = [], mism = [];
  Object.keys(D.nodes).forEach(id => {
    const n = D.nodes[id];
    if (!n.moments && !n.mIf) return;
    const sid = C.sceneOfNode(id);
    PROBES.forEach(extra => {
      const s = C.newState('normal'); s.loc = id; Object.assign(s, extra);
      C.momentsOf(s, n).forEach(mid => {
        const key = sid + '|' + mid;
        if (combos.indexOf(key) >= 0) return;               // 同图多节点（N4／N26）＝一条组合
        combos.push(key);
        const kind = table[key], cid = C.charIdOf(mid), def = C.momentDef(mid);
        if (!kind) { mism.push(key + '：未登记'); return; }
        const figs = C.figuresOf(sid, s) || {};
        if (kind === 'cover') {
          if (!cid || !figs[cid]) mism.push(key + '：登记覆盖卡但 L1 无该角色轮廓框');
          if (C.coverState(mid, sid, s) !== 'cover') mism.push(key + '：覆盖分支未命中');
          if (def.at != null || def.w != null) mism.push(key + '：覆盖图残留 at／w（几何应单源＝figures）');
          const box = figs[cid], plan = C.momentLayout(mid, sid, 0, 1, s);
          const ex = Math.max(12, box[2] * 0.08), ey = Math.max(12, box[3] * 0.08);
          if (!(plan && plan.cover && Math.abs(plan.w - (box[2] + 2 * ex)) < 1e-9 && Math.abs(plan.h - (box[3] + 2 * ey)) < 1e-9)) mism.push(key + '：卡面 ⊉ 轮廓框＋余量');
        } else if (kind === 'none') {
          if (cid && figs[cid]) mism.push(key + '：登记「无对应」但 L1 有该角色（双现风险）');
        } else if (kind === 'variant') {
          /* host 查找含 mIf 行；探针＝行条件合成＋场景变体条件合成（knows／chDone／pinsAll／item 简形）
             ——L2 渲染时变体必已生效（B122 协作③：注册触发点落在变体已生效处；B127 后 @9 行条件
             由场景变体条件承担）；缺二者则探针态不自洽 ⇒ 红 */
          const applyCond = (s2, cond) => {
            if (!cond) return;
            if (Array.isArray(cond.any)) { applyCond(s2, cond.any[0]); return; }
            if (cond.knows) s2.learned[cond.knows] = true;
            if (cond.chDone) s2.chDone[cond.chDone] = true;
            if (cond.pinsAll) cond.pinsAll.forEach(p => { s2.visited[p] = true; });
            if (cond.item) s2.items.push(cond.item);
          };
          const rows = [];
          Object.keys(D.nodes).forEach(x => {
            if ((D.nodes[x].moments || []).indexOf(mid) >= 0) rows.push({ node: x });
            (D.nodes[x].mIf || []).forEach(r => { if ((r.moments || []).indexOf(mid) >= 0) rows.push({ node: x, cond: r.cond }); });
          });
          const row = rows.find(r => r.cond) || rows[0];
          const s2 = C.newState('normal'); s2.loc = row.node;
          const en = (D.nodes[row.node] || {}).en || {};
          if (en.learn) (Array.isArray(en.learn) ? en.learn : [en.learn]).forEach(k => { s2.learned[k] = true; });
          applyCond(s2, row.cond);
          applyCond(s2, ((D.scenes[sid] || {}).variants || [])[0] && D.scenes[sid].variants[0].cond);
          const entry = C.sceneEntry(s2, sid);
          if (!entry.variant || entry.image === D.scenes[sid].image) mism.push(key + '：L2 渲染时变体未生效（防双现失败）');
          if (C.coverState(mid, sid, s2) !== 'none') mism.push(key + '：非角色图误入覆盖卡分支');
          if (C.momentsOf(s2, D.nodes[row.node]).indexOf(mid) < 0) mism.push(key + '：探针态下 L2 未渲染（状态合成不自洽）');
        } else if (kind === 'object') {
          if (cid) mism.push(key + '：对象时刻却指向角色');
        }
      });
    });
  });
  const unreg = combos.filter(k => !table[k]);
  const dead = Object.keys(table).filter(k => combos.indexOf(k) < 0);
  eq([combos.length, unreg.join(',') || '0', dead.join(',') || '0'].join('｜'), '30｜0｜0',
    'B127＋B05 §7.7-12：全场景×全 L2 枚举恰 30 条组合（覆盖卡 7／变体 2／对象时刻 11／无对应 10——B05 减 sangni-ambush）——未登记 0、死行 0');
  eq(mism.join(' ｜ '), '', 'B122 §7.7-12：逐条分类与登记表一致（覆盖卡几何 ⊇ 轮廓框＋余量；无对应 ⇒ L1 无该实体；变体 ⇒ L2 渲染时已生效）');
  /* 传 T72 laobu-point 到货即注册（真注册·非合成）：覆盖卡分支＋仅 file 无 at／w＋图片在库 */
  const labSt = C.newState('normal');
  eq([C.coverState('laobu-point', 'room-lab', labSt), C.momentLayout('laobu-point', 'room-lab', 0, 1, labSt) !== null].join(','), 'cover,true',
    'B126 §7.7-9①：T72（laobu-point）到货即注册 ⇒ 覆盖卡分支（room-lab 轮廓框已在；「图到即生效」）');
  ok(!!D.moments['laobu-point'] && D.moments['laobu-point'].file === '../images/station/moments/laobu-point.jpg'
    && fs.existsSync(path.join(dir, D.moments['laobu-point'].file))
    && D.moments['laobu-point'].at == null && D.moments['laobu-point'].w == null,
    'B126 §7.4.1-16：laobu-point 条目＝仅 file（图片在库；无 at／w——几何唯一来源＝figures）');
  P('§7.7-12 完备性：30 组合全分类（覆盖卡 7／变体 2／对象时刻 11／无对应 10）／未登记 0／死行 0／T72 真注册在案 逐条通过');
}
/* --- 20-6 B126 扩图批到货注册（T57~T72 · 16 条）＋ T73 figures 回填 --- */
{
  /* ① B127 重审后的注册实盘：到货 16 条中 12 条在册（撤注册 4 条：firstaid-open／robot-rescue／pods-check＋sangni-ambush（B05）） */
  const NEW16 = ['power-restore', 'safe-open', 'panel-weld', 'broadcast', 'locker-emergency', 'chip-extract', 'gear-locker',
    'spec-pickup', 'core-interfaces', 'manifest-clue', 'steam-dash', 'firstaid-open', 'robot-rescue', 'pods-check', 'sangni-ambush', 'laobu-point'];
  const badReg = NEW16.filter(id => !D.moments[id] || D.moments[id].file !== '../images/station/moments/' + id + '.jpg'
    || !fs.existsSync(path.join(dir, D.moments[id].file)));
  eq(badReg.join(','), 'firstaid-open,robot-rescue,pods-check,sangni-ambush',
    'B127＋B05 §7.12：到货 16 条中撤注册 4 条（firstaid-open／robot-rescue／pods-check——状态由背景变体承担；sangni-ambush——B05 由 CG 整屏图承担；均不入注册表）');
  eq(NEW16.filter(id => D.moments[id]).length, 12, 'B127＋B05 §7.7-9①：注册集＝到货集 − 撤注册（16−4＝12 条在册；file 规范、图片在库）');
  ok(['firstaid-open', 'robot-rescue', 'pods-check', 'sangni-ambush'].every(id => fs.existsSync(path.join(dir, '../images/station/moments/' + id + '.jpg'))),
    'B127＋B05 §7.12：撤注册 4 条资产留档在库（T68／T69／T70／T71——零重画、可按四要件重启）');
  /* ② 逐条：锚点／宽度／呈现＝§7.4.1 表内初值（横构图 5 张 card:true；竖构图 6 张柔边椭圆）；laobu-point 仅 file */
  const SPEC = {
    'power-restore': [[1370, 500], 0.30, true], 'safe-open': [[770, 400], 0.18, false], 'panel-weld': [[1505, 820], 0.30, true],
    'broadcast': [[450, 620], 0.28, true], 'locker-emergency': [[560, 640], 0.18, false], 'chip-extract': [[300, 720], 0.18, false],
    'gear-locker': [[1150, 640], 0.18, false], 'spec-pickup': [[560, 870], 0.18, false], 'core-interfaces': [[880, 800], 0.30, true],
    'manifest-clue': [[640, 600], 0.18, false], 'steam-dash': [[940, 620], 0.30, true] };   // B05：sangni-ambush 撤注册退出（T71 留档）
  const specBad = [];
  Object.keys(SPEC).forEach(id => {
    const m = D.moments[id], s = SPEC[id];
    if (!m || JSON.stringify(m.at) !== JSON.stringify(s[0]) || m.w !== s[1] || !!m.card !== s[2]) specBad.push(id);
  });
  eq(specBad.join(','), '', 'B127 §7.4.1：11 条锚点／宽度／呈现逐条＝登记表初值（横构图 5 张 card:true；竖构图 6 张柔边椭圆）');
  ok(D.moments['laobu-point'].at == null && D.moments['laobu-point'].w == null,
    'B126 §7.4.1-16：laobu-point＝覆盖卡（仅 file；无 at／w——几何唯一来源＝room-lab.figures.laobu）');
  /* ③ B127 注册裁定＋收窗行（原 @9／@4／@17 三处挂条件随本轮退出挂载） */
  const momN = (loc, extra) => { const s = C.newState('normal'); s.loc = loc; if (extra) Object.assign(s, extra); return C.momentsOf(s, D.nodes[loc]).join(','); };
  eq([momN('9'), momN('9', { chDone: { '开过保险柜': true } })].join('｜'), '｜',
    'B127 §7.12 行 30：safe-open 撤 @9、留 @45（未开柜不出图；开柜后也不在 9 号复现——状态由变体承担）');
  eq([momN('4'), momN('4', { chDone: { '急救箱开过': true } })].join('｜'), 'tietou-armwrestle｜tietou-armwrestle',
    'B127 §7.12 行 32：firstaid-open 撤注册（急救箱状态由变体 gym-firstaid-open 承担——@4 不再追加）');
  eq([momN('17'), momN('17', { learned: { '逃生舱检查过': true } })].join('｜'), '｜',
    'B127 §7.12 行 33：pods-check 撤注册（检查表状态由变体 escapepod-checked 承担——@17 零浮图）');
  /* B127 收窗行（N8／N11／N12×2／N19——N4／N5 见 §21-1） */
  eq([momN('8'), momN('8', { learned: { '已广播集合': true } })].join('｜'), 'broadcast,manifest-clue｜manifest-clue',
    'B127 §7.12 行 23：N8 广播后收窗（广播＝一次性动作——货单照旧）');
  eq([momN('11'), momN('11', { chDone: { '取了磁力靴': true } })].join('｜'), 'gear-locker｜',
    'B127 §7.12 行 28：N11 取柜后收窗（复访正文「安保柜空了」）');
  eq([momN('12', { learned: { '反应堆已重启': true } }), momN('12', { items: ['反应堆安全规程'] })].join('｜'), '｜core-interfaces',
    'B127 §7.12 行 26/27：N12 两行收窗——更晚状态在前（重启 ⇒ 空集；纸已拾 ⇒ 保留冷堆芯近景）');
  eq([momN('19'), momN('19', { learned: { '太阳能板已修好': true } })].join('｜'), 'panel-weld｜',
    'B131 §7.12 行 31：N19 补好后收窗（要能正常看整张舱外背景）');
  /* ④ 场景声明 2 处（否则 sceneOfNode＝null：枚举缺场景、读档不落位） */
  eq([C.sceneOfNode('39'), C.sceneOfNode('29')].join(','), 'exterior,room-reactor',
    'B126 §7.4.1：39→exterior（站外后继）／29→room-reactor（被制服）显式声明');
  /* ⑤ 同实体防双现注册点＋对象时刻＝节点默认集抽查（B127 重算） */
  eq(momN('16'), '', 'B126 §7.4.1-13：16 本体不注册（防双现——L2 渲染时变体已生效）');
  eq(momN('37'), 'helper-join', 'B127 §7.12 行 18：37 只留 helper-join（robot-rescue 撤注册——前史动作与 37 状态相斥）');
  eq([momN('36'), momN('2'), momN('8'), momN('12'), momN('13'), momN('11'), momN('19'), momN('25'), momN('29'), momN('30'), momN('39'), momN('45')].join('｜'),
    'power-restore｜locker-emergency｜broadcast,manifest-clue｜core-interfaces,spec-pickup｜steam-dash｜gear-locker｜panel-weld｜laobu-point｜｜chip-extract｜｜safe-open',
    'B127＋B05 §7.4.1：对象时刻＝节点默认集（12 节点抽查——N11 只余 gear-locker；N29 零浮图（B05 改由 CG 整屏图承担）；N39 零浮图（B131）；N8 双图错开锚点）');
  /* ⑥ N2 注册生效（B112 判据随浮现集）：locker-emergency 注册后 ⇒ 当前位置标记抑制 */
  const sN2 = C.newState('normal'); sN2.loc = '2'; sN2.scene = 'room-sleep';
  eq(C.currentMarkerHidden(sN2), true, 'B126：N2（locker-emergency 注册后）⇒ 浮现集非空 ⇒ 当前位置标记抑制');
  /* ⑦ T73 回填：medbay-awake 的 figures＝苏醒姿（N24 覆盖卡按变体判——无同角色双现） */
  const sN24 = C.newState('normal'); sN24.loc = '24'; sN24.visited['24'] = true;
  ok(!!C.sceneEntry(sN24, 'room-medbay').variant, 'B126/T73：pinsAll24 ⇒ 变体 medbay-awake 生效（苏醒姿 L1）');
  eq(JSON.stringify(C.figuresOf('room-medbay', sN24).yilanna), JSON.stringify([695, 190, 230, 245]),
    'B126/T73 §7.3 回填：变体 figures.yilanna＝苏醒姿轮廓框（T73 到货同批标定；整表替换）');
  const plan24 = C.momentLayout('yilanna-awake', 'room-medbay', 0, 1, sN24);
  eq([C.coverState('yilanna-awake', 'room-medbay', sN24), plan24 && plan24.cover].join(','), 'cover,true',
    'B126/T73：N24 覆盖卡按变体 figures 出卡（不回落卧姿框——同角色双现风险窗口压零）');
  eq(C.momentsOf(sN24, D.nodes['24']).join(','), 'yilanna-awake', 'B126/T73：N24 浮现集恰一张（伊莲娜一次——无同角色双现）');
  const box24 = C.figuresOf('room-medbay', sN24).yilanna;
  const ex24 = Math.max(12, box24[2] * 0.08), ey24 = Math.max(12, box24[3] * 0.08);
  ok(Math.abs(plan24.w - (box24[2] + 2 * ex24)) < 1e-9 && Math.abs(plan24.h - (box24[3] + 2 * ey24)) < 1e-9
    && Math.abs(plan24.x - (box24[0] - ex24 + (box24[2] + 2 * ex24) / 2)) < 1e-9,
    'B126/T73：卡面＝苏醒姿轮廓框外扩 max(12,8%×边)（卡 ' + [plan24.x, plan24.y, plan24.w, plan24.h].join(',') + '）');
  /* ⑧ N3 首访不受 T73 影响（variant 未命中 ⇒ 基础 figures；L2＝阿雅） */
  eq([C.momentsOf(C.newState('normal'), D.nodes['3']).join(','), C.coverState('aya-nurse', 'room-medbay', C.newState('normal'))].join('｜'),
    'aya-nurse｜cover', 'B126/T73：N3 首访（未苏醒）⇒ L2＝aya-nurse、覆盖卡按基础 figures（零回归）');
  P('B127＋B05：注册实盘 12/16（撤注册 4 在案）／锚点与呈现逐条／B127 收窗行（N8／N11／N12×2／N19——N4 见 §21）／场景声明 2 处／防双现注册点／默认集抽查／T73 回填（N24 无同框双现） 逐条通过');
}

/* ============ 21. B127~B131 复盘轮机检（§7.7-13／15 两组＋B131 抽查；§7.7-14 编号圈已在 §20-4） ============ */
console.log('');
console.log('———— B127 浮窗窗口与首访一次 ＋ B129 遮罩 ＋ B131 舱外两条（2026-10-04 晨复盘轮） ————');

/* --- 21-1 §7.7-13 浮窗窗口与首访一次（B127）＋ B131 抽查 --- */
{
  const mk = (loc, extra) => { const s = C.newState('normal'); s.loc = loc; s.scene = C.sceneOfNode(loc); if (extra) Object.assign(s, extra); return s; };
  const mom = (loc, extra) => C.momentsOf(mk(loc, extra), D.nodes[loc]).join(',');
  /* ① 有收窗行的节点——条件命中时该 id 不在浮现集（逐行对拍） */
  const CLOSE = [
    ['4', { learned: { '铁头已开门': true } }, 'tietou-armwrestle'],
    ['5', { chDone: { '跟胖胖打过招呼': true } }, 'yinhe-idle'],
    ['8', { learned: { '已广播集合': true } }, 'broadcast'],
    ['11', { chDone: { '取了磁力靴': true } }, 'gear-locker'],
    ['12', { learned: { '反应堆已重启': true } }, 'core-interfaces'],
    ['19', { learned: { '太阳能板已修好': true } }, 'panel-weld']
  ];
  eq(CLOSE.filter(([id, extra, mid]) => mom(id, extra).indexOf(mid) >= 0).map(x => 'N' + x[0] + '×' + x[2]).join(','), '',
    'B127 §7.7-13①：6 条收窗行逐条——条件命中 ⇒ 该 id 不在浮现集');
  eq([mom('4'), mom('8'), mom('11')].join('｜'), 'tietou-armwrestle｜broadcast,manifest-clue｜gear-locker',
    'B127 §7.7-13①：收窗条件未命中 ⇒ 默认集照常（回归：N4／N8／N11）');
  eq(mom('12', { items: ['反应堆安全规程'] }), 'core-interfaces',
    'B127 §7.7-13①：N12 纸已拾 ⇒ 保留冷堆芯近景（更晚状态在前、先匹配者为准）');
  /* ② 节点 1／2——首次渲染非空、第二次为空（同一存档）；读档后仍为空 */
  const s1 = mk('1'), s2 = mk('2');
  const first1 = C.momentsOf(s1, D.nodes['1']).join(','), first2 = C.momentsOf(s2, D.nodes['2']).join(',');
  C.markMomentSeen(s1, '1'); C.markMomentSeen(s2, '2');
  eq([first1, first2, C.momentsOf(s1, D.nodes['1']).length, C.momentsOf(s2, D.nodes['2']).length].join('｜'),
    'pangpang-hail｜locker-emergency｜0｜0',
    'B127 §7.7-13②：N1／N2 首访一次（首次渲染非空、二次为空——同一存档）');
  const saved = C.normalizeState(JSON.parse(JSON.stringify(s1)));
  eq([saved.mSeen['1'], C.momentsOf(saved, D.nodes['1']).length].join('｜'), 'true｜0',
    'B127 §7.7-13②：读档后仍为空（标记随存档）');
  const legacy = mk('1'); delete legacy.mSeen; C.normalizeState(legacy);
  eq([JSON.stringify(legacy.mSeen), C.momentsOf(legacy, D.nodes['1']).join(',')].join('｜'), '{}｜pangpang-hail',
    'B127 §7.7-13②：旧档（无 mSeen）归一为空表 ⇒ 首访画面照常显示');
  /* ③ 未声明 mOnce 的节点——求值路径不读 st.mSeen（回归：既有节点输出逐字不变） */
  const sMark = mk('3'); sMark.mSeen = { '3': true, '5': true, '14': true };
  eq([C.momentsOf(sMark, D.nodes['3']).join(','), C.momentsOf(sMark, D.nodes['5']).join(','), C.momentsOf(sMark, D.nodes['14']).join(',')].join('｜'),
    'aya-nurse｜yinhe-idle｜guardbot-block',
    'B127 §7.7-13③：未声明 mOnce 的节点不读 st.mSeen（标记表被填充 ⇒ 输出逐字不变）');
  ok(engSrc.indexOf('if (n.mOnce && st && st.mSeen && st.mSeen[st.loc]) return [];') >= 0,
    'B127 §7.7-13③：读 mSeen 的前置条件＝n.mOnce（短路——源码契约）');
  ok(engSrc.indexOf('if (ids.length && (D.nodes[st.loc] || {}).mOnce) {') >= 0 && engSrc.indexOf('if (fresh) save();') >= 0,
    'B127 §7.7-13②：标记在渲染后落库、随即落档（未命中任何一张不落标记；到达后立即关页亦不失标记——源码契约）');
  /* B131 抽查：N19 修后零浮现、N39 零浮现 */
  eq([mom('19'), mom('19', { learned: { '太阳能板已修好': true } }), mom('39'), String(D.nodes['39'].moments)].join('｜'),
    'panel-weld｜｜｜undefined', 'B131 §7.7-13 抽查：N19 修后零浮现；N39 无 moments（落点即修好态）');
  eq(D.nodes['39'].c.map(ch => ch.l).join(','), '爬回气闸舱。', 'B131 §9.1③：39 号仅留唯一出口（冗余选项①已删——再入 19 无意义）');
  P('浮窗窗口与首访：6 条收窗行／N1／N2 首访一次（读档仍空、旧档照常）／未声明 mOnce 回归／B131 两条 逐条通过');
}

/* --- 21-2 §7.7-15 遮罩楼层图专属（B129） --- */
{
  const ROOMS17 = Object.keys(D.scenes).filter(sid => /^room-/.test(sid));
  /* ① mask === false 场景集＝17 房＋站外（逐条枚举、无多余）；楼层图不写该字段 */
  eq(Object.keys(D.scenes).filter(sid => D.scenes[sid].mask === false).sort().join(','),
    ROOMS17.concat(['exterior']).sort().join(','), 'B129 §6.6-①：mask=false 集＝17 房＋站外（逐条枚举、无多余）');
  eq(['deck1', 'deck2', 'deck3'].map(sid => D.scenes[sid].mask === undefined).join(','), 'true,true,true',
    'B129 §6.6-①：楼层图不写 mask 字段（缺省 true＝现行遮罩）');
  /* ② 房间/站外遮罩层不渲染（DOM 冒烟由实现轮临时脚本覆盖；此处＝源码门控契约） */
  ok(engSrc.indexOf("$('dimSvg').classList.toggle('hidden', !entry.mask)") >= 0, 'B129 §6.6-②：mask=false ⇒ #dimSvg 整层不渲染（源码契约）');
  /* ③ 楼层图遮罩孔与改前一致（回归：孔＝当前位置＋可达；半径 98/74×k） */
  ok(engSrc.indexOf('add(x, y, 98 * k)') >= 0 && engSrc.indexOf('add(x, y, 74 * k)') >= 0,
    'B129 §6.6-③：楼层图孔半径 98／74×k 未动（回归——源码契约）');
  const s20 = C.newState('normal'); s20.loc = '20'; s20.scene = 'deck2';
  eq([C.sceneEntry(s20, 'deck2').mask, C.pinsVisible(s20, 'deck2').length].join(','), 'true,7',
    'B129 §6.6-③：楼层图遮罩参与＋渲染集＝全部 pins（孔＝当前位置＋可达——数据面回归）');
  /* ④ 示例关零变化 */
  const dScenes = Object.keys(LEVELS.dalim.scenes);
  eq(dScenes.every(sid => LEVELS.dalim.scenes[sid].mask === undefined).toString(), 'true',
    'B129 §6.6-④：示例关零变化（无 mask 字段——遮罩照旧；sceneDim 零残留见 §22）');
  const sD2 = C.newState('normal');
  C.selectLevel('dalim');
  const dalimMask = dScenes.map(sid => C.sceneEntry(sD2, sid).mask).join(',');
  C.selectLevel('station');                       // 口径面回切站关（后续检定仍按站关）
  eq(dalimMask, dScenes.map(() => 'true').join(','),
    'B129 §6.6-④：示例关全场景 mask=true（缺省口径——逐场景核）');
  P('遮罩：17 房＋站外 mask=false／楼层图字段缺省＋孔回归／示例关零变化 逐条通过');
}

/* --- 22-1 §6.7 机检①：登记集（cg 字段集／once／keep／file 与实盘对拍） --- */
{
  const cgNode = id => D.nodes[id].cg || null;
  const cgIds = Object.keys(D.nodes).filter(id => !!cgNode(id)).sort((a, b) => Number(a) - Number(b));
  eq(cgIds.join(','), '3,5,29,34,35,41,42,43', 'B132＋B135 §6.7-①：cg 字段集＝{3／5／29／34／35／41／42／43}（逐条枚举、零多余——B05 追加 29；44 未获批不并入）');
  eq(cgIds.filter(id => cgNode(id).once === true).map(Number).join(','), '3,5', 'B132 §6.7-①：once===true 集＝{3／5}（同一存档一次）');
  eq(cgIds.filter(id => (cgNode(id).dismiss || 'click') === 'keep').map(Number).join(','), '29,41,42,43',
    "B132＋B135 §6.7-①：dismiss==='keep' 集＝{29／41／42／43}（B05 追加 29；其余缺省 click）");
  const cgDir = path.join(dir, '../images/station/cg');
  const cgFiles = fs.readdirSync(cgDir).sort();
  eq(cgFiles.join(','), 'core-ignite.jpg,defeat-ambush.jpg,ending-a.jpg,ending-b.jpg,ending-c.jpg,jupiter-closeup.jpg,medbay-closeup.jpg,monitor-frame.jpg,prologue-scene.jpg',
    'B132＋B135 §6.7：images/station/cg/ 实盘 9 张（B05：defeat-ambush 入库；defeat-oxygen 未到货不在盘）');
  eq(cgIds.map(id => id + ':' + path.basename(cgNode(id).file)).join('｜'),
    '3:medbay-closeup.jpg｜5:jupiter-closeup.jpg｜29:defeat-ambush.jpg｜34:core-ignite.jpg｜35:monitor-frame.jpg｜41:ending-a.jpg｜42:ending-b.jpg｜43:ending-c.jpg',
    'B132＋B135 §6.7-①：展示点登记表 9 张＋1 条件件逐条（节点 ↔ 文件；44 未获批 ⇒ 无 cg）');
  eq(cgIds.filter(id => !(cgNode(id).file.indexOf('../images/station/cg/') === 0 && cgFiles.indexOf(path.basename(cgNode(id).file)) >= 0)).join(','), '',
    'B132 §6.7-①：每条 file 前缀＝cg 目录且文件在库（逐条）');
  /* B135（§6.7-①）：29 号浮图零残留＋T71 留档＋44 两态（未批＝无 cg） */
  eq([String(D.nodes['29'].moments), String(D.moments['sangni-ambush'])].join('｜'), 'undefined｜undefined',
    'B135 §6.7-①：29 号浮图零残留（节点 moments 撤＋注册表条目撤——同一时刻单一呈现）');
  ok(fs.existsSync(path.join(dir, '../images/station/moments/sangni-ambush.jpg')), 'B135 §7.12 行 34：T71 资产留档在库（撤注册不删文件）');
  eq(String(D.nodes['44'].cg), 'undefined', 'B135 §6.7-①：44 条件件未获批 ⇒ 无 cg（T81 未到货、不做缺图占位）');
  ok(cgFiles.indexOf('defeat-oxygen.jpg') < 0, 'B135 §6.7-①：defeat-oxygen.jpg 未到货（不在实盘——不注册不占位）');

  /* --- 22-2 §6.7 机检②：序章（走既有 meta.prologue.image 图位——零新机制） --- */
  eq(D.meta.prologue.image, '../images/station/cg/prologue-scene.jpg', 'B132 §6.7-②：序章图＝meta.prologue.image（CG-08／T35）');
  ok(fs.existsSync(path.join(dir, D.meta.prologue.image)), 'B132 §6.7-②：序章图文件在库（同一路径解析）');
  eq(C.prologue().image, '../images/station/cg/prologue-scene.jpg', 'B132 §6.7-②：Core.prologue() 读得到序章图（E2 数据面）');
  C.selectLevel('dalim');
  eq(String(C.prologue()), 'null', 'B132 §6.7-②：无 prologue 的关卡照旧（示例关＝null）');
  C.selectLevel('station');                       // 口径面回切站关（后续检定仍按站关）

  /* --- 22-3 §6.7 机检③：层序与呈现（结构／样式契约） --- */
  const htmlCg = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const sceneBlock = htmlCg.slice(htmlCg.indexOf('id="sceneWrap"'), htmlCg.indexOf('id="panel"'));
  ok(sceneBlock.indexOf('id="cgLayer"') >= 0, 'B132 §6.7-③：#cgLayer 在场景区（#sceneWrap）内');
  ok(htmlCg.indexOf('id="cgLayer"') > htmlCg.indexOf('id="calibBox"'),
    'B132 §6.7-③：层为场景区末位（舞台/物品栏行/提示条/校准框之后——不随舞台拖拽缩放）');
  ok(htmlCg.indexOf('id="cgImg"') > htmlCg.indexOf('id="cgLayer"') && htmlCg.indexOf('id="cgChip"') > htmlCg.indexOf('id="cgLayer"'),
    'B132 §6.7-③：层内＝图＋提示片（#cgImg／#cgChip）');
  ok(htmlCg.indexOf('点击继续') >= 0, 'B132 §6.7-③：可点掉档提示片文案＝「点击继续」');
  const cgRule = (uiCssSrc.match(/\.cgLayer \{([\s\S]*?)\}/) || [])[1] || '';
  const cgZ = Number((cgRule.match(/z-index:\s*(\d+)/) || [])[1]);
  ok(cgRule.indexOf('inset: 0') >= 0 && cgZ >= 9,
    'B132 §6.7-③：层覆盖全幅（inset:0）＋z-index ' + cgZ + ' ≥ 9（高于物品栏气泡 8／#sceneTag 6／校准层 5＝场景区最上）');
  const cgImgRule = (uiCssSrc.match(/\.cgImg \{([^}]*)\}/) || [])[1] || '';
  ok(cgImgRule.indexOf('object-fit: contain') >= 0, 'B132 §6.7-③：.cgImg＝object-fit:contain（整图可见、不裁边）');
  ok(uiCssSrc.indexOf('.cgChip') >= 0, 'B132 §6.7-③：.cgChip 样式在案');
  const baseCss = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
  ok(/\.prologueImg \{[^}]*object-fit: contain/.test(baseCss), 'B132 §6.7：.prologueImg 用 contain 显示整图（序章层族同口径）');

  /* --- 22-4 §6.7 机检④·⑤：行为契约与一次性/读档（Core 层单源） --- */
  const locState = id => { const s = C.newState('normal'); s.loc = id; s.scene = C.sceneOfNode(id); return s; };
  const s3 = locState('3');
  eq(JSON.stringify(C.cgOf(s3)), JSON.stringify({ file: '../images/station/cg/medbay-closeup.jpg', once: true, dismiss: 'click' }),
    'B132 §6.7-⑤：once 档首显 ⇒ 求值命中（file／once／dismiss 逐字）');
  C.markCgSeen(s3, '3');
  eq(String(C.cgOf(s3)), 'null', 'B132 §6.7-⑤：落标记 ⇒ 同存档不再显示');
  const s3reload = C.normalizeState(JSON.parse(JSON.stringify(s3)));
  eq(String(C.cgOf(s3reload)), 'null', 'B132 §6.7-⑤：标记随存档（读档回该节点 ⇒ 仍不显示）');
  const fresh3 = C.newState('normal'); fresh3.loc = '3';
  eq([Object.keys(fresh3.cgSeen).length, C.cgOf(fresh3) !== null].join('｜'), '0｜true',
    'B132 §6.7-⑤：新局／重开本关 ⇒ cgSeen 重置为空表、首访画面照常（重开边界）');
  const legacy5 = { diff: 'normal', coins: 20, oxygen: 100, items: [], visited: {}, done: {}, learned: {}, chDone: {}, hist: [], loc: '5' };
  const norm5 = C.normalizeState(legacy5);
  eq([JSON.stringify(norm5.cgSeen), C.cgOf(norm5) !== null].join('｜'), '{}｜true',
    'B132 §6.7-⑤：旧档（无 cgSeen）补空表 ⇒ once 档照常首显');
  const s34 = locState('34'); s34.cgSeen = { '34': true, '3': true };
  eq(C.cgOf(s34) !== null, true, 'B132 §6.7-⑤：非 once 档（34／35／41~43）⇒ 读档回节点即显示（标记不影响）');
  eq(['34', '35'].map(id => C.cgOf(locState(id)).dismiss).join(','), 'click,click',
    'B132 §6.7-⑤：34／35＝到达即显示、点击关闭（非 once＝每次到达）');
  eq(['29', '41', '42', '43'].map(id => C.cgOf(locState(id)).dismiss).join(','), 'keep,keep,keep,keep',
    'B132＋B135 §6.7-⑤：29／41／42／43＝整屏图常驻（点击不关——B05：失败结算与三结局同档）');
  eq(JSON.stringify(C.cgOf(locState('29'))), JSON.stringify({ file: '../images/station/cg/defeat-ambush.jpg', once: false, dismiss: 'keep' }),
    'B135 §6.7-①：29 号整屏图注册逐字（file／dismiss——T80；非 once＝重开后再到即再显示）');
  eq(['1', '18', '22', '44'].map(id => String(C.cgOf(locState(id)))).join('｜'), 'null｜null｜null｜null',
    'B132 §6.7-⑦：无 cg 的节点 ⇒ 层不渲染（回归——场景区逐字零变化）');
  ok(engSrc.indexOf('function applyCg()') >= 0 && engSrc.indexOf('if (nodeId !== cgNodeId)') >= 0,
    'B132 §6.7-④：进节点求值一回＋换节点先关再求值（源码契约）');
  ok(engSrc.indexOf('if (layer.dataset.node === nodeId) return;') >= 0, 'B132 §6.7-④：跨渲染驻留——同节点重渲染不重弹（源码契约）');
  ok(/applyCg\(\);\s*\/\/ B132/.test(engSrc), 'B132 §6.7-④：renderAll 调 applyCg（每帧求值入口——源码契约）');
  ok(/if \(layer\.dataset\.dismiss === 'keep'\) return;/.test(engSrc), 'B132 §6.7-④：keep 档点击不关（源码契约）');
  ok(engSrc.indexOf("['pointerdown', 'wheel'].forEach") >= 0 && engSrc.indexOf('e.stopPropagation()') >= 0,
    'B132 §6.7-④：点击/拖拽/滚轮不穿透（层上拦 pointerdown／wheel——源码契约）');
  ok(/markCgSeen\(st, nodeId\)[\s\S]{0,160}save\(\)/.test(engSrc), 'B132 §6.7-⑤：once 落标记＋补写存档（源码契约）');
  ok(engSrc.indexOf("console.warn('CG 缺图（整层隐藏）：'") >= 0,
    'B132 §6.7-⑥：缺图 ⇒ 整层隐藏＋一行告警（不留框——源码契约）');
  ok(engSrc.indexOf("console.warn('序章图缺图（已隐藏）：'") >= 0,
    'B132 §6.7-⑥：序章图同口径——缺图 ⇒ 不显示图（退回无图态）＋一行告警（源码契约）');
  ok(engSrc.indexOf('function replayMomentFade()') >= 0 && /if \(replay\) replayMomentFade\(\);/.test(engSrc) && /closeCg\(true\)/.test(engSrc),
    'B132 §7.3：CG 关闭后再淡入浮现图——点掉档关闭时重放浮现入场（换节点关闭不重放——源码契约）');

  /* --- 22-5 §6.7 机检⑧（B130 关）：零残留（数据／引擎／样式三面） --- */
  const codeStrip = s => s.replace(/\/\*[\s\S]*?\*\//g, '');   // 去块注释：只查「代码面零残留」（注释里对旧面的历史记述不算残留）
  const engCode2 = codeStrip(engSrc), uiCode2 = codeStrip(uiCssSrc);
  ok(engCode2.indexOf('sceneDim') < 0 && engCode2.indexOf('DIM_TOKENS') < 0 && engCode2.indexOf('.dark') < 0 && engCode2.indexOf("'dark'") < 0,
    'B130：引擎代码面零残留（无 sceneDim／DIM_TOKENS／.dark／dark 类切换）');
  ok(uiCode2.indexOf('--dim-') < 0 && uiCode2.indexOf('stage.dark') < 0, 'B130：样式代码面零残留（无 --dim-* token 与 #stage.dark 选择器／过渡）');
  const allLv = Object.keys(LEVELS);
  eq(allLv.map(id => !(LEVELS[id].meta && LEVELS[id].meta.sceneDim)).join(','), allLv.map(() => 'true').join(','),
    'B130：全关数据无 sceneDim（示例关与站关同口径）');
  eq(allLv.map(id => Object.keys(LEVELS[id].scenes).filter(sid => LEVELS[id].scenes[sid].dim !== undefined).length).join(','),
    allLv.map(() => '0').join(','), 'B130：全关场景无 dim 字段（17 房 dim 已清）');
  eq(Object.keys(D.scenes).filter(sid => /^room-/.test(sid) && D.scenes[sid].mask === false).length, 17,
    'B130：撤调暗不动遮罩口径（17 房 mask=false 仍在）');
  P('§6.7 CG 整屏层：登记 9 张＋1 条件件／序章图／层序与 contain／一次性与读档（once＝3·5、keep＝29／41~43）／缺图兜底 逐条通过');
  P('B130 撤调暗：数据／样式／引擎三面零残留（示例关与站关同口径） 逐条通过');
}

/* ============ 23. B136 多档位存档 / 读档（§1.2 机检①~⑦ · B05 轮） ============ */
console.log('');
console.log('———— B136 多档位存档 / 读档（§1.2 机检①~⑦） ————');

/* --- 23-1 §1.2 机检①：键（三键互异）＋存／删后自动存档与记录逐字不变（互不干扰） --- */
{
  eq(C.slotsKey('station'), 'mygame2.slots.station.v1', 'B136 §1.2-①：档位键＝mygame2.slots.<关>.v1');
  eq(C.slotsKey('dalim'), 'mygame2.slots.dalim.v1', 'B136 §1.2-①：档位键按关卡独立（示例关同键系）');
  eq([C.slotsKey('station'), C.saveKey('station'), C.recKey('station')].join(','),
    'mygame2.slots.station.v1,mygame2.save.station.v1,mygame2.rec.station.v1', 'B136 §1.2-①：三键（存档／档位／记录）互异');
  eq(new Set([C.slotsKey('station'), C.saveKey('station'), C.recKey('station')]).size, 3, 'B136 §1.2-①：三键零重复');
  const s0 = C.newState('normal', '小豆'); s0.loc = '5'; s0.coins = 12; s0.oxygen = 82;
  const st1 = fakeStore();
  C.saveTo(st1, 'station', s0);
  C.addRecord(st1, 'station', '结局 · 圆满');
  const rawSave = st1.getItem('mygame2.save.station.v1'), rawRec = st1.getItem('mygame2.rec.station.v1');
  C.slotPut(st1, 2, s0, 'station');
  eq([st1.getItem('mygame2.save.station.v1') === rawSave, st1.getItem('mygame2.rec.station.v1') === rawRec].join(','), 'true,true',
    'B136 §1.2-①：存入后自动存档与记录逐字不变（互不干扰）');
  C.slotDel(st1, 2, 'station');
  eq([st1.getItem('mygame2.save.station.v1') === rawSave, st1.getItem('mygame2.rec.station.v1') === rawRec].join(','), 'true,true',
    'B136 §1.2-①：删除后自动存档与记录逐字不变');
  eq(C.recordOf(st1, 'station').join('、'), '结局 · 圆满', 'B136 §1.2-①：记录始终不变（存／删不写记录）');
  P('§1.2-① 键：三键互异／存删后自动存档与记录逐字不变 逐条通过');
}

/* --- 23-2 §1.2 机检②：档位表结构（空表／存入第 n 档／覆盖／删除） --- */
{
  const sA = C.newState('normal', '甲'); sA.loc = '7'; sA.oxygen = 66;
  const st2 = fakeStore();
  eq(JSON.stringify(C.slotList(st2, 'station')), '[null,null,null]', 'B136 §1.2-②：空表 ⇒ 3 项全 null');
  ok(C.slotPut(st2, 2, sA, 'station'), 'B136 §1.2-②：存入第 2 档 ⇒ true');
  const l2 = C.slotList(st2, 'station');
  eq([l2[0] === null, l2[1] === null, l2[2] === null].join(','), 'true,false,true', 'B136 §1.2-②：仅第 2 档有值（其余不变）');
  ok(!isNaN(Date.parse(l2[1].savedAt)), 'B136 §1.2-②：savedAt 合法（ISO 时间串）');
  eq(JSON.stringify(l2[1].st), JSON.stringify(sA), 'B136 §1.2-②：st 与当时状态一致');
  eq(JSON.parse(st2.getItem(C.slotsKey('station'))).v, 1, 'B136 §1.2-①：值结构 { v:1, slots:[…] }');
  const sB = C.newState('hard', '乙'); sB.loc = '9'; sB.oxygen = 30;
  C.slotPut(st2, 2, sB, 'station');
  eq([C.slotList(st2, 'station')[1].st.diff, String(C.slotList(st2, 'station')[0])].join(','), 'hard,null',
    'B136 §1.2-②：覆盖 ⇒ 第 2 档替换、其余不变');
  ok(C.slotDel(st2, 2, 'station'), 'B136 §1.2-②：删除 ⇒ true');
  eq(JSON.stringify(C.slotList(st2, 'station')), '[null,null,null]', 'B136 §1.2-②：删除 ⇒ 回 null');
  ok(!C.slotPut(st2, 4, sA, 'station') && !C.slotDel(st2, 0, 'station'), 'B136 §1.2-②：越界档号（4／0）⇒ false（3 档封顶）');
  P('§1.2-② 结构：空表／存入第 n 档／覆盖／删除／越界 逐条通过');
}

/* --- 23-3 §1.2 机检③：读档一致（档位读出 → normalizeState 与存入时逐项一致）＋读后自动存档＝该档 st --- */
{
  const sC = C.newState('hard', '小汤'); sC.loc = '35'; sC.coins = 9; sC.oxygen = 41; sC.items = ['监控回放'];
  sC.mSeen = { '1': true }; sC.cgSeen = { '3': true }; sC.visited = { '35': true }; sC.chDone = { '跟胖胖打过招呼': true };
  sC.learned = { '保险柜密码': true };
  const st3 = fakeStore();
  C.slotPut(st3, 1, sC, 'station');
  const readSt = C.normalizeState(C.slotList(st3, 'station')[0].st);
  eq([readSt.loc, readSt.coins, readSt.oxygen, readSt.items.join('+'), readSt.diff, readSt.me, readSt.scene,
      readSt.mSeen['1'], readSt.cgSeen['3'], readSt.chDone['跟胖胖打过招呼'], readSt.learned['保险柜密码']].join('｜'),
    '35｜9｜41｜监控回放｜hard｜小汤｜room-server｜true｜true｜true｜true',
    'B136 §1.2-③：档位读出 → normalizeState 与存入时逐项一致（loc／资源／道具／难度／玩家名／mSeen／cgSeen／chDone／learned／场景归一）');
  eq(JSON.stringify(readSt), JSON.stringify(C.normalizeState(JSON.parse(JSON.stringify(sC)))),
    'B136 §1.2-③：读档结果与既有归一路径逐字一致（同一条 normalizeState）');
  /* 读档＝既有读档路径（resumeGame 内：normalizeState → save() 补写自动存档）——读后自动存档＝该档 st */
  const auto = readSt;                       // resumeGame 赋给 st 的同一对象
  C.saveTo(st3, 'station', auto);            // ＝ resumeGame 内 save()（同一次调用）
  const back = C.loadFrom(st3, 'station');
  eq([back.loc, back.oxygen, back.diff, back.me].join('｜'), '35｜41｜hard｜小汤',
    'B136 §1.2-①：读后自动存档＝该档 st（行为③／机检⑦同口径）');
  eq(C.cardInfo(st3, 'station').save.loc, '35', 'B136 §1.2：读档后「继续」＝该档（自动存档即该档）');
  P('§1.2-③ 读档一致：逐项一致／同归一谓词／读后自动存档＝该档 st 逐条通过');
}

/* --- 23-4 §1.2 机检④：旧档与回归（既有存档键照旧可读；B117 三态不受档位影响；无档 ⇒ 不渲染行） --- */
{
  eq(C.loadFrom(fakeStore({ 'mygame2.save.dalim.v1': JSON.stringify({ diff: 'normal', loc: '11', coins: 3, items: [] }) }), 'dalim').loc, '11',
    'B136 §1.2-④：既有 mygame2.save.<关>.v1 照旧可读（档位为增量键——不影响既有读写路径）');
  const save2 = C.newState('normal', '小豆'); save2.loc = '5'; save2.coins = 7;
  const withSlots = fakeStore({ [C.slotsKey('station')]: JSON.stringify({ v: 1, slots: [{ savedAt: '2026-10-06T01:00:00.000Z', st: save2 }, null, null] }) });
  C.saveTo(withSlots, 'station', save2);
  eq(C.cardInfo(withSlots, 'station').buttons.map(b => b.label).join(','), '继续,重新开始',
    'B136 §1.2-④：B117 三态回归——档位键存在与否不影响卡片三态');
  eq(C.cardInfo(fakeStore(), 'station').slotLine, '', 'B136 §1.2-④：无档位 ⇒ 卡片不渲染「存档位」行（slotLine 空）');
  eq(C.cardInfo(withSlots, 'station').slotLine, '💾 手动存档：1/3（最新 ' + C.slotTime('2026-10-06T01:00:00.000Z') + '）',
    'B136 §1.2-④：有档位 ⇒ 「💾 手动存档：<n>/3（最新 <时间>）」');
  /* 示例关同口径（随关卡 resources 自适应——写法相同；不锁币种字面） */
  const dSt = C.newState('normal'); dSt.loc = '1'; dSt.coins = 4;
  const dStore = fakeStore(); C.slotPut(dStore, 1, dSt, 'dalim');
  ok(new RegExp('^1 · \\d{2}-\\d{2} \\d{2}:\\d{2} ｜ 1 · .+ ｜ .+ ｜ 中等模式$').test(C.slotInfo(1, C.slotList(dStore, 'dalim')[0], LEVELS.dalim)),
    'B136 §1.2＋B147：档位摘要行随关卡自适应（示例关同格式；档位词＝中等模式——旧「普通模式」作废）');
  P('§1.2-④ 旧档与回归：既有键照旧／三态回归／无档不渲染行／示例关自适应 逐条通过');
}

/* --- 23-5 §1.2 机检⑤：确认句（三句逐字·单一来源；两处读取入口同串） --- */
{
  const ask = C.slotAsk();
  eq([ask.read, ask.over, ask.del].join('｜'),
    '读取这个存档位会覆盖当前进度（通关记录保留）。确定读取？｜这个存档位里已有存档，覆盖它吗？｜删除这个存档位吗？（删除后无法恢复）',
    'B136 §1.2-⑤：三句采用句逐字（Core.slotAsk()）');
  eq([ask.read, ask.over, ask.del].map(t => engSrc.split(t).length - 1).join(','), '1,1,1',
    'B136 §1.2-⑤：三句在源码中恰一份（单一来源——不得各写一份）');
  eq(engSrc.split('Core.slotAsk().read').length - 1, 1,
    'B136 §1.2-⑤：两处读取入口同源一份（弹窗行渲染单一处；游戏内弹窗与卡片入口共用）');
  ok(engSrc.indexOf("$('saveBtn').onclick") >= 0 && engSrc.indexOf("openSaveModal(id, 'card')") >= 0,
    'B136 §1.2：两处入口在案（工具栏 💾／卡片「读取存档位」——同一弹窗）');
  P('§1.2-⑤ 确认句：三句逐字／源码恰一份／两处入口同源 逐条通过');
}

/* --- 23-6 §1.2 机检⑥：兜底三态（探测禁用／写入失败采用句／坏档视空档） --- */
{
  eq([C.slotsAvailable(fakeStore()), C.slotsAvailable(null)].join(','), 'true,false', 'B136 §1.2-⑥：探测——正常 true；无存储 false');
  const bad = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  eq(C.slotsAvailable(bad), false, 'B136 §1.2-⑥：桩 store 抛错 ⇒ 探测 false（警示行＋按钮禁用）');
  let threw = false, putOk = null, delOk = null;
  try { putOk = C.slotPut(bad, 1, C.newState('normal'), 'station'); delOk = C.slotDel(bad, 1, 'station'); } catch (e) { threw = true; }
  eq([threw, putOk, delOk].join(','), 'false,false,false', 'B136 §1.2-⑥：写入失败 ⇒ 返回 false 且不抛（行内提示＋toast＝采用句）');
  ok(engSrc.indexOf('⚠️ 没能写入这个存档位（这台设备的存储空间不足或被禁用）；本次游玩不受影响。') >= 0,
    'B136 §1.2-⑥：写入失败采用句在案（行内＋toast 同句）');
  ok(engSrc.indexOf('这台设备无法保存进度（浏览器存储被禁用）；本次游玩不受影响。') >= 0,
    'B136 §1.2-⑥：存储不可用警示行在案');
  eq([engSrc.split('⚠️ 没能写入这个存档位').length - 1, engSrc.split('这台设备无法保存进度').length - 1].join(','), '1,1',
    'B136 §1.2-⑥：两句各恰一份（单一来源）');
  ok(engSrc.indexOf('b.disabled = !slotStoreOk') >= 0 && engSrc.indexOf("warn.classList.toggle('hidden', slotStoreOk)") >= 0,
    'B136 §1.2-⑥：不可用 ⇒ 按钮禁用＋警示行在（源码契约；行为面＝临时 DOM 冒烟）');
  const broken = fakeStore({ [C.slotsKey('station')]: '{ 这不是 JSON' });
  eq(JSON.stringify(C.slotList(broken, 'station')), '[null,null,null]', 'B136 §1.2-⑥：坏 JSON ⇒ 视空档（不抛异常）');
  eq(broken.getItem(C.slotsKey('station')), '{ 这不是 JSON', 'B136 §1.2-⑥：坏档原数据不删');
  const partial = fakeStore({ [C.slotsKey('station')]: JSON.stringify({ v: 1, slots: [{ savedAt: '2026-01-01T00:00:00Z' }, null, { st: { loc: '5' } }] }) });
  eq(JSON.stringify(C.slotList(partial, 'station')), '[null,null,null]', 'B136 §1.2-⑥：字段缺（savedAt／st）⇒ 该档按空档呈现');
  P('§1.2-⑥ 兜底：探测 false／写入失败 false 不抛／两采用句／坏档视空档 逐条通过');
}

/* --- 23-7 §1.2 机检⑦：源码契约（💾／#saveModal）＋摘要行格式（DOM 行为由临时冒烟演示后删除） --- */
{
  const htmlS = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  ok(/id="saveBtn"[^>]*>💾/.test(htmlS), 'B136 §1.2-⑦：工具栏含 💾（源码契约）');
  ok(htmlS.indexOf('id="bagBtn"') < htmlS.indexOf('id="saveBtn"') && htmlS.indexOf('id="saveBtn"') < htmlS.indexOf('id="helpBtn"'),
    'B136 §1.2：工具栏次序 🧭 🗂 👥 🎒 💾 ❓ ↺');
  ok(htmlS.indexOf('id="saveModal" class="modal hidden"') >= 0 && htmlS.indexOf('id="saveRows"') >= 0 && htmlS.indexOf('id="saveWarn"') >= 0,
    'B136 §1.2-⑦：#saveModal 在（既有 .modal 体系；含档位行容器＋警示行）');
  ['slotsKey', 'slotList', 'slotPut', 'slotDel', 'slotInfo', 'slotTime', 'slotsAvailable', 'slotAsk'].forEach(fn =>
    ok(typeof C[fn] === 'function', 'B136 §1.2：Core.' + fn + ' 在案'));
  ok(engSrc.indexOf('function openSaveModal(') >= 0 && engSrc.indexOf('function slotRowEl(') >= 0 && engSrc.indexOf('function renderSlotRows(') >= 0,
    'B136 §1.2-⑦：弹窗渲染在案（openSaveModal／slotRowEl／renderSlotRows——两态行与按钮）');
  ok(engSrc.indexOf('function refreshCardSlots(') >= 0 && engSrc.indexOf('function cardSlotsRow(') >= 0,
    'B136 §1.2：卡片行渲染与就地刷新在案（levelCard 内登记 cardSlotRows）');
  const sLine = C.newState('hard', '小汤'); sLine.loc = '35'; sLine.coins = 9; sLine.oxygen = 41;
  const line = C.slotInfo(2, { savedAt: '2026-10-06T01:02:00.000Z', st: sLine }, D);
  ok(new RegExp('^2 · \\d{2}-\\d{2} \\d{2}:\\d{2} ｜ 35 · 监控回放 ｜ 🪙 星币 9 · 💨 氧气 41 ｜ 困难模式$').test(line),
    'B136 §1.2：档位摘要行格式＝<序号> · <MM-DD HH:mm> ｜ <节点号> · <节点名> ｜ <资源行> ｜ <难度>（实测 ' + line + '）');
  const pad = x => (x < 10 ? '0' : '') + x;
  const dT = new Date('2026-10-06T01:02:00.000Z');
  eq(C.slotTime('2026-10-06T01:02:00.000Z'), pad(dT.getMonth() + 1) + '-' + pad(dT.getDate()) + ' ' + pad(dT.getHours()) + ':' + pad(dT.getMinutes()),
    'B136 §1.2：时间格式 MM-DD HH:mm（本机时区；无效串原样返回）');
  eq(C.slotTime(''), '', 'B136 §1.2：空 savedAt ⇒ 空串（不抛）');
  P('§1.2-⑦ 源码契约：💾／#saveModal／Core 助手／摘要行格式 逐条通过');
}


/* ============ 24. B06 迷路治理轮：指路面板／地图点名字／已探索分楼层（§2-B137 机检①~⑪／B138 ①~③／B139 ①~③） ============ */
console.log('');
console.log('———— B06 指路面板（B137 ①~⑪）／地图点名字（B138 ①~③）／已探索分楼层（B139 ①~③） ————');

/* --- 24-1 §2-B137 机检①：阶梯表（非空/有序/末行兜底/每行 text ≤40 汉字/条件语言） --- */
{
  const T = D.meta.targets;
  ok(Array.isArray(T) && T.length === 6, 'B137 §2-B137-①：目标阶梯表非空（station 6 行 R1~R6）');
  eq(T.map(r => r.cond === undefined ? 'fallback' : 'cond').join(','), 'cond,cond,cond,cond,cond,fallback',
    'B137 §2-B137-①：有序且末行 cond 缺省（兜底行置末——任意状态必有目标、不空）');
  const HAN = s => (String(s).match(/\p{Script=Han}/gu) || []).length;
  eq(T.map(r => (typeof r.text === 'string' && r.text.trim() !== '' && HAN(r.text) <= 40)).join(','),
    'true,true,true,true,true,true',
    'B137 §2-B137-①：每行 text 非空且 ≤40 字（字数口径＝仅计汉字 \\p{Script=Han}——标点/破折号不计；实测 ' + T.map(r => HAN(r.text)).join('/') + '）');
  /* B146：`meta.targets` 的 `need` 已退役（③块数据＝`meta.tasks`）——旧 need 循环随之删除（失效即删），
   * 任务／need 的条件语言覆盖＝§27-6（机检①）。此处置为实断言：行内不得再带 `need` 键。 */
  eq(T.every(r => !('need' in r)), true, 'B146：`meta.targets` 行无 `need` 键（need 退役——任务面见 §27）');
  P('§2-B137-① 阶梯表：6 行有序／末行兜底／每行 text 非空且 ≤40 汉字／行内无 need 键（B146 退役） 逐条通过');
}

/* --- 24-2 §2-B137 机检②：六态探针逐态＝期望行（文案逐字＝设计档 §2-B137 表） --- */
{
  const S = extra => { const s = C.newState('normal'); if (extra) Object.assign(s, extra); return s; };
  const goal = extra => C.guideTarget(S(extra));
  const R = [
    '反应堆亮了——去应急逃生舱口，把最后的事收个尾。',
    '电回来了——去反应堆舱，把它点亮。',
    '电有来源了——回站里，去底层把主供电推上去。',
    '电还差一截——外部阵列那一路断了，去把它接上。',
    '重启反应堆要三样东西，还得先把电力找回来。',
    '先摸清站里的状况——找找能用的东西，听听大家都是怎么说的；把反应堆点亮，才是正事。'
  ];
  eq([goal(), goal({ visited: { '6': true } }), goal({ visited: { '15': true } }), goal({ visited: { '19': true } }),
      goal({ learned: { '太阳能板已修好': true } }), goal({ learned: { '全站复电': true } }), goal({ learned: { '反应堆已重启': true } })].join('｜'),
    [R[5], R[4], R[3], R[3], R[2], R[1], R[0]].join('｜'),
    'B137 §2-B137-②：六态探针逐态＝期望行（开局 R6／到过指挥舱 R5／到过控制室 R4／到过站外 R4／修板后 R3／复电后 R2／重启后 R1——文案逐字）');
  eq([goal({ visited: { '19': true }, learned: { '太阳能板已修好': true } }),
      goal({ visited: { '23': true } }),
      goal({ visited: { '6': true }, learned: { '全站复电': true } }),
      goal({ visited: { '6': true, '15': true, '19': true }, learned: { '太阳能板已修好': true, '全站复电': true, '反应堆已重启': true } })].join('｜'),
    [R[2], R[4], R[1], R[0]].join('｜'),
    'B137 §2-B137-②：组合态＝先匹配者为准（更晚状态在前——修板+到过19 ⇒ R3；到过 23 ⇒ R5；复电+到过6 ⇒ R2；重启 ⇒ R1）');
  ok([S(), S({ visited: { '22': true } }), S({ items: ['控制芯片'] })].every(s => typeof C.guideTarget(s) === 'string' && C.guideTarget(s)),
    'B137 §2-B137-②：末行兜底 ⇒ 任意状态必有目标（不空）');
  P('§2-B137-② 六态探针：逐态命中行（文案逐字）／组合态先匹配者为准／兜底不空 逐条通过');
}

/* --- 24-3 §2-B137 机检③：文本约束三条（无数字／无道具名／无发现面名词）逐行扫（仅 text 字段） --- */
{
  const texts = D.meta.targets.map(r => r.text);
  eq(texts.filter(t => /\d/.test(t)).length, 0, 'B137 §2-B137-③：逐行无数字（\\d 不出现——仅扫各行 text 字段）');
  eq(texts.filter(t => D.itemOrder.some(it => t.indexOf(it) >= 0)).join(','), '',
    'B137 §2-B137-③：逐行不含道具名（D.itemOrder 逐项扫——need 的 label 含道具名、不在扫描面）');
  const NOUNS = ['维修爬道', '舱外', '蒸汽'].concat(L5_NOUNS.map(n => n.w));
  eq(texts.filter(t => NOUNS.some(w => t.indexOf(w) >= 0)).join(','), '',
    'B137 §2-B137-③：逐行不含发现面名词（词表＝§8.1 约束行＋L5_NOUNS 的 w 列——共 ' + NOUNS.length + ' 项）');
  P('§2-B137-③ 文本约束：无数字／无道具名／无发现面名词（仅扫 text 字段） 逐条通过');
}

/* --- 24-4 §2-B137 机检④：need 门（show 不成立 ⇒ 不出／成立 ⇒ 出）＋勾选态随 done（持物/复电各一例） --- */
{
  const S = extra => { const s = C.newState('normal'); if (extra) Object.assign(s, extra); return s; };
  const tasks = s => C.guideTasks(s).map(t => t.name + '(' + t.needs.map(n => n.label + '=' + n.done).join(';') + ')').join('｜');
  eq(C.guideTasks(S()).length, 0, 'B146 机检②：新局 ⇒ 任务表零条（③块「只显示已知」）');
  eq(C.guideTasks(S({ visited: { '6': true } })).map(t => t.id).join(','), 't-reactor,t-power',
    'B146 机检②：到过指挥舱 ⇒ t-reactor＋t-power 两条出（t-yinhe 仍需 chDone 门）');
  eq(tasks(S({ visited: { '6': true }, items: ['控制芯片'] })).indexOf('控制芯片=true') >= 0, true,
    'B146 机检④：勾选态随 done（持物例：控制芯片到手 ⇒ ☑）');
  eq(C.guideTasks(S({ learned: { '反应堆已重启': true }, visited: { '6': true } })).map(t => t.id + ':' + t.done).join(','), 't-power:false,t-reactor:true',
    'B10／§2-B152：done 成立 ⇒ 保留可见＋沉底（不再整条滤掉——t-power 在前、t-reactor 沉底）');
  const powerNeed = D.meta.tasks.find(t => t.id === 't-power').need.find(n => n.label.indexOf('回控制室') >= 0);
  eq([C.condOk(S({ learned: { '太阳能板已修好': true } }), powerNeed.done),
      C.condOk(S({ learned: { '太阳能板已修好': true, '全站复电': true } }), powerNeed.done)].join(','), 'false,true',
    'B146 机检⑥：「回控制室，把主供电推上去」done＝knows 全站复电——条件随状态翻转（数据面直证）');
  P('B146 ②④⑥ 任务表：空态／逐任务门／☑ 随 done／done 任务保留＋沉底（B152）／链式条件 逐条通过');
}

/* --- 24-5 §2-B137 机检⑤：空态（清空 learned ⇒ ②空态句；命中无 need 的行 ⇒ ③空态句） --- */
{
  const s0 = C.newState('normal');
  eq(C.guideClues(s0).length, 0, 'B137 §2-B137-⑤：清空 learned ⇒ guideClues＝[]（面板②走空态句）');
  eq(C.guideClues({ learned: { '甲': true, '乙': true, '丙': true } }).join(','), '甲,乙,丙',
    'B137 §2-B137-⑤：线索＝st.learned 键序（获得先后——与 CLI「线索：」同源同字面）');
  eq(C.guideTasks(s0).length, 0, 'B146 机检⑤：真无可见任务（新局）⇒ guideTasks＝[]（面板③走新空态句）');
  ['（还没记住什么——多问问、多看看。）', '（眼下没有要凑的东西。）', '（这一关没有设目标清单——随便逛逛吧。）'].forEach(t =>
    ok(engSrc.indexOf(t) >= 0, 'B137 §2-B137-⑤：空态/降级句在案（' + t + '）'));
  ok(engSrc.indexOf('（这一步没有要凑的东西。）') < 0, 'B146 机检⑤：旧空态句零残留（替换为「（眼下没有要凑的东西。）」）');
  P('§2-B137-⑤ 空态：清空 learned ⇒ ②空态／真无任务 ⇒ ③空态（新句）／三句在案 逐条通过');
}

/* --- 24-6 §2-B137 机检⑥：dalim 降级（无 targets ⇒ guideTarget null、其余块照常、无异常） --- */
{
  C.selectLevel('dalim');
  const dSt = C.newState('normal'); dSt.learned['甲'] = true;
  eq([String(C.guideTarget(dSt)), String(C.guideTasks(dSt).length), C.guideClues(dSt).join(',')].join('｜'), 'null｜0｜甲',
    'B137 §2-B137-⑥：dalim（无 targets）⇒ guideTarget＝null、guideTasks＝[]、guideClues 照常（无异常）');
  eq(String(LEVELS.dalim.meta.targets), 'undefined', 'B137 §2-B137-⑥：示例关数据零改动（无 meta.targets 字段）');
  C.selectLevel('station');                       // 口径面回切站关（后续检定仍按站关）
  P('§2-B137-⑥ 降级：guideTarget null／其余块照常；dalim 数据零改动 逐条通过');
}

/* --- 24-7 §2-B137 机检⑦：源码契约（Core.guide* 单源／deadEnd 自动弹出沿用／死局上下文行两态） --- */
{
  ok(engSrc.indexOf('Core.guideTarget(st)') >= 0 && engSrc.indexOf('Core.guideClues(st)') >= 0 && engSrc.indexOf('Core.guideTasks(st)') >= 0,
    'B137 §2-B137-⑦：面板渲染走 Core.guide* 单源（目标／线索／任务清单——B146 口径）');
  ok(engSrc.indexOf("if (Core.deadEnd(st)) showStuck('dead');") >= 0,
    'B137 §2-B137-⑦：deadEnd 自动弹出沿用（renderAll 调用点在案——自动弹出＝带死局上下文行）');
  ok(engSrc.indexOf("$('stuckText').classList.toggle('hidden', !dead)") >= 0,
    'B137 §2-B137-⑦：死局上下文行两态（仅自动弹出显示——手动点开＝隐藏）');
  ok(engSrc.indexOf('这里已经没有你能做的事了——别急：看看下面，换个地方想想办法。') >= 0,
    'B137 §2-B137-⑦：面板首行新句在案（更名清单 #5——原「这里已经没有你能做的事了。……」）');
  eq(engSrc.split('function showStuck(').length - 1, 1,
    'B137 §2-B137-⑦：面板打开函数恰一份（现名 showStuck，不改——单一来源；两处入口同走该函数）');
  eq(engSrc.split("$('stuckModal').classList.remove('hidden')").length - 1, 1,
    'B137 §2-B137-⑦：无第二份面板实现（#stuckModal 打开点恰一处）');
  P('§2-B137-⑦ 源码契约：guide* 单源／自动弹出沿用／上下文行两态／面板函数恰一份 逐条通过');
}

/* --- 24-8 §2-B137 机检⑧：回归（无 targets 时其余块输出照常；guide* 纯读不改状态） --- */
{
  C.selectLevel('dalim');
  const dSt = C.newState('normal'); dSt.loc = '11';
  eq([String(C.guideTarget(dSt)), C.guideTasks(dSt).length].join('｜'), 'null｜0',
    'B137 §2-B137-⑧：无 targets ⇒ ①/③ 走降级与空态（输出照常、无异常）');
  C.selectLevel('station');
  const probe = C.newState('normal'); probe.loc = '1';
  const snap = JSON.stringify([probe.learned, probe.visited, probe.items, probe.loc, probe.chDone]);
  C.guideTarget(probe); C.guideTasks(probe); C.guideClues(probe);
  eq(JSON.stringify([probe.learned, probe.visited, probe.items, probe.loc, probe.chDone]), snap,
    'B137 §2-B137-⑧：guide* 纯读（求值前后状态逐字不变）');
  P('§2-B137-⑧ 回归：无 targets 输出照常／guide* 纯读 逐条通过');
}

/* --- 24-9 §2-B137 机检⑨：第二入口·DOM 契约与单一来源 --- */
{
  const htmlB = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const sceneBlock = htmlB.slice(htmlB.indexOf('id="sceneWrap"'), htmlB.indexOf('id="panel"'));
  ok(sceneBlock.indexOf('id="guideFab"') >= 0, 'B137 §2-B137-⑨：#guideFab 在 #sceneWrap 内（场景区）');
  ok(htmlB.indexOf('id="guideFab"') > htmlB.indexOf('id="stage"'), 'B137 §2-B137-⑨：在 #stage 之后（#stage 之外——不随身拖拽/缩放）');
  ok(/<button id="guideFab"[^>]*>🧭 指路<\/button>/.test(htmlB), 'B137 §2-B137-⑨：按钮文字＝「🧭 指路」（图标＋可见文字）');
  eq(htmlB.split('指路：现在该做什么 / 线索与记录 / 还差什么（出口在 💾）').length - 1, 2,
    'B137 §2-B137-⑨：title 与工具栏同句（两处入口各一份；B08 定稿＝②块口径／出口迁移——§2-B142）');
  ok(engSrc.indexOf("$('guideFab').onclick = () => { if (st) showStuck(); };") >= 0
    && engSrc.indexOf("$('stuckBtn').onclick = () => { if (st) showStuck(); };") >= 0,
    'B137 §2-B137-⑨：两处入口同走同一入口函数（showStuck——同一面板、单一来源；if (st) 守卫）');
  P('§2-B137-⑨ 第二入口·DOM 契约：在场景区内／在 #stage 后／文字与 title／同一入口函数 逐条通过');
}

/* --- 24-10 §2-B137 机检⑩：第二入口·层序与不挡（样式契约；行为面＝临时 DOM 冒烟，用后删） --- */
{
  const fabRule = (uiCssSrc.match(/#guideFab \{([\s\S]*?)\}/) || [])[1] || '';
  ok(fabRule.indexOf('position: absolute') >= 0 && /right:\s*12px/.test(fabRule) && /bottom:\s*52px/.test(fabRule),
    'B137 §2-B137-⑩：#guideFab 定位＝场景区右下角（right:12px; bottom:52px——抬到物品栏行上方）');
  ok(fabRule.indexOf('inset') < 0 && fabRule.indexOf('width: 100%') < 0 && fabRule.indexOf('width:100%') < 0,
    'B137 §2-B137-⑩：小尺寸、非全幅（无 inset／width:100%——指针事件只覆盖自身盒子）');
  const fabZ = Number((fabRule.match(/z-index:\s*(\d+)/) || [])[1] || 0);
  ok(fabZ < 9, 'B137 §2-B137-⑩：z 序低于 .cgLayer(9) 与 .modal(50)（规则无 z-index 或 < 9——CG/弹窗显示时被盖住、不可点）');
  ok(uiCssSrc.indexOf('#guideFab') >= 0, 'B137 §2-B137-⑩：#guideFab 样式在案（新面外置 style-ui.css——style.css 不动）');
  P('§2-B137-⑩ 层序与不挡：右下定位／非全幅／z 序低于 CG 与弹窗（样式契约＋实现轮临时 DOM 冒烟） 逐条通过');
}

/* --- 24-11 §2-B137 机检⑪：第二入口·两关一致（引擎通用） --- */
{
  const htmlB = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  eq(htmlB.split('id="guideFab"').length - 1, 1, 'B137 §2-B137-⑪：按钮 DOM 恰一份（静态常驻——不按关卡增删；两关同款）');
  ok(engSrc.indexOf("$('guideFab').onclick = () => { if (st) showStuck(); };") >= 0,
    'B137 §2-B137-⑪：!st 守卫在案（关卡选择页被 #overlay 覆盖、不可点——与 #stuckBtn 同款守卫）');
  P('§2-B137-⑪ 两关一致：DOM 常驻恰一份／引擎通用／!st 守卫 逐条通过');
}

/* --- 24-12 §2-B138 机检①：判定（未到过 null／到过名／当前点名／plainPins 一律 null） --- */
{
  const s = C.newState('normal'); s.loc = '5'; s.visited['5'] = true; s.visited['18'] = true;
  eq([C.pinLabel(s, '5', 'deck1'), C.pinLabel(s, '18', 'deck1')].join('｜'), '观景厅｜中央大厅（顶层）',
    'B138 §2-B138-①：到过 ⇒ 名（抽查 5 观景厅／18 中央大厅（顶层）——与地点头/已探索 title 同源）');
  eq(String(C.pinLabel(s, '1', 'deck1')), 'null', 'B138 §2-B138-①：未到过 ⇒ null（不渲染——只显示已知）');
  eq(String(C.pinLabel(s, '5', 'room-observation')), 'null', 'B138 §2-B138-①：房间（room-*）⇒ 一律 null（内景交互点多含事件名）');
  eq(String(C.pinLabel(s, '19', 'exterior')), 'null', 'B138 §2-B138-①：站外（exterior）⇒ 一律 null');
  const cur = C.newState('normal'); cur.loc = '18'; cur.visited['18'] = true;
  eq(C.pinLabel(cur, cur.loc, 'deck1'), '中央大厅（顶层）', 'B138 §2-B138-①：当前点有名（进入即落 st.visited——当前点必然已到过）');
  P('§2-B138-① 判定：未到过 null／到过名（5/18）／当前点名／房间与站外一律 null 逐条通过');
}

/* --- 24-13 §2-B138 机检②：源码契约（renderPins 按 Core.pinLabel 写 .pname；.pname 不接收指针事件） --- */
{
  ok(/const pname = Core\.pinLabel\(st, id, sid\);/.test(engSrc), 'B138 §2-B138-②：renderPins 走 Core.pinLabel 单源');
  ok(/\(pname \? '<span class="pname">' \+ esc\(pname\) \+ '<\/span>' : ''\)/.test(engSrc),
    'B138 §2-B138-②：`.pname` 在 renderPins 落位（有名字才追加）');
  const pnRule = (uiCssSrc.match(/\.pin \.pname \{([\s\S]*?)\}/) || [])[1] || '';
  ok(pnRule.indexOf('pointer-events: none') >= 0, 'B138 §2-B138-②：`.pname` 不接收指针事件（不挡点击）');
  ok(pnRule.indexOf('white-space: nowrap') >= 0 && pnRule.indexOf('text-overflow: ellipsis') >= 0,
    'B138 §2-B138-②：`.pname` 单行＋超长省略（nowrap／ellipsis）');
  P('§2-B138-② 源码契约：pinLabel 单源／.pname 落位／不接收指针事件／单行省略 逐条通过');
}

/* --- 24-14 §2-B138 机检③：回归（未到过的 pin 结构＝ring＋num 逐字不变——标签为纯追加） --- */
{
  ok(/b\.innerHTML = '<span class="ring"><\/span><span class="num">' \+ id \+ '<\/span>'/.test(engSrc),
    'B138 §2-B138-③：pin 基础结构＝ring＋num 逐字不变（.pname 为条件追加——未到过 ⇒ 不出现）');
  const s = C.newState('normal');
  eq(['1', '2', '3'].map(id => String(C.pinLabel(s, id, 'deck1'))).join(','), 'null,null,null',
    'B138 §2-B138-③：未到过点一律 null（渲染面不追加 .pname——结构回归）');
  P('§2-B138-③ 回归：ring＋num 逐字不变（标签纯追加） 逐条通过');
}

/* --- 24-15 §2-B139 机检①：分组（混合探针：顶层/底层/站外各 2 点＋落空场景 1 点 ⇒ 「其它」置末） --- */
{
  const s = C.newState('normal');
  ['1', '5', '12', '13', '19', '39'].forEach(id => { s.visited[id] = true; });
  D.nodes['99'] = { n: '合成探针点' };             // 合成：无 scene、无 pin ⇒ sceneOfNode＝null ⇒ 「其它」（用后即删）
  s.visited['99'] = true;
  eq(String(C.sceneOfNode('99')), 'null', 'B139 §2-B139-①：落空场景探针＝sceneOfNode null（⇒ 「其它」）');
  const g = C.visitedGroups(s);
  eq(g.map(x => x.label + ':' + x.ids.join('/')).join('｜'), '顶层:1/5｜底层:12/13｜站外:19/39｜其它:99',
    'B139 §2-B139-①：组序＝场景表键序（顶层→中层→底层→站外——空组不出）＋「其它」置末；组内编号升序');
  delete D.nodes['99'];
  ok(!Object.prototype.hasOwnProperty.call(D.nodes, '99'), 'B139 §2-B139-①：合成探针节点已清理（数据复原）');
  P('§2-B139-① 分组：场景表键序＋「其它」置末＋组内升序（混合探针） 逐条通过');
}

/* --- 24-16 §2-B139 机检②：空态两态（无组；有组且某组为空 ⇒ 该组不出） --- */
{
  eq(JSON.stringify(C.visitedGroups(C.newState('normal'))), '[]',
    'B139 §2-B139-②：无组（visited 空）⇒ []（调用方走既有空态句）');
  const s = C.newState('normal'); s.visited['1'] = true;
  eq(C.visitedGroups(s).map(x => x.label + ':' + x.ids.join('/')).join('｜'), '顶层:1',
    'B139 §2-B139-②：有组且其余组为空 ⇒ 该组不出（仅顶层一组）');
  P('§2-B139-② 空态：无组 ⇒ []／空组不出 逐条通过');
}

/* --- 24-17 §2-B139 机检③：回归（全空＝既有空态句；节点过滤集与改前一致；示例关＝一楼/负一层） --- */
{
  ok(engSrc.indexOf('（还没去过任何地方）') >= 0, 'B139 §2-B139-③：全空 ⇒ 既有空态句在案（renderVisited 沿用）');
  const s = C.newState('normal');
  ['1', '29', '41', '44'].forEach(id => { s.visited[id] = true; });
  eq(C.visitedGroups(s).map(x => x.label + ':' + x.ids.join('/')).join('｜'), '顶层:1',
    'B139 §2-B139-③：节点过滤集与改前一致（29／44＝fail、41＝win ⇒ 排除；仅 1 入组）');
  C.selectLevel('dalim');
  const d = C.newState('normal'); d.visited['1'] = true; d.visited['4'] = true;
  eq(C.visitedGroups(d).map(x => x.label + ':' + x.ids.join('/')).join('｜'), '一楼:1｜负一层:4',
    'B139 §2-B139-③：示例关分组＝一楼/负一层（组序＝场景表键序——随关卡自适应）');
  C.selectLevel('station');                       // 口径面回切站关
  P('§2-B139-③ 回归：全空句／过滤集一致（fail/win 排除）／示例关分组 逐条通过');
}

/* --- 24-18 §8.1 帮助同步（更名清单 #7：第 11 条新稿＋第 9 条 👉；条数仍 12） --- */
{
  eq(D.help.length, 12, 'B137 §8.1：帮助条数仍 12（第 11 条改写不抢 B05 第 12 条）');
  eq(D.help[10], '🧭 迷路了？工具栏和场景区右下角的「指路」按钮，随时能点：当前目标、线索与记录、还差什么，一眼看全；有更新的时候，按钮上会亮个小点，线索和记录点开能看详情。想回到安全点或者重开本关，都在 💾 里。',
    'B08 §8.1 第 11 条再改写逐字（🧭 指路——两处入口＋三块名目＋小圆点＋点开详情＋💾 出口；B142／B143 同轮）');
  eq(['下面还有「回到安全点」和「重开本关」', '记下的线索'].map(t => D.help[10].indexOf(t) < 0).join(','), 'true,true',
    'B08 §8.1：旧句式零残留（删「下面还有『回到安全点』和『重开本关』」句——B142）');
  eq(D.help[8], '👉 选项：能做的事才会出现；拿不准的，尽管试——不行的时候，剧情会告诉你为什么。',
    'B137 §8.1 第 9 条逐字（图标 👉——与指路图标消重；更名清单 #7 同批）');
  P('§8.1 帮助同步：条数 12／第 11 条新稿逐字／第 9 条 👉 逐条通过');
}

/* ============ 25. B07 道具介绍（§2-B140 机检①~④／§2-B141 机检①③ · 2026-10-06） ============ */
console.log('');
console.log('———— B07 道具介绍：覆盖／句式／导出对拍／旧档／源码契约／回归 ————');

/* --- 25-1 §2-B140 机检①：覆盖（station 23/23＋dalim 22/22——两关各断言；计数自证） --- */
{
  /* 长度口径＝Array.from(desc).length（码点、含标点）——B140 机检①原文；与 B137 机检①「仅计汉字」不同源（B07 评审轮次 2 #5） */
  const bad = []; let maxLen = 0;
  const check = (L, n, tag) => {
    eq(L.itemOrder.length, n, 'B140 §2-B140-①：' + tag + ' itemOrder 逐件 ' + n + ' 件（计数自证）');
    L.itemOrder.forEach(it => {
      const d = (L.items[it] || {}).desc;
      if (typeof d !== 'string' || d.trim() === '') { bad.push(tag + ':' + it + '(缺/非串)'); return; }
      if (d.indexOf('\n') >= 0) bad.push(tag + ':' + it + '(多行)');
      maxLen = Math.max(maxLen, Array.from(d).length);
      if (Array.from(d).length > 40) bad.push(tag + ':' + it + '(超长 ' + Array.from(d).length + ')');
    });
  };
  check(D, 23, 'station'); check(LEVELS.dalim, 22, 'dalim');
  eq(bad.join(','), '', 'B140 §2-B140-①：两关全量逐件 desc 类型/非空/单行/≤40 码点（实测最长 ' + maxLen + '）');
  P('§2-B140-① 覆盖：station 23/23＋dalim 22/22 逐件 desc 齐（非空/单行/≤40 码点，最长 ' + maxLen + '） 逐条通过');
}

/* --- 25-2 §2-B140 机检②：句式（两关无属性/规则词；station 另断发现面名词三词） --- */
{
  const bad = [];
  const scan = (L, tag) => L.itemOrder.forEach(it => {
    const d = (L.items[it] || {}).desc || '';
    if (/武力|不可卖|红框/.test(d)) bad.push(tag + ':' + it + '(属性/规则词)');
    if (tag === 'station' && /维修爬道|舱外|蒸汽/.test(d)) bad.push('station:' + it + '(发现面名词)');
  });
  scan(D, 'station');
  scan(LEVELS.dalim, 'dalim');
  eq(bad.join(','), '', 'B140 §2-B140-②：desc 不含「武力/不可卖/红框」（两关）且 station 不含发现面名词（维修爬道/舱外/蒸汽）');
  P('§2-B140-② 句式：两关无属性/规则词＋station 无发现面名词 逐条通过');
}

/* --- 25-3 §2-B140 机检③：导出对拍（buildCopy ⇄ 数据面：desc 全文进 §四＋说明列「介绍在前」） --- */
{
  const mod = await import(pathToFileURL(path.join(dir, '..', 'tools', 'export-copy.mjs')).href);
  const md = mod.buildCopy(D, 'station');
  const rowOf = id => md.split('\n').find(l => l.indexOf('| ' + id + ' |') === 0) || '';
  eq(D.itemOrder.filter(it => rowOf(it).indexOf(D.items[it].desc) < 0).join(','), '', 'B140 §2-B140-③：§四 23 件逐件含 desc 全文（对拍 buildCopy）');
  const r1 = rowOf('焊接枪');   // 介绍＋武力＋红框三者并存 ⇒ 列序可判
  ok(r1.indexOf(D.items['焊接枪'].desc) >= 0 && r1.indexOf(D.items['焊接枪'].desc) < r1.indexOf('武力 +1') && r1.indexOf('武力 +1') < r1.indexOf('红框·不可卖'), 'B140 §2-B140-③：说明列列序＝介绍在前、属性/规则标记在后（探针 焊接枪：desc < 武力 < 红框）');
  ok(rowOf('桑尼的账本').indexOf(D.items['桑尼的账本'].desc) < rowOf('桑尼的账本').indexOf('**可读**'), 'B140 §2-B140-③：desc 与「可读」标记并存时介绍在前（探针 桑尼的账本）');
  P('§2-B140-③ 导出对拍：23 件 desc 全文进 §四／列序（介绍在前） 逐条通过');
}

/* --- 25-4 §2-B140 机检④：旧档（desc 为关卡数据、不进存档；旧档零迁移） --- */
{
  const s = C.newState('normal');
  ok(!('desc' in s) && JSON.stringify(s).indexOf('"desc"') < 0, 'B140 §2-B140-④：newState 键集不含 desc（desc 为关卡数据、不进存档）');
  const norm = C.normalizeState({ diff: 'normal', coins: 15, oxygen: 90, items: ['手电', '桑尼的账本'], visited: {}, done: {}, learned: {}, chDone: {}, hist: [], loc: '1' });
  eq(norm.items.join(','), '手电,桑尼的账本', 'B140 §2-B140-④：旧档（无 desc 概念）读入零迁移——道具照旧');
  eq([C.itemDesc('手电') === D.items['手电'].desc, C.itemDesc('桑尼的账本') === D.items['桑尼的账本'].desc].join(','), 'true,true', 'B140 §2-B140-④：desc 纯读自关卡数据（与 st／存档无关）');
  P('§2-B140-④ 旧档：键集不含 desc／读入零迁移／desc 纯读 逐条通过');
}

/* --- 25-5 §2-B141 机检①：源码契约（.biDesc 无条件渲染／.readable 判据／.ibDesc／desc 段先于 text 段） --- */
{
  const orBody = engSrc.slice(engSrc.indexOf('function openRead('), engSrc.indexOf('function renderBag('));
  ok(/const canOpen = owned && \(desc \|\| text\);/.test(engSrc), 'B141 §2-B141-①：可点判据＝owned && (desc || text)（.readable 同判据）');
  ok(/\(desc \? '<div class="biDesc">' \+ esc\(desc\) \+ '<\/div>' : ''\)/.test(engSrc), 'B141 §2-B141-①：背包格 .biDesc 无条件渲染（不按 owned——全部道具含未获得）');
  ok(/r\.className = 'ibDesc';/.test(engSrc) && /r\.textContent = desc;/.test(engSrc), 'B141 §2-B141-①：物品栏气泡 .ibDesc 在案（标题下、正文按钮前）');
  ok(orBody.indexOf("'<p class=\"rdDesc\">'") >= 0 && orBody.indexOf("'<p class=\"rdDesc\">'") < orBody.indexOf("nm(text).split('\\n')"), 'B141 §2-B141-①：openRead 介绍段（.rdDesc）先于正文段（text）');
  ok(/const desc = Core\.itemDesc\(it\), text = Core\.itemText\(it\);/.test(engSrc) && /const desc = Core\.itemDesc\(id\);/.test(engSrc), 'B141 §2-B141-①：渲染走 Core.itemDesc 单源（renderBag／invBubble／openRead）');
  ok(engSrc.indexOf('if (!desc && !text)') >= 0 && engSrc.indexOf('这件东西没什么可读的。') >= 0, 'B141 §2-B141-①：兜底句保留（desc 与 text 皆无分支）');
  P('§2-B141-① 源码契约：.biDesc 无条件／.readable 判据／.ibDesc／desc 先于 text／单源／兜底 逐条通过');
}

/* --- 25-6 §2-B141 机检③：回归（属性/规则行与「可读」逐字／未获得格结构／看内容·使用／帮助 12 条） --- */
{
  ok(/\(meta\.atk \? '<div class="biAtk">武力 \+' \+ meta\.atk \+ '<\/div>' : ''\)/.test(engSrc)
    && /\(meta\.nosell \? '<div class="biTag">不可卖<\/div>' : ''\)/.test(engSrc) && /\(owned && text \? '<div class="biRead">📖 可读<\/div>' : ''\)/.test(engSrc),
    'B141 §2-B141-③：属性行/规则行/「📖 可读」逐字不变（「可读」仍＝有 text）');
  ok(/d\.disabled = !owned;/.test(engSrc) && engSrc.indexOf(": '还没有获得';") >= 0, 'B141 §2-B141-③：未获得格结构照旧（不可点＋title 还没有获得）');
  ok(engSrc.indexOf("b.textContent = '📖 看内容';") >= 0 && engSrc.indexOf("b.textContent = '使用';") >= 0, 'B141 §2-B141-③：物品栏「看内容」（有正文）/「使用」判据照旧');
  ok(/<span class="sName">' \+ it \+ '<\/span>/.test(engSrc), 'B141 §2-B141-③：商店/回收行逐字不变（源码契约）');
  eq(D.help.length, 12, 'B141 §2-B141-③：帮助条数仍 12（本批零改动）');
  ok(D.help[4].indexOf('点一下看说明') >= 0, 'B141 §2-B141-③：帮助第 5 条「点一下看说明」与呈现一致（§8.2 H2）');
  P('§2-B141-③ 回归：属性/规则行·可读逐字／未获得格／看内容·使用／商店回收行／帮助 12 条 逐条通过');

/* ============ 26. B08 指路·线索与任务记录轮：面板Ⅱ＋记录面（§2-B142 机检①~⑤／§2-B143 机检①~⑦ · 2026-10-06） ============ */
console.log('');
console.log('———— B08 指路：面板Ⅱ（B142 ①~⑤）／线索与任务记录（B143 ①~⑦） ————');

/* --- 26-1 §2-B142 机检①：面板底部仅「确认」（#stuckModal 内无 .diffRow；旧文案零残留；Esc/点空白照旧） --- */
{
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const stuckBlock = html.slice(html.indexOf('id="stuckModal"'), html.indexOf('id="bagModal"'));
  ok(stuckBlock.indexOf('diffRow') < 0, 'B142 §2-B142-①：#stuckModal 内无 .diffRow（两出口已整体迁出）');
  ok(/<button class="closeBtn" data-close="stuckModal">确认<\/button>/.test(stuckBlock),
    'B142 §2-B142-①：底部＝「确认」（data-close="stuckModal"——原「再想想（关闭）」）');
  ok(html.indexOf('再想想') < 0, 'B142 §2-B142-①：旧文案「再想想」零残留（全文）');
  ok(engSrc.indexOf("if (e.target === m && m.id !== 'overlay')") >= 0 && /e\.key === 'Escape'/.test(engSrc),
    'B142 §2-B142-①：Esc／点空白关闭照旧（既有 .modal 机制——零改动）');
  P('§2-B142-① 面板底部：仅「确认」／无 .diffRow／旧文案零残留／既有关闭机制 逐条通过');
}

/* --- 26-2 §2-B142 机检②：出口双按钮在 #saveModal（DOM 契约）＋分模式显隐＋安全点行 --- */
{
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const saveBlock = html.slice(html.indexOf('id="saveModal"'), html.indexOf('id="readModal"'));
  ['id="stuckSafe"', 'id="stuckSafeName"', 'id="stuckRestart"', 'id="saveExit"', 'class="opsTitle"'].forEach(k =>
    ok(saveBlock.indexOf(k) >= 0, 'B142 §2-B142-②：出口区块在 #saveModal 内（' + k + '——元素搬家、id 不改）'));
  ok(saveBlock.indexOf('>🚪 出口</div>') >= 0 && saveBlock.indexOf('🏠 回到安全点') >= 0 && saveBlock.indexOf('↺ 重开本关') >= 0,
    'B142 §2-B142-②：区块标题行＝「🚪 出口」＋双按钮文案照旧');
  ok(engSrc.indexOf("const showExit = slotModalMode === 'play' && !!st;") >= 0
    && engSrc.indexOf("$('saveExit').classList.toggle('hidden', !showExit);") >= 0,
    'B142 §2-B142-②：分模式显隐（play 且 st 在场 ⇒ 渲染；card ⇒ 隐藏——源码契约；行为面＝临时 DOM 冒烟）');
  ok(engSrc.indexOf("$('stuckSafeName').textContent = safeId ? (safeId + ' · '") >= 0 && engSrc.indexOf('（本关没有配置安全点）') >= 0,
    'B142 §2-B142-②：安全点行文本＝`编号 · 名`（缺省「（本关没有配置安全点）」——openSaveModal 内）');
  P('§2-B142-② 出口迁移：双按钮在 #saveModal／标题「🚪 出口」／分模式显隐／安全点行 逐条通过');
}

/* --- 26-3 §2-B142 机检③：重开确认＝D65 句单一来源（直调点恰 3 处；绑定点无事件对象直传） --- */
{
  const direct = engSrc.split('Core.coverAsk()').length - 1;
  eq(direct, 3, 'B142 §2-B142-③：Core.coverAsk() 直调点恰 3 处（cardInfo／restart 内／💾 出口区块——B144 不再增口；实测 ' + direct + '）');
  eq(engSrc.split(C.coverAsk()).length - 1, 1, 'B142 §2-B142-③：采用句字面恰一份（单一来源——不得各写一份）');
  ok(/function restart\(noAsk\)/.test(engSrc) && /if \(!noAsk && !confirm\(Core\.coverAsk\(\)\)\) return;/.test(engSrc),
    'B142 §2-B142-③：restart 增可选参 noAsk（缺省仍走 D65 确认；noAsk 才免二次询问）');
  ok(!/\.onclick\s*=\s*restart\b/.test(engSrc), 'B142 §2-B142-③：绑定点无事件对象直传（不以 restart 直挂 onclick——正则断言）');
  const wrapped = (engSrc.match(/\(\) => restart\(\)/g) || []).length;
  ok(wrapped >= 2, 'B142 §2-B142-③：既有两绑定点（工具栏 ↺／结算屏「重新开始本关」）改箭头包装（实测 ' + wrapped + ' 处）');
  const sr = engSrc.slice(engSrc.indexOf("$('stuckRestart').onclick"));
  ok(sr.indexOf('if (!confirm(Core.coverAsk())) return;') >= 0 && sr.indexOf("$('saveModal').classList.add('hidden');") >= 0
    && sr.indexOf('restart(true)') >= 0,
    'B142 §2-B142-③：💾 区块直调采用句——取消 ⇒ return（关弹窗前退出、不重开）；确认 ⇒ 关弹窗＋restart(true)');
  P('§2-B142-③ 重开确认：直调恰 3 处／同句一份／restart(noAsk)／无事件直传／取消不重开 逐条通过');
}

/* --- 26-4 §2-B142 机检④：样式清理（style.css 无 `#stuckModal .diffRow`；.diffRow 在案） --- */
{
  const cssSrc = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
  ok(cssSrc.indexOf('#stuckModal .diffRow') < 0, 'B142 §2-B142-④：死选择器 `#stuckModal .diffRow` 已删（零残留）');
  ok(cssSrc.indexOf('.diffRow {') >= 0 && cssSrc.indexOf('.diffRow small {') >= 0,
    'B142 §2-B142-④：.diffRow 保留（服务 #saveModal 新位——含 small 行）');
  ok(uiCssSrc.indexOf('.opsTitle') >= 0, 'B142 §2-B142-④：出口区块标题样式 .opsTitle 在案（style-ui.css 新面外置）');
  P('§2-B142-④ 样式清理：死选择器已删／.diffRow 保留／.opsTitle 在案 逐条通过');
}

/* --- 26-5 §2-B142 机检⑤：帮助第 11 条＝§8.1 新稿（逐字断言＝§24-18 同句；bible §7.46 镜像对拍＝一次性，见批次档） --- */
{
  eq(D.help.length, 12, 'B142 §2-B142-⑤：帮助条数仍 12（改写不抢第 12 条）');
  eq(['线索与记录', '都在 💾 里', '亮个小点'].map(t => D.help[10].indexOf(t) >= 0).join(','), 'true,true,true',
    'B142 §2-B142-⑤：新稿三要件在（②块名目／小圆点／💾 出口）');
  eq(['已知线索', '下面还有'].map(t => D.help[10].indexOf(t) < 0).join(','), 'true,true',
    'B142 §2-B142-⑤：旧稿零残留（「已知线索」「下面还有」句）');
  P('§2-B142-⑤ 帮助第 11 条：逐字（§24-18）／三要件／旧稿零残留 逐条通过');
}

/* --- 26-6 §2-B143 机检①：结构与覆盖（id 唯一；clue ⇄ learn 双向 16/16；cond/done 逐条 condOk；记录按 src 升序） --- */
{
  const notes = D.meta.notes;
  ok(Array.isArray(notes), 'B143 §2-B143-①：meta.notes 在案（数组——数据面唯一新增第 13 项）');
  eq(notes.length, 35, 'B143 §2-B143-①：条数＝35（线索 16＋记录 19——计数自证）');
  const ids = notes.map(n => n.id);
  eq(new Set(ids).size, ids.length, 'B143 §2-B143-①：id 唯一（' + ids.length + ' 条）');
  const clues = notes.filter(n => n.kind === 'clue');
  const recs = notes.filter(n => n.kind === 'record');
  eq([clues.length, recs.length].join('/'), '16/19', 'B143 §2-B143-①：两 kind 计数＝16/19');
  const learned = {};   // 全关 learn 值全集（同 providedFlags：en.learn／fx.learn／battle.win.learn）
  const addLearn = v => { [].concat(v || []).forEach(k => { if (k) learned[k] = true; }); };
  Object.keys(D.nodes).forEach(id => {
    const n = D.nodes[id];
    if (n.en) addLearn(n.en.learn);
    (n.c || []).forEach(ch => {
      if (ch.fx) addLearn(ch.fx.learn);
      if (ch.battle && ch.battle.win) addLearn(ch.battle.win.learn);
    });
  });
  const learnKeys = Object.keys(learned), clueKeys = clues.map(n => n.key);
  eq([learnKeys.filter(k => clueKeys.indexOf(k) < 0).join(','), clueKeys.filter(k => !learned[k]).join(',')].join('｜'), '｜',
    'B143 §2-B143-①：clue ⇄ learn 值双向 16/16（无缺、无死条目）');
  eq([learnKeys.length, clueKeys.length].join('/'), '16/16', 'B143 §2-B143-①：双向覆盖计数自证（' + learnKeys.join('、') + '）');
  const badCond = [];
  recs.forEach(n => {
    try { C.condOk(C.newState('normal'), n.cond); if (n.done) C.condOk(C.newState('normal'), n.done); }
    catch (e) { badCond.push(n.id); }
  });
  eq(badCond.join(','), '', 'B143 §2-B143-①：cond／done 全走既有条件语言（逐条 condOk 不抛）');
  eq(recs.map(n => Number(n.src)).every((v, i, a) => i === 0 || a[i - 1] <= v), true,
    'B143 §2-B143-①：记录按 src 节点号升序（渲染序＝数组序；' + recs.map(n => n.src).join(',') + '）');
  ok(clues.every(n => typeof n.key === 'string' && typeof n.text === 'string' && typeof n.src === 'string')
    && recs.every(n => typeof n.title === 'string' && typeof n.text === 'string' && n.cond && typeof n.cond === 'object'),
    'B143 §2-B143-①：字段形状（clue＝id/key/text/src；record＝id/cond/title/text/src〔done/doneSrc 可选〕）');
  P('§2-B143-① 结构与覆盖：35 条（16/19）／id 唯一／双向 16/16／condOk 不抛／src 升序 逐条通过');
}

/* --- 26-7 §2-B143 机检②：只显示已知（cond 不成立不出／成立出——抽 3 条：3／5／28） --- */
{
  const S = extra => { const s = C.newState('normal'); if (extra) Object.assign(s, extra); return s; };
  const ids = s => C.guideNotes(s).records.map(r => r.id).join(',');
  eq(ids(S()), '', 'B143 §2-B143-②：新局（无 visited）⇒ 记录组零条（未探索＝零记录）');
  eq(ids(S({ visited: { '3': true } })), 'rec-03', 'B143 §2-B143-②：探针①（到过 3 ⇒ 仅 rec-03；其余 cond 未命中）');
  eq(ids(S({ visited: { '1': true, '5': true, '13': true } })), 'rec-01,rec-06,rec-13',
    'B143 §2-B143-②：探针②（到过 1/5/13 ⇒ 三条齐；旧档无 recOrder ⇒ 未入列者按数组序垫底＝节点号序——B153 口径）');
  { const r153 = S({ visited: { '1': true, '5': true, '13': true } });
    C.trackRecords(r153); C.trackRecords(r153);                       // B153：入列＋幂等
    eq([r153.recOrder.join(','), ids(r153)].join('｜'), 'rec-01,rec-06,rec-13｜rec-13,rec-06,rec-01',
      'B10／§2-B153：入列后记录组＝recOrder 反序（最新在前）'); }
  eq(ids(S({ visited: { '28': true } })), 'rec-19', 'B143 §2-B143-②：探针③（到过 28 ⇒ rec-19）');
  P('§2-B143-② 只显示已知：零记录（新局）／cond 成立才出（三探针） 逐条通过');
}

/* --- 26-8 §2-B143 机检③：态（done 翻转 ⇒ 已完成＋doneText；抽 3 条＋单态不出态标） --- */
{
  const S = extra => { const s = C.newState('normal'); if (extra) Object.assign(s, extra); return s; };
  const rOf = (s, id) => C.guideNotes(s).records.find(r => r.id === id);
  const a = rOf(S({ visited: { '4': true } }), 'rec-04');
  const b = rOf(S({ visited: { '4': true }, chDone: { '急救箱开过': true } }), 'rec-04');
  eq(a.state + ',' + b.state, 'undone,done', 'B143 §2-B143-③：探针① rec-04 态翻转（chDone 急救箱开过——前 undone／后 done）');
  eq(a.text + '｜' + b.text,
    '墙上的急救箱扣得死紧，一个人弄不下来——撬开它得费不少力气。｜急救箱卸下来了——里面躺着一只医疗包。',
    'B143 §2-B143-③：探针① doneText 替换（常态稿 → 完成稿——逐字）');
  const c = rOf(S({ visited: { '16': true }, learned: { '机器人小帮手': true } }), 'rec-16');
  eq([c.state, c.text].join('｜'), 'done｜机器人认了你，从此跟着你转——它叫『小帮手』。',
    'B143 §2-B143-③：探针② rec-16（knows 机器人小帮手 ⇒ done＋完成稿）');
  const d = rOf(S({ visited: { '3': true, '24': true } }), 'rec-03');
  eq([d.state, d.text].join('｜'), 'done｜阿雅忙了半个小时，站长终于睁开眼睛——她把备用的站长授权卡塞进你手里：去把它点亮。',
    'B143 §2-B143-③：探针③ rec-03（pinsAll 24 ⇒ done＋完成稿）');
  eq(String(rOf(S({ visited: { '13': true } }), 'rec-13').state), 'null', 'B143 §2-B143-③：无 done 者＝单态（state＝null——不出态标）');
  P('§2-B143-③ 态：三探针翻转（chDone／knows／pinsAll）＋doneText 替换＋单态不出态标 逐条通过');
}

/* --- 26-9 §2-B143 机检④：文本约束（三词零命中／L5 归属核／数字可溯） --- */
{
  const notes = D.meta.notes;
  const body = n => n.text + (n.doneText ? n.doneText : '');
  eq(notes.filter(n => /维修爬道|舱外|蒸汽/.test(body(n))).map(n => n.id).join(','), '',
    'B143 §2-B143-④：三词零命中（核验面＝详情稿正文；标题不核）');
  const badL5 = [];
  notes.forEach(n => {
    const owners = [n.src, n.doneSrc].filter(Boolean);
    L5_NOUNS.forEach(({ w, intro, allow }) => {
      if (body(n).indexOf(w) < 0 || allow === 'ALL') return;
      const introIds = String(intro).match(/\d+/g) || [];
      if (!owners.some(o => allow.indexOf(o) >= 0 || introIds.indexOf(o) >= 0)) badL5.push(n.id + ':' + w + '@' + owners.join('/'));
    });
  });
  eq(badL5.join(','), '', 'B143 §2-B143-④：L5_NOUNS 词条按 src／doneSrc 归属核（落引入点集＝引入、合法；零违规）');
  const badNum = [];
  notes.forEach(n => {
    (body(n).match(/\d+/g) || []).forEach(d => {
      const pool = [n.src, n.doneSrc].filter(Boolean).map(id => nodeTextOf(D.nodes[id] || {})).join('\n');
      if (pool.indexOf(d) < 0) badNum.push(n.id + ':' + d);
    });
  });
  eq(badNum.join(','), '', 'B143 §2-B143-④：数字串均见于 src／doneSrc 节点文本（可溯）');
  eq(notes.filter(n => /\d/.test(body(n))).map(n => n.id).join(','), 'clue-06',
    'B143 §2-B143-④：含数字条目＝仅「保险柜密码」（0325——全稿唯一一处）');
  P('§2-B143-④ 文本约束：三词零命中／L5 归属核零违规／数字仅 0325 且可溯 逐条通过');
}

/* --- 26-10 §2-B143 机检⑤：R5 感知（三助手探针／打开即清／旧档首开为真／DOM 圆点＋「新」标） --- */
{
  const S = extra => { const s = C.newState('normal'); if (extra) Object.assign(s, extra); return s; };
  const s = S({ visited: { '3': true, '4': true } });
  C.markGuideSeen(s);
  eq(C.guideHasNew(s), false, 'B143 §2-B143-⑤：落签名后无变化 ⇒ 无更新');
  s.visited['5'] = true;
  eq(C.guideHasNew(s), true, 'B143 §2-B143-⑤：新 visited（⇒ rec-06 命中）⇒ 有更新');
  C.markGuideSeen(s);
  s.learned['保险柜密码'] = true;
  eq(C.guideHasNew(s), true, 'B143 §2-B143-⑤：学新线索（learned +1）⇒ 有更新');
  C.markGuideSeen(s);
  s.chDone['急救箱开过'] = true;
  eq(C.guideHasNew(s), true, 'B143 §2-B143-⑤：态翻转（rec-04 done 假→真）⇒ 有更新');
  C.markGuideSeen(s);
  s.visited['13'] = true;
  eq(C.guideNotes(s).records.filter(r => r.isNew).map(r => r.id).join(','), 'rec-13',
    'B143 §2-B143-⑤：「新」标＝相对上次打开的新增/翻转条目（仅 rec-13）');
  C.markGuideSeen(s);
  eq(C.guideNotes(s).records.filter(r => r.isNew).length + C.guideNotes(s).clues.filter(c => c.isNew).length, 0,
    'B143 §2-B143-⑤：落签名后「新」标清空（打开 ⇒ 清除——本次打开仍可见）');
  const old = C.normalizeState({ diff: 'normal', loc: '1', coins: 10, oxygen: 90, items: [], visited: {}, done: {}, learned: {}, chDone: {}, hist: [] });
  eq(old.gSeen, '', 'B143 §2-B143-⑤：normalizeState 补 gSeen 缺省（旧档＝空串）');
  ok(C.guideHasNew(old), 'B143 §2-B143-⑤：旧档（无 gSeen）⇒ 首次为真（首开前显圆点——一次性，披露）');
  C.markGuideSeen(old);
  eq(C.guideHasNew(old), false, 'B143 §2-B143-⑤：旧档打开一次 ⇒ 清（此后不再报新）');
  ok(engSrc.indexOf("$('stuckBtn').classList.toggle('hasNew', has)") >= 0 && engSrc.indexOf("$('guideFab').classList.toggle('hasNew', has)") >= 0
    && /function renderGuideDot\(\)/.test(engSrc) && engSrc.indexOf('renderGuideDot();') >= 0,
    'B143 §2-B143-⑤：DOM 圆点（两入口 .hasNew 类切换＋renderAll 每帧更——源码契约）');
  ok(engSrc.indexOf("n.className = 'giNew';") >= 0 && engSrc.indexOf("n.textContent = '新';") >= 0,
    'B143 §2-B143-⑤：面板内「新」标渲染在案（.giNew）');
  ok(uiCssSrc.indexOf('.hasNew') >= 0 && uiCssSrc.indexOf('::after') >= 0 && uiCssSrc.indexOf('.giNew') >= 0,
    'B143 §2-B143-⑤：圆点＝CSS ::after／「新」标样式在案（零 DOM 画点）');
  P('§2-B143-⑤ R5 感知：三类触发（visited／learn／态翻转）／打开即清／旧档首开为真／DOM 圆点＋「新」标 逐条通过');
}

/* --- 26-11 §2-B143 机检⑥：渲染契约（两分组／组空不出／两组皆空＝空态句／条目可点展收·不落档） --- */
{
  ok(engSrc.indexOf("cb.appendChild(guideGroupHead('线索 · ' + g.clues.length))") >= 0
    && engSrc.indexOf("cb.appendChild(guideGroupHead('记录 · ' + g.records.length))") >= 0,
    'B143 §2-B143-⑥／B10（§2-B153）：两分组（组标题「线索 · n」／「记录 · n」——带计数、组非空才出）');
  ok(/if \(!g\.clues\.length && !g\.records\.length\) cb\.appendChild\(guideDimLine\(GUIDE_CLUES_EMPTY\)\);/.test(engSrc),
    'B143 §2-B143-⑥：两组皆空 ⇒ 既有空态句（单点判定）');
  ok(/if \(g\.clues\.length\) \{/.test(engSrc) && /if \(g\.records\.length\) \{/.test(engSrc),
    'B143 §2-B143-⑥：组空不出（各组独立守卫）');
  ok(/b\.textContent = \(text \? '▸ ' : ''\) \+ title;/.test(engSrc) && /b\.classList\.toggle\('open', open\)/.test(engSrc)
    && engSrc.indexOf("head.textContent = (open ? '▾ ' : '▸ ') + title;") >= 0,
    'B143 §2-B143-⑥：条目＝<button class="guideItem">（▸/▾ 展收——可多条同开）');
  ok(engSrc.indexOf("t.className = 'giText';") >= 0 && engSrc.indexOf('if (!text) { b.disabled = true; return b; }') >= 0,
    'B143 §2-B143-⑥：详情 .giText＋兜底行不可点（无详情 ⇒ disabled、无展开）');
  const probe = C.newState('normal'); probe.visited['1'] = true; probe.learned['走私暗号'] = true;
  const snap = JSON.stringify(probe);
  C.guideNotes(probe); C.guideSig(probe); C.guideHasNew(probe);
  eq(JSON.stringify(probe), snap, 'B143 §2-B143-⑥：展收为 DOM 瞬态——求值不落档（guideNotes 纯读）');
  P('§2-B143-⑥ 渲染契约：两分组／组空不出／皆空空态／展收＋不可点兜底／不落档 逐条通过');
}

/* --- 26-12 §2-B143 机检⑦：回归（dalim 无 notes：记录组恒不出、线索行兜底、两态探针；station ①③块逐字不变） --- */
{
  C.selectLevel('dalim');
  eq(String(LEVELS.dalim.meta.notes), 'undefined', 'B143 §2-B143-⑦：示例关数据零改动（无 meta.notes）');
  const d0 = C.newState('normal');
  eq([C.guideNotes(d0).records.length, C.guideNotes(d0).clues.length].join('/'), '0/0',
    'B143 §2-B143-⑦：dalim 无 notes ⇒ 记录组恒不出；新局无 learn ⇒ 两组皆空（②走既有空态句）');
  const d1 = C.newState('normal'); d1.learned['电梯密码'] = true; d1.learned['魔法数字'] = true;
  eq(C.guideNotes(d1).clues.map(x => x.key + ':' + (x.text === null ? 'flat' : 'note')).join(','), '魔法数字:flat,电梯密码:flat',
    'B143 §2-B143-⑦／B10（§2-B153）：dalim 两条 learn 值 ⇒ 兜底行（仅标题、不可点、无详情）；序＝键序反序（新在前）');
  eq(new Set(C.guideSig(d1).split('|').filter(t => t.indexOf('C:') === 0)).size, 2,
    'B143 §2-B143-⑦：兜底行照常参与签名（以 key 记入——新学会即触发圆点）');
  C.selectLevel('station');
  const s = C.newState('normal');
  eq(C.guideTarget(s), '先摸清站里的状况——找找能用的东西，听听大家都是怎么说的；把反应堆点亮，才是正事。',
    'B143 §2-B143-⑦：①块输出与 B137 口径逐字不变（开局 R6）');
  eq(C.guideTasks(s).length, 0, 'B146 机检②：③块输出照常（新局无可见任务 ⇒ []——空态句）');
  const s2 = C.newState('normal'); s2.visited['6'] = true; s2.items = ['控制芯片'];
  eq(C.guideTasks(s2).map(t => t.id + ':' + t.needs.map(n => n.label + '=' + n.done).join(',')).join('｜'),
    't-reactor:控制芯片=true,冷却剂罐=false,站长授权卡=false,电力=false｜t-power:',
    'B146 机检⑥：12 号视角链探针——t-reactor 四条 need 照显、☑ 随 done；t-power 头出（板未修：need 逐项 show 门未开——不预列）');
  ok(engSrc.indexOf('const g = Core.guideNotes(st);') >= 0, 'B143 §2-B143-⑦：②块渲染走 Core.guideNotes 单源（DOM 层）');
  P('§2-B143-⑦ 回归：dalim 记录组恒不出／兜底行两态／station ①③块逐字不变 逐条通过');
}

}

/* ============ 27. B09 引导·结局·难度轮：多结局提示／记录线头／任务清单／难度三档（§2-B144~B147＋老板⑦ · 2026-10-06） ============ */
console.log('');
console.log('———— B09：多结局提示（B144）／记录线头（B145）／任务清单（B146）／难度三档（B147）／10 号呼应版（⑦） ————');
const _strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '');   // 代码面（去块注释；注释里的历史记述按 §18-10 先例不核）
const STATION_SRC = fs.readFileSync(path.join(dir, 'levels', 'station.js'), 'utf8');
const DALIM_SRC = fs.readFileSync(path.join(dir, 'levels', 'dalim.js'), 'utf8');
const PLAIN_CSS = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
const HTML_SRC = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const LAB_SRC = fs.readFileSync(path.join(dir, 'lab.js'), 'utf8');
const PLAY_SRC = fs.readFileSync(path.join(dir, '..', 'tools', 'play.mjs'), 'utf8');
const COPY_SRC = fs.readFileSync(path.join(dir, '..', 'tools', 'export-copy.mjs'), 'utf8');
const ST = extra => { const s = C.newState('normal'); if (extra) Object.assign(s, extra); return s; };
const TASKS_OF = s => C.guideTasks(s);
const TASK_NEEDS = (s, id) => { const t = TASKS_OF(s).find(x => x.id === id); return t ? t.needs.map(n => n.label + '=' + n.done).join(',') : '(缺)'; };

/* --- 27-1 §2-B144 机检①：零残留（winReward／rewardBox／「通关奖励」——数据面＋代码面＋工具面） --- */
{
  eq([String(D.meta.winReward), String(LEVELS.dalim.meta.winReward)].join('/'), 'undefined/undefined',
    'B144 ①：两关 meta.winReward 均已删除（字段不存在）');
  const hits = [
    _strip(engSrc).indexOf('winReward'), _strip(engSrc).indexOf('rewardBox'), _strip(engSrc).indexOf('通关奖励'),
    _strip(STATION_SRC).indexOf('winReward'), _strip(DALIM_SRC).indexOf('winReward'), PLAIN_CSS.indexOf('rewardBox'),
    _strip(LAB_SRC).indexOf('winReward'), _strip(COPY_SRC).indexOf('winReward'), _strip(COPY_SRC).indexOf('通关奖励'),
    _strip(PLAY_SRC).indexOf('winReward'), _strip(PLAY_SRC).indexOf('通关奖励')
  ];
  eq(hits.filter(h => h >= 0).length, 0,
    'B144 ①：winReward／rewardBox／「通关奖励」在产品面＋工具面清零（引擎／站关／示例关／style.css／lab.js／export-copy.mjs／play.mjs——代码面 11 探针）');
  P('B144 ① 零残留：两关字段已删／产品面（含工具面）11 探针零命中 逐条通过');
}

/* --- 27-2 §2-B144 机检②：判据探针（station true／单结局关 false） --- */
{
  eq(C.moreEndings(), true, 'B144 ②：station（win 41／42／43＝3 个）⇒ true');
  C.selectLevel('dalim');
  eq(C.moreEndings(), false, 'B144 ②：示例关（win 仅 57＝1 个）⇒ false（「多结局」不成立不硬写）');
  C.selectLevel('station');
  ok(/moreEndings\(\) \{\s*\n\s*if \(!D \|\| !D\.nodes\) return false;/.test(engSrc) && engSrc.indexOf('Object.keys(D.nodes).filter(k => D.nodes[k] && D.nodes[k].win).length >= 2') >= 0,
    'B144 ②：判据源码＝本关 win 节点数 ≥ 2（零新字段）');
  P('B144 ② 判据：station true／单结局关 false／win ≥2 单源 逐条通过');
}

/* --- 27-3 §2-B144 机检③：结算屏（win 档 ⇒ .endMore 串逐字＋位次；失败结算不出） --- */
{
  ok(engSrc.indexOf("m.className = 'endMore';") >= 0 && engSrc.indexOf('m.textContent = MORE_END_TEXT;') >= 0,
    'B144 ③：结算屏渲染块在案（.endMore——win 档）');
  ok(engSrc.indexOf('const MORE_END_TEXT = \'🔀 还有别的结局——换一条路、换一种做法，故事会有不一样的收尾。\';') >= 0,
    'B144 ③：结算屏文案逐字（引擎常量 MORE_END_TEXT＝bible §7.50）');
  ok(engSrc.indexOf('if (node.win && Core.moreEndings()) {') >= 0,
    'B144 ③：判据＝win 档 ∧ Core.moreEndings()（失败结算（29／44）不渲染——⑥ 回归同源）');
  const block = engSrc.slice(engSrc.indexOf('const box = $(' + '\'choiceList\'' + ');'));
  ok(block.indexOf('box.appendChild(m);') >= 0 && block.indexOf('box.appendChild(m);') < block.indexOf('box.appendChild(endButtons());'),
    'B144 ③：位次＝结局横幅下、出口按钮前（box：横幅 → .endMore → endButtons）');
  P('B144 ③ 结算屏：.endMore 在案／串逐字／win ∧ moreEndings／位次在按钮前 逐条通过');
}

/* --- 27-4 §2-B144 机检④：序章层（DOM＋文案＋111 字不变＋单结局不出） --- */
{
  ok(HTML_SRC.indexOf('id="prologueMore"') >= 0 && HTML_SRC.indexOf('class="proMore hidden"') >= 0,
    'B144 ④：序章层容器 #prologueMore（.proMore——默认 hidden）在案');
  ok(HTML_SRC.indexOf('id="prologueMore"') > HTML_SRC.indexOf('id="prologueLines"') && HTML_SRC.indexOf('id="prologueMore"') < HTML_SRC.indexOf('class="prologueBtns"'),
    'B144 ④：位次＝正文行之下一行、按钮行之前');
  ok(engSrc.indexOf("const more = $('prologueMore');") >= 0 && engSrc.indexOf('const MORE_PRO_TEXT = \'结局不止一个——你做的每个选择，都会把故事带向不同的收尾。\';') >= 0,
    'B144 ④：序章层文案逐字（MORE_PRO_TEXT＝bible §7.50）＋判据 Core.moreEndings()（单结局关不出）');
  eq(prologueText.length, 111, 'B144 ④：序章 111 字断言不变（提示不进计数——字数口径＝正文 lines）');
  ok(uiCssSrc.indexOf('.proMore') >= 0 && uiCssSrc.indexOf('.endMore') >= 0, 'B144 ④：两处样式在案（style-ui.css 新面外置）');
  eq([_strip(PLAY_SRC).indexOf('moreEndings') < 0, _strip(LAB_SRC).indexOf('moreEndings') < 0].join(','), 'true,true',
    'B144 ④：--player／lab 不接入多结局提示（沿既有口径——零改动）');
  P('B144 ④ 序章层：#prologueMore 位次／串逐字／111 字不变／单结局关不出 逐条通过');
}

/* --- 27-5 §2-B145 机检①~④：rec-06 改稿（逐字／源不动／纪律／总数不变） --- */
{
  const rec = D.meta.notes.find(n => n.id === 'rec-06');
  eq(C.guideNotes(ST({ visited: { '5': true }, chDone: { '跟胖胖打过招呼': true } })).records.find(r => r.id === 'rec-06').text,
    '袋子上贴着胖胖的便条——里头是一盒合成料理，和一罐真的鱼罐头。便条上还写着：『谁找到这袋零食，算谁的——帮我哄哄银河，它最近老往仓库跑。』',
    'B145 ①：rec-06 完成稿逐字（便条线头——chDone 成立 ⇒ doneText）');
  eq(rec.text, '窗外的木星像一颗巨大的糖果。沙发后面，站猫银河蹲在一只鼓鼓的零食袋上——它只吃真鱼，对合成粮闻都不闻。',
    'B145 ①：常态稿逐字不变（text 未动）');
  eq([rec.id, rec.kind, JSON.stringify(rec.cond), JSON.stringify(rec.done), rec.src, rec.doneSrc].join('｜'),
    'rec-06｜record｜{"pinsAll":["5"]}｜{"chDone":"跟胖胖打过招呼"}｜5｜5',
    'B145 ③：id／kind／cond／done／src／doneSrc 逐字不变（仅完成稿文案）');
  eq([/维修爬道|舱外|蒸汽/.test(rec.doneText), /\d/.test(rec.doneText)].join(','), 'false,false',
    'B145 ②：新稿纪律（三词零命中／无数字）');
  eq(D.meta.notes.length, 35, 'B145 ③：记录总数仍 35（16/19）——零新增');
  P('B145 ①③：改稿逐字／常态稿与源字段不动／纪律两句零命中／35 条不变 逐条通过');
}

/* --- 27-6 §2-B146 机检①：结构（3 行／id 唯一／条件语言全走 condOk／need 非空） --- */
{
  const T2 = D.meta.tasks;
  ok(Array.isArray(T2), 'B146 ①：meta.tasks 在案（数组——唯一清单第 14 项）');
  eq(T2.length, 3, 'B146 ①：3 行任务（t-reactor／t-power／t-yinhe——计数自证）');
  eq(T2.map(t => t.id).join(','), 't-reactor,t-power,t-yinhe', 'B146 ①：数组序＝渲染序（id 序逐字）');
  eq(new Set(T2.map(t => t.id)).size, 3, 'B146 ①：id 唯一');
  const bad = [];
  T2.forEach(t => {
    if (typeof t.name !== 'string' || !t.name || !Array.isArray(t.need) || !t.need.length) { bad.push(t.id + ':形状'); return; }
    try { C.condOk(C.newState('normal'), t.show); C.condOk(C.newState('normal'), t.done); }
    catch (e) { bad.push(t.id + ':throw'); }
    t.need.forEach(n => {
      try { C.condOk(C.newState('normal'), n.done); if (n.show != null) C.condOk(C.newState('normal'), n.show); }
      catch (e) { bad.push(t.id + ':' + n.label + ':throw'); }
    });
  });
  eq(bad.join(','), '', 'B146 ①：show／done／need[].done／need[].show 全走条件语言（逐条 condOk 不抛）＋need 非空');
  P('B146 ① 结构：3 行／id 唯一／条件语言逐条不抛／need 非空 逐条通过');
}

/* --- 27-7 §2-B146 机检②：只显示已知（t-power 三态／t-yinhe 两态） --- */
{
  const ids = s => TASKS_OF(s).map(t => t.id).join(',');
  eq(ids(ST()), '', 'B146 ②：新局 ⇒ 零任务（「只显示已知」）');
  eq(ids(ST({ visited: { '6': true } })), 't-reactor,t-power', 'B146 ②：到过指挥舱 ⇒ t-reactor（清单已知）＋t-power（电力问题已知）');
  /* t-power 三态（show 只认：到过 6／23／15 或板已修好——到过 19 不在判据内） */
  eq(ids(ST({ visited: { '19': true } })), '', 'B146 ②：t-power 态一——仅到过站外 19 ⇒ 不出（show 未开）');
  eq(ids(ST({ visited: { '15': true } })), 't-power', 'B146 ②：t-power 态二——到过配电盘 15（电力问题已知）⇒ 出');
  eq(ids(ST({ learned: { '太阳能板已修好': true } })), 't-power', 'B146 ②：t-power 态三——板已修好 ⇒ 出（show 或支）');
  eq(ids(ST({ chDone: { '跟胖胖打过招呼': true } })), 't-yinhe', 'B146 ②：t-yinhe 两态——打过招呼 ⇒ 出');
  eq(ids(ST({ chDone: { '跟胖胖打过招呼': true }, items: ['桑尼的账本'] })), 't-yinhe',
    'B10／§2-B152：t-yinhe 完成态保留可见（done 成立不再整条滤掉——沉底＋「✓ 已完成」标）');
  P('B146 ② 只显示已知：新局零任务／t-power 三态／t-yinhe 两态 逐条通过');
}

/* --- 27-8 §2-B146 机检③：多任务态（老板④正断言——两条同屏＋不出空态句） --- */
{
  const g = TASKS_OF(ST({ chDone: { '跟胖胖打过招呼': true }, items: ['控制芯片'] }));
  eq(g.map(t => t.id).join(','), 't-reactor,t-yinhe', 'B146 ③：合成探针 ⇒ t-reactor＋t-yinhe 两条同屏（t-power 的 show 未开）');
  ok(g.length >= 2, 'B146 ③：多任务在身（≥2 条）');
  ok(/if \(!tasks\.length\) nb\.appendChild\(guideDimLine\(GUIDE_TASKS_EMPTY\)\);/.test(engSrc),
    'B146 ③：空态句单点守卫＝仅 tasks.length === 0 时出（多任务在身 ⇒ 不出空态句——老板④正断言）');
  ok(engSrc.indexOf('（这一步没有要凑的东西。）') < 0, 'B146 ③：旧空态句零残留（全串更换）');
  P('B146 ③ 多任务态：两条同屏／空态句单点守卫（多任务不出）／旧句零残留 逐条通过');
}

/* --- 27-9 §2-B146 机检④：勾选态（持物 ⇒ ☑／板已修好 ⇒ ☑——need.show 两档展开） --- */
{
  eq(TASK_NEEDS(ST({ visited: { '6': true }, items: ['控制芯片'] }), 't-reactor'),
    '控制芯片=true,冷却剂罐=false,站长授权卡=false,电力=false',
    'B146 ④：持控制芯片 ⇒ 该行 ☑、其余 ☐（勾选态随 done）');
  eq(TASK_NEEDS(ST({ visited: { '19': true }, learned: { '太阳能板已修好': true } }), 't-power'),
    '外部阵列那一路（站外的太阳能板）=true,带上能焊的工具（焊接枪或机械手套）=false,回控制室，把主供电推上去=false',
    'B146 ④：板已修好 ⇒ t-power 首项 ☑（need 三项 show 门已开：到过 19＋板已修好）');
  P('B146 ④ 勾选态：持物 ⇒ ☑／板已修好 ⇒ ☑ 逐条通过');
}

/* --- 27-10 §2-B146 机检⑤：空态（真无可见任务 ⇒ 新空态句；有任务 ⇒ 不出） --- */
{
  eq(TASKS_OF(C.newState('normal')).length, 0, 'B146 ⑤：新局（未听清单）⇒ 零可见任务');
  ok(engSrc.indexOf("const GUIDE_TASKS_EMPTY = '（眼下没有要凑的东西。）';") >= 0,
    'B146 ⑤：新空态句逐字在案（engine 常量——替换旧句）');
  P('B146 ⑤ 空态：新局零任务／新句在案（旧句零残留——见 ③） 逐条通过');
}

/* --- 27-11 §2-B146 机检⑥：控制台链样板（老板⑤——t-reactor 四条照显；板修好后出「回控制室」项） --- */
{
  const t1 = TASKS_OF(ST({ visited: { '6': true } })).find(t => t.id === 't-reactor');
  eq([t1.needs.length, t1.needs.map(n => n.done).join(',')].join('｜'), '4｜false,false,false,false',
    'B146 ⑥：缺件缺电 ⇒ t-reactor 四条 need 照显（不折叠）、全 ☐');
  eq(t1.needs.map(n => n.label).join('／'), '控制芯片／冷却剂罐／站长授权卡／电力', 'B146 ⑥：四条标签逐字（bible §7.49）');
  const t2 = TASKS_OF(ST({ learned: { '太阳能板已修好': true }, visited: { '19': true } })).find(t => t.id === 't-power');
  ok(!!t2 && t2.needs.some(n => n.label === '回控制室，把主供电推上去'),
    'B146 ⑥：板修好后 ⇒ t-power 出「回控制室，把主供电推上去」项');
  const t3 = TASKS_OF(ST({ visited: { '6': true } })).find(t => t.id === 't-power');
  ok(!!t3 && !t3.needs.some(n => n.label.indexOf('回控制室') >= 0),
    'B146 ⑥：板修好前 ⇒ 该项不出（need.show 门——不预列）；任务头照出（链概览）');
  P('B146 ⑥ 控制台链：四条照显／板修好后出「回控制室」项／板修前不出 逐条通过');
}

/* --- 27-12 §2-B146 机检⑦：回归（targets 无 need 残留／①块逐字／dalim 无 tasks） --- */
{
  eq(JSON.stringify(D.meta.targets).indexOf('"need"'), -1, 'B146 ⑦：meta.targets 数据无 need 残留（R2／R5 行已删——失效即删）');
  eq(D.meta.targets.map(r => 'need' in r).join(','), 'false,false,false,false,false,false', 'B146 ⑦：六行均无 need 键');
  eq(C.guideTarget(C.newState('normal')), '先摸清站里的状况——找找能用的东西，听听大家都是怎么说的；把反应堆点亮，才是正事。',
    'B146 ⑦：①块（guideTarget）输出与 B137 口径逐字不变');
  eq(C.guideNotes(C.newState('normal')).records.length + C.guideNotes(C.newState('normal')).clues.length, 0,
    'B146 ⑦：②块输出照常（新局两组皆空）');
  C.selectLevel('dalim');
  eq(String(LEVELS.dalim.meta.tasks), 'undefined', 'B146 ⑦：示例关数据零改动（无 meta.tasks）');
  eq(TASKS_OF(C.newState('normal')).length, 0, 'B146 ⑦：dalim 无 tasks ⇒ []（③块走空态句——无异常）');
  C.selectLevel('station');
  P('B146 ⑦ 回归：数据零 need／①块逐字不变／dalim 无 tasks ⇒ [] 逐条通过');
}

/* --- 27-13 §2-B146 机检⑧：签名（任务出现／☑ 翻转 ⇒ 🧭 有更新；打开即清） --- */
{
  const s = ST({ visited: { '6': true } });
  C.markGuideSeen(s);
  eq(C.guideHasNew(s), false, 'B146 ⑧：落签名后无变化 ⇒ 无更新');
  s.items.push('控制芯片');
  eq(C.guideHasNew(s), true, 'B146 ⑧：☑ 翻转（控制芯片 ☐→☑）⇒ 有更新（签名③段＝逐任务 id:need:done）');
  C.markGuideSeen(s);
  eq(C.guideHasNew(s), false, 'B146 ⑧：打开即清（落签名 ⇒ 无更新）');
  const s2 = ST({});
  C.markGuideSeen(s2);
  s2.chDone['跟胖胖打过招呼'] = true;
  eq(C.guideHasNew(s2), true, 'B146 ⑧：任务出现（t-yinhe 由无到有）⇒ 有更新');
  ok(/parts\.push\('T:' \+ t\.id/.test(engSrc), 'B146 ⑧：签名③段＝逐任务序列（源码契约）');
  P('B146 ⑧ 签名：任务出现／☑ 翻转 ⇒ 有更新；打开即清 逐条通过');
}

/* --- 27-14 §2-B146 机检⑨：渲染契约与文案纪律（含 guideNeeds 退役／--player·lab 零接入） --- */
{
  ok(engSrc.indexOf("tt.className = 'tdTitle' + (t.done ? ' done' : '');") >= 0
    && engSrc.indexOf("d.className = 'guideLine tdNeed' + (n.done ? ' done' : '');") >= 0,
    'B146 ⑨／B10（§2-B152）：渲染（任务名行 .tdTitle〔完成态 + done〕＋ 逐项 .guideLine.tdNeed）；源码契约');
  ok(uiCssSrc.indexOf('.tdTitle') >= 0 && uiCssSrc.indexOf('.tdNeed') >= 0, 'B146 ⑨：样式在案（style-ui.css 新面）');
  const texts = D.meta.tasks.flatMap(t => [t.name].concat(t.need.map(n => n.label)));
  eq(texts.filter(t => /\d/.test(t)).join(','), '', 'B146 ⑨：任务名与 need 标签无数字（' + texts.length + ' 项全文扫描）');
  eq(texts.filter(t => /维修爬道|舱外|蒸汽/.test(t)).join(','), '', 'B146 ⑨：无发现面名词（维修爬道／舱外／蒸汽）');
  eq([engSrc.indexOf('Core.guideNeeds') < 0, _strip(engSrc).indexOf('guideNeeds(') < 0, engSrc.indexOf("$('guideNeeds')") >= 0].join(','),
    'true,true,true', 'B146 ⑨：Core.guideNeeds 已退役（函数零残留——③块容器 DOM id 沿用不改，沿 B137「id 不改」先例）');
  eq([_strip(PLAY_SRC).indexOf('guideTasks'), _strip(LAB_SRC).indexOf('guideTasks'), _strip(PLAY_SRC).indexOf('guideNeeds'), _strip(LAB_SRC).indexOf('guideNeeds')].join(','),
    '-1,-1,-1,-1', 'B146 ⑨：--player／lab 不接入任务清单（零改动——工具面两探针）');
  P('B146 ⑨ 渲染契约：.tdTitle／.tdNeed／文案纪律（无数字·无发现面名词）／guideNeeds 退役／工具面零接入 逐条通过');
}

/* --- 27-15 §2-B147 机检①②：数据三键（两关）＋卡片三行三单选 --- */
{
  const dalimRes = LEVELS.dalim.resources.find(r => r.id === 'coins');
  eq([dalimRes.start.easy, dalimRes.start.normal, dalimRes.start.hard].join('/'), '20/15/10',
    'B147 ①：示例关萨瓦币三档 20／15／10');
  ok(engSrc.indexOf("row.textContent = Core.diffLabel(d) + '：' + bits.join('　');") >= 0
    && engSrc.indexOf("['easy', 'normal', 'hard'].forEach(d => {") >= 0,
    'B147 ②：卡片资源行＝三行（三档各一行；由 Core.startValue 读、缺键回落 normal）');
  const btns = engSrc.slice(engSrc.indexOf("const picked = { diff: 'normal' };"), engSrc.indexOf('btns.appendChild(diffRow);'));
  ok(btns.indexOf('Core.diffLabel(d)') >= 0 && /r\.checked = \(d === 'normal'\);/.test(btns),
    'B147 ②：三单选（简单／中等／困难）＋默认选中中等（checked 唯一——源码契约）');
  ok(engSrc.indexOf('startGame(id, picked.diff)') >= 0, 'B147 ②：所选档传 startGame（回归——原有口径）');
  P('B147 ② 数据＋卡片：两关三键齐／三行三单选默认中等 逐条通过');
}

/* --- 27-16 §2-B147 机检③：档位词三档（全串面零「普通模式」＋diffLabel 单源） --- */
{
  eq([_strip(engSrc).indexOf('普通模式') < 0, HTML_SRC.indexOf('普通模式') < 0, _strip(DALIM_SRC).indexOf('普通模式') < 0,
      _strip(STATION_SRC).indexOf('普通模式') < 0, uiCssSrc.indexOf('普通模式') < 0].join(','), 'true,true,true,true,true',
    'B147 ③：全串面零「普通模式」残留（引擎／index.html／示例关／站关／样式）');
  ok(engSrc.indexOf("diffLabel(d) { return d === 'easy' ? '简单模式' : d === 'hard' ? '困难模式' : '中等模式'; }") >= 0,
    'B147 ③：档位词单源（Core.diffLabel 三档词——卡片／💾 行同源）');
  eq(C.diffLabel('easy') + '｜' + C.diffLabel('normal') + '｜' + C.diffLabel('hard') + '｜' + C.diffLabel('x'),
    '简单模式｜中等模式｜困难模式｜中等模式', 'B147 ③：diffLabel 三档词＋未识别值 ⇒ 中等');
  P('B147 ③ 档位词：三档词单源／全串面零「普通模式」 逐条通过');
}

/* --- 27-17 §2-B147 机检⑤：`--easy` CLI 与工具面口径（源码契约） --- */
{
  ok(PLAY_SRC.indexOf("--easy|--hard") >= 0 && PLAY_SRC.indexOf("flags.easy === true ? 'easy'") >= 0,
    'B147 ⑤：--easy 在案（play.mjs 开新局三档；用法行同步）');
  ok(PLAY_SRC.indexOf('const base = C.startValue(r, st.diff);') >= 0 && PLAY_SRC.indexOf('oxygen: (v, base) =>') >= 0,
    'B147 ⑤：--player 文本条与档位词同口径（基准＝start[st.diff]——比例口径）');
  ok(COPY_SRC.indexOf('| 资源 | 简单开局 | 中等开局 | 困难开局 | 归零时 |') >= 0,
    'B147 ⑤：导出稿资源表三列（export-copy 三档）');
  P('B147 ⑤ 工具面：--easy／基准 start[st.diff]／导出三列 逐条通过');
}

/* --- 27-18 老板⑦：10 号 tIf 第四条（置末呼应版；不遮前三条） --- */
{
  const LINE = '桑尼还是笑眯眯地挡在货架前面——只是这一回，你看着他的手，想起了监控回放里拉下保险丝的那只手。';
  const tIf = D.nodes['10'].tIf;
  eq(tIf.length, 4, 'B09⑦：10 号 tIf 四条（原三条＋呼应版——计数自证）');
  eq([JSON.stringify(tIf[3].cond), tIf[3].t].join('｜'), '{"item":"监控回放"}｜' + LINE,
    'B09 ⑦：第四条＝持「监控回放」呼应版（cond 与文案逐字；置末）');
  const t10 = extra => C.nodeText(ST(extra), D.nodes['10']);
  eq(t10({ items: ['监控回放'] }), LINE, 'B09 ⑦：持监控回放 ⇒ 呼应版正文（第四条命中）');
  ok(t10({}) !== LINE, 'B09 ⑦：未持 ⇒ 不出现呼应版');
  eq(t10({ learned: { '收了桑尼的贿赂': true }, items: ['监控回放'] }).indexOf('货架已经空了大半') >= 0, true,
    'B09 ⑦：置末不遮——收贿版优先（同时持监控回放仍走第 1 条）');
  eq(t10({ visited: { '32': true }, items: ['监控回放'] }).indexOf('缩在货架后面') >= 0, true, 'B09 ⑦：置末不遮——第 2 条（到过 32）优先');
  eq(t10({ visited: { '31': true }, items: ['监控回放'] }).indexOf('帆布蒙上了') >= 0, true, 'B09 ⑦：置末不遮——第 3 条（到过 31）优先');
  P('B09 ⑦ 10 号呼应版：四条／cond 与文案逐字／持物才出／置末不遮前三条 逐条通过');
}

/* ============ 28. B10 试玩修复轮二：任务勾选语义／场景预载・旧帧保持／选关卡片／动作留房／③块完成态／②块倒序（§2-B148~B153 · 2026-10-06） ============ */
console.log('');
console.log('———— B10：B148 追银河勾选／B149 切场景预载＋旧帧／B150 卡片清单／B151 动作留房／B152 ③块完成态／B153 ②块倒序 ————');
const S10 = extra => { const s = C.newState('normal'); if (extra) Object.assign(s, extra); return s; };
const TASK10 = (s, id) => C.guideTasks(s).find(t => t.id === id);

/* --- 28-1 §2-B148 机检①~⑤：t-yinhe 修正（结构／勾选递进／老板①正断言／全勾未完成样板／回归） --- */
{
  const tyNeed = D.meta.tasks.find(t => t.id === 't-yinhe').need;
  const TY = extra => TASK10(S10(extra), 't-yinhe');
  eq([tyNeed.length, tyNeed[1].label].join('｜'), '2｜追出去，看它往哪儿跑',
    'B148 ①：t-yinhe need 恰 2 行、第 2 行标签逐字（bible §7.49 照抄区）');
  eq(JSON.stringify(tyNeed[0].done), '{"any":[{"item":"站猫罐头"},{"item":"桑尼的账本"}]}',
    'B148 ①：need1＝单调谓词 any[站猫罐头, 桑尼的账本]（文案不动）');
  { const bad = [];
    tyNeed.forEach(n => { try { C.condOk(S10(), n.done); } catch (e) { bad.push(n.label); } });
    eq(bad.join(','), '', 'B148 ①：两条 need 全走条件语言（逐条 condOk 不抛）'); }
  const gy = { chDone: { '跟胖胖打过招呼': true } };
  const line = extra => { const t = TY(extra); return [t.needs.map(n => n.done).join(','), t.done].join('｜'); };
  eq(line(gy), 'false,false｜false', 'B148 ②：未拿罐头 ⇒ 两行全 ☐（done:false）');
  eq(line(Object.assign({ items: ['站猫罐头'] }, gy)), 'true,false｜false',
    'B148 ②：持罐头（未追）⇒ 第 1 行 ☑／第 2 行 ☐／done:false');
  eq(line(Object.assign({ items: ['桑尼的账本'] }, gy)), 'true,true｜true',
    'B148 ②：换到账本且罐头被消耗（28① fx lose）⇒ 第 1 行仍 ☑（单调）＋第 2 行 ☑／done:true');
  ok(TY(Object.assign({ items: ['站猫罐头'] }, gy)).needs.some(n => !n.done),
    'B148 ③（老板①正断言）：持罐头未追 ⇒ 任务下仍有一条未勾的「还要做什么」');
  { /* ③′ 行为面：真实走「5① 钻沙发 → 追出去 → 28① 换账本」（罐头被消耗） */
    const sw = C.newState('normal'); C.go(sw, '5');
    const pick5 = (id, part) => { const i = D.nodes[id].c.findIndex(ch => (ch.l || '').indexOf(part) >= 0); C.move(sw, C.choose(sw, i)); };
    pick5('5', '钻到沙发后面'); pick5('5', '追出去'); pick5('28', '站猫罐头');
    const t = TASK10(sw, 't-yinhe');
    eq([C.hasItem(sw, '站猫罐头'), C.hasItem(sw, '桑尼的账本'), t.needs.map(n => n.done).join(','), t.done].join('｜'),
      'false｜true｜true,true｜true', 'B148 ③′：换账本消耗罐头 ⇒ 两行全 ☑（全勾 ⟺ 完成在可达状态成立）'); }
  { /* ④ 全勾未完成样板（12 号：三件＋复电 ⇒ 四条全 ☑、done:false、条目仍出） */
    const s12 = S10({ visited: { '6': true }, items: ['控制芯片', '冷却剂罐', '站长授权卡'], learned: { '全站复电': true } });
    const tr = TASK10(s12, 't-reactor');
    eq([!!tr, tr.needs.map(n => n.done).join(','), tr.done].join('｜'), 'true｜true,true,true,true｜false',
      'B148 ④／B152 表 b：全 ☑ ≠ 完成（t-reactor 四条全 ☑、done:false、条目仍出）'); }
  eq(D.meta.tasks.find(t => t.id === 't-reactor').need.map(n => n.label).join('／'), '控制芯片／冷却剂罐／站长授权卡／电力',
    'B148 ⑤：t-reactor need 逐字不变');
  eq(D.meta.tasks.find(t => t.id === 't-power').need.map(n => n.label).join('／'),
    '外部阵列那一路（站外的太阳能板）／带上能焊的工具（焊接枪或机械手套）／回控制室，把主供电推上去',
    'B148 ⑤：t-power need 逐字不变');
  eq(tyNeed.map(n => n.label).filter(t => /\d/.test(t) || /维修爬道|舱外|蒸汽/.test(t)).join(','), '',
    'B148 ⑤：新行照扫文案纪律（无数字、无发现面名词——§2-B146 机检⑨ 同口径）');
  P('§2-B148 ①~⑤：结构／勾选递进（真实序列＋行为面）／老板①正断言／全勾未完成样板／回归 逐条通过');
}

/* --- 28-2 §2-B149 机检①~⑥：预载顺序（两探针）／源码・CSS 契约／回归／零新路径 --- */
{
  const sceneImgAll = [];
  Object.keys(D.scenes).forEach(sid => { sceneImgAll.push(D.scenes[sid].image); (D.scenes[sid].variants || []).forEach(v => sceneImgAll.push(v.image)); });
  const s1 = S10({}); C.go(s1, '1');
  const ord1 = C.preloadOrder(s1);
  eq(ord1[0], D.scenes[C.sceneOf(s1)].image, 'B149 ①：首项＝当前场景图（1 号开局——食堂）');
  eq([new Set(ord1).size, ord1.length, ord1.length === sceneImgAll.length].join('｜'),
    [sceneImgAll.length, sceneImgAll.length, true].join('｜'),
    'B149 ①：无重复项＋总数＝数据面场景图全集（含已注册变体；现盘 ' + sceneImgAll.length + ' 张——随资产同步）');
  { const idx = u => ord1.indexOf(u);
    const top = Object.keys(D.scenes).filter(sid => C.sceneLabel(sid) === '顶层' && /^room-/.test(sid)).map(sid => idx(D.scenes[sid].image));
    const bot = Object.keys(D.scenes).filter(sid => C.sceneLabel(sid) === '底层' && /^room-/.test(sid)).map(sid => idx(D.scenes[sid].image));
    eq([top.length, bot.length, Math.max.apply(null, top) < Math.min.apply(null, bot)].join('｜'), '5｜6｜true',
      'B149 ①：同层（顶层 5 房）全部排在其它层房间之前（底层 6 房在后）'); }
  { const mb = ord1.findIndex(u => /\/medbay\.jpg$/.test(u));
    eq([mb >= 0, ord1.findIndex(u => /medbay-awake\.jpg$/.test(u)) - mb].join('｜'), 'true｜1',
      'B149 ①：变体图紧随其基础图（medbay-awake 紧跟在 medbay 之后）'); }
  const s12 = S10({}); C.go(s12, '12');
  eq(C.preloadOrder(s12)[0].split('/').pop(), 'reactor.jpg', 'B149 ②：换位探针（st 在 12 号 ⇒ 首项＝reactor.jpg）');
  eq([C.preloadOrder(s1).indexOf(D.scenes['room-reactor'].image) !== C.preloadOrder(s12).indexOf(D.scenes['room-reactor'].image),
    C.preloadOrder(s12).length === sceneImgAll.length].join('｜'), 'true｜true',
    'B149 ②：可达集变化带动顺序（12 号视角：reactor 越到前列——抽 1 例；全量仍在列）');
  /* ③ 源码契约 */
  const iPrev = HTML_SRC.indexOf('id="sceneImgPrev"'), iImg = HTML_SRC.indexOf('id="sceneImg"'),
    iVeil = HTML_SRC.indexOf('id="scenePrevVeil"'), iMom = HTML_SRC.indexOf('id="momentLayer"');
  ok(iPrev >= 0 && iVeil >= 0 && iPrev < iImg && iImg < iVeil && iVeil < iMom,
    'B149 ③：index.html 双帧层＋轻帘在案且位次正确（#sceneImgPrev 先于 #sceneImg；轻帘在双帧之后、浮现层之前）');
  ok(engSrc.indexOf('img.complete && img.naturalWidth > 0') >= 0,
    'B149 ③：判据＝complete && naturalWidth（就绪＝原子置换支）');
  { const body = engSrc.slice(engSrc.indexOf('function idleNext'), engSrc.indexOf('function veilOn'));
    ok(body.indexOf('requestIdleCallback') >= 0 && body.indexOf('setTimeout(fn, 0)') >= 0
      && body.indexOf('moments') < 0 && body.indexOf('cg') < 0,
      'B149 ③：预载＝串行空闲（requestIdleCallback 优先／setTimeout 兜底）、函数体不含 moments／cg'); }
  eq(engSrc.split('runPreload();').length - 1, 3, 'B149 ③：启动点恰 3 处（startGame／resumeGame／restart——不递归）');
  ok(engSrc.indexOf('if (img.dataset.src !== src) return;') >= 0 && engSrc.indexOf('晚到帧守卫') >= 0,
    'B149 ③：晚到帧守卫＝load 回调先比对当前目标图（非当前目标不回写、不撤帘）');
  ok(engSrc.indexOf("$('scenePrevVeil').classList.toggle('hidden', !on)") >= 0
    && engSrc.indexOf('veilOn(true);') >= 0 && engSrc.indexOf('veilOn(false);') >= 0,
    'B149 ③：轻帘单点控制（veilOn——等待上帘／置换撤帘）');
  ok(engSrc.indexOf('sceneFail.add(cur)') >= 0 && engSrc.indexOf('if (sceneFail.has(entry.image))') >= 0,
    'B149 ③：基础图失败＝停旧帧＋告警＋记失败表；切入该场景重设 src 一次（最小重试）');
  /* ④ CSS 契约 */
  { const p = uiCssSrc.slice(uiCssSrc.indexOf('#sceneImgPrev {'), uiCssSrc.indexOf('#sceneImg.sceneWait'));
    ok(p.indexOf('aspect-ratio') >= 0 && p.indexOf('pointer-events: none') >= 0,
      'B149 ④：旧帧 pointer-events:none＋独立 aspect-ratio（不随新图拉伸）'); }
  { const v = uiCssSrc.slice(uiCssSrc.indexOf('#scenePrevVeil {'), uiCssSrc.indexOf('#guideClues'));
    ok(v.indexOf('pointer-events: none') >= 0, 'B149 ④：轻帘 pointer-events:none（不挡交互）'); }
  /* ⑤ 回归（同图不重设／resetView 时机／变体失败记忆清除） */
  ok(engSrc.indexOf('img.dataset.src !== entry.image && img.dataset.fail !== entry.image') >= 0,
    'B149 ⑤：同图不重设判据在案（避免重复加载/闪烁）');
  ok(engSrc.indexOf('resetView();') > engSrc.indexOf('if (sid !== curScene) {') && engSrc.indexOf('resetView();') < engSrc.indexOf('if (!first && st) toast'),
    'B149 ⑤：resetView 时机不变（仍在换场景分支内、到达提示之前）');
  ok(engSrc.indexOf('imgFailReset();') >= 0 && engSrc.indexOf('function imgFailReset()') >= 0,
    'B149 ⑤：变体失败记忆清除照旧（重进房间即生效——零变化）');
  /* ⑥ 不降画质：预载只按数据面原路径加载现有文件（图片张数与字节零变化由实现轮 git 核） */
  ok(engSrc.indexOf('new Image()') >= 0 && engSrc.indexOf('im.src = u;') >= 0,
    'B149 ⑥：预载只按数据面原路径加载现有文件（不新增缩图/压缩图——零新路径）');
  P('§2-B149 ①~⑥：顺序（两探针）／源码契约（判据・空闲・启动点・晚到帧・重试）／CSS 契约／回归／零新路径 逐条通过');
}

/* --- 28-3 §2-B150 机检②~④：卡片清单单源／lab 零改动／单卡文案逐字／卡片渲染回归 --- */
{
  eq(C.cardLevelIds().join(','), 'station', 'B150 ①：cardLevelIds() 恰 [station]（dalim 在引擎侧隐藏清单）');
  eq([C.levelIds().indexOf('dalim') >= 0, C.defaultLevelId()].join('｜'), 'true｜dalim', 'B150 ①：levelIds 仍含 dalim／defaultLevelId 不变');
  const rs = engSrc.slice(engSrc.indexOf('function renderLevelSelect()'), engSrc.indexOf("$('overlaySub')"));
  ok(rs.indexOf('Core.cardLevelIds()') >= 0 && rs.indexOf('Core.levelIds().forEach') < 0,
    'B150 ②：renderLevelSelect 走 cardLevelIds()（不用 levelIds()——隐藏清单生效）');
  ok(engSrc.indexOf("const HIDDEN_LEVELS = ['dalim'];") >= 0,
    'B150 ②：隐藏清单字面在案（引擎侧一行——恢复＝删一行）');
  eq([_strip(LAB_SRC).indexOf('cardLevelIds'), _strip(LAB_SRC).indexOf('C.levelIds()') >= 0].join('｜'), '-1｜true',
    'B150 ②：lab.js 仍用 levelIds()（工具面零改动）');
  ok(engSrc.indexOf("? '选一个关卡开始冒险。你的名字会出现在任务点的对话里。'") >= 0
    && engSrc.indexOf(": '开始冒险吧——你的名字会出现在任务点的对话里。'") >= 0,
    'B150 ③：单卡文案分支与两句逐字（卡数 >1 ⇒ 原文案；卡数 ＝1 ⇒ 「开始冒险吧——…」）');
  ok(engSrc.indexOf('list.forEach(id => box.appendChild(levelCard(id, LEVELS[id])));') >= 0
    && engSrc.indexOf("$('playerName').value = Core.playerName(store);") >= 0,
    'B150 ④：卡片渲染其余部分逐行不变（levelCard 调用＋玩家名行——回归）');
  P('§2-B150 ②④：卡片清单单源／隐藏清单在案／lab 零改动／单卡文案逐字／卡片渲染回归 逐条通过');
}

/* --- 28-4 §2-B151 机检①~④：改动集防回退／规则 lint（含前置断言）／出口自证／dalim 抽查 --- */
{
  const FIVE = [['3', '问阿雅：站里的事——还有没有别的门路？'], ['13', '用万能扳手拧上总阀。'], ['13', '系上绳索，贴着管壁挪过去。'],
    ['13', '捂住口鼻，硬着头皮冲过蒸汽。'], ['17', '按检查表，把三枚逃生舱挨个检查一遍。']];
  const bad5 = [];
  FIVE.forEach(([id, l]) => {
    const hits = D.nodes[id].c.filter(ch => ch.l === l);
    if (!hits.length || hits.some(ch => ch.to !== id)) bad5.push(id + ':' + l);
  });
  eq(bad5.join(','), '', 'B151 ①：改动集 5 条去向＝自指（文案原样匹配——防回退）');
  /* 规则 lint（§2-B151 判据四条；关卡无关代码＋各关地点编号上界；扫全部选项含 battle.winTo／loseTo——机检②「含 battle.loseTo/winTo」；
   * §14-64：事件节点去向＝剧情收束面，不在扫描面——station 以编号上界豁免（22~45）；dalim 事件节点本就无场景归属
   * ⇒ 按机检④「全量四类遍历」不另设豁免（复核：dalim pins 全 ≤30、无节点级 scene 声明——豁免项均落「未解析」类） */
  const targetsOf = ch => [ch.to, ch.battle && ch.battle.winTo, ch.battle && ch.battle.loseTo].filter(Boolean);
  const LOC_MAX = { station: 21, dalim: 30 };   // 地点节点编号上界（两关数据约定：站关 1~21 房/厅；示例关 1~30）
  const lintRooms = (scanMax, evCap) => {
    const L = globalThis.GAME_DATA;   // 当前关卡数据（切关后随 C.selectLevel 变——不得用模块级 D 缓存）
    const bad = [], stat = { self: 0, none: 0, same: 0, cross: 0, skipEvent: 0, opts: 0, nodes: 0 };
    Object.keys(L.nodes).filter(id => /^\d+$/.test(id) && Number(id) <= scanMax).forEach(id => {
      stat.nodes += 1;
      const nS = C.sceneOfNode(id);
      (L.nodes[id].c || []).forEach(ch => {
        targetsOf(ch).forEach(t => {
          stat.opts += 1;
          if (t === id) { stat.self += 1; return; }                                  // 自指 ⇒ 合规
          if (evCap && /^\d+$/.test(t) && Number(t) > evCap) { stat.skipEvent += 1; return; }   // 事件节点＝收束面（station 22~45；§14-64）
          const tS = C.sceneOfNode(t);
          if (!nS || !tS) { stat.none += 1; return; }                                // 任一端无场景归属 ⇒ 合规
          if (nS === tS) { stat.same += 1; return; }                                 // 同场景 ⇒ 合规
          stat.cross += 1;                                                           // 跨场景 ⇒ 文案须命中位移词
          if (!/去|回|爬|出舱|滑|追/.test(ch.l || '')) bad.push(id + '→' + t + ':' + (ch.l || ''));
        });
      });
    });
    return { bad, stat };
  };
  { /* 前置断言两条（§2-B151 机检②） */
    const declBad = [];
    ['station', 'dalim'].forEach(lv => {
      C.selectLevel(lv); const L = globalThis.GAME_DATA;
      Object.keys(L.nodes).forEach(id => { if (L.nodes[id].scene && !L.scenes[L.nodes[id].scene]) declBad.push(lv + ':' + id + '=' + L.nodes[id].scene); });
    });
    C.selectLevel('station');
    eq(declBad.join(','), '', 'B151 ② 前置①：两关逐节点 scene 声明 ∈ 场景表键集（无「声明未注册」）');
    const un = [];
    Object.keys(D.nodes).filter(id => /^\d+$/.test(id) && Number(id) <= LOC_MAX.station).forEach(id =>
      (D.nodes[id].c || []).forEach(ch => targetsOf(ch).forEach(t => { if (!C.sceneOfNode(t)) un.push(id + '→' + t); })));
    eq([un.join(','), Object.keys(D.scenes).length].join('｜'), '｜21',
      'B151 ② 前置②：站关 1~21 全部去向节点 sceneOfNode 解析非空（现盘 100%）＋站关场景清单齐（21 条）');
  }
  { const { bad, stat } = lintRooms(LOC_MAX.station, LOC_MAX.station);
    eq(bad.join(','), '', 'B151 ②：规则 lint 零违规（自指／任一端无归属／同场景／跨场景须命中 去|回|爬|出舱|滑|追——关卡无关）');
    ok(stat.cross >= 10 && stat.self >= 30,
      'B151 ②：四类非空转（' + stat.nodes + ' 地点节点／' + stat.opts + ' 去向判定：自指 ' + stat.self + '／同场景 ' + stat.same +
      '／跨场景 ' + stat.cross + ' 全数命中位移词；事件节点去向豁免 ' + stat.skipEvent + ' 条在案）'); }
  { /* ③ 出口自证（动作留房后仍有明示退出） */
    const s13 = C.newState('normal'); s13.items.push('万能扳手'); C.go(s13, '13');
    const i13 = D.nodes['13'].c.findIndex(ch => (ch.l || '').indexOf('用万能扳手拧上总阀') >= 0);
    C.move(s13, C.choose(s13, i13));
    eq([s13.loc, C.visibleChoices(s13).some(x => (x.label || '').indexOf('先回底层大厅') >= 0)].join('｜'), '13｜true',
      'B151 ③：13 关阀后留房（loc 仍 13）且「先回底层大厅」出口可见可点');
    const s17 = C.newState('normal'); C.go(s17, '17');
    const i17 = D.nodes['17'].c.findIndex(ch => (ch.l || '').indexOf('检查表') >= 0);
    C.move(s17, C.choose(s17, i17));
    eq([s17.loc, C.visibleChoices(s17).some(x => x.ok && (x.label || '').indexOf('回') >= 0)].join('｜'), '17｜true',
      'B151 ③：17 检查后留房且「回底层大厅」出口可点');
    const s3 = C.newState('normal'); C.go(s3, '3');
    const i3 = D.nodes['3'].c.findIndex(ch => (ch.l || '').indexOf('问阿雅') >= 0);
    C.move(s3, C.choose(s3, i3));
    eq([s3.loc, C.visibleChoices(s3).some(x => x.ok && (x.label || '').indexOf('回') >= 0)].join('｜'), '3｜true',
      'B151 ③：3 问阿雅后留房（医务室）且「回中央大厅」出口可点'); }
  C.selectLevel('dalim');
  { const { bad, stat } = lintRooms(Infinity, null);
    eq(bad.join(','), '', 'B151 ④：示例关（dalim）同规则全量 ⇒ 零命中（' + Object.keys(globalThis.GAME_DATA.nodes).length + ' 节点／地点面 ' + stat.nodes +
      ' 节点：自指 ' + stat.self + '／同场景 ' + stat.same + '／跨场景 ' + stat.cross + ' 全数命中位移词；未解析豁免 ' + stat.none +
      ' 条＋事件节点去向豁免 ' + stat.skipEvent + ' 条——逐条计数在案；判据不写死场景 id）'); }
  C.selectLevel('station');
  P('§2-B151 ①~④：改动集 5 条／规则 lint 零违规（含前置）／出口自证（13・17・3）／dalim 零命中 逐条通过');
}

/* --- 28-5 §2-B152 机检①~⑧：done 保留／沉底／全勾未完成／渲染契约／签名／空态／回归 --- */
{
  const T = s => C.guideTasks(s);
  eq(T(S10({ visited: { '6': true } })).map(t => typeof t.done).join(','), 'boolean,boolean',
    'B152 ①：每条输出含 done 布尔（两条可见任务）');
  const sDone = S10({ learned: { '反应堆已重启': true }, visited: { '6': true } });
  eq(T(sDone).map(t => t.id + ':' + t.done).join(','), 't-power:false,t-reactor:true',
    'B152 ②③（老板⑤正断言）：done 保留（t-reactor 仍在）＋沉底（未完成 t-power 在前）');
  ok(T(sDone).find(t => t.id === 't-reactor').needs.length > 0,
    'B152 ②：已完成任务的全部条目仍列出（老板原话「为什么要把其它的隐藏呀」）');
  { const s12 = S10({ visited: { '6': true }, items: ['控制芯片', '冷却剂罐', '站长授权卡'], learned: { '全站复电': true } });
    const tr = T(s12).find(t => t.id === 't-reactor');
    eq([tr.needs.map(n => n.done).join(','), tr.done, T(s12).some(t => t.id === 't-reactor')].join('｜'),
      'true,true,true,true｜false｜true', 'B152 ④（表 b）：全勾未完成——四条全 ☑、done:false、条目仍出'); }
  ok(engSrc.indexOf("tt.className = 'tdTitle' + (t.done ? ' done' : '');") >= 0
    && engSrc.indexOf("s.textContent = '✓ 已完成';") >= 0 && uiCssSrc.indexOf('.tdTitle.done') >= 0
    && engSrc.indexOf("d.className = 'guideLine tdNeed' + (n.done ? ' done' : '');") >= 0,
    'B152 ⑤：渲染契约（.tdTitle.done＋「✓ 已完成」＋CSS 在案；need 逐项渲染不变）');
  { const s = S10({ visited: { '6': true } });
    C.markGuideSeen(s);
    s.learned['反应堆已重启'] = true;
    eq(C.guideHasNew(s), true, 'B152 ⑥：完成态翻转（t-reactor done 假→真）⇒ 有更新（签名③段含任务 done 位）');
    C.markGuideSeen(s);
    eq(C.guideHasNew(s), false, 'B152 ⑥：打开即清（落签名 ⇒ 无更新）');
    ok(/parts\.push\('T:' \+ t\.id \+ ':' \+ \(t\.done \? '1' : '0'\)/.test(engSrc),
      'B152 ⑥：签名③段＝`T:<id>:<任务done>:…`（源码契约）'); }
  ok(C.guideTasks(C.newState('normal')).length === 0
    && /if \(!tasks\.length\) nb\.appendChild\(guideDimLine\(GUIDE_TASKS_EMPTY\)\);/.test(engSrc),
    'B152 ⑦：空态句口径不变（真无可见任务才出；新局零任务）');
  ok(engSrc.indexOf('const g = Core.guideNotes(st);') >= 0 && D.meta.targets.length === 6,
    'B152 ⑧：回归——①块／②块走既有单源；targets 六行不动');
  C.selectLevel('dalim');
  eq(C.guideTasks(C.newState('normal')).length, 0, 'B152 ⑧：dalim（无 tasks）⇒ ③块空态照旧');
  C.selectLevel('station');
  eq([_strip(PLAY_SRC).indexOf('guideTasks') < 0, _strip(LAB_SRC).indexOf('guideTasks') < 0].join(','), 'true,true',
    'B152 ⑧：--player／lab 零接入（沿既有口径）');
  P('§2-B152 ①~⑧：done 布尔／保留＋沉底／全勾未完成／渲染契约／签名／空态／回归 逐条通过');
}

/* --- 28-6 §2-B153 机检①~⑥：两组序／幂等／旧档补序／渲染契约・纯读／回归 --- */
{
  /* ① 线索序（key 反序；guideClues 输出不变） */
  const sc = S10({}); sc.learned = { 甲: true, 乙: true, 丙: true };
  eq([C.guideNotes(sc).clues.map(x => x.key).join(','), C.guideClues(sc).join(',')].join('｜'), '丙,乙,甲｜甲,乙,丙',
    'B153 ①：线索组＝learned 键序反序（新在前）；guideClues 输出不变（CLI 口径）');
  /* ② 记录序（分三次 trackRecords：rec-01／rec-06／rec-13 逐个出现） */
  const r = S10({ visited: { '1': true } });
  C.trackRecords(r);
  eq(r.recOrder.join(','), 'rec-01', 'B153 ②：首次出现（到过 1 ⇒ rec-01）入列');
  r.visited['5'] = true; C.trackRecords(r);
  r.visited['13'] = true; C.trackRecords(r);
  eq([r.recOrder.join(','), C.guideNotes(r).records.map(x => x.id).join(',')].join('｜'), 'rec-01,rec-06,rec-13｜rec-13,rec-06,rec-01',
    'B153 ②：recOrder＝加入序；记录组＝反序（最新在前）');
  /* ③ 幂等＋cond 不成立不入列 */
  C.trackRecords(r); C.trackRecords(r);
  eq(r.recOrder.join(','), 'rec-01,rec-06,rec-13', 'B153 ③：重复 trackRecords 不重复追加、不改序（幂等）');
  const r2 = S10({ visited: { '1': true } }); C.trackRecords(r2);
  eq([r2.recOrder.indexOf('rec-06'), r2.recOrder.indexOf('rec-13')].join('｜'), '-1｜-1',
    'B153 ③：cond 不成立的条目不入列（未到过 5／13）');
  /* ④ 旧档补序（未入列者按数组序垫底） */
  const old153 = C.normalizeState({ diff: 'normal', loc: '1', coins: 10, oxygen: 90, items: [], visited: { '1': true, '13': true }, done: {}, learned: {}, chDone: {}, hist: [] });
  eq(JSON.stringify(old153.recOrder), '[]', 'B153 ④：normalizeState 补 recOrder 缺省（旧档＝空数组）');
  eq(C.guideNotes(old153).records.map(x => x.id).join(','), 'rec-01,rec-13',
    'B153 ④：未入列者按数组序垫底（节点号序——求值不抛）');
  C.trackRecords(old153);
  eq([old153.recOrder.join(','), C.guideNotes(old153).records.map(x => x.id).join(',')].join('｜'), 'rec-01,rec-13｜rec-13,rec-01',
    'B153 ④：旧档首次落档按已见顺序补入 ⇒ 反序生效（一次性，披露）');
  /* ⑤ 渲染契约＋纯读 */
  ok(engSrc.indexOf("guideGroupHead('线索 · ' + g.clues.length)") >= 0 && engSrc.indexOf("guideGroupHead('记录 · ' + g.records.length)") >= 0,
    'B153 ⑤：组标题串含条数（`线索 · n`／`记录 · n`——源码契约）');
  ok(/#guideClues \{ max-height: 40vh; overflow-y: auto; \}/.test(uiCssSrc) && /@media \(max-width: 900px\)/.test(uiCssSrc),
    'B153 ⑤：#guideClues 定高滚动在案（40vh；窄屏 36vh）');
  { const idx = engSrc.indexOf('const save = () => {');
    ok(engSrc.slice(idx, idx + 120).indexOf('Core.trackRecords(st);') >= 0,
      'B153 ⑤：save() 头部调用 Core.trackRecords(st)（源码契约）'); }
  { const p = S10({ visited: { '1': true, '5': true } });
    const snap = JSON.stringify(p);
    C.guideNotes(p); C.guideSig(p); C.guideHasNew(p); C.guideClues(p);
    eq(JSON.stringify(p), snap, 'B153 ⑤：guideNotes 纯读（求值前后状态不变——仅 trackRecords 写）'); }
  /* ⑥ 回归 */
  eq([C.guideTarget(S10({})).length > 0, engSrc.indexOf("n.className = 'giNew';") >= 0,
    engSrc.indexOf("state: n.done ? (done ? 'done' : 'undone') : null") >= 0].join(','), 'true,true,true',
    'B153 ⑥：「新」标与态标照旧（isNew 由 gSeen 令牌决定，与排序无关）＋①块输出不变');
  C.selectLevel('dalim');
  eq([C.guideNotes(C.newState('normal')).records.length, C.guideNotes(C.newState('normal')).clues.length].join('/'), '0/0',
    'B153 ⑥：dalim（无 notes）⇒ ②块空态照旧');
  C.selectLevel('station');
  eq([_strip(PLAY_SRC).indexOf('guideNotes') < 0, _strip(LAB_SRC).indexOf('guideNotes') < 0].join(','), 'true,true',
    'B153 ⑥：--player／lab 零接入（沿既有口径）');
  P('§2-B153 ①~⑥：两组序／幂等／旧档补序／渲染契约・纯读／回归 逐条通过');
}

/* ============ 汇总 ============ */
console.log('');
console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项。');
process.exit(fail ? 1 : 0);
