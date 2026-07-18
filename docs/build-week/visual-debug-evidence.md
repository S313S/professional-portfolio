# OpenAI Build Week 2026 — Visual Debug Evidence

This document is a repository snapshot exported from the developer-only Codex Report evidence loop. The portfolio and its original standalone debugging tools predate Build Week; the evidence-loop extension below is new work completed in the user-confirmed GPT-5.6 Codex task.

## Visual debugging evidence loop

**Stage:** implemented

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

### Timeline

- Created: 2026-07-18T11:57:29+08:00
- Calibration confirmed: 2026-07-18T11:57:29+08:00
- Implementation completed: 2026-07-18T12:09:01+08:00

## Verification status

Pending. This snapshot will be updated to `passed` only after the focused regression tests, TypeScript check, production build, and local browser path have actually succeeded.

