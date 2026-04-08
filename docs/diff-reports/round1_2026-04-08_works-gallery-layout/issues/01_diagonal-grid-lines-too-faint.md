# 问题 #1: 对角装饰虚线不明显

- **严重程度**: 🟡主要
- **类别**: 视觉效果
- **问题层级**: 数值性（opacity 和线条粗细需调整）
- **精度要求**: 近似即可
- **文件**: `src/index.css`
- **代码位置**: 第 342-350 行

## 根因分析

`.works-detail-stage__grid` 使用 `repeating-linear-gradient` 绘制 135 度对角线，但线条颜色过浅（`rgba(163, 174, 190, 0.09)`）且整体 opacity 仅 0.38，导致在深色背景上几乎不可见。

期望设计中对角虚线清晰可见，形成贯穿整页的菱形网格装饰。

## 期望效果

参考设计图: [../works-gallery-design-reference.png](../works-gallery-design-reference.png)

对角线应清晰可辨，形成从左上到右下的 135 度斜线网格。线条是虚线（dashed）风格，颜色接近淡灰色，在深色背景上有适当对比度。

## 当前问题

- 线条颜色: `rgba(163, 174, 190, 0.09)` — alpha 仅 0.09，几乎透明
- 整体 opacity: `0.38` — 进一步降低可见度
- 线条宽度: 仅 2px（129px - 131px），过细
- 综合效果：线条在深色背景上几乎不可见

## 修复指令

在 `src/index.css` 第 342-350 行，调整 `.works-detail-stage__grid`：

1. 提高线条颜色 alpha 值：`rgba(163, 174, 190, 0.09)` → `rgba(163, 174, 190, 0.18)`
2. 提高整体 opacity：`0.38` → `0.6`
3. 考虑将实线改为虚线效果：期望设计中线条是 dashed 风格。可以用更复杂的 gradient 模拟虚线，或者叠加一层 `background-size` 较小的 gradient 实现间断效果。

```css
/* 当前 */
.works-detail-stage__grid {
  background-image: repeating-linear-gradient(135deg,
      transparent 0,
      transparent 128px,
      rgba(163, 174, 190, 0.09) 129px,
      transparent 131px,
      transparent 260px);
  opacity: 0.38;
}

/* 建议修改 */
.works-detail-stage__grid {
  background-image: repeating-linear-gradient(135deg,
      transparent 0,
      transparent 128px,
      rgba(163, 174, 190, 0.18) 129px,
      transparent 131px,
      transparent 260px);
  opacity: 0.6;
}
```

如果需要虚线效果，可以进一步叠加：使用 `background-image` 多层 gradient 或 SVG pattern 实现 dashed 风格。

## 策略提示

- 先调 opacity 和 alpha 看整体效果，如果线条可见但不够"虚线"，再用 SVG pattern 或多层 gradient 模拟 dash
- 期望设计中虚线间距较规律，每段 dash 约 8-12px，gap 约 6-8px

## 验证方式

对角线应在深色背景上清晰可辨，形成规律的斜线网格。对比期望设计参考图确认线条密度和明暗度。

## 不要修改

- `.works-detail-stage` 背景渐变（第 299-303 行）
- `.works-detail-stage__overlay`（第 323-326 行）
- `.works-detail-stage__vignette`（第 328-331 行）
- `.works-detail-stage__noise`（第 333-340 行）
- 卡片布局和旋转样式
- 底栏和社交图标样式

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/01_diagonal-grid-lines-too-faint_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因（如果切换了策略，说明为什么）
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：如果精度要求为像素级，是否已将关键数值提取为可调参数？参数位置在哪里？
