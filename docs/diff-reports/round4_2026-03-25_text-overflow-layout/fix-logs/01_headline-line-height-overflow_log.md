1. 对照 `issues/01_headline-line-height-overflow.md` 检查 `CareerDetailSection.tsx`，确认移动端 H3 使用 `leading-[0.94]`、桌面端 H3 使用 `leading-[0.92]`，都小于各自字号，和报告中的裁切根因一致。
2. 先在 `src/components/CareerDetailSection.render.test.tsx` 更新断言，要求移动端与桌面端 H3 都改为 `leading-none`，并运行：
   `node --import tsx --test src/components/CareerDetailSection.render.test.tsx`
   验证新断言在旧实现上先失败。
3. 在 `src/components/CareerDetailSection.tsx` 中将移动端 H3 与桌面端 H3 的行高统一改为 `leading-none`，避免 descender 被裁切。
4. 再次运行同一渲染测试，确认新的 H3 行高断言通过。
