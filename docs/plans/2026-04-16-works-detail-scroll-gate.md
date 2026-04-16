# Works Detail Scroll Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `Works Detail` reveal itself after the intro animation completes, and only advance to `Friend Book Finale` after `detailWork` is fully visible and the user scrolls down again.

**Architecture:** Keep the existing `WorksDetailSection` loading/reveal state machine intact, but add a tiny settled-entry release gate. Downward wheel or touch input should continue to drive the reveal while the section is in `revealing`; once the section first reaches `settled`, the current gesture must stop on the fully visible `detailWork` screen, and only the next fresh downward gesture should trigger the existing smooth scroll to `Friend Book Finale`.

**Tech Stack:** React, TypeScript, node:test, Vite

---

### Task 1: Lock Down The New Scroll Gate Behavior

**Files:**
- Modify: `src/components/WorksDetailSection.logic.test.ts`
- Modify: `src/components/WorksDetailSection.logic.ts`

**Step 1: Write the failing test**

Add a test that asserts the settled entry view does not advance until a fresh downward gesture arrives after reveal completion, while non-entry states still cannot advance.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/WorksDetailSection.logic.test.ts`
Expected: FAIL because the current settled-entry behavior still allows or disallows the transition at the wrong moment.

**Step 3: Write minimal implementation**

Require an explicit settled-entry release flag before the next-section transition is allowed, and add a helper that arms that flag only for the first downward gesture after reveal completion.

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

Keep the component aligned with the state machine: while the phase is still `revealing`, downward wheel/touch input only drives the reveal progress. Once the phase becomes `settled`, the first downward wheel/touch interaction should only repin and arm the release gate; only the next fresh downward interaction should go through the existing `scrollToNextSection()` path.

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
