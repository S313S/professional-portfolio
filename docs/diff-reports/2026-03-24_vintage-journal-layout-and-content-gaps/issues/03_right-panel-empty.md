# 问题 #3: 右侧面板为空，需添加地形图和元数据

- **严重程度**: 🔴严重
- **类别**: 结构
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 397-404 行

## 期望效果

右侧 `<aside>` 面板应包含：
1. 右上角 "CLASSIFIED" 标签
2. 元数据头部行：`REF: E8.22 / SECTOR 4` 和 `ELEV: 1,344M`
3. 地形图插图（`/images/careerDetail_map.png`）
4. 坐标数据：`X: 14.22 / 9-98.11`
5. 斜体标注："Magnetic variance noted"
6. 底部 annotation 文字

## 当前问题

`<aside>` 元素内部仅有空白嵌套 div 占位框，无任何实际内容。

## 修复指令

替换第 397-404 行 `<aside>` 内部结构为以下 JSX：

```tsx
<aside className="absolute right-[7.5%] top-[19.5%] w-[25%] ...现有样式...">
  {/* 1. CLASSIFIED 标签 */}
  <span className="absolute top-3 right-4 text-[0.65rem] uppercase tracking-[0.3em] text-[#7f6854]/50">
    Classified
  </span>

  {/* 2. 元数据头部 */}
  <div className="flex justify-between text-[0.65rem] uppercase tracking-widest text-[#7f6854]">
    <span>REF: E8.22 / SECTOR 4</span>
    <span>ELEV: 1,344M</span>
  </div>

  {/* 3. 地形图（前置条件：/public/images/careerDetail_map.png 已放入） */}
  <div className="mt-2 aspect-[0.83/1] w-full overflow-hidden rounded-[0.9rem] border border-[#8f775f]/18">
    <img src="/images/careerDetail_map.png" alt="Topographic map" className="h-full w-full object-cover" />
  </div>

  {/* 4. 坐标和标注 */}
  <p className="mt-2 text-[0.7rem] text-[#7f6854]">X: 14.22 / 9-98.11</p>
  <p className="text-[0.7rem] italic text-[#7f6854]">"Magnetic variance noted"</p>

  {/* 5. 保留底部 annotation */}
  <p className="mt-4 text-sm italic leading-[1.55] text-[#5f4d3f]">
    {selectedContent.annotation}
  </p>
</aside>
```

**前置条件**：素材文件 `careerDetail_map.png` 必须已放入 `/public/images/` 目录。如果素材尚未就位，先用占位色块（`bg-[#d4c4a8]`）替代图片区域，并添加 TODO 注释。

保留 `<aside>` 元素上现有的外层 className（position、尺寸、背景等），只替换内部子元素。

## 验证方式

- 运行 `npm run dev`，确认右侧面板显示地形图、元数据和坐标信息
- 确认 "CLASSIFIED" 标签出现在右上角
- 确认 annotation 文字随标签页切换而变化
- 确认面板在不同屏幕尺寸下不溢出

## 不要修改

- 三栏布局结构（标签页 | 内容 | 面板）
- 背景图片和 #ece2d0 色调
- Playfair Display 衬线字体
- 标签页切换交互功能
- 滚动吸附行为
- 移动端响应式布局
- `<aside>` 元素的外层定位和尺寸类名

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/03_right-panel-empty_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
