# Video Scroll CTA Pin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep the `VideoScrollTransition` section pinned when the drag CTA is visible so users cannot scroll downward into the next section until they click the CTA, while still allowing upward scroll back to the previous section.

**Architecture:** Extend the existing `awaitingActivation` state with an explicit wheel/touch guard that captures only downward movement while the section is pinned. Keep the current state machine and video rendering intact, and isolate the new policy in the logic file so it can be tested without DOM coupling.

**Tech Stack:** React 19, TypeScript, Vite, Node test runner

---

### Task 1: Add the failing state-machine tests

**Files:**
- Modify: `src/components/VideoScrollTransition.test.ts`
- Test: `src/components/VideoScrollTransition.test.ts`

**Step 1: Write the failing test**

Add a test that verifies downward wheel input is captured while the state is `awaitingActivation`, and a second test that verifies upward wheel input is not captured in that same state.

**Step 2: Run test to verify it fails**

Run: `npm run test:video-scroll`
Expected: FAIL because the current logic allows the downward guard to be inferred but does not expose the intended section-pin policy clearly enough for the component behavior we need.

**Step 3: Write minimal implementation**

Adjust `VideoScrollTransition.logic.ts` so the `awaitingActivation` branch explicitly models “block downward, allow upward” behavior that the component can rely on.

**Step 4: Run test to verify it passes**

Run: `npm run test:video-scroll`
Expected: PASS

### Task 2: Add the failing integration behavior for pinned CTA scrolling

**Files:**
- Modify: `test-video-transition-wheel.cjs`

**Step 1: Write the failing test**

Add an assertion after the first wheel step that another downward wheel event keeps `scrollY` pinned to the video section top and keeps the phase at `awaitingActivation`.

**Step 2: Run test to verify it fails**

Run: `npm run test:video-wheel`
Expected: FAIL if the page scrolls into the next section while the CTA is visible.

**Step 3: Write minimal implementation**

Update `VideoScrollTransition.tsx` wheel and touch handlers so downward movement in `awaitingActivation` prevents default scrolling and re-pins the section top, while upward movement remains untouched.

**Step 4: Run test to verify it passes**

Run: `npm run test:video-wheel`
Expected: PASS

### Task 3: Verify the full interaction

**Files:**
- Modify: `src/components/VideoScrollTransition.tsx`
- Modify: `src/components/VideoScrollTransition.logic.ts`

**Step 1: Keep implementation minimal**

Do not change the video sources, opacity transitions, or completed-state release behavior. Only add the pinned CTA guard needed for downward scroll blocking.

**Step 2: Run targeted verification**

Run: `npm run test:video-scroll`
Expected: PASS

Run: `npm run test:video-wheel`
Expected: PASS

**Step 3: Manual verification**

Run the Vite app and confirm:
- First video ends and CTA appears.
- Downward scrolling does not reveal the next section before CTA click.
- Upward scrolling still returns to the previous section.
- Clicking CTA still starts the scrub flow.
