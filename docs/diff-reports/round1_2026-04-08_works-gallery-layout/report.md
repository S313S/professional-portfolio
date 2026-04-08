# 设计还原 QA 报告（第 1 轮）

- **日期**: 2026-04-08
- **轮次**: 1
- **模块**: Works Gallery（作品集画廊页 — WorksDetailSection）
- **匹配得分**: 6/10
- **标注图**: [annotated-diff.png](./annotated-diff.png)
- **期望设计参考**: [../works-gallery-design-reference.png](../works-gallery-design-reference.png)

## 差异总览

整体差异率: 12.0%（agent-image-diff）

共识别 8 个差异，其中 4 个经用户确认为不需要修复，4 个需要修复。

## 问题清单

| # | 严重程度 | 问题 | 文件 |
|---|---------|------|------|
| 1 | 🟡 主要 | 对角装饰虚线不明显 | [issues/01_diagonal-grid-lines-too-faint.md](./issues/01_diagonal-grid-lines-too-faint.md) |
| 2 | 🟢 次要 | 底栏高度/间距不足 | [issues/02_footer-height-spacing.md](./issues/02_footer-height-spacing.md) |
| 3 | 🟢 次要 | 社交图标格式差异 | [issues/03_social-icons-format.md](./issues/03_social-icons-format.md) |
| 4 | 🔴 严重 | 缺少胶片条走廊边框效果 | [issues/04_film-strip-corridor.md](./issues/04_film-strip-corridor.md) |

## 不需要修复（用户确认）

| 问题 | 原因 |
|------|------|
| CLOSE 按钮位置 | 需求不要求改动 |
| WORK DETAIL 按钮位置 | 需求不要求改动 |
| WORK DETAIL 按钮本身 | 需求不要求改动 |
| 活动卡片图片内容 | 需求不要求改动 |

## ✅ 正确部分（勿动）

- 整体深色背景风格及渐变层（overlay, vignette, noise）
- 菱形卡片旋转 45 度排列的基本布局和 slot 定位
- 三栏文字结构（KINDY / SANOFI / WHAT'S HOT）及副标题
- 底部 "blacknegative" 品牌标识
- 底部分页/进度条指示器（tick 样式和数量）
- WORK DETAIL 按钮和 CLOSE 按钮的当前位置和样式
- 卡片图片内容和 opacity/filter 效果

## 建议修复顺序

优先修复结构性问题，再处理数值调整：

1. **#4 胶片条走廊**（🔴严重 — 缺失结构性元素）
2. **#1 对角装饰虚线**（🟡主要 — 数值调整）
3. **#2 底栏间距**（🟢次要 — 数值调整）
4. **#3 社交图标格式**（🟢次要 — 内容修正）

## 修复流程

1. 按上述顺序逐个将 `issues/` 中的文件交给编码代理
2. 每个问题修复后，要求代理将思路和步骤写入 `fix-logs/` 对应文件
3. 验证修复效果后再进入下一个问题
4. 全部完成后重新运行 `/design2code diff` 进行下一轮对比
