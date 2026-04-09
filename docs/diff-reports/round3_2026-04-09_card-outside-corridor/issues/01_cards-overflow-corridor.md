# 问题 #1: 卡片溢出胶片条走廊（卡片比走廊大）

- **严重程度**: 🔴严重
- **类别**: 布局
- **问题层级**: 结构性（走廊尺寸和定位方案需要重新设计）
- **精度要求**: 近似即可
- **文件**: `src/index.css`
- **代码位置**: 第 364-387 行（corridor）、第 411-440 行（slot transforms）

## 根因分析

### 数学证明

- 卡片基础尺寸: 10.75rem × 10.75rem
- 旋转 45° 后菱形对角线（= axis-aligned bounding box）: 10.75 × √2 ≈ **15.2rem**
- 活跃卡片 (slot 3) scale(1.04): 15.2 × 1.04 ≈ **15.8rem**
- 走廊 band 高度: **15.5rem**

**活跃卡片的 bounding box (15.8rem) > 走廊高度 (15.5rem)**。即使卡片完美居中于走廊内，也会溢出 0.3rem。

### 定位偏移加剧问题

走廊中心线在 track 容器的 `top: 50%`。但走廊是通过 `rotate(-45deg)` 旋转的元素，其"高度"方向是沿旋转后的法线方向。

卡片通过 `translate3d` 在旋转前的坐标系中偏移，然后各自 `rotate(45deg)`。走廊和卡片的坐标系虽然旋转角度匹配（都是 45°），但走廊的中心定位（基于 `top: 50%`）与卡片的排列中心线不一定重合。

## 期望效果

参考设计图: [../works-gallery-design-reference.png](../works-gallery-design-reference.png)

- 所有卡片（包括活跃卡片）完全包含在走廊虚线边框之内
- 走廊虚线紧贴卡片菱形的外侧边缘，形成"胶片条"包裹感
- 走廊宽度应足以容纳最大卡片（活跃卡片 ~15.8rem）+ 两侧留白

## 当前问题

```css
/* 走廊尺寸 — 太窄 */
.works-detail-track__corridor--band {
  height: 15.5rem;  /* < 活跃卡片 15.8rem */
  transform: translate(-50%, -50%) rotate(-45deg);
}
.works-detail-track__corridor--top {
  top: calc(50% - 7.75rem);  /* 半高 = 7.75rem */
}
.works-detail-track__corridor--bottom {
  top: calc(50% + 7.75rem);
}
```

走廊高度 15.5rem 不够容纳活跃卡片（15.8rem），且没有留白空间。

## 修复指令

### 步骤 1: 加宽走廊

走廊高度需要 ≥ 活跃卡片 bounding box + 两侧留白。建议：

```css
/* 活跃卡片 ~15.8rem + 两侧各 2rem 留白 = ~20rem */
.works-detail-track__corridor--band {
  height: 20rem;  /* 原 15.5rem */
  transform: translate(-50%, -50%) rotate(-45deg);
}

.works-detail-track__corridor--top {
  top: calc(50% - 10rem);  /* 半高 = 10rem, 原 7.75rem */
}

.works-detail-track__corridor--bottom {
  top: calc(50% + 10rem);  /* 原 7.75rem */
}
```

### 步骤 2: 验证走廊中心线与卡片排列对齐

走廊中心在 track 的 `top: 50%`。需要确认这条线是否穿过卡片排列的中心。如果不是，需要调整走廊的垂直偏移：

```css
/* 如果走廊中心偏高/偏低，调整这里 */
.works-detail-track__corridor--band {
  transform: translate(-50%, calc(-50% + [偏移量])) rotate(-45deg);
}
```

具体偏移值需要在浏览器中实测：
1. 加宽走廊后查看是否所有卡片都在走廊内
2. 如果走廊与卡片中心线不重合，微调 translate 的 Y 偏移

### 步骤 3: 增强走廊可见度

走廊加宽后，也需要确保走廊虚线可见（当前 alpha 0.25 偏低）：

```css
.works-detail-track__corridor--top,
.works-detail-track__corridor--bottom {
  border-top: 1.5px dashed rgba(200, 210, 220, 0.4);  /* 原 0.25 */
}
```

## 策略提示

- 先加宽走廊，在浏览器中确认卡片被包含
- 走廊宽度应基于最大卡片（slot 3, scale 1.04）+ 留白，不是最小卡片
- 如果走廊太宽显得空旷，可以缩小留白（如 1.5rem）
- 走廊的 `rotate(-45deg)` 应与卡片排列角度一致——如果卡片排列不是精确 45°，走廊角度也需要微调
- 走廊虚线和走廊 band 必须同步调整（height 和 top offset 保持一致）

## 验证方式

1. 所有卡片（尤其 slot 3 活跃卡片）应完全在走廊虚线边框之内
2. 走廊虚线紧贴卡片外侧但不切割卡片
3. 对比期望设计参考图确认

## 不要修改

- 卡片的 translate3d / rotate / scale 值（刚修复为 45° 排列）
- 卡片尺寸（10.75rem × 10.75rem）
- 卡片 opacity / filter / box-shadow
- 背景网格线（grid 层）
- 底栏、社交图标、分页器
- WORK DETAIL / CLOSE 按钮

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/01_cards-overflow-corridor_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：corridor height / top offset 是否易于微调？
