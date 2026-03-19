# Video Scroll CTA Prompt Design

## Goal

When the `drag` CTA appears in `VideoScrollTransition`, the page itself should remain visually stable. The prompt should be conveyed by a subtle looping motion on the `drag` icon and the `CLICK, THEN SCROLL` label instead of a visible page-level shake caused by scroll repinning.

## Current Context

- The `VideoScrollTransition` section is pinned when the loop video ends and the state moves to `awaitingActivation`.
- Downward scroll is intentionally blocked until the user clicks the CTA.
- Because the section is re-pinned while the user keeps scrolling, the whole viewport appears to shake.

## Recommended Approach

Use a dedicated CTA prompt animation that starts only while `visualState.showCta` is true:

- Add a lightweight looping keyframe in `src/index.css`.
- Apply the animation to the CTA button and its helper text only.
- Keep the motion subtle:
  - Button: small vertical drift with a tiny scale pulse.
  - Text: weaker synchronized drift, no independent bounce.
- Leave the section, videos, and scroll-lock logic unchanged.

## Alternatives Considered

### 1. Continuous CTA-local prompt animation

Recommended. It isolates the affordance to the exact actionable elements and avoids introducing more scroll behavior changes.

### 2. Intermittent pulse every few seconds

Cleaner visually, but easier to miss and weaker as an affordance for users who start scrolling right after the CTA appears.

### 3. Full-page shake or overlay nudge

Rejected. It makes the interface feel unstable and competes with the cinematic video transition.

## Behavior Details

- The animation runs continuously only during `awaitingActivation`.
- The button and label move together so the prompt reads as one unit.
- Hover/focus still works; the loop should not overpower the existing hover affordance.
- Once the CTA is clicked and the state changes to `scrubbing`, the animation disappears immediately.

## Testing Strategy

- Add a render-facing assertion that CTA-visible state exposes animation classes/hooks for the button and label.
- Re-run the existing state-machine and wheel-flow regression tests to confirm no behavior changes outside the visual prompt.
