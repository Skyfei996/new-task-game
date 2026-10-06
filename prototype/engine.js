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
 *      （海报图 + 标题 + 一句话 + 难度与开局资源 + 难度单选（默认普通）+ 唯一「开始」——B115/§1.1）
 *   ② 存档按关卡独立（mygame2.save.<levelId>.v1）；旧的 mygame2.market.save.v1 作为
 *      「勇闯大里姆」的存档读入（兼容）；玩家名全局存（mygame2.player.v1）
 *   ③ 通用资源：关卡声明 resources:[{id,name,icon,start:{normal,hard},fail:{title,text,node?},noSpendToZero?}]
 *      ——资源直接住在 state 的同名字段上（coins / oxygen …），fx 的键 = 资源 id；
 *      任一资源 ≤0 → 该资源的失败结算（有 fail.node 就走进结算点，否则就地复用失败界面）；
 *      noSpendToZero 的资源沿用 v1.3 的购买守卫（「钱不够」/「花光就闯关失败」两种理由）
 *   ④ 玩家名：任务点文本与结局文案里的 {me} 占位符 → 渲染时替换成玩家名
 *   ⑤ 走投无路检测（卡死保险）：渲染后若当前节点已无任何可执行动作 → 弹「指路」面板
 *      （回到安全点 = 关卡 meta.safeNode；重开本关——B137 更名：原「求救」面板升级为常驻「🧭 指路」）
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
 * B03 复检收口轮改动（B78/B80/B99，接口以设计档 §8.1/§8.3 与节点表 §9.4 为准）：
 *   B78 星币数字口径：payReason 拒付理由＝数字式「星币不够（需要 N 枚星币，还差 K 枚）」；
 *       档位词与「还差点底气」句退役（「无数字」只约束氧气余量读数——数据面 unit 不动）
 *   B80 战斗构成行：Core.atkParts / Core.battleBreakdown → 对照行「你的武力值 X ≥/< Y」下方的
 *       「构成：…＝X（还差 N 点）」（exact 白名单③ 第二段；网页与 --player 同源）
 *   B99 节点显式 scene：事件节点可在数据里声明发生场景（无 pin 节点——如站关 28）→ 显示楼层取发生场景
 *
 * B04 界面与视觉批（E13~E20，能力登记＝design-station-v1.md §7 v0.6；口径＝design-ui-v1.md）：
 *   E13 浮现图渲染 renderMoments（节点 moments/mIf → 场景叠层；缺图兜底＝不渲染不留位）
 *   E14 消息分类着色（Core.sayKindOf / Core.textKind → data-kind：info/gain/key/fail）
 *   E15 剧情区反馈区（最近一次操作的消息组常驻；与 toast 同源）
 *   E16 物品栏（地图下方横排：st.items × itemOrder；点选详情气泡＋「看内容」E3）
 *   E17 物品栏「使用」（Core.itemUseInfo：等价执行唯一消费该道具的可见选项）
 *   E18 地图光环位按关卡停用（判据＝本关是否注册 moments：站关撤下、示例关 dalim 沿用）
 *   E19 氧气读数＝条＋数值（renderHUD：resOf 原值＋同帧更新；数值与条同色）
 *   E20 结局名去字母（Core.endDisplayName：数据面 endTag/n 不动，仅渲染层）
 *
 * B117／B119 改动（2026-10-04 老板三裁；口径＝design-ui-v1.md §1.1 与 design-station-v1.md §4.1）：
 *   E23 存档读档入口＋通关记录：卡片三态（无档「开始」／未结束「继续＋重新开始」／已结束「重玩」）；
 *       记录＝独立本机键 mygame2.rec.<level>.v1（只记 win、失败不写、开新局不丢）；覆盖＝一句确认
 *   E24 内景场景接线：房间节点 scene: 'room-*'（syncScene 既有优先序）＋场景表注册；未注册房间＝维持原场景（零降级）；
 *       读档按 st.loc 重算场景（旧档 scene 停在 deck 也能落在内景）；sceneOfNode：节点显式声明优先于 pin 推断
 *
 * B120 改动（2026-10-04 同框覆盖轮；口径＝design-ui-v1.md §7.3，能力登记＝design-station-v1.md §7-E25）：
 *   E25 覆盖卡（同框全覆盖）：角色图 L2（id 首段 ∈ characters）指向本场景 L1 常驻角色（scenes[].figures）
 *       ⇒ 实底圆角卡（卡面 ⊇ 轮廓框每侧外扩 max(12, 该边×8%)；object-fit:cover 内缩放大 ≥6%）；
 *       几何唯一来源＝figures（覆盖图去 at／w）；换态不换位；z 序在其它浮现图之上（不越到编号层之上）；
 *       未标定／缺图 ⇒ 该张不渲染＋一行告警；C 键校准扩展两点定框（figures 标定通道，屏上给数值行）。
 *
 * B122／B123／B124／B125 改动（2026-10-04 表现体系与文案口径轮；口径＝design-ui-v1.md §7.10/§7.11/§6.3/§1.1/§7.3、
 *   design-station-v1.md §4.1；能力登记＝design-station-v1.md §7-E26）：
 *   E26 背景状态变体（Core.sceneEntry）：scenes[].variants=[{cond,image,width,height,figures?}] 先匹配者为准、
 *       命中行完整替换基础条目字段（图／宽高／figures）；全不命中＝基础条目；变体图缺图 ⇒ 运行期回落基础图＋一行告警；
 *       覆盖卡按生效 figures 判（变体感知）；几何随 plan 就地刷新（复用元素：同 plan 零改动、变则跟上——不重建不闪）；
 *       无独立状态位——条件驱动，进房/读档按 st 重算即落位
 *   B123 到达提示（Core.arriveText）：房间（room-*）＝「到达：<房间名>」（无 🛗）；其余场景＝「🛗 到达：<场景标>」
 *   B124 覆盖确认同源（Core.coverAsk）：卡片侧与局内重开同一句（单一来源，不得各写一份）
 *   B125 每房自指 pin：pins[<本房节点号>]＝标记载体（点击＝空操作）；无浮图时承担「你在这里」标记与遮罩开孔（数据面）
 *
 * B127~B131 复盘轮改动（2026-10-04 晨；口径＝design-ui-v1.md §7.3／§6.5／§6.6、design-station-v1.md §7-E27）：
 *   E27 浮现窗口与首访一次（B127）：Core.momentsOf 增 `mOnce` 过滤（同一存档内首次渲染后不再重现——新局重置；
 *       标记＝st.mSeen，表现层状态位、随存档，旧档缺省为空）＋Core.markMomentSeen（渲染后落库）；
 *       未声明 mOnce 的节点不读 st.mSeen（回归——既有节点输出逐字不变）；收窗行＝节点 mIf（数据面）
 *   场景面两条：① B128 数字圈「可点＝显示、不可点＝隐藏」（Core.plainPins／Core.pinsVisible）——房间（room-*）
 *       与站外只渲染可点编号圈（零不可点圈、零「你在这里」；自指 pin 点击为空操作 ⇒ 不渲染，数据留作校准锚点）；
 *       楼层图与其余场景（含示例关）维持现形（回归）；② B129 遮罩楼层图专属（scenes[].mask=false ⇒ #dimSvg
 *       整层不渲染）＋提示条随场景（Core.hintText——房间/站外无「灰暗区域」句）
 *
 * B04 午 撤调暗＋CG 整屏层轮（2026-10-04 午；口径＝design-ui-v1.md §2-B130／§6.7、design-station-v1.md §7-E28）：
 *   B130 重订：亮度口径＝**全站正常亮度**——调暗机制（sceneEntry.dim／Core.sceneDimOn／DIM_TOKENS／
 *       #stage.dark＋--dim-blackout）整批撤除（同批清零；示例关与站关同口径）
 *   E28 CG 整屏层（B132）：Core.cgOf／Core.markCgSeen＋st.cgSeen（表现层状态位、随存档）；DOM 层 applyCg——
 *       进节点求值一回、同节点跨渲染驻留（不重弹）、点掉后本节点不再弹、换节点先关再求值；`dismiss:'keep'`＝常驻
 *       （结局屏点击不关）；once 档落标记＋补写存档；缺图 ⇒ 整层隐藏＋一行告警（标记照落）；层在场景区最上
 *
 * B05 轮（B133~B136 · 2026-10-06；口径＝docs/design-ui-v1.md §1.2／§6.7／§8.1、design-station-v1.md §7-E29）：
 *   E29 多档位手动存档/读档（B136）：手动档位键 mygame2.slots.<id>.v1＝{v:1,slots:[null|{savedAt,st}×3]}（与自动存档
 *       同形状 ⇒ 读档走同一条 normalizeState 归一）；Core.slotsKey／slotList／slotPut／slotDel／slotInfo／slotTime／
 *       slotsAvailable／slotAsk；DOM 层：工具栏 💾 ⇒ #saveModal（存/读/覆盖/删）＋卡片「存档位」行（读取入口，仅当有档
 *       时渲染；cardInfo 增 slotLine 字段——既有字段不动）；读档＝既有路径（normalizeState → 补写自动存档 → 全量重
 *       渲染，此后「继续」回到该档）；开新局不碰档位与记录；存储不可用 ⇒ 警示行＋按钮禁用（玩法照常）；坏档视空档；
 *       写入失败 ⇒ 行内提示＋toast（采用句）。B135（§6.7）：29 号 cg＋撤浮图（数据面，本层零改动）。
 *
 * B06 轮（B137~B139 · 2026-10-06；口径＝docs/design-ui-v1.md §2-B137~B139、design-station-v1.md §7-E30~E32）：
 *   E30 指路面板（原 🆘 升级更名「🧭 指路」）：Core.guideTarget／guideNeeds／guideClues（纯读——当前目标＝
 *       `meta.targets` 首条命中行；还差什么＝命中行 `need[]` 按 `show` 门过滤；已知线索＝`st.learned` 键序）；
 *       两处入口（工具栏 #stuckBtn／场景区 #guideFab）→ 同一入口函数（面板打开函数恰一份——现名 showStuck，
 *       不改）；死局上下文行仅自动弹出（showStuck('dead')）显示；面板首行＝「这里已经没有你能做的事了——别急：……」。
 *   E31 编号圈地点名（§2-B138）：Core.pinLabel——已到过（st.visited）且地图场景（!plainPins）⇒ 节点名；
 *       房间/站外一律 null（不渲染——渐进揭示）；渲染＝环下 `.pname`（纯追加，不挡点击）。
 *   E32 已探索分楼层（§2-B139）：Core.visitedGroups——组＝sceneLabel(sceneOfNode(id))（缺省「其它」），
 *       组序＝场景表键序（「其它」置末）、组内编号升序；过滤与既有 renderVisited 一致（hidden/fail/win 排除）。
 *
 * B07 轮（B140／B141 · 2026-10-06；口径＝docs/design-ui-v1.md §2-B140／B141、design-station-v1.md §7-E33）：
 *   E33 道具介绍（B140／B141）：Core.itemDesc（纯读——同 E3 itemText 口径：非字符串或空 ⇒ null）；
 *       呈现三处——背包格 `.biDesc`（**全部道具含未获得**；`.readable`／可点判据＝`owned && (desc || text)`）／
 *       物品栏气泡 `.ibDesc`（「📖 看内容」照旧＝有 text；兜底行改判＝desc 与 text 皆无才出）／
 *       道具详情面板升格（介绍段 `.rdDesc` 在前、正文段随后；两者皆无 ⇒ 兜底句保留）。
 *       desc＝纯呈现数据（不进存档、不参与判定）；写作纪律＝§2-B140 机检②。
 *
 * 结构分两层：
 *   ① 纯核心 Core：状态机 + 条件/效果/战斗/资源/存档求解，不接触 DOM，可在 Node 中直接测试
 *   ② DOM 层：关卡选择、场景图、编号环、遮罩、侧栏、背包/人物/指路弹窗、坐标校准
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

  /* v1.2：走进有编号点的目标节点 → 切换到它所在的场景（无编号节点保持当前场景）
   * B99（R2 问题 16③）：节点可用 scene 显式声明发生场景——事件节点没印编号，但正文自述跨层时
   * 舞台按【事件发生场景表】（节点表 §9.4）算；显示楼层取发生场景（唯一用例＝station 28 scene:'deck2'）。 */
  function syncScene(st, nodeId) {
    /* B119：统一走 Core.sceneOfNode（节点显式声明 → 图上的 pin）——显式声明的场景**未注册时**同样回退到
     * pin 推断（维持本层 deck）：注册丢失/未到货 ⇒ 不换图（零降级），不会切到不存在的场景 id。 */
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
      /* B119：节点显式声明（房间/事件场景，B99 同款字段）优先于「图上的 pin 推断」——
       * 内景接线后大厅编号（18/20）出现在本层各房图上，靠 pin 推断会变成多点命中（null）。 */
      const n = D.nodes && D.nodes[id];
      if (n && n.scene && D.scenes[n.scene]) return n.scene;
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
    /* 场景标：label 优先；缺省＝name「·」后段（既有口径；B123 起口径单源在此） */
    sceneLabel(sid) {
      const sc = (D && D.scenes[sid]) || null;
      if (!sc) return '';
      if (sc.label) return sc.label;
      const parts = String(sc.name || '').split('·');
      return (parts[parts.length - 1] || sc.id).trim();
    },
    /* 到达提示（B123 · 2026-10-04 裁定 · §6.3）：房间（room-*）＝「到达：<房间名>」（无 🛗；
     * 房间名＝name「·」后段）；其余场景（大厅/走廊/站外）＝保留现形「🛗 到达：<场景标>」。 */
    arriveText(sid) {
      const sc = (D && D.scenes[sid]) || null;
      if (!sc) return '';
      if (/^room-/.test(sid)) {
        const parts = String(sc.name || '').split('·');
        return '到达：' + ((parts[parts.length - 1] || sc.id).trim());
      }
      return '🛗 到达：' + Core.sceneLabel(sid);
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
        mSeen: {},         // B127（§7.3）：浮现图「首访一次」标记（node.mOnce——渲染后落库；旧档缺省为空）
        cgSeen: {},        // B132（§6.7）：CG「首访一次」标记（node.cg.once——显示后落库；旧档缺省为空）
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
    /* 读档兜底（旧存档没有 scene / zeroRes / me；资源钳在 ≥0，为 0 即判失败）
     * B119（§4.1 读档归一）：场景按 st.loc 重算（node.scene ＞ pin 推断）——旧档 scene 停在 deck 时，
     *   读到房间节点也能落回内景；loc 无场景信息（无 pin 事件）则保留原值。 */
    normalizeState(st) {
      if (!st) return st;
      const sid = Core.sceneOfNode(st.loc);
      if (sid) st.scene = sid;
      if (!st.scene) st.scene = Core.defaultScene();
      ['items'].forEach(k => { if (!Array.isArray(st[k])) st[k] = []; });
      ['visited', 'done', 'learned', 'chDone', 'mSeen', 'cgSeen'].forEach(k => { if (!st[k] || typeof st[k] !== 'object') st[k] = {}; });   // B127：mSeen＝浮现图首访标记；B132：cgSeen＝CG 首访标记（旧档补空表）
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

    /* ---- B117（§1.1 · D54~D57）：读档入口＋通关记录（本机存储：关卡存档键·既有 ＋ 记录键·新增） ----
     * 记录＝独立键（开新局覆盖存档不影响它）；只记通关（win 节点）——失败不写、也不清空已有记录。 */
    recKey(id) { return 'mygame2.rec.' + id + '.v1'; },
    /* 结局短名（渲染层去字母——数据面 n/endTag 不动，B109）：'结局 A · 圆满' → '结局 · 圆满' */
    endShortName(node) { return Core.endDisplayName(String((node && node.n) || '')); },
    recordOf(store, id) {
      try {
        const raw = store && store.getItem(Core.recKey(id));
        const a = raw ? JSON.parse(raw) : null;
        return Array.isArray(a) ? a.filter(x => typeof x === 'string' && x) : [];
      } catch (e) { return []; }
    },
    /* 追加一条通关记录（按达成先后、去重）；失败不写——调用方只在 win 节点调 */
    addRecord(store, id, name) {
      const list = Core.recordOf(store, id);
      if (!store || !name || list.indexOf(name) >= 0) return list;
      list.push(name);
      try { store.setItem(Core.recKey(id), JSON.stringify(list)); } catch (e) { /* 本机存储不可用：记录不落地，不影响玩 */ }
      return list;
    },
    /* 结束判定（D55）：存档节点为 win／fail 节点（41/42/43／44／29）或 bankrupt ⇒ 该局已结束（不出现「继续」） */
    runEnded(st, id) {
      if (!st) return false;
      if (st.bankrupt) return true;
      const lv = LEVELS[id || levelId] || D || null;
      const n = (lv && lv.nodes && st.loc) ? lv.nodes[st.loc] : null;
      return !!(n && (n.win || n.fail));
    },
    /* B124（§1.1/D65）：开新局覆盖确认＝**唯一采用句**——卡片侧（`cardInfo.coverAsk`）与局内重开（`restart`）
     * 同源这一份（不得各写一份）。B05（评审修正轮 #9）：句尾并入「与手动存档位保留」（B136 口径——开新局不碰档位）。 */
    coverAsk() { return '开始新局会覆盖本关的旧存档（通关记录与手动存档位保留）。确定开始？'; },
    /* 关卡卡片三态与记录块（渲染与机检同源——DOM 与测试用同一份判定）：
     * buttons＝[{key,label,main,confirm}]；无档「开始」／未结束「继续＋重新开始」／已结束「重玩」；
     * 新局覆盖已有存档前统一一句确认（confirm）；「继续」不受难度选择影响（存档自带难度）。 */
    cardInfo(store, id) {
      const lv = LEVELS[id];
      if (!lv) return null;
      const save = Core.loadFrom(store, id);
      const ended = Core.runEnded(save, id);
      const endNode = (save && lv.nodes) ? (lv.nodes[save.loc] || null) : null;
      const won = !!(ended && endNode && endNode.win);
      const record = Core.recordOf(store, id);
      /* B136（§1.2 入口②）：卡片「存档位」行——仅当该关存在手动档时非空（无档 ⇒ 空串＝不渲染） */
      const filled = Core.slotList(store, id).filter(Boolean);
      const slotLine = filled.length
        ? ('💾 手动存档：' + filled.length + '/3（最新 ' + Core.slotTime(filled.map(x => x.savedAt).sort().pop()) + '）')
        : '';
      const buttons = !save
        ? [{ key: 'start', label: '开始', main: true, confirm: false }]
        : (ended
          ? [{ key: 'replay', label: '重玩', main: true, confirm: true }]
          : [{ key: 'resume', label: '继续', main: true, confirm: false },
             { key: 'restart', label: '重新开始', main: false, confirm: true }]);
      return {
        save: save, ended: ended, won: won, record: record, buttons: buttons,
        recordLine: record.length ? ('🏆 通关记录：' + record.join('、')) : '',
        failLine: (ended && !won) ? '上局结束：未通关' : '',        // 失败终止：只报一句（失败不写记录）
        note: '进度存在这台设备的浏览器里（各人各份）',
        coverAsk: Core.coverAsk(),          // B124：与局内重开同一句（单一来源）
        slotLine: slotLine                  // B136：卡片「存档位」行（空串＝无档、不渲染）
      };
    },

    /* ---- B136（§1.2 · D74）：多档位手动存 / 读 / 删（本机存储；3 档、每关独立） ----
     * 键＝mygame2.slots.<id>.v1，值＝{ v:1, slots:[null|{savedAt,st}×3] }（st 与自动存档同形状 ⇒ 读档走同一条
     * normalizeState 归一路径）；与自动存档键 / 记录键相互独立（存/读/删不写那两键）；旧档兼容＝增量键。 */
    slotsKey(id) { return 'mygame2.slots.' + id + '.v1'; },
    /* 档位表读取：坏 JSON／字段缺／形状不对 ⇒ 该档按空档呈现（不删原数据、不抛异常——§1.2 兜底） */
    slotList(store, id) {
      const lid = id || levelId;
      const empty = [null, null, null];
      try {
        const raw = store && store.getItem(Core.slotsKey(lid));
        if (!raw) return empty;
        const o = JSON.parse(raw);
        if (!o || !Array.isArray(o.slots)) return empty;
        return [0, 1, 2].map(i => {
          const s = o.slots[i];
          return (s && typeof s.savedAt === 'string' && s.st && typeof s.st === 'object') ? { savedAt: s.savedAt, st: s.st } : null;
        });
      } catch (e) { return empty; }
    },
    /* 写入第 n 档（n＝1~3；覆盖语义由调用方先确认）：st 快照＋savedAt＝now（ISO）；
     * 返回 true／false——写入失败（配额/存储不可用）不抛（§1.2 兜底：行内提示＋toast＝采用句）。 */
    slotPut(store, n, st, id) {
      if (!(n >= 1 && n <= 3)) return false;
      const lid = id || levelId;
      const list = Core.slotList(store, lid);
      try {
        list[n - 1] = { savedAt: new Date().toISOString(), st: JSON.parse(JSON.stringify(st)) };
        store.setItem(Core.slotsKey(lid), JSON.stringify({ v: 1, slots: list }));
        return true;
      } catch (e) { return false; }
    },
    /* 删除第 n 档（置回 null；写失败同样返回 false、不抛） */
    slotDel(store, n, id) {
      if (!(n >= 1 && n <= 3)) return false;
      const lid = id || levelId;
      const list = Core.slotList(store, lid);
      try {
        list[n - 1] = null;
        store.setItem(Core.slotsKey(lid), JSON.stringify({ v: 1, slots: list }));
        return true;
      } catch (e) { return false; }
    },
    /* savedAt（ISO 串）→ 展示用 MM-DD HH:mm（本机时区） */
    slotTime(iso) {
      const d = new Date(iso);
      if (!iso || isNaN(d.getTime())) return String(iso == null ? '' : iso);
      const p = x => (x < 10 ? '0' : '') + x;
      return p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    },
    /* 一行摘要（从 st 派生、不存副本）：<序号> · <MM-DD HH:mm> ｜ <节点号> · <节点名> ｜ <资源行> ｜ <难度>；
     * 资源行＝按关卡 resources 逐项 `icon 名 值`（随关卡自适应）；难度＝与卡片同词。 */
    slotInfo(n, slot, lv) {
      const L = lv || LEVELS[levelId] || null;
      const s = slot && slot.st;
      if (!s || !L) return '';
      const node = (L.nodes && s.loc != null) ? L.nodes[s.loc] : null;
      const nodeName = Core.endDisplayName(Core.fillName(String((node && node.n) || ''), s));
      const resLine = (L.resources || []).map(r => (r.icon ? r.icon + ' ' : '') + (r.name || r.id) + ' ' + Core.resOf(s, r.id)).join(' · ');
      return n + ' · ' + Core.slotTime(slot.savedAt) + ' ｜ ' + (s.loc != null ? s.loc : '?') + ' · ' + nodeName
        + ' ｜ ' + resLine + ' ｜ ' + (s.diff === 'hard' ? '困难模式' : '普通模式');
    },
    /* 存储可用性探测（打开弹窗时探一次）：探针写入＋删除；不可用 ⇒ false（警示行＋按钮全部禁用，玩法照常） */
    slotsAvailable(store) {
      const k = 'mygame2.slots.probe.v1';
      try { store.setItem(k, '1'); store.removeItem(k); return true; } catch (e) { return false; }
    },
    /* B136（§1.2/D75）：三句采用句（**单一来源**——游戏内弹窗与卡片入口两处读取同串；不得各写一份） */
    slotAsk() {
      return {
        read: '读取这个存档位会覆盖当前进度（通关记录保留）。确定读取？',
        over: '这个存档位里已有存档，覆盖它吗？',
        del: '删除这个存档位吗？（删除后无法恢复）'
      };
    },

    /* ---- 条件 ---- */
    hasItem(st, id) { return st.items.indexOf(id) >= 0; },
    /* E3 道具正文：只读；没有 text（或空串）= 没什么可读的 */
    itemText(id) {
      const m = (D.items && D.items[id]) || {};
      return typeof m.text === 'string' && m.text ? m.text : null;
    },
    /* B07（E33 · §2-B140）：道具介绍：只读；没有 desc（或空串）= 不显示（同 itemText 口径） */
    itemDesc(id) {
      const m = (D.items && D.items[id]) || {};
      return typeof m.desc === 'string' && m.desc ? m.desc : null;
    },
    atkOf(st) {
      let a = st.items.reduce((s, id) => s + ((D.items[id] && D.items[id].atk) || 0), 0);
      const bonus = (D.meta && D.meta.atkFromClues) || null;   // v0.2：知道某条线索 = 武力 +N（如收编的小帮手）
      if (bonus) Object.keys(bonus).forEach(k => { if (st.learned[k]) a += bonus[k]; });
      return a;
    },
    /* B80（R2·裁定 3）：武力构成明细——「焊接枪 +1、电击棒 +2…＝X（还差 N 点）」的数据面。
     * 与 atkOf 同源（装备 atk + 线索加成 atkFromClues）；供网页与 --player 的对照行下渲染（白名单③ 第二段）。 */
    atkParts(st) {
      const parts = [];
      st.items.forEach(id => { const m = D.items[id] || {}; if (m.atk) parts.push({ name: id, n: m.atk }); });
      const bonus = (D.meta && D.meta.atkFromClues) || null;
      if (bonus) Object.keys(bonus).forEach(k => { if (st.learned[k]) parts.push({ name: k, n: bonus[k] }); });
      return parts;
    },
    battleBreakdown(st, need) {
      const parts = Core.atkParts(st);
      const mine = Core.atkOf(st);
      const body = parts.length ? parts.map(p => p.name + ' +' + p.n).join('、') : '无加成';
      return '构成：' + body + '＝' + mine + (mine < need ? '（还差 ' + (need - mine) + ' 点）' : '');
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
      /* B78（R2·裁定 1）：资源面＝数字式（原「还差点底气」档位词退役，§8.1）；本站数据无资源 cond，供兜底/工具面 */
      Core.resources().forEach(r => { if (c[r.id] != null) bits.push('需要 ' + c[r.id] + ' ' + (r.unit || '') + (r.name || r.id)); });
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

    /* ============ B04（界面与视觉批）纯判据 / 布局助手（不接触 DOM；口径＝design-ui-v1.md）============
     * DOM 层与测试同源调用这里；每条口径的行号指针写在注释里。 */

    /* ---- §7 浮现图（两层制 L2）---- */
    momentDef(id) { return (D && D.moments && D.moments[id]) || null; },
    /* ---- B122（§7.10 背景状态变体）：场景**生效条目**＝变体首匹配（先匹配者为准）＋缺省回落基础条目；
     * image／width／height／figures 单源（命中行完整替换对应字段）；全不命中 ⇒ 基础条目（现状）；
     * st 缺省（纯数据面/未开局）＝基础条目。figures 解析＝命中变体**给出** figures 时整表替换
     * （`{}`＝该状态无同框面）否则基础 figures；未注册的变体＝不存在（无补丁路径）。 ---- */
    sceneEntry(st, sid) {
      const id = sid || (st ? Core.sceneOf(st) : null);
      const sc = (D && D.scenes[id]) || null;
      if (!sc) return null;
      const hit = ((st && sc.variants) || []).find(v => Core.condOk(st, v.cond)) || null;
      return {
        id: id, scene: sc, variant: hit,
        image: (hit && hit.image != null) ? hit.image : sc.image,
        width: (hit && hit.width != null) ? hit.width : sc.width,
        height: (hit && hit.height != null) ? hit.height : sc.height,
        figures: (hit && hit.figures != null) ? hit.figures : (sc.figures || null),
        /* B129（§6.6）：遮罩开关——缺省 true＝现行遮罩；房间/站外 `mask:false`（整图直接可看、无开孔） */
        mask: sc.mask !== false
      };
    },
    /* ---- B128（§6.5 数字圈「可点＝显示、不可点＝隐藏」）----
     * 场景分类：房间（`room-*`）与站外（`exterior`）＝非地图场景 ⇒ 只渲染可点编号圈；
     * 楼层图（`deck*`）与其余场景（含示例关）＝地图语义 ⇒ 维持现形（可点高亮＋已探索灰显＋当前位置标记）。 */
    plainPins(sid) { return !!sid && (sid === 'exterior' || /^room-/.test(sid)); },
    /* 渲染集：房间/站外＝`reachablePins ∩ 本场景 pins`，并排除当前所在编号（点击＝空操作 ⇒ 不可点 ⇒ 不渲染；
     * §6.5 机检② N3 抽查：无医疗包 ⇒ {18}、持医疗包 ⇒ {18,24}）；其余场景＝全部 pins（回归，逐字不变）。 */
    pinsVisible(st, sid) {
      const sc = (D && D.scenes[sid]) || null;
      if (!sc) return [];
      const all = Object.keys(sc.pins);
      if (!Core.plainPins(sid)) return all;
      const reach = Core.reachablePins(st);
      return all.filter(x => x !== (st && st.loc) && !!reach[x]);
    },
    /* B129（§6.5/§6.6）：提示条随场景——房间/站外无「灰暗区域」句（遮罩只属楼层图）；其余＝现形。 */
    hintText(sid) {
      return Core.plainPins(sid)
        ? '高亮的位置可以点击前往 ｜ 拖拽 / 滚轮缩放'
        : '高亮的位置可以点击前往 · 灰暗区域还没探索到 ｜ 拖拽 / 滚轮缩放';
    },
    /* ---- B120（§7.3 同框全覆盖）：覆盖卡判定与几何（纯面；DOM 层与测试同源调用）----
     * 同框＝角色图 L2（id 首段 ∈ characters）指向角色 C，且 C ∈ 本场景 L1 可见角色（**生效** figures——
     * B122：变体命中 ⇒ 按变体后的 L1 判，§7.10 协作②）；
     * 渲染判据＝数据（新图/新场景自动纳入）；例外可 cover:false 显式关（默认不写，初始为空）。 */
    charIdOf(id) { const p = String(id).split('-')[0]; return (D && D.characters && D.characters[p]) ? p : null; },
    figuresOf(sid, st) { const e = Core.sceneEntry(st, sid); return (e && e.figures) || null; },
    coverBox(id, sid, st) {
      const cid = Core.charIdOf(id), figs = Core.figuresOf(sid, st);
      return (cid && figs && figs[cid]) ? figs[cid] : null;
    },
    /* 覆盖判定单点：'cover'＝同框且已标定 ⇒ 覆盖卡；'uncalibrated'＝角色图**未给任何几何**
     * （无 at／w／win——几何唯一来源＝figures）而 figures 未标定 ⇒ 该张不渲染（DOM 层出一行告警）；
     * 'none'＝走既有锚点／对称摆放（§7.3：w 默认 0.22、未给锚点时左右对称——二者均不属“待标定”）。 */
    coverState(id, sid, st) {
      const def = Core.momentDef(id), cid = Core.charIdOf(id);
      if (!def || !cid || def.cover === false) return 'none';
      if (Core.coverBox(id, sid, st)) return 'cover';
      return (!def.at && !def.w && !def.win) ? 'uncalibrated' : 'none';
    },
    /* 覆盖卡几何（§7.3 全覆盖判据）：锚＝轮廓框中心；卡面＝轮廓框每侧外扩 max(12 原像素, 该边×8%) */
    coverPlan(id, box) {
      const ex = Math.max(12, box[2] * 0.08), ey = Math.max(12, box[3] * 0.08);
      const w = box[2] + ex * 2, h = box[3] + ey * 2;
      return { id: id, x: box[0] - ex + w / 2, y: box[1] - ey + h / 2, w: w, h: h,
               win: false, card: false, cover: true, lighten: false, fig: box, ex: ex, ey: ey };
    },
    /* 两点定框（B120 标定通道）：任意两角 → [x, y, w, h]（原图像素，与 pins 同口径） */
    boxOfPoints(a, b) {
      return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])];
    },
    /* 浮现：节点 `moments` 默认集，或 `mIf` 首个命中行（行条件命中 ⇒ 整行替换默认集，§7.4）；未注册 id ⇒ 忽略。
     * 前置条件（B127）：传进来的 node 必须是 `st.loc` 的节点——首访一次（mOnce）的标记以 `st.loc` 为键查询
     * （node 对象本身不带 id 字段）；当前全部调用点均传 `D.nodes[st.loc]`，DOM 层与测试同源。 */
    momentsOf(st, node) {
      const n = node || (st && st.loc ? (D && D.nodes[st.loc]) : null);
      if (!n) return [];
      /* B127（§7.3）：首访一次（`mOnce`）——同一存档内该节点首次渲染后不再重现、新局重置；
       * 未声明 mOnce 的节点不读 st.mSeen（回归：既有节点输出逐字不变）。 */
      if (n.mOnce && st && st.mSeen && st.mSeen[st.loc]) return [];
      const hit = ((n.mIf) || []).find(x => Core.condOk(st, x.cond));
      const ids = hit ? (hit.moments || []) : (n.moments || []);
      return ids.filter(id => !!Core.momentDef(id));
    },
    /* B127（§7.3）：浮现图「首访一次」标记落库——DOM 层渲染完成后调用（表现层状态位，随存档） */
    markMomentSeen(st, nodeId) {
      if (!st || !nodeId) return;
      if (!st.mSeen || typeof st.mSeen !== 'object') st.mSeen = {};
      st.mSeen[nodeId] = true;
    },
    /* ---- B132（§6.7 CG 整屏层）：显示判据（Core 纯面；DOM 层与测试同源调用）----
     * 判据＝`st.loc`＋`st.cgSeen`（零新增判定谓词）：无 `cg` 字段 ⇒ null；`once` 档已显示过（标记随存档）⇒ null；
     * 其余 ⇒ { file, once, dismiss }（dismiss 缺省＝'click'＝点击关闭；'keep'＝常驻不关）。 */
    cgOf(st) {
      const nodeId = st && st.loc;
      const n = (D && D.nodes && nodeId) ? D.nodes[nodeId] : null;
      const cg = (n && n.cg) || null;
      if (!cg || !cg.file) return null;
      if (cg.once && st.cgSeen && st.cgSeen[nodeId]) return null;
      return { file: cg.file, once: !!cg.once, dismiss: cg.dismiss === 'keep' ? 'keep' : 'click' };
    },
    /* B132（§6.7）：CG「首访一次」标记落库——DOM 层显示后调用（表现层状态位，随存档） */
    markCgSeen(st, nodeId) {
      if (!st || !nodeId) return;
      if (!st.cgSeen || typeof st.cgSeen !== 'object') st.cgSeen = {};
      st.cgSeen[nodeId] = true;
    },
    /* 注册表条目 → 场景像素布局：锚点＝原图像素（角色图＝底边中点、窗景＝窗区中心）；
     * 尺寸：角色图宽＝场景宽 × w（默认 0.22）；窗景＝窗区 × fit（默认 1.06）。
     * idx/total 只服务「未给锚点」的兜底摆放（左右对称：中心 ±0.32×场景宽、底边对齐）。 */
    momentLayout(id, sid, idx, total, st) {
      const def = Core.momentDef(id);
      const sc = (D && D.scenes[sid]) || null;
      if (!def || !sc || !def.file) return null;
      const cstate = Core.coverState(id, sid, st);
      if (cstate === 'cover') return Core.coverPlan(id, Core.coverBox(id, sid, st));   // B120：覆盖卡（几何＝生效 figures；B122 变体感知）
      if (cstate === 'uncalibrated') return null;                                  // B120：未标定轮廓框 ⇒ 不渲染
      const card = !!def.card, lighten = !!def.lighten;
      if (def.win) {
        const fit = def.fit == null ? 1.06 : def.fit;
        return {
          id: id, x: (def.at ? def.at[0] : sc.width / 2), y: (def.at ? def.at[1] : sc.height / 2),
          w: def.win[0] * fit, h: def.win[1] * fit, win: true, card: card, lighten: lighten
        };
      }
      let cx, cy;
      if (def.at) { cx = def.at[0]; cy = def.at[1]; }
      else {
        const i = idx || 0, n = Math.max(1, total || 1);
        cx = sc.width * (0.5 + (n <= 1 ? 0 : (i - (n - 1) / 2) * (0.64 / (n - 1))));
        cy = sc.height * 0.86;
      }
      return { id: id, x: cx, y: cy, w: sc.width * (def.w == null ? 0.22 : def.w), h: null, win: false, card: card, lighten: lighten };
    },

    /* B112（§7.3，老板 2026-10-03 验收）：有浮现图的节点不渲染**当前位置标记**（光环＋编号＋「你在这里」整体撤下）；
     * 判据＝本节点本次求值的浮现集非空（含窗景；条件变化逐次重算）。可达编号、已探索标记与遮罩开孔不受影响。 */
    currentMarkerHidden(st) {
      const n = st && st.loc ? (D && D.nodes[st.loc]) : null;
      return !!n && Core.momentsOf(st, n).length > 0;
    },

    /* ---- §6.2 结局名展示层去字母（数据面 n/endTag 不动；与 --player 的 playerEndName 同规则） ---- */
    endDisplayName(s) { return String(s == null ? '' : s).replace(/结局\s*[A-Za-z]\s*·/g, '结局 ·'); },

    /* ---- B137~B139（§2-B137~B139 · 2026-10-06）：指路面板／编号圈地点名／已探索分楼层——纯读助手
     * （不改状态；DOM 层与测试同源调用）。 */

    /* B137（§2-B137）：当前目标＝`meta.targets` 首条 cond 命中行的 text（先匹配者为准；末行兜底 cond 缺省＝恒真）；
     * 关卡无 targets（示例关）⇒ null（面板①块走降级句）。 */
    guideTarget(st) {
      const rows = (D && D.meta && Array.isArray(D.meta.targets)) ? D.meta.targets : null;
      if (!rows) return null;
      const hit = rows.find(r => Core.condOk(st, r.cond));
      return (hit && typeof hit.text === 'string' && hit.text) ? hit.text : null;
    },
    /* B137（§2-B137）：「还差什么」＝当前目标行的 need[]——`show` 不成立者不出（缺省恒显）；返回 [{label, done}]；
     * 行无 need ／ 全被 show 滤掉 ／ 无 targets ⇒ []（面板③块走空态句）。 */
    guideNeeds(st) {
      const rows = (D && D.meta && Array.isArray(D.meta.targets)) ? D.meta.targets : null;
      if (!rows) return [];
      const hit = rows.find(r => Core.condOk(st, r.cond));
      const need = (hit && Array.isArray(hit.need)) ? hit.need : [];
      return need.filter(n => Core.condOk(st, n.show)).map(n => ({ label: n.label, done: Core.condOk(st, n.done) }));
    },
    /* B137（§2-B137）：已知线索＝st.learned 的键序（获得先后——与 CLI「线索：」同源同字面） */
    guideClues(st) { return (st && st.learned) ? Object.keys(st.learned) : []; },

    /* B138（§2-B138）：编号圈地点名——已到过（当前点必然已到过）且地图场景（!plainPins）⇒ 节点名（与地点头／
     * 已探索 title 同源：endDisplayName(nm(n))）；未到过 ⇒ null（不渲染，渐进揭示）；房间/站外一律 null
     * （内景交互点多含事件名——不点名）。 */
    pinLabel(st, id, sid) {
      if (!st || !id || !st.visited || !st.visited[id]) return null;
      const sid2 = sid || Core.sceneOf(st);
      if (Core.plainPins(sid2)) return null;
      const n = (D && D.nodes && D.nodes[id]) || null;
      if (!n) return null;
      return Core.endDisplayName(Core.fillName(String(n.n || ''), st));
    },

    /* B139（§2-B139）：已探索分楼层——组＝sceneLabel(sceneOfNode(id))（缺省/空 ⇒ 「其它」）；
     * 组序＝场景表键序中该标签首次出现的顺序（「其它」＝未落于键序的标签，置末）；组内编号升序；
     * 过滤与既有 renderVisited 一致（hidden／fail／win 排除）；全空 ⇒ []（调用方走既有空态句）。
     * 返回 [{ label, ids: [...] }]（空组不出）。 */
    visitedGroups(st) {
      if (!D) return [];                          // 与兄弟助手同口径（D 未绑定时不作解引用）
      const ids = Object.keys((st && st.visited) || {})
        .filter(id => D.nodes[id] && !D.nodes[id].hidden && !D.nodes[id].fail && !D.nodes[id].win)
        .sort((a, b) => Number(a) - Number(b));
      const order = [];
      Object.keys(D.scenes).forEach(sid => {
        const lab = Core.sceneLabel(sid);
        if (lab && order.indexOf(lab) < 0) order.push(lab);
      });
      const map = {}, labels = [];
      ids.forEach(id => {
        const lab = Core.sceneLabel(Core.sceneOfNode(id)) || '其它';
        if (!map[lab]) { map[lab] = []; labels.push(lab); }
        map[lab].push(id);
      });
      labels.sort((a, b) => {                      // 场景表键序；「其它」置末（两者均落空＝稳定序保底）
        const ia = order.indexOf(a), ib = order.indexOf(b);
        if (ia < 0 && ib < 0) return 0;
        if (ia < 0) return 1;
        if (ib < 0) return -1;
        return ia - ib;
      });
      return labels.map(label => ({ label: label, ids: map[label] }));
    },

    /* ---- §3 消息分类（渲染层据此上色；判据零数据改动） ---- */
    /* 选项消息的类：sayKind 可选覆盖（'fail'｜'info'）＞形状判据（say ∧ to=当前节点 ∧ ¬fx ∧ ¬once）＞ null */
    sayKindOf(st, ch) {
      if (!ch || !ch.say) return null;
      if (ch.sayKind === 'fail' || ch.sayKind === 'info') return ch.sayKind;
      return (!ch.fx && !ch.once && ch.to === (st && st.loc)) ? 'fail' : 'info';
    },
    /* 效果日志的类：🔑 线索 → key；获得/失去 → gain；其余 → info */
    textKind(text) {
      const s = String(text == null ? '' : text);
      if (s.indexOf('🔑 记住了一条线索：') === 0) return 'key';
      if (s.indexOf('获得 ') === 0 || s.indexOf('失去 ') === 0) return 'gain';
      return 'info';
    },
    /* §4 时长（毫秒）：info/gain＝4.2s；key/fail＝7.0s（信息量最大的两类给足阅读时间） */
    msgHold: { info: 4200, gain: 4200, key: 7000, fail: 7000 },
    /* §4 一次操作的消息组：say（若有）＋效果行；同文本只留一次——toast 与反馈区渲染同一份 */
    msgGroup(say, sayKind, logs) {
      const out = [], seen = {};
      const push = (text, kind) => {
        const t = String(text == null ? '' : text);
        if (!t || seen[t]) return;
        seen[t] = true;
        out.push({ text: t, kind: kind || Core.textKind(t) });
      };
      if (say) push(say, sayKind || Core.textKind(say));
      (logs || []).forEach(t => push(t));
      return out;
    },

    /* ---- §5 物品栏 ---- */
    /* 持有道具，顺序＝itemOrder（只列已持有——未持有不留灰位） */
    invItems(st) { return ((D && D.itemOrder) || []).filter(id => Core.hasItem(st, id)); },
    /* 该选项是否消费此道具：cond 树（item/anyItem，含 all/any 递归）或 fx.lose 命中 */
    consumesItem(ch, itemId) {
      const tree = c => !!c && (c.item === itemId || ((c.anyItem || []).indexOf(itemId) >= 0)
        || (c.all || []).some(tree) || (c.any || []).some(tree));
      return tree(ch && ch.cond) || (((ch && ch.fx && ch.fx.lose) || []).indexOf(itemId) >= 0);
    },
    /* 「使用」判据：当前节点里可见（非 hide、未做过）且消费该道具的选项
     * 返回 { count, cis }——1 条＝「使用」按钮（等价执行该选项）；>1＝「可用于 N 处」；0＝不出现 */
    itemUseInfo(st, itemId) {
      const node = (st && st.loc && D.nodes[st.loc]) || null;
      if (!node || node.fail || node.win || st.bankrupt) return { count: 0, cis: [] };
      const cis = [];
      (node.c || []).forEach((ch, ci) => {
        if (Core.choiceDone(st, ch, ci, st.loc)) return;
        if (Core.choiceState(st, ch) === 'hide') return;
        if (Core.consumesItem(ch, itemId)) cis.push(ci);
      });
      return { count: cis.length, cis: cis };
    },

    /* ---- 货币 / 资源守卫（v1.3 规则推广到任何 noSpendToZero 的资源）----
     * 买东西（商店 / 腕带 / 自动贩卖机）付款后必须至少留 1 —— 花光 = 该资源归零 = 闯关失败 */
    payReason(st, price, resId) {
      const r = Core.resDef(resId || Core.mainResId()) || { id: 'coins', name: '萨瓦币', unit: '枚', zeroWarn: '花光就闯关失败' };
      const have = Core.resOf(st, r.id);
      /* B77 渲染字面（金额带币种名）＋ B78（R2·裁定 1）：拒付理由＝数字式——「星币不够（需要 N 枚星币，还差 K 枚）」 */
      if (have < price) return (r.name || r.id) + '不够（需要 ' + price + ' ' + (r.unit || '') + (r.name || r.id) + '，还差 ' + (price - have) + ' ' + (r.unit || '') + '）';
      if (Core.resNoFail(r)) return '';           // E1：该资源花光不判失败 → 可以花到 0
      if (have - price < 1) return '买完就剩 0 ' + (r.unit || '') + (r.name || '') + '——' + (r.zeroWarn || '花光就闯关失败') + '，不能买';
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
    /* 选项执行后的移动收口（B03）：`back`＝返回上一处；`to`＝本节点自指＝**原地**——没有移动，
     * 因此不重跑 `en` 的「每次进入」结算（12/13/19 的失败条 `to` 自指，重算会把失败反馈变成惩罚；
     * 失败反馈必须零代价（设计档 §9.7.3）。原地仍做一次失败检查，与旧 `go(同节点)` 的收口一致。 */
    move(st, res) {
      if (res.back) return Core.goBack(st);
      if (res.to && res.to !== st.loc) return Core.go(st, res.to);
      const log = [];
      Core.checkFail(st, log);
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
     * → 判定走投无路（界面弹「指路」面板：回到安全点 / 重开本关——B137 更名）。 */
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
      const rd = Core.resDef(rid) || {};
      log.push('购买「' + itemId + '」（-' + price + ' ' + (rd.unit || '') + (rd.name || '') + '）');   // B77：金额带币种名
      return log;
    },
    sell(st, itemId, log) {
      log = log || [];
      const meta = D.items[itemId] || {};
      if (!Core.hasItem(st, itemId) || meta.nosell) { log.push('这件道具不能卖。'); return log; }
      st.items.splice(st.items.indexOf(itemId), 1);
      const rid = Core.mainResId();
      st[rid] += 1;
      const rd = Core.resDef(rid) || {};
      log.push('卖出「' + itemId + '」（+1 ' + (rd.unit || '') + (rd.name || '') + '）');   // B77：金额带币种名
      return log;
    },
    buySticker(st, n, log) {   // 大里姆 34 号：买腕带（走同一条购买守卫）
      log = log || [];
      const why = Core.payReason(st, n);
      if (why) { log.push('买不了腕带：' + why); return log; }
      const rid = Core.mainResId();
      st[rid] -= n; st.wristband = n;
      const rd = Core.resDef(rid) || {};
      log.push('买了一条 ' + n + ' ' + (rd.unit || '') + (rd.name || '') + '的腕带（-' + n + ' ' + (rd.unit || '') + (rd.name || '') + '）');   // B77：金额带币种名
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
  let cgNodeId = null;     // B132（§6.7）：CG 层已求值的节点（换节点＝先关再求值；null＝尚未求值）

  /* B117（§1.1/D56）：存档写入——顺带记通关（win 节点）；记录＝独立键，失败不写、开新局不丢 */
  const save = () => {
    if (!store || !st) return;
    Core.saveTo(store, curLevelId, st);
    const n = (D && D.nodes && st.loc) ? D.nodes[st.loc] : null;
    if (n && n.win) Core.addRecord(store, curLevelId, Core.endShortName(n));
  };
  const nm = txt => Core.fillName(txt, st);                      // {me} 占位符 → 玩家名
  const resDef = id => Core.resDef(id) || {};
  const esc = s => String(s == null ? '' : s)                    // 关卡数据的文本进 innerHTML 前先转义
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ---------- B04（§3/§4）：消息（toast ＋ 剧情区反馈区同源） ----------
   * 时长：info/gain＝4.2s、key/fail＝7.0s；同屏最多 3 条（超出时最早一条立即淡出）。
   * 第二参数必须是对象——log.forEach(toast) 会把下标当第二参数传进来，收数字当毫秒会出事。 */
  const MSG_HOLD = Core.msgHold;   // 时长定值住 Core（与测试同源）
  function toast(msg, opts) {
    const o = (opts && typeof opts === 'object') ? opts : null;
    const text = String(msg == null ? '' : msg);
    const kind = (o && o.kind) || Core.textKind(text);
    const hold = (o && o.hold) || MSG_HOLD[kind] || 4200;
    const box = $('toasts');
    const d = document.createElement('span');   // §3 总规则：消息节点＝<span class="msg msg-<kind>">
    d.className = 'toast msg msg-' + kind;      // data-kind = DOM 机检锚点（§3 断言 1）
    d.dataset.kind = kind;
    d.textContent = (kind === 'fail' ? '✕ ' : '') + text;   // fail 前缀由 UI 层加（不改数据文本）
    box.appendChild(d);
    /* §4：同屏最多 3 条——计数只算「在场」的（已打 .leaving、还在 260ms 淡出中的不算），
     * 否则一次塞 5 条时会把淡出中的也算满，同屏可见会到 4 条。 */
    const live = Array.prototype.filter.call(box.children, c => !c.classList.contains('leaving'));
    for (let i = 0; i < live.length - 3; i += 1) {
      const old = live[i];
      old.classList.add('leaving');
      setTimeout(() => old.remove(), 260);
    }
    setTimeout(() => d.classList.add('fade'), Math.max(0, hold - 800));
    setTimeout(() => d.remove(), hold);
  }
  function toastGroup(msgs) { msgs.forEach(m => toast(m.text, { kind: m.kind })); }
  /* 反馈区（§4）：正文与选项之间常驻；进入新节点或重开本关 ⇒ 清空；同节点内原位刷新（不叠新行） */
  let fbLoc = null;
  function showFeedback(msgs) {
    const box = $('feedback');
    box.innerHTML = '';
    if (msgs && msgs.length) {
      let n = 0;
      for (const m of msgs) {
        for (const line of String(m.text).split('\n')) {
          if (n >= 4) break;                    // 合计 ≤4 行（§4）
          box.appendChild(msgNode(line, m.kind));
          n += 1;
        }
        if (n >= 4) break;
      }
    }
    box.classList.toggle('hidden', !box.children.length);   // 无内容时不占位
    fbLoc = st ? st.loc : null;
  }
  function syncFeedback() {                     // 换节点即清空（renderAll 每帧）
    if (!st) return;
    if (fbLoc !== st.loc) {
      const box = $('feedback');
      box.innerHTML = '';
      box.classList.add('hidden');
      fbLoc = st.loc;
    }
  }
  /* 单条消息节点（§3：class="msg msg-<kind>" data-kind=<kind>）——反馈区用 */
  function msgNode(text, kind) {
    const s = document.createElement('span');
    s.className = 'msg msg-' + kind;
    s.dataset.kind = kind;
    s.textContent = (kind === 'fail' ? '✕ ' : '') + text;
    return s;
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
  function sceneLabel(sid) { return Core.sceneLabel(sid); }   // B123：口径单源＝Core.sceneLabel（到达提示与角标同源）
  /* 同步当前场景：背景图 / 遮罩尺寸 / 舞台比例 / 场景角标；变化时复位视图并提示一次。
   * B122（§7.10）：图／宽高走 Core.sceneEntry（变体首匹配、逐帧求值——条件变化同帧生效，场景不变也重算）；
   *   变体图运行期加载失败 ⇒ 回落基础图渲染＋控制台一行告警（不空白、不破图）——同一失败图不重复重试。
   * B123（§6.3）：到达提示＝Core.arriveText（房间＝「到达：<房间名>」无 🛗；其余＝现形）。 */
  function applyScene() {
    const sid = st ? Core.sceneOf(st) : Core.defaultScene();
    if (!sid) return;
    const sc = D.scenes[sid];
    const entry = Core.sceneEntry(st, sid);          // §7.10 单源：全不命中＝基础条目（现状）
    const first = curScene === null;
    if (sid !== curScene) {
      curScene = sid;
      momentLive = {};               // B04（§7.3）：换场景 ⇒ 浮现层清空重渲染（不跨节点/场景驻留）
      $('momentLayer').innerHTML = '';
      resetView();
      if (calib) calibRedraw();      // B120：校准模式中换场景 ⇒ 重画标定层（既有 figures 虚线框）
      imgFailReset();
      if (!first && st) toast(Core.arriveText(sid));   // B123：房间＝到达：<房间名>；其余＝现形
    }
    const img = $('sceneImg');
    img.alt = sc.name + ' 场景图';
    if (img.dataset.src !== entry.image && img.dataset.fail !== entry.image) {   // 同图不重设（避免重复加载/闪烁）
      img.dataset.src = entry.image;
      img.src = entry.image;           // 路径只来自关卡数据（levels/*.js）
    }
    /* 变体图缺图兜底（§7.10）：加载失败 ⇒ 回落基础图渲染＋一行告警；基础图失败＝不重复触发（照旧交浏览器） */
    img.onerror = () => {
      const cur = img.dataset.src;
      if (!cur || cur === sc.image) return;
      img.dataset.fail = cur;          // 记下失败图：同一图不重复重试（条件恢复/重进房时由 imgFailReset 清）
      console.warn('背景状态变体缺图（回落基础图）：' + cur);
      img.dataset.src = sc.image;
      img.src = sc.image;
    };
    $('dimSvg').setAttribute('viewBox', '0 0 ' + entry.width + ' ' + entry.height);
    [$('maskRect'), $('dimRect')].forEach(r => {
      r.setAttribute('width', entry.width);
      r.setAttribute('height', entry.height);
    });
    $('stage').style.setProperty('--scene-w', entry.width);
    $('stage').style.setProperty('--scene-h', entry.height);
    /* B129（§6.6）：遮罩只属楼层图——mask=false 场景遮罩整层不渲染（房间/站外：整图直接可看） */
    $('dimSvg').classList.toggle('hidden', !entry.mask);
    /* B129（§6.5/§6.6）：提示条随场景（房间/站外＝无「灰暗区域」句） */
    $('hintBar').textContent = Core.hintText(sid);
    $('sceneTag').textContent = Core.sceneLabel(sid);
  }
  /* 换场景＝重试一次变体图（清失败记忆：T73~T79 直入目录后，重进房间即生效） */
  function imgFailReset() { const img = $('sceneImg'); img.dataset.fail = ''; }

  /* ---------- 关卡选择页（v0.2；B115＋B117＝§1.1 重订） ---------- */
  /* B117（§1.1 老板 2026-10-04 裁定）：读档功能恢复——卡片三态：无存档「开始」／未结束「继续＋重新开始」／
   * 已结束（通关／失败终止）「重玩」（不出现「继续」）；记录块（通关记录·独立键＋上局失败终止行）；
   * 覆盖＝开新局前统一一句确认（取消＝不动存档）；脚注＝本机存档口径。判定与文案同源＝Core.cardInfo。
   * B115（2026-10-03）：难度＝单选（默认普通）；「继续上次进度」不出现（入口名＝「继续」）。 */
  function levelCard(id, lv) {
    const meta = lv.meta || {};
    const card = document.createElement('div');
    card.className = 'levelCard';
    card.dataset.lv = id;   // B136：卡片「存档位」行登记键（档位增删后就地刷新用）

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
    /* B115（§1.1）：难度单选（默认选中普通）——切换即决定开局难度档 */
    const diffRow = document.createElement('div');
    diffRow.className = 'lcDiff';
    const picked = { diff: 'normal' };
    [['normal', '普通模式'], ['hard', '困难模式']].forEach(([d, label]) => {
      const lab = document.createElement('label');
      lab.className = 'lcDiffOpt';
      const r = document.createElement('input');
      r.type = 'radio';
      r.name = 'lcDiff-' + id;                 // 同一卡片内一组；多卡片互不串
      r.value = d;
      r.checked = (d === 'normal');            // 默认选中普通
      r.onchange = () => { if (r.checked) picked.diff = d; };
      const tx = document.createElement('span');
      tx.textContent = label;
      lab.appendChild(r);
      lab.appendChild(tx);
      diffRow.appendChild(lab);
    });
    btns.appendChild(diffRow);
    /* B117（§1.1）：按钮按卡片三态渲染（无档「开始」／未结束「继续＋重新开始」／已结束「重玩」）——
     * 「继续」＝载入该存档（resumeGame，不受难度选择影响）；开新局覆盖已有存档前统一一句确认（取消＝不动存档）。 */
    const info = Core.cardInfo(store, id);
    (info ? info.buttons : []).forEach(b => {
      const el = document.createElement('button');
      el.className = b.main ? 'lcMain' : 'lcAlt';
      el.textContent = b.label;
      el.onclick = () => {
        if (b.key === 'resume') { resumeGame(id, info.save); return; }
        if (b.confirm && !confirm(info.coverAsk)) return;   // D57：取消＝不动存档
        startGame(id, picked.diff);
      };
      btns.appendChild(el);
    });
    body.appendChild(btns);
    /* 记录块（通关史·独立键；失败终止另起一行）＋ 存档脚注（§1.1） */
    if (info && info.recordLine) {
      const d = document.createElement('div');
      d.className = 'lcRecord';
      d.textContent = info.recordLine;
      body.appendChild(d);
    }
    if (info && info.failLine) {
      const d = document.createElement('div');
      d.className = 'lcRecord lcFailEnd';
      d.textContent = info.failLine;
      body.appendChild(d);
    }
    if (info) {
      const d = document.createElement('div');
      d.className = 'lcSaveNote';
      d.textContent = info.note;
      body.appendChild(d);
    }
    /* B136（§1.2 入口②）：卡片「存档位」行（仅当该关存在手动档时渲染）——带「读取存档位」按钮，登记入 cardSlotRows */
    if (info && info.slotLine) {
      const slots = cardSlotsRow(id, info);
      cardSlotRows[id] = { row: slots.row, line: slots.line };
      body.appendChild(slots.row);
    }
    card.appendChild(body);
    return card;
  }
  function renderLevelSelect() {
    const box = $('levelList');
    box.innerHTML = '';
    cardSlotRows = {};   // B136：卡片行登记随重渲染重置（行由 levelCard 重新登记）
    Core.levelIds().forEach(id => box.appendChild(levelCard(id, LEVELS[id])));
    $('playerName').value = Core.playerName(store);
  }

  /* 真正进入关卡：跑开局效果 + 存档 + 渲染（序章层按下「跳过 / 开始」后才走到这里） */
  function beginRun() {
    const msgs = Core.go(st, D.start.node).map(t => ({ text: t, kind: Core.textKind(t) }));
    toastGroup(msgs);
    save();
    renderAll();
    showFeedback(msgs);        // B04（§4）：开局进入效果也进反馈区（与 toast 同源）
  }
  /* E2：序章层——新局开场整屏显示一次（读档不重放；没有 meta.prologue 的关卡不显示）
     B132（§6.7）：序章图＝CG-08 图位；缺图同 CG 口径——不显示图（退回无图态）、其余照旧＋一行告警。 */
  function showPrologue(pro) {
    $('prologueLines').innerHTML = pro.lines.map(t => '<p>' + esc(nm(t)) + '</p>').join('');
    const img = $('prologueImg');
    if (pro.image) {
      img.onerror = () => { console.warn('序章图缺图（已隐藏）：' + pro.image); img.classList.add('hidden'); };
      img.src = pro.image;
      img.classList.remove('hidden');
    }
    else { img.onerror = null; img.removeAttribute('src'); img.classList.add('hidden'); }
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
    cgNodeId = null;                     // 新局：CG 层尚未求值（once 标记随 newState 重置）
    hudPrev = null;                      // 新局：不把上一局的值当变化来闪
    foldLoc = null;                      // 换关卡 = 折叠状态归零（foldLoc 在下方声明，执行时早已初始化）
    fbLoc = null;                        // 换局：反馈区不得留上一局的消息（§4「重开本关时清空」）
    $('overlay').classList.add('hidden');
    startRun();
  }
  function resumeGame(id, s) {
    if (!Core.selectLevel(id)) return;
    curLevelId = id;
    st = Core.normalizeState(s);
    if (store && st.me) Core.savePlayer(store, st.me);
    curScene = null;
    cgNodeId = null;                     // 读档：CG 层重新求值（非 once 档读档回节点即显示）
    hudPrev = null;                      // 读档：不把读入的值当变化来闪
    foldLoc = null;
    fbLoc = null;                        // 读档＝换局：反馈区清空（存档节点与上一局末节点相同也如此）
    save();
    $('overlay').classList.add('hidden');
    renderAll();
  }
  function restart() {
    if (!confirm(Core.coverAsk())) return;   // B124（§1.1）：与卡片侧同一采用句（单一来源）
    st = Core.newState(st ? st.diff : 'normal', st ? st.me : Core.playerName(store));
    curScene = null;
    cgNodeId = null;                     // 重开：CG 层尚未求值（新局——once 档故地重游照常显示）
    hudPrev = null;
    foldLoc = null;
    fbLoc = null;                        // 重开本关 ⇒ 反馈区清空（§4）
    startRun();          // E2：重开本关 = 新局 → 有 prologue 也先弹一次（读档不重放）
  }
  function backToLevelSelect() {
    save();
    renderLevelSelect();
    $('overlay').classList.remove('hidden');
  }

  /* ---------- B136（§1.2 · D74）：存档 / 读档弹窗（多档位手动存·读·删；工具栏 💾 与卡片「存档位」行同一弹窗） ----------
   * 入口①：工具栏 `💾`（局内——存/读/覆盖/删）；入口②：卡片「读取存档位」（卡片态——只有读/删，没有运行中进度可存）。
   * 确认句与采用句＝Core 单一来源；本层只管渲染、探测与反馈。 */
  const SLOT_FAIL_TEXT = '⚠️ 没能写入这个存档位（这台设备的存储空间不足或被禁用）；本次游玩不受影响。';
  const SLOT_WARN_TEXT = '这台设备无法保存进度（浏览器存储被禁用）；本次游玩不受影响。';
  let slotModalLv = null;        // 弹窗绑定的关卡 id（打开时定）
  let slotModalMode = 'play';    // 'play'＝局内（存/读/覆盖/删）｜'card'＝卡片入口（只有读/删）
  let slotStoreOk = true;        // 打开弹窗时探测一次的存储可用性（不可用 ⇒ 警示行＋按钮全部禁用）
  let cardSlotRows = {};         // levelId → { row, line }：卡片「存档位」行登记（档位增删后就地刷新；重渲染时重置）

  /* 弹窗一行（两态）：空档＝「（空档位）」＋「存入」（局内）；有档＝摘要行＋「读取」（主）＋「覆盖存档」（局内）＋「删除」 */
  function slotRowEl(lid, i, slot) {
    const n = i + 1;
    const row = document.createElement('div');
    row.className = 'slotRow' + (slot ? '' : ' empty');
    const line = document.createElement('div');
    line.className = 'slotLine';
    line.textContent = slot ? Core.slotInfo(n, slot, LEVELS[lid]) : '（空档位）';
    row.appendChild(line);
    const btns = document.createElement('div');
    btns.className = 'slotBtns';
    const tip = document.createElement('div');              // 写入失败：该档行内提示（与 toast 同句）
    tip.className = 'slotTip hidden';
    const failWrite = () => {
      tip.textContent = SLOT_FAIL_TEXT;
      tip.classList.remove('hidden');
      toast(SLOT_FAIL_TEXT);
    };
    const add = (label, main, fn) => {
      const b = document.createElement('button');
      b.className = 'slotBtn' + (main ? ' main' : '');
      b.textContent = label;
      b.disabled = !slotStoreOk;                            // 存储不可用 ⇒ 按钮全部禁用（玩法照常）
      b.onclick = fn;
      btns.appendChild(b);
    };
    /* 存入 / 覆盖：写入失败（slotPut false）⇒ 行内提示＋toast＝采用句；成功 ⇒ 反馈＋重渲染＋卡片行刷新 */
    const write = over => {
      if (!st) return;                                      // 卡片态无运行中进度（该按钮不渲染；防御）
      if (over && !confirm(Core.slotAsk().over)) return;
      if (!Core.slotPut(store, n, st, lid)) { failWrite(); return; }
      toast((over ? '💾 已覆盖存档位 ' : '💾 已存入存档位 ') + n);
      renderSlotRows();
      refreshCardSlots(lid);
    };
    /* 删除（写失败同走写入失败句——同一键的写操作） */
    const del = () => {
      if (!confirm(Core.slotAsk().del)) return;
      if (!Core.slotDel(store, n, lid)) { failWrite(); return; }
      toast('🗑 已删除存档位 ' + n);
      renderSlotRows();
      refreshCardSlots(lid);
    };
    /* 读取＝既有读档路径（resumeGame：选中关卡 → normalizeState → 场景归一 → 补写自动存档 → 全量重渲染）；
     * 两处入口（局内弹窗／卡片入口）同走这一份——确认串同源＝Core.slotAsk() 的读取句。 */
    const read = () => {
      if (!confirm(Core.slotAsk().read)) return;
      const s = Core.slotList(store, lid)[i];
      if (!s) return;
      const node = (LEVELS[lid] && LEVELS[lid].nodes[s.st.loc]) || null;
      const label = (s.st.loc != null ? s.st.loc : '?') + ' · ' + Core.endDisplayName(Core.fillName(String((node && node.n) || ''), s.st));
      $('saveModal').classList.add('hidden');
      resumeGame(lid, s.st);
      toast('📂 已回到存档位 ' + n + '：' + label, { kind: 'info' });
    };
    if (slot) {
      add('读取', true, read);
      if (slotModalMode === 'play') add('覆盖存档', false, () => write(true));
      add('删除', false, del);
    } else if (slotModalMode === 'play') {
      add('存入', true, () => write(false));
    }
    row.appendChild(btns);
    row.appendChild(tip);
    return row;
  }
  function renderSlotRows() {
    const rows = $('saveRows');
    rows.innerHTML = '';
    const warn = $('saveWarn');
    warn.textContent = SLOT_WARN_TEXT;
    warn.classList.toggle('hidden', slotStoreOk);
    Core.slotList(store, slotModalLv).forEach((slot, i) => rows.appendChild(slotRowEl(slotModalLv, i, slot)));
  }
  /* 打开弹窗（两处入口共用）；打开时探测一次存储可用性 */
  function openSaveModal(lid, mode) {
    const id = lid || curLevelId;
    if (!id || !LEVELS[id]) return;
    slotModalLv = id;
    slotModalMode = mode === 'card' ? 'card' : 'play';
    slotStoreOk = Core.slotsAvailable(store);
    renderSlotRows();
    $('saveModal').classList.remove('hidden');
  }
  /* 卡片「存档位」行（B136 · §1.2 入口②）：仅当该关存在手动档时构建 */
  function cardSlotsRow(id, info) {
    const row = document.createElement('div');
    row.className = 'lcSlotsRow';
    const line = document.createElement('div');
    line.className = 'lcSlotsLine';
    line.textContent = info.slotLine;
    row.appendChild(line);
    const b = document.createElement('button');
    b.className = 'lcAlt';
    b.textContent = '读取存档位';
    b.onclick = () => openSaveModal(id, 'card');            // 同一弹窗（卡片态：只有读/删）
    row.appendChild(b);
    return { row, line };
  }
  /* 档位增删后的卡片行就地刷新（只更新已渲染的行；无档卡片在下次渲染时自然不出现） */
  function refreshCardSlots(id) {
    const hit = cardSlotRows[id];
    if (!hit) return;
    const info = Core.cardInfo(store, id);
    if (!info.slotLine) { hit.row.remove(); delete cardSlotRows[id]; return; }
    hit.line.textContent = info.slotLine;
  }

  /* ---------- 渲染 ---------- */
  function renderAll() {
    if (!D || !st) return;
    applyScene();   // 先同步场景（背景图 / 遮罩 / 舞台比例），再渲染
    hideAlertBar(); // 重绘即撤下上一条警示条（本次新发生的由 showFlash 在本函数之后重新弹出）
    renderHUD(); renderPins(); renderCharSpots(); renderMoments(); renderInv(); syncFeedback(); renderVisited(); renderNode();
    applyCg();      // B132（§6.7）：CG 整屏层（进节点求值＋跨渲染驻留——层在场景区最上）
    if (Core.deadEnd(st)) showStuck('dead');   // v0.2：卡死保险（B137：自动弹出＝带死局上下文行）
  }

  /* HUD：全部资源（含低额预警）+ 武力值 */
  function lowThreshold(r) {
    if (r.low != null) return r.low;
    const s0 = (r.start && (r.start.normal || 0)) || 0;
    return Math.max(1, Math.round(s0 * 0.2));
  }
  /* ---------- HUD 资源（B04：氧气＝条＋数值；其余资源＝计数） ---------- */
  /* bar:true 的资源按「余量读数」口径呈现（design-ui-v1.md §6.1／设计档 §8.3，B04 重订）：
   * 分段填充条＋具体数值（数值＝余量原值，单位「点」；条＝round(值÷基准×10) 格、基准＝普通开局值）；
   * 档位色 = ≥50 正常（ok）／20~49 警示（warn）／<20 危险（danger·呼吸感）——数字与条同色。
   * 两者同源同帧：同一处渲染，条与数字永不脱节；hudPrev = 上一次渲染值：有变 → 条与数字一起闪。 */
  const BAR_SEGMENTS = 10;
  let hudPrev = null;
  function barTier(r, v) {
    const base = (r.start && r.start.normal) || 100;
    const k = base > 0 ? v / base : 0;
    return k >= 0.5 ? 'ok' : k >= 0.2 ? 'warn' : 'danger';
  }
  function renderHUD() {
    const box = $('resList');
    box.innerHTML = '';
    const prev = hudPrev, next = {};
    Core.resources().forEach(r => {
      const v = Core.resOf(st, r.id);
      const low = v <= lowThreshold(r);
      next[r.id] = v;
      if (r.bar) {                     // B04（§6.1）：氧气＝分段填充条＋数值
        const base = (r.start && r.start.normal) || 100;
        const filled = Math.max(0, Math.min(BAR_SEGMENTS, Math.round(base > 0 ? v / base * BAR_SEGMENTS : 0)));
        const hit = prev && prev[r.id] != null && prev[r.id] !== v;
        const s = document.createElement('span');
        s.className = 'stat res bar ' + barTier(r, v) + (hit ? ' hit' : '');
        s.dataset.res = r.id;
        s.title = (r.name || r.id) + '：' + v;
        const ic = document.createElement('span');
        ic.className = 'barIcon';
        ic.textContent = r.icon || '';
        const cells = document.createElement('span');
        cells.className = 'barCells';
        for (let i = 0; i < BAR_SEGMENTS; i++) {
          const c = document.createElement('i');
          c.className = i < filled ? 'on' : 'off';
          cells.appendChild(c);
        }
        const num = document.createElement('span');   // B04（§6.1）：条旁的数值＝当前余量原值
        num.className = 'barNum';
        num.textContent = v;
        s.appendChild(ic);
        s.appendChild(cells);
        s.appendChild(num);
        box.appendChild(s);
        if (hit) setTimeout(() => s.classList.remove('hit'), 700);   // 闪一下（扣／回氧均即时可见）
        return;
      }
      const s = document.createElement('span');
      s.className = 'stat res' + (low ? ' low' : '');
      s.dataset.res = r.id;
      s.title = (r.name || r.id) + (low ? '：偏低！' : '');
      s.textContent = (r.icon || '') + ' ' + v;
      box.appendChild(s);
    });
    hudPrev = next;
    $('atkEl').textContent = '⚔ 武力值 ' + Core.atkOf(st);
  }

  /* 场景遮罩（§6.6）：只在“当前位置 + 可达位置”开洞。孔洞半径按场景宽度等比缩放。
   * （B130 重订：亮度＝全站正常亮度——本函数只管未探索遮罩，与亮度无关。） */
  function renderDim() {
    const sid = Core.sceneOf(st);
    const sc = D.scenes[sid];
    const k = sc.width / 800;
    const g = $('dimHoles');
    g.innerHTML = '';
    if (!Core.sceneEntry(st, sid).mask) return;   // B129（§6.6）：房间/站外无遮罩（无孔；整层已隐藏）
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
    const sid = Core.sceneOf(st);
    const sc = D.scenes[sid];
    const layer = $('pinLayer');
    layer.innerHTML = '';
    lastReach = Core.reachablePins(st);
    const hideCur = Core.currentMarkerHidden(st);   // B112（§7.3）：有浮现图的节点 ⇒ 当前位置标记整体不渲染
    const plain = Core.plainPins(sid);              // B128（§6.5）：房间/站外 ⇒ 只渲染可点编号圈
    Core.pinsVisible(st, sid).forEach(id => {
      const [x, y] = sc.pins[id];
      const isCur = st.loc === id;
      /* B112（楼层图守护）：光环＋编号＋「你在这里」一起撤下（浮现图即「你在这里」的画面证据）；其余编号照旧。
       * B128：房间/站外不渲染当前位置标记——渲染集已排除当前编号，标记样式也只在楼层图成立（「你在这里」＝地图语义）。 */
      if (!plain && isCur && hideCur) return;
      const canClick = FREE_MOVE || !!lastReach[id];
      const isVisited = !!st.visited[id];
      const b = document.createElement('button');
      b.className = 'pin'
        + (!plain && isCur ? ' current' : '')
        + (!isCur && canClick ? ' reach' : '')
        + (!isCur && !canClick ? (isVisited ? ' visited' : '') : '');
      b.dataset.id = id;
      b.style.left = (x / sc.width * 100) + '%';
      b.style.top = (y / sc.height * 100) + '%';
      /* B138（§2-B138）：已到过的地图点补地点名（Core.pinLabel 单源）——未到过/房间/站外 ⇒ 不渲染
       * （纯追加：未到过 pin 结构＝ring＋num 逐字不变；.pname 不接收指针事件） */
      const pname = Core.pinLabel(st, id, sid);
      b.innerHTML = '<span class="ring"></span><span class="num">' + id + '</span>'
        + (pname ? '<span class="pname">' + esc(pname) + '</span>' : '')
        + (!plain && isCur ? '<span class="hereTag">你在这里</span>' : '');
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

  /* B139（§2-B139）：已探索按楼层分组（组序＝场景表键序；「其它」置末；组内编号升序）——分组判定住 Core.visitedGroups；
   * 空组不出；全空＝既有空态句（过滤与改前一致——hidden／fail／win 排除）。 */
  function renderVisited() {
    const box = $('visitedList');
    box.innerHTML = '';
    const groups = Core.visitedGroups(st);
    if (!groups.length) { box.innerHTML = '<span class="dim">（还没去过任何地方）</span>'; return; }
    groups.forEach(g => {
      const lab = document.createElement('span');
      lab.className = 'vgLabel';
      lab.textContent = g.label;
      box.appendChild(lab);
      g.ids.forEach(id => {
        const s = document.createElement('span');
        s.className = 'vchip'; s.textContent = id; s.title = Core.endDisplayName(nm(D.nodes[id].n));
        box.appendChild(s);
      });
    });
  }

  /* ---------- 人物：地图光环 / 本处人物小卡 / 人物图鉴 ---------- */
  /* 本处人物（B04 §7.6）：两层制关卡（有 moments 注册表）＝node.chars 直连（28/29/40 等「客场」节点同样显示）；
   * 示例关 dalim 无该数据 ⇒ 沿用旧口径（按 spot.scene 过滤），既有行为零变化。 */
  function hereChars() {
    const node = D.nodes[st.loc];
    const ids = ((node && node.chars) || []).filter(cid => !!D.characters[cid]);
    if (D.moments) return ids;
    const sid = Core.sceneOf(st);
    return ids.filter(cid => { const ch = D.characters[cid]; return !!ch.spot && ch.spot.scene === sid; });
  }
  /* 立绘：有 img（T05 切片）用图；没有 ⇒ emoji 占位；加载失败 ⇒ 原地回落 emoji（缺图不留破图） */
  function charFace(ch, cls) {
    if (ch.img) return '<img class="' + cls + ' faceImg" src="' + ch.img + '" alt="' + ch.name + '" data-emoji="' + (ch.emoji || '👤') + '">';
    return '<span class="' + cls + ' ccFace">' + (ch.emoji || '👤') + '</span>';
  }
  /* 头像缺图兜底（B04）：立绘/切片未到货时，img 加载失败 ⇒ 换回 emoji 占位（不留白框） */
  function guardFaces(root) {
    const imgs = root && root.querySelectorAll ? root.querySelectorAll('img.faceImg') : [];
    Array.prototype.forEach.call(imgs, img => {
      if (img.dataset.guarded) return;
      img.dataset.guarded = '1';
      img.onerror = () => {
        const sp = document.createElement('span');
        sp.className = img.className.split(' ').filter(c => c !== 'faceImg').join(' ') + ' ccFace';
        sp.textContent = img.dataset.emoji || '👤';
        img.replaceWith(sp);
      };
    });
  }
  function renderCharSpots() {
    const layer = $('charLayer');
    layer.innerHTML = '';
    if (D.moments) return;   // B04（§11）：两层制关卡（站关）撤下地图光环位——人由 L1/L2 承担；示例关沿用
    const sc = D.scenes[Core.sceneOf(st)];
    const size = Math.round(88 * (sc.width / 800)) + 'px';
    hereChars().forEach((cid, i) => {
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
    const ids = hereChars();
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
    guardFaces(box);
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
    guardFaces($('charCardBody'));
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
    guardFaces(grid);
    $('charsModal').classList.remove('hidden');
  }

  /* ---------- B04（§7）：浮现层（L2）——节点 moments/mIf 求值 → 场景叠层；缺图不渲染、不留位 ---------- */
  let momentLive = {};   // id → 元素（同场景内续存的元素；退场时淡出后移除，出现时不重复淡入）
  /* B122：浮现图几何／类名按 plan 落位；plan 变了 ⇒ 就地刷新（复用元素、不重建、不闪）——
   * 覆盖卡几何随「生效 figures」（变体换表时同帧跟上）；同一 plan ⇒ 一个字节不动（B120「换态不换位」）。 */
  function momentClassOf(plan) {
    return 'moment' + (plan.win ? ' win' : '') + (plan.card ? ' card' : '') + (plan.cover ? ' cover' : '') + (plan.lighten ? ' lighten' : '');
  }
  function momentKey(plan) { return [momentClassOf(plan), plan.x, plan.y, plan.w, plan.h || 0].join('|'); }
  function applyMomentGeom(d, plan, sc) {
    d.className = momentClassOf(plan);
    d.style.left = (plan.x / sc.width * 100) + '%';            // 锚点＝原图像素（与 pins 同口径）
    d.style.top = (plan.y / sc.height * 100) + '%';
    d.style.width = (plan.w / sc.width * 100) + '%';
    d.style.height = plan.h ? (plan.h / sc.height * 100) + '%' : '';
    d.dataset.plan = momentKey(plan);
  }
  function createMomentEl(id, def, plan, sc, i) {
    const d = document.createElement('div');
    applyMomentGeom(d, plan, sc);
    d.dataset.moment = id;
    d.dataset.scene = Core.sceneOf(st);
    const img = document.createElement('img');
    img.className = 'momentImg';
    img.alt = '';
    img.draggable = false;
    img.style.animationDelay = ((i || 0) * 0.08) + 's';        // 同节点多张依次错开 0.08s（§7.3）
    img.src = def.file;                                       // 路径只来自关卡数据（levels/*.js）
    /* 缺图兜底（§7.3）：加载失败 ⇒ 该张不渲染、其余照常、控制台一行告警；不留占位框与破图 */
    img.onload = () => img.classList.add('on');
    img.onerror = () => { d.remove(); console.warn('浮现图缺图（已跳过）：' + def.file); };
    d.appendChild(img);
    return d;
  }
  function renderMoments() {
    const layer = $('momentLayer');
    if (!D.moments) { layer.innerHTML = ''; momentLive = {}; return; }   // 无浮现层的关卡：整层不启用
    const sid = Core.sceneOf(st);
    const sc = D.scenes[sid];
    const ids = Core.momentsOf(st, D.nodes[st.loc]);
    const next = {};
    ids.forEach((id, i) => {
      const def = Core.momentDef(id);
      const plan = Core.momentLayout(id, sid, i, ids.length, st);   // B122：覆盖几何按生效 figures（变体感知）
      if (!def || !plan) {                                     // id 未注册 ⇒ 忽略该条
        if (def && Core.coverState(id, sid, st) === 'uncalibrated') {
          console.warn('浮现图未标定轮廓框（已跳过）：' + id);   // B120（§7.3）：figures 缺 ⇒ 不渲染＋一行告警
        }
        return;
      }
      let d = momentLive[id];
      if (d && d.dataset.scene !== sid) { d.remove(); d = null; }
      if (!d) { d = createMomentEl(id, def, plan, sc, i); layer.appendChild(d); }
      else if (d.dataset.plan !== momentKey(plan)) applyMomentGeom(d, plan, sc);   // B122：几何随 plan 刷新（有变才改）
      next[id] = d;
    });
    Object.keys(momentLive).forEach(id => {                    // 退场：淡出 0.25s 后移除（§7.3）
      if (next[id]) return;
      const d = momentLive[id];
      d.classList.add('leaving');
      setTimeout(() => d.remove(), 260);
    });
    momentLive = next;
    /* B127（§7.3）：首访一次（`mOnce`）——本节点本次真的渲染了浮现图 ⇒ 标记落库（同一存档内之后不再重现）；
     * 未命中任何一张（收窗／条件未满足）不落标记：下次进入仍按条件求值。标记随即落档：
     * 上游「先 save 后 renderAll」的顺序下，不补这一次写的话「到达后立即关页」续档时会再显示一次。 */
    if (ids.length && (D.nodes[st.loc] || {}).mOnce) {
      const fresh = !(st.mSeen || {})[st.loc];
      Core.markMomentSeen(st, st.loc);
      if (fresh) save();
    }
  }

  /* ---------- B132（§6.7）：CG 整屏层——进节点求值＋跨渲染驻留＋点掉＋落标记 ---------- */
  /* §7.3（同节点两者同时命中）：**CG 关闭后再淡入浮现图**——点掉档关闭时，对当前在场的浮现图
   * 重放一次入场（图已就位者）；图未加载完的不重放，加载完成时自会淡入（仍晚于 CG 关闭）。
   * 换节点关闭不重放（新节点的浮现图按常规入场——避免旧节点退场图闪一下）。 */
  function replayMomentFade() {
    Object.keys(momentLive).forEach(id => {
      const el = momentLive[id];
      const img = (el && el.querySelector) ? el.querySelector('.momentImg') : null;
      if (!img || !img.classList.contains('on')) return;
      img.classList.remove('on');
      void img.offsetWidth;                       // 强制重排：让入场动画能重新播放（同 HUD 闪动口径）
      img.classList.add('on');
    });
  }
  function closeCg(replay) {
    $('cgLayer').classList.add('hidden');
    if (replay) replayMomentFade();               // §7.3：CG 关闭后再淡入浮现图
  }
  function applyCg() {
    if (!st || !D) { closeCg(); cgNodeId = null; return; }
    const layer = $('cgLayer');
    const nodeId = st.loc;
    if (nodeId !== cgNodeId) {        // 换节点：先关（点掉的记忆归零），再按新节点求值
      cgNodeId = nodeId;
      closeCg();
      layer.dataset.node = '';
    }
    const plan = Core.cgOf(st);       // 判据＝st.loc＋st.cgSeen（once 档已显示过 ⇒ null）
    if (!plan) return;                // 无 cg 的节点：层保持关闭（回归——场景区逐字零变化）
    if (layer.dataset.node === nodeId) return;   // 跨渲染驻留：同节点重渲染不重弹（含已点掉）
    layer.dataset.node = nodeId;
    layer.dataset.dismiss = plan.dismiss;        // 点掉判定用（once 档落标记后 cgOf＝null，不能靠它判）
    const img = $('cgImg');
    img.dataset.src = plan.file;
    img.src = plan.file;                          // 路径只来自关卡数据（levels/*.js）
    /* 缺图兜底（§6.7）：src 加载失败 ⇒ 整层隐藏＋一行告警（不空白、不留框；once 标记照落） */
    img.onerror = () => { console.warn('CG 缺图（整层隐藏）：' + plan.file); closeCg(); };
    $('cgChip').classList.toggle('hidden', plan.dismiss !== 'click');   // 常驻档（结局屏）无「点击继续」片
    layer.classList.remove('hidden');
    if (plan.once && !((st.cgSeen || {})[nodeId])) {
      Core.markCgSeen(st, nodeId);   // once：落标记（表现层状态位、随存档）
      save();                        // 补写一次存档（同 §7.3 mSeen 口径——到达后立即关页亦不失标记）
    }
  }
  /* 点击/拖拽/滚轮不穿透到底层（编号、拖拽、校准点击、缩放）；点掉档点击 ⇒ 关闭（本节点内不再弹） */
  function bindCg() {
    const layer = $('cgLayer');
    ['pointerdown', 'wheel'].forEach(ev => layer.addEventListener(ev, e => e.stopPropagation()));
    layer.addEventListener('click', e => {
      e.stopPropagation();
      if (layer.dataset.dismiss === 'keep') return;   // 常驻档（结局屏）：点击不关
      closeCg(true);                                  // 点掉档：关闭＋浮现图重放入场（§7.3）
    });
  }

  /* ---------- B04（§5）：物品栏（地图下方横排；点选＝详情气泡；「使用」＝等价执行对应选项） ---------- */
  let invOpen = null;    // 当前展开详情气泡的道具名
  function invItemName(id) { return id.length > 4 ? id.slice(0, 4) + '…' : id; }   // 名称 ≤4 字截断
  function renderInv() {
    const bar = $('invBar');
    bar.innerHTML = '';
    const items = Core.invItems(st);
    if (!items.length) {
      const d = document.createElement('div');
      d.className = 'invEmpty';
      d.textContent = '（还没有道具）';
      bar.appendChild(d);
      invOpen = null;
      return;
    }
    items.forEach(id => {
      const meta = D.items[id] || {};
      const use = Core.itemUseInfo(st, id);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'invItem' + (invOpen === id ? ' open' : '');
      b.dataset.item = id;
      b.title = id;
      b.innerHTML = '<span class="ivIcon">' + (meta.icon || '❔') + '</span><span class="ivName">' + esc(invItemName(id)) + '</span>'
        + (Core.itemText(id) ? '<span class="ivBadge">📖</span>' : '')
        + (use.count === 1 ? '<span class="ivBadge use">可用</span>' : '');
      b.onclick = () => { invOpen = (invOpen === id) ? null : id; renderInv(); };
      bar.appendChild(b);
      if (invOpen === id) bar.appendChild(invBubble(id, meta, use));
    });
  }
  /* 详情气泡：图标/名称 ＋介绍（B07）＋「可用于：<选项名>」＋「使用」（唯一命中）/「可用于 N 处」（多条）＋「看内容」 */
  function invBubble(id, meta, use) {
    const node = D.nodes[st.loc];
    const desc = Core.itemDesc(id);              // B07（§2-B141）：介绍一行（放在标题下；物品栏只列已持有）
    const d = document.createElement('div');
    d.className = 'invBubble';
    d.innerHTML = '<div class="ibTitle">' + (meta.icon || '❔') + ' ' + esc(id) + '</div>';
    if (desc) {
      const r = document.createElement('div');
      r.className = 'ibDesc';
      r.textContent = desc;
      d.appendChild(r);
    }
    if (use.count === 1) {
      const r = document.createElement('div');
      r.className = 'ibRow';
      r.textContent = '可用于：' + nm((node.c[use.cis[0]] || {}).l || '');
      d.appendChild(r);
      const b = document.createElement('button');
      b.className = 'ibUse';
      b.textContent = '使用';
      b.onclick = () => { invOpen = null; doChoice(use.cis[0]); };    // 与点选项同一路径、同一反馈
      d.appendChild(b);
    } else if (use.count > 1) {
      const b = document.createElement('button');
      b.textContent = '可用于 ' + use.count + ' 处';
      b.onclick = () => highlightChoices(use.cis);
      d.appendChild(b);
    }
    if (Core.itemText(id)) {
      const b = document.createElement('button');
      b.textContent = '📖 看内容';
      b.onclick = () => openRead(id);                                 // E3 既有只读面板（B07 升格＝介绍段＋正文段）
      d.appendChild(b);
    } else if (!desc) {                            // B07：兜底行改判——desc 与 text 皆无才出
      const r = document.createElement('div');
      r.className = 'ibDim';
      r.textContent = '这件东西没什么可读的';
      d.appendChild(r);
    }
    return d;
  }
  /* 多条命中：滚动 + 高亮选项列表（§5） */
  function highlightChoices(cis) {
    invOpen = null;
    renderInv();
    const box = $('choiceList');
    let first = null;
    Array.prototype.forEach.call(box.querySelectorAll('.choice[data-ci]'), el => {
      if (cis.indexOf(Number(el.dataset.ci)) < 0) return;
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
      if (!first) first = el;
      setTimeout(() => el.classList.remove('flash'), 2400);
    });
    if (first && first.scrollIntoView) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
          const r0 = resDef(Core.mainResId());
          b.textContent = n + ' ' + (r0.unit || '') + (r0.name || '');   // B77：金额带币种名
          b.disabled = !!why;
          b.title = why;
          if (why) {
            const tag = document.createElement('span');
            tag.className = 'pwTag';
            tag.textContent = Core.resOf(st, Core.mainResId()) < n ? '钱不够' : '要留 1 ' + (r0.unit || '') + (r0.name || '');
            b.appendChild(tag);
            if (Core.resOf(st, Core.mainResId()) >= n) floorStop = true;
          }
          b.onclick = () => {
            if (Core.payReason(st, n)) return;   // 守卫判定与按钮禁用同出一处
            const sayText = ch.say ? Core.fillName(ch.say, st) : null;
            const msgs = Core.msgGroup(sayText, Core.sayKindOf(st, ch), Core.buySticker(st, n));   // E7：价格类选项同一条旁白口径（B04：并入消息组）
            Core.markChoiceDone(st, ch, idx, st.loc);      // E6：价格类选项同样只做一次
            const hit = (ch.toIf || []).find(x => Core.condOk(st, x.cond));
            Core.go(st, hit ? hit.to : ch.to).forEach(t => { msgs.push({ text: t, kind: Core.textKind(t) }); });
            toastGroup(msgs);
            const fl = Core.takeFlash(st);
            save(); renderAll(); showFlash(fl);
            showFeedback(msgs);
          };
          row.appendChild(b);
        });
        wrap.appendChild(row);
        if (floorStop) {
          const hint = document.createElement('div');
          hint.className = 'priceWhy';
          hint.textContent = '❗ 付款后必须至少留 1 ' + (resDef(Core.mainResId()).unit || '') + (resDef(Core.mainResId()).name || '') + '——花光就闯关失败。';   // B77：金额带币种名
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
          '<span class="sPrice">' + node.shop.price + ' ' + (resDef(Core.mainResId()).unit || '') + (resDef(Core.mainResId()).name || '') + '</span>';   // B77：商店行带币种名
        const b = document.createElement('button');
        b.textContent = owned ? '已拥有' : '购买';
        b.disabled = owned || !!why;
        b.title = why;
        b.onclick = () => {
          if (Core.payReason(st, node.shop.price)) { renderAll(); return; }
          const msgs = Core.msgGroup(null, null, Core.buy(st, it, node.shop.price));   // B04：购买也进反馈区（§4「最近一次操作」）
          toastGroup(msgs);
          save(); renderAll();
          showFeedback(msgs);
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
        b.textContent = '卖出 +1 ' + (resDef(Core.mainResId()).unit || '') + (resDef(Core.mainResId()).name || '');   // B77：金额带币种名
        b.onclick = () => {
          const msgs = Core.msgGroup(null, null, Core.sell(st, it));
          toastGroup(msgs);
          save(); renderAll();
          showFeedback(msgs);
        };
        row.appendChild(b);
        wrap.appendChild(row);
      });
      fold.appendChild(wrap);
      box.appendChild(fold);
    }
  }

  function doChoice(idx) {
    /* B04（§3/§4）：一次操作的消息组（say＋效果行＋移动效果）——toast 与反馈区同源；类由判据定 */
    const node0 = D.nodes[st.loc];
    const sayKind = Core.sayKindOf(st, (node0.c || [])[idx]);
    const res = Core.choose(st, idx);
    const msgs = Core.msgGroup(res.say, sayKind, res.log || []);   // E7：旁白与效果日志并列、同文本只留一次
    let log = [];
    log = Core.move(st, res);              // B03：原地（to 自指）不重跑 en；返回上一处走 goBack
    (log || []).forEach(t => { msgs.push({ text: t, kind: Core.textKind(t) }); });
    toastGroup(msgs);
    const flash = Core.takeFlash(st);
    save(); renderAll();
    showFeedback(msgs);                    // §4：常驻反馈区（同节点内原位刷新）
    showFlash(flash);
  }

  function makeChoiceButton(ch, idx, ok) {
    const b = document.createElement('button');
    b.className = 'choice';
    b.dataset.ci = idx;            // B04：物品栏「可用于 N 处」按 ci 高亮/滚动（§5）
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
      /* 战斗对照（exact 白名单③）保留；「胜 → / 负 → 」去向标签已按 §8.3 撤下；
       * B80（R2·裁定 3）：对照行下方渲染「构成行」——这套加成怎么凑出来的＋还差几点（白名单③ 第二段） */
      b.innerHTML = '<span>' + nm(ch.l) + '</span>' +
        '<span class="chip">你的武力值 ' + mine + (mine >= need ? ' ≥ ' : ' < ') + need + '</span>' +
        '<span class="chip atkParts">' + esc(Core.battleBreakdown(st, need)) + '</span>';
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
    $('locName').textContent = Core.endDisplayName(nm(node.n));   // B04（§6.2）：结局名去字母（渲染层）
    $('nodeText').textContent = nm(Core.nodeText(st, node));   // E8：正文分叉（首个满足的 tIf；都不满足用 t）
    renderHereChars();

    const box = $('choiceList');
    box.innerHTML = '';

    /* ① 结局（通关 / 失败）：复用失败界面 + 结局标签 + 通关奖励 */
    if (node.fail || node.win) {
      const d = document.createElement('div');
      d.className = 'endBanner ' + (node.win ? 'win' : 'fail');
      /* B04（§6.2）：玩家可见的结局名一律去字母（「结局 A · 圆满」→「结局 · 圆满」）；数据面 endTag 不动 */
      d.textContent = node.endTag ? ('🏁 ' + Core.endDisplayName(nm(node.endTag))) : (node.win ? '🏆 闯关成功！' : '💀 闯关失败');
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

  /* ---------- 背包（E3：带正文的道具点开只读面板；B07 升格：介绍段在前、正文段随后） ---------- */
  function openRead(it) {
    const desc = Core.itemDesc(it), text = Core.itemText(it);
    if (!desc && !text) { toast('这件东西没什么可读的。'); return; }   // 两者皆无：明确说一句（B07 本批数据不出现）
    $('readTitle').textContent = '📖 ' + it;
    $('readBody').innerHTML =
      (desc ? '<p class="rdDesc">' + esc(desc) + '</p>' : '') +
      (text ? nm(text).split('\n').map(p => '<p>' + esc(p) + '</p>').join('') : '');
    $('readModal').classList.remove('hidden');
  }
  function renderBag() {
    const grid = $('bagGrid');
    grid.innerHTML = '';
    D.itemOrder.forEach(it => {
      const meta = D.items[it] || {};
      const owned = Core.hasItem(st, it);
      const desc = Core.itemDesc(it), text = Core.itemText(it);
      const canOpen = owned && (desc || text);   // B07（§2-B141）：可点判据（已获得即有可看内容）
      const d = document.createElement('button');
      d.type = 'button';
      d.disabled = !owned;                     // 没拥有 = 点不开（阅读只针对已获得的东西）
      d.className = 'bagItem' + (owned ? ' owned' : '') + (meta.nosell ? ' nosell' : '') + (canOpen ? ' readable' : '');
      d.title = owned
        ? ((canOpen ? '点开看看 · ' : '') + (meta.nosell ? '红框道具：不可出售' : '可出售（1 枚）'))
        : '还没有获得';
      d.innerHTML = '<div class="biIcon">' + (meta.icon || '❔') + '</div>' +
        '<div class="biName">' + it + '</div>' +
        (desc ? '<div class="biDesc">' + esc(desc) + '</div>' : '') +     // B07：介绍行（全部道具含未获得）
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

  /* ---------- 走投无路（v0.2 卡死保险）：指路面板（B137 更名；四块＝当前目标/已知线索/还差什么/出口） ----------
   * 两处入口（工具栏 #stuckBtn／场景区 #guideFab）→ 同一入口函数（面板打开函数恰一份）；
   * 死局上下文行仅自动弹出（showStuck('dead')）时显示——手动点开＝该行隐藏（§2-B137 入口表）。
   * 面板纯读 st（四块＝Core.guideTarget／guideClues／guideNeeds＋既有两出口），不改存档结构。 */
  const GUIDE_FALLBACK = '（这一关没有设目标清单——随便逛逛吧。）';    // ① 降级句（无 targets——示例关）
  const GUIDE_CLUES_EMPTY = '（还没记住什么——多问问、多看看。）';      // ② 空态句
  const GUIDE_NEEDS_EMPTY = '（这一步没有要凑的东西。）';              // ③ 空态句
  function guideDimLine(text) {
    const d = document.createElement('div');
    d.className = 'guideDim';
    d.textContent = text;
    return d;
  }
  function renderGuidePanel() {
    /* ① 当前目标（Core.guideTarget 单源；无 targets ⇒ 降级句） */
    const gb = $('guideGoal');
    gb.innerHTML = '';
    const goal = Core.guideTarget(st);
    const gd = document.createElement('div');
    gd.className = goal ? 'guideText' : 'guideDim';
    gd.textContent = goal || GUIDE_FALLBACK;
    gb.appendChild(gd);
    /* ② 已知线索（获得先后——与 CLI「线索：」同源同字面） */
    const cb = $('guideClues');
    cb.innerHTML = '';
    const clues = Core.guideClues(st);
    if (!clues.length) cb.appendChild(guideDimLine(GUIDE_CLUES_EMPTY));
    clues.forEach(c => {
      const d = document.createElement('div');
      d.className = 'guideLine';
      d.textContent = c;
      cb.appendChild(d);
    });
    /* ③ 还差什么（当前目标行 need[]——show 不成立者不出；done 成立＝☑） */
    const nb = $('guideNeeds');
    nb.innerHTML = '';
    const needs = Core.guideNeeds(st);
    if (!needs.length) nb.appendChild(guideDimLine(GUIDE_NEEDS_EMPTY));
    needs.forEach(n => {
      const d = document.createElement('div');
      d.className = 'guideLine' + (n.done ? ' done' : '');
      d.textContent = (n.done ? '☑ ' : '☐ ') + n.label;
      nb.appendChild(d);
    });
  }
  function showStuck(dead) {
    const safeId = Core.safeNodeId();
    const node = safeId ? D.nodes[safeId] : null;
    /* 面板首行（原「这里已经没有你能做的事了。……」改稿——更名清单 #5）：仅死局（自动弹出）显示 */
    $('stuckText').textContent = '这里已经没有你能做的事了——别急：看看下面，换个地方想想办法。';
    $('stuckText').classList.toggle('hidden', !dead);
    $('stuckSafeName').textContent = safeId ? (safeId + ' · ' + Core.endDisplayName(nm(node ? node.n : ''))) : '（本关没有配置安全点）';
    renderGuidePanel();
    $('stuckModal').classList.remove('hidden');
  }
  function goSafe() {
    const safeId = Core.safeNodeId();
    $('stuckModal').classList.add('hidden');
    if (!safeId) return;
    const msgs = Core.go(st, safeId).map(t => ({ text: t, kind: Core.textKind(t) }));
    toastGroup(msgs);
    save(); renderAll();
    showFeedback(msgs);
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

    // 校准模式：单击画面 → 显示坐标＋最近任务点；B120：连点两次＝两点定框（figures 轮廓框标定通道）
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
      const line = '场景：<b>' + sc.name + '</b>　坐标：<b>' + x + ', ' + y + '</b>　最近任务点：<b>' + best + '</b>（' + Math.round(bd) + 'px）';
      if (!calibA) {                                        // 第一次点击＝框的左上角
        calibA = [x, y];
        calibDot(x, y);
        $('calibBox').innerHTML = line + '<br>🎯 轮廓框第一点已记（左上）——再点一次＝右下角，给出 figures 数值行。';
        return;
      }
      const box = Core.boxOfPoints(calibA, [x, y]);        // 第二次点击＝右下角 ⇒ [x, y, w, h]（原图像素）
      calibA = null;
      calibRedraw();                                        // 清掉首点标记，重画既有 figures 虚线框（对照）
      calibRect(box, 'calibNew', '[' + box.join(',') + ']');
      $('calibBox').innerHTML = line + '<br>🎯 矩形（原图像素）：<b>[' + box.join(', ') + ']</b>　'
        + '写进 <b>scenes[\'' + sc.id + '\'].figures</b>：<b>{ 角色id: [' + box.join(', ') + '] }</b><br>'
        + '角色 id（按画面里是谁选一个）：' + Object.keys(D.characters).join('／') + '——已登记的轮廓框以虚线显示，标定后改数据（以数据为准）。';
    });
  }

  /* B120（§7.3 标定通道）：C 键两点定框——覆盖卡几何唯一来源＝`scenes[].figures`，标定同 pins 流程。
   * 校准模式下点两次＝框一条轮廓框（左上→右下），屏上直接给出可写进数据的数值行；
   * 已登记的 `figures` 以虚线框显示（新旧对照）；本工具只作测量显示，不自动落库（数据照旧手改）。 */
  let calibA = null;                                        // 框选第一点（原图像素）；null＝等待下一次开框
  function calibLayerEl() {
    let el = document.getElementById('calibLayer');
    if (!el) { el = document.createElement('div'); el.id = 'calibLayer'; el.className = 'calibLayer'; $('stage').appendChild(el); }
    return el;
  }
  function calibRect(box, cls, label) {
    const sc = D.scenes[Core.sceneOf(st)];
    const d = document.createElement('div');
    d.className = 'calibRect ' + cls;
    d.style.left = (box[0] / sc.width * 100) + '%';
    d.style.top = (box[1] / sc.height * 100) + '%';
    d.style.width = (box[2] / sc.width * 100) + '%';
    d.style.height = (box[3] / sc.height * 100) + '%';
    if (label) { const s = document.createElement('span'); s.textContent = label; d.appendChild(s); }
    calibLayerEl().appendChild(d);
  }
  function calibDot(x, y) {
    const sc = D.scenes[Core.sceneOf(st)];
    const d = document.createElement('div');
    d.className = 'calibDot';
    d.style.left = (x / sc.width * 100) + '%';
    d.style.top = (y / sc.height * 100) + '%';
    calibLayerEl().appendChild(d);
  }
  function calibRedraw() {
    const el = calibLayerEl();
    el.innerHTML = '';
    calibA = null;
    if (!calib || !st || !curScene) return;
    Object.entries(D.scenes[curScene].figures || {}).forEach(([cid, b]) => calibRect(b, 'calibFig', cid));
  }

  function toggleCalib() {
    calib = !calib;
    $('calibBox').classList.toggle('hidden', !calib);
    $('sceneWrap').classList.toggle('calib', calib);
    calibRedraw();
    if (calib) $('calibBox').innerHTML = (st && curScene)
      ? '🎯 校准模式（当前场景：' + D.scenes[curScene].name + '）：单击＝坐标＋最近任务点；连点两次＝人物可见轮廓框（figures，左上→右下）。'
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
    $('guideFab').onclick = () => { if (st) showStuck(); };   // B137（§2-B137）：第二入口——与工具栏同一入口函数（面板打开函数恰一份）
    $('stuckSafe').onclick = goSafe;
    $('stuckRestart').onclick = () => { $('stuckModal').classList.add('hidden'); restart(); };
    $('bagBtn').onclick = () => { renderBag(); $('bagModal').classList.remove('hidden'); };
    $('saveBtn').onclick = () => { if (st) openSaveModal(curLevelId, 'play'); };   // B136：工具栏 💾（局内入口）
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
    bindCg();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
