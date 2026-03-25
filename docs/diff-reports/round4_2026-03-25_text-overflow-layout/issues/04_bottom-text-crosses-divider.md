# 问题 #4: 底部文本区越过中间装饰分割线

- **严重程度**: 🔴严重
- **类别**: 布局
- **问题层级**: 结构性（上下文本区未独立约束）
- **精度要求**: 近似即可
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 974-1004 行（桌面端 card-stack 容器）

## 根因分析

右侧文本区分为上下两部分（eyebrow+headline+body / supportingTitle+supportingBody），以背景中的装饰滚轴图标（约 y=472）为分界。当前两部分位于同一个 `flex-col` 容器内，没有独立的位置约束。

当上部标题折为 4 行（118px vs 正常 2 行 59px），整个 flex-col 容器被撑高，底部文本区从 y=492 延伸到 y=596，越过了背景装饰分割线的视觉边界。

**结构性根因**：上下两部分共用一个 flex-col 容器，上部内容高度变化直接影响下部位置。

## 期望效果

- 上部文本区（eyebrow + headline + body）应完全在装饰分割线**上方**
- 下部文本区（supportingTitle + supportingBody）应完全在装饰分割线**下方**
- 两者互不影响，内容过长时应通过 overflow 或缩减而非推挤对方

参考期望设计图 [../careerDeatil_Demonstration.jpeg](../../careerDeatil_Demonstration.jpeg)。

## 当前问题

**全部 8/8 entry 的底部文本区均越过分割线（y≈472）：**

| Tab | Entry | H3行数 | 上部底边 | 下部底边 | 越界量 |
|-----|-------|--------|---------|---------|-------|
| Sharing | First Public Notes | 2 | 387 | 515 | +43px |
| Sharing | Pattern Library | 3 | 438 | 566 | +94px |
| Sharing | Editorial Rhythm | 3 | 416 | 544 | +72px |
| Work | Campaign Ops | 2 | 409 | 537 | +65px |
| Work | Process Design | 3 | 416 | 544 | +72px |
| Work | AI Delivery | 3 | 438 | 566 | +94px |
| Industry | AI Adoption | 3 | 438 | 566 | +94px |
| Industry | Creator Commerce | 4 | 468 | 596 | +124px |

- **即使最佳情况（2行标题）也越界 43px** — 说明问题不仅是标题折行，底部文本区整体位置偏低
- 5/8 entry 标题折为 3 行，1/8 折为 4 行
- 越界范围 43px ~ 124px

## 修复指令

**首选方案（先修 #1 和 #2 后验证）：**

修复 #1（leading-[0.92] → leading-none）和 #2（max-w-[16ch] → max-w-[24ch]）后，标题行数减少到 ≤2 行，上部高度降低，flex-col 容器不再被撑高，底部文本自然回到分割线以下。验证是否已解决。

**备选方案（如首选方案不够）：**

将上下两部分从同一 flex-col 容器改为两个独立定位的容器：

```tsx
{/* 上部文本区 — 固定在分割线上方 */}
<div className="absolute left-[37%] top-[22%] w-[29%]">
  <p>{displayedEntry.eyebrow}</p>
  <h3>{displayedEntry.headline}</h3>
  <p>{displayedEntry.body}</p>
</div>

{/* 下部文本区 — 固定在分割线下方 */}
<div className="absolute left-[37%] top-[55%] w-[29%]">
  <h4>{displayedEntry.supportingTitle}</h4>
  <p>{displayedEntry.supportingBody}</p>
</div>
```

`top-[55%]` 需根据背景图中装饰图标的实际位置微调。可通过 Playwright 定位装饰图标的精确 y 坐标来确定。

## 策略提示

核心原则：**先修结构性根因（#1 和 #2），再验证此问题是否自然消除。** 不要在标题折行仍为 4 行时反复调位置数值。

如果采用备选方案（独立定位），需额外处理：
- 上部文本区过长时需 `overflow-hidden` 或 `line-clamp`
- 下部文本区位置不再随上部内容流动，需确保各 entry 的内容长度都适配固定区域

## 验证方式

1. 逐个切换所有 tab 和所有 entry
2. 确认上部文本底边 < 装饰分割线 y 坐标（≈472px at 1600×900）
3. 确认下部文本不越过背景页面底部边界
4. 用 Playwright `getBoundingClientRect()` 精确验证

## 不要修改

- 三个 tab 按钮图片的位置和缩放
- 右侧 aside 面板
- metaLine + dateTitle 区域
- 背景图及其 object-cover 设置
- 记录选择器（右侧垂直按钮）

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/04_bottom-text-crosses-divider_log.md`
