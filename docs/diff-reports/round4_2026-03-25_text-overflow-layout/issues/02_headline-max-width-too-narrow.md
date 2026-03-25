# 问题 #2: 标题 max-w-[16ch] 过窄

- **严重程度**: 🟡主要
- **类别**: 布局
- **问题层级**: 数值性（max-width 值过小）
- **精度要求**: 近似即可
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 985 行（桌面端 H3）、第 857 行（移动端 H3）

## 根因分析

H3 标题设置了 `max-w-[16ch]`（约 307px），导致较长标题强制折行到 3-4 行。设计稿中标题最多 2 行。此约束使得不同 entry 的标题高度差异巨大（2 行 = 59px vs 4 行 = 118px），进而推挤下方内容越过中间装饰分割线。

受影响的标题举例：
- "Where Content, Distribution, And Revenue Began To Merge" → 4 行
- "Turning Repeated Questions Into Reusable Notes" → 3 行
- "Designing Workflows That Other People Could Carry" → 3 行
- "Using AI To Shorten The Path From Idea To Output" → 3 行

## 期望效果

标题最多折为 2 行。参考期望设计图 [../careerDeatil_Demonstration.jpeg](../../careerDeatil_Demonstration.jpeg)。

## 当前问题

- `max-w-[16ch]` = 307px，长标题折为 3-4 行
- 4 行标题高度 118px vs 2 行 59px，多出 59px 推挤下方内容

## 修复指令

1. 打开 `src/components/CareerDetailSection.tsx`
2. 找到第 985 行桌面端 H3:
   ```
   max-w-[16ch]
   ```
   替换为:
   ```
   max-w-[24ch]
   ```
3. 找到第 857 行移动端 H3（搜索 `max-w-[16ch]`）:
   ```
   max-w-[16ch]
   ```
   替换为:
   ```
   max-w-[24ch]
   ```

## 策略提示

- `24ch` 约允许 24 个字符宽度，大多数标题可在 2 行内显示
- 如果 `24ch` 仍有 3 行标题，可进一步增大或直接移除 `max-w` 约束
- 如果移除后标题太宽与右侧 aside 面板冲突，需检查容器 `w-[29%]` 是否已足够约束宽度

## 验证方式

修复后，逐个切换所有 tab 和 entry，确认每个标题最多 2 行。在 Playwright 中检查 H3 的行数: `Math.round(h3.clientHeight / parseFloat(getComputedStyle(h3).lineHeight)) <= 2`。

## 不要修改

- H3 的 font-size、font-family、tracking
- H4 副标题的任何样式
- 容器 `w-[29%]` 的宽度
- 标题的文本内容

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/02_headline-max-width-too-narrow_log.md`
