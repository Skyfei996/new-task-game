/* ============================================================================
 * engine.js — 《你有一个新任务！》网页原型引擎（v0.2）
 * ----------------------------------------------------------------------------
 * v1.1（按试玩反馈）：选项标注去向编号；移动跟随条目；场景灰暗遮罩
 * v1.2：双区域背景（一楼 ⇄ 负一层）+ 跨区提示 + 编号点击可选（含“返回”类）
 * v1.3：货币底线（金币钳 ≥0 / 降到 0 判失败 / 购买不许花光）；被偷强反馈；
 *       人物光环与图鉴；当前位置大光环；通关奖励
 *
 * v0.2 改动（多关卡架构 + 通用资源 + 卡死保险，配合 levels/*.js）：
 *   ① 关卡注册表：关卡数据住在 prototype/levels/*.js，挂到 G.LEVELS；启动页 = 关卡选择卡片
 *      （海报图 + 标题 + 一句话 + 难度/开局资源 + 「继续上次进度」）
 *   ② 存档按关卡独立（mygame2.save.<levelId>.v1）；旧的 mygame2.market.save.v1 作为
 *      「勇闯大里姆」的存档读入（兼容）；玩家名全局存（mygame2.player.v1）
 *   ③ 通用资源：关卡声明 resources:[{id,name,icon,start:{normal,hard},fail:{title,text,node?},noSpendToZero?}]
 *      ——资源直接住在 state 的同名字段上（coins / oxygen …），fx 的键 = 资源 id；
 *      任一资源 ≤0 → 该资源的失败结算（有 fail.node 就走进结算点，否则就地复用失败界面）；
 *      noSpendToZero 的资源沿用 v1.3 的购买守卫（「钱不够」/「花光就闯关失败」两种理由）
 *   ④ 玩家名：任务点文本与结局文案里的 {me} 占位符 → 渲染时替换成玩家名
 *   ⑤ 走投无路检测（卡死保险）：渲染后若当前节点已无任何可执行动作 → 弹「求救」面板
 *      （回到安全点 = 关卡 meta.safeNode；重开本关）
 *   ⑥ 条件语言新增 all / any / pinsAll / notPins；战斗选项也可以带代价（fx）
 *
 * v0.3 改动（B01 体验层整改 · 引擎小能力 E1~E9，接口以设计档 §7 v0.3 表为准）：
 *   E1 资源 resources[].fail: null → 该资源只钳 0，不判失败、不设 bankrupt（缺省不写 = 旧行为）
 *   E2 序章 meta.prologue = { lines, image? } → 新局进入前整屏显示一次（读档不重放）；{me} 可替换
 *   E3 道具正文 items[].text（多段 \n）→ 背包里点开只读面板；无 text = 「没什么可读的」
 *   E4 提示分级 choice.hint: vague|exact|none（缺省 vague）→ 引擎不自动往选项上附加效果/数值
 *   E5 灰显理由 choice.lockText → 玩家向、不含数字；没写时用 Core.lockHint 的兜底
 *   E6 一次性选项 choice.once: true|'标记名' → 做过即隐藏，记 st.chDone（随存档）；条件 { chDone } 可查
 *   E7 选项旁白 choice.say → 执行时 toast（加长停留），不改状态、与效果日志并列不重复
 *   E8 正文分叉 node.tIf = [{ cond, t }] → 取第一个满足条件的正文，都不满足用 node.t
 *   E9 商店折叠（渲染层）→ 选项在上；商店/回收收成一行默认折叠（折叠不影响可点性）
 *   另（§8.3）：去向标注「→ 编号 / 节点名」从玩家视图撤下；lab 与开发版 CLI 自带渲染，保留该标签。
 *
 * v0.4/v0.5 改动（B02 关卡与系统线 · 引擎小能力 E11/E12，接口以设计档 §7 v0.4/v0.5 表为准）：
 *   E11 战斗败方描写 choice.battle.loseSay → 败北时在既有机械行之后，以 choice.say 同渠道带出旁白；不改状态
 *   E12 条件灰显 choice.lockIf → cond 不满足时再判 lockIf：成立 ⇒ 灰显＋lockText；不成立 ⇒ 隐藏（无 lockIf = 旧行为）
 *
 * 结构分两层：
 *   ① 纯核心 Core：状态机 + 条件/效果/战斗/资源/存档求解，不接触 DOM，可在 Node 中直接测试
 *   ② DOM 层：关卡选择、场景图、编号环、遮罩、侧栏、背包/人物/求救弹窗、坐标校准
 * ==========================================================================*/
(function () {
  'use strict';
  const G = typeof window !== 'undefined' ? window : globalThis;
  const LEVELS = G.LEVELS || {};              // 关卡注册表（index.html 按序加载 levels/*.js）
  const FREE_MOVE = false;                    // true = 旧版“满地图自由点击”模式
  const PLAYER_KEY = 'mygame2.player.v1';     // 玩家名（全局，跨关卡共用）
  const DEFAULT_PLAYER = '林小晨';            // 默认玩家名（设计档：主角林小晨）

  let D = null;        // 当前关卡数据（selectLevel 绑定；同步给 G.GAME_DATA，旧代码/旧测试仍可读）
  let levelId = null;  // 当前关卡 id

  /* v1.2：走进有编号点的目标节点 → 切换到它所在的场景（无编号节点保持当前场景） */
  function syncScene(st, nodeId) {
    const sid = Core.sceneOfNode(nodeId);
    if (sid) st.scene = sid;
  }

  /* ============================ ① 纯核心 ============================ */
  const Core = {
    /* ---- 关卡注册表（关卡选择页 / Node 测试共用） ---- */
    levels() { return LEVELS; },
    levelIds() { return Object.keys(LEVELS); },
    level(id) { return LEVELS[id] || null; },
    currentLevelId() { return levelId; },
    currentLevel() { return D; },
    defaultLevelId() { return Object.keys(LEVELS)[0] || null; },   // 加载顺序里的第一个（levels/dalim.js 在前）
    /* 选中关卡：绑定 D 并同步 G.GAME_DATA；返回是否成功 */
    selectLevel(id) {
      const lv = LEVELS[id];
      if (!lv) return false;
      D = lv; levelId = id; G.GAME_DATA = lv;
      return true;
    },
    /* E2 序章：meta.prologue = { lines: […], image? }；没有该字段的关卡不显示（读档不重放） */
    prologue() {
      const p = (D && D.meta && D.meta.prologue) || null;
      if (!p || !Array.isArray(p.lines) || !p.lines.length) return null;
      return { lines: p.lines, image: p.image || null };
    },

    /* ---- 场景：编号点属于哪个场景 = 它印在哪张图上（单一数据源） ---- */
    /* 同一编号点出现在多张图的 pins 里（如电梯井）→ 无固定场景，返回 null（保持当前场景不换图） */
    sceneOfNode(id) {
      if (!D) return null;
      let hit = null;
      for (const sid of Object.keys(D.scenes)) {
        if (!D.scenes[sid].pins[id]) continue;
        if (hit) return null;          // 多点命中：该点没有固定场景
        hit = sid;
      }
      return hit;
    },
    defaultScene() {
      if (!D) return null;
      return Core.sceneOfNode(D.start.node) || Object.keys(D.scenes)[0];
    },
    sceneOf(st) {
      const sid = st && st.scene;
      return (sid && D.scenes[sid]) ? sid : Core.defaultScene();
    },

    /* ---- 通用资源（v0.2）：资源直接住在 state 的同名字段上（coins / oxygen / …） ---- */
    resources() { return (D && D.resources) || []; },
    resDef(id) { return Core.resources().find(r => r.id === id) || null; },
    /* E1：声明了 fail: null 的资源「不判失败」——只钳到 0，不触发失败结算、不设 bankrupt */
    resNoFail(def) { return !!def && def.fail === null; },
    /* 花钱/扣资源的那个资源：优先 noSpendToZero 的；否则第一个 */
    mainResId() {
      const rs = Core.resources();
      const hit = rs.find(r => r.noSpendToZero);
      return hit ? hit.id : (rs[0] ? rs[0].id : 'coins');
    },
    resOf(st, id) { const v = st ? st[id] : 0; return typeof v === 'number' && isFinite(v) ? v : 0; },
    /* 资源变动的唯一入口（钱 / 氧气 / 将来的任何资源都走这里）：① 钳在 ≥0；② 归零 = 失败结算 */
    applyRes(st, id, delta, log) {
      log = log || [];
      if (!delta) return log;
      const def = Core.resDef(id) || { id: id, name: id, unit: '' };
      const before = Core.resOf(st, id);
      st[id] = Math.max(0, before + delta);
      const applied = st[id] - before;
      if (applied !== 0) log.push((applied > 0 ? '+' : '') + applied + ' ' + (def.unit || '') + (def.name || id));
      else if (delta < 0) log.push((def.icon || '') + ' 没有可扣的' + (def.name || id) + '了（资源不会变成负数）');
      if (st[id] <= 0 && !Core.resNoFail(def)) {   // E1：fail:null 的资源归零只到 0，不判失败
        if (!st.bankrupt) st.zeroRes = id;      // 第一个归零的资源决定失败结算文案
        st.bankrupt = true;
        log.push('💀 ' + Core.failInfo(id).title + '——闯关失败！');
      }
      return log;
    },
    /* 失败结算信息：优先资源自己的 fail，其次关卡 meta.bankrupt（大里姆 v1.3 的旧文案） */
    failInfo(resId) {
      const def = Core.resDef(resId) || {};
      const f = def.fail || {};
      const mb = (D && D.meta && D.meta.bankrupt) || {};
      return {
        res: resId || null,
        title: f.title || mb.title || '本关结束',
        text: f.text || mb.text || '……你的冒险到此为止。',
        node: f.node || null
      };
    },
    /* 资源归零 → 失败结算：声明了结算节点就走到那个点（复用既有失败界面），否则由界面就地结算 */
    checkFail(st, log) {
      if (!st || !st.bankrupt) return;
      const info = Core.failInfo(st.zeroRes);
      if (info.node && D.nodes[info.node] && st.loc !== info.node) {
        st.loc = info.node;
        syncScene(st, info.node);
        Core.enter(st, info.node);
        (log || []).push('💀 ' + info.title);
      }
    },
    /* 取走本次进入的「被偷 / 被挡下」提示（取走后清空，避免重复弹条和写进存档） */
    takeFlash(st) { const f = st.flash || null; if (f) delete st.flash; return f; },

    /* ---- 状态 ---- */
    newState(diff, me) {
      const d = diff === 'hard' ? 'hard' : 'normal';
      const st = {
        diff: d,
        me: Core.cleanName(me),
        items: [],
        visited: {}, done: {}, learned: {},
        chDone: {},        // E6：做过的一次性选项标记（随存档；旧存档没有该字段 = 空）
        wristband: 0,
        hist: [],
        loc: null,
        bankrupt: false,   // 任一资源归零 = 本关结束（v1.3 的「身无分文」推广而来）
        zeroRes: null,     // 是哪个资源归零的（决定失败结算文案）
        scene: Core.defaultScene()
      };
      Core.resources().forEach(r => {
        st[r.id] = (r.start && (r.start[d] != null ? r.start[d] : r.start.normal)) || 0;
      });
      return st;
    },
    /* 读档兜底（旧存档没有 scene / zeroRes / me；资源钳在 ≥0，为 0 即判失败） */
    normalizeState(st) {
      if (!st) return st;
      if (!st.scene) st.scene = Core.sceneOfNode(st.loc) || Core.defaultScene();
      ['items'].forEach(k => { if (!Array.isArray(st[k])) st[k] = []; });
      ['visited', 'done', 'learned', 'chDone'].forEach(k => { if (!st[k] || typeof st[k] !== 'object') st[k] = {}; });
      if (!Array.isArray(st.hist)) st.hist = [];
      if (st.wristband == null) st.wristband = 0;
      if (!st.diff) st.diff = 'normal';
      st.me = Core.cleanName(st.me);
      let zero = null;
      Core.resources().forEach(r => {
        const v = Number(st[r.id]);
        st[r.id] = Math.max(0, isFinite(v) ? v : ((r.start && (r.start[st.diff] != null ? r.start[st.diff] : r.start.normal)) || 0));
        if (st[r.id] <= 0 && !zero && !Core.resNoFail(r)) zero = r.id;   // E1：fail:null 归零不算失败
      });
      st.zeroRes = zero;
      st.bankrupt = !!zero;
      return st;
    },

    /* ---- 玩家名（{me} 占位符） ---- */
    defaultPlayerName() { return DEFAULT_PLAYER; },
    cleanName(n) {
      const s = String(n == null ? '' : n).trim().replace(/\s+/g, ' ');
      return s ? s.slice(0, 10) : DEFAULT_PLAYER;
    },
    fillName(text, st) {
      const me = (st && st.me) || DEFAULT_PLAYER;
      return String(text == null ? '' : text).split('{me}').join(me);
    },

    /* ---- 存档：按关卡独立 + 旧市场存档兼容 + 玩家名（Storage 抽象：Node 测试里传普通对象即可） ---- */
    playerKey() { return PLAYER_KEY; },
    saveKey(id) { return 'mygame2.save.' + id + '.v1'; },
    legacyKey(id) { return id === 'dalim' ? 'mygame2.market.save.v1' : null; },   // v1.3 的旧存档 = 大里姆
    saveTo(store, id, st) {
      try { store.setItem(Core.saveKey(id), JSON.stringify(st)); return true; } catch (e) { return false; }
    },
    loadFrom(store, id) {
      const lv = LEVELS[id];
      if (!store || !lv) return null;
      try {
        let raw = store.getItem(Core.saveKey(id));
        if (!raw) {                                  // 兼容：旧存档 mygame2.market.save.v1 当作大里姆的进度
          const lk = Core.legacyKey(id);
          if (lk) { const old = store.getItem(lk); if (old) { raw = old; store.setItem(Core.saveKey(id), old); } }
        }
        if (!raw) return null;
        const s = JSON.parse(raw);
        return (s && s.loc && lv.nodes[s.loc]) ? s : null;
      } catch (e) { return null; }
    },
    playerName(store) {
      try {
        const raw = store && store.getItem(PLAYER_KEY);
        if (!raw) return DEFAULT_PLAYER;
        const o = JSON.parse(raw);
        return Core.cleanName(o && o.name);
      } catch (e) { return DEFAULT_PLAYER; }
    },
    savePlayer(store, name) {
      try { store.setItem(PLAYER_KEY, JSON.stringify({ name: Core.cleanName(name) })); return true; } catch (e) { return false; }
    },

    /* ---- 条件 ---- */
    hasItem(st, id) { return st.items.indexOf(id) >= 0; },
    /* E3 道具正文：只读；没有 text（或空串）= 没什么可读的 */
    itemText(id) {
      const m = (D.items && D.items[id]) || {};
      return typeof m.text === 'string' && m.text ? m.text : null;
    },
    atkOf(st) {
      let a = st.items.reduce((s, id) => s + ((D.items[id] && D.items[id].atk) || 0), 0);
      const bonus = (D.meta && D.meta.atkFromClues) || null;   // v0.2：知道某条线索 = 武力 +N（如收编的小帮手）
      if (bonus) Object.keys(bonus).forEach(k => { if (st.learned[k]) a += bonus[k]; });
      return a;
    },
    condOk(st, cond) {
      if (!cond) return true;
      if (cond.item && !Core.hasItem(st, cond.item)) return false;
      if (cond.noItem && Core.hasItem(st, cond.noItem)) return false;
      if (cond.knows && !st.learned[cond.knows]) return false;
      if (cond.noKnows && st.learned[cond.noKnows]) return false;
      if (cond.chDone && !(st.chDone && st.chDone[cond.chDone])) return false;   // E6：该命名一次性选项做过
      if (cond.anyItem && !cond.anyItem.some(i => Core.hasItem(st, i))) return false;
      if (cond.notPinsAll && cond.notPinsAll.every(p => st.visited[p])) return false;
      if (cond.pinsAll && !cond.pinsAll.every(p => st.visited[p])) return false;   // v0.2：这些点全都到过
      if (cond.notPins && cond.notPins.some(p => st.visited[p])) return false;     // v0.2：这些点一个都没到过
      if (cond.all && !cond.all.every(c => Core.condOk(st, c))) return false;      // v0.2：全部满足（AND）
      if (cond.any && !cond.any.some(c => Core.condOk(st, c))) return false;       // v0.2：任一满足（OR）
      /* 资源下限：cond 里写资源 id（例如 {coins: 1}、{oxygen: 10}）= 该资源至少要有这么多 */
      for (const r of Core.resources()) {
        if (cond[r.id] != null && Core.resOf(st, r.id) < cond[r.id]) return false;
      }
      return true;
    },
    lockReason(ch) {
      const c = ch.cond || {};
      const bits = [];
      if (c.item) bits.push('需要：' + c.item);
      if (c.noItem) bits.push('需要先没有：' + c.noItem);
      if (c.knows) bits.push('需要：知道' + c.knows);
      if (c.noKnows) bits.push('（已不适合）');
      if (c.anyItem) bits.push('需要：' + c.anyItem.join(' 或 '));
      if (c.notPinsAll) bits.push('需要先去别处');
      if (c.pinsAll) bits.push('需要先到过：' + c.pinsAll.join('/'));
      if (c.all) bits.push(c.all.map(x => Core.lockReason({ cond: x })).filter(Boolean).join('、'));
      if (c.any) bits.push(c.any.map(x => Core.lockReason({ cond: x })).filter(Boolean).join(' 或 '));
      for (const r of Core.resources()) {
        if (c[r.id] != null) bits.push('需要 ' + c[r.id] + ' ' + (r.unit || '') + (r.name || r.id));
      }
      return bits.filter(Boolean).join('；') || '条件不足';
    },
    /* E5：灰显理由（玩家视图用）——优先选项自己的 lockText；没写就用兜底，兜底同样不含数字 */
    lockHint(ch) {
      if (ch && ch.lockText) return ch.lockText;
      const c = (ch && ch.cond) || {};
      const bits = [];
      if (c.item) bits.push('还差：' + c.item);                      // 道具 → 还差：X
      if (c.anyItem) bits.push('还差：' + c.anyItem.join(' 或 '));
      if (c.all) bits.push(...c.all.map(x => Core.lockHint({ cond: x })));
      if (c.any) bits.push(...c.any.map(x => Core.lockHint({ cond: x })));
      if (c.noItem || c.knows || c.noKnows || c.pinsAll || c.notPinsAll || c.notPins || c.chDone) bits.push('还不到时候');   // 线索等
      Core.resources().forEach(r => { if (c[r.id] != null) bits.push('还差点底气'); });   // 资源 → 还差点底气
      return [...new Set(bits.filter(Boolean))].join('；') || '还不到时候';
    },
    /* E4：提示分级——不写 = vague；引擎不自动往选项上附加效果/数值（写什么由作者定） */
    choiceHint(ch) { return (ch && ch.hint) || 'vague'; },
    /* E12（v0.5）：选项可见性单点判定（网页/CLI/管理台同源）——返回 'ok' | 'lock' | 'hide'
     *   cond 满足               ⇒ 'ok'（lockIf 不参与）
     *   cond 不满足：带 lockIf  ⇒ lockIf 成立 ? 'lock'（灰显＋lockText）: 'hide'
     *   cond 不满足：无 lockIf  ⇒ lock 存在 ? 'lock'（旧行为）: 'hide'
     * 细则①：给 lockIf 的选项不再写 lock；两者并存时以 lockIf 为准。 */
    choiceState(st, ch) {
      if (Core.condOk(st, ch.cond)) return 'ok';
      if (ch.lockIf) return Core.condOk(st, ch.lockIf) ? 'lock' : 'hide';
      return ch.lock ? 'lock' : 'hide';
    },
    /* ---- E6 一次性选项 ----
     * once: '<标记名>' → 记 st.chDone['<标记名>']（随存档，可被条件 { chDone } 查询）
     * once: true      → 只作内部记录（键带 @ 前缀，数据查不到） */
    chMarkKey(nodeId, ci, once) { return once === true ? ('@' + nodeId + '#' + ci) : String(once); },
    choiceDone(st, ch, ci, nodeId) {
      if (!ch || !ch.once) return false;
      return !!(st && st.chDone && st.chDone[Core.chMarkKey(nodeId, ci, ch.once)]);
    },
    markChoiceDone(st, ch, ci, nodeId) {
      if (!ch || !ch.once) return;
      if (!st.chDone) st.chDone = {};
      st.chDone[Core.chMarkKey(nodeId, ci, ch.once)] = true;
    },
    /* E8 正文分叉：取第一个满足条件的 t；都不满足用 node.t */
    nodeText(st, node) {
      const hit = ((node && node.tIf) || []).find(x => Core.condOk(st, x.cond));
      return hit ? hit.t : (node && node.t);
    },

    /* ---- 货币 / 资源守卫（v1.3 规则推广到任何 noSpendToZero 的资源）----
     * 买东西（商店 / 腕带 / 自动贩卖机）付款后必须至少留 1 —— 花光 = 该资源归零 = 闯关失败 */
    payReason(st, price, resId) {
      const r = Core.resDef(resId || Core.mainResId()) || { id: 'coins', name: '萨瓦币', unit: '枚', zeroWarn: '花光就闯关失败' };
      const have = Core.resOf(st, r.id);
      if (have < price) return (r.name || r.id) + '不够（需要 ' + price + ' ' + (r.unit || '') + '）';
      if (Core.resNoFail(r)) return '';           // E1：该资源花光不判失败 → 可以花到 0
      if (have - price < 1) return '买完就剩 0 ' + (r.unit || '') + '——' + (r.zeroWarn || '花光就闯关失败') + '，不能买';
      return '';
    },

    /* ---- 效果 ---- */
    applyFx(st, fx, log) {
      log = log || [];
      if (!fx) return log;
      if (fx.gain) fx.gain.forEach(it => {
        if (!Core.hasItem(st, it)) { st.items.push(it); log.push('获得 ' + it + ' ' + ((D.items[it] && D.items[it].icon) || '')); }
      });
      if (fx.lose) fx.lose.forEach(it => {
        const i = st.items.indexOf(it);
        if (i >= 0) { st.items.splice(i, 1); log.push('失去 ' + it); }
      });
      /* v0.2：资源变动统一走 applyRes（键 = 资源 id，如 coins / oxygen） */
      Core.resources().forEach(r => { if (fx[r.id] != null) Core.applyRes(st, r.id, fx[r.id], log); });
      if (fx.coinsByWristband) {                                  // 大里姆专用（腕带补偿卡）
        const n = fx.coinsByWristband * (st.wristband || 0);
        st.coins += n; log.push('补偿卡兑换 +' + n + ' 枚萨瓦币');   // 只会加钱，不触发底线
      }
      if (fx.learn) [].concat(fx.learn).forEach(k => {   // v0.2：也接受数组（一次记住多条线索）
        st.learned[k] = true; log.push('🔑 记住了一条线索：' + k);
      });
      return log;
    },
    /* 进入节点：en 效果（once / ifNoItem）+ 被偷提示 + 奇偶判定 */
    enter(st, nodeId) {
      const log = [];
      if (st.bankrupt) return log;                       // 本关已结束
      const node = D.nodes[nodeId];
      if (!node) return log;
      st.visited[nodeId] = true;
      st.flash = null;                                   // 本次进入的提示，按需在下面重设
      const en = node.en;
      if (en && !(en.once && st.done[nodeId])) {
        if (en.once) st.done[nodeId] = true;
        const skip = en.ifNoItem && Core.hasItem(st, en.ifNoItem);
        const before = {};
        Core.resources().forEach(r => { before[r.id] = Core.resOf(st, r.id); });
        if (!skip) {
          const fx = { gain: en.gain, lose: en.lose, learn: en.learn };
          Core.resources().forEach(r => { if (en[r.id] != null) fx[r.id] = en[r.id]; });
          Core.applyFx(st, fx, log);
        }
        /* 被偷强反馈的数据源——本次进入是「被偷」，还是被（ifNoItem 的）东西「挡下」 */
        const thiefRes = en.thiefRes || 'coins';
        const want = en[thiefRes] && en[thiefRes] < 0 ? -en[thiefRes] : 0;
        if (want > 0 && en.thief) {
          if (skip) st.flash = { kind: 'blocked', thief: en.thief, guard: en.ifNoItem, res: thiefRes };
          else {
            const taken = Math.min(want, before[thiefRes] || 0);   // 钳 0 之后实际被拿走的数量
            if (taken > 0) st.flash = { kind: 'theft', thief: en.thief, amount: taken, res: thiefRes };
          }
        }
        if (en.testItems) {
          const n = st.items.length;
          if (n % 2 === 0) { Core.applyFx(st, en.pass, log); log.push('背包里有 ' + n + ' 件道具，是个偶数 —— 中奖啦！'); }
          else log.push('背包里有 ' + n + ' 件道具，是个奇数 —— 可惜没有中奖。');
        }
        if (en.testCoins) {
          const n = st.coins;
          if (n % 2 === 1) { Core.applyFx(st, en.pass, log); log.push('你有 ' + n + ' 枚萨瓦币，是个奇数 —— 中奖啦！'); }
          else log.push('你有 ' + n + ' 枚萨瓦币，是个偶数 —— 可惜没有中奖。');
        }
      }
      return log;
    },
    go(st, nodeId) {
      if (st.bankrupt) return [];                        // 本关已结束（只能重开）
      if (st.loc && st.loc !== nodeId) st.hist.push(st.loc);
      st.loc = nodeId;
      syncScene(st, nodeId);
      const log = Core.enter(st, nodeId);
      Core.checkFail(st, log);                           // 进入时把资源扣光 → 立刻走失败结算
      return log;
    },
    goBack(st) {
      if (st.bankrupt) return [];
      const t = st.hist.pop() || D.start.node;
      st.loc = t;
      syncScene(st, t);
      const log = Core.enter(st, t);
      Core.checkFail(st, log);
      return log;
    },
    battleNeed(st, battle) {
      const hit = (battle.powerIf || []).find(x => Core.condOk(st, x.cond));
      return hit ? hit.power : battle.power;
    },
    choose(st, idx) {
      if (st.bankrupt) return { log: [] };               // 本关已结束
      const node = D.nodes[st.loc];
      const ch = node && node.c && node.c[idx];
      if (!ch) return { log: [] };
      if (Core.choiceDone(st, ch, idx, st.loc)) return { log: [] };   // E6：做过的一次性选项不再执行
      const log = [];
      Core.markChoiceDone(st, ch, idx, st.loc);          // E6：执行过 = 记标记（随存档）
      const say = ch.say ? Core.fillName(ch.say, st) : null;          // E7：旁白（不改状态；与效果日志并列、不重复）
      Core.applyFx(st, ch.fx, log);                      // v0.2：战斗选项也可以带代价（例如耗氧 5）
      if (st.bankrupt) { Core.checkFail(st, log); return { log: log, say: say }; }   // 代价把资源花光 → 就地结算，不再移动
      if (ch.battle) {
        const need = Core.battleNeed(st, ch.battle);
        const mine = Core.atkOf(st);
        if (mine >= need) { log.push('⚔ 你赢了！（武力值 ' + mine + ' ≥ ' + need + '）'); return { to: ch.battle.winTo, log: log, say: say }; }
        log.push('⚔ 你输了……（武力值 ' + mine + ' < ' + need + '）');
        /* E11（v0.4）：败方描写 battle.loseSay——在既有机械行之后，以与 choice.say 相同的旁白渠道带出；
         * 不改状态；败北去向仍由 loseTo 决定（B02 起默认＝战斗发生地，40③→42 为登记例外） */
        const loseSay = ch.battle.loseSay ? Core.fillName(ch.battle.loseSay, st) : null;
        return { to: ch.battle.loseTo, log: log, say: [say, loseSay].filter(Boolean).join('\n') || null };
      }
      if (ch.random) return { to: ch.random[Math.random() < 0.5 ? 0 : 1], log: log, say: say };
      if (ch.back) return { back: true, log: log, say: say };
      if (ch.toIf) {
        const hit = ch.toIf.find(x => Core.condOk(st, x.cond));
        return { to: hit ? hit.to : ch.to, log: log, say: say };
      }
      return { to: ch.to, log: log, say: say };
    },
    /* 点击编号应执行哪个选项（含“返回”类）——返回下标，找不到返回 -1
     * v0.2：先匹配普通去向（to / random / 返回），再匹配战斗的胜/负去向——
     * 免得某个编号既是战斗的输赢去向、又是另一个普通选项的终点时，点一下就被拉进战斗。 */
    pinChoiceIndex(st, pinId) {
      const node = D.nodes[st.loc];
      if (!node) return -1;
      const list = node.c || [];
      const target = (ch, ci, asBattle) => {
        if (asBattle && !ch.battle) return false;
        if (!asBattle && ch.battle) return false;
        if (Core.choiceDone(st, ch, ci, st.loc)) return false;      // E6：做过的一次性选项不可点
        if (!Core.condOk(st, ch.cond)) return false;
        const t = Core.choiceTargets(ch);
        if (asBattle) return [...t.win, ...t.lose].indexOf(pinId) >= 0;
        if ([...t.to, ...t.random].indexOf(pinId) >= 0) return true;
        if (t.back && st.hist.length && st.hist[st.hist.length - 1] === pinId) return true;
        return false;
      };
      for (let i = 0; i < list.length; i++) if (target(list[i], i, false)) return i;
      for (let i = 0; i < list.length; i++) if (target(list[i], i, true)) return i;
      return -1;
    },
    /* 选项会通往哪些编号（供“选项→地图”对应显示） */
    choiceTargets(ch) {
      const t = { to: [], win: [], lose: [], random: [], back: false };
      if (ch.to) t.to.push(ch.to);
      if (ch.toIf) ch.toIf.forEach(x => { if (t.to.indexOf(x.to) < 0) t.to.push(x.to); });
      if (ch.random) ch.random.forEach(x => t.random.push(x));
      if (ch.battle) { t.win.push(ch.battle.winTo); t.lose.push(ch.battle.loseTo); }
      if (ch.back) t.back = true;
      return t;
    },
    /* 当前可点击的编号点集合 = 可用选项的直接目标（含“返回”的上一地点）；只认当前场景的编号 */
    reachablePins(st) {
      const node = D.nodes[st.loc];
      const set = {};
      if (!node) return set;
      if (st.bankrupt) return set;                       // 本关已结束
      if (node.fail || node.win) return set;             // 结束状态不可走
      const sc = D.scenes[Core.sceneOf(st)];
      const pins = (sc && sc.pins) || {};
      (node.c || []).forEach((ch, ci) => {
        if (Core.choiceDone(st, ch, ci, st.loc)) return;    // E6：做过的一次性选项 = 不可达
        if (!Core.condOk(st, ch.cond)) return;
        const t = Core.choiceTargets(ch);
        [...t.to, ...t.random, ...t.win, ...t.lose].forEach(x => { if (pins[x]) set[x] = true; });
        if (t.back && st.hist.length) {
          const b = st.hist[st.hist.length - 1];
          if (pins[b]) set[b] = true;
        }
      });
      return set;
    },
    /* ---- v0.2 走投无路检测（卡死保险，设计档 §6 第 5 条）----
     * 当前节点若既没有「condOk 且点得动的选项」、也没有「可达编号」、也没有「返回选项」
     * → 判定走投无路（界面弹「求救」面板：回到安全点 / 重开本关）。 */
    deadEnd(st) {
      const node = st && st.loc ? D.nodes[st.loc] : null;
      if (!node || st.bankrupt) return false;
      if (node.fail || node.win) return false;
      const list = node.c || [];
      const live = (ch, ci) => !Core.choiceDone(st, ch, ci, st.loc);   // E6：做过的一次性选项 = 不可用
      const anyChoice = list.some((ch, ci) => live(ch, ci) && Core.condOk(st, ch.cond) && Core.choiceUsable(st, ch));
      const anyPin = Object.keys(Core.reachablePins(st)).length > 0;
      const anyBack = st.hist.length > 0 && list.some((ch, ci) => live(ch, ci) && ch.back && Core.condOk(st, ch.cond));
      return !anyChoice && !anyPin && !anyBack;
    },
    /* 选项是否真的点得动：prices 类要至少有一个能买得起的价格（全灰 = 不是可执行动作） */
    choiceUsable(st, ch) {
      if (ch.prices && ch.prices.length) return ch.prices.some(n => !Core.payReason(st, n));
      return true;
    },
    /* ---- 只读助手（v0.3，无头试玩器 / 管理台共用；只看不改）----
     * 当前节点在界面上「看得见」的选项列表 —— 与 renderNode 的显示规则同出一处：
     *   可见性走 Core.choiceState（E12 单点判定）：'hide' 不显示、'lock' 灰显、'ok' 正常；
     *   带 prices 的选项按价格拆成多项；E6：做过的一次性选项（once）不再出现。
     * 返回 [{ i, ci, label, price, ok, why, hint, back, targets }]
     *   i     = 显示序号（1 起；执行时由调用方回传给 Core.choose，用 ci）
     *   ci    = node.c 里的下标
     *   ok    = 现在能不能点（条件满足 且 买得起）
     *   why   = 不能点的原因（能点 = ''），供灰显与 CLI 报错用（机械理由；玩家向措辞见 Core.lockHint）
     *   hint  = E4 提示分级（缺省 vague）
     *   targets = Core.choiceTargets(ch)（去重前的原始去向）
     * 注：价格类选项「条件不满足 + 标了 lock」时，这里比 renderNode 更严（DOM 只按钱禁用价格按钮，
     *     这里条件不满足就整项判灰）——当前关卡数据没有这种组合，留着这行是为了标明这处有意的偏离。 */
    visibleChoices(st) {
      const node = st && st.loc ? D.nodes[st.loc] : null;
      if (!node || node.fail || node.win || st.bankrupt) return [];
      const out = [];
      (node.c || []).forEach((ch, ci) => {
        if (Core.choiceDone(st, ch, ci, st.loc)) return;    // E6：做过的一次性选项 = 隐藏
        const state = Core.choiceState(st, ch);             // E12：ok / lock（灰显）/ hide
        if (state === 'hide') return;                       // 与界面一致：该隐藏的直接不显示
        const condOk = Core.condOk(st, ch.cond);
        const targets = Core.choiceTargets(ch);
        const hint = Core.choiceHint(ch);                   // E4：提示分级（缺省 vague）
        if (ch.prices && ch.prices.length) {
          ch.prices.forEach(n => {
            const why = condOk ? Core.payReason(st, n) : Core.lockReason(ch);
            out.push({ i: out.length + 1, ci, label: ch.l, price: n, ok: !why, why, hint, back: false, targets });
          });
          return;
        }
        const why = condOk ? '' : Core.lockReason(ch);
        out.push({ i: out.length + 1, ci, label: ch.l, price: null, ok: !why, why, hint, back: !!ch.back, targets });
      });
      return out;
    },
    /* 只读助手（v0.3）：本节点的商店（renderNode 商店块的纯数据版）——没有商店 = null
     * 返回 { price, resId, resName, unit, stock: [{ id, icon, owned, ok, why }] }
     *   ok  = 现在能不能买（没拥有 且 payReason 放行）；why = 不能买的理由（能买 = ''） */
    shopInfo(st) {
      const node = st && st.loc ? D.nodes[st.loc] : null;
      if (!node || !node.shop || node.fail || node.win || st.bankrupt) return null;
      const rid = Core.mainResId();
      const r = Core.resDef(rid) || {};
      return {
        price: node.shop.price, resId: rid, resName: r.name || rid, unit: r.unit || '',
        stock: (node.shop.stock || []).map(it => {
          const owned = Core.hasItem(st, it);
          const why = owned ? '已拥有' : Core.payReason(st, node.shop.price);
          return { id: it, icon: (D.items[it] || {}).icon || '', owned, ok: !owned && !why, why };
        })
      };
    },
    /* 只读助手（v0.3）：本节点的废料回收（出售）——没有回收点 = null，没有可卖的东西 = []
     * 返回 [{ id, icon, gain }]（gain = 卖一件得几点主资源，与 Core.sell 一致） */
    sellInfo(st) {
      const node = st && st.loc ? D.nodes[st.loc] : null;
      if (!node || !node.sell || node.fail || node.win || st.bankrupt) return null;
      return st.items
        .filter(it => !(D.items[it] && D.items[it].nosell))          // 红框道具不可卖
        .map(it => ({ id: it, icon: (D.items[it] || {}).icon || '', gain: 1 }));
    },
    safeNodeId() { return (D && D.meta && D.meta.safeNode) || (D && D.start.node) || null; },

    /* ---- 交易 ---- */
    buy(st, itemId, price, log) {
      log = log || [];
      if (Core.hasItem(st, itemId)) { log.push('你已经有一件「' + itemId + '」了。'); return log; }
      const why = Core.payReason(st, price);              // 钱不够 / 花光就失败，两种都不许买
      if (why) { log.push('买不了：' + why); return log; }
      const rid = Core.mainResId();
      st[rid] -= price; st.items.push(itemId);
      log.push('购买「' + itemId + '」（-' + price + ' ' + ((Core.resDef(rid) || {}).unit || '') + '）');
      return log;
    },
    sell(st, itemId, log) {
      log = log || [];
      const meta = D.items[itemId] || {};
      if (!Core.hasItem(st, itemId) || meta.nosell) { log.push('这件道具不能卖。'); return log; }
      st.items.splice(st.items.indexOf(itemId), 1);
      const rid = Core.mainResId();
      st[rid] += 1;
      log.push('卖出「' + itemId + '」（+1 ' + ((Core.resDef(rid) || {}).unit || '') + '）');
      return log;
    },
    buySticker(st, n, log) {   // 大里姆 34 号：买腕带（走同一条购买守卫）
      log = log || [];
      const why = Core.payReason(st, n);
      if (why) { log.push('买不了腕带：' + why); return log; }
      const rid = Core.mainResId();
      st[rid] -= n; st.wristband = n;
      log.push('买了一条 ' + n + ' ' + ((Core.resDef(rid) || {}).unit || '') + ((Core.resDef(rid) || {}).name || '') + '的腕带（-' + n + ' ' + ((Core.resDef(rid) || {}).unit || '') + '）');
      return log;
    }
  };
  G.GameCore = Core;

  /* 默认选中注册表里的第一个关卡（levels/dalim.js 先加载 → 默认《勇闯大里姆》） */
  Core.selectLevel(Core.defaultLevelId());

  if (typeof document === 'undefined') return; // Node 测试环境到此为止

  /* ============================ ② DOM 层 ============================ */
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const store = (() => { try { return window.localStorage; } catch (e) { return null; } })();
  let st = null;
  let zoom = 1, tx = 0, ty = 0;
  let calib = false;
  let dragging = false, moved = false, dragX = 0, dragY = 0;
  let suppressClick = false;
  let lastReach = {};      // 当前可达编号（渲染顺序：renderPins → renderNode 共用）
  let curScene = null;     // 当前已应用的场景 id（判断是否需要换图）
  let curLevelId = null;   // 当前关卡 id（存档键用）

  const save = () => { if (store && st) Core.saveTo(store, curLevelId, st); };
  const nm = txt => Core.fillName(txt, st);                      // {me} 占位符 → 玩家名
  const resDef = id => Core.resDef(id) || {};
  const esc = s => String(s == null ? '' : s)                    // 关卡数据的文本进 innerHTML 前先转义
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* 提示气泡：默认总计 3.4 秒；opts.hold 可延长（E7 的旁白用得更久）。
   * 第二参数必须是对象——log.forEach(toast) 会把下标当第二参数传进来，收数字当毫秒会出事。 */
  function toast(msg, opts) {
    const hold = (opts && typeof opts === 'object' && opts.hold) || 3400;
    const box = $('toasts');
    const d = document.createElement('div');
    d.className = 'toast';
    d.textContent = msg;
    box.appendChild(d);
    setTimeout(() => d.classList.add('fade'), hold - 800);
    setTimeout(() => d.remove(), hold);
  }

  /* ---------- 被偷强反馈（v1.3，v0.2 起对任何资源都通用） ---------- */
  let alertTimer = null;
  function showAlertBar(kind, text) {
    const bar = $('alertBar');
    bar.textContent = text;
    bar.className = 'alertBar ' + kind;
    clearTimeout(alertTimer);
    alertTimer = setTimeout(() => bar.classList.add('hidden'), 4800);
  }
  function hideAlertBar() {
    clearTimeout(alertTimer);
    alertTimer = null;
    $('alertBar').classList.add('hidden');
  }
  function resEl(id) { return document.querySelector('#resList .res[data-res="' + id + '"]'); }
  function flashResCount(amount, resId) {
    const el = resEl(resId);
    if (!el) return;
    el.classList.remove('coins-hit');
    void el.offsetWidth;                  // 强制重排，让动画能重新播放
    el.classList.add('coins-hit');
    setTimeout(() => el.classList.remove('coins-hit'), 1300);
    const pop = document.createElement('span');
    pop.className = 'coinPop';
    pop.textContent = '−' + amount;
    el.appendChild(pop);
    setTimeout(() => pop.remove(), 1500);
  }
  /* Core 记录的「本次进入」事件 → 界面反馈（红=被偷 / 绿=被挡下） */
  function showFlash(f) {
    if (!f) return;
    const r = resDef(f.res);
    if (f.kind === 'theft') {
      showAlertBar('theft', '🥷 ' + f.thief + '偷走了你 ' + f.amount + ' ' + (r.unit || '') + (r.name || '') + '！');
      flashResCount(f.amount, f.res);
    } else if (f.kind === 'blocked') {
      showAlertBar('blocked', '🪢 ' + f.guard + '挡住了' + f.thief);
    }
  }

  /* ---------- 场景（v1.2 双区域 → v0.2 多场景通用） ---------- */
  function sceneLabel(sid) {
    const sc = D.scenes[sid];
    if (!sc) return '';
    if (sc.label) return sc.label;
    const parts = String(sc.name || '').split('·');
    return (parts[parts.length - 1] || sc.id).trim();
  }
  /* 同步当前场景：背景图 / 遮罩尺寸 / 舞台比例 / 场景角标；变化时复位视图并提示一次 */
  function applyScene() {
    const sid = st ? Core.sceneOf(st) : Core.defaultScene();
    if (!sid || sid === curScene) return;
    const first = curScene === null;
    curScene = sid;
    const sc = D.scenes[sid];
    const img = $('sceneImg');
    img.src = sc.image;              // 图片路径只来自关卡数据（levels/*.js）
    img.alt = sc.name + ' 场景图';
    $('dimSvg').setAttribute('viewBox', '0 0 ' + sc.width + ' ' + sc.height);
    [$('maskRect'), $('dimRect')].forEach(r => {
      r.setAttribute('width', sc.width);
      r.setAttribute('height', sc.height);
    });
    $('stage').style.setProperty('--scene-w', sc.width);
    $('stage').style.setProperty('--scene-h', sc.height);
    $('sceneTag').textContent = sceneLabel(sid);
    resetView();
    if (!first && st) toast('🛗 到达：' + sceneLabel(sid));
  }

  /* ---------- 关卡选择页（v0.2） ---------- */
  function levelProgress(id) {
    const s = store ? Core.loadFrom(store, id) : null;
    if (!s) return null;
    const lv = LEVELS[id] || {};
    const node = (lv.nodes || {})[s.loc];
    return { loc: s.loc, name: node ? node.n : '？', visited: Object.keys(s.visited || {}).length };
  }
  function levelCard(id, lv) {
    const meta = lv.meta || {};
    const card = document.createElement('div');
    card.className = 'levelCard';

    const poster = document.createElement('img');
    poster.className = 'lcPoster';
    poster.src = meta.poster || ((lv.scenes[Object.keys(lv.scenes)[0]] || {}).image || '');
    poster.alt = meta.title || id;
    card.appendChild(poster);

    const body = document.createElement('div');
    body.className = 'lcBody';
    const title = document.createElement('h2');
    title.className = 'lcTitle';
    title.textContent = meta.title || id;
    body.appendChild(title);
    const sub = document.createElement('div');
    sub.className = 'lcSub';
    sub.textContent = meta.level || '';
    body.appendChild(sub);
    const tag = document.createElement('p');
    tag.className = 'lcTag';
    tag.textContent = meta.tagline || '';
    body.appendChild(tag);

    /* 两种难度的开局资源（从 resources 表读，不写死） */
    const resBox = document.createElement('div');
    resBox.className = 'lcRes';
    ['normal', 'hard'].forEach(d => {
      const bits = (lv.resources || []).map(r => {
        const v = r.start && r.start[d] != null ? r.start[d] : (r.start && r.start.normal);
        return (r.icon || '') + (r.name || r.id) + ' ' + v;
      });
      const row = document.createElement('div');
      row.className = 'lcResRow';
      row.textContent = (d === 'normal' ? '普通模式' : '困难模式') + '：' + bits.join('　');
      resBox.appendChild(row);
    });
    body.appendChild(resBox);

    const btns = document.createElement('div');
    btns.className = 'lcBtns';
    const bn = document.createElement('button');
    bn.className = 'lcStart';
    bn.innerHTML = '普通模式<br><small>开始</small>';
    bn.onclick = () => startGame(id, 'normal');
    const bh = document.createElement('button');
    bh.className = 'lcStart';
    bh.innerHTML = '困难模式<br><small>开始</small>';
    bh.onclick = () => startGame(id, 'hard');
    btns.appendChild(bn);
    btns.appendChild(bh);
    const prog = levelProgress(id);
    if (prog) {
      const br = document.createElement('button');
      br.className = 'lcResume';
      br.textContent = '↩ 继续上次进度（停在 ' + prog.loc + ' · ' + prog.name + '，已探索 ' + prog.visited + ' 处）';
      br.onclick = () => { const s = Core.loadFrom(store, id); if (s) resumeGame(id, s); };
      btns.appendChild(br);
    }
    body.appendChild(btns);
    card.appendChild(body);
    return card;
  }
  function renderLevelSelect() {
    const box = $('levelList');
    box.innerHTML = '';
    Core.levelIds().forEach(id => box.appendChild(levelCard(id, LEVELS[id])));
    $('playerName').value = Core.playerName(store);
  }

  /* 真正进入关卡：跑开局效果 + 存档 + 渲染（序章层按下「跳过 / 开始」后才走到这里） */
  function beginRun() {
    Core.go(st, D.start.node).forEach(toast);
    save();
    renderAll();
  }
  /* E2：序章层——新局开场整屏显示一次（读档不重放；没有 meta.prologue 的关卡不显示） */
  function showPrologue(pro) {
    $('prologueLines').innerHTML = pro.lines.map(t => '<p>' + esc(nm(t)) + '</p>').join('');
    const img = $('prologueImg');
    if (pro.image) { img.src = pro.image; img.classList.remove('hidden'); }
    else { img.removeAttribute('src'); img.classList.add('hidden'); }
    const go = () => { $('prologueLayer').classList.add('hidden'); beginRun(); };   // 两个按钮都只负责进入关卡
    $('prologueSkip').onclick = go;
    $('prologueStart').onclick = go;
    $('prologueLayer').classList.remove('hidden');
  }
  /* E2：新局的统一起手——有 meta.prologue 就先弹序章层，没有就直接进关卡（读档不重放） */
  function startRun() {
    const pro = Core.prologue();
    if (pro) showPrologue(pro); else beginRun();
  }
  function startGame(id, diff) {
    if (!Core.selectLevel(id)) return;
    curLevelId = id;
    const name = Core.cleanName($('playerName').value);
    if (store) Core.savePlayer(store, name);
    st = Core.newState(diff, name);
    curScene = null;
    foldLoc = null;                      // 换关卡 = 折叠状态归零（foldLoc 在下方声明，执行时早已初始化）
    $('overlay').classList.add('hidden');
    startRun();
  }
  function resumeGame(id, s) {
    if (!Core.selectLevel(id)) return;
    curLevelId = id;
    st = Core.normalizeState(s);
    if (store && st.me) Core.savePlayer(store, st.me);
    curScene = null;
    foldLoc = null;
    save();
    $('overlay').classList.add('hidden');
    renderAll();
  }
  function restart() {
    if (!confirm('重新开始？本关进度将清空。')) return;
    st = Core.newState(st ? st.diff : 'normal', st ? st.me : Core.playerName(store));
    curScene = null;
    foldLoc = null;
    startRun();          // E2：重开本关 = 新局 → 有 prologue 也先弹一次（读档不重放）
  }
  function backToLevelSelect() {
    save();
    renderLevelSelect();
    $('overlay').classList.remove('hidden');
  }

  /* ---------- 渲染 ---------- */
  function renderAll() {
    if (!D || !st) return;
    applyScene();   // 先同步场景（背景图 / 遮罩 / 舞台比例），再渲染
    hideAlertBar(); // 重绘即撤下上一条警示条（本次新发生的由 showFlash 在本函数之后重新弹出）
    renderHUD(); renderPins(); renderCharSpots(); renderVisited(); renderNode();
    if (Core.deadEnd(st)) showStuck();   // v0.2：卡死保险
  }

  /* HUD：全部资源（含低额预警）+ 武力值 */
  function lowThreshold(r) {
    if (r.low != null) return r.low;
    const s0 = (r.start && (r.start.normal || 0)) || 0;
    return Math.max(1, Math.round(s0 * 0.2));
  }
  function renderHUD() {
    const box = $('resList');
    box.innerHTML = '';
    Core.resources().forEach(r => {
      const v = Core.resOf(st, r.id);
      const low = v <= lowThreshold(r);
      const s = document.createElement('span');
      s.className = 'stat res' + (low ? ' low' : '');
      s.dataset.res = r.id;
      s.title = (r.name || r.id) + (low ? '：偏低！' : '');
      s.textContent = (r.icon || '') + ' ' + v;
      box.appendChild(s);
    });
    $('atkEl').textContent = '⚔ 武力值 ' + Core.atkOf(st);
  }

  /* 场景遮罩：只在“当前位置 + 可达位置”开洞。孔洞半径按场景宽度等比缩放 */
  function renderDim() {
    const sc = D.scenes[Core.sceneOf(st)];
    const k = sc.width / 800;
    const g = $('dimHoles');
    g.innerHTML = '';
    const add = (x, y, r) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r);
      c.setAttribute('fill', 'url(#softHole)');
      g.appendChild(c);
    };
    if (st.loc && sc.pins[st.loc]) {
      const [x, y] = sc.pins[st.loc];
      add(x, y, 98 * k);
    }
    Object.keys(lastReach).forEach(id => {
      if (id === st.loc) return;
      const [x, y] = sc.pins[id];
      add(x, y, 74 * k);
    });
  }

  function renderPins() {
    const sc = D.scenes[Core.sceneOf(st)];
    const layer = $('pinLayer');
    layer.innerHTML = '';
    lastReach = Core.reachablePins(st);
    Object.keys(sc.pins).forEach(id => {
      const [x, y] = sc.pins[id];
      const isCur = st.loc === id;
      const canClick = FREE_MOVE || !!lastReach[id];
      const isVisited = !!st.visited[id];
      const b = document.createElement('button');
      b.className = 'pin'
        + (isCur ? ' current' : '')
        + (!isCur && canClick ? ' reach' : '')
        + (!isCur && !canClick ? (isVisited ? ' visited' : '') : '');
      b.dataset.id = id;
      b.style.left = (x / sc.width * 100) + '%';
      b.style.top = (y / sc.height * 100) + '%';
      b.innerHTML = '<span class="ring"></span><span class="num">' + id + '</span>'
        + (isCur ? '<span class="hereTag">你在这里</span>' : '');
      b.onclick = () => {
        if (calib || suppressClick || !canClick || st.loc === id) return;
        navViaPin(id);
      };
      layer.appendChild(b);
    });
    renderDim();
  }

  /* 点击可达编号 = 执行通往它的那个选项（含条件与花费；“返回”类同样可点） */
  function navViaPin(id) {
    if (FREE_MOVE) {
      Core.go(st, id).forEach(toast);
      const fl = Core.takeFlash(st);
      save(); renderAll(); showFlash(fl);
      return;
    }
    const idx = Core.pinChoiceIndex(st, id);
    if (idx < 0) return;
    doChoice(idx);
  }

  function pinEl(id) { return document.querySelector('#pinLayer .pin[data-id="' + id + '"]'); }
  function hintPins(ids, on) {
    ids.forEach(id => { if (!lastReach[id]) return; const el = pinEl(id); if (el) el.classList.toggle('hint', on); });
  }

  function renderVisited() {
    const box = $('visitedList');
    box.innerHTML = '';
    const ids = Object.keys(st.visited)
      .filter(id => D.nodes[id] && !D.nodes[id].hidden && !D.nodes[id].fail && !D.nodes[id].win)
      .sort((a, b) => Number(a) - Number(b));
    if (!ids.length) { box.innerHTML = '<span class="dim">（还没去过任何地方）</span>'; return; }
    ids.forEach(id => {
      const s = document.createElement('span');
      s.className = 'vchip'; s.textContent = id; s.title = nm(D.nodes[id].n);
      box.appendChild(s);
    });
  }

  /* ---------- 人物：地图光环 / 本处人物小卡 / 人物图鉴 ---------- */
  function charsHere() {
    const node = D.nodes[st.loc];
    const sid = Core.sceneOf(st);
    return ((node && node.chars) || []).filter(cid => {
      const ch = D.characters[cid];
      return !!ch && ch.spot && ch.spot.scene === sid;
    });
  }
  /* 立绘：有 img 用图；没有（原创关卡立绘未到）就用 emoji 占位 */
  function charFace(ch, cls) {
    if (ch.img) return '<img class="' + cls + '" src="' + ch.img + '" alt="' + ch.name + '">';
    return '<span class="' + cls + ' ccFace">' + (ch.emoji || '👤') + '</span>';
  }
  function renderCharSpots() {
    const layer = $('charLayer');
    layer.innerHTML = '';
    const sc = D.scenes[Core.sceneOf(st)];
    const size = Math.round(88 * (sc.width / 800)) + 'px';
    charsHere().forEach((cid, i) => {
      const ch = D.characters[cid];
      const d = document.createElement('div');
      d.className = 'charSpot' + (ch.spot.y > sc.height * 0.8 ? ' low' : '') + (i ? ' alt' : '');
      d.style.left = (ch.spot.x / sc.width * 100) + '%';
      d.style.top = (ch.spot.y / sc.height * 100) + '%';
      d.style.width = size;
      d.style.height = size;
      d.innerHTML = '<span class="charHalo"></span><span class="charName">' + (ch.emoji ? ch.emoji + ' ' : '👤 ') + ch.name + '</span>';
      layer.appendChild(d);
    });
  }
  function renderHereChars() {
    const box = $('hereChars');
    box.innerHTML = '';
    const ids = charsHere();
    box.classList.toggle('hidden', !ids.length);
    if (!ids.length) return;
    const head = document.createElement('div');
    head.className = 'hcHead';
    head.textContent = '👤 本处人物（点一下看介绍）';
    box.appendChild(head);
    const row = document.createElement('div');
    row.className = 'hcRow';
    ids.forEach(cid => {
      const ch = D.characters[cid];
      const b = document.createElement('button');
      b.className = 'hereChar';
      b.innerHTML = charFace(ch, 'hcFace') +
        '<span class="hcText"><b>' + ch.name + '</b><span class="hcTitle">' + (ch.title || '（无称号）') + '</span></span>';
      b.onclick = () => openCharCard(cid);
      row.appendChild(b);
    });
    box.appendChild(row);
  }
  function openCharCard(cid) {
    const ch = D.characters[cid];
    if (!ch) return;
    const sc = D.scenes[ch.spot.scene];
    $('charCardBody').innerHTML =
      charFace(ch, 'ccImg') +
      '<h3 class="ccName">' + ch.name + (ch.title ? ' <span class="dim small">· ' + ch.title + '</span>' : '') + '</h3>' +
      '<p class="ccBio">' + ch.bio + '</p>' +
      '<p class="dim small">常出没于：' + (sc ? sceneLabel(sc.id) : '？') + '</p>';
    $('charCardModal').classList.remove('hidden');
  }
  function openCharsBook() {
    const grid = $('charsGrid');
    grid.innerHTML = '';
    D.charOrder.forEach(cid => {
      const ch = D.characters[cid];
      if (!ch) return;
      const b = document.createElement('button');
      b.className = 'charCell';
      b.innerHTML = charFace(ch, 'ccImg') +
        '<b>' + ch.name + '</b><span>' + (ch.title || '（无称号）') + '</span>';
      b.onclick = () => openCharCard(cid);
      grid.appendChild(b);
    });
    $('charsModal').classList.remove('hidden');
  }

  /* v0.3（§8.3）：去向标注「→ 编号 / 节点名」从玩家视图撤下——它会把事件节点的名字直接剧透；
   * 导航改由地图高亮（选项悬停点亮编号）与选项里的方向感文案承担；lab 与开发版 CLI 自带渲染，保留。 */

  /* ---------- 选项 / 商店（E9：选项在上；商店与回收收成一行，默认折叠） ---------- */
  let foldOpen = { shop: false, sell: false };   // 折起状态：同一地点内保持，换地点恢复默认折叠
  let foldLoc = null;

  /* 一行折叠块：默认收拢；点开即可买/卖（折叠不影响可点性） */
  function foldBox(title, key) {
    const d = document.createElement('details');
    d.className = 'shopFold';
    const s = document.createElement('summary');
    s.textContent = title;
    d.appendChild(s);
    d.open = !!foldOpen[key];
    d.addEventListener('toggle', () => { foldOpen[key] = d.open; });
    return d;
  }

  function renderChoiceList(box, node) {
    node.c.forEach((ch, idx) => {
      if (Core.choiceDone(st, ch, idx, st.loc)) return;    // E6：做过的一次性选项 → 隐藏
      const state = Core.choiceState(st, ch);              // E12：ok / lock（灰显）/ hide
      if (state === 'hide') return;
      const ok = state === 'ok';
      if (ch.prices) {
        const wrap = document.createElement('div');
        wrap.className = 'priceBox';
        const lab = document.createElement('div');
        lab.className = 'priceLabel';
        lab.textContent = ch.l + '（选一个价格）：';
        wrap.appendChild(lab);
        const row = document.createElement('div');
        row.className = 'priceRow';
        let floorStop = false;
        ch.prices.forEach(n => {
          const why = Core.payReason(st, n);
          const b = document.createElement('button');
          b.className = 'priceBtn';
          b.textContent = n + ' ' + (resDef(Core.mainResId()).unit || '');
          b.disabled = !!why;
          b.title = why;
          if (why) {
            const tag = document.createElement('span');
            tag.className = 'pwTag';
            tag.textContent = Core.resOf(st, Core.mainResId()) < n ? '钱不够' : '要留 1 ' + (resDef(Core.mainResId()).unit || '');
            b.appendChild(tag);
            if (Core.resOf(st, Core.mainResId()) >= n) floorStop = true;
          }
          b.onclick = () => {
            if (Core.payReason(st, n)) return;   // 守卫判定与按钮禁用同出一处
            Core.buySticker(st, n).forEach(toast);
            if (ch.say) toast(Core.fillName(ch.say, st), { hold: 6000 });   // E7：价格类选项也走同一条旁白口径
            Core.markChoiceDone(st, ch, idx, st.loc);      // E6：价格类选项同样只做一次
            const hit = (ch.toIf || []).find(x => Core.condOk(st, x.cond));
            Core.go(st, hit ? hit.to : ch.to).forEach(toast);
            const fl = Core.takeFlash(st);
            save(); renderAll(); showFlash(fl);
          };
          row.appendChild(b);
        });
        wrap.appendChild(row);
        if (floorStop) {
          const hint = document.createElement('div');
          hint.className = 'priceWhy';
          hint.textContent = '❗ 付款后必须至少留 1 ' + (resDef(Core.mainResId()).unit || '') + '——花光就闯关失败。';
          wrap.appendChild(hint);
        }
        box.appendChild(wrap);
        return;
      }
      box.appendChild(makeChoiceButton(ch, idx, ok));
    });
  }

  /* 商店 / 废料回收：各收成一行（E9），展开后与从前一样——入口从 Core.shopInfo/sellInfo 同一份数据来 */
  function renderShopFolds(box, node) {
    if (foldLoc !== st.loc) { foldLoc = st.loc; foldOpen = { shop: false, sell: false }; }
    if (node.shop) {
      const fold = foldBox('🛒 商店（点开）', 'shop');
      const wrap = document.createElement('div');
      wrap.className = 'shopBox';
      const why = Core.payReason(st, node.shop.price);
      node.shop.stock.forEach(it => {
        const meta = D.items[it] || {};
        const owned = Core.hasItem(st, it);
        const row = document.createElement('div');
        row.className = 'shopRow';
        row.innerHTML = '<span class="sIcon">' + (meta.icon || '❔') + '</span>' +
          '<span class="sName">' + it + (meta.atk ? ' <em>武力+' + meta.atk + '</em>' : '') + '</span>' +
          '<span class="sPrice">' + node.shop.price + ' ' + (resDef(Core.mainResId()).unit || '') + '</span>';
        const b = document.createElement('button');
        b.textContent = owned ? '已拥有' : '购买';
        b.disabled = owned || !!why;
        b.title = why;
        b.onclick = () => {
          if (Core.payReason(st, node.shop.price)) { renderAll(); return; }
          Core.buy(st, it, node.shop.price).forEach(toast);
          save(); renderAll();
        };
        row.appendChild(b);
        wrap.appendChild(row);
      });
      if (why && node.shop.stock.some(it => !Core.hasItem(st, it))) {
        const note = document.createElement('div');
        note.className = 'shopWhy';
        note.textContent = '❗ ' + why;
        wrap.appendChild(note);
      }
      fold.appendChild(wrap);
      box.appendChild(fold);
    }
    if (node.sell) {
      const fold = foldBox('♻ 回收（点开）', 'sell');
      const wrap = document.createElement('div');
      wrap.className = 'shopBox';
      const sellable = st.items.filter(it => !(D.items[it] && D.items[it].nosell));
      if (!sellable.length) {
        const p = document.createElement('div');
        p.className = 'dim';
        p.textContent = '（没有可出售的道具；红框道具不能卖。）';
        wrap.appendChild(p);
      }
      sellable.forEach(it => {
        const meta = D.items[it] || {};
        const row = document.createElement('div');
        row.className = 'shopRow';
        row.innerHTML = '<span class="sIcon">' + (meta.icon || '❔') + '</span><span class="sName">' + it + '</span>';
        const b = document.createElement('button');
        b.textContent = '卖出 +1 ' + (resDef(Core.mainResId()).unit || '');
        b.onclick = () => { Core.sell(st, it).forEach(toast); save(); renderAll(); };
        row.appendChild(b);
        wrap.appendChild(row);
      });
      fold.appendChild(wrap);
      box.appendChild(fold);
    }
  }

  function doChoice(idx) {
    const res = Core.choose(st, idx);
    (res.log || []).forEach(toast);
    if (res.say) toast(res.say, { hold: 6000 });   // E7：旁白（与效果日志并列，不走 log 通道所以不会重复）
    let log = [];
    if (res.back) log = Core.goBack(st);
    else if (res.to) log = Core.go(st, res.to);
    log.forEach(toast);
    const flash = Core.takeFlash(st);
    save(); renderAll();
    showFlash(flash);
  }

  function makeChoiceButton(ch, idx, ok) {
    const b = document.createElement('button');
    b.className = 'choice';
    const t = Core.choiceTargets(ch);

    if (!ok) {                     // 锁定（含带战斗的战斗选项）：先于战斗分支——锁定项永远显示 lockText 且不可点
      b.classList.add('locked');
      b.disabled = true;
      /* E5：灰显理由是玩家向的 lockText / 兜底（不带数字与内部词），不再是机械理由 */
      b.innerHTML = '<span>🔒 ' + nm(ch.l) + '</span><span class="chip">' + esc(Core.lockHint(ch)) + '</span>';
    } else if (ch.battle) {
      const need = Core.battleNeed(st, ch.battle);
      const mine = Core.atkOf(st);
      b.classList.add('battle');
      if (mine < need) b.classList.add('risk');
      /* 战斗对照（exact 白名单③）保留；「胜 → / 负 → 」去向标签已按 §8.3 撤下 */
      b.innerHTML = '<span>' + nm(ch.l) + '</span>' +
        '<span class="chip">你的武力值 ' + mine + (mine >= need ? ' ≥ ' : ' < ') + need + '</span>';
    } else {
      b.innerHTML = '<span>' + nm(ch.l) + '</span>';
    }

    b.onclick = () => doChoice(idx);

    const sc = D.scenes[Core.sceneOf(st)];
    const tgts = [...t.to, ...t.random, ...t.win, ...t.lose];
    if (t.back && st.hist.length) tgts.push(st.hist[st.hist.length - 1]);
    const pinTargets = tgts.filter(x => sc.pins[x]);
    if (ok && pinTargets.length) {
      b.addEventListener('mouseenter', () => hintPins(pinTargets, true));
      b.addEventListener('mouseleave', () => hintPins(pinTargets, false));
    }
    return b;
  }

  /* 结束界面（通关 / 失败）的两个出口：重开本关 + 回关卡选择 */
  function endButtons() {
    const frag = document.createDocumentFragment();
    const b1 = document.createElement('button');
    b1.className = 'choice';
    b1.textContent = '↺ 重新开始本关';
    b1.onclick = restart;
    const b2 = document.createElement('button');
    b2.className = 'choice';
    b2.textContent = '🗂 返回关卡选择';
    b2.onclick = backToLevelSelect;
    frag.appendChild(b1); frag.appendChild(b2);
    return frag;
  }

  function renderNode() {
    const node = D.nodes[st.loc];
    if (!node) return;
    $('locBadge').textContent = st.loc;
    $('locName').textContent = nm(node.n);
    $('nodeText').textContent = nm(Core.nodeText(st, node));   // E8：正文分叉（首个满足的 tIf；都不满足用 t）
    renderHereChars();

    const box = $('choiceList');
    box.innerHTML = '';

    /* ① 结局（通关 / 失败）：复用失败界面 + 结局标签 + 通关奖励 */
    if (node.fail || node.win) {
      const d = document.createElement('div');
      d.className = 'endBanner ' + (node.win ? 'win' : 'fail');
      d.textContent = node.endTag ? ('🏁 ' + node.endTag) : (node.win ? '🏆 闯关成功！' : '💀 闯关失败');
      box.appendChild(d);
      if (node.win && D.meta.winReward) {
        const r = document.createElement('div');
        r.className = 'rewardBox';
        r.textContent = '🎁 通关奖励：' + D.meta.winReward;
        box.appendChild(r);
      }
      box.appendChild(endButtons());
      return;
    }

    /* ② 资源归零 = 本关结束（没有结算节点的关卡就地结算，如大里姆的「身无分文」） */
    if (st.bankrupt) {
      const info = Core.failInfo(st.zeroRes);
      $('nodeText').textContent = nm(info.text);
      const dB = document.createElement('div');
      dB.className = 'endBanner fail';
      dB.textContent = '💀 ' + info.title;
      box.appendChild(dB);
      box.appendChild(endButtons());
      return;
    }

    // 选项（E9：选项在上）
    renderChoiceList(box, node);

    // 商店 / 回收：各收成一行，默认折叠（点开即可买 / 卖）
    renderShopFolds(box, node);
  }

  /* ---------- 背包（E3：带正文的道具点开只读面板） ---------- */
  function openRead(it) {
    const text = Core.itemText(it);
    if (!text) { toast('这件东西没什么可读的。'); return; }   // 无 text 的道具：明确说一句
    $('readTitle').textContent = '📖 ' + it;
    $('readBody').innerHTML = nm(text).split('\n').map(p => '<p>' + esc(p) + '</p>').join('');
    $('readModal').classList.remove('hidden');
  }
  function renderBag() {
    const grid = $('bagGrid');
    grid.innerHTML = '';
    D.itemOrder.forEach(it => {
      const meta = D.items[it] || {};
      const owned = Core.hasItem(st, it);
      const text = Core.itemText(it);
      const d = document.createElement('button');
      d.type = 'button';
      d.disabled = !owned;                     // 没拥有 = 点不开（阅读只针对已获得的东西）
      d.className = 'bagItem' + (owned ? ' owned' : '') + (meta.nosell ? ' nosell' : '') + ((owned && text) ? ' readable' : '');
      d.title = owned
        ? ((text ? '点开看看 · ' : '') + (meta.nosell ? '红框道具：不可出售' : '可出售（1 枚）'))
        : '还没有获得';
      d.innerHTML = '<div class="biIcon">' + (meta.icon || '❔') + '</div>' +
        '<div class="biName">' + it + '</div>' +
        (meta.atk ? '<div class="biAtk">武力 +' + meta.atk + '</div>' : '') +
        (meta.nosell ? '<div class="biTag">不可卖</div>' : '') +
        (owned && text ? '<div class="biRead">📖 可读</div>' : '');
      if (owned) d.onclick = () => openRead(it);
      grid.appendChild(d);
    });
    const bonus = (D.meta && D.meta.atkFromClues) || {};
    const helpers = Object.keys(bonus).filter(k => st.learned[k]).map(k => k + ' +' + bonus[k]).join('、');
    $('bagFooter').textContent = '总武力值：' + Core.atkOf(st) +
      (helpers ? '（含' + helpers + '）' : '') +
      '　·　持有 ' + st.items.length + ' 件道具';
  }

  /* ---------- 走投无路（v0.2 卡死保险）：求救面板 ---------- */
  function showStuck() {
    const safeId = Core.safeNodeId();
    const node = safeId ? D.nodes[safeId] : null;
    $('stuckText').innerHTML = '这里已经没有你能做的事了。<br>可以回到安全点重新想办法，也可以重开本关——进度不会白费。';
    $('stuckSafeName').textContent = safeId ? (safeId + ' · ' + nm(node ? node.n : '')) : '（本关没有配置安全点）';
    $('stuckModal').classList.remove('hidden');
  }
  function goSafe() {
    const safeId = Core.safeNodeId();
    $('stuckModal').classList.add('hidden');
    if (!safeId) return;
    Core.go(st, safeId).forEach(toast);
    save(); renderAll();
  }

  /* ---------- 视图缩放 / 拖拽 / 校准 ---------- */
  function applyT() {
    $('stage').style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + zoom + ')';
  }
  function resetView() { zoom = 1; tx = 0; ty = 0; applyT(); }

  function bindScene() {
    const wrap = $('sceneWrap');
    wrap.addEventListener('wheel', e => {
      e.preventDefault();
      zoom = Math.min(4, Math.max(1, zoom * (e.deltaY < 0 ? 1.12 : 0.9)));
      if (zoom === 1) { tx = 0; ty = 0; }
      applyT();
    }, { passive: false });

    wrap.addEventListener('pointerdown', e => {
      if (calib) return;
      dragging = true; moved = false;
      dragX = e.clientX - tx; dragY = e.clientY - ty;
    });
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      const nx = e.clientX - dragX, ny = e.clientY - dragY;
      if (Math.abs(nx - tx) + Math.abs(ny - ty) > 6) moved = true;
      tx = nx; ty = ny; applyT();
    });
    window.addEventListener('pointerup', () => {
      if (dragging && moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }
      dragging = false;
    });

    // 校准模式：点击画面 → 显示坐标
    wrap.addEventListener('click', e => {
      if (!calib || !st) return;
      const sc = D.scenes[Core.sceneOf(st)];
      const r = $('sceneImg').getBoundingClientRect();
      const x = Math.round((e.clientX - r.left) / r.width * sc.width);
      const y = Math.round((e.clientY - r.top) / r.height * sc.height);
      let best = null, bd = Infinity;
      Object.entries(sc.pins).forEach(([id, p]) => {
        const d = Math.hypot(p[0] - x, p[1] - y);
        if (d < bd) { bd = d; best = id; }
      });
      $('calibBox').innerHTML = '场景：<b>' + sc.name + '</b>　坐标：<b>' + x + ', ' + y + '</b>　最近任务点：<b>' + best + '</b>（' + Math.round(bd) + 'px）<br>' +
        '把「场景 + 任务点编号 → 坐标」反馈给开发者，即可修正关卡数据里的 pins。';
    });
  }

  function toggleCalib() {
    calib = !calib;
    $('calibBox').classList.toggle('hidden', !calib);
    $('sceneWrap').classList.toggle('calib', calib);
    if (calib) $('calibBox').innerHTML = (st && curScene)
      ? '🎯 校准模式（当前场景：' + D.scenes[curScene].name + '）：点击场景图任意位置，显示该处坐标。'
      : '🎯 校准模式：先选一个关卡开始游戏。';
  }

  /* ---------- 初始化 ---------- */
  function init() {
    renderLevelSelect();                       // 启动页 = 关卡选择
    $('zoomIn').onclick = () => { zoom = Math.min(4, zoom * 1.25); applyT(); };
    $('zoomOut').onclick = () => { zoom = Math.max(1, zoom / 1.25); if (zoom === 1) { tx = 0; ty = 0; } applyT(); };
    $('zoomReset').onclick = resetView;
    $('restartBtn').onclick = restart;
    $('levelsBtn').onclick = backToLevelSelect;
    $('stuckBtn').onclick = () => { if (st) showStuck(); };
    $('stuckSafe').onclick = goSafe;
    $('stuckRestart').onclick = () => { $('stuckModal').classList.add('hidden'); restart(); };
    $('bagBtn').onclick = () => { renderBag(); $('bagModal').classList.remove('hidden'); };
    $('charsBtn').onclick = openCharsBook;
    $('helpBtn').onclick = () => { $('helpBody').innerHTML = D.help.map(h => '<p>' + nm(h) + '</p>').join(''); $('helpModal').classList.remove('hidden'); };
    $('playerName').addEventListener('change', () => { if (store) Core.savePlayer(store, $('playerName').value); });
    document.querySelectorAll('.closeBtn').forEach(b => {
      b.onclick = () => $(b.dataset.close).classList.add('hidden');
    });
    document.querySelectorAll('.modal').forEach(m => {
      m.addEventListener('click', e => { if (e.target === m && m.id !== 'overlay') m.classList.add('hidden'); });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'c' || e.key === 'C') toggleCalib();
      if (e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => { if (m.id !== 'overlay') m.classList.add('hidden'); });
    });
    bindScene();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
