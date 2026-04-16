# Friend Book Button Parameterization Design

**Date:** 2026-04-16

## Goal

Make the button positions in the `Friend Book Finale` landing area manually adjustable through a small set of code-level parameters, without changing the visual assets or interaction behavior.

## Scope

- Parameterize the top-right hero button cluster in `FriendBookFinalSection`
- Parameterize the `Begin` button position inside each game card
- Keep the current default layout unchanged
- Expose a single obvious edit point for future manual tuning

## Recommended Approach

Use a centralized position configuration object near the top of `src/components/FriendBookFinalSection.tsx`.

This keeps the adjustment logic close to the rendered structure, avoids pushing presentational offsets into content data, and gives a predictable place to tune pixel offsets later. The component will read these values and apply them through small wrapper elements, so the existing button hover animation can stay intact.

## Alternatives Considered

### 1. Store offsets in `src/data.tsx`

This would make the data object carry layout responsibilities that are specific to a single component. It is less clear for maintenance because content and presentation offsets become mixed together.

### 2. Hardcode more Tailwind utility classes

This is the current problem. It makes future adjustment slower because the user has to inspect JSX structure and reason about multiple layout containers instead of changing a few explicit numbers.

## Rendering Strategy

- Introduce a helper that converts `{ x, y }` pixel offsets into inline transform styles.
- Wrap each tunable button in a small container `<div>` that owns the transform.
- Keep `FriendBookImageButton` itself visually unchanged so its hover transform remains available.

## Testing Strategy

- Add a render test that verifies the new position anchors exist in the markup.
- Add a small unit test that verifies the centralized configuration exports the expected per-area keys and per-card overrides.

## Success Criteria

- The user can open one file and adjust button positions by changing numeric values.
- Default rendering remains the same.
- Tests cover the new configuration surface and render anchors.
