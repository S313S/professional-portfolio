# Beyond the Résumé: An Immersive Personal Brand

An immersive personal brand website for **Xiao Ci — AI Builder**. Instead of presenting a static résumé, the site turns professional experience, projects, visual work, and personal connections into a long-form interactive journey.

- Live website: [https://xiaoci-ai.com](https://xiaoci-ai.com)
- Build Week evidence: [docs/build-week/visual-debug-evidence.md](docs/build-week/visual-debug-evidence.md)
- Evidence-loop design: [docs/plans/2026-07-18-gpt56-visual-debug-evidence-loop-design.md](docs/plans/2026-07-18-gpt56-visual-debug-evidence-loop-design.md)
- Hotspot refactor design: [docs/plans/2026-07-18-gpt56-hotspot-debug-refactor-design.md](docs/plans/2026-07-18-gpt56-hotspot-debug-refactor-design.md)

## Why visual debugging matters

The hardest part of this portfolio was not generating code. It was communicating visual intent.

I could see when a hotspot, animated layer, or scroll transition felt wrong, but I could not always describe the exact coordinates, transforms, or responsive behavior in a conventional prompt. Working with Codex, I created purpose-built development interfaces that expose those hidden values as controls. I can adjust the page directly, confirm the intended state, and give Codex machine-readable parameters to apply and test.

This keeps visual judgment with the human while making implementation and verification precise.

## OpenAI Build Week 2026

This repository contains an existing personal portfolio that predates the Build Week submission period. The immersive website and its original standalone debugging routes were already present.

The new work completed during Build Week is the **Visual Debug Evidence Loop**: GPT-5.6 extended the existing Codex Report Panel so one developer-only view can connect:

```text
hard-to-express visual problem
→ linked standalone debug interface
→ human-confirmed calibration
→ GPT-5.6 / Codex source changes
→ automated verification
→ repository evidence
```

The current Codex task was switched to GPT-5.6 and confirmed by the user in the active task selector. That task/session and its timestamped Git commits are the primary model-use evidence. The in-project evidence record is a supporting artifact; it does not claim to be platform-level model authentication.

### GPT-5.6 hotspot debugger refactor

GPT-5.6 also scanned and refactored the existing `/debug/friend-book-diff-hotspots` page during Build Week. The original coordinate editor remains intact; the new iteration adds honest model attribution, a `Select → Calibrate → Confirm` guide, narrow-screen orientation, clearer confirmation language, and a direct link to the Codex Report evidence trail.

This is deliberately described as a **refactor and extension of an existing tool**. The original hotspot debugger predates Build Week.

### Division of responsibility

- **Human:** identifies the visual problem, adjusts controls, and confirms the intended result.
- **Codex:** inspects the repository, edits source files, runs tests, and maintains the evidence trail.
- **GPT-5.6 in Codex:** designed and implemented the Build Week evidence-loop extension and refactored the existing hotspot debugger's workflow guidance, evidence navigation, UI copy, and tests.

## Run locally

Prerequisite: a current Node.js release compatible with the checked-in dependencies.

```bash
npm install
npm run dev
```

Open:

- Portfolio: [http://127.0.0.1:3000](http://127.0.0.1:3000)
- Visual debug evidence: [http://127.0.0.1:3000/debug/codex-report](http://127.0.0.1:3000/debug/codex-report)
- Refactored hotspot debugger: [http://127.0.0.1:3000/debug/friend-book-diff-hotspots](http://127.0.0.1:3000/debug/friend-book-diff-hotspots)

The main portfolio does not require a remote AI service to render. Optional environment variables are documented in `.env.example`.

## Developer-only visual tools

These routes are resolved only in Vite development mode and are not added to the public portfolio navigation:

- `/debug/codex-report` — action guide and visual debugging evidence loop
- `/debug/friend-book-diff-hotspots` — direct hotspot coordinate calibration
- `/debug/friend-book-finale` — isolated final-section testing
- `/debug/career-detail` — isolated career detail testing
- `/debug/works-detail` — isolated works detail testing

The Codex Report endpoint persists local runtime records to `tmp/codex-report.json`. Existing report JSON without an `evidence` field remains supported.

## Verification

Focused evidence-loop tests:

```bash
node --import tsx --test \
  vite.config.test.ts \
  src/codexReport.test.ts \
  src/CodexReportPage.render.test.tsx \
  src/App.logic.test.ts
```

Project checks:

```bash
npm run lint
npm run build
```

## Technology

- React 19 and TypeScript
- Vite 6
- Tailwind CSS 4
- Motion and GSAP-based interaction
- Node test runner and Playwright
- Express and SQLite for the Friend Book service

## Evidence boundary

- The portfolio and original debug interfaces existed before Build Week.
- The GPT-5.6 contribution documented here is the new evidence-loop extension, the later hotspot-debugger refactor, and any fixes recorded through them.
- A record is marked `passed` only after its listed commands and browser path have actually been verified.
- The public website remains the submitted product; the debugging interface explains how hard-to-express visual intent was turned into precise implementation work.
