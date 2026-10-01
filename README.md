# 你有一个新任务！· 网页版

把儿童实体书《你有一个新任务！》的关卡玩法做成的**网页版迷你开放世界 RPG**（家庭自用原型）。
一张剖面场景图 + 网状任务点 + 道具门槛 + 货币经济 + 多线结局，全部数据驱动，换一份数据就是一关。

**在线体验（GitHub Pages）**：
- 🎮 游戏：https://skyfei996.github.io/new-task-game/
- 🧪 管理台（纯文字试玩器 / 设计资料 / 美术需求）：https://skyfei996.github.io/new-task-game/prototype/lab.html
- 📋 试玩报告：[docs/playtest-01-report.md](docs/playtest-01-report.md)

## 两个关卡

| 关卡 | 说明 |
|---|---|
| **《空间站大停摆》**（原创 L1） | 木星轨道的中继站突然断电，你要在氧气耗尽前重启反应堆、揪出搞鬼的人。45 个任务点、双资源（信用点 + 氧气）、8 位乘员、3 个结局 |
| **《勇闯大里姆》**（Demo，实体书转写） | 把书上的关卡 3 完整搬到网页：57 个任务点、22 件道具、20 个编号点、多线结局——用来验证玩法与手感 |

## 怎么玩

- **在线**：打开上面的 Pages 链接（手机也能玩，有竖屏布局）
- **本地**：双击 `prototype/index.html`（纯静态、无需服务器）
- 进度自动存在浏览器本地（按关卡独立），随时关掉随时继续
- **不打开浏览器也能玩**：`node tools/play.mjs new station`——无头试玩器，给终端与 AI 体验师用（规则与网页版同一套）
- **管理台（试玩 + 设计资料 + 美术需求）**：双击 `prototype/lab.html`，纯文字试玩剧情、翻设计档与美术任务单（详见 `docs/playtest-guide.md`）

## 目录结构

```
prototype/            引擎与关卡数据（纯静态，无构建）
  engine.js           引擎：纯核心 Core（可 Node 直接测）+ DOM 层
  index.html          入口（关卡选择页）
  style.css           样式（含手机布局）
  lab.html            管理台：试玩器 + 设计资料 + 美术需求（纯文字，file:// 双击可用）
  lab.js / lab.css    管理台的交互与样式（复用 Core，不复用游戏 DOM）
  lab-docs.js         管理台的文档数据源（tools/build-lab.mjs 内嵌生成，勿手改）
  levels/dalim.js     关卡数据：Demo《勇闯大里姆》
  levels/station.js   关卡数据：原创《空间站大停摆》
  test.core.mjs       自测：Demo 关卡 525 项断言
  test.station.mjs    自测：原创关卡 827 项断言
  test.play.mjs       自测：无头试玩器 + 管理台数据源 231 项断言
images/               关卡素材（场景图、人物卡）
docs/                 设计文档（关卡设计档、任务点网络、试玩指南、文档地图）
art/                  与 AI 美工的协作目录（任务单 / 交付 / 状态表）
tools/                工具：试玩器 play.mjs、管理台数据源 build-lab.mjs、编号检测、场景图生成、发布打包
```

## 自测与打包

```bash
node prototype/test.core.mjs       # Demo 关卡：525 项
node prototype/test.station.mjs    # 原创关卡：827 项
node prototype/test.play.mjs       # 试玩器 + 管理台数据源：231 项
node tools/play.mjs new station    # 终端里试玩（无浏览器；用法见 docs/playtest-guide.md）
node tools/build-lab.mjs           # 重生成管理台的文档数据源（node tools/build-public.mjs 会自动跑）
node tools/build-public.mjs        # 打包体验版到 dist/（两关；顺带刷新文档与管理台）
node tools/build-public.mjs --original-only   # 只打原创关卡
```

## 发布到线上（GitHub Pages）

```bash
node tools/publish-github.mjs    # 源码 → main 分支；体验版 → gh-pages 分支；并自动请求 Pages 构建
```

- 线上地址：https://skyfei996.github.io/new-task-game/ （由 `gh-pages` 分支提供）
- 脚本走 GitHub REST API，令牌从 git 凭据管理器读取（不写入任何文件）；支持增量发布（远端已有的提交不重发）
- 为什么不用 `git push`：本机直连 `github.com:443` 不通，而 `api.github.com` 可通

## 说明

- 本项目为**家庭自用原型**，仅供个人体验与反馈。
- `images/` 中的《勇闯大里姆》相关素材来自实体书翻拍/截取；原始书页照片未入库。**请勿公开传播**。
- 原创关卡《空间站大停摆》的场景图由 AI 生成、设计与数据为本项目原创。
