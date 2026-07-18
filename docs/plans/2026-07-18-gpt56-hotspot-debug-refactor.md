# GPT-5.6 Hotspot Debug Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不改变既有热点校准逻辑的前提下，让 `/debug/friend-book-diff-hotspots` 清楚表达 GPT-5.6 对旧工具的重构、三步操作闭环和可核验证据入口。

**Architecture:** 保留 `FriendBookDiffHotspotsDebugPage` 的状态、指针交互、坐标导出和 Vite 保存端点，只调整 React 页面文案与信息结构。通过静态渲染测试约束诚实归因、流程步骤、响应式提示和 Codex Report 链接，再更新默认证据记录与 README。

**Tech Stack:** React 19、TypeScript、Tailwind CSS 4、Node test runner、Vite 6、应用内浏览器验证。

---

### Task 1: 固化调试页重构契约

**Files:**
- Modify: `src/FriendBookDiffHotspotsDebugPage.render.test.tsx`

**Step 1: 写失败的渲染测试**

在现有测试中增加断言，要求页面包含：

```tsx
assert.match(markup, /GPT-5\.6 Refactor/);
assert.match(markup, /Select/);
assert.match(markup, /Calibrate/);
assert.match(markup, /Confirm/);
assert.match(markup, /Existing tool, refactored and extended with GPT-5\.6/);
assert.match(markup, /href="\/debug\/codex-report"/);
assert.match(markup, /data-friend-book-diff-debug-mobile-guidance=/);
```

同时保留所有既有结构断言。

**Step 2: 运行测试确认失败**

Run:

```bash
node --import tsx --test src/FriendBookDiffHotspotsDebugPage.render.test.tsx
```

Expected: FAIL，缺少 `GPT-5.6 Refactor` 或证据页链接。

**Step 3: 提交测试契约**

```bash
git add src/FriendBookDiffHotspotsDebugPage.render.test.tsx
git commit -m "Test GPT-5.6 hotspot debug refactor"
```

### Task 2: 实现小幅页面重构

**Files:**
- Modify: `src/FriendBookDiffHotspotsDebugPage.tsx`
- Test: `src/FriendBookDiffHotspotsDebugPage.render.test.tsx`

**Step 1: 增加页首归因和三步流程**

把旧眉题替换为 `GPT-5.6 Refactor · OpenAI Build Week 2026`，保留工具原名，并增加以下诚实说明：

```text
Existing tool, refactored and extended with GPT-5.6 during OpenAI Build Week 2026.
```

新增 `Select`、`Calibrate`、`Confirm` 三个步骤，分别解释场景/目标选择、可视校准和参数保存。

**Step 2: 增加窄屏提示和证据链接**

增加带 `data-friend-book-diff-debug-mobile-guidance` 的窄屏提示，说明控制与确认面板位于预览下方。增加指向 `/debug/codex-report` 的 `View GPT-5.6 evidence trail` 链接。

**Step 3: 改善参数面板语义**

增加 `Human judgment → machine-readable parameters` 说明，把确认按钮改为 `Confirm calibrated hotspots`，保留原有 `data-*` 选择器与保存行为。

**Step 4: 运行聚焦测试确认通过**

Run:

```bash
node --import tsx --test src/FriendBookDiffHotspotsDebugPage.render.test.tsx src/FriendBookDiffHotspotsDebugPage.logic.test.ts
```

Expected: PASS。

**Step 5: 提交页面实现**

```bash
git add src/FriendBookDiffHotspotsDebugPage.tsx
git commit -m "Refactor hotspot debugger with GPT-5.6"
```

### Task 3: 补充 Build Week 仓库证据

**Files:**
- Modify: `src/codexReport.ts`
- Modify: `src/codexReport.test.ts`
- Modify: `README.md`
- Modify: `docs/build-week/visual-debug-evidence.md`

**Step 1: 写失败的默认证据记录测试**

要求默认文档包含稳定 id `gpt56-hotspot-debug-refactor`，调试路由为 `/debug/friend-book-diff-hotspots`，并明确使用 `refactored and extended` 而非从零创建。

**Step 2: 运行测试确认失败**

Run:

```bash
node --import tsx --test src/codexReport.test.ts
```

Expected: FAIL，默认记录尚不存在。

**Step 3: 增加真实证据记录**

记录旧页面的具体问题、GPT-5.6 扫描建议、本次实现文件和待验证状态。不要在验证完成前写 `passed`。

**Step 4: 更新 README 与导出快照**

增加 “GPT-5.6 hotspot debugger refactor” 小节，说明旧工具与本次重构的时间边界、查看地址与演示路径。同步更新 `docs/build-week/visual-debug-evidence.md`。

**Step 5: 运行证据测试确认通过**

Run:

```bash
node --import tsx --test src/codexReport.test.ts src/CodexReportPage.render.test.tsx
```

Expected: PASS。

**Step 6: 提交证据更新**

```bash
git add src/codexReport.ts src/codexReport.test.ts README.md docs/build-week/visual-debug-evidence.md
git commit -m "Document GPT-5.6 hotspot debug refactor"
```

### Task 4: 完整验证并记录结果

**Files:**
- Modify: `src/codexReport.ts`
- Modify: `docs/build-week/visual-debug-evidence.md`

**Step 1: 运行聚焦测试**

```bash
node --import tsx --test src/FriendBookDiffHotspotsDebugPage.logic.test.ts src/FriendBookDiffHotspotsDebugPage.render.test.tsx src/codexReport.test.ts src/CodexReportPage.render.test.tsx
```

Expected: 所有测试 PASS。

**Step 2: 运行类型检查**

```bash
npm run lint
```

Expected: exit code 0。

**Step 3: 运行生产构建**

```bash
npm run build
```

Expected: exit code 0；允许保留 Vite 的 chunk-size advisory。

**Step 4: 运行浏览器验证**

检查：

- `/debug/friend-book-diff-hotspots` 的归因、三步流程、窄屏提示和证据链接。
- 场景/目标选择器、拖动热点和确认按钮仍可用。
- `/debug/codex-report` 显示新增记录。
- 控制台无错误。

**Step 5: 只在验证通过后更新结果**

把新证据记录更新为 `passed`，写入真实命令和检查结论；同步 Markdown 快照。

**Step 6: 提交验证结果**

```bash
git add src/codexReport.ts docs/build-week/visual-debug-evidence.md
git commit -m "Verify GPT-5.6 hotspot debug refactor"
```

### Task 5: 审查并发布 GitHub

**Files:**
- Review: all files changed since `567eb8d`

**Step 1: 检查改动范围与敏感信息**

```bash
git status --short
git diff --check
git diff 567eb8d..HEAD --stat
```

Expected: 仅包含本次调试页重构、测试、计划与证据文档；无密钥、token 或无关资产。

**Step 2: 运行发布前审查**

确认提交历史清晰，README 的模型说明与实际工作一致。

**Step 3: 推送当前分支**

```bash
git push -u origin codex/gpt56-visual-debug-evidence
```

Expected: GitHub 远端分支创建或更新成功。
