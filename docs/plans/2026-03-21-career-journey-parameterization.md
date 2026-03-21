# Career Journey Parameterization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `CareerJourneySection` fully parameter-driven so text, title placement, role image placement, decorative image placement, and the `AIGC` badge can all be adjusted by editing config only.

**Architecture:** Keep the existing DOM structure and animation behavior, but move all page content and positioning tokens into a single top-level config object in `CareerJourneySection.tsx`. Add small helpers for responsive class composition so layout stays readable while the page becomes configuration-driven.

**Tech Stack:** React 19, TypeScript, Tailwind utility classes, Node test runner with `tsx`

---

### Task 1: Define coverage for configuration-driven output

**Files:**
- Modify: `src/components/CareerJourneySection.render.test.tsx`

**Step 1: Write the failing test**

Add assertions that prove the section now exposes stable config-driven hooks in markup, including:
- content wrapper data attribute
- title wrapper data attribute
- role image wrapper data attribute
- `AIGC` badge data attribute
- decorative card/image data attributes

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/CareerJourneySection.render.test.tsx`

Expected: FAIL because the current component does not yet render the new config-driven hooks.

**Step 3: Write minimal implementation**

Update the component so those elements render from centralized config and emit the expected attributes.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/components/CareerJourneySection.render.test.tsx`

Expected: PASS

### Task 2: Refactor the section into one config object

**Files:**
- Modify: `src/components/CareerJourneySection.tsx`

**Step 1: Introduce config shape**

Create a single `CAREER_JOURNEY_CONFIG` object that contains:
- `text`
- `contentLayout`
- `roleLayout`
- `decorativeLayouts`
- `aigcBadgeLayout`

**Step 2: Keep layout stable while moving hard-coded values**

Replace hard-coded class strings and inline text with values from config. Add concise Chinese comments next to each config block so future edits are obvious.

**Step 3: Add tiny helpers**

Add helpers for joining responsive class strings and optional style fragments only where needed to avoid repeating null checks.

**Step 4: Re-run render test**

Run: `node --import tsx --test src/components/CareerJourneySection.render.test.tsx`

Expected: PASS

### Task 3: Validate no regression in the target area

**Files:**
- Verify: `src/components/CareerJourneySection.tsx`
- Verify: `src/components/CareerJourneySection.render.test.tsx`

**Step 1: Run focused test**

Run: `node --import tsx --test src/components/CareerJourneySection.render.test.tsx`

Expected: PASS

**Step 2: Run type check**

Run: `npm run lint`

Expected: PASS with no TypeScript errors caused by the refactor.
