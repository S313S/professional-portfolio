# Works Detail 07 Asset Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the low-resolution Works Detail `07` image with a new square high-resolution asset that is suitable for both the card view and a future full-screen viewer.

**Architecture:** Keep the current Works Detail card layout and styling intact. Generate/import a single new square asset for `07`, wire that asset into the stage item config, and add a regression test so the source does not silently fall back to the old low-resolution room background.

**Tech Stack:** React 19, TypeScript, static image assets under `public/images`, Node test runner, external image generation via the existing `baoyu-image-gen` skill workflow.

---

### Task 1: Generate candidate 07 assets

**Files:**
- Create: `public/images/works-detail-07-square-v1.png`
- Create: `public/images/works-detail-07-square-v2.png`

**Step 1: Generate the first square candidate**

Run the image generation workflow with a prompt that preserves the warm portfolio-wall / studio-display mood and outputs a 1:1 high-resolution image.

**Step 2: Generate the second square candidate**

Run a second prompt variation so there is a fallback if the first image is visually weak.

**Step 3: Review both candidates**

Inspect both generated files and choose the stronger one for the active `07` card.

### Task 2: Wire the new asset into Works Detail

**Files:**
- Modify: `src/components/WorksDetailSection.tsx`
- Test: `src/components/WorksDetailSection.render.test.tsx`

**Step 1: Write the failing test**

Add a render test that asserts the Works Detail stage uses the new `07` image path instead of `/images/WorksCollectionRoom_Bg.jpg`.

**Step 2: Run the test to verify it fails**

Run: `node --import tsx --test src/components/WorksDetailSection.render.test.tsx`

Expected: FAIL on the new `07` asset assertion.

**Step 3: Write the minimal implementation**

Update the `WORKS_DETAIL_STAGE_ITEMS` config so label `07` points to the selected new square asset.

**Step 4: Run the test to verify it passes**

Run: `node --import tsx --test src/components/WorksDetailSection.render.test.tsx`

Expected: PASS with all Works Detail render tests green.

### Task 3: Verify the final asset path is production-safe

**Files:**
- Verify: `public/images/works-detail-07-square-v*.png`

**Step 1: Run the production build**

Run: `npm run build`

Expected: Vite build succeeds and emits the new `07` asset into the build output.

**Step 2: Commit**

```bash
git add docs/plans/2026-04-08-works-detail-07-asset-refresh-design.md docs/plans/2026-04-08-works-detail-07-asset-refresh.md src/components/WorksDetailSection.tsx src/components/WorksDetailSection.render.test.tsx public/images/works-detail-07-square-v1.png public/images/works-detail-07-square-v2.png
git commit -m "feat: refresh works detail 07 asset"
```
