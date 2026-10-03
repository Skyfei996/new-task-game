# T57~T64 · 扩图浮现图 · P3d（8 张 · 免验收直入）

> **状态：下发**（2026-10-04 · 老板裁定：扩图候选 16 项**免勾选、全部直接下发**）。
> 来源＝`art/candidates-v1.md`（本单＝建议顺序 1~8）；通用硬规则＝`art/requirements-v1.md` §0；机制（触发/呈现/命名）＝`docs/design-ui-v1.md` §7／§7.4.1。
> **交付路径＝直接写入库目录**：`images/station/moments/<资产 id>.jpg`（**不走 `art/deliveries/`**；文件名＝资产 id、固定，修改直接覆盖同名文件、不出 v2）。
> **无需人工验收，出图即生效**——出图前按下方通用要点自查（老板原话：「做完之后也不用我验图了，你直接入库……我在游戏上直接体验就好了」）。

**通用要点（本组所有图）**

1. **画面中不得出现任何文字、数字、标签、水印**（单据/屏幕/铭牌/纸张一律色块或图形）。
2. **无透明通道**（JPEG）：主体居中、四周渐隐（无可辨识硬边）；发光体点缀允许「黑底＋亮部」。
3. **尺寸**：竖构图 800~1024 × ≤1280px、≤0.8MB；横构图 1600~2048px、≤1.5MB。
4. **风格**：基准＝`images/station/station-map-ai-v1.jpg`（等距扁平半立体、柔和阴影）；出现角色/猫/机器人时形象参照 T05 立绘。
5. **呈现分配**（登记用，画风不必为此改动）：横构图场景类＝界面按圆角卡呈现；竖构图对象/角色张＝柔边椭圆。
6. 依赖列＝**风格衔接参考（不阻塞开工）**：相关内景到货优先参考；未到货按风格基准图与邻近已交付图先行。
7. 交付后可在 `art/deliveries/notes.md` 记一行备查（可选）。

| 任务 | 资产 id | 交付路径（＝入库目录） | 尺寸 | 构图/画面要点 | 用途（节点·条件） | 优先级 | 依赖（风格参考） |
|---|---|---|---|---|---|---|---|
| T57 | `power-restore` | `images/station/moments/power-restore.jpg` | 横 | 主供电闸门推上：整站灯一排排亮起、暖光回涌（走廊灯依次点亮） | 36（合闸成功） | 高 | T24 内景、T08/T09（灯亮） |
| T58 | `safe-open` | `images/station/moments/safe-open.jpg` | 竖 | 保险柜门弹开：厚绒布上摆着授权卡＋折起的便条（柜内小暖光、尘埃） | 9（开柜成功）／45 | 高 | T11 站长室内景 |
| T59 | `panel-weld` | `images/station/moments/panel-weld.jpg` | 横 | 破洞面板＋弧光在木星的光里一闪一闪（近景；小帮手代焊版同图） | 19（焊好成功）／39 | 高 | T04（已入库） |
| T60 | `broadcast` | `images/station/moments/broadcast.jpg` | 横 | 你对着控制台话筒广播——站内走廊的回音（声波/光纹示意；空荡的站） | 8（广播） | 中高 | T21 通讯舱内景 |
| T61 | `locker-emergency` | `images/station/moments/locker-emergency.jpg` | 竖 | 拽开卡死的柜门、应急包微光（手电/工牌/氧气瓶的轮廓光） | 2（首访） | 中 | T16 睡眠舱内景 |
| T62 | `chip-extract` | `images/station/moments/chip-extract.jpg` | 竖 | 工具柜里拆下防静电袋中的芯片（柜内冷光聚光、微光） | 30 | 中 | T20 实验室内景 |
| T63 | `gear-locker` | `images/station/moments/gear-locker.jpg` | 竖 | 安保柜打开：磁力靴＋电击棒（黄黑警示色） | 11（取柜） | 中 | T14 气闸舱内景 |
| T64 | `spec-pickup` | `images/station/moments/spec-pickup.jpg` | 竖 | 手电光束下捡起墙角那页纸（检修单；纸面＝色块） | 12③ | 中 | T13 反应堆舱内景 |

**出图核对（免验收，仍可自查）**：文件存在且文件名＝资产 id；尺寸在区间内；无文字。三面一致＝`art/requirements-v1.md` §4.3 ↔ 本单 ↔ `art/status.md`。
