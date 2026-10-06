/* ============================================================================
 * lab.js —— 网页管理台（prototype/lab.html）的交互
 * 三个标签页：试玩器 / 设计资料 / 美术需求
 *   · 试玩器：纯文字推进，规则全部走 engine.js 的 Core（与网页版同一套），这里只写界面
 *   · 设计资料 / 美术需求：把 prototype/lab-docs.js 里内嵌的 markdown 渲染出来（只读快照）
 * 依赖加载顺序（见 lab.html）：levels/*.js → lab-docs.js → lab.js → 动态加载 engine.js → __labStart()
 *   （engine.js 的 DOM 层只在 DOMContentLoaded 时启动；这里在它之后再加载，就只借用纯核心 Core，
 *     不会和游戏首页的 DOM 打架——这是「共用 Core、不共用 DOM」的做法。）
 * ==========================================================================*/
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const LAB_KEY = 'mygame2.lab.session.v1';   // 管理台的进度单独存一份，不碰网页版的存档键
  const store = (() => { try { return window.localStorage; } catch (e) { return null; } })();

  let C = null;          // GameCore（engine.js）
  let D = null;          // 当前关卡数据
  let st = null;         // 当前状态
  let levelId = null;    // 当前关卡 id
  let oplog = [];        // 操作流水
  let steps = 0;         // 步数
  let lastEvents = [];   // 上一步发生了什么（显示在正文下面）

  /* ---------------- 小工具 ---------------- */
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmtTime = () => new Date().toTimeString().slice(0, 8);
  const nm = t => C.fillName(t, st);
  const sceneLabel = sid => {
    const sc = D.scenes[sid];
    if (!sc) return sid || '';
    return sc.label || String(sc.name || '').split('·').pop().trim();
  };
  const visitedCount = () => Object.keys(st.visited)
    .filter(id => D.nodes[id] && !D.nodes[id].hidden && !D.nodes[id].fail && !D.nodes[id].win)   // 与网页版 renderVisited 同一口径
    .length;

  /* ---------------- 存档（管理台自己的键） ---------------- */
  function saveLocal() {
    if (!store || !st) return;
    try { store.setItem(LAB_KEY, JSON.stringify({ v: 1, level: levelId, state: st, log: oplog, steps })); } catch (e) { /* 隐私模式下写不进去也不影响用 */ }
  }
  function loadLocal() {
    if (!store) return null;
    try { return JSON.parse(store.getItem(LAB_KEY) || 'null'); } catch (e) { return null; }
  }

  /* ---------------- 开局 / 重开 ---------------- */
  function startNew(id, difficulty, name) {
    if (!C.selectLevel(id)) return;
    levelId = id; D = C.currentLevel();
    const keepMe = (name && String(name).trim()) || (st && st.me) || DEFAULT_NAME();
    st = C.newState(difficulty === 'hard' ? 'hard' : 'normal', keepMe);   // 调试面保留两档（B147 三档不接入管理台——设计 §11 未列）
    const ev = C.go(st, D.start.node);
    steps = 0;
    lastEvents = ev;
    oplog = [{ n: 1, at: fmtTime(), from: '', to: st.loc, label: '开局 · ' + (D.meta.title || id) + '（' + (st.diff === 'hard' ? '困难' : '中等') + '）· 玩家 ' + st.me, notes: ev }];
    saveLocal();
    renderAll();
    showPrologue();          // E2：开新局（含重开本关）显示序章；读档/载入快照不重放
  }
  /* E2：序章块——显示一次；「跳过 / 开始」两个按钮行为相同（都只收起，与网页版同一口径） */
  function showPrologue() {
    const box = $('prologueBox');
    const pro = (D && D.meta && D.meta.prologue) || null;
    if (!pro || !Array.isArray(pro.lines) || !pro.lines.length) { box.classList.add('hidden'); box.innerHTML = ''; return; }
    box.innerHTML = '<div class="prologueTag">📜 序章（新局开场显示一次）</div>'
      + pro.lines.map(x => '<p>' + esc(nm(x)) + '</p>').join('')
      + '<div class="prologueBtns"><button class="btn" id="proSkip">跳过</button><button class="btn" id="proStart">开始</button></div>';
    box.classList.remove('hidden');
    $('proSkip').onclick = () => box.classList.add('hidden');
    $('proStart').onclick = () => box.classList.add('hidden');
  }
  function hidePrologue() { $('prologueBox').classList.add('hidden'); }

  /* E3：道具正文只读面板（带 text 的道具点开看；阅读不改任何状态） */
  function openRead(it) {
    const text = C.itemText(it);
    if (!text) return;
    $('readTitle').textContent = '📖 ' + it;
    $('readBody').innerHTML = nm(text).split('\n').map(p => '<p>' + esc(p) + '</p>').join('');
    $('readPanel').classList.remove('hidden');
  }
  function closeRead() { $('readPanel').classList.add('hidden'); }
  function DEFAULT_NAME() { return C.defaultPlayerName(); }

  /* 商店 / 废料回收（规则走 Core.buy / Core.sell，与网页版同一条路；管理台按开发视图：商店在选项上方）
   * （网页版已按 E9 改为选项在上 + 商店/回收折叠——管理台保留展开的开发视图，与 CLI 一致） */
  function doBuy(s) {
    const shop = C.shopInfo(st);
    if (!s.ok || !shop || C.payReason(st, shop.price)) return;   // 守卫判定与按钮可用性同出一处
    const ev = C.buy(st, s.id, shop.price);
    steps += 1;
    lastEvents = ev;
    oplog.push({ n: oplog.length + 1, at: fmtTime(), from: st.loc, to: st.loc, label: '买 ' + s.id + '（-' + shop.price + ' ' + shop.unit + '）', notes: ev });
    saveLocal(); renderAll();
  }
  function doSell(s) {
    if (!st) return;
    const ev = C.sell(st, s.id);
    steps += 1;
    lastEvents = ev;
    oplog.push({ n: oplog.length + 1, at: fmtTime(), from: st.loc, to: st.loc, label: '卖 ' + s.id + '（+1 ' + ((C.resDef(C.mainResId()) || {}).unit || '') + '）', notes: ev });
    saveLocal(); renderAll();
  }

  /* ---------------- 执行一个选项（规则全走 Core，和网页版 doChoice 完全同序） ---------------- */
  function doChoice(e) {
    if (!e.ok || !st) return;
    const from = st.loc;
    const ch = D.nodes[st.loc].c[e.ci];
    const ev = [];
    if (e.price != null) {                    // 价格类选项（如大里姆的腕带）：点哪个价格就付哪个
      if (C.payReason(st, e.price)) return;   // 守卫判定与按钮可用性同出一处
      ev.push(...C.buySticker(st, e.price));
      if (ch.say) ev.push('💬 ' + nm(ch.say));   // E7：旁白进事件行（价格类同口径）
      C.markChoiceDone(st, ch, e.ci, st.loc);    // E6：价格类选项同样只做一次（与网页版 engine.js 同序）
      const hit = (ch.toIf || []).find(x => C.condOk(st, x.cond));
      ev.push(...C.go(st, hit ? hit.to : ch.to));
    } else {
      const res = C.choose(st, e.ci);
      (res.log || []).forEach(x => ev.push(x));
      if (res.say) ev.push('💬 ' + res.say);     // E7：旁白进事件行（与效果日志并列、不重复）
      if (res.back) ev.push(...C.goBack(st));
      else if (res.to) ev.push(...C.go(st, res.to));
    }
    const flash = C.takeFlash(st);
    if (flash) {
      const r = C.resDef(flash.res) || {};
      if (flash.kind === 'theft') ev.push('🥷 ' + flash.thief + '偷走了你 ' + flash.amount + ' ' + (r.unit || '') + (r.name || '') + '！');
      else if (flash.kind === 'blocked') ev.push('🪢 ' + flash.guard + '挡住了' + flash.thief);
    }
    steps += 1;
    lastEvents = ev;
    oplog.push({ n: oplog.length + 1, at: fmtTime(), from, to: st.loc, label: e.label, notes: ev });
    saveLocal();
    renderAll();
  }

  /* ---------------- 渲染：主区 ---------------- */
  function renderAll() {
    renderTop();
    if (!st) return renderIdle();
    const node = D.nodes[st.loc] || {};
    $('locBadge').textContent = st.loc;
    $('locName').textContent = nm(node.n || '？');
    $('sceneChip').textContent = '【' + sceneLabel(C.sceneOf(st)) + '】';
    $('nodeText').textContent = nm(node.t || '');

    /* 上一步发生了什么 */
    const evBox = $('events');
    if (lastEvents && lastEvents.length) { evBox.classList.remove('hidden'); evBox.innerHTML = lastEvents.map(x => '<div>· ' + esc(x) + '</div>').join(''); }
    else evBox.classList.add('hidden');

    /* 结束横幅 */
    const banner = $('endBanner');
    if (node.win) {
      banner.className = 'win'; banner.classList.remove('hidden');
      banner.textContent = '🏁 ' + (node.endTag || '闯关成功！');
    } else if (node.fail || st.bankrupt) {
      const info = st.bankrupt ? C.failInfo(st.zeroRes) : null;
      banner.className = 'fail'; banner.classList.remove('hidden');
      banner.textContent = '💀 ' + ((info && info.title) || node.endTag || '闯关失败');
      if (info && info.text) $('nodeText').textContent = nm(info.text);
    } else {
      banner.classList.add('hidden');
    }

    renderChoices();
    renderStats();
    renderLog();
  }
  function renderIdle() {
    $('locBadge').textContent = '–';
    $('locName').textContent = '（还没开局）';
    $('sceneChip').textContent = '';
    $('nodeText').textContent = '选一个关卡，点右上角「开新局」。';
    $('choiceList').innerHTML = '';
    $('events').classList.add('hidden');
    $('endBanner').classList.add('hidden');
    $('statBox').innerHTML = '<div class="docEmpty">（还没开局）</div>';
    $('logBox').innerHTML = '<div class="docEmpty">（还没有操作）</div>';
  }
  function renderTop() {
    if (levelId) $('levelPick').value = levelId;
    if (st) { $('diffPick').value = st.diff; $('namePick').value = st.me; }
  }

  function renderChoices() {
    const box = $('choiceList');
    box.innerHTML = '';
    const node = D.nodes[st.loc] || {};
    if (node.win || node.fail || st.bankrupt) return;      // 结束状态没有选项（与网页版一致）
    renderShop(box);                                       // 商店 / 废料回收（管理台=开发视图，在选项上方；网页版 E9 = 选项在上+折叠）
    const unit = (C.resDef(C.mainResId()) || {}).unit || '';
    const list = C.visibleChoices(st);
    if (!list.length) {
      const p = document.createElement('div');
      p.className = 'docEmpty';
      p.textContent = '这里没有可执行的选项了（网页版会弹「求救」面板：回到安全点 / 重开）。';
      box.appendChild(p);
      return;
    }
    list.forEach(e => {
      const ch = node.c[e.ci];
      const b = document.createElement('button');
      b.className = 'choice' + (e.ok ? '' : ' locked') + (ch.battle ? ' battle' : '') + (e.price != null ? ' price' : '');
      b.disabled = !e.ok;
      const chips = [];
      if (e.price != null) chips.push(e.price + ' ' + unit);
      if (ch.battle) chips.push('你的武力 ' + C.atkOf(st) + (C.atkOf(st) >= C.battleNeed(st, ch.battle) ? ' ≥ ' : ' < ') + '需要 ' + C.battleNeed(st, ch.battle));
      const dest = destText(e, ch);
      if (dest) chips.push(dest);
      if (!e.ok) chips.push('灰：' + (e.why || '条件不足'));
      b.innerHTML = '<span class="no">' + e.i + ')</span><span class="lbl">' + esc(nm(e.label)) + '</span>'
        + chips.map(c => '<span class="chip">' + esc(c) + '</span>').join('');
      b.title = e.ok ? '执行这个选项' : (e.why || '条件不足');
      b.onclick = () => doChoice(e);
      box.appendChild(b);
    });
  }
  /* 商店 / 废料回收块：数据来自 Core.shopInfo / Core.sellInfo（与网页版同一个来源） */
  function renderShop(box) {
    const unit = (C.resDef(C.mainResId()) || {}).unit || '';
    const shop = C.shopInfo(st);
    if (shop) {
      const wrap = document.createElement('div');
      wrap.className = 'shopBox';
      const head = document.createElement('div');
      head.className = 'shopHead';
      /* 花光警语跟资源自己的失败规则走（E1：fail:null 的资源花光不判失败；与 CLI 同口径） */
      head.textContent = '🏪 商店（' + (C.resNoFail(C.resDef(shop.resId) || {}) ? '花光不判失败' : '买完必须留 1 ' + unit + '，花光会闯关失败') + '）';
      wrap.appendChild(head);
      shop.stock.forEach((s, k) => {
        const b = document.createElement('button');
        b.className = 'choice shopBuy' + (s.ok ? '' : ' locked');
        b.disabled = !s.ok;
        const chips = [shop.price + ' ' + unit].concat(s.ok ? [] : ['灰：' + (s.why || '买不了')]);
        b.innerHTML = '<span class="no">' + (k + 1) + ')</span><span class="lbl">' + esc((s.icon ? s.icon + ' ' : '') + s.id) + '</span>'
          + chips.map(c => '<span class="chip">' + esc(c) + '</span>').join('');
        b.title = s.ok ? ('买 ' + s.id) : (s.why || '买不了');
        b.onclick = () => doBuy(s);
        wrap.appendChild(b);
      });
      box.appendChild(wrap);
    }
    const sell = C.sellInfo(st);
    if (sell) {
      const wrap = document.createElement('div');
      wrap.className = 'shopBox';
      const head = document.createElement('div');
      head.className = 'shopHead';
      head.textContent = '♻ 废料回收（一件 +1 ' + unit + '；红框道具不能卖）';
      wrap.appendChild(head);
      if (!sell.length) {
        const p = document.createElement('div');
        p.className = 'dim small';
        p.textContent = '（没有可卖的东西）';
        wrap.appendChild(p);
      }
      sell.forEach(s => {
        const b = document.createElement('button');
        b.className = 'choice shopSell';
        b.innerHTML = '<span class="lbl">卖出 ' + esc((s.icon ? s.icon + ' ' : '') + s.id) + '</span><span class="chip">+1 ' + esc(unit) + '</span>';
        b.title = '卖 ' + s.id;
        b.onclick = () => doSell(s);
        wrap.appendChild(b);
      });
      box.appendChild(wrap);
    }
  }

  function destText(e, ch) {
    if (ch.battle) return '胜 → ' + ch.battle.winTo + '　负 → ' + ch.battle.loseTo;
    if (ch.random) return '→ ' + ch.random.join(' 或 ');
    if (e.back) { const p = st.hist[st.hist.length - 1]; return p ? '↩ 返回 ' + p : '↩ 返回上一处'; }
    const t = C.choiceTargets(ch);
    return t.to.length ? '→ ' + t.to.join(' / ') : '';
  }

  function renderStats() {
    const box = $('statBox');
    if (!st) { box.innerHTML = '<div class="docEmpty">（还没开局）</div>'; return; }
    const res = C.resources().map(r =>
      '<span class="res">' + esc((r.icon || '') + ' ' + (r.name || r.id)) + ' <b>' + C.resOf(st, r.id) + '</b></span>').join('');
    const items = st.items.length
      ? st.items.map(id => {
        const meta = D.items[id] || {};
        const readable = !!C.itemText(id);                      // E3：带正文的可点开（已拥有）
        const tag = [meta.nosell ? '红框道具：不可出售' : '', readable ? '点开看正文' : ''].filter(Boolean).join('；') || '道具';
        const cls = 'item' + (meta.nosell ? ' key' : '') + (readable ? ' readable' : '');
        const inner = esc((meta.icon || '') + ' ' + id) + (meta.nosell ? ' ★' : '') + (readable ? ' 📖' : '');
        return '<button type="button" class="' + cls + '" data-read="' + esc(id) + '" title="' + esc(tag) + '">' + inner + '</button>';
      }).join('')
      : '<span class="dim small">（空）</span>';
    const clues = Object.keys(st.learned).length
      ? Object.keys(st.learned).map(k => '<span class="clue">' + esc(k) + '</span>').join('')
      : '<span class="dim small">（还没有）</span>';
    box.innerHTML =
      '<div class="statRow">' + res + '<span class="res">⚔ 武力 <b>' + C.atkOf(st) + '</b></span><span class="res">👣 步数 <b>' + steps + '</b></span></div>'
      + '<div class="sub">位置：' + esc(st.loc) + ' · ' + esc(nm((D.nodes[st.loc] || {}).n || '')) + '　｜　' + esc(sceneLabel(C.sceneOf(st))) + '　｜　已探索 ' + visitedCount() + ' 处</div>'
      + '<div class="sub">难度 ' + (st.diff === 'hard' ? '困难' : '普通') + '　｜　玩家 ' + esc(st.me) + '</div>'
      + '<h3 style="margin:12px 0 6px">🎒 物品（' + st.items.length + '，★ = 红框；📖 = 点开看正文）</h3><div class="itemList">' + items + '</div>'
      + '<h3 style="margin:12px 0 6px">🔑 线索（' + Object.keys(st.learned).length + '）</h3><div class="clueList">' + clues + '</div>';
    box.querySelectorAll('.item.readable').forEach(b => { b.onclick = () => openRead(b.getAttribute('data-read')); });
  }

  function renderLog() {
    const box = $('logBox');
    if (!oplog.length) { box.innerHTML = '<div class="docEmpty">（还没有操作）</div>'; return; }
    box.innerHTML = '<ol>' + oplog.map(e =>
      '<li><span class="lg">' + (e.from ? esc(e.from) + ' → ' + esc(e.to) + '　' : '') + esc(e.at || '') + '</span> ' + esc(e.label || '')
      + (e.notes && e.notes.length ? '<div class="fx">' + e.notes.map(x => esc(x)).join('；') + '</div>' : '')
      + '</li>').join('') + '</ol>';
  }

  /* ---------------- 快照（文本） ---------------- */
  function snapOut() {
    if (!st) return;
    $('snapText').value = JSON.stringify({ v: 1, kind: 'lab-snapshot', level: levelId, state: st, log: oplog, steps, savedAt: new Date().toISOString() }, null, 2);
  }
  function snapIn() {
    let snap;
    try { snap = JSON.parse($('snapText').value); } catch (e) { alert('快照不是合法 JSON：' + e.message); return; }
    if (!snap || !snap.level || !snap.state || !snap.state.loc) { alert('这不是有效的快照（缺 level / state.loc）'); return; }
    // 先校验，通过了再动 D / levelId / st——免得快照不对时把当前这一局弄成半截状态
    const prevLevel = levelId;
    if (!C.selectLevel(snap.level)) { alert('快照里的关卡不存在：' + snap.level); return; }
    const lv = C.currentLevel();
    if (!lv.nodes[snap.state.loc]) {
      alert('快照里的位置 ' + snap.state.loc + ' 在这关不存在');
      if (prevLevel) C.selectLevel(prevLevel);     // 把引擎切回原来那关，界面不变
      return;
    }
    levelId = snap.level; D = lv;
    st = C.normalizeState(snap.state);
    oplog = Array.isArray(snap.log) ? snap.log : [];
    steps = Number(snap.steps) || 0;
    lastEvents = ['📂 已载入快照（' + (snap.savedAt || '未知时间') + '）'];
    hidePrologue();          // 载入快照 = 继续玩，不重放序章
    saveLocal();
    renderAll();
  }

  /* ---------------- 顶栏 / 标签页 / 按钮 ---------------- */
  function fillLevelPick() {
    const sel = $('levelPick');
    sel.innerHTML = '';
    C.levelIds().forEach(id => {
      const lv = C.level(id) || {};
      const o = document.createElement('option');
      o.value = id;
      o.textContent = ((lv.meta && lv.meta.title) || id) + '（' + id + '）';
      sel.appendChild(o);
    });
  }
  function switchTab(name) {
    ['play', 'design', 'art'].forEach(t => {
      $('tab-' + t).classList.toggle('active', t === name);
      $('pane-' + t).classList.toggle('active', t === name);
    });
  }
  function bindControls() {
    ['play', 'design', 'art'].forEach(t => { $('tab-' + t).onclick = () => switchTab(t); });
    $('newRun').onclick = () => startNew($('levelPick').value, $('diffPick').value, $('namePick').value);
    $('restart').onclick = () => startNew(levelId || $('levelPick').value, st ? st.diff : $('diffPick').value, $('namePick').value);
    $('snapOut').onclick = snapOut;
    $('snapIn').onclick = snapIn;
    $('readClose').onclick = closeRead;
    $('readPanel').onclick = e => { if (e.target === $('readPanel')) closeRead(); };   // 点遮罩也收起
  }

  /* ---------------- 文档（设计资料 / 美术需求） ---------------- */
  function renderDocs() {
    const L = window.LAB_DOCS;
    const ready = L && Array.isArray(L.docs) && L.docs.length;
    const when = ready ? new Date(L.generatedAt).toLocaleString('zh-CN', { hour12: false }) : '';
    $('genTimeDesign').textContent = when;
    $('genTimeArt').textContent = when;
    if (!ready) {
      const msg = '<div class="docEmpty">没有读到 lab-docs.js。<br>请在项目根目录跑一次：<code>node tools/build-lab.mjs</code>，再刷新本页。</div>';
      $('docListDesign').innerHTML = msg;
      $('docListArt').innerHTML = msg;
      $('docViewDesign').innerHTML = '';
      $('docViewArt').innerHTML = '';
      return;
    }
    renderDocGroup('design', L.docs.filter(d => d.group === 'design'));
    renderDocGroup('art', L.docs.filter(d => d.group === 'art'));
  }
  function renderDocGroup(group, list) {
    const cap = group === 'design' ? 'Design' : 'Art';
    const nav = $('docList' + cap);
    nav.innerHTML = '';
    if (!list.length) { nav.innerHTML = '<div class="docEmpty">（这一类还没有文档）</div>'; return; }
    list.forEach((doc, k) => {
      const b = document.createElement('button');
      b.className = 'docItem' + (k === 0 ? ' active' : '');
      b.innerHTML = '<b>' + esc(doc.title) + '</b><span>' + esc(doc.desc || '') + '</span><em>' + esc(doc.path) + '</em>';
      b.onclick = () => {
        nav.querySelectorAll('.docItem').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        openDoc(group, doc);
      };
      nav.appendChild(b);
    });
    openDoc(group, list[0]);
  }
  function openDoc(group, doc) {
    const view = $('docView' + (group === 'design' ? 'Design' : 'Art'));
    view.innerHTML = renderMd(doc.text);
    view.scrollTop = 0;
  }

  /* ---------------- 极简 markdown 渲染（不引外部库） ----------------
   * 支持：标题 / 段落 / 无序·有序列表 / 表格 / 代码块 / 行内代码 / 引用 / 分隔线 / 粗体 / 链接
   * 先把 HTML 转义，再做行内替换 —— 文档里的 < > & 不会破坏页面。 */
  function renderMd(src) {
    const lines = String(src || '').replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let i = 0, para = [], list = null, quote = [], code = null, codeBuf = [];
    const inlineMd = s => {
      /* 先把代码段抽走（占位），再做粗体/链接替换——否则代码段里的 ** 或 [x](y) 也会被当成行内语法 */
      const spans = [];
      let t = esc(s).replace(/`([^`]+)`/g, (m, code) => { spans.push('<code>' + code + '</code>'); return '\u0000' + (spans.length - 1) + '\u0000'; });
      t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      return t.replace(/\u0000(\d+)\u0000/g, (m, k) => spans[Number(k)]);
    };
    const closePara = () => { if (para.length) { out.push('<p>' + inlineMd(para.join(' ')) + '</p>'); para = []; } };
    const closeList = () => { if (list) { out.push('</' + list + '>'); list = null; } };
    const closeQuote = () => { if (quote.length) { out.push('<blockquote>' + quote.map(inlineMd).join('<br>') + '</blockquote>'); quote = []; } };
    const closeAll = () => { closePara(); closeList(); closeQuote(); };
    const splitRow = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(s => s.trim());
    while (i < lines.length) {
      const line = lines[i];
      const fence = line.match(/^\s*(```+|~~~+)\s*(.*)$/);
      if (code) {                                        // 代码块内部：原样收集
        if (fence) { out.push('<pre><code>' + esc(codeBuf.join('\n')) + '</code></pre>'); code = null; codeBuf = []; }
        else codeBuf.push(line);
        i++; continue;
      }
      if (fence) { closeAll(); code = fence[1]; i++; continue; }
      if (!line.trim()) { closeAll(); i++; continue; }
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        closeAll();
        const n = h[1].length;
        out.push('<h' + n + '>' + inlineMd(h[2].replace(/\s*#+\s*$/, '')) + '</h' + n + '>');
        i++; continue;
      }
      if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) { closeAll(); out.push('<hr>'); i++; continue; }
      if (/^\s{0,3}>/.test(line)) { closePara(); closeList(); quote.push(line.replace(/^\s{0,3}>\s?/, '')); i++; continue; }
      if (/^\s*\|/.test(line) && lines[i + 1] !== undefined && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].indexOf('-') >= 0) {
        closeAll();
        const head = splitRow(line);
        i += 2;
        const body = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) { body.push(splitRow(lines[i])); i++; }
        out.push('<table><thead><tr>' + head.map(c => '<th>' + inlineMd(c) + '</th>').join('') + '</tr></thead><tbody>'
          + body.map(r => '<tr>' + r.map(c => '<td>' + inlineMd(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>');
        continue;
      }
      const ul = line.match(/^\s*[-*+]\s+(.*)$/);
      const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (ul || ol) {
        closePara(); closeQuote();
        const tag = ul ? 'ul' : 'ol';
        if (list !== tag) { closeList(); out.push('<' + tag + '>'); list = tag; }
        out.push('<li>' + inlineMd(ul ? ul[1] : ol[1]) + '</li>');
        i++; continue;
      }
      closeList(); closeQuote();
      para.push(line.trim());
      i++;
    }
    if (code) out.push('<pre><code>' + esc(codeBuf.join('\n')) + '</code></pre>');
    closeAll();
    return out.join('\n');
  }

  /* ---------------- 启动（由 lab.html 在 engine.js 加载完成后调用） ---------------- */
  window.__labStart = function () {
    C = globalThis.GameCore;
    if (!C) { document.body.innerHTML = '<p style="padding:20px">engine.js 没加载成功——请在项目根目录用 node tools/build-lab.mjs 与完整目录打开本页。</p>'; return; }
    fillLevelPick();
    bindControls();
    renderDocs();
    const saved = loadLocal();
    if (saved && saved.level && saved.state && saved.state.loc && C.selectLevel(saved.level)) {
      levelId = saved.level; D = C.currentLevel();
      st = C.normalizeState(saved.state);
      if (!D.nodes[st.loc]) st = null;
      oplog = Array.isArray(saved.log) ? saved.log : [];
      steps = Number(saved.steps) || 0;
      lastEvents = ['↩ 接着上次的进度'];
    }
    if (!st) startNew(C.levelIds()[0], 'normal', $('namePick').value);
    else renderAll();
    switchTab('play');
  };
})();
