# Friend Book Quiz Painting Replacement Design

**Goal:** Replace the current `Who’s This?` painting quiz bank with silhouette questions derived from the four paintings in `public/images/friend-book-quiz/Painting exam`, while keeping the existing Friend Book overlay, interaction flow, and persistence intact.

**Architecture:** Keep the existing `FriendBookFinalSection` quiz UI and game-state model. Replace only the quiz content and make quiz round sizing depend on the available bank size so the current five-question flow gracefully degrades to four questions when only four paintings are available. Generate new silhouette assets through a small reusable script so future painting batches can be added with the same pipeline.

**Scope**
- Replace the existing quiz bank entries in `src/data.tsx` with four new entries derived from the provided paintings.
- Generate first-pass silhouette assets under `public/images/friend-book-quiz/`.
- Update quiz logic/tests so a round uses `min(roundSize, bank.length)` rather than assuming five available questions.
- Keep the rest of the Friend Book games and layout unchanged.

**Silhouette Direction**
- Use a consistent “enhanced silhouette” style instead of a strict outer contour.
- Preserve the current game feel by rendering dark subject shapes on transparent backgrounds.
- Allow limited negative-space cutouts when needed to keep portraits readable, especially for close-cropped heads like Benjamin Franklin and Richard Feynman.
- Keep a consistent exported frame so the current `img` rendering in the quiz panel continues to work without layout changes.

**Question Set**
- `Mona Lisa`
- `Napoleon Crossing the Alps`
- `Benjamin Franklin`
- `Richard Feynman`

Each question will include:
- a generated silhouette asset
- four options from the same replacement set
- a matching correct answer
- short result copy aligned with the new subject

**Constraints**
- Do not overwrite unrelated in-progress edits already present in `src/components/FriendBookFinalSection.tsx` and `src/components/FriendBookFinalSection.render.test.tsx`.
- Keep the storage key and game id stable: the quiz still lives under `one-stroke-mark`.
- Prefer minimal behavioral changes beyond dynamic round sizing.

**Validation**
- Targeted logic tests for quiz bank size and round-size behavior.
- Existing asset-existence assertions updated to reflect the new bank.
- Vite build to confirm the new assets and data compile cleanly.
- Manual visual review of the generated silhouettes before treating them as the baseline for future painting batches.
