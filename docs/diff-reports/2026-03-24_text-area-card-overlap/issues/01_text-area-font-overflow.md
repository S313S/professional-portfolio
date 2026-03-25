# 问题 #1: 文本区域字号过大导致内容溢出

- **严重程度**: 🔴严重
- **类别**: 排版 / 布局
- **问题层级**: 数值性（字号和间距需缩小以适配容器）
- **精度要求**: 近似即可（文本紧凑地适配在标签页高度范围内即可）
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 807-858 行（`data-career-detail-card-stack` 容器及子元素）

## 根因分析

文本区域（区块一 + 分隔线 + 区块二）总高度为 633px，几乎占满整个视口高度（800px）。主要原因：

1. **h3 标题字号过大**：当前 `clamp(2.4rem,2.6vw,3rem)` 在 1536px 视口下计算为 **39.9px**，加上 `max-w-[12ch]` 约束导致换行，headline 占据 73px 高度
2. **h4 辅助标题字号过大**：当前 `clamp(2.1rem,2.2vw,2.8rem)` 计算为 **33.8px**，占据 64px 高度
3. **body 正文字号偏大**：当前 `text-[1.02rem]` = 16.3px，行高 `leading-[1.55]` = 25.3px，6 行正文占 177px

结果：区块一和区块二的文本底部超出了左侧标签页导航对应的边界，内容显得拥挤且溢出。

## 期望效果

> 期望设计参考图：`docs/diff-reports/careerDeatil_Demonstration.jpeg`

参照期望设计：
- 所有文本内容（区块一 + 分隔线 + 区块二）应紧凑地排列在标签页高度范围内
- headline 和 supporting title 字号应明显小于当前值
- body 正文行数不变但整体更紧凑
- 分隔线前后间距适当缩小

## 当前数值

| 元素 | 当前值 | 代码位置 |
|------|--------|---------|
| h3 headline | `text-[clamp(2.4rem,2.6vw,3rem)]` = 39.9px | 第 824 行 |
| h3 max-width | `max-w-[12ch]` = 287px | 第 824 行 |
| body | `text-[1.02rem]` = 16.3px, `leading-[1.55]` | 第 829 行 |
| h4 supporting | `text-[clamp(2.1rem,2.2vw,2.8rem)]` = 33.8px | 第 851 行 |
| body (supporting) | `text-[1rem]`, `leading-[1.55]` | 第 854 行 |
| 分隔线间距 | `py-4` = 32px 总间距 | 第 837 行 |
| 容器宽度 | `w-[29%]` = 422px | 第 809 行 |

## 修复指令

缩小各文本元素的字号，使整体内容紧凑地适配在标签页高度内。建议调整方向：

```tsx
// 第 824 行 — h3 headline：缩小字号，放宽 max-width 限制
// 当前：text-[clamp(2.4rem,2.6vw,3rem)] max-w-[12ch]
// 建议：text-[clamp(1.8rem,2vw,2.2rem)] max-w-[16ch]
// 目标：headline 约 28-35px，宽度约束放宽使文字少换行

// 第 829 行 — body 正文：略微缩小
// 当前：text-[1.02rem] leading-[1.55]
// 建议：text-[0.92rem] leading-[1.5]

// 第 851 行 — h4 supporting title：缩小字号
// 当前：text-[clamp(2.1rem,2.2vw,2.8rem)]
// 建议：text-[clamp(1.6rem,1.8vw,2rem)]

// 第 854 行 — supporting body：略微缩小
// 当前：text-[1rem] leading-[1.55]
// 建议：text-[0.9rem] leading-[1.5]

// 第 837 行 — 分隔线间距：缩小
// 当前：py-4
// 建议：py-2 或 py-3
```

> 以上数值为建议方向，不是精确目标。请在浏览器中实际调试，确保区块一 + 分隔线 + 区块二的总高度不超过标签页导航区域的高度。

## 策略提示

- 优先缩小 h3 和 h4 的 clamp 值，这对总高度的影响最大
- 放宽 h3 的 `max-w-[12ch]` 可以减少换行，间接降低高度
- body 字号不要缩太多（不低于 0.88rem），否则可读性受损
- 切换不同 tab 和 record 后文案长度不同，需确保所有组合都不溢出
- 如果缩小字号后仍然溢出，考虑给外层 flex 容器加 `overflow-y-auto max-h-[...]` 作为保底

## 验证方式

1. 运行 `npm run dev`，查看 CareerDetailSection（桌面视口 ≥ 1280px）
2. 确认文本区域（区块一 + 分隔线 + 区块二）的底部不超过左侧标签页导航的底边
3. 切换所有 tab（Sharing Journey / Work Experience / Industry Knowledge）和所有 record（Aurora Basin / Signal House / Northwind / Glass Harbor），确认无溢出
4. 确认文本仍然清晰可读，字号不会过小

## 不要修改

- 三栏布局结构（标签页 | 内容 | 面板）
- 外层 flex 容器的定位（`absolute left-[37%] top-[22%] w-[29%]`）
- 右侧 aside 面板
- 标签页位置和交互
- 日期标题（另一个 issue 处理）
- 背景图片和色调
- 字体 family（Playfair Display）
- 文本内容本身
- Shield/Anchor 图标
- 分隔线 "II" 的视觉样式（只调间距，不改样式）

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/01_text-area-font-overflow_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：字号/间距的关键数值位置，方便后续微调
