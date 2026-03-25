# 问题 #8: 原生 select 替换为自定义垂直选择器

- **严重程度**: 🟢次要
- **类别**: 排版
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 349-368 行

## 期望效果

记录选择器应为自定义垂直选择器样式，带有菱形拖拽手柄，与复古档案风格一致。视觉上类似一个竖向排列的刻度尺或档案索引标签。

## 当前问题

使用浏览器原生 `<select>` 元素，外观与复古主题不协调。

## 修复指令

将第 349-368 行的原生 `<select>` 替换为自定义 `<div>` 组件：

```tsx
// 替换原生 <select> 为自定义垂直选择器
<div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
  {CAREER_DETAIL_RECORDS.map((record, index) => (
    <button
      key={record.id}
      onClick={() => setSelectedRecordIndex(index)}
      className={`group flex flex-col items-center gap-1 ${
        selectedRecordIndex === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'
      }`}
    >
      {/* 菱形标记 */}
      <div
        className={`h-2.5 w-2.5 rotate-45 border transition-colors ${
          selectedRecordIndex === index
            ? 'border-[#7f6854] bg-[#7f6854]'
            : 'border-[#7f6854]/50 bg-transparent'
        }`}
      />
      {/* 可选：显示序号或缩写标签 */}
      <span className="font-serif text-[0.6rem] uppercase tracking-widest text-[#7f6854]">
        {String(index + 1).padStart(2, '0')}
      </span>
    </button>
  ))}
</div>
```

**注意**：
- 需确认 `selectedRecordIndex` 和 `setSelectedRecordIndex` 是现有的 state 变量名，根据实际代码调整
- 菱形用 `rotate-45 + border` 实现，无需额外素材
- 此为次要优先级，可放在其他问题修复之后处理

## 验证方式

- 运行 `npm run dev`，确认右边缘出现自定义垂直选择器
- 确认菱形标记可点击切换记录
- 确认选中状态有明确的视觉区分（实心菱形 vs 空心菱形）
- 确认原生 `<select>` 已完全移除
- 确认切换记录后内容正确更新

## 不要修改

- 三栏布局结构（标签页 | 内容 | 面板）
- 背景图片和 #ece2d0 色调
- Playfair Display 衬线字体
- 标签页切换交互功能
- 滚动吸附行为
- 移动端响应式布局
- 记录切换的逻辑和状态管理
- `CAREER_DETAIL_RECORDS` 数据结构

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/08_record-selector-style_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
