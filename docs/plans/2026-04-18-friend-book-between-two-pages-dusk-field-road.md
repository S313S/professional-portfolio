# Friend Book Between Two Pages Dusk Field Road Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate and integrate a fourth `Between Two Pages` scene named `dusk-field-road` using a matched after-school countryside illustration pair with three quiet difference targets.

**Architecture:** Reuse the current `Between Two Pages` rendering and scene-rotation model. Add two new assets under `public/images/friend-book-between-two-pages/`, then extend the scene bank in `src/data.tsx` with one additional entry and target metadata. Lock the work with a failing test first so the scene count and ids cannot regress silently.

**Tech Stack:** TypeScript, React, Vite, Node test runner, built-in image generation tool

---

### Task 1: Lock the new scene requirement with a failing test

**Files:**
- Modify: `src/components/FriendBookFinalSection.logic.test.ts`

**Step 1: Write the failing test**

Add a test that asserts:
- the `betweenTwoPagesScenes` bank now has at least four scenes
- one scene id is `dusk-field-road`
- that scene exposes exactly three targets with ids `sign-charm`, `notebook-corner`, and `schoolbag-badge`

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: FAIL because the current scene bank only contains the existing three scenes and no `dusk-field-road` entry.

**Step 3: Stop after confirming RED**

Do not modify production files until the failure is confirmed.

### Task 2: Generate the new image pair

**Files:**
- Create: `public/images/friend-book-between-two-pages/base-scene-v4.png`
- Create: `public/images/friend-book-between-two-pages/variant-scene-v4.png`

**Step 1: Generate the base image**

Use the built-in image generation tool to create a top-down antique storybook illustration with:
- left page: countryside dusk school path
- right page: resting corner with straw hat, school bag, notebook, and shoes
- warm sepia paper, low saturation, quiet nostalgic mood

**Step 2: Generate the variant image**

Create a second version that keeps the same composition and only changes:
- the sign charm
- the notebook corner fold
- the schoolbag badge

**Step 3: Move the selected outputs into the project**

Place the chosen files at:
- `public/images/friend-book-between-two-pages/base-scene-v4.png`
- `public/images/friend-book-between-two-pages/variant-scene-v4.png`

**Step 4: Review the pair**

Visually confirm the two images truly match except for the three intended changes.

### Task 3: Add the new scene data

**Files:**
- Modify: `src/data.tsx`

**Step 1: Add the scene entry**

Append a new `FriendBookBetweenTwoPagesScene` entry with:
- `id: 'dusk-field-road'`
- `baseImage: '/images/friend-book-between-two-pages/base-scene-v4.png'`
- `variantImage: '/images/friend-book-between-two-pages/variant-scene-v4.png'`
- `aspectRatio: 2752 / 1536`

**Step 2: Add the three targets**

Define target ids and labels:
- `sign-charm` / `sign charm`
- `notebook-corner` / `notebook corner`
- `schoolbag-badge` / `schoolbag badge`

Use provisional hit areas derived from the generated pair so the scene is immediately playable.

### Task 4: Turn the tests green

**Files:**
- Modify: `src/components/FriendBookFinalSection.logic.test.ts`
- Modify: `src/data.tsx`

**Step 1: Re-run the targeted logic test**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: PASS

**Step 2: Sanity-check the asset paths**

Confirm both `base-scene-v4.png` and `variant-scene-v4.png` exist in `public/images/friend-book-between-two-pages/`.

### Task 5: Verify project health

**Files:**
- No code changes required unless verification fails

**Step 1: Run focused render coverage**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: PASS

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit if the worktree can isolate these changes**

If unrelated edits remain separate, stage only:

```bash
git add docs/plans/2026-04-18-friend-book-between-two-pages-dusk-field-road-design.md docs/plans/2026-04-18-friend-book-between-two-pages-dusk-field-road.md public/images/friend-book-between-two-pages/base-scene-v4.png public/images/friend-book-between-two-pages/variant-scene-v4.png src/data.tsx src/components/FriendBookFinalSection.logic.test.ts
git commit -m "feat: add dusk field road friend book scene"
```
