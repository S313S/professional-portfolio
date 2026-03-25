1. 对照 `issues/02_headline-max-width-too-narrow.md` 检查组件，确认移动端与桌面端 H3 仍使用 `max-w-[16ch]`，这会把较长标题压成 3-4 行。
2. 先在 `src/components/CareerDetailSection.render.test.tsx` 把 H3 期望宽度更新为 `max-w-[24ch]`，并用渲染测试证明当前实现尚未满足新约束。
3. 在 `src/components/CareerDetailSection.tsx` 中将移动端和桌面端 H3 的 `max-w-[16ch]` 统一放宽为 `max-w-[24ch]`，让标题回到接近期望稿的 2 行以内。
4. 重新运行：
   `node --import tsx --test src/components/CareerDetailSection.render.test.tsx`
   确认新的标题宽度断言通过。
