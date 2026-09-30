// tools/build-public.mjs —— 打包「体验版」
// 默认：两个关卡都打（原创《空间站大停摆》 + Demo《勇闯大里姆》）——用于私域体验（只发给指定的人）
// 加 --original-only：只打原创关卡（若将来要完全公开，用这个，避免书包插图外流）
// 产物：dist/  （可直接拖到 Netlify Drop / 传到静态托管 / 推 GitHub Pages / 打 ZIP 发朋友）
// 用法：node tools/build-public.mjs [--original-only]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ONLY_ORIGINAL = process.argv.includes('--original-only');
const DIST = path.join(ROOT, ONLY_ORIGINAL ? 'dist-original' : 'dist');
const MARK = path.join(DIST, '.build-marker');

// —— 安全清理：只删除本脚本自己生成的目录（辨认标记文件）——
if (fs.existsSync(DIST)) {
  if (fs.existsSync(MARK)) fs.rmSync(DIST, { recursive: true, force: true });
  else { console.error('✗ ' + path.relative(ROOT, DIST) + '/ 已存在但不是本脚本生成的（缺 .build-marker）——为安全起见不删除，请手动处理。'); process.exit(1); }
}
const put = (rel, content) => { const p = path.join(DIST, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); };
const copy = (rel) => { const p = path.join(DIST, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.copyFileSync(path.join(ROOT, rel), p); };

// 1) 主入口：按打包模式决定是否保留 Demo 关卡
let html = fs.readFileSync(path.join(ROOT, 'prototype/index.html'), 'utf8');
if (ONLY_ORIGINAL) html = html.replace(/\s*<script src="levels\/dalim\.js"><\/script>/, '\n<!-- 仅原创关卡打包：不含 Demo -->');
html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">');
put('prototype/index.html', html);

// 2) 引擎、样式、关卡数据
copy('prototype/engine.js');
copy('prototype/style.css');
copy('prototype/levels/station.js');
if (!ONLY_ORIGINAL) copy('prototype/levels/dalim.js');

// 3) 素材：按关卡数据里的引用自动收集（原创关卡 + Demo 关卡）
const levelFiles = ONLY_ORIGINAL ? ['prototype/levels/station.js'] : ['prototype/levels/station.js', 'prototype/levels/dalim.js'];
const refs = new Set();
for (const lf of levelFiles) for (const m of fs.readFileSync(path.join(ROOT, lf), 'utf8').matchAll(/\.\.\/(images\/[^'"]+)/g)) refs.add(m[1]);
refs.forEach(copy);

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
包含两关：原创《空间站大停摆》 + Demo《勇闯大里姆》
说明：进度存在你自己的浏览器里（换浏览器/清缓存会重新开始）

想把链接发给朋友，三种办法（任选其一）：
1) GitHub Pages：把本目录推到一个仓库，Settings → Pages → 选 main 分支 → 得到网址
2) Netlify Drop：打开 https://app.netlify.com/drop ，把整个文件夹拖进去 → 秒出一个网址
3) 直接发文件：把本文件夹压成 ZIP 发给朋友，解压后双击 index.html 也能玩

再次提醒：内含从实体书翻拍/裁剪的素材，仅供个人体验，请勿公开传播。
`);

// 5) 自检：素材齐全 + 模式正确
const missing = [];
for (const r of refs) if (!fs.existsSync(path.join(DIST, r))) missing.push(r);
const builtHtml = fs.readFileSync(path.join(DIST, 'prototype/index.html'), 'utf8');
if (ONLY_ORIGINAL && /dalim\.js/.test(builtHtml)) missing.push('!(仅原创模式却仍引用 Demo)');
if (!ONLY_ORIGINAL && !/dalim\.js/.test(builtHtml)) missing.push('!(含 Demo 模式却丢了 Demo 引用)');
if (!fs.existsSync(path.join(DIST, 'prototype/levels/' + (ONLY_ORIGINAL ? 'station.js' : 'dalim.js')))) missing.push('!(关卡数据缺失)');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : files.push(p); } })(DIST);
let bytes = 0; files.forEach(f => bytes += fs.statSync(f).size);
fs.writeFileSync(MARK, `built ${new Date().toISOString()} mode=${ONLY_ORIGINAL ? 'original-only' : 'with-demo'}\n`);
console.log('✓ 打包完成：' + path.relative(ROOT, DIST) + '/（模式：' + (ONLY_ORIGINAL ? '仅原创关卡' : '两关含 Demo') + '）');
console.log('  文件 ' + files.length + ' 个，共 ' + (bytes / 1024 / 1024).toFixed(1) + ' MB');
console.log('  素材 ' + refs.size + ' 个：' + [...refs].map(r => path.basename(r)).join('、'));
if (missing.length) { console.error('✗ 自检失败：' + missing.join('、')); process.exit(1); }
console.log('✓ 自检通过');
