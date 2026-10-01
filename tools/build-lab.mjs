// tools/build-lab.mjs —— 生成网页管理台（prototype/lab.html）的数据源 prototype/lab-docs.js
// 做什么：扫描设计/美术文档（docs/*.md、docs/prompts/*.md、art/*.md、art/tasks/*.md），
//         把每篇的正文内嵌进一份 JS：window.LAB_DOCS = { generatedAt, files, docs:[{group,path,title,desc,text}] }
// 为什么内嵌：管理台要能「双击 lab.html」直接在 file:// 下打开——浏览器会拒绝本地 fetch，所以必须内嵌。
// 用法：node tools/build-lab.mjs
// 约定：lab-docs.js 是生成物，不要手改；改了 .md 源文件后重跑本脚本（或 node tools/build-public.mjs，它也会跑这一步）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'prototype', 'lab-docs.js');

/* 扫描清单：group 决定文档在管理台哪个标签页里出现（design=设计资料 / art=美术需求） */
const PLAN = [
  { group: 'design', dir: 'docs', match: f => f.endsWith('.md') },
  { group: 'design', dir: 'docs/prompts', match: f => f.endsWith('.md') },
  { group: 'art', dir: 'art', match: f => f.endsWith('.md') },
  { group: 'art', dir: 'art/tasks', match: f => f.endsWith('.md') }
];

function mdFiles(dir, match) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter(match).sort().map(f => path.posix.join(dir, f));
}
/* 标题 = 第一个 # 标题；没有就用文件名 */
function titleOf(text, file) {
  const m = text.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].replace(/\s*#+\s*$/, '').trim() : path.posix.basename(file);
}
/* 一句话说明 = 标题之后的第一段实文（跳过空行/标题/引用块/代码围栏），去掉 markdown 记号后截断 */
function descOf(text, title) {
  const lines = text.split('\n');
  for (let raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line === ('# ' + title) || /^#{1,6}\s/.test(line)) continue;
    if (/^(```|~~~)/.test(line) || /^\|/.test(line) || /^---+$/.test(line)) continue;
    let s = line
      .replace(/^>\s*/, '')
      .replace(/^[-*+]\s+/, '')
      .replace(/^\[[ xX]\]\s*/, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    if (!s) continue;
    const cut = s.search(/[。！？；]/);
    if (cut > 6 && cut < 60) s = s.slice(0, cut + 1);
    return s.length > 96 ? s.slice(0, 95) + '…' : s;
  }
  return '';
}

const docs = [];
for (const p of PLAN) {
  for (const file of mdFiles(p.dir, p.match)) {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
    const title = titleOf(text, file);
    docs.push({ group: p.group, path: file, title, desc: descOf(text, title), text });
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  files: docs.map(d => d.path),
  docs
};
const js = [
  '/* 由 tools/build-lab.mjs 生成 —— 不要手改；改 .md 源文件后重跑：node tools/build-lab.mjs */',
  '/* 管理台（prototype/lab.html）用：内嵌文档正文，这样 file:// 双击打开也能看（本地 fetch 会被浏览器拒绝）。 */',
  'window.LAB_DOCS = ' + JSON.stringify(payload, null, 2) + ';',
  ''
].join('\n');

fs.writeFileSync(OUT, js);
const design = docs.filter(d => d.group === 'design').length;
const art = docs.filter(d => d.group === 'art').length;
console.log('✓ 已生成管理台数据源：' + path.relative(ROOT, OUT).replace(/\\/g, '/'));
console.log('  文档 ' + docs.length + ' 篇（设计资料 ' + design + ' 篇 / 美术需求 ' + art + ' 篇），' + (Buffer.byteLength(js, 'utf8') / 1024).toFixed(1) + ' KB');
console.log('  清单：' + docs.map(d => d.path).join('、'));
if (!docs.length) { console.error('✗ 一篇文档都没扫到——检查 PLAN 里的目录（docs/、art/）'); process.exit(1); }
