// tools/build-public.mjs —— 打包「体验版」
// 默认：两个关卡都打（原创《空间站大停摆》 + Demo《勇闯大里姆》）——用于私域体验（只发给指定的人）
//   ＋旧版存档 archive/（2026-10-01 旧版快照，对照用）整棵打进 dist/archive/，并生成 dist/archive.html 入口页
// 加 --original-only：只打原创关卡（若将来要完全公开，用这个，避免书包插图外流；该模式不含旧版存档——存档含书包素材）
// 产物：dist/  （可直接拖到 Netlify Drop / 传到静态托管 / 推 GitHub Pages / 打 ZIP 发朋友）
// 用法：node tools/build-public.mjs [--original-only]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ONLY_ORIGINAL = process.argv.includes('--original-only');
const DIST = path.join(ROOT, ONLY_ORIGINAL ? 'dist-original' : 'dist');
const MARK = path.join(DIST, '.build-marker');
// 旧版存档基线（2026-10-01 gh-pages 部署快照）：26 件 / 3340093 字节——有意更新存档时同步改这里
const ARCHIVE_FILES = 26;
const ARCHIVE_BYTES = 3340093;

// —— 安全清理：只删除本脚本自己生成的目录（辨认标记文件）——
if (fs.existsSync(DIST)) {
  if (fs.existsSync(MARK)) fs.rmSync(DIST, { recursive: true, force: true });
  else { console.error('✗ ' + path.relative(ROOT, DIST) + '/ 已存在但不是本脚本生成的（缺 .build-marker）——为安全起见不删除，请手动处理。'); process.exit(1); }
}
// 先落标记再开写：中途失败留下的半成品目录，下次运行可被上面这段自动清理（无需人工处理）
fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(MARK, `building ${new Date().toISOString()} mode=${ONLY_ORIGINAL ? 'original-only' : 'with-demo'}\n`);
const missing = [];
const put = (rel, content) => { const p = path.join(DIST, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); };
const copy = (rel) => { const p = path.join(DIST, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.copyFileSync(path.join(ROOT, rel), p); };
// 目录递归复制（保持相对结构）——旧版存档整棵入库打包用
const walkDir = (d, base = '') => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walkDir(path.join(d, e.name), base + e.name + '/') : [base + e.name]);
const copyDir = (rel, destDir) => {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) { console.error('✗ ' + rel + '/ 不存在——旧版存档缺失，不能打包。'); process.exit(1); }
  for (const f of walkDir(src)) { const p = path.join(destDir, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.copyFileSync(path.join(src, f), p); }
};

// 旧版存档入口页（dist/archive.html）：列出两个旧版游戏的可玩入口 + 回新版链接
const ARCHIVE_PAGE = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>旧版存档 · 对照用 — 你有一个新任务！</title>
<style>body{font-family:system-ui,sans-serif;background:#0b1020;color:#dbe6f5;margin:0;line-height:1.7}.wrap{max-width:640px;margin:0 auto;padding:40px 20px 56px}h1{font-size:22px;margin:0 0 10px}.dim{opacity:.75}.small{font-size:13px}.card{border:1px solid #2a3a55;border-radius:12px;padding:14px 18px;margin:14px 0;background:#111a30}.card h2{font-size:17px;margin:0 0 4px}.card p{margin:4px 0}a.big{display:inline-block;margin-top:8px;color:#0b1020;background:#6cf;text-decoration:none;padding:8px 14px;border-radius:8px;font-weight:600}a.plain{color:#6cf}</style>
</head><body><div class="wrap">
<h1>旧版存档 · 对照用</h1>
<p class="dim">这里是新版发布之前的旧版网页（<b>2026-10-01 版</b>），保留给朋友对照体验。旧版的两个游戏都在同一个「旧版选关页」里，进入后选对应关卡开始。</p>
<div class="card">
  <h2>《空间站大停摆》（旧版）</h2>
  <p class="dim small">木星轨道 · 晨星号——旧版界面与旧版关卡数据</p>
  <a class="big" href="archive/prototype/index.html">进入旧版 → 选《空间站大停摆》开始</a>
</div>
<div class="card">
  <h2>《勇闯大里姆》（演示关 · 旧版）</h2>
  <p class="dim small">实体书 Demo——同样是旧版界面</p>
  <a class="big" href="archive/prototype/index.html">进入旧版 → 选《勇闯大里姆》开始</a>
</div>
<p class="small"><a class="plain" href="./index.html">← 回到新版（当前线上版）</a></p>
<p class="small dim">本页仅供个人对照体验，请勿公开转发或传播。</p>
</div></body></html>`;

// 0) 先重生成管理台的文档数据源（prototype/lab-docs.js）——保证发布包里的文档是最新的
{
  const r = spawnSync(process.execPath, [path.join(HERE, 'build-lab.mjs')], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('✗ tools/build-lab.mjs 失败（退出码 ' + r.status + '）——先修好它再打包。'); process.exit(1); }
}

// 1) 主入口：按打包模式决定是否保留 Demo 关卡
let html = fs.readFileSync(path.join(ROOT, 'prototype/index.html'), 'utf8');
if (ONLY_ORIGINAL) html = html.replace(/\s*<script src="levels\/dalim\.js"><\/script>/, '\n<!-- 仅原创关卡打包：不含 Demo -->');
html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">');
put('prototype/index.html', html);

// 2) 引擎、样式、关卡数据
copy('prototype/engine.js');
copy('prototype/style.css');
copy('prototype/style-ui.css');   // B04：界面新面（index.html 第二张样式表；此前漏拷会致发布版丢样式）
copy('prototype/levels/station.js');
if (!ONLY_ORIGINAL) copy('prototype/levels/dalim.js');

// 2.5) 管理台（试玩器 + 设计资料 + 美术需求）：lab-docs.js 是上一步刚生成的
put('prototype/lab.html', (() => {
  let lab = fs.readFileSync(path.join(ROOT, 'prototype/lab.html'), 'utf8');
  if (ONLY_ORIGINAL) lab = lab.replace(/\s*<script src="levels\/dalim\.js"><\/script>/, '\n<!-- 仅原创关卡打包：不含 Demo -->');
  return lab.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">');
})());
copy('prototype/lab.js');
copy('prototype/lab.css');
copy('prototype/lab-docs.js');

// 3) 素材：按关卡数据里的引用自动收集（原创关卡 + Demo 关卡）
const levelFiles = ONLY_ORIGINAL ? ['prototype/levels/station.js'] : ['prototype/levels/station.js', 'prototype/levels/dalim.js'];
const refs = new Set();
for (const lf of levelFiles) for (const m of fs.readFileSync(path.join(ROOT, lf), 'utf8').matchAll(/\.\.\/(images\/[^'"]+)/g)) refs.add(m[1]);
for (const r of refs) { if (fs.existsSync(path.join(ROOT, r))) copy(r); else missing.push(r + '（关卡引用的素材缺失——先补齐素材再打包）'); }

// 3.5) 旧版存档（对照用）：archive/ 整棵 → dist/archive/，并生成根入口页 archive.html
if (ONLY_ORIGINAL) {
  console.log('（仅原创模式：不含旧版存档 archive/ 与 archive.html——存档含书包素材）');
} else {
  copyDir('archive', path.join(DIST, 'archive'));
  put('archive.html', ARCHIVE_PAGE);
}

// 4) 根入口（跳转页）+ 使用说明 + .nojekyll（GitHub Pages 用）
put('index.html', `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>你有一个新任务！· 体验版</title>
<meta http-equiv="refresh" content="0; url=prototype/index.html">
<style>body{font-family:system-ui,sans-serif;background:#0b1020;color:#dbe6f5;display:flex;height:100vh;margin:0;align-items:center;justify-content:center;text-align:center;line-height:1.8}a{color:#6cf}</style>
</head><body><div><p>正在进入游戏……若没有自动跳转，请点 <a href="prototype/index.html">这里</a>。</p>
<p style="opacity:.55;font-size:13px">本页面仅供个人体验与反馈，请勿公开转发或传播。</p></div></body></html>`);
put('.nojekyll', '');
put('README.txt', `《你有一个新任务！》体验版（家庭自用 · 请勿转发）
====================================================

怎么玩：打开 index.html（或 prototype/index.html）
包含两关：原创《空间站大停摆》 + Demo《勇闯大里姆》${ONLY_ORIGINAL ? '' : '\n旧版对照：打开 archive.html（2026-10-01 旧版存档，含旧版两个游戏）'}
说明：进度存在你自己的浏览器里（换浏览器/清缓存会重新开始）

管理台（给剧本打磨用）：打开 prototype/lab.html
  · 试玩器：纯文字推进，跟网页版共用同一套规则——快速试剧情、试分支
  · 设计资料 / 美术需求：内嵌的设计档与美术任务单（只读快照）

想把链接发给朋友，三种办法（任选其一）：
1) GitHub Pages：把本目录推到一个仓库，Settings → Pages → 选 main 分支 → 得到网址
2) Netlify Drop：打开 https://app.netlify.com/drop ，把整个文件夹拖进去 → 秒出一个网址
3) 直接发文件：把本文件夹压成 ZIP 发给朋友，解压后双击 index.html 也能玩

再次提醒：内含从实体书翻拍/裁剪的素材，仅供个人体验，请勿公开传播。
`);

// 5) 自检：素材齐全 + 模式正确（missing 自步骤 3 起累计）
const builtHtml = fs.readFileSync(path.join(DIST, 'prototype/index.html'), 'utf8');
if (ONLY_ORIGINAL && /dalim\.js/.test(builtHtml)) missing.push('!(仅原创模式却仍引用 Demo)');
if (!ONLY_ORIGINAL && !/dalim\.js/.test(builtHtml)) missing.push('!(含 Demo 模式却丢了 Demo 引用)');
if (!fs.existsSync(path.join(DIST, 'prototype/levels/' + (ONLY_ORIGINAL ? 'station.js' : 'dalim.js')))) missing.push('!(关卡数据缺失)');
['prototype/lab.html', 'prototype/lab.js', 'prototype/lab.css', 'prototype/lab-docs.js']
  .forEach(f => { if (!fs.existsSync(path.join(DIST, f))) missing.push(f + '（管理台文件）'); });
if (ONLY_ORIGINAL && /levels\/dalim\.js/.test(fs.readFileSync(path.join(DIST, 'prototype/lab.html'), 'utf8'))) missing.push('!(仅原创模式：lab.html 仍引用 Demo)');
// 5.1) 页面本地引用逐条在包内（game/lab/archive 三个页面；防「漏拷样式表/脚本」类发布事故）
const checkPageRefs = (distRel) => {
  const abs = path.join(DIST, distRel);
  if (!fs.existsSync(abs)) { missing.push(distRel + '（页面缺失）'); return; }
  for (const m of fs.readFileSync(abs, 'utf8').matchAll(/(?:href|src)="([^"]+)"/g)) {
    const v = m[1].split('#')[0].split('?')[0];          // 去锚点/查询串再查文件
    if (!v || /^(https?:|data:|mailto:)/.test(v) || v.startsWith('/')) continue;   // 外链与站内绝对路径不查
    if (!fs.existsSync(path.join(path.dirname(abs), v))) missing.push(distRel + ' 引用缺失：' + v);
  }
};
['prototype/index.html', 'prototype/lab.html'].forEach(checkPageRefs);
// 5.1b) noindex 注入自检（meta 替换失败会静默漏网）
['prototype/index.html', 'prototype/lab.html'].concat(ONLY_ORIGINAL ? [] : ['archive.html'])
  .forEach(f => { if (!/name="robots" content="noindex/.test(fs.readFileSync(path.join(DIST, f), 'utf8'))) missing.push(f + '（缺 noindex）'); });
// 5.2) 旧版存档完整性（对照用，逐件不可丢；基线＝2026-10-01 部署快照）
if (!ONLY_ORIGINAL) {
  checkPageRefs('archive.html');
  const af = walkDir(path.join(DIST, 'archive'));
  let ab = 0; for (const f of af) ab += fs.statSync(path.join(DIST, 'archive', f)).size;
  if (af.length !== ARCHIVE_FILES || ab !== ARCHIVE_BYTES) missing.push('!(archive 与基线不符：' + af.length + ' 件/' + ab + ' 字节，基线 ' + ARCHIVE_FILES + ' 件/' + ARCHIVE_BYTES + '——若为有意更新存档，请同步 tools/build-public.mjs 基线常量)');
  ['index.html', 'prototype/index.html', 'prototype/engine.js', 'prototype/levels/station.js', 'images/station/deck1-v1.jpg']
    .forEach(f => { if (!fs.existsSync(path.join(DIST, 'archive', f))) missing.push('archive/' + f + '（旧版存档缺失）'); });
}
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : files.push(p); } })(DIST);
let bytes = 0; files.forEach(f => bytes += fs.statSync(f).size);
fs.writeFileSync(MARK, `built ${new Date().toISOString()} mode=${ONLY_ORIGINAL ? 'original-only' : 'with-demo'}\n`);
console.log('✓ 打包完成：' + path.relative(ROOT, DIST) + '/（模式：' + (ONLY_ORIGINAL ? '仅原创关卡' : '两关含 Demo ＋ 旧版存档 archive/') + '）');
console.log('  文件 ' + files.length + ' 个，共 ' + (bytes / 1024 / 1024).toFixed(1) + ' MB');
console.log('  素材 ' + refs.size + ' 个：' + [...refs].map(r => path.basename(r)).join('、'));
if (missing.length) { console.error('✗ 自检失败：' + missing.join('、')); process.exit(1); }
console.log('✓ 自检通过');
