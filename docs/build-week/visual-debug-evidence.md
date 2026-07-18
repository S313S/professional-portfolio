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
- `README.md`
- `docs/build-week/visual-debug-evidence.md`

### Verification

**Outcome:** passed

32 focused regression tests passed. TypeScript checking and the Vite production build passed. Headless Chromium loaded the evidence route and public homepage without overlays or console errors, copied the evidence Markdown with clipboard permission, and found no public debug links.

**Commands:**

- `node --import tsx --test src/codexReport.test.ts src/CodexReportPage.render.test.tsx src/App.logic.test.ts src/FriendBookDiffHotspotsDebugPage.logic.test.ts src/FriendBookDiffHotspotsDebugPage.render.test.tsx`
- `npm run lint`
- `npm run build`
- `Playwright browser verification for /debug/codex-report and /`

### Timeline

- Created: 2026-07-18T11:57:29+08:00
- Calibration confirmed: 2026-07-18T11:57:29+08:00
- Implementation completed: 2026-07-18T12:09:01+08:00
- Verification completed: 2026-07-18T12:18:07+08:00

## Verification status

Passed. The commands and browser path listed above were executed before this snapshot was updated.
