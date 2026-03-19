# Video Scroll CTA Prompt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the visual “page shake” affordance with a subtle looping prompt animation applied only to the `drag` CTA button and helper text while `VideoScrollTransition` is awaiting activation.

**Architecture:** Keep the existing `awaitingActivation` state and scroll pinning behavior intact, but expose a render-level CTA prompt hook so the button and helper text can receive dedicated animation classes. Define the animation in `src/index.css` and apply it only when `visualState.showCta` is true.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite, Node test runner

---

### Task 1: Add the failing CTA prompt-state test

**Files:**
- Modify: `src/components/VideoScrollTransition.test.ts`
- Test: `src/components/VideoScrollTransition.test.ts`

**Step 1: Write the failing test**

Add a test that verifies the CTA-visible visual state exposes a CTA prompt flag, and a second test that verifies non-CTA phases do not expose that flag.

**Step 2: Run test to verify it fails**

Run: `npm run test:video-scroll`
Expected: FAIL because the current visual state does not distinguish CTA prompt animation from generic CTA visibility.

**Step 3: Write minimal implementation**

Extend `VideoVisualState` in `src/components/VideoScrollTransition.logic.ts` with a `showCtaPromptAnimation` boolean and set it to `true` only for `awaitingActivation`.

**Step 4: Run test to verify it passes**

Run: `npm run test:video-scroll`
Expected: PASS

### Task 2: Apply the CTA-only animation in the component

**Files:**
- Modify: `src/components/VideoScrollTransition.tsx`
- Modify: `src/index.css`

**Step 1: Write the failing render assertion**

Add a test that asserts CTA prompt animation hooks/classes appear when the CTA is visible and disappear when the CTA is not visible.

**Step 2: Run test to verify it fails**

Run: `npm run test:video-scroll`
Expected: FAIL because the component currently renders a static CTA.

**Step 3: Write minimal implementation**

- Add CTA-specific class names in `src/components/VideoScrollTransition.tsx`.
- Define subtle looping keyframes and utility classes in `src/index.css`.
- Keep hover/focus styles intact and avoid animating the whole section.

**Step 4: Run test to verify it passes**

Run: `npm run test:video-scroll`
Expected: PASS

### Task 3: Verify no regression in the scroll/video flow

**Files:**
- Modify: `src/components/VideoScrollTransition.logic.ts`
- Modify: `src/components/VideoScrollTransition.tsx`
- Modify: `src/index.css`

**Step 1: Keep implementation minimal**

Do not change the state machine transitions, wheel blocking, touch blocking, video sources, or section pinning behavior.

**Step 2: Run targeted verification**

Run: `npm run test:video-scroll`
Expected: PASS

Run: `npm run test:video-wheel`
Expected: PASS

Run: `npm run build`
Expected: PASS
