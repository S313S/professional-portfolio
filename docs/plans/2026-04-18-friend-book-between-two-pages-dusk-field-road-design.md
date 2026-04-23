# Friend Book Between Two Pages Dusk Field Road Design

**Goal:** Add one new `Between Two Pages` spot-the-difference illustration pair for the Friend Book page, using a calm after-school countryside scene inspired by the everyday mood of `Natsume's Book of Friends` without directly depicting copyrighted characters.

**Architecture:** Keep the existing `Between Two Pages` interaction, image aspect ratio, and hotspot model unchanged. Add a fourth scene built from a matched base/variant illustration pair rendered inside the same top-down antique book framing as the current three scenes. Limit the variant to three quiet object-level changes so the new pair reads consistently with the existing scene bank and remains easy to hotspot.

**Scope**
- Generate one new paired illustration set under `public/images/friend-book-between-two-pages/`.
- Add one new scene entry in `src/data.tsx` with three hotspot targets.
- Preserve the current game timer, layout, hint UI, and rotation logic.
- Match the current visual language: open antique book, warm sepia paper, gentle ink-and-wash illustration, low saturation.

**Scene Direction**
- Scene id: `dusk-field-road`
- Base image path: `/images/friend-book-between-two-pages/base-scene-v4.png`
- Variant image path: `/images/friend-book-between-two-pages/variant-scene-v4.png`
- Aspect ratio: `2752 / 1536`

**Composition**
- Use the same overall framing as the existing scene bank: a top-down view of an open antique storybook resting on a wooden desk.
- Left page shows a quiet countryside after-school path at dusk with a narrow dirt road, rice-field edges, a small water canal, distant mountains, utility poles, and a roadside wooden sign.
- Right page shows a resting corner beside the same path with a straw hat, school bag, practice notebook, and canvas shoes placed beside a stone or wooden post.
- Avoid visible human faces or direct depictions of `Natsume's Book of Friends` characters. The scene should imply recent presence rather than showing a character portrait.

**Difference Targets**
- `sign-charm` / `sign charm`
  - Left page, around the roadside wooden sign.
  - Base and variant swap a leaf-like charm and a small bell.
- `notebook-corner` / `notebook corner`
  - Right page, around the practice notebook.
  - Base page corner lies flat; variant page corner lifts into a clear folded triangle.
- `schoolbag-badge` / `schoolbag badge`
  - Right page, around the side of the school bag.
  - Base and variant toggle a small round bag badge.

**Constraints**
- The pair must remain a true spot-the-difference illustration pair: same framing, same object placement, same lighting, and no large redraws.
- Keep each target visually large enough for mobile tapping. The folded notebook corner and badge cannot be rendered as hairline details.
- Do not introduce text, logos, watermarks, modern city elements, or strong anime character styling.
- Do not touch unrelated in-progress edits already present in `src/components/FriendBookFinalSection.tsx` and `src/components/FriendBookFinalSection.archive-board.render.test.tsx`.

**Validation**
- Manual visual review of the generated pair to confirm composition lock and the three intended differences.
- Targeted data/logic tests to confirm the scene bank still exposes valid targets and supports the new fourth scene.
- Build or targeted render test coverage to ensure the Friend Book section still compiles with the new assets.
