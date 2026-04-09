# Works Detail Background Card Mapping Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Works Detail card strip sources with five existing page background images and keep them displayed as square, center-cropped cards.

**Architecture:** This is a configuration-only change in `WorksDetailSection`. The square card rendering already exists in CSS through `background-position: center` and `background-size: cover`, so the implementation only needs to remap the image paths and lock the mapping with a render test.

**Tech Stack:** React 19, TypeScript, static assets from `public/images`, Node test runner, Vite.

---

### Task 1: Lock the new card-source mapping in tests

**Files:**
- Modify: `src/components/WorksDetailSection.render.test.tsx`

**Step 1: Write the failing test**

Assert that the detail markup includes:

- `/images/bg_growpath.jpeg`
- `/images/career_bg.png`
- `/images/careerDetail_bg.png`
- `/images/WorksCollectionRoom_Bg.jpg`
- `/images/workDetail_bg.jpeg`

And excludes the old card-only sources:

- `/images/growPath_01.png`
- `/images/growPath_02.png`
- `/images/growPath_03.png`
- `/images/growPath_04.png`
- `/images/works-detail-07-square.png`

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/components/WorksDetailSection.render.test.tsx`

Expected: FAIL on the new asset assertions.

### Task 2: Remap the Works Detail card sources

**Files:**
- Modify: `src/components/WorksDetailSection.tsx`

**Step 1: Write the minimal implementation**

Update `WORKS_DETAIL_STAGE_ITEMS` to the approved mapping:

- `04` → `/images/bg_growpath.jpeg`
- `05` → `/images/career_bg.png`
- `06` → `/images/careerDetail_bg.png`
- `07` → `/images/WorksCollectionRoom_Bg.jpg`
- `08` → `/images/workDetail_bg.jpeg`

**Step 2: Run test to verify it passes**

Run: `node --import tsx --test src/components/WorksDetailSection.render.test.tsx`

Expected: PASS with all Works Detail render tests green.

### Task 3: Verify production output

**Files:**
- Verify: `src/components/WorksDetailSection.tsx`
- Verify: `src/components/WorksDetailSection.render.test.tsx`

**Step 1: Run the production build**

Run: `npm run build`

Expected: Vite build succeeds without asset resolution errors.
