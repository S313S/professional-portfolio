import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { friendBookFinalSectionData } from './data';
import {
  getBetweenTwoPagesTargetFrame,
} from './components/FriendBookFinalSection';
import {
  applyHotspotFrameDelta,
  createHotspotPositioningCodeBlock,
  type HotspotFrame,
  type HotspotPositioningMap,
} from './FriendBookDiffHotspotsDebugPage.logic';

type PreviewPageId = 'left' | 'right';

type DragInteractionState = {
  pageId: PreviewPageId;
  mode: 'move' | 'resize';
  originClientX: number;
  originClientY: number;
  startFrame: HotspotFrame;
};

function createEditableHotspotPositioning(): HotspotPositioningMap {
  return Object.fromEntries(
    friendBookFinalSectionData.betweenTwoPagesScenes.map((scene) => [
      scene.id,
      Object.fromEntries(
        scene.targets.map((target) => [
          target.id,
          getBetweenTwoPagesTargetFrame(scene.id, target),
        ]),
      ),
    ]),
  );
}

function getSceneFrame(
  positioning: HotspotPositioningMap,
  sceneId: string,
  target: { id: string; x: number; y: number; width: number; height: number },
): HotspotFrame {
  return positioning[sceneId]?.[target.id] ?? getBetweenTwoPagesTargetFrame(sceneId, target);
}

export default function FriendBookDiffHotspotsDebugPage() {
  const scenes = friendBookFinalSectionData.betweenTwoPagesScenes;
  const [draftPositioning, setDraftPositioning] = useState<HotspotPositioningMap>(
    createEditableHotspotPositioning,
  );
  const [activeSceneId, setActiveSceneId] = useState(scenes[0]?.id ?? '');
  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0] ?? null;
  const [activeTargetId, setActiveTargetId] = useState(activeScene?.targets[0]?.id ?? '');
  const [interaction, setInteraction] = useState<DragInteractionState | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState(
    'Confirm will save the current parameters into tmp/friend-book-diff-hotspots.json.',
  );
  const previewRefs = useRef<Record<PreviewPageId, HTMLDivElement | null>>({
    left: null,
    right: null,
  });

  useEffect(() => {
    if (!activeScene) {
      return;
    }

    const sceneHasActiveTarget = activeScene.targets.some((target) => target.id === activeTargetId);
    if (!sceneHasActiveTarget) {
      setActiveTargetId(activeScene.targets[0]?.id ?? '');
    }
  }, [activeScene, activeTargetId]);

  useEffect(() => {
    if (!interaction || typeof window === 'undefined' || !activeScene) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const previewElement = previewRefs.current[interaction.pageId];
      if (!previewElement) {
        return;
      }

      const previewBounds = previewElement.getBoundingClientRect();
      if (previewBounds.width === 0 || previewBounds.height === 0) {
        return;
      }

      const deltaX = ((event.clientX - interaction.originClientX) / previewBounds.width) * 100;
      const deltaY = ((event.clientY - interaction.originClientY) / previewBounds.height) * 100;
      const nextFrame = applyHotspotFrameDelta(
        interaction.startFrame,
        { deltaX, deltaY },
        interaction.mode,
      );

      setDraftPositioning((current) => ({
        ...current,
        [activeScene.id]: {
          ...(current[activeScene.id] ?? {}),
          [activeTargetId]: nextFrame,
        },
      }));
    };

    const handlePointerUp = () => {
      setInteraction(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeScene, activeTargetId, interaction]);

  const activeTarget =
    activeScene?.targets.find((target) => target.id === activeTargetId) ?? activeScene?.targets[0] ?? null;
  const activeFrame = activeScene && activeTarget
    ? getSceneFrame(draftPositioning, activeScene.id, activeTarget)
    : null;
  const codeBlock = useMemo(
    () => createHotspotPositioningCodeBlock(draftPositioning),
    [draftPositioning],
  );

  const beginInteraction = (
    event: ReactPointerEvent<HTMLDivElement | HTMLButtonElement>,
    pageId: PreviewPageId,
    mode: 'move' | 'resize',
    frame: HotspotFrame,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setInteraction({
      pageId,
      mode,
      originClientX: event.clientX,
      originClientY: event.clientY,
      startFrame: frame,
    });
  };

  const resetActiveTarget = () => {
    if (!activeScene || !activeTarget) {
      return;
    }

    setDraftPositioning((current) => ({
      ...current,
      [activeScene.id]: {
        ...(current[activeScene.id] ?? {}),
        [activeTarget.id]: getBetweenTwoPagesTargetFrame(activeScene.id, activeTarget),
      },
    }));
  };

  const resetCurrentScene = () => {
    if (!activeScene) {
      return;
    }

    setDraftPositioning((current) => ({
      ...current,
      [activeScene.id]: Object.fromEntries(
        activeScene.targets.map((target) => [
          target.id,
          getBetweenTwoPagesTargetFrame(activeScene.id, target),
        ]),
      ),
    }));
  };

  const resetAllScenes = () => {
    setDraftPositioning(createEditableHotspotPositioning());
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    setConfirmMessage('Saving current hotspot parameters...');

    try {
      const response = await fetch('/__friend-book-debug/confirm-hotspots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positioning: draftPositioning,
          codeBlock,
          activeSceneId,
          activeTargetId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const result = (await response.json()) as {
        filePath?: string;
        updatedAt?: string;
      };

      setConfirmMessage(
        `Saved to ${result.filePath ?? 'tmp/friend-book-diff-hotspots.json'}${result.updatedAt ? ` at ${result.updatedAt}` : ''}. Reply "已确认" and I can apply it to the source.`,
      );
    } catch (error) {
      setConfirmMessage(
        `Save failed. ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7efe2] text-stone-900">
      <header className="z-20 border-b border-[#d9c6af] bg-[rgba(252,247,239,0.96)] px-4 py-4 backdrop-blur sm:px-6 lg:sticky lg:top-0">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#7a5d4d]">
              GPT-5.6 Refactor · OpenAI Build Week 2026
            </p>
            <a
              href="/debug/codex-report"
              className="text-xs font-semibold text-[#765744] underline decoration-[#c9a98d] underline-offset-4 hover:text-[#4d382d]"
            >
              View GPT-5.6 evidence trail →
            </a>
          </div>
          <h1 className="font-serif text-[1.7rem] leading-none text-[#2f2120]">
            Friend Book Diff Hotspots Debug
          </h1>
          <p className="text-sm leading-6 text-[#5b473d]">
            Existing tool, refactored and extended with GPT-5.6 during OpenAI Build Week 2026.
            It translates human visual judgment into source-ready hotspot parameters.
          </p>
          <p className="text-sm leading-6 text-[#5b473d]">
            Drag the red frame or use the lower-right handle to resize it. The preview and export
            block stay in sync with the current hotspot parameters.
          </p>

          <ol
            aria-label="Hotspot calibration workflow"
            className="grid gap-2 sm:grid-cols-3"
          >
            {([
              {
                id: 'select',
                number: '01',
                title: 'Select',
                detail: 'Choose a scene and visual target.',
              },
              {
                id: 'calibrate',
                number: '02',
                title: 'Calibrate',
                detail: 'Drag or resize the frame on either page.',
              },
              {
                id: 'confirm',
                number: '03',
                title: 'Confirm',
                detail: 'Save machine-readable parameters for Codex.',
              },
            ] as const).map((step) => (
              <li
                key={step.id}
                data-friend-book-diff-debug-workflow-step={step.id}
                className="flex items-start gap-3 rounded-xl border border-[#dfcdb8] bg-[rgba(255,250,243,0.72)] px-3 py-2"
              >
                <span className="font-mono text-[0.68rem] tracking-[0.14em] text-[#a06d59]">
                  {step.number}
                </span>
                <span>
                  <strong className="block text-xs text-[#4a352d]">{step.title}</strong>
                  <span className="block text-[0.72rem] leading-5 text-[#71594b]">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>

          <a
            href="#debug-controls"
            data-friend-book-diff-debug-mobile-guidance
            className="text-xs leading-5 text-[#765744] underline decoration-[#c9a98d] underline-offset-4 lg:hidden"
          >
            On narrow screens, controls and confirmation appear after both previews. Jump to controls ↓
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6">
        <section className="grid gap-4">
          {activeScene
            ? ([
              { id: 'left', label: 'Left page', image: activeScene.baseImage },
              { id: 'right', label: 'Right page', image: activeScene.variantImage },
            ] satisfies Array<{ id: PreviewPageId; label: string; image: string }>).map((page) => (
              <div
                key={page.id}
                data-friend-book-diff-debug-preview={page.id}
                className="overflow-hidden rounded-[1.4rem] border border-[#d8c3ab] bg-[rgba(255,249,242,0.84)] p-3 shadow-[0_14px_32px_rgba(70,43,29,0.09)]"
              >
                <p className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#7a5d4d]">
                  {page.label}
                </p>
                <div
                  ref={(element) => {
                    previewRefs.current[page.id] = element;
                  }}
                  className="relative overflow-hidden rounded-[1.05rem] border border-[#d4bea5] bg-[#f5eadb]"
                  style={{ aspectRatio: `${activeScene.aspectRatio}` }}
                >
                  <img
                    src={page.image}
                    alt={page.label}
                    className="pointer-events-none block h-full w-full object-contain select-none"
                    draggable={false}
                  />

                  {activeScene.targets.map((target, index) => {
                    const frame = getSceneFrame(draftPositioning, activeScene.id, target);
                    const isActive = target.id === activeTargetId;

                    return (
                      <div
                        key={`${page.id}-${target.id}`}
                        data-friend-book-diff-debug-target={`${page.id}-${target.id}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveTargetId(target.id)}
                        onPointerDown={
                          isActive
                            ? (event) => beginInteraction(event, page.id, 'move', frame)
                            : undefined
                        }
                        className={`absolute rounded-[0.95rem] border transition ${isActive
                          ? 'z-20 border-[#d95c55] bg-[rgba(217,92,85,0.12)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.38)]'
                          : 'z-10 border-[rgba(149,113,94,0.55)] bg-[rgba(149,113,94,0.08)] hover:border-[#8f715c]'
                          }`}
                        style={{
                          left: `${frame.x}%`,
                          top: `${frame.y}%`,
                          width: `${frame.width}%`,
                          height: `${frame.height}%`,
                        }}
                      >
                        <span className={`pointer-events-none absolute left-2 top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-semibold leading-none shadow-[0_6px_14px_rgba(120,42,34,0.18)] ${isActive
                          ? 'bg-[#d95c55] text-white'
                          : 'bg-[rgba(255,248,242,0.92)] text-[#6c5144]'
                          }`}>
                          {index + 1}
                        </span>
                        {isActive ? (
                          <button
                            type="button"
                            aria-label={`Resize ${target.label}`}
                            onPointerDown={(event) => beginInteraction(event, page.id, 'resize', frame)}
                            className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border border-white bg-[#d95c55] shadow-[0_4px_10px_rgba(120,42,34,0.32)]"
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
            : null}
        </section>

        <aside
          id="debug-controls"
          className="scroll-mt-6 rounded-[1.5rem] border border-[#d8c3ab] bg-[rgba(255,249,242,0.9)] p-5 shadow-[0_12px_28px_rgba(70,43,29,0.08)] lg:sticky lg:top-[15rem] lg:self-start"
        >
          <div className="grid gap-5">
            <div className="rounded-[1.15rem] border border-[#e2d1bc] bg-[#f5eadc] p-4">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#8a6653]">
                Human-in-the-loop calibration
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5b473d]">
                Human judgment chooses the intended visual position; this interface converts it into
                machine-readable parameters that Codex can apply and verify.
              </p>
            </div>

            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#7a5d4d]">
                Scene
              </p>
              <select
                data-friend-book-diff-debug-scene-select
                value={activeScene?.id ?? ''}
                onChange={(event) => setActiveSceneId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d4bea5] bg-[#fffaf3] px-3 py-2 text-sm text-[#4f3e35]"
              >
                {scenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#7a5d4d]">
                Target
              </p>
              <select
                data-friend-book-diff-debug-target-select
                value={activeTarget?.id ?? ''}
                onChange={(event) => setActiveTargetId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d4bea5] bg-[#fffaf3] px-3 py-2 text-sm text-[#4f3e35]"
              >
                {(activeScene?.targets ?? []).map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-[1.15rem] border border-[#e2d1bc] bg-[#fffaf4] p-4">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#7a5d4d]">
                Active Frame
              </p>
              {activeFrame ? (
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-[#4f3e35]">
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8a6d5b]">X</dt>
                    <dd>{activeFrame.x}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8a6d5b]">Y</dt>
                    <dd>{activeFrame.y}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8a6d5b]">Width</dt>
                    <dd>{activeFrame.width}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8a6d5b]">Height</dt>
                    <dd>{activeFrame.height}</dd>
                  </div>
                </dl>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetActiveTarget}
                className="rounded-full border border-[#c7ad95] bg-[#fff8f0] px-3 py-2 text-sm text-[#5c483b]"
              >
                Reset Target
              </button>
              <button
                type="button"
                onClick={resetCurrentScene}
                className="rounded-full border border-[#c7ad95] bg-[#fff8f0] px-3 py-2 text-sm text-[#5c483b]"
              >
                Reset Scene
              </button>
              <button
                type="button"
                onClick={resetAllScenes}
                className="rounded-full border border-[#c7ad95] bg-[#fff8f0] px-3 py-2 text-sm text-[#5c483b]"
              >
                Reset All
              </button>
            </div>

            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#7a5d4d]">
                Copyable Output
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5b473d]">{confirmMessage}</p>
              <button
                type="button"
                data-friend-book-diff-debug-confirm-button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="mt-3 inline-flex items-center rounded-full border border-[#8f715c] bg-[#6a4f3c] px-4 py-2 text-sm text-[#fff9f4] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isConfirming ? 'Confirming...' : 'Confirm calibrated hotspots'}
              </button>
              <textarea
                data-friend-book-diff-debug-copy-output
                readOnly
                value={codeBlock}
                className="mt-3 min-h-[320px] w-full rounded-[1.15rem] border border-[#d4bea5] bg-[#fffaf3] p-3 font-mono text-[0.75rem] leading-6 text-[#4f3e35]"
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
