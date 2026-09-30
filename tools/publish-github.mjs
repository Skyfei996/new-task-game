// tools/publish-github.mjs —— 通过 GitHub REST API 发布（源码 → main，体验版 → gh-pages，并请求 Pages 构建）
// 为什么不用 git push：本机直连 github.com:443 常被墙（api.github.com 可通）；API 通道更稳。
// 用法：node tools/publish-github.mjs [--repo Skyfei996/new-task-game] [--branch main] [--pages-branch gh-pages] [--dry]
// 特性：① 空仓库自动初始化；② 增量发布（远端已有的提交不重发）；③ 提交对象与本地 SHA 一致（作者/时间原样带上）
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
const PAGES_BRANCH = arg('--pages-branch', 'gh-pages');
const DRY = process.argv.includes('--dry');
const FORCE_ALL = process.argv.includes('--all');   // 强制全量重发（用于把远端历史与本地对齐）
const OWNER = REPO.split('/')[0], NAME = REPO.split('/')[1];

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

function getToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  const out = execFileSync('git', ['credential', 'fill'], { cwd: ROOT, encoding: 'utf8', input: 'protocol=https\nhost=github.com\n\n' });
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
  if (!res.ok) throw new Error(method + ' ' + url.replace('https://api.github.com/repos/' + REPO, '') + ' → ' + res.status + ' ' + (json?.message || text.slice(0, 200)));
  return json;
}
const refSha = async (branch) => { try { const r = await api('GET', API('/git/ref/heads/' + branch)); return r.object.sha; } catch { return null; } };
const setRef = async (branch, sha) => {
  try { await api('PATCH', API('/git/refs/heads/' + branch), { sha, force: true }); return false; }
  catch { await api('POST', API('/git/refs'), { ref: 'refs/heads/' + branch, sha }); return true; }
};

// 1) 空仓库先放一个初始提交（GitHub 限制：无提交的仓库不能直接建 blob/tree/commit）
let remoteHead = await refSha(BRANCH);
if (!remoteHead && !DRY) {
  console.log('远端仓库为空 → 先写入初始提交（chore: 初始化仓库）');
  await api('PUT', API('/contents/README.md'), { message: 'chore: 初始化仓库', content: Buffer.from('# 你有一个新任务！\n\n本项目正在发布中……\n', 'utf8').toString('base64') });
  remoteHead = await refSha(BRANCH);
  console.log('  初始提交：' + String(remoteHead).slice(0, 8));
}

// 2) 本地提交序列（时间正序）；用「树 SHA」判断远端已到哪一步 → 增量发布
const all = git('rev-list', '--reverse', 'HEAD').split('\n').filter(Boolean);
const localTrees = git('log', '--reverse', '--format=%T', 'HEAD').split('\n').filter(Boolean);
let startAt = 0;
if (remoteHead && !DRY && !FORCE_ALL) {
  try {
    const rc = await api('GET', API('/git/commits/' + remoteHead));
    const i = localTrees.indexOf(rc.tree?.sha);
    startAt = i >= 0 ? i + 1 : 0;
  } catch { startAt = 0; }
}
const todo = all.slice(startAt);
console.log('本地提交 ' + all.length + ' 个，本次需发布 ' + todo.length + ' 个 → ' + REPO + ' @ ' + BRANCH);

const blobCache = new Map();
let parent = (!FORCE_ALL && startAt > 0 && todo.length) ? remoteHead : null;
let lastCommit = remoteHead;
for (const sha of todo) {
  const msg = git('log', '-1', '--format=%s%n%n%b', sha).trim();
  const meta = git('log', '-1', '--format=%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI', sha).split('\u0000');
  const who = { author: { name: meta[0], email: meta[1], date: meta[2] }, committer: { name: meta[3], email: meta[4], date: meta[5] } };
  const files = git('ls-tree', '-r', '--name-only', sha).split('\n').filter(Boolean);
  if (DRY) { console.log('  [dry] ' + sha.slice(0, 8) + ' ' + files.length + ' 文件：' + msg.split('\n')[0]); continue; }
  const tree = [];
  for (const f of files) {
    const key = git('rev-parse', sha + ':' + f);
    let blobSha = blobCache.get(key);
    if (!blobSha) {
      const buf = execFileSync('git', ['cat-file', 'blob', sha + ':' + f], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
      blobSha = (await api('POST', API('/git/blobs'), { content: buf.toString('base64'), encoding: 'base64' })).sha;
      blobCache.set(key, blobSha);
    }
    tree.push({ path: f, mode: '100644', type: 'blob', sha: blobSha });
  }
  const t = await api('POST', API('/git/trees'), { tree });
  const c = await api('POST', API('/git/commits'), { message: msg + '\n', tree: t.sha, parents: parent ? [parent] : [], ...who });
  parent = c.sha; lastCommit = c.sha;
  const same = c.sha === sha ? '' : '（远端 SHA 与本地不同，内容一致）';
  console.log('  ✓ ' + c.sha.slice(0, 8) + '  ' + msg.split('\n')[0] + '（' + files.length + ' 文件）' + same);
}
if (!DRY && todo.length) {
  const created = await setRef(BRANCH, lastCommit);
  console.log('✓ 源码已推送：' + (created ? '新建' : '更新') + ' 分支 ' + BRANCH + ' → ' + lastCommit.slice(0, 8));
}

// 3) 构建体验版 → 发布到 gh-pages（Pages 用；不依赖 Actions，避开 workflow 权限）
if (!DRY) {
  console.log('构建体验版（node tools/build-public.mjs）…');
  execFileSync(process.execPath, [path.join(HERE, 'build-public.mjs')], { cwd: ROOT, stdio: 'inherit' });
  const DIST = path.join(ROOT, 'dist');
  const walk = (d, base = '') => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name), base + e.name + '/') : [base + e.name]);
  const distFiles = walk(DIST).filter(f => !f.startsWith('.build-marker'));
  const pTree = [];
  for (const f of distFiles) {
    const buf = fs.readFileSync(path.join(DIST, f));
    pTree.push({ path: f, mode: '100644', type: 'blob', sha: (await api('POST', API('/git/blobs'), { content: buf.toString('base64'), encoding: 'base64' })).sha });
  }
  const pt = await api('POST', API('/git/trees'), { tree: pTree });
  const pHead = await refSha(PAGES_BRANCH);
  const pc = await api('POST', API('/git/commits'), {
    message: 'deploy: 发布体验版（' + new Date().toISOString().slice(0, 16).replace('T', ' ') + '）',
    tree: pt.sha, parents: pHead ? [pHead] : [],
  });
  await setRef(PAGES_BRANCH, pc.sha);
  console.log('✓ 体验版已发布到 ' + PAGES_BRANCH + ' → ' + pc.sha.slice(0, 8) + '（' + distFiles.length + ' 个文件）');

  // 4) Pages 指向 gh-pages 分支（已配置过则忽略），并请求一次构建（API 推分支不会自动触发构建）
  try {
    await api('PUT', API('/pages'), { build_type: 'legacy', source: { branch: PAGES_BRANCH, path: '/' } });
    console.log('✓ GitHub Pages 已指向 ' + PAGES_BRANCH + ' 分支');
  } catch (e) { console.log('（Pages 配置未变更：' + String(e.message).split(' → ').slice(-1)[0] + '）'); }
  try {
    const b = await api('POST', API('/pages/builds'));
    console.log('✓ 已请求 Pages 构建：' + (b.status || 'queued'));
  } catch (e) { console.log('（Pages 构建请求失败：' + String(e.message) + '）'); }
  console.log('  仓库：https://github.com/' + REPO);
  console.log('  在线体验：https://' + OWNER.toLowerCase() + '.github.io/' + NAME + '/');
}
