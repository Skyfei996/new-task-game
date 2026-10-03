// 临时 CLI 冒烟驱动：站关主线（dev 模式，逐选项走通到 41）＋ --player 短走
// 用后即删；证据＝每步的 scene id（内景）与末屏结局名
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ ' + m); } };
const eq = (a, b, m) => ok(a === b, m + '（实际 ' + JSON.stringify(a) + '，期望 ' + JSON.stringify(b) + '）');

const repo = process.cwd();
const tool = path.join(repo, 'tools', 'play.mjs');
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'b119-cli-'));
function cli(args, opts) {
  const out = execFileSync(process.execPath, [tool, ...args], { cwd: T, encoding: 'utf8' });
  return out;
}
function json(args) { return JSON.parse(execFileSync(process.execPath, [tool, '--json', ...args], { cwd: T, encoding: 'utf8' })); }

cli(['new', 'station']);
const scenes = [];
function pick(node, frag) {
  const s = json(['state']);
  const hit = s.choices.filter(c => (c.label || '').indexOf(frag) >= 0);
  ok(hit.length >= 1, '主线：' + node + ' 有选项「' + frag + '」（' + (hit[0] || {}).label + '）');
  cli(['choose', String(hit[0].i)]);
  const after = json(['state']);
  scenes.push([after.state.loc, after.scene]);
  return after;
}
/* 开局买满 4 盒吃 4 盒（普通 20 枚 = 4×5） */
for (let i = 0; i < 4; i++) { cli(['buy', '合成料理']); pick('1', '吃一盒合成料理'); }
const ROUTE = [
  ['1', '摸黑去中央大厅'], ['18', '摸回去'], ['2', '回中央大厅'], ['18', '去健身房'], ['4', '撬开墙上的急救箱'],
  ['4', '回中央大厅'], ['18', '去医务室'], ['3', '把医疗包交给阿雅'], ['24', '回中央大厅'], ['18', '去观景厅'],
  ['5', '钻到沙发后面'], ['5', '追出去'], ['28', '站猫罐头'], ['28', '先回中层大厅'], ['20', '吃一盒合成料理'],
  ['20', '乘电梯去底层'], ['21', '去维修区'], ['16', '零件堆'], ['16', '往上爬'], ['7', '打开工具柜'],
  ['30', '把芯片收好'], ['16', '回底层大厅'], ['21', '去冷却塔'], ['13', '用万能扳手拧上总阀'],
  ['21', '乘电梯去中层'], ['20', '去气闸舱'], ['11', '打开安保柜'], ['11', '穿上磁力靴，出舱'],
  ['19', '用工具把面板焊好'], ['39', '爬回气闸舱'], ['11', '回中层大厅'], ['20', '乘电梯去底层'],
  ['21', '去太阳能控制室'], ['15', '双手推上主供电闸门'], ['36', '回底层大厅'], ['21', '去反应堆舱'],
  ['12', '装上三件东西'], ['34', '追！'], ['40', '揭发他']
];
ROUTE.forEach(([node, frag]) => pick(node, frag));

const stepScenes = scenes.map(([loc, sc]) => loc + ':' + sc).join(' ');
console.log('  主线逐步（节点:场景）—— ' + stepScenes);
const loc41 = scenes[scenes.length - 1];
eq(loc41[0], '41', 'B119 冒烟：主线走通到结局 A（节点 41）');
eq(loc41[1], 'deck3', 'B119 冒烟：41 号结局在底层图（deck3）');
const wantIn = { '2': 'room-sleep', '4': 'room-gym', '3': 'room-medbay', '5': 'room-observation', '7': 'room-lab', '24': 'room-medbay' };
Object.entries(wantIn).forEach(([loc, sid]) => {
  const hit = scenes.find(x => x[0] === loc);
  ok(!!hit && hit[1] === sid, 'B119 冒烟：抵达 ' + loc + ' 号 ⇒ 切内景 ' + sid + '（实测 ' + (hit && hit[1]) + '）');
});
const devEnd = cli(['state']);
ok(devEnd.indexOf('结局 A · 圆满') >= 0, 'B119 冒烟：开发档末屏＝结局 A · 圆满（去字母只在玩家面/网页面）');
const devWhere = cli(['where']);
ok(devWhere.indexOf('场景：底层（deck3）') >= 0, 'B119 冒烟：where 场景 id 可读（开发面）——底层（deck3）');
const sessionState = json(['where']);
eq(sessionState.scene, 'deck3', 'B119 冒烟：where 场景 id＝deck3');

/* --player 短走：1 → 18 → 1（玩家面不泄露编号/场景 id） */
const P = fs.mkdtempSync(path.join(os.tmpdir(), 'b119-player-'));
const pcli = args => execFileSync(process.execPath, [tool, '--player', ...args], { cwd: P, encoding: 'utf8' });
pcli(['new', 'station']);
const first = pcli(['state']);
ok(first.indexOf('【顶层】') >= 0 && first.indexOf('晚餐刚端上桌') >= 0, 'B119 冒烟（--player）：开局＝顶层·食堂正文');
ok(!/\d+ · /.test(first) && first.indexOf('→ 18') < 0, 'B119 冒烟（--player）：玩家面不带节点号/去向编号');
pcli(['choose', '1']);                       // 摸黑去中央大厅
const mid = pcli(['choose', '1']);           // 穿过走廊，去食堂（1）
ok(mid.indexOf('【顶层】') >= 0 && mid.indexOf('摸黑') >= 0, 'B119 冒烟（--player）：回食堂后照常（顶层）');
ok(mid.indexOf('room-') < 0 && mid.indexOf('deck') < 0, 'B119 冒烟（--player）：玩家面不泄露场景 id');
const pw = pcli(['where']);
ok(pw.indexOf('📍 当前位置：食堂') >= 0 && pw.indexOf('【顶层】') >= 0, 'B119 冒烟（--player）：where 位置＝食堂·顶层');

/* --player 结局面（去字母）：直接摆一份 41 号存档会话（同 test.play ⑧ 的手法） */
const st41 = { diff: 'normal', me: '林小晨', items: ['桑尼的账本', '监控回放'], visited: { '41': true }, done: {}, learned: {},
  chDone: {}, wristband: 0, hist: [], loc: '41', bankrupt: false, zeroRes: null, scene: 'deck3', coins: 3, oxygen: 40 };
fs.mkdirSync(path.join(P, '.playtest'), { recursive: true });
fs.writeFileSync(path.join(P, '.playtest', 'player-session.json'),
  JSON.stringify({ v: 1, level: 'station', state: st41, log: [], steps: 0, createdAt: new Date().toISOString() }));
const pEnd = pcli(['state']);
ok(pEnd.indexOf('🏁 结局 · 圆满') >= 0 && pEnd.indexOf('结局 A') < 0, 'B119 冒烟（--player）：末屏＝🏁 结局 · 圆满（去字母）');

console.log('');
console.log('CLI 冒烟：通过 ' + pass + ' 项，失败 ' + fail + ' 项。');
console.log('（临时目录 ' + T + ' / ' + P + '）');
process.exit(fail ? 1 : 0);
