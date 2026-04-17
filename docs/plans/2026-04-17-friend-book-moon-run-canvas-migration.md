# Friend Book Moon Run Canvas Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Friend Book Moon Run gameplay layer with the external canvas game while preserving the existing overlay and completion flow.

**Architecture:** A canvas-driven `FriendBookMoonRunStage` owns the gameplay loop, rendering, and runtime entities. `FriendBookFinalSection` stays responsible for overlay framing, replay/reset, close behavior, and note-entry handoff on success. Legacy Moon Run DOM physics code is removed from the active path.

**Tech Stack:** React 19, TypeScript, Vite, canvas 2D rendering, existing Friend Book overlay components, node test runner / existing render tests.

---

### Task 1: Define the new Moon Run integration surface

**Files:**
- Modify: `src/components/FriendBookFinalSection.tsx`
- Modify: `src/components/FriendBookFinalSection.logic.ts`
- Test: `src/components/FriendBookFinalSection.render.test.tsx`

**Step 1: Write the failing test**

Add an integration test asserting that the Moon Run stage renders a canvas-based game shell instead of the legacy DOM viewport markers.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: fail because the old stage still renders the legacy Moon Run DOM viewport.

**Step 3: Write minimal implementation**

Update the Moon Run rendering path so `FriendBookFinalSection` mounts the new stage component and uses callback-based completion instead of the old RAF/input session loop.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: pass.

### Task 2: Port the external canvas game into the Friend Book stage

**Files:**
- Modify: `src/components/FriendBookMoonRunStage.tsx`
- Test: `src/components/FriendBookFinalSection.render.test.tsx`

**Step 1: Write the failing test**

Add assertions for the new Moon Run stage shell: canvas node present, mobile controls present, replay affordance present for end states.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: fail because the old stage does not expose the new canvas shell markers.

**Step 3: Write minimal implementation**

Port the external canvas game logic into `FriendBookMoonRunStage.tsx`, remove the intro screen, adapt sizing to the overlay container, and emit completion/replay callbacks for the parent.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: pass.

### Task 3: Remove obsolete Moon Run active-path logic

**Files:**
- Modify: `src/components/FriendBookFinalSection.tsx`
- Modify: `src/components/FriendBookFinalSection.logic.ts`
- Modify: `src/data.tsx`

**Step 1: Write the failing test**

Add or adjust assertions to confirm Moon Run completion summary still enters note-entry and replay still resets the game.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: fail until callbacks and summary plumbing are updated.

**Step 3: Write minimal implementation**

Delete the obsolete Moon Run RAF/input stepping path from `FriendBookFinalSection`, simplify Moon Run session data to what the parent still needs, and keep the archive summary generation intact.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: pass.

### Task 4: Verify typecheck and targeted rendering coverage

**Files:**
- Modify: `src/components/FriendBookFinalSection.render.test.tsx`
- Test: `package.json`

**Step 1: Run targeted Moon Run tests**

Run: `node --import tsx --test src/components/FriendBookFinalSection.render.test.tsx`
Expected: pass.

**Step 2: Run static verification**

Run: `npm run lint`
Expected: exit 0.

**Step 3: Run production build**

Run: `npm run build`
Expected: exit 0.
