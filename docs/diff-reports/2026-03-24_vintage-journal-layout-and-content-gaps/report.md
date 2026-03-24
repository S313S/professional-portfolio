# 设计还原 QA 报告

- **日期**：2026-03-24
- **模块**：CareerDetailSection（复古日志页面）
- **匹配得分**：4/10
- **标注图**：[annotated-diff.png](./annotated-diff.png)

> 整体三栏布局正确，但大量缺失的装饰元素、空白面板和样式差异使当前实现远未达到期望的复古档案风格。

## 确认信息

| 问题 | 结论 |
|------|------|
| 标签页重影 | **Bug**，非刻意效果 |
| 装饰素材（地形图、纹章等） | 用户**有现成素材** |
| 内容文字差异 | **需要更新** |

## 素材需求

修复前需将以下素材文件放入 `/public/images/`：
- [ ] `careerDetail_map.png` — 右侧面板地形图插图
- [ ] `careerDetail_crest.png` — CHRONICLE 上方纹章/徽标图标
- [ ] `careerDetail_anchor.png` — 辅助标题前锚/指南针图标
- [ ] 重新生成干净的标签页图片（无重影）

---

## 问题清单

| # | 严重程度 | 问题 | 文件 |
|---|---------|------|------|
| 1 | 🔴 严重 | 标签页图片重影/重叠文字 | [issues/01_tab-ghost-text.md](./issues/01_tab-ghost-text.md) |
| 2 | 🔴 严重 | 内容文案需要全部更新 | [issues/02_content-text-update.md](./issues/02_content-text-update.md) |
| 3 | 🔴 严重 | 右侧面板内容缺失 | [issues/03_right-panel-empty.md](./issues/03_right-panel-empty.md) |
| 4 | 🟡 主要 | 内容卡片透明度过高、圆角过大 | [issues/04_card-opacity-corners.md](./issues/04_card-opacity-corners.md) |
| 5 | 🟡 主要 | 缺少章节装饰分隔线 | [issues/05_section-divider.md](./issues/05_section-divider.md) |
| 6 | 🟡 主要 | 缺少装饰图标 | [issues/06_decorative-icons.md](./issues/06_decorative-icons.md) |
| 7 | 🟡 主要 | 辅助卡片样式需调整 | [issues/07_supporting-card-style.md](./issues/07_supporting-card-style.md) |
| 8 | 🟢 次要 | 记录选择器样式过于朴素 | [issues/08_record-selector-style.md](./issues/08_record-selector-style.md) |

---

## ✅ 正确部分（勿动）

- 三栏布局结构（标签页 | 内容 | 面板）
- 背景图片和 `#ece2d0` 色调
- Playfair Display 衬线字体
- 位置信息行和日期标题
- 标签页切换交互
- 滚动吸附行为
- 移动端响应式布局

---

## 修复流程

1. **逐个修复**：按序号将 `issues/` 中的文件逐个交给编码代理（Codex）
2. **记录日志**：每个问题修复后，要求代理将思路和步骤写入 `fix-logs/` 对应文件
3. **验证效果**：按照每个 issue 文件中的"验证方式"确认修复成功
4. **下一个问题**：确认修复正确后再进入下一个问题
5. **下轮对比**：全部完成后重新运行 `/design2code diff` 进行下一轮对比
6. **反馈闭环**：下轮对比时会读取 `fix-logs/` 了解上一轮的修复思路，针对性优化指令
