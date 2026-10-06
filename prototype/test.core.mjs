// 核心逻辑自测：node prototype/test.core.mjs
// 覆盖：数据完整性 / 完整通关路径 / 战斗 / 商店 / 出售 / 抽奖奇偶 / 密码线索 / 偷窃 / 返回 / 区域切换（v1.2）
//       + 货币底线（v1.3：金币钳 0 / 身无分文 / 购买守卫）+ 人物表与触发点（v1.3）+ DOM id 自检（v1.3）
//       + 引擎 v0.3 新钩子 E1~E8（fail:null / 序章 / 道具正文 / hint / lockText / once+chDone / say / tIf）
//       + B07：道具介绍 Core.itemDesc（E3 同口径——非字符串或空 ⇒ null；§2-B140）
// ⚠ v0.2：关卡数据由 prototype/data.js 迁到 prototype/levels/dalim.js —— 本文件只改这一行加载路径，
//         其余 525 项断言一字未动（引擎 v0.2 对示例关卡保持完全兼容）。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(dir, 'levels', 'dalim.js'), 'utf8') + '\n' + fs.readFileSync(path.join(dir, 'engine.js'), 'utf8');
vm.runInThisContext(code, { filename: 'bundle.js' });
const D = globalThis.GAME_DATA;
const C = globalThis.GameCore;

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.error('  ✗ FAIL:', msg); } }
function eq(a, b, msg) { ok(a === b, msg + '（实际 ' + JSON.stringify(a) + '，期望 ' + JSON.stringify(b) + '）'); }

/* ---------- 1. 数据完整性 ---------- */
for (const [id, node] of Object.entries(D.nodes)) {
  (node.c || []).forEach((ch, i) => {
    const targets = [];
    if (ch.to) targets.push(ch.to);
    if (ch.battle) targets.push(ch.battle.winTo, ch.battle.loseTo);
    if (ch.random) targets.push(...ch.random);
    if (ch.toIf) targets.push(...ch.toIf.map(x => x.to));
    targets.forEach(t => ok(!!D.nodes[t], `节点 ${id} 选项#${i} 目标「${t}」不存在`));
    ['gain', 'lose'].forEach(k => (ch.fx && ch.fx[k] || []).forEach(it => ok(!!D.items[it], `节点 ${id} fx.${k}「${it}」未在道具表`)));
    if (ch.cond && ch.cond.item) ok(!!D.items[ch.cond.item], `节点 ${id} cond.item「${ch.cond.item}」`);
  });
  ['gain', 'lose'].forEach(k => (node.en && node.en[k] || []).forEach(it => ok(!!D.items[it], `节点 ${id} en.${k}「${it}」`)));
  (node.en && node.en.pass && node.en.pass.gain || []).forEach(it => ok(!!D.items[it], `节点 ${id} en.pass.gain「${it}」`));
  (node.shop ? node.shop.stock : []).forEach(it => ok(!!D.items[it], `节点 ${id} 商店「${it}」`));
}
Object.entries(D.scenes).forEach(([sid, sc]) => {
  Object.keys(sc.pins).forEach(id => {
    const [x, y] = sc.pins[id];
    ok(!!D.nodes[id], `编号点 ${id} 没有对应节点`);
    ok(x >= 0 && x < sc.width && y >= 0 && y < sc.height, `编号点 ${id} 坐标 [${x},${y}] 不在 ${sid} 图内（${sc.width}×${sc.height}）`);
  });
});
eq(Object.keys(D.nodes).filter(k => !D.nodes[k].hidden).length, 57, '主节点数 = 57');
eq(Object.keys(D.scenes.market.pins).length, 16, '一楼编号点 = 16');
eq(Object.keys(D.scenes.basement.pins).length, 14, '负一层编号点 = 14');
const pinUnion = new Set([...Object.keys(D.scenes.market.pins), ...Object.keys(D.scenes.basement.pins)]);
eq(pinUnion.size, 30, '两场景编号合计 30 个（无重复）');
const pinMissing = [];
for (let i = 1; i <= 30; i++) if (!pinUnion.has(String(i))) pinMissing.push(i);
eq(pinMissing.join(','), '', '两图合起来覆盖 1~30 全部编号');
eq(D.scenes.basement.image, '../images/dd_sw_5_basement.jpg', '负一层背景图路径来自关卡数据');

/* 素材校验（v1.2）：关卡数据声明的宽高必须和真实图片一致——对不上，编号会整体错位 */
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
for (const [sid, sc] of Object.entries(D.scenes)) {
  const p = path.join(dir, sc.image);
  ok(fs.existsSync(p), `场景图文件存在：${sid}（${sc.image}）`);
  const sz = fs.existsSync(p) ? jpegSize(p) : null;
  eq(sz && sz.w + '×' + sz.h, sc.width + '×' + sc.height, `${sid} 场景图实际尺寸与关卡数据声明一致`);
}

/* ---------- 2. 完整通关路径（结局 41 → 57） ---------- */
let st = C.newState('normal');
eq(st.coins, 15, '中等开局 15 枚（B147 三档：简单 20／中等 15／困难 10）');
eq(C.newState('hard').coins, 10, '困难模式开局 10 枚');

function pick(id, labelPart) {
  const idx = D.nodes[id].c.findIndex(ch => ch.l.includes(labelPart));
  if (idx < 0) throw new Error(`找不到选项：${id} / ${labelPart}`);
  if (!C.condOk(st, D.nodes[id].c[idx].cond)) throw new Error(`选项条件不满足：${id} / ${labelPart}`);
  const res = C.choose(st, idx);
  (res.log || []);
  if (res.back) C.goBack(st); else C.go(st, res.to);
}
C.go(st, '1');
eq(st.loc, '1', '开局在停车场');
pick('1', '茂密的灌木丛'); eq(st.loc, '33', '1→33');
ok(C.hasItem(st, '蓄电池'), '获得蓄电池');
pick('33', '去大里姆的入口'); eq(st.loc, '9', '33→9');
pick('9', '汉堡包店'); eq(st.loc, '24', '9→24');
pick('24', '去厨房'); eq(st.loc, '13', '24→13');
ok(C.hasItem(st, '汉堡包'), '获得汉堡包');
pick('13', '被赶出去'); eq(st.loc, '24', '13→24');
pick('24', '把汉堡包给他'); eq(st.loc, '37', '24→37');
ok(st.learned['电梯密码'], '学会电梯密码 956');
pick('37', '回到汉堡包店'); eq(st.loc, '24', '37→24');
pick('24', '去大里姆的入口'); eq(st.loc, '9', '24→9（汉堡包已给出）');
pick('9', '去大厅'); eq(st.loc, '28', '9→28');
eq(st.coins, 14, '大厅被扒手偷走 1 枚');
pick('28', '去走廊'); eq(st.loc, '11', '28→11');
pick('11', '去打印店'); eq(st.loc, '21', '11→21');
C.buy(st, '通行证', 2); ok(C.hasItem(st, '通行证'), '买到通行证');
eq(st.coins, 12, '买通行证后 12 枚');
pick('21', '不买，去走廊'); eq(st.loc, '11', '21→11');
pick('11', '自动取款机'); eq(st.loc, '26', '11→26');
pick('26', '电梯密码'); eq(st.loc, '56', '26→56（用密码）');
pick('56', '去负一层电梯口'); eq(st.loc, '14', '56→14');
pick('14', '拳击俱乐部'); eq(st.loc, '4', '14→4');
pick('4', '去休闲区'); eq(st.loc, '29', '4→29');
pick('29', '给他 1 枚'); eq(st.loc, '29W', '29 付钱通行');
eq(st.coins, 11, '付给拉克洛 1 枚');
pick('29W', '去维克商店'); eq(st.loc, '16', '29W→16');
C.buy(st, '激光锯', 3); eq(st.coins, 8, '买激光锯后 8 枚');
pick('16', '去休闲区'); eq(st.loc, '29', '16→29');
pick('29', '给他 1 枚'); eq(st.coins, 7, '再付 1 枚');
pick('29W', '去拳击俱乐部'); eq(st.loc, '4', '29W→4');
pick('4', '去负一层电梯口'); eq(st.loc, '14', '4→14');
pick('14', '乘坐电梯'); eq(st.loc, '56', '14→56');
pick('56', '去走廊'); eq(st.loc, '11', '56→11');
pick('11', '去大厅'); eq(st.loc, '28', '11→28');
eq(st.coins, 6, '第二次被扒手偷（余 6 枚）');
pick('28', '去武器和伪装用品专卖店'); eq(st.loc, '5', '28→5');
C.buy(st, '万能钥匙', 2); eq(st.coins, 4, '买万能钥匙后 4 枚');
pick('5', '然后，去大厅'); eq(st.loc, '28', '5→28');
eq(st.coins, 3, '第三次被扒手偷（余 3 枚）');
pick('28', '去走廊'); eq(st.loc, '11', '28→11');
pick('11', '万能钥匙去发货区'); eq(st.loc, '3', '11→3');
pick('3', '激光锯锯开铁丝网'); eq(st.loc, '20', '3→20（用激光锯）');
pick('20', '去存放电子废弃物的仓库'); eq(st.loc, '6', '20→6');
ok(C.hasItem(st, '蓄电池'), '有蓄电池');
pick('6', '用蓄电池重启'); eq(st.loc, '41', '6→41');
pick('41', '拿着折页'); eq(st.loc, '57', '41→57');
ok(!!D.nodes[st.loc].win, '到达通关节点');
ok(st.coins >= 1 && !st.bankrupt, '全关按原购买顺序通关：新规（买完必须留 1 枚）不影响这条路线（结束时余 ' + st.coins + ' 枚）');

/* ---------- 3. 战斗机制 ---------- */
st = C.newState('normal');
C.go(st, '8');
let res = C.choose(st, 0);
eq(res.to, '39', '空手打克斯托（武力6）必输');
st.items = ['武器', '机械手臂', '药水'];   // 2+3+1 = 6
C.go(st, '8');
res = C.choose(st, 0);
eq(res.to, '8W', '武力值 6 ≥ 6 可以获胜');
st = C.newState('normal'); st.items = ['方糖'];
C.go(st, '31');
res = C.choose(st, 0);
eq(res.to, '39', '有方糖但武力值为 0——仍会输（对应原书）');
st.items = ['方糖', '药水'];  // 武力 1 ≥ 1
C.go(st, '31');
res = C.choose(st, 0);
eq(res.to, '42', '有方糖且武力值 1，打败削弱后的马克斯');
st = C.newState('normal'); st.items = ['武器'];  // 武力 2 < 3
C.go(st, '31');
eq(C.choose(st, 0).to, '39', '武力 2 < 3，打不过马克斯');
st.items = ['武器', 'T形棍']; // 3 ≥ 3
eq(C.choose(st, 0).to, '42', '武力 3 ≥ 3，击败马克斯');

/* ---------- 4. 商店 / 出售 ---------- */
st = C.newState('normal');
C.go(st, '5');
let log = C.buy(st, '防毒面具', 2);
ok(C.hasItem(st, '防毒面具') && st.coins === 13, '购买成功并扣款');
log = C.buy(st, '防毒面具', 2);
ok(log.length > 0 && st.coins === 13, '重复购买被拒绝（不扣款）');
st.coins = 1;
C.buy(st, '万能钥匙', 2);
ok(!C.hasItem(st, '万能钥匙'), '钱不够买不了');
st.items = ['饼干', '奖牌']; st.coins = 0;
C.sell(st, '饼干');
ok(!C.hasItem(st, '饼干') && st.coins === 1, '卖出普通道具 +1 枚');
C.sell(st, '奖牌');
ok(C.hasItem(st, '奖牌'), '红框道具（奖牌）不能卖');

/* ---------- 5. 抽奖奇偶 / 密码 / 偷窃 / 返回 ---------- */
st = C.newState('normal');
st.items = ['饼干', '药水'];   // 2 件 = 偶数
st.coins = 5; C.go(st, '36');
ok(C.hasItem(st, '奖牌') && st.coins === 7, '偶数道具数中奖（+2 枚 +奖牌）');
st.items = ['饼干']; st.coins = 12; C.go(st, '46');
ok(!C.hasItem(st, '奖牌'), '偶数金币数不中奖');
st.coins = 13; C.go(st, '46');
ok(C.hasItem(st, '奖牌') && st.coins === 15, '奇数金币数中奖');

st = C.newState('normal');
C.go(st, '28');
eq(st.coins, 14, '无防盗绳：每次到大厅都被偷 1 枚');
st.items = ['防盗绳']; C.go(st, '28');
eq(st.coins, 14, '有防盗绳：不再被偷');

st = C.newState('normal');
C.go(st, '12');
const r2 = C.choose(st, 0);
ok(r2.to === '36' || r2.to === '46', '抽奖随机去 36 或 46');
eq(st.coins, 14, '抽奖花掉 1 枚');

st = C.newState('normal');
C.go(st, '20'); C.go(st, '45');
const p2 = C.choose(st, 0);
ok(p2.back === true, '出售铺可以返回');
C.goBack(st);
eq(st.loc, '20', '返回上一个地点');

st = C.newState('normal');
C.go(st, '14');
const usable = D.nodes['14'].c.filter(ch => C.condOk(st, ch.cond));
eq(usable.length, 1, '无通行证到 14 号：只有一条路');
ok(usable[0].to === '39', '……那就是被警卫抓住（失败）');

st = C.newState('normal');
C.go(st, '22');
const u2 = D.nodes['22'].c.filter(ch => C.condOk(st, ch.cond));
eq(u2[0].to, '50', '没防毒面具进毒仓库 = 失败');
st.items = ['防毒面具'];
const u3 = D.nodes['22'].c.filter(ch => C.condOk(st, ch.cond));
eq(u3[0].to, '6', '有防毒面具可以安全上楼');

st = C.newState('normal');
C.go(st, '52');
ok(C.hasItem(st, '毛绒玩具'), '52 号捡到毛绒玩具');
C.go(st, '7');
const u4 = D.nodes['7'].c.filter(ch => C.condOk(st, ch.cond));
eq(u4.length, 1, '带毛绒玩具到海洋球池：只有一个可用选项');
eq(u4[0].to, '35', '……把玩具给小姑娘');

/* ---------- 6. 腕带价格 → 补偿卡 ---------- */
st = C.newState('normal');
st.coins = 10;
log = C.buySticker(st, 2);
eq(st.wristband, 2, '腕带价格 2');
eq(st.coins, 8, '扣 2 枚');
st.items = ['方糖'];
C.go(st, '47');
C.choose(st, 0);
eq(st.coins, 12, '补偿卡 = 2×腕带价格（+4 枚）');

/* ---------- 7. 可达编号 / 选项→地图对应（v1.1） ---------- */
st = C.newState('normal');
C.go(st, '1');
let reach = C.reachablePins(st);
eq(Object.keys(reach).length, 0, '停车场出发：33/43/52 在图上没有编号点，不点亮');
C.go(st, '9');
reach = C.reachablePins(st);
ok(!!reach['28'] && !!reach['24'], '入口（9）可达：大厅 28、汉堡包店 24');
eq(Object.keys(reach).length, 2, '入口只有两个可达编号');
C.go(st, '11');
reach = C.reachablePins(st);
ok(!!reach['21'] && !!reach['2'] && !!reach['7'] && !!reach['26'] && !!reach['23'] && !!reach['28'], '走廊可达 6 个编号');
ok(!reach['3'], '没万能钥匙时，发货区（3）不亮');
st.items.push('万能钥匙');
reach = C.reachablePins(st);
ok(!!reach['3'], '拿到万能钥匙后，发货区（3）亮起');
st = C.newState('normal'); C.go(st, '14');
reach = C.reachablePins(st);
eq(Object.keys(reach).length, 0, '没通行证到电梯口：无可达编号（唯一去向是失败 39）');
st.items.push('通行证');
reach = C.reachablePins(st);
eq(Object.keys(reach).sort().join(','), '19,4', '有通行证到电梯口：可达编号恰为 4 / 19（都印在负一层图上）');
st = C.newState('normal'); C.go(st, '20'); C.go(st, '45');
reach = C.reachablePins(st);
ok(!!reach['20'], '出售铺的"返回"点亮来路 20');
st = C.newState('normal'); C.go(st, '39');
eq(Object.keys(C.reachablePins(st)).length, 0, '失败节点上没有任何可走编号');

// 目标提示数据
const t34 = C.choiceTargets(D.nodes['34'].c[0]);
ok(t34.to.indexOf('47') >= 0 && t34.to.indexOf('51') >= 0, '34 号腕带选项指向 47/51');
const t3 = C.choiceTargets(D.nodes['3'].c[0]);
ok(t3.win[0] === '3W' && t3.lose[0] === '39', '战斗选项记录胜负去向');
const t12 = C.choiceTargets(D.nodes['12'].c[0]);
ok(t12.random.length === 2, '抽奖选项记录 36/46 随机去向');
const t45 = C.choiceTargets(D.nodes['45'].c[0]);
ok(t45.back === true, '返回类选项被识别');

/* ---------- 8. 区域归属 / 区域切换（v1.2） ---------- */
eq(C.sceneOfNode('1'), 'market', '1 号印在一楼图上');
eq(C.sceneOfNode('14'), 'basement', '14 号印在负一层图上');
eq(C.sceneOfNode('56'), null, '56 号电梯：图上无编号 → 无区域归属');
eq(C.sceneOfNode('39'), null, '39 号（失败结局）图上无编号 → 无区域归属');
eq(C.sceneOf({ scene: 'basement' }), 'basement', 'sceneOf 取 st.scene');
eq(C.sceneOf({}), 'market', 'sceneOf 无 scene 字段 → 兜底一楼');
eq(C.sceneOf({ scene: '不存在' }), 'market', 'sceneOf 遇到未知场景 → 兜底一楼');
eq(C.newState('normal').scene, 'market', '开局区域 = 一楼（起始 1 号印在市场图上）');

st = C.newState('normal');
C.go(st, '26');
eq(st.scene, 'market', '26 号自动取款机在一楼');
st.learned['电梯密码'] = true;
pick('26', '电梯密码'); eq(st.loc, '56', '26→56（用密码）');
eq(st.scene, 'market', '56 号电梯：无编号 → 保持一楼背景');
pick('56', '去负一层电梯口'); eq(st.loc, '14', '56→14');
eq(st.scene, 'basement', '56→14：跨区切到负一层');
st.items = ['通行证'];
pick('14', '乘坐电梯'); eq(st.loc, '56', '14→56');
pick('56', '去走廊'); eq(st.loc, '11', '56→11');
eq(st.scene, 'market', '14→56→11：切回一楼');

st = C.newState('normal');
st.items = ['防毒面具'];              // 免得吸毒烟失败
C.go(st, '22');
eq(st.scene, 'basement', '22 号有毒仓库在负一层');
pick('22', '上楼去电子废弃物仓库'); eq(st.loc, '6', '22→6');
eq(st.scene, 'market', '22→6：切回一楼');

st = C.newState('normal');
C.go(st, '4');
eq(st.scene, 'basement', '4 号拳击俱乐部在负一层');
pick('4', '安静地观看一场拳击比赛'); eq(st.loc, '34', '4→34');
eq(st.scene, 'basement', '34 号图上无编号 → 仍留在负一层');

/* 可达编号只在当前区域点亮 */
st = C.newState('normal'); st.items = ['通行证'];
C.go(st, '14');
reach = C.reachablePins(st);
eq(Object.keys(reach).sort().join(','), '19,4', '负一层电梯口（有通行证）可达编号 = 4 / 19');
Object.keys(reach).forEach(id => ok(!!D.scenes.basement.pins[id], '可达编号 ' + id + ' 属于当前区域（负一层）'));
st = C.newState('normal'); C.go(st, '6');
reach = C.reachablePins(st);
ok(!!reach['20'], '一楼电子废弃物仓库：可达垃圾场 20（一楼编号）点亮');
ok(!reach['22'], '下楼通往的 22 号印在另一张图上 → 不点亮');

/* ---------- 9. 编号点击 → 选项匹配（v1.2 修复：back 类） ---------- */
st = C.newState('normal');
C.go(st, '20'); C.go(st, '45');
eq(C.pinChoiceIndex(st, '20'), 0, '出售铺点击来路编号 20 → 命中“返回”选项（此前点亮却点不动）');
const res45 = C.choose(st, C.pinChoiceIndex(st, '20'));
ok(res45.back === true, '……执行的确实是返回类选项');
C.goBack(st);
eq(st.loc, '20', '……点击后成功回到 20 号');

st = C.newState('normal');
C.go(st, '11');
eq(C.pinChoiceIndex(st, '21'), 0, '走廊点击 21 号 → 去打印店');
eq(C.pinChoiceIndex(st, '23'), 4, '走廊点击 23 号 → 去卫生间');
eq(C.pinChoiceIndex(st, '999'), -1, '没有对应选项的编号 → -1');
eq(C.pinChoiceIndex(C.newState('normal'), '1'), -1, '还没有落脚点时 → -1');

st = C.newState('normal');
C.go(st, '11'); C.go(st, '48');
eq(C.pinChoiceIndex(st, '11'), 2, '取款机（无卡）点击来路编号 → 走“不取了，返回”选项');
st.items = ['会员卡'];
eq(C.pinChoiceIndex(st, '11'), 0, '取款机（有会员卡）→ 优先走“用会员卡取钱”选项');

/* ---------- 10. 旧存档兜底（v1.2 之前的存档没有 scene 字段） ---------- */
// 与 engine.js resumeGame 同一条兜底规则：st.scene = Core.sceneOfNode(st.loc) || 'market'
const oldSave = C.newState('normal'); oldSave.loc = '14'; delete oldSave.scene;
oldSave.scene = C.sceneOfNode(oldSave.loc) || 'market';
eq(oldSave.scene, 'basement', '旧存档停在 14 号 → 兜底推断为负一层');
const oldSave2 = C.newState('normal'); oldSave2.loc = '56'; delete oldSave2.scene;
eq(C.sceneOfNode(oldSave2.loc) || 'market', 'market', '旧存档停在 56 号（无编号）→ 兜底一楼');

/* ---------- 11. 货币底线（v1.3）：金币钳 0 / 身无分文 / 购买守卫 ---------- */
/* ① 进 28 号被偷到 0（验收实测 ① 的脚本版） */
st = C.newState('normal');
st.coins = 1;
C.go(st, '28');
eq(st.coins, 0, 'coins=1 无防盗绳进大厅：被偷后钳在 0（不会出现 -1）');
eq(st.bankrupt, true, '……降到 0 → 判「身无分文」闯关失败');
const f28 = C.takeFlash(st);
ok(f28 && f28.kind === 'theft' && f28.thief === '戈高' && f28.amount === 1, '……给出「被偷」事件（戈高 / 1 枚），供警示条使用');
eq(C.takeFlash(st), null, '……事件取走后不重复提示');
eq(Object.keys(C.reachablePins(st)).length, 0, '……身无分文后地图上没有可走的编号（只能重开）');
st.coins = 9;
eq(C.choose(st, 0).to, undefined, '……身无分文后也不再接受选项（choose 直接返回空）');

/* ② 偷得比身上多：只扣到 0 */
st = C.newState('normal');
st.coins = 1;
C.go(st, '27');
eq(st.coins, 0, '27 号（正文：偷 2 枚）身上只有 1 枚 → 钳在 0');
const f27 = C.takeFlash(st);
ok(f27 && f27.kind === 'theft' && f27.thief === '扒手' && f27.amount === 1, '……警示条按实际被拿走的 1 枚算（不是正文的 2 枚）');

/* ③ 有防盗绳 → 挡下（绿色条），一枚不扣 */
st = C.newState('normal');
st.items = ['防盗绳']; st.coins = 5;
C.go(st, '28');
eq(st.coins, 5, '有防盗绳：一枚也没被偷');
ok(!st.bankrupt, '……不会判失败');
const fb = C.takeFlash(st);
ok(fb && fb.kind === 'blocked' && fb.thief === '戈高' && fb.guard === '防盗绳', '……给出「被挡下」事件（防盗绳挡住戈高）');

/* ④ 选项扣钱到 0（29 号给掉最后一枚） */
st = C.newState('normal');
st.coins = 1;
C.go(st, '29');
C.choose(st, 0);
eq(st.coins, 0, '29 号给拉克洛最后一枚 → 钳在 0');
eq(st.bankrupt, true, '……选项扣钱到 0 同样判闯关失败');

/* ⑤ 正常花销不误判 */
st = C.newState('normal');
st.coins = 5;
C.go(st, '29');
C.choose(st, 0);
eq(st.coins, 4, '付 1 枚还剩 4 枚');
ok(!st.bankrupt, '……没到 0 不会失败');

/* ⑥ 购买守卫（验收实测 ② 的脚本版）：恰好花光被拒 / 差 1 枚被拒 / 留得下 1 枚可以买 */
st = C.newState('normal');
st.coins = 2;
log = C.buy(st, '防毒面具', 2);
ok(!C.hasItem(st, '防毒面具') && st.coins === 2, '恰好花光（2 枚买 2 枚）被拒，且不扣款');
ok(log.join('｜').indexOf('身无分文') >= 0, '……理由说的是「花光就身无分文」：' + log.join('｜'));
st.coins = 3;
log = C.buy(st, '防毒面具', 2);
ok(C.hasItem(st, '防毒面具') && st.coins === 1, '留得下 1 枚 → 可以买（3 枚买 2 枚）');
st = C.newState('normal'); st.coins = 1;
log = C.buy(st, '万能钥匙', 2);
ok(!C.hasItem(st, '万能钥匙'), '差 1 枚（1 枚买 2 枚）被拒');
ok(log.join('｜').indexOf('不够') >= 0, '……理由是「钱不够」而不是身无分文：' + log.join('｜'));

/* ⑦ 腕带（34 号 prices）走同一条守卫 */
st = C.newState('normal');
st.coins = 2;
log = C.buySticker(st, 2);
eq(st.wristband, 0, '腕带：恰好花光（2 枚买 2 枚）被拒');
ok(log.join('｜').indexOf('身无分文') >= 0, '……理由同样提到身无分文：' + log.join('｜'));
st.coins = 3;
log = C.buySticker(st, 2);
eq(st.wristband, 2, '腕带：留得下 1 枚 → 可以买');
eq(st.coins, 1, '……扣款后正好剩 1 枚');

/* ⑧ payReason：DOM 按钮禁用与核心判定共用的唯一入口 */
eq(C.payReason({ coins: 3 }, 2), '', 'payReason：可以买 → 空字符串');
eq(C.payReason({ coins: 2 }, 2), '买完就剩 0 枚萨瓦币——身无分文会闯关失败，不能买', 'payReason：恰好花光（B77：金额带币种名）');
eq(C.payReason({ coins: 1 }, 2), '萨瓦币不够（需要 2 枚萨瓦币，还差 1 枚）', 'payReason：钱不够（B77 币种名＋B78 数字式：还差 N 枚）');

/* ---------- 12. 人物表 / 人物触发点（v1.3） ---------- */
eq(Object.keys(D.characters).length, 8, '人物表 8 位');
eq(D.charOrder.length, 8, 'charOrder 列出 8 位（图鉴顺序）');
eq(new Set(D.charOrder).size, 8, 'charOrder 无重复');
D.charOrder.forEach(cid => ok(!!D.characters[cid], 'charOrder 里的「' + cid + '」在人物表中'));
Object.entries(D.characters).forEach(([cid, ch]) => {
  ok(!!ch.name, `人物 ${cid} 有名称`);
  ok(typeof ch.title === 'string', `人物 ${cid} 的 title 是字符串（小姑娘可为空）`);
  ok(typeof ch.bio === 'string' && ch.bio.length > 0, `人物 ${cid} 有介绍原文`);
  const sc = D.scenes[ch.spot && ch.spot.scene];
  ok(!!sc, `人物 ${cid} 的 spot.scene 是已有场景`);
  ok(!!sc && ch.spot.x >= 0 && ch.spot.x < sc.width && ch.spot.y >= 0 && ch.spot.y < sc.height,
    `人物 ${cid} 的 spot 坐标在图内（${ch.spot && ch.spot.scene}）`);
  const p = path.join(dir, ch.img);
  ok(fs.existsSync(p), `人物 ${cid} 的画像文件存在（${ch.img}）`);
  const sz = fs.existsSync(p) ? jpegSize(p) : null;
  ok(!!sz && sz.w > 0 && sz.h > 0, `人物 ${cid} 的画像能解析出尺寸（${sz && sz.w + '×' + sz.h}）`);
});
Object.entries(D.nodes).forEach(([id, node]) => {
  (node.chars || []).forEach(cid => ok(!!D.characters[cid], `节点 ${id} 的 chars 引用「${cid}」在人物表中`));
});
Object.keys(D.characters).forEach(cid => {
  const hits = Object.keys(D.nodes).filter(id => (D.nodes[id].chars || []).indexOf(cid) >= 0);
  ok(hits.length > 0, `人物 ${cid} 至少关联一个任务点（${hits.join('/')}）`);
});
/* 触发点抽查（预设 + grep 核对节点正文后补上的） */
const hasChar = (nodeId, cid) => (D.nodes[nodeId].chars || []).indexOf(cid) >= 0;
ok(hasChar('28', 'gaogao'), '抽查：28 号大厅 → 戈高');
ok(hasChar('8', 'kesituo') && hasChar('8W', 'kesituo'), '抽查：8 / 8W → 克斯托');
ok(hasChar('23', 'aershi') && hasChar('45', 'aershi'), '抽查：23 / 45 → 阿尔什');
ok(hasChar('20', 'aershi'), '抽查：20 号选项点名阿尔什 → 已补上');
ok(hasChar('37', 'beizefu') && hasChar('24', 'beizefu'), '抽查：37 / 24 号正文点名贝泽福 → 24 已补上');
ok(hasChar('7', 'xiaoguniang') && hasChar('35', 'xiaoguniang') && hasChar('49', 'xiaoguniang'), '抽查：7 / 35 / 49 → 小姑娘');
ok(hasChar('7', 'weier') && hasChar('35', 'weier'), '抽查：7 / 35 → 维尔');
ok(hasChar('4', 'makesi') && hasChar('31', 'makesi') && hasChar('19', 'makesi'), '抽查：4 / 19 号正文点名马克斯 → 19 已补上');
ok(hasChar('4', 'naide') && hasChar('12', 'naide') && hasChar('44', 'naide'), '抽查：4 / 12 / 44 → 奈德');
/* 偷窃者信息 + 结算 / 奖励文案 */
eq(D.nodes['28'].en.thief, '戈高', '28 号 en.thief = 戈高（警示条用）');
eq(D.nodes['27'].en.thief, '扒手', '27 号正文也是被偷（扒手），已补 en.thief');
ok(!!D.meta.bankrupt && D.meta.bankrupt.title === '身无分文' && !!D.meta.bankrupt.text, '失败结算有「身无分文」文案');
eq(String(D.meta.winReward), 'undefined', 'B09（§2-B144 ①）：结算奖励字段已删（无下一关——失效即删；旧「指向下一关平面图」断言随之作废）');
/* B09（§2-B144 ②）：多结局判据 Core.moreEndings()＝本关 win 节点数 ≥ 2（零新字段；合成关两探针） */
{
  ok(!C.moreEndings(), 'B09（§2-B144 ②）：示例关（win 仅 57＝1 个）⇒ false（「多结局」不成立不硬写）');
  globalThis.LEVELS['winprobe'] = {
    meta: { title: '多结局探针关' }, scenes: {}, start: { node: 'w1' }, resources: [], items: {},
    characters: {}, charOrder: [], help: [],
    nodes: { w1: { n: '一', t: '一', c: [] }, w2: { n: '二', t: '二', win: true, c: [] } }
  };
  ok(C.selectLevel('winprobe'), 'B09（§2-B144 ②）：单 win 合成关已注册且可选中');
  ok(!C.moreEndings(), 'B09（§2-B144 ②）：1 个 win 的合成关 ⇒ false');
  globalThis.LEVELS['winprobe'].nodes.w3 = { n: '三', t: '三', win: true, c: [] };
  ok(C.moreEndings(), 'B09（§2-B144 ②）：第 2 个 win 入册 ⇒ true（判据随数据翻——不硬写）');
  delete globalThis.LEVELS['winprobe'];
  ok(C.selectLevel('dalim'), 'B09（§2-B144 ②）：探针关撤下、切回大里姆');
}

/* ---------- 13. DOM 自检（v1.3）：engine.js 引用的 id 必须都在 index.html 里 ---------- */
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const jsSrc = fs.readFileSync(path.join(dir, 'engine.js'), 'utf8');
const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const refIds = [...new Set([...jsSrc.matchAll(/\$\(\s*'([^']+)'\s*\)/g)].map(m => m[1]))];
const missingIds = refIds.filter(id => !htmlIds.has(id));
console.log('DOM id 引用检查：engine.js 引用 ' + refIds.length + ' 个 id，缺失 ' + missingIds.length + ' 个');
eq(missingIds.join(','), '', 'engine.js 引用的 DOM id 全部存在于 index.html');
const closeIds = [...new Set([...html.matchAll(/data-close="([^"]+)"/g)].map(m => m[1]))];
eq(closeIds.filter(id => !htmlIds.has(id)).join(','), '', 'index.html 里所有 data-close 都指向存在的弹层 id');

/* ---------- 14. 引擎 v0.3 新钩子（E1~E8；合成关卡，不动真实关卡数据）----------
   临时往注册表里加一关（只用来验证引擎钩子；验证完切回大里姆）：
     E1 coins.fail:null（花光不判失败）／ E2 meta.prologue ／ E3 items[].text ／ E4 hint
     E5 lockText ／ E6 once + chDone 谓词 ／ E7 say ／ E8 node.tIf（E9 是纯渲染层，由 DOM id 自检与走查覆盖） */
globalThis.LEVELS['hooktest'] = {
  meta: { title: '钩子测试关', safeNode: 'h1', prologue: { lines: ['你是{me}。', '第二行。'], image: 'hook.png' } },
  scenes: { hs: { id: 'hs', name: '测试·场景', image: '', width: 800, height: 800,
    pins: { h1: [100, 100], h2: [200, 200], h3: [300, 300], h4: [400, 400] } } },
  start: { node: 'h1' },
  resources: [
    { id: 'coins', name: '测试币', unit: '枚', icon: '🪙', start: { normal: 1, hard: 0 }, fail: null },
    { id: 'oxy', name: '氧气', unit: '点', icon: '💨', start: { normal: 5, hard: 5 }, fail: { title: '缺氧', text: '没气了。' } }
  ],
  items: { '钥匙': { icon: '🔑', text: '第一段\n第二段', desc: '一把钥匙——能开很多门。' }, '木棍': { icon: '🪵', atk: 1 } },
  characters: {}, charOrder: [], help: [],
  nodes: {
    h1: { n: '钩子起点', t: '开场正文。', tIf: [{ cond: { chDone: '打过招呼' }, t: '打过招呼之后的正文。' }],
      c: [
        { l: '打个招呼。', once: '打过招呼', say: '{me}挥了挥手。', lockText: '（还不到时候。）', fx: { learn: '招呼' }, to: 'h2' },
        { l: '花光钱。', fx: { coins: -1 }, to: 'h2' },
        { l: '还买不起的东西。', lock: true, cond: { coins: 9 } },
        { l: '只做一次的动作。', once: true, to: 'h2' }
      ] },
    h2: { n: '钩子终点', t: '到了。', c: [{ l: '回去。', back: true }] },
    h3: { n: '一道小门', t: '门在这。', c: [{ l: '推开小门。', once: '走过小门', to: 'h4' }] },
    h4: { n: '门后', t: '门后。', c: [{ l: '回去。', back: true }] }
  }
};
ok(C.selectLevel('hooktest'), '14-0：合成关已注册且可选中（引擎钩子测试用）');
const LVH = C.currentLevel();

/* --- E1 资源 fail:null（只钳 0、不判失败） --- */
let h = C.newState('normal');
eq(h.coins, 1, 'E1：合成关普通开局 1 枚');
eq(C.payReason(h, 1), '', 'E1：fail:null 的资源可以花到 0（付款守卫放行）');
C.applyRes(h, 'coins', -1);
eq(h.coins, 0, 'E1：……扣到 0（仍然钳在 ≥0）');
ok(!h.bankrupt && h.zeroRes === null, 'E1：……不判失败、不设 zeroRes');
h = C.newState('normal');
C.applyRes(h, 'oxy', -5);
ok(h.bankrupt && h.zeroRes === 'oxy', 'E1：带 fail 的资源照旧归零判失败（旧行为不变）');
h = C.newState('normal');
C.normalizeState(h);
ok(!h.bankrupt && h.zeroRes === null, 'E1：读档兜底——fail:null 的资源为 0 不算失败');

/* --- E2 序章（meta.prologue；{me} 可替换） --- */
const pro = C.prologue();
ok(pro && pro.lines.length === 2 && pro.image === 'hook.png', 'E2：序章数据可读（lines + image）');
eq(C.fillName(pro.lines[0], C.newState('normal')), '你是林小晨。', 'E2：序章 {me} 可替换');

/* --- E3 道具正文（items[].text） --- */
eq(C.itemText('钥匙'), '第一段\n第二段', 'E3：道具正文可读（多段 \\n 原样保留）');
eq(C.itemText('木棍'), null, 'E3：没有 text 的道具 → null（面板回「没什么可读的」）');
/* --- B07（§2-B140）：道具介绍 Core.itemDesc（同 E3 itemText 口径——非字符串或空 ⇒ null） --- */
eq(C.itemDesc('钥匙'), '一把钥匙——能开很多门。', 'B07：有 desc ⇒ 原样返回（纯读）');
eq(C.itemDesc('木棍'), null, 'B07：没有 desc 的道具 → null（不显示）');
LVH.items['木棍'].desc = ''; eq(C.itemDesc('木棍'), null, 'B07：空串 desc ⇒ null'); delete LVH.items['木棍'].desc;

/* --- E4 hint 缺省 = vague --- */
eq(C.choiceHint({}), 'vague', 'E4：不写 hint = vague');
eq(C.choiceHint({ hint: 'exact' }), 'exact', 'E4：写了就原样返回（引擎不自己加料）');
eq(C.choiceHint({ hint: 'none' }), 'none', 'E4：none 原样返回');
h = C.newState('normal');
C.go(h, 'h1');
const vc4 = C.visibleChoices(h);
ok(vc4.length > 0 && vc4.every(e => ['vague', 'exact', 'none'].indexOf(e.hint) >= 0), 'E4：可见选项列表带 hint 字段（缺省 vague）');

/* --- E5 灰显措辞（lockText + 兜底；B78 起资源面＝数字式——「还差点底气」档位词退役） --- */
eq(C.lockHint({ lockText: '（还差点门道。）' }), '（还差点门道。）', 'E5：有 lockText 就用它');
eq(C.lockHint({ cond: { item: '木棍' } }), '还差：木棍', 'E5：道具兜底 = 还差：X');
eq(C.lockHint({ cond: { knows: '秘密' } }), '还不到时候', 'E5：线索兜底 = 还不到时候');
eq(C.lockHint({ cond: { oxy: 3 } }), '需要 3 点氧气', 'B78：资源兜底＝数字式（需要 N <单位><名>；原「还差点底气」退役）');
ok(!/[0-9]/.test(C.lockHint({ cond: { knows: '秘密' } })) && !/[0-9]/.test(C.lockHint({ cond: { item: '木棍' } })), 'E5：非资源兜底仍不含数字（线索／道具面）');

/* --- E6 once / st.chDone / { chDone } 谓词 --- */
const h1Choices = LVH.nodes.h1.c;
h = C.newState('normal');
C.go(h, 'h1');
let vc = C.visibleChoices(h);
eq(vc.length, 4, 'E6：四个选项都在列（条件未满足但标了 lock 的 = 灰显，仍看得见）');
const r0 = C.choose(h, 0);
ok(h.chDone['打过招呼'] === true, 'E6：命名 once 执行后记入 st.chDone');
ok(C.choiceDone(h, h1Choices[0], 0, 'h1'), 'E6：choiceDone 认这份标记');
ok(C.condOk(h, { chDone: '打过招呼' }), 'E6+：{ chDone } 谓词 = 做过');
ok(!C.condOk(C.newState('normal'), { chDone: '打过招呼' }), 'E6+：没做过 = false');
ok(!h.chDone['@h1#0'], 'E6：命名 once 不用内部键（键 = 标记名）');
C.go(h, r0.to);
C.goBack(h);
eq(h.loc, 'h1', 'E6：转一圈回到起点');
const r3 = C.choose(h, 3);
ok(h.chDone['@h1#3'] === true, 'E6：once:true 用内部键记录（不可被条件查询）');
ok(!C.condOk(h, { chDone: '只做一次的动作。' }), 'E6：once:true 不留可查询的标记名');
C.go(h, r3.to);
C.goBack(h);
vc = C.visibleChoices(h);
ok(vc.every(e => e.ci !== 0 && e.ci !== 3), 'E6：做过的一次性选项不再出现在可见列表里');
eq(C.choose(h, 0).to, undefined, 'E6：做过的一次性选项再执行 = 空操作');
let ek = C.reachablePins(h);
ok(!!ek['h2'], 'E6：还有别的选项通向 h2 —— 编号仍然点亮');
h = C.newState('normal');
C.go(h, 'h3');
ek = C.reachablePins(h);
ok(!!ek['h4'], 'E6：唯一出口的编号可达');
const r4 = C.choose(h, 0);
C.go(h, r4.to);
C.goBack(h);
eq(C.pinChoiceIndex(h, 'h4'), -1, 'E6：做过的一次性选项 → 该编号不再可点');
eq(Object.keys(C.reachablePins(h)).length, 0, 'E6：……地图上也不再点亮');
ok(C.deadEnd(h), 'E6：……没有别的出路 → 按走投无路处理（弹求救面板）');
h = C.newState('normal');
C.go(h, 'h1');
eq(C.pinChoiceIndex(h, 'h2'), 0, 'E6：普通选项的编号照旧可点');

/* --- E7 say 旁白 --- */
h = C.newState('normal');
C.go(h, 'h1');
eq(C.choose(h, 0).say, '林小晨挥了挥手。', 'E7：say 随执行返回（{me} 已替换）');
h = C.newState('normal');
C.go(h, 'h1');
eq(C.choose(h, 1).say, null, 'E7：没写 say 的选项 → null（不附加任何旁白）');

/* --- E8 node.tIf 正文分叉 --- */
h = C.newState('normal');
C.go(h, 'h1');
eq(C.nodeText(h, LVH.nodes.h1), '开场正文。', 'E8：tIf 都不满足 → 用 node.t');
h.chDone['打过招呼'] = true;
eq(C.nodeText(h, LVH.nodes.h1), '打过招呼之后的正文。', 'E8：tIf 首个满足 → 用分叉正文');

/* 收拾干净：从注册表里拿走合成关，切回大里姆 */
ok(C.selectLevel('dalim'), '14-末：切回大里姆');
delete globalThis.LEVELS['hooktest'];
eq(C.prologue(), null, 'E2：没有 prologue 的关卡 → null（不显示序章）');
h = C.newState('normal');
ok(C.payReason(h, h.coins).indexOf('买完就剩 0') >= 0, 'E1：没有 fail:null 的资源仍守「买完必须留 1」（旧行为不变）');

/* ---------- 汇总 ---------- */
console.log('');
console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项。');
process.exit(fail ? 1 : 0);
