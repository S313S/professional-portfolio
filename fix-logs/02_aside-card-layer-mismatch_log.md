# 02 aside-card-layer-mismatch 修复日志

1. **理解**
   aside 没有覆盖到用户在 Chrome DevTools MCP 中框选的笔记本页区域。报告里给出的核心偏差是顶部偏下约 28px、高度少约 118px，所以这不是单纯内容撑开问题，而是定位坐标系和显式高度都不对。

2. **分析**
   我先读了 `docs/diff-reports/round5_2026-03-25_post-overflow-fix/report.md` 和对应 issue 文档，再补了 `test-career-detail-aside-layout.cjs` 做像素回归。红灯结果是 `top=181.84375px`，和报告一致。继续用 Playwright 量 live DOM 后发现 aside 的 containing block 不是整个 section，而是内部 desktop stage：`x=40, y=31.5, w=1390, h=771`。因此报告里的 section 相对百分比不能直接抄进 aside，需要先换算到 stage 坐标系。

3. **方案**
   采用“先换算坐标系，再固定卡片高度”的方案。具体做法是把目标红框 `x=978, y=154, w=368, h=637` 换算成 stage 相对值：`left 67.48% / top 15.89% / width 26.47% / height 82.62%`。同时把 aside 改成 `flex flex-col`，避免在显式高度下仍然依赖内容自然撑开。

4. **改动**
   修改了 `src/components/CareerDetailSection.tsx`：
   - aside 从 `right/top/w` 的旧布局改为 `left/top/w/h` 的显式覆盖布局。
   - 新增 `data-career-detail-aside="desktop"` 方便回归测试和后续定位。
   - 将 aside 内部改成 `flex-1` 的纵向结构，注释段用 `mt-auto` 固定到底部。
   - 把关键定位值提取到 `CAREER_DETAIL_DESKTOP_ASIDE_LAYOUT` 常量。
   修改了 `src/components/CareerDetailSection.render.test.tsx`：
   - 新增 aside 布局回归断言。
   新增了 `test-career-detail-aside-layout.cjs`：
   - 在 `1470×835` 视口下直接校验 aside 的 `left/top/width/height`。

5. **验证**
   已运行：
   - `node --import tsx --test src/components/CareerDetailSection.render.test.tsx`
   - `BASE_URL=http://127.0.0.1:3099 node test-career-detail-aside-layout.cjs`
   第二个测试先红后绿，最终通过，说明 aside 实际像素已经对齐目标区域。

6. **遗留**
   当前回归锁定的是报告指定的 `1470×835` 基准视口。不同宽高比下仍会受到背景图 `object-cover` 的轻微影响，但这已经是和现有设计实现方式一致的最稳妥对齐点。

7. **可调参数**
   已提取。参数位于 `src/components/CareerDetailSection.tsx` 顶部的 `CAREER_DETAIL_DESKTOP_ASIDE_LAYOUT` 常量：
   - `left`
   - `top`
   - `width`
   - `height`

## 2026-03-26 补充

后续按用户新要求，aside 内部已从“地图+文本分层”改成“完整档案卡图片铺满”。这次补充没有改动外层像素对齐参数，所以 `CAREER_DETAIL_DESKTOP_ASIDE_LAYOUT` 仍然是当前定位基准。
