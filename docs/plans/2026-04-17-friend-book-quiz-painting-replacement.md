# Friend Book Quiz Painting Replacement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Friend Book `Who’s This?` quiz bank with silhouettes generated from the four provided paintings and make the round size adapt to the available question count.

**Architecture:** Keep the existing Friend Book overlay and quiz session model. Swap the bank data in `src/data.tsx`, generate reusable silhouette assets through a small script, and update tests so quiz rounds use the smaller of the configured round size and available bank size.

**Tech Stack:** TypeScript, React, Vite, Node test runner, Python 3 with Pillow/OpenCV for silhouette generation

---

### Task 1: Lock in the replacement behavior with failing tests

**Files:**
- Modify: `src/components/FriendBookFinalSection.logic.test.ts`

**Step 1: Write the failing test**

Add assertions that:
- the quiz bank length is `4`
- the question ids match the four replacement paintings
- `createFriendBookGameSession('one-stroke-mark')` returns a round sized to the bank length when the bank is smaller than `FRIEND_BOOK_QUIZ_ROUND_SIZE`

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: FAIL because the current quiz bank still has 15 questions and the session still expects 5 selected questions.

**Step 3: Write minimal implementation**

Do not change logic yet. Stop after confirming the failure.

**Step 4: Run test to verify it fails cleanly**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: FAIL with quiz-bank expectation mismatches, not syntax or import errors.

### Task 2: Add a reusable silhouette generation script

**Files:**
- Create: `scripts/generate_friend_book_quiz_silhouettes.py`

**Step 1: Write the script**

Implement a small Python script that:
- reads the four images from `public/images/friend-book-quiz/Painting exam`
- uses per-image crop/segmentation settings
- exports consistent transparent PNG silhouettes to `public/images/friend-book-quiz/`

**Step 2: Run script to generate assets**

Run: `python3 scripts/generate_friend_book_quiz_silhouettes.py`
Expected: four silhouette PNGs are written to `public/images/friend-book-quiz/`.

**Step 3: Review outputs**

Inspect the generated silhouettes and adjust the per-image settings if the subject is too vague or cropped poorly.

### Task 3: Replace the quiz bank data

**Files:**
- Modify: `src/data.tsx`

**Step 1: Swap the quiz entries**

Replace the current quiz bank with the four generated paintings:
- `mona-lisa`
- `napoleon-crossing-the-alps`
- `benjamin-franklin`
- `richard-feynman`

Each entry should define:
- `silhouetteImage`
- `prompt`
- `options`
- `correctAnswer`
- `resultCopy`

**Step 2: Keep options coherent**

Use the four replacement subjects as the option pool for every question so the game reads as one consistent themed set.

### Task 4: Make round sizing follow the available bank

**Files:**
- Modify: `src/components/FriendBookFinalSection.logic.ts`

**Step 1: Update quiz session sizing**

Keep `FRIEND_BOOK_QUIZ_ROUND_SIZE = 5`, but ensure `createFriendBookQuizRound()` and the session creation path continue to return `min(5, bank.length)` questions.

**Step 2: Verify no broader behavior change**

Do not change scoring, advancement, or completion logic unless required by the smaller round size.

### Task 5: Turn tests green

**Files:**
- Modify: `src/components/FriendBookFinalSection.logic.test.ts`
- Modify: `src/data.tsx`
- Modify: `src/components/FriendBookFinalSection.logic.ts`

**Step 1: Re-run targeted tests**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: PASS

**Step 2: Verify asset existence assertions**

Confirm the new silhouettes exist at the paths referenced by the updated quiz bank.

### Task 6: Verify project health

**Files:**
- No code changes required unless verification fails

**Step 1: Run build**

Run: `npm run build`
Expected: PASS

**Step 2: Visual sanity check**

Review the generated silhouettes and confirm they are legible in the existing quiz frame without extra UI changes.

**Step 3: Commit**

If the worktree is clean enough to isolate these changes, stage only the quiz replacement files and commit with:

```bash
git add docs/plans/2026-04-17-friend-book-quiz-painting-replacement-design.md docs/plans/2026-04-17-friend-book-quiz-painting-replacement.md scripts/generate_friend_book_quiz_silhouettes.py src/data.tsx src/components/FriendBookFinalSection.logic.ts src/components/FriendBookFinalSection.logic.test.ts public/images/friend-book-quiz/*.png
git commit -m "feat: replace friend book quiz paintings"
```
