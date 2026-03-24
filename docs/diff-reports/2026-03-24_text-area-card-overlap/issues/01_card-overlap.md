# 问题 #1: 移除卡片容器，文本直接在背景上显示

- **严重程度**: 🔴严重
- **类别**: 结构
- **问题层级**: 结构性（组件方案与期望设计不一致）
- **精度要求**: 近似即可（文本流式排列、无卡片边框/背景即可）
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 807-858 行（`data-career-detail-card-stack` flex 容器及其子元素）

## 根因分析

这是一个**设计方案理解偏差**。当前实现将主内容和辅助内容分别包裹在带有半透明背景、边框、圆角和阴影的 `<article>` 卡片容器中。但期望设计中**没有卡片容器**——文本直接在羊皮纸背景（`careerDetail_bg.png` + `#ece2d0`）上流式排列，无边框、无独立背景色、无阴影。

## 期望效果

- eyebrow / headline / body / supportingTitle / supportingBody 等文本元素直接排列在背景上
- 不存在半透明的卡片背景层（不要 `bg-[rgba(249,244,236,0.85)]` 之类的背景）
- 不存在卡片边框（不要 `border border-[#8f775f]/30`）
- 不存在卡片阴影（不要 `shadow-[...]`）
- 不存在卡片圆角（不要 `rounded-[0.4rem]`）
- 文本之间的间距保持合理，分隔线 "II" 仍然存在

## 当前问题

- 主内容被包裹在 `<article className="rounded-[0.4rem] border border-[#8f775f]/30 bg-[rgba(249,244,236,0.85)] p-5 shadow-[...]">`（第 811 行）
- 辅助内容被包裹在 `<article className="rounded-[0.4rem] border border-[#8f775f]/30 bg-[rgba(250,246,240,0.88)] p-5 shadow-[...]">`（第 844 行）
- 这两层卡片容器在视觉上形成了独立的"文本框"，与期望设计的羊皮纸直排效果不符

## 修复指令

将两个 `<article>` 元素替换为无样式的 `<div>` 或 React Fragment，移除所有卡片视觉属性（边框、背景、圆角、阴影、padding），但保留内部文本元素的排列和样式。

**第 811 行，主内容 article：**
```tsx
// 当前：
<article className="rounded-[0.4rem] border border-[#8f775f]/30 bg-[rgba(249,244,236,0.85)] p-5 shadow-[0_18px_40px_rgba(70,51,35,0.08)]">

// 改为（移除 rounded/border/bg/shadow/p-5，只保留一个容器用于 flex 子元素间距）：
<div>
```

对应的闭合标签也从 `</article>` 改为 `</div>`（第 833 行）。

**第 844 行，辅助内容 article：**
```tsx
// 当前：
<article className="rounded-[0.4rem] border border-[#8f775f]/30 bg-[rgba(250,246,240,0.88)] p-5 shadow-[0_18px_40px_rgba(70,51,35,0.08)]">

// 改为：
<div>
```

对应的闭合标签也从 `</article>` 改为 `</div>`（第 857 行）。

**外层 flex 容器（第 807-809 行）保持不变** — 它的 `flex flex-col` 布局是正确的，只是内部的卡片视觉样式需要移除。

## 策略提示

- 这是纯样式移除，不涉及内容或交互变更
- 移除卡片 `p-5` 后，文本可能需要在外层 flex 容器上添加少量 padding 以保持合理的文字位置。如果文本紧贴外层容器边缘，可在外层 `div[data-career-detail-card-stack]` 上加 `px-2` 或类似值
- Shield 和 Anchor 图标保留，它们是装饰元素，不依赖卡片容器

## 验证方式

1. 运行 `npm run dev`，查看 CareerDetailSection
2. 确认文本区域没有独立的半透明背景层——文字直接在羊皮纸纹理上
3. 确认没有边框和阴影包裹文本块
4. 确认分隔线 "II" 仍然正确显示在两段文本之间
5. 确认文本排列合理，没有挤在一起或超出区域
6. 切换不同 tab 和 record，确认一致性

## 不要修改

- 三栏布局结构（标签页 | 内容 | 面板）
- 外层 flex 容器的定位（`absolute left-[37%] top-[22%] w-[29%]`）
- 右侧 aside 面板的位置和内容
- 标签页的位置和交互
- 日期标题（October 14th, 1894）
- 背景图片和 #ece2d0 色调
- Playfair Display 衬线字体
- Shield/Anchor 装饰图标（保留）
- 分隔线 "II" 的样式
- 文本内容（eyebrow/headline/body 等文案本身不改）
- 标签页切换和滚动吸附功能
- 移动端响应式布局
- `CAREER_DETAIL_DESKTOP_TAB_PIXEL_RECTS` 定位参数

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/01_card-overlap_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因（如果切换了策略，说明为什么）
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：是否有需要后续手调的参数？位置在哪里？
