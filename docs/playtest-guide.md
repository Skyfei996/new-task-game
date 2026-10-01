# 试玩与管理台使用指南（剧本打磨用）

> 归属：本文讲「怎么把剧本先玩明白、再下发美术」——无头试玩器（CLI）、网页管理台、给 AI 体验师下指令的模板。
> 关联：`tools/play.mjs`（无头试玩器）· `prototype/lab.html`（管理台）· `tools/build-lab.mjs`（管理台的文档数据源）· `prototype/engine.js`（两边共用的 Core 规则）

**一句话**：剧本先在这两个地方玩顺了再画图——`tools/play.mjs` 给终端与 AI 体验师用，`prototype/lab.html` 给人在浏览器里点着用；两边都用**同一份关卡数据 + 同一套 Core 规则**，所以「这边能过、那边也能过」。

---

## 一、无头试玩器 `tools/play.mjs`（终端 / AI，无浏览器、无 DOM）

```bash
node tools/play.mjs new station          # 开新局（普通模式，玩家名「林小晨」）
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

```
══ 当前位置 ══
1 · 食堂　【顶层】
──────
第一顿太空晚餐刚端起来，灯"啪"地全灭了。胖胖在黑暗里喊："别慌别慌——先别动，汤还热着呢！"

选项：
  1) 摸黑去中央大厅。　→ 18 中央大厅（顶层）
  2) 循着说话声摸过去。　→ 22 黑暗中的动静
  3) 留下帮胖胖洗碗（+2 信用点，耗氧 5）。　→ 1 食堂

状态：🪙 20　💨 100　⚔ 武力 0 ｜ 物品（0）：（空） ｜ 线索：（还没有）
进度：第 0 步 ｜ 已探索 1 处 ｜ 难度 普通 ｜ 玩家 林小晨
```

---

## 二、给「游戏体验师」Agent 下指令（可直接复制）

把下面这段整块丢给一个能跑命令的 Agent（把 `<关卡id>` 换成 `station` / `dalim`）：

```text
你是《空间站大停摆》的「游戏体验师」，为 10 岁玩家体验剧情，只报告、不改代码、不改关卡数据。

试玩工具（在项目根目录执行）：
  node tools/play.mjs new <关卡id>        # 开新局（要困难模式就加 --hard）
  node tools/play.mjs choose <序号>       # 选第几个选项（1 起）
  node tools/play.mjs where | items | log --tail 20
  node tools/play.mjs --json state        # 机器可读状态（含 choices 与 ok/why）

目标：不追最优解，像 10 岁玩家一样玩——
  ①至少走到一个结局（顺着提示走就好，卡住就换一条路，氧气/钱快没了也照玩）；
  ②至少故意失败一次（把氧气或信用点耗光，看看失败提示说不说人话）；
  ③至少走两条不同的支线（例如「帮老布找工具箱」和「从爬道自己拆芯片」各走一次）。

报告格式（每条都要带节点号；文案问题要引用原文）：
  1. 亮点：3 条最有趣的地方（哪个节点、为什么）
  2. 卡点：卡在哪、当时屏幕写了什么、你试了哪些选项、缺什么线索（含节点号）
  3. 无聊点：连续几步在重复同一动作 / 没有新信息的地方
  4. 文案问题：看不懂的句子、超纲的词、错别字、与前后矛盾的描述（引原文 + 节点号）
  5. 修改建议：按优先级排，写明「改哪个节点的哪条文案 / 哪个条件」，一条一句
最后附：你走过的节点序列（例如 1 → 18 → 2 → 18 → …）和结局编号。
```

小技巧：
- 让 Agent 先 `--json state` 拿选项清单，再决定 `choose` 几号；`ok=false` 的项别选（会报错）。
- 想让它复现你发现的某一步：`save bug.json` → 把文件发过去 → `load bug.json`。
- 想要可复现的随机冒烟：`auto --steps 40 --seed 7`（同种子同起点 → 输出完全一致）。

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
2. `node prototype/test.station.mjs`——数据完整性 + A 路线 + 防卡死（827 项）先过；文案稿要更新就 `node tools/export-copy.mjs`。
3. `node tools/play.mjs new station` 手动把受影响的分支走一遍（`--json` 适合边看边记）。
4. 把上面「游戏体验师」模板丢给 Agent 跑一轮，按报告改。
5. 剧本定稿后再动 `art/` 侧（管理台「美术需求」页能直接看到任务单与状态）。
6. 准备发布：`node tools/build-public.mjs`（含管理台与最新文档）。

**自测清单**（改完必跑）：

```bash
node prototype/test.core.mjs      # 525 项
node prototype/test.station.mjs   # 827 项
node prototype/test.play.mjs      # 231 项（试玩器 + 管理台数据源）
```
