# 问题 #3: 社交图标格式差异

- **严重程度**: 🟢次要
- **类别**: 内容
- **问题层级**: 数值性（数据和分隔符需调整）
- **精度要求**: 像素级精确
- **文件**: `src/components/WorksDetailSection.tsx`
- **代码位置**: 第 60 行、第 543-544 行

## 根因分析

社交图标数据数组使用了错误的字母和分隔方式：
- 数组内容: `['f', 'l', 't', '▶']`（含 `l` 即 LinkedIn）
- 连接方式: `.join(' ')`（空格分隔）
- 结果: `F L T ▶`（因为 `text-transform: uppercase`）

而期望设计中显示为 `f | t | ▶`（小写，管道符分隔，无 LinkedIn 的 `l`）。

## 期望效果

参考设计图: [../works-gallery-design-reference.png](../works-gallery-design-reference.png)

社交图标区域显示为: `f | t | ▶`
- 小写字母
- 管道符 `|` 作为分隔符
- 只有 f（Facebook）、t（Twitter）、▶（Play/Video）三个，无 l（LinkedIn）

## 当前问题

- 数组含 4 项: `['f', 'l', 't', '▶']` — 多了 `l`
- 分隔符: 空格 `.join(' ')` — 应为管道符 ` | `
- CSS `text-transform: uppercase` 将小写变大写 — 期望设计为小写

## 修复指令

### 步骤 1: 修改数组（第 60 行）

```tsx
/* 当前 */
const WORKS_DETAIL_STAGE_SOCIALS = ['f', 'l', 't', '▶'] as const;

/* 修改为 */
const WORKS_DETAIL_STAGE_SOCIALS = ['f', 't', '▶'] as const;
```

### 步骤 2: 修改连接方式（第 544 行）

```tsx
/* 当前 */
{WORKS_DETAIL_STAGE_SOCIALS.join(' ')}

/* 修改为 */
{WORKS_DETAIL_STAGE_SOCIALS.join(' | ')}
```

### 步骤 3: 移除 uppercase（CSS 第 647-653 行）

在 `src/index.css` 第 647-653 行的 `.works-detail-stage__socials` 中，移除 `text-transform: uppercase;`，或针对 socials 单独覆盖：

```css
/* 在 .works-detail-stage__socials 中添加 */
.works-detail-stage__socials {
  text-transform: none;
}
```

注意: `.works-detail-stage__credits` 共享同一规则块（第 647-653 行），`CREDITS` 文字应保持 uppercase。所以不要直接删除共享块的 `text-transform`，而是在 `.works-detail-stage__socials` 单独覆盖。

## 策略提示

- 如果 `.works-detail-stage__credits` 的 uppercase 也需要保持，务必拆分 CSS 规则而非直接删除共享属性
- 管道符 `|` 两侧各一个空格，视觉上等同于期望设计的间距

## 验证方式

社交图标区域应显示为 `f | t | ▶`（小写，管道分隔，三项）。

## 不要修改

- `.works-detail-stage__credits` 的样式和文本
- 底栏整体 grid 布局
- 分页器样式
- 品牌 "blacknegative" 样式
- 对角线和卡片样式

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/03_social-icons-format_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因（如果切换了策略，说明为什么）
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：如果精度要求为像素级，是否已将关键数值提取为可调参数？参数位置在哪里？
