# Friend Book Mini Games Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the three Friend Book landing cards into complete, web-runnable mini games with a full-screen in-site game layer, then return each completed run into the existing avatar / medal / note / archive flow.

**Architecture:** Keep `FriendBookFinalSection` as the landing page and archive surface, but move active play into a dedicated full-screen overlay component driven by typed game state. Store all reusable game content in `src/data.tsx`, including the 15-question bank for `Who's This?`, and keep completion persistence in the existing Friend Book progress model so replay behavior remains stable.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind utility classes, existing node:test + react-dom/server render tests

---

### Task 1: Define the new game content model

**Files:**
- Modify: `src/data.tsx`
- Modify: `src/components/FriendBookFinalSection.logic.ts`
- Test: `src/components/FriendBookFinalSection.logic.test.ts`

**Step 1: Write the failing test**

```ts
test('friend-book data exposes a 15-question bank for who-is-this and five-question session support', () => {
  assert.equal(friendBookFinalSectionData.quizQuestionBank.length, 15);
  assert.equal(friendBookFinalSectionData.quizQuestionBank.every((question) => question.options.length >= 3), true);
});
```

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: FAIL because `quizQuestionBank` does not exist yet.

**Step 3: Write minimal implementation**

```ts
export interface FriendBookQuizQuestion {
  id: string;
  silhouetteImage: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  resultCopy: string;
}

quizQuestionBank: [
  {
    id: 'mona-lisa',
    silhouetteImage: '/images/friend-book-quiz/mona-lisa-shadow.png',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['Mona Lisa', 'Girl with a Pearl Earring', 'Venus de Milo', 'The Scream'],
    correctAnswer: 'Mona Lisa',
    resultCopy: 'The quiet smile belongs to Mona Lisa.',
  },
  // ...14 more entries
]
```

Also add a helper for drawing five unique questions from the bank:

```ts
export function createFriendBookQuizRound(
  questions: FriendBookQuizQuestion[],
  roundSize = 5,
  randomValue = Math.random,
): FriendBookQuizQuestion[] {
  // deterministic unique selection for tests
}
```

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: PASS for the new question-bank coverage.

**Step 5: Commit**

```bash
git add src/data.tsx src/components/FriendBookFinalSection.logic.ts src/components/FriendBookFinalSection.logic.test.ts
git commit -m "feat: add friend book quiz question bank"
```

### Task 2: Add a typed full-screen game session state

**Files:**
- Modify: `src/components/FriendBookFinalSection.logic.ts`
- Modify: `src/components/FriendBookFinalSection.logic.test.ts`

**Step 1: Write the failing test**

```ts
test('friend-book game sessions create stable round state for the three full-screen games', () => {
  const quizRound = createFriendBookGameSession('one-stroke-mark', friendBookFinalSectionData.quizQuestionBank, () => 0.15);
  assert.equal(quizRound.quizQuestions.length, 5);
  assert.equal(quizRound.currentQuestionIndex, 0);
  assert.equal(quizRound.correctAnswerCount, 0);
});
```

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: FAIL because the new session factory and state fields do not exist yet.

**Step 3: Write minimal implementation**

```ts
export interface FriendBookGameSessionState {
  gameId: FriendBookGameId;
  betweenTwoPages?: { foundSpotIds: string[]; remainingSeconds: number; mistakes: number };
  moonRun?: { segmentIndex: number; totalSegments: number; successes: number; markerPosition: number };
  quiz?: {
    questions: FriendBookQuizQuestion[];
    currentQuestionIndex: number;
    selectedAnswer: string | null;
    answerState: 'idle' | 'correct' | 'wrong';
    correctAnswerCount: number;
  };
}

export function createFriendBookGameSession(...) { ... }
export function advanceFriendBookQuizQuestion(...) { ... }
export function answerFriendBookQuizQuestion(...) { ... }
```

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: PASS with deterministic five-question session creation.

**Step 5: Commit**

```bash
git add src/components/FriendBookFinalSection.logic.ts src/components/FriendBookFinalSection.logic.test.ts
git commit -m "feat: add typed friend book game session state"
```

### Task 3: Build the full-screen overlay shell and route active play into it

**Files:**
- Create: `src/components/FriendBookGameOverlay.tsx`
- Modify: `src/components/FriendBookFinalSection.tsx`
- Modify: `src/components/FriendBookFinalSection.render.test.tsx`

**Step 1: Write the failing test**

```ts
test('renders a dedicated full-screen friend-book game overlay when a game is active', () => {
  const markup = renderToStaticMarkup(<FriendBookGameOverlay {...baseProps} />);
  assert.match(markup, /data-friend-book-game-overlay="true"/);
  assert.match(markup, /data-friend-book-overlay-game="between-two-pages"/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: FAIL because the overlay component and markup hooks do not exist yet.

**Step 3: Write minimal implementation**

```tsx
export default function FriendBookGameOverlay({
  activeGame,
  session,
  onClose,
  children,
}: FriendBookGameOverlayProps) {
  return (
    <section
      data-friend-book-game-overlay="true"
      data-friend-book-overlay-game={activeGame.id}
      className="fixed inset-0 z-50 ..."
    >
      <header>...</header>
      <div>{children}</div>
    </section>
  );
}
```

Update `FriendBookFinalSection` so clicking `Begin` opens this overlay instead of the current inline play panel.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: PASS with new overlay selectors present.

**Step 5: Commit**

```bash
git add src/components/FriendBookGameOverlay.tsx src/components/FriendBookFinalSection.tsx src/components/FriendBookFinalSection.render.test.tsx
git commit -m "feat: add friend book full-screen game overlay"
```

### Task 4: Replace Between Two Pages with a complete timed difference-hunt round

**Files:**
- Modify: `src/components/FriendBookFinalSection.logic.ts`
- Modify: `src/components/FriendBookFinalSection.logic.test.ts`
- Modify: `src/components/FriendBookGameOverlay.tsx`

**Step 1: Write the failing test**

```ts
test('between two pages completes only after all targets are found before the timer expires', () => {
  const session = createFriendBookGameSession('between-two-pages', friendBookFinalSectionData.quizQuestionBank);
  const completed = completeBetweenTwoPagesRound({
    ...session,
    betweenTwoPages: { foundSpotIds: ['moon-stamp', 'cat-tail', 'page-fold'], remainingSeconds: 12, mistakes: 1 },
  });
  assert.equal(completed.isSuccess, true);
});
```

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: FAIL because timed round resolution does not exist yet.

**Step 3: Write minimal implementation**

```ts
export function completeBetweenTwoPagesRound(session: FriendBookGameSessionState) {
  const state = session.betweenTwoPages!;
  return {
    isSuccess:
      state.remainingSeconds > 0 &&
      FRIEND_BOOK_DIFFERENCE_TARGETS.every((target) => state.foundSpotIds.includes(target)),
    score: state.remainingSeconds,
  };
}
```

Render the overlay with:
- countdown bar
- current found count
- mistake copy
- replay button
- finish transition when all three differences are found

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: PASS for timed round completion logic.

**Step 5: Commit**

```bash
git add src/components/FriendBookFinalSection.logic.ts src/components/FriendBookFinalSection.logic.test.ts src/components/FriendBookGameOverlay.tsx
git commit -m "feat: upgrade between two pages into timed round"
```

### Task 5: Replace Moon Run with a short multi-beat rhythm run

**Files:**
- Modify: `src/components/FriendBookFinalSection.logic.ts`
- Modify: `src/components/FriendBookFinalSection.logic.test.ts`
- Modify: `src/components/FriendBookGameOverlay.tsx`

**Step 1: Write the failing test**

```ts
test('moon run requires clearing all timing beats to finish the round', () => {
  const session = createFriendBookGameSession('moon-run', friendBookFinalSectionData.quizQuestionBank);
  const updated = registerMoonRunBeat(session, 0.5);
  assert.equal(updated.moonRun?.successes, 1);
});
```

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: FAIL because beat-based run helpers do not exist yet.

**Step 3: Write minimal implementation**

```ts
export function registerMoonRunBeat(session: FriendBookGameSessionState, markerPosition: number) {
  const beatSuccess = resolveMoonRunAttempt(markerPosition).isSuccess;
  return {
    ...session,
    moonRun: {
      ...session.moonRun!,
      segmentIndex: session.moonRun!.segmentIndex + 1,
      successes: session.moonRun!.successes + (beatSuccess ? 1 : 0),
    },
  };
}

export function isMoonRunRoundComplete(session: FriendBookGameSessionState) {
  return session.moonRun!.segmentIndex >= session.moonRun!.totalSegments;
}
```

Render the overlay with:
- a moving moon marker lane
- 3 to 5 sequential stop beats per round
- immediate hit / miss feedback per beat
- round success when enough beats are cleared

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: PASS with multi-beat progress logic.

**Step 5: Commit**

```bash
git add src/components/FriendBookFinalSection.logic.ts src/components/FriendBookFinalSection.logic.test.ts src/components/FriendBookGameOverlay.tsx
git commit -m "feat: turn moon run into multi-beat rhythm round"
```

### Task 6: Replace the third game with the five-question silhouette quiz

**Files:**
- Modify: `src/components/FriendBookFinalSection.tsx`
- Modify: `src/components/FriendBookGameOverlay.tsx`
- Modify: `src/components/FriendBookFinalSection.logic.ts`
- Modify: `src/components/FriendBookFinalSection.logic.test.ts`
- Modify: `src/components/FriendBookFinalSection.render.test.tsx`

**Step 1: Write the failing test**

```ts
test('who-is-this uses five random silhouette questions from a fifteen-question bank', () => {
  const session = createFriendBookGameSession('one-stroke-mark', friendBookFinalSectionData.quizQuestionBank, () => 0.12);
  assert.equal(session.quiz?.questions.length, 5);
  assert.equal(new Set(session.quiz?.questions.map((question) => question.id)).size, 5);
});
```

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts src/components/FriendBookFinalSection.render.test.tsx`
Expected: FAIL because the current third game is still stroke-drawing logic.

**Step 3: Write minimal implementation**

```ts
export function answerFriendBookQuizQuestion(session: FriendBookGameSessionState, answer: string) {
  const currentQuestion = session.quiz!.questions[session.quiz!.currentQuestionIndex]!;
  const isCorrect = answer === currentQuestion.correctAnswer;
  return {
    ...session,
    quiz: {
      ...session.quiz!,
      selectedAnswer: answer,
      answerState: isCorrect ? 'correct' : 'wrong',
      correctAnswerCount: session.quiz!.correctAnswerCount + (isCorrect ? 1 : 0),
    },
  };
}
```

Render the overlay with:
- silhouette image
- question counter `1 / 5`
- answer buttons
- immediate result panel
- next-question CTA until the fifth question completes

Rename all user-facing copy for the third game to `Who’s This?`.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts src/components/FriendBookFinalSection.render.test.tsx`
Expected: PASS with quiz round state and updated third-card copy.

**Step 5: Commit**

```bash
git add src/components/FriendBookFinalSection.tsx src/components/FriendBookGameOverlay.tsx src/components/FriendBookFinalSection.logic.ts src/components/FriendBookFinalSection.logic.test.ts src/components/FriendBookFinalSection.render.test.tsx
git commit -m "feat: add friend book silhouette quiz game"
```

### Task 7: Reconnect round completion to medal, note, and archive persistence

**Files:**
- Modify: `src/components/FriendBookFinalSection.tsx`
- Modify: `src/components/FriendBookFinalSection.logic.ts`
- Modify: `src/components/FriendBookFinalSection.logic.test.ts`

**Step 1: Write the failing test**

```ts
test('completed full-screen rounds still save medal, note, avatar, and completion count into the matching archive slot', () => {
  const progress = completeFriendBookGameSession(createDefaultFriendBookProgress(), {
    gameId: 'one-stroke-mark',
    note: 'Recognized four silhouettes tonight.',
    displayDate: 'APR 16, 2026',
    medalId: '/images/PurpleMedal03.png',
  });
  assert.equal(progress.games['one-stroke-mark'].completionCount, 1);
  assert.equal(progress.games['one-stroke-mark'].latestNote, 'Recognized four silhouettes tonight.');
});
```

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: FAIL if any game-id wiring or save path breaks during the refactor.

**Step 3: Write minimal implementation**

```tsx
function handleRoundComplete(gameId: FriendBookGameId, summary: FriendBookRoundSummary) {
  setPendingMedalId(getFriendBookMedalIdForGame(gameId, Math.random()));
  setRoundSummary(summary);
  setStage('note-entry');
}
```

Ensure the note-entry stage:
- opens after overlay success
- closes the overlay while keeping the chosen game active
- can reference round summary text like `4 / 5 silhouettes recognized`
- still writes into the existing right-page slot only for the completed game

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts`
Expected: PASS with archive persistence intact after the game refactor.

**Step 5: Commit**

```bash
git add src/components/FriendBookFinalSection.tsx src/components/FriendBookFinalSection.logic.ts src/components/FriendBookFinalSection.logic.test.ts
git commit -m "feat: reconnect friend book game rounds to archive flow"
```

### Task 8: Verify the whole Friend Book flow end-to-end

**Files:**
- Modify: `package.json` (optional, only if adding a dedicated test script)
- Test: `src/components/FriendBookFinalSection.logic.test.ts`
- Test: `src/components/FriendBookFinalSection.render.test.tsx`
- Test: `src/FriendBookFinaleDebugPage.render.test.tsx`

**Step 1: Write the failing test**

```ts
test('friend-book debug page still renders the finale section with overlay-capable markup', () => {
  const markup = renderToStaticMarkup(<FriendBookFinaleDebugPage />);
  assert.match(markup, /Friend Book Finale Debug/);
  assert.match(markup, /data-friend-book-game-card="between-two-pages"/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts src/components/FriendBookFinalSection.render.test.tsx src/FriendBookFinaleDebugPage.render.test.tsx`
Expected: FAIL until all render hooks and debug page expectations are updated.

**Step 3: Write minimal implementation**

```json
{
  "scripts": {
    "test:friend-book": "node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts src/components/FriendBookFinalSection.render.test.tsx src/FriendBookFinaleDebugPage.render.test.tsx"
  }
}
```

Only add the script if it improves repeatability; otherwise keep the direct command in docs and commit messages.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.logic.test.ts src/components/FriendBookFinalSection.render.test.tsx src/FriendBookFinaleDebugPage.render.test.tsx`
Expected: PASS for logic, render, and debug preview coverage.

**Step 5: Commit**

```bash
git add package.json src/components/FriendBookFinalSection.logic.test.ts src/components/FriendBookFinalSection.render.test.tsx src/FriendBookFinaleDebugPage.render.test.tsx
git commit -m "test: cover friend book full-screen game flow"
```

## Notes for Implementation

- Keep the external game ids unchanged: `between-two-pages`, `moon-run`, `one-stroke-mark`. The third game can display `Who’s This?`, but persistence keys should stay stable to avoid breaking existing local storage.
- The third game should use local static question data first. If final silhouette image assets are missing, wire the data structure now and use temporary placeholders with the final filenames already defined.
- Do not remove the existing avatar unlock behavior; clearing all three games once should still unlock the hidden avatar.
- Preserve the current archive board layout and only change the game-playing surface.
