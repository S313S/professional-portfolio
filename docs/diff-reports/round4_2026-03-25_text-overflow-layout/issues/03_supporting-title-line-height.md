# 问题 #3: 副标题行高溢出

- **严重程度**: 🟡主要
- **类别**: 排版
- **问题层级**: 数值性（line-height 值偏低）
- **精度要求**: 近似即可
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 997 行（桌面端 H4）、第 867 行（移动端 H4，如存在）

## 根因分析

H4 副标题使用 `leading-[0.95]`，即 `line-height: 0.95`。对于 `font-size: 28.8px`，计算得到 `line-height: 27.36px`，小于字号。`scrollHeight(33) > clientHeight(27)`，底部 descender 被裁切约 6px。

## 期望效果

副标题 line-height ≥ font-size，确保文字完整显示。参考期望设计图 [../careerDeatil_Demonstration.jpeg](../../careerDeatil_Demonstration.jpeg)。

## 当前问题

- `leading-[0.95]` → `line-height: 27.36px` < `font-size: 28.8px`
- `scrollHeight(33) > clientHeight(27)`，溢出 6px
- 影响所有 3 个 tab 的所有 entry 的 H4

## 修复指令

1. 打开 `src/components/CareerDetailSection.tsx`
2. 找到第 997 行桌面端 H4:
   ```
   leading-[0.95]
   ```
   替换为:
   ```
   leading-none
   ```

## 策略提示

与 #1 相同，如果 `leading-none` 间距过大，可用 `leading-[1.05]`。

## 验证方式

修复后检查 H4 的 `scrollHeight === clientHeight`。

## 不要修改

- H3 标题的 leading（那是 #1 的范围）
- H4 的 font-size、tracking 等其他样式
- 移动端的 supportingTitle 样式（如有需要在 #1 修复时一并处理）

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/03_supporting-title-line-height_log.md`
