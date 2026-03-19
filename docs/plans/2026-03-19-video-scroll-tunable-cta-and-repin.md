# Video Scroll Tunable CTA And Repin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the CTA hint position directly tunable from named constants and replace native `smooth` repinning with a slower custom easing curve for `awaitingActivation`.

**Architecture:** Move CTA helper text offsets into explicit exported constants and compute the rendered CSS values from those constants. Add pure helpers in `VideoScrollTransition.logic.ts` for repin easing and interpolated scroll position, then drive the component's repin animation with `requestAnimationFrame`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite, Node test runner

---

### Task 1: Add failing tests for tunable CTA offsets and custom repin interpolation

**Files:**
- Modify: `src/components/VideoScrollTransition.test.ts`
- Modify: `src/components/VideoScrollTransition.logic.ts`

**Step 1: Write the failing test**

Add tests that verify:
- CTA hint left values resolve to `calc(27.8% + 17px)` and `calc(27.6% + 17px)`.
- Soft repin interpolation returns the start position at progress `0`, the target at progress `1`, and an in-between value for mid-progress.

**Step 2: Run test to verify it fails**

Run: `npm run test:video-scroll`
Expected: FAIL because the helper functions do not exist yet.

**Step 3: Write minimal implementation**

Add exported CTA offset constants and pure helpers for hint position strings and soft repin interpolation/easing.

**Step 4: Run test to verify it passes**

Run: `npm run test:video-scroll`
Expected: PASS

### Task 2: Update the component to consume the tunable constants

**Files:**
- Modify: `src/components/VideoScrollTransition.tsx`
- Modify: `test-video-transition-wheel.cjs`

**Step 1: Write the failing test**

Update the interaction test to assert the CTA hint element exposes the expected custom properties or style values based on the new constants.

**Step 2: Run test to verify it fails**

Run: `npm run test:video-wheel`
Expected: FAIL until the component reads from the new tunable values.

**Step 3: Write minimal implementation**

Render the CTA hint using CSS custom properties populated from the new constants so the offsets are easy to tweak.

**Step 4: Run test to verify it passes**

Run: `npm run test:video-wheel`
Expected: PASS

### Task 3: Replace native smooth scrolling with slower custom repin easing

**Files:**
- Modify: `src/components/VideoScrollTransition.tsx`

**Step 1: Keep behavior scoped**

Only change the repin animation path for `awaitingActivation`. Do not change CTA gating, upward release, or video state transitions.

**Step 2: Write minimal implementation**

Use `requestAnimationFrame` with the new easing helper and duration constant to animate from the current scroll position back to the section top.

**Step 3: Run targeted verification**

Run: `npm run test:video-scroll`
Expected: PASS

Run: `npm run test:video-wheel`
Expected: PASS

Run: `npm run build`
Expected: PASS
