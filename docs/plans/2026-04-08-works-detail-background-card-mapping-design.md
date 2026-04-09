# Works Detail Background Card Mapping Design

## Goal

Use existing page background images as the five Works Detail card sources so the card strip previews the broader project world rather than separate gallery assets.

## Final Mapping

- `04` → `/images/bg_growpath.jpeg`
- `05` → `/images/career_bg.png`
- `06` → `/images/careerDetail_bg.png`
- `07` → `/images/WorksCollectionRoom_Bg.jpg`
- `08` → `/images/workDetail_bg.jpeg`

## Presentation Rules

- Keep the current square card container.
- Keep center-crop behavior so every source fills the card uniformly.
- Do not introduce derived square image files for this pass.

## Reasoning

- This keeps the strip visually tied to the project's real sections and backgrounds.
- It also avoids maintaining a second parallel asset system before the future full-screen interaction is built.
