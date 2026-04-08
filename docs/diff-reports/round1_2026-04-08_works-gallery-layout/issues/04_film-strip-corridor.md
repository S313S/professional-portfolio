# 问题 #4: 缺少胶片条走廊边框效果

- **严重程度**: 🔴严重
- **类别**: 结构 | 视觉效果
- **问题层级**: 结构性（缺少整个视觉元素）
- **精度要求**: 近似即可
- **文件**: `src/index.css` + `src/components/WorksDetailSection.tsx`
- **代码位置**: CSS 第 352-378 行（track 容器），TSX 卡片渲染区域

## 根因分析

期望设计中，卡片沿 135 度对角线排列在一个**胶片条/底片走廊**内。走廊两侧有清晰的虚线边框，模拟胶片齿孔效果（sprocket holes），形成一条从左下到右上贯穿画面的胶片带。

当前实现中：
- 卡片本身有对角排列和 45 度旋转 ✓
- 但**完全缺少胶片条走廊的两侧虚线边框**
- 卡片只有极细的 solid border（`1px solid rgba(216, 225, 235, 0.08)`），不是胶片效果

## 期望效果

参考设计图: [../works-gallery-design-reference.png](../works-gallery-design-reference.png)

- 一条对角线方向（约 135 度 / 从左下到右上）的**胶片条走廊**贯穿页面中央
- 走廊两侧各有一条**虚线边框**（dashed），颜色为淡灰色，形似胶片齿孔
- 走廊内部是暗色半透明条带，卡片在其中排列
- 走廊宽度约覆盖卡片宽度 + 两侧各一小段边距
- 虚线段约 8-12px dash，6-8px gap

## 当前问题

- 完全没有胶片条走廊元素
- 没有对角虚线边框
- 卡片直接浮在背景上，没有"胶片带"的视觉包裹感

## 修复指令

### 方案 A: CSS 伪元素（推荐）

在 `.works-detail-track` 上添加 `::before` 和 `::after` 伪元素，绘制两条平行的对角虚线。

```css
.works-detail-track {
  position: absolute;
  inset: 1.5% 0 auto 0;
  height: 34rem;
  pointer-events: none;
}

/* 胶片条走廊 — 两侧虚线边框 */
.works-detail-track::before,
.works-detail-track::after {
  content: '';
  position: absolute;
  /* 走廊宽度需要覆盖卡片对角线排列的范围 */
  /* 从左下到右上，旋转 135 度 */
  width: 160%;  /* 足够长以贯穿整个视口 */
  height: 0;
  border-top: 1.5px dashed rgba(200, 210, 220, 0.25);
  transform-origin: center;
  transform: rotate(135deg);
  left: -30%;
  pointer-events: none;
}

.works-detail-track::before {
  top: calc(50% - 8rem);  /* 走廊上边界 — 根据卡片大小调整 */
}

.works-detail-track::after {
  top: calc(50% + 8rem);  /* 走廊下边界 */
}
```

### 方案 B: 独立 DOM 元素

如果伪元素不够灵活，在 TSX 中的 track 容器内添加两个 div 作为走廊边框：

```tsx
{/* 在 track 容器内，卡片之前 */}
<div className="works-detail-track__corridor-border works-detail-track__corridor-border--top" />
<div className="works-detail-track__corridor-border works-detail-track__corridor-border--bottom" />
```

### 可选：走廊内部暗色条带

期望设计中走廊内部有一层暗色半透明背景，可以用额外的伪元素或 gradient 实现：

```css
.works-detail-track__corridor {
  position: absolute;
  width: 160%;
  height: 16rem;  /* 走廊宽度 */
  background: rgba(10, 12, 18, 0.4);
  transform: rotate(135deg);
  transform-origin: center;
  left: -30%;
  top: calc(50% - 8rem);
}
```

## 策略提示

- 先实现方案 A（伪元素），验证角度和位置是否正确
- 走廊的宽度和位置需要与卡片排列对齐 — 参考 `data-slot` 的 translate3d 值确定走廊中心线
- 卡片排列中心线：从 slot0 的 `translate3d(-33rem, 15.8rem)` 到 slot4 的 `translate3d(23.6rem, -14.8rem)` — 这条线就是走廊中心线
- 如果方案 A 角度/长度难以调准，切换到方案 B 用 DOM 元素更灵活
- 虚线的 dash 样式可通过 `border-style: dashed` 配合 `border-width` 控制

## 验证方式

应看到一条从左下到右上贯穿画面的胶片条走廊，两侧有清晰的虚线边框。卡片在走廊内排列。对比期望设计参考图确认。

## 不要修改

- 卡片的 transform/translate/rotate 值（slot 0-4 的定位）
- 卡片的 opacity 和 filter 值
- 背景层（overlay, vignette, noise, grid）
- 底栏和社交图标
- WORK DETAIL / CLOSE 按钮

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/04_film-strip-corridor_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因（如果切换了策略，说明为什么）
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：如果精度要求为像素级，是否已将关键数值提取为可调参数？参数位置在哪里？
