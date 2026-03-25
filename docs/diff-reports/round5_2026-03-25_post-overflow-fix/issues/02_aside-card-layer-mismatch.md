# 问题 #2: aside 面板存在多余的白色卡片图层

- **严重程度**: 🟡主要
- **类别**: 样式
- **问题层级**: 结构性（多余的视觉图层与背景图冲突）
- **精度要求**: 需对照设计稿
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 1016 行（aside 元素）

## 根因分析

当前 aside 面板使用了独立的卡片样式：半透明背景色 + 边框 + 圆角 + 阴影，形成了一个"浮动卡片"效果。但背景图中已经绘制了一个笔记本/文档页面区域，aside 的内容应该直接"印在"这个背景页面上，而不是叠加一个额外的卡片图层。

设计稿中，地图插图和文本直接呈现在背景的笔记本页面上，没有额外的白色半透明覆盖层。

## 期望效果

aside 内容（地图、坐标、注释）直接显示在背景图的笔记本页面上，无额外的卡片图层。参考设计稿中红框区域。

## 当前问题

当前 aside 样式：
```tsx
<aside className="absolute right-[7.5%] top-[19.5%] w-[25%] rounded-[0.55rem] border border-[#8f775f]/20 bg-[rgba(247,242,234,0.58)] p-5 shadow-[0_20px_46px_rgba(68,50,35,0.07)]">
```

需要移除的属性：
- `rounded-[0.55rem]` — 圆角
- `border border-[#8f775f]/20` — 边框
- `bg-[rgba(247,242,234,0.58)]` — 半透明背景色
- `shadow-[0_20px_46px_rgba(68,50,35,0.07)]` — 阴影

## 修复指令

1. 打开 `src/components/CareerDetailSection.tsx`
2. 找到第 1016 行 aside 元素：
   ```
   className="absolute right-[7.5%] top-[19.5%] w-[25%] rounded-[0.55rem] border border-[#8f775f]/20 bg-[rgba(247,242,234,0.58)] p-5 shadow-[0_20px_46px_rgba(68,50,35,0.07)]"
   ```
   替换为：
   ```
   className="absolute right-[7.5%] top-[19.5%] w-[25%] p-5"
   ```

3. 同样检查地图容器（第 1023 行）的边框和背景是否也需要移除：
   ```
   className="mt-2 aspect-[0.83/1] w-full overflow-hidden rounded-[0.3rem] border border-[#8f775f]/18 bg-[rgba(255,255,255,0.28)]"
   ```
   可能需要简化为：
   ```
   className="mt-2 aspect-[0.83/1] w-full overflow-hidden"
   ```

## 策略提示

移除卡片图层后，内容直接叠在背景上。如果背景图中笔记本页面区域的位置与 aside 的定位有偏差，可能需要微调 `right` 和 `top` 百分比值，使内容对齐背景中的页面区域。

## 验证方式

1. 视觉检查 aside 区域无独立的白色/浅色卡片边界
2. 地图插图和文本看起来像是直接"印在"背景笔记本页面上
3. 对照设计稿确认视觉效果一致

## 不要修改

- aside 面板的位置百分比（除非需要微调对齐）
- aside 内的文本内容（CLASSIFIED、坐标、注释）
- 左侧文本区域的任何内容

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/02_aside-card-layer-mismatch_log.md`
