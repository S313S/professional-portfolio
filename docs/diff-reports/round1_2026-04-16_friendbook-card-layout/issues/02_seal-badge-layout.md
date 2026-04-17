# 问题 #2: 徽章文字折行 + 标题与徽章布局方式不当

- **严重程度**: 🟡主要
- **类别**: 布局 | 排版
- **问题层级**: 结构性（grid 子布局方案需改为 flex）
- **精度要求**: 近似即可
- **文件**: `src/components/FriendBookFinalSection.tsx`
- **代码位置**: 第 1412-1413 行（text copy area sub-grid）、第 1415-1436 行（header contents + title + seal）

## 根因分析

标题和徽章当前使用 CSS Grid 子布局：`grid-cols-[15.8rem_auto]`（xl: `[17.4rem_auto]`），标题占固定 278px 列，徽章在 `auto` 列。

问题：
1. **标题列 278px 是固定值**，不管标题实际渲染多宽，列宽不变。标题和徽章之间的 12px 间隙是 `gap-x-3` 产生的，但视觉上徽章与标题文字末尾的距离取决于标题是否填满 278px。
2. **徽章被压到很窄的 auto 列**，badge 文字（如 "Two Pages"、"Who's This"）在 font-size 0.64rem (10.24px) 下折成 3 行，badge 高度 44.5px，远超标题高度 32px。
3. **header 使用 `contents` 布局**（第 1417 行），title 和 seal 作为 grid 的直接子项参与 grid 排列，无法独立于 grid 定义流式排列。

期望设计中，徽章是单行紧凑 badge，紧贴标题文字右侧，与标题在同一行基线对齐。

## 期望效果

参考设计图：`../friendbook-archive-expected-design.png`

- 标题和徽章在同一行，徽章紧贴标题文字右侧
- 徽章文字单行显示，不折行
- 徽章垂直居中对齐于标题基线附近

### 元素坐标映射表

| 元素 | CSS 选择器 | 当前值 | 期望值 | 说明 |
|------|-----------|--------|--------|------|
| 标题+徽章行 | `[data-friend-book-sample-entry-header-desktop]` | `contents` (grid 参与) | `flex flex-row items-baseline gap-2` | 改为独立 flex 行 |
| 标题列宽 | copy area grid col 1 | 固定 278px | 自适应（flex shrink） | 标题宽度由内容决定 |
| 徽章高度 | `[data-friend-book-sample-entry-seal-desktop]` | 44.5px (3 行) | ~20-22px (1 行) | 文字不折行 |
| 徽章字号 | seal span | 0.64rem / 0.72rem (xl) | 0.68rem / 0.76rem (xl) | 可微调 |

## 当前问题

1. seal badge 文字折 3 行（"Two Pages" → TWO / PAG / ES），高 44.5px
2. 标题列固定 278px，不随内容自适应
3. header `contents` 让 title 和 seal 直接参与 grid，无法独立流式排列

## 修复指令

### 步骤 1: 将 copy area 从 grid 改为 flex column（第 1412-1413 行）

```
当前:
className="grid min-w-0 grid-cols-[15.8rem_auto] grid-rows-[auto_auto] items-start gap-x-3 gap-y-2 xl:grid-cols-[17.4rem_auto]"

改为:
className="flex min-w-0 flex-col gap-2"
```

### 步骤 2: 将 header 从 `contents` 改为 flex row（第 1415-1417 行）

```
当前:
className="contents"

改为:
className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
```

### 步骤 3: 给 seal badge 添加 `whitespace-nowrap`（第 1426-1427 行）

```
当前:
className="mt-[0.16rem] shrink-0 justify-self-start rounded-full border px-2.5 py-1 text-[0.64rem] uppercase tracking-[0.16em] xl:mt-[0.22rem] xl:px-3 xl:text-[0.72rem]"

改为:
className="mt-[0.16rem] shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.64rem] uppercase tracking-[0.16em] xl:mt-[0.22rem] xl:px-3 xl:text-[0.72rem]"
```

移除 `justify-self-start`（flex 布局中无效）。

### 步骤 4: 调整 excerpt 样式（第 1437-1439 行）

移除 `col-span-2`（不再是 grid 子项）：

```
当前:
className="col-span-2 text-[0.96rem] leading-7 text-[#463731] xl:text-[1.18rem] xl:leading-[1.6]"

改为:
className="text-[0.96rem] leading-7 text-[#463731] xl:text-[1.18rem] xl:leading-[1.6]"
```

## ⚠️ 参数化要求

此 issue 主要是布局方案切换（grid → flex），不涉及大量数值参数。关键可调值：

```
--seal-badge-font-size: 0.64rem (base) / 0.72rem (xl)
--header-gap: 0.5rem (gap-x-2)
--copy-area-gap: 0.5rem (gap-2)
```

如果需要进一步微调，可将这些值提取到配置对象中。但优先级低于 issue #1 的参数化。

## 策略提示

- 改为 flex 后，标题和徽章会自然流式排列。如果某些标题特别长导致徽章被挤到下一行，`flex-wrap` 会处理这种情况。
- 如果 `whitespace-nowrap` 后徽章文字超出卡片边界，考虑缩小 tracking 或 padding。
- 此 issue 应在 issue #1 完成后再修复，因为 issue #1 会改变外层 grid 列宽，影响文本区可用宽度。

## 验证方式

1. 三张卡的 seal badge 文字均为单行显示
2. 徽章紧贴标题文字右侧，间距 ~8px
3. 标题和徽章视觉上在同一行
4. 描述文字在标题+徽章行下方自然换行

## 不要修改

- 外层 grid 列比例和卡片高度（issue #1 负责）
- 徽章的背景色、边框色、文字色（inline style，来自 entry.seal 数据）
- 标题字体大小、字重、颜色
- 描述文字字体大小、行高、颜色
- 勋章图的尺寸和位置（issue #1 负责）

---

> ## ⚠️ 必须：写入修复日志（不可跳过）
>
> **此步骤为必须项，不可跳过。** 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/02_seal-badge-layout_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因（如果切换了策略，说明为什么）
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：是否已将关键数值提取为可调参数？参数位置在哪里？
>
> **没有日志 = 修复未完成。** QA agent 下一轮需要读取你的日志来理解你的决策，从而写出更好的修复指令。
