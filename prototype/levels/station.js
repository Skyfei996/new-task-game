/* ============================================================================
 * 《空间站大停摆》关卡数据（原创 L1 · 你有一个新任务！）
 * ----------------------------------------------------------------------------
 * 规格来源：docs/design-station-v1.md（立项/世界观/三幕剧情/防卡死规则）
 *           docs/design-station-nodes.md（45 个任务点的网络与规格，逐条照做）
 *
 * 数据形态与示例关卡（levels/dalim.js）完全一致：顶层 meta/scenes/start/resources/
 * items/characters/help/nodes。引擎（engine.js v0.2）按本文件驱动一切。
 *
 * 场景（**21 条**＝四楼层／站外＋十七间内景；编号即任务点号——房间沿用同层编号）：
 *   deck1 顶层生活区（1 食堂·2 睡眠舱·3 医务室·4 健身房·5 观景厅·18 中央大厅）
 *   deck2 中层工作区（6 指挥舱·7 实验室·8 通讯舱·9 站长室·10 仓库·11 气闸舱·20 中央大厅）
 *   deck3 底层核心区（12 反应堆舱·13 冷却塔·14 服务器机房·15 太阳能控制室·16 维修区·17 应急逃生舱·21 中央大厅）
 *   exterior 站外（19 太阳能板阵列）——场景图＝T04 成图 images/station/eva-v1.jpg（2026-10-03 入库并切换；
 *   实测 1792×1121）；19 号 pin＝按成图实测校准（下侧太阳能板阵列蓝区质心；B114）
 *   room-* 内景（B119 · 2026-10-04）：**十七间全部接线（T10~T26）**＝1~17 号房各自的内景切图目标
 *   （老板 2026-10-04 裁「并批」：首轮 5 间＋P2a 7 间＋P2b 5 间；口径＝`design-station-v1.md` §4.1）；
 *   场景注册前置＝该房图已入库；「未注册⇒不换图（维持本层 deck，零降级）」回退机制仍在，改由合成场景机检验证。
 *
 * 45 点网络（docs/design-station-nodes.md §5）落点说明：
 *   1~21 地点 / 22~40 事件 / 41~43 三个结局 / 45 保险柜事件 = 本文件 nodes 里的节点；
 *   44（氧气耗尽）= 唯一的失败结算，由 resources[].fail 承载（fail.node = 44，
 *   引擎在氧气归零时自动走进去，复用现有失败界面）；星币 fail: null —— 花光只到 0，不判失败。
 *
 * B02（2026-10-02）：按 `design-station-nodes.md` §9.5 B01~B39 落机制（条件 / lockIf / once / 去向 / 代价），
 *   逐句文案以 `station-story-bible.md` §7 为准（照抄区）；引擎新增 E11 `battle.loseSay`、E12 `lockIf`。
 * B02-QA 修正轮（2026-10-02）：按 §9.5 B40~B59 + bible §7（v1.7）落 QA 裁定——12 号收贿态修复（③ lockIf 复合谓词、
 *   ④ 全态出口）、41/43 分版 tIf、乘员表/帮助文案、名词统一（维修爬道／焊接枪）。
 * B03（2026-10-02，置灰哲学推翻 + 界面批 + 真人线轮）：按 `design-station-nodes.md` §9.7.2 总表（45 行）逐条重做——
 *   「可尝试＝成事＋失败双条目（失败条 say＋原地、零代价、不可刷）／隐藏＝cond 不足即不显示」；
 *   `lock`／`lockIf`／`lockText` 全关归零（引擎能力保留，示例关 dalim.js 仍用 lock）；
 *   B65~B77：9① 开柜 −10（短线校正）、三厅复访短提示（B66）、劳动文案三段（B67）、复电版世界更新（B74）、
 *   持芯片识别版（B73）、查单 once＋线索（B72）、委托去线索化（B71）、四④ 前置改「掰过手腕」（B70）、
 *   武力构成帮助行（B69）、打工动机（B75）、糖糖披露理由（B76）、币种字面（B77＝引擎/工具面）。
 *   文案照抄件＝`station-story-bible.md` §7（v2.3，引号内直抄）。
 * B04（2026-10-03，界面与视觉批；口径＝`docs/design-ui-v1.md`）：只加**呈现面数据**，剧情语义/条件/数值零改动——
 *   浮现图注册表 `moments` ＋ 19 节点 `moments`/`mIf`（两层制 L2，§7.3/§7.4/§7.5）、`chars` 补登记 6 处（§7.6）、
 *   `characters[].img`（图鉴/人物条真头像，缺图回落 emoji）、`help` 全文换新稿（§8.1 照抄）；
 *   光环位按关卡停用判据＝本关是否有 `moments`（站关撤下、示例关 dalim 沿用——引擎面，不在本文件）。
 * B04 内景接线（B119 · 2026-10-04；口径＝`design-station-v1.md` §4.1）：十七间内景全部注册 `scenes['room-*']`
 *   ＋房节点 `scene` 绑定（既有字段，零引擎新字段）；每房 pins＝出口 pin（本层大厅）＋房内交互点（1~3，见各房注释）；
 *   大厅 18/20 与 22 号显式声明楼层场景（出口 pin 令大厅编号多点命中，显式声明保住「回大厅切层图」）；
 *   房间相关浮现图锚点同批重标（对 room 图）。
 * B04 同框覆盖轮（B120 · 2026-10-04；口径＝`docs/design-ui-v1.md` §7.3）：数据面唯一新增＝`scenes[].figures`
 *   （5 房 6 条：常驻角色可见轮廓框）；同框的 6 张浮图去 `at`／`w`（几何唯一来源＝figures——先标定后删值，同批）；
 *   卡面＝轮廓框每侧外扩 max(12, 该边×8%)；laobu-point（T72）到货按同口径注册（轮廓框已在 room-lab）。
 * B04 表现体系定稿轮（B121/B122/B125 · 2026-10-04；口径＝`docs/design-ui-v1.md` §7.10/§7.11 与
 *   `design-station-v1.md` §4.1）：① `scenes['room-*'].variants`＝背景状态变体（7 间——先匹配者为准、
 *   同尺寸同构图、缺图回落基础图；T73~T79 图未到＝注册先行、到货即生效）；② 节点 3 `mIf` 改空集
 *   （pinsAll 24 ⇒ 不显示 L2——状态由变体 `medbay-awake` 承担，§7.11「与 L2 的收窄」）；
 *   ③ 每房补自指 pin `pins[<本房节点号>]`（B125：17 房无例外；B128 起渲染/开孔用途退场——数据保留为校准锚点，见复盘轮条）；
 *   标记载体、点击＝空操作；坐标为**暂定值**，随 C 键手标校准回填）。
 * B04 扩图批到货注册轮（B126 · 2026-10-04；口径＝`docs/design-ui-v1.md` §7.4.1 到货登记表）：
 *   16 张浮现图（T57~T72）到货即注册（注册集＝到货集）；对象时刻＝节点默认集；与背景变体同实体者挂 mIf
 *   （safe-open@9／firstaid-open@4／pods-check@17）；robot-rescue@37（16 本体不注册——防双现）；
 *   39→'exterior'／29→'room-reactor' 两处场景声明；T73 `medbay-awake` 的 `figures` 同批标定回填（§7.3）。
 * B04 晨 试玩系统复盘轮（B127~B131 · 2026-10-04；口径＝`docs/design-ui-v1.md` §6.5~§6.7／§7.7-13~16／§7.12、
 *   `design-station-v1.md` §4.1／§7-E27·E28）：① 浮窗判据三层——时刻性／窗口（收窗行）／首访一次（`node.mOnce`）：
 *   节点 1／2 加 `mOnce`；6 条收窗行（4／8／11／12×2／19）；撤注册 5 条（win-observation-jupiter／win-airlock-array／
 *   firstaid-open／robot-rescue／pods-check——注册集 36→31）；② 数字圈「可点＝显示、不可点＝隐藏」（房间/站外只渲染
 *   可点——引擎面；自指 pin 收为校准锚点：渲染/开孔用途退场）；③ 遮罩楼层图专属（17 房＋站外 `mask:false`）；
 *   ④ 舱外两条：19 号 `mIf` 收窗（`太阳能板已修好` ⇒ []）＋39 号删 `moments`／删冗余选项①
 *   （「再看一眼新面板。」→19；只留「爬回气闸舱」）。
 * B04 午 撤调暗＋CG 整屏层轮（B130 重订／B132 · 2026-10-04 午；口径＝`docs/design-ui-v1.md` §2-B130／§6.7、
 *   `design-station-v1.md` §7-E28）：① 撤调暗——全站（含开局断电期）一律**正常亮度**：删 `meta.sceneDim`＋17 房
 *   `dim`（引擎求值／样式 token 同批清零；示例关与站关同口径）；② CG 整屏层——7 节点 `cg`（3／5／34／35／41／42／43；
 *   `once`＝{3／5}、`dismiss:'keep'`＝{41／42／43}）＋序章图走既有 `meta.prologue.image`；呈现／生命周期／兜底／
 *   读档归一＝`design-ui-v1.md` §6.7（引擎面）。
 * B05 轮（B135／B136 · 2026-10-06；口径＝`docs/design-ui-v1.md` §6.7／§8.1）：① 结局与失败整屏图补齐——29 号增
 *   `cg`（T80 `defeat-ambush`；`dismiss:'keep'`＝与三结局同档常驻）＋撤浮图 `sangni-ambush`（T71 留档，§7.12 行 34）；
 *   44 号＝条件件（T81 未获批 ⇒ 无 `cg`）；41／42／43 不动。② 帮助增第 12 条（存档/读档行）＝11→12 条。
 * B06 轮（B137~B139 · 2026-10-06；口径＝`docs/design-ui-v1.md` §2-B137~B139、`design-station-v1.md` §7-E30~E32）：
 *   ① B137 指路面板——`meta.targets` 目标阶梯表（6 行：R1~R5＋兜底；先匹配者为准；`need[]` 的 `show` 门＝
 *      「只显示已知」的落点）；帮助第 11 条改写为「🧭 指路」（随时能点＋四块名目；条数仍 12——不抢 B05 第 12 条）、
 *      第 9 条图标 🧭→👉（与指路图标消重）；② B138 地图点名字／B139 已探索分楼层＝引擎通用（本文件零数据——
 *      行为变化=已到过点显示名／已探索按楼层分组，披露在案）。
 * B08 轮（B142／B143 · 2026-10-06；口径＝`docs/design-ui-v1.md` §2-B142／B143、`design-station-v1.md` §7-E34／E35）：
 *   ① `meta.notes` 指路记录表（线索 16＋记录 19——文案＝`station-story-bible.md` §7.48 照抄区）；② 帮助第 11 条再改写
 *   （三块名目＋小圆点＋点开详情＋「出口在 💾」——B06 版「四块名目」句随之作废；条数仍 12）；③ 8① `once` 具名化
 *   `'对过货单'`（E6——供 rec-08 完成态查询；选项隐藏行为不变）。面板Ⅱ（出口迁 💾／底部「确认」）＝引擎面。
 * B09 轮（B144~B147＋⑦ · 2026-10-06；口径＝`docs/design-ui-v1.md` §2-B144~B147、`design-station-v1.md` §8.2）：
 *   ① 结算奖励字段与奖励框一并删除（无下一关——失效即删；B144；结算面改出多结局提示＝引擎面）；
 *   ② `meta.targets` 的 `need` 退役、③块数据＝`meta.tasks`（3 行——文案＝`station-story-bible.md` §7.49；B146）；
 *   ③ rec-06 完成稿补便条线头（B145）；④ 资源三档（氧气 500/200/80、星币 25/20/15——B147）＋帮助第 1／2 条改写；
 *   ⑤ 10 号 `tIf` 第四条（持监控回放呼应版——老板⑦；置末、不遮前三条）。
 * B03 复检收口轮（2026-10-03）：B78 星币数字（引擎/工具面）；B79 27 号赢家当场兑现；B80 战斗构成行（引擎/工具面）；
 *   B81~B98 逐条文案（照抄件升级＝bible §7 v2.5）；B99 28 号发生场景 scene:'deck2'；真人线 R2 四修：
 *   ① --player 无编号（工具面）/ ② 16·14·17 复访写回 / ③ 24 持卡衔接 / ④ 12③ 自指（门票只收一次）——自写文案见批次档 §5。
 *
 * 数值定值已在本文件落地（设计档 §8.1/§8.2；见文件末「数值表」注释块）。
 * ==========================================================================*/
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;
  G.LEVELS = G.LEVELS || {};   // 关卡注册表

  G.LEVELS['station'] = {
    meta: {
      title: '空间站大停摆',
      level: '你有一个新任务！· 原创 L1',   // 副标题（关卡选择卡片显示）
      note: '原创关卡 L1：木星轨道的空间站「晨星号」。',
      poster: '../images/station/station-map-ai-v1.jpg',   // 关卡海报＝L0 总览图用法（站外场景图另配＝scenes.exterior：T04 成图）
      tagline: '木星轨道的「晨星号」突然断电——在氧气耗尽前重启反应堆，并揪出搞鬼的人。',
      /* 序章（R01/E2）：新局开场整屏显示一次；{me} 替换成玩家名；读档不重放。
       * B132（§6.7）：序章图＝CG-08（T35）走**既有** `meta.prologue.image` 图位（E2 既有能力），零新机制。 */
      prologue: { image: '../images/station/cg/prologue-scene.jpg', lines: [
        '你是{me}，趁暑假来『晨星号』实习的小孩，今天是第七天。',
        '晚餐刚端上桌，灯"啪"地全灭了；警报小声说：空气在漏。',
        '兜里还有实习攒下的星币——在站上，它能换吃的，也能换点小工具。',
        '赶在氧气用光前点亮反应堆——还有，看看是谁干的。'
      ] },
      safeNode: '18',   // 走投无路时的安全点：顶层中央大厅（电梯口、四通八达）
      /* B144：结算奖励字段与结算奖励框一并删除（无下一关——失效即删）；结算面改出多结局提示（`.endMore`——引擎面）。 */
      /* 收编的维修机器人助战：知道「机器人小帮手」= 武力 +1（设计档：37 号后续战斗 +1 武力） */
      atkFromClues: { '机器人小帮手': 1 },

      /* ==========================================================================================
       * B137（§2-B137 · 2026-10-06）：指路面板·目标阶梯表（数据面唯一新增第 11 项 meta.targets）
       *   规则：按数组顺序取第一条 cond 命中行（先匹配者为准；cond 缺省＝恒真——兜底行置末）；
       *   text＝玩家向目标一句话（分级提示：不写解法／数字／道具名／发现面名词）；B146 起本节只含 `{ cond?, text }`
       *   （`need` 退役——「还差什么」清单＝`meta.tasks`）。
       *   条件语言＝既有 Core.condOk（零新谓词）；文案＝docs/design-ui-v1.md §2-B137 表逐字（六态探针见 test.station.mjs §24）。
       * ======================================================================================== */
      targets: [
        /* R1：反应堆已重启——最后一件事 */
        { cond: { knows: '反应堆已重启' },
          text: '反应堆亮了——去应急逃生舱口，把最后的事收个尾。' },
        /* R2：全站复电——去点亮反应堆（B146：`need` 退役——「还差什么」＝`meta.tasks` 任务清单 t-reactor） */
        { cond: { knows: '全站复电' },
          text: '电回来了——去反应堆舱，把它点亮。' },
        /* R3：太阳能板已修好——回站复电（指「底层」——电梯选项已出现） */
        { cond: { knows: '太阳能板已修好' },
          text: '电有来源了——回站里，去底层把主供电推上去。' },
        /* R4：到过太阳能控制室或站外——外部阵列那一路断了（中性指代；15/19 两态正文各自成立） */
        { cond: { any: [{ pinsAll: ['15'] }, { pinsAll: ['19'] }] },
          text: '电还差一截——外部阵列那一路断了，去把它接上。' },
        /* R5：到过指挥舱或到过 23——三件清单已知（B146：`need` 退役；四项清单＝`meta.tasks` t-reactor） */
        { cond: { any: [{ pinsAll: ['6'] }, { pinsAll: ['23'] }] },
          text: '重启反应堆要三样东西，还得先把电力找回来。' },
        /* R6：兜底（cond 缺省＝恒真——末行） */
        { text: '先摸清站里的状况——找找能用的东西，听听大家都是怎么说的；把反应堆点亮，才是正事。' }
      ],
      /* B146（§2-B146 · 2026-10-06）：任务清单（数据面唯一新增第 14 项 `meta.tasks`——③块「还差什么」的数据源）：
       *   `{ id, name, show?, done?, need: [{ label, done, show? }] }`——数组序＝渲染序；`show` 不成立 ⇒ 该任务不出
       *   （「只显示已知」）、`done` 成立 ⇒ 整条不出（已收尾不占位）；`need[].done` 成立 ⇒ ☑（缺省 ☐）；
       *   条件语言＝既有 Core.condOk（零新谓词）；缺省无表 ⇒ ③块空态。任务名与 need 标签逐字＝
       *   `station-story-bible.md` §7.49 照抄区（勿改）；`meta.targets` 的 `need` 字段自 B146 起退役。 */
      tasks: [
        { id: 't-reactor', name: '点亮反应堆',
          show: { any: [{ pinsAll: ['6'] }, { pinsAll: ['23'] }, { item: '控制芯片' }, { item: '冷却剂罐' }, { item: '站长授权卡' }, { knows: '全站复电' }] },
          done: { knows: '反应堆已重启' },
          need: [
            { label: '控制芯片', done: { item: '控制芯片' } },
            { label: '冷却剂罐', done: { item: '冷却剂罐' } },
            { label: '站长授权卡', done: { item: '站长授权卡' } },
            { label: '电力', done: { knows: '全站复电' } }
          ] },
        { id: 't-power', name: '把电力找回来',
          show: { any: [{ pinsAll: ['6'] }, { pinsAll: ['23'] }, { pinsAll: ['15'] }, { knows: '太阳能板已修好' }] },
          done: { knows: '全站复电' },
          need: [
            { label: '外部阵列那一路（站外的太阳能板）', done: { knows: '太阳能板已修好' }, show: { any: [{ pinsAll: ['15'] }, { pinsAll: ['19'] }] } },
            { label: '带上能焊的工具（焊接枪或机械手套）', done: { any: [{ item: '焊接枪' }, { item: '机械手套' }, { knows: '机器人小帮手' }] }, show: { pinsAll: ['19'] } },
            { label: '回控制室，把主供电推上去', done: { knows: '全站复电' }, show: { any: [{ pinsAll: ['15'] }, { knows: '太阳能板已修好' }] } }
          ] },
        { id: 't-yinhe', name: '追上银河',
          show: { chDone: '跟胖胖打过招呼' },
          done: { item: '桑尼的账本' },
          need: [
            { label: '带上那罐鱼罐头', done: { item: '站猫罐头' } }
          ] }
      ],
      /* B08（§2-B143 · 2026-10-06）：指路记录表（数据面唯一新增第 13 项 meta.notes——唯一清单见 design-ui-v1.md §0）
       *   条目两种：clue＝{ id, kind, key, text, src }（key＝learn 值逐字——标题与 CLI「线索：」同源同字面；全关 16/16 双向覆盖）；
       *   record＝{ id, kind, cond, title, text, done?, doneText?, src, doneSrc? }（cond／done＝既有条件语言——Core.condOk；
       *   doneText 缺省沿用 text）；src／doneSrc＝素材出处节点（机检④ L5 归属核与数字可溯用；表注多节点者取首见节点）。
       *   文案＝`station-story-bible.md` §7.48 照抄区（逐字，勿改）；渲染＝②块（记录组按本数组序＝节点号升序；线索组按 st.learned 键序）。 */
      notes: [
        /* 线索组 16 条（id／key＝learn 值逐字／点开详情／素材出处） */
        { id: 'clue-01', kind: 'clue', key: '走私暗号', src: '22', text: '走廊深处那通压着嗓子的电话——『货在仓库，别让人靠近。按原计划，灯一灭就动手。』打电话的人袖口上，有一道『货运』臂章。' },
        { id: 'clue-02', kind: 'clue', key: '阿雅的提醒', src: '3', text: '阿雅说：站长从来不留那些门路；站里的事，维修机器人糖糖都记在芯里——它就在指挥舱。' },
        { id: 'clue-03', kind: 'clue', key: '货单被改过', src: '8', text: '货单上『猫粮』那一栏被人改成了『矿石』——字迹很急，改得歪歪扭扭。' },
        { id: 'clue-04', kind: 'clue', key: '已广播集合', src: '8', text: '你对着全站广播喊过话：带上能带的东西，准备撤离。喊完之后，远处有几扇门『吱呀』响了一声——有人动身了。' },
        { id: 'clue-05', kind: 'clue', key: '糖糖是帮手', src: '23', text: '糖糖把站里的门道教给了你：检修口的盖子怎么开、顺着管子怎么走。它说，站长交代过——真出了事，就把柜子里的备用卡交给还没放弃的人。' },
        { id: 'clue-06', kind: 'clue', key: '保险柜密码', src: '23', text: '站长室的保险柜，密码是 0325——是糖糖帮站长设的；柜子里锁着一张备用的站长授权卡。' },
        { id: 'clue-07', kind: 'clue', key: '铁头已开门', src: '27', text: '铁头把仓库和站长室的门都给你开了——他说，缺什么喊他一声。' },
        { id: 'clue-08', kind: 'clue', key: '机器人小帮手', src: '37', text: '你从货架底下救出来的维修机器人，认准了你，从此跟着你——打架的时候，它给你多一分底气。' },
        { id: 'clue-09', kind: 'clue', key: '太阳能板已修好', src: '39', text: '那片被太空碎片砸破的面板补好了——电流顺着缆线往站里跑，站里的灯，应该亮起来了。' },
        { id: 'clue-10', kind: 'clue', key: '全站复电', src: '36', text: '闸门推上去的一瞬间，整座站『活』了过来：灯一盏一盏亮起，走廊里的风声、水泵声，还有人哼歌的声音，全回来了。' },
        { id: 'clue-11', kind: 'clue', key: '反应堆已重启', src: '34', text: '堆芯亮了起来——蓝白色的光顺着管道爬满走廊，仪表盘上的数字一个一个跳回绿色。' },
        { id: 'clue-12', kind: 'clue', key: '维修爬道路线', src: '16', text: '检修口的盖子打开了，这条路你走通了——顺着管子爬上去，另一头是实验室。' },
        { id: 'clue-13', kind: 'clue', key: '逃生舱检查过', src: '17', text: '三枚逃生舱按检查表挨个查过了——检查表的三个格子，都打上了勾。' },
        { id: 'clue-14', kind: 'clue', key: '收了桑尼的贿赂', src: '33', text: '桑尼塞给你一把星币，说『反应堆舱那边，你就别去了』——这钱揣在兜里，比看上去的还要沉。' },
        { id: 'clue-15', kind: 'clue', key: '桑尼翻脸了', src: '31', text: '你抱起冷却剂的时候，桑尼打了个响指——无人机撞开货箱，滚出来的全是亮晶晶的矿石；你的星币，也被顺走了一把。' },
        { id: 'clue-16', kind: 'clue', key: '桑尼认栽了', src: '32', text: '账本摊在货箱上，桑尼泄了气，一脚踢开箱子——『拿一块走吧。账本的事……就当没发生过。』' },
        /* 记录组 19 条（节点号升序；cond＝出现门；done 成立 ⇒ 未完成→已完成、doneText 替换 text） */
        { id: 'rec-01', kind: 'record', cond: { pinsAll: ['1'] }, src: '1',
          title: '食堂：胖胖要搭把手', text: '灯灭时，厨师胖胖喊你先别慌——他问谁搭把手把碗洗了，工钱照给。墙角那台旧贩卖机收星币，能换吃的，也能换点小工具。' },
        { id: 'rec-02', kind: 'record', cond: { pinsAll: ['2'] }, src: '2',
          title: '睡眠舱：应急包', text: '柜门卡得死紧——你咬着牙把它拽开，摸到了里面的工牌、手电，还有一支满气的氧气瓶。' },
        { id: 'rec-03', kind: 'record', cond: { pinsAll: ['3'] }, done: { pinsAll: ['24'] }, src: '3', doneSrc: '24',
          title: '医务室：阿雅需要医疗包', text: '医官阿雅在给床上的人换冰袋——是受伤的站长伊莲娜；她需要医疗包，健身房的急救箱里有一个。',
          doneText: '阿雅忙了半个小时，站长终于睁开眼睛——她把备用的站长授权卡塞进你手里：去把它点亮。' },
        { id: 'rec-04', kind: 'record', cond: { pinsAll: ['4'] }, done: { chDone: '急救箱开过' }, src: '4', doneSrc: '4',
          title: '健身房：墙上的急救箱', text: '墙上的急救箱扣得死紧，一个人弄不下来——撬开它得费不少力气。',
          doneText: '急救箱卸下来了——里面躺着一只医疗包。' },
        { id: 'rec-05', kind: 'record', cond: { pinsAll: ['4'] }, done: { knows: '铁头已开门' }, src: '4', doneSrc: '27',
          title: '健身房：铁头的挑战', text: '安保队长铁头管着站里的安全门——他问你敢不敢掰手腕。',
          doneText: '铁头把仓库和站长室的门都给你开了，还塞给你一双机械手套。' },
        { id: 'rec-06', kind: 'record', cond: { pinsAll: ['5'] }, done: { chDone: '跟胖胖打过招呼' }, src: '5', doneSrc: '5',
          title: '观景厅：银河守着零食袋', text: '窗外的木星像一颗巨大的糖果。沙发后面，站猫银河蹲在一只鼓鼓的零食袋上——它只吃真鱼，对合成粮闻都不闻。',
          doneText: '袋子上贴着胖胖的便条——里头是一盒合成料理，和一罐真的鱼罐头。便条上还写着：『谁找到这袋零食，算谁的——帮我哄哄银河，它最近老往仓库跑。』' },
        { id: 'rec-07', kind: 'record', cond: { pinsAll: ['7'] }, done: { pinsAll: ['38'] }, src: '7', doneSrc: '38',
          title: '实验室：老布的工具箱', text: '总工程师老布的宝贝工具箱不见了——他指着天花板的检修口说：顺着管子下去，一直通到最底层。',
          doneText: '工具箱找回来了——老布把一枚控制芯片塞进你的手心。' },
        { id: 'rec-08', kind: 'record', cond: { pinsAll: ['8'] }, done: { chDone: '对过货单' }, src: '8', doneSrc: '8',
          title: '通讯舱：被改过的货单', text: '控制台角落，一张货单被翻得乱七八糟——有人用笔改过上面的字。',
          doneText: '对上了！账本里的货一笔一笔全对得上——矿石，就藏在货箱里偷运；货单上那一栏被改成『矿石』。' },
        { id: 'rec-09', kind: 'record', cond: { pinsAll: ['9'] }, done: { chDone: '开过保险柜' }, src: '9', doneSrc: '45',
          title: '站长室：锁着的门与保险柜', text: '站长室的门锁着，门边的读卡器还通着电；隔着门上的小窗，能看见墙角的保险柜指示灯一闪一闪。',
          doneText: '保险柜开了——厚绒布上躺着一张备用的站长授权卡，旁边压着一张折起来的便条。' },
        { id: 'rec-10', kind: 'record', cond: { pinsAll: ['10'] }, src: '10',
          title: '仓库：桑尼与货架', text: '货运主管桑尼笑眯眯地挡在货架前面；他身后的冷却剂罐上缠着锁链，脚下的箱缝里，露出几块亮晶晶的矿石。' },
        { id: 'rec-11', kind: 'record', cond: { pinsAll: ['11'] }, done: { chDone: '取了磁力靴' }, src: '11', doneSrc: '11',
          title: '气闸舱：安保柜与出舱', text: '墙上的安保柜没锁——里面有一双磁力靴和一支电击棒；舷窗外，太阳能板阵列一闪一闪。',
          doneText: '安保柜空了。透过舷窗往下看，太阳能板阵列在木星的阴影里一闪一闪。' },
        { id: 'rec-12', kind: 'record', cond: { pinsAll: ['12'] }, done: { knows: '反应堆已重启' }, src: '12', doneSrc: '12',
          title: '反应堆舱：冷下来的堆芯', text: '冷下来的堆芯像一颗熄灭的太阳；三个接口空着，接口旁的铭牌刻着各自要接的东西。',
          doneText: '堆芯亮着——三个接口都插好了，卡扣咬得紧紧的；嗡鸣声顺着地板传上来。' },
        { id: 'rec-13', kind: 'record', cond: { pinsAll: ['13'] }, src: '13',
          title: '冷却塔：白汽里的总阀', text: '管道缝里滋滋地冒着白汽；总阀就在正中间，对面的挂架上，像是放着什么。' },
        { id: 'rec-14', kind: 'record', cond: { pinsAll: ['14'] }, done: { item: '监控回放' }, src: '14', doneSrc: '14',
          title: '服务器机房：横在门口的机器人', text: '机柜的灯一闪一闪，一台安保机器人横在门口——它胸口的调令牌，是一张空白牌。',
          doneText: '那台安保机器人退到了一边——它不再拦你，红眼睛暗着。' },
        { id: 'rec-15', kind: 'record', cond: { pinsAll: ['15'] }, done: { knows: '全站复电' }, src: '15', doneSrc: '15',
          title: '太阳能控制室：推不动的主供电', text: '一排排闸门像钢琴的琴键；写着『主供电』的那一个推不动——配电盘上，『外部阵列』那一路红灯还亮着。',
          doneText: '主供电闸门推到顶了——指示灯一排排绿着，电流的嗡嗡声沿着地板传出去。' },
        { id: 'rec-16', kind: 'record', cond: { pinsAll: ['16'] }, done: { knows: '机器人小帮手' }, src: '16', doneSrc: '37',
          title: '维修区：货架下卡住的机器人', text: '一台维修机器人卡在货架底下——轮子空转着，胸口的电池灯红红地闪：它快没电了。',
          doneText: '机器人认了你，从此跟着你转——它叫『小帮手』。' },
        { id: 'rec-17', kind: 'record', cond: { pinsAll: ['17'] }, done: { knows: '逃生舱检查过' }, src: '17', doneSrc: '17',
          title: '应急逃生舱：检查表与应急柜', text: '三枚金色胶囊安静地悬在发射轨道上；检查表上，三个格子还空着。墙边的应急柜里，绳索和一面应急盾码得整整齐齐。',
          doneText: '三枚胶囊都查过了——检查表上，三个格子都打上了勾。' },
        { id: 'rec-18', kind: 'record', cond: { pinsAll: ['19'] }, done: { knows: '太阳能板已修好' }, src: '19', doneSrc: '39',
          title: '站外：破了个洞的太阳能板', text: '木星在脚下慢慢地转；一片面板被太空碎片砸出一个大洞，边缘还冒着细碎的火花。',
          doneText: '面板补好了——电流顺着缆线往站里跑；站里的灯，应该亮起来了。' },
        { id: 'rec-19', kind: 'record', cond: { pinsAll: ['28'] }, done: { item: '桑尼的账本' }, src: '28', doneSrc: '28',
          title: '追猫：叼着小本子的银河', text: '你一路追到货箱边——银河嘴里叼着一本皱巴巴的小本子，封面写着『货运登记』四个字。',
          doneText: '鱼罐头刚打开，银河就松了嘴——本子到手了。' }
      ]
    },

    /* 场景表：图片路径 / 原图尺寸 / 编号坐标（原图像素，检测脚本 + 人工复核） */
    scenes: {
      deck1: {
        id: 'deck1', name: '晨星号 · 顶层生活区', label: '顶层',
        image: '../images/station/deck1-v1.jpg', width: 1792, height: 1121,
        pins: { '1': [358, 404], '2': [1021, 235], '3': [1452, 404], '4': [412, 729], '5': [1416, 751], '18': [896, 504] }
      },
      deck2: {
        id: 'deck2', name: '晨星号 · 中层工作区', label: '中层',
        image: '../images/station/deck2-v1.jpg', width: 1792, height: 1121,
        pins: { '6': [340, 336], '7': [950, 224], '8': [1523, 336], '9': [340, 695], '10': [860, 740], '11': [1416, 673], '20': [896, 471] }
      },
      deck3: {
        id: 'deck3', name: '晨星号 · 底层核心区', label: '底层',
        image: '../images/station/deck3-v1.jpg', width: 1792, height: 1121,
        pins: { '12': [466, 269], '13': [950, 247], '14': [1452, 359], '15': [305, 594], '16': [788, 807], '17': [1308, 717], '21': [896, 504] }
      },
      /* 站外（B114，2026-10-03 老板试玩验收切换）：场景图＝T04 成图 `images/station/eva-v1.jpg`（1792×1121；入库＝父侧执行）；
       * 19 号 pin＝按成图实测校准（右侧下片太阳能板阵列蓝区质心 [1505,778]，实测口径/窗口见 test.station.mjs §2 注释）；
       * 旧值 [760,700]（对 1520×1400 占位图）作废。 */
      exterior: {
        id: 'exterior', name: '晨星号 · 站外（太阳能板阵列）', label: '站外',
        image: '../images/station/eva-v1.jpg', width: 1792, height: 1121,
        mask: false,   // B129（§6.6）：遮罩只属楼层图——站外整图直接可看（无开孔、无「灰暗区域」提示）
        pins: { '19': [1505, 778] }
      },

      /* —— 内景（B119 · 口径＝`design-station-v1.md` §4.1；注册前置＝图已入库 `images/station/rooms/`）——
       * id＝`room-<name>`（name＝交付文件名段）；label＝**所属层**（左上角标仍显示楼层）；
       * width/height＝成图实测原像素（JPEG 头实测，与入库图逐字一致）。
       * pins＝出口 pin（本层大厅 18/20/21，锚在图中舱门/出口构件）＋房内交互点（该房可见选项的可达目标、
       *   图上有对应构件者；纯文本/自指选项不标 pin——不造图不新增语义）；
       *   自指 pin（B125；B128 口径收窄）——键＝**本房节点号**，每房必有（17 房无例外）：
       *   渲染面按 B128——房间只渲染**可点**编号圈（自指 pin 不可点 ⇒ 不渲染）；不承担「你在这里」标记与遮罩开孔
       *   （房间无标记、无遮罩——§6.5/§6.6）；数据保留为**校准锚点**（C 键「最近任务点」读值）。
       * mask＝**遮罩开关**（B129 · `design-ui-v1.md` §6.6）：缺省 true＝现行遮罩；房间/站外 `false`（整图直接可看、无开孔）。
       * variants＝**背景状态变体**（B122 · `design-ui-v1.md` §7.10；`[{cond,image,width,height,figures?}]`）：
       *   先匹配者为准、命中行完整替换 image/width/height/figures；同尺寸同构图；缺图回落基础图（一行告警）；
       *   `figures: {}`＝该状态无同框面（不回落基础表）。
       * figures＝**常驻角色可见轮廓框**（B120 · 口径＝`design-ui-v1.md` §7.3；键＝characters 键、
       *   值＝[x,y,w,h] 原图像素）：L2 浮现图指向本场景已画角色（同框）⇒ 以覆盖卡渲染（卡面 ⊇ 轮廓框
       *   每侧外扩 max(12, 该边×8%)）——几何唯一来源＝本表（覆盖图不再写 at／w，先标定后删值同批）；
       *   标定＝C 键校准两点定框（左上→右下，屏上给出数值行）；无角色房间不登记（＝无同框面）。
       * 坐标为**暂定值**：按成图目测取值（依据逐条注在行内），待老板试玩回报／C 键手标校准后回填。 */
      'room-galley': {
        id: 'room-galley', name: '晨星号 · 食堂', label: '顶层',
        image: '../images/station/rooms/galley.jpg', width: 1660, height: 948,
        mask: false,   // B129（§6.6）：无遮罩（整图直接可看；楼层图另论）
        figures: { pangpang: [880, 205, 160, 225] },   // B120：胖胖（灶台后）可见轮廓框——目测初值，待标定
        pins: { '18': [1330, 690],    // 出口＝右下拱门洞（目测：门洞内缘中心——「摸黑去中央大厅」）
                '1': [640, 660] }     // B125 自指 pin（暂定·目测）：长餐桌一带地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-sleep': {
        id: 'room-sleep', name: '晨星号 · 睡眠舱', label: '顶层',
        image: '../images/station/rooms/sleep.jpg', width: 1660, height: 948,
        mask: false,
        pins: { '18': [830, 850],     // 出口＝画面下缘门框中线（目测：铺位前通道口——「回中央大厅」）
                '2': [560, 560] }     // B125 自指 pin（暂定·目测）：睡眠舱排前地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-medbay': {
        id: 'room-medbay', name: '晨星号 · 医务室', label: '顶层',
        image: '../images/station/rooms/medbay.jpg', width: 1660, height: 948,
        mask: false,
        figures: { aya: [455, 145, 235, 515],          // B120：床边阿雅——目测初值，待标定
                   yilanna: [690, 255, 195, 180] },    // B120：床上伊莲娜（卧姿可见段）＝基础图留守回落值；苏醒态由变体 figures 承担（T73 已标定）
        /* B122（§7.10/§7.11-T73）：站长已醒（pinsAll 24）⇒ L1 背景切「靠床头坐起」版（T73 免验收直入）；
         * 缺图 ⇒ 运行期回落基础图（零降级）；变体 figures＝苏醒姿轮廓框（B126：T73 到货同批标定回填——
         * §7.3 同框面表第 3 行「＝变体 medbay-awake 的 figures」；数据以标定值为准，C 键通道保留）。 */
        variants: [ { cond: { pinsAll: ['24'] }, image: '../images/station/rooms/medbay-awake.jpg', width: 1660, height: 948,
                      figures: { yilanna: [695, 190, 230, 245] } } ],
        pins: { '18': [1330, 860],    // 出口＝右下门内地面（目测：门洞地面中线）
                '24': [870, 470],     // 房内＝病床床头（阿雅换冰袋处——「把医疗包交给阿雅」→ 24 号委托）
                '3': [980, 700] }     // B125 自指 pin（暂定·目测）：病床与药品柜之间地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-gym': {
        id: 'room-gym', name: '晨星号 · 健身房', label: '顶层',
        image: '../images/station/rooms/gym.jpg', width: 1659, height: 948,
        mask: false,
        figures: { tietou: [745, 195, 245, 445] },     // B120：铁头可见轮廓框（N26 掰手腕／N27 递手套＝同卡换图）——目测初值，待标定
        /* B122（§7.10/§7.11-T77）：急救箱开过 ⇒ 壁上急救箱敞口、内空版（T77 免验收直入）；缺图回落基础图。 */
        variants: [ { cond: { chDone: '急救箱开过' }, image: '../images/station/rooms/gym-firstaid-open.jpg', width: 1659, height: 948 } ],
        pins: { '18': [1022, 285],    // 出口＝正上方双开门（目测：门扇中心）
                '26': [1240, 520],    // 房内＝哑铃架（「跟他掰手腕」构件；与 L2 铁头锚点错开以免遮挡）
                '4': [560, 760] }     // B125 自指 pin（暂定·目测）：瑜伽垫区地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-observation': {
        id: 'room-observation', name: '晨星号 · 观景厅', label: '顶层',
        image: '../images/station/rooms/observation.jpg', width: 1659, height: 948,
        mask: false,
        figures: { yinhe: [1125, 440, 165, 170] },     // B120：银河（沙发上）可见轮廓框——目测初值，待标定
        /* B122（§7.10/§7.11-T75）：打过招呼（银河已随剧情离场）⇒ 无猫、无零食袋版（T75）；缺图回落基础图。
         * `figures: {}`＝该状态无同框面（§7.10 协作②：无猫 ⇒ 无可覆盖对象；**不回落基础表**——防误判覆盖卡）。 */
        variants: [ { cond: { chDone: '跟胖胖打过招呼' }, image: '../images/station/rooms/observation-catgone.jpg', width: 1659, height: 948, figures: {} } ],
        pins: { '18': [830, 890],     // 出口＝画面下缘地面通道（目测：地毯前沿——图中无门构件）
                '28': [1185, 600],    // 房内＝沙发上的银河（「追出去」构件——与 L2 同座标＝对齐覆盖）
                '5': [700, 760] }     // B125 自指 pin（暂定·目测）：沙发前地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-lab': {
        id: 'room-lab', name: '晨星号 · 实验室', label: '中层',
        image: '../images/station/rooms/lab.jpg', width: 1660, height: 948,
        mask: false,
        figures: { laobu: [430, 300, 290, 460] },      // B120：老布可见轮廓框——T72（laobu-point）到货注册同口径（覆盖卡）
        pins: { '20': [830, 880],     // 出口＝画面下缘门框中线（目测：门槛中点）
                '25': [780, 55],      // 房内＝天花板检修口（老布「指给你看」的构件——「帮他去找工具箱」→ 25）
                '30': [300, 640],     // 房内＝左侧实验台下的工具柜（「打开工具柜，自己动手」→ 30）
                '7': [950, 700] }     // B125 自指 pin（暂定·目测）：实验台前地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-comms': {
        id: 'room-comms', name: '晨星号 · 通讯舱', label: '中层',
        image: '../images/station/rooms/comms.jpg', width: 1660, height: 948,
        mask: false,
        pins: { '20': [850, 760],     // 出口＝下缘拱门（目测：门洞中心）
                '8': [450, 520] }     // 房内＝控制台（「查货单／全站广播」构件；B128：校准锚点（渲染面不标记））
      },
      'room-cooling': {
        id: 'room-cooling', name: '晨星号 · 冷却塔', label: '底层',
        image: '../images/station/rooms/cooling.jpg', width: 1659, height: 948,
        mask: false,
        pins: { '21': [700, 870],     // 出口＝画面下缘前侧地面（目测：图中无门构件）
                '13': [940, 470] }    // 房内＝蒸汽总阀（红轮盘——「用万能扳手拧上总阀」构件；B128：校准锚点（渲染面不标记））
      },
      'room-server': {
        id: 'room-server', name: '晨星号 · 服务器机房', label: '底层',
        image: '../images/station/rooms/server.jpg', width: 1659, height: 948,
        mask: false,
        pins: { '21': [830, 870],     // 出口＝画面下缘地面通道（目测：图中无门构件）
                '35': [1340, 520],    // 房内＝监控控制台（玻璃机房监视屏——「调出监控」→ 35）
                '14': [830, 560] }    // B125 自指 pin（暂定·目测）：机柜通道前——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-solarctl': {
        id: 'room-solarctl', name: '晨星号 · 太阳能控制室', label: '底层',
        image: '../images/station/rooms/solarctl.jpg', width: 1659, height: 948,
        mask: false,
        pins: { '21': [830, 870],     // 出口＝画面下缘地面通道（目测：图中无门构件）
                '36': [1370, 400],    // 房内＝主供电闸门手柄（红柄拉杆——「双手推上主供电闸门」→ 36；缺前置时不可点）
                '15': [470, 640] }    // B125 自指 pin（暂定·目测）：操作台前地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-maintenance': {
        id: 'room-maintenance', name: '晨星号 · 维修区', label: '底层',
        image: '../images/station/rooms/maintenance.jpg', width: 1659, height: 948,
        mask: false,
        /* B122（§7.10/§7.11-T74）：收编机器人（knows 机器人小帮手）⇒ 货架下空（已脱困）版（T74 免验收直入）；
         * 缺图回落基础图。同实体防双现：本变体生效点＝L2 `helper-join` 的注册点（N37）——16 本体不注册。 */
        variants: [ { cond: { knows: '机器人小帮手' }, image: '../images/station/rooms/maintenance-free.jpg', width: 1659, height: 948 } ],
        pins: { '21': [900, 880],     // 出口＝画面下缘门框中线（目测：门槛中点）
                '37': [1430, 660],    // 房内＝卡住的维修机器人（货架下——「拖出来」→ 37）
                '7': [830, 60],       // 房内＝天花板检修口（爬道竖井端口——「掀开盖子往上爬」→ 7）
                '16': [1150, 780] }   // B125 自指 pin（暂定·目测）：工具台前地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-escapepod': {
        id: 'room-escapepod', name: '晨星号 · 应急逃生舱', label: '底层',
        image: '../images/station/rooms/escapepod.jpg', width: 1659, height: 948,
        mask: false,
        /* B122（§7.10/§7.11-T79）：检查过（knows 逃生舱检查过）⇒ 检查表三格打勾版（T79 免验收直入）；缺图回落基础图。 */
        variants: [ { cond: { knows: '逃生舱检查过' }, image: '../images/station/rooms/escapepod-checked.jpg', width: 1659, height: 948 } ],
        pins: { '21': [900, 880],     // 出口＝画面下缘门框中线（目测：门槛中点）
                '17': [1425, 400],    // 房内＝检查表板（「挨个检查一遍」构件；B128：校准锚点（渲染面不标记））
                '43': [1255, 330] }   // 房内＝发射控制台（红绿灯——「按下发射钮」→ 43；缺前置时不可点）
      },
      'room-command': {
        id: 'room-command', name: '晨星号 · 指挥舱', label: '中层',
        image: '../images/station/rooms/command.jpg', width: 1792, height: 1121,
        mask: false,
        pins: { '20': [700, 950],     // 出口＝画面下缘舷门（目测：门框中线）
                '23': [1120, 660],    // 房内＝控制台前（糖糖悬浮位——「问它带路」→ 23；B128：校准锚点（渲染面不标记））
                '6': [700, 780] }     // B125 自指 pin（暂定·目测）：控制台前地板——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-captain': {
        id: 'room-captain', name: '晨星号 · 站长室', label: '中层',
        image: '../images/station/rooms/captain.jpg', width: 1792, height: 1121,
        mask: false,
        /* B122（§7.10/§7.11-T78）：开过保险柜 ⇒ 柜门开一条缝、内空版（T78 免验收直入）；缺图回落基础图。 */
        variants: [ { cond: { chDone: '开过保险柜' }, image: '../images/station/rooms/captain-safeopen.jpg', width: 1792, height: 1121 } ],
        pins: { '20': [600, 1000],    // 出口＝画面下缘前侧地面（目测：图中无门构件）
                '45': [770, 300],     // 房内＝保险柜密码盘（「转动密码盘」→ 45；缺前置时不可点）
                '9': [1050, 720] }    // B125 自指 pin（暂定·目测）：办公桌前地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-warehouse': {
        id: 'room-warehouse', name: '晨星号 · 仓库', label: '中层',
        image: '../images/station/rooms/warehouse.jpg', width: 1792, height: 1121,
        mask: false,
        /* B122（§7.10/§7.11-T76）：收贿／拿过冷却剂／看过账本（任一）⇒ 货架大半空、箱摞起、矿石箱蒙帆布版（T76）；
         * 缺图回落基础图；同尺寸同构图。 */
        variants: [ { cond: { any: [ { knows: '收了桑尼的贿赂' }, { pinsAll: ['31'] }, { pinsAll: ['32'] } ] }, image: '../images/station/rooms/warehouse-clear.jpg', width: 1792, height: 1121 } ],
        pins: { '20': [350, 900],     // 出口＝画面左下前侧地面（目测：图中无门构件）
                '31': [1120, 450],    // 房内＝冷却剂罐（金/蓝罐排——「搬一罐冷却剂」→ 31；需先过安保）
                '32': [1355, 720],    // 房内＝货箱上的账本（银河叼来的本子——「拿给他看」→ 32）
                '10': [620, 560] }    // B125 自指 pin（暂定·目测）：货架间通道——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-airlock': {
        id: 'room-airlock', name: '晨星号 · 气闸舱', label: '中层',
        image: '../images/station/rooms/airlock.jpg', width: 1792, height: 1121,
        mask: false,
        pins: { '20': [900, 1010],    // 出口＝画面下缘前侧地面（目测：图中无门构件）
                '19': [890, 380],     // 房内＝舱门（圆舱门手轮——「穿上磁力靴，出舱」→ 19；需磁力靴）
                '11': [1180, 700] }   // B125 自指 pin（暂定·目测）：舱门内侧地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      },
      'room-reactor': {
        id: 'room-reactor', name: '晨星号 · 反应堆舱', label: '底层',
        image: '../images/station/rooms/reactor.jpg', width: 1792, height: 1121,
        mask: false,
        pins: { '21': [900, 1000],    // 出口＝画面下缘格栅前侧（目测：图中无门构件）
                '34': [880, 720],     // 房内＝三个接口环（堆芯基座——「装上三件东西」→ 34；缺件/缺电时不可点）
                '12': [560, 820] }    // B125 自指 pin（暂定·目测）：堆芯基座左侧地面——B128 起＝校准锚点（渲染面不标记、无开孔）
      }
    },

    start: { node: '1' },

    /* 资源表：id = 状态字段名 = fx 的键。
     * fail: null = 该资源只钳到 0、不判失败（星币：花光只到 0，可花到 0）；
     * 氧气归零 → fail.node 指向 44 号失败结算（引擎自动走进去，复用现有失败界面）。
     * bar: true = 玩家视图按「余量读数」呈现 = 分段填充条＋具体数值（**B04 重订**，取代 B03「无数字」口径；
     *   条＝round(值÷基准×10) 格、基准＝本档开局值（`start[st.diff]`——B147）；细则见 `docs/design-ui-v1.md` §6.1／
     *   `design-station-v1.md` §8.3）。三档（B147）：氧气 简单 500／中等 200／困难 80；星币 简单 25／中等 20／困难 15。 */
    resources: [
      { id: 'coins', name: '星币', icon: '🪙', unit: '枚',
        start: { easy: 25, normal: 20, hard: 15 }, low: 5,
        fail: null },
      { id: 'oxygen', name: '氧气', icon: '💨', unit: '点', bar: true,
        start: { easy: 500, normal: 200, hard: 80 }, low: 20,
        fail: {
          title: '氧气耗尽',
          text: '💨「眼前一黑……」氧气表的指针滑到了零。你听见很远的地方有人在喊你的名字——在『晨星号』上，这是最危险的声音。',
          node: '44'
        } }
    ],

    /* 道具表（23 件）：nosell = 红框（不可出售 / 不可丢）；atk = 武力加成；
     * text = 可点开看的正文（R07/E3；多段用 \n）；desc = 玩家向介绍（B07；全文照抄 bible §7.47） */
    items: {
      '手电':         { icon: '🔦', desc: '一支结实的手电——黑暗里最实在的伙伴。' },
      '工牌':         { icon: '🪪', desc: '你的实习工牌——过门禁、认身份，都靠它。' },
      '氧气瓶':       { icon: '🛢️', desc: '便携氧气瓶——喘不上气时，拧开就顶用。' },
      '万能扳手':     { icon: '🔧', desc: '一把万能扳手——拧、撬、卡，样样来得。' },
      '磁力靴':       { icon: '🥾', nosell: true, desc: '鞋底带磁力的靴子——吸住金属就站得稳。' },
      '焊接枪':       { icon: '🔫', atk: 1, nosell: true, desc: '一把小焊接枪——火花噼啪，能焊也能割。' },
      '电击棒':       { icon: '⚡', atk: 2, desc: '一根充好电的电击棒——谁挨上谁知道。' },
      '机械手套':     { icon: '🧤', atk: 1, desc: '加厚的机械手套——拧得动死螺丝，也扛得住磕碰。' },
      '应急盾':       { icon: '🛡️', atk: 1, desc: '一面轻便的应急盾——挡得住一下是一下。' },
      '控制芯片':     { icon: '💠', nosell: true, desc: '一枚小小的控制芯片——启动接口正等着它。' },
      '冷却剂罐':     { icon: '🧊', nosell: true, desc: '一罐冷却剂——给烧过头的堆芯降降温。' },
      '站长授权卡':   { icon: '💳', nosell: true, desc: '站长的授权卡——站里权限最高的那张。' },
      '备用电池':     { icon: '🔋', desc: '一对备用电池——给吃电的老机器续上。' },
      '医疗包':       { icon: '🩹', desc: '一只鼓鼓的医疗包——纱布、药棉、止血带。' },
      '绳索':         { icon: '🪢', desc: '一捆结实的绳索——拽得住人，稳得住脚。' },
      '站猫罐头':     { icon: '🥫', desc: '一罐真的鱼肉罐头——站里那只猫的最爱。' },
      '合成料理':     { icon: '🍱', desc: '一盒食堂的合成料理——管饱；味道，习惯就好。' },
      '桑尼的账本':   { icon: '📒', text: '封面写着「货运登记」，里面记的却是——\n「3 月 14 日　入：猫粮 12 箱　→　出：星尘矿石 12 块」\n「4 月 2 日　　入：罐头 8 箱　　→　出：星尘矿石 8 块」\n最后一页被撕掉一半，只剩一句：「等灯一灭……」', desc: '一本不起眼的小本子，页角翻得发软。' },
      '监控回放':     { icon: '📽️', text: '画面里，桑尼拉下了主供电的保险丝，还对着镜头外打了个手势。\n时间戳：停电前 2 分钟。\n（旁边那张便签——「保险柜：0325」——也一起收好了。）', desc: '一段从监控系统里拷出来的回放片段。' },
      '反应堆安全规程': { icon: '📜', text: '《反应堆舱安全规程 · 第七版》\n一、进入前，确认随身照明。\n二、启动顺序：控制芯片 → 冷却剂 → 站长授权卡。\n三、任何情况，都不要一个人进去。', desc: '《反应堆舱安全规程》——薄薄一本，边角磨得起毛。' },
      '站长的便条':   { icon: '📝', text: '便条上的字有点抖：\n「{me}：看到这张条子，说明我已经出事了。别声张，去找铁头——他嘴硬，心不硬。\n　　　　　　　　　　　　　　—— 伊莲娜」', desc: '一张字迹发抖的便条，落款是站长。' },
      '逃生舱钥匙':   { icon: '🔑', desc: '一把逃生舱钥匙——希望永远用不上。' },
      '星尘矿石':     { icon: '💎', nosell: true, desc: '一块亮晶晶的矿石——在灯下直晃眼。' },
    },
    itemOrder: ['手电', '工牌', '氧气瓶', '万能扳手', '磁力靴', '焊接枪', '电击棒', '机械手套', '应急盾',
                '控制芯片', '冷却剂罐', '站长授权卡', '备用电池', '医疗包', '绳索', '站猫罐头', '合成料理',
                '桑尼的账本', '监控回放', '反应堆安全规程', '站长的便条', '逃生舱钥匙', '星尘矿石'],

    /* 人物表（8 位乘员）：img＝T05 切片（`images/station/chars/<id>.jpg`，B04/§7.6 图鉴与「在这里」条用）；
     * 切片未入库时 img 加载失败 ⇒ 引擎回落 emoji（emoji 字段保留——B04 缺图兜底）。
     * bio 照抄设计档 §2 的人物表；spot = 对应房间的编号坐标（同房间两位人物略微错开，免得光环叠加）。 */
    characters: {
      yilanna: { name: '伊莲娜', title: '站长', emoji: '👩‍🚀', img: '../images/station/chars/yilanna.jpg',
        bio: '铁面但护短。站里出事时，她伤得最重——她的授权卡，是重启反应堆的关键。',
        spot: { scene: 'deck1', x: 1430, y: 392 } },        // 医务室（3 号点）
      laobu:    { name: '老布', title: '总工程师', emoji: '👴', img: '../images/station/chars/laobu.jpg',
        bio: '零件控老头，说话绕圈子。能修一切，但要"配套零件"。',
        spot: { scene: 'deck2', x: 950, y: 224 } },          // 实验室（7 号点）
      aya:      { name: '阿雅', title: '医官', emoji: '👩‍⚕️', img: '../images/station/chars/aya.jpg',
        bio: '冷静姐姐。医务室里有药品与氧气瓶。',
        spot: { scene: 'deck1', x: 1475, y: 432 } },         // 医务室（3 号点，与站长错开）
      pangpang: { name: '胖胖', title: '厨师', emoji: '👨‍🍳', img: '../images/station/chars/pangpang.jpg',
        bio: '快乐胖子。食堂的事都归他——帮他洗碗，能挣几个星币。',
        spot: { scene: 'deck1', x: 358, y: 404 } },          // 食堂（1 号点）
      tangtang: { name: 'R2-糖糖', title: '实习维修机器人', emoji: '🤖', img: '../images/station/chars/tangtang.jpg',
        bio: '你的伙伴。知道站里的每个角落，是线索的主要来源。',
        spot: { scene: 'deck2', x: 340, y: 336 } },          // 指挥舱（6 号点）
      tietou:   { name: '铁头', title: '安保队长', emoji: '💪', img: '../images/station/chars/tietou.jpg',
        bio: '肌肉正直，能开安全门。被桑尼骗得团团转。',
        spot: { scene: 'deck1', x: 412, y: 729 } },          // 健身房（4 号点）
      sangni:   { name: '桑尼', title: '货运主管', emoji: '🕵️', img: '../images/station/chars/sangni.jpg',
        bio: '笑眯眯的仓库主管。出了名的"热心肠"；仓库里的事，他说了算。',
        spot: { scene: 'deck2', x: 860, y: 740 } },          // 仓库（10 号点）
      yinhe:    { name: '银河', title: '站猫', emoji: '🐈', img: '../images/station/chars/yinhe.jpg',
        bio: '不吃合成粮的站猫。搞笑担当 + 关键线索：总出现在"出事"的地方。',
        spot: { scene: 'deck1', x: 1416, y: 751 } }          // 观景厅（5 号点）
    },
    charOrder: ['yilanna', 'laobu', 'aya', 'pangpang', 'tangtang', 'tietou', 'sangni', 'yinhe'],

    /* 浮现图注册表（B04 · 两层制 L2；机制与清单＝`docs/design-ui-v1.md` §7.3/§7.4/§7.5）
     * 条目字段：file＝运行时图路径（`images/station/moments/<id>.jpg`）；at＝锚点（原图像素，与 pins 同口径：
     *   角色图＝底边中点、窗景图＝窗区中心）；w＝角色图宽 ÷ 场景宽（默认 0.22，按图 0.16~0.32）；
     *   win＝窗区尺寸（原图像素；窗景图显示＝窗区 × fit）；card＝圆角卡呈现（群像/信息密集张，D47 辅法）。
     * B120（同框全覆盖）：指向本场景 L1 常驻角色的 L2（charId ∈ `scenes[].figures`）＝**覆盖卡**——
     *   几何唯一来源＝figures，本表不再写 at／w（pangpang-hail／aya-nurse／yilanna-awake／
     *   tietou-armwrestle／tietou-open／yinhe-idle 六张，已删值）；换态不换位（同角色多状态共用同一轮廓框）。
     * 图号对应（`art/requirements-v1.md` §4.2 交付路径）：T37 yinhe-ledger／T38 yinhe-idle／T39 yilanna-awake／
     *   T40 laobu-lookout／T41 tietou-armwrestle／T42 tangtang-guide／T43 pod-standoff／T44 sangni-smile／
     *   T45 pangpang-hail／T46 aya-nurse／T47 sangni-flip／T48 sangni-cave／T49 tietou-open／T50 guardbot-block／
     *   T51 win-observation-jupiter／T52 win-airlock-array／T53 yinhe-lick／T54 sangni-bribe／T55 helper-join／T56 sil-figure。
     * 注：at/win 为**暂定校准值**——已在房间的图（1/3/4/5/11 相关条目见各行「B119 重标」）按内景图重新取值（B119）；
     *   仍在 deck 图的条目等走廊/舷窗接线后随 pins 一同重校准（C 键流程）。
     *   图未到货 ⇒ 该张不渲染（无占位、不报错——§7.3 兜底），注册表照常先行登记。
     * B127 全量重审（§7.12）：注册集 36→**31**——撤注册 5 条（win-observation-jupiter／win-airlock-array／
     *   firstaid-open／robot-rescue／pods-check）；窗口与首访一次都在节点侧（`mIf` 收窗行／`mOnce`），表内不动。 */
    moments: {
      /* —— 角色浮现图（18 张）—— */
      'pangpang-hail':        { file: '../images/station/moments/pangpang-hail.jpg' },        // T45 · 1（默认）｜B120 覆盖卡：几何＝room-galley.figures.pangpang
      'aya-nurse':            { file: '../images/station/moments/aya-nurse.jpg' },            // T46 · 3（默认）｜B120 覆盖卡：几何＝room-medbay.figures.aya
      'yilanna-awake':        { file: '../images/station/moments/yilanna-awake.jpg' },        // T39 · 24（默认）＋3·pinsAll 24｜B120 覆盖卡：几何＝room-medbay.figures.yilanna
      'yinhe-idle':           { file: '../images/station/moments/yinhe-idle.jpg' },           // T38 · 5（默认）｜B120 覆盖卡：几何＝room-observation.figures.yinhe（z 序在窗景之上）
      'tangtang-guide':       { file: '../images/station/moments/tangtang-guide.jpg', at: [900, 780], w: 0.18 },    // T42 · 6＋23（默认）｜B119 重标：command 图内控制台前地板（糖糖悬浮位）
      'sangni-smile':         { file: '../images/station/moments/sangni-smile.jpg', at: [820, 830], w: 0.22 },      // T44 · 10（默认）｜B119 重标：warehouse 图内货架前地板（挡道位）
      'guardbot-block':       { file: '../images/station/moments/guardbot-block.jpg', at: [830, 700], w: 0.20 },   // T50 · 14（默认）｜B119 重标：server 图内机柜通道前方（挡门位）
      'sil-figure':           { file: '../images/station/moments/sil-figure.jpg', at: [640, 620], w: 0.20 },        // T56 · 22（默认）
      'tietou-armwrestle':    { file: '../images/station/moments/tietou-armwrestle.jpg' },    // T41 · 26（默认）＋4｜B120 覆盖卡：几何＝room-gym.figures.tietou
      'tietou-open':          { file: '../images/station/moments/tietou-open.jpg' },          // T49 · 27（默认）｜B120 覆盖卡：同为 tietou 轮廓框（换态不换位）
      'yinhe-ledger':         { file: '../images/station/moments/yinhe-ledger.jpg', at: [1020, 870], w: 0.16 },     // T37 · 28（默认）
      'yinhe-lick':           { file: '../images/station/moments/yinhe-lick.jpg', at: [1020, 870], w: 0.16 },       // T53 · 28·item ≥ 桑尼的账本（换图不换位）
      'sangni-flip':          { file: '../images/station/moments/sangni-flip.jpg', at: [1100, 700], w: 0.22, card: true },   // T47 · 31（默认；信息密集——圆角卡）｜B119 重标：warehouse 图内货箱前地板
      'sangni-cave':          { file: '../images/station/moments/sangni-cave.jpg', at: [1580, 660], w: 0.22 },       // T48 · 32（默认）｜B119 重标：warehouse 图内矿石木箱前（锚框完整落在图内）
      'sangni-bribe':         { file: '../images/station/moments/sangni-bribe.jpg', at: [820, 830], w: 0.22 },      // T54 · 33（默认）｜B119 重标：warehouse 图内货架前地板（与 sangni-smile 同位）
      'helper-join':          { file: '../images/station/moments/helper-join.jpg', at: [900, 815], w: 0.16 },       // T55 · 37（默认）｜B119 重标：maintenance 图内门前地面（在你脚边）
      'laobu-lookout':        { file: '../images/station/moments/laobu-lookout.jpg', at: [830, 150], w: 0.22 },     // T40 · 38（默认）｜B119 重标：maintenance 图内天花板检修口（探头位）
      'pod-standoff':         { file: '../images/station/moments/pod-standoff.jpg', at: [900, 820], w: 0.32, card: true }, // T43 · 40（默认；群像横构图——圆角卡）｜B119 重标：escapepod 图内舱前地板
      /* —— 窗景图（T51／T52）：**本期不注册**（B127 · §7.12 行 35/36——窗内木星由 T19 成图承担、舷窗过小；
       *   资产留档在 `images/station/moments/`，若验收判需「窗外大景」按 §7.5 四要件一行恢复）。—— */
      /* —— 扩图批 T57~T72（B126 · 2026-10-04 到货 16/16；口径＝`docs/design-ui-v1.md` §7.4.1 到货登记表）——
       * 注册集＝到货集；锚点＝表内建议初值（原图像素；w＝图宽÷场景宽），待 C 键标定（数据以标定值为准）；
       * 呈现：横构图场景类＝`card:true`（T57/T59/T60/T65/T67/T70/T71），竖构图对象/角色张＝柔边椭圆；
       * `laobu-point`（T72）＝覆盖卡，仅 file（几何唯一来源＝room-lab.figures.laobu，无 at／w）；
       * 挂条件与撤注册（B127 重审 · §7.4.1 注册裁定／§7.12）：safe-open 保留 @45（撤 @9）；panel-weld 保留 @19（39 不注册）；
       *   firstaid-open（T68）／robot-rescue（T69）／pods-check（T70）**撤注册**（同状态重复／相斥——背景变体承担，资产留档）。 */
      'power-restore':      { file: '../images/station/moments/power-restore.jpg', at: [1370, 500], w: 0.30, card: true },   // T57 · 36｜闸门 pin '36' 下沿 → 暂定 [1370,500]
      'safe-open':          { file: '../images/station/moments/safe-open.jpg', at: [770, 400], w: 0.18 },                    // T58 · 9·mIf／45｜保险柜 pin '45' 前下方
      'panel-weld':         { file: '../images/station/moments/panel-weld.jpg', at: [1505, 820], w: 0.30, card: true },      // T59 · 19（默认；收窗＝太阳能板已修好）｜39 不注册（§7.12 行 31）
      'broadcast':          { file: '../images/station/moments/broadcast.jpg', at: [450, 620], w: 0.28, card: true },        // T60 · 8｜控制台 pin '8' 下沿
      'locker-emergency':   { file: '../images/station/moments/locker-emergency.jpg', at: [560, 640], w: 0.18 },             // T61 · 2｜暂沿自指 pin '2'
      'chip-extract':       { file: '../images/station/moments/chip-extract.jpg', at: [300, 720], w: 0.18 },                 // T62 · 30｜工具柜 pin '30' 下沿
      'gear-locker':        { file: '../images/station/moments/gear-locker.jpg', at: [1150, 640], w: 0.18 },                 // T63 · 11｜安保柜位（成图标定）
      'spec-pickup':        { file: '../images/station/moments/spec-pickup.jpg', at: [560, 870], w: 0.18 },                  // T64 · 12③｜暂沿自指 pin '12'
      'core-interfaces':    { file: '../images/station/moments/core-interfaces.jpg', at: [880, 800], w: 0.30, card: true },  // T65 · 12（首访默认）｜接口环 pin '34' 一带
      'manifest-clue':      { file: '../images/station/moments/manifest-clue.jpg', at: [640, 600], w: 0.18 },                // T66 · 8｜控制台旁单据位（与 broadcast 错开）
      'steam-dash':         { file: '../images/station/moments/steam-dash.jpg', at: [940, 620], w: 0.30, card: true },       // T67 · 13③｜总阀 pin '13' 一带
      /* T68 firstaid-open／T69 robot-rescue／T70 pods-check：撤注册（B127 · §7.12 行 32/18/33）——资产留档。
       * T71 sangni-ambush：撤注册（B05 · §7.12 行 34——29 号改由 CG `defeat-ambush`（T80）承担，单一呈现防重复）——资产留档。 */
      'laobu-point':        { file: '../images/station/moments/laobu-point.jpg' }                                            // T72 · 25｜覆盖卡（几何＝room-lab.figures.laobu；无 at／w）
    },

    /* 帮助（玩法说明）：B04 整组换新稿＋B05 增存档行＝**12 条**（`docs/design-ui-v1.md` §8.1 照抄区——氧气＝条＋数值、
     * 物品栏、提示颜色四条新规；第 12 条＝存档/读档行·B136）；旧 9 条稿作废。
     * 保留口径：选项行＝新哲学（B03）；武力行＝构成算式（B69）；补给行等「效果量」文本保留（§8.3 适用面）。 */
    help: [
      '🪙 星币：简单开局 25 枚、中等 20 枚、困难 15 枚。食堂那台旧贩卖机收它——能换吃的（合成料理 5 枚一盒），也能换小工具（备用电池 5 枚）。花光只到 0，不会闯关失败。',
      '💨 氧气：简单开局 500、中等 200、困难 80。开门、钻缝、闯过危险、跑上跑下……每一下都在走表——氧气条旁边的数字，就是你现在还剩的氧气；到 0 眼前一黑，闯关失败！',
      '⛽ 补给（每处只给一次）：睡眠舱的应急包 +10、医务室的氧气站 +5、中层大厅的补给柜 +5；合成料理（+10）也能顶一阵。',
      '🔨 干活：食堂洗碗、实验室打下手——每次 +2 枚星币，费 5 点氧气；想攒钱买点什么，就去动动手。',
      '🎒 物品栏 / 背包：地图下方的物品栏就是你的随身口袋，点一下看说明；带着内容的点开就能慢慢读。完整清单在背包里——红框道具不能卖，也别想丢。',
      '⚔ 战斗：你的武力值 ≥ 对手，才打得赢。武力值＝装备加成＋伙伴加成，不会自己涨：焊接枪 +1、电击棒 +2、机械手套 +1、应急盾 +1；收编维修机器人，再 +1。动手前，先看对照行「你的武力值 X ≥/< Y」——下面还列着这套加成怎么凑出来的；打不过，就先去攒装备。',
      '🔑 线索：有些门，只有知道门道的人才推得开；有些把柄，比拳头管用。',
      '🎨 提示颜色：蓝色＝常规动静；橙红色（带 ✕）＝这一次没成，剧情会告诉你为什么；金色（带 🔑）＝拿到线索、点亮了关键进展；绿色＝拿到东西，或者把东西交出去。',
      '👉 选项：能做的事才会出现；拿不准的，尽管试——不行的时候，剧情会告诉你为什么。',
      '🗺 地图上只有高亮的位置可以点（现在的位置 + 下一步能去的门）；跨层时场景图会自动切换。',
      '🧭 迷路了？工具栏和场景区右下角的「指路」按钮，随时能点：当前目标、线索与记录、还差什么，一眼看全；有更新的时候，按钮上会亮个小点，线索和记录点开能看详情。想回到安全点或者重开本关，都在 💾 里。',
      '💾 存档 / 读档：进度会自动存在这台设备上（关卡卡上的「继续」就是接着上次玩）；想「回头再试一次」，就用右上角的 💾：三个存档位，想存哪个存哪个，读取就能回到当时。'
    ],

    /* 节点表（45 点网络）：
     * n=名称 t=正文 c=选项 tIf=[{cond,t}]=正文分叉（条件成立时用 t；E8，先匹配者为准）
     * 选项：l=文案 to=目标 cond=条件 fx=效果 say=反馈旁白行（E7）
     *   once=true|'标记名'（做过即隐藏；E6）  hint='vague'|'exact'|'none'（提示分级，缺省 vague；E4）
     *   battle={power, loseTo, winTo}  random=[a,b]  back=true  toIf=[{cond,to}]  prices=[…]
     * 节点字段：en=进入时效果 once=只触发一次 shop=商店 sell=出售 fail/win=结局 chars=关联人物
     * 条件语言：{item}/{noItem}/{knows}/{noKnows}/{anyItem}/{notPinsAll}/{pinsAll}/{chDone:'标记名'}/{all:[…]}/{any:[…]}/{资源id:下限}
     * 效果语言：gain/lose/learn/thief + 资源键（coins/oxygen，键=资源 id）
     * B03 可见性＝两种呈现（可尝试／隐藏）：可尝试＝成事＋失败双条目（失败条 say＋原地＝`to` 本节点自指、
     *   无 fx／once／跨节点去向——零代价、不可刷）；隐藏＝cond 不足即不显示；全关无 lock／lockIf／lockText。 */
    nodes: {
      /* ================= 第一幕 · 摸黑求生（1~21 地点） ================= */

      '1': { n: '食堂', scene: 'room-galley',   // B119：内景接线（T15 galley.jpg 已入库）
        t: '晚餐刚端上桌，灯"啪"地全灭了。黑暗里，你听见"嘶——"的一声长音：空气正在漏走（氧气 −5）。\n厨师胖胖在黑暗里喊："别慌别慌——先别动，汤还热着呢！……谁搭把手，帮我把碗洗了？工钱照给，不白使唤人！"\n更远处的走廊里，好像有人在压着嗓子打电话。',
        chars: ['pangpang'],
        moments: ['pangpang-hail'],   // B04（§7.4）：胖胖在灶台后招手（T45）
        /* B127（§7.3/§7.12 行 1）：首访一次（`mOnce`）——开局那一刻的初见场面（老板点名「只在开局那一刻」）；
         * 同一存档首次渲染显示、之后（含读档）不再重现；新局重置（标记＝st.mSeen，表现层状态位）。 */
        mOnce: true,
        en: { once: true, oxygen: -5 },   // 黑暗摸索：一进食堂就漏气（R05）
        shop: { price: 5, stock: ['合成料理', '备用电池'] },   // 自动贩卖机（食堂门口那台旧的）
        c: [
          { l: '摸黑去中央大厅。', to: '18' },
          { l: '循着说话声摸过去。', to: '22', cond: { notPinsAll: ['22'] } },   // B01：听过就走（完成态隐藏）
          /* B67（1③）：劳动文案三段——首遍／再遍（各带 once）＋此后（无 once、可重复）；fx 三段逐字相同 */
          { l: '留下来帮胖胖洗碗。（他喊得急，工钱照给——就是要费点力气。）', once: '洗过碗', fx: { coins: 2, oxygen: -5 }, to: '1' },
          { l: '再帮胖胖洗碗。（手熟了——工钱照给。）', cond: { chDone: '洗过碗' }, once: '再洗过碗', fx: { coins: 2, oxygen: -5 }, to: '1' },
          { l: '继续洗碗。（工钱照给。）', cond: { chDone: '再洗过碗' }, fx: { coins: 2, oxygen: -5 }, to: '1' },
          { l: '坐下来吃一盒合成料理（+10 氧气）。', hint: 'exact', cond: { item: '合成料理' }, fx: { lose: ['合成料理'], oxygen: 10 }, to: '1' }
        ],
        /* B74：复电版世界更新（唯一分支） */
        tIf: [ { cond: { knows: '全站复电' },
          t: '食堂的灯全亮了，锅里"咕嘟咕嘟"冒着热气。\n胖胖擦着灶台回头乐了："来啦？热水管用得很——碗还堆着一池，工钱照给！"' } ] },

      '2': { n: '睡眠舱', scene: 'room-sleep',   // B119：内景接线（T16 sleep.jpg 已入库）
        t: '你摸黑爬回自己的铺位。柜门卡得死紧，你咬着牙把它拽开，才摸到里面的应急包：工牌、手电，还有一支满气的氧气瓶——接上以后，氧气表涨了一小截。',
        moments: ['locker-emergency'],   // B126（§7.4.1-5）：拽开卡死的柜门、应急包微光（T61；开局教学时刻）
        mOnce: true,   // B127（§7.3/§7.12 行 2）：首访一次——复访柜已空、画面不再成立（同一存档一次；新局重置）
        en: { once: true, gain: ['手电', '工牌', '氧气瓶'], oxygen: 10 },   // 氧气瓶 +15 ∕ 翻找 −5 = 净 +10
        c: [ { l: '回中央大厅。', to: '18' } ] },

      '3': { n: '医务室', scene: 'room-medbay',   // B119：内景接线（T17 medbay.jpg 已入库）
        t: '医官阿雅正在给床上的人换冰袋——是站长伊莲娜！她受了伤，一直没醒。\n"她需要医疗包，"阿雅的声音有点急，"健身房墙上的急救箱里有一个——你力气够的话，撬得开。"\n墙角的老氧气站还能用。',
        chars: ['aya', 'yilanna'],
        /* B04（§7.4）：默认＝阿雅换冰袋（T46）；B122（§7.11「与 L2 的收窄」）：站长已醒（pinsAll 24）⇒ **空集**
         * （该状态不显示 L2——状态由背景变体 `medbay-awake` 承担：老板口径「剧情过之后切到当前状态的
         * 背景图，而不是一直盖着」）；苏醒时刻本身（N24）保留浮现图 T39。 */
        moments: ['aya-nurse'],
        mIf: [ { cond: { pinsAll: ['24'] }, moments: [] } ],
        /* B132（§6.7）：医务室特写（CG-02／T29）——首访一次（`once`）、点击关闭；同存档只显示一次。 */
        cg: { file: '../images/station/cg/medbay-closeup.jpg', once: true },
        en: { once: true, oxygen: 5 },   // 氧气站 +10 ∕ 搬运 −5 = 净 +5
        c: [
          /* ① 可尝试双条目（成事＋失败原地；§9.7-2） */
          { l: '把医疗包交给阿雅。', cond: { all: [ { item: '医疗包' }, { notPinsAll: ['24'] } ] },
            once: true, fx: { lose: ['医疗包'] }, to: '24' },
          { l: '把医疗包交给阿雅。', cond: { all: [ { noItem: '医疗包' }, { notPinsAll: ['24'] } ] },
            say: '你把手伸进口袋——空的。阿雅摇摇头，又低头去换冰袋。', to: '3' },
          { l: '问阿雅：站里的事——还有没有别的门路？', cond: { noKnows: '保险柜密码' }, fx: { learn: '阿雅的提醒' },
            say: '阿雅一边换冰袋一边说："门路？站长从来不留那些。不过——站里的事，维修机器人糖糖都记在芯里；它就在指挥舱，你去问它。"', to: '18' },   // 复检收口：线索改名「阿雅的提醒」＋糖糖引介（R2 问题 6/7）
          { l: '回中央大厅。', to: '18' }
        ],
        /* 先匹配者为准：站长已醒版在前 */
        tIf: [
          { cond: { pinsAll: ['24'] }, t: '站长靠在床头，气色好多了；阿雅正把用过的冰袋收走。\n"反应堆那边，就交给你了——"站长朝你眨眨眼，"我缓一缓就过去。"' },
          { cond: { item: '医疗包' }, t: '医官阿雅正在给床上的人换冰袋——是站长伊莲娜！她受了伤，一直没醒。\n"她需要医疗包，"阿雅抬头看见你手里的袋子，"能先给我吗？"\n墙角的老氧气站还能用。' }
        ] },

      '4': { n: '健身房', scene: 'room-gym',   // B119：内景接线（T18 gym.jpg 已入库）
        t: '安保队长铁头正举着两只哑铃，汗珠砸在地板上——站里的安全门，钥匙都在他手里。\n"断电？我以为是跳闸！"他放下哑铃，咧嘴一笑，"小身板，敢不敢掰手腕？"\n他忽然朝门口喊了一嗓子："仓库的门禁，是得盯紧点！"\n墙上的急救箱扣得死紧，一个人弄不下来。',
        chars: ['tietou'],
        moments: ['tietou-armwrestle'],   // B111（§7.4）：T18 未到货期间由浮现图 T41 补位（与 26 同图；零新图）
        /* B127（§7.12 行 8）：收窗行——任务推进完（铁头已开门）⇒ 本房不再显示（`mIf` 空集）；
         * 挑战时刻本身（26 号）保留。先匹配者为准（B126 的 firstaid-open 行已按 §7.12 行 32 撤注册——
         * 急救箱状态由背景变体 T77 承担，不再挂 mIf）。 */
        mIf: [ { cond: { knows: '铁头已开门' }, moments: [] } ],
        /* B03 探索化：不再有进入效果；撬箱两路（③自撬 −5 ／ ④请铁头 0）共享 once 标记 */
        c: [
          { l: '⚔ 跟他掰手腕。（力气活——费力气，也费氧气。）', cond: { noKnows: '铁头已开门' }, to: '26' },
          /* ② 可尝试双条目：成事＝到过 25（提老布名号）＋未开门；失败＝未到过 25（§9.7-3） */
          { l: '请他帮忙打开仓库的门。', cond: { all: [ { pinsAll: ['25'] }, { noKnows: '铁头已开门' } ] },
            once: true, to: '27' },
          { l: '请他帮忙打开仓库的门。', cond: { all: [ { notPinsAll: ['25'] }, { noKnows: '铁头已开门' } ] },
            say: '「开门？」铁头把哑铃往架子上一搁，上下打量你：「门是好门，人是生人——凭什么？」', to: '4' },
          { l: '撬开墙上的急救箱。（费力气。）', cond: { noItem: '医疗包' }, once: '急救箱开过',
            fx: { oxygen: -5, gain: ['医疗包'] },
            say: '你蹬着墙，咬牙一使劲——箱盖"咔"地弹开，里面躺着一只医疗包。胳膊酸得直抖。', to: '4' },
          /* ④ 可尝试双条目（B70：前置＝掰过手腕；已开门⇒失败条不显示——反馈与可执行动作一致） */
          { l: '请铁头搭把手，把急救箱弄下来。', cond: { all: [ { pinsAll: ['26'] }, { noItem: '医疗包' } ] },
            once: '急救箱开过', fx: { gain: ['医疗包'] },
            say: '铁头一手扶箱，一手"咔"地一掰："拿去！小身板省点劲儿。"', to: '4' },
          { l: '请铁头搭把手，把急救箱弄下来。', cond: { all: [ { notPinsAll: ['26'] }, { noKnows: '铁头已开门' }, { noItem: '医疗包' } ] },
            say: '「搭把手？」铁头抱着胳膊往墙上一靠：「先下场，跟我掰一场——敢比划的，才算自己人。」', to: '4' },
          { l: '回中央大厅。', to: '18' }
        ],
        /* 二次进入分叉（先匹配者为准） */
        tIf: [
          { cond: { knows: '铁头已开门' }, t: '铁头正举着哑铃，见你进来，冲你扬了扬下巴："门都好使了吧？缺什么，喊我一声！"' },
          { cond: { chDone: '急救箱开过' }, t: '铁头冲你扬了扬下巴："药箱开了？行，够用就好。"\n墙角的急救箱敞着口，空了。' }
        ] },

      '5': { n: '观景厅', scene: 'room-observation',   // B119：内景接线（T19 observation.jpg 已入库）
        t: '观景厅的窗口正对着木星——像一颗巨大的糖果挂在窗外。\n沙发后面窸窸窣窣：站猫银河蹲在一只鼓鼓的零食袋上，尾巴卷成一个小问号。它只吃真鱼，对合成粮闻都不闻——这会儿正瞪着你，爪子按得紧紧的。',
        chars: ['yinhe'],   // 在场表口径沿革：5 号在场者＝银河（B02 起；B04 复核仍为唯一——原注释误记批次，本轮顺手改）
        /* B04（§7.4/§7.5）：默认＝银河蹲零食袋（T38）＋窗景木星（T51）；打过招呼（银河已不在）⇒ 窗景照旧、猫不出现 */
        moments: ['yinhe-idle'],   // B127（§7.12 行 5）：猫在/不在＝状态窗口（换态优势保留）；窗景 T51 撤注册（§7.12 行 35）
        mIf: [ { cond: { chDone: '跟胖胖打过招呼' }, moments: [] } ],   // 复访「银河也不见了」⇒ 收窗
        /* B132（§6.7）：木星特写（CG-01／T28）——首访一次（`once`）、点击关闭（与 T51 窗景同源不同图）。 */
        cg: { file: '../images/station/cg/jupiter-closeup.jpg', once: true },
        c: [
          /* ① 的 once 标记名沿用 `跟胖胖打过招呼`（测试接口字符串；5 号已无胖胖——接口兼容保留） */
          { l: '钻到沙发后面，看看银河守着的是什么。', once: '跟胖胖打过招呼', fx: { oxygen: -5, gain: ['合成料理', '站猫罐头'] },
            say: '黑暗里你贴着地板钻过去。袋子上贴着胖胖的便条：「谁找到这袋零食，算谁的——帮我哄哄银河，它最近老往仓库跑。」袋子里是一盒合成料理，和一罐真的鱼罐头。', to: '5' },
          { l: '追出去，看它往哪儿跑。', cond: { noItem: '桑尼的账本' }, to: '28' },
          { l: '回中央大厅。', to: '18' }
        ],
        /* R11：打过招呼后二次进入 → 文本分叉（原 en 的一次性获得已移入 ①） */
        tIf: [ { cond: { chDone: '跟胖胖打过招呼' },
          t: '沙发后面空空的——零食袋没了，银河也不见了，只留下一小撮猫毛。' } ] },

      '6': { n: '指挥舱', scene: 'room-command',   // B119：内景接线（T10 command.jpg 已入库——首轮五间）
        t: '指挥舱里，只有糖糖的圆眼睛还亮着。它是站上的实习维修机器人——嘴快，记性好。\n"咔"，它投出一张清单："我查过了：主供电的保险丝是被人拔掉的——这不是事故！要重启反应堆，需要三样东西：控制芯片、冷却剂、站长授权卡；还有，得先把电力找回来！\n对了——冷却剂仓库里就有，几罐备用的，应该够。"',
        chars: ['tangtang'],
        moments: ['tangtang-guide'],   // B04（§7.4）：糖糖悬浮投清单（T42，与 23 同图）
        en: { once: true },   // 幕标题卡锚点（B23）：首访只触发一次，无副作用
        c: [
          { l: '问它：你能带我去哪儿？', cond: { noKnows: '糖糖是帮手' }, to: '23' },
          { l: '回中层大厅。', to: '20' }
        ],
        /* B74：复电版世界更新 */
        tIf: [ { cond: { knows: '全站复电' },
          t: '指挥舱的屏幕上亮起了一片，糖糖的圆眼睛在光里转得飞快。\n"电回来啦！"它"咔"地又投出一张清单，"主系统自检通过——就差反应堆了。三样东西，你凑齐几样啦？"' } ] },

      '7': { n: '实验室', scene: 'room-lab',   // B119：内景接线（T20 lab.jpg 已入库）
        t: '总工程师老布围着零件堆转圈，白胡子一翘一翘："我的宝贝工具箱不见了！没有它，螺丝不认识我，电路板也不听我的话——活干不了！"\n"不过嘛，"他指了指天花板的检修口，"那条爬道顺着管子下去，一直通到底层的维修区。要是有人肯从那儿钻进来，自己动手——我也拦不住，对吧？"\n"要肯搭把手也行——帮起忙来，工钱我照付。"\n墙边立着一排工具柜，柜门都锁得严实。',
        chars: ['laobu'],
        c: [
          { l: '帮他去找工具箱。', cond: { noItem: '控制芯片' }, to: '25' },
          /* ② 可尝试双条目（§9.7-6）；③ 三段劳动（B67） */
          { l: '打开工具柜，自己动手。', cond: { all: [ { knows: '维修爬道路线' }, { noItem: '控制芯片' } ] },
            once: true, fx: { oxygen: -5 }, to: '30' },
          { l: '打开工具柜，自己动手。', cond: { all: [ { noKnows: '维修爬道路线' }, { noItem: '控制芯片' } ] },
            say: '你拽开工具柜——柜子后面只有几根发烫的管子。这条路怎么走，你心里一点底都没有。', to: '7' },
          { l: '给老布打下手。（他一个人忙不过来——挣两个星币，就是要费点力气。）', once: '打过下手', fx: { coins: 2, oxygen: -5 }, to: '7' },
          { l: '再给老布打下手。（顺手多了——挣两个星币。）', cond: { chDone: '打过下手' }, once: '再打过下手', fx: { coins: 2, oxygen: -5 }, to: '7' },
          { l: '继续打下手。（挣两个星币。）', cond: { chDone: '再打过下手' }, fx: { coins: 2, oxygen: -5 }, to: '7' },
          { l: '回中层大厅。', to: '20' }
        ],
        /* 先匹配者为准：拿回箱后（R14）→ 持芯片识别版（B73） */
        tIf: [
          { cond: { pinsAll: ['38'] },
            t: '老布把他的红漆工具箱擦得锃亮，一边翻零件一边哼歌："宝贝回来了，干活就是顺！"' },
          { cond: { item: '控制芯片' },
            t: '老布一眼瞅见你手里的控制芯片，白胡子抖了抖：「哦？」他凑近看了两眼，背着手转开：「嗯，还行——能用。我的宝贝工具箱嘛，反正也跑不了；你先忙你的大事。」' }
        ] },

      '8': { n: '通讯舱', scene: 'room-comms',   // B119：内景接线（T21 comms.jpg 已入库）
        t: '通讯舱的屏幕上只有一行红字：「求救信号已发出——预计 6 小时后接通。」\n你心里一沉：6 小时？氧气撑不了那么久。\n控制台角落，一张货单被翻得乱七八糟——有人用笔改过上面的字。',
        moments: ['broadcast', 'manifest-clue'],   // B126（§7.4.1-4/-10）：全站广播（T60）＋被改过的货单特写（T66；锚点与 broadcast 错开）
        /* B127（§7.12 行 23）：广播＝一次性动作（once＋`已广播集合`）——做完即过（收窗行：货单照旧）；先匹配者为准。 */
        mIf: [ { cond: { knows: '已广播集合' }, moments: ['manifest-clue'] } ],
        c: [
          /* ① 隐形式（持账本才出现，§9.7-7）；② 查单＝once＋线索回执（B72） */
          /* B08（§2-B143 父侧复核 #1）：① once 具名化 `对过货单`——供 rec-08 完成态查询（E6 具名标记；行为不变——做过即隐藏） */
          { l: '把货单和账本对一对。', cond: { item: '桑尼的账本' }, once: '对过货单',
            say: '对上了！账本里的货一笔一笔全对得上——「猫粮」12 箱进、「矿石」12 块出；「罐头」8 箱进、「矿石」8 块出。矿石，就藏在货箱里偷运！货单上那一栏被改成「矿石」——看来有人早就起了疑心。', to: '8' },
          { l: '查一查被改过的货单。', cond: { noItem: '桑尼的账本' }, once: true, fx: { learn: '货单被改过' },
            say: '货单上「猫粮」那一栏被人改成了「矿石」——字迹很急，改得歪歪扭扭。为什么是矿石？你把它记在心里。', to: '8' },
          { l: '对着全站广播："所有人——带上能带的东西，准备撤离！"', once: true, fx: { learn: '已广播集合' },
            say: '你的声音在空荡荡的站里滚了一圈。远处，有几扇门"吱呀"响了一声——有人动身了。\n喊完之后，你心里反倒有点没底。', to: '8' },
          { l: '回中层大厅。', to: '20' }
        ] },

      '9': { n: '站长室', scene: 'room-captain',   // B119：内景接线（T11 captain.jpg 已入库——首轮五间）
        t: '站长室的门锁着。你隔着门上的小窗往里看：桌上留着半杯凉咖啡，墙角的保险柜指示灯一闪一闪。\n门边的读卡器还通着电——说不定，谁的工牌都能试一下。',
        /* B127（§7.12 行 30）：safe-open 撤 @9、保留 @45（@9 复现＝与变体 T78「柜门开缝」同状态重复）——本节点无浮图。 */
        c: [
          /* ① 可尝试：成事（密码＋工牌/铁头）＋失败条×2（互斥；§9.7-9；B65：fx −10） */
          { l: '想办法进门，转动密码盘，打开保险柜。',
            cond: { all: [ { knows: '保险柜密码' }, { any: [ { item: '工牌' }, { knows: '铁头已开门' } ] } ] },
            once: '开过保险柜', fx: { oxygen: -10 }, to: '45' },
          { l: '想办法进门，转动密码盘，打开保险柜。',
            cond: { all: [ { noItem: '工牌' }, { noKnows: '铁头已开门' } ] },
            say: '你推了推门——锁着。门边的读卡器，小红灯"嘀"地亮了一下。', to: '9' },
          { l: '想办法进门，转动密码盘，打开保险柜。',
            cond: { all: [ { any: [ { item: '工牌' }, { knows: '铁头已开门' } ] }, { noKnows: '保险柜密码' } ] },
            say: '密码盘在你指尖下咔哒、咔哒——锁芯纹丝不动。那串数，你一位都拿不准。', to: '9' },
          { l: '先回中层大厅。', to: '20' }
        ],
        /* R14：开柜后 → 文本分叉（开柜走进 45 号事件） */
        tIf: [ { cond: { chDone: '开过保险柜' },
          t: '站长室的门虚掩着。保险柜的门开着一条缝——里面已经空了；桌上那半杯咖啡，凉得更透了。' } ] },

      '10': { n: '仓库', scene: 'room-warehouse',   // B119：内景接线（T13 warehouse.jpg 已入库——首轮五间）
        t: '货运主管桑尼笑眯眯地挡在货架前面："哟，{me}。仓库重地——别多管闲事。"他手一翻，亮出一小叠星币。\n他身后就是一排冷却剂罐——罐身上缠着细细的锁链，挂着安保科的锁；脚下的箱子缝里，露出几块亮晶晶的矿石——星尘矿石，在木星轨道上，这东西比金子还俏。',
        chars: ['sangni'],
        moments: ['sangni-smile'],   // B04（§7.4）：桑尼笑眯眯挡在货架前（T44）
        c: [
          /* ① 可尝试：成事（已开门）＋失败条×2（互斥；§9.7-12） */
          { l: '直接动手搬一罐冷却剂。', cond: { all: [ { knows: '铁头已开门' }, { noItem: '冷却剂罐' } ] },
            once: true, fx: { oxygen: -5 }, to: '31' },
          { l: '直接动手搬一罐冷却剂。', cond: { all: [ { noKnows: '铁头已开门' }, { noItem: '冷却剂罐' }, { notPinsAll: ['32'] } ] },
            say: '桑尼横过身来挡住货架，点了点罐身上那条锁链：「安保科的锁——我都不敢碰，你敢？」', to: '10' },
          { l: '直接动手搬一罐冷却剂。', cond: { all: [ { noKnows: '铁头已开门' }, { noItem: '冷却剂罐' }, { pinsAll: ['32'] } ] },
            say: '货架前没人和你搭话。罐身上那条安保锁链还在——要动它，得先过安保那一关。', to: '10' },
          /* ② 隐形式（持账本才出现；去剧透，§9.7-13） */
          { l: '把银河叼来的本子拿给他看。', cond: { item: '桑尼的账本' }, once: true, to: '32' },
          { l: '收下他亮出来的星币。（他笑得格外亲切——可这钱，拿着烫手。）', cond: { noKnows: '收了桑尼的贿赂' }, to: '33' },   // 复检收口（R2 问题 1）：动作已在正文
          { l: '先退出去，回中层大厅。', to: '20' }
        ],
        /* 状态分叉（先匹配者为准；收贿版置首——QA 体验 6 空房写照） */
        tIf: [
          { cond: { knows: '收了桑尼的贿赂' }, t: '仓库里，货架已经空了大半——桑尼正把最后几只箱子摞起来。见你进来，他笑得格外亲切："放心，这儿的事，跟你没关系啦。"' },
          { cond: { pinsAll: ['32'] }, t: '仓库里静悄悄的。桑尼缩在货架后面，见了你，笑得比哭还难看。' },
          { cond: { pinsAll: ['31'] }, t: '桑尼盯着你，脸绷得紧紧的——那箱矿石，被他用帆布蒙上了。' },
          /* B09 第四条（老板⑦）：持「监控回放」⇒ 正文呼应版（置末——不遮前三条） */
          { cond: { item: '监控回放' }, t: '桑尼还是笑眯眯地挡在货架前面——只是这一回，你看着他的手，想起了监控回放里拉下保险丝的那只手。' }
        ] },

      '11': { n: '气闸舱', scene: 'room-airlock',   // B119：内景接线（T14 airlock.jpg 已入库——首轮五间）
        t: '墙上的安保柜没锁——里面有一双磁力靴和一支电击棒。\n透过舷窗，站外的太阳能板阵列正在木星的阴影里一闪一闪。',
        moments: ['gear-locker'],   // B126（§7.4.1-7）：安保柜打开·磁力靴＋电击棒（T63）；窗景 T52 撤注册（B127 · §7.12 行 36）
        /* B127（§7.12 行 28）：取柜后柜空（复访正文「安保柜空了」）⇒ 收窗（`mIf` 空集）。 */
        mIf: [ { cond: { chDone: '取了磁力靴' }, moments: [] } ],
        c: [
          { l: '打开安保柜，把磁力靴和电击棒拿上。', once: '取了磁力靴', fx: { gain: ['磁力靴', '电击棒'] }, to: '11' },
          /* ② 可尝试双条目（§9.7-15） */
          { l: '穿上磁力靴，出舱。', cond: { item: '磁力靴' }, fx: { oxygen: -5 }, to: '19' },
          { l: '穿上磁力靴，出舱。', cond: { noItem: '磁力靴' },
            say: '你一只脚刚探出气闸——失重猛地拽了你一把。你死死抓住门沿，把自己拖了回来。', to: '11' },
          { l: '回中层大厅。', to: '20' }
        ],
        /* R14：拿空安保柜后 → 文本分叉（命名标记由取柜选项写入；首访不命中） */
        tIf: [ { cond: { chDone: '取了磁力靴' },
          t: '安保柜空了。你透过舷窗往下看——太阳能板阵列在木星的阴影里一闪一闪。' } ] },

      '12': { n: '反应堆舱', scene: 'room-reactor',   // B119：内景接线（T12 reactor.jpg 已入库——首轮五间）
        t: '冷下来的堆芯像一颗熄灭的太阳，每一口呼吸都带着凉气（每次进入 −10 点氧气）。\n三个接口空着，接口旁的铭牌刻着各自要接的东西：控制芯片、冷却剂、站长授权卡。\n墙角的地上，飘着半页打印纸。',
        /* B126（§7.4.1-9/-8）：冷堆芯近景＋三个空接口（T65；首访默认）＋手电光束捡纸（T64；对象时刻＝节点默认集）。 */
        moments: ['core-interfaces', 'spec-pickup'],
        /* B127（§7.12 行 26/27）：两行收窗——更晚状态在前（先匹配者为准）：
         * ① 反应堆已重启（正文翻页：堆芯亮、接口插好）⇒ 冷堆芯近景收窗（空集）；
         * ② 纸已捡（item 反应堆安全规程）⇒ 纸不在、冷堆芯近景照旧（保留 core-interfaces）。 */
        mIf: [ { cond: { knows: '反应堆已重启' }, moments: [] },
               { cond: { item: '反应堆安全规程' }, moments: ['core-interfaces'] } ],
        en: { oxygen: -10 },
        c: [
          { l: '你刚踏进来，身后的舱门"咔哒"一声锁上了……', cond: { knows: '收了桑尼的贿赂' }, to: '29' },
          /* ② 可尝试双条目（缺件/缺电⇒失败反馈；收贿⇒齐隐，§9.7-17） */
          { l: '装上三件东西，启动反应堆。', cond: { all: [ { item: '控制芯片' }, { item: '冷却剂罐' }, { item: '站长授权卡' }, { knows: '全站复电' }, { noKnows: '反应堆已重启' } ], noKnows: '收了桑尼的贿赂' },
            once: true, to: '34' },
          { l: '装上三件东西，启动反应堆。', cond: { all: [ { noKnows: '反应堆已重启' }, { noKnows: '收了桑尼的贿赂' }, { any: [ { noItem: '控制芯片' }, { noItem: '冷却剂罐' }, { noItem: '站长授权卡' }, { noKnows: '全站复电' } ] } ] },
            say: '你按铭牌挨个把接口试了一遍——没动静。缺的东西，还没凑齐。', to: '12' },   // 复检收口（R2 问题 10）：去「序列」预设
          /* ③ 可尝试双条目（§9.7-18） */
          { l: '用手电照一照堆芯，顺手把墙角那页纸捡起来。', cond: { all: [ { item: '手电' }, { noKnows: '收了桑尼的贿赂' } ] },
            once: true, fx: { gain: ['反应堆安全规程'] }, to: '12' },   // 复检收口（R2 ④）：自指＝留在舱内（Core.move 不重跑 en——门票只收一次）
          { l: '用手电照一照堆芯，顺手把墙角那页纸捡起来。', cond: { all: [ { noItem: '手电' }, { noKnows: '收了桑尼的贿赂' } ] },
            say: '你蹲下去摸堆芯——黑得什么也看不见。墙角那页纸，更是没影。', to: '12' },
          { l: '回底层大厅。', to: '21' }
        ],
        /* 进入提示（先匹配者为准）：收贿→埋伏前提示；重启后→时序分叉 */
        tIf: [
          { cond: { knows: '收了桑尼的贿赂' }, t: '反应堆舱里冷得刺骨，黑得没有底。你心里咯噔一下——想起桑尼那句话："反应堆舱那边，你就别去了。"\n你凑近堆芯一看：三个接口全被人动过手脚。这条线，断了。' },
          { cond: { knows: '反应堆已重启' }, t: '堆芯亮着，嗡鸣声顺着地板传上来。三个接口都插好了，卡扣咬得紧紧的。' }
        ] },

      '13': { n: '冷却塔', scene: 'room-cooling',   // B119：内景接线（T22 cooling.jpg 已入库——P2b 并批）
        t: '白色蒸汽从管道的缝里滋滋地冒出来（每次进入 −5 点氧气）。总阀就在蒸汽正中间；蒸汽对面，像是有一排挂架——看不清上面放着什么；再往里，只有盘根错节的热管——挤不过去。',
        moments: ['steam-dash'],   // B126（§7.4.1-11）：白汽涌屏、捂口鼻冲过（T67；横构图圆角卡）
        en: { oxygen: -5 },
        c: [
          /* ① ② 各为可尝试双条目（§9.7-20/21） */
          { l: '用万能扳手拧上总阀。', cond: { all: [ { item: '万能扳手' }, { noItem: '冷却剂罐' } ] },
            once: true, fx: { oxygen: -5, gain: ['冷却剂罐'] },
            say: '管子里的嘶嘶声弱下去了。你顺手从旁边的挂架上取下一罐备用冷却剂。', to: '21' },
          { l: '用万能扳手拧上总阀。', cond: { all: [ { noItem: '万能扳手' }, { noItem: '冷却剂罐' } ] },
            say: '阀门锈得死死的——你双手一扳，掌心火辣辣地疼。光靠手，拧不动。', to: '13' },
          { l: '系上绳索，贴着管壁挪过去。', cond: { item: '绳索' },
            say: '绳索绷得笔直，你贴着管壁一点点挪过去——蒸汽对面，挂架上那罐备用冷却剂看得清清楚楚；总阀的轮盘，锈得发红。\n够不着——要拿它们，得先治住这口蒸汽。', to: '21' },
          { l: '系上绳索，贴着管壁挪过去。', cond: { noItem: '绳索' },
            say: '你贴着管壁刚探出半步——蒸汽扑了满脸，烫得你缩了回来。', to: '13' },
          { l: '捂住口鼻，硬着头皮冲过蒸汽。', cond: { noItem: '冷却剂罐' }, fx: { oxygen: -10, gain: ['冷却剂罐'] },
            say: '蒸汽烫得你胳膊一激灵。你一口气冲过去，顺手捞起挂架上被蒸汽顶松的半罐冷却剂。', to: '21' },
          { l: '先回底层大厅。', to: '21' }   // B34：①③ 关闭后的留存出口（无绳索玩家不出现「无活选项」）
        ] },

      '14': { n: '服务器机房', scene: 'room-server',   // B119：内景接线（T23 server.jpg 已入库——P2b 并批）
        t: '机柜的灯一闪一闪，一台安保机器人横在门口："区域封锁，请勿进入。"它的红眼睛转过来，锁定了你。\n——可它胸口别着的调令牌，是一张空白牌。门边的墙上，老式闸箱的指示灯幽幽地亮着。',
        /* B03 复检收口（§1 ③：复访写回自写句，授权原文入报告后回填圣经 §7）：手头有监控回放
         * ⇒ 已经进过机房（监控回放仅由 35 发）——挡门那句收束（②扳闸断电无状态位，此句不覆盖它，报告已披露）。 */
        tIf: [ { cond: { item: '监控回放' },
          t: '机柜的灯一闪一闪，门口那台安保机器人退到了一边——它不再拦你，红眼睛暗着。\n——可它胸口别着的调令牌，是一张空白牌。门边的墙上，老式闸箱的指示灯幽幽地亮着。' } ],
        moments: ['guardbot-block'],   // B04（§7.4）：安保机器人横在门口（T50）
        mIf: [ { cond: { item: '监控回放' }, moments: [] } ],   // 持监控回放（机器人已让路）⇒ 不出现
        c: [
          { l: '⚔ 跟安保机器人过招。', cond: { noItem: '监控回放' },
            battle: { power: 3, loseTo: '14', winTo: '35', loseSay: '机器人的铁臂一扫，你被顶出门外——它还在门口，哪儿也过不去。' } },
          /* ② 可尝试双条目（§9.7-23） */
          { l: '用扳手扳下电闸，从黑暗里摸回走廊。', cond: { item: '万能扳手' },
            say: '机器人的红眼睛"叮"地暗了下去。你贴着墙根溜出机房——身后的机器人还在黑暗里转圈，撞得柜子哐哐响。', to: '21' },
          { l: '用扳手扳下电闸，从黑暗里摸回走廊。', cond: { noItem: '万能扳手' },
            say: '闸箱的盖子卡得死死的——徒手掰了两下，纹丝不动。', to: '14' },
          /* ③ 隐形式（收编后才出现；§9.7-24） */
          { l: '让小帮手去机房后台，把监控调出来。', cond: { all: [ { knows: '机器人小帮手' }, { noItem: '监控回放' } ] },
            say: '小帮手钻进机柜背面，"嘀嘀哒哒"鼓捣了一阵——屏幕亮了：监控画面的进度条，一格一格往前爬。', to: '35' },
          { l: '先回底层大厅。', to: '21' }
        ] },

      '15': { n: '太阳能控制室', scene: 'room-solarctl',   // B119：内景接线（T24 solarctl.jpg 已入库——P2b 并批）
        t: '一排排闸门像钢琴的琴键。最左边那一个写着"主供电"，但它现在推不动——指示灯是灰的。\n配电盘上，标着"外部阵列"的那一路，红灯亮着。',
        c: [
          /* ① 可尝试双条目（§9.7-26） */
          { l: '双手推上主供电闸门。', cond: { all: [ { knows: '太阳能板已修好' }, { noKnows: '全站复电' } ] },
            once: true, fx: { oxygen: -5 }, to: '36' },
          { l: '双手推上主供电闸门。', cond: { all: [ { noKnows: '太阳能板已修好' }, { noKnows: '全站复电' } ] },
            say: '闸门推不动——像焊在墙上。配电盘上，那一路红灯还亮着：电，没接上。', to: '15' },
          { l: '回底层大厅。', to: '21' }
        ],
        /* R14：修板后／复电后 → 文本分叉（第一优先为准：复电版在前） */
        tIf: [
          { cond: { knows: '全站复电' }, t: '主供电闸门推到顶了，指示灯一排排绿着——电流的嗡嗡声沿着地板传出去。' },
          { cond: { knows: '太阳能板已修好' }, t: '指示灯亮着，电流的嗡嗡声沿着地板传过来——主供电闸门，随时可以推上去。' }
        ] },

      '16': { n: '维修区', scene: 'room-maintenance',   // B119：内景接线（T25 maintenance.jpg 已入库——P2b 并批）
        t: '满地零件，像一座拆了一半的玩具城堡。一台维修机器人卡在货架底下——灰扑扑的，轮子空转着，胸口的电池灯红红地闪——快没电了；没了电，它才卡在这儿出不来；天花板上有个检修口，盖子卡得紧；角落里，露出一角红漆箱子。\n墙边有个废料回收斗——不要的东西丢进去，能换星币。',
        sell: true,
        c: [
          { l: '⚔ 把卡住的机器人从货架底下拖出来。（力气活——费力气，也费氧气。）', cond: { noKnows: '机器人小帮手' }, fx: { oxygen: -5 },
            battle: { power: 1, loseTo: '16', winTo: '37', loseSay: '机器人的轮子"呼"地一转，把你甩了个趔趄——它又缩回货架底下，灯泡似的眼睛一闪一闪。' } },
          /* ② 可尝试双条目（§9.7-28） */
          { l: '给卡住的机器人换上一节新电池。', cond: { all: [ { item: '备用电池' }, { noKnows: '机器人小帮手' } ] },
            once: true, fx: { lose: ['备用电池'] },
            say: '「咔哒」——新电池装好，机器人"哔"地弹了起来，围着你转了一圈。', to: '37' },
          { l: '给卡住的机器人换上一节新电池。', cond: { all: [ { noItem: '备用电池' }, { noKnows: '机器人小帮手' } ] },
            say: '你蹲下去摸机器人的胸口——电池仓空着。翻遍口袋，没有能用的电池。', to: '16' },
          /* ③ 可尝试双条目＋补前置（B71：到过 25 才出现；§9.7-29） */
          { l: '打着手电，把红漆工具箱拖出来。', cond: { all: [ { pinsAll: ['25'] }, { item: '手电' }, { noItem: '控制芯片' } ] },
            once: true, fx: { oxygen: -5 }, to: '38' },
          { l: '打着手电，把红漆工具箱拖出来。', cond: { all: [ { pinsAll: ['25'] }, { noItem: '手电' }, { noItem: '控制芯片' } ] },
            say: '零件堆底下黑黢黢的——红漆的一角若隐若现，可你看不真切。', to: '16' },
          /* ④⑤ 可尝试双条目（§9.7-30/31） */
          { l: '掀开检修口的盖子，往上爬。', cond: { any: [ { knows: '糖糖是帮手' }, { item: '万能扳手' } ] },
            fx: { oxygen: -10, learn: '维修爬道路线' }, to: '7' },
          { l: '掀开检修口的盖子，往上爬。', cond: { all: [ { noKnows: '糖糖是帮手' }, { noItem: '万能扳手' } ] },
            say: '盖子卡死了——指甲都劈了，纹丝不动。这屋里的零件堆里，也许有趁手的东西。', to: '16' },
          { l: '打着手电，翻一翻零件堆。', cond: { item: '手电' },
            once: true, fx: { oxygen: -5, gain: ['万能扳手', '焊接枪'] },
            say: '翻到底下，摸出一把万能扳手和一支焊接枪。', to: '16' },
          { l: '打着手电，翻一翻零件堆。', cond: { noItem: '手电' },
            say: '黑灯瞎火的——你摸了两把，只摸到一手油污。', to: '16' },
          { l: '回底层大厅。', to: '21' }
        ],
        /* B03：比较句只在见过糖糖时回归（首访去名）；复检收口（R2 ②）：已收编＝写回版（先匹配者为准） */
        tIf: [
          { cond: { knows: '机器人小帮手' },
            t: '满地零件，像一座拆了一半的玩具城堡。货架底下空了——那台机器人跟着你，轮子一转，停在你脚边；天花板上有个检修口，盖子卡得紧；角落里，露出一角红漆箱子。\n墙边有个废料回收斗——不要的东西丢进去，能换星币。' },
          { cond: { pinsAll: ['6'] },
            t: '满地零件，像一座拆了一半的玩具城堡。一台维修机器人卡在货架底下——灰扑扑的，跟糖糖一个型号；轮子空转着，胸口的电池灯红红地闪——快没电了；没了电，它才卡在这儿出不来；天花板上有个检修口，盖子卡得紧；角落里，露出一角红漆箱子。\n墙边有个废料回收斗——不要的东西丢进去，能换星币。' } ] },

      '17': { n: '应急逃生舱', scene: 'room-escapepod',   // B119：内景接线（T26 escapepod.jpg 已入库——P2b 并批）
        t: '三枚金色胶囊安静地悬在发射轨道上；检查表上，三个格子还空着。墙边的应急柜里，绳索和一面应急盾码得整整齐齐。',
        /* B03 复检收口（§1 ③：复访写回自写句，授权原文入报告后回填圣经 §7）：检查表查过 ⇒ 不再写「还空着」。 */
        tIf: [ { cond: { knows: '逃生舱检查过' },
          t: '三枚金色胶囊安静地悬在发射轨道上；检查表上，三个格子都打上了勾。墙边的应急柜里，绳索和一面应急盾码得整整齐齐。' } ],
        /* B127（§7.12 行 33）：pods-check 撤注册——检查表状态由背景变体 T79 承担；本节点无浮图。 */
        c: [
          { l: '按检查表，把三枚逃生舱挨个检查一遍。', cond: { noItem: '逃生舱钥匙' }, once: true,
            fx: { gain: ['逃生舱钥匙'], learn: '逃生舱检查过' }, to: '21' },
          { l: '打开应急柜，把绳索和应急盾拿上。', once: true, fx: { gain: ['绳索', '应急盾'] }, to: '17' },
          /* ③ 可尝试：成事（检查过＋已广播）＋失败条×2（互斥；§9.7-33） */
          { l: '插上逃生舱钥匙，按下发射钮。',
            cond: { all: [ { knows: '逃生舱检查过' }, { knows: '已广播集合' } ] }, to: '43' },
          { l: '插上逃生舱钥匙，按下发射钮。', cond: { noKnows: '逃生舱检查过' },
            say: '你把手按上发射钮——检查表上那三个格子，还空着。', to: '17' },
          { l: '插上逃生舱钥匙，按下发射钮。', cond: { all: [ { knows: '逃生舱检查过' }, { noKnows: '已广播集合' } ] },
            say: '你把手按上发射钮，又停住了——站里的人，还不知道要走。', to: '17' },
          { l: '回底层大厅。', to: '21' }
        ] },

      '18': { n: '中央大厅（顶层）', scene: 'deck1',   // B119：出口 pin 出现在本层各房内景 ⇒ 显式声明楼层场景（不再靠 pin 唯一命中）
        t: '应急灯亮着，电梯的指示灯一闪一闪。这一层是生活区：食堂、睡眠舱、医务室、健身房、观景厅。\n往下一层是工作区，再往下一层是核心区。',
        c: [
          { l: '穿过走廊，去食堂（1）。', to: '1' },
          { l: '摸回去，睡觉的铺位（2）。', to: '2' },
          { l: '去医务室（3）。', to: '3' },
          { l: '去健身房（4）。', to: '4' },
          { l: '去观景厅（5）——听说那儿能看见木星。', to: '5' },
          { l: '乘电梯去中层。', to: '20' },
          { l: '乘电梯去底层。', to: '21' }
        ],
        /* 先匹配者为准：复电版置首（B74）→ 复访短提示（B66；清单不含 1 号——开局即在 1 号） */
        tIf: [
          { cond: { knows: '全站复电' },
            t: '走廊的灯全亮了——不再是应急灯那点光。\n电梯的指示灯一闪一闪；这一层是生活区：食堂、睡眠舱、医务室、健身房、观景厅。往下一层是工作区，再往下一层是核心区。' },
          { cond: { any: [ { pinsAll: ['2'] }, { pinsAll: ['3'] }, { pinsAll: ['4'] }, { pinsAll: ['5'] } ] },
            t: '这一层你已经走熟了——应急灯底下，电梯的灯一闪一闪；食堂、睡眠舱、医务室、健身房、观景厅，都在老地方。' }
        ] },

      '19': { n: '太阳能板阵列（舱外）', scene: 'exterior',   // B119：气闸舱内景需要「出舱」pin（19）⇒ 显式声明站外场景（否则该编号多点命中）
        t: '木星在脚下慢慢地转。一片面板被太空碎片砸出一个大洞，边缘还冒着细碎的火花（每次出舱 −15 点氧气）。\n修好它，站里的电力才有来源。',
        moments: ['panel-weld'],   // B126（§7.4.1-3）：破洞面板＋弧光（T59；圆角卡——小帮手代焊版同图）
        /* B131（§7.12 行 31）：补好太阳能板后收窗（`knows 太阳能板已修好`）——「要能正常看整张舱外背景」。 */
        mIf: [ { cond: { knows: '太阳能板已修好' }, moments: [] } ],
        en: { oxygen: -15 },
        c: [
          /* ① 可尝试双条目（§9.7-34）；② 隐形式＋命名标记（§9.7-35） */
          { l: '⚒ 用工具把面板焊好。',
            cond: { all: [ { any: [ { item: '焊接枪' }, { item: '机械手套' } ] }, { noKnows: '太阳能板已修好' } ] },
            once: true, to: '39' },
          { l: '⚒ 用工具把面板焊好。',
            cond: { all: [ { noItem: '焊接枪' }, { noItem: '机械手套' }, { noKnows: '太阳能板已修好' } ] },
            say: '你拍了拍面板——手边没有能焊的家伙。', to: '19' },
          { l: '让机器人小帮手去焊。',
            cond: { all: [ { knows: '机器人小帮手' }, { noKnows: '太阳能板已修好' } ] },
            once: '小帮手焊板',
            say: '小帮手伸出焊臂，火花在木星的光里一闪一闪——你扶着面板，它来焊。', to: '39' },
          { l: '爬回气闸舱。', to: '11' }
        ],
        /* R14：修好板后 → 文本分叉 */
        tIf: [ { cond: { knows: '太阳能板已修好' },
          t: '面板补好了，电流顺着缆线往站里跑。木星在脚下慢慢地转。' } ] },

      '20': { n: '中央大厅（中层）', scene: 'deck2',   // B119：同上（实验室/通讯舱的出口 pin）
        t: '补给柜的门虚掩着——里面有半罐氧气（一次性）。\n这一层是工作区：指挥舱、实验室、通讯舱、站长室、仓库、气闸舱。',
        en: { once: true, oxygen: 5 },
        c: [
          { l: '拐两个弯，去指挥舱（6）。', to: '6' },
          { l: '去实验室（7）。', to: '7' },
          { l: '去走廊尽头的通讯舱（8）。', to: '8' },
          { l: '去站长室（9）。', to: '9' },
          { l: '去仓库（10）。', to: '10' },
          { l: '去气闸舱（11）。', to: '11' },
          { l: '乘电梯回顶层。', to: '18' },
          { l: '乘电梯去底层。', to: '21' },
          { l: '坐在补给柜旁边，吃一盒合成料理（+10 氧气）。', hint: 'exact', cond: { item: '合成料理' }, fx: { lose: ['合成料理'], oxygen: 10 }, to: '20' }
        ],
        /* 先匹配者为准：复电版置首（B74）→ 复访短提示（B66） */
        tIf: [
          { cond: { knows: '全站复电' },
            t: '工作区的灯全亮了，走廊里能听见水泵的嗡嗡声。\n这一层是工作区：指挥舱、实验室、通讯舱、站长室、仓库、气闸舱。' },
          { cond: { any: [ { pinsAll: ['6'] }, { pinsAll: ['7'] }, { pinsAll: ['8'] }, { pinsAll: ['9'] }, { pinsAll: ['10'] }, { pinsAll: ['11'] } ] },
            t: '这一层你已经走熟了——指挥舱、实验室、通讯舱、站长室、仓库、气闸舱，都在老地方。' }
        ] },

      '21': { n: '中央大厅（底层）', scene: 'deck3',   // B119：出口 pin 出现在底层各房内景 ⇒ 显式声明楼层场景（与 18/20 同口径）
        t: '越往下越冷，应急灯是暗红色的。这一层是核心区：反应堆舱、冷却塔、服务器机房、太阳能控制室、维修区、应急逃生舱。',
        c: [
          { l: '去反应堆舱（12）。', to: '12' },
          { l: '去冷却塔（13）。', to: '13' },
          { l: '去服务器机房（14）。', to: '14' },
          { l: '去太阳能控制室（15）。', to: '15' },
          { l: '去维修区（16）。', to: '16' },
          { l: '去应急逃生舱（17）。', to: '17' },
          { l: '乘电梯去中层。', to: '20' },
          { l: '乘电梯回顶层。', to: '18' }
        ],
        /* 先匹配者为准：复电版置首（B74）→ 复访短提示（B66） */
        tIf: [
          { cond: { knows: '全站复电' },
            t: '核心区的灯全亮了，越往下越冷。\n这一层是核心区：反应堆舱、冷却塔、服务器机房、太阳能控制室、维修区、应急逃生舱。' },
          { cond: { any: [ { pinsAll: ['12'] }, { pinsAll: ['13'] }, { pinsAll: ['14'] }, { pinsAll: ['15'] }, { pinsAll: ['16'] }, { pinsAll: ['17'] } ] },
            t: '这一层你已经走熟了——越往下越冷，应急灯还是暗红色的；反应堆舱、冷却塔、服务器机房、太阳能控制室、维修区、应急逃生舱，都在老地方。' }
        ] },

      /* ================= 第二幕 · 事件节点（22~40） ================= */

      '22': { n: '黑暗中的动静', scene: 'deck1',   // B119：走廊事件——显式声明楼层（不被出发房间的内景带走：本节点无 pin）
        t: '走廊深处，有人压着嗓子打电话："……货在仓库，别让人靠近。按原计划，灯一灭就动手。"\n你屏住呼吸，把这几个词记在了心里。\n应急灯扫过的一瞬，你瞥见他袖口一道臂章："货运"。再看时，人已经没进黑暗里了。',
        moments: ['sil-figure'],   // B04（§7.4）：暗处人影（T56；身份不露）
        en: { once: true, learn: '走私暗号' },
        c: [
          { l: '悄悄退回中央大厅。', to: '18' },
          { l: '摸回食堂。', to: '1' }
        ] },

      '23': { n: '糖糖带路', scene: 'room-command',   // B119：房内后继事件——显式声明（读档/直进也落回指挥舱内景）
        t: '"站里每个角落我都熟！"糖糖转了个圈，轮子在地板上划出蓝光。\n"维修爬道的入口在底层的维修区，盖子卡得紧——诀窍我教你：找到盖沿的卡扣，往里一别就开；顺着管子一直爬，就是实验室。还有——站长室的保险柜，密码 0325，是我帮站长设的；柜子里锁着一张备用的站长授权卡，是站长留的后手——她交代过：真出了事，就把卡交给还没放弃的人。」它转了个圈，把清单翻到你名字那一行，「我看过了：还没放弃的，就剩你啦。"',
        chars: ['tangtang'],
        moments: ['tangtang-guide'],   // B04（§7.4）：糖糖带路（T42）
        en: { once: true, learn: ['糖糖是帮手', '保险柜密码'] },
        c: [
          { l: '去实验室看看。', to: '7' },
          { l: '回指挥舱看看。', to: '6' },
          { l: '回中层大厅。', to: '20' }
        ] },

      '24': { n: '阿雅的委托', scene: 'room-medbay',   // B119：房内后继事件——显式声明（与 pins '24' 同口径）
        t: '阿雅忙了半个小时，站长终于睁开眼睛。她第一句话是"反应堆……"；看见你，第二句软了三分：\n"{me}，拿着这个。"她把站长授权卡塞进你手里，"去把它点亮。"',
        /* B03 复检收口（§1 ③，父代理 2026-10-03 修正裁定）：持卡进入的衔接句——不再重演「把卡塞进你手里」。
         * 谓词＝卡在进门前已在手（卡只有两个来源：3①→24 进门给／45 保险柜）——24 的 en 先跑（进门即发卡），
         * 单用 { item } 会恒真⇒首访也会显示「早拿到了」；加 pinsAll 45 ⇒ 首访回默认版、复访（从保险柜取卡后）走衔接版。 */
        tIf: [ { cond: { all: [ { item: '站长授权卡' }, { pinsAll: ['45'] } ] },
          t: '阿雅忙了半个小时，站长终于睁开眼睛。她第一句话是"反应堆……"；看见你手里那张站长授权卡，她愣了一下，笑了：\n"原来你早拿到了。去吧——把它点亮。"' } ],
        chars: ['aya', 'yilanna'],   // B04（§7.6）：在场表补登记（3① 交包后的交卡场面）
        moments: ['yilanna-awake'],   // B04（§7.4）：站长靠床头、朝你眨眼（T39）
        en: { once: true, gain: ['站长授权卡'] },
        c: [
          { l: '回中央大厅。', to: '18' },
          { l: '回医务室看看。', to: '3' }
        ] },

      '25': { n: '老布的委托', scene: 'room-lab',   // B119：房内后继事件——显式声明（读档/直进也落回实验室内景）
        t: '"箱子是红漆的，上面贴着一张写着「闲人勿动」的纸。"老布把检修口的铁盖指给你看，\n"维修区满地零件，我的宝贝就埋在里头——对了，那儿有台卡住的小机器人；你要是顺手，也替我瞧它一眼。"\n他拍了拍脑门："哦对——站里的门禁，钥匙都在安保队长铁头那儿。你要是被门拦住了，就提我：他还欠我三盒零件没还呢！"',
        chars: ['laobu'],   // B04（§7.6）：在场表补登记（老布把检修口的铁盖指给你看）
        moments: ['laobu-point'],   // B126（§7.4.1-16）：老布仰头指检修口（T72，2026-10-04 到货）——覆盖卡，无 at／w（几何＝room-lab.figures.laobu）
        /* B71：委托去线索化——不再 learn（保留 once 锚点）；4②/16③ 前置改 pinsAll 25 */
        en: { once: true },
        c: [
          { l: '顺着维修爬道滑下去，到维修区（16）。', to: '16' },
          { l: '再问问老布。', to: '7' }
        ] },

      '26': { n: '挑战铁头', scene: 'room-gym',   // B119：房内后继事件——显式声明（与 pins '26' 同口径）
        t: '铁头把哑铃往地上一放，伸出右手："来吧！赢了我，仓库和站长室的门，我亲自给你开。"\n他的手像一把铁钳。',
        chars: ['tietou'],   // B04（§7.6）：在场表补登记
        moments: ['tietou-armwrestle'],   // B04（§7.4）：铁头伸手邀你掰手腕（T41）
        c: [
          { l: '⚔ 用力！', fx: { oxygen: -5 },
            battle: { power: 1, loseTo: '4', winTo: '27', loseSay: '铁头把哑铃往架子上一搁，甩了甩手腕："就这点劲儿？——回去多吃两碗饭，要不，找件趁手的家伙壮壮胆，再来！"' } },
          { l: '先不掰了，回健身房。', to: '4' }
        ] },

      '27': { n: '铁头开门', scene: 'room-gym',   // B119：房内后继事件——显式声明（无 pin；读档/直进也落回健身房内景）
        t: '铁头哈哈大笑，一巴掌拍在你背上——差点把你拍趴下："行！这忙我帮！仓库、站长室，随便进！"\n他从柜子里翻出一双机械手套塞给你："搬东西用得上。"',
        /* B79（R2·裁定 2）：交手过版正文（先匹配者为准）——判据 pinsAll 26 不记胜负（§9.6-12），
         * 父代理 2026-10-03 裁定中性化为「交过手」 */
        tIf: [ { cond: { pinsAll: ['26'] },
          t: '铁头甩着手腕直乐："行！交过手的人，这忙我帮！仓库、站长室，随便进！"\n他从柜子里翻出一双机械手套塞给你："搬东西用得上——以后搬不动的，喊我一声，不收钱！"' } ],
        chars: ['tietou'],   // B04（§7.6）：在场表补登记
        moments: ['tietou-open'],   // B04（§7.4）：铁头递机械手套（T49）
        en: { once: true, learn: '铁头已开门', gain: ['机械手套'] },
        c: [
          /* B79：当场兑现（0 氧；共享 once '急救箱开过'——4④ 为回头兜底）；自指＝留在本节点；标签中性化＝交过手 */
          { l: '让铁头顺手把墙上的急救箱卸下来。（交过手——不收钱。）',
            cond: { all: [ { pinsAll: ['26'] }, { noItem: '医疗包' } ] },
            once: '急救箱开过', fx: { gain: ['医疗包'] },
            say: '铁头走到墙边，两只手一扣一拽——"咔！"扣死的急救箱整只被他卸了下来。"拿去。"他咧嘴一笑，"掰赢我的，以后都这待遇。"', to: '27' },
          { l: '谢谢！回顶层大厅。', to: '18' },
          { l: '留在健身房。', to: '4' }
        ] },

      '28': { n: '追猫', scene: 'deck2',   // B99（R2 问题 16③）：发生场景＝S2（中层仓库门口）——显示楼层取此，不取入口所在层
        t: '你追出观景厅——银河个头小，一钻就没影了。你搭电梯下到中层，一路找过去，终于在仓库门口看见那条尾巴。\n它从货箱后面钻出来，嘴里叼着一本皱巴巴的小本子，封面写着「货运登记」四个字——看样子，是从仓库里顺出来的。\n银河瞪着你，喉咙里"咕噜"一声——它盯上的，是你的口袋。',
        chars: ['yinhe'],
        moments: ['yinhe-ledger'],   // B04（§7.4）：银河叼着「货运登记」小本子（T37）
        mIf: [ { cond: { item: '桑尼的账本' }, moments: ['yinhe-lick'] } ],   // 换到账本 ⇒ 换图不换位（T53）
        c: [
          /* ① 可尝试双条目（§9.7-36） */
          { l: '掏出站猫罐头（真的鱼！），换它嘴里的本子。', cond: { all: [ { item: '站猫罐头' }, { noItem: '桑尼的账本' } ] },
            once: true, fx: { lose: ['站猫罐头'], gain: ['桑尼的账本'] },
            say: '鱼罐头刚打开，银河"喵"了一声就松了嘴。小本子"啪"地落在地上——你捡起来，封面写着「货运登记」。（背包里可以点开慢慢看。）', to: '28' },
          { l: '掏出站猫罐头（真的鱼！），换它嘴里的本子。', cond: { all: [ { noItem: '站猫罐头' }, { noItem: '桑尼的账本' } ] },
            say: '你翻了翻口袋——空空的。银河歪着头看你，尾巴不耐烦地甩了两下。', to: '28' },
          { l: '推开仓库的门看看。', to: '10' },
          { l: '先回中层大厅。', to: '20' }
        ],
        /* 持账本版（先匹配者为准） */
        tIf: [ { cond: { item: '桑尼的账本' }, t: '银河蹲在你脚边舔爪子，看都不看那本本子——它觉得这买卖很划算。' } ] },

      '29': { n: '被制服', scene: 'room-reactor',   // B126（§7.4.1-15）：须显式声明（否则 sceneOfNode＝null——枚举缺场景、读档不落位）
        t: '桑尼从阴影里走出来，你身后传来无人机嗡嗡的声音。\n"我提醒过你的，"他叹了口气，"别往反应堆跑。"眼前一黑——你被人拖走了。',
        chars: ['sangni'],
        /* B05（B135 · §6.7）：失败结算走整屏 CG（T80 `defeat-ambush`；`dismiss:'keep'`＝常驻不关——与三结局同档）；
         * 原浮图 `sangni-ambush`（T71）撤注册＝同一时刻单一呈现（§7.12 行 34；资产留档）。 */
        cg: { file: '../images/station/cg/defeat-ambush.jpg', dismiss: 'keep' },
        fail: true },

      '30': { n: '自己拆芯片', scene: 'room-lab',   // B119：房内后继事件——显式声明（无 pin；读档/直进也落回实验室内景）
        t: '工具柜的后面，就是爬道出口藏身的死角。柜子最上层，一枚亮晶晶的控制芯片装在小袋子里——你屏住呼吸，踮起脚把它取了下来。',
        moments: ['chip-extract'],   // B126（§7.4.1-6）：工具柜里拆下芯片（T62；“自取”路线画面）
        en: { once: true, gain: ['控制芯片'] },
        c: [
          { l: '把芯片收好，顺着维修爬道滑回维修区（16）。', to: '16' },
          { l: '绕到前边，看看老布。', to: '7' }
        ] },

      '31': { n: '硬拿冷却剂', scene: 'room-warehouse',   // B119：房内后继事件——显式声明（与 pins '31' 同口径）
        t: '你抱起一罐冷却剂就走。桑尼打了个响指——无人机"嗡"地从阴影里冲出来，撞开了你手边的货箱：里面滚出来的，全是亮晶晶的星尘矿石！\n你抓起一块塞进口袋，抱着冷却剂冲了出去；跑出去才发现——口袋里的星币，被无人机顺走了一把。',
        chars: ['sangni'],
        moments: ['sangni-flip'],   // B04（§7.4）：桑尼打响指、无人机冲出（T47；圆角卡）
        en: { once: true, gain: ['冷却剂罐', '星尘矿石'], coins: -8, thief: '桑尼的无人机', learn: '桑尼翻脸了' },
        c: [
          { l: '抱着冷却剂罐撤退。', to: '20' },
          { l: '回仓库看看。', to: '10' }
        ] },

      '32': { n: '账本把柄', scene: 'room-warehouse',   // B119：房内后继事件——显式声明（与 pins '32' 同口径）
        /* B03 重做：抓包场面＋报酬改造（去冷却剂——矿石＝本线独家物证；§9.7-37） */
        t: '你把那本皱巴巴的「货运登记」放在货箱上。桑尼脸上的表情，一点一点沉了下去。\n"……小家伙，"他伸手来拿，你先一步按住了本子，"这东西，从哪儿捡的？"\n你不说话。阴影里，无人机"嗡"地低鸣了一声。桑尼瞥了它一眼，又看了看仓库的门——忽然泄了气，一脚踢开脚边的箱子：里面全是亮晶晶的星尘矿石。\n"拿一块走吧。账本的事……就当没发生过。"',
        chars: ['sangni'],
        moments: ['sangni-cave'],   // B04（§7.4）：桑尼笑容垮掉、踢开箱子（T48）
        en: { once: true, gain: ['星尘矿石'], learn: '桑尼认栽了' },
        c: [
          { l: '攥着矿石离开。', to: '20' },
          { l: '再看看仓库。', to: '10' }
        ] },

      '33': { n: '收贿赂', scene: 'room-warehouse',   // B119：房内后继事件——显式声明（读档/直进也落回仓库内景）
        t: '桑尼笑呵呵地往你口袋里塞了一把星币："聪明的小朋友，{me}。拿着，去买点好吃的。"\n他凑近了一点："反应堆舱那边，你就别去了——那儿，现在归我管。"\n星币揣进兜里，你却觉得：这钱，比看上去的还要沉。',
        chars: ['sangni'],
        moments: ['sangni-bribe'],   // B04（§7.4）：桑尼往你口袋里塞星币（T54）
        en: { once: true, coins: 10, learn: '收了桑尼的贿赂' },
        c: [
          { l: '……你隐约觉得不太对，但钱已经收了。', to: '20' },
          { l: '回仓库看看。', to: '10' }
        ] },

      '34': { n: '反应堆重启', scene: 'room-reactor',   // B119：房内后继事件——显式声明（与 pins '34' 同口径）
        t: '嗡——堆芯亮了。蓝白色的光顺着管道爬满整条走廊，仪表盘上的数字一个一个跳回绿色。\n墙上的对讲机突然炸响——一个粗嗓门，挤着电流："监控刚活过来——我看见桑尼那小子在搬箱子，往逃生舱口去了！{me}，快！"',
        en: { once: true, learn: '反应堆已重启' },
        /* B132（§6.7）：堆芯点亮特写（CG-03／T30）——到达即显示、点击关闭（非 once：每次到达；节点本身一次性）。 */
        cg: { file: '../images/station/cg/core-ignite.jpg' },
        c: [ { l: '追！去应急逃生舱口。', to: '40' } ] },

      '35': { n: '监控回放', scene: 'room-server',   // B119：房内后继事件——显式声明（与 pins '35' 同口径）
        t: '你调出监控回放：画面里，桑尼拉下了主供电的保险丝，还对着镜头外打了个手势。\n时间戳：停电前 2 分钟。\n机柜侧面贴着一张小便签，圆滚滚的一行字：「保险柜：0325」——你把录像和便签一起收好，回头谁都赖不掉。\n对了，还有那台堵门的安保机器人——它的调令牌正面空着，背面却压着一枚仓库的印。',
        en: { once: true, gain: ['监控回放'], learn: '保险柜密码' },   // 文本道具（R07）+ 密码线索
        /* B132（§6.7）：监控回放特写（CG-04／T31）——到达即显示、点击关闭（非 once：每次到达）。 */
        cg: { file: '../images/station/cg/monitor-frame.jpg' },
        c: [ { l: '离开机房，回底层大厅。', to: '21' } ] },

      '36': { n: '合闸', scene: 'room-solarctl',   // B119：房内后继事件——显式声明（与 pins '36' 同口径）
        t: '闸门推上去的一瞬间，整座站"活"了过来：灯一盏一盏亮起，走廊里的风声、水泵声、还有人哼歌的声音，全回来了。\n广播里，一个平稳的声音："电力恢复，各系统陆续上线——{me}，剩下的交给你了。"',
        moments: ['power-restore'],   // B126（§7.4.1-1）：整站灯亮起、暖光回涌（T57；圆角卡——全关世界状态分界）
        en: { once: true, learn: '全站复电' },
        c: [
          { l: '回底层大厅。', to: '21' },
          { l: '再看看控制室。', to: '15' }
        ],
        /* 广播两版分叉（站长已醒版） */
        tIf: [ { cond: { pinsAll: ['24'] }, t: '闸门推上去的一瞬间，整座站"活"了过来：灯一盏一盏亮起，走廊里的风声、水泵声、还有人哼歌的声音，全回来了。\n广播里，站长的声音很稳："电力恢复。{me}，剩下的交给你了。"' } ] },

      '37': { n: '收编维修机器人', scene: 'room-maintenance',   // B119：房内后继事件——显式声明（与 pins '37' 同口径）
        t: '维修机器人绕着你转了两圈，然后"哔"地一下站到你脚边——是你把它从被压住的地方解放出来的，它认准了你：它决定跟着你了。\n"哔——"它响亮地应了一声；从今天起，它就叫"小帮手"。\n有它在，打架的时候你多一分底气。',
        moments: ['helper-join'],   // B127（§7.12 行 18）：robot-rescue（T69）撤注册——前史动作与 37 状态相斥＋同实体双现；本行仅 helper-join（T55）
        en: { once: true, learn: '机器人小帮手' },   // 后续战斗 +1 武力（meta.atkFromClues）
        c: [
          { l: '带着它回底层大厅。', to: '21' },
          { l: '再看看维修区。', to: '16' }
        ] },

      '38': { n: '老布的工具箱', scene: 'room-maintenance',   // B119：房内后继事件——显式声明（无 pin；读档/直进也落回维修区内景）
        t: '红漆工具箱"哐"地打开。老布居然顺着爬道溜了下来，探出半个身子："我的宝贝！"\n他翻了半天，把一枚控制芯片塞进你手心："拿去，轻点儿放。"说完抱着箱子，哼哧哼哧地爬了回去，声音从检修口里飘下来："回头请你喝汽水！"',
        chars: ['laobu'],   // B04（§7.6）：在场表补登记（老布从检修口探身）
        moments: ['laobu-lookout'],   // B04（§7.4）：老布从天花板检修口探出半个身子（T40）
        en: { once: true, gain: ['控制芯片'] },
        c: [
          { l: '再看看维修区。', to: '16' },
          { l: '回底层大厅。', to: '21' }
        ] },

      '39': { n: '修好太阳能板', scene: 'exterior',   // B126（§7.4.1-3）：须显式声明（站外后继——否则 sceneOfNode＝null：枚举缺场景、读档不落位）
        t: '弧光在木星的光里一闪一闪。面板补好了，电流顺着缆线往站里跑。\n站里的灯，应该亮起来了。',
        /* B131（§7.12 行 31）：39 不注册浮图（落点即修好态——「要能正常看整张舱外背景」）。 */
        en: { once: true, learn: '太阳能板已修好', oxygen: -5 },   // 焊接作业 −5 氧（R05）
        /* B131：①「再看一眼新面板。」→19（再入 19 触 `en` −15 氧、无意义）已删——仅留「爬回气闸舱。」
         * （唯一出口，不影响防卡死检测；本项＝对 §9.5-B29 的反向调整）。 */
        c: [
          { l: '爬回气闸舱。', to: '11' }
        ],
        /* 焊接者分叉（§9.7-41）：默认＝工具版；机器人版见 tIf */
        tIf: [ { cond: { chDone: '小帮手焊板' },
          t: '小帮手伸出焊臂，弧光在木星的光里一闪一闪——面板补好了，电流顺着缆线往站里跑。\n站里的灯，应该亮起来了。' } ] },

      '40': { n: '对峙', scene: 'room-escapepod',   // B119：房内后继事件——显式声明（桑尼逃向舱口 ⇒ 对峙就在应急逃生舱；层仍＝底层）
        t: '逃生舱口，货运主管桑尼正把一箱星尘矿石往舱里塞——亮晶晶的矿石，在木星轨道上比金子还俏；安保队长铁头举着防暴棍，堵在另一边。\n旁边，三枚金色胶囊静静悬在发射轨道上；桑尼脚边，一台无人机"嗡"地悬起来，红点一闪一闪。\n"{me}，"桑尼笑着看你，眼睛却没笑，"你说，现在该怎么办？"',
        chars: ['sangni', 'tietou'],
        moments: ['pod-standoff'],   // B04（§7.4）：逃生舱口群像（T43；横构图圆角卡）
        c: [
          /* ① ④ 各为可尝试双条目（§9.7-42/43） */
          { l: '揭发他：把证据亮给铁头看。', cond: { any: [ { item: '桑尼的账本' }, { item: '监控回放' } ] }, to: '41' },
          { l: '揭发他：把证据亮给铁头看。', cond: { all: [ { noItem: '桑尼的账本' }, { noItem: '监控回放' } ] },
            say: '你张了张嘴——铁头看向你，桑尼也看向你。你的手上，什么都没有。', to: '40' },
          { l: '放他走：别在这儿冒险。', to: '42' },
          { l: '⚔ 拦住他的无人机。',
            battle: { power: 6, loseTo: '42', winTo: '41', loseSay: '无人机一头撞在你胸口，你摔在地上，眼睁睁看着他拉上了舱门。' } },
          { l: '放下反应堆——撤进逃生舱。', cond: { all: [ { knows: '逃生舱检查过' }, { knows: '已广播集合' } ] }, to: '43' },
          { l: '放下反应堆——撤进逃生舱。', cond: { noKnows: '逃生舱检查过' },
            say: '你回头看了一眼逃生舱——还没检完。这么走，不算把所有人带上。', to: '40' },
          { l: '放下反应堆——撤进逃生舱。', cond: { all: [ { knows: '逃生舱检查过' }, { noKnows: '已广播集合' } ] },
            say: '你回头扫了一眼——站里的人，还不知道要走。', to: '40' }
        ],
        /* QA ①-3：暗号串线（先匹配者为准） */
        tIf: [ { cond: { knows: '走私暗号' }, t: '逃生舱口，货运主管桑尼正把一箱星尘矿石往舱里塞——亮晶晶的矿石，在木星轨道上比金子还俏；安保队长铁头举着防暴棍，堵在另一边。\n旁边，三枚金色胶囊静静悬在发射轨道上；桑尼脚边，一台无人机"嗡"地悬起来，红点一闪一闪。\n"{me}，"桑尼笑着看你，眼睛却没笑，"你说，现在该怎么办？"\n你想起走廊深处那通电话："……货在仓库，别让人靠近。按原计划，灯一灭就动手。"仓库、货、灯灭——全串起来了。' } ] },

      /* ================= 第三幕 · 三个结局 + 两种失败结算 ================= */

      '41': { n: '结局 A · 圆满', endTag: '结局 A · 圆满', win: true,
        cg: { file: '../images/station/cg/ending-a.jpg', dismiss: 'keep' },   // B132（§6.7）：结局图常驻不关（读档回该结局即显示）
        /* QA ④-1/②-1：证据 4 档 × 广播 2 档（条件显式互斥、先匹配者为准；B57） */
        tIf: [
          { cond: { all: [ { item: '桑尼的账本' }, { item: '监控回放' }, { pinsAll: ['24'] } ] }, t: '你把证据摊在铁头面前——账本上的字、监控里那只手，还有桑尼脚边那箱星尘矿石。他再也笑不出来了。\n铐子"咔"地扣上。广播里，站长的声音很稳："反应堆稳定，全员安全。{me}，谢谢你。"\n—— 晨星号，重新亮起来了。' },
          { cond: { all: [ { item: '桑尼的账本' }, { item: '监控回放' }, { notPinsAll: ['24'] } ] }, t: '你把证据摊在铁头面前——账本上的字、监控里那只手，还有桑尼脚边那箱星尘矿石。他再也笑不出来了。\n铐子"咔"地扣上。广播里，一个轻柔的声音："反应堆稳定，全员安全——{me}，谢谢你。站长受了伤；等她好起来，我第一个告诉她，是你救了大家。"\n—— 晨星号，重新亮起来了。' },
          { cond: { all: [ { item: '桑尼的账本' }, { noItem: '监控回放' }, { pinsAll: ['24'] } ] }, t: '你把账本摊在铁头面前——「猫粮」进、「矿石」出，一笔一笔，全对得上。桑尼的笑容，一点点垮了下去。\n铐子"咔"地扣上。广播里，站长的声音很稳："反应堆稳定，全员安全。{me}，谢谢你。"\n—— 晨星号，重新亮起来了。' },
          { cond: { all: [ { item: '桑尼的账本' }, { noItem: '监控回放' }, { notPinsAll: ['24'] } ] }, t: '你把账本摊在铁头面前——「猫粮」进、「矿石」出，一笔一笔，全对得上。桑尼的笑容，一点点垮了下去。\n铐子"咔"地扣上。广播里，一个轻柔的声音："反应堆稳定，全员安全——{me}，谢谢你。站长受了伤；等她好起来，我第一个告诉她，是你救了大家。"\n—— 晨星号，重新亮起来了。' },
          { cond: { all: [ { noItem: '桑尼的账本' }, { item: '监控回放' }, { pinsAll: ['24'] } ] }, t: '你把监控回放亮到铁头眼前——画面里，桑尼拉下了主供电的保险丝。桑尼的笑容，一点点垮了下去。\n铐子"咔"地扣上。广播里，站长的声音很稳："反应堆稳定，全员安全。{me}，谢谢你。"\n—— 晨星号，重新亮起来了。' },
          { cond: { all: [ { noItem: '桑尼的账本' }, { item: '监控回放' }, { notPinsAll: ['24'] } ] }, t: '你把监控回放亮到铁头眼前——画面里，桑尼拉下了主供电的保险丝。桑尼的笑容，一点点垮了下去。\n铐子"咔"地扣上。广播里，一个轻柔的声音："反应堆稳定，全员安全——{me}，谢谢你。站长受了伤；等她好起来，我第一个告诉她，是你救了大家。"\n—— 晨星号，重新亮起来了。' },
          { cond: { all: [ { noItem: '桑尼的账本' }, { noItem: '监控回放' }, { pinsAll: ['24'] } ] }, t: '无人机的嗡嗡声停了。桑尼还没来得及跑，铁头已经堵住了舱门——"人赃并获！那箱矿石，就是最好的证据！"\n铐子"咔"地扣上。广播里，站长的声音很稳："反应堆稳定，全员安全。{me}，谢谢你。"\n—— 晨星号，重新亮起来了。' },
          { cond: { all: [ { noItem: '桑尼的账本' }, { noItem: '监控回放' }, { notPinsAll: ['24'] } ] }, t: '无人机的嗡嗡声停了。桑尼还没来得及跑，铁头已经堵住了舱门——"人赃并获！那箱矿石，就是最好的证据！"\n铐子"咔"地扣上。广播里，一个轻柔的声音："反应堆稳定，全员安全——{me}，谢谢你。站长受了伤；等她好起来，我第一个告诉她，是你救了大家。"\n—— 晨星号，重新亮起来了。' }
        ],
        /* 默认 t：全条件已显式覆盖（同上第 8 条），默认仅兜底 */
        t: '无人机的嗡嗡声停了。桑尼还没来得及跑，铁头已经堵住了舱门——"人赃并获！那箱矿石，就是最好的证据！"\n铐子"咔"地扣上。广播里，一个轻柔的声音："反应堆稳定，全员安全——{me}，谢谢你。站长受了伤；等她好起来，我第一个告诉她，是你救了大家。"\n—— 晨星号，重新亮起来了。' },

      '42': { n: '结局 B · 取舍', endTag: '结局 B · 取舍', win: true,
        cg: { file: '../images/station/cg/ending-b.jpg', dismiss: 'keep' },   // B132（§6.7）：结局图常驻不关（读档回该结局即显示）
        t: '桑尼钻进逃生舱。尾焰亮了一下，那小星很快就滑进了木星的阴影里——只留下一句"下次见"。\n站保住了，人也全都安全——只是，账还没算完。' },

      '43': { n: '结局 C · 撤离', scene: 'room-escapepod', endTag: '结局 C · 撤离', win: true,
        cg: { file: '../images/station/cg/ending-c.jpg', dismiss: 'keep' },   // B132（§6.7）：结局图常驻不关（读档回该结局即显示）
        /* QA ②-5/②-1：重启 × 站长（条件显式互斥、先匹配者为准；B58） */
        tIf: [
          { cond: { all: [ { knows: '反应堆已重启' }, { pinsAll: ['24'] } ] }, t: '三枚金色胶囊载着全站的人离开晨星号。\n回头看，站体像一颗刚点亮的小星星，慢慢转进木星的阴影里。\n站长拍拍你的肩："我们会回来的。"' },
          { cond: { all: [ { knows: '反应堆已重启' }, { notPinsAll: ['24'] } ] }, t: '三枚金色胶囊载着全站的人离开晨星号。站长受了伤，医务室的人守在一旁。\n回头看，站体像一颗刚点亮的小星星，慢慢转进木星的阴影里。\n身旁的人拍拍你的肩："我们会回来的。"' },
          { cond: { all: [ { noKnows: '反应堆已重启' }, { pinsAll: ['24'] } ] }, t: '三枚金色胶囊载着全站的人离开晨星号。\n回头看，站体像一颗熄灭的小星星，慢慢转进木星的阴影里。\n站长拍拍你的肩："我们会回来的。"' },
          { cond: { all: [ { noKnows: '反应堆已重启' }, { notPinsAll: ['24'] } ] }, t: '三枚金色胶囊载着全站的人离开晨星号。站长受了伤，医务室的人守在一旁。\n回头看，站体像一颗熄灭的小星星，慢慢转进木星的阴影里。\n身旁的人拍拍你的肩："我们会回来的。"' }
        ],
        /* 默认 t：全条件已显式覆盖（同上第 4 条），默认仅兜底 */
        t: '三枚金色胶囊载着全站的人离开晨星号。站长受了伤，医务室的人守在一旁。\n回头看，站体像一颗熄灭的小星星，慢慢转进木星的阴影里。\n身旁的人拍拍你的肩："我们会回来的。"' },

      /* 44：氧气归零的失败结算（由 resources[].fail.node 指定；引擎自动走入，复用失败界面）
       * 45：保险柜事件（R10）——9 号①开柜走进来；得授权卡 + 站长的便条（文本道具） */
      '44': { n: '失败 · 氧气耗尽', fail: true,
        t: '💨「眼前一黑……」氧气表的指针滑到了零。你听见很远的地方有人在喊你的名字——在『晨星号』上，这是最危险的声音。\n（提示：睡眠舱的氧气瓶、医务室的氧气站、中层大厅的补给柜，都是一次性补给，别忘了拿。）' },

      '45': { n: '保险柜', scene: 'room-captain',   // B119：房内后继事件——显式声明（与 pins '45' 同口径）
        t: '密码盘"咔"地转到最后一位——柜门弹开了。\n厚绒布上躺着一张备用的站长授权卡；旁边还压着一张折起来的便条，落款是伊莲娜。',
        moments: ['safe-open'],   // B126（§7.4.1-2）：柜门弹开＋授权卡＋便条（T58；@9 同图挂 mIf）
        en: { once: true, gain: ['站长授权卡', '站长的便条'] },
        c: [
          { l: '把东西收好，回中层大厅。', to: '20' },
          { l: '回站长室里看看。', to: '9' }
        ] }
    }
  };

/* ============================================================================
 * 数值表（设计档 §8.1/§8.2 定值；B01 体验层整改 + B02 探索化/支线代价落地 + B03 短线校正 + B09 三档重订）
 * ----------------------------------------------------------------------------
 * 开局（B09·B147 三档）：星币 简单 25 / 中等 20 / 困难 15；氧气 简单 500 / 中等 200 / 困难 80
 * 氧气消耗（账面口径合计 95 = 12×−5 + 2×−10 + 1×−15）：1 食堂 −5（en）｜2 睡眠舱翻找 −5（并入 en 净值 +10）｜
 *   4 健身房 撬急救箱 −5（4③ 选项；B02 探索化——进入不再自动扣）｜3 医务室搬运 −5（并入 en 净值 +5）｜5①钻沙发 −5｜7②拆芯片 −5｜
 *   11②开舱门 −5｜13 进入 −5（en）+ 关阀 −5｜15①合闸 −5｜
 *   16④爬道 −10 + ⑤翻零件堆 −5｜12 反应堆舱 −10/次（en）｜19 舱外 −15/次（en）｜39 焊接 −5（en）
 * （不在这 95 里的支线，按需自付）：9①开保险柜 −10（B65 短线校正：−5 → −10）｜16①机器人战 −5｜13③硬穿蒸汽 −10｜
 *   1③/7③ 重复劳动各 −5｜B02 新增：26①掰手腕 −5（唯一载体——4 号入口不另扣）｜16③拖工具箱 −5｜10①搬冷却剂 −5
 * 氧气补给（一次性，毛额）：2 睡眠舱氧气瓶 +15（净 +10）｜3 医务室氧气站 +10（净 +5）｜20 大厅补给柜 +5
 *   热食：观景厅赠 1 份；购买（简单最多 5 盒 / 中等 4 盒 / 困难 3 盒，看开局星币）× +10
 * 可得（B09 重算）：简单 500 + 30 +（热食 10+50）= 590（消耗 95，结余 495 ＝ 83.9%）；中等 200 + 30 +（10+40）= 280
 *   （结余 185 ＝ 66.1%）；困难 80 + 30 +（10+30）= 150（结余 55 ＝ 36.7%）——三档均走主线＋拿满补给＋吃掉热食。
 * 注：上表按「推荐主线」计；「保险柜短线」（不撬箱、跳过医务室、授权卡改走 9 号保险柜）——
 *   B09 起三档均可通（12 号入口前余：简单 495~500、中等 185~190、困难 55~60；入内 −10 后仍余 ≥45）——
 *   实测断言见 test.station.mjs §14-3。
 * 星币：花光只到 0，不判失败（fail: null）；失败资源仅氧气（44 号）
 * 收入：帮胖胖洗碗 +2（耗氧 5，可重复）｜给老布打下手 +2（耗氧 5，可重复）｜废料回收斗：卖 1 件 +1 枚
 * 支出：自动贩卖机（食堂）合成料理 5 枚、备用电池 5 枚｜收贿赂 +10（线索断，进反应堆舱会遭伏击）
 * 断循环：料理 5 枚 / +10 氧 = 2.0 氧每星币 ＜ 劳动 5 氧 / +2 枚 = 2.5 氧每星币
 *   ⇒「洗碗×3 → 买 → 吃」一轮净 −5 氧（净值恒负——断循环与档位无关；断言见 test.station.mjs）
 * 战斗武力：我方 焊接枪 +1 / 电击棒 +2 / 机械手套 +1 / 应急盾 +1（满配 5）+ 收编机器人 +1（满配 6）
 *           敌方 失控维修机器人 1 / 安保机器人 3 / 桑尼的无人机 6
 * B02：四场战斗（14①/16①/26①/40③）败北停留原地（loseTo＝战斗发生地）＋ battle.loseSay 败方描写；
 *   唯一例外 40③→42（结局 B，已登记迁移）。
 * B03：可见性＝可尝试（成事＋失败双条目，失败条零代价＋原地＋不可刷）／隐藏（cond 不足即不显示）；
 *   全关 lock／lockIf／lockText 归零（引擎能力保留——示例关 dalim.js 仍用 lock）。
 * ==========================================================================*/
})();
