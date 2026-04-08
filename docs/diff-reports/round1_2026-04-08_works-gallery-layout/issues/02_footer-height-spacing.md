# 问题 #2: 底栏高度/间距不足

- **严重程度**: 🟢次要
- **类别**: 布局
- **问题层级**: 数值性（padding 需调整）
- **精度要求**: 近似即可
- **文件**: `src/components/WorksDetailSection.tsx`
- **代码位置**: 第 471 行

## 根因分析

detail view 容器的垂直 padding 偏小（`py-6` / `sm:py-8`，即 1.5rem / 2rem），导致底栏与页面底部间距不足，整体页面高度比期望设计矮约 100px。

## 期望效果

参考设计图: [../works-gallery-design-reference.png](../works-gallery-design-reference.png)

底栏区域应有更充裕的呼吸空间，底部 padding 更大，使整体页面感觉更宽敞。期望设计中底栏与页面底边有约 2.5-3rem 的间距。

## 当前问题

- 容器 padding: `py-6`（1.5rem）/ `sm:py-8`（2rem）— 底部间距不足
- 导致底栏"贴"着页面底部，视觉上偏紧凑
- 页面整体高度 1088px vs 期望 1193px

## 修复指令

在 `src/components/WorksDetailSection.tsx` 第 471 行：

```tsx
/* 当前 */
className="works-detail-stage relative flex h-full w-full flex-col overflow-hidden px-5 py-6 text-[#f8ebdb] sm:px-8 sm:py-8"

/* 建议修改 — 增大底部 padding */
className="works-detail-stage relative flex h-full w-full flex-col overflow-hidden px-5 pt-6 pb-10 text-[#f8ebdb] sm:px-8 sm:pt-8 sm:pb-12"
```

将 `py-6` 拆分为 `pt-6 pb-10`，`sm:py-8` 拆分为 `sm:pt-8 sm:pb-12`，单独增大底部 padding。

## 策略提示

- 如果增大 pb 后底栏位置仍不够低，可以在 footer 容器（第 526 行 `<div className="relative z-10 mt-auto flex flex-col gap-6">`）上增加 `pb-4` 或调整 `gap`
- `mt-auto` 已确保 footer 推到底部，主要靠容器 padding 控制间距

## 验证方式

底栏与页面底边应有明显间距（约 2.5-3rem），底部不显得拥挤。对比期望设计确认。

## 不要修改

- 底栏内部结构（grid 三栏布局）
- 分页器 tick 样式和数量
- 品牌文字 "blacknegative" 样式
- 顶部 padding（pt）
- 卡片区域和对角线样式

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/02_footer-height-spacing_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因（如果切换了策略，说明为什么）
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：如果精度要求为像素级，是否已将关键数值提取为可调参数？参数位置在哪里？
