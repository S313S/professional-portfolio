# 02_button-vertical-misalignment 修复日志

## 1. 理解

问题核心不是按钮本身的样式或 `margin-top` 出错，而是两侧描述文本行数不同，导致按钮被文本高度差推到了不同的垂直位置。目标是让两个按钮重新落回同一水平线附近。

## 2. 分析

我检查了 [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 中按钮上方的两段描述文本，确认：

- 左侧文案更短，实际占用高度更低
- 右侧文案更长，更容易换成三行
- 两个按钮都共用相同的 `mt-5 sm:mt-6`

因此即使按钮本身类名一致，右侧按钮仍会被更高的描述段落向下推。

## 3. 方案

采用 QA 报告推荐的“统一文案块高度”方案，不改按钮 `margin-top`，而是在左右描述文本上都增加同一个最小高度 `min-h-[3.8rem]`。

这样可以把两侧描述区占位拉齐，让按钮自然对齐，同时避免引入 `mt-auto`、固定列高或其他更重的结构调整。

## 4. 改动

修改文件：

- [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx)
- [`src/components/WorksDetailSection.render.test.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.render.test.tsx)

具体变更：

- 左侧描述文本类名新增 `min-h-[3.8rem]`
- 右侧描述文本类名新增 `min-h-[3.8rem]`
- 渲染测试新增断言，确认这个最小高度在输出中出现两次

## 5. 验证

我使用测试先建立约束，再改实现通过：

- 渲染测试确认两个描述区都带有 `min-h-[3.8rem]`
- 逻辑上按钮上方的占位已经统一，能消除由文本换行带来的垂直错位

后续视觉验收会重点看两个按钮顶部差异是否收敛到接近同一水平线。

## 6. 遗留

这次按计划只使用单一桌面端最小高度，没有给不同断点拆分 `sm:` / `md:` 的专用高度。如果后续视觉 diff 显示某个断点仍有轻微偏差，再单独微调，不在这轮放大为结构重构。

## 7. 可调参数

当前关键参数位置：

- [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 中左侧描述文本的 `min-h-[3.8rem]`
- [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 中右侧描述文本的 `min-h-[3.8rem]`

如果后续要继续细调，应优先改这个最小高度，再决定是否需要为不同断点拆分高度值。
