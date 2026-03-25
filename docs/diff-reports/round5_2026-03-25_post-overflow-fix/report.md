# 设计还原 QA 报告（第 5 轮）

- **日期**: 2026-03-25
- **轮次**: 5
- **模块**: CareerDetailSection — 右侧 aside 面板地图插图
- **匹配得分**: 7.5/10
- **标注图**: [annotated-diff.png](./annotated-diff.png)
- **期望设计参考**: [../careerDeatil_Demonstration.jpeg](../careerDeatil_Demonstration.jpeg)
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
| 1 | 🟡 主要 | aside 面板地图插图与设计稿不匹配 | [issues/01_aside-map-illustration-mismatch.md](./issues/01_aside-map-illustration-mismatch.md) |
| 2 | 🟡 主要 | aside 面板存在多余的白色卡片图层 | [issues/02_aside-card-layer-mismatch.md](./issues/02_aside-card-layer-mismatch.md) |

## ✅ 正确部分（勿动）

- 上下文本区已独立定位，互不影响
- 标题最多折为 2 行
- 行高不再小于字号
- 三个 tab 按钮图片位置和缩放正确
- aside 面板的位置和文本内容正确
- 右侧记录选择器功能正确
- 连接线样式正确
- metaLine + dateTitle 位置正确
- eyebrow 文本格式正确
- 背景图 object-cover 缩放正确

## 修复流程

1. 按序号逐个将 `issues/` 中的文件交给编码代理
2. 每个问题修复后，要求代理将思路和步骤写入 `fix-logs/` 对应文件
3. 验证修复效果后再进入下一个问题
4. 全部完成后重新运行 `/design2code diff` 进行下一轮对比
