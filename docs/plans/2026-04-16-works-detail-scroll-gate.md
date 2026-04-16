# Works Detail Scroll Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `Works Detail` reveal itself after the intro animation completes, and only advance to `Friend Book Finale` after `detailWork` is fully visible and the user scrolls down again.

**Architecture:** End the loading sequence by landing directly on the fully visible `detailWork` attachment page (`settled` at progress `1`) so the user never has to manually reveal that screen after the animation. From that fully visible state, the next downward wheel or touch gesture should trigger the existing smooth scroll into `Friend Book Finale`, while the settled design-detail gallery should keep capturing wheel input for internal project switching instead of leaking native page scroll.

**Tech Stack:** React, TypeScript, node:test, Vite

---

### Task 1: Lock Down The New Scroll Gate Behavior

**Files:**
- Modify: `src/components/WorksDetailSection.logic.test.ts`
- Modify: `src/components/WorksDetailSection.logic.ts`

**Step 1: Write the failing test**

Add a test that asserts loading completion lands directly on the fully revealed attachment page and that the settled entry view advances to the next section on the next downward gesture, while non-entry states still cannot advance.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/WorksDetailSection.logic.test.ts`
Expected: FAIL because loading completion and settled-entry navigation semantics still reflect the older reveal-after-animation flow.

**Step 3: Write minimal implementation**

Return a settled completion state (`nextPhase: 'settled'`, `nextTransitionProgress: 1`) and keep the next-section navigation rule simple for the fully visible attachment page.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/WorksDetailSection.logic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/WorksDetailSection.logic.ts src/components/WorksDetailSection.logic.test.ts
git commit -m "fix: gate works detail finale scroll"
```

### Task 2: Wire The Gate Into Wheel And Touch Handling

**Files:**
- Modify: `src/components/WorksDetailSection.tsx`
- Test: `src/components/WorksDetailSection.logic.test.ts`

**Step 1: Write the failing test**

If needed, extend the logic test coverage so the helper reflects the first-downward-intent repin contract that the component will use.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/WorksDetailSection.logic.test.ts`
Expected: FAIL until the component and helper agree on the new gate semantics.

**Step 3: Write minimal implementation**

Keep the component aligned with the new completion state: after loading finishes, the entry view is already fully visible, so the next downward wheel/touch interaction should go through the existing `scrollToNextSection()` path without any extra manual reveal step. Also ensure the settled design-detail gallery continues to capture wheel input for project switching instead of falling back to native page scroll.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/WorksDetailSection.logic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/WorksDetailSection.tsx src/components/WorksDetailSection.logic.ts src/components/WorksDetailSection.logic.test.ts
git commit -m "fix: require second scroll before works detail finale"
```

### Task 3: Verify Targeted Regression Coverage

**Files:**
- Test: `src/components/WorksDetailSection.logic.test.ts`
- Test: `src/components/WorksDetailSection.render.test.tsx`

**Step 1: Run targeted regression tests**

Run: `node --import tsx --test src/components/WorksDetailSection.logic.test.ts src/components/WorksDetailSection.render.test.tsx`
Expected: PASS

**Step 2: Check for obvious integration regressions**

If a local dev server is already available, optionally run the related browser regression script that traverses the lobby/detail transition and confirms the Works Detail section still pins correctly.

**Step 3: Commit verification-only changes if needed**

```bash
git add src/components/WorksDetailSection.logic.test.ts src/components/WorksDetailSection.render.test.tsx
git commit -m "test: cover works detail scroll gate"
```
