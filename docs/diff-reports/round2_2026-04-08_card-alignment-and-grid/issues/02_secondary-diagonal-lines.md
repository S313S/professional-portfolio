# 问题 #2: 次对角线（45°方向）缺失

- **严重程度**: 🟡主要
- **类别**: 视觉效果
- **问题层级**: 结构性（缺少一个方向的装饰线）
- **精度要求**: 近似即可
- **文件**: `src/index.css`
- **代码位置**: 第 342-350 行

## 根因分析

期望设计中背景有**交叉网格**装饰线，由两个方向的对角线组成：
- 135° 方向（从左上到右下）— 当前已有 ✓
- 45° 方向（从右上到左下）— **缺失** ✗

两组线交叉形成菱形网格图案。当前只有一个方向，缺少交叉效果。

## 期望效果

参考设计图: [../works-gallery-design-reference.png](../works-gallery-design-reference.png)

背景上应有交叉的对角线网格，两个方向（135° 和 45°）的线条以相同间距和样式交叉排列，形成菱形/钻石形网格图案。

## 当前问题

```css
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

只有 135° 方向的线条，缺少 45° 方向。

## 修复指令

在 `src/index.css` 第 342-350 行，为 `.works-detail-stage__grid` 添加第二个方向的 gradient：

```css
/* 当前 — 只有 135° */
.works-detail-stage__grid {
  background-image: repeating-linear-gradient(135deg,
      transparent 0,
      transparent 128px,
      rgba(163, 174, 190, 0.18) 129px,
      transparent 131px,
      transparent 260px);
  opacity: 0.6;
}

/* 修改 — 添加 45° 交叉线 */
.works-detail-stage__grid {
  background-image:
    repeating-linear-gradient(135deg,
      transparent 0,
      transparent 128px,
      rgba(163, 174, 190, 0.18) 129px,
      transparent 131px,
      transparent 260px),
    repeating-linear-gradient(45deg,
      transparent 0,
      transparent 128px,
      rgba(163, 174, 190, 0.18) 129px,
      transparent 131px,
      transparent 260px);
  opacity: 0.6;
}
```

两个 gradient 叠加，使用相同的间距（260px）和线条颜色，形成交叉菱形网格。

## 策略提示

- 两个方向使用相同参数保持视觉一致性
- 如果交叉后线条太密，可以增大间距（如 260px → 320px）
- 如果交叉后整体太亮，可以适当降低 opacity（如 0.6 → 0.5）
- 交叉点会叠加变亮，这是正常效果

## 验证方式

背景应显示清晰的菱形/钻石形网格图案，两个方向的线条以相同间距交叉。对比期望设计参考图确认。

## 不要修改

- 走廊 corridor 样式（第 359-390 行）
- 卡片 slot transform 值
- 背景渐变层（overlay, vignette, noise）
- 底栏、社交图标
- grid 的 opacity 值（先保持 0.6，交叉后如果太亮再调）

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/02_secondary-diagonal-lines_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：关键数值是否已提取为可调参数？
