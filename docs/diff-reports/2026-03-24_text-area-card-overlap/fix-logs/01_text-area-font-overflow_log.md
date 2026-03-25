1. **理解**
   桌面端文本区域虽然已经去掉了卡片容器，但主标题、辅助标题和正文仍沿用上一轮偏大的字号，导致两段文字加分隔线的总高度过高，视觉上逼近甚至超出左侧标签页导航的有效高度。

2. **分析**
   我检查了 [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L807) 的桌面文本区实现，确认问题集中在 `h3`、正文、分隔线 `py`、`h4` 和 supporting body 的 Tailwind 数值。
   我先在 [CareerDetailSection.render.test.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.render.test.tsx#L73) 新增回归断言，并在当前实现上运行 `node --import tsx --test src/components/CareerDetailSection.render.test.tsx`，确认测试先失败，证明这些旧数值仍然存在。

3. **方案**
   采用 issue 文档给出的最小数值调整方案，只缩小桌面文本区的字号、行高和分隔线垂直间距，不改动三栏结构、定位方式、文案内容或右侧 aside。
   这样可以直接压缩文本总高度，同时保持现有布局逻辑和视觉语言不变。

4. **改动**
   在 [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L824) 将 headline 从 `max-w-[12ch] text-[clamp(2.4rem,2.6vw,3rem)]` 调整为 `max-w-[16ch] text-[clamp(1.8rem,2vw,2.2rem)]`。
   在 [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L829) 将正文从 `text-[1.02rem] leading-[1.55]` 调整为 `text-[0.92rem] leading-[1.5]`。
   在 [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L837) 将分隔线间距从 `py-4` 调整为 `py-2`。
   在 [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L851) 将 supporting title 从 `text-[clamp(2.1rem,2.2vw,2.8rem)]` 调整为 `text-[clamp(1.6rem,1.8vw,2rem)]`。
   在 [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L854) 将 supporting body 从 `text-[1rem] leading-[1.55]` 调整为 `text-[0.9rem] leading-[1.5]`。
   在 [CareerDetailSection.render.test.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.render.test.tsx#L73) 补了桌面文本排版的回归测试，锁定这些 class 数值。

5. **验证**
   已运行 `node --import tsx --test src/components/CareerDetailSection.render.test.tsx`，4 个测试全部通过，其中包含新增的排版回归测试。
   已运行 `npm run lint`，`tsc --noEmit` 通过。
   本轮没有在浏览器里逐个切 tab/record 做人工视觉比对，也没有重新跑 `/design2code diff`。

6. **遗留**
   当前验证覆盖的是服务端静态渲染下的 class 输出，能够防止数值回退，但不能替代桌面端真实视口下的视觉确认。
   如果某个 record 文案在实际浏览器里仍偏高，优先继续微调 `h3` clamp 上限和正文字号，而不是改结构。

7. **可调参数**
   `h3`: [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L824)
   `body`: [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L829)
   `divider py`: [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L837)
   `h4`: [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L851)
   `supporting body`: [CareerDetailSection.tsx](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L854)
