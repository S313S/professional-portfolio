# GPT-5.6 Visual Debug Evidence Loop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将现有 Codex Report 扩展为仅开发模式可见的视觉调试证据闭环，并生成可提交到仓库的真实 Build Week 证据。

**Architecture:** 在 `CodexGuideDocument` 中增加向后兼容的 `evidence` 数组，由现有 Vite GET/POST 端点继续负责本地 JSON 持久化。`CodexReportPage` 在原有指南导航之外增加证据导航和详情视图；数据规范化、阶段计算与 Markdown 导出保持为纯函数并由 Node test runner 覆盖。

**Tech Stack:** React 19、TypeScript、Vite 6、Node test runner、React DOM Server、Tailwind CSS 4。

---

### Task 1: 视觉调试证据数据模型与阶段计算

**Files:**
- Modify: `src/codexReport.test.ts`
- Modify: `src/codexReport.ts`

**Step 1: 写入失败测试**

在 `src/codexReport.test.ts` 增加以下覆盖：

```ts
test('normalizeCodexGuideDocument preserves valid visual debug evidence', () => {
  const guide = normalizeCodexGuideDocument({
    title: 'Build Week',
    summary: 'Evidence',
    groups: createDefaultCodexGuideDocument().groups,
    evidence: [{
      id: 'friend-book-hotspots',
      title: 'Friend Book hotspot calibration',
      problem: 'The hotspot felt displaced but coordinates were hard to describe.',
      visualIntent: 'Match every hotspot to the visible object.',
      debugRoute: '/debug/friend-book-diff-hotspots',
      calibration: {
        summary: 'Human-confirmed hotspot coordinates.',
        parameters: [{label: 'hotspot-1.x', value: '42.5%'}],
        confirmedAt: '2026-07-18T04:00:00.000Z',
      },
    }],
  });

  assert.equal(guide.evidence.length, 1);
  assert.equal(guide.evidence[0]?.debugRoute, '/debug/friend-book-diff-hotspots');
});

test('getCodexEvidenceStage returns the latest truthful completed stage', () => {
  assert.equal(getCodexEvidenceStage(describedEvidence), 'described');
  assert.equal(getCodexEvidenceStage(calibratedEvidence), 'calibrated');
  assert.equal(getCodexEvidenceStage(implementedEvidence), 'implemented');
  assert.equal(getCodexEvidenceStage(verifiedEvidence), 'verified');
});
```

同时覆盖：无效记录被丢弃、非允许调试路由不生成链接、旧版无 `evidence` 数据仍正常归一化。

**Step 2: 运行测试并确认 RED**

Run: `node --import tsx --test src/codexReport.test.ts`

Expected: FAIL，提示 `getCodexEvidenceStage` 未导出或 `evidence` 不存在。

**Step 3: 实现最小数据模型**

在 `src/codexReport.ts` 增加：

```ts
export type CodexEvidenceStage =
  | 'described'
  | 'calibrated'
  | 'implemented'
  | 'verified';

export interface CodexVisualDebugEvidence {
  id: string;
  title: string;
  problem: string;
  visualIntent: string;
  debugRoute?: string;
  createdAt?: string;
  calibration?: {
    summary: string;
    parameters: Array<{label: string; value: string}>;
    confirmedAt?: string;
  };
  implementation?: {
    summary: string;
    changedFiles: string[];
    modelNote?: string;
    completedAt?: string;
  };
  verification?: {
    summary: string;
    commands: string[];
    outcome: 'passed' | 'failed' | 'pending';
    completedAt?: string;
  };
}
```

将 `evidence: CodexVisualDebugEvidence[]` 加入 `CodexGuideDocument`，增加白名单路由、分层规范化函数和 `getCodexEvidenceStage()`。只有存在对应对象时才推进阶段，不推断缺失事实。

**Step 4: 运行测试并确认 GREEN**

Run: `node --import tsx --test src/codexReport.test.ts`

Expected: PASS。

**Step 5: 提交**

```bash
git add src/codexReport.ts src/codexReport.test.ts
git commit -m "Add visual debug evidence model"
```

### Task 2: Markdown 证据导出

**Files:**
- Modify: `src/codexReport.test.ts`
- Modify: `src/codexReport.ts`

**Step 1: 写入失败测试**

```ts
test('formatCodexEvidenceMarkdown exports facts and omits missing stages', () => {
  const markdown = formatCodexEvidenceMarkdown(verifiedEvidence);

  assert.match(markdown, /## Friend Book hotspot calibration/);
  assert.match(markdown, /\/debug\/friend-book-diff-hotspots/);
  assert.match(markdown, /GPT-5.6/);
  assert.match(markdown, /node --import tsx --test/);
  assert.doesNotMatch(markdown, /undefined|null/);
});
```

增加一条未实施记录测试，确认导出不会补写不存在的模型、文件、测试或时间戳。

**Step 2: 运行测试并确认 RED**

Run: `node --import tsx --test src/codexReport.test.ts`

Expected: FAIL，提示 `formatCodexEvidenceMarkdown` 未定义。

**Step 3: 实现最小导出函数**

在 `src/codexReport.ts` 实现 `formatCodexEvidenceMarkdown(record)`：按问题、视觉意图、调试入口、人工校准、实施、验证、时间线的固定顺序生成 Markdown；可选字段缺失时整段省略。

**Step 4: 运行测试并确认 GREEN**

Run: `node --import tsx --test src/codexReport.test.ts`

Expected: PASS。

**Step 5: 提交**

```bash
git add src/codexReport.ts src/codexReport.test.ts
git commit -m "Add evidence Markdown export"
```

### Task 3: Codex Report 证据导航与详情视图

**Files:**
- Modify: `src/CodexReportPage.render.test.tsx`
- Modify: `src/CodexReportPage.tsx`

**Step 1: 写入失败渲染测试**

在测试数据中提供一条完整证据，并增加以下断言：

```ts
assert.match(markup, /data-codex-report-nav-group="visual-debug-evidence"/);
assert.match(markup, /data-codex-evidence-stage="verified"/);
assert.match(markup, /Friend Book hotspot calibration/);
assert.match(markup, /href="\/debug\/friend-book-diff-hotspots"/);
assert.match(markup, /Copy evidence Markdown/);
assert.match(markup, /GPT-5.6/);
```

为 `CodexReportPage` 增加仅测试和默认初始化使用的 `initialDocument`、`initialEvidenceId` 属性，避免依赖浏览器 fetch 才能验证详情。

**Step 2: 运行测试并确认 RED**

Run: `node --import tsx --test src/CodexReportPage.render.test.tsx`

Expected: FAIL，页面还没有证据导航和详情元素。

**Step 3: 实现最小 UI**

- 将现有导航扩展为指南分组加 `Visual Debug Evidence` 分组。
- 选择证据时，右侧展示四阶段状态、问题、视觉意图、调试入口、校准参数、文件和测试结果。
- 完整阶段使用 `data-codex-evidence-stage`，方便渲染测试和演示定位。
- 增加 `Copy evidence Markdown` 按钮，使用纯函数生成文本；剪贴板不可用时显示失败状态，不阻断页面。
- 抽取共享内容组件，避免桌面和移动视图继续复制新增证据 JSX。

**Step 4: 运行相关测试并确认 GREEN**

Run: `node --import tsx --test src/codexReport.test.ts src/CodexReportPage.render.test.tsx src/App.logic.test.ts`

Expected: PASS。

**Step 5: 提交**

```bash
git add src/CodexReportPage.tsx src/CodexReportPage.render.test.tsx
git commit -m "Extend Codex Report with debug evidence view"
```

### Task 4: 写入真实 Build Week 记录与仓库说明

**Files:**
- Modify: `src/codexReport.test.ts`
- Modify: `src/codexReport.ts`
- Create: `docs/build-week/visual-debug-evidence.md`
- Modify: `README.md`

**Step 1: 写入失败测试**

增加断言，确认默认文档包含本次真实记录 `gpt56-visual-debug-evidence-loop`，且记录链接到 `/debug/codex-report`，模型说明明确使用“user-confirmed current Codex task”，不声称平台认证。

**Step 2: 运行测试并确认 RED**

Run: `node --import tsx --test src/codexReport.test.ts`

Expected: FAIL，默认文档尚未包含记录。

**Step 3: 添加真实记录和说明**

- 在默认文档中加入本次扩展记录，问题定义为“现有调试入口无法集中说明人工视觉判断如何变成经过验证的源码改动”。
- 仅填写当前已经真实完成的阶段；测试结果在 Task 5 实际执行后再更新为 `passed`。
- 用导出函数对应的结构创建 `docs/build-week/visual-debug-evidence.md`。
- 重写 README 的项目概览、本地运行、主要调试路由、Build Week 新增内容、Codex 与 GPT-5.6 分工、证据边界和验证命令。
- 明确旧网站和旧调试工具早于比赛存在，本次 GPT-5.6 工作是证据闭环扩展，不追溯归因。

**Step 4: 运行测试并确认 GREEN**

Run: `node --import tsx --test src/codexReport.test.ts src/CodexReportPage.render.test.tsx`

Expected: PASS。

**Step 5: 提交**

```bash
git add src/codexReport.ts src/codexReport.test.ts README.md docs/build-week/visual-debug-evidence.md
git commit -m "Document Build Week visual debugging workflow"
```

### Task 5: 全量验证并完成证据记录

**Files:**
- Modify: `src/codexReport.ts`
- Modify: `docs/build-week/visual-debug-evidence.md`

**Step 1: 运行聚焦回归测试**

Run:

```bash
node --import tsx --test \
  src/codexReport.test.ts \
  src/CodexReportPage.render.test.tsx \
  src/App.logic.test.ts \
  src/FriendBookDiffHotspotsDebugPage.logic.test.ts \
  src/FriendBookDiffHotspotsDebugPage.render.test.tsx
```

Expected: 全部 PASS。

**Step 2: 运行工程验证**

Run: `npm run lint`

Expected: TypeScript 检查通过。

Run: `npm run build`

Expected: Vite 生产构建成功。

**Step 3: 运行浏览器验证**

Run: `npm run dev`

打开 `http://127.0.0.1:3000/debug/codex-report`，确认：

- 原有操作指南仍可选择。
- `Visual Debug Evidence` 能打开本次记录。
- 四阶段、调试链接、文件、测试和时间戳均正确。
- Markdown 复制按钮工作。
- `http://127.0.0.1:3000/` 没有新增公开入口。

**Step 4: 用实际结果完成记录**

只有在步骤 1 至 3 真实通过后，才将默认记录和 `docs/build-week/visual-debug-evidence.md` 中的验证状态更新为 `passed`，写入实际命令和完成时间。若存在失败则如实保留 `failed` 或 `pending`。

**Step 5: 重新验证最终内容**

Run: `node --import tsx --test src/codexReport.test.ts src/CodexReportPage.render.test.tsx`

Run: `npm run lint`

Run: `npm run build`

Expected: 全部通过。

**Step 6: 提交最终证据**

```bash
git add src/codexReport.ts docs/build-week/visual-debug-evidence.md
git commit -m "Verify GPT-5.6 debug evidence loop"
```
