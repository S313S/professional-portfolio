# 01_card-outside-corridor 交互与参数化整理日志

## 1. 你指出需要修复和澄清的地方

这一轮你连续纠正了几个关键方向，核心要求不是“整体重做”，而是在保留既有过场的前提下，针对 detail 页里的局部交互和布局做可控修复。

你明确指出的点包括：

- `ON / OFF` 入口界面以及进入图二前的链路不能被替换或删掉，只允许在图二之后增加交互和动效。
- 进入 detail 页之后，除非点击右上角 `close`，否则不能因为鼠标上滑或滚轮向上而退出当前页面。
- 图二里的亮虚线、背景网格、图片卡片位置，需要改造成“可以直接调参数”的形式，而不是继续散落在 CSS 里写死。
- 当你调整亮虚线位置时，图片卡片不应该跟着一起移动；两者必须拆分成互不影响的控制项。
- 图片卡片尺寸需要统一到 `07` 卡片的尺寸。
- 标题区和说明文案需要能整体上下左右移动，但不能影响三列的 grid 宽度分配。
- 对角线图片带里的图片间隔需要统一，且应以 `05 -> 06` 之间的主对角线间隔作为基准步长。

这些反馈实际上把本轮任务从“视觉微调”升级成了“交互边界收紧 + 布局参数化 + 可维护性改造”。

## 2. 我是怎么做的

### 2.1 保留 ON/OFF 到图二的既有链路

在 [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 和 [`src/components/WorksDetailSection.logic.ts`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.logic.ts) 中保留了外层 `entry/detail` 契约，没有把 `ON / OFF` 入口和 reveal 过程替换成新的页面结构。

detail 内部新增的是 `gallery -> contact -> manifesto` 的二级场景，而不是改动外层路由。

### 2.2 收紧退出逻辑

在 [`src/components/WorksDetailSection.logic.ts`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.logic.ts) 里把 detail 页的向上回退逻辑收紧为：

- `gallery` 第一张项目继续向上滚动时，不再触发退出
- 只有点击右上角 `close` 按钮时，才会关闭 detail，回到前一层视图

这保证了 detail 页的退出语义和你截图里标注的交互边界一致。

### 2.3 把网格、亮虚线、图片卡片做成集中参数

我在 [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 顶部引入了统一参数对象：

```ts
const WORKS_DETAIL_GALLERY_LAYOUT = {
  stage: { ... },
  track: { ... },
  corridor: { ... },
  slots: [ ... ],
}
```

其中：

- `stage` 控制背景网格与标题区整体偏移
- `track` 控制图片卡片轨道整体位置
- `corridor` 控制亮虚线 corridor 的位置和间距
- `slots` 控制每张图片卡片各自的 `x / y / scale / opacity / grayscale / brightness`

这些值会通过内联 CSS 变量注入到 DOM，而不是继续靠多个 `data-slot="0"`、`data-slot="1"` 的硬编码 CSS。

### 2.4 把亮虚线和图片卡片拆成两层

你指出“改 `works-detail-track-top` 时，亮虚线动了，但图片也跟着动”，说明原先两者共享了同一个定位容器。

我在 [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 中把结构拆成了：

- `works-detail-track__corridor-layer`
- `works-detail-track`

亮虚线单独在 `corridor-layer` 里渲染，图片卡片只留在 `track` 里。对应样式在 [`src/index.css`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/index.css) 中也拆分了独立控制：

- `--works-detail-corridor-center-y`
- `--works-detail-corridor-rail-offset`
- `--works-detail-track-top`

这样以后：

- 调亮虚线位置，不会再带动图片卡片
- 调图片轨道位置，也不会再把亮虚线一起挪走

### 2.5 统一图片卡片尺寸

你要求所有卡片尺寸跟 `07` 卡片保持一致。我在 [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 的 `slots` 配置里，把各张卡片的 `scale` 都统一成了 `1.04`，与 `07` 保持一致。

### 2.6 为标题区增加整体 transform 偏移

你要求大标题及其说明文字可以整体左右和上下移动，但不能影响三列宽度。为此我没有改 `grid-template-columns`，而是在 [`src/index.css`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/index.css) 的 `.works-detail-stage__projects` 上增加了整体位移：

```css
transform: translate3d(
  var(--works-detail-projects-offset-x, ...),
  var(--works-detail-projects-offset-y, ...),
  0
);
```

对应的参数定义在 [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 的 `stage` 中：

- `--works-detail-projects-offset-x`
- `--works-detail-projects-offset-y`

### 2.7 统一主对角线图片间隔

你最后要求“图片之间沿主对角线的间隔改为一致，并以 `05 -> 06` 的间隔作为基准值”。当前 `05 -> 06` 的步长是：

- `x + 11rem`
- `y - 11rem`

所以我把后续几张卡的坐标顺延成同样的步长：

- `05`: `(-25.2rem, 21.5rem)`
- `06`: `(-14.2rem, 10.5rem)`
- `07`: `(-3.2rem, -0.5rem)`
- `08`: `(7.8rem, -11.5rem)`
- 下一张: `(18.8rem, -22.5rem)`

这样整条图片带沿主对角线的间隔就收口成一致的节奏。

## 3. 我是怎么思考出这个方案的

### 3.1 先守住你已经确认过的视觉和交互

你先指出我不该去掉 `ON / OFF` 入口界面，这意味着前半段链路已经被你确认，是“不能回退重做”的约束。于是方案上必须把所有变化限制在 `detail` 后半段，而不是再做一次大重构。

换句话说，本轮的设计原则不是“追求最像参考视频”，而是“尊重已确认界面，只做局部增强”。

### 3.2 参数化优先于继续手写 CSS

你后面连续问了多次：

- 控制虚线位置的代码是哪一行
- 控制图片位置的代码是哪一行
- 为什么我改了这个值它没动

这说明你真实需要的不是“我替你手调一次”，而是“把系统改成你自己也能稳定调”。因此我没有停留在单次改数值，而是优先把它们收敛成一个集中配置对象。

这样做的理由是：

- 降低你之后寻找参数的成本
- 减少改一个值误伤其他元素的概率
- 让后续任何微调都变成显式数据改动，而不是继续追着 CSS 选择器跑

### 3.3 把共享容器拆开，是为了消除副作用

当你发现“改亮虚线，图片也一起动”时，本质原因不是数值错，而是结构层级错。只要亮虚线和图片继续在同一个定位容器里，参数就永远互相污染。

所以这一步的思路不是继续找“更合适的 top 值”，而是先拆结构：

- 先解决耦合
- 再谈微调

这也是为什么我新增了 `corridor-layer`，并单独引入 `corridor` 参数区。

### 3.4 对标题区使用 transform，而不是改 grid

你要求标题区整体移动，但不能影响三列宽度。我选择 `transform: translate3d(...)` 的原因是：

- 它只改变最终视觉位置
- 不会影响 grid 本身的列宽计算
- 不会让左中右三列的对齐逻辑重新洗牌

如果直接改 `grid-template-columns` 或 `inset` 去做大范围位移，会更容易引入额外偏差，尤其是在你已经开始逐步精调每个模块的时候。

### 3.5 用 `05 -> 06` 作为步长，是因为这是你给出的视觉锚点

最后的对角线间隔修复，我没有自行发明“平均值”或“更好看的步长”，而是直接采用你指定的 `05 -> 06` 作为标准。这么做的理由是：

- 它是你认可的视觉参考
- 它减少主观判断
- 它能把修复目标转成明确的数学规则：每一步都 `+11 / -11`

这使得修复结果更可解释，也更容易继续维护。

## 4. 涉及的主要文件

- [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx)
- [`src/components/WorksDetailSection.logic.ts`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.logic.ts)
- [`src/components/WorksDetailSection.logic.test.ts`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.logic.test.ts)
- [`src/components/WorksDetailSection.render.test.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.render.test.tsx)
- [`src/index.css`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/index.css)

## 5. 验证

本轮涉及多次交互边界和视觉参数调整，因此每次关键改动后都使用了定向测试和构建验证。最终反复通过的命令包括：

- `node --import tsx --test src/components/WorksDetailSection.render.test.tsx`
- `node --import tsx --test src/components/WorksDetailSection.logic.test.ts`
- `npm run build`

验证目标包括：

- `close` 是 detail 唯一退出入口
- 亮虚线与图片卡片位置控制已解耦
- 标题区整体 transform 已接入变量
- 所有卡片尺寸统一到 `07`
- 对角线图片带间隔统一为 `05 -> 06` 的基准步长

## 6. 当前可调参数总结

为了方便后续继续手调，这一轮最终沉淀出的主要可调入口如下：

### 背景网格

- `--works-detail-grid-offset-x`
- `--works-detail-grid-offset-y`

### 标题区整体偏移

- `--works-detail-projects-offset-x`
- `--works-detail-projects-offset-y`

### 图片卡片轨道整体位置

- `--works-detail-track-top`
- `--works-detail-track-height`

### 亮虚线 corridor

- `--works-detail-corridor-center-y`
- `--works-detail-corridor-width`
- `--works-detail-corridor-band-height`
- `--works-detail-corridor-rail-offset`

### 单张图片卡片

- `slots[n].x`
- `slots[n].y`
- `slots[n].scale`
- `slots[n].opacity`
- `slots[n].grayscale`
- `slots[n].brightness`

## 7. 遗留与后续建议

目前桌面端的卡片、亮虚线、标题区都已经具备单独调参能力，但移动端还有一部分断点样式仍保持独立覆盖。如果下一轮你希望“桌面和移动端都统一用同一套参数入口”，建议单开一轮继续收敛移动端布局配置。
