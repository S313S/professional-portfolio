# 设计还原 QA 报告（第 2 轮）

- **日期**: 2026-04-08
- **轮次**: 2
- **模块**: Works Gallery（作品集画廊页 — WorksDetailSection）
- **匹配得分**: 6.5/10
- **标注图**: [annotated-diff.png](./annotated-diff.png)
- **对齐调试图**: [alignment-debug.png](./alignment-debug.png) — 红线=当前28°，绿线=期望45°
- **期望设计参考**: [../works-gallery-design-reference.png](../works-gallery-design-reference.png)
- **上轮报告**: [../round1_2026-04-08_works-gallery-layout/](../round1_2026-04-08_works-gallery-layout/)

## 上轮修复成效

| 上轮问题 | 状态 |
|---------|------|
| #1 对角装饰虚线不明显 | ⚠️ 部分修复 — alpha/opacity 已提高，但缺少 45° 交叉线 |
| #2 底栏高度/间距不足 | ✅ 待验证 |
| #3 社交图标格式差异 | ✅ 已修复（f \| t \| ► 格式正确） |
| #4 胶片条走廊边框 | ⚠️ 部分修复 — DOM 结构已添加，但走廊不可见 + 角度错误（-28° 应为 -45°） |

## 问题清单

| # | 严重程度 | 问题 | 文件 |
|---|---------|------|------|
| 1 | 🔴 严重 | 卡片排列角度 28° 与卡片旋转 45° 不匹配 | [issues/01_card-diagonal-alignment.md](./issues/01_card-diagonal-alignment.md) |
| 2 | 🟡 主要 | 次对角线（45°方向）缺失 | [issues/02_secondary-diagonal-lines.md](./issues/02_secondary-diagonal-lines.md) |

## 核心发现

通过 Chrome DevTools 实测卡片中心坐标，确认：
- 卡片中心连线角度为 **~28°**（每步 dx≈14.2rem, dy≈-7.7rem）
- 卡片自身旋转 **45°**（菱形）
- 角度不匹配导致菱形边缘与排列路径不一致，无法形成连续胶片条
- 走廊 corridor 角度（-28°）也需同步改为 **-45°**
- 详见 [alignment-debug.png](./alignment-debug.png)

## ✅ 正确部分（勿动）

- 卡片的 `rotate(45deg)` 旋转
- 卡片的 `scale`、`opacity`、`filter`、`box-shadow` 值
- 卡片尺寸（10.75rem × 10.75rem）
- 三栏文字结构（KINDY / SANOFI / WHAT'S HOT）
- 底部 "blacknegative"、分页器、社交图标（`f | t | ►`）
- WORK DETAIL / CLOSE 按钮
- 背景层（overlay, vignette, noise）
- corridor DOM 结构（band + top/bottom 元素已存在）
- 135° 方向 grid gradient 参数

## 建议修复顺序

1. **#1 卡片排列角度**（🔴严重 — 结构性根因，修复后走廊角度也需同步）
2. **#2 次对角线**（🟡主要 — 独立修复，添加 45° gradient）

## 修复流程

1. 按顺序将 `issues/` 文件交给编码代理
2. #1 修复后用验证脚本确认角度 ≈ 45°
3. 每个修复后写入 `fix-logs/`
4. 全部完成后重新截图对比
