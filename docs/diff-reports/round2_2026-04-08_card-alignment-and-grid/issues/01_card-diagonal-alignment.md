# 问题 #1: 卡片排列角度与卡片旋转角度不匹配（28° vs 45°）

- **严重程度**: 🔴严重
- **类别**: 布局
- **问题层级**: 结构性（排列角度错误）
- **精度要求**: 近似即可
- **文件**: `src/index.css`
- **代码位置**: 第 414-443 行（slot transforms）、第 367-390 行（corridor angle）
- **调试参考图**: [alignment-debug.png](../alignment-debug.png) — 红线=当前28°排列，绿线=期望45°参考

## 根因分析

每张卡片单独 `rotate(45deg)` 形成菱形，但卡片排列路径的角度只有 ~28°（而非 45°）。这导致菱形的边缘方向和排列方向不一致，卡片看起来不在同一条对角线上，也无法形成连续的胶片条效果。

**数学证据**（通过 Chrome DevTools 实测卡片中心点）：

| Slot | Center X | Center Y | dx | dy | 实际斜率 |
|------|----------|----------|-----|-----|---------|
| 0 | 293 | 623 | — | — | — |
| 1 | 523 | 500 | 230 | -123 | -0.53 |
| 2 | 754 | 379 | 231 | -121 | -0.52 |
| 3 | 978 | 255 | 224 | -124 | -0.55 |
| 4 | 1199 | 134 | 221 | -121 | -0.55 |

- **当前排列角度**: atan2(122, 227) ≈ **28°**
- **期望排列角度**: **~45°**（与卡片 rotate(45deg) 匹配）
- **期望斜率**: dy/dx ≈ -1.0（即 dx ≈ |dy|）

## 期望效果

参考设计图: [../works-gallery-design-reference.png](../works-gallery-design-reference.png)

卡片排列路径应接近 45° 对角线，使得：
- 相邻菱形卡片的边缘自然衔接，形成连续的胶片条走廊
- 卡片的菱形顶点方向与排列路径一致
- 整个卡片带从左下到右上以 ~45° 角贯穿页面

## 当前问题

```css
/* 当前 translate3d 值 — 排列角度 ~28° */
slot 0: translate3d(-33rem,    15.8rem, 0)   /* 起点 */
slot 1: translate3d(-18.6rem,   8.1rem, 0)   /* dx=14.4rem, dy=-7.7rem */
slot 2: translate3d(-4.2rem,    0.5rem, 0)   /* dx=14.4rem, dy=-7.6rem */
slot 3: translate3d( 9.8rem,   -7.2rem, 0)   /* dx=14.0rem, dy=-7.7rem */
slot 4: translate3d( 23.6rem, -14.8rem, 0)   /* dx=13.8rem, dy=-7.6rem */
```

每步 dx≈14.2rem，dy≈-7.7rem → 角度 ≈ 28°。要达到 45°，需要 dx ≈ |dy|。

## 修复指令

调整 slot 0-4 的 `translate3d` 值，使 dx ≈ |dy|。保持 slot 2（中间卡片）的位置大致不变作为锚点，向两侧等距展开。

**建议新值**（以 slot 2 为锚点，每步 dx≈11rem, dy≈-11rem）：

```css
/* 修改后 — 排列角度 ~45° */
.works-detail-track__item[data-slot="0"] {
  transform: translate3d(-26.2rem, 21.5rem, 0) rotate(45deg) scale(0.9);
  /* ... opacity/filter 不变 */
}

.works-detail-track__item[data-slot="1"] {
  transform: translate3d(-15.2rem, 10.5rem, 0) rotate(45deg) scale(0.94);
}

.works-detail-track__item[data-slot="2"] {
  transform: translate3d(-4.2rem, 0.5rem, 0) rotate(45deg) scale(0.98);
  /* 锚点不变 */
}

.works-detail-track__item[data-slot="3"] {
  transform: translate3d(6.8rem, -10.5rem, 0) rotate(45deg) scale(1.04);
}

.works-detail-track__item[data-slot="4"] {
  transform: translate3d(17.8rem, -21.5rem, 0) rotate(45deg) scale(0.94);
}
```

**注意**：以上数值是基于 dx=dy=11rem 的初始估算。实际需要在浏览器中微调，确保：
1. 卡片不超出视口
2. 活跃卡片（slot 3）仍在视觉焦点区域
3. 与底部文字区域不重叠

### 同步更新走廊角度

走廊 corridor 的 `rotate(-28deg)` 也需要同步更新为 `rotate(-45deg)`：

```css
.works-detail-track__corridor--band {
  transform: translate(-50%, -50%) rotate(-45deg);  /* 原 -28deg */
}

.works-detail-track__corridor--top {
  transform: translateX(-50%) rotate(-45deg);  /* 原 -28deg */
}

.works-detail-track__corridor--bottom {
  transform: translateX(-50%) rotate(-45deg);  /* 原 -28deg */
}
```

走廊的 `top` offset 可能也需要随角度调整，确保走廊两侧虚线恰好包裹住卡片。

## 策略提示

- **先改角度，再微调位置**：先将所有 slot 改为 45° 排列，观察整体效果，然后微调间距
- 如果 45° 太陡导致卡片超出视口，可以适当缩小步长（如 dx=dy=9rem）或缩小卡片尺寸
- slot 2 作为锚点不动，可以减少调整工作量
- 修改后刷新页面，用浏览器 DevTools 画对角线验证角度（在控制台执行验证脚本见下方）

### 验证脚本

修复后在浏览器控制台运行：
```javascript
const items = document.querySelectorAll('.works-detail-track__item');
const centers = [...items].map(el => {
  const r = el.getBoundingClientRect();
  return { slot: el.dataset.slot, cx: r.left+r.width/2, cy: r.top+r.height/2 };
});
for (let i=1; i<centers.length; i++) {
  const dx = centers[i].cx - centers[i-1].cx;
  const dy = centers[i].cy - centers[i-1].cy;
  console.log(`slot ${i-1}→${i}: dx=${dx.toFixed(1)}, dy=${dy.toFixed(1)}, angle=${(Math.atan2(-dy,dx)*180/Math.PI).toFixed(1)}°`);
}
// 期望每步 angle ≈ 45°
```

## 验证方式

1. 所有 slot 间步进角度应接近 45°（±3°）
2. 卡片菱形边缘应自然衔接，形成连续对角带
3. 走廊虚线与卡片排列方向一致
4. 卡片不超出视口，活跃卡片在视觉中心区域

## 不要修改

- 卡片的 `rotate(45deg)`（各 slot 的旋转保持 45°）
- 卡片的 `scale` 值（0.9 / 0.94 / 0.98 / 1.04 / 0.94）
- 卡片的 `opacity`、`filter`、`box-shadow` 值
- 卡片尺寸 `width: 10.75rem; height: 10.75rem`
- 背景层（overlay, vignette, noise, grid）
- 底栏、社交图标、分页器
- WORK DETAIL / CLOSE 按钮

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/01_card-diagonal-alignment_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因（如果切换了策略，说明为什么）
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功（是否运行了验证脚本？结果是什么？）
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：关键数值（每步 dx/dy）是否易于微调？
