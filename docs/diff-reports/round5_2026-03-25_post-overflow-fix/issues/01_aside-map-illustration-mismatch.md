# 问题 #1: 右侧 aside 面板地图插图与设计稿不匹配

- **严重程度**: 🟡主要
- **类别**: 视觉资产
- **问题层级**: 资产+样式（图片内容和展示效果均需调整）
- **精度要求**: 需对照设计稿
- **文件**: `src/components/CareerDetailSection.tsx` + 图片资产
- **代码位置**: 第 1016-1035 行（aside 面板）、第 1023-1029 行（地图容器）

## 根因分析

设计稿中 aside 面板的地图插图是一幅**详细的地形山脉景观素描**，线条丰富、细节密集，填满了卡片的大部分区域。当前实现使用的图片 (`careerDetail_map.png`, 1200×1200) 是简单的弧形等高线素描，视觉丰富度远低于设计稿。

## 期望效果（对照设计稿）

- 地图区域显示**详细的地形景观素描**（山脉、地层、阴影线条），风格类似手绘地质勘测图
- 插图应填充卡片大部分区域，视觉上成为 aside 面板的主要焦点
- 保留现有的 "REF EX.23 / SECTOR 4"、"ELEV 1,344M"、"CLASSIFIED"、坐标和注释文本

参考期望设计图 [../careerDeatil_Demonstration.jpeg](../../careerDeatil_Demonstration.jpeg) 中红框区域。

## 当前问题

| 属性 | 当前实现 | 设计稿 |
|------|---------|--------|
| 地图图片 | 简单弧形等高线 | 详细地形山脉景观素描 |
| 图片自然尺寸 | 1200×1200 (正方形) | 横向景观比例 |
| 容器宽高比 | `aspect-[0.83/1]` (近正方形) | 更接近横向矩形 |
| 视觉丰富度 | 低（几条弧线） | 高（密集的线条和阴影） |

## 修复指令

### 步骤 1：替换地图图片资产

需要一张风格匹配的**手绘地形景观素描**图片，替换当前的 `careerDetail_map.png`。

图片要求：
- 风格：手绘/素描风格的地形景观（山脉、地层、地质纹理）
- 色调：单色/棕褐色调，匹配整体复古探险日志主题
- 尺寸建议：至少 1200px 宽
- 格式：PNG（透明背景）或 JPEG

图片资产路径：
```
public/images/careerDetail_map.png
```

### 步骤 2：验证容器样式

当前容器样式：
```tsx
<div className="mt-2 aspect-[0.83/1] w-full overflow-hidden rounded-[0.3rem] border border-[#8f775f]/18 bg-[rgba(255,255,255,0.28)]">
  <img src={CAREER_DETAIL_ASSETS.map} alt="Topographic map" className="h-full w-full object-cover" />
</div>
```

如果新图片比例不同，可能需要调整 `aspect-[0.83/1]`。设计稿中地图区域看起来更接近 `aspect-[4/5]` 或 `aspect-[3/4]`。

## 验证方式

1. 替换图片后刷新页面
2. 视觉对比 aside 面板与设计稿
3. 确认图片在所有 tab/entry 切换时显示正常（图片是静态的，不随 entry 变化）
4. 确认图片 object-cover 无明显裁切

## 不要修改

- aside 面板的位置 (`right-[7.5%] top-[19.5%] w-[25%]`)
- "CLASSIFIED" 标签
- 坐标文本和注释文本
- aside 面板的边框、背景色、阴影样式
- 左侧文本区域的任何内容

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/01_aside-map-illustration-mismatch_log.md`
