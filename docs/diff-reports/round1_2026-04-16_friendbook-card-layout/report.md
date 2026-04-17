# 设计还原 QA 报告（第 1 轮）

- **日期**: 2026-04-16
- **轮次**: 1
- **模块**: FriendBookFinalSection — Archive Board 左页 sample entries
- **匹配得分**: 5/10
- **标注图**: [annotated-diff.png](./annotated-diff.png)
- **期望设计参考**: [../friendbook-archive-expected-design.png](../friendbook-archive-expected-design.png)

## 问题清单

| # | 严重程度 | 问题 | 文件 |
|---|---------|------|------|
| 1 | 🔴 严重 | 卡片外层 grid 勋章列过窄 + 卡片高度不足致内容溢出 | [issues/01_card-grid-and-height.md](./issues/01_card-grid-and-height.md) |
| 2 | 🟡 主要 | 徽章文字折 3 行 + 标题与徽章 grid 布局需改 flex | [issues/02_seal-badge-layout.md](./issues/02_seal-badge-layout.md) |

## 问题联动关系

两个 issue 高度耦合：issue #1 加宽勋章列后文本区变窄，影响 issue #2 的标题+徽章排列。**必须按序号顺序修复**。

## ✅ 正确部分（勿动）

- 右侧页面 userSlots 布局和样式
- 左/右页面 header 文字和布局
- 卡片背景色、圆角、阴影
- 头像的圆形裁切、边框、尺寸（68×74px 与期望大致匹配）
- 标题字体（serif, 2rem, #2d2221）
- 描述文字字体（1.18rem, #463731）
- 书页整体背景、纸张纹理、装饰元素
- 勋章图的圆角、边框样式（仅需改尺寸）

## 修复流程

1. 按序号逐个将 `issues/` 中的文件交给编码代理
2. **每个问题修复后，要求代理将思路和步骤写入 `fix-logs/` 对应文件（必须项）**
3. 验证修复效果后再进入下一个问题
4. 全部完成后重新运行 `/design2code diff` 进行下一轮对比
