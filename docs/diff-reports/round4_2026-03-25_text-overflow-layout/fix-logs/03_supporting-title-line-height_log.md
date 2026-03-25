1. 对照 `issues/03_supporting-title-line-height.md` 核对桌面端 H4，确认其 class 仍为 `leading-[0.95]`，存在与字号不匹配的裁切风险。
2. 在 `src/components/CareerDetailSection.render.test.tsx` 中把桌面端 H4 的断言更新为 `leading-none`，并先运行渲染测试，确认旧实现失败。
3. 在 `src/components/CareerDetailSection.tsx` 中将桌面端 supportingTitle 的 H4 行高改为 `leading-none`。
4. 再次运行渲染测试，确认 supportingTitle 的新行高断言通过。
