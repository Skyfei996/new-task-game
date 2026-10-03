// 无头试玩器（tools/play.mjs）自测：node prototype/test.play.mjs
// 覆盖：① A 路线真走一遍到结局 41（CLI 进程级）  ② --json 字段齐全  ③ 不可执行 choose 报错且不换节点
//       ④ auto 冒烟 + 可复现  ⑤ 会话 save/load 往返一致  ⑥ Core.visibleChoices 只读助手（不改行为）
//       ⑦ 管理台数据源 prototype/lab-docs.js（build-lab.mjs 的产物）
//       ⑧ --player 玩家模式（E10：隐藏数值/去向/机械理由、定性档位、战斗对照例外、独立会话）
//       ⑨ read 翻看道具正文（E3：未拥有报错 / 无正文提示 / 只读不改状态）
//       ⑩ 文案稿导出（export-copy：序章 / 道具正文 / say / lockText / tIf）
// 说明：CLI 在临时目录里跑（会话文件 .playtest/session.json、玩家会话 player-session.json 落在临时目录，
//       不碰仓库里的真实会话）。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(dir, '..');
const PLAY = path.join(ROOT, 'tools', 'play.mjs');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.error('  ✗ FAIL:', msg); } }
function eq(a, b, msg) { ok(a === b, msg + '（实际 ' + JSON.stringify(a) + '，期望 ' + JSON.stringify(b) + '）'); }

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'playtest-'));
function play(args, cwd) {
  const r = spawnSync(process.execPath, [PLAY, ...args], { cwd: cwd || TMP, encoding: 'utf8' });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '' };
}
function playJson(args, cwd) {
  const r = play(['--json', ...args], cwd);
  let data = null;
  try { data = JSON.parse(r.out); } catch (e) { data = null; }
  return Object.assign({}, r, { data });
}
/* 进程内加载一份 Core（与 CLI 同一份数据）——用于「按数据算期望值」的断言 */
function loadCore(tag) {
  const code = ['levels/dalim.js', 'levels/station.js', 'engine.js']
    .map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  vm.runInThisContext(code, { filename: 'bundle.' + (tag || 'probe') + '.js' });
  return globalThis.GameCore;
}

/* ============ ① A 路线：从食堂一路走到结局 41（CLI 真跑，进程级） ============ */
/* 路线 = 设计档 §8.2 推荐主线（普通）：买满 4 盒料理吃掉、拿满 3 处补给（2/3/20 号）、
 * 借维修爬道拆芯片（16→7→30）、13 号取冷却剂、11 取靴→19→39 修板、15→36 复电、12→34→40 揭发 → 41。
 * 每一步 = [所在节点, 选项名匹配（按名字找序号——数据文案微调不破测试）, 执行后应在的节点]。 */
const ROUTE = [
  ['1', /摸黑去中央大厅/, '18'], ['18', /睡觉的铺位/, '2'], ['2', /回中央大厅/, '18'],
  ['18', /去健身房/, '4'], ['4', /撬开墙上的急救箱/, '4'], ['4', /回中央大厅/, '18'], ['18', /去医务室/, '3'],
  ['3', /把医疗包交给阿雅/, '24'], ['24', /回中央大厅/, '18'], ['18', /去观景厅/, '5'],
  ['5', /钻到沙发后面/, '5'], ['5', /追出去/, '28'], ['28', /站猫罐头/, '28'],
  ['28', /先回中层大厅/, '20'], ['20', /坐在补给柜旁边/, '20'],
  ['20', /去实验室/, '7'], ['7', /帮他去找工具箱/, '25'], ['25', /顺着维修爬道滑下去/, '16'],
  ['16', /把零件堆翻一翻/, '16'], ['16', /钻进/, '7'], ['7', /自己动手/, '30'],
  ['30', /把芯片收好/, '16'], ['16', /回底层大厅/, '21'], ['21', /去冷却塔/, '13'], ['13', /用万能扳手拧上总阀/, '21'],
  ['21', /乘电梯去中层/, '20'], ['20', /去气闸舱/, '11'], ['11', /打开安保柜/, '11'], ['11', /穿上磁力靴/, '19'],
  ['19', /用工具把面板焊好/, '39'], ['39', /爬回气闸舱/, '11'], ['11', /回中层大厅/, '20'],
  ['20', /乘电梯去底层/, '21'], ['21', /去太阳能控制室/, '15'], ['15', /双手推上主供电闸门/, '36'],
  ['36', /回底层大厅/, '21'], ['21', /去反应堆舱/, '12'], ['12', /启动反应堆/, '34'],
  ['34', /去应急逃生舱口/, '40'], ['40', /揭发他/, '41']
];

/* 首屏（人类可读块） */
{
  const r = play(['new', 'station']);
  eq(r.code, 0, 'new station 退出码 0（首屏正常）');
  ok(r.out.indexOf('══ 当前位置 ══') >= 0, '首屏有「══ 当前位置 ══」块');
  ok(r.out.indexOf('选项：') >= 0 && /1\) 摸黑去中央大厅/.test(r.out), '首屏列出选项（1) 摸黑去中央大厅）');
  ok(r.out.indexOf('状态：🪙 20') >= 0 && r.out.indexOf('💨 95') >= 0, '首屏状态行有资源 🪙 20 / 💨 95（100 − 5：1 号食堂进入效果）');
  ok(r.err === '', '首屏 stderr 干净');
}

/* 逐条走到结局 41；把走过的命令序列记下来（报告里要用） */
const seq = ['node tools/play.mjs new station'];
{
  let cur = '1', steps = 0;
  /* 1 号：买 1 盒吃 1 盒 ×4（20 星币刚好花光 —— 顺路实测「钱花光不判失败」） */
  for (let k = 1; k <= 4; k++) {
    const b = play(['buy', '合成料理']);
    eq(b.code, 0, '买第 ' + k + ' 盒料理 退出码 0');
    steps += 1;
    seq.push('node tools/play.mjs buy 合成料理   # 第 ' + k + ' 盒（-5 星币）');
    const s0 = playJson(['state']);
    const eat = (s0.data.choices || []).find(c => /吃一盒合成料理/.test(c.label));
    ok(!!eat, '买完第 ' + k + ' 盒后出现「吃一盒合成料理」选项');
    const r = playJson(['choose', String(eat ? eat.i : 4)]);
    eq(r.code, 0, '吃掉第 ' + k + ' 盒 退出码 0');
    steps += 1;
    seq.push('node tools/play.mjs choose ' + (eat ? eat.i : 4) + '   # @1 吃掉第 ' + k + ' 盒 → 1');
  }
  const z = playJson(['state']);
  eq(z.data.state.resources.coins, 0, '4 盒买完：星币刚好花光（20 − 4×5 = 0）');
  eq(z.data.state.ended, null, '花光星币不判失败（coins fail:null，仍在局中）');

  for (const [at, re, expect] of ROUTE) {
    eq(cur, at, '（路线自检）第 ' + (steps + 1) + ' 步应在 ' + at + ' 号节点');
    const s0 = playJson(['state']);
    eq(s0.code, 0, 'state 退出码 0（取选项序号）');
    const hit = (s0.data.choices || []).find(c => re.test(c.label));
    ok(!!hit, '在 ' + at + ' 号找得到选项：' + re);
    if (!hit) break;
    const r = playJson(['choose', String(hit.i)]);
    eq(r.code, 0, 'choose ' + hit.i + ' @' + at + ' 退出码 0' + (r.code === 0 ? '' : '｜stderr: ' + r.err.trim()));
    eq(r.data && r.data.node, expect, 'choose ' + hit.i + ' @' + at + ' → ' + expect + ' 号节点');
    cur = expect;
    steps++;
    seq.push('node tools/play.mjs choose ' + hit.i + '   # @' + at + ' → ' + expect);
  }
  const r = playJson(['state']);
  eq(r.code, 0, '结局后 state 退出码 0');
  eq(r.data && r.data.node, '41', '走到结局 41（结局 A · 圆满）');
  eq(r.data && r.data.state && r.data.state.ended, 'win', '41 号标记为通关（ended=win）');
  eq(r.data && r.data.name, '结局 A · 圆满', '41 号节点名 = 结局 A · 圆满');
  eq(r.data && r.data.state && r.data.state.resources.oxygen, 85, 'A 路线结束时氧气 85（普通：100 + 30 补给 + 50 热食 − 95 消耗；设计档 §8.2 汇总）');
  eq(r.data && r.data.state && r.data.state.resources.coins, 0, '结束时星币 0（花光不判失败，见上）');
  eq(r.data && r.data.choices.length, 0, '结局节点没有可执行选项');
  ok(r.data.state.items.some(it => it.nosell && /焊接枪|控制芯片|冷却剂罐|站长授权卡|磁力靴|星尘矿石/.test(it.id)),
    'JSON 里带红框（nosell）标记：' + r.data.state.items.filter(it => it.nosell).map(it => it.id).join('/'));
  const human = play(['items']);
  ok(human.out.indexOf('【红框·关键·不可卖】') >= 0, '人类可读的 items 里也标出红框道具');
  eq(steps, 48, 'A 路线共 48 步（4 买 + 4 吃 + 40 个选项）');
}
console.log('A 路线命令序列（' + (seq.length - 1) + ' 条命令）：');
seq.forEach(s => console.log('  ' + s));

/* ============ ①b 其余子命令：where / items / log / help / 没开局时的报错 ============ */
{
  const w = play(['where']);
  eq(w.code, 0, 'where 退出码 0');
  ok(w.out.indexOf('📍 当前位置：41') >= 0 && w.out.indexOf('已探索') >= 0, 'where 打印当前位置（节点号 · 名称 · 场景 · 已探索/步数）');
  const it = play(['items']);
  eq(it.code, 0, 'items 退出码 0');
  ok(/🎒 物品（\d+ 件，其中红框关键道具 \d+ 件）/.test(it.out), 'items 打印物品件数与红框件数');
  ok(it.out.indexOf('⚔ 武力值') >= 0, 'items 打印武力值');
  const lg = play(['log', '--tail', '3']);
  eq(lg.code, 0, 'log --tail 3 退出码 0');
  ok(/操作流水（共 49 条，显示最后 3 条）/.test(lg.out), 'log --tail 3 说明总数与显示条数');
  eq((lg.out.match(/^\s+\d+\. /gm) || []).length, 3, 'log --tail 3 只输出 3 条');
  const lgAll = play(['log']);
  ok(/操作流水（共 49 条）/.test(lgAll.out), 'log 默认显示全部（49 条：开局 1 + 48 步）');
  const hp = play(['help']);
  eq(hp.code, 0, 'help 退出码 0');
  ok(hp.out.indexOf('choose') >= 0 && hp.out.indexOf('new <关卡id>') >= 0, 'help 列出子命令与用法');
  const hj = play(['--json']);                      // 只有 --json、没子命令 → 打帮助
  eq(hj.code, 0, '--json 没跟子命令时也打帮助（不报错）');
  const noRun = playJson(['choose', '1'], fs.mkdtempSync(path.join(os.tmpdir(), 'playtest-empty-')));
  ok(noRun.code !== 0 && /先开一局/.test(noRun.data && noRun.data.error || ''), '没开局时 choose → 清晰报错（先 new 一局）');
}

/* ============ ② --json 输出字段齐全 ============ */
{
  play(['new', 'station', '--hard', '--name', '小豆']);
  const r = playJson(['state']);
  eq(r.code, 0, '--json state 退出码 0');
  ok(!!r.data, '--json 输出可 JSON.parse');
  ok(typeof r.data.node === 'string' && r.data.node === '1', 'JSON：node 是字符串（1）');
  ok(typeof r.data.name === 'string' && r.data.name.length > 0, 'JSON：name 有名字');
  ok(typeof r.data.text === 'string' && r.data.text.length > 10, 'JSON：text 是正文');
  ok(Array.isArray(r.data.choices) && r.data.choices.length >= 2, 'JSON：choices 是数组');
  const c = r.data.choices[0];
  ok(typeof c.i === 'number' && typeof c.label === 'string' && Array.isArray(c.to)
    && typeof c.ok === 'boolean' && typeof c.why === 'string', 'JSON：choice 含 i / label / to / ok / why');
  ok(r.data.choices.every((x, k) => x.i === k + 1), 'JSON：choice.i 从 1 连续编号');
  ok(!!r.data.state && r.data.state.resources && Array.isArray(r.data.state.items) && Array.isArray(r.data.state.clues)
    && typeof r.data.state.atk === 'number' && typeof r.data.state.steps === 'number', 'JSON：state 含 resources / items / clues / atk / steps');
  eq(r.data.state.diff, 'hard', '--hard 生效（难度 hard）');
  eq(r.data.state.me, '小豆', '--name 生效（玩家名 小豆）');
  eq(r.data.state.resources.oxygen, 25, '困难模式开局氧气 25（设计档 D2：困难 30 开局 − 5（1 号食堂进入效果））');
  const human = play(['state']);
  ok(human.out.indexOf('小豆') >= 0, '人类可读输出里也带玩家名');
  ok(human.out.indexOf('详细状态') >= 0, 'state 打印详细状态块（位置/资源/物品/线索/武力/步数）');
}

/* ============ ③ 不可执行的 choose：报错、不换节点、不改步数 ============ */
{
  play(['new', 'station']);
  play(['choose', '1']);            // 1 → 18
  play(['choose', '4']);            // 18 → 4（健身房）
   const before = playJson(['state']).data;
   eq(before.node, '4', '（前置）在健身房 4 号');
   /* B03：本关无灰显——4② 未去 25 时显示的是一条「可点、原地反馈」的同类条（做完才隐） */
   const vis4 = before.choices.map(c => c.label);
   ok(vis4.some(l => l.indexOf('请他帮忙打开仓库') >= 0), 'B03：4② 以「可尝试」形式在列（不是灰显、不是消失）');
   ok(!before.choices.some(c => c.ok === false), 'B03：4 号选项列表里没有不可点项（灰显面已废）');
   const try2 = playJson(['choose', '2']);            // 试一下「请铁头帮忙开门」——没成 → 原地反馈
   eq(try2.code, 0, 'B03：选「请他帮忙打开仓库」→ 退出码 0（可尝试）');
   eq(playJson(['state']).data.node, '4', 'B03：没成 → 留在原地（4 号）');
   ok(!!try2.data && (try2.data.events || []).length === 0 && !!try2.data.say, 'B03：没成 → 零状态事件＋一条旁白反馈');
   const before2 = playJson(['state']).data;
   const bad = playJson(['choose', '99']);            // 越界：错误路径
   ok(bad.code !== 0, 'choose 越界序号 → 退出码非 0');
   ok(!!bad.data && bad.data.ok === false && /超出范围/.test(bad.data.error || ''), '--json 里带清晰的错误信息（超出范围）');
   const after = playJson(['state']).data;
   eq(after.node, '4', '不可执行的 choose 不换节点（仍在 4）');
   eq(after.state.steps, before2.state.steps, '不可执行的 choose 不推进步数');
   eq(JSON.stringify(after.state), JSON.stringify(before2.state), '不可执行的 choose 不改任何状态');
   const human = play(['choose', '99']);
   ok(human.code !== 0 && human.err.indexOf('✗') >= 0, '人类模式下错误走 stderr（✗ 前缀）');
  const range = playJson(['choose', '99']);
  ok(range.code !== 0 && /超出范围/.test(range.data.error || ''), '序号越界也报清晰错误（超出范围）');
  const junk = play(['choose', 'abc']);
  ok(junk.code !== 0, '非数字序号报错');
}

/* ============ ④ auto 冒烟：不抛异常、卡死会停、同种子可复现 ============ */
{
  play(['new', 'station']);
  const a1 = play(['auto', '--steps', '40', '--seed', '7']);
  ok(a1.code === 0 || a1.code === 3, 'auto --steps 40 正常收尾（退出码 ' + a1.code + '，0=走完/结局，3=卡死）');
  ok(a1.err === '', 'auto 不吐异常（stderr 干净）');
  ok(a1.out.indexOf('══ 自动试玩结束 ══') >= 0, 'auto 打印结束小结');
  ok(/结束原因：(到达结局\/结算|卡死|步数用尽)/.test(a1.out), 'auto 说明结束原因');
  ok(a1.out.indexOf('Error') < 0 && a1.out.indexOf('at ') < 0, 'auto 输出里没有堆栈');
  play(['new', 'station']);
  const a2 = play(['auto', '--steps', '40', '--seed', '7']);
  eq(a2.out, a1.out, '同种子同起点 → 输出完全一致（可复现）');
  play(['new', 'station']);
  const a3 = playJson(['auto', '--steps', '40', '--seed', '99']);
  ok(!!a3.data && !!a3.data.auto && Array.isArray(a3.data.auto.trail), '--json auto 带逐步轨迹（trail）');
  ok(a3.data.auto.trail.length >= 1, 'auto 真的走了至少一步');
  eq(a3.data.auto.seed, '99', 'JSON 里带种子（可复现）');
  ok(['ended', 'stuck', 'steps'].indexOf(a3.data.auto.stopped) >= 0, 'JSON 里带结束原因');
}

/* ============ ⑤ 会话 save / load 往返一致 ============ */
{
  play(['new', 'station']);
  play(['choose', '1']);   // → 18
  play(['choose', '2']);   // → 2（睡眠舱：拿手电/工牌/氧气瓶）
  const r = play(['save', 'snapshot-1.json']);
  eq(r.code, 0, 'save 退出码 0');
  ok(fs.existsSync(path.join(TMP, 'snapshot-1.json')), '快照文件真的写出来了');
  const saved = playJson(['state']).data;
  eq(saved.node, '2', '（前置）存档时在睡眠舱');
  play(['choose', '1']);   // → 18（走开）
  const moved = playJson(['state']).data;
  eq(moved.node, '18', '（前置）走开后在 18');
  ok(moved.state.steps > saved.state.steps, '（前置）步数变多了');
  const l = play(['load', 'snapshot-1.json']);
  eq(l.code, 0, 'load 退出码 0');
  const back = playJson(['state']).data;
  eq(back.node, saved.node, 'load 后回到存档的位置（2）');
  eq(JSON.stringify(back.state), JSON.stringify(saved.state), 'load 后状态与存档完全一致（含资源/物品/线索/步数）');
  const lj = playJson(['load', 'snapshot-1.json']);
  ok(!!lj.data && lj.data.ok === true && lj.data.cmd === 'load', '--json load 输出结构正常');
  const missing = playJson(['load', 'no-such-file.json']);
  ok(missing.code !== 0 && /找不到快照文件/.test(missing.data.error || ''), 'load 不存在的文件 → 清晰报错');
}

/* ============ ⑥ Core.visibleChoices：只读助手（与界面显示规则同源，不改变任何状态） ============ */
{
  const code = ['levels/dalim.js', 'levels/station.js', 'engine.js']
    .map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  vm.runInThisContext(code, { filename: 'bundle.play.js' });
  const C = globalThis.GameCore;
  ok(!!C && typeof C.visibleChoices === 'function', 'engine.js 里有只读助手 Core.visibleChoices');
  ok(C.selectLevel('station'), '选中 station');
  const st = C.newState('normal');
  C.go(st, '1');
  /* 与界面同源：节点 1（食堂）的第 4 个选项（吃合成料理）没标 lock → 条件不满足时不显示 */
  eq(C.visibleChoices(st).length, 3, '食堂：没拿料理时只显示 3 个选项（第 4 个隐藏）');
  st.items.push('合成料理');
  eq(C.visibleChoices(st).length, 4, '拿到料理后第 4 个选项显示出来');
  /* 只读：调用前后状态一模一样 */
  const before = JSON.stringify(st);
  C.visibleChoices(st);
  eq(JSON.stringify(st), before, 'visibleChoices 不改状态（只读）');
   /* B03：可见性两态——4 号首访显示「可尝试」条（成事条未达前提时由反馈条接管）；全场无灰显 */
   const st4 = C.newState('normal');
   C.go(st4, '4');
   const list4 = C.visibleChoices(st4);
   eq(list4.length, 5, 'B03：健身房首访：5 个可见项（全部可点；②/④ 的成事条隐、反馈条现）');
   ok(list4.every(x => x.ok === true), 'B03：可见项全部 ok=true（本关无灰显项）');
   const c4 = C.currentLevel().nodes['4'].c;
   const i42S = c4.findIndex(x => (x.l || '').indexOf('请他帮忙打开仓库') >= 0 && x.once);   // B03 前置：② 的成事条存在
   const i42F = c4.findIndex(x => (x.l || '').indexOf('请他帮忙打开仓库') >= 0 && x.say);
   ok(!list4.some(x => x.ci === i42S) && list4.some(x => x.ci === i42F), 'B03：未去 25 ⇒ ② 成事条隐、反馈条现（可尝试）');
   const st4b = C.newState('normal'); st4b.loc = '4'; st4b.visited['25'] = true;
   const list4b = C.visibleChoices(st4b);
   ok(list4b.some(x => x.ci === i42S) && !list4b.some(x => x.ci === i42F), 'B03：去过 25 ⇒ ② 成事条现、反馈条隐（两态）');
   eq(list4[0].why, '', 'B03：可点项的 why 为空串（机械理由面不再用于灰显）');
   ok(list4.every((x, k) => x.i === k + 1), 'i 从 1 连续编号');
   ok(list4.every(x => x.ci >= 0 && x.ci < C.currentLevel().nodes['4'].c.length), 'ci 是 node.c 的下标');
   /* 站位错位检查：ci 与显示项对应的原始选项一致 */
   eq(C.currentLevel().nodes['4'].c[list4[0].ci].l.indexOf('掰手腕') >= 0, true, '首项 ci 指向「掰手腕」原始选项');
  /* 结局 / 失败 / 破产：没有选项 */
  const stEnd = C.newState('normal'); C.go(stEnd, '41');
  eq(C.visibleChoices(stEnd).length, 0, '结局节点没有选项');
  const stFail = C.newState('normal'); C.go(stFail, '44');
  eq(C.visibleChoices(stFail).length, 0, '失败结算点没有选项');
  const stBroken = C.newState('normal'); stBroken.coins = 0; stBroken.bankrupt = true;
  eq(C.visibleChoices(stBroken).length, 0, '资源归零后没有选项');
  /* 12 号反应堆舱：收贿分支（无 lock）不显示 → 显示序号与 node.c 下标不同（CLI 用 i 看、用 ci 执行） */
  const st12 = C.newState('normal');
  C.go(st12, '12');
  const l12 = C.visibleChoices(st12);
  eq(l12.length, 3, '反应堆舱：显示 3 个（「舱门锁上」那个隐藏）');
  eq(C.currentLevel().nodes['12'].c[l12[0].ci].l.indexOf('启动反应堆') >= 0, true, '第 1 个显示项对应「启动反应堆」');
  /* 价格类选项（大里姆 34 号腕带）：每个价格一项，买不起的 ok=false */
  ok(C.selectLevel('dalim'), '切到 dalim');
  const stD = C.newState('normal');
  stD.loc = '34'; stD.hist = [];
  const prices = C.visibleChoices(stD).filter(x => x.price != null);
  eq(prices.length, 5, '腕带：5 个价格各占一项（与界面的价格按钮一一对应）');
  eq(prices.map(x => x.price).join(','), '1,2,3,4,5', '价格顺序 1~5');
  const stD1 = C.newState('normal');
  stD1.loc = '34'; stD1.coins = 1;
  ok(C.visibleChoices(stD1).every(x => x.price == null || x.ok === false), '只有 1 枚时任何腕带都买不起（都要留 1 枚）');
  C.selectLevel('station');
  /* 与引擎既有判定不冲突：没有可执行项 → deadEnd 为真（造一个测试点） */
  const D = C.currentLevel();
  D.nodes['T-play'] = { n: '测试点', t: '（测试用）', c: [{ l: '需要手电', cond: { item: '手电' }, to: '1' }] };
  const stT = C.newState('normal');
  stT.loc = 'T-play';
  eq(C.visibleChoices(stT).length, 0, '测试点（没标 lock）：条件不满足 → 选项不显示（与界面一致）');
  eq(C.deadEnd(stT), true, '测试点：没有可执行项 → 引擎判走投无路（与既有判定一致）');
  D.nodes['T-play'] = { n: '测试点', t: '（测试用）', c: [{ l: '需要手电', cond: { item: '手电' }, lock: true, to: '1' }] };
  eq(C.visibleChoices(stT).length, 1, '测试点（标了 lock）：灰显但看得见（与界面一致）');
  eq(C.visibleChoices(stT)[0].ok, false, '测试点：灰显 ok=false');
  eq(C.visibleChoices(stT)[0].why, '需要：手电', '测试点：灰显理由来自 Core.lockReason');
  /* E12：cond 假 + lockIf 成立 ⇒ 灰显；cond 假 + lockIf 不成立 ⇒ 隐藏（同一对判定，两侧行为） */
  D.nodes['T-play'] = { n: '测试点', t: '（测试用）', c: [{ l: '拿上工牌（要照亮的）', cond: { all: [{ item: '工牌' }, { noItem: '手电' }] }, lockIf: { noItem: '手电' }, lockText: '（还差个照亮的。）', to: '1' }] };
  eq(C.visibleChoices(stT).length, 1, '测试点（E12 甲侧）：cond 假 + lockIf 成立 → 灰显可见');
  eq(C.visibleChoices(stT)[0].ok, false, '测试点（lockIf）：灰显 ok=false');
  eq(C.visibleChoices(stT)[0].why, C.lockReason(D.nodes['T-play'].c[0]), '测试点（lockIf）：灰显机械理由 = Core.lockReason');
  eq(C.lockHint(D.nodes['T-play'].c[0]), '（还差个照亮的。）', '测试点（lockIf）：玩家向理由优先 lockText（Core.lockHint）');
  stT.items = ['手电'];
  eq(C.visibleChoices(stT).length, 0, '测试点（E12 乙侧）：cond 假 + lockIf 不成立 → 隐藏');
  stT.items = ['工牌'];
  eq(C.visibleChoices(stT).length, 1, '测试点（条件满足）：显示');
  eq(C.visibleChoices(stT)[0].ok, true, '测试点（条件满足）：ok=true');
  delete D.nodes['T-play'];
}

/* ============ ⑦ 管理台数据源（build-lab.mjs 的产物） ============ */
{
  const labDocs = path.join(dir, 'lab-docs.js');
  ok(fs.existsSync(labDocs), 'prototype/lab-docs.js 存在（先跑 node tools/build-lab.mjs 生成）');
  for (const f of ['lab.html', 'lab.js', 'lab.css']) ok(fs.existsSync(path.join(dir, f)), '管理台文件存在：prototype/' + f);
  let text = '';
  try { text = fs.readFileSync(labDocs, 'utf8'); } catch (e) { text = ''; }
  ok(/window\.LAB_DOCS\s*=/.test(text), 'lab-docs.js 里挂的是 window.LAB_DOCS');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  try { vm.runInContext(text, sandbox); } catch (e) { /* 交给下面的断言 */ }
  const L = sandbox.window.LAB_DOCS;
  ok(!!L, 'LAB_DOCS 能求值');
  if (!L) {
    ok(false, '（跳过后续检查：lab-docs.js 还没生成——先跑 node tools/build-lab.mjs）');
  } else {
  ok(typeof L.generatedAt === 'string' && L.generatedAt.length > 10, 'LAB_DOCS 带生成时间 generatedAt');
  ok(Array.isArray(L.files) && L.files.length >= 5, 'LAB_DOCS 带文件清单（' + (L.files || []).length + ' 个文件）');
  ok(Array.isArray(L.docs) && L.docs.length === L.files.length, 'LAB_DOCS.docs 与文件清单一一对应');
  const groups = new Set((L.docs || []).map(d => d.group));
  ok(groups.has('design') && groups.has('art'), 'LAB_DOCS 覆盖两组：design（docs/）与 art（art/）');
  ok((L.docs || []).every(d => d.path && d.title && typeof d.text === 'string' && d.text.length > 0), '每篇文档都有 path / title / text');
  ok((L.docs || []).some(d => d.path === 'docs/README.md'), '含 docs/README.md');
  ok((L.docs || []).some(d => /^art\/tasks\/T\d/.test(d.path)), '含 art/tasks/*.md 任务单');
  ok((L.docs || []).every(d => !/^#\s*$/.test(d.title)), '标题都取到了');
  }
}

/* ============ ⑧ --player 玩家模式（E10）：隐藏数值/去向/机械理由 · 战斗对照例外 · 独立会话 ============ */
{
  const C2 = loadCore('player');
  C2.selectLevel('station');
  const D2 = C2.currentLevel();
  const resDef = id => D2.resources.find(r => r.id === id);
  /* 期望档位按设计档 §8.3 的定值自己算（不抄实现） */
  const tierOxy = v => (v >= 50 ? '还好' : v >= 20 ? '有点闷' : '快喘不上气');
  const tierCoin = v => (v >= 5 ? '能买点东西' : v >= 1 ? '不多了' : '花光了');
  const enOxy = (((D2.nodes[D2.start.node] || {}).en) || {}).oxygen || 0;   // 1 号进入效果
  const oxyTxt = resDef('oxygen').name, coinTxt = resDef('coins').name;

  const T = fs.mkdtempSync(path.join(os.tmpdir(), 'playtest-player-'));
  const P = (...args) => play(['--player', ...args], T);

  /* 首屏：定性档位在；数值/武力/步数/计数/去向编号都不在 */
  const n = P('new', 'station');
  eq(n.code, 0, '--player new station 退出码 0');
  const expOxy = tierOxy(resDef('oxygen').start.normal + enOxy);
  const expCoin = tierCoin(resDef('coins').start.normal);
  ok(new RegExp('💨 ' + oxyTxt + ' [█░]{10} ' + expOxy).test(n.out), '玩家版氧气：文本条＋档位（10 格；档位 ' + expOxy + '）');
  ok(n.out.indexOf('🪙 ' + coinTxt + ' ' + expCoin) >= 0, '玩家版星币档位按定值算（' + expCoin + '）');
  ok(!/💨\s*\d/.test(n.out) && !/🪙\s*\d/.test(n.out), '玩家版不显示资源数字');
  ok(n.out.indexOf('⚔ 武力') < 0, '玩家版不显示武力面板');
  ok(n.out.indexOf('第 0 步') < 0 && n.out.indexOf('已探索') < 0, '玩家版不显示步数 / 已探索计数');
  ok(!/→ \d/.test(n.out), '玩家版不显示去向编号（→ N 名称）');
  ok(n.out.indexOf('（你的武力 ') < 0, '玩家版不显示机械战斗格式');
  ok(n.out.indexOf('→ 买：buy ') >= 0, 'B03 工具面：玩家版商店带一行可照抄的「买」动作（buy <道具名>）');

  /* 困难开局：档位跟着数值走 */
  const h = P('new', 'station', '--hard');
  const hardExp = tierOxy(resDef('oxygen').start.hard + enOxy);
  ok(new RegExp('💨 ' + oxyTxt + ' [█░]{10} ' + hardExp).test(h.out), '困难开局：文本条＋档位按数值算（困难 ' + resDef('oxygen').start.hard + ' − ' + (-enOxy) + ' → ' + hardExp + '）');

  /* 独立会话：玩家存 player-session.json，开发存 session.json；互不打扰 */
  ok(fs.existsSync(path.join(T, '.playtest', 'player-session.json')), '玩家会话存 player-session.json');
  ok(!fs.existsSync(path.join(T, '.playtest', 'session.json')), '玩家模式不写开发会话 session.json');
  play(['new', 'station'], T);
  play(['choose', '1'], T);                                   // 开发会话走到 18
  const ps = P('state');
  eq(ps.code, 0, '--player state 退出码 0');
  ok(ps.out.indexOf('困难') >= 0, '玩家会话还是自己那局（困难；开发会话的推进没串过来）');
  ok(ps.out.indexOf('── 详细状态 ──') >= 0 && ps.out.indexOf('⚔ 武力') < 0, '玩家版 state：有详细块、无武力');
  /* buy 后的整屏也走玩家渲染（防漏传 player 参数——审计发现过的漏洞） */
  const pb2 = P('buy', '合成料理');
  eq(pb2.code, 0, '--player buy 退出码 0');
  ok(!/💨\s*\d/.test(pb2.out) && !/🪙\s*\d/.test(pb2.out), '--player buy 后的整屏仍是玩家版（无资源数字）');
  ok(pb2.out.indexOf('　→ 买：buy ') >= 0, '--player buy 后的整屏带买家动作提示（B03 工具面）');
  ok(!/→ \d/.test(pb2.out), '--player buy 后的整屏不显示去向编号');

  /* B03：本关无灰显——4 号首访列表里既无 🔒 也无「（灰：」；缺前提的条目整条不出现 */
  const T2 = fs.mkdtempSync(path.join(os.tmpdir(), 'playtest-player2-'));
  const P2 = (...args) => play(['--player', ...args], T2);
  P2('new', 'station'); P2('choose', '1'); P2('choose', '4');     // 1 → 18 → 4（健身房）
  const p4 = P2('state');
  const st4 = C2.newState('normal'); st4.loc = '4';
  ok(C2.visibleChoices(st4).every(e => e.ok), '（前置）B03：4 号首访没有不可点项');
  ok(p4.out.indexOf('🔒') < 0 && p4.out.indexOf('（灰：') < 0, 'B03：玩家版整屏无 🔒／（灰： 标记');
  ok(p4.out.indexOf('请他帮忙打开仓库') >= 0, 'B03：未达前提的 4② 以「可尝试」形式上屏（场景说原因）');
  {
    /* 越界序号：错误路径与状态不变 */
    const n4 = C2.visibleChoices(st4).length;
    const lockErr = P2('choose', String(n4 + 1));
    ok(lockErr.code !== 0 && /不能执行|超出范围/.test(lockErr.err), '--player 选不存在的项 → 报错且不改状态');
    ok(lockErr.err.indexOf('需要：') < 0, '玩家版错误里不含机械理由（需要：…）');
  }

  /* 战斗例外：4 →（掰手腕）26 号，只有一场战斗；玩家版保留与网页版同款的对照 */
  const pb = P2('choose', '1');
  eq(pb.code, 0, '4 号掰手腕 → 26 退出码 0');
  const st26 = C2.newState('normal'); st26.loc = '26';
  const b26 = C2.visibleChoices(st26)[0];
  const ch26 = D2.nodes['26'].c[b26.ci];
  const mine = C2.atkOf(st26), need = C2.battleNeed(st26, ch26.battle);
  const chip = '你的武力值 ' + mine + (mine >= need ? ' ≥ ' : ' < ') + need;
  ok(pb.out.indexOf(chip) >= 0, '玩家版战斗选项保留「' + chip + '」对照（例外）');
  ok(pb.out.indexOf('→ 胜') < 0 && pb.out.indexOf('→ 负') < 0, '玩家版战斗选项不带胜负去向编号');

  /* 禁用：--json / load / auto；save 可用（留证据） */
  const j = play(['--player', '--json', 'state'], T2);
  ok(j.code !== 0 && /玩家模式/.test(j.out + j.err), '--player --json → 拒绝（玩家模式不用 --json）');
  const ld = P2('load', 'x.json');
  ok(ld.code !== 0 && /玩家模式/.test(ld.err), '--player load → 拒绝');
  const au = P2('auto', '--steps', '5');
  ok(au.code !== 0 && /玩家模式/.test(au.err), '--player auto → 拒绝');
  const sv = P2('save', 'p-snap.json');
  eq(sv.code, 0, '--player save 可用（留证据）');
  ok(fs.existsSync(path.join(T2, 'p-snap.json')), '玩家模式 save 真的写出快照文件');
  ok(sv.out.indexOf('load ') < 0, '玩家模式 save 的提示里不给 load 指引');
  const devLd = play(['load', 'x.json'], T2);
  ok(devLd.code !== 0 && !/玩家模式/.test(devLd.err), '开发模式 load 照常（禁用只针对玩家模式）');
}

/* ============ ⑨ read：翻看文本道具（E3）——未拥有报错 / 无正文提示 / 有正文只读不改状态 ============ */
{
  const C3 = loadCore('read');
  C3.selectLevel('station');
  const D3 = C3.currentLevel();
  const textIds = Object.keys(D3.items).filter(id => C3.itemText(id));
  ok(textIds.length >= 4, '数据里有 ≥4 件带正文的道具（R07）：' + textIds.join('、'));

  const T = fs.mkdtempSync(path.join(os.tmpdir(), 'playtest-read-'));
  play(['new', 'station'], T); play(['choose', '1'], T); play(['choose', '2'], T);    // 1 → 18 → 2（睡眠舱）
  const before = playJson(['state'], T).data;
  eq(before.node, '2', '（前置）在睡眠舱（拿到手电等）');
  const r1 = playJson(['read', textIds[0]], T);
  ok(r1.code !== 0, 'read 未拥有的「' + textIds[0] + '」→ 退出码非 0');
  ok(/手里没有/.test((r1.data && r1.data.error) || ''), '报错说明「你手里没有」');
  const after1 = playJson(['state'], T).data;
  eq(JSON.stringify(after1.state), JSON.stringify(before.state), 'read 报错不改任何状态');

  /* 有这件东西但没有正文 → 「没什么可读的」（不算错误） */
  const plain = before.state.items.map(x => x.id).find(id => !C3.itemText(id));
  ok(!!plain, '（前置）手里有无正文道具：' + plain);
  if (plain) {
    const r2 = play(['read', plain], T);
    eq(r2.code, 0, 'read 无正文道具「' + plain + '」→ 退出码 0（只是没内容）');
    ok(r2.out.indexOf('没什么可读的') >= 0, '无正文提示「没什么可读的」');
  }

  /* 有正文 + 已拥有 → 打印正文 = 数据里的 text（{me} 已换） */
  const tid = textIds[0];
  const st0 = C3.newState('normal'); st0.loc = '18'; st0.items = [tid];
  const snap = { v: 1, kind: 'playtest-snapshot', level: 'station', state: st0, log: [], steps: 0, savedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(T, 'read-snap.json'), JSON.stringify(snap));
  eq(play(['load', 'read-snap.json'], T).code, 0, 'load 注入快照（手里有「' + tid + '」）');
  const b2 = playJson(['state'], T).data;
  const r3 = playJson(['read', tid], T);
  eq(r3.code, 0, 'read 有正文的道具 → 退出码 0');
  eq(r3.data && r3.data.read && r3.data.read.text, C3.fillName(C3.itemText(tid), st0), 'read 输出正文 = 数据里的 items[].text（{me} 已替换）');
  const a2 = playJson(['state'], T).data;
  eq(JSON.stringify(a2.state), JSON.stringify(b2.state), 'read 成功也不改任何状态');

  /* 玩家模式 + read（体验师工具链）；未拥有同样明确报错 */
  const T2 = fs.mkdtempSync(path.join(os.tmpdir(), 'playtest-readp-'));
  play(['--player', 'new', 'station'], T2);
  const pr = play(['--player', 'read', tid], T2);
  ok(pr.code !== 0 && /手里没有/.test(pr.err), '--player read 未拥有 → 明确报错');
}

/* ============ ⑩ 文案稿导出（export-copy）：序章 / 道具正文 / say / lockText / tIf ============ */
{
  const mod = await import(pathToFileURL(path.join(ROOT, 'tools', 'export-copy.mjs')).href);
  eq(typeof mod.buildCopy, 'function', 'export-copy 暴露 buildCopy（被 import 时不执行 main）');
  const L = {
    meta: { title: '测试关', level: 'T', note: 'n', tagline: 't', prologue: { lines: ['序章第一句。', '第二句 {me}。'] } },
    start: { node: '1' }, resources: [], characters: {}, charOrder: [], help: ['帮助一条'],
    itemOrder: ['道具甲', '道具乙'],
    items: { '道具甲': { icon: '📕', text: '正文第一段。\n正文第二段。' }, '道具乙': { icon: '🔧' } },
    nodes: {
      '1': { n: '测试点', t: '主正文。', tIf: [{ cond: { item: '道具甲' }, t: '分叉正文。' }, { cond: { knows: '已修好' }, t: '第二版。' }],
        en: { oxygen: -5 },
        c: [{ l: '拿道具', fx: { gain: ['道具甲'] }, say: '旁白一句话。', lockText: '还不到时候', to: '2' }] },
      '2': { n: '终点', t: '到了。' }
    }
  };
  const md = mod.buildCopy(L, 'fixture');
  ok(md.indexOf('## 二、序章') >= 0 && md.indexOf('序章第一句。') >= 0 && md.indexOf('第二句 {me}。') >= 0, '导出含「序章」段与序章正文');
  ok(md.indexOf('## 五、道具正文') >= 0 && md.indexOf('正文第一段。') >= 0 && md.indexOf('正文第二段。') >= 0, '导出含「道具正文」段与正文（多段保留）');
  ok(md.indexOf('**可读**') >= 0, '道具表把带正文的道具标为「可读」');
  ok(md.indexOf('旁白：旁白一句话。') >= 0, '选项行带 say 旁白');
  ok(md.indexOf('灰显理由：还不到时候') >= 0, '选项行带 lockText');
  ok(md.indexOf('〔分叉·') >= 0 && md.indexOf('分叉正文。') >= 0 && md.indexOf('第二版。') >= 0, '节点带 tIf 分叉正文（逐条）');
  ok(md.indexOf('（本关没有序章）') < 0 && md.indexOf('（本关没有可读的道具正文）') < 0, '有内容时不出现占位符');
  /* 真实数据：station 现数据里带正文的道具全部进稿（B 数据落地后本段自动生效） */
  const C4 = loadCore('export');
  C4.selectLevel('station');
  const D4 = C4.currentLevel();
  const md2 = mod.buildCopy(D4, 'station');
  const t4 = Object.keys(D4.items).filter(id => C4.itemText(id));
  ok(t4.every(id => md2.indexOf(String(C4.itemText(id)).split('\n')[0].slice(0, 10)) >= 0), 'station 现数据：' + t4.length + ' 件道具正文全部进了导出稿');
}

/* ============ 汇总 ============ */
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* 临时目录清不掉也不影响结论 */ }
console.log('');
console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项。');
process.exit(fail ? 1 : 0);
