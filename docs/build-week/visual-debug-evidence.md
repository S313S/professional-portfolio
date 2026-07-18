# OpenAI Build Week 2026 — Visual Debug Evidence

This document is a repository snapshot exported from the developer-only Codex Report evidence loop. The portfolio and its original standalone debugging tools predate Build Week; the evidence-loop extension below is new work completed in the user-confirmed GPT-5.6 Codex task.

## Visual debugging evidence loop

**Stage:** verified

### Problem

The existing standalone debugging interfaces helped translate visual intent, but the report panel could not show how human calibration became traceable source changes.

### Visual intent

Keep the public portfolio untouched while presenting a concise, inspectable developer-only trail from subjective feedback to implementation and verification.

**Debug route:** `/debug/codex-report`

### Human calibration

The user approved a developer-only evidence loop that reuses the existing Friend Book, Career, Works, and Codex Report debugging routes.

- `exposure`: development-only route
- `public portfolio`: no new production entry point
- `evidence stages`: problem → human calibration → implementation → verification

### Implementation

GPT-5.6 extended Codex Report with normalized evidence records, a debug-route allowlist, stage calculation, Markdown export, evidence navigation, and a detailed evidence view.

**Model note:** The user-confirmed current Codex task used GPT-5.6; the active task selector and Codex session are the primary model-use evidence.

**Changed files:**

- `src/codexReport.ts`
- `src/codexReport.test.ts`
- `src/CodexReportPage.tsx`
- `src/CodexReportPage.render.test.tsx`
- `vite.config.ts`
- `vite.config.test.ts`
- `README.md`
- `docs/build-week/visual-debug-evidence.md`

### Verification

**Outcome:** passed

39 focused regression tests passed. TypeScript checking and the Vite production build passed. Headless Chromium loaded the evidence route and public homepage without overlays or console errors, copied the evidence Markdown with clipboard permission, and found no public debug links.

**Commands:**

- `node --import tsx --test vite.config.test.ts src/codexReport.test.ts src/CodexReportPage.render.test.tsx src/App.logic.test.ts src/FriendBookDiffHotspotsDebugPage.logic.test.ts src/FriendBookDiffHotspotsDebugPage.render.test.tsx`
- `npm run lint`
- `npm run build`
- `Playwright browser verification for /debug/codex-report and /`

### Timeline

- Created: 2026-07-18T11:57:29+08:00
- Calibration confirmed: 2026-07-18T11:57:29+08:00
- Implementation completed: 2026-07-18T12:09:01+08:00
- Verification completed: 2026-07-18T12:31:04+08:00

## GPT-5.6 hotspot debugger refactor

**Stage:** implemented

### Problem

The existing hotspot page exposed drag, resize, export, and save controls, but its first screen did not explain the full workflow. In a 649px-wide scan, the controls started around y=960 after both previews, so the path from visual judgment to confirmed parameters was easy to miss.

### Visual intent

Keep the existing calibration behavior intact while making Select → Calibrate → Confirm understandable, truthful about the GPT-5.6 contribution, and directly connected to the repository evidence trail.

**Debug route:** `/debug/friend-book-diff-hotspots`

### Human calibration

The user approved a small workflow refactor after GPT-5.6 scanned the existing page; the scope was limited to guidance, attribution, responsive orientation, and evidence navigation.

- `existing interaction logic`: unchanged
- `workflow`: Select → Calibrate → Confirm
- `narrow viewport scan`: 649 × 837; controls near y=960
- `public portfolio`: no new debug link

### Implementation

GPT-5.6 refactored and extended the existing visual hotspot debugging page with honest Build Week attribution, a three-step calibration guide, narrow-screen orientation, clearer confirmation language, and a link to the Codex Report evidence trail.

**Model note:** This is an existing tool refactored and extended in the user-confirmed GPT-5.6 Codex task. The original tool predates Build Week and this task.

**Changed files:**

- `src/FriendBookDiffHotspotsDebugPage.tsx`
- `src/FriendBookDiffHotspotsDebugPage.render.test.tsx`
- `src/codexReport.ts`
- `src/codexReport.test.ts`
- `README.md`
- `docs/build-week/visual-debug-evidence.md`
- `docs/plans/2026-07-18-gpt56-hotspot-debug-refactor-design.md`
- `docs/plans/2026-07-18-gpt56-hotspot-debug-refactor.md`

### Verification

**Outcome:** pending

Full regression, type, build, and browser verification have not yet been completed for this refactor.

### Timeline

- Created: 2026-07-18T12:57:43+08:00
- Calibration confirmed: 2026-07-18T12:57:43+08:00
- Implementation completed: 2026-07-18T12:57:43+08:00

## Verification status

The original evidence-loop record passed. The hotspot-debugger refactor remains pending until its full regression, type, build, and browser checks are complete.
