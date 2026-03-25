# 问题 #2: 内容文案需要全部更新为期望设计稿版本

- **严重程度**: 🔴严重
- **类别**: 内容
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 34-111 行（`CAREER_DETAIL_RECORDS` 数据数组）

## 期望效果

`CAREER_DETAIL_RECORDS[0].contentByTab.sharingJourney` 的文案应与期望设计稿一致，使用复古测绘探险主题的专业文案。

## 当前问题

代码中的文案是旧版占位文字（如 "Field Notes From the First Threshold"），需要替换为期望设计稿中的正式文案。

## 修复指令

更新 `CAREER_DETAIL_RECORDS` 数组中第一条记录（`aurora-basin-expedition`）的 `sharingJourney` 内容，逐字段替换：

```
eyebrow:
  旧: 'Chronicle I: Sharing Journey'
  新: 'Chronicle I:'

headline:
  旧: 'Field Notes From the First Threshold'
  新: 'Chief Surveyor & Field Archivist'

body:
  旧: 'Whispers, detours, and hard-won clarity...'
  新: 'Appointed by the Royal Geographical Society to the uncharted territories of the Inner Rim. For the creation of over forty-two high-fidelity topographical surveys using experimental lunar triangulation methods. Orchestrated the age through the Isolation encomother the 1992 expedition the Silent Valley, enduring these months of total isolation to capture the auroral shift.'

supportingTitle:
  旧: 'Listening Before the Echo'
  新: 'Instrument Calibration Specialist'

supportingBody:
  旧: 'Each retelling became a calibration exercise...'
  新: 'Pioneered the integration of brass + analytical engines with traditional cexterial sextants. Reduced celestial navigation margis by 14.2% acrential navigation error margins by 14.2% acrost offost. Served as the primary consultant for the HMS Discovery\'s deep water sima Trench, encuring accurate depth charting in the Maria...'

annotation:
  旧: 'Personal notes archived after the first season of public reflection.'
  新: '... [Expand for detailed HMS Discovery sounding error correction data]'
```

> **注意**：以上文字从期望设计截图中 OCR 转录，可能有误差。请逐条核实并修正明显错别字（如 "encomother"、"cexterial"、"margis"、"acrential"、"acrost offost"、"encuring" 等疑似 OCR 错误）。如果能从上下文推断正确拼写则修正，否则保留原样。

## 验证方式

- 运行 `npm run dev`，打开 Career Detail 页面
- 确认主标题显示 "Chief Surveyor & Field Archivist"
- 确认副标题显示 "Instrument Calibration Specialist"
- 确认眉标显示 "Chronicle I:"
- 确认正文和注释内容已更新

## 不要修改

- 三栏布局结构（标签页 | 内容 | 面板）
- 背景图片和 #ece2d0 色调
- Playfair Display 衬线字体
- 标签页切换交互功能
- 滚动吸附行为
- 移动端响应式布局
- 其他 tab（careerReview、industryKnowledge）的内容
- `CAREER_DETAIL_RECORDS` 数组中其他记录的内容

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/02_content-text-update_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
