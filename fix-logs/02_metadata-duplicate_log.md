# 02 Metadata Duplicate Fix Log

1. **理解**：右侧 aside 面板顶部的 `REF: E8.22 / SECTOR 4` 和 `ELEV: 1,344M` 在背景图中已经存在一次，组件又额外渲染了一次，导致视觉重影。
2. **分析**：我检查了 [`src/components/CareerDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx) 的 aside 区域，确认重复只来自一段代码生成的元数据 `<div>`，而 `CLASSIFIED`、地图、坐标和 annotation 都是独立内容，不应删除。我同步检查了 [`src/components/CareerDetailSection.render.test.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.render.test.tsx)，发现它原本还在要求这两段字符串必须出现在 markup 中。
3. **方案**：采用 report 推荐的方案 A，直接移除代码生成的元数据文字，信任背景图中的装饰文字位置，不新增遮罩层或额外 header。
4. **改动**：修改了 [`src/components/CareerDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx)，删除 aside 顶部的元数据 `<div>`；修改了 [`src/components/CareerDetailSection.render.test.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.render.test.tsx)，将对 `REF/ELEV` 的断言改为 `doesNotMatch`，保留对 `CLASSIFIED`、地图和下方文本的断言。
5. **验证**：先修改测试，让当前实现因仍输出 `REF/ELEV` 而失败；随后删除组件中的重复元数据，重新运行 `node --import tsx --test src/components/CareerDetailSection.render.test.tsx` 验证转绿，并继续运行逻辑测试与构建。
6. **遗留**：本次未处理 report 中的问题 #3，文案数据仍保持当前状态。
7. **可调参数**：本问题没有新增可调参数；如果后续背景图中的装饰文字位置需要微调，应通过素材或单独的遮罩方案处理，而不是重新把 `REF/ELEV` 写回组件。
