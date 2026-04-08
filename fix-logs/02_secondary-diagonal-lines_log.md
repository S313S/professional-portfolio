1. **理解**：背景网格已有 135° 方向的重复线，但缺少与之交叉的 45° 方向，因此画面只是一组单向斜线，没有形成参考稿里的菱形网格。
2. **分析**：我检查了 `src/index.css` 中 `.works-detail-stage__grid` 的 `background-image`，确认它只有一个 `repeating-linear-gradient(135deg, ...)`。我把这个要求也并入 `src/components/WorksDetailSection.render.test.tsx` 的新增断言中，要求同一个规则块同时包含 135° 与 45° 两组 gradient；在修复前该断言失败。
3. **方案**：直接在现有 `background-image` 上叠加第二个 `repeating-linear-gradient(45deg, ...)`，保持颜色、线宽和间距参数一致，避免引入额外变量或改动 opacity，确保改动最小且与 QA 指令一致。
4. **改动**：修改了 `src/index.css` 中 `.works-detail-stage__grid` 的 `background-image`，将单一 gradient 扩展为两个方向的叠加；`src/components/WorksDetailSection.render.test.tsx` 增加了对应的回归断言。
5. **验证**：运行 `node --import tsx --test src/components/WorksDetailSection.render.test.tsx` 完成红绿验证；修复后再次运行通过。额外运行 `npm run build`，确认 CSS 变更未影响整体构建。随后通过 Playwright 打开 live Works Detail 页面并生成截图 `/tmp/works-detail-round2-after-fix.png`，作为交叉网格已随 detail 态一并渲染的运行时验证。
6. **遗留**：目前只验证了源码层与构建层，没有重新截图确认交叉后的密度和亮度是否正好贴近设计稿；如果视觉上仍显得偏密或偏亮，可以继续微调两组 gradient 的步距或整体 opacity。
7. **可调参数**：两个 gradient 目前共用 `128px / 129px / 131px / 260px` 这组节距参数，后续如需调密度，只要同步修改这两个 gradient 的对应 stop 值即可。
