# B02 剧本 QA · 功能行报告（独立验收）

> 角色：QA·功能行——复核面＝「通不通、崩不崩、算得对不对」；立场＝**不复用实现者结论，逐项亲跑**。
> 复核对象：批次档 `docs/batches/B02-script-full-audit.md`（任务书）＋ `docs/design-station-v1.md` §10（10.1~10.5）与 §8.7 断言 11~14。
> 日期：2026-10-02 ｜ 环境：Windows · node v24.18.0 · 项目根 `D:\Study\MyProject\MyGame2`。

**边界与口径（先声明）**

- **未改任何产品代码与文档**：`prototype/**`、`docs/**` 既有文件一律只读；本行新建的唯一文件＝本报告（`.playtest/` 之外）。
- 临时脚本/日志全部在 `.playtest/`（清单见文末「披露」；该目录已进 `.gitignore`）。
- 一律**开发者视图**（并发裁定：`--player` 会话归「体验行」）；玩家视图的 `lockText` 呈现不在本行复核面（见 ② U2）。
- 「步数」＝会话 `steps` 计数器（`buy`／`choose`／`sell`／`auto` 各 +1；`save`／`load`／`state` 不计；本行走线未用 sell）。普通主线 48 = 4 买 + 4 吃 + **40 推进步**。
- 走线＝驱动脚本 `node .playtest/qa-walk.mjs <mode>` 逐条调真 CLI（`node tools/play.mjs …`），每步核对落点。全程 CLI 原始输出＋紧凑 trace 存 `.playtest/qa-walk-<mode>.log`；终端另打印带资源/步数的核对块。下文引用分「终端逐字行」与「transcript 逐字行」两类，均未改写（JSON 压缩展示处会当场注明；「…」表示省略中间行）。套件/冒烟/auto/探针的完整原始输出另存 `.playtest/qa-suites-and-probes.log`。
- 方法备注（如实披露）：驱动脚本自身有两处「期望步数」手算错误（side 45→49、failmed 47→49），修正后重跑通过——游戏侧无异常。

## ① 覆盖表

### 1.1 三套自测（亲跑）＋两套开发冒烟

| 套件 | 命令 | 结果 |
|---|---|---|
| core | `node prototype/test.core.mjs` | **569 通过 / 0 失败** |
| station | `node prototype/test.station.mjs` | **1343 通过 / 0 失败** |
| play | `node prototype/test.play.mjs` | **389 通过 / 0 失败** |
| dom 冒烟 | `node .playtest/dom-smoke.mjs` | 42 通过 / 0 失败 |
| lab 冒烟 | `node .playtest/lab-smoke.mjs` | 21 通过 / 0 失败 |

关键原文：

```text
$ node prototype/test.core.mjs
DOM id 引用检查：engine.js 引用 55 个 id，缺失 0 个

通过 569 项，失败 0 项。
```

```text
$ node prototype/test.station.mjs
———— §8.7 十条自动断言 ————
  断循环：20 轮净氧 = -100（一轮 -5）
  预算：消耗 95 ｜ 可得 普通 180 / 困难 100 ｜ 结余 普通 47.2% / 困难 5.00%
  主线跑通：简单 85 → 41 ｜ 困难 5 → 41（均不触失败）
  反例：困难保险柜短线 —— 无医务室：10 → 0 触底（不可通）｜补上医务室：15 → 5 可通（B02 数据口径）
  资源不为负：氧气 / 星币全程钳 ≥ 0；购买可到 0
  钱不判失败：coins.fail === null；归零不结算、不进 45
———— §8.7-11 B02 lint 五条（L1 同现 / L2 once 隐藏 / L3 跨层 / L4 代价 / L5 名词）————
  E12 两侧：灰显（lockIf 成立）⇄ 隐藏（lockIf 不成立）均通过
  战斗失败：4 场 loseSay＋原地（14/16/26）＋登记迁移（40③→42）；26① 唯一载体
  4 号探索化：en 删除；③/④ 双路显式、条件与共享 once 均通过
  机制落点：去向 4 / 新去向 9 / lockIf 15＋恒灰 11 / 完成态并 cond 7 / once 8 / learn 2 逐条通过

通过 1343 项，失败 0 项。
```

```text
$ node prototype/test.play.mjs
A 路线命令序列（48 条命令）：
  node tools/play.mjs new station
  node tools/play.mjs buy 合成料理   # 第 1 盒（-5 星币）
  …
通过 389 项，失败 0 项。
```

```text
$ node .playtest/dom-smoke.mjs && node .playtest/lab-smoke.mjs
DOM 冒烟：通过 42 项，失败 0 项。

通过 21 项，失败 0 项。
```

### 1.2 三条路径 + 两条边界反例（逐条走真 CLI）

| # | 路径 | 驱动命令 | 步数 | 结局 | 末氧 |
|---|---|---|---|---|---|
| P1 | 主线·普通（推荐路线） | `node .playtest/qa-walk.mjs normal` | 48 | **41 · 结局 A · 圆满** | 85 |
| P2 | 主线·困难（推荐路线，买满 3 盒） | `node .playtest/qa-walk.mjs hard` | 46 | **41 · 结局 A · 圆满** | 5 |
| P3 | 支线·保险柜线（普通） | `node .playtest/qa-walk.mjs side` | 49 | **41 · 结局 A · 圆满** | 80 |
| P4 | 反例·困难保险柜短线（无医务室） | `node .playtest/qa-walk.mjs fail` | 44 | **44 · 失败（氧气耗尽）** | 0 |
| P5 | 反例·困难保险柜短线（补上医务室） | `node .playtest/qa-walk.mjs failmed` | 49 | **41 · 结局 A · 圆满** | 5 |

P3 口径：不撬箱、不去医务室（3/24 号未进）、改走 9 号保险柜取「站长授权卡」；其余同推荐路线（含 5→28 账本链、12→34→40→41）。

**P1 原文（终局）**

```text
$ node tools/play.mjs choose 1
▶ 执行：1) 揭发他：把证据亮给铁头看。　（40 → 41）

41 · 结局 A · 圆满　【底层】　🏁 结局 A · 圆满
…
🏁 结局 A · 圆满
🎁 通关奖励：晨星号的星图（下一关的线索）
状态：🪙 0　💨 85　⚔ 武力 3 ｜ 物品（11）：…
进度：第 48 步 ｜ 已探索 23 处 ｜ 难度 普通 ｜ 玩家 林小晨
```

`--json state`（P1）：`"node": "41"` ｜ `"name": "结局 A · 圆满"` ｜ `"steps": 48` ｜ `"resources": { "coins": 0, "oxygen": 85 }`。

**P2 原文（终局）**

```text
transcript 尾（.playtest/qa-walk-hard.log）：
47. choose 1 → 41 ox=5
48. --json state → 41 ox=5

终端核对块：
✓ loc：期望 41 ｜ 实际 41
✓ steps：期望 46 ｜ 实际 46
✓ ox：期望 5 ｜ 实际 5
✓ 原文包含「🏁 结局 A · 圆满」
✓ PASS（transcript：.playtest/qa-walk-hard.log）
```

`--json state`（P2）：`"loc": "41", "steps": 46` ｜ `"resources": { "coins": 0, "oxygen": 5 }`。

**P3 原文（终局）**

```text
transcript 尾（.playtest/qa-walk-side.log）：
50. choose 1 → 41 ox=80
51. --json state → 41 ox=80

终端核对块：
✓ loc：期望 41 ｜ 实际 41
✓ steps：期望 49 ｜ 实际 49
✓ ox：期望 80 ｜ 实际 80
✓ PASS（transcript：.playtest/qa-walk-side.log）
```

`--json state`（P3）：`"node": "41"` ｜ `"name": "结局 A · 圆满"` ｜ `"loc": "41", "steps": 49` ｜ `"resources": { "coins": 0, "oxygen": 80 }`。

**P4/P5 边界对（同一路线 ± 医务室）**

```text
P4（无医务室）transcript 尾（.playtest/qa-walk-fail.log）：
45. choose 1 → 44 ox=0
46. --json state → 44 ox=0
终端核对块：
✓ loc：期望 44 ｜ 实际 44
✓ ox：期望 0 ｜ 实际 0
✓ bankrupt：期望 true ｜ 实际 true
--json state（节选）：`"loc": "44", "steps": 44` ｜ `"bankrupt": true, "zeroRes": "oxygen", "ended": "fail"`

P5（补上医务室）transcript 关键行（.playtest/qa-walk-failmed.log）：
47. choose 1 → 12 ox=5      ← 15 → 入内后 5，可通
50. choose 1 → 41 ox=5
```

### 1.3 五条数值断言（套件原文 + 本行独立复核）

原文（`node prototype/test.station.mjs`）：

```text
  断循环：20 轮净氧 = -100（一轮 -5）
  预算：消耗 95 ｜ 可得 普通 180 / 困难 100 ｜ 结余 普通 47.2% / 困难 5.00%
  主线跑通：简单 85 → 41 ｜ 困难 5 → 41（均不触失败）
```

独立复核（不引用套件代码）：

- **断循环**：自写探针 `node .playtest/qa-loop.mjs`（同加载方式走真引擎 Core；20 轮「洗碗×3 → 买 → 吃」；起点调高到 300 氧以隔离「触底钳位」）：

```text
模式：起点调高（隔离触底）　起点：氧气 295，星币 30
20 轮后：氧气 195，星币 50（普通）
20 轮净氧 = -100（一轮 -5）
判定：net ≤ 0 ⇒ 成立（刷不出来）
汇率（由数据推导）：料理 10/5 = 2.0 氧每星币 ＜ 劳动 5/2 = 2.5 氧每星币
```

  另：真实起点跑法（`node .playtest/qa-loop.mjs real`）实测**第 17 轮触底**、探针中止——原文：`实跑中止：第 17 轮「吃料理」：找不到可点选项：吃一盒合成料理（当前节点 44）`（见 `.playtest/qa-suites-and-probes.log`）。「刷不出来」的直观体现，非缺陷。

- **预算**：套件逐行核算全绿 + 本行 E2E 数字互证——P1 末氧 **85 = 180 − 95**；P2 末氧 **5 = 100 − 95**；
  P3 末氧 **80 = 85 − 5**（相对主线：省 4③ 撬箱 −5、少 3 号医务室净 +5、增 9① 开柜 −5 ⇒ 净 −5）。
- **余量**：85 / 180 = **47.2%**；5 / 100 = **5.00%**（与套件原文一致；本行手算核对 (180−95)/180≈47.2%、(100−95)/100=5.00%）。

### 1.4 引擎能力（E11 / E12 两侧）—— CLI 原文

**E11 战斗败北（16①，武力 0 < 1）**——`node .playtest/qa-walk.mjs e11`：

```text
▶ 执行：1) ⚔ 把卡住的机器人从货架底下拖出来。　（16 → 16）
  · -5 点氧气
  · ⚔ 你输了……（武力值 0 < 1）
  💬 机器人的轮子"呼"地一转，把你甩了个趔趄——它又缩回货架底下，灯泡似的眼睛一闪一闪。
```

判定：败方描写（`battle.loseSay`）以 💬 旁白渠道带出、**停留原地**（16 → 16）√。（同型第二条：随机跑中 26① 败北 → 回 4 健身房，见 1.5。）

**E12 甲侧（cond 假 + lockIf 真 ⇒ 灰显）**——`node .playtest/qa-walk.mjs e12a`（进入时未开门、未取冷却剂罐）：

```text
10 · 仓库　【中层】
…
选项：
  1) 🔒 直接动手搬一罐冷却剂。　→ 31 硬拿冷却剂　（灰：需要：知道铁头已开门、需要先没有：冷却剂罐）
  2) 🔒 把账本拍在他面前。　→ 32 账本把柄　（灰：需要：桑尼的账本、需要先没有：冷却剂罐）
  3) 接过他递来的"封口费"。　→ 33 收贿赂
  4) 先退出去，回中层大厅。　→ 20 中央大厅（中层）

$ node tools/play.mjs --json state
（以下为节选：压缩为单行展示、略去 kind/price/battle 与结尾 state 块；所引字段与字段值逐字未改）
"choices": [
    { "i": 1, "label": "直接动手搬一罐冷却剂。", "to": ["31"], "ok": false, "why": "需要：知道铁头已开门、需要先没有：冷却剂罐" },
    { "i": 2, "label": "把账本拍在他面前。", "to": ["32"], "ok": false, "why": "需要：桑尼的账本、需要先没有：冷却剂罐" },
    { "i": 3, "label": "接过他递来的\"封口费\"。", "to": ["33"], "ok": true, "why": "" },
    { "i": 4, "label": "先退出去，回中层大厅。", "to": ["20"], "ok": true, "why": "" }
]
```

说明：开发者视图显示机械理由（`需要：知道铁头已开门…`）；玩家向 `lockText`（数据 `prototype/levels/station.js:301`＝「（门禁还锁着——得先找人开门。）」）的呈现不在本行复核面（U2）。

**E12 乙侧（lockIf 假 ⇒ 隐藏）**——`node .playtest/qa-walk.mjs e12b`（经 13③ 硬穿取罐后重进 10 号；此时物品含 🧊 冷却剂罐）：

```text
$ node tools/play.mjs --json state
（以下为节选：压缩为单行展示、略去 kind/price/battle 与结尾 state 块；所引字段与字段值逐字未改）
"choices": [
    { "i": 1, "label": "接过他递来的\"封口费\"。", "to": ["33"], "ok": true, "why": "" },
    { "i": 2, "label": "先退出去，回中层大厅。", "to": ["20"], "ok": true, "why": "" }
]
```

判定：同一条「搬一罐冷却剂」由灰显（甲侧）转为**整项消失**（乙侧）√——两侧行为与 E12 语义一致。

### 1.5 边角探测

| 探针 | 命令 | 结果 |
|---|---|---|
| 随机（auto） | `node tools/play.mjs new station && node tools/play.mjs auto --steps 40 --seed 7`（另 `--seed 20261002 --steps 150`、`--seed 5 --steps 120`、复现跑 ×1） | 无崩溃、无卡死；见下 |
| 失败·氧气 | `node .playtest/qa-walk.mjs fail` | 44 号触底（见 1.2 P4） |
| 失败·剧情 | `node .playtest/qa-walk.mjs bribe29`（收封口费 → 进 12） | 29 号被制服（`"ended": "fail"`） |
| 重复进入 | `node .playtest/qa-walk.mjs reenter` | 2 号二次进不再给物；13 号①③关闭后仍剩活出口 |
| 存档恢复 | `node .playtest/qa-walk.mjs saverestore` | save → 前进 → load 回到拍点（步数 4→2） |
| 无活选项 | 重进 13 号 + 全 transcript 扫 `"deadEnd": true`（无命中） | 未见走投无路状态 |

原文要点：

```text
# 随机 ① seed 7（40 步；终端输出）
走了 40 步　｜　停在 16 · 维修区　｜　步数用尽
# 其中 19. 26 挑战铁头 → 1) ⚔ 用力！ ⇒ 4 健身房　[-5 点氧气；⚔ 你输了……（武力值 0 < 1）]　💬 铁头把哑铃…
# 随机 ② seed 20261002（上限 150）
走了 99 步　｜　停在 44 · 失败 · 氧气耗尽　｜　💀 氧气耗尽
# 随机 ③ seed 5（上限 120）
走了 55 步　｜　停在 44 · 失败 · 氧气耗尽　｜　💀 氧气耗尽
# 同种子复现：seed 7 连跑两次，终态一致（🪙 36 💨 65、同物品/线索、第 40 步）
```

```text
# 重复进入（2 号）：两次进入氧不变（105 → 105，第二次不再给物；transcript 行）
3. choose 2 → 2 ox=105
5. choose 2 → 2 ox=105
# 重复进入（13 号，硬穿取罐后重进）：①③ 关闭，剩 1 灰 + 1 活（不构成走投无路）
选项：
  1) 🔒 系上绳索，贴着管壁挪过去。　→ 21 中央大厅（底层）　（灰：需要：绳索）
  2) 先回底层大厅。　→ 21 中央大厅（底层）
```

```text
# 存档恢复（CLI 原文行 + transcript 行）
$ node tools/play.mjs save .playtest/qa-snap.json
💾 已保存会话快照：D:\Study\MyProject\MyGame2\.playtest\qa-snap.json
（随后前进到 20 号）
$ node tools/play.mjs load .playtest/qa-snap.json
📂 已载入快照：…（2026-10-02T00:41:21.742Z）      ← 路径此处从略
4. save .playtest/qa-snap.json → 2 ox=105
7. load .playtest/qa-snap.json → 2 ox=105          ← 回到拍点
9. --json state → 2 ox=105
（步数回退 4→2：终端核对 ✓ steps：期望 2 ｜ 实际 2；JSON 亦示 `"steps": 2`）
```

```text
# 剧情失败（收封口费 → 反应堆舱伏击；CLI 原文行）
▶ 执行：1) 你刚踏进来，身后的舱门"咔哒"一声锁上了……　（12 → 29）
--json state（节选）：`"loc": "29", "steps": 8` ｜ `"bankrupt": false, "zeroRes": null, "ended": "fail"`
```

## ② 缺陷单

**本轮功能缺陷 = 0 条。**（判定口径：与设计档 §10/§8.7 或任务书相抵的行为；UX/文案类发现归「体验行」，本行不重复计。）

**观察与登记项（非缺陷；含不确定项，如实标注）**：

| # | 类型 | 内容 | 处置/状态 |
|---|---|---|---|
| O1 | 文档口径（已同步） | 本行开跑时设计档 §8.2/§8.7-3 为旧口径（「85 − 10 = 75」「补上医务室恰好归 0」）；成稿复核时该档已更新为 **v3.4 事实口径**（`design-station-v1.md:234`／`:277`：85 − 5 = 80、15 → 5 可通，与本行实测逐字相符）；旧字样仅存 B01 批次档 `:139`／`:223`（记录面，不回改） | 已同步（本行实测 P3/P4/P5 与现档一致）；非缺陷 |
| O2 | 口径说明 | 实现者自报「40 步走通结局 41」：会话计数器实测 48（含 4 买 + 4 吃）；「推进步」口径＝40，与自报相符 | 非缺陷，口径对齐 |
| U1 | 已复核（副本注入） | 「L1~L5 各抓反例」以副本注入独立复核——五条全部变红（逐条命中见下方「U1 明细」）；产品文件零改动，副本在 `.playtest/qa-mut/`，原文见 `.playtest/qa-mut-injection.log` | **已复核**（五条全红；基准 1343/0） |
| U2 | **不确定·边界外** | 玩家视图 `lockText` 呈现（`--player`）未复核——并发裁定玩家会话归「体验行」；数据层 `lockText` 存在（`station.js:301` 等）且套件 lockText 扫描全绿 | 玩家面呈现**未由本行复核** |
| O3 | 观察 | 开发者视图对灰显项显示机械理由（如「需要：知道铁头已开门」）——E10 设计使然（玩家视图换 `lockText`），非泄漏 | 非缺陷 |
| O4 | 观察 | 随机试玩 3 个种子中 2 个以氧气耗尽结束（55/99 步）——随机策略的正常结果；无卡死、无崩溃 | 非缺陷 |

**U1 明细（副本注入；`.playtest/` 内副本，产品文件零改动；原文见 `.playtest/qa-mut-injection.log`）**

- L1：胖胖塞 5 号 ⇒「角色多地同现：pangpang 距 5 号 pin 1113px > 150px」
- L2：去 5① once ⇒「5「钻到沙发后面」缺 once／lockIf／完成态条件」
- L3：15② 目标改 20 ⇒「跨层跳跃（白名单外）：15(deck3) → 20(deck2)「回底层大厅。」」
- L4：26① 去 fx ⇒「4① 命中力气动作但代价不足」＋B18「唯一载体」断言 2 条（26① −5 缺失、败北 −5 缺失）
- L5：5 号提前引「货单」⇒「引用早于首现／超出允许集：货单 → 5」

## ③ 一句话结论

**三套自测全绿（569/1343/389）；五条数值断言与设计一致（−100／95·180·100／47.2%·5.00%）；三条路径（普通 48 步·困难 46 步·保险柜线 49 步，均抵 41 号结局 A）与两条边界反例（10→0 触底 44／15→5 可通）全部走通；E11·E12 两侧行为与设计一致；边角探测未见崩溃/卡死——功能面 0 缺陷；L1~L5 已以副本注入复核（U1），未复核仅剩玩家视图 `lockText`（U2，并发裁定不在本行面）。**

---

### 披露：本行产生的临时文件（均在 `.playtest/`，已进 `.gitignore`）

| 文件 | 用途 |
|---|---|
| `.playtest/qa-walk.mjs` | 走线驱动（逐条调真 CLI，核对落点/终局） |
| `.playtest/qa-walk-*.log`（11 份） | 各走线全程 transcript（normal / hard / side / fail / failmed / e11 / e12a / e12b / bribe29 / reenter / saverestore） |
| `.playtest/qa-loop.mjs` | 断循环独立探针（自写，走真引擎 Core；隔离/真实两模式） |
| `.playtest/qa-snap.json` | 存档恢复探针的 save 快照 |
| `.playtest/qa-suites-and-probes.log` | 五套自测＋断循环探针（两模式）＋auto（3 种子＋同种子复现）的完整原始输出 |
| `.playtest/qa-capture.mjs` | 证据档重建脚本（生成 qa-suites-and-probes.log） |
| `.playtest/qa-inject.mjs` | 副本注入驱动（L1~L5 反例抓取复核） |
| `.playtest/qa-mut-injection.log` | 五条注入的命中证据（基准 + 5 例；副本收尾已还原） |
| `.playtest/qa-mut/**` | 注入用临时副本（prototype/images/docs 的拷贝；产品文件零改动） |
| `.playtest/session.json` | 开发者会话（本行走线所写；CLI 常规产物） |

另注：`.playtest/dom-smoke.mjs`、`.playtest/lab-smoke.mjs`（实现轮产物，本行仅运行、未改动）与 `.playtest/player-session.json`（体验行会话，非本行产生）不属本行产物，列此以对齐目录。
