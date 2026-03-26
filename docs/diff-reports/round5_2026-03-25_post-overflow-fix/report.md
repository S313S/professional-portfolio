# 设计还原 QA 报告（第 5 轮）

- **日期**: 2026-03-25
- **轮次**: 5
- **模块**: CareerDetailSection — 右侧 aside 面板（地图插图 + 覆盖对齐）
- **匹配得分**: 6/10
- **标注图**: [annotated-diff-updated.png](./annotated-diff-updated.png)
- **期望设计参考**: [../careerDeatil_Demonstration.jpeg](../careerDeatil_Demonstration.jpeg)
- **背景笔记本框参考**: [bg-notebook-frame-visible-2026-03-25T13-00-06-803Z.png](./bg-notebook-frame-visible-2026-03-25T13-00-06-803Z.png)（隐藏 aside 后的背景截图，清晰显示目标覆盖区域）
- **上轮报告**: [../round4_2026-03-25_text-overflow-layout/](../round4_2026-03-25_text-overflow-layout/)

## 上轮修复成效

| 上轮问题 | 状态 |
|---------|------|
| #1 标题行高溢出 (leading-[0.92]) | ✅ 已修复 → leading-none |
| #2 标题 max-w-[16ch] 过窄 | ✅ 已修复 → max-w-[24ch]，标题最多 2 行 |
| #3 副标题行高溢出 (leading-[0.95]) | ✅ 已修复 → leading-none |
| #4 底部文本区越过分割线 | ✅ 已修复 → 上下文本区拆为两个独立 absolute 容器 |

**全部 8/8 entry 验证通过**：分割线不再被越过，上下文本区独立定位正常。

## 问题清单

| # | 严重程度 | 问题 | 文件 |
|---|---------|------|------|
| 1 | 🟡 主要 | aside 面板地图插图与设计稿不匹配（简单弧线 vs 详细地形景观） | [issues/01_aside-map-illustration-mismatch.md](./issues/01_aside-map-illustration-mismatch.md) |
| 2 | 🔴 严重 | aside 卡片未覆盖目标区域（顶部偏下152px、矮130px） | [issues/02_aside-card-layer-mismatch.md](./issues/02_aside-card-layer-mismatch.md) |

### 关于目标覆盖区域的说明（用户通过拖拽选择器精确确认）

用户通过注入浏览器的交互式区域选择器，拖拽框选并确认了目标覆盖区域（1600×900 视口）：

`left=66.38%, top=4.78%, w=24.81%, h=76.44%` → 像素值 x=1062, y=43, w=397, h=688

标注图中的标记含义：
- **红色框 (#1)** = 用户确认的目标覆盖区域（x=1062, y=43, w=397, h=688 @1600×900）
- **橙色框 (#2)** = 当前 aside 实际位置（x=1066, y=195, w=380, h=558）— 核心问题：**顶部偏下152px**，高度短130px
- **橙色框 (#3)** = 地图插图内容不匹配区域

参考验证截图：`verified-selection-*.png`（蓝色覆盖层精确对齐用户选区）

## ✅ 正确部分（勿动）

- 上下文本区已独立定位，互不影响
- 标题最多折为 2 行
- 行高不再小于字号
- 三个 tab 按钮图片位置和缩放正确
- aside 面板的文本内容正确（CLASSIFIED、坐标、注释）
- 右侧记录选择器功能正确
- 连接线样式正确
- metaLine + dateTitle 位置正确
- eyebrow 文本格式正确
- 背景图 object-cover 缩放正确

## 修复流程

1. **先修 #2（结构性问题）**：调整 aside 尺寸和位置以覆盖笔记本最外层框，这是结构性根因
2. **再修 #1（视觉资产）**：替换地图插图图片
3. 每个问题修复后，要求代理将思路和步骤写入 `fix-logs/` 对应文件
4. 验证修复效果后再进入下一个问题
5. 全部完成后重新运行 `/design2code diff` 进行下一轮对比

> ⚠️ 建议修复顺序调整为 #2 → #1，因为 aside 尺寸变化后地图容器也需要相应适配。
