// 无头试玩器（tools/play.mjs）自测：node prototype/test.play.mjs
// 覆盖：① A 路线真走一遍到结局 41（CLI 进程级）  ② --json 字段齐全  ③ 不可执行 choose 报错且不换节点
//       ④ auto 冒烟 + 可复现  ⑤ 会话 save/load 往返一致  ⑥ Core.visibleChoices 只读助手（不改行为）
//       ⑦ 管理台数据源 prototype/lab-docs.js（build-lab.mjs 的产物）
// 说明：CLI 在临时目录里跑（会话文件 .playtest/session.json 落在临时目录，不碰仓库里的真实会话）。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

/* ============ ① A 路线：从食堂一路走到结局 41（CLI 真跑，进程级） ============ */
// 每一步 = [当前节点, 选项序号（1 起，含灰显项在界面上的位置）, 执行后应在的节点]
const ROUTE = [
  ['1', 1, '18'], ['18', 2, '2'], ['2', 1, '18'], ['18', 4, '4'], ['4', 3, '18'],
  ['18', 5, '5'], ['5', 1, '28'], ['28', 1, '5'], ['5', 2, '18'], ['18', 3, '3'],
  ['3', 1, '24'], ['24', 1, '18'], ['18', 6, '20'], ['20', 2, '7'], ['7', 1, '25'],
  ['25', 1, '16'], ['16', 5, '16'], ['16', 3, '38'], ['38', 1, '21'], ['21', 8, '18'],
  ['18', 4, '4'], ['4', 2, '27'], ['27', 1, '18'], ['18', 6, '20'], ['20', 5, '10'],
  ['10', 2, '32'], ['32', 1, '20'], ['20', 6, '11'], ['11', 1, '19'], ['19', 1, '39'],
  ['39', 1, '11'], ['11', 2, '20'], ['20', 8, '21'], ['21', 4, '15'], ['15', 1, '36'],
  ['36', 1, '21'], ['21', 1, '12'], ['12', 1, '34'], ['34', 1, '40'], ['40', 1, '41']
];

/* 首屏（人类可读块） */
{
  const r = play(['new', 'station']);
  eq(r.code, 0, 'new station 退出码 0（首屏正常）');
  ok(r.out.indexOf('══ 当前位置 ══') >= 0, '首屏有「══ 当前位置 ══」块');
  ok(r.out.indexOf('选项：') >= 0 && /1\) 摸黑去中央大厅/.test(r.out), '首屏列出选项（1) 摸黑去中央大厅）');
  ok(r.out.indexOf('状态：🪙 20') >= 0 && r.out.indexOf('💨 100') >= 0, '首屏状态行有资源 🪙 20 / 💨 100');
  ok(r.err === '', '首屏 stderr 干净');
}

/* 逐条 choose 走到结局 41；把走过的命令序列记下来（报告里要用） */
const seq = ['node tools/play.mjs new station'];
{
  let cur = '1', steps = 0;
  for (const [at, choice, expect] of ROUTE) {
    eq(cur, at, '（命令序列自检）第 ' + (steps + 1) + ' 步应在 ' + at + ' 号节点');
    const r = playJson(['choose', String(choice)]);
    eq(r.code, 0, 'choose ' + choice + ' @' + at + ' 退出码 0' + (r.code === 0 ? '' : '｜stderr: ' + r.err.trim()));
    eq(r.data && r.data.node, expect, 'choose ' + choice + ' @' + at + ' → ' + expect + ' 号节点');
    cur = expect;
    steps++;
    seq.push('node tools/play.mjs choose ' + choice + '   # @' + at + ' → ' + expect);
  }
  const r = playJson(['state']);
  eq(r.code, 0, '结局后 state 退出码 0');
  eq(r.data && r.data.node, '41', '走到结局 41（结局 A · 圆满）');
  eq(r.data && r.data.state && r.data.state.ended, 'win', '41 号标记为通关（ended=win）');
  eq(r.data && r.data.name, '结局 A · 圆满', '41 号节点名 = 结局 A · 圆满');
  eq(r.data && r.data.state && r.data.state.resources.oxygen, 140, 'A 路线结束时氧气 140（100 + 65 补给 − 25 消耗）');
  eq(r.data && r.data.state && r.data.state.resources.coins, 20, 'A 路线不需要花信用点（结束时 20 枚）');
  eq(r.data && r.data.choices.length, 0, '结局节点没有可执行选项');
  ok(r.data.state.items.some(it => it.nosell && /焊接枪|控制芯片|冷却剂罐|站长授权卡|磁力靴|星尘矿石/.test(it.id)),
    'JSON 里带红框（nosell）标记：' + r.data.state.items.filter(it => it.nosell).map(it => it.id).join('/'));
  const human = play(['items']);
  ok(human.out.indexOf('【红框·关键·不可卖】') >= 0, '人类可读的 items 里也标出红框道具');
}
console.log('A 路线命令序列（' + (seq.length - 1) + ' 条 choose）：');
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
  ok(/操作流水（共 41 条，显示最后 3 条）/.test(lg.out), 'log --tail 3 说明总数与显示条数');
  eq((lg.out.match(/^\s+\d+\. /gm) || []).length, 3, 'log --tail 3 只输出 3 条');
  const lgAll = play(['log']);
  ok(/操作流水（共 41 条）/.test(lgAll.out), 'log 默认显示全部（41 条：开局 1 + choose 40）');
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
  eq(r.data.state.resources.oxygen, 80, '困难模式开局氧气 80');
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
  const bad = playJson(['choose', '2']);   // 「请他帮忙打开仓库」需要「老布的委托」——现在是灰的
  ok(bad.code !== 0, 'choose 一个灰显选项 → 退出码非 0');
  ok(!!bad.data && bad.data.ok === false && /不能执行/.test(bad.data.error || ''), '--json 里带清晰的错误信息');
  ok(/老布的委托/.test(bad.data.error || ''), '错误里说明了缺什么（老布的委托）');
  const after = playJson(['state']).data;
  eq(after.node, '4', '不可执行的 choose 不换节点（仍在 4）');
  eq(after.state.steps, before.state.steps, '不可执行的 choose 不推进步数');
  eq(JSON.stringify(after.state), JSON.stringify(before.state), '不可执行的 choose 不改任何状态');
  const human = play(['choose', '2']);
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
  /* 灰显项：ok=false 且 why 与 lockReason 同源 */
  const st4 = C.newState('normal');
  C.go(st4, '4');
  const list4 = C.visibleChoices(st4);
  eq(list4.length, 3, '健身房：3 个选项（其中 1 个灰显）');
  eq(list4[1].ok, false, '灰显项 ok=false');
  eq(list4[1].why, C.lockReason(C.currentLevel().nodes['4'].c[1]), '灰显理由 = Core.lockReason（同一套文案）');
  eq(list4[0].ok && list4[2].ok, true, '其他选项 ok=true');
  ok(list4.every((x, k) => x.i === k + 1), 'i 从 1 连续编号');
  ok(list4.every(x => x.ci >= 0 && x.ci < C.currentLevel().nodes['4'].c.length), 'ci 是 node.c 的下标');
  /* 站位错位检查：ci 与该显示项对应的原始选项一致 */
  eq(C.currentLevel().nodes['4'].c[list4[1].ci].l.indexOf('请他帮忙打开仓库') >= 0, true, '灰显项 ci 指向正确的原始选项');
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

/* ============ 汇总 ============ */
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* 临时目录清不掉也不影响结论 */ }
console.log('');
console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项。');
process.exit(fail ? 1 : 0);
