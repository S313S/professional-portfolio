# 问题 #3: 移除 Shield/Anchor 图标和 "II" 分隔线（节省垂直空间）

- **严重程度**: 🟡主要
- **类别**: 布局 / 空间优化
- **问题层级**: 结构性（移除多余元素）
- **精度要求**: 精确（删除指定元素即可）
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 812-817 行（Shield 图标）、第 835-842 行（"II" 分隔线）、第 845-849 行（Anchor 图标）
- **期望设计参考**: `docs/diff-reports/careerDeatil_Demonstration.jpeg`

## 根因分析

Shield 图标、Anchor 图标和 "II" 分隔线都是代码后加的装饰元素，**原始背景设计图中不存在这些元素**。它们各自占据垂直空间：
- Shield 图标 + `mb-2` 间距 ≈ 32px
- "II" 分隔线 + `py-2` 间距 ≈ 36px
- Anchor 图标 + `mb-2` 间距 ≈ 28px

合计约 **96px** 的垂直空间浪费，这是导致文本区域显得拥挤/溢出的重要原因之一。

## 期望效果

- 区块一直接从 eyebrow（"CHRONICLE I:"）开始，上方无图标
- 区块一和区块二之间无分隔线，直接衔接（或仅保留少量间距）
- 区块二直接从 h4（"Instrument Calibration Specialist"）开始，上方无图标

## 修复指令

### 1. 删除 Shield 图标（第 812-817 行）

```tsx
// 删除以下代码：
<Shield
  data-career-detail-icon="shield"
  aria-hidden="true"
  className="mb-2 h-6 w-6 text-[#7f6854]/40"
  strokeWidth={1.6}
/>
```

### 2. 删除 "II" 分隔线整个容器（第 835-842 行）

```tsx
// 删除以下代码：
<div
  data-career-detail-divider="chapter-ii"
  className="flex items-center gap-3 py-2"
>
  <div className="h-px flex-1 bg-[#8f775f]/30" />
  <span className="font-serif text-sm tracking-[0.28em] text-[#7f6854]/60">II</span>
  <div className="h-px flex-1 bg-[#8f775f]/30" />
</div>
```

删除分隔线后，区块一和区块二之间可能需要一个小间距。在区块二的外层 `<div>`（当前第 844 行）上加 `mt-4` 或 `mt-6`：

```tsx
// 当前：
<div>
// 改为：
<div className="mt-6">
```

### 3. 删除 Anchor 图标（第 845-849 行）

```tsx
// 删除以下代码：
<Anchor
  data-career-detail-icon="anchor"
  aria-hidden="true"
  className="mb-2 h-5 w-5 text-[#7f6854]/40"
  strokeWidth={1.8}
/>
```

### 4. 清理 import

如果 `Shield` 和 `Anchor` 在文件中不再被使用，删除对应的 import 语句。

## 策略提示

- 这是纯删除操作，不涉及样式调整
- 删除后总垂直空间节省约 96px，可能使 issue #1（字号溢出）部分自愈
- 删除分隔线后两个区块之间仍需少量间距（`mt-4` 到 `mt-8`），具体值在浏览器中调试确认
- 如果用户后续想要视觉分隔，可以用更紧凑的方式（如细线 `border-t`）替代

## 验证方式

1. 运行 `npm run dev`，查看 CareerDetailSection
2. 确认 Shield 和 Anchor 图标不再显示
3. 确认 "II" 分隔线不再显示
4. 确认区块一和区块二之间有合理间距
5. 确认总文本区域更紧凑，更接近期望设计

## 不要修改

- 文本内容（eyebrow / headline / body / supportingTitle / supportingBody）
- 字号和行高（由 issue #1 处理）
- 日期标题（由 issue #2 处理）
- 外层 flex 容器定位
- 右侧 aside 面板
- 标签页

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/03_remove-icons-and-divider_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：区块间距值（mt-X），方便后续微调
