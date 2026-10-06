# 试玩与管理台使用指南（剧本打磨用）

> 归属：本文讲「怎么把剧本先玩明白、再下发美术」——无头试玩器（CLI）、网页管理台、给 AI 体验师下指令的简报。
> 关联：`tools/play.mjs`（无头试玩器）· `prototype/lab.html`（管理台）· `tools/build-lab.mjs`（管理台的文档数据源）· `prototype/engine.js`（两边共用的 Core 规则）
> v2（2026-10-01）：体验师升级为**三人设 + 硬隔离 + 每 15 步玩家日记 + 固定报告结构**（§二）；试玩器新增 `--player` 玩家模式与 `read`。

**一句话**：剧本先在这两个地方玩顺了再画图——`tools/play.mjs` 给终端与 AI 体验师用，`prototype/lab.html` 给人在浏览器里点着用；两边都用**同一份关卡数据 + 同一套 Core 规则**，所以「这边能过、那边也能过」。

---

## 一、无头试玩器 `tools/play.mjs`（终端 / AI，无浏览器、无 DOM）

```bash
node tools/play.mjs new station          # 开新局（默认中等模式，玩家名「林小晨」；--easy / --hard 选档）
node tools/play.mjs new station --hard --name 小豆
node tools/play.mjs choose 3             # 执行当前可见选项里的第 3 个（1 起；灰显项也算序号）
node tools/play.mjs state                # 一屏状态 + 详细（位置/资源/物品/线索/武力/步数）
node tools/play.mjs where | items | log --tail 5
node tools/play.mjs save my-run.json     # 存快照（复现问题）
node tools/play.mjs load my-run.json
node tools/play.mjs auto --steps 40 --seed 7   # 随机冒烟：卡死会停下并报出来
node tools/play.mjs help
```

- **规则不重写**：试玩器把 `prototype/levels/<关卡>.js` + `prototype/engine.js` 一起塞进 Node 的 `vm`，直接用 `GameCore`——条件、效果、战斗、随机、商店/购买、区域切换、失败结算与网页版完全同序。
- **会话**：存在项目根的 `.playtest/session.json`（已进 `.gitignore`）。每敲一条命令就地存档，随时可以接着玩。
- **选项序号**：序号 = 屏幕上列出的顺序（**灰显项也占一个序号**）。执行不可执行的选项会**报清晰错误并且不改动任何状态**（不静默跳过）。
- **商品价格类选项**（如 Demo 关的腕带）：每个价格各占一个序号，点哪个付哪个。
- **退出码**：`0` 正常；`1` 明确错误（选项不可执行、序号越界、没开局……）；`3` `auto` 撞上「没有可执行的选项」的卡死。

### 玩家模式 `--player`（体验师专用，v2）

```bash
node tools/play.mjs --player new station          # 开新局（玩家视角）
node tools/play.mjs --player choose 3
node tools/play.mjs --player state               # 玩家版一屏
node tools/play.mjs --player read 桑尼的账本      # 翻看文本道具
```

- **与真实玩家所见一致**：资源读数＝氧气（文本条＋数值＋档位词）、星币（数字式「🪙 星币 <N>」——B78）；隐藏武力面板、步数与计数、机械理由；选项呈现与真实玩家一致（站关两态、无灰显／无 `lockText`——B03；示例关灰显沿原书口径）。**例外**：战斗选项显示与真实玩家一模一样的「你的武力值 X ≥/< Y」对照（引擎自带，不隐藏）。
- **档位基准**（便于复算）：氧气档位词按**本档开局值**（简单 500 / 中等 200 / 困难 80——B09·B147）的百分比取段（≥50「还好」/ 20~49「有点闷」/ <20「快喘不上气」）；星币＝数字式余额（无档位词——B78）。
- **编号与去向口径**（R2 ①）：场景号、去向编号、去向节点名一律不上屏（与真实玩家一致）；报告里用节点名／场景名定位。
- **禁用**：`--json`、`load`、`auto`（防止试探式重试）；`save` 可用（留证据复现）。
- **独立会话**：存 `.playtest/player-session.json`，不覆盖开发用的 `session.json`。
- **读文本道具**：`read <道具名>`；未拥有会明确报错。

### 给 AI 的 JSON 模式

```bash
node tools/play.mjs --json state
node tools/play.mjs --json choose 2
```

`--json` 可放在任意子命令前；输出一个 JSON 对象：

| 字段 | 含义 |
|---|---|
| `node` / `name` / `text` | 当前节点号 / 名称 / 正文（`{me}` 已替换成玩家名） |
| `scene` / `sceneName` | 场景 id / 场景标签（顶层 / 中层 / 底层 / 站外） |
| `choices[]` | `{ i, label, to[], ok, why, kind, price, battle }`——`i` 是执行时回传的序号；`ok=false` 时 `why` 写了缺什么 |
| `state` | `loc` / `steps` / `diff` / `me` / `resources{}` / `items[{id,icon,nosell}]` / `clues[]` / `atk` / `bankrupt` / `ended` / `visited` / `deadEnd` |
| `events` / `log` / `auto.trail` | 本次动作产生的效果 / 操作流水 / 自动试玩的逐步轨迹 |

`kind` 取值：`move`（普通移动）、`battle`（战斗，`to=[胜,负]`）、`random`（50/50）、`back`（返回上一处）、`price`（价格类）。

### 一屏长什么样

```text
══ 当前位置 ══
1 · 食堂　【顶层】
──────
第一顿太空晚餐刚端起来，灯"啪"地全灭了。黑暗里，你听见"嘶——"的一声长音：空气正在漏走（氧气 −5）。
胖胖在黑暗里喊："别慌别慌——先别动，汤还热着呢！"

选项：
  1) 摸黑去中央大厅。
  2) 循着说话声摸过去。
  3) 留下来帮胖胖洗碗。（挣几个星币，就是要费点力气。）
  4) 坐下来吃一盒合成料理（+10 氧气）。

🛒 商店（点开）：合成料理 5、备用电池 5　（选项优先，商店/回收默认折叠）
状态：🪙 星币 20　💨 氧气 195　⚔ 武力 0 ｜ 物品（0）：（空） ｜ 线索：（还没有）
进度：第 0 步 ｜ 已探索 1 处 ｜ 难度 中等 ｜ 玩家 林小晨
```

（上图为 v2 目标形态；体验师用 `--player` 看到的则是隐藏数值与去向编号的玩家版。）

---

## 二、给「游戏体验师」Agent 下指令（v2：三人设 · 硬隔离）

**硬隔离（三份简报共用，必须先声明）**：

- **独立会话启动**（零上下文）：除交给它的简报外，不读任何项目文件——不读代码、设计文档、文案稿、历次试玩报告。
- **只允许用试玩器 CLI 的玩家模式**：`node tools/play.mjs --player …`；禁止 `--json`、`load`、`auto`，禁止直接看数据文件。
- **禁止重试掩盖失败**：卡住 / 耗死 / 看不懂，就照原样记录；要复现先 `save <文件>` 留证据，再继续玩。
- **只讲人话**：报告不写机制分析；不问人。

**节奏纪律（每 15 步写一次玩家日记，写在对话里，不要攒到最后）**：

```text
[第 N 步] 我现在正想：____ ｜ 感受 x/5 ｜ 想不想放弃：是/否 ｜ 原话："____"
```

**报告固定结构**（玩到一个结局、或连续卡住后写）：

1. 我走了多少步、到了哪个结局、什么难度
2. 我想放弃的时刻（第几步、当时屏幕上写了什么、为什么）
3. 最开心 / 最好笑的地方；最无聊的地方
4. 看不懂的词或句子（引原文）；害怕 / 不喜欢的内容
5. 如果有魔法，我会改什么（最多 5 条）
6. 会不会再玩一次？为什么

附：走过的编号序列（例如 1 → 18 → 2 → …）。

**使用方式**：一份完整简报 = 「硬隔离 + 节奏纪律 + 报告结构」三段 + 下面任一人设段，整块丢给一个独立会话。

### 简报 A · 🧒 10 岁小孩

```text
你是 10 岁的玩家，暑假第一次玩这个太空站小游戏。好奇、没耐心，只做看起来有趣的事；看不懂的词就跳过，不喜欢的就不做。

工具（在项目根目录执行，只能用这些）：
  node tools/play.mjs --player new station        开新局（中等）
  node tools/play.mjs --player choose <序号>      选第几个选项
  node tools/play.mjs --player state              看一眼现在的样子
  node tools/play.mjs --player read <道具名>      翻看手里的东西

不追最优解，想到什么就点；氧气快没了也照玩。
```

### 简报 B · 👨‍👩 陪玩家长

```text
你是一位陪玩家长。孩子（8~12 岁）正坐在你身边玩这个太空站小游戏，你一边看一边自己也上手试。

工具（同上）：node tools/play.mjs --player new station / choose <序号> / state / read <道具名>

重点回答：孩子能不能自己玩下去？哪里会卡死？有没有看不懂、吓人、或鼓励乱花钱 / 危险行为的内容？你会在哪一步忍不住想接管？
每 15 步额外写一句："如果我是孩子，我这时会怎么想"。
```

### 简报 C · 🗺️ 全收集型

```text
你是「全收集型」玩家：想把每个房间都进一遍、每样东西都拿齐、每个选项都试过。

工具（同上）：node tools/play.mjs --player new station / choose <序号> / state / read <道具名>

重点回答：哪里让人"不知道该干嘛"？哪里提示不足、哪里提示过度？有没有看着能拿、却永远拿不到的东西？
迷路或重复跑腿时，把抱怨原样写下来。
```

小技巧：

- **调试才用 `--json`**：`node tools/play.mjs --json state` 拿选项清单（体验师模式禁用）；`ok=false` 的项别选（会报错）。
- 想复现某一步：`save bug.json` → 把文件发给修的人 → `load bug.json`。
- 随机冒烟（开发自查）：`auto --steps 40 --seed 7`（同种子同起点 → 输出完全一致）。
- **复测**：整改完成后，三个人设各再加跑一局 `--player new station --hard`，产出**简单 + 困难两份**报告。

---

## 三、网页管理台 `prototype/lab.html`

**双击打开就行**（`file://`，不用起服务器）。顶栏三个标签页：

| 标签页 | 内容 |
|---|---|
| **试玩器** | 纯文字推进：正文 + 当前位置 + 可选项（灰显=条件不足，按钮上写了缺什么）+ 状态面板（资源/物品/线索/武力/步数）+ 操作流水。按钮：开新局（关卡/难度/玩家名）、重开本关、生成/载入快照（一段文本，用来复现问题） |
| **设计资料** | `docs/` 下的设计文档，点左边标题看正文（标题/段落/列表/表格/代码块/引用） |
| **美术需求** | `art/tasks/*.md` 任务单 + `art/status.md` 状态总表 + `art/scene-architecture.md` |

- ⚙ **与网页版共用同一套 Core 规则**（`prototype/engine.js`）：管理台只是把地图和图片换成文字，判定结果与网页版一致；管理台的进度单独存在自己那个浏览器键里，**不覆盖**网页版进度。
- 📄 文档页是**只读快照**：文档正文由 `tools/build-lab.mjs` 内嵌进 `prototype/lab-docs.js`（本地 `fetch` 会被浏览器拒绝，所以必须内嵌）。改了 `docs/` 或 `art/` 下的 .md 之后，重跑一次：

```bash
node tools/build-lab.mjs        # 或 npm run lab
```

- 打包体验版时 `node tools/build-public.mjs` 会自动跑这一步，并把管理台一起放进 `dist/prototype/`。

---

## 四、改剧情的工作流（推荐）

1. 改 `prototype/levels/station.js`（剧情文案、选项、条件、数值都在这一份数据里）。
2. `node prototype/test.station.mjs`——数据完整性 + 主线路线 + 防卡死先过；文案稿要更新就 `node tools/export-copy.mjs`。
3. `node tools/play.mjs new station` 手动把受影响的分支走一遍（开发视角，`--json` 边看边记）。
4. 按 §二 的三份**人设简报**（10 岁小孩 / 陪玩家长 / 全收集型）各开一个独立会话跑一轮，按报告改。
5. 剧本定稿后再动 `art/` 侧（管理台「美术需求」页能直接看到任务单与状态）。
6. 准备发布：`node tools/build-public.mjs`（含管理台与最新文档）。

**自测清单**（改完必跑；数量以实际输出为准，必须全绿）：

```bash
node prototype/test.core.mjs      # 示例关自测（改动引擎后必跑）
node prototype/test.station.mjs   # 空间站自测（含氧气预算/循环/前置等断言）
node prototype/test.play.mjs      # 试玩器 + 管理台数据源
```
