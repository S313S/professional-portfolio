1. 根据 `issues/04_bottom-text-crosses-divider.md` 和用户补充的分界线截图重新检查桌面端布局。结构性根因仍然是上下文本区必须分离，但复审后发现我第一次落地时把下半区锚点定在 `top-[55%]`，导致正文首行仍压在“图标底部那条线”附近。
2. 先修改 `src/components/CareerDetailSection.render.test.tsx`，要求桌面端改为两个独立的绝对定位区块：
   - `data-career-detail-card-stack="desktop-primary"` 固定在 `left-[37%] top-[22%] w-[29%]`
   - `data-career-detail-card-stack="desktop-secondary"` 初版固定在 `left-[37%] top-[55%] w-[29%]`
   同时断言旧的单一 `flex-col` 容器不再存在，并运行渲染测试确认旧实现失败。
3. 在用户指出视觉问题后，我补了一轮更严格的定位校验：先用 Playwright 滚动到 `#career-detail-section`，量出 `desktop-secondary` 的正文首行 `top ≈ 532.6px`，确认它仍然压线；随后先把回归测试改为要求 `top-[56%]`，看着它失败，再把 `src/components/CareerDetailSection.tsx` 中的 `desktop-secondary` 从 `top-[55%]` 下移到 `top-[56%]`。
4. 完成后执行：
   - `node --import tsx --test src/components/CareerDetailSection.render.test.tsx`
   - `node --import tsx --test src/components/CareerDetailSection.logic.test.ts`
   - `npm run build`
   并再次用 Playwright 量出修复后的 `secondaryBody.top ≈ 540.95px`，确认正文首行已经落到用户标定的边界线下方。
