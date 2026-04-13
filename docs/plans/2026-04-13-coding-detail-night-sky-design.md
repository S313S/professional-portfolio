# Coding Detail Night Sky Design

## Goal

Turn the `coding detail` page background from the current warm cream atmosphere into a star-filled night sky while preserving the existing layout, card stack interaction, and project grid structure.

## Approved Refinement

- Keep the night-sky direction, but make the stars slightly more visible.
- Give the project cards a more unified night-scene "display case" treatment through darker glassy surfaces, cooler borders, and restrained hover glow.

## Scope

- Update only the `coding detail` stage.
- Keep the current `design` detail stage unchanged.
- Keep the coding category cards, drag interaction, and project grid layout unchanged.

## Approved Direction

### Background

- Replace the warm cream stage gradient with a deep blue-black night gradient.
- Keep the existing stage background layer structure so the page still has depth.
- Add a star field through CSS gradients instead of introducing a new image asset.

### Overlay And Atmosphere

- Replace the warm cream coding overlay with cool-toned mist and faint moonlit bloom.
- Keep enough center-area luminance so the cards and right-side copy still feel staged rather than flat.

### Text And Controls

- Recolor the coding intro eyebrow, title, body copy, stage tag, and close button to cool white / mist-blue values that fit the night background.
- Preserve contrast and readability without shifting the page into a harsh neon look.

### Out Of Scope

- No layout changes.
- No interaction changes.
- No asset remapping for the coding category cards or project grid.
- No theme changes to the gallery / design detail mode.

## Implementation Notes

- Update the coding-stage background source if needed, but rely primarily on CSS treatment rather than a new bitmap.
- Update render/CSS assertions so tests describe the night-sky palette instead of the old warm cream palette.
