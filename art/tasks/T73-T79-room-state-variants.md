# T73~T79 · 房间背景状态变体 · P4（7 张 · 免验收直入 · 批 A 先出）

> **状态：下发**（2026-10-04 · 老板裁定②：背景图随剧情**切到当前状态**——「人物消失／机器人被拖出架子／猫跑去仓库／站长被救后」等，背景图本身就该变；浮图只管剧情推进中的动作表情，「剧情过之后要切到当前状态的背景图，而不是一直盖着」）。
> 来源＝`art/requirements-v1.md` §4.4（正式行）；机制与场合枚举＝`docs/design-ui-v1.md` §7.10／§7.11；通用硬规则＝`art/requirements-v1.md` §0。
> **交付路径＝直接写入库目录**：`images/station/rooms/<资产 id>.jpg`（**不走 `art/deliveries/`**；文件名＝资产 id、固定，修改直接覆盖同名文件、不出 v2）。
> **无需人工验收，出图即生效**——出图前按下方通用要点自查（与扩图批 T57~T72 同一口径）。
> **批次**：**批 A（T73~T76）先出**（不换会明显穿帮/矛盾）；**批 B（T77~T79）随后**（批 A 交付后开工）。

**通用要点（本组所有图）**

1. **同构图硬约束**：与同房**基础图**（`images/station/rooms/<name>.jpg`）**同尺寸、同构图、同机位、同风格、同光照基调**——**只改「差分」列列出的状态元素**，其余逐处一致（界面编号点 pins 与浮现图锚点按原图标定、共用；构图一动全错）。
2. **出图前先读基准图**：本单每行「依赖」列即该房现役成图；照它画，只做减法/局部改动。
3. **画面中不得出现任何文字、数字、标签、水印**（单据/屏幕/铭牌/纸张一律色块或图形）。
4. **无透明通道（JPEG）**；单图 ≤1.5MB。
5. 风格基准＝`images/station/station-map-ai-v1.jpg`（等距剖面 / 扁平半立体 / 柔和阴影 / 明快配色）；出现角色/猫/机器人时形象参照 T05 立绘。

| 任务 | 资产 id | 交付路径（＝入库目录） | 尺寸 | 差分（相对基准图，**只动这些**） | 用途（房间·触发） | 批次 | 依赖（基准图） |
|---|---|---|---|---|---|---|---|
| T73 | `medbay-awake` | `images/station/rooms/medbay-awake.jpg` | 同 medbay（1659×948） | 伊莲娜靠床头坐起（苏醒、气色好转、额角仍包扎）＋阿雅作收冰袋状（用过的冰袋在手）；床/器械/窗景/盆栽等其余一致 | 3／24·pinsAll 24（站长苏醒后） | **A（先出）** | medbay.jpg（T17）＋T39 伊莲娜形象 |
| T74 | `maintenance-free` | `images/station/rooms/maintenance-free.jpg` | 同 maintenance（1659×948） | 右侧货架下——**移除卡住的小机器人**（含红色信号灯）；其余（中央红管、黄色吊梯、地面舱盖、工具台）一致 | 16／37·knows 机器人小帮手（收编后） | **A（先出）** | maintenance.jpg（T25） |
| T75 | `observation-catgone` | `images/station/rooms/observation-catgone.jpg` | 同 observation（1659×948） | 沙发与矮桌区——**移除银河与鼓起的零食袋**（可留一小撮猫毛或微乱座位，幅度从轻）；窗外木星/星空、沙发/绿植/地毯不变 | 5·chDone 跟胖胖打过招呼（猫离场后） | **A（先出）** | observation.jpg（T19） |
| T76 | `warehouse-clear` | `images/station/rooms/warehouse-clear.jpg` | 同 warehouse（1792×1121） | 左侧货架大半空（留零星箱）＋地面箱子叠起（打包状）＋右侧矿石木箱覆帆布（紫光被遮/透出一线）；卷帘门／叉车／警示线照旧 | 10·（收贿／到过 31／到过 32 任一） | **A（先出）** | warehouse.jpg（T12） |
| T77 | `gym-firstaid-open` | `images/station/rooms/gym-firstaid-open.jpg` | 同 gym（1659×948） | 右墙急救箱——**箱盖敞开、内为空**（红十字仍可辨）；铁头/器械/沙袋/跑步机等一致 | 4·chDone 急救箱开过 | B（随后） | gym.jpg（T18） |
| T78 | `captain-safeopen` | `images/station/rooms/captain-safeopen.jpg` | 同 captain（1792×1121） | 左侧保险柜——**柜门开一条缝、柜内空/微暗**（转盘照旧）；桌上咖啡杯/书架/舷窗照旧 | 9／45·chDone 开过保险柜 | B（随后） | captain.jpg（T11） |
| T79 | `escapepod-checked` | `images/station/rooms/escapepod-checked.jpg` | 同 escapepod（1659×948） | 右墙检查表——**三格全部打勾**（图形勾、无文字；色块由红/绿混排改为全绿＋勾）；胶囊/轨道/应急柜照旧 | 17·knows 逃生舱检查过 | B（随后） | escapepod.jpg（T26） |

**出图核对（免验收，仍可自查）**：① 文件存在且文件名＝资产 id；② 与基准图**同尺寸**（像素宽高一致）；③ 差分只动「差分」列列出的元素、其余逐处一致；④ 无文字/数字/水印；⑤ 交付后可在 `art/deliveries/notes.md` 记一行备查（可选）。

**三面一致**：`art/requirements-v1.md` §4.4 ↔ 本单 ↔ `art/status.md`「状态变体批」节（逐号）。
**入库后登记（实现轮，非美工）**：实测 `width/height`＋`variants` 条目（cond／image）＋`figures` 更新；口径＝`docs/design-ui-v1.md` §7.10。
