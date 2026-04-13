# Coding Detail Night Sky Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Change the `coding detail` page from a warm cream visual treatment to a star-filled night-sky theme without altering the page's layout or interactions.

**Architecture:** The change stays inside the existing coding-detail stage pipeline. The implementation updates CSS theme layers for the coding stage, keeps the current React structure intact, and rewrites the palette-focused render assertions so the new visual contract is test-backed.

**Tech Stack:** React, TypeScript, Vite, CSS, Node test runner

---

### Task 1: Encode The New Theme Contract In Tests

**Files:**
- Modify: `src/components/WorksDetailSection.render.test.tsx`
- Test: `src/components/WorksDetailSection.render.test.tsx`

**Step 1: Write the failing test**

- Replace the old warm-cream coding-stage palette assertion with a night-sky assertion set.
- Assert the coding stage uses a deep blue-black gradient, cool overlay colors, and cool-toned intro text colors.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/WorksDetailSection.render.test.tsx`

Expected: FAIL because the stylesheet still contains the old warm cream values.

**Step 3: Write minimal implementation**

- Update the coding-stage CSS to match the new theme contract.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/WorksDetailSection.render.test.tsx`

Expected: PASS for the updated palette assertions.

### Task 2: Apply The Night-Sky Visual Treatment

**Files:**
- Modify: `src/index.css`
- Optional modify: `src/components/WorksDetailSection.tsx`

**Step 1: Update coding-stage background layers**

- Replace the warm coding gradient with a night-sky gradient.
- Add star-field texture using layered CSS `radial-gradient(...)`.
- Replace warm overlay tones with cool haze and soft lunar glow.

**Step 2: Update coding-stage typography and controls**

- Recolor intro eyebrow, title, body, stage tag, and close button.
- Preserve readability and hierarchy.

**Step 3: Keep layout behavior unchanged**

- Do not change coding hero/grid spacing, drag behavior, or card stack transforms.

### Task 3: Verify The Change

**Files:**
- No additional file changes required

**Step 1: Run the targeted test suite**

Run: `npm test -- src/components/WorksDetailSection.render.test.tsx`

Expected: PASS

**Step 2: Run one additional logic safety check**

Run: `npm test -- src/components/WorksDetailSection.logic.test.ts`

Expected: PASS

**Step 3: Review diff for scope control**

Run: `git diff -- src/index.css src/components/WorksDetailSection.render.test.tsx src/components/WorksDetailSection.tsx docs/plans/2026-04-13-coding-detail-night-sky-design.md docs/plans/2026-04-13-coding-detail-night-sky.md`

Expected: Only coding-detail theme, tests, and docs are touched.
