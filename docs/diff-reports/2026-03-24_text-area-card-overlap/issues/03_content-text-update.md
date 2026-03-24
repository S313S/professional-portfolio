# 问题 #3: 内容文案未更新

- **严重程度**: 🟡主要
- **类别**: 内容
- **问题层级**: 数据问题
- **精度要求**: 近似即可（文案正确即可，无像素级要求）
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 34-111 行（`CAREER_DETAIL_RECORDS` 数组）

## 根因分析

纯数据问题。代码中的文案内容仍然是旧版本，需要替换为期望设计中的正确文案。

## 期望效果

第一条记录（aurora-basin-expedition）的 sharingJourney tab 内容应为：
- eyebrow: `Chronicle I:`
- headline: `Chief Surveyor & Field Archivist`
- body: 以 "Appointed by the Royal Geographical Society..." 开头的文本
- supportingTitle: `Instrument Calibration Specialist`
- supportingBody: 以 "Pioneered the integration of brass + analytical engines..." 开头的文本

## 当前问题

当前文案仍为旧版：
- headline: "Field Notes From the First Threshold"
- supportingTitle: "Listening Before the Echo"
- 等等

## 修复指令

更新 `CAREER_DETAIL_RECORDS[0].contentByTab.sharingJourney` 中的所有文本字段。

具体替换内容见上一轮报告：
`docs/diff-reports/2026-03-24_vintage-journal-layout-and-content-gaps/issues/02_content-text-update.md`

> 注意：上一轮报告中的文案从期望设计截图 OCR 转录，可能有拼写误差。如果发现明显错别字请修正。

## 策略提示

- 这是纯数据替换，不涉及样式或布局变更
- 建议在 #1（卡片重叠）修复之后再更新文案，因为新文案长度可能不同，需要在修复后的流式布局中验证

## 验证方式

- 运行 dev server，选择 "Sharing Journey" tab 和 "Aurora Basin Expedition" record
- 确认标题显示为 "Chief Surveyor & Field Archivist"
- 确认辅助标题为 "Instrument Calibration Specialist"

## 不要修改

- 任何样式或布局代码
- 其他 tab（workExperience、industryKnowledge）的内容
- 其他 record（signal-house-residency）的内容

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/03_content-text-update_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
> 7. **可调参数**：是否有需要后续手调的参数？位置在哪里？
