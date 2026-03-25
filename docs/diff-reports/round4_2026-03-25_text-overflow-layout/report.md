# 设计还原 QA 报告（第 4 轮）

- **日期**: 2026-03-25
- **轮次**: 4
- **模块**: CareerDetailSection — 右侧文本区域布局
- **匹配得分**: 5/10
- **标注图**: [annotated-diff.png](./annotated-diff.png)
- **期望设计参考**: [../careerDeatil_Demonstration.jpeg](../careerDeatil_Demonstration.jpeg)
- **上轮报告**: [../round3_2026-03-25_font-overflow-and-icons/](../round3_2026-03-25_font-overflow-and-icons/)

## 上轮修复成效

| 上轮问题 | 状态 |
|---------|------|
| 第 3 轮各问题 | ⚠️ 数据结构已重构，内容已更新，需要基于当前代码重新评估 |

## 问题清单

| # | 严重程度 | 问题 | 文件 |
|---|---------|------|------|
| 1 | 🔴 严重 | 标题行高溢出 (leading < font-size) | [issues/01_headline-line-height-overflow.md](./issues/01_headline-line-height-overflow.md) |
| 2 | 🟡 主要 | 标题 max-w-[16ch] 过窄导致多行折行 | [issues/02_headline-max-width-too-narrow.md](./issues/02_headline-max-width-too-narrow.md) |
| 3 | 🟡 主要 | 副标题行高溢出 | [issues/03_supporting-title-line-height.md](./issues/03_supporting-title-line-height.md) |
| 4 | 🔴 严重 | 底部文本区越过中间装饰分割线 | [issues/04_bottom-text-crosses-divider.md](./issues/04_bottom-text-crosses-divider.md) |

## ✅ 正确部分（勿动）

- 三个 tab 按钮图片（AMATEUR SHARING / WORK EXPERIENCE / INDUSTRY KNOWLEDGE）位置和缩放正确
- 右侧 aside 面板（地图 + CLASSIFIED + 标注文本）布局正确
- 右侧记录选择器（垂直文本按钮 + 拖拽滑块）功能正确
- 连接线（dashed bezier curve + arrowhead）样式正确
- metaLine + dateTitle 位置正确
- eyebrow 文本格式正确（uppercase + tracking）
- 背景图 object-cover 缩放正确

## 修复流程

1. 按序号逐个将 `issues/` 中的文件交给编码代理
2. 每个问题修复后，要求代理将思路和步骤写入 `fix-logs/` 对应文件
3. 验证修复效果后再进入下一个问题
4. 全部完成后重新运行 `/design2code diff` 进行下一轮对比

## 全量审计结果

对全部 3 个 tab × 8 个 entry 进行了逐一检测：
- **8/8 entry 的底部文本区越过中间装饰分割线**（越界 43px ~ 124px）
- **即使最佳情况（2行标题）也越界 43px** — 说明问题是系统性的，不仅是标题折行导致
- 5/8 标题折为 3 行，1/8 折为 4 行（`max-w-[16ch]` 过窄）
- 所有 8/8 的 H3、H4 均存在行高溢出（scrollH > clientH）

## 根因分析

问题 #1-#3 是数值性问题（line-height 值偏低），可直接调参修复。

问题 #4 是结构性问题，有两层根因：
1. **即使 2 行标题也越界** → flex-col 容器的 `top-[22%]` 起始位置或 `mt-6` 间距使底部区天然位于分割线以下过多
2. **3-4 行标题放大了问题** → #1 和 #2 使上部内容过高，进一步推挤底部

修复 #1 和 #2 可减轻但不能完全解决 #4。最终需要将上下两部分改为独立定位的容器，各自约束在分割线上下方。
