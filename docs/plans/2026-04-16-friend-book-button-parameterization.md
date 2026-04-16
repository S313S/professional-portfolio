# Friend Book Button Parameterization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a centralized set of button position parameters for the `Friend Book Finale` landing layout so the hero and card buttons can be moved by changing a few numbers.

**Architecture:** Keep the content data unchanged and place a component-local configuration object in `src/components/FriendBookFinalSection.tsx`. Apply offsets through wrapper elements so button hover styles remain intact. Cover the new structure with a render test and a small configuration test.

**Tech Stack:** React 19, TypeScript, Node test runner, server-side render tests

---

### Task 1: Add failing tests for tunable button positioning

**Files:**
- Modify: `src/components/FriendBookFinalSection.render.test.tsx`
- Modify: `src/components/FriendBookFinalSection.tsx`

**Step 1: Write the failing test**

Add assertions for:
- exported `FRIEND_BOOK_BUTTON_POSITIONING`
- render anchors for the hero primary button
- render anchors for hero secondary buttons
- render anchors for each game card begin button

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: FAIL because the export and render anchors do not exist yet.

**Step 3: Write minimal implementation**

Export the configuration object and add wrapper elements with stable `data-*` attributes.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/FriendBookFinalSection.tsx src/components/FriendBookFinalSection.render.test.tsx docs/plans/2026-04-16-friend-book-button-parameterization-design.md docs/plans/2026-04-16-friend-book-button-parameterization.md
git commit -m "feat: parameterize friend book button positions"
```

### Task 2: Implement centralized position parameters

**Files:**
- Modify: `src/components/FriendBookFinalSection.tsx`

**Step 1: Write the failing test**

Use the test from Task 1 as the red state for implementation.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: FAIL until wrappers and config are wired.

**Step 3: Write minimal implementation**

- Add `FRIEND_BOOK_BUTTON_POSITIONING`
- Add helper(s) for pixel offsets
- Apply offsets to:
  - hero primary button
  - each hero secondary button
  - each game card `Begin` button

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/FriendBookFinalSection.tsx src/components/FriendBookFinalSection.render.test.tsx
git commit -m "refactor: centralize friend book button offsets"
```

### Task 3: Run verification

**Files:**
- Modify: `src/components/FriendBookFinalSection.tsx` if follow-up adjustments are needed

**Step 1: Run targeted tests**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx src/App.render.test.tsx`
Expected: PASS

**Step 2: Run typecheck**

Run: `npm run lint`
Expected: PASS

**Step 3: Fix any regressions**

Make only minimal corrections if verification finds issues.

**Step 4: Re-run verification**

Run:
- `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx src/App.render.test.tsx`
- `npm run lint`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/FriendBookFinalSection.tsx src/components/FriendBookFinalSection.render.test.tsx
git commit -m "test: verify friend book button parameterization"
```
