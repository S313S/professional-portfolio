# 问题 #1: 标题行高溢出

- **严重程度**: 🔴严重
- **类别**: 排版
- **问题层级**: 数值性（line-height 值偏低）
- **精度要求**: 近似即可
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 985 行（桌面端 H3）、第 857 行（移动端 H3）

## 根因分析

H3 标题使用 `leading-[0.92]`，即 `line-height: 0.92`。对于 `font-size: 32px`，计算得到 `line-height: 29.44px`，小于字号本身。多行标题的 `scrollHeight` 超过 `clientHeight`（如 4 行标题 124px > 118px），导致最后一行的 descender（如字母 g、y、p 的下伸部分）被裁切约 6px。

## 期望效果

标题 line-height ≥ font-size，确保多行标题的所有文字都完整显示，不发生裁切。参考期望设计图 [../careerDeatil_Demonstration.jpeg](../../careerDeatil_Demonstration.jpeg)，标题行间距紧凑但无重叠。

建议值：`leading-none`（1.0）或 `leading-[1.05]`。

## 当前问题

- `leading-[0.92]` → `line-height: 29.44px` < `font-size: 32px`
- `scrollHeight (124px) > clientHeight (118px)`，溢出 6px
- 影响所有 3 个 tab 的所有 entry

## 修复指令

1. 打开 `src/components/CareerDetailSection.tsx`
2. 找到第 985 行桌面端 H3:
   ```
   leading-[0.92]
   ```
   替换为:
   ```
   leading-none
   ```
3. 找到第 857 行移动端 H3（搜索 `leading-[0.94]`）:
   ```
   leading-[0.94]
   ```
   替换为:
   ```
   leading-none
   ```

## 策略提示

如果 `leading-none`（1.0）看起来间距过大，可尝试 `leading-[1.05]`。关键是 line-height ≥ font-size。

## 验证方式

修复后，在 Playwright 中检查 H3 的 `scrollHeight === clientHeight`（不再溢出）。

## 不要修改

- H4 副标题的 leading（那是 #3 的范围）
- eyebrow、body、supportingBody 的排版样式
- 任何非 leading 相关的 H3 样式（font-size, max-w, tracking 等）

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/01_headline-line-height-overflow_log.md`
