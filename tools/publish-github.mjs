// tools/publish-github.mjs —— 通过 GitHub REST API 发布本地提交到远端仓库
// 用途：① 直连 github.com:443（git push）不通时的备用通道；② 以后一键发布
// 用法：node tools/publish-github.mjs [--repo Skyfei996/new-task-game] [--branch main] [--dry]
// 令牌来源：环境变量 GITHUB_TOKEN，缺省时从 git 凭据管理器读取（不写入任何文件）
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : dflt; };
const REPO = arg('--repo', 'Skyfei996/new-task-game');
const BRANCH = arg('--branch', 'main');
const DRY = process.argv.includes('--dry');

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

function getToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  const out = execFileSync('git', ['credential', 'fill'], {
    cwd: ROOT, encoding: 'utf8',
    input: 'protocol=https\nhost=github.com\n\n',
  });
  const m = /^password=(.+)$/m.exec(out);
  if (!m) throw new Error('未从凭据管理器读到令牌（可设 GITHUB_TOKEN 环境变量）');
  return m[1].trim();
}
const TOKEN = getToken();
const API = (p) => 'https://api.github.com/repos/' + REPO + p;
async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github+json', 'User-Agent': 'publish-script', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch { /* 非 JSON */ }
  if (!res.ok) throw new Error(method + ' ' + url + ' → ' + res.status + ' ' + (json?.message || text.slice(0, 200)));
  return json;
}

// 1) 空仓库先放一个初始提交（GitHub 限制：无提交的仓库不能直接建 blob/tree/commit）
async function refSha(branch) { try { const r = await api('GET', API('/git/ref/heads/' + branch)); return r.object.sha; } catch { return null; } }
let remoteHead = await refSha(BRANCH);
if (!remoteHead && !DRY) {
  console.log('远端仓库为空 → 先写入初始提交（chore: 初始化仓库）');
  await api('PUT', API('/contents/README.md'), { message: 'chore: 初始化仓库', content: Buffer.from('# 你有一个新任务！\n\n本项目正在发布中……\n', 'utf8').toString('base64') });
  remoteHead = await refSha(BRANCH);
  console.log('  初始提交：' + String(remoteHead).slice(0, 8));
}

// 2) 取本地提交序列（按时间正序）与每个提交的文件快照
const shas = git('rev-list', '--reverse', 'HEAD').split('\n').filter(Boolean);
// 内容已是最新则跳过源码发布（避免重复提交）
let upToDate = false;
if (remoteHead && !DRY) {
  const rc = await api('GET', API('/git/commits/' + remoteHead));
  if (rc.tree && rc.tree.sha === git('rev-parse', 'HEAD^{tree}')) upToDate = true;
}
console.log('本地提交 ' + shas.length + ' 个，将依次发布到 ' + REPO + ' @ ' + BRANCH);

// 2) 逐个提交：建 blob → 建 tree → 建 commit → 最后更新分支
const blobCache = new Map();   // contentSHA1 → blob sha（同一内容复用）
let parent = null;
let lastCommit = null;
for (const sha of shas) {
  if (upToDate) { console.log('  （源码已是最新，跳过重复发布）'); break; }
  const message = git('log', '-1', '--format=%s%n%n%b', sha).trim();
  const files = git('ls-tree', '-r', '--name-only', sha).split('\n').filter(Boolean);
  if (DRY) { console.log('  [dry] ' + sha.slice(0, 8) + ' ' + files.length + ' 文件：' + message.split('\n')[0]); continue; }
  const tree = [];
  for (const f of files) {
    const buf = execFileSync('git', ['cat-file', 'blob', sha + ':' + f], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
    const contentHash = execFileSync('git', ['rev-parse', sha + ':' + f], { cwd: ROOT, encoding: 'utf8' }).trim();
    let blobSha = blobCache.get(contentHash);
    if (!blobSha) {
      const b = await api('POST', API('/git/blobs'), { content: buf.toString('base64'), encoding: 'base64' });
      blobSha = b.sha; blobCache.set(contentHash, blobSha);
    }
    tree.push({ path: f, mode: '100644', type: 'blob', sha: blobSha });
  }
  const t = await api('POST', API('/git/trees'), { tree });
  const c = await api('POST', API('/git/commits'), { message, tree: t.sha, parents: parent ? [parent] : (remoteHead ? [remoteHead] : []) });
  parent = c.sha; lastCommit = c.sha;
  console.log('  ✓ ' + c.sha.slice(0, 8) + '  ' + message.split('\n')[0] + '（' + files.length + ' 文件）');
}

if (!DRY) {
  if (!upToDate) {
    // 3) 更新/创建分支引用
    let created = false;
    try { await api('PATCH', API('/git/refs/heads/' + BRANCH), { sha: lastCommit, force: true }); }
    catch { await api('POST', API('/git/refs'), { ref: 'refs/heads/' + BRANCH, sha: lastCommit }); created = true; }
    console.log('✓ 源码已推送：' + (created ? '新建' : '更新') + ' 分支 ' + BRANCH + ' → ' + lastCommit.slice(0, 8));
  }

  // 4) 构建体验版并发布到 gh-pages 分支（Pages 用；不依赖 Actions，避开 workflow 权限）
  const PAGES_BRANCH = arg('--pages-branch', 'gh-pages');
  console.log('构建体验版（node tools/build-public.mjs）…');
  execFileSync(process.execPath, [path.join(HERE, 'build-public.mjs')], { cwd: ROOT, stdio: 'inherit' });
  const DIST = path.join(ROOT, 'dist');
  const walk = (d, base = '') => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name), base + e.name + '/') : [base + e.name]);
  const distFiles = walk(DIST).filter(f => !f.startsWith('.build-marker'));
  const pTree = [];
  for (const f of distFiles) {
    const buf = fs.readFileSync(path.join(DIST, f));
    const b = await api('POST', API('/git/blobs'), { content: buf.toString('base64'), encoding: 'base64' });
    pTree.push({ path: f, mode: '100644', type: 'blob', sha: b.sha });
  }
  const pt = await api('POST', API('/git/trees'), { tree: pTree });
  const pHead = await refSha(PAGES_BRANCH);
  const pc = await api('POST', API('/git/commits'), {
    message: 'deploy: 发布体验版（' + new Date().toISOString().slice(0, 16).replace('T', ' ') + '）',
    tree: pt.sha, parents: pHead ? [pHead] : [],
  });
  try { await api('PATCH', API('/git/refs/heads/' + PAGES_BRANCH), { sha: pc.sha, force: true }); }
  catch { await api('POST', API('/git/refs'), { ref: 'refs/heads/' + PAGES_BRANCH, sha: pc.sha }); }
  console.log('✓ 体验版已发布到 ' + PAGES_BRANCH + ' → ' + pc.sha.slice(0, 8) + '（' + distFiles.length + ' 个文件）');

  // 5) 把 Pages 指到该分支（已配置过则忽略错误）
  try {
    await api('PUT', API('/pages'), { build_type: 'legacy', source: { branch: PAGES_BRANCH, path: '/' } });
    console.log('✓ GitHub Pages 已指向 ' + PAGES_BRANCH + ' 分支');
  } catch (e) {
    console.log('（Pages 配置未变更：' + e.message.split(' → ').slice(-1)[0] + '）');
  }
  console.log('  仓库：https://github.com/' + REPO);
  console.log('  在线体验：https://' + REPO.split('/')[0].toLowerCase() + '.github.io/' + REPO.split('/')[1] + '/');
}
