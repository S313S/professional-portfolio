## 项目概览

这是一个个人品牌/专业作品集前端项目，主体是围绕 `Xiao Ci - AI Builder` 的长页叙事型作品集。页面不是传统静态简历，而是由多段全屏沉浸式交互串联而成：主页丝带文字动效、个人介绍、经验入口、视频滚动转场、成长路径、职业旅程、职业详情、作品展厅、作品详情，以及最终的友人帐互动区。

项目来源说明仍保留了 AI Studio 模板痕迹，但当前代码已经演化为定制作品集。`README.md` 里的本地运行方式仍然有效。

## 技术栈

- 构建工具：Vite 6，开发服务默认使用 `3000` 端口。
- 前端框架：React 19，入口在 `src/main.tsx`。
- 语言：TypeScript，`tsconfig.json` 使用 bundler module resolution、`jsx: react-jsx`、`noEmit`。
- 样式：Tailwind CSS 4，通过 `@tailwindcss/vite` 接入；全局样式和本地字体在 `src/index.css`。
- 动效与交互：`motion/react`、GSAP vendor 文件、原生滚轮/触摸/指针事件、少量 Canvas。
- 图标：`lucide-react`。
- 可视/端到端验证：Playwright 脚本和 Node 内置 test runner。
- 其他依赖：`@google/genai`、`three`、`express`、`better-sqlite3` 等，其中不少是为模板或调试能力预留。

## 常用命令

- 安装依赖：`npm install`
- 启动开发服务：`npm run dev`
- 构建：`npm run build`
- 类型检查：`npm run lint`
- 清理构建产物：`npm run clean`
- 视频滚动单元测试：`npm run test:video-scroll`
- 视频刷新 Playwright 验证：`npm run test:video-refresh`
- 视频滚轮 Playwright 验证：`npm run test:video-wheel`

开发服务命令实际执行 `vite --port=3000 --host=0.0.0.0`。如果需要本地浏览，优先访问 `http://localhost:3000` 或 `http://127.0.0.1:3000`。

## 环境变量

`.env.example` 中定义：

- `GEMINI_API_KEY`：Gemini API key，AI Studio 运行时会注入。
- `APP_URL`：应用托管地址，用于自引用链接、OAuth 回调或 API 端点。

当前主要作品集交互不应默认依赖远程 API。修改代码时避免把本地页面渲染变成必须联网。

## 目录结构

- `src/App.tsx`：主长页组合与全局音频/滚动动量锁逻辑。
- `src/main.tsx`：React 挂载入口；负责开发调试路由、首页加载门和刷新后的滚动恢复。
- `src/data.tsx`：核心内容数据源，包括个人资料、精选视觉作品、Coding 分类/项目、友人帐游戏数据。
- `src/index.css`：Tailwind 引入、本地字体注册、全局动画和若干页面级样式 hook。
- `src/components/`：主要页面段落与交互组件。
- `src/*.logic.ts`、`src/components/*.logic.ts`：可测试的纯逻辑，通常承载滚动状态机、定位、选择恢复、游戏规则等。
- `src/*.test.ts`、`src/**/*.test.tsx`：Node test runner 覆盖的单元/渲染测试。
- `test-*.cjs`：Playwright 驱动的本地浏览器验证脚本，多数需要先启动开发服务，并可通过 `BASE_URL` 指定地址。
- `public/images/`：作品集主要图片资产，包含职业页、作品展厅、友人帐、视觉作品等。
- `public/videos/`：视频转场和作品展厅视频资源。
- `public/audio/`：作品集背景音频与自我介绍音频。
- `public/fonts/`：本地字体。项目有测试约束，避免改回远程 Google Fonts。
- `public/vendor/`：本地 vendor 脚本/数据，如 GSAP、TopoJSON。
- `docs/plans/`：历史实施计划。
- `docs/diff-reports/`：视觉对比报告、问题拆解和标注截图。
- `fix-logs/`：历史修复记录。
- `tmp/`：本地调试输出，例如 `tmp/codex-report.json`。

## 主页面流程

`App.tsx` 按以下顺序渲染：

1. `Navbar`
2. `Hero`
3. `About`
4. `ExperienceHero`
5. `VideoScrollTransition`
6. `GrowPathScrollSection`
7. `CareerJourneySection`
8. `CareerDetailSection`
9. `WorksLobbySection`
10. `WorksDetailSection`
11. `FriendBookFinalSection`

很多段落通过全屏、sticky、滚动锁、软 repin、滚轮状态机或触摸状态机实现沉浸式过渡。改动这些区域时，应优先阅读对应的 `.logic.ts` 和测试，再改 TSX。

## 关键交互模块

- 首页音频：`portfolioAudioController` 管理封面自我介绍音频和故乡系列音频。回到首页顶部会重启封面音频；落到 Experience 段落附近会切换到故乡音频。
- 首页加载门：`homeLoader.tsx` 在生产域名 `xiaoci-ai.com`、`106.54.13.225` 或本地 `?previewHomeLoader=1` 时启用，预加载首屏与沉浸段落的关键图片、视频、音频和 document。
- 导航栏：`Navbar` 会在 Experience、视频转场、Career、Works 等沉浸段落与视口相交时隐藏。
- 视频转场：`VideoScrollTransition` 使用两个本地视频和 CTA，滚轮驱动从窗帘循环进入推进转场。
- 成长路径：`GrowPathScrollSection` 用滚动进度展开四张成长卡片，并支持聚焦卡片。
- 职业详情：`CareerDetailSection` 有分类 bookmark、记录切换、页面开关、音频切换和本地持久化选择。
- 作品入口与详情：`WorksLobbySection` 门厅动画通向 `WorksDetailSection`；详情区有设计作品 gallery、coding 分类卡和项目展开模式。
- 友人帐：`FriendBookFinalSection` 是最终互动区，包含找不同、Moon Run、Who’s This 三个小游戏、头像/奖章、留言册和本地进度持久化。
- 滚动动量锁：`scrollMomentumLock.ts` 用于在关键转场后短时拦截残余滚轮事件。

## 开发调试入口

`src/App.logic.ts` 和 `src/main.tsx` 定义了仅开发模式可用的 standalone debug route：

- `/debug/friend-book-finale`
- `/debug/friend-book-diff-hotspots`
- `/debug/works-detail`
- `/debug/career-detail`
- `/debug/codex-report`

Vite 插件还提供本地调试端点：

- `GET /__codex-report/current`：读取 `tmp/codex-report.json`，不存在时返回默认 guide document。
- `POST /__codex-report/update`：更新 `tmp/codex-report.json`。
- `POST /__friend-book-debug/confirm-hotspots`：写入 `tmp/friend-book-diff-hotspots.json`，用于友人帐找不同热点调试。

## 测试与验证习惯

- 纯逻辑优先放进 `.logic.ts`，并补 `.logic.test.ts`。
- React 渲染结构用 `.render.test.tsx` 覆盖。
- 复杂滚动、刷新、缩放、导航栏行为用根目录 `test-*.cjs` 的 Playwright 脚本验证。
- 对视觉密集页面，除了跑相关测试，还应在开发服务中截图或人工检查关键视口。
- 本地字体、加载页、音频控制、滚动锁都有专门测试，修改公共机制时不要只跑单个组件测试。

## 资产与设计注意事项

- 项目依赖大量本地图片、视频、音频和字体，引用路径大多以 `/images/...`、`/videos/...`、`/audio/...`、`/fonts/...` 开头。
- 不要轻易重命名 `public` 资产；许多测试和加载清单直接依赖这些路径。
- `src/index.css` 中有本地字体声明和若干 class hook，测试会检查本地字体使用。
- `public/images/DEPRECATED_ASSETS.md` 记录废弃资产信息，新增或替换资产时先确认是否已有历史约束。
- 页面风格以定制插画、相册/档案、夜空、展厅、纸质友人帐等视觉系统为主。新增 UI 应贴合现有段落，而不是套通用 SaaS 卡片风格。

## 部署与 COS 静态资源

当前常用部署方式是先执行 `npm run build`，再用：

```bash
rsync -avz --delete dist/ root@106.54.13.225:/var/www/xiaoci-portfolio/
```

这条命令只会同步云服务器本地目录。线上 Nginx 可能会把 `/images/...` 请求 `302` 到腾讯云轻量云对象存储 COS，当前已知桶为：

```text
portfolio-static-1259451604
地域：上海 ap-shanghai
访问域名：https://portfolio-static-1259451604.cos.ap-shanghai.myqcloud.com
轻量云入口：腾讯云控制台 -> 轻量云 Lighthouse -> 对象存储
```

如果线上首页加载门停在 `SOME ASSETS FAILED TO LOAD. PLEASE REFRESH AND TRY AGAIN.`，且 DevTools Network 中静态资源先从 `xiaoci-ai.com/images/...` 返回 `302`，再到 `portfolio-static-1259451604.cos.ap-shanghai.myqcloud.com/...` 返回 `404 Not Found`，通常说明：本地 `dist` 和云服务器已有文件，但 COS 桶里缺少对应对象。

排查顺序：

1. 确认本地构建产物存在，例如 `dist/images/VisualWorks/`。
2. 确认服务器本地也存在：

```bash
ssh root@106.54.13.225 'ls -lh /var/www/xiaoci-portfolio/images/VisualWorks'
```

3. 确认线上是否跳 COS：

```bash
curl -I -L https://xiaoci-ai.com/images/VisualWorks/VisualWorks_Myfirst_cg.jpeg
```

4. 如果最终 COS 返回 `404`，到轻量云对象存储桶 `portfolio-static-1259451604`，把 `dist/images/VisualWorks/` 里的文件上传到 COS 的 `images/VisualWorks/` 路径。不要上传成 `dist/images/VisualWorks/...` 或 `public/images/VisualWorks/...`。
5. 上传后直接验证 COS 地址，例如：

```text
https://portfolio-static-1259451604.cos.ap-shanghai.myqcloud.com/images/VisualWorks/VisualWorks_Myfirst_cg.jpeg
```

文件名大小写和后缀必须与代码引用完全一致。新增阻塞预加载资源时，除了 `rsync dist/`，也要确认被 Nginx 转发到 COS 的资源已经同步到 COS，否则首页加载门会被卡住。

## 协作约定

- 在创建实施计划时，请用中文描述。
- 修改沉浸式滚动段落前，先读对应 `.logic.ts`、测试和相关 `docs/plans/` 或 `docs/diff-reports/`。
- 保持改动范围收敛；不要顺手重排大段视觉参数或迁移资产路径。
- 对已有用户改动保持尊重，不要回滚未确认的工作区变化。
- 若需要新增计划文档，放在 `docs/plans/`，文件名沿用日期加主题的形式，并用中文写清楚实施步骤。
