# Video Scroll Soft Repin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Nudge the CTA helper text a further 10px to the right for better centering and make downward scroll blocking in `awaitingActivation` feel gentler by avoiding repeated hard snap-backs.

**Architecture:** Keep the existing CTA gating and state machine, but replace the unconditional hard repin with a tolerance-aware soft repin path. Update the helper text class names to reflect the new total `17px` rightward shift in both base and desktop layouts.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite, Node test runner

---

### Task 1: Add the failing logic tests for soft repin tolerance

**Files:**
- Modify: `src/components/VideoScrollTransition.test.ts`
- Modify: `src/components/VideoScrollTransition.logic.ts`

**Step 1: Write the failing test**

Add one test asserting `awaitingActivation` does not repin for a very small downward drift within tolerance, and another asserting it does repin once the drift exceeds that tolerance.

**Step 2: Run test to verify it fails**

Run: `npm run test:video-scroll`
Expected: FAIL because the current repin logic reacts to any downward drift below the intended threshold.

**Step 3: Write minimal implementation**

Introduce a small repin tolerance in `src/components/VideoScrollTransition.logic.ts` so only meaningful downward drift triggers repinning.

**Step 4: Run test to verify it passes**

Run: `npm run test:video-scroll`
Expected: PASS

### Task 2: Add the failing CTA text offset test

**Files:**
- Modify: `test-video-transition-wheel.cjs`
- Modify: `src/components/VideoScrollTransition.tsx`

**Step 1: Write the failing test**

Update the interaction test to expect the CTA hint text class names to reflect a total `17px` rightward offset in both base and desktop layouts.

**Step 2: Run test to verify it fails**

Run: `npm run test:video-wheel`
Expected: FAIL because the helper text still uses the previous `7px` shift.

**Step 3: Write minimal implementation**

Adjust the CTA helper text position classes in `src/components/VideoScrollTransition.tsx` to use `17px` rightward offsets.

**Step 4: Run test to verify it passes**

Run: `npm run test:video-wheel`
Expected: PASS

### Task 3: Implement the softer repin behavior in the component

**Files:**
- Modify: `src/components/VideoScrollTransition.tsx`

**Step 1: Keep the behavior scoped**

Only change repin behavior while `state.phase === 'awaitingActivation'`. Do not change upward scroll release, CTA animation, or scrub/completed logic.

**Step 2: Write minimal implementation**

- Avoid forcing `window.scrollTo(sectionTop)` on every downward wheel while already within the tolerance band.
- When repinning is needed, use a soft repin helper rather than the existing hard snap.

**Step 3: Run targeted verification**

Run: `npm run test:video-scroll`
Expected: PASS

Run: `npm run test:video-wheel`
Expected: PASS

Run: `npm run build`
Expected: PASS
