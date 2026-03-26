# 01 aside-map-illustration-mismatch 修复日志

1. **理解**
   aside 里的旧地图资产是简单等高线弧线，信息密度太低，和设计稿中的山脉地形素描完全不是同一种视觉语言。这个问题即使布局修准了，也会继续拉低匹配度。

2. **分析**
   我检查了 `public/images/careerDetail_map.png`，旧文件是 `1200×1200` 的正方形线稿；再对照 `docs/diff-reports/careerDeatil_Demonstration.jpeg`，确认设计稿里需要的是更复杂的山脉地形纹理。与此同时，aside 在结构修复后更高，所以地图容器也要同步改成更高的可视区，才能让新资产成为卡片主视觉。

3. **方案**
   采用“从现有设计参考中提取匹配插图细节”的方案，不额外引入外部素材。具体做法是从 `careerDeatil_Demonstration.jpeg` 里裁出山脉素描区域，放大到 1200px 宽后替换 `public/images/careerDetail_map.png`，并把地图容器改成固定高度占比，避免继续沿用接近正方形的旧比例。

4. **改动**
   修改了 `public/images/careerDetail_map.png`：
   - 用设计参考中的山脉素描裁切结果替换旧的弧线地图。
   - 输出为 `1200×1528` PNG。
   修改了 `src/components/CareerDetailSection.tsx`：
   - 地图容器从旧的 `aspect-[0.83/1]` 改为使用 `CAREER_DETAIL_DESKTOP_ASIDE_LAYOUT.mapHeight` 控制高度。
   - 图片保持 `object-cover object-center`，让素描细节铺满卡片上半区。

5. **验证**
   已检查：
   - 新资产文件尺寸：`1200×1528`
   - live 页面截图中 aside 上半区已显示山脉地形素描，而不是旧的弧线图
   - `node --import tsx --test src/components/CareerDetailSection.render.test.tsx` 通过，确保旧的 `aspect-[0.83/1]` 已移除

6. **遗留**
   这次替换使用的是设计参考图中同一区域裁切出的素材，所以风格匹配度高，但本质上仍是静态位图。如果后续还要继续压缩像素误差，可能需要专门的独立插画源文件。

7. **可调参数**
   已提取地图高度参数。位置在 `src/components/CareerDetailSection.tsx` 的 `CAREER_DETAIL_DESKTOP_ASIDE_LAYOUT.mapHeight`。如果后续需要让地图再多占一点或少占一点高度，直接调这个值即可。

## 2026-03-26 补充

用户后来明确希望红框内整体都长成 `careerDetail_litteleBg.png`，而不是只替换上半部分插画。因此实现已进一步调整为：
- aside 内部改成单张整卡图片 `careerDetail_litteleBg.png`
- 删除原先额外叠加的 `CLASSIFIED / 坐标 / 注释` DOM 文本层
- 保留 aside 外层位置与尺寸不变，只替换内部表现形式

当前这份日志前半段记录的是“只修地图插画”的中间阶段；最终线上实现以这次补充为准。
