# Works Detail 07 Asset Refresh Design

## Goal

Replace the current low-resolution `07` card asset with a new square, high-resolution image that can also hold up in a future full-screen viewer.

## Decision

- Keep cards `04/05/06/08` on their existing high-resolution sources.
- Replace only card `07`, because its current source (`/images/WorksCollectionRoom_Bg.jpg`) is the only asset that is clearly too small for future full-screen use.
- Keep the current square card presentation model in Works Detail so the live UI remains visually consistent.

## Asset Strategy

- Generate/import a new `1:1` high-resolution editorial image for `07`.
- Preserve the warm, tactile portfolio-wall / studio-display feeling so the active card still reads as the SANOFI spotlight item.
- Save the final asset inside `public/images/` with a stable versioned filename rather than overwriting unrelated files.

## Implementation Notes

- The UI already renders the cards in a square container, so the main functional change is the `07` source path.
- Add a regression test that locks `07` to the new asset path.
- Keep the change isolated to Works Detail unless a future full-screen viewer needs a shared asset registry.
