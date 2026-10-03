// 临时迷你 DOM 冒烟：B119 内景接线 + B117 卡片三态（跑引擎 DOM 路径；用后即删）
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ ' + m); } };
const eq = (a, b, m) => ok(a === b, m + '（实际 ' + JSON.stringify(a) + '，期望 ' + JSON.stringify(b) + '）');

class El {
  constructor(tag) {
    this.tagName = tag; this.children = []; this.dataset = {};
    this.style = { setProperty: (k, v) => { this.style[k] = v; } };
    this._cls = new Set(); this.textContent = ''; this._html = ''; this.listeners = {};
    const cls = this._cls;
    this.classList = {
      add: (...c) => c.forEach(x => cls.add(x)),
      remove: (...c) => c.forEach(x => cls.delete(x)),
      contains: c => cls.has(c),
      toggle: (c, on) => { if (on === undefined) { cls.has(c) ? cls.delete(c) : cls.add(c); } else if (on) cls.add(c); else cls.delete(c); }
    };
  }
  get className() { return [...this._cls].join(' '); }
  set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get innerHTML() { return this._html; }
  set innerHTML(v) { this._html = String(v); if (v === '') this.children = []; }
  appendChild(c) { this.children.push(c); return c; }
  remove() { }
  replaceWith() { }
  setAttribute(k, v) { this[k] = v; }
  removeAttribute(k) { delete this[k]; }
  getAttribute(k) { return this[k]; }
  addEventListener(t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); }
  removeEventListener() {}
  querySelectorAll() { return []; }
  querySelector() { return null; }
  scrollIntoView() {}
  get offsetWidth() { return 100; }
}
const byId = {};
const doc = {
  _l: {},
  createElement: t => new El(t),
  createDocumentFragment: () => new El('fragment'),
  createElementNS: (ns, t) => new El(t),
  getElementById: id => (byId[id] = byId[id] || new El('div')),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: (t, fn) => { (doc._l[t] = doc._l[t] || []).push(fn); }
};
const storeMap = {};
const store = {
  getItem: k => (k in storeMap ? storeMap[k] : null),
  setItem: (k, v) => { storeMap[k] = String(v); },
  removeItem: k => { delete storeMap[k]; }
};
let confirmAnswer = false, confirmTexts = [];
const win = { localStorage: store, LEVELS: {}, addEventListener: () => {} };
globalThis.window = win;
globalThis.document = doc;
globalThis.confirm = t => { confirmTexts.push(t); return confirmAnswer; };

const dir = path.resolve('prototype');
const code = ['levels/dalim.js', 'levels/station.js', 'engine.js']
  .map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
vm.runInThisContext(code, { filename: 'bundle.smoke.js' });
(doc._l.DOMContentLoaded || []).forEach(f => f());

/* ---- 工具 ---- */
const textOf = el => [el.textContent || '', ...el.children.map(textOf)].join(' ');
const findAll = (el, pred, out) => { out = out || []; if (pred(el)) out.push(el); el.children.forEach(c => findAll(c, pred, out)); return out; };
const buttonsOf = card => findAll(card, e => e.tagName === 'button');
const recOf = card => (findAll(card, e => e.className.indexOf('lcRecord') === 0).map(textOf).join(' ｜ '));
const noteOf = card => card.children.find(c => c.className.indexOf('lcSaveNote') >= 0);
const cardOf = i => byId['levelList'].children[i];
const stationCard = () => cardOf(1);
/* 重渲染选关页＝重跑 init（只读渲染，不落盘）——levelsBtn 会先 save()，那会把当前局写回存档、盖掉测试桩 */
const rerender = () => { (doc._l.DOMContentLoaded || []).forEach(f => f()); byId['overlay'].classList.remove('hidden'); };
const SCENE = () => byId['sceneImg'].src;
const saveKey = 'mygame2.save.station.v1';

/* ---- ① 无存档：唯一「开始」＋脚注 ---- */
{
  const card = stationCard();
  eq(buttonsOf(card).map(b => b.textContent).join(','), '开始', 'B117①：无存档 ⇒ 唯一按钮「开始」');
  ok(!/继续|重玩/.test(textOf(card)), 'B117①：无存档卡片无「继续」「重玩」字样');
  ok(textOf(card).indexOf('进度存在这台设备的浏览器里（各人各份）') >= 0, 'B117：卡片脚注（本机存档·各人各份）在案');
  ok(textOf(card).indexOf('继续上次进度') < 0, 'B115：无「继续上次进度」');
}

/* ---- 开局：点「开始」→ 序章 → 食堂内景（B119） ---- */
{
  buttonsOf(stationCard())[0].onclick();
  ok(byId['overlay'].classList.contains('hidden'), 'B117：点「开始」⇒ 选关层收起');
  eq(byId['prologueLayer'].classList.contains('hidden'), false, 'E2：新局先弹序章层');
  byId['prologueStart'].onclick();
  eq(SCENE(), '../images/station/rooms/galley.jpg', 'B119：开局节点 1（食堂）⇒ 切内景 galley.jpg');
  eq(byId['sceneTag'].textContent, '顶层', 'B119：内景左上角标＝所属层（顶层）');
  ok(byId['nodeText'].textContent.indexOf('晚餐刚端上桌') >= 0, '开局正文渲染在案');
  const pins = byId['pinLayer'].children;
  eq(pins.map(p => p.dataset.id).join(','), '18', 'B119：食堂内景 pins＝出口 18（房内无构件交互点）');
  eq(pins[0].style.left, (1330 / 1659 * 100) + '%', 'B119：出口 pin 位置＝暂定值 [1330,690] 换算');
  eq(byId['momentLayer'].children.length, 1, 'B04：浮现层 1 张（pangpang-hail）');
  const use = byId['invBar'].children[0];
  ok(use && use.className.indexOf('invEmpty') >= 0, 'B04：物品栏空态照常');
}

/* ---- 进出房往返（点选项＝与 pin 同一路径） ---- */
{
  const pick = i => byId['choiceList'].children.filter(c => c.className.indexOf('choice') >= 0)[i];
  pick(0).onclick();                                   // 摸黑去中央大厅
  eq(SCENE(), '../images/station/deck1-v1.jpg', 'B119：回大厅 ⇒ 切回层图 deck1-v1.jpg');
  eq(byId['locBadge'].textContent, '18', 'B119：当前位置＝顶层大厅');
  pick(0).onclick();                                   // 穿过走廊，去食堂（1）
  eq(SCENE(), '../images/station/rooms/galley.jpg', 'B119：再进食堂 ⇒ 内景（往返闭环）');
}

/* ---- 未接线房间：不换图（零降级） ---- */
{
  const pick = i => byId['choiceList'].children.filter(c => c.className.indexOf('choice') >= 0)[i];
  pick(0).onclick();                                   // 1 → 18
  pick(5).onclick();                                   // 18 → 20（乘电梯去中层）
  eq(SCENE(), '../images/station/deck2-v1.jpg', 'B119：中层大厅＝deck2');
  pick(0).onclick();                                   // 20 → 6（指挥舱，图未到货）
  eq(SCENE(), '../images/station/deck2-v1.jpg', 'B119：未到货房间（6 指挥舱）⇒ 沿用层图、不切图（零降级）');
}

/* ---- ② 未结束存档：继续＋重新开始 ---- */
{
  const st = { diff: 'normal', me: '林小晨', items: ['手电', '工牌'], visited: { '5': true }, done: {}, learned: {}, chDone: {},
    wristband: 0, hist: ['18'], loc: '5', bankrupt: false, zeroRes: null, scene: 'deck1', coins: 9, oxygen: 73 };
  storeMap[saveKey] = JSON.stringify(st);
  rerender();
  const card = stationCard();
  eq(buttonsOf(card).map(b => b.textContent).join(','), '继续,重新开始', 'B117②：未结束存档 ⇒ 「继续」＋「重新开始」、无「开始」');
  ok(buttonsOf(card).every(b => b.textContent !== '开始'), 'B117②：不出现「开始」');
  buttonsOf(card)[0].onclick();                        // 继续
  eq(byId['overlay'].classList.contains('hidden'), true, 'B117②：点「继续」⇒ 载入存档回到游戏');
  eq(SCENE(), '../images/station/rooms/observation.jpg', 'B119：读档归一——存档停在 5 号（观景厅）⇒ 落回内景');
  ok(byId['nodeText'].textContent.indexOf('木星') >= 0, 'B117②：读档正文＝观景厅（存档 loc 一致）');
}

/* ---- ③ 已结束（通关）：重玩＋通关记录；④ 覆盖确认 ---- */
{
  storeMap[saveKey] = JSON.stringify({ diff: 'normal', me: '林小晨', items: ['桑尼的账本'], visited: { '41': true }, done: {},
    learned: {}, chDone: {}, wristband: 0, hist: [], loc: '41', bankrupt: false, zeroRes: null, scene: 'deck3', coins: 3, oxygen: 40 });
  storeMap['mygame2.rec.station.v1'] = JSON.stringify(['结局 · 圆满']);
  rerender();
  const card = stationCard();
  eq(buttonsOf(card).map(b => b.textContent).join(','), '重玩', 'B117③：已结束（通关）⇒ 唯一「重玩」、无「继续」');
  ok(recOf(card).indexOf('🏆 通关记录：结局 · 圆满') >= 0, 'B117③：记录块＝🏆 通关记录：结局 · 圆满');
  const before = storeMap[saveKey];
  confirmAnswer = false;
  buttonsOf(card)[0].onclick();                        // 重玩（取消）
  eq(JSON.stringify(confirmTexts[confirmTexts.length - 1]), JSON.stringify('开始新局会覆盖本关的旧存档（通关记录保留）。确定开始？'),
    'B117④：覆盖确认文案逐字');
  eq(storeMap[saveKey], before, 'B117④：取消 ⇒ 不动存档');
  eq(byId['overlay'].classList.contains('hidden'), false, 'B117④：取消 ⇒ 仍停在选关页');
  confirmAnswer = true;
  buttonsOf(stationCard())[0].onclick();               // 重玩（确认）
  eq(byId['overlay'].classList.contains('hidden'), true, 'B117④：确认 ⇒ 开新局');
  eq(byId['prologueLayer'].classList.contains('hidden'), false, '重开＝新局（序章再弹一次）');
  byId['prologueStart'].onclick();
  eq(byId['locBadge'].textContent, '1', 'B117④：新局回到 1 号（食堂）');
  eq(storeMap['mygame2.rec.station.v1'], JSON.stringify(['结局 · 圆满']), 'B117⑤：开新局覆盖存档 ⇒ 通关记录仍在');
}

/* ---- ③ 已结束（失败）：上局结束：未通关 ---- */
{
  storeMap[saveKey] = JSON.stringify({ diff: 'normal', me: '林小晨', items: [], visited: { '44': true }, done: {}, learned: {},
    chDone: {}, wristband: 0, hist: [], loc: '44', bankrupt: true, zeroRes: 'oxygen', scene: 'deck3', coins: 0, oxygen: 0 });
  rerender();
  const card = stationCard();
  eq(buttonsOf(card).map(b => b.textContent).join(','), '重玩', 'B117③：已结束（失败）⇒ 唯一「重玩」、无「继续」');
  ok(recOf(card).indexOf('上局结束：未通关') >= 0, 'B117③：失败终止行＝上局结束：未通关');
  ok(recOf(card).indexOf('🏆 通关记录') >= 0, 'B117⑤：失败不清空已有通关记录');
}

/* ---- ⑤ 通关记录写入（真的走到 41 号）：记录落独立键 ---- */
{
  storeMap['mygame2.rec.station.v1'] = JSON.stringify([]);
  storeMap[saveKey] = JSON.stringify({ diff: 'normal', me: '林小晨', items: ['桑尼的账本'], visited: { '40': true }, done: {},
    learned: { '太阳能板已修好': true }, chDone: {}, wristband: 0, hist: [], loc: '40', bankrupt: false, zeroRes: null,
    scene: 'deck3', coins: 3, oxygen: 40 });
  rerender();
  eq(buttonsOf(stationCard()).map(b => b.textContent).join(','), '继续,重新开始', 'B117⑤：40 号存档＝未结束存档（继续＋重新开始）');
  buttonsOf(stationCard())[0].onclick();               // 继续 → 40 号
  const pick = i => byId['choiceList'].children.filter(c => c.className.indexOf('choice') >= 0)[i];
  eq(byId['overlay'].classList.contains('hidden'), true, 'B117⑤：继续载入 40 号存档');
  eq(byId['locBadge'].textContent, '40', 'B117⑤：读档到 40 号（对峙；读档不重放序章）');
  pick(0).onclick();                                   // 揭发他 → 41
  eq(byId['locBadge'].textContent, '41', 'B117⑤：走到 41 号结局');
  eq(storeMap['mygame2.rec.station.v1'], JSON.stringify(['结局 · 圆满']), 'B117⑤：达成 41 ⇒ 记录追加结局短名（独立键）');
  ok(byId['choiceList'].children.some(c => c.className.indexOf('endBanner') >= 0), 'B04：结局横幅渲染在案');
  rerender();
  const card = stationCard();
  eq(buttonsOf(card).map(b => b.textContent).join(','), '重玩', 'B117③：通关返回选关页 ⇒ 「重玩」');
  ok(recOf(card).indexOf('🏆 通关记录：结局 · 圆满') >= 0, 'B117③：卡片记录块（真实写入后回读）');
}

console.log('');
console.log('DOM 冒烟：通过 ' + pass + ' 项，失败 ' + fail + ' 项。');
process.exit(fail ? 1 : 0);
