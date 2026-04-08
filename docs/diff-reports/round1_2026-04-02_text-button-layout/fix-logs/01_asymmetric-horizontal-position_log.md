# 01_asymmetric-horizontal-position 修复日志

## 1. 理解

这次问题不是标题、字号或双列结构错误，而是左右两组文字相对页面中轴线的横向偏移不对称。目标是把两侧的主视觉文本组拉回到更接近镜像分布的状态。

## 2. 分析

我检查了 [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 中内容层的两列容器，确认当前实现分别使用：

- 左列：`translate-x-[80px]`
- 右列：`translate-x-[-20px]`

这两个数值明显不对称，会让左列更靠近中轴线，右列相对更远，和报告里的 60px 偏差描述一致。

## 3. 方案

采用 QA 报告给出的最小修复方案，只改两列容器的 `translate-x` 数值：

- 左列改为 `translate-x-[50px]`
- 右列改为 `translate-x-[-50px]`

这样可以在不动 grid 结构、标题样式和背景资源的前提下，把两边拉回到对称基线。

## 4. 改动

修改文件：

- [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx)
- [`src/components/WorksDetailSection.render.test.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.render.test.tsx)

具体变更：

- 左侧文本组容器从 `translate-x-[80px]` 改为 `translate-x-[50px]`
- 右侧文本组容器从 `translate-x-[-20px]` 改为 `translate-x-[-50px]`
- 渲染测试新增对这两个偏移值的断言

## 5. 验证

我使用渲染测试先锁住新数值，再改实现使测试通过。验证方式包括：

- 定向渲染测试确认左右列命中 `translate-x-[50px]` / `translate-x-[-50px]`
- 结合 QA 标注图，确认这次改动只影响水平对称，不改变其他视觉结构

## 6. 遗留

这次只做了桌面端的数值收口，没有引入基于断点的细调逻辑。如果后续视觉 diff 发现某个更窄或更宽的桌面尺寸仍有轻微偏差，应单独开下一轮做响应式微调。

## 7. 可调参数

当前关键参数位置：

- [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 中左列容器的 `translate-x-[50px]`
- [`src/components/WorksDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/WorksDetailSection.tsx) 中右列容器的 `translate-x-[-50px]`

如果后续还要手调，这两个值应成对修改，保持正负对称。
