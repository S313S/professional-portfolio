# 设计还原 QA 报告（第 3 轮）

- **日期**：2026-03-24
- **模块**：CareerDetailSection — 文本区域 + 日期标题
- **匹配得分**：6/10（较上轮改善：内容文案已更新、卡片容器已移除、元数据重复已修复）
- **标注图**：[annotated-diff.png](./annotated-diff.png)
- **期望设计参考**：[../careerDeatil_Demonstration.jpeg](../careerDeatil_Demonstration.jpeg)

---

## 上轮修复成效

| 上轮问题 | 状态 |
|---------|------|
| 卡片容器移除 | ✅ 已移除（article → div，无背景/边框/阴影） |
| 元数据重复 | ✅ 已修复 |
| 内容文案更新 | ✅ 已更新为正式文案 |

---

## 本轮问题清单

| # | 严重程度 | 问题 | 文件 |
|---|---------|------|------|
| 1 | 🔴 严重 | 文本区域字号过大导致内容溢出 | [issues/01_text-area-font-overflow.md](./issues/01_text-area-font-overflow.md) |
| 2 | 🟡 主要 | 日期标题布局优化 | [issues/02_date-title-layout.md](./issues/02_date-title-layout.md) |

---

## ✅ 正确部分（勿动）

- 三栏布局结构
- 外层 flex 容器的流式排列（无 absolute 子元素）
- 卡片容器已正确移除（无背景/边框/阴影）
- 文案内容已正确更新
- 背景图片和 #ece2d0 色调
- Playfair Display 衬线字体
- 标签页位置和交互
- Shield/Anchor 装饰图标
- 分隔线 "II" 的样式
- 右侧面板（地图、坐标、CLASSIFIED）
- 滚动吸附和移动端布局

---

## 修复流程

1. **先修 #1（字号/布局溢出）** — 这是当前最突出的视觉问题
2. **再修 #2（日期标题）** — 独立问题，但建议在 #1 之后处理（整体比例会变）
3. 每个问题修复后写 fix-log
4. 全部完成后重新运行 `/design2code diff` 进行下一轮对比
