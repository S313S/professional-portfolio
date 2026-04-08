# 问题 #2: 背景网格线与卡片布局不统一

- **严重程度**: 🟡主要
- **类别**: 视觉效果
- **问题层级**: 结构性（实现方案错误，需要换技术方案）
- **精度要求**: 近似即可
- **文件**: `src/index.css`
- **代码位置**: 第 342-357 行（`.works-detail-stage__grid`）

## 根因分析

两个相关的根因：

### 根因 A: 线条是实线，期望是虚线

当前使用 `repeating-linear-gradient` 绘制背景网格线。CSS gradient 只能生成**连续实线**，无法产生**虚线（dashed）**效果。期望设计中的对角线是清晰的虚线（可见 dash 间断图案）。

### 根因 B: 网格与卡片坐标系不对齐

`repeating-linear-gradient` 从元素左上角开始平铺，间距 260px。卡片通过 `translate3d` 从容器中心定位。两套坐标系完全独立，导致网格线与卡片边缘没有任何对齐关系。

期望设计中，网格线穿过卡片的角/边，形成统一的视觉框架。当前实现中，网格线与卡片的交叉位置是随机的。

## 期望效果

参考设计图: [../works-gallery-design-reference.png](../works-gallery-design-reference.png)

- 背景对角线是**虚线**（dashed），而非实线
- 虚线间距规律：约 8-12px dash, 6-8px gap
- 两个方向（135° + 45°）交叉形成菱形网格
- 网格线与卡片布局视觉上协调——线条经过卡片角/边缘附近

## 当前问题

```css
/* 当前方案 — 只能画实线，且坐标系与卡片无关 */
.works-detail-stage__grid {
  background-image:
    repeating-linear-gradient(135deg,
      transparent 0, transparent 128px,
      rgba(163, 174, 190, 0.18) 129px,
      transparent 131px, transparent 260px),
    repeating-linear-gradient(45deg,
      transparent 0, transparent 128px,
      rgba(163, 174, 190, 0.18) 129px,
      transparent 131px, transparent 260px);
  opacity: 0.6;
}
```

问题：
1. gradient 生成的是 2px 宽实线，不是虚线
2. 260px 间距和起始偏移与卡片位置无关

## 修复指令

### 方案 A: SVG pattern（推荐）

用 inline SVG 或 `url('data:image/svg+xml,...')` 替代 gradient，可以精确控制虚线样式：

```css
.works-detail-stage__grid {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cline x1='0' y1='260' x2='260' y2='0' stroke='rgba(163,174,190,0.18)' stroke-width='1.5' stroke-dasharray='8,6'/%3E%3Cline x1='0' y1='0' x2='260' y2='260' stroke='rgba(163,174,190,0.18)' stroke-width='1.5' stroke-dasharray='8,6'/%3E%3C/svg%3E");
  background-size: 260px 260px;
  opacity: 0.6;
}
```

这样可以：
- 精确控制虚线 dash/gap（`stroke-dasharray='8,6'`）
- 交叉线在同一个 SVG tile 中，天然对齐
- 通过调整 `background-position` 将网格偏移到与卡片对齐

### 方案 B: 多层 gradient 模拟虚线

用更密的 gradient 停止点模拟 dash 效果，但代码复杂度高且效果不如 SVG 精确，不推荐。

### 对齐网格与卡片

无论选哪种方案，都需要通过 `background-position` 微调网格的起始偏移，使网格线与卡片边缘视觉对齐：

```css
.works-detail-stage__grid {
  /* 调整此值使网格线经过卡片角 */
  background-position: [X]px [Y]px;
}
```

具体偏移值需要在浏览器中试验：
1. 先不设 background-position，观察当前网格线与卡片的偏移量
2. 用 DevTools 实时调整 background-position 直到线条经过卡片角附近
3. 记录最终值

## 策略提示

- 优先实现方案 A（SVG pattern），先不管对齐，确认虚线效果正确
- 虚线效果确认后，再通过 `background-position` 微调对齐
- 对齐不需要像素级精确——视觉上"线条经过卡片附近"即可
- SVG 中颜色需要 URL 编码：`rgba(163,174,190,0.18)` → `rgba(163%2C174%2C190%2C0.18)`
- 如果 SVG data URI 太长或有编码问题，可以改用外部 SVG 文件 `url('/grid-pattern.svg')`

## 验证方式

1. 背景线条应呈虚线效果（可见 dash 间断），而非实线
2. 两个方向（135° + 45°）的虚线交叉形成菱形网格
3. 网格线在视觉上与卡片菱形边缘大致对齐（不要求像素级）
4. 对比期望设计参考图确认整体观感

## 不要修改

- 卡片 slot 的 translate3d / rotate / scale 值（刚修复为 45° 排列）
- 走廊 corridor 样式（band / top / bottom）
- 背景渐变层（overlay, vignette, noise）— 只改 grid 层
- grid 的 opacity 值（保持 0.6，先换方案再调透明度）
- 底栏、社交图标、分页器
- WORK DETAIL / CLOSE 按钮

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/02_secondary-diagonal-lines_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因（如果切换了策略，说明为什么）
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：`background-position` 和 `stroke-dasharray` 是否易于微调？
