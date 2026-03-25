# CareerDetailSection 修复思路与代码说明

- 日期：2026-03-24
- 模块：`CareerDetailSection`
- 对应 QA 报告：[`report.md`](./report.md)
- 对应标注图：[`annotated-diff.png`](./annotated-diff.png)

## 1. 我是怎么判断问题的

这轮没有直接按报告逐条机械改，而是先把“问题属于资源、布局、还是数据”分开判断。

### 1.1 左侧标签重影

我先单独查看了三张标签 PNG：

- `public/images/careerDetail_share_icon.png`
- `public/images/careerDetail_career_icon.png`
- `public/images/careerDetail_Industry knowledge_icon.png`

结论：PNG 本体是干净的，不存在真正的重复文字层。重影主要来自当前桌面端把三张图放进同一列 `w-full` 图片堆叠里，PNG 自带的透明外边缘和底部留白互相压到一起，所以视觉上像“后面还有一层字”。

所以这部分我按“布局问题”修，不按“先重做资源”修。

### 1.2 右侧面板缺内容

这一点是结构问题。原来的 `<aside>` 里只是一个空白嵌套框，缺：

- `CLASSIFIED`
- REF / ELEV 元数据
- 地图图层
- 坐标与注记

这里不能靠调透明度解决，必须把结构补完整。

### 1.3 区域七的选择器

原来桌面端是一个原生纵向 `<select>`，功能有，但视觉语言不对。你后来补了：

- `public/images/careerDetail_scroll_icon.png`

我查看后确认这张图不是“小手柄”，而是一整条完整的纵向装饰件，所以我把它当成桌面端记录选择器的主体视觉，而不是当成一个小滑块去贴在现有 `<select>` 上。

### 1.4 地图资源

计划里要求加 `careerDetail_map.png`，但仓库里当时并没有这张图。我没有停下来等资源，而是先生成了一张风格统一的复古线稿地图，保证右侧面板能落成完整结构。

我额外保留了源文件：

- `public/images/careerDetail_map.svg`

实际组件引用的是：

- `public/images/careerDetail_map.png`

## 2. 我具体怎么修代码

主要改动都在：

- [`src/components/CareerDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx)

### 2.1 左侧标签区

原来做法的问题：

- 桌面端三张图放在一个 `flex` 纵列里
- 每张图直接 `w-full`
- PNG 透明区域也参与了视觉占位

现在的修法：

- 给三张标签分别定义独立的桌面端布局配置 `CAREER_DETAIL_DESKTOP_TAB_LAYOUTS`
- 每张标签使用：
  - 独立的 wrapper 位置
  - 独立的可视宽高
  - `overflow-hidden` 裁掉透明外延
  - 单独的图片偏移量

这样做的结果是：点击逻辑不变，但三个标签不再互相“透出”后方文字。

### 2.2 中央两张正文卡

我保留了原有内容结构，没有改状态模型，只改了材质和装饰：

- 主卡与副卡圆角从大圆角改成接近纸片边缘的小圆角
- 背景透明度调高，减少毛玻璃感
- 边框加深，增强纸张边缘感
- 在主卡 eyebrow 上方加了 `Shield`
- 在副卡标题上方加了 `Anchor`
- 两张卡之间补了居中的罗马数字 `II` 和分隔线

这里直接使用了项目已安装的 `lucide-react`，避免继续引入新的 icon 图片依赖。

### 2.3 右侧档案面板

原先只是“空框 + annotation”。现在我把它补成完整档案面板：

- 右上角 `CLASSIFIED`
- 顶部元数据：
  - `REF: E8.22 / SECTOR 4`
  - `ELEV: 1,344M`
- 中间地图图层：
  - `/images/careerDetail_map.png`
- 底部坐标和注记：
  - `X: 14.22 / 9-98.11`
  - `"Magnetic variance noted"`
- 最底部继续保留原 annotation

这部分是这轮“从空白占位改成完整视觉结构”的核心。

### 2.4 桌面端自定义记录选择器

原来的做法是原生 `<select>` 直接竖排显示。现在我拆成两层：

1. 保留一个 `sr-only` 的原生 `<select>`
   - 保持表单状态和可访问性语义
   - 仍然用 `selectedRecordId` 驱动

2. 新增一个可见的桌面端自定义选择器
   - 背景图用 `careerDetail_scroll_icon.png`
   - 每条记录是独立的 `<button>`
   - 点击按钮直接切换 `selectedRecordId`
   - 当前项用更明显的底色和阴影做选中态

这样做的原因是：视觉上能贴近设计稿，但功能上不丢原来的状态模型和可访问性。

### 2.5 移动端

这轮没有动移动端整体结构。移动端仍然：

- 保留横向 tab 图
- 保留原生 `<select>`
- 保持更稳的纵向阅读布局

这是刻意控制范围，不让桌面端视觉修复反过来把移动端也拖进大改。

## 3. 这轮新增/调整了哪些文件

### 3.1 代码

- [`src/components/CareerDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx)
- [`src/components/CareerDetailSection.render.test.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.render.test.tsx)
- [`test-career-detail-transition.cjs`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/test-career-detail-transition.cjs)

### 3.2 资源

- [`public/images/careerDetail_scroll_icon.png`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/public/images/careerDetail_scroll_icon.png)
- [`public/images/careerDetail_map.png`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/public/images/careerDetail_map.png)
- [`public/images/careerDetail_map.svg`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/public/images/careerDetail_map.svg)

## 4. 我怎么更新测试

### 4.1 渲染测试

我把渲染测试从“页面能渲出来”扩到“这轮修复点确实存在”：

- `careerDetail_scroll_icon.png` 存在于输出里
- `careerDetail_map.png` 存在于输出里
- `CLASSIFIED`
- `REF / ELEV`
- 坐标注记
- 自定义记录按钮
- 分隔线
- `Shield / Anchor` 装饰图标的测试锚点

### 4.2 浏览器冒烟测试

原来的测试只验证：

- section 吸附
- 下拉框切记录
- 左侧 tab 切内容

这轮我把它切到新的桌面端交互：

- 验证桌面自定义选择器存在
- 点击记录按钮而不是操作可见 `<select>`
- 继续验证 tab 切换后的文本变化
- 顺带确认 `CLASSIFIED` 文本已经真实出现在 DOM 中

## 5. 我实际跑了哪些验证

我没有只改代码不验证，下面这些命令都是实际执行过的：

```bash
node --import tsx --test src/components/CareerDetailSection.logic.test.ts
node --import tsx --test src/components/CareerDetailSection.render.test.tsx
npm run lint
npm run build
BASE_URL=http://127.0.0.1:3007 node test-career-detail-transition.cjs
```

另外，我还额外截了一张当前页面图做视觉留档：

- `/tmp/career-detail-section.png`

## 6. 这轮没有动什么

为了避免把修复范围越做越大，这几块我刻意没动：

- `CareerDetailSection.logic.ts` 的 section 吸附规则
- 移动端整体信息结构
- tab / record 的状态语义
- 现有背景图
- 现有 `GrowPathScrollSection*` 相关脏改动

## 7. 如果后面还要继续优化，我建议优先看这几项

这轮已经把 QA 报告里最明显的结构缺口补上了，但如果还要继续追更高还原度，我建议按这个顺序：

1. 把 `CAREER_DETAIL_RECORDS` 的文案替换成最终设计稿文案
2. 微调左侧三个标签的绝对定位和裁切框，让它们更贴合原稿
3. 微调右侧选择器的标签文字位置，进一步贴近标注图的关系
4. 如果你后面提供了真正的地图素材，可以直接替换 `careerDetail_map.png`

---

如果你希望，我也可以继续把“这份说明”再压缩成一个更适合给别的代理直接接手的 checklist 版本。
