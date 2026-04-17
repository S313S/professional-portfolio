# Friend Book Moon Run Canvas Migration Design

**Date:** 2026-04-17

**Goal:** Replace the current Friend Book Moon Run mini-game implementation with the in-game canvas experience from `/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/moon-run`, while preserving the existing Friend Book overlay shell, archive flow, and note-entry completion path.

## Approved Decisions

1. Remove the external project's intro/menu page from the Friend Book experience.
2. Preserve the external project's in-game canvas presentation as closely as practical.
3. Keep the existing Friend Book overlay container, close button, and post-win note-entry flow.
4. Avoid redesigning new Moon Run art. Reuse the external project's in-canvas rendering logic directly.
5. Add only the minimum adaptation needed for overlay sizing, mobile controls, and completion callbacks.

## Architecture

The old DOM-based Moon Run renderer and physics loop will be retired from active use. A new canvas-based `FriendBookMoonRunStage` will own its local game loop, rendering, and runtime entities based on the external `moon-run` project. The parent `FriendBookFinalSection` will treat Moon Run as an embedded game surface and only manage entry, overlay framing, replay/reset, close behavior, and transition into note entry after a win.

## Scope

### In Scope

- Port the external game's level layout, rendering, controls, HUD, enemies, collectibles, moving platforms, bouncers, win state, and loss state.
- Resize the canvas experience to fit inside the Friend Book game overlay.
- Keep keyboard input and add on-screen controls for touch devices.
- Report win/loss/replay events back to the Friend Book page flow.

### Out of Scope

- Preserving the current DOM Moon Run physics or level config.
- Rebuilding a separate Moon Run design system for Friend Book.
- Recreating the external intro page inside Friend Book.

## Risk Notes

- The external game currently assumes fullscreen canvas dimensions; overlay sizing requires careful adaptation to avoid cropped UI or camera issues.
- The external game uses local component state rather than the existing Friend Book session reducer, so Moon Run integration should be isolated to avoid regressions in other mini-games.
- Existing Moon Run tests target the old DOM stage and will need replacement or narrowing to integration assertions that still matter.
